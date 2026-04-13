// TodayPath.tsx
// Winding path UI — Byju's style 4-step daily journey.
// Drop-in replacement. Same props interface as before.
// @ts-nocheck

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';
import { useDailyPractice } from '../practices/useDailyPractice';
import type { WeeklyAssignment } from '../../hooks/useWeeklyAssignment';
import type { CourseProgress } from '../../hooks/useCourseTracking';
import { InfoTooltip } from '../../components/ui/InfoTooltip';

// ─────────────────────────────────────────────────────────────────────────────
// Question meta — same as original
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTION_META: Record<string, {
  shortTitle: string;
  journalPrompt: string;
  dailyIntent: string;
}> = {
  question1: {
    shortTitle: 'Q1 · Using the Mind as a Tool',
    journalPrompt: 'When did the spiral start today, and what shifted when you redirected?',
    dailyIntent: "I will notice my mind's chatter and consciously redirect it to a steady affirmation today.",
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
    dailyIntent: "I will remain as the observer today, allowing life's flow to happen without losing my seat of awareness.",
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
// Step definitions
// ─────────────────────────────────────────────────────────────────────────────

// SVG viewBox: 340 wide × 460 tall
// Winding path: node 1 top-right, node 2 mid-left, node 3 lower-right, node 4 bottom-left
const STEP_POSITIONS = [
  { x: 232, y: 56,  side: 'left'  as const },
  { x: 108, y: 176, side: 'right' as const },
  { x: 232, y: 296, side: 'left'  as const },
  { x: 108, y: 416, side: 'right' as const },
];

// The S-curve path through all 4 nodes
const WINDING_PATH =
  'M 232 56 C 232 96, 108 136, 108 176 C 108 216, 232 256, 232 296 C 232 336, 108 376, 108 416';

// Total approximate arc length
const PATH_LENGTH = 720;

const STEP_DEFS = [
  {
    id: 'learn'    as const,
    num: 1,
    label: 'Learn',
    sub: "Read today's teaching",
    doneLine: 'Wisdom absorbed',
    icon: '📖',
  },
  {
    id: 'practice' as const,
    num: 2,
    label: 'Practice',
    sub: 'Complete the technique',
    doneLine: 'Technique complete',
    icon: '⚡',
  },
  {
    id: 'reflect'  as const,
    num: 3,
    label: 'Reflect',
    sub: 'Write in your journal',
    doneLine: 'Journal entry saved',
    icon: '✍️',
  },
  {
    id: 'liveit'   as const,
    num: 4,
    label: 'Live It',
    sub: 'Make your sacred commitment',
    doneLine: 'Commitment made ✦',
    icon: '🤍',
  },
];

type StepId = 'learn' | 'practice' | 'reflect' | 'liveit';

// ─────────────────────────────────────────────────────────────────────────────
// Node component
// ─────────────────────────────────────────────────────────────────────────────

function PathNode({
  step,
  pos,
  status,
  color,
  onClick,
  practiceName,
}: {
  step: typeof STEP_DEFS[number];
  pos: typeof STEP_POSITIONS[number];
  status: 'done' | 'active' | 'next';
  color: string;
  onClick: () => void;
  practiceName?: string;
}) {
  const isDone   = status === 'done';
  const isActive = status === 'active';

  // Convert SVG coords to % positions over the SVG element
  const leftPct = (pos.x / 340 * 100).toFixed(2) + '%';
  const topPct  = (pos.y / 460 * 100).toFixed(2) + '%';

  const labelLeft  = pos.side === 'left';

  return (
    <>
      {/* ── Node circle ── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: step.num * 0.1, type: 'spring', stiffness: 320, damping: 22 }}
        onClick={onClick}
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: leftPct, top: topPct, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <motion.div
          animate={isActive ? {
            boxShadow: [
              `0 0 14px ${color}33`,
              `0 0 28px ${color}66`,
              `0 0 14px ${color}33`,
            ],
            scale: [1, 1.07, 1],
          } : {}}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{
            background: isDone
              ? `linear-gradient(145deg, ${color}ee, ${color}88)`
              : isActive
                ? `${color}20`
                : 'rgba(255,255,255,0.04)',
            border: `2px solid ${isDone ? color : isActive ? color + '80' : 'rgba(255,255,255,0.10)'}`,
            boxShadow: isDone
              ? `0 0 22px ${color}55, 0 4px 12px rgba(0,0,0,0.4)`
              : 'none',
          }}
        >
          <AnimatePresence mode="wait">
            {isDone ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                style={{ fontSize: 20, lineHeight: 1, color: 'white' }}
              >
                ✓
              </motion.span>
            ) : (
              <motion.span
                key="icon"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: isActive ? 1 : 0.4 }}
                style={{ fontSize: 18, lineHeight: 1 }}
              >
                {step.icon}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>

      {/* ── Label card ── */}
      <motion.button
        initial={{ opacity: 0, x: labelLeft ? -12 : 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: step.num * 0.12 + 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        className={cn(
          'absolute z-10 -translate-y-1/2 text-left transition-all duration-300',
          'rounded-2xl border px-3 py-2.5',
          isDone
            ? 'border-[var(--border-subtle)] bg-transparent opacity-55'
            : isActive
              ? 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-lg'
              : 'bg-[var(--bg-surface)]/50 border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
        )}
        style={{
          // Place to the left or right of the node, clear of the 52px circle
          ...(labelLeft
            ? { right: `calc(${(1 - pos.x / 340) * 100}% + 34px)`, minWidth: 120, maxWidth: 136 }
            : { left:  `calc(${pos.x / 340 * 100}% + 34px)`,        minWidth: 120, maxWidth: 136 }),
          top: topPct,
          ...(isActive ? {
            borderColor: color + '50',
            boxShadow: `0 4px 20px ${color}18`,
          } : {}),
          background: 'none', // override motion.button default
          cursor: 'pointer',
        }}
      >
        {/* Step number tag */}
        <div
          className="text-[8px] font-black uppercase tracking-[.22em] mb-1"
          style={{ color: isDone ? color + '55' : isActive ? color : 'rgba(255,255,255,.2)' }}
        >
          Step {step.num}
        </div>

        {/* Title */}
        <div
          className="text-[13px] font-serif leading-tight"
          style={{
            color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {step.label}
        </div>

        {/* Sub / done line */}
        {isDone ? (
          <div className="text-[9px] mt-1 font-serif italic" style={{ color: color + '80' }}>
            {step.doneLine}
          </div>
        ) : (
          <>
            <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,.28)' }}>
              {step.id === 'practice' && practiceName ? practiceName : step.sub}
            </div>
            {/* CTA pill */}
            <div
              className="mt-2 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-[.16em] px-2 py-1 rounded-full transition-all"
              style={{
                background: isActive ? color + '22' : 'rgba(255,255,255,.04)',
                color: isActive ? color : 'rgba(255,255,255,.25)',
                border: `1px solid ${isActive ? color + '40' : 'rgba(255,255,255,.08)'}`,
              }}
            >
              <span style={{ fontSize: 9 }}>→</span>
              {isActive ? 'Begin' : 'Next'}
            </div>
          </>
        )}
      </motion.button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props — identical to original
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
// Main
// ─────────────────────────────────────────────────────────────────────────────

export function TodayPath({
  userId,
  onNavigate,
  weeklyAssignment,
  onViewProgress,
  isAccessValid,
}: TodayPathProps) {
  const assignment   = weeklyAssignment ?? FALLBACK_ASSIGNMENT;
  const { questionId, weekLabel, daysRemaining } = assignment;
  const questionMeta = QUESTION_META[questionId] || QUESTION_META['question1'];
  const practice     = PRACTICE_LIBRARY[questionId];
  const color        = practice?.color ?? '#B8973A';
  const requiredTriggers = questionId === 'question3' ? 3 : 1;

  const { isAnyPracticeDone, record, markLearn, markIntegrate } =
    useDailyPractice(userId, questionId, requiredTriggers);

  const [showCommitment, setShowCommitment] = useState(false);

  const practiceCompleted = isAnyPracticeDone;
  const learnDone         = record?.learnCompleted === true;
  const reflectDone       = record?.reflectCompleted === true;
  const integrateDone     = record?.integrateCompleted === true;

  const doneStates: Record<StepId, boolean> = {
    learn:    learnDone,
    practice: practiceCompleted,
    reflect:  reflectDone,
    liveit:   integrateDone,
  };

  const doneCount = Object.values(doneStates).filter(Boolean).length;
  const allDone   = doneCount === 4;

  // Which step is the current focus (first undone)
  const firstUndoneIdx = STEP_DEFS.findIndex(s => !doneStates[s.id]);

  const getStatus = (id: StepId, idx: number): 'done' | 'active' | 'next' => {
    if (doneStates[id]) return 'done';
    return idx === firstUndoneIdx ? 'active' : 'next';
  };

  const handleStep = (id: StepId) => {
    if (doneStates[id]) return;
    switch (id) {
      case 'learn':
        if (isAccessValid) markLearn();
        onNavigate('wisdom_untethered', questionId, 'explanation');
        break;
      case 'practice':
        onNavigate('situations');
        break;
      case 'reflect':
        localStorage.setItem('awakened-journal-prompt', questionMeta.journalPrompt);
        localStorage.setItem('awakened-reflect-question-id', questionId);
        onNavigate('chapters');
        break;
      case 'liveit':
        setShowCommitment(true);
        break;
    }
  };

  const confirmIntegrate = () => {
    if (isAccessValid) markIntegrate();
    setShowCommitment(false);
  };

  // Progress path fill — dashoffset decreases as steps complete
  const pathOffsets = [PATH_LENGTH, PATH_LENGTH * 0.74, PATH_LENGTH * 0.49, PATH_LENGTH * 0.25, 0];
  const pathDashOffset = pathOffsets[doneCount] ?? PATH_LENGTH;

  if (!questionMeta || !practice) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      >
        {/* ── Header band ── */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{
            background: `linear-gradient(90deg, ${color}18, ${color}06)`,
            borderBottom: `1px solid ${color}20`,
          }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={11} style={{ color }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color }}>
              {weekLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-muted)]">{daysRemaining}d left</span>
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

        {/* ── Title + status ── */}
        <div className="flex items-start justify-between px-5 pt-4 pb-2 gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">
              Today's Practice
            </p>
            <h3 className="text-[15px] font-serif text-[var(--text-primary)] leading-snug">
              {questionMeta.shortTitle}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Status badge */}
            <motion.div
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

            {/* Progress dots + counter */}
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1">
                {STEP_DEFS.map((s, i) => (
                  <motion.div
                    key={i}
                    animate={doneStates[s.id] ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="w-2 h-2 rounded-full transition-all duration-500"
                    style={{ background: doneStates[s.id] ? color : 'var(--border-subtle)' }}
                  />
                ))}
              </div>
              <span
                className="text-[11px] font-black tabular-nums"
                style={{ color: doneCount > 0 ? color : 'var(--text-muted)' }}
              >
                {doneCount}/4
              </span>
              <InfoTooltip
                title="Daily Journey"
                description="Four steps each day: Learn, Practice, Reflect, then Live It."
                howCalculated="Steps can be done in any order."
              />
            </div>

            {/* Progress bar */}
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

        {/* ── Thin divider ── */}
        <div className="mx-5 mb-0 h-px" style={{ background: color + '14' }} />

        {/* ══════════════════════════════════════════════
            WINDING PATH
        ══════════════════════════════════════════════ */}
        <div className="relative mx-4 mb-2" style={{ height: 460 }}>
          {/* SVG track */}
          <svg
            viewBox="0 0 340 460"
            className="absolute inset-0 w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ghost track */}
            <path
              d={WINDING_PATH}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="3"
              strokeDasharray="6 10"
            />
            {/* Filled progress */}
            <motion.path
              d={WINDING_PATH}
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={PATH_LENGTH}
              animate={{ strokeDashoffset: pathDashOffset }}
              initial={{ strokeDashoffset: PATH_LENGTH }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ opacity: 0.55 }}
            />
            {/* Animated travelling dot along path */}
            {!allDone && (
              <motion.circle
                r="4"
                fill={color}
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                animate={{
                  offsetDistance: ['0%', '100%'],
                }}
                // Uses CSS offset-path — framer handles via custom style
              />
            )}
          </svg>

          {/* Nodes + labels overlay */}
          <div className="absolute inset-0" style={{ position: 'absolute' }}>
            {STEP_DEFS.map((step, idx) => (
              <PathNode
                key={step.id}
                step={step}
                pos={STEP_POSITIONS[idx]}
                status={getStatus(step.id, idx)}
                color={color}
                onClick={() => handleStep(step.id)}
                practiceName={practice?.name}
              />
            ))}
          </div>
        </div>

        {/* ── All done ── */}
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
                style={{ background: color + '10', border: `1px solid ${color}25` }}
              >
                <div className="text-base">🌸</div>
                <p className="text-[12px] font-serif italic text-[var(--text-secondary)]">
                  All four steps complete. Your presence is your gift today.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Sacred commitment modal ── */}
      <AnimatePresence>
        {showCommitment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
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
                <p className="text-[14px] text-[var(--text-secondary)] font-serif italic leading-relaxed">
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
                    className="max-w-xs mx-auto text-xs py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
