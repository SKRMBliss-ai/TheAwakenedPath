// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronDown, ChevronRight,
  Play, Pause, RotateCcw, Brain, Radio, Globe, Sparkles,
  Clock, Target
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getPractice } from './practiceLibrary';
import type { QuestionPractice } from './practiceLibrary';
import { useDailyPractice } from './useDailyPractice';
import { useCourseTracking } from '../../hooks/useCourseTracking';

// ─────────────────────────────────────────────────────────────────────────────
// Icon map
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP = {
  brain:   Brain,
  radio:   Radio,
  planet:  Globe,
  clarity: Sparkles,
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface DailyPracticeCardProps {
  questionId: string;
  userId: string | undefined | null;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Timer sub-component
// ─────────────────────────────────────────────────────────────────────────────

function StepTimer({
  seconds,
  onComplete,
  color,
}: {
  seconds: number;
  onComplete: () => void;
  color: string;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running, onComplete]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="flex items-center gap-3 mt-3">
      {/* Progress arc */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor"
            strokeWidth="3" className="text-[var(--border-subtle)]" />
          <circle cx="20" cy="20" r="16" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 16}`}
            strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold"
          style={{ color }}>
          {remaining}
        </span>
      </div>

      {/* Play/pause */}
      <button
        onClick={() => setRunning((r) => !r)}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all"
        style={{
          borderColor: color + '40',
          color,
          background: color + '10',
        }}
      >
        {running
          ? <><Pause size={10} /> Pause</>
          : <><Play  size={10} /> Resume</>
        }
      </button>

      <button
        onClick={() => { setRemaining(seconds); setRunning(true); }}
        className="p-1.5 rounded-full opacity-40 hover:opacity-80 transition-opacity"
        style={{ color }}
      >
        <RotateCcw size={12} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q3 — Three-trigger variant
// ─────────────────────────────────────────────────────────────────────────────

function ThreeTriggerPractice({
  practice,
  userId,
}: {
  practice: QuestionPractice;
  userId: string | undefined | null;
}) {
  const { isCompleted, triggersCompleted, markTrigger, markUndone } =
    useDailyPractice(userId, practice.questionId, 3);

  const color = practice.color;
  const labels = ['Before starting the car', 'Before walking through a door', 'Before picking up the phone'];

  return (
    <div className="space-y-3 mt-4">
      {labels.map((label, i) => {
        const done = i < triggersCompleted;
        return (
          <motion.button
            key={i}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!done) markTrigger();
            }}
            disabled={done}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-400',
              done
                ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] cursor-pointer'
            )}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: done ? color + '20' : 'var(--bg-secondary)',
                border: `1.5px solid ${done ? color : 'var(--border-subtle)'}`,
              }}>
              {done
                ? <CheckCircle2 size={14} style={{ color }} />
                : <span className="text-[12px] font-bold text-[var(--text-muted)]">{i + 1}</span>
              }
            </div>
            <span className={cn(
              'text-[13px] font-serif transition-colors',
              done ? 'text-[var(--text-muted)] line-through opacity-60' : 'text-[var(--text-primary)]'
            )}>
              {label}
            </span>
            {!done && (
              <span className="ml-auto text-[11px] font-bold uppercase tracking-widest"
                style={{ color }}>
                Tap when done
              </span>
            )}
          </motion.button>
        );
      })}

      {isCompleted && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={markUndone}
          className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 mt-1 ml-1 opacity-40 hover:opacity-80 transition-opacity"
        >
          Reset today's practice
        </motion.button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard step-by-step guided practice (Q1, Q2, Q4)
// ─────────────────────────────────────────────────────────────────────────────

function GuidedStepPractice({
  practice,
  userId,
  onComplete,
}: {
  practice: QuestionPractice;
  userId: string | undefined | null;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepDone, setStepDone] = useState(false);

  const color = practice.color;
  const step = practice.steps[currentStep];
  const isLast = currentStep === practice.steps.length - 1;

  const handleStepDone = useCallback(() => {
    setStepDone(true);
  }, []);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
      setStepDone(false);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Step progress dots */}
      <div className="flex items-center gap-2 mb-4">
        {practice.steps.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i <= currentStep ? color : 'var(--border-subtle)',
              opacity: i < currentStep ? 0.4 : 1,
            }}
          />
        ))}
      </div>

      {/* Step label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <span className="text-[12px] font-bold uppercase tracking-[0.25em]"
            style={{ color }}>
            Step {currentStep + 1} of {practice.steps.length}
          </span>
          <p className="text-[15px] font-serif leading-relaxed text-[var(--text-primary)]">
            {step.instruction}
          </p>

          {/* Timer — only if step has a duration */}
          {step.duration && !stepDone && (
            <StepTimer
              seconds={step.duration}
              onComplete={handleStepDone}
              color={color}
            />
          )}

          {/* Manual "done" for steps without a timer */}
          {!step.duration && (
            <button
              onClick={handleStepDone}
              className="text-[12px] font-bold uppercase tracking-widest mt-2 opacity-50 hover:opacity-100 transition-opacity"
              style={{ color }}
            >
              Done with this step →
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next / Finish */}
      <AnimatePresence>
        {stepDone && (
          <motion.button
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl font-bold uppercase tracking-[0.15em] text-[12px] flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98]"
            style={{
              background: color,
              color: 'white',
              boxShadow: `0 8px 24px -8px ${color}80`,
            }}
          >
            {isLast
              ? <><CheckCircle2 size={14} /> Mark as Done</>
              : <><ChevronRight size={14} /> Next Step</>
            }
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main card
// ─────────────────────────────────────────────────────────────────────────────

export function DailyPracticeCard({
  questionId,
  userId,
  className,
}: DailyPracticeCardProps) {
  const practice = getPractice(questionId);
  const isQ3 = questionId === 'question3';
  const requiredTriggers = isQ3 ? 3 : 1;

  const { isCompleted, isLoading, markDone, markUndone, triggersCompleted } =
    useDailyPractice(userId, questionId, requiredTriggers);
  const { updateProgress: updateCourseProgress } = useCourseTracking(userId);

  const [expanded, setExpanded] = useState(false);
  const [practicing, setPracticing] = useState(false);

  // Auto-collapse once completed
  useEffect(() => {
    if (isCompleted) {
      setPracticing(false);
    }
  }, [isCompleted]);

  if (!practice || isLoading) return null;

  const Icon = ICON_MAP[practice.icon] ?? Sparkles;
  const color = practice.color;

  const handlePracticeComplete = async () => {
    await markDone();
    await updateCourseProgress(questionId, { practice: true });
    setPracticing(false);
  };

  const handleReset = async () => {
    await markUndone();
    await updateCourseProgress(questionId, { practice: false });
  };

  return (
    <motion.div
      layout
      className={cn(
        'rounded-[28px] border transition-all duration-500 overflow-hidden',
        isCompleted
          ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/60'
          : 'border-[var(--border-default)] bg-[var(--bg-surface)]',
        className
      )}
      style={isCompleted ? {} : { boxShadow: `0 0 0 1px ${color}18` }}
    >
      {/* ── Header row ── */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 p-5 text-left group"
      >
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
          style={{
            background: isCompleted ? color + '18' : color + '12',
            border: `1.5px solid ${color}${isCompleted ? '50' : '30'}`,
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[12px] font-bold uppercase tracking-[0.25em]"
              style={{ color }}
            >
              Today's Practice
            </span>
            {isCompleted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: color + '18', color }}
              >
                ✓ Done
              </motion.span>
            )}
          </div>
          <h4 className="text-[15px] font-serif font-medium text-[var(--text-primary)] leading-tight">
            {practice.name}
          </h4>
          <p className="text-[11px] font-serif italic text-[var(--text-muted)] mt-0.5 opacity-70">
            {practice.tagline}
          </p>
        </div>

        {/* Duration + chevron */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <Clock size={9} />
            {practice.durationLabel}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-[var(--text-muted)] transition-transform duration-300',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* ── Expanded content ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 space-y-5">

              {/* Singer source quote */}
              <div
                className="rounded-xl p-4 border-l-2"
                style={{
                  borderLeftColor: color,
                  background: color + '08',
                }}
              >
                <p className="text-[12px] font-serif italic text-[var(--text-secondary)] leading-relaxed">
                  {practice.singerSource}
                </p>
              </div>

              {/* How it works */}
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {practice.howItWorks}
              </p>

              {/* Completion criteria */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--bg-secondary)]">
                <Target size={12} className="mt-0.5 flex-shrink-0 text-[var(--text-muted)]" />
                <p className="text-[11px] text-[var(--text-muted)] leading-snug">
                  <span className="font-bold uppercase tracking-wider mr-1">Done when:</span>
                  {practice.completionCriteria}
                </p>
              </div>

              {/* ── Q3 — Three-trigger variant ── */}
              {isQ3 && !isCompleted && (
                <ThreeTriggerPractice practice={practice} userId={userId} />
              )}

              {/* ── Standard — guided steps ── */}
              {!isQ3 && !isCompleted && !practicing && (
                <button
                  onClick={() => setPracticing(true)}
                  className="w-full py-3.5 rounded-2xl font-bold uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    background: color,
                    color: 'white',
                    boxShadow: `0 8px 24px -8px ${color}80`,
                  }}
                >
                  <Play size={13} fill="currentColor" /> Start Practice
                </button>
              )}

              {!isQ3 && !isCompleted && practicing && (
                <GuidedStepPractice
                  practice={practice}
                  userId={userId}
                  onComplete={handlePracticeComplete}
                />
              )}

              {/* ── Completed state ── */}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-4 text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: color + '18', border: `1.5px solid ${color}50` }}
                  >
                    <CheckCircle2 size={22} style={{ color }} />
                  </div>
                  <p className="text-[13px] font-serif italic text-[var(--text-secondary)]">
                    Practice complete for today.
                    <br />
                    <span className="opacity-60 text-[11px]">Come back tomorrow to continue the training.</span>
                  </p>
                  <button
                    onClick={markUndone}
                    className="text-[9px] text-[var(--text-muted)] underline underline-offset-2 opacity-40 hover:opacity-80 transition-opacity mt-1"
                  >
                    Undo
                  </button>
                </motion.div>
              )}

              {/* Q3 completed state */}
              {isQ3 && isCompleted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-4 text-center"
                >
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: color + '20', border: `1.5px solid ${color}` }}>
                        <CheckCircle2 size={14} style={{ color }} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] font-serif italic text-[var(--text-secondary)]">
                    All three cosmic pauses complete.
                    <br />
                    <span className="opacity-60 text-[11px]">You practiced the impersonal view today.</span>
                  </p>
                  <button
                    onClick={markUndone}
                    className="text-[9px] text-[var(--text-muted)] underline underline-offset-2 opacity-40 hover:opacity-80 transition-opacity"
                  >
                    Reset
                  </button>
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
