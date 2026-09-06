/**
 * WHAT A GROWN-UP SAW.
 *
 * Every other fact this app holds about a child came from the child. That is
 * right for feelings and it is a real weakness for behaviour: a six-year-old
 * asked "were you kind today?" answers partly from memory and substantially
 * from what they think the answer is supposed to be. Nothing in the app has
 * ever been able to say "this happened, and somebody else noticed".
 *
 * So: one line, written by a parent, that turns up in the gym like a note
 * pushed under a door. "I saw you let your sister go first." Not a score, not
 * a review, not a weekly summary — a thing somebody noticed, in their own
 * words, waiting for the child to find.
 *
 * THE RULES, WHICH ARE WHAT KEEP THIS FROM BEING SURVEILLANCE:
 *
 *   · ADD ONLY. A grown-up can write one and cannot take it back, edit it, or
 *     tidy up the pile. A record an adult can revise is a record that follows
 *     the adult's mood, and a child would learn quickly that yesterday's nice
 *     note can disappear.
 *   · THE CHILD IS NEVER SHOWN A COUNT. No "3 notes", no badge, no history
 *     length. The moment there's a number, a quiet week reads as being noticed
 *     less, and a child starts performing for the tally.
 *   · NOTHING NEGATIVE, and this is enforced by the shape of the thing rather
 *     than by trusting the writer: the composer offers one prompt, "something
 *     I noticed", and there is no field for anything else. A parent wanting to
 *     record a problem has the whole rest of their life to do it; this is not
 *     the channel.
 *   · THE CHILD CAN PUT ONE AWAY, and it is not deleted when they do — it
 *     stops surfacing, that's all. A child who doesn't want to look at a note
 *     right now must be able to make it stop without destroying something
 *     their parent wrote.
 *
 * On the device only, like the cases. It does not sync and there is no server:
 * this is a note between two people who live in the same house.
 */

export interface Note {
  /** Stable id, so hiding one survives new ones arriving. */
  id: string;
  /** ISO day it was written, for "a week ago". */
  day: string;
  /** The one line. Their words. */
  text: string;
  /** Who left it, as they typed it — "Mum", "Dad", "Grandma". */
  from: string;
  /** The child has seen it and put it away. Never deleted. */
  tucked?: boolean;
}

const KEY = 'mindgym.kidsv1.notes';

/** Plenty for years of occasional notes, and bounded. */
const KEEP = 60;

/** One line means one line. Long enough for a real observation, short enough
 *  that it can't become a report. */
export const MAX_NOTE = 160;

function read(): Note[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? (v as Note[]) : [];
  } catch { return []; }
}

function write(all: Note[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage off */ }
}

export function loadNotes(): Note[] {
  return read();
}

export function addNote(text: string, from: string): void {
  const clean = text.trim().slice(0, MAX_NOTE);
  if (!clean) return;
  const note: Note = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    day: new Date().toISOString().slice(0, 10),
    text: clean,
    from: from.trim().slice(0, 24) || 'Someone',
  };
  write([note, ...read()].slice(0, KEEP));
}

/**
 * The one waiting to be found, or null. Oldest first, so a child who has been
 * left three notes over a month meets them in the order they were written
 * rather than newest-first like a feed.
 */
export function noteWaiting(): Note | null {
  const open = read().filter((n) => !n.tucked);
  return open.length ? open[open.length - 1] : null;
}

/** Put one away. It stays in the list; it just stops surfacing. */
export function tuckAway(id: string): void {
  write(read().map((n) => (n.id === id ? { ...n, tucked: true } : n)));
}
