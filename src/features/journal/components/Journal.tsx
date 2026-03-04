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
import { useEmotionSync } from '../../soul-intelligence/hooks/useEmotionSync';
import JournalCalendar from './JournalCalendar';
import { GentleJournalForm } from './GentleJournalForm';



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
        transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] }
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
    const { awardEvent, checkAndUnlock } = useAchievements();
    const [isLoadingScript, setIsLoadingScript] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);
    const [practiceStep, setPracticeStep] = useState(0);
    const [journeyTitle, setJourneyTitle] = useState("Daily Presence");
    const lastSpokenRef = useRef<string | null>(null);

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

    // Audio Logic
    const speak = useCallback((text: string, onEnd?: () => void, isAudioUrl: boolean = false) => {
        if (isPaused) return;
        if (isAudioUrl) {
            VoiceService.playAudioURL(text, onEnd);
        } else {
            VoiceService.speak(text, {
                onEnd: () => {
                    if (onEnd) setTimeout(onEnd, 1500);
                }
            });
        }
    }, [isPaused]);

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
        setIsTransitioning(true);
        await new Promise(r => setTimeout(r, 1400));
        setIsPracticing(false);
        setIsTransitioning(false);
        setShowLogForm(true);
        setPracticeStep(0);
    }, []);

    const handleNextStep = useCallback(() => {
        if (practiceStep < dynamicSteps.length - 1) {
            setPracticeStep(prev => prev + 1);
        } else {
            handleCompleteMeditation();
        }
    }, [practiceStep, dynamicSteps.length, handleCompleteMeditation]);

    useEffect(() => {
        if (isPracticing && !isPaused && dynamicSteps.length > 0) {
            const step = dynamicSteps[practiceStep];
            if (lastSpokenRef.current !== step.audioScript) {
                speak(step.audioScript, handleNextStep, step.isFullAudio);
                lastSpokenRef.current = step.audioScript;
            }
        } else {
            VoiceService.stop();
            lastSpokenRef.current = null;
        }
    }, [practiceStep, isPracticing, speak, handleNextStep, isPaused, dynamicSteps]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-12 text-center h-[80vh] relative">
                <NoiseOverlay />
                <motion.div
                    animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none"
                    style={{ background: `radial-gradient(circle, var(--accent-primary-muted), transparent)` }}
                />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center gap-8">
                    <p className="text-[9px] uppercase tracking-[0.6em] text-[var(--text-muted)] font-bold">The Awakened Path</p>
                    <h1 className="text-6xl font-serif font-light text-[var(--text-primary)] leading-tight">Sacred Access</h1>
                    <p className="text-sm text-[var(--text-muted)] italic max-w-xs font-serif leading-relaxed">Sign in to begin your journey inward.</p>
                    <AnchorButton variant="solid" onClick={signInWithGoogle}>Authenticate Presence</AnchorButton>
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
                        totalSteps={dynamicSteps.length}
                        currentStepIndex={practiceStep}
                        onNext={handleNextStep}
                        onReset={() => setIsPracticing(false)}
                        onTogglePlay={() => setIsPaused(!isPaused)}
                        onClose={() => setIsPracticing(false)}
                        isPlaying={!isPaused}
                        progress={(practiceStep + 1) / dynamicSteps.length}
                    />
                )}
            </AnimatePresence>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-6 pt-12 pb-40 relative">
            <NoiseOverlay />

            {/* Ambient continuous glow */}
            <motion.div
                animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.08, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                className="fixed top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none -z-10"
                style={{ background: `radial-gradient(ellipse, var(--accent-primary-muted), transparent)` }}
            />

            <nav className="flex justify-between items-start mb-10 relative z-10">
                <div className="min-w-[120px]" />
                <div className="text-center">
                    <h1 className="text-6xl font-serif font-light text-[var(--text-primary)] tracking-tight leading-none [text-shadow:0_0_60px_var(--accent-primary-muted)]">Daily Log</h1>
                    <p className="text-[11px] uppercase tracking-[0.6em] text-[var(--accent-secondary)] opacity-90 font-bold mt-4">The Presence Study</p>
                    <a
                        href="https://docs.google.com/document/d/1cABPEGjz-IRhFg5MOH_gZFTJm-lFn4wVN9IJbGC5de8/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-5 px-4 py-1.5 rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] opacity-90 hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary-border)] transition-all duration-300 text-[9px] uppercase tracking-[0.3em] font-bold"
                    >
                        <Download size={10} />
                        Download Journal
                    </a>
                </div>
                <div className="text-right min-w-[120px]">
                    <p className="text-[10px] uppercase tracking-[0.6em] text-[var(--text-secondary)] opacity-90 font-bold">{entries.length} moments</p>
                    <div className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary-border)] to-transparent" />
                </div>
            </nav>

            {/* Content fully unlocked for everyone */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {!showLogForm ? (
                        <motion.div key="dashboard" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                            {/* Compact Practice CTA Card */}
                            <motion.section variants={childVariant} className="relative">
                                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)]/50 rounded-[32px] p-6 shadow-sm flex items-center gap-6">
                                    {/* Breathing Dot / Icon */}
                                    <div className="w-16 h-16 rounded-full bg-[var(--accent-primary-muted)]/10 border border-[var(--border-subtle)]/20 flex items-center justify-center flex-shrink-0">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-4 h-4 rounded-full bg-[var(--accent-primary)] shadow-[0_0_15px_var(--accent-primary-muted)]"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-2xl font-serif font-light text-[var(--text-primary)] leading-tight">
                                            Settle into the Now
                                        </h2>
                                        <p className="text-sm text-[var(--text-secondary)] italic font-serif mt-1 opacity-90">
                                            2 min reconnection before logging.
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <AnchorButton variant="solid" onClick={fetchDailyScript} loading={isLoadingScript}>
                                            Begin
                                        </AnchorButton>
                                        <button
                                            onClick={() => { resetJournalForm(); setShowLogForm(true); }}
                                            className="text-[8px] uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-[var(--accent-primary)] font-bold transition-colors"
                                        >
                                            or skip to log →
                                        </button>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Calendar History */}
                            {entries.length > 0 && (
                                <motion.section variants={childVariant} className="space-y-6">
                                    <JournalCalendar entries={entries} />
                                </motion.section>
                            )}
                        </motion.div>
                    ) : (
                        /* ═══════════════════════════════════════════════════════════════
                           AWAKENED PATH 3-STEP JOURNAL FLOW
                        ═══════════════════════════════════════════════════════════════ */
                        <motion.div key="form" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto">
                            <GentleJournalForm
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
