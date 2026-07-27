import { useEffect, useRef } from 'react';
import HeroMark from '../../../components/site/HeroMark';
import { useSiteTheme } from '../../../lib/siteTheme';

// ── Math helpers ──────────────────────────────────────────────────────────────
const lerp    = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

interface GeoState {
  clipPct:  number; // circle() radius %
  opacity:  number;
  rotation: number; // degrees
  scale:    number;
}

function computeTarget(progress: number): GeoState {
  const p = clamp01(progress);
  const e = easeInOut(p);
  return {
    clipPct:  lerp(16,   92,   e),
    opacity:  lerp(0.04, 0.12, e),
    rotation: p * 120, // rotates smoothly as visitor scrolls
    scale:    lerp(0.88, 1.28, e),
  };
}

export default function SacredGeometry({ isDark }: { isDark: boolean }) {
  const { palette } = useSiteTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const curRef       = useRef<GeoState>(computeTarget(0));
  const tgtRef       = useRef<GeoState>(computeTarget(0));
  const isDarkRef    = useRef<boolean>(isDark);
  const rafRef       = useRef<number>(0);

  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const apply = (s: GeoState) => {
      if (!containerRef.current) return;
      containerRef.current.style.clipPath  = `circle(${s.clipPct.toFixed(2)}% at 50% 50%)`;
      containerRef.current.style.opacity   = s.opacity.toFixed(4);
      containerRef.current.style.transform = `translate(-50%, -50%) rotate(${s.rotation.toFixed(2)}deg) scale(${s.scale.toFixed(3)})`;
    };

    if (reducedMotion) {
      const final = computeTarget(1);
      apply(final);
      curRef.current = final;
      tgtRef.current = final;
      return;
    }

    const onScroll = () => {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      tgtRef.current  = computeTarget(window.scrollY / maxScroll);
    };

    const FOLLOW = 0.055;

    const tick = () => {
      const c = curRef.current;
      const t = tgtRef.current;
      curRef.current = {
        clipPct:  lerp(c.clipPct,  t.clipPct,  FOLLOW),
        opacity:  lerp(c.opacity,  t.opacity,  FOLLOW),
        rotation: lerp(c.rotation, t.rotation, FOLLOW * 0.4),
        scale:    lerp(c.scale,    t.scale,    FOLLOW * 0.5),
      };
      apply(curRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
      role="presentation"
    >
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          willChange: 'clip-path, opacity, transform',
          clipPath: 'circle(16% at 50% 50%)',
          opacity: 0.12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <HeroMark palette={palette} size={1150} />
      </div>
    </div>
  );
}
