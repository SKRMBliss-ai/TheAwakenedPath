import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Lock } from 'lucide-react';
import { JournalDashboard } from './JournalDashboard';
import { useAuth } from '../../auth/AuthContext';
import { useWeeklyAssignment } from '../../../hooks/useWeeklyAssignment';
import { MeditationPortal } from '../../../components/ui/MeditationPortal.tsx';
import { db } from '../../../firebase';
import { VoiceService } from '../../../services/voiceService';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { AwakenStage } from '../../../components/ui/SacredCircle.tsx';
import { useAchievements } from '../../achievements/useAchievements';
import {
    AnchorButton,
    NoiseOverlay,
    SacredToast,
} from '../../../components/ui/SacredUI.tsx';
import { useEmotionSync } from '../../presence-intelligence/hooks/useEmotionSync';
import { useDailyPractice } from '../../practices/useDailyPractice';
import { GentleJournalForm } from './GentleJournalForm';



// ─── CINEMATIC ANIMATION VARIANTS ─────────────────────────────────────────────

const pageVariants: any = {
    hidden: { opacity: 0, y: 16, filter: 'blur(12px)' },
    visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }
    },
    exit: {
        opacity: 0, y: -16, filter: 'blur(12px)',
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
};

const orbExitVariant: any = {
    exit: {
        scale: 3.5, opacity: 0, filter: 'blur(60px)',
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
};


// ─── TYPES ───────────────────────────────────────────────────────────────────

interface JournalEntry {
    id: string;
    date: string;
    time: string;
    duration: string;
    thoughts: string;
    bodySensations: string;
    bodyArea: string;
    emotions: string;
    reflections: string;
    guidance: string;
    dayNumber?: number;
    createdAt?: any;
}

interface JournalProps {
    isAccessValid: boolean;
    onUpgrade?: () => void;
}

const Journal: React.FC<JournalProps> = ({ isAccessValid, onUpgrade }) => {
    const { user, signInWithGoogle } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    // editingId no longer needed — JournalPage manages its own state
    const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
        thoughts: '',
        bodySensations: '',
        bodyArea: '',
        emotions: '',
        reflections: '',
        guidance: '',
        duration: ''
    });



    useEmotionSync(currentEntry.emotions || '');

    // Workflow State
    const [isPracticing, setIsPracticing] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const { awardEvent, checkAndUnlock } = useAchievements();
    const [isLoadingScript, setIsLoadingScript] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);
    const [practiceStep, setPracticeStep] = useState(0);
    const [journeyTitle, setJourneyTitle] = useState("Daily Presence");
    const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
    const lastSpokenRef = useRef<string | null>(null);

    const assignment = useWeeklyAssignment(user?.metadata?.creationTime);
    const [reflectQId, setReflectQId] = useState<string | null>(null);

    // Determine the question ID to credit this reflection to
    const effectiveQId = useMemo(() => {
        return reflectQId || assignment?.questionId || 'question1';
    }, [reflectQId, assignment?.questionId]);

    const { markReflect } = useDailyPractice(user?.uid, effectiveQId);

    const playBell = useCallback(() => {
        VoiceService.playAudioURL('/mp3/tibetanbell.mp3');
    }, []);

    // Magnetic orb tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [6, -6]), { stiffness: 30, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-6, 6]), { stiffness: 30, damping: 20 });

    const fireToast = (msg: string) => {
        setToastMessage(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2800);
    };

    // Reset journal form state
    const resetJournalForm = () => {
        setCurrentEntry({
            thoughts: '',
            bodySensations: '',
            bodyArea: '',
            emotions: '',
            reflections: '',
            guidance: '',
            duration: ''
        });
        // editingId is managed by JournalPage now
    };

    const prevIsPracticing = useRef(false);
    useEffect(() => {
        if (isPracticing && !prevIsPracticing.current) {
            playBell();
        }
        prevIsPracticing.current = isPracticing;
    }, [isPracticing, playBell]);

    // Audio Logic
    const speak = useCallback((text: string, onEnd?: () => void, isAudioUrl: boolean = false) => {
        if (isPaused) return;
        if (isAudioUrl) {
            VoiceService.playAudioURL(text, onEnd);
        } else {
            VoiceService.speak(text, {
                voice: 'Enceladus',
                onEnd: () => {
                    if (onEnd) setTimeout(onEnd, 1500);
                }
            });
        }
    }, [isPaused]);

    useEffect(() => {
        const prompt = localStorage.getItem('awakened-journal-prompt');
        const qid = localStorage.getItem('awakened-reflect-question-id');

        if (prompt) {
            setInitialPrompt(prompt);
            setShowLogForm(true);
            localStorage.removeItem('awakened-journal-prompt');
        }
        if (qid) {
            setReflectQId(qid);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'users', user.uid, 'journal'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
            setEntries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[]);
        });
    }, [user]);

    const fetchDailyScript = async () => {
        const today = new Date().getDay();
        const audioMap: Record<number, string> = {
            1: '/mp3/JournalDay1.mp3',
            2: '/mp3/JournalDay2.mp3',
            3: '/mp3/JournalDay3.mp3',
            4: '/mp3/JournalDay4.mp3',
            5: '/mp3/JournalDay5.mp3',
            6: '/mp3/JournalDay6.mp3',
            0: '/mp3/JournalDay7.mp3'
        };

        const localAudio = audioMap[today];
        if (localAudio) {
            setDynamicSteps([{
                title: "Guided Meditation",
                instructions: ["Close your eyes and follow the guidance.", "Stay present in the body."],
                audioScript: localAudio,
                isFullAudio: true
            }]);
            setJourneyTitle("Somatic Presence");
            setIsPracticing(true);
            return;
        }

        setIsLoadingScript(true);
        try {
            const API_URL = 'https://getdailymeditation-us-central1-awakened-path-2026.cloudfunctions.net/getDailyMeditation';
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dayNumber: entries.length + 1 })
            });

            if (!response.ok) throw new Error(`Backend Error: ${response.status}`);
            const data = await response.json();
            setDynamicSteps(data.steps);
            setJourneyTitle(data.title);
            setIsPracticing(true);
        } catch (error) {
            setDynamicSteps([{
                title: "Stillness",
                instructions: ["Sit quietly.", "Focus on your breath."],
                audioScript: "Return to the silence of the Now."
            }]);
            setIsPracticing(true);
        } finally {
            setIsLoadingScript(false);
        }
    };

    const handleCompleteMeditation = useCallback(async () => {
        playBell();
        setIsTransitioning(true);
        await new Promise(r => setTimeout(r, 800));
        setIsPracticing(false);
        setIsTransitioning(false);
        setShowLogForm(true);
        setPracticeStep(0);
    }, [playBell]);

    const handleNextStep = useCallback(() => {
        if (practiceStep < dynamicSteps.length - 1) {
            setPracticeStep(prev => prev + 1);
        } else {
            handleCompleteMeditation();
        }
    }, [practiceStep, dynamicSteps.length, handleCompleteMeditation]);

    useEffect(() => {
        if (isPracticing && dynamicSteps.length > 0) {
            const step = dynamicSteps[practiceStep];
            if (lastSpokenRef.current !== step.audioScript) {
                speak(step.audioScript, handleNextStep, step.isFullAudio);
                lastSpokenRef.current = step.audioScript;
                
                // If we're starting a new step but are already paused, pause it immediately
                if (isPaused) {
                    VoiceService.pause();
                }
            }
        } else if (!isPracticing && lastSpokenRef.current !== null) {
            VoiceService.stop();
            lastSpokenRef.current = null;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [practiceStep, isPracticing, speak, handleNextStep, dynamicSteps]);

    // Sync play/pause state without restarting audio
    useEffect(() => {
        if (!isPracticing) return;
        if (isPaused) {
            VoiceService.pause();
        } else {
            VoiceService.resume();
        }
    }, [isPaused, isPracticing]);

    const wasPlayingWhenHiddenRef = useRef(false);

    // Handle tab switching / backgrounding
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                wasPlayingWhenHiddenRef.current = !isPaused;
                setIsPaused(true);
                VoiceService.pause();
            } else {
                // Only resume if it was actively playing before switching tabs
                if (isPracticing && wasPlayingWhenHiddenRef.current) {
                    setIsPaused(false);
                    VoiceService.resume();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isPracticing, isPaused]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3"
                    style={{ color: 'var(--text-muted)' }}>
                    The Awakened Path
                </p>
                <h1 className="text-3xl font-serif font-light mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    Sign in to continue
                </h1>
                <p className="text-sm italic mb-8 max-w-xs"
                    style={{ color: 'var(--text-muted)' }}>
                    Your journal entries are private and encrypted.
                </p>
                <AnchorButton variant="solid" onClick={signInWithGoogle}>
                    Sign In
                </AnchorButton>
            </div>
        );
    }

    // Freemium Lock
    if (!isAccessValid && entries.length >= 2) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] max-w-2xl mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-24 h-24 rounded-full bg-[var(--bg-surface)] border border-[var(--accent-primary)]/30 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(var(--accent-primary-rgb),0.1)]"
                >
                    <Lock className="w-10 h-10 text-[var(--accent-primary)]" />
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-serif font-light mb-5" 
                    style={{ color: 'var(--text-primary)' }}
                >
                    Deepen Your Witnessing
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-serif italic mb-12 leading-relaxed opacity-80" 
                    style={{ color: 'var(--text-secondary)' }}
                >
                    You've successfully integrated your first two reflections into the path. 
                    Unlock full access to continue recording your journey and witness your growth over time.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <AnchorButton variant="solid" onClick={onUpgrade} className="px-14 py-4.5 text-xl tracking-[0.05em]">
                        CONTINUE THE JOURNEY
                    </AnchorButton>
                </motion.div>
            </div>
        );
    }

    if (isPracticing && dynamicSteps.length > 0) {
        return (
            <AnimatePresence mode="wait">
                {isTransitioning ? (
                    <motion.div
                        key="orb-exit"
                        variants={orbExitVariant}
                        exit="exit"
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-deep)]"
                        onMouseMove={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            mouseX.set(e.clientX - rect.left - rect.width / 2);
                            mouseY.set(e.clientY - rect.top - rect.height / 2);
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'absolute', inset: -160, borderRadius: '50%', background: 'var(--accent-primary)', filter: 'blur(160px)', opacity: 0.15 }}
                        />
                        <motion.div>
                            <AwakenStage
                                isAnimating
                                size="xl"
                                mouseX={rotateX}
                                mouseY={rotateY}
                            />
                        </motion.div>
                    </motion.div>
                ) : (
                    <MeditationPortal
                        key="portal"
                        title={journeyTitle.toUpperCase()}
                        currentStepTitle={dynamicSteps[practiceStep].title}
                        currentStepInstruction={dynamicSteps[practiceStep].instructions.join('. ')}
                        onNext={handleNextStep}
                        onReset={() => { setPracticeStep(0); VoiceService.stop(); }}
                        onClose={() => {
                            setIsPracticing(false);
                            VoiceService.stop();
                            lastSpokenRef.current = null;
                        }}
                        onTogglePlay={() => setIsPaused(!isPaused)}
                        isPlaying={!isPaused}
                        progress={(practiceStep + 1) / dynamicSteps.length}
                        totalSteps={dynamicSteps.length}
                        currentStepIndex={practiceStep}
                    />
                )}
            </AnimatePresence>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-6 pt-4 pb-12 relative">
            <NoiseOverlay />

            {/* Content fully unlocked for everyone */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {!showLogForm ? (
                        <motion.div key="dashboard" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                            <JournalDashboard
                                entries={entries}
                                isLoadingScript={isLoadingScript}
                                onBegin={fetchDailyScript}
                                onSkipToWrite={() => { resetJournalForm(); setShowLogForm(true); }}
                            />
                        </motion.div>
                    ) : (
                        /* ═══════════════════════════════════════════════════════════════
                           AWAKENED PATH 3-STEP JOURNAL FLOW
                        ═══════════════════════════════════════════════════════════════ */
                        <motion.div key="form" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto w-full">
                            <GentleJournalForm
                                initialData={initialPrompt ? { reflections: initialPrompt } : undefined}
                                onSave={async (entryData) => {
                                    if (!user) return;
                                    try {
                                        const finalData = {
                                            ...entryData,
                                            date: new Date().toLocaleDateString(),
                                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            duration: '2 mins',
                                            createdAt: serverTimestamp(),
                                            updatedAt: serverTimestamp(),
                                        };
                                        await addDoc(collection(db, 'users', user.uid, 'journal'), finalData);

                                        // If this reflection is tied to a specific dashboard step, mark it as done
                                        if (effectiveQId) {
                                            console.log('[Journal] Marking reflection done for:', effectiveQId);
                                            await markReflect();
                                            // Clear the local override after successful save
                                            setReflectQId(null);
                                            localStorage.removeItem('awakened-reflect-question-id');
                                        }

                                        // Award achievement points
                                        await awardEvent('journal_entry');
                                        checkAndUnlock({
                                            journalEntries: entries.length + 1,
                                            situationalPractices: 0,
                                            journeyActivities: 0,
                                            videosWatched: 0, // Placeholder
                                            chaptersComplete: 0,
                                            currentStreak: 0,
                                            maxStreak: 0,
                                            panicUsed: 0,
                                            bodyTruthTests: 0,
                                            voiceWitnessed: 0,
                                            remindersEnabled: false,
                                            statsViewed: 0,
                                        });

                                        fireToast('Reflection Sealed ✦');
                                        setShowLogForm(false);
                                    } catch (err) {
                                        console.error('Save error:', err);
                                        fireToast('Error preserving moment');
                                    }
                                }}
                                onCancel={() => {
                                    setShowLogForm(false);
                                    setReflectQId(null);
                                    localStorage.removeItem('awakened-reflect-question-id');
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SacredToast visible={toastVisible} message={toastMessage} />
        </div>
    );
};

export default Journal;
