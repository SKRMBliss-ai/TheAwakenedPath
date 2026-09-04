/**
 * THE CHIRPY EMOTIONAL STATE SYSTEM.
 *
 * Chirpy is the app's emotional visual language. Rather than showing a child
 * a row of emotion labels to pick from, the Reflection Room is inhabited by
 * several Chirpys, each in a different state, and the child looks around and
 * notices which one feels familiar. That is a fundamentally different
 * question from "what emotion are you", and it is deliberately the one this
 * app asks.
 *
 * WHAT A STATE IS. A state is data, never a component: a sprite, how it
 * moves, how big it is, where it tends to sit in the room, and — for the
 * states a child can point at — the nearest entry in the existing feelings
 * table so the rest of the check-in still knows where to go. One component
 * (ChirpyBeing) renders all of them. Adding a ninth, or a fiftieth, state
 * means adding a row here; it must never mean writing another component.
 *
 * WHAT A STATE IS NOT. It is not a diagnosis, and picking one is not a claim
 * that the child "has" that emotion. `feeling` below is a routing hint —
 * which room to offer at the end, which tally to add to — and nothing in the
 * interface may present it back to the child as a verdict on how they are.
 *
 * ON THE ART. The sprites are the founder's real character sheet, already cut
 * and shipped in /public/chirpy. Nothing here invents Chirpy art, and nothing
 * here should: if a future state has no frame of its own, it reuses the
 * nearest one until real art exists (see `unsure`, which borrows `idle`).
 * Swapping in higher-resolution or newly drawn frames later is a change to
 * the `pose` column alone — no interaction code moves.
 */

import type { ChirpyPose } from '../ui/sprites';

/** How a Chirpy carries itself. Read by ChirpyBeing; add freely. */
export type ChirpyMotion =
  /** Barely moving — breathing, the odd blink. Company, not demand. */
  | 'breathe'
  /** A soft up-and-down float, a little more present than breathing. */
  | 'bob'
  /** Light, springy, can't quite keep still. */
  | 'bounce'
  /** Drifting slowly sideways as well as up, like it's wandering. */
  | 'drift'
  /** Small, quick, unsettled movement — tense rather than energetic. */
  | 'fidget'
  /** Darting attention: looks one way, then sharply another. */
  | 'dart';

export interface ChirpyState {
  id: string;
  /** Which frame of the character sheet this state wears. */
  pose: ChirpyPose;
  /**
   * For screen readers and for grown-ups reading the code — NEVER rendered
   * as a caption next to the Chirpy. A child should recognise these by how
   * they look and move, not by reading a word off them.
   */
  description: string;
  motion: ChirpyMotion;
  /** Relative size. Depth in the room, mostly — see ChirpyRoom's layout. */
  scale: number;
  /**
   * True when a child may point at this one during the feeling beat. The
   * companion states (Chirpy talking to them, Chirpy just being around) are
   * not things to pick.
   */
  selectable: boolean;
  /**
   * The nearest id in the existing FEELINGS table, for routing and tallies
   * only. Null where a state genuinely isn't a feeling — 'unsure' is a
   * child saying they don't know, and must not be quietly recorded as one.
   */
  feeling: string | null;
  /**
   * What Chirpy might wonder aloud if this one is picked. Always tentative,
   * never a verdict — Chirpy notices and questions, he does not conclude.
   */
  aside?: string;
}

/**
 * The states, in the order they were specified. Order here is not the order
 * they appear in the room — the room places them spatially (see
 * CHIRPY_ROOM_SLOTS) precisely so they don't read as a list.
 */
export const CHIRPY_STATES: ChirpyState[] = [
  {
    id: 'curious',
    pose: 'curious',
    description: 'A Chirpy leaning in, watching something closely',
    motion: 'drift',
    scale: 1,
    selectable: true,
    feeling: 'happy',
    aside: 'That one wants to know what happens next.',
  },
  {
    id: 'worried',
    pose: 'worried',
    description: 'A Chirpy holding itself a little tight, eyes uncertain',
    motion: 'fidget',
    scale: 0.94,
    selectable: true,
    feeling: 'worried',
    aside: 'Hmm. That one looks familiar to me too, sometimes.',
  },
  {
    id: 'excited',
    pose: 'excited',
    description: 'A Chirpy bouncing, bright and full of go',
    motion: 'bounce',
    scale: 1.02,
    selectable: true,
    feeling: 'excited',
    aside: 'That one can’t sit still, can it.',
  },
  {
    id: 'jumping',
    pose: 'jumping',
    description: 'A Chirpy looking quickly from one thing to another, sure it has worked something out',
    motion: 'dart',
    scale: 0.98,
    selectable: true,
    feeling: 'scared',
    aside: 'Ah — that one’s me, mostly. I do jump to things.',
  },
  {
    id: 'hopeful',
    pose: 'hopeful',
    description: 'A Chirpy floating higher, looking up into the warm light',
    motion: 'bob',
    scale: 0.96,
    selectable: true,
    feeling: 'happy',
    aside: 'That one’s looking up at something.',
  },
  {
    id: 'unsure',
    // No frame of its own yet — idle is the closest honest match, and
    // borrowing it beats inventing art. Swap when a real frame exists.
    pose: 'idle',
    description: 'A Chirpy sitting quietly, not sure what it thinks yet',
    motion: 'breathe',
    scale: 0.9,
    selectable: true,
    feeling: null,
    aside: 'Not knowing yet is allowed. It’s where I live half the time.',
  },

  // ── Companion states · Chirpy being with the child, not a thing to pick ──
  {
    id: 'talking',
    pose: 'said2',
    description: 'Chirpy saying something',
    motion: 'bob',
    scale: 1,
    selectable: false,
    feeling: null,
  },
  {
    id: 'idle',
    pose: 'idle',
    description: 'Chirpy pottering about nearby',
    motion: 'breathe',
    scale: 1,
    selectable: false,
    feeling: null,
  },
];

export function getChirpyState(id: string): ChirpyState | undefined {
  return CHIRPY_STATES.find((s) => s.id === id);
}

/** The ones a child may point at during the feeling beat. */
export const SELECTABLE_CHIRPYS = CHIRPY_STATES.filter((s) => s.selectable);

/**
 * Where each Chirpy sits in the room, as percentages of the space.
 *
 * Deliberately scattered and deliberately uneven — some near, some further
 * back, some high, one tucked low and half behind things. A child should have
 * to look around rather than scan a row, and nothing here should resolve into
 * a grid, a ranking, or a reading order. `depth` (0 near … 1 far) drives size
 * and haze so the room has front and back rather than being a flat sheet.
 */
export interface ChirpySlot {
  id: string;
  left: string;
  top: string;
  depth: number;
}

export const CHIRPY_ROOM_SLOTS: ChirpySlot[] = [
  { id: 'hopeful', left: '58%', top: '0%', depth: 0.75 },
  { id: 'curious', left: '8%', top: '15%', depth: 0.2 },
  { id: 'jumping', left: '72%', top: '32%', depth: 0.45 },
  // Kept off the middle on purpose: the child in the room art holds a lantern
  // there, and a Chirpy parked on top of it covers the warmest thing in the
  // picture.
  { id: 'worried', left: '20%', top: '48%', depth: 0.6 },
  { id: 'excited', left: '2%', top: '68%', depth: 0.1 },
  { id: 'unsure', left: '62%', top: '72%', depth: 0.35 },
];
