import type { PracticeRoom, Reflection } from './types';
import { TODAYS_PRACTICES } from './content';

/**
 * The adult journey: the twelve daily practices grouped into four worlds of
 * three. A world opens when the one before it is complete; inside a world the
 * stops go in order. Progress comes from what the person has actually
 * practised (their reflections), so there is nothing extra to track.
 */
export interface World {
  id: string;
  title: string;
  sub: string;
  tint: [string, string];
  rooms: PracticeRoom[];
}

const DEFS: { id: string; title: string; sub: string; tint: [string, string]; ids: string[] }[] = [
  { id: 'busy-mind', title: 'Quiet the Busy Mind', sub: 'Notice thoughts without being run by them.', tint: ['#8B7BF0', '#4A2E9E'], ids: ['today-noticing', 'today-worry', 'today-perspective'] },
  { id: 'with-others', title: 'Calm with Others', sub: 'Stay steady when people press your buttons.', tint: ['#5FC2E8', '#2E6FCF'], ids: ['today-pausing', 'today-listening', 'today-criticism'] },
  { id: 'bounce-back', title: 'Bounce Back', sub: 'Let go, and speak to yourself kindly.', tint: ['#6FE0C6', '#1FA987'], ids: ['today-letting-go', 'today-should', 'today-kind-words'] },
  { id: 'steady-self', title: 'Steady Self', sub: 'Name it, feel it in the body, rest.', tint: ['#F2B36B', '#D9783A'], ids: ['today-naming', 'today-body', 'today-evening'] },
];

export const WORLDS: World[] = DEFS.map((d) => ({
  id: d.id,
  title: d.title,
  sub: d.sub,
  tint: d.tint,
  rooms: d.ids
    .map((id) => TODAYS_PRACTICES.find((p) => p.id === id))
    .filter((r): r is PracticeRoom => !!r),
}));

export interface WorldState {
  world: World;
  unlocked: boolean;
  complete: boolean;
  /** done[i] for each stop in world.rooms */
  done: boolean[];
}

export function journeyState(reflections: Reflection[]): WorldState[] {
  const done = new Set(reflections.map((r) => r.roomId));
  let open = true;
  return WORLDS.map((world) => {
    const flags = world.rooms.map((r) => done.has(r.id));
    const complete = flags.every(Boolean);
    const state = { world, unlocked: open, complete, done: flags };
    open = open && complete;
    return state;
  });
}

/** The next stop on the journey, or null when every world is complete. */
export function nextJourneyRoom(reflections: Reflection[]): PracticeRoom | null {
  const done = new Set(reflections.map((r) => r.roomId));
  for (const w of WORLDS) for (const r of w.rooms) if (!done.has(r.id)) return r;
  return null;
}
