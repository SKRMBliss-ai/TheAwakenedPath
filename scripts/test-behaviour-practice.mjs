import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64')}`;
const libraryUrl = moduleUrl(read('src/assets/mind-gym-180-balanced-behaviour-scenarios.ts'));
const lib = await import(libraryUrl);
const engine = await import(moduleUrl(read('src/features/practise/kids-v1/kit/behaviourPractice.ts').replace('../../../../assets/mind-gym-180-balanced-behaviour-scenarios', libraryUrl)));
const emotions = await import(moduleUrl(read('src/features/kids/emotions.ts')));

function harness(pillar = 'BeKind') {
  let now = 0;
  const queue = new Set();
  const awards = [];
  let sounds = 0;
  const pool = engine.createScenarioPool(lib.SCENARIOS_BY_PILLAR[pillar], () => 0);
  const session = engine.createPracticeSession({
    next: pool.next,
    award: (points, scenario) => awards.push({ points, id: scenario.id, pillar: scenario.pillar }),
    successSound: () => { sounds++; },
    schedule(fn, ms) { const task = { at: now + ms, fn }; queue.add(task); return () => queue.delete(task); },
  });
  function tick(ms) {
    const end = now + ms;
    for (;;) {
      const next = [...queue].filter(t => t.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!next) break;
      queue.delete(next); now = next.at; next.fn();
    }
    now = end;
  }
  session.start();
  return { session, tick, awards, sounds: () => sounds };
}

test('source has 180 unique scenarios, 30 per pillar, valid characters and exact room mapping', () => {
  assert.equal(lib.CATEGORISED_SCENARIOS.length, 180);
  assert.equal(new Set(lib.CATEGORISED_SCENARIOS.map(s => s.id)).size, 180);
  for (const [room, pillar] of Object.entries(engine.ROOM_PILLARS)) {
    const scenarios = lib.SCENARIOS_BY_PILLAR[pillar];
    assert.equal(scenarios.length, 30);
    for (const s of scenarios) {
      assert.equal(s.pillar, pillar);
      // Legacy `behaviour` differs from `pillar` for some supplied entries.
      // The requested pillar determines routing and the room determines rewards.
      assert.equal(engine.ROOM_PILLARS[room], s.pillar);
      assert.ok(s.choices.some(c => c.best === true));
      s.reactions.forEach(r => assert.ok(emotions.EMOTIONS[r.who], `Missing character ${r.who}`));
      s.choices.forEach(c => assert.ok(Number.isFinite(c.points) && c.points >= 0));
    }
  }
});

for (const pillar of Object.keys(lib.SCENARIOS_BY_PILLAR)) {
  test(`${pillar}: unplayed first, no immediate or last-three repeats across pool reset`, () => {
    const pool = engine.createScenarioPool(lib.SCENARIOS_BY_PILLAR[pillar], () => 0.4);
    const played = [];
    for (let i = 0; i < 90; i++) {
      const s = pool.next();
      assert.equal(s.pillar, pillar);
      assert.ok(!played.slice(-3).includes(s.id));
      played.push(s.id);
    }
    assert.equal(new Set(played.slice(0, 30)).size, 30);
    assert.equal(pool.recent().length, 3);
  });
  test(`${pillar}: gentle retry, exact reward once, sound once and automatic next`, () => {
    const h = harness(pillar);
    const original = h.session.getSnapshot().scenario;
    assert.equal(h.session.choose(0), false); // choices are not yet revealed
    h.session.skipDialogue();
    const lessHelpful = original.choices.findIndex(c => c.best !== true);
    assert.equal(h.session.choose(lessHelpful), false);
    h.tick(8000);
    assert.equal(h.session.getSnapshot().scenario.id, original.id);
    assert.equal(h.session.getSnapshot().phase, 'choices');
    assert.equal(h.awards.length, 0);
    const best = original.choices.findIndex(c => c.best === true);
    assert.equal(h.session.choose(best), true);
    for (let i = 0; i < 10; i++) assert.equal(h.session.choose(best), false);
    h.tick(1099); assert.equal(h.awards.length, 0);
    h.tick(1); assert.equal(h.awards.length, 1);
    assert.equal(h.awards[0].points, original.choices[best].points);
    assert.equal(h.sounds(), 1);
    assert.equal(h.session.getSnapshot().practised, 1);
    h.tick(1550);
    assert.notEqual(h.session.getSnapshot().scenario.id, original.id);
    assert.equal(h.session.getSnapshot().phase, 'intro');
    h.session.stop();
  });
}

test('every best:true option is accepted, including lower-valued alternatives', () => {
  let alternatives = 0;
  for (const scenario of lib.CATEGORISED_SCENARIOS) {
    for (const [i, c] of scenario.choices.entries()) {
      if (c.best !== true) continue;
      alternatives++;
      const awarded = [];
      const s = engine.createPracticeSession({ next: () => scenario, award: p => awarded.push(p), successSound() {}, schedule: () => () => {} });
      s.start(); s.skipDialogue(); assert.equal(s.choose(i), true); s.stop(); s.stop();
      assert.deepEqual(awarded, [c.points]);
    }
  }
  assert.ok(alternatives > 180);
});

test('leaving mid-flight preserves one earned award and cancels all later transitions', () => {
  const h = harness(); h.session.skipDialogue();
  const original = h.session.getSnapshot().scenario;
  h.session.choose(original.choices.findIndex(c => c.best === true));
  h.session.stop(); h.session.stop(); h.tick(10000);
  assert.equal(h.awards.length, 1); assert.equal(h.sounds(), 1);
  assert.equal(h.session.getSnapshot().scenario.id, original.id);
  assert.equal(h.session.choose(0), false);
});

test('dialogue advances quickly, and StrictMode setup/cleanup does not duplicate it', () => {
  const h = harness(); h.session.stop(); h.session.start();
  h.tick(1300); assert.equal(h.session.getSnapshot().reaction, 0);
  h.tick(900 * h.session.getSnapshot().scenario.reactions.length);
  assert.equal(h.session.getSnapshot().phase, 'choices');
  assert.equal(h.awards.length, 0); h.session.stop();
});

test('known ages filter metadata; unknown and incompatible ages do not block practice', () => {
  for (const pillar of Object.keys(lib.SCENARIOS_BY_PILLAR)) {
    assert.equal(engine.eligibleScenarios(pillar).length, 30);
    for (const age of [4, 7, 10, 14]) {
      const eligible = engine.eligibleScenarios(pillar, age);
      assert.ok(eligible.length);
      for (const s of eligible) {
        const [min, max] = lib.SCENARIO_META[s.id].ageBand.match(/\d+/g).map(Number);
        assert.ok(age >= min && age <= max);
      }
    }
    assert.equal(engine.eligibleScenarios(pillar, 99).length, 30);
  }
});

test('two-item and singleton pools remain usable without repeated random retries', () => {
  const two = engine.createScenarioPool(lib.CATEGORISED_SCENARIOS.slice(0, 2), () => 0);
  let last;
  for (let i = 0; i < 20; i++) { const next = two.next(); assert.notEqual(next.id, last); last = next.id; }
  const one = engine.createScenarioPool(lib.CATEGORISED_SCENARIOS.slice(0, 1));
  assert.equal(one.next().id, one.next().id);
});

test('existing Zustand balance, behaviour totals, unlocks and scenario history remain the source of truth', async () => {
  const require = createRequire(import.meta.url);
  const stored = new Map();
  globalThis.localStorage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
  globalThis.window = { localStorage: globalThis.localStorage };
  const dataUrl = moduleUrl(read('src/features/kids/data.ts'));
  const source = read('src/features/kids/store.ts')
    .replace("from 'zustand'", `from '${pathToFileURL(require.resolve('zustand')).href}'`)
    .replace("from 'zustand/middleware'", `from '${pathToFileURL(require.resolve('zustand/middleware')).href}'`)
    .replace("from './data'", `from '${dataUrl}'`);
  const { useKidStore } = await import(moduleUrl(source));
  const before = useKidStore.getState();
  const completions = before.completions;
  for (const [room, pillar] of Object.entries(engine.ROOM_PILLARS)) {
    const scenario = lib.SCENARIOS_BY_PILLAR[pillar][0];
    const index = scenario.choices.findIndex(c => c.best === true);
    const points = scenario.choices[index].points;
    const start = useKidStore.getState().points;
    const session = engine.createPracticeSession({ next: () => scenario,
      award(value, s) { useKidStore.getState().awardPoints(value, room); useKidStore.getState().completeScenario(s.id); },
      successSound() {}, schedule: () => () => {},
    });
    session.start(); session.skipDialogue(); session.choose(index); session.choose(index); session.stop();
    assert.equal(useKidStore.getState().points, start + points);
    assert.equal(useKidStore.getState().pointsByBehaviour[room], points);
    assert.ok(Object.values(useKidStore.getState().scenariosDone).flat().includes(scenario.id));
  }
  assert.deepEqual(useKidStore.getState().completions, completions); // practice is not a daily moral tick
  assert.ok(stored.size > 0);
  assert.ok(useKidStore.getState().rewards.length >= before.rewards.length);
});
