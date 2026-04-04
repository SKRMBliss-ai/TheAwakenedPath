// @ts-nocheck
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, BookOpen, ChevronRight } from 'lucide-react';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useState, useEffect } from 'react';

// ── Practice definitions (self-contained — no external imports needed) ────────

const WISDOM_PRACTICES = [
  {
    id: 'question1',
    questionNum: 1,
    questionTitle: 'Using the Mind as a Tool',
    practiceName: '"I Can Handle This"',
    practiceDesc: 'When a spiral starts today — say it slowly, three times.',
    duration: '30 sec when triggered',
    color: '#B8973A',
    steps: [
      'Notice the negative thought or anxious spiral starting.',
      'Stop following it. Take one slow breath.',
      'Say — silently or aloud — "I can handle this." Three times slowly.',
      'Notice what shifts. The thought may remain, but you are no longer inside it.',
    ],
  },
  {
    id: 'question2',
    questionNum: 2,
    questionTitle: 'The Doubting Narrator',
    practiceName: 'The Radio Check',
    practiceDesc: 'Sit quietly for 2 minutes. Watch the voice without following it.',
    duration: '2 min',
    color: '#9575CD',
    steps: [
      'Sit quietly. Close your eyes if you can. Take one slow breath.',
      'Notice what the mind is saying. Don\'t answer it. Just hear it.',
      'Gently name what you hear — "there\'s the worry voice", "there\'s the guilt loop."',
      'Ask: who is noticing this? That one has been perfectly still the entire time.',
      'Take one more breath. Open your eyes. You are not the radio.',
    ],
  },
  {
    id: 'question3',
    questionNum: 3,
    questionTitle: 'Personal to Impersonal',
    practiceName: 'The Cosmic Pause × 3',
    practiceDesc: 'Three times today — car, door, phone — stop one second and notice.',
    duration: '1 sec × 3',
    color: '#3A8BBF',
    triggerCount: 3,
    triggers: [
      'Before starting the car — notice you\'re on a small planet spinning in space.',
      'Before walking through a door — you\'re stepping into another moment of your life.',
      'Before picking up your phone — respond from the wider frame, not the reactive mind.',
    ],
  },
  {
    id: 'question4',
    questionNum: 4,
    questionTitle: 'Which Mind to Listen To',
    practiceName: 'The Clarity Sit',
    practiceDesc: 'Sit for 3 minutes. Don\'t silence the mind — just stay settled beneath it.',
    duration: '3 min',
    color: '#2E9E7A',
    locked: true,
    steps: [
      'Sit comfortably. Take two slow breaths.',
      'The mind will talk. Let it. You are not trying to stop it.',
      'When you\'re pulled into a thought — gently notice, and return to stillness.',
      'In this clarity, you\'ll naturally know which thoughts are useful.',
    ],
  },
];

// ── Firestore helpers ─────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function usePracticeRecord(userId: string | undefined, questionId: string) {
  const [completed, setCompleted] = useState(false);
  const [triggers, setTriggers] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'dailyPractices', todayStr());
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data()?.[questionId];
        setCompleted(data?.completed ?? false);
        setTriggers(data?.triggersCompleted ?? 0);
      } else {
        setCompleted(false);
        setTriggers(0);
      }
    });
    return unsub;
  }, [userId, questionId]);

  const markDone = async () => {
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'dailyPractices', todayStr());
    await setDoc(ref, {
      [questionId]: { completed: true, completedAt: Timestamp.now() }
    }, { merge: true });
  };

  const markTrigger = async (required: number) => {
    if (!userId) return;
    const next = Math.min(triggers + 1, required);
    const ref = doc(db, 'users', userId, 'dailyPractices', todayStr());
    await setDoc(ref, {
      [questionId]: {
        triggersCompleted: next,
        completed: next >= required,
        ...(next >= required ? { completedAt: Timestamp.now() } : {}),
      }
    }, { merge: true });
  };

  return { completed, triggers, markDone, markTrigger };
}

// ── Single practice card ──────────────────────────────────────────────────────

function WisdomCard({ practice, userId }: { practice: typeof WISDOM_PRACTICES[0]; userId: string | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1); // -1 = not started
  const { completed, triggers, markDone, markTrigger } = usePracticeRecord(userId, practice.id);

  const isQ3 = practice.triggerCount !== undefined;
  const isLocked = !!practice.locked;
  const color = practice.color;

  const handleStart = () => {
    if (isLocked || completed) return;
    setStepIndex(0);
    setExpanded(true);
  };

  const handleNextStep = async () => {
    const steps = practice.steps || [];
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      await markDone();
      setStepIndex(-1);
    }
  };

  return (
    <motion.div
      layout
      className="rounded-[24px] border transition-all duration-400 overflow-hidden"
      style={{
        borderColor: completed
          ? 'var(--border-subtle)'
          : expanded
            ? color + '40'
            : 'var(--border-subtle)',
        background: completed
          ? 'var(--bg-surface)'
          : expanded
            ? color + '06'
            : 'var(--bg-surface)',
        opacity: isLocked ? 0.4 : 1,
      }}
    >
      {/* Card header — always visible */}
      <button
        disabled={isLocked}
        onClick={() => isLocked ? null : setExpanded(e => !e)}
        className="w-full flex items-center gap-4 p-4 text-left"
        style={{ cursor: isLocked ? 'default' : 'pointer' }}
      >
        {/* Number badge */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-serif transition-all"
          style={{
            background: completed ? color + '20' : 'var(--bg-secondary)',
            border: `1.5px solid ${completed ? color + '60' : 'var(--border-subtle)'}`,
            color: completed ? color : 'var(--text-muted)',
          }}
        >
          {completed ? <CheckCircle2 size={15} style={{ color }} /> : practice.questionNum}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5"
            style={{ color: isLocked ? 'var(--text-muted)' : color }}>
            {isLocked ? 'Locked' : `Q${practice.questionNum} · ${practice.questionTitle}`}
          </p>
          <p className="text-[14px] font-serif text-[var(--text-primary)] leading-tight">
            {practice.practiceName}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {practice.practiceDesc}
          </p>
        </div>

        {/* Duration + state */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {completed ? (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: color + '18', color }}>
              ✓ Done
            </span>
          ) : (
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {practice.duration}
            </span>
          )}
          {!isLocked && !completed && (
            <ChevronRight
              size={14}
              className="text-[var(--text-muted)] transition-transform duration-300"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && !isLocked && !completed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 space-y-3">
            {/* Q3 — three tap-to-mark triggers */}
            {isQ3 ? (
              <div className="space-y-2">
                {practice.triggers!.map((label, i) => {
                  const done = i < triggers;
                  return (
                    <button
                      key={i}
                      disabled={done}
                      onClick={() => markTrigger(practice.triggerCount!)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: done ? color + '30' : 'var(--border-subtle)',
                        background: done ? color + '08' : 'var(--bg-secondary)',
                        cursor: done ? 'default' : 'pointer',
                      }}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                        style={{
                          background: done ? color + '25' : 'var(--border-subtle)',
                          color: done ? color : 'var(--text-muted)',
                          border: `1.5px solid ${done ? color : 'transparent'}`,
                        }}>
                        {done ? <CheckCircle2 size={12} style={{ color }} /> : i + 1}
                      </div>
                      <span className={`text-[12px] font-serif flex-1 ${done ? 'line-through opacity-50' : ''}`}
                        style={{ color: 'var(--text-primary)' }}>
                        {label}
                      </span>
                      {!done && (
                        <span className="text-[9px] font-bold uppercase tracking-wider"
                          style={{ color }}>
                          Tap when done
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Standard steps */
              <div className="space-y-3">
                {/* Progress bar */}
                {stepIndex >= 0 && (
                  <div className="flex gap-1 mb-3">
                    {practice.steps!.map((_, i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-400"
                        style={{
                          background: i <= stepIndex ? color : 'var(--border-subtle)',
                          opacity: i < stepIndex ? 0.4 : 1,
                        }} />
                    ))}
                  </div>
                )}

                {stepIndex === -1 ? (
                  /* Not started yet — show all steps as preview */
                  <div className="space-y-2">
                    {practice.steps!.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl"
                        style={{ background: 'var(--bg-secondary)' }}>
                        <span className="text-[10px] font-bold mt-0.5 flex-shrink-0"
                          style={{ color }}>
                          {i + 1}.
                        </span>
                        <p className="text-[12px] font-serif text-[var(--text-secondary)] leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={handleStart}
                      className="w-full py-3 rounded-xl font-bold uppercase tracking-[0.15em] text-[11px] mt-2 transition-all active:scale-[0.98]"
                      style={{ background: color, color: 'white', border: 'none', cursor: 'pointer', boxShadow: `0 6px 20px -6px ${color}80` }}>
                      Begin Practice
                    </button>
                  </div>
                ) : (
                  /* In progress — show current step */
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color }}>
                        Step {stepIndex + 1} of {practice.steps!.length}
                      </p>
                      <p className="text-[15px] font-serif text-[var(--text-primary)] leading-relaxed">
                        {practice.steps![stepIndex]}
                      </p>
                    </div>
                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 rounded-xl font-bold uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      style={{ background: color, color: 'white', border: 'none', cursor: 'pointer', boxShadow: `0 6px 20px -6px ${color}80` }}>
                      {stepIndex < practice.steps!.length - 1
                        ? <><ChevronRight size={13} /> Next Step</>
                        : <><CheckCircle2 size={13} /> Mark as Done</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Completed state */}
      {completed && expanded && (
        <div className="px-4 pb-4 text-center">
          <p className="text-[12px] font-serif italic text-[var(--text-muted)]">
            Practice complete for today. Come back tomorrow.
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Main section export ───────────────────────────────────────────────────────

export function WisdomPracticeSection({ userId }: { userId: string | undefined }) {
  // Get current active question from localStorage
  const activeId = useMemo(
    () => localStorage.getItem('awakened-path-active-question') || 'question1',
    []
  );

  // Sort so active question is first, completed ones go to bottom
  const [orderedPractices, setOrderedPractices] = useState(WISDOM_PRACTICES);

  return (
    <section className="space-y-4">
      {/* Section header — same style as existing collection headers */}
      <div className="flex items-center gap-5">
        <div className="p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="16" stroke="#B8973A" strokeWidth="1.5" fill="#B8973A" fillOpacity="0.08" />
            <circle cx="28" cy="28" r="5" fill="#B8973A" fillOpacity="0.7" />
            <circle cx="28" cy="28" r="24" stroke="#B8973A" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
          </svg>
        </div>
        <div className="space-y-0.5">
          <h3 className="text-2xl font-serif font-light" style={{ color: 'var(--text-primary)' }}>
            Wisdom Untethered
          </h3>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-50" style={{ color: 'var(--text-muted)' }}>
            Chapter 1 · Daily practices
          </p>
        </div>
      </div>

      {/* Practice cards */}
      <div className="space-y-3">
        {WISDOM_PRACTICES.map(practice => (
          <WisdomCard
            key={practice.id}
            practice={practice}
            userId={userId}
          />
        ))}
      </div>

      {/* Thin divider before existing collections */}
      <div className="pt-4 border-t border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
    </section>
  );
}
