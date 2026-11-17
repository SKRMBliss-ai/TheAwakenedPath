#!/usr/bin/env node
/**
 * Which Cloud Functions need deploying?
 *
 *   node scripts/changed-functions.mjs <baseRef>   functions changed since baseRef
 *   node scripts/changed-functions.mjs --all       every function in the codebase
 *
 * Prints one JSON line on stdout: { mode, names, reason }.
 *   mode "none"  — nothing under functions/ changed; deploy no functions.
 *   mode "some"  — only the listed functions' own code changed.
 *   mode "all"   — something shared changed (a helper, a constant, the
 *                  dependencies, another file), a function was removed, or the
 *                  old version could not be read; every function is listed.
 *
 * Why not just diff the file: functions/index.js is one big file and several
 * functions share helpers (grantPurchase, COURSE_IDS, the price tables…). A
 * changed helper changes every function that uses it, and a text diff cannot
 * see that. So the rule is deliberately conservative: a function is "changed
 * on its own" only if its own `exports.<name> = …` statement changed AND
 * nothing outside the exports changed. Anything else deploys all of them.
 *
 * Parsing uses the `typescript` package (already a dev dependency) so that
 * comments and whitespace changes do not count as changes.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const INDEX = 'functions/index.js';
/** Files under functions/ whose change does not affect what runs. */
const IGNORABLE = /(\.test\.js|\.md|\.txt)$|^functions\/(firebase-debug.*\.log|node_modules\/)/;

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

/** Split a functions/index.js source into { exports: Map(name -> text), shared: string }. */
function split(source) {
  // Windows checkouts have CRLF in the working copy and LF in git; compare apples to apples.
  source = source.replace(/\r\n/g, '\n');
  const sf = ts.createSourceFile(INDEX, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const exportsMap = new Map();
  const shared = [];
  for (const st of sf.statements) {
    const e = ts.isExpressionStatement(st) ? st.expression : null;
    if (
      e &&
      ts.isBinaryExpression(e) &&
      e.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(e.left) &&
      ts.isIdentifier(e.left.expression) &&
      e.left.expression.text === 'exports'
    ) {
      exportsMap.set(e.left.name.text, st.getText(sf));
    } else {
      shared.push(st.getText(sf));
    }
  }
  return { exports: exportsMap, shared: shared.join('\n') };
}

function out(mode, names, reason) {
  console.error(`changed-functions: ${mode}${names.length ? ` (${names.length})` : ''} — ${reason}`);
  console.log(JSON.stringify({ mode, names: [...names].sort(), reason }));
}

const arg = process.argv[2];
if (!arg) {
  console.error('usage: changed-functions.mjs <baseRef> | --all');
  process.exit(2);
}

const nowSplit = split(readFileSync(INDEX, 'utf8'));
const allNames = [...nowSplit.exports.keys()];

if (arg === '--all') {
  out('all', allNames, 'requested');
  process.exit(0);
}

// Did anything under functions/ change at all?
let changedFiles;
try {
  changedFiles = git('diff', '--name-only', arg, 'HEAD', '--', 'functions').split('\n').filter(Boolean);
} catch {
  out('all', allNames, `could not diff against ${arg}`);
  process.exit(0);
}
const relevant = changedFiles.filter((f) => !IGNORABLE.test(f));
if (relevant.length === 0) {
  out('none', [], 'nothing under functions/ changed');
  process.exit(0);
}
const others = relevant.filter((f) => f !== INDEX);
if (others.length) {
  out('all', allNames, `other files changed: ${others.slice(0, 5).join(', ')}`);
  process.exit(0);
}

let oldSplit;
try {
  oldSplit = split(git('show', `${arg}:${INDEX}`));
} catch {
  out('all', allNames, `could not read ${INDEX} at ${arg}`);
  process.exit(0);
}

const removed = [...oldSplit.exports.keys()].filter((n) => !nowSplit.exports.has(n));
if (removed.length) {
  out('all', allNames, `function(s) removed: ${removed.join(', ')}`);
  process.exit(0);
}
if (oldSplit.shared !== nowSplit.shared) {
  out('all', allNames, 'shared code outside the exports changed (helpers, constants, imports)');
  process.exit(0);
}
const changed = allNames.filter((n) => oldSplit.exports.get(n) !== nowSplit.exports.get(n));
if (changed.length === 0) {
  out('none', [], 'only comments or formatting changed');
} else {
  out('some', changed, 'only these functions\' own code changed');
}
