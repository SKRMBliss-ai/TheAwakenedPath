import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { KidsRoomConfig } from './rooms';
import * as sound from './sound';

/**
 * The three built worlds' exercises. Each one reports 0→1 progress upward so
 * the environment answers the child's practice, and each ends on discovery
 * rather than on a score — no points, no "you won", no reward jingle.
 */

/* ── Shared on-world UI ─────────────────────────────────────────────────── */

function Panel({ room, children }: { room: KidsRoomConfig; children: ReactNode }) {
  return (
    <div
      className="mx-auto w-full max-w-sm rounded-[28px] px-5 py-5 backdrop-blur-md"
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: room.palette.ink }}
    >
      {children}
    </div>
  );
}

function Choice({
  room, label, onClick, selected,
}: { room: KidsRoomConfig; label: string; onClick: () => void; selected?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full rounded-2xl px-4 py-3.5 text-left text-[15px] font-semibold transition"
      style={{
        background: selected ? room.palette.accent : 'rgba(255,255,255,0.14)',
        border: `1px solid ${selected ? room.palette.accent : 'rgba(255,255,255,0.22)'}`,
        color: selected ? '#FFFFFF' : room.palette.ink,
      }}
    >
      {label}
    </motion.button>
  );
}

function Prompt({ room, children }: { room: KidsRoomConfig; children: ReactNode }) {
  return (
    <p className="mb-4 text-center text-[17px] font-bold" style={{ color: room.palette.ink, textShadow: `0 2px 18px ${room.palette.sky[0]}` }}>
      {children}
    </p>
  );
}

function Done({ room, line, onFinish }: { room: KidsRoomConfig; line: string; onFinish: () => void }) {
  useEffect(() => { sound.play('resolve'); }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
      <p className="mx-auto max-w-[19rem] text-[18px] font-bold leading-relaxed" style={{ color: room.palette.ink, textShadow: `0 2px 20px ${room.palette.sky[0]}` }}>
        {line}
      </p>
      <p className="mt-3 text-[13px]" style={{ color: room.palette.ink, opacity: 0.7 }}>
        You practised how your mind works.
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onFinish}
        className="mt-7 rounded-full px-7 py-3.5 text-[14px] font-bold text-white"
        style={{ background: room.palette.accent, boxShadow: `0 10px 30px ${room.palette.accent}55` }}
      >
        Back to the Gym
      </motion.button>
    </motion.div>
  );
}

/* ── PAUSE ROOM — the breathing flower ──────────────────────────────────── */

const BREATH = [
  { label: 'Breathe in…', secs: 4, open: 1 },
  { label: 'Hold', secs: 2, open: 1 },
  { label: 'Breathe out…', secs: 6, open: 0.35 },
];
const BREATH_TARGET = 3;

export function PauseExercise({
  room, onProgress, onFinish,
}: { room: KidsRoomConfig; onProgress: (n: number) => void; onFinish: () => void }) {
  const [i, setI] = useState(0);
  const [rounds, setRounds] = useState(0);
  const phase = BREATH[i];
  const complete = rounds >= BREATH_TARGET;

  useEffect(() => {
    if (complete) return;
    const t = setTimeout(() => {
      const next = (i + 1) % BREATH.length;
      if (next === 0) {
        const r = rounds + 1;
        setRounds(r);
        onProgress(Math.min(1, r / BREATH_TARGET));
        sound.play('breathComplete');
      }
      setI(next);
    }, phase.secs * 1000);
    return () => clearTimeout(t);
  }, [i, phase.secs, rounds, complete, onProgress]);

  if (complete) return <Done room={room} line="The forest is quiet. So are you." onFinish={onFinish} />;

  return (
    <div className="flex flex-col items-center">
      {/* the flower opens and closes with the breath */}
      <svg viewBox="0 0 200 200" width="220" height="220">
        <defs>
          <radialGradient id="petal">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor={room.palette.glow} />
          </radialGradient>
        </defs>
        <motion.g
          animate={{ scale: phase.open, rotate: phase.open > 0.8 ? 8 : 0 }}
          transition={{ duration: phase.secs, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 100px' }}
        >
          {Array.from({ length: 8 }).map((_, p) => (
            <ellipse
              key={p}
              cx="100" cy="58" rx="17" ry="40"
              fill="url(#petal)"
              opacity="0.85"
              transform={`rotate(${p * 45} 100 100)`}
            />
          ))}
        </motion.g>
        <circle cx="100" cy="100" r="17" fill="#FFE9A8" />
      </svg>

      <AnimatePresence mode="wait">
        <motion.p
          key={phase.label}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="mt-3 text-[19px] font-bold"
          style={{ color: room.palette.ink, textShadow: `0 2px 18px ${room.palette.sky[0]}` }}
        >
          {phase.label}
        </motion.p>
      </AnimatePresence>
      <p className="mt-1 text-[13px]" style={{ color: room.palette.ink, opacity: 0.6 }}>
        {rounds} of {BREATH_TARGET} breaths
      </p>
    </div>
  );
}

/* ── WORRY ROOM — name it, shrink it, choose what to do ─────────────────── */

const WORRIES = ['Something at school', 'A friend thing', 'Something at home', 'Something new I have to do'];

export function WorryExercise({
  room, onProgress, onFinish,
}: { room: KidsRoomConfig; onProgress: (n: number) => void; onFinish: () => void }) {
  const [step, setStep] = useState<'shrink' | 'name' | 'choose' | 'action' | 'done'>('shrink');
  const [taps, setTaps] = useState(0);
  const [named, setNamed] = useState<string | null>(null);
  const cloudSize = Math.max(0.3, 1 - taps * 0.18);

  const tapCloud = () => {
    const t = taps + 1;
    setTaps(t);
    sound.play('worryShrink');
    onProgress(Math.min(0.45, t * 0.11));
    if (t >= 4) setTimeout(() => setStep('name'), 500);
  };

  if (step === 'done') return <Done room={room} line="Your worry got smaller. You got braver." onFinish={onFinish} />;

  return (
    <div className="flex flex-col items-center">
      {step === 'shrink' && (
        <>
          <Prompt room={room}>Tap the worry to make it smaller.</Prompt>
          <motion.button
            onClick={tapCloud}
            animate={{ scale: cloudSize }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            className="my-2"
            aria-label="Shrink the worry"
          >
            <svg viewBox="0 0 220 130" width="240" height="142">
              <g fill="#0D1638" opacity="0.92">
                <ellipse cx="70" cy="80" rx="55" ry="38" />
                <ellipse cx="120" cy="60" rx="62" ry="44" />
                <ellipse cx="165" cy="85" rx="48" ry="34" />
              </g>
            </svg>
          </motion.button>
          <p className="text-[13px]" style={{ color: room.palette.ink, opacity: 0.65 }}>{4 - taps} more taps</p>
        </>
      )}

      {step === 'name' && (
        <Panel room={room}>
          <Prompt room={room}>What is the worry about?</Prompt>
          <div className="space-y-2.5">
            {WORRIES.map((w) => (
              <Choice
                key={w} room={room} label={w} selected={named === w}
                onClick={() => { setNamed(w); sound.play('worryNamed'); onProgress(0.6); setTimeout(() => setStep('choose'), 550); }}
              />
            ))}
          </div>
        </Panel>
      )}

      {step === 'choose' && (
        <Panel room={room}>
          <Prompt room={room}>Is there something small you could do about it?</Prompt>
          <div className="space-y-2.5">
            <Choice room={room} label="Yes — I can try something" onClick={() => { sound.play('tap'); onProgress(0.8); setStep('action'); }} />
            <Choice room={room} label="No — I can let it pass" onClick={() => { sound.play('discovery'); onProgress(1); setStep('done'); }} />
          </div>
        </Panel>
      )}

      {step === 'action' && (
        <Panel room={room}>
          <Prompt room={room}>Pick one tiny step.</Prompt>
          <div className="space-y-2.5">
            {['Tell a grown-up I trust', 'Ask a question', 'Try one small bit of it', 'Make a plan for tomorrow'].map((a) => (
              <Choice key={a} room={room} label={a} onClick={() => { sound.play('discovery'); onProgress(1); setStep('done'); }} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ── KINDNESS ROOM — plant it, grow it, share it ────────────────────────── */

const KINDNESS = {
  self: ['Say something nice to myself', 'Forgive myself for a mistake', 'Do something I enjoy'],
  other: ['Say thank you to someone', 'Check on a friend', 'Share something I have'],
  action: ['Help without being asked', 'Include someone new', 'Say sorry and mean it'],
};

export function KindnessExercise({
  room, onProgress, onFinish,
}: { room: KidsRoomConfig; onProgress: (n: number) => void; onFinish: () => void }) {
  const [step, setStep] = useState<'plant' | 'who' | 'what' | 'done'>('plant');
  const [who, setWho] = useState<keyof typeof KINDNESS>('self');

  if (step === 'done') return <Done room={room} line="Something beautiful grew — because you shared it." onFinish={onFinish} />;

  return (
    <div className="flex flex-col items-center">
      {step === 'plant' && (
        <>
          <Prompt room={room}>Plant a tiny seed of kindness.</Prompt>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { sound.play('plantSeed'); onProgress(0.2); setTimeout(() => setStep('who'), 700); }}
            className="my-4 grid h-28 w-28 place-items-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)' }}
            aria-label="Plant the seed"
          >
            <span className="text-5xl">🌱</span>
          </motion.button>
          <p className="text-[13px]" style={{ color: room.palette.ink, opacity: 0.7 }}>Tap the seed</p>
        </>
      )}

      {step === 'who' && (
        <Panel room={room}>
          <Prompt room={room}>Who is your kindness for?</Prompt>
          <div className="space-y-2.5">
            <Choice room={room} label="Kind to myself" onClick={() => { setWho('self'); sound.play('bloom'); onProgress(0.5); setStep('what'); }} />
            <Choice room={room} label="Kind to someone else" onClick={() => { setWho('other'); sound.play('bloom'); onProgress(0.5); setStep('what'); }} />
            <Choice room={room} label="A kind action" onClick={() => { setWho('action'); sound.play('bloom'); onProgress(0.5); setStep('what'); }} />
          </div>
        </Panel>
      )}

      {step === 'what' && (
        <Panel room={room}>
          <Prompt room={room}>What will you do?</Prompt>
          <div className="space-y-2.5">
            {KINDNESS[who].map((k) => (
              <Choice key={k} room={room} label={k} onClick={() => { sound.play('discovery'); onProgress(1); setStep('done'); }} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
