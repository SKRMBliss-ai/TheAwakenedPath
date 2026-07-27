import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// One theme preference for the whole of skrmblissai.in.
//
// The brand home, the sales pages, the Mind Gym app and the /twinsouls
// portfolio are all served from the same origin, so a single localStorage key
// is all it takes for the preference to follow the visitor between them. The
// key name is duplicated (not imported) in the portfolio repo and in the
// pre-paint bootstrap in index.html — change it in all three or nowhere.
//
// Light is the default; dark is opt-in and remembered.
// ─────────────────────────────────────────────────────────────────────────────

export const THEME_KEY = 'si-theme';
export type SiteMode = 'light' | 'dark';

/** Reads the stored preference, migrating the app's old `awakened-theme` key. */
export function readStoredMode(): SiteMode {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'dark' || v === 'light') return v;
    // Migrate the Mind Gym app's previous key so existing users keep their choice.
    const legacy = localStorage.getItem('awakened-theme');
    if (legacy === 'dark' || legacy === 'light') {
      localStorage.setItem(THEME_KEY, legacy);
      return legacy as SiteMode;
    }
  } catch (_) { /* private mode — fall through to light */ }
  return 'light';
}

export function writeStoredMode(mode: SiteMode) {
  try {
    localStorage.setItem(THEME_KEY, mode);
    localStorage.setItem('awakened-theme', mode); // keep the app's key in step
  } catch (_) { /* ignore */ }
  applyMode(mode);
}

/** Mirrors the mode onto <html> so CSS can react and the next page paints right. */
export function applyMode(mode: SiteMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.siTheme = mode;
  root.classList.toggle('dark', mode === 'dark');
  document.body?.classList.toggle('dark-mode', mode === 'dark');

  // Set the page-level variables directly rather than relying on a stylesheet
  // selector winning the cascade: index.css also defines --bg-color, and on the
  // landing routes the app's ThemeProvider (which normally owns these) is never
  // mounted. Inline properties on <html> are unambiguous.
  const dark = mode === 'dark';
  root.style.setProperty('--boot-bg', dark ? '#0c0910' : '#F4F1EA');
  root.style.setProperty('--boot-fg', dark ? '#ede9e3' : '#2A2420');
  root.style.setProperty('--bg-color', dark ? '#0c0910' : '#F4F1EA');
  root.style.setProperty('--bg-body', dark ? '#0c0910' : '#F4F1EA');
  root.style.setProperty('--text-main', dark ? '#ede9e3' : '#2A2420');
}

export interface Palette {
  BG: string;      // page background
  BG2: string;     // alternate band
  CARD: string;    // raised surface
  PURPLE: string;  // primary accent — fills, decoration, large shapes
  /** Accent for TEXT and solid buttons. The light plum is too pale on cream,
   *  so anything small — or white-on-accent — uses this deeper tone: 5.5:1 on
   *  cream, 6.2:1 for white on top of it. */
  PURPLE_STRONG: string;
  BROWN: string;   // secondary accent
  /** Text/icon colour that sits ON a PURPLE_STRONG or BROWN fill. White in
   *  light mode; near-black in dark, where the accents themselves are light. */
  ON_ACCENT: string;
  /** Full-width accent SECTION background — the soft mauve (portfolio
   *  --lavender-2). Deliberately identical in light and dark so the brand band
   *  reads the same on every page. It is light, so text on it is ink, never
   *  white: white measures 2.70:1 here, ink measures 5.7:1. */
  BAND: string;
  ON_BAND: string;      // primary text on BAND
  ON_BAND_SOFT: string; // secondary text on BAND
  BAND_TILE: string;    // tile surface sitting on BAND
  BAND_BORDER: string;  // tile border on BAND
  ON_BAND_ACCENT: string; // brown highlight text on BAND
  INK: string;     // primary text
  INK2: string;    // secondary text
  BORDER: string;  // hairline that must be visible without hovering
  isDark: boolean;
}

// The accent band. Shared by both modes on purpose — see Palette.BAND.
const BAND_TOKENS = {
  BAND: '#AA98A9',
  ON_BAND: '#241E24',
  ON_BAND_SOFT: 'rgba(36,30,36,0.82)',
  BAND_TILE: 'rgba(255,255,255,0.20)',
  BAND_BORDER: 'rgba(36,30,36,0.26)',
  // Brown highlight on the band. Must be this deep: a mid brown reads 3.3:1
  // on the mauve, this one 4.8:1.
  ON_BAND_ACCENT: '#3F2E1F',
};

// Three colours only — plum, brown, white — over warm beige-grey in light and a
// warm near-black in dark. The plum sits at ~305° and the brown at 30°: they
// used to be 148° apart (blue-violet vs orange), which read as two unrelated
// systems wherever they met. Keeping every accent in the 303–308° family fixes
// that. Both sets are tuned so borders and secondary text stay visible without
// hovering.
export const LIGHT: Palette = {
  BG: '#F4F1EA', BG2: '#EAE6DC', CARD: '#FFFFFF',
  PURPLE: '#8C7B8A', PURPLE_STRONG: '#695E68', BROWN: '#7A5F44', ON_ACCENT: '#FFFFFF',
  ...BAND_TOKENS,
  INK: '#2A2420', INK2: '#5C5449',
  BORDER: 'rgba(140,123,138,0.34)',
  isDark: false,
};

export const DARK: Palette = {
  BG: '#15120F', BG2: '#1E1A16', CARD: '#221D18',
  PURPLE: '#BFB0BD', PURPLE_STRONG: '#BFB0BD', BROWN: '#C9AE8E', ON_ACCENT: '#15120F',
  ...BAND_TOKENS,
  INK: '#F4F1EA', INK2: '#BCB2A4',
  BORDER: 'rgba(201,174,142,0.30)',
  isDark: true,
};

/**
 * Current mode + palette, kept in sync across tabs (and with the Mind Gym app,
 * which writes the same key) via the `storage` event.
 */
export function useSiteTheme() {
  const [mode, setMode] = useState<SiteMode>(() => readStoredMode());

  useEffect(() => { applyMode(mode); }, [mode]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        setMode(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = () => {
    setMode((m) => {
      const next: SiteMode = m === 'dark' ? 'light' : 'dark';
      writeStoredMode(next);
      return next;
    });
  };

  return { mode, isDark: mode === 'dark', palette: mode === 'dark' ? DARK : LIGHT, toggle };
}
