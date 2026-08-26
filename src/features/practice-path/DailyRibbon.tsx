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
  DIARY_CATEGORIES, categoryCount, anyLapse, diaryTouched,
  type DiaryCategory,
} from './diaryModel';
import {
  gratitudeForDay, dailyPrayerForDay, reflectionForDay,
  type Gratitude, type DailyPrayer,
} from './dailyWisdom';
import { MonthMirror } from './MonthMirror';

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
  // Deliberately not "good morning" — mornings are greeted by the gratitude card.
  return new Date().getHours() < 12 ? 'Begin in gratitude' : 'Welcome back';
}

export default function DailyRibbon() {
  const { user } = useAuth();
  const uid = user?.uid;
  const date = todayKey();
  const { day, patch } = usePracticeDay(uid, date);
  const history = usePracticeHistory(uid, 400);

  const [shuffle, setShuffle] = useState(0);
  const [gratShuffle, setGratShuffle] = useState(0);
  const [prayerShuffle, setPrayerShuffle] = useState(0);
  const [showMonth, setShowMonth] = useState(false);
  const teaching = useMemo(() => teachingForDay(date), [date]);
  const gratitude = gratitudeForDay(date, gratShuffle);
  const dailyPrayer = dailyPrayerForDay(date, prayerShuffle);
  const reflection = reflectionForDay(date);
  const isMorning = new Date().getHours() < 12;

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

      {/* ── Morning gratitude — greets the first half of the day ── */}
      {isMorning && (
        <GratitudeCard gratitude={gratitude} onShuffle={() => setGratShuffle((s) => s + 1)} />
      )}

      {/* ── Today's prayer — one longer prayer a day, the daily inspiration ── */}
      <DailyPrayerCard prayer={dailyPrayer} onShuffle={() => setPrayerShuffle((s) => s + 1)} />

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

          <div className="flex items-center justify-between mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
            <span className="text-[13px] text-[var(--text-primary)]">Time in practice</span>
            <span className="text-[12px] text-[var(--text-muted)]">
              {d.minutes ? `${d.minutes} min · from your sit` : 'add it above'}
            </span>
          </div>

          <button
            onClick={() => setShowMonth(true)}
            className="mt-3 w-full rounded-xl border py-2.5 text-[12.5px] font-semibold transition-colors"
            style={{ borderColor: 'var(--practice-accent-line)', color: 'var(--practice-accent)', background: 'var(--practice-accent-soft)' }}
          >
            🪞 See your Monthly Mirror — where this becomes progress
          </button>
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

        {/* ── A thought to carry — a longer reflection, collapsed by default ── */}
        <ReflectionCard reflection={reflection} />
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

      <AnimatePresence>
        {showMonth && (
          <MonthMirror uid={uid} history={history} onClose={() => setShowMonth(false)} />
        )}
      </AnimatePresence>
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

/** One virtue in the diary. Collapsed, it is a single line carrying its Sixfold
 *  and Nine-Virtue links. Tapping it opens the everyday prompts — each a concrete
 *  thing to look for — recorded with one tap. Lapse virtues read gold ("noted"),
 *  the good virtue reads green ("done"); nothing is required. */
function DiaryRow({
  cat, marks, onToggleSub, onClearCategory,
}: {
  cat: DiaryCategory;
  marks?: Record<string, boolean>;
  onToggleSub: (sub: string, next: boolean) => void;
  onClearCategory: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = categoryCount(marks);
  const marked = count > 0;
  const good = cat.polarity === 'good';
  // Good acts read green; lapses read gold. An untouched lapse is "held" (green
  // check); an untouched good virtue is a quiet dash, inviting rather than pass/fail.
  const accent = good
    ? { color: 'var(--done-accent)', line: 'var(--done-accent-line)', soft: 'var(--done-accent-soft)' }
    : marked
      ? { color: 'var(--practice-accent)', line: 'var(--practice-accent-line)', soft: 'var(--practice-accent-soft)' }
      : { color: 'var(--done-accent)', line: 'var(--done-accent-line)', soft: 'var(--done-accent-soft)' };

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
            style={{ borderColor: accent.line, background: accent.soft, color: accent.color }}
          >
            {marked ? count : good ? '·' : '✓'}
          </span>
          <span className="flex-1">
            <span className="block text-[13.5px] text-[var(--text-primary)]">{cat.label}</span>
            <span className="block text-[11px] text-[var(--text-muted)]">{cat.tradition}</span>
          </span>
        </button>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <InfoTag glyph="🧭" name={cat.sixfold} why={cat.why} color="var(--virtue-accent)"
            line="var(--virtue-accent-line)" soft="var(--virtue-accent-soft)" />
          <InfoTag glyph="✦" name={cat.virtues[0]} label={cat.virtues.join(' · ')} why={cat.virtueWhy}
            color="var(--practice-accent)" line="var(--practice-accent-line)" soft="var(--practice-accent-soft)" />
        </div>
        <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0 w-12 text-right">
          {marked ? `${count} ${good ? 'done' : 'noted'}` : good ? '—' : 'held'}
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
            <div className="px-3 pb-3 pt-1 pl-11 space-y-1">
              {cat.sublines.map(([subKey, subLabel]) => {
                const on = !!marks?.[subKey];
                return (
                  <button
                    key={subKey}
                    onClick={() => onToggleSub(subKey, !on)}
                    className="w-full flex items-start gap-2.5 text-left rounded-lg px-2 py-1.5 transition-colors active:scale-[0.99]"
                    style={{ background: on ? accent.soft : 'transparent' }}
                  >
                    <span
                      className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center text-[10px]"
                      style={{
                        borderColor: on ? accent.line : 'var(--border-subtle)',
                        background: on ? accent.color : 'transparent',
                        color: on ? '#1a1410' : 'transparent',
                      }}
                    >
                      ✓
                    </span>
                    <span className="text-[12.5px] leading-snug" style={{ color: on ? accent.color : 'var(--text-secondary)' }}>
                      {subLabel}
                    </span>
                  </button>
                );
              })}
              {marked && (
                <button
                  onClick={onClearCategory}
                  className="mt-1 ml-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  clear this virtue
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Morning gratitude — the first-half-of-day greeting. Lead line always shown;
 *  "open" reveals the fuller prayer. Rotates daily, reshuffle for another. */
function GratitudeCard({ gratitude, onShuffle }: { gratitude: Gratitude; onShuffle: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-4 rounded-2xl border p-4"
      style={{ borderColor: 'var(--done-accent-line)', background: 'var(--done-accent-soft)' }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: 'var(--done-accent)' }}>
        🌅 Morning gratitude
      </p>
      <p className="text-[15.5px] leading-relaxed font-serif text-[var(--text-primary)]">{gratitude.lead}</p>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[13px] leading-relaxed text-[var(--text-secondary)] mt-2 overflow-hidden"
          >
            {gratitude.body}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="mt-2 flex items-center gap-4">
        <button onClick={() => setOpen((o) => !o)} className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          {open ? 'less' : 'read'}
        </button>
        <button onClick={onShuffle} className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <RefreshCw size={10} /> another
        </button>
      </div>
    </motion.div>
  );
}

/** Today's prayer — one longer, sectioned prayer a day. Collapsed to a title and
 *  opening line; "open the prayer" reveals every section. Rotates daily, with a
 *  reshuffle, so there is always something new to come back for. */
function DailyPrayerCard({ prayer, onShuffle }: { prayer: DailyPrayer; onShuffle: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="mb-6 rounded-2xl border p-4"
      style={{ borderColor: 'var(--practice-accent-line)', background: 'var(--practice-accent-soft)' }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.28em] mb-1" style={{ color: 'var(--practice-accent)' }}>
        🙏 Today’s prayer
      </p>
      <p className="text-[15px] font-serif text-[var(--text-primary)] mb-1.5">{prayer.title}</p>
      <p className="text-[14px] leading-relaxed font-serif italic text-[var(--text-secondary)]">{prayer.opening}</p>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3 space-y-3"
          >
            {prayer.sections.map((s, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: 'var(--practice-accent)' }}>
                  {i + 1} · {s.heading}
                </p>
                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
              </div>
            ))}
            <p className="text-[12px] text-[var(--text-muted)] text-center pt-1">— may only Love remain —</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2.5 flex items-center gap-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-[11px] font-semibold"
          style={{ color: 'var(--practice-accent)' }}
        >
          {open ? 'close the prayer' : 'open the prayer'}
        </button>
        <button onClick={onShuffle} className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <RefreshCw size={10} /> another
        </button>
      </div>
    </motion.div>
  );
}

/** A longer reflection to carry into the day — collapsed to one line, expands on
 *  "read". Rotates daily; the full passages live in dailyWisdom.ts. */
function ReflectionCard({ reflection }: { reflection: { lead: string; body: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)] mb-2">
        ✨ A thought to carry
      </p>
      <p className="text-[14.5px] leading-relaxed font-serif text-[var(--text-primary)]">{reflection.lead}</p>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[13px] leading-relaxed text-[var(--text-secondary)] mt-2 overflow-hidden"
          >
            {reflection.body}
          </motion.p>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        {open ? 'less' : 'read'}
      </button>
    </div>
  );
}

/** A framework link on a diary virtue — the Sixfold flow (compass) or the Nine
 *  Virtues (star) it belongs to. Hover (desktop) or tap (mobile) reveals why
 *  they connect, so the diary, the Sixfold Path and the Nine Virtues read as
 *  one framework seen from three sides rather than three separate systems. */
function InfoTag({
  glyph, name, label, why, color, line, soft,
}: {
  glyph: string; name: string; label?: string; why: string;
  color: string; line: string; soft: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="text-[10px] rounded-full px-2 py-1 border transition-colors whitespace-nowrap"
        style={{ borderColor: line, background: soft, color }}
      >
        {glyph} {name}
      </button>
      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 w-56 z-20 rounded-xl border p-3 text-left shadow-xl"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary, #110e16)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color }}>
            {label ?? name}
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
