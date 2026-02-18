import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    PenTool,
    Save,
    Sparkles,
    LogIn,
    Edit2
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MeditationPortal } from '../../../components/ui/MeditationPortal.tsx';
import { db } from '../../../firebase';
import { VoiceService } from '../../../services/voiceService';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';

interface JournalEntry {
    id: string;
    date: string;
    time: string;
    duration: string;
    bodySensations: string;
    emotions: string;
    reflections: string;
    dayNumber?: number;
    createdAt?: any;
}

const Journal: React.FC = () => {
    const { user, signInWithGoogle } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showOlderLogs, setShowOlderLogs] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
        bodySensations: '',
        emotions: '',
        reflections: '',
        duration: ''
    });

    // Practice State
    const [practiceStep, setPracticeStep] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);

    const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);
    const [isLoadingScript, setIsLoadingScript] = useState(false);
    const [journeyTitle, setJourneyTitle] = useState("Daily Presence");
    const lastSpokenRef = useRef<string | null>(null);

    // Audio Logic
    const speak = useCallback((text: string, onEnd?: () => void, isAudioUrl: boolean = false) => {
        if (isPaused) return;
        if (isAudioUrl) {
            console.log("Journal: Playing local meditation audio:", text);
            VoiceService.playAudioURL(text, onEnd);
        } else {
            VoiceService.speak(text, {
                onEnd: () => {
                    if (onEnd) setTimeout(onEnd, 1500);
                }
            });
        }
    }, [isPaused]);

    const handleReset = useCallback(() => {
        VoiceService.stop();
        setPracticeStep(0);
    }, []);

    const fetchDailyScript = async () => {
        const today = new Date().getDay(); // 0-6
        // Map day to MP3 (1=Mon, ..., 0=Sun)
        const audioMap: Record<number, string> = {
            1: '/mp3/JournalDay1.mp3',
            2: '/mp3/JournalDay2.mp3',
            3: '/mp3/JournalDay3.mp3', // Today is Wednesday (3)
            4: '/mp3/JournalDay4.mp3',
            5: '/mp3/JournalDay5.mp3',
            6: '/mp3/JournalDay6.mp3',
            0: '/mp3/JournalDay7.mp3'
        };

        const localAudio = audioMap[today];

        if (localAudio) {
            console.log("Journal: Local match found for day", today, "Path:", localAudio);
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
        console.log("Journal: Requesting Master AI Script for Day", entries.length + 1);
        try {
            // Direct Trigger URL to bypass Hosting/Rewrite layer
            const API_URL = 'https://getdailymeditation-us-central1-awakened-path-2026.cloudfunctions.net/getDailyMeditation';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dayNumber: entries.length + 1 })
            });

            if (!response.ok) throw new Error(`Backend Error: ${response.status}`);

            const data = await response.json();
            console.log("Master AI Success:", data);

            setDynamicSteps(data.steps);
            setJourneyTitle(data.title);
            setIsPracticing(true);
        } catch (error) {
            console.error("Master AI Failed (Fallback Mode):", error);
            // Fallback to simple steps if AI fails
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

    const handleNextStep = useCallback(() => {
        if (practiceStep < dynamicSteps.length - 1) {
            setPracticeStep(prev => prev + 1);
        } else {
            handleCompleteMeditation();
        }
    }, [practiceStep, dynamicSteps.length]);

    const handleCompleteMeditation = useCallback(() => {
        setIsPracticing(false);
        setShowLogForm(true);
        setPracticeStep(0);

        const todayDate = new Date().toLocaleDateString();
        const existingToday = entries.find(e => e.date === todayDate);
        if (existingToday && !editingId) {
            setEditingId(existingToday.id);
            setCurrentEntry(existingToday);
        }
    }, [entries, editingId]);

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

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'users', user.uid, 'journal'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[]);
        });
        return () => unsubscribe();
    }, [user]);

    const handleSaveEntry = async () => {
        if (!user) return;
        try {
            const entryData = {
                bodySensations: currentEntry.bodySensations || '',
                emotions: currentEntry.emotions || '',
                reflections: currentEntry.reflections || '',
                duration: currentEntry.duration || '2 mins',
                type: 'daily',
                updatedAt: serverTimestamp()
            };
            if (editingId) {
                await updateDoc(doc(db, 'users', user.uid, 'journal', editingId), entryData);
                setEditingId(null);
            } else {
                const dayNumber = entries.length + 1;
                await addDoc(collection(db, 'users', user.uid, 'journal'), {
                    ...entryData,
                    dayNumber,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    createdAt: serverTimestamp()
                });
            }
            setCurrentEntry({ bodySensations: '', emotions: '', reflections: '', duration: '' });
            setShowLogForm(false);
        } catch (error) {
            console.error("Error saving: ", error);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center h-[60vh]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ABCEC9] to-[#C65F9D] flex items-center justify-center mb-4">
                    <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-white">Your Sacred Journal</h1>
                <button onClick={signInWithGoogle} className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest">
                    <LogIn className="w-5 h-5" /> Sign In
                </button>
            </div>
        );
    }

    if (isPracticing && dynamicSteps.length > 0) {
        return (
            <MeditationPortal
                title={journeyTitle.toUpperCase()}
                currentStepTitle={dynamicSteps[practiceStep].title}
                currentStepInstruction={dynamicSteps[practiceStep].instructions.join('. ')}
                onNext={handleNextStep}
                onReset={handleReset}
                onTogglePlay={() => setIsPaused(!isPaused)}
                isPlaying={!isPaused}
                progress={(practiceStep + 1) / dynamicSteps.length}
            />
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 pb-32">
            <header className="text-center space-y-4 mb-12">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[#ABCEC9]/10 flex items-center justify-center mb-6 border border-[#ABCEC9]/20 shadow-glow">
                    <BookOpen className="w-8 h-8 text-[#ABCEC9]" />
                </div>
                <h1 className="text-5xl font-serif font-bold text-white tracking-tight">Daily Log</h1>
                <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">Your Journey to Awareness</p>
            </header>

            {!showLogForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="card-glow p-12 text-center space-y-8">
                        {entries.some(e => e.date === new Date().toLocaleDateString()) ? (
                            <>
                                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#ABCEC9]/10 border border-[#ABCEC9]/20 text-[#ABCEC9] text-[10px] uppercase font-bold tracking-widest">
                                    <Sparkles className="w-3 h-3" /> Awareness Anchored
                                </div>
                                <h2 className="text-3xl font-serif text-white">Your stillness is recorded for today.</h2>
                                <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                                    You've already captured your presence today. Would you like to refine your reflections or sit in stillness again?
                                </p>
                                <div className="flex flex-col md:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            const today = entries.find(e => e.date === new Date().toLocaleDateString());
                                            if (today) {
                                                setEditingId(today.id);
                                                setCurrentEntry(today);
                                                setShowLogForm(true);
                                            }
                                        }}
                                        className="px-12 py-5 bg-white/10 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs border border-white/10 hover:bg-white/20 transition-all"
                                    >
                                        Refine Today's Log
                                    </button>
                                    <button
                                        onClick={() => {
                                            const today = entries.find(e => e.date === new Date().toLocaleDateString());
                                            if (today) {
                                                setEditingId(today.id);
                                                setCurrentEntry(today);
                                            }
                                            setIsPracticing(true);
                                        }}
                                        className="px-12 py-5 bg-[#ABCEC9]/20 text-[#ABCEC9] rounded-2xl font-bold uppercase tracking-[0.2em] text-xs border border-[#ABCEC9]/20 hover:bg-[#ABCEC9]/30 transition-all"
                                    >
                                        Meditate Again
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#ABCEC9]/10 border border-[#ABCEC9]/20 text-[#ABCEC9] text-[10px] uppercase font-bold tracking-widest">
                                    <Sparkles className="w-3 h-3" /> Practice First
                                </div>
                                <h2 className="text-3xl font-serif text-white">Ready to settle into the Now?</h2>
                                <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                                    Before logging your journey, take 2 minutes to reconnect with your inner body.
                                </p>
                                <button
                                    onClick={fetchDailyScript}
                                    disabled={isLoadingScript}
                                    className="px-12 py-5 bg-[#ABCEC9] text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(171,206,201,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isLoadingScript ? "Deepening..." : "Begin Daily Meditation"}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold ml-4">Past Awareness</h3>
                        {entries.length === 0 ? (
                            <div className="p-12 border border-white/5 rounded-[32px] text-center text-white/20 italic">
                                Your journey begins with your first entry.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {entries.filter(entry => {
                                    if (!entry.createdAt?.toDate) return true;
                                    const date = entry.createdAt.toDate();
                                    const thirtyDaysAgo = new Date();
                                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                    return date >= thirtyDaysAgo;
                                }).map(entry => (
                                    <div key={entry.id} className="card-glow p-8 flex justify-between items-start group">
                                        <div className="space-y-3">
                                            <div className="text-[10px] text-white/30 uppercase tracking-widest">{entry.date} • {entry.time}</div>
                                            <p className="text-xl font-serif text-white/90 leading-relaxed whitespace-pre-wrap">"{entry.bodySensations}"</p>
                                            {entry.emotions && <span className="inline-block px-3 py-1 rounded-lg bg-white/5 text-[#ABCEC9] text-[10px] font-bold uppercase">{entry.emotions}</span>}
                                        </div>
                                        <button
                                            onClick={() => { setEditingId(entry.id); setCurrentEntry(entry); setShowLogForm(true); }}
                                            className="p-3 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-white/40 hover:text-white"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {entries.some(entry => {
                            if (!entry.createdAt?.toDate) return false;
                            const date = entry.createdAt.toDate();
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return date < thirtyDaysAgo;
                        }) && (
                                <div className="pt-8">
                                    <button
                                        onClick={() => setShowOlderLogs(!showOlderLogs)}
                                        className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white hover:border-white/40 transition-all"
                                    >
                                        {showOlderLogs ? "Hide Older Entries" : "View Previous History"}
                                    </button>

                                    {showOlderLogs && (
                                        <div className="grid gap-4 mt-8 animate-in fade-in slide-in-from-top-4">
                                            {entries.filter(entry => {
                                                if (!entry.createdAt?.toDate) return false;
                                                const date = entry.createdAt.toDate();
                                                const thirtyDaysAgo = new Date();
                                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                                return date < thirtyDaysAgo;
                                            }).map(entry => (
                                                <div key={entry.id} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex justify-between items-start group hover:bg-white/[0.04] transition-all">
                                                    <div className="space-y-3">
                                                        <div className="text-[10px] text-white/30 uppercase tracking-widest">{entry.date} • {entry.time}</div>
                                                        <p className="text-lg font-serif text-white/60 leading-relaxed whitespace-pre-wrap">"{entry.bodySensations}"</p>
                                                    </div>
                                                    <button
                                                        onClick={() => { setEditingId(entry.id); setCurrentEntry(entry); setShowLogForm(true); }}
                                                        className="p-3 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-white/40 hover:text-white"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
                </motion.div>
            )}

            {showLogForm && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glow p-12 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <PenTool className="w-6 h-6 text-[#ABCEC9]" />
                            <h2 className="text-3xl font-serif text-white">
                                Day {currentEntry.dayNumber || entries.length + 1} Practice
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                setShowLogForm(false);
                                setEditingId(null);
                                setCurrentEntry({ bodySensations: '', emotions: '', reflections: '' });
                            }}
                            className="text-white/20 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid gap-8">

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">What I noticed in my body</label>
                            <textarea
                                value={currentEntry.bodySensations}
                                onChange={e => setCurrentEntry({ ...currentEntry, bodySensations: e.target.value })}
                                placeholder="Describe the physical sensations..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-serif text-white focus:border-[#ABCEC9]/50 transition-all outline-none min-h-[300px] resize-y"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Any emotions that arose</label>
                            <input
                                value={currentEntry.emotions}
                                onChange={e => setCurrentEntry({ ...currentEntry, emotions: e.target.value })}
                                placeholder="Identify feelings during practice..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-[#ABCEC9]/50 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-[#ABCEC9] font-bold">
                                {(currentEntry.dayNumber || entries.length + 1) === 7 ? 'Weekly reflection - What changed?' : 'Reflections'}
                            </label>
                            <textarea
                                value={currentEntry.reflections}
                                onChange={e => setCurrentEntry({ ...currentEntry, reflections: e.target.value })}
                                placeholder="Write your insights here..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-[#ABCEC9]/50 transition-all outline-none min-h-[300px] resize-y"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveEntry}
                        className="w-full py-6 bg-[#ABCEC9] text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
                    >
                        <Save className="w-4 h-4" /> {editingId ? 'Update Log' : 'Seal Entry'}
                    </button>
                </motion.div>
            )
            }
        </div >
    );
};

export default Journal;
