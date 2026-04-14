// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeSystem';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, BookOpen, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { VoiceService } from '../../services/voiceService';

import { db } from '../../firebase';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

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
    imageLight: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q1_light.png'),
    imageDark: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q1_dark.png'),
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
    imageLight: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q2_light.png'),
    imageDark: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q2_dark.png'),
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
    imageLight: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q3_light.png'),
    imageDark: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q3_dark.png'),
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
    imageLight: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q4_light.png'),
    imageDark: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q4_dark.png'),
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
    imageLight: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q5_light.png'),
    imageDark: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q5_dark.png'),
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
    imageLight: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q6_light.png'),
    imageDark: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q6_dark.png'),
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
    imageLight: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q7_light.png'),
    imageDark: VoiceService.getStorageUrl('PracticeRoom/WisdomUntethered/q7_dark.png'),
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
  const { mode } = useTheme();
  const [expanded, setExpanded] = useState(autoExpand);
  const [stepIndex, setStepIndex] = useState(-1);
  const { completed, triggers, anySituationalDone, markDone, markTrigger } = usePracticeRecord(userId, practice.id);

  const isQ3 = practice.triggerCount !== undefined;
  const isLocked = !!practice.locked;
  const color = practice.color;
  const isDone = completed || anySituationalDone;

  const handleStart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isLocked || completed) return;
    onStart?.();
    setStepIndex(0);
    setExpanded(true);
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const steps = practice.steps || [];
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      await markDone();
      setStepIndex(-1);
      // We keep it flipped for a moment then maybe allow close or just stay
    }
  };

  const image = mode === 'dark' ? practice.imageDark : practice.imageLight;

  return (
    <div className="[perspective:1500px] w-full h-[400px] min-h-[400px] group/card">
      <motion.div
        animate={{ rotateY: expanded ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 90, damping: 22 }}
        className="relative w-full h-full min-h-[400px] [transform-style:preserve-3d]"
      >
        {/* FRONT FACE */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] rounded-[32px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] card-glow cursor-pointer z-10 w-full h-full min-h-[400px]"
          style={{ '--card-glow-surge': `${color}40`, '--card-glow-base': `${color}10` } as React.CSSProperties}
          onClick={() => !isLocked && setExpanded(true)}
        >
          {/* Practice Image Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src={image} 
              alt="" 
              className="w-full h-full object-cover opacity-60 group-hover/card:scale-110 transition-transform duration-1000" 
            />
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, var(--bg-surface) 15%, transparent 70%)` }}
            />
          </div>

          <div className="relative z-10 h-full">
            {/* Technical Header - Number and Time at Top */}
            <div className="absolute top-6 left-6 z-20">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border-2 border-white/10 bg-[var(--bg-surface)] shadow-lg" style={{ color }}>
                {practice.questionNum}
              </div>
            </div>

            {/* High-Contrast Duration Badge - Parallel to Title */}
            <div className="absolute top-6 right-6 z-20">
              <div className="px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-white/10 text-[11px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.3)]" style={{ color }}>
                {practice.duration}
              </div>
            </div>

            {/* Title - Positioned below the badges to avoid any overlap */}
            <div className="absolute top-[80px] left-0 right-0 px-8 text-center z-10">
              <h4 className="text-[22px] font-serif font-light text-[var(--text-primary)] leading-tight drop-shadow-sm">
                {practice.questionTitle}
              </h4>
            </div>

            {/* Bottom Right Start Gateway */}
            <div className="absolute bottom-6 right-8">
              <div 
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] group/btn"
                style={{ color }}
              >
                Start Practice 
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronRight size={14} />
                </motion.div>
              </div>
            </div>
          </div>

          {isDone && (
            <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[1px] flex items-center justify-center z-20">
              <div className="bg-[var(--bg-surface)]/90 backdrop-blur-xl p-5 rounded-full shadow-2xl border border-emerald-500/20">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
            </div>
          )}
        </div>

        {/* BACK FACE */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[32px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col shadow-2xl z-0 w-full h-full min-h-[400px]"
          style={{ borderColor: expanded ? color + '40' : 'transparent' }}
        >
          {/* Subtle image ref in background */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <img src={image} alt="" className="w-full h-full object-cover blur-[4px]" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header - Clickable to flip back */}
            <div 
              onClick={() => setExpanded(false)}
              className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]/20 cursor-pointer hover:bg-[var(--bg-secondary)]/40 transition-colors group/header"
            >
              <div className="flex items-center gap-3">
                 <div className="p-2 -ml-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm group-hover/header:border-current transition-colors" style={{ color: expanded ? color : 'inherit' }}>
                   <motion.div animate={{ x: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <ArrowLeft size={16} />
                   </motion.div>
                 </div>
                 <div>
                   <h5 className="text-[14px] font-serif italic text-[var(--text-primary)] leading-none">
                     {practice.practiceName}
                   </h5>
                   <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-40 group-hover/header:opacity-70 transition-opacity">Return to Card</p>
                 </div>
              </div>
              {isDone && <CheckCircle2 size={16} className="text-emerald-500 shadow-glow" />}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-7 space-y-6 custom-scrollbar">
              {isQ3 ? (
                <div className="space-y-3.5">
                  {practice.triggers!.map((label, i) => {
                    const done = i < triggers;
                    return (
                      <button
                        key={i}
                        disabled={done}
                        onClick={(e) => { e.stopPropagation(); markTrigger(practice.triggerCount!); }}
                        className="w-full flex items-center gap-4 p-4.5 rounded-2xl border text-left transition-all duration-300"
                        style={{
                          borderColor: done ? color + '40' : 'var(--border-default)',
                          background: done ? color + '08' : 'var(--bg-surface)',
                          cursor: done ? 'default' : 'pointer',
                        }}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                          style={{
                            background: done ? color + '20' : 'var(--bg-secondary)',
                            color: done ? color : 'var(--text-muted)',
                            border: `1px solid ${done ? color + '40' : 'var(--border-subtle)'}`,
                          }}>
                          {done ? <CheckCircle2 size={14} /> : i + 1}
                        </div>
                        <span className={`text-[14px] font-serif flex-1 ${done ? 'line-through opacity-40' : ''}`}
                          style={{ color: 'var(--text-primary)' }}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  {stepIndex === -1 ? (
                    <div className="space-y-4 pb-4">
                      {practice.steps!.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)]/30 border border-[var(--border-subtle)]">
                          <span className="text-[11px] font-black mt-0.5" style={{ color }}>{i + 1}</span>
                          <p className="text-[14px] font-serif text-[var(--text-secondary)] leading-relaxed">{step}</p>
                        </div>
                      ))}
                      {!isDone && (
                        <button
                          onClick={handleStart}
                          className="w-full py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] shadow-lg bg-surface border border-[var(--border-subtle)] hover:border-current mt-4"
                          style={{ color }}>
                          Begin Practice
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-60">
                         <span>Guidance {stepIndex + 1} / {practice.steps!.length}</span>
                      </div>
                      <motion.div 
                        key={stepIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm min-h-[140px] flex items-center justify-center text-center relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--bg-secondary)]">
                          <motion.div 
                            className="h-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${((stepIndex + 1) / practice.steps!.length) * 100}%` }}
                          />
                        </div>
                        <p className="text-[17px] font-serif text-[var(--text-primary)] leading-relaxed italic">
                          "{practice.steps![stepIndex]}"
                        </p>
                      </motion.div>
                      <button
                        onClick={handleNextStep}
                        className="w-full py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl"
                        style={{ background: color, color: 'white' }}>
                        {stepIndex < practice.steps!.length - 1
                          ? <><ArrowRight size={14} /> Next Integration</>
                          : <><CheckCircle2 size={14} /> Complete Journey</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isDone && (
              <div className="p-5 text-center bg-emerald-500/5 border-t border-[var(--border-subtle)]">
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 flex items-center justify-center gap-2">
                   Journey Integrated
                 </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>

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

      <ErrorBoundary featureName="Wisdom Practice Grid">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pb-20">
          {WISDOM_PRACTICES.map((p) => (
            <WisdomCard 
              key={p.id} 
              practice={p} 
              userId={userId}
              onStart={() => onStart?.(p.id)}
              autoExpand={false}
            />
          ))}
        </div>
      </ErrorBoundary>
    </section>
  );
}
