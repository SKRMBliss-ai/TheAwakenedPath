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

/* ── Step: box breathing ─────────────────────────────────────────────────
 * Four equal beats — in, hold, out, hold — each traced along one side of a
 * square, so the shape the child watches literally is the "box" they're
 * breathing. A breath-in / breath-out cue plays at the start of each of
 * those two beats. */

const BOX_SIDE = 4; // seconds per side — classic 4-4-4-4 box breathing

// Square corners in SVG space, traced clockwise from bottom-left.
const BOX_CORNERS = { bl: { x: 44, y: 156 }, tl: { x: 44, y: 44 }, tr: { x: 156, y: 44 }, br: { x: 156, y: 156 } };

const BOX_BREATH = [
  { label: 'Breathe in…', from: BOX_CORNERS.bl, to: BOX_CORNERS.tl, cue: 'breatheIn' as const },
  { label: 'Hold', from: BOX_CORNERS.tl, to: BOX_CORNERS.tr, cue: null },
  { label: 'Breathe out…', from: BOX_CORNERS.tr, to: BOX_CORNERS.br, cue: 'breatheOut' as const },
  { label: 'Hold', from: BOX_CORNERS.br, to: BOX_CORNERS.bl, cue: null },
];

function BreathStep({
  room, step, onDone, onTick,
}: { room: KidsRoomConfig; step: Extract<Step, { kind: 'breath' }>; onDone: () => void; onTick: (f: number) => void }) {
  const [i, setI] = useState(0);
  const [rounds, setRounds] = useState(0);
  const phase = BOX_BREATH[i];

  useEffect(() => {
    if (phase.cue) sound.play(phase.cue);
  }, [i, phase.cue]);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = (i + 1) % BOX_BREATH.length;
      if (next === 0) {
        const r = rounds + 1;
        setRounds(r);
        onTick(Math.min(1, r / step.rounds));
        sound.play('breathComplete');
        if (r >= step.rounds) { onDone(); return; }
      }
      setI(next);
    }, BOX_SIDE * 1000);
    return () => clearTimeout(t);
  }, [i, rounds, step.rounds, onDone, onTick]);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" width="212" height="212">
        <rect
          x={BOX_CORNERS.tl.x} y={BOX_CORNERS.tl.y}
          width={BOX_CORNERS.tr.x - BOX_CORNERS.tl.x} height={BOX_CORNERS.bl.y - BOX_CORNERS.tl.y}
          rx="14" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3"
        />
        <motion.circle
          key={i}
          r="10"
          fill={room.palette.accent}
          stroke="#FFFFFF"
          strokeWidth="2"
          initial={{ cx: phase.from.x, cy: phase.from.y }}
          animate={{ cx: phase.to.x, cy: phase.to.y }}
          transition={{ duration: BOX_SIDE, ease: 'linear' }}
        />
      </svg>
      <AnimatePresence mode="wait">
        <motion.p
          key={phase.label + i}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="mt-3 text-[20px] font-bold"
          style={{ color: room.palette.ink, textShadow: `0 2px 18px ${room.palette.scrim}` }}
        >
          {phase.label}
        </motion.p>
      </AnimatePresence>
      <p className="mt-1 text-[13px]" style={{ color: room.palette.ink, opacity: 0.75 }}>
        {rounds} of {step.rounds} breaths
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
        {step.kind === 'breath' && <BreathStep room={room} step={step} onDone={advance} onTick={report} />}
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
