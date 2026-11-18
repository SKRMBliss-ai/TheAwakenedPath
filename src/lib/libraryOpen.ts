// Tells the rest of the app when a sound library screen (Mantras, Sacred Sounds)
// is on screen, because it has its own player bar and the app-wide mini player
// would sit on top of it.

import { useSyncExternalStore } from 'react';

let open = 0;
const subs = new Set<() => void>();

export function setLibraryOpen(on: boolean) {
  open = Math.max(0, open + (on ? 1 : -1));
  subs.forEach((f) => f());
}

export const useLibraryOpen = () =>
  useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => open > 0);
