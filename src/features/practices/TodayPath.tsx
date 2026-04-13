import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Zap, PenLine, CheckCircle2,
  Calendar, ChevronRight, Lock, Sparkles, Heart,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';
import { useDailyPractice } from '../practices/useDailyPractice';
import type { WeeklyAssignment } from '../../hooks/useWeeklyAssignment';
import type { CourseProgress } from '../../hooks/useCourseTracking';
import { InfoTooltip } from '../../components/ui/InfoTooltip';

// ─────────────────────────────────────────────────────────────────────────────
// Question display names
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTION_META: Record<string, {
  shortTitle: string;
  journalPrompt: string;
  dailyIntent: string;
}> = {
  question1: {
    shortTitle: 'Q1 · Using the Mind as a Tool',
    journalPrompt: 'When did the spiral start today, and what shifted when you redirected?',
    dailyIntent: 'I will notice my mind\'s chatter and consciously redirect it to a steady affirmation today.',
  },
  question2: {
    shortTitle: 'Q2 · The Doubting Narrator',
    journalPrompt: 'What voice did you notice today? What did naming it feel like?',
    dailyIntent: 'I will witness the doubting voice without becoming it, naming it silently and letting it pass.',
  },
  question3: {
    shortTitle: 'Q3 · Personal to Impersonal',
    journalPrompt: 'Which of the three pauses landed most? What shifted in that second?',
    dailyIntent: 'I will practice the three-second pause before reacting, honoring the space between thought and action.',
  },
  question4: {
    shortTitle: 'Q4 · Finding the Silent Space',
    journalPrompt: 'What did the space behind the noise feel like today?',
    dailyIntent: 'I will anchor my awareness in the silence behind the noise at least three times today.',
  },
  question5: {
    shortTitle: 'Q5 · Witness Consciousness',
    journalPrompt: 'What did sitting comfortably within the noise feel like today?',
    dailyIntent: 'I will remain as the observer today, allowing life\'s flow to happen without losing my seat of awareness.',
  },
  question6: {
    shortTitle: 'Q6 · Letting Go of the Past',
    journalPrompt: 'What memory arose today, and did you release its energy through the breath?',
    dailyIntent: 'I will breathe through past memories today, refusing to feed the narratives of who I used to be.',
  },
  question7: {
    shortTitle: 'Q7 · Handling the Back-and-Forth',
    journalPrompt: 'How quickly did you notice the pull-back today? Celebrate that moment.',
    dailyIntent: 'I will celebrate every moment I notice the mind pulling me back, recognizing it as a return to awareness.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Step config
// ─────────────────────────────────────────────────────────────────────────────

type StepStatus = 'done' | 'active' | 'locked';

interface StepConfig {
  num: number;
  label: string;
  sub: string;
  subDone: string;
  icon: LucideIcon;
  status: StepStatus;
  isAccessValid?: boolean;
  onClick: () => void;
  color: string;
  practice?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Journey Node — the circle on the map path
// ─────────────────────────────────────────────────────────────────────────────

function JourneyNode({
  step, status, color, isLast,
}: { step: number; status: StepStatus; color: string; isLast?: boolean }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 48 }}>
      {/* Circle node */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: step * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center rounded-full z-10"
        style={{
          width: 44,
          height: 44,
          background: status === 'done'
            ? `linear-gradient(135deg, ${color}, ${color}cc)`
            : status === 'active'
              ? `${color}18`
              : 'var(--bg-surface)',
          border: `2px solid ${status === 'done' ? color : status === 'active' ? color + '60' : 'var(--border-subtle)'}`,
          boxShadow: status === 'done'
            ? `0 0 18px ${color}60, 0 0 6px ${color}40`
            : status === 'active'
              ? `0 0 12px ${color}30`
              : 'none',
        }}
      >
        {status === 'done' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
          >
            <CheckCircle2 size={18} color="white" strokeWidth={2.5} />
          </motion.div>
        )}
        {status === 'locked' && <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
        {status === 'active' && (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: color }}
          />
        )}
        {/* Step number badge */}
        <span
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
          style={{
            background: status === 'done' ? color : 'var(--bg-surface)',
            color: status === 'done' ? 'white' : 'var(--text-muted)',
            border: `1.5px solid ${status === 'done' ? color + 'aa' : 'var(--border-subtle)'}`,
          }}
        >
          {step}
        </span>
      </motion.div>

      {/* Connector trail going down */}
      {!isLast && (
        <div className="relative flex flex-col items-center" style={{ height: 40, width: 2 }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'var(--border-subtle)', width: 2 }}
          />
          {status === 'done' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: step * 0.1 + 0.3 }}
              className="absolute top-0 left-0 rounded-full"
              style={{ width: 2, background: `linear-gradient(180deg, ${color}, ${color}50)` }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Journey Step Card — the card to the right of each node
// ─────────────────────────────────────────────────────────────────────────────

function JourneyStep({ cfg }: { cfg: StepConfig }) {
  const { num, label, sub, subDone, icon: Icon, status, color, isAccessValid, onClick, practice } = cfg;
  const isDone = status === 'done';
  const isLocked = status === 'locked';

  const badgeText = isDone ? 'Done' : isLocked ? 'Locked' : 'Begin';
  const badgeBg = isDone ? color + '20' : isLocked ? 'var(--bg-surface)' : color + '25';
  const badgeColor = isDone ? color : isLocked ? 'var(--text-muted)' : color;

  return (
    <motion.button
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: num * 0.08 + 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!isLocked ? { x: 3, transition: { duration: 0.2 } } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={isLocked && !isAccessValid ? undefined : onClick}
      disabled={isLocked && !isAccessValid}
      className={cn(
        'flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-300',
        isDone
          ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 opacity-75'
          : isLocked
            ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 cursor-not-allowed'
            : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--text-secondary)]/30 shadow-sm hover:shadow-md'
      )}
    >
      {/* Icon box */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: isLocked ? 'var(--bg-surface)' : color + '18',
          border: `1.5px solid ${isLocked ? 'var(--border-subtle)' : color + '35'}`,
        }}
      >
        {isDone
          ? <CheckCircle2 size={15} style={{ color }} />
          : <Icon size={15} style={{ color: isLocked ? 'var(--text-muted)' : color }} />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-semibold leading-tight',
          isDone ? 'line-through text-[var(--text-muted)] opacity-70' : isLocked ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
        )}>
          {label}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
          {isDone ? subDone : sub}
        </p>
        {practice && !isDone && !isLocked && (
          <p className="text-[9px] mt-1 font-bold uppercase tracking-wider" style={{ color: color + 'aa' }}>
            {practice}
          </p>
        )}
      </div>

      {/* Badge */}
      <span
        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0"
        style={{ background: badgeBg, color: badgeColor }}
      >
        {isLocked && !isAccessValid && <Lock size={8} />}
        {!isDone && !isLocked && <ChevronRight size={9} />}
        {badgeText}
      </span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface TodayPathProps {
  userId: string | undefined | null;
  progress?: CourseProgress;
  weeklyAssignment?: WeeklyAssignment;
  onViewProgress?: () => void;
  onNavigate: (tab: string, questionId?: string, view?: 'explanation' | 'video' | 'practice') => void;
  isAccessValid?: boolean;
}

const FALLBACK_ASSIGNMENT: WeeklyAssignment = {
  questionId: 'question1',
  questionNumber: 1,
  weekNumber: 0,
  daysRemaining: 7,
  weekLabel: 'Your first week',
  isFirstWeek: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function TodayPath({
  userId,
  onNavigate,
  progress: _progress,
  weeklyAssignment,
  onViewProgress,
  isAccessValid,
}: TodayPathProps) {
  const assignment = weeklyAssignment ?? FALLBACK_ASSIGNMENT;
  const { questionId, weekLabel, daysRemaining } = assignment;
  const questionMeta = QUESTION_META[questionId] || QUESTION_META['question1'];
  const practice = PRACTICE_LIBRARY[questionId];
  const color = practice?.color ?? '#B8973A';
  const requiredTriggers = questionId === 'question3' ? 3 : 1;

  const { isCompleted: practiceCompleted, record, markLearn, markIntegrate } = useDailyPractice(userId, questionId, requiredTriggers);
  const [showCommitment, setShowCommitment] = useState(false);

  const learnDone = record?.learnCompleted === true;
  const reflectDone = record?.reflectCompleted === true;
  const integrateDone = record?.integrateCompleted === true;

  if (!questionMeta || !practice) return null;

  const doneCount = [learnDone, practiceCompleted, reflectDone, integrateDone].filter(Boolean).length;
  const allDone = learnDone && practiceCompleted && reflectDone && integrateDone;

  const handleLearn = () => {
    if (isAccessValid) markLearn();
    onNavigate('wisdom_untethered', questionId, 'explanation');
  };
  const handlePractice = () => onNavigate('situations');
  const handleReflect = () => {
    localStorage.setItem('awakened-journal-prompt', questionMeta.journalPrompt);
    localStorage.setItem('awakened-reflect-question-id', questionId);
    onNavigate('chapters');
  };
  const handleIntegrate = () => {
    if (integrateDone) return;
    if (!reflectDone) {
      alert('Please complete the first three steps before making your daily commitment.');
      return;
    }
    setShowCommitment(true);
  };
  const confirmIntegrate = () => {
    if (isAccessValid) markIntegrate();
    setShowCommitment(false);
  };

  // Determine step statuses
  const learnStatus: 'done' | 'active' | 'locked' = learnDone ? 'done' : 'active';
  const practiceStatus: 'done' | 'active' | 'locked' = practiceCompleted ? 'done' : 'active';
  const reflectStatus: 'done' | 'active' | 'locked' = reflectDone ? 'done' : practiceCompleted ? 'active' : 'locked';
  const integrateStatus: 'done' | 'active' | 'locked' = integrateDone ? 'done' : reflectDone ? 'active' : 'locked';

  const steps: StepConfig[] = [
    {
      num: 1,
      label: 'Learn',
      sub: "Read today's teaching",
      subDone: 'Wisdom absorbed',
      icon: BookOpen,
      status: learnStatus,
      color,
      isAccessValid,
      onClick: handleLearn,
    },
    {
      num: 2,
      label: 'Practice',
      sub: 'Complete the technique',
      subDone: 'Technique complete',
      icon: Zap,
      status: practiceStatus,
      color,
      isAccessValid,
      onClick: handlePractice,
      practice: practice.name,
    },
    {
      num: 3,
      label: 'Reflect',
      sub: 'Write your thoughts',
      subDone: 'Journal entry saved',
      icon: PenLine,
      status: reflectStatus,
      color,
      isAccessValid,
      onClick: handleReflect,
    },
    {
      num: 4,
      label: 'Live It',
      sub: 'Promise to live it today',
      subDone: 'Sacred commitment made',
      icon: Heart,
      status: integrateStatus,
      color,
      isAccessValid,
      onClick: handleIntegrate,
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      >
        {/* ── Top banner ── */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{ background: color + '12', borderBottom: `1px solid ${color}22` }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={11} style={{ color }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color }}>
              {weekLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-muted)]">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </span>
            {onViewProgress && (
              <button
                onClick={onViewProgress}
                className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                style={{ color }}
              >
                Progress <ChevronRight size={10} />
              </button>
            )}
          </div>
        </div>

        {/* ── Header row: title + status badge ── */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">
              Today's Practice
            </p>
            <h3 className="text-[15px] font-serif font-light text-[var(--text-primary)] leading-snug">
              {questionMeta.shortTitle}
            </h3>
          </div>

          {/* Status badge */}
          <motion.div
            layout
            className="flex flex-col items-end gap-1.5 flex-shrink-0"
          >
            <motion.div
              animate={allDone ? {
                boxShadow: [`0 0 0px ${color}00`, `0 0 14px ${color}60`, `0 0 0px ${color}00`]
              } : {}}
              transition={{ repeat: allDone ? Infinity : 0, duration: 2.5 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider"
              style={{
                background: allDone ? color + '20' : 'var(--bg-surface)',
                border: `1.5px solid ${allDone ? color + '50' : 'var(--border-subtle)'}`,
                color: allDone ? color : 'var(--text-muted)',
              }}
            >
              {allDone ? <Sparkles size={9} /> : null}
              {allDone ? 'Complete' : 'Pending'}
            </motion.div>

            {/* Progress fraction + info */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-black tabular-nums" style={{ color: doneCount > 0 ? color : 'var(--text-muted)' }}>
                {doneCount}/4
              </span>
              <InfoTooltip
                title="Daily Journey"
                description="Four steps each day: Learn the wisdom, Practice the technique, Reflect in your journal, then Live the teaching."
                howCalculated="Each step unlocks the next. All 4 must be complete for today's status to update."
              />
            </div>

            {/* Progress bar */}
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / 4) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
              />
            </div>
          </motion.div>
        </div>

        {/* ── Journey Map ── */}
        <div className="px-4 pb-5">
          <div className="space-y-0">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-stretch gap-3">
                {/* Node + connector on the left */}
                <JourneyNode
                  step={step.num}
                  status={step.status}
                  color={color}
                  isLast={idx === steps.length - 1}
                />

                {/* Step card + vertical spacer */}
                <div className="flex flex-col flex-1 min-w-0" style={{ paddingBottom: idx < steps.length - 1 ? 10 : 0 }}>
                  <JourneyStep cfg={step} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── All done celebration ── */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-5 mb-5 overflow-hidden"
            >
              <div
                className="p-4 rounded-2xl text-center space-y-1"
                style={{ background: color + '12', border: `1px solid ${color}25` }}
              >
                <p className="text-base">🌸</p>
                <p className="text-[12px] font-serif italic text-[var(--text-secondary)]">
                  All four steps complete. Your presence is your gift today.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Commitment Modal ── */}
      <AnimatePresence>
        {showCommitment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="max-w-sm w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[40px] p-10 text-center space-y-7 shadow-2xl relative overflow-hidden"
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-[40px]"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color}10, transparent)` }}
              />
              <div className="relative z-10 space-y-5">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
                  style={{ background: color + '15', border: `2px solid ${color}30` }}
                >
                  <Heart size={28} style={{ color }} />
                </div>
                <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">Sacred Commitment</h3>
                <p className="text-[14px] text-[var(--text-secondary)] font-serif italic leading-relaxed">
                  "{questionMeta.dailyIntent}"
                </p>
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={confirmIntegrate}
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl text-white"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                      boxShadow: `0 8px 24px ${color}40`,
                    }}
                  >
                    I Promise to Live This
                  </button>
                  <button
                    onClick={() => setShowCommitment(false)}
                    className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Not yet — I need more time
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
