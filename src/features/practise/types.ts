/**
 * Practise — the practice gym for the mind.
 *
 * One reusable engine, two gyms (Kids ~5–10 and Adults). Every "room" is
 * CONFIGURATION on the primitives below — never a hand-built screen per emotion.
 * This is the load-bearing data model described in PRODUCT_VISION §7:
 *
 *   Event → Thought → Feeling → Body → Urge → Awareness → Pause → Choice → Action → Learning
 *
 * Nothing here talks to a server. Practise progress lives on-device (see store.ts)
 * — the same privacy-first default the Kids gym already uses.
 */

/** The pattern a situation runs through — the spine of every practice. */
export interface Pattern {
  /** What happened (the trigger, neutrally stated). */
  event: string;
  /** The story the mind created. */
  thought: string;
  /** The emotion(s) that appeared. */
  feeling: string;
  /** What the body/urge wanted to do. */
  urge: string;
}

/**
 * A single step inside a Practice Session. The `kind` selects which interactive
 * primitive renders — the engine knows how to run each one for kids and adults.
 */
export type StepKind =
  | 'pattern'   // reflect the Event→Thought→Feeling→Urge back
  | 'replay'    // recreate the trigger, notice what happens inside
  | 'observe'   // notice a thought without believing/acting on it
  | 'space'     // create space — a guided breath
  | 'choices'   // explore the choices available in the moment
  | 'reflect';  // what did you discover? + one small real-life intention

export interface SessionStep {
  kind: StepKind;
  /** Short banner headline for the step (e.g. "Replay the situation"). */
  title: string;
  /** One calm line of guidance. */
  prompt: string;
  /**
   * Options offered for a select step (replay feelings, observe thoughts,
   * choices). Kids rooms supply emoji-led options; adult rooms supply words.
   */
  options?: string[];
  /** For `replay` — the recreated trigger line ("Your manager says: …"). */
  trigger?: string;
  /** For `observe` — the thought that floats up to be noticed. */
  floatingThought?: string;
}

/** The strengths a person trains — framed as "areas you've practised", never scores. */
export type StrengthId =
  | 'awareness'
  | 'pausing'
  | 'perspective'
  | 'letting-go'
  | 'self-compassion';

/**
 * A Practice Room = content/configuration on the shared engine. Bespoke rooms
 * (built from a real situation) and library rooms (kids themes, today's
 * practice) are the SAME shape.
 */
export interface PracticeRoom {
  id: string;
  /** Which gym this room belongs to. */
  gym: 'adult' | 'kids';
  /** e.g. "Defensiveness Practice Room" / "Worry Room". */
  title: string;
  /** One line: what we're practising. */
  whatPractising: string;
  /** Emoji glyph for cards. */
  glyph: string;
  /** The pattern (present for bespoke/situation rooms; optional for library). */
  pattern?: Pattern;
  /** The ordered exercises. */
  steps: SessionStep[];
  /** Strengths this room builds. */
  strengths: StrengthId[];
  /** True for user-created situation rooms (vs. built-in library rooms). */
  bespoke?: boolean;
}

/** What a finished session leaves behind. */
export interface Reflection {
  roomId: string;
  roomTitle: string;
  gym: 'adult' | 'kids';
  /** Free-text discovery. */
  discovery: string;
  /** One small thing to practise in real life. */
  intention?: string;
  /** How helpful it felt (1–5), optional. */
  helpfulness?: number;
  /** ISO day string. */
  date: string;
}

/** A saved room the user keeps in "My Practices". */
export interface SavedPractice {
  room: PracticeRoom;
  savedAt: number;
  lastPractisedAt?: number;
  /** If escalated into a 10-day challenge, the current day (1–10). */
  challengeDay?: number;
}
