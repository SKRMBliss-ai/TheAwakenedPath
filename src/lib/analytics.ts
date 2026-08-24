/**
 * analytics.ts
 *
 * Shared client-side event logger. Most landing pages (EmotionFeelingsCourse,
 * EmotionalHealthCheck, SoulfulHome, the kids-challenge pages) each define
 * their own local `track`/`trackActivity`/`trackKids` function that does the
 * exact same fetch to the same logWebActivity Cloud Function — this module
 * exists so a NEW page or shared component doesn't have to duplicate that
 * fifth time.
 *
 * Deliberately not used to replace those existing per-page trackers: each
 * already has its own established event vocabulary that the admin
 * lead-notification email and the report already key off, and touching five
 * working files to save a few lines each was not worth the risk. This module
 * is for filling real gaps — pages with no tracking at all, and shared chrome
 * (SiteHeader/SiteFooter) that renders on every page but had no click
 * tracking of its own.
 */
import { useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { shouldBlockAnalytics } from '../config/admin';

const LOG_URL = 'https://us-central1-awakened-path-2026.cloudfunctions.net/logWebActivity';

/**
 * Fire-and-forget by design: a tracking failure, a blocked request, an
 * offline visitor — none of it should ever surface to or block the person
 * using the page.
 *
 * Skips the team's own emails (shouldBlockAnalytics — the same list Clarity
 * already excludes), mirroring what ProgrammaticContentView's page-visit
 * tracker was already doing inline. Without it, the report's "top pages"
 * would mostly show whoever last tested a page, not real visitors — on a
 * site this size a handful of QA passes can outnumber actual traffic.
 */
export function track(action: string, details = '', page?: string) {
  try {
    // import.meta.env.DEV is true under `vite`/`vite dev` and false in a real
    // `vite build` — every dev server (localhost:5173, 5174, any autoPort
    // fallback) is DEV regardless of hostname. Without this, testing the app
    // locally posts real rows into production's activity_logs — which is
    // exactly what happened testing this feature: a full route sweep for QA
    // showed up in the live Engagement Report as "Anonymous" traffic.
    if (import.meta.env.DEV) return;
    if (shouldBlockAnalytics(auth.currentUser?.email)) return;
    const resolvedPage = page || (typeof window !== 'undefined' ? window.location.pathname : '/');
    fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: auth.currentUser?.email || 'anonymous',
        action,
        page: resolvedPage,
        details,
        source: typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct',
      }),
    }).catch(() => {});
  } catch { /* silent */ }
}

/**
 * Fires one page-view event on mount, once. `action` should be a stable name
 * like 'PAGE_VISIT_ABOUT_US' — the report groups on it, so keep it constant
 * across renders rather than deriving it from something that changes.
 */
export function usePageView(action: string, page?: string, details = '') {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(action, details, page);
    // Intentionally fires once on mount only — an action name that changes
    // across renders would double-log rather than re-fire correctly, so this
    // is not meant to react to prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Automatic click tracking for SiteHeader/SiteFooter, which render on nearly
 * every public page. A page can still pass its own onClick for a specific,
 * named event (e.g. KIDS_HERO_CTA) — these compose with, not replace, that.
 */
export function trackNavClick(label: string, href?: string) {
  track('NAV_CLICK', `${label} → ${href || ''}`);
}

export function trackFooterClick(label: string, href?: string) {
  track('FOOTER_CLICK', `${label} → ${href || ''}`);
}
