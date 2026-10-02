/**
 * STOPPING THE FEELINGS FILM FROM OUTSIDE, and why it needs a back door.
 *
 * The walk cross-fades rooms with AnimatePresence, which keeps the OUTGOING
 * room mounted for the length of the fade. So when a child answered the
 * feeling and the body room slid in, FeelingsIntro stayed alive underneath it
 * for most of a second with its soundtrack still running — the child was
 * looking at the Body Detective and listening to the feelings room.
 *
 * Props cannot fix it: AnimatePresence freezes the exiting element's props at
 * the values they had when it left, so a `stopped` flag set on the way out
 * never arrives. The unmount cleanup does pause the video, but only once the
 * fade has finished, which is exactly the second that sounded wrong.
 *
 * Hence one module-level handle, registered by whichever film is mounted.
 * There is only ever one. It lives in its own file rather than beside the
 * component because a module that exports both a component and a function
 * breaks fast refresh.
 */

let stopActiveFilm: (() => void) | null = null;

/** Called by FeelingsIntro on mount; pass null on unmount. */
export function registerFeelingsFilm(stop: (() => void) | null): void {
  stopActiveFilm = stop;
}

/** Cut the feelings film's picture and sound now, ahead of its own unmount. */
export function stopFeelingsFilm(): void {
  stopActiveFilm?.();
}
