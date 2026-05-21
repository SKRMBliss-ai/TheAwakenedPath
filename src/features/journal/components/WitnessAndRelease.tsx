import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";
import { VoiceService, useVoiceEnabled, useVoiceStatus } from "../../../services/voiceService";
import { AnchorButton } from "../../../components/ui/SacredUI";

/*
 * WITNESS & RELEASE — Step 3
 * Simplified, plain-language, accessible design for a 50+ audience.
 * Includes guided meditation music and intelligent voice ducking.
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
    onBackStep?: () => void;
}

const TABS = [
    { id: "witness",     label: "Observe",   icon: "1" },
    { id: "truth",       label: "Question",  icon: "2" },
    { id: "perspective", label: "Reflect",   icon: "3" },
    { id: "release",     label: "Release",   icon: "4" },
    { id: "close",       label: "Close",     icon: "5" },
] as const;

type TabId = typeof TABS[number]["id"];

const FEAR_TRAITS = [
    "Reacts from past wounds",
    "Needs others' approval",
    "Controls and resists",
    "Imagines worst outcomes",
];

const LOVE_TRAITS = [
    "Responds with calm",
    "Trusts inner wisdom",
    "Accepts what is",
    "Stays present, not fearful",
];

const HOOP = [
    { phrase: "I'm sorry.", speak: "I am sorry.", icon: "🙏", note: "Acknowledge" },
    { phrase: "Forgive me.", speak: "Please forgive me.", icon: "💧", note: "Release" },
    { phrase: "Thank you.", speak: "Thank you.", icon: "✨", note: "Gratitude" },
    { phrase: "I love you.", speak: "I love you.", icon: "💛", note: "Wholeness" },
];

const GRATITUDE_PROMPTS = [
    "Someone who showed you kindness this week",
    "A small comfort you enjoyed today",
    "Something your body did for you today",
    "A lesson from a difficult moment",
    "Something beautiful you noticed recently",
];

// Shared UI component for the checklist in the final step
function CheckItem({ checked, onToggle, label, sub }: { checked: boolean; onToggle: () => void; label: string; sub?: string }) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-start gap-4 p-5 hover:bg-[var(--bg-input)] transition-all text-left"
        >
            <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0",
                checked ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]" : "border-[var(--border-default)]"
            )}>
                {checked && <Check size={14} className="text-white" />}
            </div>
            <div>
                <div className={cn(
                    "text-base font-semibold font-sans transition-all",
                    checked ? "text-[var(--text-disabled)] line-through opacity-50" : "text-[var(--text-main)]"
                )}>
                    {label}
                </div>
                {sub && !checked && <div className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-widest mt-1">{sub}</div>}
            </div>
        </button>
    );
}

export function WitnessAndRelease({ 
    data, 
    onComplete, 
    onTabChange, 
    onHoopComplete,
    onBackStep 
}: WitnessAndReleaseProps) {
    const [tab, setTab] = useState<TabId>("witness");
    const voiceEnabled = useVoiceEnabled();
    const { status: voiceStatus, category: voiceCategory } = useVoiceStatus();
    const isVoiceGuidancePlaying = voiceStatus === 'playing' && voiceCategory === 'tts';
    const [hoopRunning, setHoopRunning] = useState(false);
    const [hoopTime, setHoopTime] = useState(60);
    const [hoopPhase, setHoopPhase] = useState(0);
    const [hoopDone, setHoopDone] = useState(false);
    const [checks, setChecks] = useState({ witnessed: false, truth: false, gratitude: false, reflection: false });
    const [showGratitude, setShowGratitude] = useState(false);
    const [reflection, setReflection] = useState("");
    const timerRef = useRef<any | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            // Stop practice music on unmount
            VoiceService.stopMusic();
        };
    }, []);

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
        // Stop any voice guidance that may be auto-playing — no overlap with the meditation
        VoiceService.stop();

        setHoopRunning(true);
        setHoopTime(60);
        setHoopDone(false);

        // Play the new dedicated meditation audio from Firebase Storage
        // gs://awakened-path-2026.firebasestorage.app/AboutJournal/MeditationJournal/sorryForgivemeThankyou.mp3
        const meditationUrl = 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/AboutJournal%2FMeditationJournal%2FsorryForgivemeThankyou.mp3?alt=media';
        VoiceService.playAudioURL(meditationUrl, {
            category: 'music',
            loop: true,
            trackId: 'hoop_meditation'
        });

        for (const h of HOOP) {
            // Check if we were cancelled
            if (timerRef.current === null && !hoopRunning) break; 
            await VoiceService.speak(h.speak);
            // Wait for 15 seconds (voice speak takes ~1.5s, remaining ~13.5s is silence/music)
            await new Promise(r => setTimeout(r, 15000));
        }
    };

    const toggle = (k: keyof typeof checks) => {
        setChecks(c => ({ ...c, [k]: !c[k] }));
        if (k === "gratitude") setShowGratitude(v => !v);
    };

    const handleBack = () => {
        if (tabIdx === 0) {
            onBackStep?.();
        } else {
            handleTabChange(TABS[tabIdx - 1].id);
        }
    };

    const allDone = Object.values(checks).every(Boolean);

    return (
        <div className="w-full max-w-5xl mx-auto py-4">
            <div className="relative">
                <div className="py-6 sm:py-10">

                    {/* ── Tab Navigation ── */}
                    <div className="flex overflow-x-auto no-scrollbar mb-10 pb-2 px-2 justify-between sm:justify-center sm:gap-6">
                        {TABS.map((t, i) => {
                            const active = tab === t.id;
                            const past = i < tabIdx;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => handleTabChange(t.id)}
                                    className="flex-none py-2 px-3 relative transition-all duration-300"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500",
                                            active
                                                ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white"
                                                : past
                                                ? "bg-[var(--accent-primary-dim)] border-[var(--accent-primary)] text-[var(--accent-primary)]"
                                                : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                                        )}>
                                            <span className={active ? 'font-black' : 'font-semibold'}>{t.icon}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
                                            active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] opacity-60"
                                        )}>{t.label}</span>
                                    </div>
                                    {active && (
                                        <motion.div
                                            layoutId="tabLinePulse"
                                            className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[var(--accent-primary)] rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                            className="px-2 sm:px-4"
                        >

                            {/* ─── TAB 1: OBSERVE ─── */}
                            {tab === "witness" && (
                                <div className="space-y-8 text-center">
                                    <div className="space-y-3">
                                        <h3 className="font-sans font-bold text-2xl text-[var(--text-main)] leading-tight">
                                            Step Back &amp; Observe
                                        </h3>
                                        <p className="text-[var(--text-muted)] text-base font-sans max-w-xl mx-auto leading-relaxed">
                                            You are not this thought. You are the one who noticed it.
                                            Simply read it, breathe, and observe it without judgment.
                                        </p>
                                    </div>

                                    <div className="relative p-8 rounded-[24px] text-left"
                                        style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)' }}>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--text-muted)' }}>
                                            Your thought
                                        </p>
                                        <p className="font-sans text-xl font-semibold text-[var(--text-main)] leading-snug">
                                            "{data.thought}"
                                        </p>
                                        {data.emotions.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {data.emotions.map(e => (
                                                    <span key={e} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                                                        {e}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => toggle("witnessed")}
                                        className={cn(
                                            "px-12 py-4 rounded-full text-sm font-bold uppercase tracking-[0.2em] transition-all duration-400 border-2",
                                            checks.witnessed
                                                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                                                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-main)]"
                                        )}
                                    >
                                        {checks.witnessed ? "✓ I've observed this thought" : "I see this thought clearly"}
                                    </button>
                                </div>
                            )}

                            {/* ─── TAB 2: QUESTION ─── */}
                            {tab === "truth" && (
                                <div className="space-y-8 text-center">
                                    <div className="space-y-3">
                                        <h3 className="font-sans font-bold text-2xl text-[var(--text-main)] leading-tight">
                                            Is This Really True?
                                        </h3>
                                        <p className="text-[var(--text-muted)] text-base font-sans max-w-xl mx-auto leading-relaxed">
                                            Even strong thoughts aren't always true. 
                                            Look at the pattern below and pause. 
                                            Could there be a kinder, truer way to see this?
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                        <div className="p-6 rounded-[20px]"
                                            style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)' }}>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2 text-rose-400">
                                                Old Thought Pattern
                                            </p>
                                            <p className="font-sans text-lg font-semibold text-[var(--text-main)]">
                                                ✦ {data.distortion}
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                                                This is just an old mental habit, not a fact about you.
                                            </p>
                                        </div>

                                        <div className="p-6 rounded-[20px]"
                                            style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)' }}>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--accent-secondary)' }}>
                                                A Wiser Truth
                                            </p>
                                            <p className="font-sans text-base font-medium text-[var(--text-main)] leading-relaxed">
                                                "You have the power to stop believing thoughts that make you feel small."
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggle("truth")}
                                        className={cn(
                                            "px-12 py-4 rounded-full text-sm font-bold uppercase tracking-[0.2em] transition-all duration-400 border-2",
                                            checks.truth
                                                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                                                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-main)]"
                                        )}
                                    >
                                        {checks.truth ? "✓ I am questioning this" : "I'm ready to consider a new truth"}
                                    </button>
                                </div>
                            )}

                            {/* ─── TAB 3: REFLECT ─── */}
                            {tab === "perspective" && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-3">
                                        <h3 className="font-sans font-bold text-2xl text-[var(--text-main)] leading-tight">
                                            The Two Voices
                                        </h3>
                                        <p className="text-[var(--text-muted)] text-base font-sans max-w-xl mx-auto leading-relaxed">
                                            One voice comes from fear (our old wounds), the other comes from love (our true self). 
                                            Which one do you want to listen to?
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 rounded-[20px] text-center"
                                            style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)' }}>
                                            <div className="text-3xl mb-3">🌑</div>
                                            <h4 className="font-sans text-base font-bold mb-3 text-rose-400 uppercase tracking-widest">
                                                Fear / Ego
                                            </h4>
                                            <p className="text-[11px] text-[var(--text-muted)] mb-4 italic">How we react when we feel hurt</p>
                                            <ul className="space-y-3 text-left">
                                                {FEAR_TRAITS.map(t => (
                                                    <li key={t} className="text-sm text-[var(--text-muted)] font-sans pb-2 border-b last:border-0"
                                                        style={{ borderColor: 'var(--border-subtle)' }}>
                                                        {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-6 rounded-[20px] text-center"
                                            style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--accent-primary)30' }}>
                                            <div className="text-3xl mb-3">✦</div>
                                            <h4 className="font-sans text-base font-bold mb-3 text-[var(--accent-primary)] uppercase tracking-widest">
                                                Love / Presence
                                            </h4>
                                            <p className="text-[11px] text-[var(--text-muted)] mb-4 italic">How we respond when we are calm</p>
                                            <ul className="space-y-3 text-left">
                                                {LOVE_TRAITS.map(t => (
                                                    <li key={t} className="text-sm font-semibold font-sans pb-2 border-b last:border-0"
                                                        style={{ color: 'var(--text-main)', borderColor: 'var(--border-subtle)' }}>
                                                        {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="text-center pt-2">
                                        <button 
                                            onClick={() => handleTabChange("release")}
                                            className="px-10 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-main)]"
                                        >
                                            Next: Begin Release →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ─── TAB 4: RELEASE ─── */}
                            {tab === "release" && (
                                <div className="space-y-8 text-center">
                                    <div className="space-y-3">
                                        <h3 className="font-sans font-bold text-2xl text-[var(--text-main)] leading-tight">
                                            Release Practice
                                        </h3>
                                        <p className="text-[var(--text-muted)] text-base font-sans max-w-xl mx-auto leading-relaxed">
                                            Silently repeat these four phrases to yourself.
                                            Each one helps dissolve the tension in this thought.
                                            Press "Begin" and breathe slowly for one minute.
                                        </p>
                                        {/* Pause voice guidance if it's auto-playing on this screen */}
                                        {isVoiceGuidancePlaying && (
                                            <motion.button
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={() => VoiceService.pause()}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
                                                style={{ background: 'var(--accent-primary)', color: 'var(--bg-base)' }}
                                            >
                                                ⏸ Pause Voice Guidance
                                            </motion.button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {HOOP.map((h, i) => {
                                            const isActive = (hoopRunning && hoopPhase === i) || hoopDone;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        scale: isActive ? 1.03 : 1,
                                                    }}
                                                    className="p-5 rounded-[20px] border text-left transition-all duration-500"
                                                    style={{
                                                        background: isActive ? 'var(--bg-input)' : 'var(--bg-surface)',
                                                        borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
                                                    }}
                                                >
                                                    <div className={cn("text-2xl mb-2 transition-all duration-500", !isActive && "opacity-40")}>
                                                        {h.icon}
                                                    </div>
                                                    <div className="font-sans text-base font-semibold text-[var(--text-main)]">{h.phrase}</div>
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--accent-primary)', opacity: 0.8 }}>{h.note}</div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Timer and CTA */}
                                    <div className="flex flex-col items-center gap-6 pt-2">
                                        <div className="relative w-36 h-36 flex items-center justify-center">
                                            <svg width="144" height="144" viewBox="0 0 100 100" className="-rotate-90">
                                                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border-subtle)" strokeWidth="5" />
                                                <motion.circle
                                                    cx="50" cy="50" r="44" fill="none"
                                                    stroke="var(--accent-primary)" strokeWidth="5"
                                                    strokeLinecap="round"
                                                    strokeDasharray={276}
                                                    strokeDashoffset={276 * (1 - hoopTime / 60)}
                                                    className="transition-all duration-1000 ease-linear"
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="font-sans text-2xl font-bold text-[var(--text-main)]">
                                                    {Math.floor(hoopTime / 60)}:{(hoopTime % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                        </div>

                                        <AnchorButton
                                            onClick={startHoop}
                                            disabled={hoopRunning}
                                            variant="solid"
                                            className="w-full sm:w-[240px]"
                                        >
                                            {hoopRunning ? (
                                                <span className="flex items-center gap-2 justify-center">
                                                    <span className="animate-spin text-sm">⏳</span> Breathing...
                                                </span>
                                            ) : hoopDone ? 'Repeat Practice' : 'Begin Practice ✨'}
                                        </AnchorButton>

                                        {!voiceEnabled && !hoopRunning && (
                                            <p className="text-[10px] text-[var(--text-muted)] italic opacity-60">
                                                Note: Voice guidance will be auto-enabled for this guided session.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─── TAB 5: CLOSE ─── */}
                            {tab === "close" && (
                                <div className="space-y-8 max-w-2xl mx-auto">
                                    <div className="space-y-3 text-center">
                                        <h3 className="font-sans font-bold text-2xl text-[var(--text-main)] leading-tight">
                                            Final Reflection
                                        </h3>
                                        <p className="text-[var(--text-muted)] text-base font-sans leading-relaxed">
                                            What did you learn or notice during this session?
                                            Write a few words, then tick all items to seal your entry.
                                        </p>
                                    </div>

                                    <textarea
                                        value={reflection}
                                        onChange={e => {
                                            setReflection(e.target.value);
                                            if (e.target.value.length > 0) setChecks(c => ({ ...c, reflection: true }));
                                        }}
                                        placeholder="What did you notice or learn today..."
                                        className="w-full h-36 p-5 rounded-[20px] font-sans text-base text-[var(--text-main)] resize-none outline-none transition-all duration-300"
                                        style={{
                                            background: 'var(--bg-input)',
                                            border: '1.5px solid var(--border-subtle)',
                                        }}
                                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                                    />

                                    {/* Checklist */}
                                    <div className="rounded-[20px] overflow-hidden divide-y"
                                        style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)' }}>
                                        <CheckItem checked={checks.witnessed} onToggle={() => toggle("witnessed")} label="I stepped back and observed the thought" />
                                        <CheckItem checked={checks.truth} onToggle={() => toggle("truth")} label="I questioned whether the thought was true" />
                                        <CheckItem checked={checks.gratitude} onToggle={() => toggle("gratitude")} label="I found something to be grateful for" sub="Show prompts" />
                                        <AnimatePresence>
                                            {showGratitude && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="py-4 px-6 space-y-3" style={{ background: 'var(--bg-input)' }}>
                                                        {GRATITUDE_PROMPTS.map((p, i) => (
                                                            <div key={i} className="text-sm text-[var(--text-muted)] font-sans leading-relaxed pl-4 border-l-2 border-[var(--accent-primary)]"
                                                                style={{ opacity: 0.8 }}>{p}</div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Seal Entry Button — Always visible but disabled until ready */}
                                    <div className="pt-4">
                                        <button
                                            onClick={() => allDone && onComplete(reflection)}
                                            disabled={!allDone}
                                            className={cn(
                                                "w-full py-5 rounded-[24px] font-bold uppercase tracking-[0.3em] text-sm transition-all duration-400",
                                                allDone 
                                                    ? "bg-[var(--accent-primary)] text-white hover:scale-[1.02] active:scale-[0.98]" 
                                                    : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-disabled)] cursor-not-allowed"
                                            )}
                                        >
                                            {allDone ? "Seal this Entry ✦" : "Finish the checklist above to seal"}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Footer navigation ── */}
                <div className="px-2 py-8 flex items-center justify-between border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                        onClick={handleBack}
                        className="px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300"
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1.5px solid var(--border-default)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        ← Back
                    </button>

                    {/* Dot indicators */}
                    <div className="flex gap-2">
                        {TABS.map((t, i) => (
                            <div key={t.id} className={cn(
                                "h-1.5 rounded-full transition-all duration-500",
                                i === tabIdx ? "w-10 bg-[var(--accent-primary)]" : "w-3"
                            )}
                            style={{ background: i === tabIdx ? 'var(--accent-primary)' : 'var(--border-subtle)' }} />
                        ))}
                    </div>

                    {tabIdx < TABS.length - 1 ? (
                        <button
                            onClick={() => handleTabChange(TABS[tabIdx + 1].id)}
                            className="px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300"
                            style={{
                                background: 'var(--accent-primary)',
                                color: '#fff',
                            }}
                        >
                            Next →
                        </button>
                    ) : (
                        <div className="w-[100px]" />
                    )}
                </div>
            </div>
        </div>
    );
}
