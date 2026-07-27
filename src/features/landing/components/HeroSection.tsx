/**
 * HeroSection.tsx
 * Full-bleed editorial hero:
 * - Image spans end-to-end across the entire screen
 * - Scrim overlay enables flawless readability of text on the left
 * - Left: serif headline + sub + CTAs + trust signals + HeroMark
 * - Bottom right: Watch 1 min intro floating badge
 */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Palette } from '../../../lib/siteTheme';
import HeroMark from '../../../components/site/HeroMark';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const HERO_IMG =
  'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fatmosphere-calm-desk.webp.webp?alt=media';

const TRUST = [
  { icon: '⊙', label: '2 Min Setup' },
  { icon: '○', label: 'No Commitment' },
  { icon: '◇', label: 'Cancel Anytime' },
];

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
      {/* ── 1. End-to-End Full-Width Background Image ── */}
      <img
        src={HERO_IMG}
        alt="A person in peaceful meditation, bathed in warm morning light"
        fetchPriority="high"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.85,
          display: 'block',
        }}
      />

      {/* ── 2. Gradient Scrim Overlay for Readability ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(90deg, #0D0A12 0%, rgba(13,10,18,0.96) 38%, rgba(13,10,18,0.65) 58%, rgba(13,10,18,0.1) 82%, transparent 100%)'
            : 'linear-gradient(90deg, #F9F5EF 0%, rgba(249,245,239,0.96) 38%, rgba(249,245,239,0.65) 58%, rgba(249,245,239,0.1) 82%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── 3. Background HeroMark Graphic Watermark ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
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
          style={{
            maxWidth: 510,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Eyebrow */}
          <p
            data-hero-item
            style={{
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: isDark ? '#C4913A' : '#9C8B78',
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
              margin: '0 0 28px',
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
              margin: '0 0 36px',
              maxWidth: 440,
            }}
          >
            Mind Gym is your daily space for emotional clarity,
            inner peace and personal transformation.
          </p>

          {/* CTAs */}
          <div data-hero-item style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
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

          {/* Trust signals */}
          <div
            data-hero-item
            style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}
          >
            {TRUST.map((t) => (
              <span
                key={t.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: SANS,
                  fontSize: 11.5,
                  color: inkSoft,
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: 13, opacity: 0.7 }}>{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Watch Intro Floating Badge (Bottom Right) ── */}
      <a
        href="https://www.youtube.com/watch?v=0LoCdi1YLe0"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: isDark ? 'rgba(20,16,24,0.85)' : 'rgba(249,245,239,0.92)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(60,40,20,0.15)'}`,
          borderRadius: 999,
          padding: '10px 20px 10px 14px',
          textDecoration: 'none',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        aria-label="Watch 1 minute intro on YouTube"
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#FF0000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              borderLeft: '11px solid #fff',
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              marginLeft: 3,
            }}
          />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: isDark ? 'rgba(237,233,227,0.55)' : 'rgba(60,40,20,0.55)' }}>
            Watch
          </span>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: isDark ? '#EDE9E3' : '#2A2118' }}>
            1 min intro
          </span>
        </span>
      </a>
    </section>
  );
}
