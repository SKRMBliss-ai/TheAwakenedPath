import { useEffect } from 'react';

/**
 * THE FURNITURE STEPS BACK WHEN NOBODY IS TOUCHING IT.
 *
 * The room's chrome — the painted sign naming it, the grown-up exit — is
 * useful once and then it is competing with the thing the child came to do.
 * After three seconds of stillness it drops back to a whisper, and the moment
 * a hand moves, a key is pressed or anything takes focus it is fully there
 * again.
 *
 * IT DIMS, IT NEVER LEAVES. "Talk to a grown-up" is the one control a child in
 * trouble has to be able to reach without hunting (§2.10), so it stays in
 * place, stays clickable and stays in the tab order the whole time — the only
 * thing that changes is how loudly it sits on the picture, and it comes back
 * before a hand crosses half the screen.
 *
 * Callers add `chrome-fade` to whatever should quieten; this only sets the
 * flag on <body> so the rule is written once, in kids-v1.css, rather than in
 * every room.
 */
const QUIET_AFTER = 3000;
const WAKE_ON = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'focusin'] as const;

export function useIdleChrome(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    /* Reduced motion means "do not change under me". A control that fades in
       and out on its own is exactly that, so it simply never quietens. */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const quieten = () => document.body.setAttribute('data-chrome-quiet', '');
    const wake = () => {
      document.body.removeAttribute('data-chrome-quiet');
      clearTimeout(timer);
      timer = setTimeout(quieten, QUIET_AFTER);
    };
    WAKE_ON.forEach(event => window.addEventListener(event, wake, { passive: true }));
    wake();
    return () => {
      clearTimeout(timer);
      WAKE_ON.forEach(event => window.removeEventListener(event, wake));
      document.body.removeAttribute('data-chrome-quiet');
    };
  }, [enabled]);
}
