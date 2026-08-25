import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import styles from './Triptych.module.css';
import { useAuth } from '../auth/AuthContext';
import {
  invocationOfDay, teachingOfDay, prayerOfDay, todayKey,
} from './dailyRhythm';
import {
  usePracticeDay, usePracticeHistory, useVirtueWeekProgress,
} from './usePracticeDay';
import { QUESTION_META } from '../practices/questionMeta';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';
import { WeekCard } from './WeekCard';
import { LessonCard } from './LessonCard';
import { MeditationCard } from './MeditationCard';
import { QuietMode } from './QuietMode';
import { PostSit } from './PostSit';
import { MorningGlance } from './MorningGlance';
import { SixfoldRail, VirtuesRail } from './SideRails';
import { WeeklyLetter } from './WeeklyLetter';
import { CurriculumTrack } from './CurriculumTrack';
import { VIRTUES } from './virtues';
import { useCurriculumProgress, useLessonToggle } from './useCurriculumProgress';
import { useSitTimer } from './useSitTimer';
import {
  practiceWeekNumber, practiceDayNumber, dayContentFor,
} from './practiceOfWeek';
import { useWeekAssignment, useCarryThread, lastCarryForward } from './usePracticeOfWeek';
import { usePracticeEntries } from './useSharedPractice';

interface PracticePathViewProps {
  onOpenVirtues?: (key?: string) => void;
  onOpenPractices?: () => void;
  onOpenSixfold?: (key: string) => void;
  onOpenJournal?: () => void;
  /** Route to any course tab — used by the lesson card and the track. */
  onOpenTab?: (tab: string, questionId?: string) => void;
  /** The Wisdom Untethered question assigned for this week, if any. */
  weeklyQuestionId?: string;
  weeklyLabel?: string;
  onOpenQuestion?: (questionId: string) => void;
}

export function PracticePathView({
  onOpenVirtues, onOpenPractices, onOpenSixfold, onOpenJournal, onOpenTab,
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

  // Strip counts. Only the member's OWN entries — the strip is a personal
  // tally, so other people's shared insights must not inflate it.
  const { entries } = usePracticeEntries('all', uid);
  const insightCount = entries.filter((e) => e.uid === uid && e.kind === 'insight').length;
  const openQuestionCount = entries.filter(
    (e) => e.uid === uid && e.kind === 'question' && e.status !== 'answered',
  ).length;

  // Curriculum completion, read from each course's own records.
  const completedLessons = useCurriculumProgress(uid);
  const toggleLesson = useLessonToggle(uid);

  // One route for both the track and the lesson card. A Wisdom lesson carries
  // a questionId and has its own deep link; everything else is a plain tab.
  const openLesson = useCallback((tab: string, questionId?: string) => {
    if (questionId && onOpenQuestion) onOpenQuestion(questionId);
    else onOpenTab?.(tab, questionId);
  }, [onOpenQuestion, onOpenTab]);

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
    <div className="space-y-5">
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

      {/* ── streak strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          // "N of the last 30" rather than a streak: a streak that resets to
          // zero after one missed day punishes illness and travel hardest,
          // which is exactly when someone most needs to keep going.
          { n: `${consistency}`, sub: '/30', l: 'days in the last month', c: 'var(--practice-accent)' },
          { n: `${history.filter((d) => d.sat).length}`, l: 'days practised in all', c: 'var(--done-accent)' },
          { n: `${insightCount}`, l: 'insights', c: 'var(--virtue-accent)' },
          { n: `${openQuestionCount}`, l: 'open questions', c: 'var(--practice-accent)' },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5">
            <div className="text-[26px] font-serif font-semibold leading-none" style={{ color: s.c }}>
              {s.n}
              {'sub' in s && s.sub && (
                <span className="text-[15px] text-[var(--text-muted)] font-normal">{s.sub}</span>
              )}
            </div>
            <div className="text-[12px] text-[var(--text-muted)] mt-1.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── persistent curriculum track ── */}
      <CurriculumTrack
        completed={completedLessons}
        onOpenLesson={openLesson}
        onToggleLesson={toggleLesson}
      />

      {/* ── orientation: the weekly letter, when there is one ── */}
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

      {/* ── THREE-COLUMN JOURNEY ── */}
      <div className={styles.triptych}>

        {/* ◀ LEFT RAIL — the Sixfold Path */}
        <SixfoldRail onOpen={(k) => onOpenSixfold?.(k)} />

        {/* ● CENTRE — today's journey */}
        <main className={styles.centre}>

          {/* 1 · this week: virtue + practice, one card */}
          <WeekCard
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

          {/* 2 · today's lesson */}
          <LessonCard
            completed={completedLessons}
            onOpenLesson={openLesson}
            onToggleLesson={toggleLesson}
          />

          {/* 3 · today's meditation + the three sacred attitudes */}
          <MeditationCard
            day={day}
            patch={patch}
            invocation={invocation}
            teaching={teaching}
            onShuffleInvocation={() => setInvoShuffle((s) => s + 1)}
            onShuffleTeaching={() => setTeachShuffle((s) => s + 1)}
            onBeginSit={(mins) => timer.start(mins)}
            virtueName={virtue.name}
            onOpenJournal={onOpenJournal}
          />

          {/* 4 · this week in the course — folded in from the old Dashboard
              widget so there is ONE daily sequence rather than a ritual here
              and a course task elsewhere. */}
          {weeklyQuestionId && QUESTION_META[weeklyQuestionId] && (
            <section className={styles.card}>
              <div className={styles.cap}>{weeklyLabel || 'This week in the course'}</div>
              <div className={styles.clTitle}>{QUESTION_META[weeklyQuestionId].shortTitle}</div>
              <p className="text-[13.5px] text-[var(--text-secondary)] mt-2 leading-relaxed italic">
                {QUESTION_META[weeklyQuestionId].dailyIntent}
              </p>
              {PRACTICE_LIBRARY[weeklyQuestionId] && (
                <p className="text-[12.5px] text-[var(--text-muted)] mt-2.5">
                  Practice · {PRACTICE_LIBRARY[weeklyQuestionId].name}
                </p>
              )}
              {onOpenQuestion && (
                <div className={styles.clAct}>
                  <button className={styles.ghostlink} onClick={() => onOpenQuestion(weeklyQuestionId)}>
                    Open this week's teaching →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* recent days, folded away by default */}
          {history.length > 0 && (
            <details className={styles.recentFold}>
              <summary><span>Your recent days</span></summary>
              <div className="px-4 pb-4 space-y-2">
                {history.slice(0, 10).map((d, i) => (
                  <motion.div
                    key={d.date}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] px-4 py-3"
                  >
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0',
                      d.sat ? 'bg-[var(--done-accent)]' : 'bg-[var(--border-subtle)]')} />
                    <span className="text-[13px] text-[var(--text-secondary)] w-24 flex-shrink-0">
                      {new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}
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
            </details>
          )}
        </main>

        {/* ▶ RIGHT RAIL — the nine virtues */}
        <VirtuesRail virtueProgress={virtueProgress} onOpen={(k) => onOpenVirtues?.(k)} />
      </div>
    </div>
  );
}
