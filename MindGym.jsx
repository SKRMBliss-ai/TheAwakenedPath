import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  ═══════════════════════════════════════════════════════════════
  MIND GYM — Conscious Emotional Processing
  ═══════════════════════════════════════════════════════════════
  Tabs:
    • Check-in  — 9-step emotional check-in (matrix-driven)
    • Journal   — Emotional history timeline
    • Practice  — Weekly practice log + leaderboard

  EMOTION ENGINE: Energy (1-5) × Pleasantness (1-5) →
    7 core emotions from the Granularity Matrix
    + Social, Self-Evaluation, Future-Oriented, Reflective sidebars
  ═══════════════════════════════════════════════════════════════
*/

// ─── COLOUR PALETTE ───────────────────────────────────────────
const T = {
  bg: "radial-gradient(ellipse at 50% 12%, #1a0a2e 0%, #0d0014 55%, #050008 100%)",
  text: "#F4E3DA",
  sub: "rgba(244,227,218,0.45)",
  faint: "rgba(244,227,218,0.2)",
  rose: "#C65F9D",
  teal: "#ABCEC9",
  gold: "#E8B86D",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
};

// ─── SHARED STYLES ───────────────────────────────────────────
const btnBase = {
  width: "100%", minHeight: 60, borderRadius: 18, cursor: "pointer",
  textAlign: "left", padding: "16px 20px", transition: "all 0.25s ease",
  fontFamily: "Georgia, serif",
};
const primaryBtn = {
  minHeight: 56, borderRadius: 16, padding: "16px 36px", cursor: "pointer",
  background: "rgba(198,95,157,0.14)", border: "1.5px solid rgba(198,95,157,0.4)",
  color: "#e8a7cc", fontSize: 16, fontWeight: 600, fontFamily: "Georgia, serif",
  transition: "all 0.3s ease",
};
const ghostBtn = {
  minHeight: 48, borderRadius: 14, padding: "12px 24px", cursor: "pointer",
  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
  color: T.faint, fontSize: 14, fontFamily: "Georgia, serif",
};
const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
};
const H = ({ children, sub }) => (
  <div style={{ textAlign: "center", marginBottom: 26 }}>
    <h2 style={{ fontSize: 24, fontWeight: 300, color: T.text, lineHeight: 1.4, fontFamily: "Georgia, serif" }}>{children}</h2>
    {sub && <p style={{ fontSize: 14, color: T.sub, fontStyle: "italic", marginTop: 8 }}>{sub}</p>}
  </div>
);

// ─── EMOTIONAL GRANULARITY MATRIX [energy-1][pleasantness-1] ──
// 5 energy levels × 5 pleasantness levels = 25 cells, 7 emotions each = 175 core entries
const MATRIX = [
  [ // Energy 1 — Very Low
    ["Empty","Numb","Hopeless","Worthless","Depressed","Defeated","Miserable"],
    ["Bored","Tired","Drained","Unmotivated","Weary","Discouraged","Lonely"],
    ["Quiet","Still","Detached","Reflective","Calm","Patient","Reserved"],
    ["Rested","Comfortable","Content","Safe","Relaxed","Satisfied","Grounded"],
    ["Peaceful","Serene","Tranquil","Blissful","Deeply Fulfilled","At Ease","Whole"],
  ],
  [ // Energy 2 — Low
    ["Sad","Grieving","Ashamed","Guilty","Regretful","Rejected","Heartbroken"],
    ["Disappointed","Hesitant","Uncertain","Vulnerable","Insecure","Self-conscious","Doubtful"],
    ["Thoughtful","Curious","Open","Observant","Receptive","Attentive","Mindful"],
    ["Hopeful","Appreciative","Encouraged","Accepted","Supported","Trusting","Secure"],
    ["Grateful","Loved","Cherished","Connected","Compassionate","Warm","Affectionate"],
  ],
  [ // Energy 3 — Moderate
    ["Frustrated","Irritated","Resentful","Jealous","Envious","Offended","Bitter"],
    ["Concerned","Uneasy","Worried","Apprehensive","Restless","Skeptical","Cautious"],
    ["Interested","Engaged","Alert","Focused","Balanced","Flexible","Centered"],
    ["Motivated","Confident","Determined","Optimistic","Encouraged","Curious","Productive"],
    ["Inspired","Proud","Joyful","Delighted","Thankful","Amazed","Hopeful"],
  ],
  [ // Energy 4 — High
    ["Angry","Furious","Outraged","Hostile","Panicked","Enraged","Desperate"],
    ["Alarmed","Startled","Anxious","Agitated","Stressed","Tense","Overwhelmed"],
    ["Energized","Active","Driven","Ready","Competitive","Determined","Assertive"],
    ["Excited","Passionate","Adventurous","Courageous","Inspired","Creative","Empowered"],
    ["Enthusiastic","Elated","Thrilled","Euphoric","Ecstatic","Exuberant","Jubilant"],
  ],
  [ // Energy 5 — Very High
    ["Terror","Horror","Rage","Hysterical","Despair","Devastated","Petrified"],
    ["Shocked","Frenzied","Chaotic","Overstimulated","Pressured","Impulsive","Unsettled"],
    ["Hyper-alert","Intensely Focused","Fully Engaged","Laser-focused","Alert","Activated","Dynamic"],
    ["Triumphant","Victorious","Fearless","Invincible","Empowered","Bold","Courageous"],
    ["Transcendent","Awestruck","Ecstatic","Radiant","Blissful","Exalted","Overflowing Joy"],
  ],
];

// ─── SUPPLEMENTARY EMOTIONS (4 categories, 120+ total) ────────
const SUPPLEMENTARY = {
  social: {
    label: "Social & Belonging",
    color: "#7B9EE0",
    belonging: ["Accepted","Included","Connected","Cherished","Charming","Friendly","Belonging","Valued","Trusted","Appreciated","Respected","Admired"],
    rejection: ["Ignored","Excluded","Abandoned","Betrayed","Humiliated","Ridiculed","Misunderstood","Invalidated","Isolated","Dismissed","Unwanted","Ostracized"],
  },
  selfEval: {
    label: "Self-Evaluation",
    color: "#E08B7B",
    positive: ["Confident","Proud","Worthy","Authentic","Capable","Accomplished","Resilient","Adequate","Validated","Seen","Competent"],
    negative: ["Inadequate","Embarrassed","Ashamed","Inferior","Self-critical","Powerless","Helpless","Fraudulent","Exposed"],
  },
  future: {
    label: "Future-Oriented",
    color: "#7BE0B0",
    positive: ["Hopeful","Optimistic","Excited","Anticipatory","Ambitious","Visionary","Determined","Ready","Opportunity-minded"],
    negative: ["Dread","Fearful","Pessimistic","Apprehensive","Panicked","Foreboding","Resigned","Doubtful","Hesitant"],
  },
  reflective: {
    label: "Reflective",
    color: "#C4A8E0",
    words: ["Nostalgic","Contemplative","Wondering","Conflicted","Ambivalent","Accepting","Forgiving","Wistful","Pensive","Philosophical","Regretful","Appreciative","Bittersweet","Longing","Reminiscent"],
  },
};

// ─── NEIGHBOUR WORD FUZZY MATCHING ───────────────────────────
// Words from adjacent matrix cells — because self-rated energy/pleasantness is fuzzy
function neighborWords(e, p, exclude) {
  const cells = [];
  if (e > 1) cells.push(MATRIX[e - 2][p - 1]);
  if (e < 5) cells.push(MATRIX[e][p - 1]);
  if (p > 1) cells.push(MATRIX[e - 1][p - 2]);
  if (p < 5) cells.push(MATRIX[e - 1][p]);
  const out = [];
  for (const c of cells) for (const w of c)
    if (!exclude.has(w) && !out.includes(w)) out.push(w);
  return out.slice(0, 8);
}

// ─── LOOKUP DATA ──────────────────────────────────────────────
const ENERGY = [
  { label: "Very Low", dot: "#64B5F6", desc: "Barely any fuel" },
  { label: "Low",      dot: "#81C784", desc: "Quiet, slow" },
  { label: "Medium",   dot: "#FFD54F", desc: "Steady" },
  { label: "High",     dot: "#FFB74D", desc: "Charged up" },
  { label: "Very High",dot: "#E57373", desc: "Intense, surging" },
];
const PLEASANT = [
  { label: "Very Unpleasant", color: "#E57373" },
  { label: "Unpleasant",      color: "#FFB74D" },
  { label: "Neutral",         color: "#B0BEC5" },
  { label: "Pleasant",        color: "#81C784" },
  { label: "Very Pleasant",   color: "#4DB6AC" },
];
const BODY_ZONES = [
  { id: "head",      label: "Head",              x: 100, y: 30,  side: "right" },
  { id: "throat",    label: "Throat & Jaw",      x: 100, y: 72,  side: "left"  },
  { id: "shoulders", label: "Shoulders & Neck",  x: 100, y: 104, side: "right" },
  { id: "chest",     label: "Chest & Heart",     x: 100, y: 142, side: "left"  },
  { id: "stomach",   label: "Stomach & Belly",   x: 100, y: 196, side: "right" },
  { id: "whole",     label: "Whole Body",        x: 100, y: 330, side: "left"  },
];
const SENSATIONS = ["Tight","Heavy","Warm","Cold","Pressure","Tingling","Burning","Hollow","Buzzing","Numb","Fluttering","Relaxed"];
const ACTIONS = ["Rest","Drink water","Take a walk","Call someone","Journal","Meditate","Forgive","Do nothing","Continue mindfully"];

// ─── COACHING ─────────────────────────────────────────────────
function getCoaching(e, p) {
  if (p <= 2 && e >= 4) return "There's a lot of energy moving through you right now. You don't need to act on it yet. The pause you just took — that was the practice. The heat will pass through if you let it.";
  if (p <= 2 && e <= 2) return "This heaviness is asking for gentleness, not fixing. You noticed it, you named it, you stayed with it. That is enough for now. Be soft with yourself today.";
  if (p <= 2) return "Something is creating friction inside you. You've seen it clearly now — and what is seen clearly loses some of its grip. You don't have to resolve it today.";
  if (p === 3) return "You met this moment without needing it to be different. That neutrality is not emptiness — it's spaciousness. A quiet kind of freedom.";
  return "Let this feeling register fully. Don't rush past it. Pleasant states deepen when they're witnessed — you're literally training your nervous system to know this is available.";
}

// ─── BREATHING CIRCLE ────────────────────────────────────────
function BreathingCircle({ size = 160, active = true }) {
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <motion.div
        animate={active ? { scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3] } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(171,206,201,0.3)" }}
      />
      <motion.div
        animate={active ? { scale: [1, 1.18, 1] } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", inset: size * 0.12, borderRadius: "50%", background: "rgba(171,206,201,0.05)", border: "1px solid rgba(171,206,201,0.15)" }}
      />
      <motion.div
        animate={active ? { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", inset: size * 0.32, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,240,255,0.35) 0%, rgba(171,206,201,0.12) 60%, transparent 100%)", boxShadow: "0 0 40px rgba(0,240,255,0.15)" }}
      />
    </div>
  );
}

// ─── STEP 1: PAUSE ───────────────────────────────────────────
function PauseStep({ onNext }) {
  return (
    <motion.div {...fade} style={{ textAlign: "center", paddingTop: 40 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "rgba(171,206,201,0.35)", marginBottom: 40 }}>MIND GYM</p>
      <BreathingCircle size={180} />
      <p style={{ fontSize: 22, fontWeight: 300, color: T.text, marginTop: 44, fontFamily: "Georgia, serif" }}>Take one slow breath.</p>
      <p style={{ fontSize: 14, color: T.sub, fontStyle: "italic", marginTop: 10 }}>Nothing to fix. Just arrive.</p>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onNext} style={{ ...primaryBtn, marginTop: 44 }}>
        Begin Check-in
      </motion.button>
    </motion.div>
  );
}

// ─── STEP 2: ENERGY ──────────────────────────────────────────
function EnergyStep({ value, onSelect }) {
  return (
    <motion.div {...fade}>
      <H sub="Not good or bad — just how much fuel is in the tank">How is your energy right now?</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ENERGY.map((e, i) => {
          const sel = value === i + 1;
          return (
            <motion.button key={e.label} whileTap={{ scale: 0.98 }} onClick={() => onSelect(i + 1)}
              style={{ ...btnBase, display: "flex", alignItems: "center", gap: 16, background: sel ? e.dot + "14" : T.card, border: `1.5px solid ${sel ? e.dot + "55" : T.border}` }}>
              <span style={{ width: 16, height: 16, borderRadius: "50%", background: e.dot, boxShadow: sel ? `0 0 12px ${e.dot}70` : "none", flexShrink: 0, transition: "box-shadow 0.3s" }} />
              <span style={{ flex: 1 }}>
                <span style={{ fontSize: 17, color: sel ? T.text : "rgba(244,227,218,0.7)", display: "block" }}>{e.label}</span>
                <span style={{ fontSize: 12, color: T.faint }}>{e.desc}</span>
              </span>
              {sel && <span style={{ color: e.dot, fontSize: 18 }}>✓</span>}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── STEP 3: PLEASANTNESS ────────────────────────────────────
function PleasantStep({ value, onSelect }) {
  return (
    <motion.div {...fade}>
      <H sub="Trust your first instinct">How does this experience feel?</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PLEASANT.map((p, i) => {
          const sel = value === i + 1;
          return (
            <motion.button key={p.label} whileTap={{ scale: 0.98 }} onClick={() => onSelect(i + 1)}
              style={{ ...btnBase, display: "flex", alignItems: "center", gap: 16, background: sel ? p.color + "12" : T.card, border: `1.5px solid ${sel ? p.color + "50" : T.border}` }}>
              <span style={{ width: 34, height: 8, borderRadius: 4, flexShrink: 0, background: `linear-gradient(90deg, ${p.color}, ${p.color}70)` }} />
              <span style={{ fontSize: 17, flex: 1, color: sel ? T.text : "rgba(244,227,218,0.7)" }}>{p.label}</span>
              {sel && <span style={{ color: p.color, fontSize: 18 }}>✓</span>}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── STEP 4: BODY MAP ────────────────────────────────────────
function BodyStep({ zones, sensations, onToggleZone, onToggleSensation, onNext }) {
  const anySelected = zones.length > 0;
  const whole = zones.includes("whole");
  return (
    <motion.div {...fade}>
      <H sub="Tap anywhere you notice something — or nothing at all">Where do you feel it in your body?</H>
      <div style={{ position: "relative", maxWidth: 320, margin: "0 auto" }}>
        <svg viewBox="0 0 200 400" style={{ width: "100%", display: "block" }}>
          <g fill={whole ? "rgba(198,95,157,0.08)" : "rgba(244,227,218,0.045)"}
             stroke={whole ? "rgba(198,95,157,0.4)" : "rgba(244,227,218,0.1)"}
             strokeWidth="1" style={{ transition: "all 0.4s ease" }}>
            <ellipse cx="100" cy="38" rx="24" ry="28" />
            <path d="M78 68 Q100 62 122 68 L130 100 Q136 104 138 118 L142 190 Q136 196 130 194 L127 150 L128 235 Q118 248 100 248 Q82 248 72 235 L73 150 L70 194 Q64 196 58 190 L62 118 Q64 104 70 100 Z" />
            <path d="M88 248 L84 330 Q84 350 88 368 L98 368 L98 250 Z" />
            <path d="M112 248 L116 330 Q116 350 112 368 L102 368 L102 250 Z" />
          </g>
          {BODY_ZONES.map((z) => {
            const sel = zones.includes(z.id);
            const labelX = z.side === "left" ? z.x - 58 : z.x + 58;
            return (
              <g key={z.id} onClick={() => onToggleZone(z.id)} style={{ cursor: "pointer" }}>
                <line x1={z.x} y1={z.y} x2={labelX + (z.side === "left" ? 34 : -34)} y2={z.y}
                  stroke={sel ? "rgba(198,95,157,0.4)" : "rgba(244,227,218,0.08)"} strokeWidth="1" />
                <circle cx={z.x} cy={z.y} r="22" fill="transparent" />
                <motion.circle cx={z.x} cy={z.y} r={sel ? 9 : 6}
                  fill={sel ? "#C65F9D" : "rgba(244,227,218,0.18)"}
                  animate={sel ? { opacity: [1, 0.6, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ filter: sel ? "drop-shadow(0 0 6px rgba(198,95,157,0.6))" : "none" }} />
                <text x={labelX} y={z.y + 4} textAnchor="middle"
                  fill={sel ? "#e8a7cc" : "rgba(244,227,218,0.35)"}
                  fontSize="10.5" fontFamily="Georgia, serif">{z.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <AnimatePresence>
        {anySelected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 18 }}>
            <p style={{ fontSize: 14, color: T.sub, textAlign: "center", fontStyle: "italic", marginBottom: 12 }}>What does it feel like?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {SENSATIONS.map((s) => {
                const sel = sensations.includes(s);
                return (
                  <motion.button key={s} whileTap={{ scale: 0.94 }} onClick={() => onToggleSensation(s)}
                    style={{ padding: "11px 18px", minHeight: 44, borderRadius: 14, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif", background: sel ? "rgba(171,206,201,0.12)" : T.card, border: `1.5px solid ${sel ? "rgba(171,206,201,0.4)" : T.border}`, color: sel ? T.teal : "rgba(244,227,218,0.5)", transition: "all 0.2s" }}
                  >{s}</motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!anySelected && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={onNext} style={ghostBtn}>Nothing noticeable → skip</button>
        </div>
      )}
    </motion.div>
  );
}

// ─── STEP 5: EMOTION (MATRIX + NEIGHBOURS + 4 SUPPLEMENTARY) ──
function EmotionStep({ energy, pleasantness, value, custom, onSelect, onCustom, recentEmotions = [] }) {
  const cell = MATRIX[energy - 1][pleasantness - 1];
  const color = PLEASANT[pleasantness - 1].color;
  const [showCustom, setShowCustom] = useState(false);
  const [openSupp, setOpenSupp] = useState(null);
  const [showNeighbors, setShowNeighbors] = useState(false);

  const suppKeys = ["social", "selfEval", "future", "reflective"];
  const getSuppWords = (key) => {
    const s = SUPPLEMENTARY[key];
    if (key === "reflective") return s.words;
    return pleasantness >= 3 ? (s.positive ?? s.belonging) : (s.negative ?? s.rejection);
  };

  // Recent words (recognition builds granularity) — from PracticeCircle
  const recentUnique = [...new Set(recentEmotions)].filter((w) => !cell.includes(w)).slice(0, 3);
  // Neighbor cells (energy ±1, pleasantness ±1) — fuzzy matching from PracticeCircle
  const shownSet = new Set([...cell, ...recentUnique]);
  const nearby = neighborWords(energy, pleasantness, shownSet);

  const GroupLabel = ({ children }) => (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: color + "70",
      textAlign: "center", margin: "14px 0 8px" }}>{children}</p>
  );

  const Chip = ({ emo, col, big }) => {
    const sel = value === emo;
    return (
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => onSelect(emo)}
        style={{ padding: big ? "15px 24px" : "11px 18px", minHeight: big ? 54 : 46,
          borderRadius: big ? 16 : 14, cursor: "pointer", fontSize: big ? 17 : 14,
          fontFamily: "Georgia, serif",
          background: sel ? (col || color) + "16" : T.card,
          border: `1.5px solid ${sel ? (col || color) + "60" : T.border}`,
          color: sel ? (col || color) : "rgba(244,227,218,0.65)",
          fontWeight: sel ? 600 : 400,
          boxShadow: sel && big ? `0 0 16px ${color}20` : "none",
          transition: "all 0.25s" }}>
        {emo}
      </motion.button>
    );
  };

  return (
    <motion.div {...fade}>
      <H sub="Based on your energy and how it feels">Could this be...</H>

      {/* Recent words — words you've used before */}
      {recentUnique.length > 0 && (
        <>
          <GroupLabel>WORDS YOU'VE USED</GroupLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 10 }}>
            {recentUnique.map((emo) => <Chip key={emo} emo={emo} />)}
          </div>
        </>
      )}

      {/* Core matrix emotions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 14 }}>
        {cell.map((emo, i) => (
          <motion.button key={emo}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileTap={{ scale: 0.95 }} onClick={() => onSelect(emo)}
            style={{ padding: "15px 24px", minHeight: 54, borderRadius: 16, cursor: "pointer", fontSize: 17,
              fontFamily: "Georgia, serif",
              background: value === emo ? color + "16" : T.card,
              border: `1.5px solid ${value === emo ? color + "60" : T.border}`,
              color: value === emo ? color : "rgba(244,227,218,0.65)",
              fontWeight: value === emo ? 600 : 400,
              boxShadow: value === emo ? `0 0 16px ${color}20` : "none", transition: "all 0.25s" }}>
            {emo}
          </motion.button>
        ))}
      </div>

      {/* Supplementary category pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 10 }}>
        {suppKeys.map((key) => {
          const s = SUPPLEMENTARY[key];
          const open = openSupp === key;
          return (
            <motion.button key={key} whileTap={{ scale: 0.95 }}
              onClick={() => setOpenSupp(open ? null : key)}
              style={{ padding: "10px 18px", minHeight: 42, borderRadius: 20, cursor: "pointer", fontSize: 13,
                fontFamily: "Georgia, serif",
                background: open ? s.color + "18" : T.card,
                border: `1.5px solid ${open ? s.color + "55" : T.border}`,
                color: open ? s.color : T.faint, transition: "all 0.2s" }}>
              {s.label} {open ? "▲" : "▼"}
            </motion.button>
          );
        })}
      </div>

      {/* Expanded supplementary words */}
      <AnimatePresence>
        {openSupp && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingTop: 4 }}>
              {getSuppWords(openSupp).map((emo) => (
                <Chip key={emo} emo={emo} col={SUPPLEMENTARY[openSupp].color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neighbor feelings — fuzzy adjacent cells */}
      <AnimatePresence>
        {showNeighbors && nearby.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 10 }}>
            <GroupLabel>NEARBY FEELINGS</GroupLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {nearby.map((emo) => <Chip key={emo} emo={emo} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options row */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {!showNeighbors && nearby.length > 0 && (
          <button onClick={() => setShowNeighbors(true)} style={ghostBtn}>Nearby feelings</button>
        )}
        {!showCustom && (
          <button onClick={() => setShowCustom(true)} style={ghostBtn}>My own word</button>
        )}
      </div>

      {showCustom && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <input autoFocus value={custom} onChange={(e) => onCustom(e.target.value)}
            placeholder="Name it yourself..."
            style={{ width: "100%", maxWidth: 300, minHeight: 54, background: "rgba(255,255,255,0.04)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", outline: "none",
              padding: "14px 20px", fontSize: 16, color: T.text, fontFamily: "Georgia, serif", textAlign: "center" }} />
          {custom.trim() && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => onSelect(custom.trim())}
              style={{ ...primaryBtn, marginTop: 12 }}>
              Use "{custom.trim()}"
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── STEP 6: THOUGHT ─────────────────────────────────────────
function ThoughtStep({ value, onChange }) {
  return (
    <motion.div {...fade}>
      <H sub="Optional — sometimes there's no story, just sensation">What thought or story is your mind creating?</H>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="My mind is telling me that..."
        rows={4}
        style={{ width: "100%", minHeight: 130, borderRadius: 18, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.09)", outline: "none", padding: "18px 20px", fontSize: 16, lineHeight: 1.7, color: T.text, fontFamily: "Georgia, serif", resize: "none" }}
      />
    </motion.div>
  );
}

// ─── STEP 7: OBSERVE ─────────────────────────────────────────
function ObserveStep({ onDone }) {
  const [seconds, setSeconds] = useState(30);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const phaseTexts = ["Notice the sensation.", "Allow it to be here.", "You don't need to change it."];
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => { const n = e + 1; if (n >= seconds) setRunning(false); return n; }), 1000);
    return () => clearInterval(t);
  }, [running, seconds]);

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 3), 7000);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, seconds - elapsed);
  const done = elapsed >= seconds;

  return (
    <motion.div {...fade} style={{ textAlign: "center" }}>
      <H>Simply observe</H>
      <BreathingCircle size={170} active={!done} />
      <AnimatePresence mode="wait">
        <motion.p key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
          style={{ fontSize: 17, color: "rgba(171,206,201,0.6)", fontStyle: "italic", marginTop: 32, fontFamily: "Georgia, serif", minHeight: 26 }}>
          {done ? "Well held." : phaseTexts[phase]}
        </motion.p>
      </AnimatePresence>
      <p style={{ fontSize: 30, fontWeight: 300, color: done ? T.teal : T.sub, marginTop: 16, fontFamily: "Georgia, serif" }}>
        {done ? "✓" : `${remaining}s`}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
        {!done && <button onClick={() => setSeconds((s) => s + 30)} style={ghostBtn}>+30s</button>}
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => onDone(elapsed)} style={done ? primaryBtn : ghostBtn}>
          {done ? "Continue" : "Skip"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── STEP 8: RELEASE ─────────────────────────────────────────
function ReleaseStep({ value, onSelect }) {
  const options = [
    { v: "yes",      label: "Yes",       sub: "Something softened",           color: "#4DB6AC" },
    { v: "somewhat", label: "Somewhat",  sub: "A little space opened",        color: "#FFD54F" },
    { v: "not-yet",  label: "Not yet",   sub: "And that's completely okay",   color: "#90CAF9" },
  ];
  return (
    <motion.div {...fade}>
      <H sub="Can you allow it without resisting it?">Can you soften around the sensation?</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o) => {
          const sel = value === o.v;
          return (
            <motion.button key={o.v} whileTap={{ scale: 0.98 }} onClick={() => onSelect(o.v)}
              style={{ ...btnBase, background: sel ? o.color + "12" : T.card, border: `1.5px solid ${sel ? o.color + "50" : T.border}` }}>
              <span style={{ fontSize: 17, color: sel ? o.color : "rgba(244,227,218,0.7)", display: "block" }}>{o.label}</span>
              <span style={{ fontSize: 13, color: T.faint, fontStyle: "italic" }}>{o.sub}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── STEP 9: CONSCIOUS CHOICE ────────────────────────────────
function ChoiceStep({ value, onSelect }) {
  return (
    <motion.div {...fade}>
      <H sub="Small is powerful — pick what feels kind">What is one small conscious action?</H>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center" }}>
        {ACTIONS.map((a) => {
          const sel = value === a;
          return (
            <motion.button key={a} whileTap={{ scale: 0.95 }} onClick={() => onSelect(a)}
              style={{ padding: "13px 20px", minHeight: 50, borderRadius: 15, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif",
                background: sel ? "rgba(198,95,157,0.13)" : T.card,
                border: `1.5px solid ${sel ? "rgba(198,95,157,0.45)" : T.border}`,
                color: sel ? "#e8a7cc" : "rgba(244,227,218,0.55)", transition: "all 0.2s" }}>
              {a}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── COMPLETION SCREEN ───────────────────────────────────────
function CompletionStep({ data, checkInCount, onRestart }) {
  const coach = getCoaching(data.energyLevel, data.pleasantness);
  const emoColor = PLEASANT[data.pleasantness - 1].color;

  const Row = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: T.faint, marginBottom: 4 }}>{label}</p>
      {children}
    </div>
  );

  return (
    <motion.div {...fade}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px", background: "rgba(171,206,201,0.08)", border: "1.5px solid rgba(171,206,201,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✓</motion.div>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: T.text, fontFamily: "Georgia, serif" }}>Check-in complete</h2>
        <p style={{ fontSize: 13, color: T.faint, fontStyle: "italic", marginTop: 6 }}>
          Your {checkInCount === 1 ? "first" : `${checkInCount}th`} moment of conscious awareness
        </p>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 22px", marginBottom: 16 }}>
        <Row label="YOU WERE FEELING">
          <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 12, background: emoColor + "14", border: `1px solid ${emoColor}40`, color: emoColor, fontSize: 17, fontFamily: "Georgia, serif", fontWeight: 600 }}>{data.emotion}</span>
        </Row>
        {data.bodyLocations.length > 0 && (
          <Row label="IN YOUR BODY">
            <p style={{ fontSize: 14, color: T.sub, fontFamily: "Georgia, serif" }}>
              {data.bodyLocations.map((id) => BODY_ZONES.find((z) => z.id === id)?.label).join(", ")}
              {data.bodySensations.length > 0 && <span style={{ color: T.faint }}> — {data.bodySensations.join(", ").toLowerCase()}</span>}
            </p>
          </Row>
        )}
        {data.thought && (
          <Row label="THE STORY YOUR MIND CREATED">
            <p style={{ fontSize: 14, color: T.sub, fontStyle: "italic", fontFamily: "Georgia, serif" }}>"{data.thought}"</p>
          </Row>
        )}
        <Row label="YOUR NEXT CONSCIOUS ACT">
          <p style={{ fontSize: 15, color: "#e8a7cc", fontFamily: "Georgia, serif" }}>{data.nextAction}</p>
        </Row>
      </div>

      <div style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(171,206,201,0.04)", borderLeft: "3px solid rgba(171,206,201,0.2)", marginBottom: 24 }}>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(171,206,201,0.65)", fontStyle: "italic", fontFamily: "Georgia, serif" }}>{coach}</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onRestart} style={primaryBtn}>Done</motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2 — EMOTIONAL JOURNAL (History Timeline)
// ═══════════════════════════════════════════════════════════════

function formatRelativeTime(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 2) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function emotionColor(entry) {
  if (!entry.pleasantness) return T.teal;
  return PLEASANT[entry.pleasantness - 1]?.color ?? T.teal;
}

function energyBar(level) {
  const bars = level || 0;
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", marginRight: 2,
      background: i < bars ? ENERGY[bars - 1]?.dot ?? T.teal : "rgba(255,255,255,0.1)" }} />
  ));
}

// Mini insight card for the timeline
function EntryCard({ entry, onExpand }) {
  const col = emotionColor(entry);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onExpand(entry)}
      style={{ display: "flex", gap: 14, padding: "16px 18px", borderRadius: 18, cursor: "pointer",
        background: T.card, border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${col}80`, marginBottom: 10, alignItems: "flex-start" }}>
      {/* Emotion dot + energy */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, paddingTop: 2 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: col, boxShadow: `0 0 8px ${col}60`, display: "block" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {energyBar(entry.energyLevel)}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: col, fontFamily: "Georgia, serif" }}>{entry.emotion || "—"}</span>
          <span style={{ fontSize: 11, color: T.faint }}>{formatRelativeTime(entry.dateTime)}</span>
        </div>
        {entry.thought && (
          <p style={{ fontSize: 13, color: T.sub, fontStyle: "italic", fontFamily: "Georgia, serif", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            "{entry.thought}"
          </p>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {entry.bodyLocations?.slice(0, 2).map((id) => (
            <span key={id} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: "rgba(171,206,201,0.08)", color: T.teal, border: "1px solid rgba(171,206,201,0.15)" }}>
              {BODY_ZONES.find(z => z.id === id)?.label ?? id}
            </span>
          ))}
          {entry.nextAction && (
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: "rgba(198,95,157,0.08)", color: "#e8a7cc", border: "1px solid rgba(198,95,157,0.15)" }}>
              {entry.nextAction}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Full entry detail modal
function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  const col = emotionColor(entry);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(5,0,8,0.9)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, background: "#0e0718", border: `1px solid ${col}30`, borderRadius: "28px 28px 0 0", padding: "28px 24px 48px", maxHeight: "85vh", overflowY: "auto" }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 22, color: col, fontFamily: "Georgia, serif", fontWeight: 600 }}>{entry.emotion}</span>
          <span style={{ fontSize: 12, color: T.faint }}>{new Date(entry.dateTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, padding: "12px 16px", borderRadius: 14, background: T.card, border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 10, letterSpacing: "0.1em", color: T.faint, marginBottom: 4 }}>ENERGY</p>
            <p style={{ fontSize: 14, color: T.text }}>{ENERGY[(entry.energyLevel || 1) - 1]?.label}</p>
          </div>
          <div style={{ flex: 1, padding: "12px 16px", borderRadius: 14, background: T.card, border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 10, letterSpacing: "0.1em", color: T.faint, marginBottom: 4 }}>FEELING</p>
            <p style={{ fontSize: 14, color: col }}>{PLEASANT[(entry.pleasantness || 3) - 1]?.label}</p>
          </div>
        </div>
        {entry.thought && (
          <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${col}40`, marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: T.faint, marginBottom: 6, letterSpacing: "0.08em" }}>MIND STORY</p>
            <p style={{ fontSize: 15, color: T.sub, fontStyle: "italic", fontFamily: "Georgia, serif", lineHeight: 1.6 }}>"{entry.thought}"</p>
          </div>
        )}
        {entry.bodyLocations?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: T.faint, marginBottom: 8, letterSpacing: "0.08em" }}>BODY</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {entry.bodyLocations.map((id) => (
                <span key={id} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 10, background: "rgba(171,206,201,0.08)", color: T.teal, border: "1px solid rgba(171,206,201,0.2)" }}>
                  {BODY_ZONES.find(z => z.id === id)?.label ?? id}
                </span>
              ))}
              {entry.bodySensations?.map((s) => (
                <span key={s} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", color: T.faint, border: `1px solid ${T.border}` }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {entry.releaseLevel && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: T.faint, marginBottom: 6, letterSpacing: "0.08em" }}>RELEASE</p>
            <p style={{ fontSize: 14, color: T.text }}>{{ yes: "Something softened ✓", somewhat: "A little space opened", "not-yet": "Not yet — and that's okay" }[entry.releaseLevel] ?? entry.releaseLevel}</p>
          </div>
        )}
        {entry.nextAction && (
          <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(198,95,157,0.06)", border: "1px solid rgba(198,95,157,0.2)", marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: T.faint, marginBottom: 4, letterSpacing: "0.08em" }}>CONSCIOUS ACTION</p>
            <p style={{ fontSize: 15, color: "#e8a7cc", fontFamily: "Georgia, serif" }}>{entry.nextAction}</p>
          </div>
        )}
        <button onClick={onClose} style={{ ...ghostBtn, width: "100%" }}>Close</button>
      </motion.div>
    </motion.div>
  );
}

// Emotion frequency chart — shows top emotions as a horizontal bar chart
function EmotionFrequencyChart({ entries }) {
  if (!entries.length) return null;
  const freq = {};
  entries.forEach((e) => { if (e.emotion) freq[e.emotion] = (freq[e.emotion] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = sorted[0]?.[1] ?? 1;
  return (
    <div style={{ padding: "18px 20px", borderRadius: 18, background: T.card, border: `1px solid ${T.border}`, marginBottom: 20 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 14 }}>YOUR EMOTIONAL LANDSCAPE</p>
      {sorted.map(([emo, count]) => {
        // Find which pleasant level this emotion appeared with most
        const matchEntry = entries.find(e => e.emotion === emo);
        const col = matchEntry ? emotionColor(matchEntry) : T.teal;
        return (
          <div key={emo} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: T.sub, fontFamily: "Georgia, serif" }}>{emo}</span>
              <span style={{ fontSize: 11, color: T.faint }}>{count}×</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${col}80, ${col})` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 7-day mood sparkline
function MoodSparkline({ entries }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const dayEntries = entries.filter((e) => {
      const ed = new Date(e.dateTime);
      ed.setHours(0, 0, 0, 0);
      return ed.getTime() === d.getTime();
    });
    const avgPleasant = dayEntries.length
      ? dayEntries.reduce((s, e) => s + (e.pleasantness || 3), 0) / dayEntries.length
      : null;
    return { date: d, avgPleasant, count: dayEntries.length };
  });

  const dayLabels = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  return (
    <div style={{ padding: "18px 20px", borderRadius: 18, background: T.card, border: `1px solid ${T.border}`, marginBottom: 20 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 16 }}>7-DAY MOOD FLOW</p>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
        {days.map((day, i) => {
          const height = day.avgPleasant ? `${(day.avgPleasant / 5) * 100}%` : "8%";
          const col = day.avgPleasant ? PLEASANT[Math.round(day.avgPleasant) - 1]?.color ?? T.teal : "rgba(255,255,255,0.08)";
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                  style={{ width: "100%", borderRadius: 4, background: col, opacity: day.count ? 1 : 0.3, minHeight: 4 }}
                />
              </div>
              <span style={{ fontSize: 10, color: T.faint }}>{dayLabels[day.date.getDay()]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The full Journal tab
function JournalTab({ entries }) {
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [filter, setFilter] = useState("all"); // "all"|"difficult"|"pleasant"

  const filtered = entries.filter((e) => {
    if (filter === "difficult") return (e.pleasantness ?? 3) <= 2;
    if (filter === "pleasant")  return (e.pleasantness ?? 3) >= 4;
    return true;
  });

  // Group by date
  const grouped = {};
  filtered.forEach((e) => {
    const key = new Date(e.dateTime).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <motion.div {...fade}>
      {entries.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🌿</p>
          <p style={{ fontSize: 18, color: T.sub, fontFamily: "Georgia, serif" }}>No check-ins yet</p>
          <p style={{ fontSize: 14, color: T.faint, marginTop: 8 }}>Complete your first check-in to see your emotional journey here.</p>
        </div>
      ) : (
        <>
          <MoodSparkline entries={entries} />
          <EmotionFrequencyChart entries={entries} />

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["all", "All"], ["difficult", "Difficult"], ["pleasant", "Pleasant"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
                  background: filter === v ? "rgba(171,206,201,0.12)" : T.card,
                  border: `1px solid ${filter === v ? "rgba(171,206,201,0.4)" : T.border}`,
                  color: filter === v ? T.teal : T.faint }}>
                {l}
              </button>
            ))}
          </div>

          {Object.entries(grouped).map(([date, dayEntries]) => (
            <div key={date} style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 10 }}>{date.toUpperCase()}</p>
              {dayEntries.map((e) => <EntryCard key={e.id} entry={e} onExpand={setExpandedEntry} />)}
            </div>
          ))}
        </>
      )}

      <AnimatePresence>
        {expandedEntry && <EntryDetail entry={expandedEntry} onClose={() => setExpandedEntry(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3 — WEEKLY PRACTICE (Admin Create + Daily Log + Leaderboard)
// ═══════════════════════════════════════════════════════════════

const PRACTICE_STORAGE_KEY = "mindgym-weekly-practice";
const PRACTICE_LOGS_KEY    = "mindgym-weekly-logs";
const LEADERBOARD_KEY      = "mindgym-leaderboard";

function getDayNumber(startDateISO) {
  if (!startDateISO) return 1;
  const start = new Date(startDateISO);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.min(7, Math.max(1, Math.floor((today - start) / 86400000) + 1));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Admin panel — create / edit this week's practice
function AdminPracticeEditor({ practice, onSave }) {
  const [form, setForm] = useState({
    title: practice?.title ?? "",
    description: practice?.description ?? "",
    videoUrl: practice?.videoUrl ?? "",
    dailyInstruction: practice?.dailyInstruction ?? "",
    teacherName: practice?.teacherName ?? "",
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    const updated = {
      ...form,
      id: practice?.id ?? crypto.randomUUID?.() ?? String(Date.now()),
      startDate: practice?.startDate ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: "100%", minHeight: 48, borderRadius: 14, background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", outline: "none", padding: "12px 16px",
    fontSize: 15, color: T.text, fontFamily: "Georgia, serif", marginBottom: 12,
  };

  return (
    <motion.div {...fade}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 18 }}>⚙️</span>
        <h3 style={{ fontSize: 18, color: T.gold, fontFamily: "Georgia, serif", fontWeight: 400 }}>Admin — This Week's Practice</h3>
      </div>

      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>PRACTICE TITLE</p>
      <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. The Witness Seat" style={inputStyle} />

      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>TEACHER / SOURCE</p>
      <input value={form.teacherName} onChange={(e) => set("teacherName", e.target.value)} placeholder="e.g. Michael A. Singer" style={inputStyle} />

      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>VIDEO URL (YouTube embed or direct)</p>
      <input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/embed/..." style={inputStyle} />

      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>CONTEXT / DESCRIPTION</p>
      <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
        placeholder="What is the core teaching this week?"
        rows={3}
        style={{ ...inputStyle, minHeight: 90, resize: "none" }} />

      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>DAILY PRACTICE INSTRUCTION</p>
      <textarea value={form.dailyInstruction} onChange={(e) => set("dailyInstruction", e.target.value)}
        placeholder="What should the student do each day? Be specific and grounded."
        rows={4}
        style={{ ...inputStyle, minHeight: 110, resize: "none" }} />

      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
        style={{ ...primaryBtn, width: "100%", textAlign: "center", marginTop: 8,
          background: saved ? "rgba(75,182,172,0.15)" : "rgba(232,184,109,0.14)",
          border: `1.5px solid ${saved ? "rgba(75,182,172,0.45)" : "rgba(232,184,109,0.4)"}`,
          color: saved ? T.teal : T.gold }}>
        {saved ? "✓ Saved!" : "Publish Practice"}
      </motion.button>
    </motion.div>
  );
}

// Daily log entry form
function DailyLogForm({ practice, existingLog, onLog }) {
  const [note, setNote] = useState(existingLog?.note ?? "");
  const [reflection, setReflection] = useState(existingLog?.reflection ?? "");
  const [done, setDone] = useState(existingLog?.done ?? false);
  const [saved, setSaved] = useState(!!existingLog);
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem("mindgym-username") || ""; } catch { return ""; }
  });

  const handleSave = () => {
    if (!userName.trim()) return;
    const entry = {
      id: existingLog?.id ?? crypto.randomUUID?.() ?? String(Date.now()),
      practiceId: practice.id,
      date: todayISO(),
      userName: userName.trim(),
      done,
      note: note.trim(),
      reflection: reflection.trim(),
      savedAt: new Date().toISOString(),
    };
    // Save to leaderboard store
    try {
      const lb = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
      const existing = lb.findIndex((e) => e.userName === entry.userName && e.practiceId === practice.id);
      if (existing >= 0) lb[existing] = { ...lb[existing], ...entry };
      else lb.push(entry);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
      // Also save daily logs
      const logs = JSON.parse(localStorage.getItem(PRACTICE_LOGS_KEY) || "[]");
      const logIdx = logs.findIndex((l) => l.date === entry.date && l.userName === entry.userName && l.practiceId === practice.id);
      if (logIdx >= 0) logs[logIdx] = entry;
      else logs.push(entry);
      localStorage.setItem(PRACTICE_LOGS_KEY, JSON.stringify(logs));
      localStorage.setItem("mindgym-username", entry.userName);
    } catch {}
    onLog(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "20px 0" }}>
      {!userName && (
        <>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>YOUR NAME (for leaderboard)</p>
          <input value={userName} onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name..."
            style={{ width: "100%", minHeight: 48, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", outline: "none", padding: "12px 16px", fontSize: 15, color: T.text, fontFamily: "Georgia, serif", marginBottom: 14 }}
          />
        </>
      )}

      {/* Done toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16, background: done ? "rgba(75,182,172,0.08)" : T.card, border: `1.5px solid ${done ? "rgba(75,182,172,0.3)" : T.border}`, marginBottom: 14, cursor: "pointer" }}
        onClick={() => setDone(!done)}>
        <motion.div animate={{ scale: done ? 1.1 : 1 }} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${done ? T.teal : "rgba(255,255,255,0.2)"}`, background: done ? "rgba(75,182,172,0.2)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {done && <span style={{ color: T.teal, fontSize: 14 }}>✓</span>}
        </motion.div>
        <span style={{ fontSize: 15, color: done ? T.teal : T.sub, fontFamily: "Georgia, serif" }}>
          {done ? "I practised today" : "Tap to mark today's practice done"}
        </span>
      </div>

      {/* Quick note */}
      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>WHAT DID YOU NOTICE? (optional)</p>
      <textarea value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="One sentence is enough..."
        rows={2}
        style={{ width: "100%", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", outline: "none", padding: "12px 16px", fontSize: 15, color: T.text, fontFamily: "Georgia, serif", resize: "none", marginBottom: 12 }} />

      {/* Deeper reflection */}
      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 6 }}>DEEPER REFLECTION (optional)</p>
      <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
        placeholder="What shifted? What resisted? What was the teaching?"
        rows={3}
        style={{ width: "100%", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", outline: "none", padding: "12px 16px", fontSize: 15, color: T.text, fontFamily: "Georgia, serif", resize: "none", marginBottom: 16 }} />

      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
        style={{ ...primaryBtn, width: "100%", textAlign: "center",
          background: saved ? "rgba(75,182,172,0.15)" : "rgba(198,95,157,0.14)",
          border: `1.5px solid ${saved ? "rgba(75,182,172,0.45)" : "rgba(198,95,157,0.4)"}`,
          color: saved ? T.teal : "#e8a7cc" }}>
        {saved ? "✓ Logged!" : "Log Today's Practice"}
      </motion.button>
    </div>
  );
}

// Leaderboard — ranked by days completed, with levels and current user highlight
function Leaderboard({ practiceId, logs, currentUser = "", showPrivate = true, userPoints = 0 }) {
  const byUser = {};
  logs.filter((l) => l.practiceId === practiceId).forEach((l) => {
    if (!byUser[l.userName]) byUser[l.userName] = new Set();
    if (l.done) byUser[l.userName].add(l.date);
  });

  // Add current user if they want to be shown but have 0 days yet
  if (showPrivate && currentUser && !byUser[currentUser]) {
    byUser[currentUser] = new Set();
  }

  const ranked = Object.entries(byUser)
    .map(([name, daysSet]) => ({ name, days: daysSet.size }))
    .sort((a, b) => b.days - a.days);

  const medals = ["🥇", "🥈", "🥉"];

  if (!ranked.length) return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <p style={{ fontSize: 14, color: T.faint, fontFamily: "Georgia, serif", fontStyle: "italic" }}>No one has logged yet — be the first.</p>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: "0.12em", color: T.faint, marginBottom: 14 }}>THIS WEEK'S PRACTITIONERS</p>
      {ranked.map((r, i) => {
        const isMe = r.name === currentUser;
        // Estimate level from days × 10 pts (approximate)
        const pts = isMe ? userPoints : r.days * 10;
        const lvl = levelOf(pts);
        return (
          <motion.div key={r.name}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 16,
              background: isMe ? "rgba(198,95,157,0.07)" : i === 0 ? "rgba(232,184,109,0.06)" : T.card,
              border: `1px solid ${isMe ? "rgba(198,95,157,0.3)" : i === 0 ? "rgba(232,184,109,0.25)" : T.border}`,
              marginBottom: 8 }}>
            <span style={{ fontSize: 18, width: 26, textAlign: "center", flexShrink: 0 }}>
              {medals[i] ?? `${i + 1}`}
            </span>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{lvl.emoji}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, color: isMe ? "#e8a7cc" : i === 0 ? T.gold : T.text, fontFamily: "Georgia, serif", display: "block" }}>
                {r.name}{isMe ? " (you)" : ""}
              </span>
              <span style={{ fontSize: 11, color: T.faint }}>{lvl.name}</span>
            </span>
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              {Array.from({ length: 7 }, (_, d) => (
                <span key={d} style={{ width: 8, height: 8, borderRadius: "50%",
                  background: d < r.days ? (i === 0 ? T.gold : isMe ? "#e8a7cc" : T.teal) : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: i === 0 ? T.gold : isMe ? "#e8a7cc" : T.teal, fontWeight: 600, minWidth: 32, textAlign: "right" }}>
              {r.days}/7
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// Personal 7-day heatmap for the user
function PersonalHeatmap({ practiceId, userName, logs }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const log = logs.find((l) => l.practiceId === practiceId && l.date === iso && l.userName === userName);
    return { iso, done: log?.done ?? false, note: log?.note ?? "", day: d.toLocaleDateString("en-US", { weekday: "short" }) };
  });

  const doneCount = days.filter((d) => d.done).length;

  return (
    <div style={{ padding: "18px 20px", borderRadius: 18, background: T.card, border: `1px solid ${T.border}`, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint }}>YOUR WEEK</p>
        <span style={{ fontSize: 13, color: doneCount >= 5 ? T.teal : T.gold, fontWeight: 600 }}>{doneCount}/7 days</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {days.map((d) => (
          <div key={d.iso} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ width: "100%", paddingBottom: "100%", borderRadius: 8, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 8,
                background: d.done ? "rgba(75,182,172,0.25)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${d.done ? "rgba(75,182,172,0.4)" : "rgba(255,255,255,0.07)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                {d.done ? "✓" : ""}
              </div>
            </div>
            <span style={{ fontSize: 9, color: T.faint }}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LEVELS SYSTEM (from PracticeCircle) ─────────────────────
const LEVELS = [
  { min: 600, emoji: "✨", name: "Awakened" },
  { min: 300, emoji: "🕯️", name: "Presence" },
  { min: 150, emoji: "🕊️", name: "Witness" },
  { min: 50,  emoji: "👁️", name: "Noticer" },
  { min: 0,   emoji: "🌱", name: "Seedling" },
];
const levelOf = (pts) => LEVELS.find((l) => pts >= l.min) ?? LEVELS[LEVELS.length - 1];

// ─── PRACTICE BUILDER ─────────────────────────────────────────
// Create a new practice from this week's video (from PracticeCircle)
function PracticeBuilder({ existingPractice, onSave, onBack }) {
  const [emoji, setEmoji] = useState(existingPractice?.emoji ?? "🌱");
  const [title, setTitle] = useState(existingPractice?.title ?? "");
  const [teaching, setTeaching] = useState(existingPractice?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(existingPractice?.videoUrl ?? "");
  const [q1, setQ1] = useState(existingPractice?.prompts?.[0]?.question ?? "");
  const [q2, setQ2] = useState(existingPractice?.prompts?.[1]?.question ?? "");
  const [instruction, setInstruction] = useState(existingPractice?.dailyInstruction ?? "");

  const inputStyle = {
    width: "100%", minHeight: 48, borderRadius: 14, background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", outline: "none", padding: "12px 16px",
    fontSize: 15, color: T.text, fontFamily: "Georgia, serif", marginBottom: 12,
  };
  const Label = ({ children }) => (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: T.faint, margin: "14px 0 6px" }}>{children}</p>
  );

  const canSave = title.trim() && q1.trim();

  return (
    <motion.div {...fade}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <button onClick={onBack} style={{ ...ghostBtn, minHeight: 44, padding: "10px 18px" }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 300, color: T.text, fontFamily: "Georgia, serif" }}>
          {existingPractice ? "Edit practice" : "New weekly practice"}
        </h2>
      </div>

      <Label>SYMBOL</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
        {["🌱","⚓","🔄","🕯️","🌊","🌸","🔥","🌙","☀️","🧘","👁️","✨"].map((e) => (
          <button key={e} onClick={() => setEmoji(e)}
            style={{ width: 52, height: 52, borderRadius: 14, fontSize: 24, cursor: "pointer",
              background: emoji === e ? "rgba(198,95,157,0.15)" : T.card,
              border: `1.5px solid ${emoji === e ? "rgba(198,95,157,0.5)" : T.border}` }}>
            {e}
          </button>
        ))}
      </div>

      <Label>PRACTICE NAME</Label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Witness Seat" style={inputStyle} />

      <Label>VIDEO URL (YouTube embed)</Label>
      <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/embed/..." style={inputStyle} />

      <Label>CORE TEACHING (one sentence)</Label>
      <textarea value={teaching} onChange={(e) => setTeaching(e.target.value)} rows={2}
        placeholder="The essence in one sentence..."
        style={{ ...inputStyle, minHeight: 78, resize: "none" }} />

      <Label>DAILY PRACTICE INSTRUCTION</Label>
      <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={3}
        placeholder="What should practitioners do each day?"
        style={{ ...inputStyle, minHeight: 96, resize: "none" }} />

      <Label>DAILY REFLECTION QUESTION 1</Label>
      <input value={q1} onChange={(e) => setQ1(e.target.value)} placeholder="What will you ask each day?" style={inputStyle} />

      <Label>DAILY REFLECTION QUESTION 2 (optional)</Label>
      <input value={q2} onChange={(e) => setQ2(e.target.value)} placeholder="A deeper follow-up..." style={inputStyle} />

      <motion.button whileTap={{ scale: 0.97 }} disabled={!canSave}
        onClick={() => {
          const prompts = [{ id: "p1", question: q1.trim() }];
          if (q2.trim()) prompts.push({ id: "p2", question: q2.trim() });
          onSave({
            id: existingPractice?.id ?? crypto.randomUUID?.() ?? String(Date.now()),
            emoji, title: title.trim(), description: teaching.trim(),
            videoUrl: videoUrl.trim(), dailyInstruction: instruction.trim(),
            prompts, startDate: existingPractice?.startDate ?? new Date().toISOString(),
            createdAt: Date.now(),
          });
        }}
        style={{ ...primaryBtn, width: "100%", textAlign: "center", marginTop: 16, opacity: canSave ? 1 : 0.4 }}>
        Save &amp; publish
      </motion.button>
    </motion.div>
  );
}

// ─── ARCHIVE ──────────────────────────────────────────────────
// Browse all past weekly practices (from PracticeCircle)
function PracticeArchive({ practices, activePracticeId, logs, onOpen, onBack }) {
  const sorted = [...practices].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const countFor = (id) => logs.filter((l) => l.practiceId === id && l.done).length;

  return (
    <motion.div {...fade}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button onClick={onBack} style={{ ...ghostBtn, minHeight: 44, padding: "10px 18px" }}>←</button>
        <h2 style={{ fontSize: 22, fontWeight: 300, color: T.text, fontFamily: "Georgia, serif" }}>Past practices</h2>
      </div>
      <p style={{ fontSize: 13, color: T.faint, fontStyle: "italic", marginBottom: 20 }}>
        Every week stays here. Revisit any time.
      </p>

      {sorted.length === 0 && (
        <p style={{ textAlign: "center", color: T.faint, fontStyle: "italic" }}>No practices yet.</p>
      )}

      {sorted.map((p, i) => {
        const active = p.id === activePracticeId;
        const doneCount = countFor(p.id);
        return (
          <motion.button key={p.id} whileTap={{ scale: 0.98 }} onClick={() => onOpen(p.id)}
            style={{ ...btnBase, display: "flex", alignItems: "center", gap: 14, marginBottom: 10,
              background: active ? "rgba(198,95,157,0.1)" : T.card,
              border: `1.5px solid ${active ? "rgba(198,95,157,0.4)" : T.border}` }}>
            <span style={{ fontSize: 30, flexShrink: 0 }}>{p.emoji ?? "📿"}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, color: T.text, fontFamily: "Georgia, serif" }}>{p.title}</span>
                {i === 0 && !active && (
                  <span style={{ fontSize: 10, color: T.teal, border: "1px solid rgba(171,206,201,0.3)", borderRadius: 6, padding: "1px 7px" }}>NEWEST</span>
                )}
                {active && (
                  <span style={{ fontSize: 10, color: "#e8a7cc", border: "1px solid rgba(198,95,157,0.35)", borderRadius: 6, padding: "1px 7px" }}>THIS WEEK</span>
                )}
              </span>
              <span style={{ fontSize: 12, color: T.faint, fontStyle: "italic", display: "block", marginTop: 3 }}>
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Custom"}
                {doneCount > 0 ? ` · ${doneCount} days logged` : ""}
              </span>
            </span>
            <span style={{ color: T.faint, fontSize: 16 }}>→</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// ─── WEEKLY PRACTICE TAB ─────────────────────────────────────
function WeeklyPracticeTab({ isAdmin }) {
  const [practices, setPractices] = useState(() => {
    try {
      const all = JSON.parse(localStorage.getItem("mindgym-all-practices") || "null");
      const single = JSON.parse(localStorage.getItem(PRACTICE_STORAGE_KEY) || "null");
      if (all) return all;
      if (single) return [single];
      return [];
    } catch { return []; }
  });
  const [activePracticeId, setActivePracticeId] = useState(() => {
    try { return localStorage.getItem("mindgym-active-practice-id") || null; } catch { return null; }
  });
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PRACTICE_LOGS_KEY) || "[]"); } catch { return []; }
  });
  const [view, setView] = useState("practice");
  const [loggedToday, setLoggedToday] = useState(null);
  const [privacy, setPrivacy] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mindgym-privacy") || '{"showOnLeaderboard":true}'); } catch { return { showOnLeaderboard: true }; }
  });
  const [userPoints, setUserPoints] = useState(() => {
    try { return parseInt(localStorage.getItem("mindgym-points") || "0", 10); } catch { return 0; }
  });

  const userName = (() => { try { return localStorage.getItem("mindgym-username") || ""; } catch { return ""; } })();
  const practice = practices.find((p) => p.id === activePracticeId) ?? practices[0] ?? null;

  useEffect(() => {
    if (practices.length > 0) {
      try { localStorage.setItem("mindgym-all-practices", JSON.stringify(practices)); } catch {}
    }
  }, [practices]);

  useEffect(() => {
    if (activePracticeId) {
      try { localStorage.setItem("mindgym-active-practice-id", activePracticeId); } catch {}
    }
  }, [activePracticeId]);

  useEffect(() => {
    if (!practice || !userName) return;
    const todayLog = logs.find((l) => l.date === todayISO() && l.practiceId === practice.id && l.userName === userName);
    if (todayLog) setLoggedToday(todayLog);
  }, [logs, practice, userName]);

  const onLog = (entry) => {
    setLoggedToday(entry);
    const updated = [...logs.filter((l) => !(l.date === entry.date && l.userName === entry.userName && l.practiceId === entry.practiceId)), entry];
    setLogs(updated);
    if (entry.done && !loggedToday?.done) {
      const pts = 10 + (entry.reflection?.trim() ? 5 : 0);
      const newPts = userPoints + pts;
      setUserPoints(newPts);
      try { localStorage.setItem("mindgym-points", String(newPts)); } catch {}
    }
  };

  const savePrivacy = (p) => {
    setPrivacy(p);
    try { localStorage.setItem("mindgym-privacy", JSON.stringify(p)); } catch {}
  };

  const savePractice = (p) => {
    setPractices((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      return idx >= 0 ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p];
    });
    setActivePracticeId(p.id);
    try { localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(p)); } catch {}
    setView("practice");
  };

  if (!practice && !isAdmin) {
    return (
      <motion.div {...fade} style={{ textAlign: "center", paddingTop: 60 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>📿</p>
        <p style={{ fontSize: 18, color: T.sub, fontFamily: "Georgia, serif" }}>No practice set yet</p>
        <p style={{ fontSize: 14, color: T.faint, marginTop: 8 }}>Your guide will set this week's practice soon.</p>
      </motion.div>
    );
  }

  // Full-screen sub-views — no inner tab bar
  if (view === "builder") {
    return <PracticeBuilder existingPractice={practice} onSave={savePractice} onBack={() => setView(isAdmin ? "admin" : "practice")} />;
  }
  if (view === "archive") {
    return <PracticeArchive practices={practices} activePracticeId={practice?.id} logs={logs}
      onOpen={(id) => { setActivePracticeId(id); setView("practice"); }}
      onBack={() => setView(isAdmin ? "admin" : "practice")} />;
  }

  const dayNumber = getDayNumber(practice?.startDate);
  const lvl = levelOf(userPoints);

  const tabs = [
    { id: "practice", label: "Practice" },
    { id: "log",      label: "Log Day" },
    { id: "board",    label: "Circle" },
    ...(isAdmin ? [{ id: "admin", label: "⚙ Admin" }] : []),
  ];

  return (
    <motion.div {...fade}>
      {/* Level badge */}
      {userName && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
          padding: "10px 16px", borderRadius: 14, background: T.card, border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 22 }}>{lvl.emoji}</span>
          <span style={{ flex: 1 }}>
            <span style={{ fontSize: 14, color: T.text, fontFamily: "Georgia, serif", display: "block" }}>{userName}</span>
            <span style={{ fontSize: 12, color: T.faint }}>{lvl.name} · {userPoints} pts · 🌱0 👁️50 🕊️150 🕯️300 ✨600</span>
          </span>
        </div>
      )}

      {/* Inner tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 4 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{ flex: 1, padding: "10px 6px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
              background: view === t.id ? "rgba(171,206,201,0.12)" : "transparent",
              border: `1px solid ${view === t.id ? "rgba(171,206,201,0.3)" : "transparent"}`,
              color: view === t.id ? T.teal : T.faint, transition: "all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* PRACTICE VIEW */}
        {view === "practice" && practice && (
          <motion.div key="practice" {...fade}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 30, lineHeight: 1 }}>{practice.emoji ?? "📿"}</span>
              <div>
                <span style={{ fontSize: 11, letterSpacing: "0.12em", color: T.faint, display: "block" }}>
                  WEEK OF {new Date(practice.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span style={{ fontSize: 12, color: T.gold, fontWeight: 600 }}>Day {dayNumber} of 7</span>
              </div>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 300, color: T.text, fontFamily: "Georgia, serif", lineHeight: 1.3, marginBottom: 4 }}>{practice.title}</h2>
            {practice.teacherName && <p style={{ fontSize: 13, color: T.faint, fontStyle: "italic", marginBottom: 18 }}>— {practice.teacherName}</p>}

            {practice.videoUrl && (
              <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 20, aspectRatio: "16/9", background: "#000" }}>
                <iframe src={practice.videoUrl} width="100%" height="100%" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen style={{ display: "block" }} />
              </div>
            )}

            {practice.description && (
              <div style={{ padding: "16px 18px", borderRadius: 16, background: T.card, border: `1px solid ${T.border}`, marginBottom: 16 }}>
                <p style={{ fontSize: 15, color: T.sub, fontFamily: "Georgia, serif", lineHeight: 1.7, fontStyle: "italic" }}>"{practice.description}"</p>
              </div>
            )}

            {practice.dailyInstruction && (
              <div style={{ padding: "16px 18px", borderRadius: 16, background: "rgba(171,206,201,0.04)", borderLeft: "3px solid rgba(171,206,201,0.25)", marginBottom: 16 }}>
                <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 8 }}>TODAY'S PRACTICE</p>
                <p style={{ fontSize: 15, color: "rgba(171,206,201,0.75)", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>{practice.dailyInstruction}</p>
              </div>
            )}

            {practice.prompts?.length > 0 && (
              <div style={{ padding: "14px 18px", borderRadius: 16, background: T.card, border: `1px solid ${T.border}`, marginBottom: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 10 }}>
                  TODAY'S REFLECTION{practice.prompts.length > 1 ? " QUESTIONS" : " QUESTION"}
                </p>
                {practice.prompts.map((pr, i) => (
                  <p key={pr.id} style={{ fontSize: 14, color: T.sub, fontFamily: "Georgia, serif", lineHeight: 1.6, marginBottom: i < practice.prompts.length - 1 ? 10 : 0 }}>
                    {practice.prompts.length > 1 ? `${i + 1}. ` : ""}{pr.question}
                  </p>
                ))}
              </div>
            )}

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setView("log")}
              style={{ ...primaryBtn, width: "100%", textAlign: "center",
                background: loggedToday?.done ? "rgba(75,182,172,0.12)" : "rgba(198,95,157,0.14)",
                border: `1.5px solid ${loggedToday?.done ? "rgba(75,182,172,0.4)" : "rgba(198,95,157,0.4)"}`,
                color: loggedToday?.done ? T.teal : "#e8a7cc" }}>
              {loggedToday?.done ? "✓ Logged today — update entry" : "Log Today's Practice"}
            </motion.button>

            {practices.length > 1 && (
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button onClick={() => setView("archive")} style={ghostBtn}>📚 Past practices</button>
              </div>
            )}
          </motion.div>
        )}

        {/* LOG VIEW */}
        {view === "log" && practice && (
          <motion.div key="log" {...fade}>
            {userName && <PersonalHeatmap practiceId={practice.id} userName={userName} logs={logs} />}
            <DailyLogForm practice={practice} existingLog={loggedToday} onLog={onLog} />
          </motion.div>
        )}

        {/* CIRCLE / LEADERBOARD VIEW */}
        {view === "board" && practice && (
          <motion.div key="board" {...fade}>
            {/* Privacy toggle */}
            <div style={{ padding: "14px 18px", borderRadius: 16, background: T.card, border: `1px solid ${T.border}`, marginBottom: 18 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.1em", color: T.faint, marginBottom: 10 }}>YOUR VISIBILITY</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", minHeight: 44 }}
                onClick={() => savePrivacy({ ...privacy, showOnLeaderboard: !privacy.showOnLeaderboard })}>
                <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                  border: `2px solid ${privacy.showOnLeaderboard ? "rgba(171,206,201,0.5)" : "rgba(255,255,255,0.15)"}`,
                  background: privacy.showOnLeaderboard ? "rgba(171,206,201,0.15)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.teal }}>
                  {privacy.showOnLeaderboard ? "✓" : ""}
                </div>
                <span style={{ fontSize: 14, color: T.sub, fontFamily: "Georgia, serif" }}>Show me on the circle</span>
              </div>
              {!privacy.showOnLeaderboard && (
                <p style={{ fontSize: 12, color: T.faint, fontStyle: "italic", marginTop: 6 }}>
                  Practising privately — your progress stays on this device.
                </p>
              )}
            </div>

            {userName && <PersonalHeatmap practiceId={practice.id} userName={userName} logs={logs} />}
            <Leaderboard practiceId={practice.id} logs={logs} currentUser={userName}
              showPrivate={privacy.showOnLeaderboard} userPoints={userPoints} />
          </motion.div>
        )}

        {/* ADMIN VIEW */}
        {view === "admin" && isAdmin && (
          <motion.div key="admin" {...fade}>
            <h3 style={{ fontSize: 18, color: T.gold, fontFamily: "Georgia, serif", fontWeight: 400, marginBottom: 20 }}>⚙️ Admin</h3>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setView("builder")}
              style={{ ...primaryBtn, width: "100%", textAlign: "center", marginBottom: 12,
                background: "rgba(232,184,109,0.14)", border: "1.5px solid rgba(232,184,109,0.4)", color: T.gold }}>
              {practice ? "✏️ Edit this week's practice" : "✚ Create this week's practice"}
            </motion.button>
            {practices.length > 0 && (
              <button onClick={() => setView("archive")} style={{ ...ghostBtn, width: "100%", textAlign: "center" }}>
                📚 View practice archive ({practices.length})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



const CHECKIN_STEPS = ["pause","energy","pleasant","body","emotion","thought","observe","release","choice","complete"];

function CheckInFlow({ checkInCount, onComplete, onSave, allEntries = [] }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    energyLevel: null, pleasantness: null,
    bodyLocations: [], bodySensations: [],
    emotion: null, customEmotion: "",
    thought: "", observationDuration: 0,
    releaseLevel: null, nextAction: null,
  });

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const next = useCallback(() => setStep((s) => s + 1), []);
  const selectAndNext = (k, v) => { set(k, v); setTimeout(next, 350); };

  // Recent emotions from previous check-ins (for recognition prompts)
  const recentEmotions = allEntries.slice(-12).reverse().map((e) => e.emotion).filter(Boolean);

  const current = CHECKIN_STEPS[step];
  const emotionChosen = data.emotion || data.customEmotion.trim();
  const progress = step / (CHECKIN_STEPS.length - 1);

  const showNext =
    (current === "body" && data.bodyLocations.length > 0) ||
    (current === "emotion" && emotionChosen) ||
    current === "thought";

  return (
    <div>
      {/* Progress bar */}
      {step > 0 && current !== "complete" && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, rgba(198,95,157,0.5), rgba(171,206,201,0.5))" }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <div key={current}>
          {current === "pause" && <PauseStep onNext={next} />}
          {current === "energy" && <EnergyStep value={data.energyLevel} onSelect={(v) => selectAndNext("energyLevel", v)} />}
          {current === "pleasant" && <PleasantStep value={data.pleasantness} onSelect={(v) => selectAndNext("pleasantness", v)} />}
          {current === "body" && (
            <BodyStep
              zones={data.bodyLocations} sensations={data.bodySensations}
              onToggleZone={(id) => set("bodyLocations", data.bodyLocations.includes(id) ? data.bodyLocations.filter(z => z !== id) : [...data.bodyLocations, id])}
              onToggleSensation={(s) => set("bodySensations", data.bodySensations.includes(s) ? data.bodySensations.filter(x => x !== s) : [...data.bodySensations, s])}
              onNext={next}
            />
          )}
          {current === "emotion" && (
            <EmotionStep
              energy={data.energyLevel} pleasantness={data.pleasantness}
              value={data.emotion} custom={data.customEmotion}
              onSelect={(e) => set("emotion", e)}
              onCustom={(v) => { set("customEmotion", v); set("emotion", null); }}
              recentEmotions={recentEmotions}
            />
          )}
          {current === "thought" && <ThoughtStep value={data.thought} onChange={(v) => set("thought", v)} />}
          {current === "observe" && <ObserveStep onDone={(secs) => { set("observationDuration", secs); next(); }} />}
          {current === "release" && <ReleaseStep value={data.releaseLevel} onSelect={(v) => selectAndNext("releaseLevel", v)} />}
          {current === "choice" && (
            <ChoiceStep value={data.nextAction} onSelect={(v) => {
              set("nextAction", v);
              setTimeout(() => {
                const entry = { id: crypto.randomUUID?.() || String(Date.now()), dateTime: new Date().toISOString(), ...data, emotion: data.emotion || data.customEmotion, nextAction: v };
                onSave(entry);
                next();
              }, 350);
            }} />
          )}
          {current === "complete" && (
            <CompletionStep
              data={{ ...data, emotion: emotionChosen }}
              checkInCount={checkInCount}
              onRestart={onComplete}
            />
          )}
        </div>
      </AnimatePresence>

      {showNext && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={next} style={primaryBtn}>
            {current === "thought" && !data.thought.trim() ? "Skip" : "Continue"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT EXPORT — 3-tab shell
// ═══════════════════════════════════════════════════════════════

const ADMIN_EMAILS = ["rashmi.purbey@gmail.com", "skrmblissai@gmail.com"];

export default function MindGym({ userEmail = null }) {
  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail.toLowerCase()) : false;

  // Persisted check-in entries
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mindgym-checkins") || "[]"); } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState("checkin"); // "checkin"|"journal"|"practice"

  const saveEntry = (entry) => {
    const updated = [...entries, entry];
    setEntries(updated);
    try { localStorage.setItem("mindgym-checkins", JSON.stringify(updated)); } catch {}
  };

  const TAB_CONFIG = [
    { id: "checkin",  label: "Check-in",  icon: "✦" },
    { id: "journal",  label: "Journal",   icon: "◎" },
    { id: "practice", label: "Practice",  icon: "◈" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* Top nav bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(5,0,8,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 20px",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", height: 56 }}>
          {/* Brand */}
          <p style={{ fontSize: 10, letterSpacing: "0.35em", color: "rgba(171,206,201,0.4)", flexShrink: 0, marginRight: "auto" }}>
            MIND GYM
          </p>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {TAB_CONFIG.map((t) => {
              const active = activeTab === t.id;
              return (
                <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(t.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "8px 14px", borderRadius: 12, cursor: "pointer",
                    background: active ? "rgba(171,206,201,0.1)" : "transparent",
                    border: `1px solid ${active ? "rgba(171,206,201,0.25)" : "transparent"}`,
                    color: active ? T.teal : T.faint,
                    fontSize: 13, fontFamily: "Georgia, serif",
                    transition: "all 0.2s",
                  }}>
                  <span style={{ fontSize: 11 }}>{t.icon}</span>
                  {t.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px 100px" }}>
        <AnimatePresence mode="wait">
          {activeTab === "checkin" && (
            <motion.div key="checkin" {...fade}>
              <CheckInFlow
                checkInCount={entries.length}
                onComplete={() => {}}
                onSave={saveEntry}
                allEntries={entries}
              />
            </motion.div>
          )}

          {activeTab === "journal" && (
            <motion.div key="journal" {...fade}>
              <JournalTab entries={[...entries].reverse()} />
            </motion.div>
          )}

          {activeTab === "practice" && (
            <motion.div key="practice" {...fade}>
              <WeeklyPracticeTab isAdmin={isAdmin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
