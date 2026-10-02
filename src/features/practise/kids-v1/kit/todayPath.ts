/*
  TODAY'S PATH — what to do first, and what comes next.

  The home page holds a dozen things a child can tap, and on a first look they
  all call out at once. So the day has an order, and the page points at one
  thing at a time:

    feel      tell Chirpy how you feel (the Funny Feeling journey). It comes
              round again a few hours after the last time: the feeling at
              breakfast is not the feeling after school.
    practise  a good-choice game in one of the rooms.
    diary     today's page in the Inner Diary: how did I do today?
    play      everything else: the garden, the story map, the egg, the corner.

  Pure, so the order can be read and changed in one place.
*/
import type { Memory } from '../../../kids/delight';
import { todayKey } from '../../../kids/data';

export type PathStepId = 'feel' | 'practise' | 'diary' | 'play';
export const PATH_ORDER: readonly PathStepId[] = ['feel', 'practise', 'diary', 'play'];

/** How long after a check-in the path asks how they feel again. */
export const FEEL_AGAIN_MS = 3 * 60 * 60 * 1000;

/** The rooms with a games room behind the door. Mind & Heart Time is a quiet
    room, not practice, so it is never the one suggested. */
export const PRACTICE_ROOMS = ['kind', 'truth', 'choices', 'include', 'body', 'help'] as const;

export interface PathInput {
  now: number;
  memories: readonly Memory[];
  reflections: readonly { createdAt: string }[];
  scenariosDone: Readonly<Record<string, readonly string[]>>;
  gameDays: readonly string[];
  diaryDone: boolean;
}

export interface TodayPath {
  current: PathStepId;
  done: Record<PathStepId, boolean>;
  /** The feelings check-in is back for another go today. */
  feelAgain: boolean;
}

/** When they last told Chirpy how they felt: picking a feeling, or finishing a journey. */
export function lastFeelingAt(memories: readonly Memory[], reflections: readonly { createdAt: string }[]): number {
  let last = 0;
  for (const m of memories) if ((m.kind === 'feeling' || m.kind === 'story') && m.at > last) last = m.at;
  for (const r of reflections) {
    const at = Date.parse(r.createdAt);
    if (at > last) last = at;
  }
  return last;
}

export function todayPath(input: PathInput): TodayPath {
  const today = todayKey(new Date(input.now));
  const lastFelt = lastFeelingAt(input.memories, input.reflections);
  const feltToday = lastFelt > 0 && todayKey(new Date(lastFelt)) === today;
  const feelAgain = feltToday && input.now - lastFelt >= FEEL_AGAIN_MS;
  const practised = (input.scenariosDone[today]?.length ?? 0) > 0
    || input.gameDays.includes(today)
    || input.memories.some((m) => m.kind === 'game' && m.day === today);
  const done: Record<PathStepId, boolean> = {
    feel: feltToday && !feelAgain, practise: practised, diary: input.diaryDone, play: false,
  };
  const current: PathStepId = !done.feel ? 'feel' : !practised ? 'practise' : !input.diaryDone ? 'diary' : 'play';
  return { current, done, feelAgain };
}

/**
 * The room to practise in today: the one they have practised least, so every
 * good choice gets its turn. Ties go round the rooms a day at a time, so two
 * children who have never played are not both sent to the same door forever.
 */
export function suggestRoom(byRoom: Readonly<Record<string, number>>, today: string): string {
  const days = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86_400_000) || 0;
  const n = PRACTICE_ROOMS.length;
  const order = PRACTICE_ROOMS.map((_, i) => PRACTICE_ROOMS[(days + i) % n]);
  return order.reduce((best, id) => ((byRoom[id] ?? 0) < (byRoom[best] ?? 0) ? id : best), order[0]);
}
