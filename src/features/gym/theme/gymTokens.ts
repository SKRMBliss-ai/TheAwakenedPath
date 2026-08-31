/**
 * MY BEST EVERY DAY — Practice Gym design tokens.
 *
 * WHY THIS IS A SEPARATE LAYER, NOT AN EDIT TO theme/constants.ts
 * ---------------------------------------------------------------
 * `theme/constants.ts` + ThemeSystem are consumed by ~40 files across the
 * existing /mindgym app and are dark-first by project mandate
 * (.agent/workflows/code-styling-css.md). The Practice Gym mockups are
 * light-first, warm and flat-calm. Rather than change a shared token — which
 * would repaint every existing screen — the gym declares its own namespaced
 * `--gym-*` variables on its own root element. Nothing outside /mindgymfor*
 * can see them, so this file is additive and reversible by deletion.
 *
 * SCALE NOTES (kept here so screens don't re-invent them)
 * ------------------------------------------------------
 * Spacing follows an 8px rhythm and is expressed with Tailwind utilities
 * (per .kiro/steering/structure.md), not emitted as CSS vars — Tailwind's own
 * 4px scale already covers it. Only values that CSS actually reads are emitted.
 */

import type { CSSProperties } from 'react';

/** Which gym surface is being painted. Each keeps the same geometry and ink,
 *  and differs only in accent + ground — the mockups' core rule that Kids and
 *  Adults are one system with two personalities, not two design systems. */
export type GymSurface = 'all' | 'adults' | 'kids';

/** Geometry, type and elevation — identical on every surface. */
const SHARED: Record<string, string> = {
  // Both faces are already loaded by index.html; no new font request.
  '--gym-font-display': "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  '--gym-font-ui': "'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif",

  // Radii — content cards, hero panels, pills.
  '--gym-radius-card': '18px',
  '--gym-radius-panel': '26px',
  '--gym-radius-pill': '999px',

  // Elevation. Deliberately a lift, not the app's 30-50px "Heartbeat" glow:
  // the mockups are calm and flat-warm. Scoped here so the existing app's
  // glow system is untouched.
  '--gym-shadow-soft': '0 1px 2px rgba(38,31,24,0.04), 0 8px 24px -14px rgba(38,31,24,0.20)',
  '--gym-shadow-lift': '0 2px 4px rgba(38,31,24,0.05), 0 20px 44px -20px rgba(38,31,24,0.28)',

  // Control sizes — all >= 44px so every target clears the iOS/Android
  // minimum touch size on phone and tablet alike.
  '--gym-control-lg': '52px',
  '--gym-control-md': '44px',
};

/** Ink and hairlines — shared warm neutral ramp, tuned for a cream ground. */
const INK: Record<string, string> = {
  '--gym-ink': '#2A2521',
  '--gym-ink-soft': '#5C544B',
  '--gym-ink-muted': '#8A8078',
  '--gym-ink-on-accent': '#FFFFFF',
  '--gym-line': '#E9E1D5',
  '--gym-line-strong': '#D8CDBC',
  '--gym-surface': '#FFFFFF',
};

/**
 * Per-surface ground + accents.
 *
 * `accent`   = the action colour (progress, primary CTA) — sage green.
 * `accent-2` = the practice-room identity colour — violet.
 * Kids keeps the same two roles but raises saturation, matching the palette
 * the existing kids feature already uses (features/kids/MyBestEveryDay.tsx),
 * so the two never look like different products.
 */
const SURFACES: Record<GymSurface, Record<string, string>> = {
  all: {
    '--gym-bg': '#FBF7F0',
    '--gym-bg-2': '#F3EBDD',
    '--gym-accent': '#2E7D5B',
    '--gym-accent-hover': '#256848',
    '--gym-accent-surface': '#E8F2EC',
    '--gym-accent-border': 'rgba(46,125,91,0.26)',
    '--gym-accent-2': '#6D4AB8',
    '--gym-accent-2-hover': '#5B3C9C',
    '--gym-accent-2-surface': '#EFEAFA',
    '--gym-accent-2-border': 'rgba(109,74,184,0.26)',
  },
  adults: {
    '--gym-bg': '#FBF8F3',
    '--gym-bg-2': '#F2ECE3',
    '--gym-accent': '#2E7D5B',
    '--gym-accent-hover': '#256848',
    '--gym-accent-surface': '#E8F2EC',
    '--gym-accent-border': 'rgba(46,125,91,0.26)',
    '--gym-accent-2': '#6D4AB8',
    '--gym-accent-2-hover': '#5B3C9C',
    '--gym-accent-2-surface': '#EFEAFA',
    '--gym-accent-2-border': 'rgba(109,74,184,0.26)',
  },
  kids: {
    '--gym-bg': '#FDF7FF',
    '--gym-bg-2': '#EFF8FF',
    '--gym-accent': '#9B5DE5',
    '--gym-accent-hover': '#8548D2',
    '--gym-accent-surface': '#F3EAFE',
    '--gym-accent-border': 'rgba(155,93,229,0.28)',
    '--gym-accent-2': '#F15BB5',
    '--gym-accent-2-hover': '#DC459F',
    '--gym-accent-2-surface': '#FDEAF5',
    '--gym-accent-2-border': 'rgba(241,91,181,0.28)',
  },
};

/** The `--gym-*` custom properties for a surface, as a React style object. */
export function gymVars(surface: GymSurface): CSSProperties {
  return { ...SHARED, ...INK, ...SURFACES[surface] } as CSSProperties;
}
