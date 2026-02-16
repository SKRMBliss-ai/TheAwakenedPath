import React, { useState, useEffect, useCallback } from 'react';
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
    const [isMuted, setIsMuted] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);

    const practiceSteps = [
        {
            title: "Step 1: Find a Quiet Moment",
            instructions: [
                "Sit comfortably or lie down",
                "Close your eyes (or soften your gaze)",
                "Take three slow, deep breaths"
            ],
            audioScript: "Welcome. Let's begin our journey inward. Find a quiet moment. Sit comfortably or lie down. Soften your gaze or gently close your eyes. Take three slow, deep breaths. Inhale peace, exhale tension. Let the outer world fade away."
        },
        {
            title: "Step 2: Bring Attention to Your Hands",
            instructions: [
                "Focus attention on your hands (without moving them)",
                "FEEL them from the inside - don't visualize",
                "Notice if they feel warm, cool, tingly, heavy, or light",
                "Can you feel a subtle aliveness or energy in them?"
            ],
            audioScript: "Now, without moving them, bring your entire attention to your hands. Don't visualize them in your mind—FEEL them from the inside. Notice the sensations... do they feel warm? Tingly? Heavy or light? Feel the subtle pulse of life, the energy running through your palms and fingers. Just be with your hands for a few moments."
        },
        {
            title: "Step 3: Expand to Your Arms",
            instructions: [
                "Include your arms in your awareness",
                "Feel the energy running through them",
                "Notice any sensations without judging or analyzing"
            ],
            audioScript: "Let that awareness expand now to include your arms. Feel the life force flowing from your shoulders down to your fingertips. Notice any tingling, warmth, or heaviness. There is nothing to judge, nothing to analyze. Just pure sensation. Pure aliveness."
        },
        {
            title: "Step 4: Expand to Your Whole Body",
            instructions: [
                "Gradually include feet, legs, torso, chest, neck, and head",
                "Feel your entire body as a field of aliveness",
                "Notice where there's energy, tension, or ease"
            ],
            audioScript: "Slowly, let this field of awareness grow. Include your feet, your legs, your torso... feel your chest rise and fall. Move your attention up your neck and into your head. Feel your entire body now as a single field of aliveness. Some areas may feel vibrant, others quiet. Notice tension, notice ease. You are the space in which all these sensations exist."
        },
        {
            title: "Step 5: Notice What Arises",
            instructions: [
                "Notice any emotions showing themselves in the body",
                "Don't push them away - just notice (sadness, joy, anxiety, fear)",
                "You're not making anything happen, just paying attention"
            ],
            audioScript: "As you rest in this body awareness, notice if any emotions arise. You might feel a wave of peace, or perhaps a flicker of anxiety or sadness. Don't push anything away. These emotions are simply showing themselves through sensations in your body. You aren't trying to make anything happen. You are simply the silent witness, paying attention to what is already here. Now you are ready to log your entry for the day."
        }
    ];

    // Audio Logic
    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (isMuted) {
            const duration = text.split(" ").length * 500;
            setTimeout(() => {
                if (onEnd) onEnd();
            }, duration);
            return;
        }
        VoiceService.speak(text, {
            onEnd: () => {
                if (onEnd) setTimeout(onEnd, 1500);
            }
        });
    }, [isMuted]);

    const handleReset = useCallback(() => {
        VoiceService.stop();
        setPracticeStep(0);
    }, []);

    const handleNextStep = useCallback(() => {
        if (practiceStep < practiceSteps.length - 1) {
            setPracticeStep(prev => prev + 1);
        } else {
            handleCompleteMeditation();
        }
    }, [practiceStep, practiceSteps.length]);

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
        if (isPracticing) {
            speak(practiceSteps[practiceStep].audioScript, handleNextStep);
        } else {
            VoiceService.stop();
        }
    }, [practiceStep, isPracticing, speak, handleNextStep]);

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

    if (isPracticing) {
        return (
            <MeditationPortal
                title="DAILY PRACTICE"
                currentStepTitle={practiceSteps[practiceStep].title}
                currentStepInstruction={practiceSteps[practiceStep].instructions.join('. ')}
                onNext={handleNextStep}
                onReset={handleReset}
                onTogglePlay={() => setIsMuted(!isMuted)}
                isPlaying={!isMuted}
                progress={(practiceStep + 1) / practiceSteps.length}
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
                                    onClick={() => setIsPracticing(true)}
                                    className="px-12 py-5 bg-[#ABCEC9] text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(171,206,201,0.3)] hover:scale-105 transition-all"
                                >
                                    Begin Meditation
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
