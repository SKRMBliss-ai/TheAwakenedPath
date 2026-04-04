// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DailyPracticeCard } from '../practices/DailyPracticeCard';
import { PRACTICE_LIBRARY, QUESTION_IDS } from '../practices/practiceLibrary';
import { useDailyPractice } from '../practices/useDailyPractice';

// ─────────────────────────────────────────────────────────────────────────────
// Question meta — display info per question
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_META: Record<string, { number: number; title: string; locked?: boolean }> = {
  question1: { number: 1, title: 'How can I use the mind as a tool to escape negative thoughts?' },
  question2: { number: 2, title: 'How do I handle the narration that creates doubt, guilt, or fear?' },
  question3: { number: 3, title: 'How can I shift from personal to impersonal thinking?' },
  question4: { number: 4, title: 'Isn\'t the mind helpful sometimes? Which part do I listen to?', locked: true },
};

// ─────────────────────────────────────────────────────────────────────────────
// Single question row — shows completion state + expands DailyPracticeCard
// ─────────────────────────────────────────────────────────────────────────────

function QuestionPracticeRow({
  questionId,
  isActive,
  userId,
  onSelect,
}: {
  questionId: string;
  isActive: boolean;
  userId: string | undefined | null;
  onSelect: () => void;
}) {
  const practice = PRACTICE_LIBRARY[questionId];
  const meta = QUESTION_META[questionId];
  const requiredTriggers = questionId === 'question3' ? 3 : 1;
  const { isCompleted, isLoading } = useDailyPractice(userId, questionId, requiredTriggers);
  const isLocked = !!meta?.locked;

  const color = practice?.color ?? '#8C7E6A';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isLocked ? 0.38 : 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-[24px] border transition-all duration-500 overflow-hidden',
        isActive
          ? 'border-[var(--border-default)] bg-[var(--bg-surface)]'
          : isCompleted
            ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/40'
            : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/60',
        isLocked && 'pointer-events-none'
      )}
    >
      {/* ── Row header — always visible ── */}
      <button
        onClick={isLocked ? undefined : onSelect}
        disabled={isLocked}
        className="w-full flex items-center gap-4 p-5 text-left group"
      >
        {/* Question number badge */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-light text-sm transition-all duration-500"
          style={{
            background: isCompleted ? color + '20' : isActive ? color + '15' : 'var(--bg-secondary)',
            border: `1.5px solid ${isCompleted || isActive ? color + '50' : 'var(--border-subtle)'}`,
            color: isCompleted || isActive ? color : 'var(--text-muted)',
          }}
        >
          {isLocked
            ? <Lock size={13} className="text-[var(--text-muted)]" />
            : isCompleted
              ? <CheckCircle2 size={15} style={{ color }} />
              : meta?.number
          }
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[9px] font-bold uppercase tracking-[0.25em] mb-0.5"
            style={{ color: isLocked ? 'var(--text-muted)' : color }}
          >
            {isLocked ? 'Locked' : `Question ${meta?.number}`}
            {isCompleted && !isLocked && (
              <span
                className="ml-2 text-[8px] px-2 py-0.5 rounded-full"
                style={{ background: color + '18', color }}
              >
                Done today
              </span>
            )}
          </div>
          <p
            className={cn(
              'text-[13px] font-serif leading-snug transition-colors',
              isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
              isCompleted && !isActive && 'opacity-60'
            )}
          >
            {isLocked ? 'Complete earlier questions to unlock' : meta?.title}
          </p>
          {!isLocked && practice && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-serif italic opacity-70">
              {practice.name} · {practice.durationLabel}
            </p>
          )}
        </div>

        {/* Active indicator */}
        {isActive && !isLocked && (
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
        )}
      </button>

      {/* ── DailyPracticeCard — only shown for active question ── */}
      {isActive && !isLocked && practice && (
        <div className="px-5 pb-5">
          <DailyPracticeCard
            questionId={questionId}
            userId={userId}
          />
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

interface WisdomUntetheredPracticeTabProps {
  activeQuestionId: string;
  userId: string | undefined | null;
  onSelectQuestion: (id: string) => void;
}

export function WisdomUntetheredPracticeTab({
  activeQuestionId,
  userId,
  onSelectQuestion,
}: WisdomUntetheredPracticeTabProps) {
  // Count how many are done today for the header
  const q1 = useDailyPractice(userId, 'question1', 1);
  const q2 = useDailyPractice(userId, 'question2', 1);
  const q3 = useDailyPractice(userId, 'question3', 3);
  const q4 = useDailyPractice(userId, 'question4', 1);
  const doneToday = [q1, q2, q3, q4].filter(q => q.isCompleted).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 pb-24 pt-8 space-y-4"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">
          Chapter 1 · The Mind
        </p>
        <h2 className="text-2xl font-serif font-light text-[var(--text-primary)] mb-1">
          Daily Practices
        </h2>
        <p className="text-[13px] font-serif italic text-[var(--text-secondary)] opacity-70">
          One practice per question. Tap a question to begin today's practice.
        </p>

        {/* Progress summary */}
        <div className="flex items-center gap-3 mt-5">
          <div className="flex gap-1.5">
            {QUESTION_IDS.map((qid, i) => {
              const states = [q1, q2, q3, q4];
              const done = states[i]?.isCompleted;
              const isActive = qid === activeQuestionId;
              const practice = PRACTICE_LIBRARY[qid];
              return (
                <div
                  key={qid}
                  className="h-1.5 w-10 rounded-full transition-all duration-500"
                  style={{
                    background: done
                      ? practice?.color ?? '#B8973A'
                      : isActive
                        ? (practice?.color ?? '#B8973A') + '40'
                        : 'var(--border-subtle)',
                  }}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            {doneToday} of 4 done today
          </span>
        </div>
      </div>

      {/* Question rows */}
      <div className="space-y-3">
        {QUESTION_IDS.map((qid) => (
          <QuestionPracticeRow
            key={qid}
            questionId={qid}
            isActive={qid === activeQuestionId}
            userId={userId}
            onSelect={() => onSelectQuestion(qid)}
          />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-[11px] font-serif italic text-[var(--text-muted)] text-center pt-4 opacity-50 leading-relaxed">
        Practices reset each day at midnight.
        <br />
        Consistency matters more than perfection.
      </p>
    </motion.div>
  );
}
