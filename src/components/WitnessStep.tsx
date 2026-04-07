import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Sparkles, Heart, Wind, ShieldCheck } from "lucide-react";

// ─── TYPES ───
interface WitnessStepProps {
    selectedThoughts: string[];
    selectedEmotions: string[];
    selectedBodyArea: string;
    onComplete?: (reflection: string) => void;
}

// ─── ANTIDOTE LOGIC ───
const ANTIDOTES: Record<string, { truth: string; reframe: string }> = {
    "I can't manage this. It's too much.": {
        truth: "I have managed difficult things before. I found a way then — I can find a way now.",
        reframe: "This feeling is temporary. My track record of handling hard things is 100%.",
    },
    "rejected": {
        truth: "My worth isn't determined by one person's response. I matter to many people.",
        reframe: "I don't need external validation to know my value. I am enough as I am.",
    },
    "default": {
        truth: "Thoughts are not facts. I have navigated challenges before and I will again.",
        reframe: "This is a story my mind is telling. I can choose a truer, kinder story.",
    },
};

const HOOPONOPONO = [
    { phrase: "I'm sorry", icon: <Wind size={20} />, meaning: "Acknowledging the pattern" },
    { phrase: "Please forgive me", icon: <ShieldCheck size={20} />, meaning: "Releasing attachment" },
    { phrase: "Thank you", icon: <Sparkles size={20} />, meaning: "Gratitude for awareness" },
    { phrase: "I love you", icon: <Heart size={20} />, meaning: "Returning to wholeness" },
];

const GRATITUDE_PROMPTS = [
    "One person who showed you kindness this week",
    "A small comfort you enjoyed today",
    "Something your body did for you today",
    "A lesson a difficult moment taught you",
    "Something beautiful you noticed recently",
];

// ─── UI COMPONENTS ───

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
    const r = 44;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - seconds / total);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
                <circle
                    cx="60" cy="60" r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                />
                <circle
                    cx="60" cy="60" r={r}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-1000 linear"
                />
            </svg>
            <span className="absolute font-serif text-2xl text-[var(--text-primary)]">
                {m}:{s.toString().padStart(2, "0")}
            </span>
        </div>
    );
}

const fearTraits = [
    "Reacts from past wounds",
    "Needs external validation",
    "Controls, resists, grips",
    "Lives in worst-case stories",
];

const loveTraits = [
    "Responds from presence",
    "Trusts inner knowing",
    "Allows, accepts, flows",
    "Rests in what is real now",
];

export function WitnessStep({
    selectedThoughts,
    selectedEmotions,
    selectedBodyArea,
    onComplete
}: WitnessStepProps) {
    const mainThought = selectedThoughts[0] || "No thought selected";
    const antidote = ANTIDOTES[mainThought] || ANTIDOTES["default"];
    // const distortion = activeCategories[0]?.cognitiveDistortion || "Hidden Pattern";

    const [hoopOpen, setHoopOpen] = useState(false);
    const [hoopRunning, setHoopRunning] = useState(false);
    const [hoopTime, setHoopTime] = useState(60);
    const [hoopPhaseIndex, setHoopPhaseIndex] = useState(0);
    const [hoopDone, setHoopDone] = useState(false);
    const timerRef = useRef<any>(null);

    const [reflection, setReflection] = useState("");
    const [checks, setChecks] = useState({
        witnessed: false,
        antidote: false,
        gratitude: false,
        hooponopono: false,
        reflection: false,
    });
    const [gratitudeExpanded, setGratitudeExpanded] = useState(false);

    useEffect(() => {
        if (hoopRunning && hoopTime > 0) {
            timerRef.current = setTimeout(() => {
                setHoopTime((t) => t - 1);
                const elapsed = 60 - (hoopTime - 1);
                setHoopPhaseIndex(Math.min(Math.floor(elapsed / 15), 3));
            }, 1000);
        }
        if (hoopRunning && hoopTime === 0) {
            setHoopRunning(false);
            setHoopDone(true);
            setChecks((c) => ({ ...c, hooponopono: true }));
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [hoopRunning, hoopTime]);

    const startHoop = () => {
        setHoopTime(60);
        setHoopPhaseIndex(0);
        setHoopRunning(true);
        setHoopDone(false);
    };

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks((c) => ({ ...c, [key]: !c[key] }));
        if (key === "gratitude") {
            setGratitudeExpanded(!checks.gratitude);
        }
    };

    const allDone = Object.values(checks).every(Boolean);

    return (
        <div className="space-y-10 py-6">
            {/* 1. Pattern Summary (Matching Screenshot Style) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl space-y-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 blur-[80px] -mr-32 -mt-32" />

                <div className="space-y-6 relative z-10 text-left">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold mb-6 opacity-80">A PATTERN AROSE</p>

                        <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-bold opacity-100 italic">A THOUGHT AROSE...</p>
                            <p className="font-serif text-2xl italic text-[var(--text-primary)] pl-4 border-l-2 border-[var(--accent-primary-border)] line-clamp-2">
                                "{mainThought}"
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-bold opacity-100 italic">IT CREATED...</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedEmotions.map(e => (
                                <span key={e} className="px-5 py-2 rounded-full bg-[var(--accent-primary-muted)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-sm font-serif italic">
                                    {e}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-bold opacity-100 italic">YOU FELT IT IN YOUR...</p>
                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-serif text-lg">
                            <span className="text-xl">🌿</span>
                            <span>{selectedBodyArea}</span>
                        </div>
                    </div>

                    {/* Witness Insight Box */}
                    <div className="mt-8 p-6 rounded-2xl bg-[var(--accent-secondary-muted)] border border-[var(--accent-secondary-border)]/20 shadow-inner">
                        <p className="font-serif text-lg leading-relaxed text-[var(--text-secondary)]">
                            But notice... <span className="text-[var(--accent-secondary)] italic font-bold">you are the one who was watching.</span>
                        </p>
                        <p className="font-serif text-lg leading-relaxed text-[var(--text-muted)] mt-1">
                            You are not the thought. You are the awareness in which the thought arose.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 2. Antidote Thought */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--accent-secondary-muted)] to-[var(--bg-surface)] border border-[var(--accent-secondary-border)] relative shadow-2xl shadow-[var(--accent-secondary-muted)]/10 text-left">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 text-[var(--accent-secondary)] mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span className="font-serif text-sm italic">What's the truth?</span>
                            </div>
                            <p className="font-serif text-2xl text-[var(--text-primary)] leading-relaxed pl-4 border-l-2 border-[var(--accent-secondary-border)]">
                                {antidote.truth}
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 text-[var(--accent-primary)] mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span className="font-serif text-sm italic">A kinder thought</span>
                            </div>
                            <p className="font-serif text-2xl text-[var(--text-primary)] leading-relaxed pl-4 border-l-2 border-[var(--accent-primary-border)]">
                                {antidote.reframe}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 3. The Perspective Shift Diagram */}
            <div className="space-y-6 pt-6">
                <div className="text-center space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-bold">Two Perspectives</p>
                    <h3 className="font-serif text-2xl text-[var(--text-primary)]">Where is this thought coming from?</h3>
                </div>

                <div className="flex border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-xl bg-[var(--bg-surface)] backdrop-blur-md">
                    <div className="flex-1 p-8 bg-rose-500/[0.05] dark:bg-rose-500/[0.12] border-r border-[var(--border-subtle)] text-center flex flex-col items-center">
                        <span className="text-4xl mb-4 opacity-100">🌑</span>
                        <h4 className="font-serif text-xl font-bold text-rose-800 dark:text-rose-300 mb-6 underline decoration-rose-500/30 underline-offset-8">Fear / Ego</h4>
                        <ul className="space-y-4 text-sm text-rose-950 dark:text-rose-100/70 leading-relaxed font-medium">
                            {fearTraits.map(t => <li key={t}>{t}</li>)}
                        </ul>
                    </div>
                    <div className="flex-1 p-8 bg-[var(--accent-secondary-muted)] text-center flex flex-col items-center">
                        <span className="text-4xl mb-4 opacity-100">✦</span>
                        <h4 className="font-serif text-xl font-bold text-[var(--accent-secondary)] mb-6 underline decoration-[var(--accent-secondary)]/30 underline-offset-8">Being / Love</h4>
                        <ul className="space-y-4 text-sm text-[var(--text-primary)] dark:text-[var(--accent-secondary)] dark:opacity-90 leading-relaxed font-bold">
                            {loveTraits.map(t => <li key={t}>{t}</li>)}
                        </ul>
                    </div>
                </div>
                <p className="text-center font-serif text-base italic text-[var(--text-muted)] opacity-80">"You are not the fear. You are the awareness witnessing it."</p>
            </div>

            {/* 4. Ho'oponopono (Optional) */}
            <div className="pt-6">
                <button
                    onClick={() => setHoopOpen(!hoopOpen)}
                    className="w-full flex items-center justify-between p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-glass)] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-xs tracking-wider uppercase text-[var(--text-primary)]">Ho'oponopono Release</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--bg-deep)] border border-purple-500/30 text-purple-300 text-[9px] font-bold tracking-tighter">OPTIONAL</span>
                    </div>
                    <ChevronDown className={`transition-transform duration-300 text-[var(--text-disabled)] ${hoopOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {hoopOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="py-8 space-y-8">
                                <p className="text-sm text-[var(--text-muted)] font-serif italic leading-relaxed text-center max-w-sm mx-auto">
                                    An ancient practice to release negative energy. Silently repeat each phrase, letting them dissolve layers of resistance.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {HOOPONOPONO.map((h, i) => (
                                        <div key={i} className={`p-6 rounded-2xl border text-center transition-all duration-500 ${(hoopRunning && hoopPhaseIndex === i) || hoopDone ? 'bg-[var(--accent-primary-muted)] border-[var(--accent-primary-border)] scale-105 shadow-lg shadow-[var(--accent-primary-muted)]/10' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'}`}>
                                            <div className="mb-4 text-[var(--accent-primary)] flex justify-center">{h.icon}</div>
                                            <div className="font-serif text-lg text-[var(--text-primary)] mb-1">{h.phrase}</div>
                                            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{h.meaning}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col items-center gap-8">
                                    <TimerRing seconds={hoopTime} total={60} />
                                    <button
                                        disabled={hoopRunning}
                                        onClick={startHoop}
                                        className={`px-8 py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all ${hoopRunning ? 'bg-[var(--bg-deep)] text-[var(--text-disabled)] cursor-not-allowed' : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-xl hover:scale-105 active:scale-95'}`}
                                    >
                                        {hoopDone ? "✦ Complete" : hoopRunning ? "Releasing..." : "Begin 1-Minute Practice"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 5. Final Reflection & Checklist */}
            <div className="pt-6 space-y-8">
                <div className="space-y-4">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-bold mb-4 text-left">Deepen the Witness</p>
                    <textarea
                        value={reflection}
                        onChange={(e) => {
                            setReflection(e.target.value);
                            if (!checks.reflection) toggleCheck('reflection');
                        }}
                        placeholder="Anything else you'd like to release or witness today?"
                        className="w-full h-40 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] outline-none font-serif text-lg text-[var(--text-primary)] resize-none transition-all placeholder:italic placeholder:opacity-30"
                    />
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold mb-4 text-left">Before You Close</p>
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--bg-surface)] to-transparent border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]/50">
                        <CheckItem label="I witnessed my pattern without judgment" active={checks.witnessed} onToggle={() => toggleCheck('witnessed')} />
                        <CheckItem label="I read the truth — a kinder thought" active={checks.antidote} onToggle={() => toggleCheck('antidote')} />
                        <CheckItem label="I paused for gratitude" sub="Tap to see prompts" active={checks.gratitude} onToggle={() => toggleCheck('gratitude')} />

                        <AnimatePresence>
                            {gratitudeExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="py-4 pl-10 space-y-3">
                                        {GRATITUDE_PROMPTS.map(p => (
                                            <p key={p} className="text-xs text-[var(--text-muted)] italic pl-4 border-l border-amber-500/30 text-left">{p}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <CheckItem label="Ho'oponopono (Auto-checked after practice)" active={checks.hooponopono} onToggle={() => toggleCheck('hooponopono')} />
                        <CheckItem label="I wrote a reflection" active={checks.reflection} onToggle={() => toggleCheck('reflection')} last />
                    </div>
                </div>
            </div>

            {/* Completion Message */}
            <AnimatePresence>
                {allDone && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center gap-6">
                        <div className="text-5xl text-[var(--accent-primary)] animate-pulse">✦</div>
                        <div className="space-y-2">
                            <h4 className="font-serif text-2xl italic text-[var(--text-primary)]">You are not your thoughts.</h4>
                            <p className="text-xs tracking-[0.4em] uppercase text-[var(--accent-secondary)] font-bold">Practice Complete</p>
                        </div>
                        {onComplete && (
                            <button
                                onClick={() => onComplete(reflection)}
                                className="mt-4 px-12 py-5 rounded-2xl bg-white text-black font-bold tracking-[0.2em] uppercase text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-2xl"
                            >
                                Seal this Entry ✦
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CheckItem({ label, active, onToggle, last, sub }: { label: string; active: boolean; onToggle: () => void; last?: boolean; sub?: string }) {
    return (
        <button
            onClick={onToggle}
            className={`w-full flex items-start gap-4 py-5 group transition-opacity ${active ? 'opacity-40' : 'opacity-100'} ${last ? '' : 'border-b border-[var(--border-subtle)]/30'}`}
        >
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${active ? 'bg-[var(--accent-secondary)] border-[var(--accent-secondary)]' : 'bg-transparent border-[var(--text-muted)] group-hover:border-[var(--accent-secondary-border)]'}`}>
                {active && <Check size={14} className="text-[var(--bg-deep)]" />}
            </div>
            <div className="text-left">
                <p className={`text-sm font-medium transition-colors ${active ? 'text-[var(--text-disabled)] line-through' : 'text-[var(--text-primary)]'}`}>{label}</p>
                {sub && !active && <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">{sub}</p>}
            </div>
        </button>
    );
}
