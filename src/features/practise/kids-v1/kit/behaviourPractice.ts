import { SCENARIOS_BY_PILLAR, SCENARIO_META, type BehaviourPillar, type PillarScenario } from '../../../../assets/mind-gym-180-balanced-behaviour-scenarios';

export const ROOM_PILLARS: Readonly<Record<string, BehaviourPillar>> = {
  kind: 'BeKind', truth: 'TellTheTruth', choices: 'MakeGoodChoices',
  include: 'IncludeEveryone', body: 'TakeCareOfMyBody', help: 'HelpOthers',
};

export function eligibleScenarios(pillar: BehaviourPillar, age?: number): PillarScenario[] {
  const all = SCENARIOS_BY_PILLAR[pillar];
  if (age === undefined) return all;
  const filtered = all.filter(s => {
    const bounds = SCENARIO_META[s.id]?.ageBand.match(/\d+/g)?.map(Number);
    return !bounds || (age >= bounds[0] && age <= (bounds[1] ?? bounds[0]));
  });
  return filtered.length ? filtered : all;
}

/** Session-only shuffle bag. The last three survive bag resets. */
export function createScenarioPool(scenarios: readonly PillarScenario[], random = Math.random) {
  const played = new Set<string>();
  const recent: string[] = [];
  return {
    next(): PillarScenario {
      if (!scenarios.length) throw new Error('Practice room has no scenarios');
      const previous = recent.at(-1);
      let available = scenarios.filter(s => !played.has(s.id) && !recent.includes(s.id));
      if (!available.length) {
        // Finish the unplayed bag even for small, age-filtered pools.
        available = scenarios.filter(s => !played.has(s.id) && s.id !== previous);
      }
      if (!available.length) {
        played.clear();
        available = scenarios.filter(s => !recent.includes(s.id));
        if (!available.length) available = scenarios.filter(s => s.id !== previous);
      }
      if (!available.length) available = [...scenarios]; // singleton fallback only
      const next = available[Math.min(available.length - 1, Math.floor(Math.max(0, random()) * available.length))];
      played.add(next.id);
      recent.push(next.id);
      if (recent.length > 3) recent.shift();
      return next;
    },
    recent: () => [...recent],
  };
}

export type PracticePhase = 'intro' | 'reactions' | 'choices' | 'success' | 'transition';
export type PracticeSnapshot = {
  scenario: PillarScenario; phase: PracticePhase; reaction: number;
  selected: number | null; practised: number; rewardArrived: boolean;
};
type Dependencies = {
  next: () => PillarScenario;
  award: (points: number, scenario: PillarScenario) => void;
  successSound: () => void;
  schedule?: (fn: () => void, ms: number) => () => void;
};

/** One synchronous input gate and one timer owner for all six rooms.
 * Side effects only happen after a choice, never during render/effect setup.
 */
export function createPracticeSession(deps: Dependencies) {
  let state: PracticeSnapshot = { scenario: deps.next(), phase: 'intro', reaction: -1, selected: null, practised: 0, rewardArrived: false };
  const listeners = new Set<() => void>();
  const cancels = new Set<() => void>();
  let active = false;
  let pendingAward: (() => void) | undefined;
  const schedule = deps.schedule ?? ((fn, ms) => { const id = setTimeout(fn, ms); return () => clearTimeout(id); });
  const publish = (patch: Partial<PracticeSnapshot>) => { state = { ...state, ...patch }; listeners.forEach(fn => fn()); };
  const cancelTimers = () => { cancels.forEach(fn => fn()); cancels.clear(); };
  const later = (fn: () => void, ms: number) => {
    const cancel = schedule(() => { cancels.delete(cancel); if (active) fn(); }, ms);
    cancels.add(cancel);
  };
  const advanceDialogue = () => {
    cancelTimers();
    const reaction = state.reaction + 1;
    if (reaction >= state.scenario.reactions.length) publish({ phase: 'choices' });
    else { publish({ phase: 'reactions', reaction }); later(advanceDialogue, 900); }
  };
  const arrive = () => {
    const award = pendingAward;
    pendingAward = undefined; // clear before store notifications / reentrancy
    if (award) { award(); publish({ rewardArrived: true, practised: state.practised + 1 }); }
  };
  return {
    getSnapshot: () => state,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    start() { if (active) return; active = true; if (state.phase === 'intro' || state.phase === 'reactions') later(advanceDialogue, 1300); },
    stop() { active = false; cancelTimers(); arrive(); },
    skipDialogue() { if (active && (state.phase === 'intro' || state.phase === 'reactions')) { cancelTimers(); publish({ phase: 'choices' }); } },
    choose(index: number): boolean {
      if (!active || state.phase !== 'choices') return false;
      const choice = state.scenario.choices[index];
      if (!choice) return false;
      if (choice.best !== true) { publish({ selected: index }); return false; }
      const scenario = state.scenario;
      publish({ phase: 'success', selected: index, rewardArrived: false });
      pendingAward = () => deps.award(choice.points, scenario);
      deps.successSound();
      later(arrive, 1100);
      later(() => publish({ phase: 'transition' }), 2300);
      later(() => {
        publish({ scenario: deps.next(), phase: 'intro', reaction: -1, selected: null, rewardArrived: false });
        later(advanceDialogue, 1300);
      }, 2650);
      return true;
    },
  };
}
