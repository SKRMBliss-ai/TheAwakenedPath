import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, RefreshCw, Check } from 'lucide-react';
import { getPracticeDay, practiceDateKey, PRESIT_CHECKS, VIRTUES } from './practiceContent';
import { calcStreak, emptyLog, loadDay, loadRecent, saveDay } from './practiceService';
import type { PracticeLog } from './practiceService';

interface Props {
  user: { uid: string; displayName: string | null; email: string | null };
  onBack: () => void;
}

const CARD = 'bg-slate-800/50 rounded-2xl border border-white/8';
const EYEBROW = 'text-white/40 text-[10px] uppercase tracking-widest font-bold';

/**
 * Daily Practice — the contemplative half of the morning.
 *
 * The invocation, the teaching and the virtue all come from the date, so what
 * someone reads here alone is the same thing the guide reads aloud in the live
 * room. The log is a single document per day, so leaving the tab and coming
 * back continues the day rather than starting a second copy of it.
 */
export default function DailyPractice({ user, onBack }: Props) {
  const [offset, setOffset] = useState(0);
  const [log, setLog] = useState<PracticeLog | null>(null);
  const [recent, setRecent] = useState<PracticeLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const day = useMemo(() => getPracticeDay(new Date(), offset), [offset]);
  const today = practiceDateKey();

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadDay(user.uid, today), loadRecent(user.uid)]).then(([d, r]) => {
      if (cancelled) return;
      setLog(d ?? emptyLog(today, day.virtue.key));
      setRecent(r);
    });
    return () => { cancelled = true; };
    // day.virtue.key only seeds a brand-new log; re-running on offset would discard edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid, today]);

  /**
   * Persist immediately — a check the user ticks should survive closing the tab.
   *
   * The write is kept out of the setState updater on purpose: updaters must stay
   * pure, and StrictMode invokes them twice, which would fire two saves for every
   * tick. Reading from `log` here means patch is only ever called from handlers
   * that already have the loaded day in scope.
   */
  const patch = useCallback(async (fields: Partial<PracticeLog>) => {
    if (!log) return;
    const next = { ...log, ...fields };
    setLog(next);
    setSaving(true);
    try {
      await saveDay(user.uid, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
      setRecent(await loadRecent(user.uid));
    } catch (err) {
      console.error('[DailyPractice] save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [user.uid, log]);

  const togglePresit = (key: string) => {
    if (!log) return;
    const has = log.presit.includes(key);
    patch({ presit: has ? log.presit.filter(k => k !== key) : [...log.presit, key] });
  };

  // Days of this virtue's week already practised — the week, not all time.
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - day.dayInWeek);
  const virtueDays = recent.filter(
    l => l.virtuePractised && l.virtueKey === day.virtue.key && l.date >= practiceDateKey(weekStart),
  ).length;

  const streak = calcStreak(recent);

  if (!log) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-t-amber-400 border-white/10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10 max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <Flame size={14} /> {streak} day{streak === 1 ? '' : 's'}
            </span>
          )}
          <span className="text-white/30 text-xs">{saving ? 'Saving…' : saved ? 'Saved ✓' : ''}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-light text-white/90 tracking-wide">Daily Practice</h1>
        <p className="text-white/40 text-sm mt-1">
          Week {day.virtue.week} of 9 · Day {day.dayInWeek + 1} of 7 · {day.virtue.name}
        </p>
      </div>

      {/* ── The Three Sacred Attitudes ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-400/8 via-rose-400/5 to-transparent p-5 sm:p-6">
        <p className="text-amber-400/90 text-[10px] uppercase tracking-[0.16em] font-bold mb-4">
          The Three Sacred Attitudes · spoken aloud
        </p>
        <div className="space-y-3 text-white/85 leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
          {([
            ['Love', day.invocation.love, 'text-amber-400'],
            ['Focus', day.invocation.focus, 'text-rose-300'],
            ['Surrender', day.invocation.surrender, 'text-teal-300'],
          ] as const).map(([label, text, colour]) => (
            <p key={label}>
              <span className={`${colour} not-italic font-bold text-[10px] uppercase tracking-[0.13em] mr-2`}>{label}</span>
              {text}
            </p>
          ))}
          <p className="pt-3 border-t border-white/10">{day.invocation.close}</p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap mt-5">
          <Toggle
            on={log.invocationSpoken}
            label={log.invocationSpoken ? 'Read aloud ✓' : 'Read aloud'}
            onClick={() => patch({ invocationSpoken: !log.invocationSpoken })}
          />
          <button
            onClick={() => setOffset(o => o + 1)}
            className="flex items-center gap-1.5 text-white/35 hover:text-amber-400 text-xs transition-colors"
          >
            <RefreshCw size={12} /> another
          </button>
        </div>
      </motion.div>

      {/* ── Today's teaching ── */}
      <div className={`${CARD} p-5`}>
        <p className={`${EYEBROW} mb-3`}>✦ Today's teaching</p>
        <p className="text-white/80 leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
          {day.highlight}
        </p>
      </div>

      {/* ── This week's virtue ── */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-rose-400/8 to-teal-400/5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-rose-300 text-[10px] uppercase tracking-[0.13em] font-bold mb-1">This week's virtue</p>
            <h2 className="text-2xl font-light text-white/90">{day.virtue.name}</h2>
          </div>
          <WeekRing done={virtueDays} />
        </div>

        <p className="text-white/50 text-sm leading-relaxed mt-3 border-l-2 border-white/10 pl-3 italic">
          {day.virtue.desc}
        </p>

        <p className={`${EYEBROW} mt-5 mb-2`}>Today's prayer</p>
        <p className="text-white/85 leading-relaxed italic text-lg" style={{ fontFamily: 'Georgia, serif' }}>
          {day.prayer}
        </p>

        <p className={`${EYEBROW} mt-5 mb-2`}>Where to practise today</p>
        <div className="space-y-2">
          {day.ideas.map(idea => (
            <div key={idea.place} className="flex gap-3 items-start bg-slate-900/50 rounded-xl border border-white/8 p-3">
              <span className="text-lg leading-none shrink-0">{idea.icon}</span>
              <p className="text-white/75 text-sm leading-relaxed">
                <strong className="text-white/90">{idea.place}</strong> — {idea.how}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Toggle
            on={log.virtuePractised}
            label={log.virtuePractised ? 'Practised ✓' : 'Practised today'}
            onClick={() => patch({ virtuePractised: !log.virtuePractised, virtueKey: day.virtue.key })}
          />
        </div>
      </div>

      {/* ── Before you sit ── */}
      <div className={`${CARD} p-5`}>
        <p className={`${EYEBROW} mb-3`}>Before you sit</p>
        <div className="space-y-1">
          {PRESIT_CHECKS.map(check => {
            const on = log.presit.includes(check.key);
            return (
              <button
                key={check.key}
                onClick={() => togglePresit(check.key)}
                className="w-full text-left flex gap-3 items-start py-2.5 border-b border-white/5 last:border-0"
              >
                <Box on={on} />
                <span>
                  <span className={`block text-sm ${on ? 'text-teal-300' : 'text-white/80'}`}>{check.text}</span>
                  <span className="block text-white/35 text-xs mt-0.5 leading-relaxed">{check.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── The sit ── */}
      <div className={`${CARD} p-5 space-y-4`}>
        <p className={EYEBROW}>Today's sit</p>

        <Toggle
          on={log.sat}
          label={log.sat ? 'I sat today ✓' : 'I sat today'}
          onClick={() => patch({ sat: !log.sat })}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className={`${EYEBROW} block mb-2`}>Minutes</span>
            <input
              type="number" min={0} step={5} inputMode="numeric"
              value={log.minutes ?? ''}
              onChange={e => setLog(p => (p ? { ...p, minutes: e.target.value === '' ? null : Number(e.target.value) } : p))}
              onBlur={() => patch({ minutes: log.minutes })}
              placeholder="e.g. 20"
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm outline-none focus:border-amber-400/50"
            />
          </label>

          <div>
            <span className={`${EYEBROW} block mb-2`}>How settled was it?</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => patch({ settled: log.settled === n ? null : n })}
                  aria-label={`Settled ${n} of 5`}
                  className={`w-9 h-9 rounded-full border text-xs transition-colors ${
                    log.settled && n <= log.settled
                      ? 'bg-amber-400/15 border-amber-400/50 text-amber-400'
                      : 'bg-slate-900/60 border-white/10 text-white/40 hover:border-white/25'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          <span className={`${EYEBROW} block mb-2`}>Evening reflection</span>
          <textarea
            value={log.reflection}
            onChange={e => setLog(p => (p ? { ...p, reflection: e.target.value } : p))}
            onBlur={() => patch({ reflection: log.reflection })}
            rows={3}
            placeholder="What did you notice today? Where did the quality show up — or not?"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white/90 text-sm outline-none focus:border-amber-400/50 resize-y"
          />
        </label>
      </div>

      {/* ── The nine virtues at a glance ── */}
      <div className={`${CARD} p-5`}>
        <p className={`${EYEBROW} mb-3`}>The nine virtues</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {VIRTUES.map(v => {
            const isNow = v.key === day.virtue.key;
            const isPast = v.week < day.virtue.week;
            return (
              <div
                key={v.key}
                className={`rounded-xl border px-2.5 py-2 text-center ${
                  isNow ? 'border-amber-400/50 bg-amber-400/10'
                    : isPast ? 'border-teal-400/25 bg-teal-400/5'
                    : 'border-white/8 bg-slate-900/40'
                }`}
              >
                <span className={`block text-[11px] ${isNow ? 'text-amber-400' : isPast ? 'text-teal-300' : 'text-white/45'}`}>
                  {v.name}
                </span>
                <span className="block text-white/25 text-[9px] mt-0.5">Week {v.week}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent days ── */}
      {recent.length > 0 && (
        <div className={`${CARD} p-5`}>
          <p className={`${EYEBROW} mb-3`}>Recent days</p>
          <div className="space-y-2">
            {recent.slice(0, 10).map(entry => (
              <div key={entry.date} className="flex items-center gap-3 text-sm border-b border-white/5 last:border-0 pb-2 last:pb-0">
                <span className="text-white/35 text-xs w-24 shrink-0 tabular-nums">{entry.date}</span>
                <span className="flex gap-1.5 shrink-0">
                  {entry.invocationSpoken && <Dot title="Invocation spoken" className="bg-amber-400" />}
                  {entry.virtuePractised && <Dot title="Virtue practised" className="bg-rose-300" />}
                  {entry.sat && <Dot title="Sat" className="bg-teal-400" />}
                </span>
                <span className="text-white/50 text-xs truncate">
                  {entry.minutes ? `${entry.minutes} min` : ''}
                  {entry.reflection ? ` · ${entry.reflection}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── small pieces ─────────────────────────────────────────────────────────── */

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition-colors ${
        on ? 'border-teal-400/50 bg-teal-400/12 text-teal-300'
           : 'border-white/12 bg-slate-900/60 text-white/70 hover:border-white/25'
      }`}
    >
      <Box on={on} />
      {label}
    </button>
  );
}

function Box({ on }: { on: boolean }) {
  return (
    <span className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center mt-0.5 ${
      on ? 'bg-teal-400/80 border-teal-400/80' : 'border-white/25'
    }`}>
      {on && <Check size={11} className="text-slate-900" strokeWidth={3.5} />}
    </span>
  );
}

function Dot({ className, title }: { className: string; title: string }) {
  return <span title={title} className={`w-2 h-2 rounded-full inline-block ${className}`} />;
}

/** Seven-segment ring showing how much of this virtue's week is done. */
function WeekRing({ done }: { done: number }) {
  const capped = Math.min(done, 7);
  const circumference = 113;
  const offset = circumference - (capped / 7) * circumference;
  const complete = capped >= 7;
  return (
    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 w-14 h-14">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="4" />
        <circle
          cx="22" cy="22" r="18" fill="none"
          stroke={complete ? '#5eead4' : '#fbbf24'}
          strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className={`relative text-xs font-bold ${complete ? 'text-teal-300' : 'text-amber-400'}`}>
        {capped}/7
      </span>
    </div>
  );
}
