// ─────────────────────────────────────────────────────────────────────────────
// PracticeTools — the screens and small helpers behind the Mantra Pass's
// practice features. Presentational: SoundLibrary owns the audio and the data.
//
//   MalaDeck         counts repetitions (as the chant plays, or by tapping)
//   SankalpTab       a 21 or 40 day vow with streaks
//   PujaTab          mantras in the right order, each a set number of times
//   SleepTimerButton fades the chant out after a chosen time
//   useMediaSession  lock-screen and headphone controls
//   PracticeTeaser   what the pass adds, shown (honestly) before purchase
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { Check, Lock, Moon, Play, Plus, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { VoiceService } from '../../../services/voiceService';
import {
  MALA_OPTIONS, SANKALP_LENGTHS, type SadhanaState, type SankalpProgress,
} from './sadhanaStore';
import { PUJA_REPEATS, type PujaSequence } from './pujaSequences';

// ── Sleep timer ─────────────────────────────────────────────────────────────
const nowMs = () => Date.now();
const SLEEP_OPTIONS = [15, 30, 45, 60] as const;

export function SleepTimerButton() {
  const [open, setOpen] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => nowMs());
  const timers = useRef<{ end?: ReturnType<typeof setTimeout>; fade?: ReturnType<typeof setInterval> }>({});

  const clear = () => {
    if (timers.current.end) clearTimeout(timers.current.end);
    if (timers.current.fade) clearInterval(timers.current.fade);
    timers.current = {};
  };
  useEffect(() => clear, []);

  useEffect(() => {
    if (!endsAt) return;
    const i = setInterval(() => setNow(nowMs()), 15_000);
    return () => clearInterval(i);
  }, [endsAt]);

  const start = (minutes: number) => {
    clear();
    setOpen(false);
    setEndsAt(nowMs() + minutes * 60_000);
    setNow(nowMs());
    timers.current.end = setTimeout(() => {
      // Fade over about 8 seconds so the chant ends softly, then pause and restore the volume.
      const original = VoiceService.volume;
      let v = original;
      timers.current.fade = setInterval(() => {
        v = Math.max(0, v - original / 40);
        VoiceService.setVolume(v);
        if (v <= 0.001) {
          if (timers.current.fade) clearInterval(timers.current.fade);
          VoiceService.stopMusic();
          VoiceService.setVolume(original);
          setEndsAt(null);
          timers.current = {};
        }
      }, 200);
    }, minutes * 60_000);
  };

  const cancel = () => { clear(); setEndsAt(null); setOpen(false); };
  const minsLeft = endsAt ? Math.max(1, Math.ceil((endsAt - now) / 60_000)) : 0;

  return (
    <div className="relative">
      <button type="button" aria-label={endsAt ? `Sleep timer: ${minsLeft} minutes left` : 'Sleep timer'} onClick={() => setOpen((o) => !o)}
        className={cn('p-2 flex items-center gap-1', endsAt ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]')}>
        <Moon size={18} />
        {endsAt && <span className="text-[10px] font-bold tabular-nums">{minsLeft}m</span>}
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-color)] shadow-2xl p-1.5 z-50">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Stop in</p>
          {SLEEP_OPTIONS.map((m) => (
            <button key={m} role="menuitem" onClick={() => start(m)} className="w-full text-left px-2 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">{m} minutes</button>
          ))}
          {endsAt && <button role="menuitem" onClick={cancel} className="w-full text-left px-2 py-2 rounded-lg text-sm text-[var(--accent-primary)] hover:bg-[var(--bg-surface)]">Cancel timer</button>}
        </div>
      )}
    </div>
  );
}

// ── Mala counter ────────────────────────────────────────────────────────────
export function MalaDeck({ title, todayReps, malaTarget, playing, hasTrack, onTarget, onTap, onClear }: {
  title: string | null;
  todayReps: number;
  malaTarget: number;
  playing: boolean;
  hasTrack: boolean;
  onTarget: (n: number) => void;
  onTap: () => void;
  onClear: () => void;
}) {
  const inMala = todayReps % malaTarget;
  const malas = Math.floor(todayReps / malaTarget);
  const pct = (inMala / malaTarget) * 100;
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <section aria-label="Mala counter" className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        <div className="relative w-32 h-32 flex-shrink-0 mx-auto sm:mx-0" role="img" aria-label={`${inMala} of ${malaTarget} in this mala`}>
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--border-subtle)" strokeWidth="7" />
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--accent-primary)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100} style={{ transition: 'stroke-dashoffset .4s ease' }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-serif text-3xl text-[var(--text-primary)] tabular-nums leading-none">{inMala}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">of {malaTarget}</div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] mb-1">Mala counter</p>
          <h2 className="font-serif text-2xl text-[var(--text-primary)] leading-tight mb-1 truncate">{title ?? 'Choose a mantra'}</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {todayReps === 0 ? 'Nothing counted yet today.' : `Today: ${todayReps} repetition${todayReps === 1 ? '' : 's'}`}
            {malas > 0 && ` · ${malas} mala${malas === 1 ? '' : 's'} complete`}
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label="Repetitions in one mala">
            {MALA_OPTIONS.map((n) => (
              <button key={n} type="button" aria-pressed={n === malaTarget} onClick={() => onTarget(n)}
                className={cn('h-8 px-3 rounded-full text-xs font-bold border transition-colors',
                  n === malaTarget ? 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent'
                    : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]')}>{n}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onTap} disabled={!hasTrack}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] text-sm font-bold disabled:opacity-40">
              <Plus size={16} /> Count one by hand
            </button>
            <button type="button" onClick={onClear} disabled={!todayReps}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] disabled:opacity-40">
              <RotateCcw size={14} /> Clear today
            </button>
            <span className="text-xs text-[var(--text-muted)]">{playing ? 'Counting as the chant plays.' : 'Counts each time a chant finishes, or tap to count.'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sankalp tracker ─────────────────────────────────────────────────────────
export function SankalpTab({ state, progress, mantraOptions, titleOf, onStart, onEnd, onChant }: {
  state: SadhanaState;
  progress: SankalpProgress | null;
  mantraOptions: { slug: string; title: string }[];
  titleOf: (slug: string) => string;
  onStart: (slug: string, days: number, daily: number) => void;
  onEnd: () => void;
  onChant: (slug: string, remaining: number) => void;
}) {
  const [slug, setSlug] = useState(state.lastSlug ?? mantraOptions[0]?.slug ?? '');
  const [days, setDays] = useState<number>(21);
  const [daily, setDaily] = useState<number>(state.malaTarget);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const s = state.sankalp;

  if (!s || !progress) {
    return (
      <section aria-label="Start a sankalp" className="rounded-2xl border border-[var(--border-subtle)] p-5">
        <h2 className="font-serif text-2xl text-[var(--text-primary)] mb-1">Begin a sankalp</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-xl">
          A sankalp is a vow to chant one mantra every day for a set number of days. A day counts when you reach your daily number.
          We keep the count and your streak.
        </p>
        <div className="grid gap-4 max-w-xl">
          <label className="block">
            <span className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Mantra</span>
            <select value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-color)] text-[var(--text-primary)] px-3 text-sm">
              {mantraOptions.map((m) => <option key={m.slug} value={m.slug}>{m.title}</option>)}
            </select>
          </label>
          <div>
            <span className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Length</span>
            <div className="flex gap-2" role="group" aria-label="Sankalp length">
              {SANKALP_LENGTHS.map((n) => (
                <button key={n} type="button" aria-pressed={n === days} onClick={() => setDays(n)}
                  className={cn('h-10 px-5 rounded-full text-sm font-bold border',
                    n === days ? 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]')}>{n} days</button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Repetitions each day</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Daily repetitions">
              {MALA_OPTIONS.map((n) => (
                <button key={n} type="button" aria-pressed={n === daily} onClick={() => setDaily(n)}
                  className={cn('h-9 px-4 rounded-full text-sm font-bold border',
                    n === daily ? 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]')}>{n}</button>
              ))}
            </div>
          </div>
          <button type="button" disabled={!slug} onClick={() => onStart(slug, days, daily)}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] font-bold text-sm disabled:opacity-40">
            Begin {days}-day sankalp
          </button>
          <p className="text-xs text-[var(--text-muted)]">Your count is saved on this device.</p>
        </div>
      </section>
    );
  }

  const remaining = Math.max(0, s.daily - progress.todayReps);
  return (
    <section aria-label="Your sankalp" className="rounded-2xl border border-[var(--border-subtle)] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] mb-1">{s.days}-day sankalp</p>
      <h2 className="font-serif text-2xl text-[var(--text-primary)] leading-tight mb-1">{titleOf(s.slug)}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        <strong className="text-[var(--text-primary)]">{progress.doneDays}</strong> of {s.days} days complete
        {progress.streak > 0 && <> · <strong className="text-[var(--text-primary)]">{progress.streak}</strong> day streak</>}
      </p>

      {progress.complete ? (
        <p className="rounded-xl bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-primary)] mb-4">
          Your {s.days}-day sankalp is complete. May it bear fruit. You can begin another whenever you wish.
        </p>
      ) : (
        <div className="rounded-xl bg-[var(--bg-surface)] p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm text-[var(--text-primary)] font-semibold">
              {progress.todayDone ? 'Today is complete' : `Today: ${progress.todayReps} of ${s.daily}`}
            </span>
            {!progress.todayDone && (
              <button type="button" onClick={() => onChant(s.slug, remaining)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] text-xs font-bold">
                <Play size={13} fill="currentColor" /> Chant {remaining} now
              </button>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={s.daily} aria-valuenow={Math.min(s.daily, progress.todayReps)}>
            <div className="h-full bg-[var(--accent-primary)]" style={{ width: `${Math.min(100, (progress.todayReps / s.daily) * 100)}%` }} />
          </div>
        </div>
      )}

      <ol className="grid grid-cols-7 gap-1.5 mb-4" aria-label="Days of the sankalp">
        {progress.cells.map((c, i) => (
          <li key={c.key} title={`Day ${i + 1}${c.state === 'done' ? ': done' : c.state === 'missed' ? ': missed' : ''}`}
            className={cn('aspect-square rounded-lg grid place-items-center text-[11px] font-bold border',
              c.state === 'done' && 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent',
              c.state === 'today' && 'border-[var(--accent-primary)] text-[var(--accent-primary)]',
              c.state === 'missed' && 'border-[var(--border-subtle)] text-[var(--text-muted)] line-through opacity-70',
              c.state === 'upcoming' && 'border-[var(--border-subtle)] text-[var(--text-muted)] opacity-40')}>
            {c.state === 'done' ? <Check size={14} /> : i + 1}
          </li>
        ))}
      </ol>

      {confirmEnd ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--text-secondary)]">End this sankalp?</span>
          <button type="button" onClick={() => { onEnd(); setConfirmEnd(false); }} className="font-bold text-[var(--accent-primary)]">Yes, end it</button>
          <button type="button" onClick={() => setConfirmEnd(false)} className="font-bold text-[var(--text-secondary)]">Keep going</button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmEnd(true)} className="text-xs font-semibold text-[var(--text-muted)] underline">End this sankalp</button>
      )}
      <p className="text-xs text-[var(--text-muted)] mt-3">Saved on this device. A missed day does not reset your count.</p>
    </section>
  );
}

// ── Puja sequences ──────────────────────────────────────────────────────────
export function PujaTab({ sequences, repeats, onRepeats, onBegin, active }: {
  sequences: { seq: PujaSequence; steps: { slug: string; title: string }[] }[];
  repeats: number;
  onRepeats: (n: number) => void;
  onBegin: (seqId: string) => void;
  active: { name: string; step: number; steps: number; round: number; total: number } | null;
}) {
  return (
    <section aria-label="Puja sequences">
      <p className="text-sm text-[var(--text-secondary)] mb-3 max-w-xl">
        Press play once. Each mantra is chanted the number of times you choose, then the next begins, in the traditional order.
      </p>
      <div className="flex flex-wrap items-center gap-2 mb-5" role="group" aria-label="Times each mantra is chanted">
        <span className="text-xs font-bold text-[var(--text-secondary)] mr-1">Each mantra</span>
        {PUJA_REPEATS.map((n) => (
          <button key={n} type="button" aria-pressed={n === repeats} onClick={() => onRepeats(n)}
            className={cn('h-8 px-3 rounded-full text-xs font-bold border',
              n === repeats ? 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]')}>{n}×</button>
        ))}
      </div>
      {active && (
        <p className="rounded-xl bg-[var(--bg-surface)] p-3 mb-4 text-sm text-[var(--text-primary)]" role="status">
          <strong>{active.name}</strong> · step {active.step} of {active.steps} · round {Math.min(active.round + 1, active.total)} of {active.total}
        </p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {sequences.map(({ seq, steps }) => (
          <li key={seq.id} className="rounded-2xl border border-[var(--border-subtle)] p-4 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-1">{seq.occasion}</p>
            <h3 className="font-serif text-xl text-[var(--text-primary)] mb-1">{seq.name}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">{seq.blurb}</p>
            <ol className="text-xs text-[var(--text-secondary)] mb-4 space-y-0.5 list-decimal list-inside">
              {steps.map((st) => <li key={st.slug}>{st.title}</li>)}
            </ol>
            <button type="button" onClick={() => onBegin(seq.id)}
              className="mt-auto inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] text-sm font-bold">
              <Play size={14} fill="currentColor" /> Begin · {steps.length} mantras × {repeats}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── What the pass adds (before purchase) ────────────────────────────────────
export function PracticeTeaser({ onUnlock, price }: { onUnlock: () => void; price: string }) {
  const items = [
    ['Mala counter', 'Counts every repetition as the chant plays, with a soft bell at the end of each mala.'],
    ['Sankalp tracker', 'A 21 or 40 day vow with a daily target, a streak and a day-by-day record.'],
    ['Puja sequences', 'Diwali, Dhanteras, Chhath and more: mantras in the right order, played from one press.'],
    ['Sleep timer and lock-screen controls', 'Fade out after 15 to 60 minutes; pause, play and skip from the lock screen.'],
  ];
  return (
    <section aria-label="Practice tools" className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-4 sm:p-5 mb-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] mb-1">With the Mantra Pass</p>
      <h2 className="font-serif text-2xl text-[var(--text-primary)] mb-3">Tools for your daily practice</h2>
      <ul className="grid gap-2.5 sm:grid-cols-2 mb-4">
        {items.map(([h, b]) => (
          <li key={h} className="flex gap-2.5 text-sm">
            <Lock size={14} className="mt-1 flex-shrink-0 text-[var(--text-muted)]" />
            <span><strong className="text-[var(--text-primary)]">{h}.</strong> <span className="text-[var(--text-secondary)]">{b}</span></span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onUnlock}
        className="inline-flex items-center h-10 px-5 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] text-sm font-bold">
        Unlock · {price}
      </button>
    </section>
  );
}
