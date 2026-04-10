import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap, PenLine, CheckCircle2, Calendar, ChevronRight, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';
import { useDailyPractice } from '../practices/useDailyPractice';
import type { WeeklyAssignment } from '../../hooks/useWeeklyAssignment';
import type { CourseProgress } from '../../hooks/useCourseTracking';

import { InfoTooltip } from '../../components/ui/InfoTooltip';

// ─────────────────────────────────────────────────────────────────────────────
// Question display names — centralised here, sourced from practiceLibrary
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
  step,
  isAccessValid,
  onClick,
}: {
  icon: any;
  label: string;
  sub: string;
  status: PillarStatus;
  color: string;
  done?: number;
  total?: number;
  step: string;
  isAccessValid?: boolean;
  onClick: () => void;
}) {
  const cfg = {
    done: { text: 'Completed', bg: color + '18', textColor: color },
    active: { text: isAccessValid ? 'Ready' : 'Locked', bg: isAccessValid ? color + '22' : 'var(--bg-secondary)', textColor: isAccessValid ? color : 'var(--text-muted)' },
    waiting: { text: isAccessValid ? 'Next' : 'Locked', bg: 'var(--bg-secondary)', textColor: 'var(--text-muted)' },
  }[status];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border text-left transition-all duration-300',
        status === 'done'
            ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50'
            : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-sm'
      )}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={{
          background: status === 'waiting' ? 'var(--bg-secondary)' : color + '15',
          border: `1.5px solid ${status === 'waiting' ? 'var(--border-subtle)' : color + '35'}`,
        }}
      >
        <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[8px] font-black uppercase tracking-widest text-[var(--accent-primary)] shadow-sm z-10 transition-colors">
          {step}
        </span>
        {status === 'done'
          ? <CheckCircle2 size={16} style={{ color }} />
          : <Icon size={16} style={{ color: status === 'waiting' ? 'var(--text-muted)' : color }} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
           <p className={cn(
            'text-[13px] font-serif leading-tight',
            status === 'done' ? 'line-through opacity-60 text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
          )}>
            {label}
          </p>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate leading-relaxed">
          {sub}
        </p>
        
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
        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1.5"
        style={{ background: cfg.bg, color: cfg.textColor }}
      >
        {(status === 'active' || status === 'waiting') && !isAccessValid && <Lock size={10} className="opacity-70" />}
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
  weeklyAssignment?: WeeklyAssignment;
  onViewProgress?: () => void;
  onNavigate: (
    tab: string,
    questionId?: string,
    view?: 'explanation' | 'video' | 'practice'
  ) => void;
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

export function TodayPath({
  userId,
  onNavigate,
  progress,
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
    isCompleted: practiceCompleted,
    record,
    markLearn,
    markIntegrate,
  } = useDailyPractice(userId, questionId, requiredTriggers);

  const [showCommitment, setShowCommitment] = useState(false);

  const learnDone = record?.learnCompleted === true;
  const reflectDone = record?.reflectCompleted === true;
  const integrateDone = record?.integrateCompleted === true;

  if (!questionMeta || !practice) return null;

  const handleLearn = () => {
    if (isAccessValid) markLearn();
    onNavigate('wisdom_untethered', questionId, 'explanation');
  };

  const handlePractice = () => {
    onNavigate('situations');
  };

  const handleReflect = () => {
    // We only navigate here. The 'markReflect' status will be triggered
    // once the user actually saves their journal entry in the Journal view.
    localStorage.setItem('awakened-journal-prompt', questionMeta.journalPrompt);
    localStorage.setItem('awakened-reflect-question-id', questionId);
    onNavigate('chapters');
  };

  const handleIntegrate = () => {
    if (integrateDone) return;
    if (!reflectDone) {
      alert("Please complete the first three steps before making your daily commitment.");
      return;
    }
    setShowCommitment(true);
  };

  const confirmIntegrate = () => {
    if (isAccessValid) markIntegrate();
    setShowCommitment(false);
  };

  const wuLearntCount = Object.values(progress || {}).filter(q => q.read).length;
  const wuTotal = 27; 
  
  const doneCount = [learnDone, practiceCompleted, reflectDone, integrateDone].filter(Boolean).length;
  const allDone = learnDone && practiceCompleted && reflectDone && integrateDone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)]"
    >
      {/* ── Week context banner ── */}
      <div
        className="flex items-center justify-between px-5 py-2.5 rounded-t-[28px]"
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
            Today's Practice
          </p>
          <h3 className="text-[15px] font-serif font-light text-[var(--text-primary)] leading-tight">
            {questionMeta.shortTitle}
          </h3>
        </div>
        {/* Progress dots */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-1.5">
            {[learnDone, practiceCompleted, reflectDone, integrateDone].map((done, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-500"
                style={{ background: done ? color : 'var(--border-subtle)' }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              {doneCount}/4
            </span>
            <InfoTooltip 
              title="Daily Journey"
              description="Four simple steps each day: Learn the wisdom, Practice the technique, Reflect on your shift, and Live the teaching."
              howCalculated="Every step builds the habit of awareness."
            />
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4 h-px" style={{ background: color + '20' }} />

      {/* ── Four pillars ── */}
      <div className="px-4 pb-4 space-y-2">
        <Pillar
          step="Step 1"
          icon={BookOpen}
          label="Learn"
          sub={learnDone ? "Wisdom absorbed" : "Read today's teaching"}
          status={learnDone ? 'done' : 'active'}
          color={color}
          isAccessValid={isAccessValid}
          onClick={handleLearn}
          done={wuLearntCount}
          total={wuTotal}
        />
        <Pillar
          step="Step 2"
          icon={Zap}
          label="Practice"
          sub={practiceCompleted ? "Technique used" : `Technique: ${practice.name}`}
          status={practiceCompleted ? 'done' : 'active'}
          color={color}
          isAccessValid={isAccessValid}
          onClick={handlePractice}
        />
        <Pillar
          step="Step 3"
          icon={PenLine}
          label="Reflect"
          sub={reflectDone ? 'Journal entry done' : "Write your thoughts"}
          status={reflectDone ? 'done' : (practiceCompleted ? 'active' : 'waiting')}
          color={color}
          isAccessValid={isAccessValid}
          onClick={handleReflect}
        />
        <Pillar
          step="Step 4"
          icon={CheckCircle2}
          label="Live It"
          sub={integrateDone ? "Committed to life" : "Promise to live it today"}
          status={integrateDone ? 'done' : (reflectDone ? 'active' : 'waiting')}
          color={color}
          isAccessValid={isAccessValid}
          onClick={handleIntegrate}
        />
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
            Beautiful. All four steps complete for today. 🌸
          </p>
        </motion.div>
      )}

      {/* ── Commitment Modal ── */}
      <AnimatePresence>
        {showCommitment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[40px] p-10 text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={32} className="text-[var(--accent-primary)]" />
                </div>
                
                <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">Sacred Commitment</h3>
                
                <p className="text-[15px] text-[var(--text-secondary)] font-serif italic leading-relaxed">
                  "{questionMeta.dailyIntent}"
                </p>
                
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={confirmIntegrate}
                    className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-black font-bold uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[var(--accent-primary)]/20"
                  >
                    I Promise to Live This
                  </button>
                  <button
                    onClick={() => setShowCommitment(false)}
                    className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Wait, I'm not ready
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
