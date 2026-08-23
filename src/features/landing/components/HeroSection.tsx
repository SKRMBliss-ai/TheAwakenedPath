/**
 * HeroSection.tsx
 * Founder-led editorial hero:
 * - The two founders flank the composition, bleeding off the bottom edge.
 *   A stock meditation photo said nothing about who is behind this; the
 *   people who built it, shown at full height, are the authority signal.
 * - Centre: eyebrow + serif headline + sub + CTAs + attribution + trust row
 * - Below 1024px there is no room for two full figures, so they give way to
 *   an overlapping-avatar credit line that carries the same signal compactly.
 * - Bottom right: Watch 1 min intro floating badge
 */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Palette } from '../../../lib/siteTheme';
import HeroMark from '../../../components/site/HeroMark';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

/**
 * Two sets of the same pair. The hero uses the frame where they face each
 * other (Marketting/shsm.png, split into two): placed left and right they
 * look inward across the headline, framing it instead of staring past it.
 * The small avatars use the front-on portraits, which read better at 34px.
 */
const FOUNDERS = [
  { key: 'shruti', name: 'Shruti Khungar', photo: '/marketing/shruti-facing.webp', avatar: '/marketing/shruti.webp' },
  { key: 'sim', name: 'Sim Katyal', photo: '/marketing/sim-facing.webp', avatar: '/marketing/sim.webp' },
] as const;

interface Props {
  palette: Palette;
  onStartPractice: () => void;
  onExploreMindGym: () => void;
}

export default function HeroSection({ palette, onStartPractice, onExploreMindGym }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isDark = palette.isDark;

  const ink       = isDark ? '#EDE9E3' : '#2A2118';
  const inkSoft   = isDark ? 'rgba(237,233,227,0.68)' : '#6B5744';
  const goldBtn   = '#4A3260';   // SI purple for primary CTA
  const outlineC  = isDark ? 'rgba(237,233,227,0.22)' : 'rgba(60,40,20,0.22)';

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (!containerRef.current) return;

    const targets = containerRef.current.querySelectorAll<HTMLElement>('[data-hero-item]');

    targets.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 1s ${0.1 + i * 0.12}s cubic-bezier(0.16,1,0.3,1), transform 1s ${0.1 + i * 0.12}s cubic-bezier(0.16,1,0.3,1)`;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targets.forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      });
    });
  }, [shouldReduceMotion]);

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(620px, 90vh, 920px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <style>{`
        /* The figures are sized off viewport height, so on a short-but-wide
           window they stay clear of the copy; it is narrow windows that run
           them into it. Below 1024px they go entirely and the avatar credit
           line carries the founders instead. */
        @media (max-width: 1023px) {
          .si-hero-founder { display: none !important; }
        }
        @media (min-width: 1024px) and (max-width: 1439px) {
          /* Narrower band: shrink them and bleed further out, or they close in
             on the headline instead of framing it. */
          .si-hero-founder { --si-bleed: 0px; }
          .si-hero-founder img { height: clamp(420px, 66vh, 580px) !important; }
        }
        .si-hero-founder { --si-bleed: 40px; }
        .si-hero-founder:first-of-type { left: var(--si-bleed) !important; }
        .si-hero-founder:last-of-type { right: var(--si-bleed) !important; }
        /* Below 1024px the full-height figures give way to this instead —
           same facing-inward pair shot, small and above the headline, so the
           founders are still visibly present rather than reduced to a pure
           text credit line. */
        .si-hero-mobile-photo { display: none; }
        @media (max-width: 1023px) {
          .si-hero-mobile-photo { display: block; }
        }
      `}</style>
      {/* ── 1. Warm atmospheric ground ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(120% 90% at 50% 0%, rgba(74,50,96,0.35) 0%, rgba(13,10,18,0) 60%), #0D0A12'
            : 'radial-gradient(120% 90% at 50% 0%, rgba(196,145,58,0.14) 0%, rgba(249,245,239,0) 58%), #F9F5EF',
        }}
      />

      {/* ── 2. The founders, flanking the promise ──
          Anchored to the TOP edge, just under the header, and bled off the
          side so they read as part of the page rather than two cut-outs
          pasted on it. Previously anchored to the section's bottom edge —
          on a viewport shorter than the section's own min-height (routine on
          a real laptop, since 90vh plus the header's own real height often
          exceeds one screen) that left a tall empty gap between the header
          and the top of their heads, pushing the figures down out of the
          first screenful entirely. Top-anchoring means the header is the
          only thing that can ever sit above them. Decorative: the names are
          spelled out in the attribution line below the CTAs, so leaving
          these unlabelled avoids a screen reader hearing them twice. */}
      {FOUNDERS.map((f, i) => (
        <div
          key={f.key}
          aria-hidden="true"
          className="si-hero-founder"
          style={{
            position: 'absolute',
            top: 0,
            // Move inwards away from the edges
            [i === 0 ? 'left' : 'right']: 'clamp(10px, 5vw, 60px)',
            zIndex: 1,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <img
            src={f.photo}
            alt=""
            fetchPriority="high"
            decoding="async"
            style={{
              position: 'relative',
              // Tall enough to reach down alongside the headline without
              // needing the section itself to grow to fit them.
              height: 'clamp(480px, 78vh, 780px)',
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'top',
              // Fades each figure out at the bottom instead of cutting off at
              // a hard edge — the end that now bleeds off is the torso/legs,
              // not the head, since anchoring flipped to the top.
              WebkitMaskImage: 'linear-gradient(to bottom, black 74%, transparent 99%)',
              maskImage: 'linear-gradient(to bottom, black 74%, transparent 99%)',
            }}
          />
        </div>
      ))}

      {/* ── 3. Background HeroMark Graphic Watermark ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          opacity: isDark ? 0.35 : 0.22,
          pointerEvents: 'none',
        }}
      >
        <HeroMark palette={palette} size={560} />
      </div>

      {/* ── 4. Overlaid Text Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1240,
          margin: '0 auto',
          padding: 'clamp(64px, 10vw, 120px) clamp(24px, 6vw, 96px)',
        }}
      >
        <div
          ref={containerRef}
          className="si-hero-copy"
          style={{
            maxWidth: 560,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Mobile-only founders photo — see .si-hero-mobile-photo above. */}
          <img
            data-hero-item
            src="/marketing/twins-facing.webp"
            alt="Shruti Khungar and Sim Katyal, facing each other"
            className="si-hero-mobile-photo"
            style={{
              width: '100%',
              maxWidth: 380,
              height: 'auto',
              margin: '0 auto 28px',
              WebkitMaskImage: 'linear-gradient(to bottom, black 78%, transparent 99%)',
              maskImage: 'linear-gradient(to bottom, black 78%, transparent 99%)',
            }}
          />

          {/* Eyebrow */}
          <p
            data-hero-item
            style={{
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: isDark ? '#C4913A' : '#7A5F44',
              margin: '0 0 24px',
            }}
          >
            Mindful · Aware · Alive
          </p>

          {/* Main headline */}
          <h1
            data-hero-item
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(44px, 5.5vw, 82px)',
              fontWeight: 400,
              lineHeight: 1.08,
              color: ink,
              margin: '0 0 4px',
              letterSpacing: '-0.01em',
            }}
          >
            You don't need to<br />
            <em style={{ fontStyle: 'italic' }}>fix yourself.</em>
          </h1>

          <h2
            data-hero-item
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(30px, 3.8vw, 56px)',
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.12,
              color: isDark ? 'rgba(237,233,227,0.85)' : '#6B5744',
              margin: '0 0 26px',
              letterSpacing: '-0.01em',
            }}
          >
            You only need to<br />understand yourself.
          </h2>

          {/* Subtitle */}
          <p
            data-hero-item
            style={{
              fontFamily: SANS,
              fontSize: 15.5,
              lineHeight: 1.65,
              color: inkSoft,
              margin: '0 0 32px',
              maxWidth: 460,
            }}
          >
            Mind Gym is your daily space for emotional clarity,
            inner peace and personal transformation.
          </p>

          {/* CTAs */}
          <div data-hero-item style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 26 }}>
            <button
              onClick={onStartPractice}
              className="si-btn-breathe"
              style={{
                padding: '15px 32px',
                borderRadius: 999,
                cursor: 'pointer',
                background: goldBtn,
                color: '#fff',
                border: 'none',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 30px rgba(74,50,96,0.3)',
              }}
              aria-label="Start Free Practice"
            >
              Start Free Practice
            </button>
            <button
              onClick={onExploreMindGym}
              style={{
                padding: '15px 32px',
                borderRadius: 999,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(8px)',
                color: ink,
                border: `1.5px solid ${outlineC}`,
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                transition: 'border-color 0.3s, background 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C4913A'; e.currentTarget.style.background = 'rgba(196,145,58,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = outlineC; e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; }}
              aria-label="Explore Mind Gym"
            >
              Explore Mind Gym
            </button>
          </div>

          {/* Founder attribution — the authority claim, stated in words next to
              their faces. Doubles as the mobile fallback: below 1024px the two
              full-height portraits are hidden and these avatars carry it. */}
          <div
            data-hero-item
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, marginBottom: 26,
            }}
          >
            <span style={{ display: 'flex' }}>
              {FOUNDERS.map((f, i) => (
                <img
                  key={f.key}
                  src={f.avatar}
                  alt={f.name}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    objectFit: 'cover', objectPosition: '50% 12%',
                    background: isDark ? '#241B2E' : '#EFE7DA',
                    border: `2px solid ${isDark ? '#0D0A12' : '#F9F5EF'}`,
                    marginLeft: i === 0 ? 0 : -12,
                  }}
                />
              ))}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: inkSoft, textAlign: 'left', lineHeight: 1.35 }}>
              Founded by twin sisters
              <br />
              <span style={{ color: ink }}>Shruti Khungar &amp; Sim Katyal</span>
            </span>
          </div>


        </div>
      </div>


    </section>
  );
}
