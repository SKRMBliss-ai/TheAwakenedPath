import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

interface Chip {
  title: string;
  sub: string;
  affirmation: string;
}

const CHIPS: Chip[] = [
  {
    title: 'I overthink everything',
    sub: 'My mind never seems to rest',
    affirmation: 'Your busy mind is proof of your sensitivity. We will help it find stillness, not silence.',
  },
  {
    title: 'I feel emotionally exhausted',
    sub: 'Everything & I need balance',
    affirmation: 'Exhaustion is your nervous system asking for gentleness. You have come to the right place.',
  },
  {
    title: 'I worry about so many things',
    sub: 'Anxiety & fear hold me back',
    affirmation: 'Worry is love with nowhere to go. We will give it a direction: inward.',
  },
  {
    title: 'I want inner peace',
    sub: 'I long for calm and clarity',
    affirmation: 'Peace is not a destination — it is a way of traveling. We walk slowly here.',
  },
  {
    title: 'I want better relationships',
    sub: 'I struggle to connect and communicate',
    affirmation: 'Every relationship reflects your relationship with yourself. Understanding yourself is the beginning.',
  },
  {
    title: 'I want to meditate',
    sub: 'I am ready to build a habit',
    affirmation: 'The fact that you are here means you have already begun. The first breath is always the hardest.',
  },
];

function IntentWatercolorIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="iw1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ECE3D4" />
            <stop offset="70%" stopColor="#DACBBA" />
            <stop offset="100%" stopColor="#C4B29E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#iw1)" />
        <path d="M 50 25 A 25 25 0 1 1 25 50 A 18 18 0 1 1 50 32 A 12 12 0 1 1 38 50" fill="none" stroke="#7A6856" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <circle cx="50" cy="50" r="4" fill="#7A6856" opacity="0.9" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="iw2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EADBCE" />
            <stop offset="70%" stopColor="#D5C3B3" />
            <stop offset="100%" stopColor="#BFAF9D" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#iw2)" />
        <path d="M 26 58 L 74 58" stroke="#665648" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 36 58 A 14 14 0 0 1 64 58" fill="#665648" opacity="0.75" />
        <path d="M 20 72 L 80 72" stroke="#7A6856" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="iw3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EAE0D3" />
            <stop offset="70%" stopColor="#D7C9B8" />
            <stop offset="100%" stopColor="#C0B09E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#iw3)" />
        <path d="M 30 52 C 26 46, 36 38, 46 41 C 52 34, 68 36, 72 44 C 80 44, 84 54, 76 60 C 70 64, 30 64, 30 52 Z" fill="#6B5B4E" opacity="0.8" />
        <path d="M 50 26 L 50 34 M 32 32 L 37 37 M 68 32 L 63 37" stroke="#9C8B78" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </svg>
    );
  }
  if (index === 3) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="iw4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EBDDD4" />
            <stop offset="70%" stopColor="#D7C6BB" />
            <stop offset="100%" stopColor="#BCAAA0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#iw4)" />
        <path d="M 50 30 C 40 45, 30 55, 50 72 C 70 55, 60 45, 50 30 Z" fill="#755B53" opacity="0.75" />
        <path d="M 50 42 C 44 52, 38 60, 50 70 C 62 60, 56 52, 50 42 Z" fill="#EBDDD4" opacity="0.5" />
      </svg>
    );
  }
  if (index === 4) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="iw5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ECE3D5" />
            <stop offset="70%" stopColor="#DACBB9" />
            <stop offset="100%" stopColor="#C3B29E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#iw5)" />
        <path d="M 44 62 C 28 50, 24 38, 34 30 C 40 26, 44 32, 44 32 C 44 32, 48 26, 54 30 C 64 38, 60 50, 44 62 Z" fill="#7A6856" opacity="0.8" />
        <path d="M 56 68 C 44 58, 40 48, 48 42 C 53 38, 56 43, 56 43 C 56 43, 60 38, 65 42 C 73 48, 70 58, 56 68 Z" fill="#9C8B78" opacity="0.65" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
      <defs>
        <radialGradient id="iw6" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5EBD9" />
          <stop offset="70%" stopColor="#E6D4B7" />
          <stop offset="100%" stopColor="#D4BF9A" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#iw6)" />
      <circle cx="50" cy="34" r="7" fill="#8C6E40" opacity="0.9" />
      <path d="M 32 68 C 34 52, 42 46, 50 46 C 58 46, 66 52, 68 68 Z" fill="#8C6E40" opacity="0.85" />
      <circle cx="50" cy="46" r="28" stroke="#99743D" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="4 4" />
    </svg>
  );
}

export default function WhatBringsYou({ palette }: { palette: Palette }) {
  const [active, setActive] = useState<number | null>(null);
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#6B5744';

  return (
    <section
      className="si-reveal"
      style={{ padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)', textAlign: 'center', position: 'relative', zIndex: 2 }}
    >
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 16 }}>
        Begin Here
      </p>
      <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, color: ink, marginBottom: 10, letterSpacing: '-0.01em' }}>
        What brings you here today?
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 14, color: inkSub, marginBottom: 52, maxWidth: 440, margin: '0 auto 52px' }}>
        Everyone's journey is unique. Pick what feels closest to you.
      </p>

      {/* Chip grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        maxWidth: 960,
        margin: '0 auto 48px',
      }}>
        {CHIPS.map((chip, i) => {
          const isSelected = active === i;
          return (
            <motion.button
              key={i}
              whileHover={{ y: -4 }}
              onClick={() => setActive(isSelected ? null : i)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px 18px',
                borderRadius: 22,
                background: isSelected
                  ? (isDark ? 'rgba(74,50,96,0.35)' : 'rgba(74,50,96,0.12)')
                  : (isDark ? 'linear-gradient(145deg, rgba(38,30,22,0.85) 0%, rgba(24,18,14,0.9) 100%)' : 'linear-gradient(145deg, rgba(255,252,247,0.95) 0%, rgba(248,242,233,0.9) 100%)'),
                border: `1.5px solid ${isSelected ? '#C4913A' : (isDark ? 'rgba(196,145,58,0.25)' : 'rgba(196,181,160,0.5)')}`,
                boxShadow: isSelected ? '0 12px 32px rgba(196,145,58,0.25)' : '0 8px 24px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                backdropFilter: 'blur(12px)',
              }}
              aria-pressed={isSelected}
            >
              {/* Soft Circular Watercolor SVG Emblem */}
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  marginBottom: 16,
                  boxShadow: isSelected ? '0 8px 24px rgba(196,145,58,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: `1.5px solid ${isSelected ? '#C4913A' : 'rgba(196,145,58,0.3)'}`,
                }}
              >
                <IntentWatercolorIcon index={i} />
              </div>

              <span style={{ display: 'block', fontFamily: SERIF, fontSize: 18, fontWeight: 500, lineHeight: 1.25, color: ink, marginBottom: 6 }}>
                "{chip.title}"
              </span>
              <span style={{ display: 'block', fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: inkSub, lineHeight: 1.35, marginBottom: 14 }}>
                {chip.sub}
              </span>

              {/* Click Me Badge */}
              <div
                style={{
                  marginTop: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 999,
                  background: isSelected
                    ? 'linear-gradient(135deg, #4A3260 0%, #362248 100%)'
                    : (isDark ? 'rgba(196,145,58,0.14)' : 'rgba(196,145,58,0.1)'),
                  border: `1px solid ${isSelected ? '#C4913A' : 'rgba(196,145,58,0.35)'}`,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isSelected ? '#FFDF9E' : (isDark ? '#C4913A' : '#7A5F44'),
                  boxShadow: isSelected ? '0 4px 14px rgba(74,50,96,0.3)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <Sparkles size={11} /> {isSelected ? 'Exploring' : 'Tap to explore'}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Affirmation reveal */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: 520,
              margin: '0 auto',
              padding: '24px 32px',
              borderRadius: 20,
              background: isDark ? 'rgba(196,145,58,0.08)' : 'rgba(196,145,58,0.06)',
              border: '1px solid rgba(196,145,58,0.2)',
            }}
          >
            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(17px, 2vw, 22px)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.55,
              color: isDark ? 'rgba(237,233,227,0.88)' : '#4A3C2E',
              margin: 0,
            }}>
              "{CHIPS[active].affirmation}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
