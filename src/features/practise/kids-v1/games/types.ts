/**
 * The shape of a game.
 *
 * 67 games do NOT mean 67 builds. Six interaction engines cover the whole
 * library (MIND_GYM_MASTER_PLAN.md §10); each game below is content plus
 * configuration, and adding the sixty-eighth is a data entry in library.ts,
 * never a new component. That is the single most load-bearing decision in
 * this feature — everything else follows from it.
 *
 * The unions here are deliberately narrow. If a new game needs a beat that
 * doesn't exist yet, add the beat to an engine rather than adding a seventh
 * engine: the value of six is that a child learns six ways of playing and
 * then recognises them everywhere.
 */

import type { RoomId } from '../rooms';

/** The six engines. */
export type EngineId = 'choose' | 'body' | 'sort' | 'dial' | 'timed' | 'story';

/**
 * How a game teaches (master plan §7.0). Sorting the library by this is what
 * exposed v1's main weakness — many games drilled a skill where a discovery
 * moment was available — so it is recorded per game and shown in the hub's
 * filter, not left implicit.
 */
export type TeachMove = 'trapdoor' | 'experiment' | 'image' | 'practice';

/** Age band. S = 3–8 · B = 9–14 · A = both. */
export type Band = 'S' | 'B' | 'A';

interface GameBase {
  id: string;
  room: RoomId;
  name: string;
  band: Band;
  move: TeachMove;
  /** The flagship game for its room — surfaced first, marked in the shelf. */
  flagship?: boolean;
  /** One quiet line: what this game trains. Shown on the game card. */
  trains: string;
  /** Chirpy's line as the game opens. He wonders; he never instructs. */
  opener: string;
  /**
   * The closing line. A discovery, never a score, and never a moral —
   * TEACHING_MOVES.md's rule 4: "the instant you add 'and that shows us
   * that…', you've turned a discovery into a lesson and lost them."
   */
  close: string;
  /**
   * Games that ask the child to go and do something in the real world, away
   * from the screen. Rendered with a different ending — "off you go" rather
   * than "what did you notice" — because the noticing happens later.
   */
  offScreen?: boolean;
}

/* ── E1 · Choose ────────────────────────────────────────────────────────
 * A scene or prompt, plus 2–6 tappable options. Affirm any plausible pick;
 * never mark one correct. ~18 games. */

export interface ChooseRound {
  /** One line of situation, set above the question. */
  scene?: string;
  prompt: string;
  options: string[];
  /** Multi-select — "tap any that fit". Advances on a Done press, not a tap. */
  multi?: boolean;
  /** Shown after choosing, for any choice. Warmth, never correctness. */
  affirm?: string;
}

export interface ChooseGame extends GameBase {
  engine: 'choose';
  rounds: ChooseRound[];
}

/* ── E2 · Body tap ──────────────────────────────────────────────────────
 * A body with tappable regions and generous targets; regions are invisible
 * until touched and keep a soft glow once chosen. ~6 games. */

export type BodyZone =
  | 'head' | 'face' | 'throat' | 'chest' | 'tummy'
  | 'arms' | 'hands' | 'legs' | 'feet';

export interface BodyRound {
  prompt: string;
  /** How many places to tap before moving on. Default 1. */
  need?: number;
  affirm?: string;
  /** Offered as a full-width option beside the body — never smaller, never a link. */
  cantTell?: string;
}

export interface BodyGame extends GameBase {
  engine: 'body';
  rounds: BodyRound[];
}

/* ── E3 · Sort ──────────────────────────────────────────────────────────
 * Two or three labelled bins. Both bins light identically, and an "ambiguous"
 * card is accepted wherever it lands. ~7 games, including Camera or Brain —
 * the most important game in the library. */

export interface SortCard {
  text: string;
  /** Index into `bins`. -1 means genuinely either — accepted anywhere. */
  bin: number;
  /** Said after this card lands, whichever bin it went to. */
  note?: string;
}

export interface SortGame extends GameBase {
  engine: 'sort';
  bins: string[];
  /** A small line under each bin label. */
  binHints?: string[];
  rounds: { prompt: string; cards: SortCard[] }[];
}

/* ── E4 · Dial ──────────────────────────────────────────────────────────
 * A stepped scale whose label changes as it moves, and a scene that responds
 * live. The art is the feedback. ~5 games. */

export interface DialRound {
  prompt: string;
  /** Step labels, quietest first. 3–5 of them. */
  steps: string[];
  affirm?: string;
}

export interface DialGame extends GameBase {
  engine: 'dial';
  rounds: DialRound[];
  /**
   * Two dials at once, for the games about holding two things — Feeling Mix,
   * Jealousy: Two True Things. Both stay up; neither cancels the other.
   */
  dual?: { a: string; b: string };
}

/* ── E5 · Timed ─────────────────────────────────────────────────────────
 * Something moves, grows or passes, and the child acts — or deliberately
 * doesn't — in time. No countdown numerals, no score, no losing state.
 * Every trapdoor in the library lives here. ~9 games. */

export type TimedBeat =
  /** One line, tap to move on. */
  | { kind: 'say'; text: string; who?: 'narrator' | 'chirpy' }
  /** A run of quiet with a shrinking ring and NO numerals. The instruction
   *  is already given; nothing speaks while this runs (UI §8.3 step 2). */
  | { kind: 'hold'; seconds: number; label?: string }
  /** The reveal. Preceded by 800ms of nothing, per UI §8.3 step 3. */
  | { kind: 'reveal'; text: string }
  /** A question mid-game. */
  | { kind: 'ask'; prompt: string; options: string[] }
  /** Breathing, traced along a shape the child can follow. */
  | { kind: 'breath'; rounds: number; shape: 'box' | 'balloon' }
  /** Red light, green light — impulse control, trained directly. */
  | { kind: 'lights'; rounds: number }
  /** A balloon inflating; stop it as late as you dare. Bursting is not losing. */
  | { kind: 'balloon'; tries: number }
  /** Thoughts drift past and are deliberately not caught. */
  | { kind: 'parade'; thoughts: string[] }
  /** Move your actual body, then stop and notice. */
  | { kind: 'move'; text: string; count: number; after: string }
  /** A mission for real life, away from the screen. */
  | { kind: 'mission'; text: string };

export interface TimedGame extends GameBase {
  engine: 'timed';
  beats: TimedBeat[];
}

/* ── E6 · Story playback ────────────────────────────────────────────────
 * A short sequence plays, pauses for input, and replays with the child's
 * change. The replay is the payoff — it must be visibly different, not just
 * re-narrated. ~8 games. */

export type StoryPanel =
  /** One narrated line over the scene. */
  | { kind: 'line'; text: string; who?: 'narrator' | 'chirpy' }
  /** A pause for input. The child's pick is remembered and replayed. */
  | { kind: 'choice'; prompt: string; options: string[] }
  /** The replay, with `{choice}` substituted for what the child picked. */
  | { kind: 'replay'; text: string }
  /** Free text. Stays on the device — never uploaded (BUILD_BRIEF §4). */
  | { kind: 'write'; prompt: string; placeholder: string }
  /** Cards that print out one at a time — the maybe machine, the what-if tree. */
  | { kind: 'cards'; prompt: string; cards: string[]; land?: string };

export interface StoryGame extends GameBase {
  engine: 'story';
  panels: StoryPanel[];
}

export type Game = ChooseGame | BodyGame | SortGame | DialGame | TimedGame | StoryGame;

/** Human labels for the engines, used in the hub's filter row. */
export const ENGINE_LABEL: Record<EngineId, string> = {
  choose: 'Choose',
  body: 'Body',
  sort: 'Sort',
  dial: 'Dial',
  timed: 'Timed',
  story: 'Story',
};

export const MOVE_LABEL: Record<TeachMove, string> = {
  trapdoor: 'Trapdoor',
  experiment: 'Experiment',
  image: 'Picture',
  practice: 'Practice',
};

export const BAND_LABEL: Record<Band, string> = {
  S: 'Ages 3–8',
  B: 'Ages 9–14',
  A: 'Any age',
};
