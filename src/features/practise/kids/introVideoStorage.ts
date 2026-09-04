/** Has this room's intro video already played once on this device? Skips
 *  the re-watch (and the download) on every return visit. */
export function introVideoSeen(roomId: string): boolean {
  try { return localStorage.getItem(`kids-intro-seen:${roomId}`) === '1'; } catch { return false; }
}

export function markIntroVideoSeen(roomId: string) {
  try { localStorage.setItem(`kids-intro-seen:${roomId}`, '1'); } catch { /* ignore */ }
}
