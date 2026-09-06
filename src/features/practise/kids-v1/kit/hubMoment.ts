import { noteWaiting, type Note } from './notes';
import { peekWelcomeBack } from './awayFor';
import { arcBeatForToday, type ArcBeat } from './chirpyArc';
import { recollectionForToday, type ChirpyRecollection } from './chirpyMemory';

/**
 * ONE THING. THE HUB SHOWS ONE THING.
 *
 * Four separate systems can all have something to say on the same evening: a
 * note somebody left at home, Chirpy pleased you're back after a month, the
 * thing Chirpy is slowly working up to, and something you told him weeks ago
 * that he's half-remembered. Every one of them is rare on its own. Nobody was
 * counting them together.
 *
 * The result, seen in a browser on a perfectly ordinary seeded evening, was a
 * hub with THREE cards and a link stacked between "Hello, Shaarav" and the
 * rooms — with Chirpy speaking twice, from two different boxes, four inches
 * apart. A child does not read that as one friend. They read it as a feed.
 *
 * So this picks exactly one, and everything else waits. All of it is built to
 * wait: the note stays until it's opened, the arc is on a three-day timer
 * anyway, the recollection keeps for months. Nothing is lost by deferring —
 * the only thing that was ever lost was the child's attention.
 *
 * THE ORDER, AND WHY:
 *
 *   1. A NOTE FROM HOME. It came from a person, it is the rarest thing here,
 *      and somebody is waiting to find out whether it landed. Nothing Chirpy
 *      has to say beats a parent.
 *   2. CHIRPY, whichever of his three is due — and only one, because he is
 *      one character. Within him: the welcome back first (it is only true
 *      today), then the arc (it moves, and it's timed), then the memory
 *      (which keeps indefinitely and is the most repeatable of the three).
 *
 * NOTHING HERE COMMITS. Every candidate is peeked at, never spent — see
 * awayFor's peekWelcomeBack for the bug that made that necessary. The caller
 * marks only the one it actually renders.
 */
export type HubMoment =
  | { kind: 'note'; note: Note }
  | { kind: 'welcome'; line: string }
  | { kind: 'arc'; beat: ArcBeat }
  | { kind: 'memory'; recollection: ChirpyRecollection };

/**
 * `quiet` suppresses everything Chirpy — a distressed child gets no
 * character, which is the same rule the rest of the app keeps. A note from
 * home still comes through: it is from a person rather than from the app, and
 * finding out that your mum noticed something is not a thing to be protected
 * from on a bad evening.
 */
export function hubMoment(quiet: boolean): HubMoment | null {
  const note = noteWaiting();
  if (note) return { kind: 'note', note };

  if (quiet) return null;

  const welcome = peekWelcomeBack();
  if (welcome) return { kind: 'welcome', line: welcome };

  const beat = arcBeatForToday();
  if (beat) return { kind: 'arc', beat };

  const recollection = recollectionForToday();
  if (recollection) return { kind: 'memory', recollection };

  return null;
}
