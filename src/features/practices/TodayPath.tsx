import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, PenLine, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';
import { useDailyPractice } from '../practices/useDailyPractice';
import type { WeeklyAssignment } from '../../hooks/useWeeklyAssignment';
import type { CourseProgress } from '../../hooks/useCourseTracking';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { InfoTooltip } from '../../components/ui/InfoTooltip';

// ─────────────────────────────────────────────────────────────────────────────
// Question display names — centralised here, sourced from practiceLibrary
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_META: Record<string, {
  shortTitle: string;
  journalPrompt: string;
}> = {
  question1: {
    shortTitle: 'Q1 · Using the Mind as a Tool',
    journalPrompt: 'When did the spiral start today, and what shifted when you redirected?',
  },
  question2: {
    shortTitle: 'Q2 · The Doubting Narrator',
    journalPrompt: 'What voice did you notice today? What did naming it feel like?',
  },
  question3: {
    shortTitle: 'Q3 · Personal to Impersonal',
    journalPrompt: 'Which of the three pauses landed most? What shifted in that second?',
  },
  question4: {
    shortTitle: 'Q4 · Witness Consciousness',
    journalPrompt: 'What did sitting comfortably within the noise feel like today?',
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
  done,
  total,
  onClick,
}: {
  icon: any;
  label: string;
  sub: string;
  status: PillarStatus;
  color: string;
  done?: number;
  total?: number;
  onClick: () => void;
}) {
  const cfg = {
    done: { text: 'Complete', bg: color + '18', textColor: color },
    active: { text: 'Pending', bg: color + '22', textColor: color },
    waiting: { text: 'Pending', bg: 'var(--bg-secondary)', textColor: 'var(--text-muted)' },
  }[status];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all duration-300',
        status === 'done'
            ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50'
            : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-sm'
      )}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
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

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-serif leading-tight',
          status === 'done' ? 'line-through opacity-60 text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
        )}>
          {label}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">{sub}</p>
        
        {/* Simplified progress bar for Learn */}
        {label === 'Learn' && done !== undefined && total !== undefined && (
          <div className="mt-2 w-24 h-1 bg-[var(--border-subtle)] rounded-full overflow-hidden">
             <div 
               className="h-full transition-all duration-1000" 
               style={{ 
                 width: `${(done / total) * 100}%`,
                 background: color 
               }} 
             />
          </div>
        )}
      </div>

      <span
        className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: cfg.bg, color: cfg.textColor }}
      >
        {cfg.text}
      </span>
    </motion.button>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// Main TodayPath component
// ─────────────────────────────────────────────────────────────────────────────

interface TodayPathProps {
  userId: string | undefined | null;
  progress?: CourseProgress;
  /** The weekly assignment computed by useWeeklyAssignment — treated as optional for safety */
  weeklyAssignment?: WeeklyAssignment;
  /** Navigate to Progress tab */
  onViewProgress?: () => void;
  onNavigate: (
    tab: string,
    questionId?: string,
    view?: 'explanation' | 'video' | 'practice'
  ) => void;
}

// Fallback assignment for when the prop isn't available yet
const FALLBACK_ASSIGNMENT: WeeklyAssignment = {
  questionId: 'question1',
  questionNumber: 1,
  weekNumber: 0,
  daysRemaining: 7,
  weekLabel: 'Your first week',
  isFirstWeek: true,
};

export function TodayPath({
  userId,
  onNavigate,
  progress,
  weeklyAssignment,
  onViewProgress,
}: TodayPathProps) {
  const assignment = weeklyAssignment ?? FALLBACK_ASSIGNMENT;
  const { questionId, weekLabel, daysRemaining } = assignment;
  const questionMeta = QUESTION_META[questionId] || QUESTION_META['question1'];
  const practice = PRACTICE_LIBRARY[questionId];
  const color = practice?.color ?? '#B8973A';
  const requiredTriggers = questionId === 'question3' ? 3 : 1;



  const {
    isCompleted: practiceCompleted,
    record,
    markLearn,
  } = useDailyPractice(userId, questionId, requiredTriggers);

  const learnDone = record?.learnCompleted === true;
  const reflectDone = record?.reflectCompleted === true;

  if (!questionMeta || !practice) return null;

  const handleLearn = () => {
    // Mark as done immediately if they click/interact
    markLearn();
    // Always navigate to explanation as requested for consistency
    onNavigate('wisdom_untethered', questionId, 'explanation');
  };

  const handlePractice = () => {
    onNavigate('situations');
  };

  const wuLearntCount = Object.values(progress || {}).filter(q => q.read).length;
  const wuTotal = 27; // Total chapters in the full curriculum
  
  const doneCount = [learnDone, practiceCompleted, reflectDone].filter(Boolean).length;
  const allDone = learnDone && practiceCompleted && reflectDone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
    >
      {/* ── Week context banner ── */}
      <div
        className="flex items-center justify-between px-5 py-2.5"
        style={{ background: color + '10', borderBottom: `1px solid ${color}20` }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={12} style={{ color }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color }}>
            {weekLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
          </span>
          {onViewProgress && (
            <button
              onClick={onViewProgress}
              className="flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
              style={{ color }}
            >
              View progress <ChevronRight size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-0.5 text-[var(--text-muted)]">
            Today's Presence Focus
          </p>
          <h3 className="text-[15px] font-serif font-light text-[var(--text-primary)] leading-tight">
            {questionMeta.shortTitle}
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
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              {doneCount}/3
            </span>
            <InfoTooltip 
              title="Daily Acts"
              description="Your daily journey is divided into three small acts: Learn, Practice, and Reflect."
              howCalculated="Complete any act to see your progress update. Doing all three deepens the work."
            />
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4 h-px" style={{ background: color + '20' }} />

      {/* ── Three pillars ── */}
      <div className="px-4 pb-4 space-y-2">
        <Pillar
          icon={BookOpen}
          label="Learn"
          sub={learnDone ? "The wisdom has been absorbed" : "Today's teaching awaits your presence"}
          status={learnDone ? 'done' : 'active'}
          color={color}
          onClick={handleLearn}
          done={wuLearntCount}
          total={wuTotal}
        />
        <Pillar
          icon={Zap}
          label="Practice"
          sub={practiceCompleted ? "Your presence is grounded" : `Pending: ${practice.name}`}
          status={practiceCompleted ? 'done' : 'active'}
          color={color}
          onClick={handlePractice}
        />
        {/* Reflect — opens inline, does NOT navigate away */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('chapters')}
          className={cn(
            'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all duration-300',
            reflectDone
              ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50'
              : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-sm'
          )}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: reflectDone ? color + '15' : practiceCompleted ? color + '15' : 'var(--bg-secondary)',
              border: `1.5px solid ${reflectDone || practiceCompleted ? color + '35' : 'var(--border-subtle)'}`,
            }}
          >
            {reflectDone
              ? <CheckCircle2 size={15} style={{ color }} />
              : <PenLine size={15} style={{ color: practiceCompleted ? color : 'var(--text-muted)' }} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-[14px] font-serif leading-tight',
              reflectDone ? 'line-through opacity-60 text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
            )}>
              Reflect
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5 truncate">
              {reflectDone ? 'Your essence is recorded' : "No reflections shared today yet"}
            </p>
          </div>
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: reflectDone ? color + '18' : color + '22',
              color: color,
            }}
          >
            {reflectDone ? 'Complete' : 'Pending'}
          </span>
        </motion.button>
      </div>



      {/* ── All done celebration ── */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-5 mb-5 p-3 rounded-2xl text-center"
          style={{ background: color + '10', border: `1px solid ${color}25` }}
        >
          <p className="text-[12px] font-serif italic text-[var(--text-secondary)]">
            Beautiful. All three acts complete for today. 🌸
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
