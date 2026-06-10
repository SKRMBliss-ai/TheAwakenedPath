#!/usr/bin/env node
/**
 * Branding Guard — scans the built bundle for stale brand names.
 * Run after `npm run build`, before every firebase deploy.
 * Usage: node scripts/check-branding.js
 */

const fs   = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '../dist/assets');

// Strings that must NOT appear in the final bundle
const FORBIDDEN = [
  'Inner Freedom',
  'The Mind Gym',   // as a brand name (not in plain sentence context)
  'AwakenedJournal',
];

// Strings that MUST appear (brand is correct)
const REQUIRED = [
  'Mind Gym',
  'Train your mind daily',
];

const files = fs.readdirSync(DIST).filter(f => f.endsWith('.js'));
let allText = '';
files.forEach(f => { allText += fs.readFileSync(path.join(DIST, f), 'utf8'); });

let passed = true;

console.log('\n🏷️  Branding Check\n' + '─'.repeat(50));

FORBIDDEN.forEach(term => {
  const count = (allText.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count > 0) {
    console.error(`  ❌  "${term}" found ${count}x in bundle — old branding still present`);
    passed = false;
  } else {
    console.log(`  ✅  "${term}" — not found (correct)`);
  }
});

REQUIRED.forEach(term => {
  const found = allText.includes(term);
  if (!found) {
    console.error(`  ❌  "${term}" NOT found — branding may be missing`);
    passed = false;
  } else {
    console.log(`  ✅  "${term}" — present (correct)`);
  }
});

console.log('─'.repeat(50));
if (!passed) {
  console.error('\n❌  BRANDING CHECK FAILED — do not deploy.\n');
  process.exit(1);
} else {
  console.log('\n✅  Branding correct — safe to deploy.\n');
  process.exit(0);
}
