import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { KidsRoomConfig, Step } from './rooms';
import * as sound from './sound';

/**
 * One exercise engine for all ten worlds. A room lists its steps; this walks
 * them, renders the right beat for each kind, and reports 0→1 progress so the
 * room can respond around the child.
 *
 * Every room ends on a discovery, never a score — no points, no reward jingle.
 */

/* ── On-world UI ────────────────────────────────────────────────────────── */

function Prompt({ room, children }: { room: KidsRoomConfig; children: ReactNode }) {
  return (
    <p
      className="mb-5 text-center text-[19px] font-bold leading-snug"
      style={{ color: room.palette.ink, textShadow: `0 2px 20px ${room.palette.scrim}, 0 1px 4px ${room.palette.scrim}` }}
    >
      {children}
    </p>
  );
}

function Choice({ room, label, onClick }: { room: KidsRoomConfig; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full rounded-2xl px-4 py-3.5 text-left text-[15px] font-semibold backdrop-blur-md transition"
      style={{
        background: `${room.palette.scrim}A6`,
        border: '1px solid rgba(255,255,255,0.34)',
        color: room.palette.ink,
      }}
    >
      {label}
    </motion.button>
  );
}

/* ── Step: box breathing ────────────────────────────────────────────────── */

/**
 * Box breathing — in 4, hold 4, out 4, hold 4 — drawn as a square the child
 * travels around. Each phase walks one side, so the shape teaches the rhythm
 * without a word of explanation: the box is the breath.
 */
const BOX = 4;               // seconds per side
const S = 34, E = 166;       // the square's edges within the 200×200 canvas

const SIDES = [
  { label: 'Breathe in',  cue: 'breatheIn'  as const, from: [S, E], to: [S, S] }, // up the left
  { label: 'Hold',        cue: null,                  from: [S, S], to: [E, S] }, // across the top
  { label: 'Breathe out', cue: 'breatheOut' as const, from: [E, S], to: [E, E] }, // down the right
  { label: 'Hold',        cue: null,                  from: [E, E], to: [S, E] }, // back along the bottom
];

function BoxBreathStep({
  room, step, onDone, onTick,
}: { room: KidsRoomConfig; step: Extract<Step, { kind: 'breath' }>; onDone: () => void; onTick: (f: number) => void }) {
  const [i, setI] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [count, setCount] = useState(BOX);
  const side = SIDES[i];

  // The breath voice leads each side; the visual follows it.
  useEffect(() => {
    if (side.cue) sound.play(side.cue);
  }, [i, side.cue]);

  // A visible 4 · 3 · 2 · 1 for each side.
  useEffect(() => {
    setCount(BOX);
    const t = setInterval(() => setCount((c) => (c > 1 ? c - 1 : c)), 1000);
    return () => clearInterval(t);
  }, [i]);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = (i + 1) % SIDES.length;
      if (next === 0) {
        const r = rounds + 1;
        setRounds(r);
        onTick(Math.min(1, r / step.rounds));
        sound.play('breathComplete');
        if (r >= step.rounds) { onDone(); return; }
      }
      setI(next);
    }, BOX * 1000);
    return () => clearTimeout(t);
  }, [i, rounds, step.rounds, onDone, onTick]);

  const inhaling = i === 0;
  const exhaling = i === 2;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" width="232" height="232">
        {/* the box */}
        <rect
          x={S} y={S} width={E - S} height={E - S} rx="8"
          fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="4"
        />

        {/* the side currently being travelled, drawing itself in real time */}
        <motion.line
          key={`side-${i}-${rounds}`}
          x1={side.from[0]} y1={side.from[1]} x2={side.to[0]} y2={side.to[1]}
          stroke={room.palette.accent} strokeWidth="6" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: BOX, ease: 'linear' }}
        />

        {/* a soft light that swells on the in-breath and settles on the out.
            Scale, not r — framer-motion drives transforms, not SVG geometry. */}
        <motion.circle
          cx="100" cy="100" r="34"
          fill={room.palette.accent}
          style={{ transformOrigin: '100px 100px' }}
          animate={{ scale: inhaling ? 1.35 : exhaling ? 0.65 : 1, opacity: inhaling ? 0.30 : 0.18 }}
          transition={{ duration: BOX, ease: 'easeInOut' }}
        />

        {/* the traveller — one dot walking the square */}
        <motion.circle
          key={`dot-${i}-${rounds}`}
          cx="0" cy="0" r="9" fill="#FFFFFF"
          initial={{ x: side.from[0], y: side.from[1] }}
          animate={{ x: side.to[0], y: side.to[1] }}
          transition={{ duration: BOX, ease: 'linear' }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
        />

        {/* the count, in the middle of the box */}
        <text
          x="100" y="108" textAnchor="middle"
          style={{ fontFamily: "'Outfit', system-ui, sans-serif", fontSize: 40, fontWeight: 800, fill: '#FFFFFF' }}
        >
          {count}
        </text>
      </svg>

      <AnimatePresence mode="wait">
        <motion.p
          key={`${side.label}-${i}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="mt-2 text-[21px] font-bold"
          style={{ color: room.palette.ink, textShadow: `0 2px 18px ${room.palette.scrim}` }}
        >
          {side.label}
        </motion.p>
      </AnimatePresence>
      <p className="mt-1 text-[13px]" style={{ color: room.palette.ink, opacity: 0.75 }}>
        {rounds} of {step.rounds} rounds
      </p>
    </div>
  );
}

/* ── Step: tap a thing until it gives way ───────────────────────────────── */

function TapStep({
  room, step, onDone, onTick,
}: { room: KidsRoomConfig; step: Extract<Step, { kind: 'tap' }>; onDone: () => void; onTick: (f: number) => void }) {
  const [taps, setTaps] = useState(0);
  const left = step.taps - taps;

  const hit = () => {
    const t = taps + 1;
    setTaps(t);
    onTick(Math.min(1, t / step.taps));
    sound.play(t >= step.taps ? 'discovery' : 'tapHit');
    if (t >= step.taps) setTimeout(onDone, 550);
  };

  return (
    <div className="flex flex-col items-center">
      <Prompt room={room}>{step.prompt}</Prompt>
      <motion.button
        onClick={hit}
        animate={{ scale: Math.max(0.4, 1 - taps * (0.55 / step.taps)), opacity: Math.max(0.35, 1 - taps * (0.5 / step.taps)) }}
        transition={{ type: 'spring', stiffness: 130, damping: 12 }}
        whileTap={{ rotate: [0, -6, 6, 0] }}
        className="my-2 grid h-32 w-32 place-items-center rounded-full backdrop-blur-sm"
        style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)' }}
        aria-label={step.prompt}
      >
        <span className="text-6xl">{step.glyph}</span>
      </motion.button>
      <p className="mt-2 text-[13px] font-semibold" style={{ color: room.palette.ink, opacity: 0.8, textShadow: `0 1px 10px ${room.palette.scrim}` }}>
        {left > 0 ? `${left} ${step.hint}` : 'There it goes…'}
      </p>
    </div>
  );
}

/* ── Step: two stories ──────────────────────────────────────────────────── */

function ReframeStep({
  room, step, onDone,
}: { room: KidsRoomConfig; step: Extract<Step, { kind: 'reframe' }>; onDone: () => void }) {
  const [turned, setTurned] = useState(false);
  return (
    <div className="w-full">
      <Prompt room={room}>{step.prompt}</Prompt>
      <div className="mx-auto w-full max-w-sm space-y-3">
        <div
          className="rounded-2xl px-4 py-4 text-center text-[15px] font-semibold backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.18)', color: room.palette.ink }}
        >
          {step.a}
        </div>
        <AnimatePresence>
          {turned ? (
            <motion.div
              initial={{ opacity: 0, rotateX: -80 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl px-4 py-4 text-center text-[15px] font-bold backdrop-blur-md"
              style={{ background: `${room.palette.accent}D9`, border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF' }}
            >
              {step.b}
            </motion.div>
          ) : (
            <motion.button
              key="turn"
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { sound.play('discovery'); setTurned(true); }}
              className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-bold backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: room.palette.ink }}
            >
              Turn the page →
            </motion.button>
          )}
        </AnimatePresence>
        {turned && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDone}
            className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white"
            style={{ background: room.palette.accent }}
          >
            Keep going
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ── The engine ─────────────────────────────────────────────────────────── */

export function RoomExercise({
  room, onProgress, onFinish,
}: { room: KidsRoomConfig; onProgress: (n: number) => void; onFinish: () => void }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const total = room.steps.length;
  const step = room.steps[idx];

  /** Progress = steps finished, plus however far through the current one. */
  const report = (fractionOfStep: number) => onProgress(Math.min(1, (idx + fractionOfStep) / total));

  const advance = () => {
    if (idx + 1 >= total) { onProgress(1); setDone(true); return; }
    setIdx(idx + 1);
    onProgress((idx + 1) / total);
  };

  useEffect(() => { if (done) sound.play('resolve'); }, [done]);

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
        <p
          className="mx-auto max-w-[20rem] text-[19px] font-bold leading-relaxed"
          style={{ color: room.palette.ink, textShadow: `0 2px 22px ${room.palette.scrim}, 0 1px 4px ${room.palette.scrim}` }}
        >
          {room.ending}
        </p>
        <p className="mt-3 text-[13px]" style={{ color: room.palette.ink, opacity: 0.78, textShadow: `0 1px 10px ${room.palette.scrim}` }}>
          You practised how your mind works.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onFinish}
          className="mt-7 rounded-full px-7 py-3.5 text-[14px] font-bold text-white"
          style={{ background: room.palette.accent, boxShadow: `0 10px 30px ${room.palette.accent}66` }}
        >
          Back to the Gym
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        {step.kind === 'breath' && <BoxBreathStep room={room} step={step} onDone={advance} onTick={report} />}
        {step.kind === 'tap' && <TapStep room={room} step={step} onDone={advance} onTick={report} />}
        {step.kind === 'reframe' && <ReframeStep room={room} step={step} onDone={advance} />}
        {step.kind === 'pick' && (
          <div className="w-full">
            <Prompt room={room}>{step.prompt}</Prompt>
            <div className="mx-auto w-full max-w-sm space-y-2.5">
              {step.options.map((o) => (
                <Choice key={o} room={room} label={o} onClick={() => { sound.play('tap'); advance(); }} />
              ))}
            </div>
          </div>
        )}

        {/* where the child is in the room */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {room.steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === idx ? 18 : 6, background: i <= idx ? room.palette.accent : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
