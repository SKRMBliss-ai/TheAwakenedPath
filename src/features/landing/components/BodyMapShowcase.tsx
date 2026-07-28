import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BodyMapShowcase — a self-contained, sales-page version of the Mind Gym
 * journal's body-emotion map. Tap a glowing point on the body to reveal
 * where that feeling lives and what it's asking for. No app state, no CSS
 * variables, no emoji — safe to render on the standalone course page.
 */

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

type Zone = {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  description: string;
  insight: string;
  helps: string;
};

// Warm, harmonised palette that sits inside the dark+gold aesthetic while
// keeping each region distinguishable (the meaning is in the spread).
const ZONES: Zone[] = [
  {
    id: 'head', label: 'Head', cx: 200, cy: 72, r: 30, color: '#A87CC0',
    description: 'Headaches, tension, a racing mind',
    insight: 'The head holds self-criticism and overthinking. Your mind has been working overtime.',
    helps: 'Pause and say: "I\'m doing my best. I can let my mind rest."',
  },
  {
    id: 'throat', label: 'Throat & Jaw', cx: 200, cy: 132, r: 19, color: '#5B93B8',
    description: 'Tightness, clenching, a lump in the throat',
    insight: 'The throat holds unspoken words. Jaw tension comes from holding back what you want to say.',
    helps: 'Even whispering "I have something to say" can begin to release it.',
  },
  {
    id: 'shoulders', label: 'Shoulders', cx: 200, cy: 168, r: 46, color: '#D4883C',
    description: 'Tight, stiff, heavy, aching',
    insight: 'Shoulders carry responsibility. When life feels heavy, they literally tighten under the weight.',
    helps: 'Ask: "What am I carrying that isn\'t mine to carry?" Let something go today.',
  },
  {
    id: 'chest', label: 'Chest & Heart', cx: 200, cy: 220, r: 35, color: '#C65F8D',
    description: 'Heaviness, tightness, shallow breathing',
    insight: 'The chest carries love, heartbreak and loneliness. Tightness means emotion wants to be felt.',
    helps: 'Place a hand on your heart. Breathe slowly. "I\'m here. I feel this. It\'s okay."',
  },
  {
    id: 'stomach', label: 'Stomach & Gut', cx: 200, cy: 290, r: 33, color: '#D4A017',
    description: 'Butterflies, nausea, churning, knots',
    insight: 'Your gut reacts to fear and anxiety before your thinking mind catches up.',
    helps: 'A hand on your belly. Five slow breaths. "I can handle this one moment at a time."',
  },
  {
    id: 'back', label: 'Back', cx: 158, cy: 250, r: 26, color: '#B06A6A',
    description: 'Upper, middle or lower back tension',
    insight: 'Upper back: feeling unsupported. Lower back: worry about money and the future.',
    helps: 'Ask: "Am I okay right now, in this exact moment?" Usually the answer is yes.',
  },
  {
    id: 'limbs', label: 'Legs & Whole Body', cx: 200, cy: 410, r: 33, color: '#4EA69E',
    description: 'Fatigue, heaviness, stiffness, restlessness',
    insight: 'Legs hold our ability to move forward. Whole-body exhaustion means your system needs deep rest.',
    helps: 'One kind thing for yourself today. You don\'t need to fix everything at once.',
  },
];

const BODY_PATH = `
  M 200 45
  C 220 45, 235 55, 235 72
  C 235 89, 220 100, 200 100
  C 180 100, 165 89, 165 72
  C 165 55, 180 45, 200 45
  Z
  M 200 100
  L 200 108
  C 200 108, 190 112, 185 115
  L 140 135
  C 130 138, 120 145, 118 155
  L 105 210
  C 103 218, 108 222, 115 218
  L 155 180
  L 160 175
  L 165 178
  L 160 220
  L 155 290
  C 153 300, 155 310, 160 315
  L 160 320
  L 148 410
  C 146 425, 148 435, 155 440
  L 165 448
  C 170 450, 178 448, 180 442
  L 192 340
  L 200 320
  L 208 340
  L 220 442
  C 222 448, 230 450, 235 448
  L 245 440
  C 252 435, 254 425, 252 410
  L 240 320
  L 240 315
  C 245 310, 247 300, 245 290
  L 240 220
  L 235 178
  L 240 175
  L 245 180
  L 285 218
  C 292 222, 297 218, 295 210
  L 282 155
  C 280 145, 270 138, 260 135
  L 215 115
  C 210 112, 200 108, 200 108
  Z
`;

export default function BodyMapShowcase({ isDark }: { isDark: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const active = ZONES.find((z) => z.id === selected) || null;

  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.62)' : '#6B5744';
  // #C4913A reads well on the dark background but only hits 2.6:1 on cream,
  // and this token is used for small uppercase labels. #8B6A1A is the same
  // amber family at 4.6:1 in light mode.
  const gold   = isDark ? '#C4913A' : '#8B6A1A';
  const bodyFill   = isDark ? 'rgba(255,247,235,0.05)' : 'rgba(74,50,96,0.05)';
  const bodyStroke = isDark ? 'rgba(196,145,58,0.3)' : 'rgba(122,95,68,0.28)';

  return (
    <section
      className="si-reveal"
      style={{
        padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? gold : '#7A5F44', marginBottom: 14 }}>
          Emotions Live in the Body
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.8vw, 48px)', fontWeight: 400, color: ink, marginBottom: 10 }}>
          Where do you feel it?
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: inkSub, maxWidth: 560, margin: '0 auto' }}>
          Feelings aren't only in your head. Tap a point on the body to see what that
          sensation is trying to tell you — the same map you'll use inside the course journal.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 340px) minmax(0, 1fr)',
          gap: 'clamp(24px, 5vw, 64px)',
          alignItems: 'center',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {/* ── Body diagram ── */}
        <div style={{ position: 'relative', margin: '0 auto', width: '100%', maxWidth: 340 }}>
          <svg viewBox="0 0 400 480" style={{ width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label="Body map of where emotions are felt">
            <defs>
              {ZONES.map((z) => (
                <radialGradient key={z.id} id={`bm-${z.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={z.color} stopOpacity="0.95" />
                  <stop offset="70%" stopColor={z.color} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={z.color} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            {/* silhouette */}
            <path d={BODY_PATH} fill={bodyFill} stroke={bodyStroke} strokeWidth={1.5} fillRule="evenodd" />

            {/* zones */}
            {ZONES.map((z) => {
              const isActive = selected === z.id;
              return (
                <g
                  key={z.id}
                  onClick={() => setSelected(isActive ? null : z.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* soft glow */}
                  <motion.circle
                    cx={z.cx}
                    cy={z.cy}
                    r={z.r + 6}
                    fill={`url(#bm-${z.id})`}
                    animate={{ opacity: isActive ? 0.95 : [0.4, 0.62, 0.4], scale: isActive ? 1.12 : 1 }}
                    transition={{ duration: isActive ? 0.4 : 3.2, repeat: isActive ? 0 : Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: `${z.cx}px ${z.cy}px` }}
                  />
                  {/* core dot */}
                  <circle
                    cx={z.cx}
                    cy={z.cy}
                    r={isActive ? 9 : 6}
                    fill={z.color}
                    stroke={isDark ? 'rgba(255,255,255,0.85)' : '#FFFFFF'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    style={{ transition: 'r 0.25s ease, stroke-width 0.25s ease' }}
                  />
                </g>
              );
            })}
          </svg>

          {!selected && (
            <p style={{ fontFamily: SANS, fontSize: 12, color: inkSub, textAlign: 'center', marginTop: 10, opacity: 0.8 }}>
              Tap a glowing point
            </p>
          )}
        </div>

        {/* ── Insight panel ── */}
        <div style={{ minHeight: 220, display: 'flex', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: '100%',
                  background: isDark ? 'rgba(74,50,96,0.18)' : 'rgba(74,50,96,0.06)',
                  border: `1px solid ${isDark ? 'rgba(196,145,58,0.28)' : 'rgba(74,50,96,0.2)'}`,
                  borderRadius: 24,
                  padding: 'clamp(24px, 4vw, 34px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: active.color, boxShadow: `0 0 14px ${active.color}` }} />
                  <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold }}>
                    {active.label}
                  </span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: inkSub, margin: '0 0 14px', fontStyle: 'italic' }}>
                  {active.description}
                </p>
                <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(20px, 2.4vw, 26px)', fontWeight: 400, color: ink, margin: '0 0 12px', lineHeight: 1.3 }}>
                  {active.insight}
                </h3>
                <div
                  style={{
                    borderLeft: `2px solid ${gold}`,
                    paddingLeft: 16,
                    marginTop: 8,
                  }}
                >
                  <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, margin: '0 0 6px' }}>
                    Try this
                  </p>
                  <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: inkSub, margin: 0 }}>
                    {active.helps}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%' }}
              >
                <p style={{ fontFamily: SERIF, fontSize: 'clamp(20px, 2.6vw, 28px)', fontWeight: 400, color: ink, lineHeight: 1.4, margin: '0 0 14px' }}>
                  Anxiety isn't only a thought.
                </p>
                <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.7, color: inkSub, margin: 0 }}>
                  It's a clenched jaw, a tight chest, a knot in the stomach. When you learn to
                  read those sensations, feelings stop being overwhelming — they become
                  information you can work with. That's the heart of this course.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
