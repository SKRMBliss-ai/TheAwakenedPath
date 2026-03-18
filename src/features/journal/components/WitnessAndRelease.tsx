import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

/*
 * WITNESS & RELEASE — Step 3
 * Redesigned as a compact card-stack with inner tab navigation.
 * Integrated with the main app structure while keeping the new design philosophy.
 */

interface WitnessData {
    thought: string;
    emotions: string[];
    bodyArea: string;
    distortion: string;
}

interface WitnessAndReleaseProps {
    data: WitnessData;
    onComplete: (reflection: string) => void;
    onTabChange?: (tabId: typeof TABS[number]["id"]) => void;
    onHoopComplete?: () => void;
}

const TABS = [
    { id: "witness", label: "Witness", icon: "◉" },
    { id: "truth", label: "Truth", icon: "✦" },
    { id: "perspective", label: "Perspective", icon: "◐" },
    { id: "release", label: "Release", icon: "〰" },
    { id: "close", label: "Close", icon: "✓" },
] as const;

type TabId = typeof TABS[number]["id"];

const ANTIDOTES: Record<string, { truth: string; reframe: string }> = {
    "default": {
        truth: "Thoughts are not facts. I have navigated challenges before and I will again.",
        reframe: "This is a story my mind is telling. I can choose a truer, kinder story.",
    },
};

const FEAR_TRAITS = [
    "Reacts from past wounds",
    "Needs external validation",
    "Controls, resists, grips",
    "Lives in worst-case stories",
];
const LOVE_TRAITS = [
    "Responds from presence",
    "Trusts inner knowing",
    "Allows, accepts, flows",
    "Rests in what is real now",
];

import { VoiceService } from "../../../services/voiceService";

const HOOP = [
    { phrase: "I'm sorry.", speak: "I am sorry.", icon: "🙏", note: "Acknowledging" },
    { phrase: "Forgive me.", speak: "Please... forgive me.", icon: "💧", note: "Releasing" },
    { phrase: "Thank you.", speak: "Thank you.", icon: "✨", note: "Gratitude" },
    { phrase: "I love you.", speak: "I love you.", icon: "💛", note: "Wholeness" },
];

const GRATITUDE_PROMPTS = [
    "One person who showed you kindness this week",
    "A small comfort you enjoyed today",
    "Something your body did for you today",
    "A lesson from a difficult moment",
    "Something beautiful you noticed recently",
];

export function WitnessAndRelease({ data, onComplete, onTabChange, onHoopComplete }: WitnessAndReleaseProps) {
    const [tab, setTab] = useState<TabId>("witness");
    const [hoopRunning, setHoopRunning] = useState(false);
    const [hoopTime, setHoopTime] = useState(60);
    const [hoopPhase, setHoopPhase] = useState(0);
    const [hoopDone, setHoopDone] = useState(false);
    const [checks, setChecks] = useState({ witnessed: false, truth: false, gratitude: false, hoop: false, reflection: false });
    const [showGratitude, setShowGratitude] = useState(false);
    const [reflection, setReflection] = useState("");
    const timerRef = useRef<any | null>(null);

    const handleTabChange = (newTab: TabId) => {
        setTab(newTab);
        onTabChange?.(newTab);
    };

    const antidote = ANTIDOTES[data.thought] || ANTIDOTES["default"];
    const tabIdx = TABS.findIndex(t => t.id === tab);

    useEffect(() => {
        if (hoopRunning && hoopTime > 0) {
            timerRef.current = setTimeout(() => {
                setHoopTime(t => t - 1);
                const e = 60 - (hoopTime - 1);
                setHoopPhase(Math.min(Math.floor(e / 15), 3));
            }, 1000);
        }
        if (hoopRunning && hoopTime === 0) {
            setHoopRunning(false);
            setHoopDone(true);
            setChecks(c => ({ ...c, hoop: true }));
            onHoopComplete?.();
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [hoopRunning, hoopTime, onHoopComplete]);

    // Speak all phrases once at the start of the practice
    useEffect(() => {
        if (hoopRunning && VoiceService.isEnabled && hoopTime === 60) {
            VoiceService.speak("I am sorry. ... Please forgive me. ... Thank you. ... I love you.");
        }
    }, [hoopRunning, hoopTime]);

    const startHoop = () => {
        setHoopTime(60);
        setHoopPhase(0);
        setHoopRunning(true);
        setHoopDone(false);
    };

    const toggle = (k: keyof typeof checks) => {
        setChecks(c => ({ ...c, [k]: !c[k] }));
        if (k === "gratitude") setShowGratitude(v => !v);
    };

    const allDone = Object.values(checks).every(Boolean);

    const containerStyle = {
        fontFamily: "var(--font-sans)",
    };

    return (
        <div style={containerStyle} className="w-full max-w-4xl mx-auto py-4 bg-[var(--bg-surface)] backdrop-blur-md rounded-[32px] border border-[var(--border-default)] shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10">
                {/* ── Inner tab bar ── */}
                <div className="flex overflow-x-auto no-scrollbar border-b border-[var(--border-subtle)]/30 mb-8">
                    {TABS.map((t, i) => {
                        const active = tab === t.id;
                        const past = i < tabIdx;
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleTabChange(t.id)}
                                className={`flex-1 min-w-[80px] py-4 px-2 flex flex-col items-center gap-1 transition-all relative
                                ${active ? 'bg-[var(--accent-primary-muted)]/10' : 'hover:bg-[var(--bg-surface)]/50'}`}
                            >
                                <span className={`text-lg leading-none transition-opacity
                                ${active ? 'opacity-100' : past ? 'opacity-80' : 'opacity-50'}`}>
                                    {t.icon}
                                </span>
                                <span className={`text-[10px] uppercase tracking-widest transition-colors
                                ${active ? 'text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)] font-medium'}`}>
                                    {t.label}
                                </span>
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Content area ── */}
                <div className="min-h-[400px] px-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {tab === "witness" && (
                                <div className="space-y-6">
                                    <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">A pattern arose</div>

                                    <div className="space-y-2">
                                        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] opacity-70">A thought arose…</div>
                                        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-elevated)] min-h-[100px] flex items-center w-full">
                                            <p className="font-serif italic text-2xl text-[var(--text-primary)] leading-tight w-full" style={{ fontFamily: "var(--font-serif)" }}>
                                                "{data.thought}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] opacity-70">It created…</div>
                                            <div className="flex flex-wrap gap-2">
                                                {data.emotions.map(e => (
                                                    <span key={e} className="px-3 py-1.5 rounded-full bg-[var(--accent-primary-muted)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-xs italic font-serif" style={{ fontFamily: "var(--font-serif)" }}>
                                                        {e}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] opacity-70">Felt in…</div>
                                            <div className="flex items-center">
                                                <span className="px-3 py-1.5 rounded-full bg-[var(--accent-secondary-muted)] border border-[var(--accent-secondary-border)] text-[var(--accent-secondary)] text-xs italic font-serif" style={{ fontFamily: "var(--font-serif)" }}>
                                                    {data.bodyArea}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-[var(--accent-secondary-muted)] border border-[var(--accent-secondary-border)]/20 mt-8">
                                        <p className="font-serif text-lg leading-relaxed text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-serif)" }}>
                                            But notice… <span className="text-[var(--accent-secondary)] italic">you are the one who was watching.</span><br />
                                            <span className="opacity-70">You are not the thought. You are the awareness in which the thought arose.</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {tab === "truth" && (
                                <div className="space-y-8">
                                    <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Counter the belief</div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] shadow-[0_0_10px_var(--accent-secondary)]" />
                                                <span className="font-serif text-sm italic text-[var(--accent-secondary)]" style={{ fontFamily: "var(--font-serif)" }}>What's the truth?</span>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border-default)] shadow-sm min-h-[80px] flex items-center">
                                                <p className="font-serif text-xl text-[var(--text-primary)] leading-relaxed italic" style={{ fontFamily: "var(--font-serif)" }}>
                                                    {antidote.truth}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                                                <span className="font-serif text-sm italic text-[var(--accent-primary)]" style={{ fontFamily: "var(--font-serif)" }}>A kinder thought</span>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border-default)] shadow-sm min-h-[80px] flex items-center">
                                                <p className="font-serif text-xl text-[var(--text-primary)] leading-relaxed italic" style={{ fontFamily: "var(--font-serif)" }}>
                                                    {antidote.reframe}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === "perspective" && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-bold">Two Perspectives</p>
                                        <h3 className="font-serif text-xl text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                                            Where is this thought <span className="text-[var(--accent-secondary)] italic">coming from?</span>
                                        </h3>
                                    </div>

                                    <div className="flex border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-lg bg-[var(--bg-surface)]">
                                        <div className="flex-1 p-6 border-r border-[var(--border-subtle)]/30 text-center bg-[var(--accent-primary-dim)]/20">
                                            <div className="text-2xl mb-3">🌑</div>
                                            <div className="font-serif text-md text-[var(--accent-primary)] font-bold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Fear / Ego</div>
                                            <ul className="space-y-3">
                                                {FEAR_TRAITS.map(t => (
                                                    <li key={t} className="text-[11px] text-rose-200/50 leading-snug">{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex-1 p-6 text-center bg-[var(--accent-secondary-muted)]/10">
                                            <div className="text-2xl mb-3 text-[var(--accent-secondary)]">✦</div>
                                            <div className="font-serif text-md text-[var(--accent-secondary)] font-bold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Being / Love</div>
                                            <ul className="space-y-3">
                                                {LOVE_TRAITS.map(t => (
                                                    <li key={t} className="text-[11px] text-[var(--accent-secondary)] opacity-60 leading-snug">{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <p className="text-center font-serif text-sm italic text-[var(--text-muted)] opacity-60 mt-4" style={{ fontFamily: "var(--font-serif)" }}>
                                        "You are not the fear. You are the awareness witnessing it."
                                    </p>
                                </div>
                            )}

                            {tab === "release" && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Ho'oponopono · 1 min</p>
                                        <p className="text-sm text-[var(--text-muted)] font-serif italic max-w-xs mx-auto" style={{ fontFamily: "var(--font-serif)" }}>
                                            Silently repeat each phrase. Let each one dissolve a layer of resistance.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pb-4">
                                        {HOOP.map((h, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    scale: hoopRunning && hoopPhase === i ? 1.05 : 1,
                                                    opacity: hoopRunning && hoopPhase !== i && !hoopDone ? 0.5 : 1
                                                }}
                                                className={`p-4 rounded-xl border transition-colors text-center
                                                ${(hoopRunning && hoopPhase === i) || hoopDone
                                                        ? 'bg-[var(--accent-primary-muted)] border-[var(--accent-primary-border)]'
                                                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]/60 shadow-sm'}`}
                                            >
                                                <div className="text-xl mb-1">{h.icon}</div>
                                                <div className="font-serif text-sm text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>{h.phrase}</div>
                                                <div className="text-[9px] uppercase tracking-tighter text-[var(--text-muted)]/50">{h.note}</div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <svg width="90" height="90" viewBox="0 0 90 90" className="rotate-[-90deg]">
                                                <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                                <circle cx="45" cy="45" r="40" fill="none" stroke="var(--accent-primary)" strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeDasharray={251.3}
                                                    strokeDashoffset={251.3 * (1 - hoopTime / 60)}
                                                    className="transition-[stroke-dashoffset] duration-1000 linear" />
                                            </svg>
                                            <span className="absolute font-serif text-xl" style={{ fontFamily: "var(--font-serif)" }}>
                                                {Math.floor(hoopTime / 60)}:{(hoopTime % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        <button
                                            onClick={startHoop}
                                            disabled={hoopRunning}
                                            className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all
                                            ${hoopRunning
                                                    ? 'bg-[var(--bg-deep)] text-[var(--text-disabled)]'
                                                    : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg transform hover:scale-105 active:scale-95'}`}
                                        >
                                            {hoopDone ? "✦ Complete" : hoopRunning ? "Releasing…" : "Begin Practice"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {tab === "close" && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Deepen the witness</div>
                                        <textarea
                                            value={reflection}
                                            onChange={e => {
                                                setReflection(e.target.value);
                                                if (e.target.value.length > 0) setChecks(c => ({ ...c, reflection: true }));
                                            }}
                                            placeholder="Anything else you'd like to release or witness today?"
                                            className="w-full h-32 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none font-serif text-lg text-[var(--text-primary)] transition-all resize-none placeholder:text-[var(--text-muted)] placeholder:opacity-60"
                                            style={{ fontFamily: "var(--font-serif)" }}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Before you close</div>
                                        <div className="p-1 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]/50 divide-y divide-[var(--border-subtle)]/20">
                                            <CheckItem checked={checks.witnessed} onToggle={() => toggle("witnessed")} label="I witnessed my pattern without judgement" />
                                            <CheckItem checked={checks.truth} onToggle={() => toggle("truth")} label="I read the truth — a kinder thought" />
                                            <CheckItem checked={checks.gratitude} onToggle={() => toggle("gratitude")} label="I paused for gratitude" sub="tap to see prompts" />
                                            <AnimatePresence>
                                                {showGratitude && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[var(--bg-deep)]/30">
                                                        <div className="py-4 px-6 space-y-2">
                                                            {GRATITUDE_PROMPTS.map((p, i) => (
                                                                <div key={i} className="text-[11px] text-[var(--text-muted)] italic leading-relaxed pl-4 border-l border-amber-500/20">{p}</div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <CheckItem checked={checks.hoop} onToggle={() => toggle("hoop")} label="Ho'oponopono (Auto-checked after practice)" />
                                            <CheckItem checked={checks.reflection} onToggle={() => toggle("reflection")} label="I wrote a reflection" />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {allDone && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="pt-8 text-center space-y-6"
                                            >
                                                <div className="space-y-2">
                                                    <div className="text-3xl text-[var(--accent-primary)]">✦</div>
                                                    <div className="font-serif text-2xl italic text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                                                        You are not your thoughts.
                                                    </div>
                                                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em]">Practice complete</div>
                                                </div>
                                                <button
                                                    onClick={() => onComplete(reflection)}
                                                    className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-xl shadow-[var(--accent-primary)]/10"
                                                >
                                                    Seal this Entry ✦
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Bottom nav ── */}
                <div className="mt-12 flex justify-between items-center px-2">
                    <button
                        onClick={() => { const i = tabIdx - 1; if (i >= 0) handleTabChange(TABS[i].id); }}
                        disabled={tabIdx === 0}
                        className="px-6 py-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-widest transition-opacity disabled:opacity-20"
                    >
                        ← Back
                    </button>

                    {/* Progress Dots */}
                    <div className="flex gap-2">
                        {TABS.map((t, i) => (
                            <div key={t.id} className={`h-1.5 rounded-full transition-all duration-300
                            ${i === tabIdx ? 'w-8 bg-[var(--accent-primary)]' : i < tabIdx ? 'w-1.5 bg-[var(--accent-primary)]/40' : 'w-1.5 bg-[var(--border-subtle)]'}`} />
                        ))}
                    </div>

                    {tabIdx < TABS.length - 1 ? (
                        <button
                            onClick={() => { handleTabChange(TABS[tabIdx + 1].id); }}
                            className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all bg-[var(--accent-primary)] text-white"
                        >
                            Next →
                        </button>
                    ) : (
                        <div className="w-[100px]" /> /* Spacer to balance the 'Back' button */
                    )}
                </div>
            </div>
        </div>
    );
}

function CheckItem({ checked, onToggle, label, sub }: { checked: boolean; onToggle: () => void; label: string; sub?: string }) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-start gap-4 p-5 hover:bg-[var(--bg-glass)] transition-colors group text-left"
        >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5
                ${checked ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-[var(--text-muted)] group-hover:border-[var(--accent-primary)]'}`}>
                {checked && <Check size={12} className="text-[var(--bg-deep)]" />}
            </div>
            <div>
                <div className={`text-xs font-semibold transition-all
                    ${checked ? 'text-[var(--text-disabled)] line-through opacity-50' : 'text-[var(--text-primary)]'}`}>
                    {label}
                </div>
                {sub && !checked && (
                    <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">
                        {sub}
                    </div>
                )}
            </div>
        </button>
    );
}

