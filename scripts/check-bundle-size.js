#!/usr/bin/env node
/**
 * Bundle Size Guard — runs after `npm run build`
 * Fails with exit code 1 if any chunk exceeds its limit.
 * Add to CI or run manually before every deploy: node scripts/check-bundle-size.js
 */

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '../dist/assets');

// Limits in KB — tweak as needed but never raise without a good reason
const LIMITS = {
  // The sign-in page only needs index + vendor-firebase to render.
  // Keep these small so mobile users see the page fast.
  'index':            250,   // core app shell — CRITICAL for first load
  'vendor-firebase':  500,   // Firebase SDK
  'vendor-framer':    150,   // framer-motion
  'vendor-lucide':     50,   // icons
  'vendor':          1400,   // all other vendor libs combined

  // Feature chunks — loaded lazily, so higher limits are ok
  'feature-courses':  300,
  'feature-journal':  200,
  'feature-practices':200,
  'feature-admin':    150,
  'feature-stats':    100,
  'feature-music':     50,
  'feature-breath':    20,
};

const files = fs.readdirSync(DIST).filter(f => f.endsWith('.js'));
let failed = false;
const rows = [];

files.forEach(file => {
  const sizeBytes = fs.statSync(path.join(DIST, file)).size;
  const sizeKB = Math.round(sizeBytes / 1024);

  // Match file to a limit key (e.g. "index-B4qqxjlP.js" → "index")
  const key = Object.keys(LIMITS).find(k => file.startsWith(k + '-') || file.startsWith(k + '.'));
  const limit = key ? LIMITS[key] : null;
  const status = limit === null ? '  (no limit)' : sizeKB <= limit ? '  ✓ OK' : `  ✗ OVER LIMIT (max ${limit} KB)`;
  if (limit !== null && sizeKB > limit) failed = true;

  rows.push({ file, sizeKB, limit, status });
});

// Sort by size descending
rows.sort((a, b) => b.sizeKB - a.sizeKB);

console.log('\n📦  Bundle Size Report\n' + '─'.repeat(70));
rows.forEach(({ file, sizeKB, limit, status }) => {
  const bar = '█'.repeat(Math.min(40, Math.round(sizeKB / 30)));
  console.log(`${String(sizeKB + ' KB').padStart(8)}  ${file.padEnd(45)} ${status}`);
});
console.log('─'.repeat(70));

if (failed) {
  console.error('\n❌  DEPLOY BLOCKED — one or more chunks exceed size limits.');
  console.error('   Fix: split the offending chunk or raise the limit with justification.\n');
  process.exit(1);
} else {
  console.log('\n✅  All chunks within size limits — safe to deploy.\n');
  process.exit(0);
}
