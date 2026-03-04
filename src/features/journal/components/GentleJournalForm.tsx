import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AudioLines, X } from "lucide-react";
import { BodyMapSelector } from "./BodyMapSelector";
import { WitnessAndRelease } from "./WitnessAndRelease";
import { useJournalVoice } from "../hooks/useJournalVoice";
import { ThoughtFeelingSelector } from "./ThoughtFeelingSelector";
import { VoiceToggle } from "./VoiceToggle";
import { FELT_EXPERIENCES } from "../../../data/feltExperiences";
import { cn } from "../../../lib/utils";

// ─── ANIMATIONS & STYLES ─────────────────────────────────────────────────────

const fadeUp: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

const stagger: any = {
    visible: { transition: { staggerChildren: 0.05 } },
};

const STEPS = [
    { num: 1, label: "Thought/Feeling" },
    { num: 2, label: "Body" },
    { num: 3, label: "Witness" },
];

// ─── REUSABLE UI COMPONENTS ──────────────────────────────────────────────────

function StepTracker({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-10 py-10 relative">
            {/* Connecting Line */}
            <div className="absolute top-[48px] left-1/2 -translate-x-1/2 w-40 h-px bg-[var(--border-subtle)] opacity-40 transition-all duration-700" />

            {STEPS.map((step, i) => {
                const isActive = i === current;
                const isPast = i < current;
                return (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                        <motion.div
                            animate={{
                                scale: isActive ? 1.25 : 1,
                                backgroundColor: isActive ? 'var(--accent-primary)' : isPast ? 'var(--accent-primary-muted)' : 'var(--bg-surface)',
                                borderColor: isActive || isPast ? 'var(--accent-primary)' : 'var(--border-default)',
                                boxShadow: isActive ? '0 0 25px var(--accent-primary-glow)' : 'none'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500"
                        >
                            {isPast && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-[8px] text-white font-bold"
                                >✓</motion.span>
                            )}
                        </motion.div>
                        <span className={cn(
                            "text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-500",
                            isActive ? "opacity-100 text-[var(--accent-primary)] translate-y-0" : "opacity-40 text-[var(--text-muted)] translate-y-1"
                        )}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function GentleTextarea({ label, placeholder, value, onChange, hint }: { label: string, placeholder: string, value: string, onChange: (v: string) => void, hint?: string }) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = Math.max(120, ref.current.scrollHeight) + "px";
        }
    }, [value]);

    return (
        <motion.div variants={fadeUp} className="space-y-3">
            {label && <label style={{ display: "block", fontSize: 18, color: "var(--text-primary)", fontFamily: "var(--font-serif)", lineHeight: 1.4 }}>{label}</label>}
            {hint && <p style={{ fontSize: 14, color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.5, fontWeight: 500 }}>{hint}</p>}
            <textarea
                ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
                style={{
                    width: "100%", minHeight: 120, padding: "20px 24px", fontSize: 17, lineHeight: 1.7,
                    fontFamily: "var(--font-serif)", color: "var(--text-primary)", background: "var(--bg-input)",
                    border: "1.5px solid var(--border-default)", borderRadius: 20, outline: "none", resize: "none",
                    transition: "border-color 0.3s, background 0.3s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-primary)"; e.target.style.background = "var(--bg-input-focus)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; e.target.style.background = "var(--bg-input)"; }}
                className="placeholder:text-[var(--text-secondary)] placeholder:opacity-70"
            />
        </motion.div>
    );
}


function NavButton({ children, onClick, variant = "next", disabled = false }: { children: React.ReactNode, onClick: () => void, variant?: "next" | "back" | "save", disabled?: boolean }) {
    const s = {
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
                padding: "18px 36px", borderRadius: 16, fontSize: 16, fontWeight: 600, letterSpacing: "0.04em",
                background: disabled ? "var(--bg-surface)" : s.bg, border: `1.5px solid ${disabled ? "var(--border-subtle)" : s.border}`,
                color: disabled ? "var(--text-disabled)" : s.color, cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.3s ease", minHeight: 58, minWidth: 120,
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = s.hoverBg; }}
            onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = s.bg; }}
        >
            {children}
        </motion.button>
    );
}




// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function GentleJournalForm({ onSave, onCancel, initialData }: { onSave: (data: any) => void, onCancel: () => void, initialData?: any }) {
    const [step, setStep] = useState(0);
    const voice = useJournalVoice();

    const [selectedThoughts, setSelectedThoughts] = useState<string[]>(initialData?.thoughts ? initialData.thoughts.split(' | ').filter(Boolean) : []);
    const [customThought, setCustomThought] = useState(initialData?.customThought || "");
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>(initialData?.emotions ? initialData.emotions.split(', ') : []);
    const [selectedArea, setSelectedArea] = useState<any>(initialData?.bodyArea ? { label: initialData.bodyArea } : null);
    const [bodySensations, setBodySensations] = useState(initialData?.bodySensations || "");
    const [openReflection, setOpenReflection] = useState(initialData?.reflections || "");
    const [cognitiveDistortion, setCognitiveDistortion] = useState(initialData?.cognitiveDistortion || "");

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const [showNextPrompt, setShowNextPrompt] = useState(false);
    useEffect(() => {
        setShowNextPrompt(false);
    }, [step]);

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

        if (tabScripts[tabId]) {
            voice.speak(tabScripts[tabId]);
        }
    };

    // 🎙️ VOICE NARRATION SYSTEM
    useEffect(() => {
        if (!voice.voiceEnabled) return;

        // Static intros (cacheable)
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
            // Witness Step Start - initial tab is "witness"
            handleWitnessTabChange("witness");
        } else if (step === 5) {
            voice.speak("Your reflection has been saved. ... By watching the thought... feeling the emotion... and noticing the body... you have already begun to dissolve the pattern.");
        }
    }, [step, voice.voiceEnabled]);

    const scrollToBottom = () => {
        setTimeout(() => {
            setShowNextPrompt(true);
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }, 2000);
    };

    const handleSelectionChange = (thoughts: string[], emotions: string[]) => {
        const newThoughts = thoughts.filter(t => !selectedThoughts.includes(t));

        setSelectedThoughts(thoughts);
        setSelectedEmotions(emotions);

        // Find associated cognitive distortion from FELT_EXPERIENCES
        const firstMatchingExperience = FELT_EXPERIENCES.find(fe =>
            fe.thoughts.some(t => thoughts.includes(t))
        );
        if (firstMatchingExperience) {
            setCognitiveDistortion(firstMatchingExperience.cognitiveDistortion);
        }

        if (newThoughts.length > 0) {
            scrollToBottom();
            voice.speak(`I see... "${newThoughts[0]}". ... That's a thought many of us carry. Notice the feelings it creates inside you.`);
        } else if (thoughts.length > selectedThoughts.length) {
            scrollToBottom();
        }
    };

    const handleSelectArea = (area: any) => {
        setSelectedArea(area);
        if (area) scrollToBottom();
    };

    const handleSave = (reflection?: string) => {
        const thoughtsStr = [...selectedThoughts, customThought].filter(Boolean).join(' | ');
        onSave({
            thoughts: thoughtsStr,
            emotions: selectedEmotions.join(', '),
            bodyArea: selectedArea?.label || "",
            bodySensations: bodySensations,
            cognitiveDistortion: cognitiveDistortion,
            reflections: reflection || openReflection,
        });
        setStep(5);
    };

    return (
        <div ref={scrollRef} className="w-full h-full" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            <div className="relative z-10 w-full max-w-xl mx-auto pb-32 pt-8">
                {step < 5 && <StepTracker current={step} />}

                {/* 🎙️ Voice Status Indicators */}
                <div className="flex flex-col items-center justify-center mt-4 mb-6 min-h-[48px]">
                    <AnimatePresence mode="wait">
                        {voice.isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-4 p-2 pl-4 pr-3 border border-[var(--border-subtle)] rounded-full bg-[var(--bg-surface)] backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] italic font-serif">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Preparing voice guidance...</span>
                                </div>
                                <VoiceToggle
                                    enabled={voice.voiceEnabled}
                                    playing={false}
                                    loading={false}
                                    onToggle={voice.toggleVoice}
                                    className="scale-75"
                                />
                            </motion.div>
                        ) : voice.isPlaying ? (
                            <motion.div
                                key="playing"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--accent-secondary-dim)] p-2 pl-4 pr-2 rounded-full backdrop-blur-sm shadow-sm"
                            >
                                <div className="flex items-center gap-2 text-[12px] text-[var(--accent-secondary)] italic font-serif">
                                    <AudioLines className="w-4 h-4 animate-pulse" />
                                    <span>Guidance in flow...</span>
                                </div>
                                <button
                                    onClick={() => voice.stop()}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary-border)] text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary-muted)] transition-all active:scale-90 shadow-sm"
                                    aria-label="Stop guidance"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <VoiceToggle
                                    enabled={voice.voiceEnabled}
                                    playing={false}
                                    loading={false}
                                    onToggle={voice.toggleVoice}
                                    className="scale-90"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ marginTop: 24 }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 0: THOUGHTS */}
                        {step === 0 && (
                            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "var(--text-primary)" }}>What's on your mind?</h2>
                                </motion.div>

                                {/* Quote Section */}
                                <motion.div
                                    variants={fadeUp}
                                    className="relative overflow-hidden group"
                                    style={{
                                        padding: "32px 28px",
                                        borderRadius: 24,
                                        background: "var(--bg-surface)",
                                        border: "1px solid var(--border-subtle)",
                                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
                                    }}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-primary)] opacity-30" />
                                    <p style={{
                                        fontSize: 17,
                                        color: "var(--text-primary)",
                                        fontStyle: "italic",
                                        fontFamily: "'Cormorant Garamond', serif",
                                        lineHeight: 1.6,
                                        opacity: 0.9
                                    }}>
                                        "The beginning of freedom is the realization that you are not the thinker. The moment you start watching the thinker, a higher level of consciousness becomes activated."
                                    </p>
                                    <div className="flex items-center gap-3 mt-6">
                                        <div className="w-8 h-px bg-[var(--border-subtle)]" />
                                        <p style={{
                                            fontSize: 11,
                                            color: "var(--text-muted)",
                                            letterSpacing: "0.15em",
                                            textTransform: "uppercase",
                                            fontWeight: 600
                                        }}>Eckhart Tolle</p>
                                    </div>
                                </motion.div>

                                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                                    <p style={{ fontSize: 16, color: "var(--text-primary)", fontFamily: "'Georgia', serif", opacity: 0.9 }}>
                                        Did any of these thoughts come up?
                                    </p>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", marginTop: -8 }}>Tap all that sound familiar — or write your own below</p>
                                    <div className="flex flex-col gap-3 mt-4">
                                        <ThoughtFeelingSelector
                                            selectedThoughts={selectedThoughts}
                                            onSelectionChange={handleSelectionChange}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="pt-4">
                                    <GentleTextarea label="Or in your own words:" placeholder="What was the thought? What triggered it?" value={customThought} onChange={setCustomThought} />
                                </motion.div>

                                <div ref={bottomRef} className="flex flex-col gap-6 pt-4">
                                    <AnimatePresence>
                                        {showNextPrompt && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic", letterSpacing: "0.02em" }}>Please scroll down to continue ↓</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex justify-between">
                                        <NavButton onClick={onCancel} variant="back">Cancel</NavButton>
                                        <NavButton onClick={() => setStep(1)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}



                        {/* STEP 1: BODY AWARENESS (MAP) */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "var(--text-primary)" }}>Where do you feel it in your body?</h2>
                                    <p style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "'Georgia', serif" }}>Emotion is energy in motion. It always lands somewhere physical.</p>
                                </motion.div>

                                {selectedEmotions.length > 0 && (
                                    <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center pb-4">
                                        {selectedEmotions.map(e => (
                                            <span key={e} style={{ padding: "6px 14px", borderRadius: 100, background: "var(--accent-secondary-muted)", border: "1px solid var(--accent-secondary-border)", color: "var(--accent-secondary)", fontSize: 13 }}>{e}</span>
                                        ))}
                                    </motion.div>
                                )}

                                <motion.div variants={fadeUp}>
                                    <BodyMapSelector selectedArea={selectedArea} onSelect={handleSelectArea} />
                                </motion.div>

                                <GentleTextarea
                                    label="Or describe it in your own words:"
                                    hint="Notice tension, warmth, tightness, heaviness, or lightness."
                                    placeholder="For example: tightness in my shoulders..."
                                    value={bodySensations}
                                    onChange={setBodySensations}
                                />

                                <div ref={bottomRef} className="flex flex-col gap-6 pt-4 mt-8">
                                    <AnimatePresence>
                                        {showNextPrompt && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic", letterSpacing: "0.02em" }}>Please scroll down to continue ↓</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex justify-between">
                                        <NavButton onClick={() => setStep(0)} variant="back">← Back</NavButton>
                                        <NavButton onClick={() => setStep(2)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: WITNESS AND RELEASE (NEW) */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
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
                                <div className="flex justify-between pt-4 mt-8 opacity-50 hover:opacity-100 transition-opacity">
                                    <NavButton onClick={() => setStep(1)} variant="back">← Back to Body</NavButton>
                                    <p className="text-[11px] text-[var(--text-muted)] italic font-serif py-4">Pressing "Back" will reset your checklist progress</p>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
