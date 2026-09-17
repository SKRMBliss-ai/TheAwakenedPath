import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/features/practise/kids-v1/kit/dailyWelcome.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const api = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
let stored = null;
globalThis.localStorage = { getItem: () => stored, setItem: (_, value) => { stored = value; } };

test('first visit shows; returning the same day does not; next day does', () => {
  assert.equal(api.needsDailyWelcome('2026-09-17'), true);
  api.rememberDailyWelcome('2026-09-17');
  assert.equal(stored, '2026-09-17');
  assert.equal(api.needsDailyWelcome('2026-09-17'), false);
  assert.equal(api.needsDailyWelcome('2026-09-18'), true);
});
test('a stored day is honoured after a fresh page load', async () => {
  const fresh = await import(`data:text/javascript;base64,${Buffer.from(outputText + '\n// fresh instance').toString('base64')}`);
  assert.equal(fresh.needsDailyWelcome('2026-09-17'), false);
});
test('uses the local calendar date', () => {
  assert.equal(api.welcomeDay(new Date(2026, 8, 17, 0, 1)), '2026-09-17');
  assert.equal(api.welcomeDay(new Date(2026, 8, 17, 23, 59)), '2026-09-17');
});
test('unavailable storage still suppresses repeat welcomes within the session', () => {
  globalThis.localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(api.needsDailyWelcome('2026-09-19'), true);
  api.rememberDailyWelcome('2026-09-19');
  assert.equal(api.needsDailyWelcome('2026-09-19'), false);
});
