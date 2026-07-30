// ─────────────────────────────────────────────────────────────────────────────
// sync-twinsouls — rebuild the /twinsouls portfolio and copy it into public/.
//
// WHY THIS EXISTS
// The portfolio lives in a separate repo (ShrutiPortfolio) and is mirrored into
// AwakenedPath/public/twinsouls so Hosting serves it at /twinsouls. That copy
// used to be done by hand, and because Vite emits content-hashed filenames,
// every rebuild dropped a NEW bundle beside the old ones without removing them.
// They accumulated: 6 JS bundles + 3 stylesheets, ~3.4 MB of files that were
// committed to git and shipped on every deploy but never served, since
// index.html only ever references one of each.
//
// This script makes the target directory an exact mirror of the build output —
// it is wiped first, so a stale bundle can never survive a sync.
//
// SAFE TO WIPE: everything under public/twinsouls is reproducible from the
// build (verified: dist-twinsouls contains index.html, assets/, and every
// static file from ShrutiPortfolio/public). Nothing there is hand-maintained.
// If that ever stops being true, add the file to ShrutiPortfolio/public/ rather
// than dropping it into public/twinsouls directly.
//
// Usage:  node scripts/sync-twinsouls.mjs [--no-build]
//   --no-build   reuse an existing dist-twinsouls instead of rebuilding
//   PORTFOLIO_DIR=<path>  override the ShrutiPortfolio location
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from 'node:child_process';
import { existsSync, rmSync, cpSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

const portfolioDir = process.env.PORTFOLIO_DIR
  ? path.resolve(process.env.PORTFOLIO_DIR)
  : path.resolve(repoRoot, '..', 'ShrutiPortfolio');

const distDir = path.join(portfolioDir, 'dist-twinsouls');
const targetDir = path.join(repoRoot, 'public', 'twinsouls');
const shouldBuild = !process.argv.includes('--no-build');

function bail(msg) {
  console.error(`sync-twinsouls: ${msg}`);
  process.exit(1);
}

function dirSizeMB(dir) {
  let bytes = 0;
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else bytes += statSync(full).size;
    }
  };
  walk(dir);
  return (bytes / 1048576).toFixed(1);
}

if (!existsSync(portfolioDir)) {
  bail(`portfolio repo not found at ${portfolioDir}. Set PORTFOLIO_DIR to override.`);
}

if (shouldBuild) {
  console.log(`sync-twinsouls: building portfolio in ${portfolioDir}`);
  try {
    execSync('npm run build:twinsouls', { cwd: portfolioDir, stdio: 'inherit' });
  } catch {
    bail('portfolio build failed — target left untouched.');
  }
}

if (!existsSync(distDir)) {
  bail(`no build output at ${distDir}. Run without --no-build to build it first.`);
}
if (!existsSync(path.join(distDir, 'index.html'))) {
  bail(`${distDir} has no index.html — refusing to sync a broken build.`);
}

// Wipe first. This is the whole point: without it, previous content-hashed
// bundles linger forever because nothing ever names them again.
if (existsSync(targetDir)) {
  const before = dirSizeMB(targetDir);
  rmSync(targetDir, { recursive: true, force: true });
  console.log(`sync-twinsouls: cleared old mirror (${before} MB)`);
}

cpSync(distDir, targetDir, { recursive: true });
console.log(`sync-twinsouls: mirrored ${distDir} -> ${targetDir} (${dirSizeMB(targetDir)} MB)`);
console.log('sync-twinsouls: done. Remember to run `npm run build:seo` before deploying.');
