import { noteWaiting, type Note } from './notes';
import { peekWelcomeBack } from './awayFor';
import { arcBeatForToday, type ArcBeat } from './chirpyArc';
import { recollectionForToday, type ChirpyRecollection } from './chirpyMemory';
import { guessingGameForToday, type GuessingGame } from './guessingGame';
import { teachingForToday, type Teaching } from './teachings';

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
 *   2. CHIRPY, whichever of his five is due — and only one, because he is
 *      one character. Within him: the welcome back first (it is only true
 *      today), then the arc (it moves, and it's timed), then the memory
 *      (which keeps indefinitely), then a teaching move, and last the
 *      guessing game.
 *
 *      THE GAME IS LAST ON PURPOSE, and that is not the same as it being
 *      least. Everything above it is rare, timed or finite, so in practice
 *      "last" means the game is what Chirpy does on the ordinary evenings
 *      when none of the significant things are due — which is most evenings,
 *      and is exactly right. A friend who only ever turns up when something
 *      meaningful is happening is not a friend, he's an occasion. It also
 *      loses nothing by waiting: it records nothing and leads nowhere, so a
 *      night it doesn't get is a night nothing was missed.
 *
 * NOTHING HERE COMMITS. Every candidate is peeked at, never spent — see
 * awayFor's peekWelcomeBack for the bug that made that necessary. The caller
 * marks only the one it actually renders.
 */
export type HubMoment =
  | { kind: 'note'; note: Note }
  | { kind: 'welcome'; line: string }
  | { kind: 'arc'; beat: ArcBeat }
  | { kind: 'memory'; recollection: ChirpyRecollection }
  | { kind: 'teaching'; teaching: Teaching }
  | { kind: 'game'; game: GuessingGame };

/**
 * `quiet` suppresses everything Chirpy — a distressed child gets no
 * character, which is the same rule the rest of the app keeps. A note from
 * home still comes through: it is from a person rather than from the app, and
 * finding out that your mum noticed something is not a thing to be protected
 * from on a bad evening.
 */
export function hubMoment(
  quiet: boolean,
  pointsByBehaviour: Record<string, number>,
): HubMoment | null {
  const note = noteWaiting();
  if (note) return { kind: 'note', note };

  if (quiet) return null;

  const welcome = peekWelcomeBack();
  if (welcome) return { kind: 'welcome', line: welcome };

  const beat = arcBeatForToday();
  if (beat) return { kind: 'arc', beat };

  const recollection = recollectionForToday();
  if (recollection) return { kind: 'memory', recollection };

  /*
    A TEACHING MOVE — and it sits here, above the game, because it is the
    thing this list was missing.

    Everything over it is rare, timed or finite, so in practice the bottom of
    this list is what Chirpy does on an ordinary evening, and an ordinary
    evening is most of them. Until now the only thing down here was the
    guessing game, which records nothing and leads nowhere by design. That
    was a friend who turns up and plays a round of guess-what, every single
    night, forever.

    The teaching moves are the other thing a friend does: shows you something.
    One a day at most, sixteen of them, and they take turns — see
    kit/teachings, which also explains why this cannot be Math.random.

    ABOVE THE GAME rather than below it because the library is finite and the
    game is not. Put the game first and these would surface roughly never.
  */
  const teaching = teachingForToday();
  if (teaching) return { kind: 'teaching', teaching };

  /* The points are passed in rather than read here because they live in the
     zustand store, not in localStorage under our own key — and because a kit
     module that reached into another feature's persisted state to find out
     what a child is good at would be exactly the kind of quiet coupling that
     makes the store impossible to change later. */
  const game = guessingGameForToday(pointsByBehaviour);
  if (game) return { kind: 'game', game };

  return null;
}
