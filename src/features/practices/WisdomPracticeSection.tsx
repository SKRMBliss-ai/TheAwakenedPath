// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

// ── Practice definitions ──────────────────────────────────────────────────────

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
    questionTitle: 'Finding the Silent Space',
    practiceName: 'The Silent Observation',
    practiceDesc: 'Pause for 1 minute. Notice the stillness behind the movement.',
    duration: '1 min',
    color: '#FF6F61',
    steps: [
      'Find a quiet moment. Sit or stand comfortably.',
      'Notice the sounds, thoughts, and sensations present.',
      'Now, notice the space in which they all occur.',
      'Rest in that space, even for just a few seconds.',
    ],
  },
  {
    id: 'question5',
    questionNum: 5,
    questionTitle: 'Which Mind to Listen To',
    practiceName: 'The Clarity Sit',
    practiceDesc: 'Sit for 3 minutes. Don\'t silence the mind — just stay settled beneath it.',
    duration: '3 min',
    color: '#2E9E7A',
    steps: [
      'Sit comfortably. Take two slow breaths.',
      'The mind will talk. Let it. You are not trying to stop it.',
      'When you\'re pulled into a thought — gently notice, and return to stillness.',
      'In this clarity, you\'ll naturally know which thoughts are useful.',
    ],
  },
  {
    id: 'question6',
    questionNum: 6,
    questionTitle: 'The Witnessing Consciousness',
    practiceName: 'The Seat of the Witness',
    practiceDesc: 'Realize you are the one witnessing both the inner and outer world.',
    duration: '2 min',
    color: '#EC4899',
    steps: [
      'Pause and notice your surroundings — colors, shapes, light.',
      'Notice the thoughts and feelings moving within you.',
      'Now, realize you are the one witnessing both the inner and outer world.',
      'Rest in the seat of the witness, distinct from what is witnessed.',
    ],
  },
  {
    id: 'question7',
    questionNum: 7,
    questionTitle: 'Removing the Thorns',
    practiceName: 'Letting the Thorns Be',
    practiceDesc: 'When a "thorn" of irritation appears, simply relax and let it pass.',
    duration: '1 min',
    color: '#F59E0B',
    steps: [
      'Notice a small irritation, judgment, or "thorn" in your mind today.',
      'Instead of trying to "fix" or "remove" it, simply relax and let it be there.',
      'Notice how resisting the thorn causes more pain than the thorn itself.',
      'Relax your shoulders, breathe, and let the energy pass through you.',
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
  const [anySituationalDone, setAnySituationalDone] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'dailyPractices', todayStr());
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const qRecord = data?.[questionId];
        setCompleted(qRecord?.completed ?? false);
        setTriggers(qRecord?.triggersCompleted ?? 0);
        setAnySituationalDone(data?.anySituationalDone === true);
      } else {
        setCompleted(false);
        setTriggers(0);
        setAnySituationalDone(false);
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

  return { completed, triggers, anySituationalDone, markDone, markTrigger };
}

// ── Single practice card ──────────────────────────────────────────────────────

function WisdomCard({ 
    practice, 
    userId, 
    onStart,
    autoExpand = false
}: { 
    practice: typeof WISDOM_PRACTICES[0]; 
    userId: string | undefined; 
    onStart?: () => void;
    autoExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState(autoExpand);
  const [stepIndex, setStepIndex] = useState(-1); // -1 = not started
  const { completed, triggers, anySituationalDone, markDone, markTrigger } = usePracticeRecord(userId, practice.id);

  const isQ3 = practice.triggerCount !== undefined;
  const isLocked = !!practice.locked;
  const color = practice.color;

  // Final check: is this task actually done?
  const isDone = completed || anySituationalDone;

  const handleStart = () => {
    if (isLocked || completed) return;
    onStart?.();
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
      style={{
        '--card-glow-surge': `${color}40`,
        '--card-glow-base': completed ? 'transparent' : `${color}10`,
        '--card-glow-pulse': completed ? 'transparent' : `${color}20`,
        borderColor: completed ? 'var(--border-subtle)' : expanded ? color + '60' : 'var(--border-subtle)',
        background: completed ? 'var(--bg-surface)' : expanded ? color + '0a' : 'var(--bg-surface)',
        opacity: isLocked ? 0.4 : 1,
      } as React.CSSProperties}
      className={`relative group rounded-[28px] border transition-all duration-500 overflow-hidden ${!isDone ? 'card-glow' : ''}`}
    >
      <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
        <span className="text-[100px] font-serif select-none">{practice.questionNum}</span>
      </div>

      <button
        disabled={isLocked}
        onClick={() => {
          if (!isLocked) {
            setExpanded(e => !e);
            if (!expanded) onStart?.();
          }
        }}
        className="w-full text-left p-4 space-y-3"
        style={{ cursor: isLocked ? 'default' : 'pointer' }}
      >
        <div className="flex justify-between items-start">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-serif transition-all duration-500"
            style={{
              background: isDone ? color + '20' : 'var(--bg-secondary)',
              border: `1px solid ${isDone ? color + '40' : 'var(--border-subtle)'}`,
              color: isDone ? color : 'var(--text-muted)',
              boxShadow: isDone ? `0 0 20px ${color}30` : 'none'
            }}
          >
            {isDone ? <CheckCircle2 size={16} style={{ color }} /> : practice.questionNum}
          </div>
          
          <div className="flex flex-col items-end gap-1">
             {isDone ? (
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full"
                style={{ background: color + '15', color }}>
                ✓ Complete
              </motion.span>
            ) : (
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)]">
                {practice.duration}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-0">
          <p className="text-[9px] font-black uppercase tracking-[0.25em]"
            style={{ color: isLocked ? 'var(--text-muted)' : color }}>
            {isLocked ? 'Locked' : `Question ${practice.questionNum}`}
          </p>
          <h4 className="text-[15px] font-serif font-light text-[var(--text-primary)] leading-tight">
            {practice.questionTitle}
          </h4>
        </div>

        <div className="pt-1">
          <p className="text-[13px] font-serif italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            "{practice.practiceName}"
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed opacity-80">
            {practice.practiceDesc}
          </p>
        </div>

        {!isLocked && !isDone && (
          <div className="pt-3 flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: color + '20' }} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity" style={{ color }}>
              {expanded ? 'Close' : 'Start Practice'}
            </span>
            <ChevronRight
              size={10}
              className="transition-transform duration-500"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', color: color + '80' }}
            />
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && !isLocked && !isDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[var(--bg-secondary)]/30 border-t border-[var(--border-subtle)]"
          >
            <div className="p-5 space-y-4">
              {isQ3 ? (
                <div className="space-y-3">
                  {practice.triggers!.map((label, i) => {
                    const done = i < triggers;
                    return (
                      <button
                        key={i}
                        disabled={done}
                        onClick={() => markTrigger(practice.triggerCount!)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300"
                        style={{
                          borderColor: done ? color + '40' : 'var(--border-default)',
                          background: done ? color + '08' : 'var(--bg-surface)',
                          cursor: done ? 'default' : 'pointer',
                        }}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[12px] font-black"
                          style={{
                            background: done ? color + '20' : 'var(--bg-secondary)',
                            color: done ? color : 'var(--text-muted)',
                            border: `1.5px solid ${done ? color + '60' : 'var(--border-subtle)'}`,
                          }}>
                          {done ? <CheckCircle2 size={14} /> : i + 1}
                        </div>
                        <span className={`text-[14px] font-serif flex-1 ${done ? 'line-through opacity-40' : ''}`}
                          style={{ color: 'var(--text-primary)' }}>
                          {label}
                        </span>
                        {!done && (
                          <div className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[9px] font-black uppercase tracking-wider" style={{ color }}>
                            Mark
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-5">
                  {stepIndex >= 0 && (
                    <div className="px-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                         <span>Progress</span>
                         <span>Step {stepIndex + 1} of {practice.steps!.length}</span>
                      </div>
                      <div className="flex gap-1.5 h-1">
                        {practice.steps!.map((_, i) => (
                          <div key={i} className="flex-1 rounded-full transition-all duration-700"
                            style={{
                              background: i <= stepIndex ? color : 'var(--border-subtle)',
                              opacity: i < stepIndex ? 0.3 : 1,
                              boxShadow: i === stepIndex ? `0 0 10px ${color}40` : 'none'
                            }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {stepIndex === -1 ? (
                    <div className="space-y-4">
                      {practice.steps!.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <span className="text-[12px] font-black mt-0.5" style={{ color }}>{i + 1}</span>
                          <p className="text-[14px] font-serif text-[var(--text-secondary)] leading-relaxed">{step}</p>
                        </div>
                      ))}
                      <button
                        onClick={handleStart}
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] mt-2 transition-all active:scale-[0.98] shadow-lg"
                        style={{ background: color, color: 'white', border: 'none', cursor: 'pointer' }}>
                        Begin Daily Practice
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <motion.div 
                        key={stepIndex}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm"
                      >
                        <p className="text-[17px] font-serif text-[var(--text-primary)] leading-relaxed italic">
                          "{practice.steps![stepIndex]}"
                        </p>
                      </motion.div>
                      <button
                        onClick={handleNextStep}
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg"
                        style={{ background: color, color: 'white', border: 'none', cursor: 'pointer' }}>
                        {stepIndex < practice.steps!.length - 1
                          ? <><ArrowRight size={14} /> Next Step</>
                          : <><CheckCircle2 size={14} /> Complete Practice</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isDone && expanded && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 px-6 text-center bg-[var(--bg-secondary)]/30 border-t border-[var(--border-subtle)]"
        >
          <div className="flex items-center justify-center gap-2">
             <CheckCircle2 size={14} className="text-emerald-500" />
             <span className="text-[13px] font-serif italic text-[var(--text-secondary)]">
               {anySituationalDone ? 'Daily practice complete.' : 'Technique complete for today.'}
             </span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] mt-1 opacity-30">Rest in awareness until tomorrow</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main section export ───────────────────────────────────────────────────────

export function WisdomPracticeSection({ 
    userId, 
    onStart,
    activeQuestionId
}: { 
    userId: string | undefined;
    onStart?: (id: string) => void;
    activeQuestionId?: string;
}) {
  return (
    <section className="space-y-12">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
           <div className="absolute inset-0 bg-[#B8973A]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="16" stroke="#B8973A" strokeWidth="1.5" fill="#B8973A" fillOpacity="0.08" />
              <circle cx="28" cy="28" r="5" fill="#B8973A" fillOpacity="0.7" />
              <circle cx="28" cy="28" r="24" stroke="#B8973A" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-[32px] font-serif font-medium text-[var(--text-primary)] tracking-tight">
            Wisdom Untethered Practice Gateway
          </h2>
          <p className="text-[17px] text-[var(--text-primary)] font-serif italic max-w-xl mx-auto leading-relaxed">
            Small, consistent steps build the path to untethered freedom. 
            Choose a technique to ground your presence today.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pb-20">
        {WISDOM_PRACTICES.map((p) => (
          <WisdomCard 
            key={p.id} 
            practice={p} 
            userId={userId}
            onStart={() => onStart?.(p.id)}
            autoExpand={p.id === activeQuestionId}
          />
        ))}
      </div>
    </section>
  );
}
