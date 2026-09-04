/**
 * The game library — 67 games, six engines, twelve rooms.
 *
 * Split across three catalog files purely so no single file is a thousand
 * lines; this module is the only thing anything else imports. Order inside a
 * catalog is room order, and room order is ROOMS order, so the hub's shelves
 * come out in the same sequence as the hub's cards without either side
 * knowing about the other.
 */

import { ROOMS, type RoomId } from '../rooms';
import type { Band, EngineId, Game, TeachMove } from './types';
import { AWARENESS_GAMES } from './catalog/awareness';
import { PERSPECTIVE_GAMES } from './catalog/perspective';
import { CARE_GAMES } from './catalog/care';

export const GAMES: Game[] = [...AWARENESS_GAMES, ...PERSPECTIVE_GAMES, ...CARE_GAMES];

/** The library's size, as a named constant — the hub prints it. */
export const GAME_COUNT = GAMES.length;

/**
 * Games in a room, flagship first.
 *
 * "Rotate, don't randomise" (master plan §6) is the shelf's job, not this
 * one: this returns a stable order so a child who loved a game can find it
 * in the same place tomorrow, and the hub's "surprise me" does the rotating.
 */
export function gamesInRoom(room: RoomId): Game[] {
  return GAMES.filter((g) => g.room === room).sort(
    (a, b) => Number(b.flagship ?? false) - Number(a.flagship ?? false),
  );
}

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function countInRoom(room: RoomId): number {
  return GAMES.reduce((n, g) => n + (g.room === room ? 1 : 0), 0);
}

/** Every room's game count, for the hub cards. */
export const ROOM_COUNTS: Record<RoomId, number> = ROOMS.reduce(
  (acc, r) => { acc[r.id] = countInRoom(r.id); return acc; },
  {} as Record<RoomId, number>,
);

/* ── Filters, for the hub's "show me…" row ──────────────────────────── */

export interface GameFilter {
  engine?: EngineId;
  move?: TeachMove;
  band?: Band;
}

export function filterGames(games: Game[], f: GameFilter): Game[] {
  return games.filter((g) => {
    if (f.engine && g.engine !== f.engine) return false;
    if (f.move && g.move !== f.move) return false;
    // 'A' games belong to every band — a band filter must never hide them.
    if (f.band && g.band !== f.band && g.band !== 'A') return false;
    return true;
  });
}

/**
 * Pick a game the child hasn't just played. Rotation, not randomness:
 * shuffle within the room, avoid the last two, gently favour untried ones
 * (master plan §6, "How a room picks a game").
 */
export function pickNextGame(room: RoomId, recent: string[], played: string[]): Game | undefined {
  const shelf = gamesInRoom(room);
  if (!shelf.length) return undefined;
  const avoid = new Set(recent.slice(-2));
  const eligible = shelf.filter((g) => !avoid.has(g.id));
  const pool = eligible.length ? eligible : shelf;
  const untried = pool.filter((g) => !played.includes(g.id));
  const from = untried.length ? untried : pool;
  return from[Math.floor(Math.random() * from.length)];
}

/* ── Library invariants ─────────────────────────────────────────────────
 * Checked once at module load, in dev only. These are the two mistakes that
 * are easy to make while editing 67 entries by hand and impossible to see by
 * reading: a duplicated id (the second game silently becomes unreachable,
 * because getGame/find returns the first) and a game filed under a room that
 * doesn't exist (it vanishes from every shelf without erroring). Both fail
 * loudly here rather than quietly in front of a child. */
if (import.meta.env?.DEV) {
  const seen = new Set<string>();
  const roomIds = new Set(ROOMS.map((r) => r.id));
  for (const g of GAMES) {
    if (seen.has(g.id)) console.error(`[kids-v1] duplicate game id: ${g.id}`);
    seen.add(g.id);
    if (!roomIds.has(g.room)) console.error(`[kids-v1] game ${g.id} has unknown room: ${g.room}`);
  }
}
