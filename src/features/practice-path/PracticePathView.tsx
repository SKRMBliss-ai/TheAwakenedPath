import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../auth/AuthContext';
import {
  invocationOfDay, teachingOfDay, prayerOfDay, todayKey,
} from './dailyRhythm';
import {
  usePracticeDay, usePracticeHistory, useVirtueWeekProgress,
} from './usePracticeDay';
import { QUESTION_META } from '../practices/questionMeta';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';
import { TwoPillars } from './TwoPillars';
import { QuietMode } from './QuietMode';
import { PostSit } from './PostSit';
import { MorningGlance } from './MorningGlance';
import { ringBell } from './bell';
import { SideRails } from './SideRails';
import { WeeklyLetter } from './WeeklyLetter';
import { CurriculumTrack } from './CurriculumTrack';
import { VIRTUES } from './virtues';
import { useCurriculumProgress } from './useCurriculumProgress';
import { useSitTimer } from './useSitTimer';
import {
  practiceWeekNumber, practiceDayNumber, dayContentFor,
} from './practiceOfWeek';
import { useWeekAssignment, useCarryThread, lastCarryForward } from './usePracticeOfWeek';

interface PracticePathViewProps {
  onOpenVirtues?: () => void;
  onOpenPractices?: () => void;
  onOpenSixfold?: (key: string) => void;
  onOpenJournal?: () => void;
  /** The Wisdom Untethered question assigned for this week, if any. */
  weeklyQuestionId?: string;
  weeklyLabel?: string;
  onOpenQuestion?: (questionId: string) => void;
}

/** A step in the ritual — numbered so the sequence reads as a sequence. */
function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <section className="relative pl-9 sm:pl-11">
      <div className="absolute left-0 top-0 flex flex-col items-center h-full">
        <div className="w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
          {n}
        </div>
        <div className="flex-1 w-px bg-[var(--border-subtle)]/60 my-1" />
      </div>
      <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)] mb-2">
        {label}
      </div>
      <div className="pb-7">{children}</div>
    </section>
  );
}

function CheckPill({
  done, onClick, doneLabel, label,
}: { done: boolean; onClick: () => void; doneLabel: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium border transition-colors',
        done
          ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] text-[var(--done-accent)]'
          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
      )}
    >
      <span className={cn(
        'w-4 h-4 rounded-full grid place-items-center border',
        done ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]',
      )}>
        {done && <Check size={11} className="text-[var(--on-accent)]" strokeWidth={3} />}
      </span>
      {done ? doneLabel : label}
    </button>
  );
}

export function PracticePathView({
  onOpenVirtues, onOpenPractices, onOpenSixfold, onOpenJournal,
  weeklyQuestionId, weeklyLabel, onOpenQuestion,
}: PracticePathViewProps) {
  const { user } = useAuth();
  const uid = user?.uid;
  const date = todayKey();

  const { day, patch } = usePracticeDay(uid, date);
  const history = usePracticeHistory(uid);
  const { virtue, done: virtueDays } = useVirtueWeekProgress(history);

  const [invoShuffle, setInvoShuffle] = useState(0);
  const [teachShuffle, setTeachShuffle] = useState(0);
  const [glanceDismissed, setGlanceDismissed] = useState(false);
  const [postSit, setPostSit] = useState<number | null>(null);
  const [sitMinutes, setSitMinutes] = useState(20);

  // ── Practice of the Week ──
  const week = practiceWeekNumber();
  const dayN = practiceDayNumber();
  const { practice } = useWeekAssignment(week);
  const carryThread = useCarryThread(uid);
  const carried = useMemo(() => lastCarryForward(carryThread, week), [carryThread, week]);

  // Per-day engaged/practised states across this practice week.
  const practiceWeekStates = useMemo(() => {
    const start = new Date(new Date().getTime() - (dayN - 1) * 86400000);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getTime() + i * 86400000);
      const key = todayKey(d);
      const rec = history.find((h) => h.date === key);
      if (rec?.practicePractised) return 'practised' as const;
      if (rec?.practiceEngaged) return 'engaged' as const;
      return 'none' as const;
    });
  }, [history, dayN]);

  // Resurfacing acknowledgement — only when this practice has been seen before.
  const resurfaced = useMemo(() => {
    if (!practice) return null;
    const prior = history
      .filter((h) => h.practiceId === practice.practiceId && h.practiceReflection)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (!prior.length) return null;
    const weeksAgo = Math.max(1, Math.round(
      (Date.now() - new Date(prior[0].date + 'T00:00:00').getTime()) / (7 * 86400000)));
    return { gap: weeksAgo, lastReflection: prior[0].practiceReflection };
  }, [practice, history]);

  const timer = useSitTimer((mins) => setPostSit(mins));

  // Quiet Mode lines come from the day's ACTUAL practice, never generic filler.
  const quietLines = useMemo(() => {
    const out: string[] = [];
    if (practice) {
      if (practice.core) out.push(practice.core);
      (practice.instructions ?? []).slice(0, 3).forEach((i) => out.push(i));
      const c = dayContentFor(practice, Math.max(1, dayN));
      if (c.invitation) out.push(c.invitation);
    }
    out.push(prayerOfDay(virtue, new Date()));
    out.push('Return, gently.', 'Nothing to achieve. Only to be here.');
    return out;
  }, [practice, dayN, virtue]);

  // Consistency over the last 30 days — see the note where it is rendered.
  const consistency = useMemo(() => {
    const cut = todayKey(new Date(Date.now() - 29 * 86400000));
    return history.filter((h) => h.sat && h.date >= cut).length;
  }, [history]);

  // Curriculum completion, read from each course's own records.
  const completedLessons = useCurriculumProgress(uid);

  // Rail progress: days practised per virtue, across all history.
  const virtueProgress = useMemo(() => {
    const out: Record<string, number> = {};
    VIRTUES.forEach((v) => {
      out[v.key] = history.filter((h) => h.virtuePractised && h.virtueKey === v.key).length;
    });
    return out;
  }, [history]);

  // The letter appears on Sunday, or on day 7 of the practice week.
  const showLetter = new Date().getDay() === 0 || dayN === 7;
  const weekSits = useMemo(() => {
    const start = todayKey(new Date(Date.now() - (dayN - 1) * 86400000));
    return history.filter((h) => h.sat && h.date >= start).length;
  }, [history, dayN]);
  const longestReflection = useMemo(() => {
    const start = todayKey(new Date(Date.now() - (dayN - 1) * 86400000));
    return history
      .filter((h) => h.date >= start && h.practiceReflection)
      .map((h) => h.practiceReflection!)
      .sort((a, b) => b.length - a.length)[0] ?? null;
  }, [history, dayN]);

  const satToday = !!day?.sat;
  const showGlance = new Date().getHours() < 12 && !satToday && !glanceDismissed && !timer.running;

  const invocation = invocationOfDay(new Date(), invoShuffle);
  const teaching = teachingOfDay(new Date(), teachShuffle);

  // The live count includes today, which the history query may not have yet.
  const virtueDoneToday = !!day?.virtuePractised && day?.virtueKey === virtue.key;
  const virtueCount = Math.min(
    virtueDays + (virtueDoneToday && !history.some((h) => h.date === date && h.virtuePractised) ? 1 : 0),
    7,
  );

  // Morning glance replaces the whole view until the day has begun.
  if (showGlance) {
    return (
      <MorningGlance
        name={user?.displayName?.split(' ')[0] ?? ''}
        invitation={
          practice
            ? dayContentFor(practice, Math.max(1, dayN)).invitation
            : 'Take a few minutes to sit.'
        }
        onBegin={() => { setGlanceDismissed(true); timer.start(20); }}
        onOpenFullDay={() => setGlanceDismissed(true)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <QuietMode
        open={timer.running}
        remaining={timer.remaining}
        total={timer.total}
        practiceTitle={practice?.title ?? 'Meditation'}
        lines={quietLines}
        onExit={() => {
          const mins = timer.endEarly();
          if (mins > 0) setPostSit(mins);
        }}
      />
      <PostSit
        open={postSit !== null}
        minutes={postSit ?? 0}
        onChoose={(settled) => {
          patch({ sat: true, minutes: postSit ?? undefined, settled });
          setPostSit(null);
        }}
        onSkip={() => {
          patch({ sat: true, minutes: postSit ?? undefined });
          setPostSit(null);
        }}
      />

      <SideRails
        virtueProgress={virtueProgress}
        onOpenVirtue={() => onOpenVirtues?.()}
        onOpenSixfold={(k) => onOpenSixfold?.(k)}
      />

      {showLetter && (
        <WeeklyLetter
          weekNumber={week}
          practiceTitle={practice?.title}
          sits={weekSits}
          practisedDays={practiceWeekStates.filter((x) => x === 'practised').length}
          virtueDays={virtueCount}
          carriedIn={carried?.text ?? null}
          longestReflection={longestReflection}
        />
      )}

      <CurriculumTrack
        completed={completedLessons}
        onOpenLesson={(_tab, qid) => { if (qid) onOpenQuestion?.(qid); }}
      />

      {/* ── Consistency strip ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          // "N of the last 30" rather than a streak: a streak that resets to
          // zero after one missed day punishes illness and travel hardest,
          // which is exactly when someone most needs to keep going.
          { n: `${consistency}`, sub: '/30', l: 'days this month' },
          { n: history.filter((d) => d.sat).length, l: 'days in all' },
          { n: `${virtueCount}/7`, l: virtue.name.toLowerCase() },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-3">
            <div className="text-2xl font-serif font-semibold text-[var(--accent-primary)] leading-none">
              {s.n}{'sub' in s && s.sub ? <span className="text-[15px] text-[var(--text-muted)] font-normal">{s.sub}</span> : null}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div>
        {/* ── 1 · Invocation ── */}
        <Step n={1} label="Spoken aloud">
          <div className="rounded-2xl border border-[var(--accent-primary)]/35 p-5"
               style={{ background: 'linear-gradient(160deg, var(--practice-accent-soft), var(--virtue-accent-soft) 60%, transparent)' }}>
            <div className="space-y-3 font-serif italic text-[15px] leading-relaxed text-[var(--text-primary)]">
              {([['Love', invocation.love], ['Focus', invocation.focus], ['Surrender', invocation.surrender]] as const).map(
                ([lead, body]) => (
                  <p key={lead}>
                    <span className="not-italic font-bold text-[10px] uppercase tracking-[0.14em] mr-2 text-[var(--accent-primary)]">
                      {lead}
                    </span>
                    {body}
                  </p>
                ),
              )}
              <p className="pt-3 border-t border-[var(--border-subtle)]">{invocation.close}</p>
            </div>
            <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
              <CheckPill
                done={!!day?.invocationRead}
                onClick={() => patch({ invocationRead: !day?.invocationRead })}
                label="Read aloud"
                doneLabel="Read aloud ✓"
              />
              <button
                onClick={() => setInvoShuffle((s) => s + 1)}
                className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <RefreshCw size={12} /> another
              </button>
            </div>
          </div>
        </Step>

        {/* ── 2 · Teaching ── */}
        <Step n={2} label="Today's teaching">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 p-5">
            <p className="font-serif italic text-[15.5px] leading-relaxed text-[var(--text-primary)]">
              {teaching}
            </p>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setTeachShuffle((s) => s + 1)}
                className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <RefreshCw size={12} /> another
              </button>
            </div>
          </div>
        </Step>

        {/* ── 3 · This week's virtue ── */}
        {/* -- 3 - The two pillars: virtue + practice, with the Sixfold frame -- */}
        <Step n={3} label="This week - everyone together">
          <TwoPillars
            virtueDays={virtueCount}
            virtueDoneToday={virtueDoneToday}
            onToggleVirtue={() => patch({ virtuePractised: !virtueDoneToday, virtueKey: virtue.key })}
            onOpenVirtue={() => onOpenVirtues?.()}
            practice={practice}
            practiceWeekStates={practiceWeekStates}
            practiceDoneToday={!!day?.practicePractised}
            onTogglePractice={() => patch({
              practicePractised: !day?.practicePractised,
              practiceEngaged: true,
              practiceId: practice?.practiceId,
            })}
            onOpenPractice={() => onOpenPractices?.()}
            practiceReflection={day?.practiceReflection ?? ''}
            onSaveReflection={(t) => patch({ practiceReflection: t, practiceEngaged: true })}
            carried={carried}
            resurfaced={resurfaced}
            onOpenSixfold={(k) => onOpenSixfold?.(k)}
          />
        </Step>


        {/* ── 4 · Before you sit ── */}
        <Step n={4} label="Before you sit">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 divide-y divide-[var(--border-subtle)]">
            {([
              ['breath', 'Steady deep breathing, 2–5 minutes', 'Slow the breath to quieten the nervous system before you begin.'],
              ['posture', 'Settle the posture and the hands', 'Spine upright but not rigid. Hold the hands lightly, not resting heavily.'],
              ['connect', 'Connect before you close the eyes', 'Take a moment with whatever you hold sacred — let it settle in the heart, not just the mind.'],
            ] as const).map(([key, title, sub]) => {
              const on = !!day?.[key];
              return (
                <button
                  key={key}
                  onClick={() => patch({ [key]: !on })}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-[var(--bg-surface)]/60 transition-colors"
                >
                  <span className={cn(
                    'w-4 h-4 mt-0.5 rounded-full grid place-items-center border flex-shrink-0',
                    on ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]',
                  )}>
                    {on && <Check size={11} className="text-[var(--on-accent)]" strokeWidth={3} />}
                  </span>
                  <span>
                    <span className={cn('block text-[14px]', on ? 'text-[var(--done-accent)]' : 'text-[var(--text-primary)]')}>
                      {title}
                    </span>
                    <span className="block text-[12px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Step>

        {/* ── 5 · This week's question ──
            Folded in from the old Dashboard widget so there is ONE daily
            sequence rather than a ritual here and a course task elsewhere. */}
        {weeklyQuestionId && QUESTION_META[weeklyQuestionId] && (
          <Step n={5} label={weeklyLabel || 'This week in the course'}>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 p-5">
              <div className="text-[16px] font-serif text-[var(--text-primary)]">
                {QUESTION_META[weeklyQuestionId].shortTitle}
              </div>
              <p className="text-[13.5px] text-[var(--text-secondary)] mt-2 leading-relaxed italic">
                {QUESTION_META[weeklyQuestionId].dailyIntent}
              </p>
              {PRACTICE_LIBRARY[weeklyQuestionId] && (
                <p className="text-[12.5px] text-[var(--text-muted)] mt-2.5">
                  Practice · {PRACTICE_LIBRARY[weeklyQuestionId].name}
                </p>
              )}
              {onOpenQuestion && (
                <button
                  onClick={() => onOpenQuestion(weeklyQuestionId)}
                  className="mt-3 text-[12.5px] text-[var(--accent-primary)] hover:underline"
                >
                  Open this week's teaching →
                </button>
              )}
            </div>
          </Step>
        )}

        {/* ── 6 · Log the sit ── */}
        <Step n={weeklyQuestionId && QUESTION_META[weeklyQuestionId] ? 6 : 5} label="Log today's sit">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 p-5 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <CheckPill
                done={!!day?.sat}
                onClick={() => patch({ sat: !day?.sat })}
                label="I sat today"
                doneLabel="Sat today ✓"
              />
              <div className="flex items-center gap-2">
                <select
                  value={sitMinutes}
                  onChange={(e) => setSitMinutes(Number(e.target.value))}
                  aria-label="Sit length in minutes"
                  className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                >
                  {[5, 10, 15, 20, 25, 30, 40, 45, 60].map((m) => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>
                <button
                  onClick={() => timer.start(sitMinutes)}
                  className="px-4 py-2 rounded-full text-[12.5px] font-bold bg-[var(--accent-solid)] text-[var(--on-accent)] hover:opacity-90"
                >
                  Begin sit
                </button>
                <button
                  onClick={() => ringBell('start')}
                  title="Hear the bell"
                  className="px-3 py-2 rounded-full text-[13px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  🔔
                </button>
              </div>
            </div>
            <p className="text-[11.5px] text-[var(--text-muted)]">
              A bell sounds at the start and the end. Minutes fill in automatically.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pp-min" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
                  Minutes
                </label>
                <input
                  id="pp-min"
                  type="number"
                  min={0}
                  step={5}
                  value={day?.minutes ?? ''}
                  onChange={(e) => patch({ minutes: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="20"
                  className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
                  How settled?
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => patch({ settled: day?.settled === n ? undefined : n })}
                      className={cn(
                        'w-9 h-9 rounded-full border text-[13px] transition-colors',
                        day?.settled === n
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="pp-refl" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
                Evening reflection
              </label>
              <textarea
                id="pp-refl"
                value={day?.reflection ?? ''}
                onChange={(e) => patch({ reflection: e.target.value })}
                rows={3}
                placeholder={`Where did ${virtue.name.toLowerCase()} show up today — or not?`}
                className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-y"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Saved automatically. Private to you.
              </p>
            </div>

            {onOpenJournal && (
              <button onClick={onOpenJournal} className="text-[12.5px] text-[var(--accent-primary)] hover:underline">
                Open the full journal →
              </button>
            )}
          </div>
        </Step>
      </div>

      {/* ── Recent days ── */}
      {history.length > 0 && (
        <div>
          <h2 className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)] mb-3">
            Recent days
          </h2>
          <div className="space-y-2">
            {history.slice(0, 10).map((d, i) => (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 px-4 py-3"
              >
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', d.sat ? 'bg-[var(--done-accent)]' : 'bg-[var(--border-subtle)]')} />
                <span className="text-[13px] text-[var(--text-secondary)] w-24 flex-shrink-0">
                  {new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <span className="text-[12px] text-[var(--text-muted)] flex-1 truncate">
                  {[
                    d.sat && d.minutes ? `${d.minutes} min` : d.sat ? 'sat' : null,
                    d.settled ? `settled ${d.settled}/5` : null,
                    d.virtuePractised ? 'virtue ✓' : null,
                  ].filter(Boolean).join(' · ') || '—'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
