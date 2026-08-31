import { useCallback, useEffect, useState } from 'react';

/**
 * The gym's internal router.
 *
 * WHY THIS EXISTS
 * ---------------
 * `src/main.tsx` matches `window.location.pathname` ONCE at bootstrap and calls
 * `root.render()` for the winning branch — there is no client-side navigation
 * between top-level paths anywhere in this app. Left alone, moving from
 * /mindgymforall to /mindgymforadults would be a full page reload: a blank
 * frame, a re-download, and a lost scroll position on every phone.
 *
 * So main.tsx matches the whole `/mindgymfor*` FAMILY as one branch and hands
 * it to <GymApp>, which owns which gym is showing. That is the "nested routes
 * under one shell" answer to the routing question — one application shell, three
 * URLs — rather than three duplicate shells.
 */

export const GYM_PATHS = {
  all: '/mindgymforall',
  kids: '/mindgymforkids',
  adults: '/mindgymforadults',
} as const;

export type GymRoute = keyof typeof GYM_PATHS;

/** Matches a pathname to a gym route, or null if it isn't one of ours.
 *  Tolerates trailing slashes, case, and the `/index.html` form that Firebase
 *  Hosting can serve — the same normalisation every other route in main.tsx does. */
export function matchGymRoute(pathname: string): GymRoute | null {
  const p = pathname.replace(/\/+$/, '').toLowerCase().replace(/\/index\.html$/, '');
  for (const [route, path] of Object.entries(GYM_PATHS)) {
    if (p === path) return route as GymRoute;
  }
  return null;
}

/** Current gym route + a navigate function that keeps the URL and the back
 *  button honest without reloading the page. */
export function useGymRoute(initial: GymRoute): [GymRoute, (next: GymRoute) => void] {
  const [route, setRoute] = useState<GymRoute>(initial);

  // Back/forward must move between gyms, not out of the app entirely.
  useEffect(() => {
    const onPop = () => {
      const next = matchGymRoute(window.location.pathname);
      if (next) setRoute(next);
      else window.location.reload(); // navigated out of the family — let main.tsx decide
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: GymRoute) => {
    if (matchGymRoute(window.location.pathname) === next) return;
    window.history.pushState({ gym: next }, '', GYM_PATHS[next]);
    setRoute(next);
    // A pushState navigation does not reset scroll the way a real one does.
    window.scrollTo(0, 0);
  }, []);

  return [route, navigate];
}
