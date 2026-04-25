import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";
import { VoiceService } from "../../../services/voiceService";

/*
 * WITNESS & RELEASE — Step 3
 * High-contrast, accessibility-first design for a 40+ audience.
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
    { id: "truth", label: "Truth", icon: "2" },
    { id: "perspective", label: "Perspective", icon: "3" },
    { id: "release", label: "Release", icon: "4" },
    { id: "close", label: "Close", icon: "5" },
] as const;

type TabId = typeof TABS[number]["id"];

// No longer used

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
    const [checks, setChecks] = useState({ witnessed: false, truth: false, gratitude: false, reflection: false });
    const [showGratitude, setShowGratitude] = useState(false);
    const [reflection, setReflection] = useState("");
    const timerRef = useRef<any | null>(null);

    const handleTabChange = (newTab: TabId) => {
        setTab(newTab);
        onTabChange?.(newTab);
    };

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
            onHoopComplete?.();
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [hoopRunning, hoopTime, onHoopComplete]);

    const startHoop = async () => {
        setHoopRunning(true);
        setHoopTime(60);
        setHoopDone(false);
        for (const h of HOOP) {
            await VoiceService.speak(h.speak);
            await new Promise(r => setTimeout(r, 15000));
        }
    };

    const toggle = (k: keyof typeof checks) => {
        setChecks(c => ({ ...c, [k]: !c[k] }));
        if (k === "gratitude") setShowGratitude(v => !v);
    };

    const allDone = Object.values(checks).every(Boolean);

    return (
        <div className="w-full max-w-5xl mx-auto py-2">
            <div>
                <div className="py-8 sm:py-12">
                    
                    {/* ── Tab Navigation (Directly on Base Container) ── */}
                    <div className="flex overflow-x-auto no-scrollbar mb-16 pb-1">
                        {TABS.map((t, i) => {
                            const active = tab === t.id;
                            const past = i < tabIdx;
                            
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => handleTabChange(t.id)}
                                    className={cn(
                                        "flex-1 min-w-[100px] py-4 px-2 relative transition-all duration-300",
                                        active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                    )}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all font-serif",
                                            active ? "bg-[var(--accent-primary-dim)] shadow-[0_0_20px_var(--accent-primary-dim)] border border-[var(--accent-primary-border)]" : 
                                            past ? "text-[var(--accent-primary)] opacity-60" : "opacity-30"
                                        )}>
                                            {t.icon}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.3em] transition-opacity",
                                            active ? "opacity-100" : "opacity-30"
                                        )}>{t.label}</span>
                                    </div>
                                    {active && (
                                        <motion.div layoutId="tabLine" className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-[var(--accent-primary)] rounded-full shadow-[0_0_8px_var(--accent-primary)]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {tab === "witness" && (
                                <div className="space-y-10 text-center">
                                    <div className="space-y-4">
                                        <p className="text-[12px] uppercase font-black tracking-[0.5em] text-[var(--accent-primary)]">Step One</p>
                                        <h3 className="font-serif text-3xl md:text-5xl text-[var(--text-main)] italic leading-tight">
                                            The Watcher on the Bank
                                        </h3>
                                        <p className="max-w-2xl mx-auto text-xl text-[var(--text-muted)] leading-relaxed">
                                            You are not the thought. You are the one who <span className="italic text-[var(--text-primary)] font-semibold">notices</span> it.
                                        </p>
                                    </div>

                                    <div className="p-12 rounded-[40px] bg-[var(--bg-input)] border border-[var(--border-subtle)] shadow-inner flex items-center justify-center min-h-[200px]">
                                        <p className="font-serif text-3xl italic text-[var(--text-main)] leading-relaxed px-4 opacity-90">
                                            "{data.thought}"
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => toggle("witnessed")}
                                        className={cn(
                                            "mt-8 px-12 py-5 rounded-full text-sm font-black uppercase tracking-[0.3em] transition-all border-2",
                                            checks.witnessed ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]" : "border-[var(--border-default)] text-[var(--text-main)] hover:bg-[var(--bg-input)]"
                                        )}
                                    >
                                        {checks.witnessed ? "✓ I see this clearly" : "I am Witnessing this"}
                                    </button>
                                </div>
                            )}

                            {tab === "truth" && (
                                <div className="space-y-10 text-center">
                                    <div className="space-y-4">
                                        <p className="text-[12px] uppercase font-black tracking-[0.5em] text-[var(--accent-secondary)]">Step Two</p>
                                        <h3 className="font-serif text-3xl md:text-5xl text-[var(--text-main)] italic">
                                            Questioning the Narrative
                                        </h3>
                                        <p className="max-w-2xl mx-auto text-xl text-[var(--text-muted)]">
                                            The ego loves absolute certainty. Awareness loves the truth.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                        <div className="p-10 rounded-[32px] bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-5">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">Pattern of Distortion</p>
                                            <p className="font-serif text-3xl text-[var(--text-primary)] italic">✦ {data.distortion}</p>
                                        </div>

                                        <div className="p-10 rounded-[32px] bg-[var(--accent-secondary-muted)]/10 border border-[var(--accent-secondary-border)]/20 flex flex-col justify-center">
                                            <p className="font-serif text-xl italic text-[var(--text-main)] leading-relaxed">
                                                Suffering only happens when we believe a thought that is not true for us.
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => toggle("truth")}
                                        className={cn(
                                            "mt-8 px-12 py-5 rounded-full text-sm font-black uppercase tracking-[0.3em] transition-all border-2",
                                            checks.truth ? "bg-[var(--accent-secondary)] text-white border-[var(--accent-secondary)]" : "border-[var(--border-default)] text-[var(--text-main)] hover:bg-[var(--bg-input)]"
                                        )}
                                    >
                                        {checks.truth ? "✓ Willing to see truth" : "Look deeper"}
                                    </button>
                                </div>
                            )}

                            {tab === "perspective" && (
                                <div className="space-y-10">
                                    <div className="text-center space-y-4">
                                        <p className="text-[12px] uppercase font-black tracking-[0.5em] text-[var(--text-muted)]">Perspective Shift</p>
                                        <h3 className="font-serif text-3xl md:text-4xl text-[var(--text-main)] italic">
                                            Where is this <span className="text-[var(--accent-secondary)]">born from?</span>
                                        </h3>
                                    </div>

                                    <div className="flex flex-col md:flex-row border-2 border-[var(--border-subtle)] rounded-[48px] overflow-hidden bg-[var(--bg-surface)]/50 backdrop-blur-sm shadow-sm">
                                        <div className="flex-1 p-10 md:border-r border-[var(--border-subtle)] text-center bg-rose-500/[0.08] dark:bg-rose-500/[0.25]">
                                            <div className="text-4xl mb-5">🌑</div>
                                            <div className="font-serif text-3xl text-rose-950 dark:text-rose-100 font-bold mb-8 underline decoration-rose-500/40 underline-offset-8">Fear / Ego</div>
                                            <ul className="space-y-6">
                                                {FEAR_TRAITS.map(t => (
                                                    <li key={t} className="text-xl text-rose-950/90 dark:text-rose-100/90 leading-snug font-semibold">{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex-1 p-10 text-center bg-[var(--accent-secondary-muted)]/20">
                                            <div className="text-4xl mb-5 text-[var(--accent-secondary)]">✦</div>
                                            <div className="font-serif text-3xl text-[var(--accent-secondary)] font-bold mb-8 underline decoration-[var(--accent-secondary)]/40 underline-offset-8">Being / Love</div>
                                            <ul className="space-y-6">
                                                {LOVE_TRAITS.map(t => (
                                                    <li key={t} className="text-xl text-[var(--text-primary)] dark:text-[var(--accent-secondary)] leading-snug font-black">{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === "release" && (
                                <div className="space-y-10 text-center">
                                    <div className="space-y-4">
                                        <p className="text-[12px] uppercase font-black tracking-[0.4em] text-[var(--text-muted)]">Ho'oponopono · 1 min</p>
                                        <p className="text-2xl text-[var(--text-main)] font-serif italic max-w-xl mx-auto">
                                            Let these phrases dissolve a layer of resistance.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6 text-left">
                                        {HOOP.map((h, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    scale: hoopRunning && hoopPhase === i ? 1.05 : 1,
                                                    opacity: hoopRunning && hoopPhase !== i && !hoopDone ? 0.4 : 1
                                                }}
                                                className={cn(
                                                    "p-8 rounded-[28px] border transition-all duration-500 shadow-sm",
                                                    (hoopRunning && hoopPhase === i) || hoopDone ? "bg-[var(--accent-primary-muted)] border-[var(--accent-primary-border)]" : "bg-[var(--bg-input)] border-[var(--border-subtle)]"
                                                )}
                                            >
                                                <div className="text-4xl mb-3">{h.icon}</div>
                                                <div className="font-serif text-2xl text-[var(--text-primary)] italic">{h.phrase}</div>
                                                <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{h.note}</div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col items-center gap-8">
                                        <div className="relative w-36 h-36 flex items-center justify-center">
                                            <svg width="140" height="140" viewBox="0 0 90 90" className="-rotate-90">
                                                <circle cx="45" cy="45" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="3" opacity="0.2" />
                                                <circle cx="45" cy="45" r="40" fill="none" stroke="var(--accent-primary)" strokeWidth="4"
                                                    strokeLinecap="round"
                                                    strokeDasharray={251.3}
                                                    strokeDashoffset={251.3 * (1 - hoopTime / 60)}
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                            <span className="absolute font-serif text-3xl text-[var(--text-main)]">
                                                {Math.floor(hoopTime / 60)}:{(hoopTime % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        <button
                                            onClick={startHoop}
                                            disabled={hoopRunning}
                                            className="px-12 py-5 rounded-full text-sm font-black uppercase tracking-[0.3em] bg-[var(--accent-primary)] text-white shadow-xl hover:scale-105 active:scale-95 disabled:opacity-20"
                                        >
                                            {hoopRunning ? 'Releasing...' : 'Start Prayer'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {tab === "close" && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <p className="text-[12px] uppercase font-black tracking-widest text-[var(--accent-primary)]">Final Reflection</p>
                                        <textarea
                                            value={reflection}
                                            onChange={e => {
                                                setReflection(e.target.value);
                                                if (e.target.value.length > 0) setChecks(c => ({ ...c, reflection: true }));
                                            }}
                                            placeholder="What did you witness today?"
                                            className="w-full h-48 p-8 rounded-[32px] bg-[var(--bg-input)] border border-[var(--border-subtle)] font-serif text-2xl text-[var(--text-main)] italic resize-none outline-none focus:border-[var(--accent-primary)]"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-3 bg-[var(--bg-input)]/50 rounded-[32px] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]/20 shadow-inner">
                                            <CheckItem 
                                                checked={checks.witnessed} 
                                                onToggle={() => toggle("witnessed")} 
                                                label="I witnessed my pattern" 
                                            />
                                            <CheckItem 
                                                checked={checks.truth} 
                                                onToggle={() => toggle("truth")} 
                                                label="I considered the wiser path" 
                                            />
                                            <CheckItem 
                                                checked={checks.gratitude} 
                                                onToggle={() => toggle("gratitude")} 
                                                label="I paused for gratitude" 
                                                sub="tap to see prompts" 
                                            />
                                            <AnimatePresence>
                                                {showGratitude && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[var(--bg-surface)]/40">
                                                        <div className="py-6 px-10 space-y-3">
                                                            {GRATITUDE_PROMPTS.map((p, i) => (
                                                                <div key={i} className="text-lg text-[var(--text-muted)] italic leading-relaxed pl-5 border-l-2 border-[var(--accent-primary)]/30">{p}</div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {allDone && (
                                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pt-10 text-center">
                                            <button
                                                onClick={() => onComplete(reflection)}
                                                className="w-full py-6 rounded-[28px] bg-[var(--accent-primary)] text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl"
                                            >
                                                Seal this Entry ✦
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Nav - floating styled */}
                <div className="px-8 sm:px-4 py-12 flex items-center justify-between">
                    <button
                        onClick={() => { const i = tabIdx - 1; if (i >= 0) handleTabChange(TABS[i].id); }}
                        disabled={tabIdx === 0}
                        className="px-10 py-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest disabled:opacity-20"
                    >
                        ← Back
                    </button>

                    <div className="hidden sm:flex gap-4">
                        {TABS.map((t, i) => (
                            <div key={t.id} className={cn(
                                "h-2.5 rounded-full transition-all duration-500",
                                i === tabIdx ? "w-14 bg-[var(--accent-primary)]" : "w-3 bg-[var(--border-subtle)]/40"
                            )} />
                        ))}
                    </div>

                    {tabIdx < TABS.length - 1 ? (
                        <button
                            onClick={() => { handleTabChange(TABS[tabIdx + 1].id); }}
                            className="px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/10"
                        >
                            Next →
                        </button>
                    ) : (
                        <div className="w-[120px]" />
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
            <div className={cn(
                "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5",
                checked ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]" : "border-[var(--border-default)] group-hover:border-[var(--accent-primary)]"
            )}>
                {checked && <Check size={18} className="text-white" />}
            </div>
            <div>
                <div className={cn(
                    "text-lg font-bold font-serif transition-all",
                    checked ? "text-[var(--text-disabled)] line-through opacity-50 italic" : "text-[var(--text-main)]"
                )}>
                    {label}
                </div>
                {sub && !checked && <div className="text-[10px] text-[var(--accent-primary)] font-black uppercase tracking-widest mt-1">{sub}</div>}
            </div>
        </button>
    );
}
