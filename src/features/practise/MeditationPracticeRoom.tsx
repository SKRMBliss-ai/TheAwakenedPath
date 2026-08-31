import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { sfx } from '../../lib/sfx';
import { usePractiseStore } from './store';
import type { PracticeRoom } from './types';
import { Card, Fade, GlowOrb, PractiseShell, PrimaryButton, TopBar } from './ui';

/**
 * Meditation Practice Room — the redesigned daily meditation practice
 * (formerly "Today"). Styled after the meditation-player mockups: a light,
 * card-based home ("Welcome back" + colourful planet thumbnails) that opens
 * into a deep cosmic, glowing-orb session player. Completions count toward
 * the on-device practice journey, so daily sitting builds the same visible
 * strength as the gym.
 */

interface Sit {
  id: string;
  title: string;
  sub: string;
  minutes: number;
  glyph: string;
  tint: [string, string];
  /** Gentle guidance lines, shown one at a time during the sit. */
  script: string[];
}

const SITS: Sit[] = [
  {
    id: 'arrive', title: 'Arrive & Settle', sub: 'Land in the present moment', minutes: 3, glyph: '🌅',
    tint: ['#8B7BF0', '#4A2E9E'],
    script: [
      'Let your body settle. Nothing to fix, nowhere to be.',
      'Feel the weight of yourself held by the chair or floor.',
      'Notice the sounds around you, without following any of them.',
      'Rest here, arriving fully into this moment.',
    ],
  },
  {
    id: 'breath', title: 'Breath Focus', sub: 'Steady the mind with the breath', minutes: 5, glyph: '🌬️',
    tint: ['#5FC2E8', '#2E6FCF'],
    script: [
      'Bring attention to the breath, wherever you feel it most.',
      'No need to change it — just notice it coming and going.',
      'When the mind wanders, gently return. That return is the practice.',
      'Breath in… breath out… softening a little each time.',
    ],
  },
  {
    id: 'body', title: 'Body Scan', sub: 'Release held tension', minutes: 7, glyph: '🫧',
    tint: ['#6FE0C6', '#1FA987'],
    script: [
      'Bring awareness to the top of your head, and let it soften.',
      'Move slowly down — face, shoulders, chest — releasing as you go.',
      'Notice any place that’s holding, and breathe into it.',
      'Rest in the whole body, settled and at ease.',
    ],
  },
  {
    id: 'letgo', title: 'Letting Go', sub: 'Set something down for now', minutes: 4, glyph: '🍃',
    tint: ['#E88FD8', '#9B4FC9'],
    script: [
      'Notice anything your mind keeps carrying today.',
      'You don’t have to solve it now. Just let it be here.',
      'With each out-breath, imagine setting it down, lightly.',
      'Rest in the space that opens when you stop gripping.',
    ],
  },
];

/** A lightweight room so meditation sits register in the practice journey. */
function sitRoom(sit: Sit): PracticeRoom {
  return {
    id: `med-${sit.id}`,
    gym: 'adult',
    title: sit.title,
    whatPractising: sit.sub,
    glyph: sit.glyph,
    steps: [],
    strengths: ['awareness', 'pausing'],
  };
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function MeditationPracticeRoom() {
  const { streak, minutes } = usePractiseStore();
  const [active, setActive] = useState<Sit | null>(null);

  if (active) return <SitPlayer sit={active} onExit={() => setActive(null)} />;

  return (
    <PractiseShell variant="adult">
      <Fade keyId="med-home">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--p-accent)' }}>{greeting()}</p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>Meditation Practice Room</h1>
          </div>
          <div className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
            🔥 {streak} · {Math.floor(minutes / 60)}h {minutes % 60}m
          </div>
        </div>

        {/* Cosmic hero card */}
        <div
          className="relative mt-5 overflow-hidden rounded-[32px] px-6 py-7 text-center"
          style={{
            background:
              'radial-gradient(120% 100% at 15% 0%, var(--p-cos-3) 0%, transparent 55%), linear-gradient(160deg, var(--p-cos-1) 0%, var(--p-cos-2) 100%)',
            boxShadow: '0 16px 40px rgba(58,33,120,0.35)',
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <GlowOrb size={104} face="sleepy" />
            <div>
              <div className="text-lg font-bold text-white">Take a moment for yourself</div>
              <div className="text-[13px] text-white/70">Even a few minutes builds the muscle of presence.</div>
            </div>
            <div className="w-full max-w-xs pt-1">
              <PrimaryButton gradient="cta" onClick={() => { sfx.swell(); setActive(SITS[0]); }}>
                <span className="inline-flex items-center gap-2"><Play size={16} /> Begin today’s sit</span>
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* "Best for you" — colourful planet thumbnails */}
        <div className="mt-7 mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>
          Best for you
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SITS.map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { sfx.tap(); setActive(s); }}
              className="relative overflow-hidden rounded-3xl p-4 text-left"
              style={{ background: `linear-gradient(150deg, ${s.tint[0]}, ${s.tint[1]})`, minHeight: 128 }}
            >
              <div
                className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-50"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)' }}
              />
              <span className="text-2xl">{s.glyph}</span>
              <div className="mt-6 text-sm font-bold text-white">{s.title}</div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-white"><Play size={11} /></span>
                <span className="text-[11px] font-semibold text-white/90">{s.minutes} min</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Full list */}
        <div className="mt-7 mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>
          All guided practices
        </div>
        <div className="space-y-3">
          {SITS.map((s) => (
            <Card key={s.id} onClick={() => { sfx.tap(); setActive(s); }} className="flex items-center gap-4 !p-4">
              <div
                className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl text-2xl"
                style={{ background: `linear-gradient(150deg, ${s.tint[0]}, ${s.tint[1]})` }}
              >
                {s.glyph}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold" style={{ color: 'var(--p-ink)' }}>{s.title}</div>
                <div className="text-[13px]" style={{ color: 'var(--p-muted)' }}>{s.sub}</div>
              </div>
              <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--p-accent)' }}>
                {s.minutes} min <Play size={14} />
              </div>
            </Card>
          ))}
        </div>
      </Fade>
    </PractiseShell>
  );
}

/** A faux audio waveform bar that fills up to the current progress. */
function Waveform({ progress }: { progress: number }) {
  const bars = useMemo(() => Array.from({ length: 40 }, (_, i) => 8 + Math.round(Math.abs(Math.sin(i * 0.7)) * 20 + Math.random() * 6)), []);
  const litCount = Math.round(progress * bars.length);
  return (
    <div className="flex h-8 w-full items-center gap-[3px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-full transition-colors"
          style={{ height: h, background: i < litCount ? '#FFFFFF' : 'rgba(255,255,255,0.22)' }}
        />
      ))}
    </div>
  );
}

/** A minimal cosmic player: glowing orb, rotating guidance, a soft waveform timer. */
function SitPlayer({ sit, onExit }: { sit: Sit; onExit: () => void }) {
  const store = usePractiseStore();
  const total = sit.minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [playing, setPlaying] = useState(true);
  const [line, setLine] = useState(0);
  const [done, setDone] = useState(false);
  const logged = useRef(false);

  useEffect(() => { sfx.swell(); }, []);

  useEffect(() => {
    if (!playing || done) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(t); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, done]);

  // Advance the guidance line across the sit.
  useEffect(() => {
    if (done) return;
    const elapsed = total - remaining;
    const idx = Math.min(sit.script.length - 1, Math.floor((elapsed / total) * sit.script.length));
    setLine(idx);
    if (remaining === 0 && !done) {
      setDone(true);
      if (!logged.current) {
        logged.current = true;
        store.completeSession(sitRoom(sit), sit.minutes);
        sfx.celebrate();
      }
    }
  }, [remaining, done, total, sit, store]);

  const finishEarly = () => {
    if (!logged.current) {
      logged.current = true;
      store.completeSession(sitRoom(sit), Math.max(1, Math.round((total - remaining) / 60)));
      sfx.bell();
    }
    setDone(true);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const progress = 1 - remaining / total;

  if (done) {
    return (
      <PractiseShell variant="adult" mode="cosmic">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
          <GlowOrb size={128} face="sleepy" />
          <h2 className="text-2xl font-bold text-white">Practice complete.</h2>
          <p className="max-w-sm text-sm text-white/70">
            You gave yourself {sit.minutes} minutes of presence. That’s a rep — it counts.
          </p>
          <div className="w-full max-w-xs pt-2">
            <PrimaryButton gradient="cta" onClick={onExit}>Back to the room</PrimaryButton>
          </div>
        </div>
      </PractiseShell>
    );
  }

  return (
    <PractiseShell variant="adult" mode="cosmic">
      <TopBar
        title="Meditation time"
        light
        onBack={onExit}
        right={<span className="text-[13px] font-semibold tabular-nums text-white/85">{mm}:{ss}</span>}
      />
      <div className="flex flex-col items-center pt-2">
        <GlowOrb size={200} />
        <AnimatePresence mode="wait">
          <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 text-center">
            <div className="text-xl font-bold text-white">{sit.title}</div>
            <div className="text-[13px] text-white/60">{sit.sub}</div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-5 min-h-[3.5rem] max-w-sm text-center text-base font-medium text-white/90"
          >
            {sit.script[line]}
          </motion.p>
        </AnimatePresence>

        <div className="mt-6 w-full max-w-sm">
          <Waveform progress={progress} />
        </div>

        <div className="mt-6 flex items-center gap-6">
          <button
            onClick={() => { setRemaining(total); setPlaying(true); sfx.tap(); }}
            aria-label="Restart"
            className="rounded-full p-3 text-white/70 transition hover:bg-white/10"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => { setPlaying((p) => !p); sfx.tap(); }}
            className="grid h-16 w-16 place-items-center rounded-full text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--p-cos-3), var(--p-cos-2))', boxShadow: '0 8px 24px rgba(124,63,192,0.55)' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={26} /> : <Play size={26} />}
          </button>
          <button onClick={finishEarly} aria-label="Finish" className="rounded-full p-3 text-white/70 transition hover:bg-white/10">
            <Sparkles size={20} />
          </button>
        </div>
        <p className="mt-4 text-[12px] text-white/50">
          {playing ? 'Follow the breath. When the mind wanders, gently return.' : 'Paused — take your time.'}
        </p>
      </div>
    </PractiseShell>
  );
}

export default MeditationPracticeRoom;
