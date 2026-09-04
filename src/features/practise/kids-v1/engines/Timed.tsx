import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from '../rooms';
import type { TimedBeat, TimedGame } from '../games/types';
import { CHROME, Cta, FONT, Pill, Question } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import { Chirpy } from '../ui/scene';
import * as sound from '../kit/sound';

/**
 * E5 · Timed — something moves, grows or passes, and the child acts, or
 * deliberately doesn't, in time. 16 games. Every trapdoor in the library
 * lives in here.
 *
 * THE TRAPDOOR PROTOCOL (UI design §8.3). A trapdoor is an instruction
 * designed to fail; the failing is the lesson. It only works if the app
 * shuts up:
 *
 *   1. Give the instruction. Nothing else on screen.
 *   2. Let it run. Silence — no encouragement, no progress indicator.
 *   3. WAIT. 800ms of nothing after the moment lands.
 *   4. Then the reveal, one short line, warm and slightly wry.
 *   5. Never "see?", never "that shows us that…", never a moral.
 *
 * Steps 2 and 3 are the ones that are easy to lose to a well-meant tweak, so
 * they are structural here rather than authored per game: `hold` renders NO
 * numerals and speaks not at all, and `reveal` refuses to paint for
 * REVEAL_SILENCE_MS no matter what the caller does. If the app talks during
 * the hold or explains after the reveal, the trapdoor closes and the game
 * becomes a lecture.
 *
 * §2.9 also applies to every beat below: no countdowns, no urgency, no lives,
 * no fails, no retry-from-the-start. Red Light Green Light and Slow the Pop
 * are impulse exercises where timing IS the content — and even they have no
 * losing state.
 */

const REVEAL_SILENCE_MS = 800;

/** How long the balloon takes to fill from nothing to a pop. */
const INFLATE_MS = 2500;

export function TimedEngine({
  game,
  room,
  onDone,
}: {
  game: TimedGame;
  room: RoomConfig;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const m = useMotion();
  const beat = game.beats[i];

  const next = useCallback(() => {
    if (i + 1 < game.beats.length) setI(i + 1);
    else onDone();
  }, [i, game.beats.length, onDone]);

  if (!beat) return null;

  return (
    <div className="flex min-h-[46vh] w-full flex-col justify-center gap-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={m.transition}
          className="flex flex-col gap-5"
        >
          <Beat beat={beat} room={room} onNext={next} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Beat({ beat, room, onNext }: { beat: TimedBeat; room: RoomConfig; onNext: () => void }) {
  switch (beat.kind) {
    case 'say':      return <SayBeat beat={beat} room={room} onNext={onNext} />;
    case 'hold':     return <HoldBeat beat={beat} onNext={onNext} />;
    case 'reveal':   return <RevealBeat beat={beat} room={room} onNext={onNext} />;
    case 'ask':      return <AskBeat beat={beat} room={room} onNext={onNext} />;
    case 'breath':   return <BreathBeat beat={beat} room={room} onNext={onNext} />;
    case 'lights':   return <LightsBeat beat={beat} onNext={onNext} />;
    case 'balloon':  return <BalloonBeat beat={beat} room={room} onNext={onNext} />;
    case 'parade':   return <ParadeBeat beat={beat} room={room} onNext={onNext} />;
    case 'move':     return <MoveBeat beat={beat} room={room} onNext={onNext} />;
    case 'mission':  return <MissionBeat beat={beat} room={room} onNext={onNext} />;
  }
}

/* ── say · one line, tap to move on ─────────────────────────────────── */

function SayBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'say' }>; room: RoomConfig; onNext: () => void }) {
  return (
    <button onClick={onNext} className="w-full text-left" aria-label="Next">
      {beat.who === 'chirpy' ? (
        <Chirpy pose="curious" line={beat.text} align="left" />
      ) : (
        <Question room={room}>{beat.text}</Question>
      )}
      <p className="mt-5 text-[13px] font-bold" style={{ color: CHROME.textSoft }}>Tap anywhere</p>
    </button>
  );
}

/* ── hold · the silence ─────────────────────────────────────────────────
 * A run of quiet with a shrinking ring and NO NUMERALS. Nothing speaks; the
 * instruction was already given. `label` is the only exception, and only one
 * game uses it — Try Not To Laugh needs something mildly silly to happen on
 * screen, which is the thing being not-laughed at. */

function HoldBeat({ beat, onNext }: { beat: Extract<TimedBeat, { kind: 'hold' }>; onNext: () => void }) {
  const [t, setT] = useState(0);
  const quiet = useQuiet();
  const ms = beat.seconds * 1000;

  useEffect(() => {
    const started = Date.now();
    const tick = window.setInterval(() => setT(Math.min(1, (Date.now() - started) / ms)), 60);
    const end = window.setTimeout(onNext, ms);
    return () => { clearInterval(tick); clearTimeout(end); };
  }, [ms, onNext]);

  return (
    <div className="relative flex flex-col items-center gap-6 py-6">
      {/* Step 1 of the trapdoor protocol is "nothing else on screen". The
          room stays, but it drops right back so the ring is the only thing
          with any weight in the frame. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'rgba(4,6,14,0.55)' }}
      />
      <svg viewBox="0 0 100 100" className="h-36 w-36" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="4" />
        <circle
          cx="50" cy="50" r="44" fill="none"
          stroke="rgba(255,224,170,0.95)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 44}
          strokeDashoffset={2 * Math.PI * 44 * t}
          transform="rotate(-90 50 50)"
          style={{ filter: 'drop-shadow(0 0 12px rgba(255,214,150,0.55))' }}
        />
      </svg>
      {beat.label && !quiet && (
        <motion.p
          className="max-w-[19rem] text-center text-[15px] font-bold"
          style={{ color: CHROME.textSoft, fontFamily: FONT }}
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        >
          {beat.label}
        </motion.p>
      )}
    </div>
  );
}

/* ── reveal · after 800ms of nothing ────────────────────────────────── */

function RevealBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'reveal' }>; room: RoomConfig; onNext: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Step 3. The child has to register what just happened BEFORE the app
    // speaks. Do not shorten this to make the game feel snappier.
    const t = window.setTimeout(() => { setShown(true); sound.play('discovery'); }, REVEAL_SILENCE_MS);
    return () => clearTimeout(t);
  }, []);

  if (!shown) return <div className="min-h-[120px]" aria-hidden />;

  return (
    <motion.button
      onClick={onNext}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full text-left"
    >
      <Question room={room}>{beat.text}</Question>
      <p className="mt-5 text-[13px] font-bold" style={{ color: CHROME.textSoft }}>Tap anywhere</p>
    </motion.button>
  );
}

/* ── ask · a question mid-game ──────────────────────────────────────── */

function AskBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'ask' }>; room: RoomConfig; onNext: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const m = useMotion();

  const tap = (o: string) => {
    if (picked) return;
    sound.play('tap');
    setPicked(o);
    window.setTimeout(onNext, m.advanceMs);
  };

  return (
    <div className="flex flex-col gap-4">
      <Question room={room}>{beat.prompt}</Question>
      <div className="flex flex-col" style={{ gap: m.gap }}>
        {beat.options.map((o) => (
          <Pill key={o} label={o} selected={picked === o} onClick={() => tap(o)} accent={room.palette.accent} disabled={!!picked} />
        ))}
      </div>
    </div>
  );
}

/* ── breath · a shape that grows and shrinks ────────────────────────── */

const BOX_PHASES = ['Breathe in', 'Hold', 'Breathe out', 'Hold'] as const;
const PHASE_MS = 4000;

function BreathBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'breath' }>; room: RoomConfig; onNext: () => void }) {
  const [phase, setPhase] = useState(0);
  const phases = beat.shape === 'box' ? 4 : 2;
  const total = beat.rounds * phases;
  const done = phase >= total;

  useEffect(() => {
    if (done) { const t = window.setTimeout(onNext, 700); return () => clearTimeout(t); }
    const step = phase % phases;
    if (step === 0) sound.play('breatheIn');
    else if (beat.shape === 'balloon' || step === 2) sound.play('breatheOut');
    const t = window.setTimeout(() => setPhase((p) => p + 1), PHASE_MS);
    return () => clearTimeout(t);
  }, [phase, phases, done, beat.shape, onNext]);

  const step = phase % phases;
  const label = beat.shape === 'box' ? BOX_PHASES[step] : step === 0 ? 'Breathe in' : 'Breathe out';
  const big = beat.shape === 'box' ? step === 0 || step === 1 : step === 0;

  return (
    <div className="flex flex-col items-center gap-7 py-4">
      <motion.div
        className="grid place-items-center rounded-full"
        animate={{ scale: done ? 1 : big ? 1.32 : 0.82 }}
        transition={{ duration: PHASE_MS / 1000, ease: 'easeInOut' }}
        style={{
          width: 152,
          height: 152,
          background: `radial-gradient(circle, ${room.palette.accent}66 0%, ${room.palette.accent}14 62%, transparent 74%)`,
          border: `2px solid ${room.palette.accent}88`,
        }}
      />
      <p className="text-[19px] font-extrabold" style={{ color: CHROME.text, fontFamily: FONT }}>
        {done ? 'That’s the lot.' : label}
      </p>
    </div>
  );
}

/* ── lights · red light, green light ────────────────────────────────────
 * Impulse control, trained directly. There is no losing state: an early tap
 * is noted and the round simply carries on. */

// No `room` here on purpose: red and green have to read as red and green,
// so this is the one beat that does not take the room's accent colour.
//
// The parent owns only the round counter; each round is a KEYED child, so a
// new round arrives as a fresh mount with fresh state rather than as an
// effect that resets four things. Same shape as BalloonBeat below.
function LightsBeat({ beat, onNext }: { beat: Extract<TimedBeat, { kind: 'lights' }>; onNext: () => void }) {
  const [round, setRound] = useState(0);
  const through = round >= beat.rounds;

  useEffect(() => {
    if (!through) return;
    const t = window.setTimeout(onNext, 800);
    return () => clearTimeout(t);
  }, [through, onNext]);

  return (
    <div className="flex flex-col items-center gap-5">
      <LightRound
        key={round}
        // It gets faster. Never so fast that it becomes unwinnable — the floor
        // is 520ms, comfortably above a child's reaction time.
        base={Math.max(520, 1900 - round * 120)}
        frozen={through}
        onHit={() => setRound((r) => r + 1)}
      />
      <p className="min-h-[22px] text-[15px] font-bold" style={{ color: CHROME.textSoft }}>
        {through ? 'That’s the lot.' : `${round} of ${beat.rounds}`}
      </p>
    </div>
  );
}

function LightRound({ base, frozen, onHit }: { base: number; frozen: boolean; onHit: () => void }) {
  const [green, setGreen] = useState(false);
  const [early, setEarly] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (frozen) return;
    // The jitter is rolled here, in an effect, rather than during render —
    // and once per mount, because each round is a fresh keyed mount. A child
    // must not be able to learn the rhythm and pre-empt the light.
    const delay = base + Math.random() * 700;
    timer.current = window.setTimeout(() => { setGreen(true); sound.play('tap'); }, delay);
    return () => clearTimeout(timer.current);
  }, [base, frozen]);

  const tap = () => {
    if (frozen) return;
    if (green) { sound.play('tapHit'); onHit(); return; }
    // Early. Not a failure — just a thing that happened. The light comes
    // anyway; there is nothing to lose and nothing to restart.
    setEarly(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setGreen(true); sound.play('tap'); }, 900);
  };

  return (
    <>
      <button
        onClick={tap}
        aria-label={green ? 'Green — tap' : 'Red — wait'}
        className="grid h-52 w-52 place-items-center rounded-full transition-colors duration-150"
        style={{
          background: green ? '#3FB37F' : '#B5443A',
          boxShadow: green ? '0 0 70px -10px #3FB37F' : '0 0 50px -18px #B5443A',
          border: '3px solid rgba(255,255,255,0.28)',
        }}
      >
        <span className="text-[24px] font-extrabold" style={{ color: '#0E1A1C', fontFamily: FONT }}>
          {green ? 'GO' : 'WAIT'}
        </span>
      </button>
      {early && !green && (
        <p className="text-[14px] font-bold" style={{ color: CHROME.textSoft }}>
          Too soon. It’s coming anyway.
        </p>
      )}
    </>
  );
}

/* ── balloon · stop it as late as you dare ──────────────────────────────
 * Also runs Frustration: The Stuck Game, where the resistance is the point.
 * Bursting is not losing and is never described as one. */

function BalloonBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'balloon' }>; room: RoomConfig; onNext: () => void }) {
  const [go, setGo] = useState(0);
  const through = go >= beat.tries;

  useEffect(() => {
    if (!through) return;
    const t = window.setTimeout(onNext, 800);
    return () => clearTimeout(t);
  }, [through, onNext]);

  return (
    <div className="flex flex-col items-center gap-5">
      <BalloonRound
        key={go}
        room={room}
        frozen={through}
        label={through ? 'That’s the lot.' : `Go ${go + 1} of ${beat.tries}`}
        onEnd={() => setGo((g) => g + 1)}
      />
    </div>
  );
}

function BalloonRound({
  room,
  frozen,
  label,
  onEnd,
}: {
  room: RoomConfig;
  frozen: boolean;
  label: string;
  onEnd: () => void;
}) {
  const [size, setSize] = useState(0);
  const [popped, setPopped] = useState(false);
  const [stopped, setStopped] = useState(false);
  /** Set the moment this go is over, either way, so the interval and the
   *  stop button can never both end it. */
  const ended = useRef(false);
  const endTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (frozen) return;
    const started = Date.now();
    const iv = window.setInterval(() => {
      if (ended.current) return;
      const t = Math.min(1, (Date.now() - started) / INFLATE_MS);
      setSize(t);
      if (t < 1) return;
      // Popping ends the go exactly as stopping does. It is not a failure and
      // the copy below never calls it one.
      ended.current = true;
      clearInterval(iv);
      setPopped(true);
      sound.play('tapHit');
      endTimer.current = window.setTimeout(onEnd, 1200);
    }, 40);
    return () => { clearInterval(iv); clearTimeout(endTimer.current); };
  }, [frozen, onEnd]);

  const stop = () => {
    if (ended.current || frozen) return;
    ended.current = true;
    setStopped(true);
    sound.play('discovery');
    endTimer.current = window.setTimeout(onEnd, 1100);
  };

  return (
    <>
      <div className="grid h-56 place-items-center">
        <motion.div
          className="rounded-full"
          animate={{ scale: popped ? 1.16 : 1, opacity: popped ? 0 : 1 }}
          transition={{ duration: popped ? 0.3 : 0 }}
          style={{
            width: 60 + size * 150,
            height: 68 + size * 168,
            background: `radial-gradient(circle at 36% 30%, ${room.palette.accent}EE 0%, ${room.palette.accent}99 60%, ${room.palette.accent}55 100%)`,
            border: '2px solid rgba(255,255,255,0.4)',
          }}
        />
      </div>
      <button
        onClick={stop}
        disabled={popped || stopped || frozen}
        className="rounded-[999px] px-8 py-4 text-[17px] font-extrabold transition"
        style={{ background: room.palette.accent, color: '#0E1A1C', opacity: popped || stopped || frozen ? 0.5 : 1 }}
      >
        Stop it
      </button>
      <p className="min-h-[22px] text-[15px] font-bold" style={{ color: CHROME.textSoft }}>
        {popped ? 'Popped. Nothing happens when it pops.' : stopped ? 'Stopped.' : label}
      </p>
    </>
  );
}

/* ── parade · thoughts march past and are not caught ────────────────── */

function ParadeBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'parade' }>; room: RoomConfig; onNext: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= beat.thoughts.length) { const t = window.setTimeout(onNext, 900); return () => clearTimeout(t); }
    const t = window.setTimeout(() => setIdx((n) => n + 1), 2200);
    return () => clearTimeout(t);
  }, [idx, beat.thoughts.length, onNext]);

  return (
    <div className="relative grid h-64 place-items-center overflow-hidden">
      <AnimatePresence>
        {beat.thoughts.slice(Math.max(0, idx - 1), idx + 1).map((t, n) => (
          <motion.div
            key={`${t}-${idx}-${n}`}
            initial={{ x: '58%', opacity: 0 }}
            animate={{ x: '-58%', opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4.4, ease: 'linear' }}
            className="absolute whitespace-nowrap rounded-[20px] px-5 py-3 text-[16px] font-extrabold shadow-xl"
            style={{ background: 'rgba(255,255,255,0.92)', color: '#241D3D', fontFamily: FONT, top: `${18 + ((idx + n) % 4) * 18}%` }}
          >
            {t}
          </motion.div>
        ))}
      </AnimatePresence>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(90deg, ${room.palette.scrim} 0%, transparent 18%, transparent 82%, ${room.palette.scrim} 100%)` }}
      />
    </div>
  );
}

/* ── move · use your actual body ────────────────────────────────────── */

function MoveBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'move' }>; room: RoomConfig; onNext: () => void }) {
  const [n, setN] = useState(0);
  const done = n >= beat.count;

  return (
    <div className="flex flex-col items-center gap-6">
      <Question room={room}>{done ? beat.after : beat.text}</Question>
      {!done ? (
        <>
          <motion.button
            onClick={() => { sound.play('tapHit'); setN((v) => v + 1); }}
            whileTap={{ scale: 0.94 }}
            className="grid h-40 w-40 place-items-center rounded-full text-[40px] font-extrabold"
            style={{ background: room.palette.accent, color: '#0E1A1C', fontFamily: FONT }}
          >
            {beat.count - n}
          </motion.button>
          <p className="text-[13.5px] font-bold" style={{ color: CHROME.textSoft }}>
            Tap once each time. Nobody’s counting but you.
          </p>
        </>
      ) : (
        <Cta label="Done" onClick={onNext} accent={room.palette.accent} />
      )}
    </div>
  );
}

/* ── mission · a job for real life ──────────────────────────────────── */

function MissionBeat({ beat, room, onNext }: { beat: Extract<TimedBeat, { kind: 'mission' }>; room: RoomConfig; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[12.5px] font-extrabold uppercase tracking-[0.16em]" style={{ color: room.palette.accent }}>
        For later
      </p>
      <Question room={room}>{beat.text}</Question>
      <Cta label="Got it" onClick={onNext} accent={room.palette.accent} />
    </div>
  );
}
