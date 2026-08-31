import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { sfx } from '../../lib/sfx';
import { usePractiseStore } from './store';
import type { PracticeRoom } from './types';
import { BreathOrb } from './BreathOrb';
import { Card, Fade, PractiseShell, PrimaryButton, TopBar } from './ui';

/**
 * Meditation Practice Room — the redesigned daily meditation practice (formerly
 * "Today"). A calm, unhurried place for short guided sits, styled after the
 * meditation-player mockups. Completions count toward the on-device practice
 * journey, so daily sitting builds the same visible strength as the gym.
 */

interface Sit {
  id: string;
  title: string;
  sub: string;
  minutes: number;
  glyph: string;
  /** Gentle guidance lines, shown one at a time during the sit. */
  script: string[];
}

const SITS: Sit[] = [
  {
    id: 'arrive', title: 'Arrive & Settle', sub: 'Land in the present moment', minutes: 3, glyph: '🌅',
    script: [
      'Let your body settle. Nothing to fix, nowhere to be.',
      'Feel the weight of yourself held by the chair or floor.',
      'Notice the sounds around you, without following any of them.',
      'Rest here, arriving fully into this moment.',
    ],
  },
  {
    id: 'breath', title: 'Breath Focus', sub: 'Steady the mind with the breath', minutes: 5, glyph: '🌬️',
    script: [
      'Bring attention to the breath, wherever you feel it most.',
      'No need to change it — just notice it coming and going.',
      'When the mind wanders, gently return. That return is the practice.',
      'Breath in… breath out… softening a little each time.',
    ],
  },
  {
    id: 'body', title: 'Body Scan', sub: 'Release held tension', minutes: 7, glyph: '🫧',
    script: [
      'Bring awareness to the top of your head, and let it soften.',
      'Move slowly down — face, shoulders, chest — releasing as you go.',
      'Notice any place that’s holding, and breathe into it.',
      'Rest in the whole body, settled and at ease.',
    ],
  },
  {
    id: 'letgo', title: 'Letting Go', sub: 'Set something down for now', minutes: 4, glyph: '🍃',
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

export function MeditationPracticeRoom() {
  const { streak, minutes } = usePractiseStore();
  const [active, setActive] = useState<Sit | null>(null);

  if (active) return <SitPlayer sit={active} onExit={() => setActive(null)} />;

  return (
    <PractiseShell variant="adult">
      <Fade keyId="med-home">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>Meditation Practice Room</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--p-muted)' }}>A quiet place to sit. Choose a short practice.</p>
          </div>
          <div className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
            🔥 {streak} · {Math.floor(minutes / 60)}h {minutes % 60}m
          </div>
        </div>

        {/* Hero */}
        <Card className="mt-5 overflow-hidden text-center" style={{ background: 'linear-gradient(160deg, var(--p-accent-soft), var(--p-surface))', border: 'none' }}>
          <div className="flex flex-col items-center gap-3 py-2">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="grid h-24 w-24 place-items-center rounded-full text-4xl text-white"
              style={{ background: 'radial-gradient(circle at 50% 40%, var(--p-accent-soft), var(--p-accent))' }}
            >
              🌙
            </motion.div>
            <div>
              <div className="text-lg font-bold" style={{ color: 'var(--p-ink)' }}>Take a moment for yourself</div>
              <div className="text-[13px]" style={{ color: 'var(--p-muted)' }}>Even a few minutes builds the muscle of presence.</div>
            </div>
            <div className="w-full max-w-xs pt-1">
              <PrimaryButton onClick={() => { sfx.chime(); setActive(SITS[0]); }}>
                <span className="inline-flex items-center gap-2"><Play size={16} /> Begin today’s sit</span>
              </PrimaryButton>
            </div>
          </div>
        </Card>

        {/* Practice list */}
        <div className="mt-6 mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>
          Guided practices
        </div>
        <div className="space-y-3">
          {SITS.map((s) => (
            <Card key={s.id} onClick={() => { sfx.tap(); setActive(s); }} className="flex items-center gap-4 !p-4">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: 'var(--p-accent-soft)' }}>
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

/** A minimal calm player: breathing orb, rotating guidance, a soft timer. */
function SitPlayer({ sit, onExit }: { sit: Sit; onExit: () => void }) {
  const store = usePractiseStore();
  const total = sit.minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [playing, setPlaying] = useState(true);
  const [line, setLine] = useState(0);
  const [done, setDone] = useState(false);
  const logged = useRef(false);

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
      sfx.chime();
    }
    setDone(true);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  if (done) {
    return (
      <PractiseShell variant="adult">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
          <div className="text-6xl">🌿</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>Practice complete.</h2>
          <p className="max-w-sm text-sm" style={{ color: 'var(--p-muted)' }}>
            You gave yourself {sit.minutes} minutes of presence. That’s a rep — it counts.
          </p>
          <div className="w-full max-w-xs">
            <PrimaryButton onClick={onExit}>Back to the room</PrimaryButton>
          </div>
        </div>
      </PractiseShell>
    );
  }

  return (
    <PractiseShell variant="adult">
      <TopBar title={sit.title} onBack={onExit} right={
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--p-accent)' }}>{mm}:{ss}</span>
      } />
      <div className="flex flex-col items-center">
        <BreathOrb />
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 max-w-sm text-center text-base font-medium"
            style={{ color: 'var(--p-ink)' }}
          >
            {sit.script[line]}
          </motion.p>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-6">
          <button onClick={() => { setRemaining(total); setPlaying(true); sfx.tap(); }} aria-label="Restart" className="rounded-full p-3 hover:bg-black/5" style={{ color: 'var(--p-muted)' }}>
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => { setPlaying((p) => !p); sfx.tap(); }}
            className="grid h-16 w-16 place-items-center rounded-full text-white shadow-lg"
            style={{ background: 'var(--p-accent)' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={26} /> : <Play size={26} />}
          </button>
          <button onClick={finishEarly} aria-label="Finish" className="rounded-full p-3 hover:bg-black/5" style={{ color: 'var(--p-muted)' }}>
            <Sparkles size={20} />
          </button>
        </div>
        <p className="mt-4 text-[12px]" style={{ color: 'var(--p-muted)' }}>
          {playing ? 'Follow the breath. When the mind wanders, gently return.' : 'Paused — take your time.'}
        </p>
      </div>
    </PractiseShell>
  );
}

export default MeditationPracticeRoom;
