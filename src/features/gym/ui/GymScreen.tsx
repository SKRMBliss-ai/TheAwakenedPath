import { useEffect, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { gymVars, type GymSurface } from '../theme/gymTokens';

/**
 * The Practice Gym page shell — every gym screen is wrapped in one of these.
 *
 * RESPONSIVE CONTRACT (phone / iPad / desktop)
 * --------------------------------------------
 * The mockups are phone-native, and the rest of this app centres its content
 * (`max-w-2xl mx-auto`) rather than expanding into a dashboard. So the gym is a
 * CENTRED CANVAS THAT WIDENS IN STEPS, never a fluid full-bleed layout:
 *
 *   phone     <640px   one column, canvas fills the viewport minus 20px gutters
 *   iPad port. 768px   canvas widens; multi-up grids go 2-up (see callers)
 *   iPad land./desktop 1024px+  canvas reaches its ceiling and stays centred;
 *                      extra room becomes whitespace, not more columns
 *
 * Two widths are offered, because the two kinds of screen want different things:
 *   'canvas' — practice flows. Stays narrow at every size: a 900px-wide line of
 *              reflective text is unreadable, and the mockups are emphatic that
 *              the adult surface is unhurried and low-density.
 *   'wide'   — entry/overview screens, which do earn a second column on a tablet.
 *
 * Other cross-device guarantees handled here:
 *   - `100dvh` where supported (inline), falling back to `100vh` via the class,
 *     so the iOS Safari collapsing toolbar can't leave a dead strip. iOS 12 is
 *     in this project's browserslist, hence the fallback rather than min-h-dvh.
 *   - `env(safe-area-inset-*)` padding for notches, Dynamic Island, and the
 *     iPad/iPhone home indicator.
 *   - `overflow-x: hidden` so no child can introduce a horizontal scroll.
 *   - Tap highlight suppressed, and text auto-sizing pinned, so rotating an
 *     iPhone doesn't silently inflate type.
 */
export function GymScreen({
  surface,
  width = 'canvas',
  className,
  children,
}: {
  surface: GymSurface;
  width?: 'canvas' | 'wide';
  className?: string;
  children: ReactNode;
}) {
  useGymPageChrome(surface);

  return (
    <div
      style={{
        ...gymVars(surface),
        minHeight: '100dvh',
        background:
          'linear-gradient(175deg, var(--gym-bg) 0%, var(--gym-bg) 45%, var(--gym-bg-2) 100%)',
        color: 'var(--gym-ink)',
        fontFamily: 'var(--gym-font-ui)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        WebkitTapHighlightColor: 'transparent',
        WebkitTextSizeAdjust: '100%',
      }}
      className="min-h-screen w-full overflow-x-hidden"
    >
      <div
        className={cn(
          'mx-auto w-full px-5 sm:px-6 lg:px-8',
          width === 'canvas'
            ? 'max-w-[26rem] sm:max-w-[30rem] lg:max-w-[34rem]'
            : 'max-w-[34rem] md:max-w-[46rem] lg:max-w-[68rem]',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Paints the document itself to match the gym.
 *
 * `src/index.css` sets `html, body { background-color: var(--bg-color, #0c0910) }`
 * — near-black — and the gym routes deliberately do NOT mount ThemeProvider, so
 * nothing would ever repaint it. Without this, over-scroll bounce on iOS and the
 * area behind a translucent status bar both flash black behind a cream page.
 *
 * Scoped and reverted on unmount so it can never leak into another surface.
 */
function useGymPageChrome(surface: GymSurface) {
  useEffect(() => {
    const vars = gymVars(surface) as Record<string, string>;
    const root = document.documentElement;
    const prevBg = root.style.getPropertyValue('--bg-color');
    const prevText = root.style.getPropertyValue('--text-main');
    const prevBody = root.style.getPropertyValue('--bg-body');

    root.style.setProperty('--bg-color', vars['--gym-bg']);
    root.style.setProperty('--bg-body', vars['--gym-bg']);
    root.style.setProperty('--text-main', vars['--gym-ink']);
    // Tells the browser to draw native chrome (form controls, scrollbars,
    // over-scroll gutter) light, so they don't arrive dark on a cream page.
    root.style.colorScheme = 'light';

    return () => {
      root.style.setProperty('--bg-color', prevBg);
      root.style.setProperty('--bg-body', prevBody);
      root.style.setProperty('--text-main', prevText);
      root.style.colorScheme = '';
    };
  }, [surface]);
}
