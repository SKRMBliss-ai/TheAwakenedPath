import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Download } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
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
import JournalCalendar from './JournalCalendar';
import { GentleJournalForm } from './GentleJournalForm';
import { PracticeHistory } from './PracticeHistory';



// ─── CINEMATIC ANIMATION VARIANTS ─────────────────────────────────────────────

const pageVariants: any = {
    hidden: { opacity: 0, y: 16, filter: 'blur(12px)' },
    visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }
    },
    exit: {
        opacity: 0, y: -8, filter: 'blur(8px)',
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
};

const childVariant: any = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
    },
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

// ─── MAIN JOURNAL COMPONENT ──────────────────────────────────────────────────

const Journal: React.FC = () => {
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
    const [historyTab, setHistoryTab] = useState<'calendar' | 'timeline'>('calendar');
    const { awardEvent, checkAndUnlock } = useAchievements();
    const [isLoadingScript, setIsLoadingScript] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);
    const [practiceStep, setPracticeStep] = useState(0);
    const [journeyTitle, setJourneyTitle] = useState("Daily Presence");
    const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
    const lastSpokenRef = useRef<string | null>(null);

    const bellRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        bellRef.current = new Audio('/mp3/tibetanbell.mp3');
        bellRef.current.preload = 'auto';
    }, []);

    const playBell = useCallback(() => {
        if (bellRef.current) {
            bellRef.current.currentTime = 0;
            bellRef.current.play().catch(e => console.log('Bell play failed', e));
        }
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
        if (prompt) {
            setInitialPrompt(prompt);
            setShowLogForm(true);
            // We'll clear it after use or here
            localStorage.removeItem('awakened-journal-prompt');
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

            <nav className="flex items-center justify-between mb-12 relative z-10 w-full border-b border-[var(--border-subtle)]/30 pb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-light" 
                        style={{ color: 'var(--text-primary)' }}>
                        Daily Log
                    </h1>
                    <p className="text-[13px] font-serif italic mt-1" 
                        style={{ color: 'var(--text-secondary)' }}>
                        {entries.length} reflection{entries.length === 1 ? '' : 's'}
                    </p>
                </div>
                <a
                    href="/Journal/Journal.pdf"
                    download="Journal.pdf"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[var(--accent-primary-muted)] hover:text-[var(--text-primary)]"
                    style={{ 
                        background: 'var(--bg-surface)', 
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                    }}>
                    <Download size={11} /> Export
                </a>
            </nav>

            {/* Content fully unlocked for everyone */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {!showLogForm ? (
                        <motion.div key="dashboard" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                            {/* Compact Practice CTA Card */}
                            <motion.section variants={childVariant} className="relative">
                                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 w-full mx-auto shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-5">
                                        {/* Breathing dot */}
                                        <div className="w-12 h-12 rounded-full bg-[var(--accent-primary-muted)]/10 border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-3 h-3 rounded-full"
                                                style={{ background: 'var(--accent-primary)', boxShadow: '0 0 12px var(--accent-primary-muted)' }}
                                            />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-serif font-light tracking-wide" style={{ color: 'var(--text-primary)' }}>
                                                Settle into the Now
                                            </h2>
                                            <p className="text-[14px] font-serif italic mt-1.5 opacity-90" 
                                                style={{ color: 'var(--text-secondary)' }}>
                                                A brief reconnection before journaling
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-[var(--border-subtle)]">
                                        <AnchorButton variant="solid" onClick={fetchDailyScript} loading={isLoadingScript} className="w-full sm:w-auto justify-center">
                                            Begin
                                        </AnchorButton>
                                        <button onClick={() => { resetJournalForm(); setShowLogForm(true); }}
                                            className="text-[9px] uppercase tracking-[0.2em] font-bold transition-colors w-full sm:w-auto text-center sm:text-right hover:text-[var(--accent-primary)]"
                                            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            Skip to journal →
                                        </button>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Calendar / Timeline Toggle & View */}
                            <motion.section variants={childVariant} className="space-y-6 mt-8">
                                <div className="flex items-center justify-between mb-6 w-full mx-auto">
                                    <div className="flex bg-[var(--bg-surface)] rounded-xl p-0.5 border border-[var(--border-subtle)]">
                                        {(['calendar', 'timeline'] as const).map(tab => (
                                            <button key={tab} onClick={() => setHistoryTab(tab)}
                                                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                                    historyTab === tab 
                                                        ? 'bg-[var(--accent-primary)] text-white shadow-sm' 
                                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]'
                                                }`}>
                                                {tab === 'calendar' ? 'Calendar' : 'History'}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Entry count */}
                                    <span className="text-[10px] font-bold uppercase tracking-wider"
                                        style={{ color: 'var(--text-muted)' }}>
                                        {entries.length} journal entries
                                    </span>
                                </div>
                                
                                <div className="pt-2">
                                    {historyTab === 'calendar' ? (
                                        <JournalCalendar entries={entries} />
                                    ) : (
                                        <PracticeHistory />
                                    )}
                                </div>
                            </motion.section>
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
                                onCancel={() => setShowLogForm(false)}
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
