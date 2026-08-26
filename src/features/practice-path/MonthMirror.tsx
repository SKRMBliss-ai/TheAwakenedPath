import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { DIARY_CATEGORIES, categoryCount } from './diaryModel';
import type { PracticeDay } from './usePracticeDay';

/**
 * Your Monthly Mirror — where a month of daily taps becomes visible.
 *
 * This is the "why" of the whole diary: you cannot change what you do not first
 * see. The mirror gathers the month's honest noticing not to judge, but to show
 * where attention is needed and how far the practice has already carried you.
 * Deliberately un-branded — no lineage name — because the reason it matters is
 * universal: awareness is the first agent of change.
 *
 * Private by construction: reads the owner's own practiceDays (already loaded)
 * and writes the month reflection to users/{uid}/diaryMonths/{YYYY-MM}, which
 * the owner-only subcollection rule protects.
 */

const MONTH_FIELDS = [
  { key: 'stillness', label: 'Stillness', prompt: 'How readily did you find inner quiet this month?' },
  { key: 'clarity', label: 'Clarity', prompt: 'What did you begin to see more truly?' },
  { key: 'listening', label: 'The quiet', prompt: 'What did the stillness show or tell you?' },
  { key: 'resistance', label: 'Resistance', prompt: 'Where did practice feel hardest — and why?' },
] as const;

function currentMonth(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function MonthMirror({
  uid, history, onClose,
}: {
  uid: string | null | undefined;
  history: PracticeDay[];
  onClose: () => void;
}) {
  const [month, setMonth] = useState(currentMonth());
  const [refl, setRefl] = useState<Record<string, string>>({});

  // Month-end reflection, loaded/saved to its own doc.
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'users', uid, 'diaryMonths', month);
    return onSnapshot(ref, (snap) => setRefl((snap.data()?.reflection as Record<string, string>) ?? {}));
  }, [uid, month]);

  const saveRefl = (key: string, value: string) => {
    if (!uid) return;
    const next = { ...refl, [key]: value };
    setRefl(next);
    setDoc(doc(db, 'users', uid, 'diaryMonths', month), { month, reflection: next, updatedAt: serverTimestamp() }, { merge: true });
  };

  const days = useMemo(() => history.filter((d) => d.date.startsWith(month)), [history, month]);

  // ── Aggregate the month ──
  const summary = useMemo(() => {
    const practiceDays = days.filter((d) => d.sat || d.minutes).length;
    const practiceMinutes = days.reduce((a, d) => a + (d.minutes ?? 0), 0);
    const activeDays = new Set(
      days.filter((d) => d.sat || d.minutes || d.teachingLanded || d.deeperNote || (d.diary && Object.keys(d.diary).length))
        .map((d) => d.date),
    ).size;

    const categories = DIARY_CATEGORIES.map((cat) => {
      const sublines = cat.sublines.map(([key, label]) => ({
        key, label,
        count: days.filter((d) => d.diary?.[cat.key]?.[key]).length,
      }));
      const total = days.reduce((a, d) => a + categoryCount(d.diary?.[cat.key]), 0);
      return { cat, total, sublines };
    });

    const service = categories.find((c) => c.cat.polarity === 'good');
    const serviceActs = service?.total ?? 0;

    // The single most-recurring lapse — the month's clearest place to grow.
    let topLapse: { label: string; virtue: string; count: number } | undefined;
    for (const c of categories) {
      if (c.cat.polarity !== 'lapse') continue;
      for (const s of c.sublines) {
        if (s.count > 0 && (!topLapse || s.count > topLapse.count)) {
          topLapse = { label: s.label, virtue: c.cat.label, count: s.count };
        }
      }
    }

    return { practiceDays, practiceMinutes, activeDays, categories, serviceActs, topLapse };
  }, [days]);

  const maxCount = Math.max(1, ...summary.categories.flatMap((c) => c.sublines.map((s) => s.count)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] overflow-y-auto"
      style={{ background: 'var(--bg-primary, #0c0910)' }}
    >
      <div className="max-w-xl mx-auto px-4 pb-20 pt-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: 'var(--practice-accent)' }}>
            🪞 Your Monthly Mirror
          </p>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] mb-4">
          You cannot change what you do not first see. This is a month of your own honest noticing —
          not a scorecard, but a mirror. What you can see, you can soften. This is where the practice
          quietly becomes progress.
        </p>

        {/* Month selector */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)]">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[15px] font-serif text-[var(--text-primary)] w-40 text-center">{monthLabel(month)}</span>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={month >= currentMonth()}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <Stat value={summary.activeDays} label="days shown up" />
          <Stat value={summary.practiceMinutes} label="minutes in practice" />
          <Stat value={summary.serviceActs} label="acts of service" tone="good" />
        </div>

        {/* Pattern, gently */}
        {summary.topLapse ? (
          <div className="rounded-2xl border p-4 mb-5" style={{ borderColor: 'var(--practice-accent-line)', background: 'var(--practice-accent-soft)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--practice-accent)' }}>
              Where your attention is most needed
            </p>
            <p className="text-[14px] text-[var(--text-primary)]">
              <span className="font-serif">“{summary.topLapse.label}”</span> — noticed {summary.topLapse.count}{' '}
              {summary.topLapse.count === 1 ? 'day' : 'days'} this month, under {summary.topLapse.virtue}.
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">
              This is not a failing — it is the exact edge where your growth is waiting. Simply seeing it is half the work.
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--text-muted)] mb-5 text-center">
            No lapses noted yet this month. Fill the diary a few days and your patterns will appear here.
          </p>
        )}

        {/* Per-virtue breakdown */}
        <div className="space-y-3 mb-6">
          {summary.categories.map(({ cat, total, sublines }) => (
            <div key={cat.key} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13.5px] text-[var(--text-primary)]">{cat.label}</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {total} {cat.polarity === 'good' ? 'done' : 'noted'}
                </span>
              </div>
              <div className="space-y-1.5">
                {sublines.map((s) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <span className="text-[11.5px] text-[var(--text-secondary)] w-40 flex-shrink-0 truncate">{s.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(s.count / maxCount) * 100}%`,
                          background: cat.polarity === 'good' ? 'var(--done-accent)' : 'var(--practice-accent)',
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] w-6 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Month-end reflection */}
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--virtue-accent-line)', background: 'var(--virtue-accent-soft)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-1" style={{ color: 'var(--virtue-accent)' }}>
            Looking back on the month
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mb-3">
            A few quiet questions, in your own words — the fruit the daily noticing was for.
          </p>
          <div className="space-y-3">
            {MONTH_FIELDS.map((f) => (
              <ReflField key={f.key} field={f} value={refl[f.key] ?? ''} onCommit={(v) => saveRefl(f.key, v)} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: 'good' }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-center">
      <div className="text-[24px] font-serif" style={{ color: tone === 'good' ? 'var(--done-accent)' : 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">{label}</div>
    </div>
  );
}

function ReflField({
  field, value, onCommit,
}: {
  field: { label: string; prompt: string };
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [last, setLast] = useState(value);
  if (value !== last) { setLast(value); setDraft(value); }
  return (
    <div>
      <p className="text-[12px] font-semibold text-[var(--text-primary)]">{field.label}</p>
      <p className="text-[11.5px] text-[var(--text-muted)] mb-1">{field.prompt}</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (draft !== value) onCommit(draft.trim()); }}
        rows={2}
        placeholder="A line or two, if you wish…"
        className="w-full rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-y"
      />
    </div>
  );
}
