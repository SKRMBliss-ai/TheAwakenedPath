/**
 * WHAT THE CHILD HAS PUT ON THE WALL.
 *
 * The gym is the app's place, not the child's. They can drag a jar and a
 * companion about, and that is the whole of what they can change — everything
 * else is furniture somebody else chose. Which is a real gap, because making
 * a place yours is most of what a six-year-old does with a bedroom, and it is
 * the difference between somewhere you visit and somewhere you live.
 *
 * So: a drawing they made can be hung in a room they choose, and it stays
 * there. Not in the gallery with all the others — on the wall of the
 * Kindness Garden, or the Truth Lab, because that's where they decided it
 * should go.
 *
 * ONE PER ROOM, and hanging a new one takes the old one down. Seven walls is
 * a small enough number to be a real choice: a child who can hang everything
 * everywhere is tidying, and a child who has to pick which drawing gets the
 * Courage Castle is deciding something. The old drawing isn't destroyed —
 * it goes back to the doodle wall it came from.
 *
 * IT SURVIVES THE DRAWING BEING DELETED, badly, on purpose: the reference is
 * a case id, and a case the child throws away takes its picture with it, so
 * the wall quietly goes bare. That is correct. A drawing they deleted must
 * not persist anywhere, including in a frame they'd forgotten about.
 */

const KEY = 'mindgym.kidsv1.hung';

/** roomId → the id of the case whose drawing is hanging there. */
type Hung = Record<string, string>;

function read(): Hung {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? (v as Hung) : {};
  } catch { return {}; }
}

function write(h: Hung): void {
  try { localStorage.setItem(KEY, JSON.stringify(h)); } catch { /* storage off */ }
}

export function allHung(): Hung {
  return read();
}

/** The case id hanging in this room, if any. */
export function hungIn(roomId: string): string | null {
  return read()[roomId] ?? null;
}

/** Every room this case is currently hanging in — normally none or one. */
export function roomsShowing(caseId: string): string[] {
  const h = read();
  return Object.keys(h).filter((room) => h[room] === caseId);
}

export function hangIn(roomId: string, caseId: string): void {
  write({ ...read(), [roomId]: caseId });
}

export function takeDown(roomId: string): void {
  const h = read();
  delete h[roomId];
  write(h);
}
