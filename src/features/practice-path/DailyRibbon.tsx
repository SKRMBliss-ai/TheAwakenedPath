import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { usePracticeDay, usePracticeHistory, type PracticeDay } from './usePracticeDay';
import { todayKey } from './dailyRhythm';
import {
  teachingForDay, promptForDay, LANDED_OPTIONS, TECHNIQUES, DURATIONS,
} from './dailyContent';

/**
 * The Daily Practice ribbon — one calm, scrolling ritual that folds the day's
 * teaching, the sit, the self-introspection diary, and a single go-deeper
 * prompt into five minutes. Everything writes into the one-doc-per-day record
 * (usePracticeDay), so the day keeps a single source of truth.
 *
 * Design law: a blank day is a COMPLETE day. Nothing is required, nothing turns
 * red, every input is one tap, and typing is always optional — so a busy person
 * can finish without the keyboard. Progress is FELT (the orb brightens), never
 * counted (no bar, no streak that breaks).
 */

const DIARY_ITEMS: { key: keyof NonNullable<PracticeDay['diary']>; label: string; hint: string }[] = [
  { key: 'nonharm', label: 'Non-harming', hint: 'Ahimsa — in thought, word, deed' },
  { key: 'truthful', label: 'Truthful', hint: 'honesty without a mask' },
  { key: 'restraint', label: 'Restraint', hint: 'energy kept, not leaked' },
  { key: 'humility', label: 'Humility', hint: 'no pride of knowing, having, ruling' },
  { key: 'love', label: 'Love for all', hint: 'no one held in ill will' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DailyRibbon() {
  const { user } = useAuth();
  const uid = user?.uid;
  const date = todayKey();
  const { day, patch } = usePracticeDay(uid, date);
  const history = usePracticeHistory(uid, 400);

  const [shuffle, setShuffle] = useState(0);
  const teaching = useMemo(() => teachingForDay(date), [date]);

  const d = day ?? { date };
  const firstName = (user?.displayName || '').split(' ')[0];

  // ── Felt progress: how many of the four bands have been touched ──
  const touched = {
    teaching: !!d.teachingLanded,
    meditation: !!d.technique || !!d.minutes || !!d.sat,
    diary: !!d.diary && Object.keys(d.diary).length > 0,
    deeper: !!d.deeperNote,
  };
  const glow = Object.values(touched).filter(Boolean).length / 4;

  // ── "Days shown up" — a number that WAITS through a missed day, never resets ──
  const daysShownUp = useMemo(() => {
    const meaningful = (x: PracticeDay) =>
      x.sat || x.minutes || x.teachingLanded || x.deeperNote ||
      (x.diary && Object.keys(x.diary).length > 0);
    const set = new Set(history.filter(meaningful).map((x) => x.date));
    if (touched.teaching || touched.meditation || touched.diary || touched.deeper) set.add(date);
    return set.size;
  }, [history, date, touched.teaching, touched.meditation, touched.diary, touched.deeper]);

  const hasLapse = !!d.diary && DIARY_ITEMS.some((i) => (d.diary?.[i.key] as number) > 0);
  const prompt = promptForDay(date, { settled: d.settled, hasLapse, shuffle });

  return (
    <div className="max-w-xl mx-auto px-4 pb-16">
      {/* ── Header + the day-orb ── */}
      <div className="flex flex-col items-center text-center pt-6 pb-8">
        <DayOrb glow={glow} />
        <h1 className="mt-5 text-[22px] font-serif text-[var(--text-primary)]">
          {greeting()}{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--text-muted)] max-w-xs">
          Five quiet minutes. Begin wherever you like — anything you leave is still a whole day.
        </p>
      </div>

      <div className="space-y-4">
        {/* ── 1 · Teaching ── */}
        <Band icon="☀" title="Teaching" done={touched.teaching} delay={0}>
          <blockquote className="text-[16px] leading-relaxed font-serif text-[var(--text-primary)] border-l-2 border-[var(--practice-accent-line)] pl-3">
            “{teaching.quote}”
            <footer className="mt-1 text-[11px] not-italic tracking-wide text-[var(--text-muted)]">
              — {teaching.source}
            </footer>
          </blockquote>
          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] mb-1.5">What landed?</p>
            <div className="flex flex-wrap gap-2">
              {LANDED_OPTIONS.map((o) => (
                <Chip
                  key={o.key}
                  active={d.teachingLanded === o.key}
                  onClick={() => patch({ teachingLanded: o.key, teachingId: teaching.id })}
                >
                  {o.emoji} {o.label}
                </Chip>
              ))}
            </div>
          </div>
          <LineInput
            placeholder="One line, if you wish…"
            value={d.teachingNote ?? ''}
            onCommit={(v) => patch({ teachingNote: v })}
          />
        </Band>

        {/* ── 2 · Meditation ── */}
        <Band icon="🪷" title="Meditation" done={touched.meditation} delay={0.05}>
          <FieldLabel>Technique</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {TECHNIQUES.map((t) => (
              <Chip
                key={t.key}
                active={d.technique === t.key}
                onClick={() => patch({ technique: t.key, sat: true })}
              >
                {t.emoji} {t.label}
              </Chip>
            ))}
          </div>

          <FieldLabel className="mt-3">How long</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <Chip key={m} active={d.minutes === m} onClick={() => patch({ minutes: m, sat: true })}>
                {m} min
              </Chip>
            ))}
          </div>

          <FieldLabel className="mt-3">How was it</FieldLabel>
          <Scale
            value={d.settled ?? 0}
            onChange={(v) => patch({ settled: v, sat: true })}
            lowLabel="restless"
            highLabel="settled"
          />
        </Band>

        {/* ── 3 · Diary (simple) ── */}
        <Band icon="📿" title="A gentle look" done={touched.diary} delay={0.1}>
          <p className="text-[12px] text-[var(--text-muted)] -mt-1 mb-2">
            Noted without judgment, then let go. Tap only what slipped.
          </p>
          <div className="space-y-1.5">
            {DIARY_ITEMS.map((item) => {
              const slipped = (d.diary?.[item.key] as number) > 0;
              return (
                <button
                  key={item.key}
                  onClick={() => patch({ diary: { ...d.diary, [item.key]: slipped ? 0 : 1 } })}
                  className="w-full flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-left transition-colors"
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[11px]"
                    style={{
                      borderColor: slipped ? 'var(--practice-accent-line)' : 'var(--done-accent-line)',
                      background: slipped ? 'var(--practice-accent-soft)' : 'var(--done-accent-soft)',
                      color: slipped ? 'var(--practice-accent)' : 'var(--done-accent)',
                    }}
                  >
                    {slipped ? '·' : '✓'}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13.5px] text-[var(--text-primary)]">{item.label}</span>
                    <span className="block text-[11px] text-[var(--text-muted)]">{item.hint}</span>
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">{slipped ? 'slipped' : 'held'}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
            <span className="text-[13px] text-[var(--text-primary)]">Time in practice</span>
            <span className="text-[12px] text-[var(--text-muted)]">
              {d.minutes ? `${d.minutes} min · from your sit` : 'add it above'}
            </span>
          </div>

          <FieldLabel className="mt-3">Selfless service today</FieldLabel>
          <div className="flex gap-2">
            <Chip
              active={!!d.diary?.servicePhysical}
              onClick={() => patch({ diary: { ...d.diary, servicePhysical: !d.diary?.servicePhysical } })}
            >
              🤲 With my hands
            </Chip>
            <Chip
              active={!!d.diary?.serviceGiving}
              onClick={() => patch({ diary: { ...d.diary, serviceGiving: !d.diary?.serviceGiving } })}
            >
              🎁 By giving
            </Chip>
          </div>
        </Band>

        {/* ── 4 · Go deeper ── */}
        <Band icon="🌙" title="Go deeper" done={touched.deeper} delay={0.15}>
          <p className="text-[15px] leading-relaxed font-serif text-[var(--text-primary)]">{prompt}</p>
          <LineInput
            placeholder="A word, a line — whatever is true."
            value={d.deeperNote ?? ''}
            onCommit={(v) => patch({ deeperNote: v })}
          />
          <button
            onClick={() => setShuffle((s) => s + 1)}
            className="mt-2 inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <RefreshCw size={11} /> another prompt
          </button>
        </Band>
      </div>

      {/* ── Arrival ── */}
      <div className="text-center mt-8">
        <p className="text-[13px] text-[var(--text-secondary)]">
          {glow === 1 ? 'Arrived. The day is complete.' : glow > 0 ? 'However far you went today is enough.' : 'Whenever you’re ready.'}
        </p>
        {daysShownUp > 0 && (
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {daysShownUp} {daysShownUp === 1 ? 'day' : 'days'} of showing up — never a streak to break.
          </p>
        )}
      </div>
    </div>
  );
}

// ── The day-orb: a soft light that brightens as bands are touched ─────────────
function DayOrb({ glow }: { glow: number }) {
  const size = 76;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      <div
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 45%, var(--virtue-accent), var(--practice-accent) 70%)`,
          opacity: 0.35 + glow * 0.55,
          boxShadow: `0 0 ${12 + glow * 40}px ${glow * 10}px var(--virtue-accent-soft)`,
          transform: `scale(${0.86 + glow * 0.14})`,
        }}
      />
      <div
        className="absolute rounded-full transition-all duration-700"
        style={{
          inset: '30%',
          background: 'var(--text-primary)',
          opacity: 0.08 + glow * 0.14,
        }}
      />
    </motion.div>
  );
}

// ── Building blocks ───────────────────────────────────────────────────────────
function Band({
  icon, title, done, delay, children,
}: { icon: string; title: string; done: boolean; delay: number; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="rounded-2xl border p-4 transition-colors"
      style={{
        borderColor: done ? 'var(--done-accent-line)' : 'var(--border-subtle)',
        background: done ? 'var(--done-accent-soft)' : 'var(--bg-surface)',
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[15px]">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)] flex-1">
          {title}
        </span>
        {done && <span className="text-[11px]" style={{ color: 'var(--done-accent)' }}>✓</span>}
      </div>
      {children}
    </motion.section>
  );
}

function FieldLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] mb-1.5 ${className}`}>
      {children}
    </p>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-[13px] border transition-all active:scale-95"
      style={{
        borderColor: active ? 'transparent' : 'var(--border-subtle)',
        background: active ? 'var(--accent-solid)' : 'var(--bg-surface)',
        color: active ? 'var(--on-accent)' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

function Scale({
  value, onChange, lowLabel, highLabel,
}: { value: number; onChange: (v: number) => void; lowLabel: string; highLabel: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            aria-label={`${n} of 5`}
            className="flex-1 h-9 rounded-lg border transition-all active:scale-95"
            style={{
              borderColor: value >= n && value > 0 ? 'transparent' : 'var(--border-subtle)',
              background: value >= n && value > 0 ? 'var(--accent-solid)' : 'var(--bg-surface)',
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[11px] text-[var(--text-muted)]">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

/** A one-line input that commits on blur / Enter, so we don't write on every
 *  keystroke but the ritual still feels instant. */
function LineInput({
  placeholder, value, onCommit,
}: { placeholder: string; value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  // Sync the draft when the stored value changes underneath (e.g. first load
  // from Firestore) using React's adjust-state-during-render pattern rather than
  // an effect. Safe because `value` only changes on load or after our own
  // commit — never mid-typing, since we don't write per keystroke.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }
  const commit = () => { if (draft !== value) onCommit(draft.trim()); };
  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      placeholder={placeholder}
      className="w-full mt-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] px-3 py-2 text-[13.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
    />
  );
}
