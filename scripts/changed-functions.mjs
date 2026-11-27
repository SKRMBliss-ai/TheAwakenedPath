#!/usr/bin/env node
/**
 * Which Cloud Functions need deploying?
 *
 *   node scripts/changed-functions.mjs <baseRef>   functions changed since baseRef
 *   node scripts/changed-functions.mjs --all       every function in the codebase
 *
 * Prints one JSON line on stdout: { mode, names, reason }.
 *   mode "none"  — no function's code changed; deploy no functions.
 *   mode "some"  — only the listed functions are affected.
 *   mode "all"   — start-up code, the dependencies or another file changed, a
 *                  function was removed, or the old version could not be read;
 *                  every function is listed.
 *
 * Why not just diff the file: functions/index.js is one big file and several
 * functions share helpers (grantPurchase, COURSE_IDS, the price tables…). So
 * each function is compared together with every top-level helper and constant
 * it uses, directly or through another helper. A changed helper therefore
 * redeploys exactly the functions that reach it. Top-level code that is not a
 * declaration (initializeApp, setGlobalOptions…) runs for every function, so a
 * change to it still deploys all of them.
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

/** Names declared by a variable binding, including destructured ones. */
function boundNames(name) {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((el) => (ts.isBindingElement(el) ? boundNames(el.name) : []));
}

/**
 * Turn a functions/index.js source into a signature per exported function (its
 * own statement plus every top-level declaration it reaches), and one for the
 * start-up code every function runs.
 */
function split(source) {
  // Windows checkouts have CRLF in the working copy and LF in git; compare apples to apples.
  source = source.replace(/\r\n/g, '\n');
  const sf = ts.createSourceFile(INDEX, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const exportNodes = new Map();
  const declarations = new Map(); // name -> [statement, ...]
  const startup = [];
  const declare = (name, st) => declarations.set(name, [...(declarations.get(name) || []), st]);
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
      exportNodes.set(e.left.name.text, st);
    } else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) {
      declare(st.name.text, st);
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        for (const name of boundNames(d.name)) declare(name, st);
      }
    } else {
      startup.push(st);
    }
  }

  /** The text of `roots` and of everything they reach. Matching by identifier
   *  name over-counts a little, which only ever deploys more, never less. */
  const signature = (roots) => {
    const seen = new Set(roots);
    const queue = [...roots];
    const add = (st) => {
      if (st && !seen.has(st)) { seen.add(st); queue.push(st); }
    };
    const visit = (node) => {
      if (ts.isIdentifier(node)) (declarations.get(node.text) || []).forEach(add);
      if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'exports') {
        add(exportNodes.get(node.name.text));
      }
      ts.forEachChild(node, visit);
    };
    while (queue.length) visit(queue.pop());
    return [...seen].map((st) => st.getText(sf)).sort().join('\n');
  };

  return {
    exports: new Map([...exportNodes].map(([name, st]) => [name, signature([st])])),
    startup: signature(startup),
  };
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
if (oldSplit.startup !== nowSplit.startup) {
  out('all', allNames, 'start-up code that every function runs changed');
  process.exit(0);
}
const changed = allNames.filter((n) => oldSplit.exports.get(n) !== nowSplit.exports.get(n));
if (changed.length === 0) {
  out('none', [], 'no function is affected by this change');
} else {
  out('some', changed, 'only these functions, or code they use, changed');
}
