/**
 * Has this device already watched the Feelings Room's opening cinematic?
 *
 * Same shape as the live page's `practise/kids/introVideoStorage.ts` (one
 * flag per clip, read/write wrapped in try/catch for private-browsing and
 * storage-disabled cases) — kept as its own tiny module here rather than
 * imported across the feature boundary, because kids-v1 is self-contained on
 * purpose (see kit/sound.ts, kit/checkinContent.ts for the same convention).
 *
 * A child who has seen it once goes straight to the interactive orbs on
 * every later visit — the burst in the video is a one-time "wow", not
 * something to sit through before every check-in.
 */

const KEY_PREFIX = 'mindgym.kidsv1.introSeen:';

export function introSeen(id: string): boolean {
  try { return localStorage.getItem(KEY_PREFIX + id) === '1'; } catch { return false; }
}

export function markIntroSeen(id: string) {
  try { localStorage.setItem(KEY_PREFIX + id, '1'); } catch { /* ignore */ }
}
