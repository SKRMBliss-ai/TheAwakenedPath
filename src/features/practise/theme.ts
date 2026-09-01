/**
 * The /mindgymforall cream/sage/violet palette (features/gym/theme/
 * gymTokens.ts's "adults" surface), remapped to the --p-* names ui.tsx's
 * components already read. Pass as PractiseShell's `theme` prop wherever the
 * Adult gym should match the entry screen's visual direction instead of its
 * own lavender/purple default.
 *
 * Lives in its own file rather than ui.tsx: that file exports only
 * components, which is what lets Fast Refresh work on it; a mixed
 * component+constant export breaks that (caught by the
 * react-refresh/only-export-components lint rule).
 *
 * Deliberately NOT a change to ui.tsx's own THEME.adult: that key is also
 * used by MeditationPracticeRoom.tsx (a different screen, on the existing
 * gated app's 'today' tab, that nobody has asked to restyle) — overriding
 * via this prop keeps the change scoped to exactly the screens that opt in.
 */
export const GYM_ADULT_THEME: Record<string, string> = {
  '--p-bg': '#FBF8F3',
  '--p-bg2': '#F2ECE3',
  '--p-surface': '#FFFFFF',
  '--p-ink': '#2A2521',
  '--p-muted': '#8A8078',
  '--p-accent': '#2E7D5B',
  '--p-accent-soft': '#E8F2EC',
  '--p-line': '#E9E1D5',
  '--p-cta-1': '#2E7D5B',
  '--p-cta-2': '#256848',
};
