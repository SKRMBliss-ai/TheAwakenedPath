import { motion } from 'framer-motion';
import { BookOpen, Zap, PenLine, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';
import { useDailyPractice } from '../practices/useDailyPractice';
import type { CourseProgress } from '../../hooks/useCourseTracking';

// ─────────────────────────────────────────────────────────────────────────────
// Question display names + journal prompts
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_DATA: Record<string, {
  shortTitle: string;
  practiceLabel: string;
  journalPrompt: string;
  locked?: boolean;
}> = {
  question1: {
    shortTitle: 'Q1 · Using the Mind as a Tool',
    practiceLabel: '"I Can Handle This" Redirect',
    journalPrompt: 'When did the spiral start today, and what shifted when you redirected?',
  },
  question2: {
    shortTitle: 'Q2 · The Doubting Narrator',
    practiceLabel: 'The Radio Check — 2 min sit',
    journalPrompt: 'What voice did you notice today? What did naming it feel like?',
  },
  question3: {
    shortTitle: 'Q3 · Personal to Impersonal',
    practiceLabel: 'The One-Second Cosmic Pause × 3',
    journalPrompt: 'Which of the three pauses landed most? What shifted in that second?',
  },
  question4: {
    shortTitle: 'Q4 · Which Mind to Listen To',
    practiceLabel: 'The Clarity Sit — 3 min',
    journalPrompt: 'What did "sitting comfortably within the noise" feel like today?',
    locked: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pillar row
// ─────────────────────────────────────────────────────────────────────────────

type PillarStatus = 'done' | 'active' | 'waiting';

function Pillar({
  icon: Icon,
  label,
  sub,
  status,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  sub: string;
  status: PillarStatus;
  color: string;
  onClick: () => void;
}) {
  const statusConfig = {
    done: { text: '✓ Done', bg: color + '18', textColor: color },
    active: { text: 'Start →', bg: color + '22', textColor: color },
    waiting: { text: 'After practice', bg: 'var(--bg-secondary)', textColor: 'var(--text-muted)' },
  }[status];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all duration-300 group',
        status === 'active'
          ? 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)]'
          : status === 'done'
            ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50'
            : 'border-[var(--border-subtle)] bg-transparent opacity-50 pointer-events-none'
      )}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
        style={{
          background: status === 'waiting' ? 'var(--bg-secondary)' : color + '15',
          border: `1.5px solid ${status === 'waiting' ? 'var(--border-subtle)' : color + '35'}`,
        }}
      >
        {status === 'done'
          ? <CheckCircle2 size={15} style={{ color }} />
          : <Icon size={15} style={{ color: status === 'waiting' ? 'var(--text-muted)' : color }} />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-serif leading-tight',
          status === 'done' ? 'text-[var(--text-secondary)] line-through opacity-80' : 'text-[var(--text-primary)]'
        )}>
          {label}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate opacity-70">{sub}</p>
      </div>

      {/* Status badge */}
      <span
        className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
        style={{ background: statusConfig.bg, color: statusConfig.textColor }}
      >
        {statusConfig.text}
      </span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface TodayPathProps {
  userId: string | undefined | null;
  progress?: CourseProgress;
  activeQuestionId: string;
  onNavigate: (
    tab: string,
    questionId?: string,
    view?: 'explanation' | 'video' | 'practice'
  ) => void;
}

export function TodayPath({ userId, onNavigate, progress, activeQuestionId }: TodayPathProps) {
  const questionData = QUESTION_DATA[activeQuestionId] || QUESTION_DATA['question1'];
  const practice = PRACTICE_LIBRARY[activeQuestionId];
  const color = practice?.color ?? '#B8973A';
  const requiredTriggers = activeQuestionId === 'question3' ? 3 : 1;

  const {
    isCompleted: practiceCompleted,
    record,
    markLearn,
    markReflect
  } = useDailyPractice(userId, activeQuestionId, requiredTriggers);

  const learnDone = record?.learnCompleted === true;
  const reflectDone = record?.reflectCompleted === true;

  if (!questionData || !practice) return null;

  const handleLearn = () => {
    markLearn();

    // Smart deep-linking based on progress from useCourseTracking
    const qProgress = progress?.[activeQuestionId];
    let targetView: 'explanation' | 'video' | 'practice' = 'explanation';

    if (qProgress?.read && !qProgress?.video) {
      targetView = 'video';
    } else if (qProgress?.read && qProgress?.video) {
      targetView = 'practice';
    }

    onNavigate('wisdom_untethered', activeQuestionId, targetView);
  };

  const handlePractice = () => {
    onNavigate('wisdom_untethered', activeQuestionId, 'practice');
  };

  const handleReflect = () => {
    // Store the prompt so Journal can pick it up
    localStorage.setItem(
      'awakened-journal-prompt',
      JSON.stringify({
        questionId: activeQuestionId,
        prompt: questionData.journalPrompt,
        date: new Date().toISOString().split('T')[0],
      })
    );
    markReflect();
    onNavigate('journal');
  };

  // Progress pill count
  const doneCount = [learnDone, practiceCompleted, reflectDone].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p
            className="text-[9px] font-bold uppercase tracking-[0.3em] mb-0.5"
            style={{ color }}
          >
            Your Path Today
          </p>
          <h3 className="text-[15px] font-serif font-light text-[var(--text-primary)] leading-tight">
            {questionData.shortTitle}
          </h3>
        </div>

        {/* Progress dots */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-1.5">
            {[learnDone, practiceCompleted, reflectDone].map((done, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-500"
                style={{ background: done ? color : 'var(--border-subtle)' }}
              />
            ))}
          </div>
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
            {doneCount}/3
          </span>
        </div>
      </div>

      {/* Thin colour bar */}
      <div className="mx-5 mb-4 h-px" style={{ background: color + '20' }} />

      {/* Three pillars */}
      <div className="px-4 pb-5 space-y-2">
        <Pillar
          icon={BookOpen}
          label="Learn"
          sub={`Wisdom Untethered · ${questionData.shortTitle}`}
          status={learnDone ? 'done' : 'active'}
          color={color}
          onClick={handleLearn}
        />
        <Pillar
          icon={Zap}
          label="Practice"
          sub={questionData.practiceLabel}
          status={practiceCompleted ? 'done' : learnDone ? 'active' : 'waiting'}
          color={color}
          onClick={handlePractice}
        />
        <Pillar
          icon={PenLine}
          label="Reflect"
          sub={`"${questionData.journalPrompt}"`}
          status={reflectDone ? 'done' : practiceCompleted ? 'active' : 'waiting'}
          color={color}
          onClick={handleReflect}
        />
      </div>

      {/* All done state */}
      {learnDone && practiceCompleted && reflectDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-5 mb-5 p-3 rounded-2xl text-center"
          style={{ background: color + '10', border: `1px solid ${color}25` }}
        >
          <p className="text-[12px] font-serif italic text-[var(--text-secondary)]">
            Beautiful. All three acts complete for today.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
