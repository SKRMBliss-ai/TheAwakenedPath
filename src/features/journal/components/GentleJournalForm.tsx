import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Volume2, VolumeX } from "lucide-react";
import { BodyMapSelector } from "./BodyMapSelector";
import { WitnessAndRelease } from "./WitnessAndRelease";
import { useJournalVoice } from "../hooks/useJournalVoice";
import { ThoughtFeelingSelector } from "./ThoughtFeelingSelector";
import { FELT_EXPERIENCES } from "../../../data/feltExperiences";
import { getDailyQuote } from "../../../data/dailyQuotes";
import { cn } from "../../../lib/utils";

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────

const fadeUp: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

const stagger: any = {
    visible: { transition: { staggerChildren: 0.05 } },
};

const STEPS = [
    { label: "Mind" },
    { label: "Body" },
    { label: "Witness" },
];

// ─── COMPACT HEADER BAR ──────────────────────────────────────────────────────
// Docks: [step tracker] ─── center ─── [voice toggle] into one horizontal bar.
// Replaces the 6-item vertical stack that was: title → subtitle → download → 
// step circles → voice status → heading.

function JournalHeader({ 
    currentStep, 
    voiceEnabled, 
    isPlaying, 
    isLoading, 
    onToggleVoice, 
    onStopVoice,
    showVoiceTip,
    onDismissTip 
}: {
    currentStep: number;
    voiceEnabled: boolean;
    isPlaying: boolean;
    isLoading: boolean;
    onToggleVoice: () => void;
    onStopVoice: () => void;
    showVoiceTip: boolean;
    onDismissTip: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 px-1">
            {/* Step progress — left-aligned, compact */}
            <div className="flex items-center gap-1">
                {STEPS.map((step, i) => {
                    const isActive = i === currentStep;
                    const isDone = i < currentStep;
                    return (
                        <React.Fragment key={i}>
                            {i > 0 && (
                                <div 
                                    className="h-px transition-all duration-500"
                                    style={{ 
                                        width: 20,
                                        background: isDone 
                                            ? 'var(--accent-primary)' 
                                            : 'var(--border-subtle)',
                                        opacity: isDone ? 0.5 : 0.3,
                                    }} 
                                />
                            )}
                            <div className="flex items-center gap-1.5">
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1 : 0.85,
                                        backgroundColor: isDone 
                                            ? 'var(--accent-primary)' 
                                            : isActive 
                                                ? 'var(--accent-primary)' 
                                                : 'rgba(0,0,0,0)',
                                        borderColor: isDone || isActive 
                                            ? 'var(--accent-primary)' 
                                            : 'var(--border-default)',
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="flex items-center justify-center rounded-full border-[1.5px]"
                                    style={{ width: 18, height: 18 }}
                                >
                                    {isDone ? (
                                        <span className="text-[8px] text-white font-bold">✓</span>
                                    ) : (
                                        <span className={cn(
                                            "text-[8px] font-bold",
                                            isActive ? "text-white" : "text-[var(--text-muted)]"
                                        )}>{i + 1}</span>
                                    )}
                                </motion.div>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-[0.15em] transition-all duration-300 hidden sm:block",
                                    isActive 
                                        ? "text-[var(--accent-primary)] opacity-100" 
                                        : isDone 
                                            ? "text-[var(--text-muted)] opacity-50"
                                            : "text-[var(--text-muted)] opacity-30"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Voice control — right-aligned */}
            <div className="relative flex items-center gap-2">
                {/* First-time tooltip */}
                <AnimatePresence>
                    {showVoiceTip && (
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="absolute right-0 top-full mt-2 z-50"
                            style={{ width: 'max-content', maxWidth: 220 }}
                        >
                            <div 
                                className="relative px-3 py-2 rounded-xl text-[11px] leading-relaxed shadow-lg"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--accent-secondary-border)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                {/* Arrow */}
                                <div 
                                    className="absolute -top-[5px] right-4 w-2.5 h-2.5 rotate-45"
                                    style={{ 
                                        background: 'var(--bg-surface)',
                                        borderTop: '1px solid var(--accent-secondary-border)',
                                        borderLeft: '1px solid var(--accent-secondary-border)',
                                    }} 
                                />
                                <p className="font-serif italic">
                                    <span style={{ color: 'var(--accent-secondary)' }}>Voice guidance is on.</span>
                                    {' '}Tap here to turn it off anytime.
                                </p>
                                <button 
                                    onClick={onDismissTip}
                                    className="mt-1.5 text-[9px] font-bold uppercase tracking-wider"
                                    style={{ 
                                        color: 'var(--accent-secondary)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                    }}
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Voice status indicator */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                        >
                            <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[10px] italic text-[var(--text-muted)] font-serif hidden sm:block">
                                Preparing...
                            </span>
                        </motion.div>
                    ) : isPlaying ? (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                            style={{ 
                                background: 'var(--accent-secondary-dim)', 
                                border: '1px solid var(--accent-secondary-border)' 
                            }}
                        >
                            {/* Mini equalizer bars */}
                            <div className="flex items-center gap-[2px]">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ scaleY: [0.3, 1, 0.3] }}
                                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                                        style={{ 
                                            width: 2, height: 10, borderRadius: 1,
                                            background: 'var(--accent-secondary)',
                                            opacity: 0.7,
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] italic font-serif hidden sm:block"
                                style={{ color: 'var(--accent-secondary)' }}>
                                Guiding...
                            </span>
                            <button
                                onClick={onStopVoice}
                                className="w-5 h-5 rounded-full flex items-center justify-center ml-0.5
                                    transition-all active:scale-90"
                                style={{ 
                                    background: 'var(--accent-secondary-muted)',
                                    border: '1px solid var(--accent-secondary-border)',
                                    color: 'var(--accent-secondary)',
                                }}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Voice toggle switch */}
                <button
                    onClick={onToggleVoice}
                    className={cn(
                        "group relative h-9 px-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300",
                        voiceEnabled
                            ? "bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary-border)] text-[var(--accent-secondary)]"
                            : "bg-[var(--bg-surface-hover)] border border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                    style={{ cursor: 'pointer' }}
                    aria-label={voiceEnabled ? "Turn voice off" : "Turn voice on"}
                >
                    {voiceEnabled ? (
                        <>
                            <Volume2 className="w-4 h-4" />
                            <span className="text-[9px] font-bold uppercase tracking-widest leading-none mt-[1px]">Auto Voice: On</span>
                        </>
                    ) : (
                        <>
                            <VolumeX className="w-4 h-4" />
                            <span className="text-[9px] font-bold uppercase tracking-widest leading-none mt-[1px]">Auto Voice: Off</span>
                        </>
                    )}
                    
                    {/* Hover Tooltip */}
                    <div 
                        className="absolute right-0 top-full mt-2 w-max max-w-[200px] px-3 py-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] shadow-[0_4px_20px_rgba(0,0,0,0.15)] pointer-events-none"
                        style={{ 
                            background: 'var(--bg-secondary)', 
                            border: '1px solid var(--border-default)',
                            backdropFilter: 'blur(12px)'
                        }}
                    >
                        {/* Little triangle arrow pointing up */}
                        <div 
                            className="absolute -top-[5px] right-[24px] w-2.5 h-2.5 rotate-45"
                            style={{ 
                                background: 'var(--bg-surface)',
                                borderTop: '1px solid var(--border-subtle)',
                                borderLeft: '1px solid var(--border-subtle)',
                            }} 
                        />
                        <div className="relative z-10 text-[11px] font-medium tracking-wide text-left">
                            {voiceEnabled ? (
                                "Voice Guidance is ON"
                            ) : (
                                <div className="flex flex-col gap-1 w-[150px] whitespace-normal">
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Voice Guidance is OFF</span>
                                    <span style={{ fontSize: 9.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                        It will remain paused on future visits until you decide to turn it back on.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}


// ─── TEXT AREA ────────────────────────────────────────────────────────────────

function GentleTextarea({ label, placeholder, value, onChange, hint }: { 
    label: string; placeholder: string; value: string; onChange: (v: string) => void; hint?: string 
}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = Math.max(100, ref.current.scrollHeight) + "px";
        }
    }, [value]);

    return (
        <motion.div variants={fadeUp} className="space-y-2">
            {label && (
                <label style={{ 
                    display: "block", fontSize: 16, color: "var(--text-primary)", 
                    fontFamily: "var(--font-serif)", lineHeight: 1.4 
                }}>
                    {label}
                </label>
            )}
            {hint && (
                <p style={{ 
                    fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", 
                    lineHeight: 1.5, fontWeight: 400 
                }}>
                    {hint}
                </p>
            )}
            <textarea
                ref={ref} value={value} onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder} rows={3}
                style={{
                    width: "100%", minHeight: 100, padding: "16px 20px", fontSize: 16, lineHeight: 1.7,
                    fontFamily: "var(--font-serif)", color: "var(--text-primary)", 
                    background: "var(--bg-input, var(--bg-surface))",
                    border: "1.5px solid var(--border-default)", borderRadius: 16, outline: "none", 
                    resize: "none", transition: "border-color 0.3s, background 0.3s",
                }}
                onFocus={(e) => { 
                    e.target.style.borderColor = "var(--accent-primary)"; 
                    e.target.style.background = "var(--bg-input-focus, var(--bg-surface-hover))"; 
                }}
                onBlur={(e) => { 
                    e.target.style.borderColor = "var(--border-default)"; 
                    e.target.style.background = "var(--bg-input, var(--bg-surface))"; 
                }}
                className="placeholder:text-[var(--text-secondary)] placeholder:opacity-60"
            />
        </motion.div>
    );
}


// ─── NAV BUTTON ──────────────────────────────────────────────────────────────

function NavButton({ children, onClick, variant = "next", disabled = false }: { 
    children: React.ReactNode; onClick: () => void; variant?: "next" | "back" | "save"; disabled?: boolean 
}) {
    const styles = {
        next: {
            bg: "var(--accent-primary-dim)",
            border: "var(--accent-primary-border)",
            color: "var(--accent-primary)",
            hoverBg: "var(--nav-active-bg)"
        },
        back: {
            bg: "var(--bg-surface)",
            border: "var(--border-default)",
            color: "var(--text-secondary)",
            hoverBg: "var(--bg-surface-hover)"
        },
        save: {
            bg: "var(--accent-secondary-dim)",
            border: "var(--accent-secondary-border)",
            color: "var(--accent-secondary)",
            hoverBg: "var(--accent-secondary-muted)"
        },
    }[variant];
    return (
        <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled}
            style={{
                padding: "14px 28px", borderRadius: 14, fontSize: 14, fontWeight: 600, 
                letterSpacing: "0.04em",
                background: disabled ? "var(--bg-surface)" : styles.bg, 
                border: `1.5px solid ${disabled ? "var(--border-subtle)" : styles.border}`,
                color: disabled ? "var(--text-disabled)" : styles.color, 
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.3s ease", minHeight: 50, minWidth: 100,
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = styles.hoverBg; }}
            onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = styles.bg; }}
        >
            {children}
        </motion.button>
    );
}


// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function GentleJournalForm({ onSave, onCancel, initialData }: { 
    onSave: (data: any) => void; onCancel: () => void; initialData?: any 
}) {
    const [step, setStep] = useState(0);
    const voice = useJournalVoice();

    // Voice is ON by default — show first-time tip
    const [showVoiceTip, setShowVoiceTip] = useState(false);

    useEffect(() => {
        // Enable voice by default on mount
        if (!voice.voiceEnabled) {
            voice.toggleVoice();
        }
        // Show tooltip after a short delay (let UI settle)
        const tipSeen = localStorage?.getItem?.('awakened-voice-tip-seen');
        if (!tipSeen) {
            const timer = setTimeout(() => setShowVoiceTip(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    // Auto-dismiss tip after 6 seconds
    useEffect(() => {
        if (showVoiceTip) {
            const timer = setTimeout(() => {
                setShowVoiceTip(false);
                try { localStorage?.setItem?.('awakened-voice-tip-seen', 'true'); } catch {}
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [showVoiceTip]);

    const dismissTip = () => {
        setShowVoiceTip(false);
        try { localStorage?.setItem?.('awakened-voice-tip-seen', 'true'); } catch {}
    };

    const [selectedThoughts, setSelectedThoughts] = useState<string[]>(
        initialData?.thoughts ? initialData.thoughts.split(' | ').filter(Boolean) : []
    );
    const [customThought, setCustomThought] = useState(initialData?.customThought || "");
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
        initialData?.emotions ? initialData.emotions.split(', ') : []
    );
    const [selectedArea, setSelectedArea] = useState<any>(
        initialData?.bodyArea ? { label: initialData.bodyArea } : null
    );
    const [bodySensations, setBodySensations] = useState(initialData?.bodySensations || "");
    const [openReflection, setOpenReflection] = useState(initialData?.reflections || "");
    const [cognitiveDistortion, setCognitiveDistortion] = useState(initialData?.cognitiveDistortion || "");

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const [showNextPrompt, setShowNextPrompt] = useState(false);
    useEffect(() => { setShowNextPrompt(false); }, [step]);

    const handleWitnessTabChange = (tabId: string) => {
        if (!voice.voiceEnabled) return;
        const t = [...selectedThoughts, customThought].filter(Boolean).join("... and... ");
        const e = selectedEmotions.join("... ");
        const body = selectedArea?.label || bodySensations || "part of your body";

        const tabScripts: Record<string, string> = {
            witness: `Now... step back. ... A thought arose... "${t}" ... Which created a feeling of... ${e}. ... Which you felt in your... ${body}. ... But notice something... ... You are not the thought. You are not the emotion. You are not the sensation. ... You... are the one... who was watching them happen. ... That awareness... that witnessing presence... that is who you truly are.`,
            truth: "Now... let's bring in the light of truth. ... Thoughts are not facts. ... Read this antidote to yourself. ... How does it feel to hear a truer... kinder story?",
            perspective: "Notice where this thought is coming from. ... Is it from the fearful ego... or from your true being? ... Remind yourself... you are not the fear. You are the awareness witnessing it.",
            release: "Let's practice a moment of deep release. ... Silently repeat these phrases... and let each one dissolve a layer of resistance. ... Click 'Begin' when you're ready.",
            close: "As we close this practice... take a final moment to reflect. ... What have you learned about yourself? ... Complete the checklist to seal this entry.",
        };
        if (tabScripts[tabId]) voice.speak(tabScripts[tabId]);
    };

    // Voice narration per step
    useEffect(() => {
        if (!voice.voiceEnabled) return;
        const intros: Record<number, { text: string; key: string }> = {
            0: {
                text: "Take a moment... and notice what's been on your mind today. ... Sometimes thoughts come as quiet whispers... sometimes they feel loud and heavy. ... If anything below feels familiar... simply tap the one that resonates.",
                key: "step-0-intro"
            },
            1: {
                text: "Emotions are energy in motion... and that energy always lands somewhere in the body. ... If you can... close your eyes for a moment. ... Take one slow breath. ... Now notice... where in your body do you feel it? ... Tap the area that draws your attention.",
                key: "step-1-intro"
            }
        };
        if (intros[step]) {
            voice.speak(intros[step].text);
        } else if (step === 2) {
            handleWitnessTabChange("witness");
        } else if (step === 5) {
            voice.speak("Your reflection has been saved. ... By watching the thought... feeling the emotion... and noticing the body... you have already begun to dissolve the pattern.");
        }
    }, [step, voice.voiceEnabled]);

    const showScrollPrompt = () => {
        setTimeout(() => {
            setShowNextPrompt(true);
        }, 2000);
    };

    const handleSelectionChange = (thoughts: string[], emotions: string[]) => {
        const newThoughts = thoughts.filter(t => !selectedThoughts.includes(t));
        setSelectedThoughts(thoughts);
        setSelectedEmotions(emotions);

        const match = FELT_EXPERIENCES.find(fe => fe.thoughts.some(t => thoughts.includes(t)));
        if (match) setCognitiveDistortion(match.cognitiveDistortion);

        if (newThoughts.length > 0) {
            showScrollPrompt();
            voice.speak(`I see... "${newThoughts[0]}". ... That's a thought many of us carry. Notice the feelings it creates inside you.`);
        } else if (thoughts.length > selectedThoughts.length) {
            showScrollPrompt();
        }
    };

    const handleSelectArea = (area: any) => {
        setSelectedArea(area);
        if (area) showScrollPrompt();
    };

    const handleSave = (reflection?: string) => {
        const thoughtsStr = [...selectedThoughts, customThought].filter(Boolean).join(' | ');
        onSave({
            thoughts: thoughtsStr,
            emotions: selectedEmotions.join(', '),
            bodyArea: selectedArea?.label || "",
            bodySensations,
            cognitiveDistortion,
            reflections: reflection || openReflection,
        });
        setStep(5);
    };

    return (
        <div ref={scrollRef} className="w-full h-full" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            <div className="relative z-10 w-full max-w-4xl mx-auto pb-4 px-4 sm:px-6">

                {/* ═══ HEADER BAR — compact, docked ═══ */}
                {step < 5 && (
                    <JournalHeader
                        currentStep={step}
                        voiceEnabled={voice.voiceEnabled}
                        isPlaying={voice.isPlaying}
                        isLoading={voice.isLoading}
                        onToggleVoice={voice.toggleVoice}
                        onStopVoice={voice.stop}
                        showVoiceTip={showVoiceTip}
                        onDismissTip={dismissTip}
                    />
                )}

                {/* ═══ STEP CONTENT ═══ */}
                <div className="mt-2">
                    <AnimatePresence mode="wait">

                        {/* ═══ STEP 0: THOUGHTS ═══ */}
                        {step === 0 && (
                            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                                
                                {/* Step heading + quote — composed together */}
                                <div className="space-y-4 mb-6">
                                    <motion.h2 
                                        variants={fadeUp}
                                        className="text-center"
                                        style={{ 
                                            fontSize: 'clamp(22px, 3.5vw, 30px)', 
                                            fontFamily: "'Georgia', serif", 
                                            color: "var(--text-primary)",
                                            fontWeight: 400,
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        What's on your mind?
                                    </motion.h2>

                                    {/* Quote — compact, elegant */}
                                    <motion.div
                                        variants={fadeUp}
                                        className="flex gap-3 items-start max-w-lg mx-auto"
                                    >
                                        <div 
                                            className="w-[2px] self-stretch rounded-full flex-shrink-0 mt-0.5"
                                            style={{ background: 'var(--accent-primary)', opacity: 0.25 }}
                                        />
                                        <div>
                                            <p style={{
                                                fontSize: 14,
                                                color: "var(--text-secondary)",
                                                fontStyle: "italic",
                                                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                                                lineHeight: 1.55,
                                                opacity: 0.85,
                                            }}>
                                                "{getDailyQuote().text}"
                                            </p>
                                            <p style={{
                                                fontSize: 10,
                                                color: "var(--text-muted)",
                                                letterSpacing: "0.12em",
                                                textTransform: "uppercase",
                                                fontWeight: 600,
                                                marginTop: 4,
                                                fontFamily: "system-ui, sans-serif",
                                            }}>
                                                {getDailyQuote().author}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Thought selection */}
                                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p style={{ fontSize: 14, color: "var(--text-primary)", fontFamily: "'Georgia', serif" }}>
                                            Did any of these come up?
                                        </p>
                                        <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                                            Tap all that resonate
                                        </p>
                                    </div>
                                    <ThoughtFeelingSelector
                                        selectedThoughts={selectedThoughts}
                                        onSelectionChange={handleSelectionChange}
                                    />
                                </motion.div>

                                {/* Custom thought */}
                                <motion.div variants={fadeUp} className="mt-5">
                                    <GentleTextarea 
                                        label="Or in your own words:" 
                                        placeholder="What was the thought? What triggered it?" 
                                        value={customThought} 
                                        onChange={setCustomThought} 
                                    />
                                </motion.div>

                                {/* Nav */}
                                <div ref={bottomRef} className="flex flex-col gap-4 pt-6">
                                    <AnimatePresence>
                                        {showNextPrompt && (
                                            <motion.p 
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="text-center text-[12px] italic"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                Scroll down to continue ↓
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex justify-between">
                                        <NavButton onClick={onCancel} variant="back">Cancel</NavButton>
                                        <NavButton onClick={() => setStep(1)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 1: BODY ═══ */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <motion.div variants={fadeUp} className="text-center space-y-1">
                                    <h2 style={{ 
                                        fontSize: 'clamp(22px, 3.5vw, 30px)', 
                                        fontFamily: "'Georgia', serif", 
                                        color: "var(--text-primary)", fontWeight: 400 
                                    }}>
                                        Where do you feel it?
                                    </h2>
                                    <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "'Georgia', serif" }}>
                                        Emotion is energy in motion. It always lands somewhere physical.
                                    </p>
                                </motion.div>

                                {/* Emotion pills */}
                                {selectedEmotions.length > 0 && (
                                    <motion.div variants={fadeUp} className="flex flex-wrap gap-1.5 justify-center">
                                        {selectedEmotions.map(e => (
                                            <span key={e} style={{ 
                                                padding: "4px 12px", borderRadius: 100, fontSize: 12,
                                                background: "var(--accent-secondary-muted)", 
                                                border: "1px solid var(--accent-secondary-border)", 
                                                color: "var(--accent-secondary)",
                                            }}>
                                                {e}
                                            </span>
                                        ))}
                                    </motion.div>
                                )}

                                <motion.div variants={fadeUp}>
                                    <BodyMapSelector selectedArea={selectedArea} onSelect={handleSelectArea} />
                                </motion.div>

                                <GentleTextarea
                                    label="Or describe it:"
                                    hint="Notice tension, warmth, tightness, heaviness, or lightness."
                                    placeholder="e.g., tightness in my shoulders..."
                                    value={bodySensations}
                                    onChange={setBodySensations}
                                />

                                <div ref={bottomRef} className="flex flex-col gap-4 pt-4">
                                    <AnimatePresence>
                                        {showNextPrompt && (
                                            <motion.p 
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="text-center text-[12px] italic"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                Scroll down to continue ↓
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex justify-between">
                                        <NavButton onClick={() => setStep(0)} variant="back">← Back</NavButton>
                                        <NavButton onClick={() => setStep(2)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 2: WITNESS ═══ */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <WitnessAndRelease
                                    data={{
                                        thought: [...selectedThoughts, customThought].filter(Boolean)[0] || "No thought selected",
                                        emotions: selectedEmotions,
                                        bodyArea: selectedArea?.label || bodySensations || "the body",
                                        distortion: cognitiveDistortion || "Hidden Pattern"
                                    }}
                                    onTabChange={handleWitnessTabChange}
                                    onComplete={(reflection) => {
                                        setOpenReflection(reflection);
                                        handleSave(reflection);
                                    }}
                                />
                                <div className="flex justify-between pt-4 opacity-50 hover:opacity-100 transition-opacity">
                                    <NavButton onClick={() => setStep(1)} variant="back">← Back</NavButton>
                                    <p className="text-[11px] text-[var(--text-muted)] italic font-serif py-4 max-w-[180px] text-right">
                                        Going back will reset your checklist
                                    </p>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
