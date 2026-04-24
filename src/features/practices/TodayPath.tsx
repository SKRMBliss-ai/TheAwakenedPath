import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Zap, PenLine, Heart, CheckCircle2,
  Calendar, ChevronRight, Sparkles, ArrowRight,
  Trophy,
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
// Types
// ─────────────────────────────────────────────────────────────────────────────

// done = completed, active = recommended next, next = can do but not yet the focus
type StepStatus = 'done' | 'active' | 'next';

interface StepDef {
  num: number;
  label: string;
  noun: string;          // e.g. "today's teaching"
  doneLine: string;
  icon: LucideIcon;
  status: StepStatus;
  onClick: () => void;
  color: string;
  hint?: string;         // small italic below label
}

// ─────────────────────────────────────────────────────────────────────────────
// Node — glowing circle with the step number
// ─────────────────────────────────────────────────────────────────────────────

// StepNode removed for simpler UI

// ─────────────────────────────────────────────────────────────────────────────
// Step Card — the action card beside each node
// ─────────────────────────────────────────────────────────────────────────────

function StepCard({ def }: { def: StepDef }) {
  const { num, label, noun, doneLine, icon: Icon, status, color, onClick, hint } = def;
  const isDone = status === 'done';
  const isActive = status === 'active';
  const isNext = status === 'next';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: num * 0.05, duration: 0.4 }}
      whileTap={!isDone ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 sm:gap-5 p-4 sm:p-6 mb-4 rounded-3xl border text-left transition-all duration-300',
        isDone
          ? 'border-[var(--border-subtle)] bg-transparent opacity-60'
          : isActive
            ? 'border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg'
            : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)] hover:border-[var(--border-default)]'
      )}
      style={
        isActive
          ? { borderColor: color + '50', boxShadow: `0 8px 32px ${color}15` }
          : {}
      }
    >
      {/* Huge Icon */}
      <div
        className={cn(
          'w-12 h-12 sm:w-16 sm:h-16 rounded-[20px] flex items-center justify-center flex-shrink-0 transition-all duration-300',
          isDone ? 'opacity-50' : ''
        )}
        style={{
          background: isDone ? 'var(--bg-surface)' : isActive ? color + '20' : color + '0d',
          border: `2px solid ${isDone ? 'var(--border-subtle)' : isActive ? color + '55' : color + '25'}`,
        }}
      >
        {isDone
          ? <CheckCircle2 size={28} style={{ color }} strokeWidth={2} />
          : <Icon size={28} style={{ color: isNext ? color + '80' : color }} />
        }
      </div>

      {/* Large Clear Text */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          'text-lg sm:text-2xl font-serif leading-tight',
          isDone
            ? 'line-through text-[var(--text-muted)]'
            : isActive
              ? 'text-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] font-medium'
        )}>
          {num}. {label}
        </h3>
        <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--text-muted)' }}>
          {isDone ? doneLine : noun}
        </p>
        {hint && !isDone && (
          <p className="text-xs sm:text-sm mt-2 font-bold uppercase tracking-wider" style={{ color: color + '90' }}>
            {hint}
          </p>
        )}
      </div>

      {/* Massive obvious CTA if active */}
      {!isDone && (
        <div
          className={cn(
            'flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-full flex-shrink-0 transition-all duration-300 shadow-sm'
          )}
          style={{
            background: isActive ? color + '22' : 'var(--bg-surface)',
            color: isActive ? color : 'var(--text-muted)',
            border: `2px solid ${isActive ? color + '40' : 'var(--border-subtle)'}`,
          }}
        >
          {isActive ? <ArrowRight size={16} /> : null}
          {isNext ? 'Next' : 'BEGIN'}
        </div>
      )}
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

  const {
    isAnyPracticeDone,
    record,
    markLearn,
    markIntegrate
  } = useDailyPractice(userId, questionId, requiredTriggers);

  const [showCommitment, setShowCommitment] = useState(false);

  const practiceCompleted = isAnyPracticeDone;
  const learnDone = record?.learnCompleted === true;
  const reflectDone = record?.reflectCompleted === true;
  const integrateDone = record?.integrateCompleted === true;

  if (!questionMeta || !practice) return null;

  const doneCount = [learnDone, practiceCompleted, reflectDone, integrateDone].filter(Boolean).length;
  const allDone = learnDone && practiceCompleted && reflectDone && integrateDone;

  // Handlers
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
    setShowCommitment(true);
  };
  const confirmIntegrate = () => {
    if (isAccessValid) markIntegrate();
    setShowCommitment(false);
  };

  // Status — NEVER locked; use 'next' instead so all steps are always tappable
  const resolveStatus = (done: boolean, isCurrentFocus: boolean): StepStatus =>
    done ? 'done' : isCurrentFocus ? 'active' : 'next';

  useEffect(() => {
    if (allDone) {
      const today = new Date().toDateString();
      const celebKey = `awakened-celeb-${userId}-${today}`;
      if (!sessionStorage.getItem(celebKey)) {
        import('../../services/voiceService').then(({ VoiceService }) => {
          VoiceService.playEffect('/mp3/tibetanbell.mp3');
        });
        sessionStorage.setItem(celebKey, 'true');
      }
    }
  }, [allDone, userId]);

  const learnStatus = resolveStatus(learnDone, !learnDone);
  const practiceStatus = resolveStatus(practiceCompleted, learnDone && !practiceCompleted);
  const reflectStatus = resolveStatus(reflectDone, practiceCompleted && !reflectDone);
  const integrateStatus = resolveStatus(integrateDone, reflectDone && !integrateDone);

  const steps: StepDef[] = [
    {
      num: 1,
      label: 'Learn',
      noun: "Read today's teaching",
      doneLine: 'Wisdom absorbed',
      icon: BookOpen,
      status: learnStatus,
      color,
      onClick: handleLearn,
    },
    {
      num: 2,
      label: 'Practice',
      noun: 'Complete the technique',
      doneLine: 'Technique complete',
      icon: Zap,
      status: practiceStatus,
      color,
      onClick: handlePractice,
      hint: practice.name,
    },
    {
      num: 3,
      label: 'Reflect',
      noun: 'Write your thoughts in the journal',
      doneLine: 'Journal entry saved',
      icon: PenLine,
      status: reflectStatus,
      color,
      onClick: handleReflect,
    },
    {
      num: 4,
      label: 'Live It',
      noun: 'Make your sacred commitment',
      doneLine: 'Sacred commitment made',
      icon: Heart,
      status: integrateStatus,
      color,
      onClick: handleIntegrate,
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] relative"
      >
        {/* ── Top colour band ── */}
        <div
          className="flex items-center justify-between px-5 py-2.5 rounded-t-[27px]"
          style={{
            background: `linear-gradient(90deg, ${color}18, ${color}08)`,
            borderBottom: `1px solid ${color}22`,
          }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={11} style={{ color }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color }}>
              {weekLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-muted)]">
              {daysRemaining}d left
            </span>
            {onViewProgress && (
              <button
                onClick={onViewProgress}
                className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                style={{ color }}
              >
                Journey <ChevronRight size={10} />
              </button>
            )}
          </div>
        </div>

        {/* ── Card header ── */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">
              Today's Practice
            </p>
            <h3 className="text-[15px] font-serif font-medium text-[var(--text-primary)] leading-snug">
              {questionMeta.shortTitle}
            </h3>
          </div>

          {/* Status + counter */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <motion.div
              layout
              animate={allDone ? {
                boxShadow: [`0 0 0px ${color}00`, `0 0 16px ${color}55`, `0 0 0px ${color}00`],
              } : {}}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider"
              style={{
                background: allDone ? color + '22' : 'var(--bg-surface)',
                border: `1.5px solid ${allDone ? color + '55' : 'var(--border-subtle)'}`,
                color: allDone ? color : 'var(--text-muted)',
              }}
            >
              {allDone && <Sparkles size={9} />}
              {allDone ? 'Complete' : 'Pending'}
            </motion.div>

            <div className="flex items-center gap-1.5">
              {/* 4 dots */}
              <div className="flex gap-1">
                {[learnDone, practiceCompleted, reflectDone, integrateDone].map((done, i) => (
                  <motion.div
                    key={i}
                    animate={done ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="w-2 h-2 rounded-full transition-all duration-500"
                    style={{ background: done ? color : 'var(--border-subtle)' }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-black tabular-nums" style={{ color: doneCount > 0 ? color : 'var(--text-muted)' }}>
                {doneCount}/4
              </span>
              <InfoTooltip
                title="Daily Journey"
                description="Four steps each day: Learn, Practice, Reflect, then commit to Live It. All 4 mark today as complete."
                howCalculated="Steps can be done in any order, though we recommend going 1 → 4."
              />
            </div>

            {/* Slim progress bar */}
            <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / 4) * 100}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}70, ${color})` }}
              />
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 mb-3 h-px" style={{ background: color + '18' }} />

        {/* ── Journey Map ── */}
        <div className="px-5 sm:px-6 pb-6 pt-2">
          {steps.map((step) => (
            <StepCard key={step.num} def={step} />
          ))}
        </div>

        {/* ── All done banner ── */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="mx-4 sm:mx-5 mb-8"
            >
              <div 
                className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[var(--bg-surface-hover)] to-[var(--bg-surface)] border border-[var(--accent-primary)]/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
              >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent-primary-dim),transparent_70%)] opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center text-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)] flex items-center justify-center shadow-[0_0_30px_var(--accent-primary)]">
                    <Trophy className="w-7 h-7 text-black" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-[20px] font-serif italic text-[var(--text-primary)] leading-tight">
                      "All four steps complete. Your presence is your gift today."
                    </h3>
                    <p className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-[0.3em]">
                      Reward: Daily Flow Sync +50
                    </p>
                  </div>

                  <div className="px-6 py-2 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-widest">
                    Presence Rewarded
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Commitment Modal ── */}
      <AnimatePresence>
        {showCommitment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/55 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', stiffness: 330, damping: 26 }}
              className="max-w-sm w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[40px] p-10 text-center space-y-7 shadow-2xl relative overflow-hidden"
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-[40px]"
                style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${color}12, transparent)` }}
              />
              <div className="relative z-10 space-y-5">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
                  style={{ background: color + '18', border: `2px solid ${color}35` }}
                >
                  <Heart size={28} style={{ color }} />
                </div>
                <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">
                  Sacred Commitment
                </h3>
                <p className="text-[17px] text-[var(--text-primary)] font-sans font-medium leading-relaxed">
                  "{questionMeta.dailyIntent}"
                </p>
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={confirmIntegrate}
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] text-white shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
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
