/**
 * InteractiveReflection.tsx
 * "Let's take 30 seconds for you" — client-side mood → affirmation.
 * Left: reflection journal image. Right: textarea with affirmation reveal.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const JOURNAL_IMG =
  'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fsite%2Freflection-journal.webp?alt=media';

// Keyword → affirmation bank (client-side, instant)
const KEYWORD_MAP: Record<string, string> = {
  anxious:      'Your nervous system is trying to protect you. What it needs most right now is your gentleness, not your urgency.',
  anxiety:      'Your nervous system is trying to protect you. What it needs most right now is your gentleness, not your urgency.',
  stressed:     'Stress is a signal, not a sentence. You are not your stress — you are the awareness noticing it.',
  overwhelmed:  'When everything feels like too much, the wisest thing you can do is pause. You are already doing that.',
  sad:          'Sadness is not weakness. It is the heart asking for tenderness. Let yourself feel it without judgment.',
  angry:        'Anger often hides a deeper feeling — hurt, fear, or unmet need. What is beneath the anger asking for?',
  happy:        'Happiness noticed is happiness deepened. Stay here for a moment. Let it land.',
  grateful:     'Gratitude is a practice of presence. Something in you is already awake to beauty.',
  tired:        'Rest is not a reward — it is a requirement. Your body already knows the truth your mind is still catching up to.',
  lost:         'Feeling lost is the beginning of finding yourself. You cannot discover new ground without first leaving the familiar.',
  lonely:       'Loneliness often means you are longing for something real. That longing is a compass, not a flaw.',
  stuck:        'Stuckness is often stillness in disguise. Something in you is processing before it can move.',
  love:         'The more you understand yourself, the more love you will have to give — and to receive.',
  peace:        'Peace is already here. It lives just beneath the noise. You are very close.',
  fear:         'Fear and excitement live in the same body. You are braver than the story you are telling yourself right now.',
  confused:     'Confusion is the doorway before clarity. You are in the threshold — and that is a sacred place.',
  hopeful:      'Hope is one of the most powerful things a human being can carry. Hold onto yours carefully.',
};

const DEFAULT_AFFIRMATION =
  'Whatever you are feeling right now is valid. You came here, which means some part of you is already seeking. That part of you is the wisest part.';

function findAffirmation(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, aff] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return aff;
  }
  return DEFAULT_AFFIRMATION;
}

export default function InteractiveReflection({ palette }: { palette: Palette }) {
  const [value, setValue] = useState('');
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#9C8B78';

  const reflect = () => {
    if (!value.trim()) return;
    setAffirmation(findAffirmation(value));
  };

  const reset = () => { setValue(''); setAffirmation(null); };

  return (
    <section
      className="si-reveal"
      style={{
        padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
        position: 'relative', zIndex: 2,
        background: isDark ? 'rgba(12,9,16,0.4)' : 'rgba(240,232,220,0.35)',
      }}
    >
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: 'clamp(32px, 5vw, 64px)',
        alignItems: 'center',
      }}>
        {/* Left: journal image */}
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(60,40,20,0.12)',
          aspectRatio: '4/3',
        }}>
          <img
            src={JOURNAL_IMG}
            alt="An open journal on a warm linen surface with a small plant beside it"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.background =
                'linear-gradient(135deg, rgba(196,181,160,0.2) 0%, rgba(196,145,58,0.1) 100%)';
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Right: reflection prompt */}
        <div>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#9C8B78', marginBottom: 16 }}>
            30 Seconds for You
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 400, color: ink, marginBottom: 12, letterSpacing: '-0.01em' }}>
            Let's take 30 seconds for you.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: inkSub, marginBottom: 32, lineHeight: 1.6 }}>
            Your feelings make sense. Let's understand them together.
          </p>

          <AnimatePresence mode="wait">
            {!affirmation ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  className="si-reflect-input"
                  rows={2}
                  placeholder="Type what you're feeling…"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reflect(); } }}
                  aria-label="Type what you're feeling right now"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 16 }}>
                  <span style={{ fontFamily: SANS, fontSize: 10.5, color: isDark ? 'rgba(237,233,227,0.35)' : '#C4B5A0' }}>
                    Private · Safe · Judgment free · Just for you
                  </span>
                  <button
                    onClick={reflect}
                    disabled={!value.trim()}
                    style={{
                      padding: '12px 24px', borderRadius: 999, cursor: value.trim() ? 'pointer' : 'default',
                      background: value.trim() ? '#4A3260' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,40,20,0.08)'),
                      color: value.trim() ? '#fff' : inkSub,
                      border: 'none', fontFamily: SANS, fontSize: 13, fontWeight: 700,
                      transition: 'all 0.3s ease', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                    aria-label="Reflect on your feelings"
                  >
                    Let's Reflect
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="affirmation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '28px 32px', borderRadius: 20,
                  background: isDark ? 'rgba(196,145,58,0.08)' : 'rgba(196,145,58,0.06)',
                  border: '1px solid rgba(196,145,58,0.2)',
                }}
              >
                <p style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(16px, 1.8vw, 21px)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: isDark ? 'rgba(237,233,227,0.88)' : '#4A3C2E',
                  margin: '0 0 24px',
                }}>
                  "{affirmation}"
                </p>
                <button
                  onClick={reset}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: SANS, fontSize: 12, color: isDark ? 'rgba(237,233,227,0.4)' : '#9C8B78',
                    textDecoration: 'underline', padding: 0,
                  }}
                  aria-label="Share something else"
                >
                  Share something else →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
