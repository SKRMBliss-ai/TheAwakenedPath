import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/features/practise/kids-v1/kit/cases.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { saveCase, loadCases } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
let stored;
globalThis.localStorage = { getItem: () => stored ?? null, setItem: (_, value) => { stored = value; } };

test('saving and revising a journey preserves words, identity and one entry', () => {
  assert.equal(saveCase({ sessionId: 'test', feeling: 'Happy', body: ['chest'], thought: 'A thought', story: 'Original story', eyes: 'An event', other: 'Another possibility' }), true);
  const first = loadCases()[0];
  assert.equal(first.thought, 'A thought');
  assert.deepEqual(first.body, ['chest']);
  assert.equal(saveCase({ ...first, other: 'Revised possibility' }), true);
  assert.equal(loadCases().length, 1);
  assert.equal(loadCases()[0].id, first.id);
  assert.equal(loadCases()[0].other, 'Revised possibility');
  assert.equal(loadCases()[0].story, 'Original story');
});

test('legacy journeys remain separate and empty sessions are not saved', () => {
  stored = null;
  assert.equal(saveCase({}), false);
  saveCase({ feeling: 'Happy', story: 'First' });
  saveCase({ feeling: 'Happy', story: 'Second' });
  assert.equal(loadCases().length, 2);
  assert.notEqual(loadCases()[0].id, loadCases()[1].id);
});

test('blocked storage reports failure instead of claiming the journey is saved', () => {
  globalThis.localStorage.setItem = () => { throw new Error('quota'); };
  assert.equal(saveCase({ feeling: 'Happy', sessionId: 'blocked' }), false);
});
