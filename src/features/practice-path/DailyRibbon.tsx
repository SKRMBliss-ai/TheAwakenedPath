import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { usePracticeDay, usePracticeHistory, type PracticeDay } from './usePracticeDay';
import { todayKey } from './dailyRhythm';
import {
  teachingForDay, promptForDay, LANDED_OPTIONS, TECHNIQUES, DURATIONS,
} from './dailyContent';
import {
  DIARY_CATEGORIES, categoryLapses, anyLapse, diaryTouched,
  type DiaryCategory,
} from './diaryModel';

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
    diary: diaryTouched(d.diary),
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

  const prompt = promptForDay(date, { settled: d.settled, hasLapse: anyLapse(d.diary), shuffle });

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

        {/* ── 3 · Diary (granular, optional) ── */}
        <Band icon="📿" title="A gentle look" done={touched.diary} delay={0.1}>
          <p className="text-[12px] text-[var(--text-muted)] -mt-1 mb-2">
            Optional. Noted without judgment, then let go — tap a virtue to look closer.
          </p>
          <div className="space-y-1.5">
            {DIARY_CATEGORIES.map((cat) => (
              <DiaryRow
                key={cat.key}
                cat={cat}
                marks={d.diary?.[cat.key]}
                onToggleSub={(sub, next) =>
                  patch({ diary: { ...d.diary, [cat.key]: { ...d.diary?.[cat.key], [sub]: next } } })}
                onClearCategory={() => patch({ diary: { ...d.diary, [cat.key]: {} } })}
              />
            ))}
          </div>

          {/* Diet + service — single-line observations */}
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip
              active={!!d.diary?.diet}
              onClick={() => patch({ diary: { ...d.diary, diet: !d.diary?.diet } })}
            >
              🍎 Diet slipped
            </Chip>
            <Chip
              active={!!d.diary?.servicePhysical}
              onClick={() => patch({ diary: { ...d.diary, servicePhysical: !d.diary?.servicePhysical } })}
            >
              🤲 Served with my hands
            </Chip>
            <Chip
              active={!!d.diary?.serviceGiving}
              onClick={() => patch({ diary: { ...d.diary, serviceGiving: !d.diary?.serviceGiving } })}
            >
              🎁 Served by giving
            </Chip>
          </div>

          <div className="flex items-center justify-between mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
            <span className="text-[13px] text-[var(--text-primary)]">Time in practice</span>
            <span className="text-[12px] text-[var(--text-muted)]">
              {d.minutes ? `${d.minutes} min · from your sit` : 'add it above'}
            </span>
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

/** One ethical virtue in the diary. Collapsed, it is a single held/slipped line
 *  carrying its Sixfold link. Tapping it opens the sub-lines (thought / word /
 *  deed, etc.) for granular recording — depth on demand, never forced. */
function DiaryRow({
  cat, marks, onToggleSub, onClearCategory,
}: {
  cat: DiaryCategory;
  marks?: Record<string, boolean>;
  onToggleSub: (sub: string, next: boolean) => void;
  onClearCategory: () => void;
}) {
  const [open, setOpen] = useState(false);
  const lapses = categoryLapses(marks);
  const slipped = lapses > 0;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 flex-1 text-left">
          <ChevronRight
            size={13}
            className="flex-shrink-0 text-[var(--text-muted)] transition-transform"
            style={{ transform: open ? 'rotate(90deg)' : 'none' }}
          />
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[11px]"
            style={{
              borderColor: slipped ? 'var(--practice-accent-line)' : 'var(--done-accent-line)',
              background: slipped ? 'var(--practice-accent-soft)' : 'var(--done-accent-soft)',
              color: slipped ? 'var(--practice-accent)' : 'var(--done-accent)',
            }}
          >
            {slipped ? lapses : '✓'}
          </span>
          <span className="flex-1">
            <span className="block text-[13.5px] text-[var(--text-primary)]">{cat.label}</span>
            <span className="block text-[11px] text-[var(--text-muted)]">{cat.tradition}</span>
          </span>
        </button>
        <SixfoldTag name={cat.sixfold} why={cat.why} />
        <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0 w-12 text-right">
          {slipped ? `${lapses} noted` : 'held'}
        </span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 pl-11">
              <div className="flex flex-wrap gap-2">
                {cat.sublines.map(([subKey, subLabel]) => {
                  const on = !!marks?.[subKey];
                  return (
                    <button
                      key={subKey}
                      onClick={() => onToggleSub(subKey, !on)}
                      className="rounded-full px-3 py-1.5 text-[12.5px] border transition-all active:scale-95"
                      style={{
                        borderColor: on ? 'var(--practice-accent-line)' : 'var(--border-subtle)',
                        background: on ? 'var(--practice-accent-soft)' : 'transparent',
                        color: on ? 'var(--practice-accent)' : 'var(--text-secondary)',
                        fontWeight: on ? 600 : 400,
                      }}
                    >
                      {subLabel}
                    </button>
                  );
                })}
              </div>
              {slipped && (
                <button
                  onClick={onClearCategory}
                  className="mt-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  clear — held after all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The Sixfold-Path link on a diary virtue. Shows the flow it belongs to as a
 *  small compass pill; hover (desktop) or tap (mobile) reveals why they connect.
 *  So the ethical virtues and the Sixfold Path read as one framework, not two. */
function SixfoldTag({ name, why }: { name: string; why: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative flex-shrink-0 group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="text-[10px] rounded-full px-2 py-1 border transition-colors whitespace-nowrap"
        style={{
          borderColor: 'var(--virtue-accent-line)',
          background: 'var(--virtue-accent-soft)',
          color: 'var(--virtue-accent)',
        }}
      >
        🧭 {name}
      </button>
      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 w-56 z-20 rounded-xl border p-3 text-left shadow-xl"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary, #110e16)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--virtue-accent)' }}>
            {name}
          </p>
          <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{why}</p>
        </div>
      )}
    </div>
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
