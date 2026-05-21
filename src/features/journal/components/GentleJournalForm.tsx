import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BodyMapSelector } from "./BodyMapSelector";
import { WitnessAndRelease } from "./WitnessAndRelease";
import { useJournalVoice } from "../hooks/useJournalVoice";
import { MoodGrid } from "./MoodGrid";
import { FELT_EXPERIENCES } from "../../../data/feltExperiences";


import { cn } from "../../../lib/utils";
import { VoiceService } from "../../../services/voiceService";

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

export function WitnessSummaryCard({
  selectedThoughts,
  customThought,
  selectedEmotions,
  selectedArea,
  bodySensations,
}: {
  selectedThoughts: string[];
  customThought: string;
  selectedEmotions: string[];
  selectedArea: any;
  bodySensations: string;
}) {
  const thought = [...selectedThoughts, customThought].filter(Boolean)[0] || 'A thought arose';
  const bodyLabel = selectedArea?.label || selectedArea?.id || bodySensations || 'The body';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mb-14 p-10 text-center rounded-[40px] border border-white/25 bg-white/[0.05] backdrop-blur-md shadow-xl"
    >
      <div className="mb-8">
        <h2 className="text-4xl sm:text-6xl font-serif text-[var(--text-main)] mb-4 leading-tight">
          You are the Witness.
        </h2>
        <div className="w-16 h-[1px] bg-[var(--accent-primary)] mx-auto opacity-40 mb-6" />
        <p className="text-lg sm:text-xl font-serif italic text-[var(--text-muted)] opacity-80 max-w-sm mx-auto">
          Notice the energy moving through you, while you remain still.
        </p>
      </div>

      <div className="relative inline-block px-10 py-6 mb-10">
        <div className="absolute inset-0 border border-[var(--accent-primary)]/20 rounded-2xl rotate-1" />
        <div className="font-serif text-2xl sm:text-3xl italic text-[var(--text-main)] leading-relaxed relative z-10">
          "{thought}"
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-30">
          Creating
        </span>
        {selectedEmotions.map(e => (
          <span key={e} className="font-sans text-[11px] font-black uppercase tracking-wider px-5 py-2 rounded-full"
            style={{
                background: 'var(--accent-primary-dim)',
                border: '1px solid var(--accent-primary-border)',
                color: 'var(--accent-primary)',
                opacity: 0.8
            }}>
            {e}
          </span>
        ))}
        {selectedEmotions.length > 0 && (
          <span className="text-[var(--text-muted)] opacity-20 text-xl">·</span>
        )}
        <span className="font-sans text-[12px] text-[var(--text-muted)] italic opacity-60">
          felt in {bodyLabel}
        </span>
      </div>
    </motion.div>
  );
}

// ─── COMPACT HEADER BAR ──────────────────────────────────────────────────────
// Docks: [step tracker] ─── center ─── [voice toggle] into one horizontal bar.
// Replaces the 6-item vertical stack that was: title → subtitle → download → 
// step circles → voice status → heading.

function JournalHeader({ currentStep, onStepClick }: { currentStep: number, onStepClick?: (step: number) => void }) {
    return (
        <div className="flex items-center gap-3 py-3 px-1">
            {STEPS.map((step, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                return (
                    <button 
                        key={i} 
                        onClick={() => onStepClick?.(i)}
                        disabled={i > currentStep} // Can't skip forward
                        className="flex flex-col items-center gap-1.5 cursor-pointer disabled:cursor-default"
                    >
                        <motion.div
                            animate={{
                                scale: isActive ? 1.1 : 1,
                                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                                borderColor: isActive || isDone ? 'var(--accent-primary)' : 'var(--border-subtle)',
                                opacity: isActive || isDone ? 1 : 0.55
                            }}
                            className="w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all"
                        >
                            <span className={cn(
                                "text-[12px] font-bold",
                                isActive ? "text-white" : "text-[var(--text-muted)]"
                            )}>
                                {isDone ? '✓' : i + 1}
                            </span>
                        </motion.div>
                        <span className={cn(
                            "text-[9px] font-semibold uppercase tracking-widest",
                            isActive ? "text-[var(--accent-primary)]" : "opacity-55 text-[var(--text-muted)]"
                        )}>
                            {step.label}
                        </span>
                    </button>
                );
            })}
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
        <div className="space-y-3">
            <div className="flex flex-col gap-1">
                <label style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 600, fontFamily: "'Georgia', serif" }}>
                    {label}
                </label>
                {hint && <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>{hint}</p>}
            </div>
            <textarea
                ref={ref}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%", padding: "16px 20px", borderRadius: 16,
                    fontSize: 16, lineHeight: 1.6,
                    background: 'var(--bg-input)',
                    border: '1.5px solid var(--border-subtle)',
                    color: "var(--text-primary)", outline: "none", resize: "none",
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    minHeight: 100,
                    transition: "border-color 0.25s ease",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
            />
        </div>
    );
}


// ─── NAV BUTTON ──────────────────────────────────────────────────────────────

function NavButton({
  children,
  onClick,
  variant = 'next',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'next' | 'back' | 'save';
  disabled?: boolean;
}) {
  const isNext = variant === 'next';

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '14px 28px',
        borderRadius: 14,
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 700,
        letterSpacing: '.06em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .25s ease',
        minHeight: 52,
        minWidth: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: disabled
          ? 'var(--bg-surface)'
          : variant === 'save'
            ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover, #2E8F89))'
            : isNext
              ? 'var(--accent-primary)'
              : 'var(--bg-surface)',
        border: disabled
          ? '1px solid var(--border-subtle)'
          : variant === 'save'
            ? '1.5px solid var(--accent-primary)'
            : isNext
              ? '1.5px solid var(--accent-primary)'
              : '1.5px solid var(--border-default)',
        color: disabled
          ? 'var(--text-disabled)'
          : variant === 'save'
            ? '#fff'
            : isNext
              ? '#fff'
              : 'var(--text-secondary)',
      }}
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

    useEffect(() => {
        const ambients = [
          'radial-gradient(ellipse at 50% 0%, rgba(184,151,58,.08) 0%, transparent 65%)',
          'radial-gradient(ellipse at 50% 0%, rgba(92,159,212,.07) 0%, transparent 65%)',
          'radial-gradient(ellipse at 50% 0%, rgba(171,206,201,.07) 0%, transparent 65%)',
        ];
        document.documentElement.style.setProperty(
          '--journal-ambient',
          ambients[step] ?? ambients[0]
        );
        return () => { document.documentElement.style.removeProperty('--journal-ambient'); };
    }, [step]);

    // Voice is ON by default
    const [showVoiceTip, setShowVoiceTip] = useState(false);

    useEffect(() => {
        // Show tooltip after a short delay (let UI settle)
        const tipSeen = localStorage?.getItem?.('awakened-voice-tip-seen');
        if (!tipSeen) {
            const timer = setTimeout(() => setShowVoiceTip(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [setShowVoiceTip]);

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

    // bottomRef removed — buttons now in sticky footer
    useEffect(() => { /* was checking showNextPrompt */ }, [step]);

    const handleWitnessTabChange = (tabId: string) => {
        if (!voice.voiceEnabled) return;
        const t = [...selectedThoughts, customThought].filter(Boolean).join(", and ");
        const e = selectedEmotions.join(", ");
        const body = selectedArea?.label || bodySensations || "part of your body";

        const tabScripts: Record<string, string> = {
            witness: `Now, step back and observe. You noticed a thought about, ${t}. Which created a feeling of, ${e}. In your, ${body}. Take a slow breath. You are the one witnessing these events, not the events themselves. You are the stillness behind them. Read the wisdom on the screen. When you're ready to explore a deeper truth, tap Next or click the Truth button at the top.`,
            truth: "It is natural for our minds to create patterns, but those patterns aren't always facts. Read the Wiser Truth on your screen. Notice how it feels to shift from a critical thought to a kinder one. When you are ready to see where this thought is coming from, tap Next or the Perspective button.",
            perspective: "On this screen, you can see The Two Voices. One part of us speaks from our old fears, while the other speaks from a place of calm presence and love. Notice which one you are choosing right now. You are doing great work just by being aware. When you feel ready to let go, tap Next to begin the release practice.",
            release: "We will now use a simple practice to release this energy from your body. Tap Begin Practice and follow the phrases on the screen. Let each one wash through you with your breath. When you're finished, tap Next to wrap up your entry.",
            close: "To finish your journey today, look at the checklist at the top of this card. Tap each box to check off the steps you explored. Once all boxes are checked, a button will appear at the bottom that says Seal this Entry. Tap that button to save your work. You can find all your saved entries later in your Daily Log on the main dashboard. Peace be with you.",
        };
        if (tabScripts[tabId]) voice.speak(tabScripts[tabId]);
    };

    // Voice narration per step — only auto-plays on first visit; marks heard after playing
    useEffect(() => {
        if (!voice.voiceEnabled) return;
        const screenId = `journal-step-${step}`;
        if (VoiceService.hasHeardScreen(screenId)) return; // already heard → skip auto-play

        const intros: Record<number, string> = {
            0: "Welcome to your reflection. Let's begin by checking in with your mind. Below, you will see a grid of common feelings. Tap any that resonate with you right now. If your specific thought isn't there, you can type it in the box labeled 'Describe your thought.' You can move between major steps using the buttons at the very top. When you are ready, tap Next to see how this feeling is affecting your body.",
            1: "Now, let's notice your physical body. Sometimes our emotions show up as tension or a heavy feeling. Look at the body map and tap the area where you feel this sensation most strongly. If you prefer to use words, you can describe it in the text box below. When you have identified the area, tap Next to begin the witnessing process.",
        };

        const play = async () => {
            try {
                if (intros[step]) {
                    await voice.speak(intros[step]);
                } else if (step === 2) {
                    handleWitnessTabChange("witness");
                } else if (step === 5) {
                    await voice.speak("Your entry has been sealed. You have taken a powerful step in dissolving these old patterns. You can find this reflection anytime in your Daily Log. Until next time, stay in presence.");
                } else { return; }
                VoiceService.markScreenHeard(screenId); // mark heard after successful play
            } catch { /* silent */ }
        };
        play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, voice.voiceEnabled]);

    // Eagerly preload the NEXT step's audio to eliminate the 5-7 second wait
    useEffect(() => {
        if (!voice.voiceEnabled) return;
        // Don't preload if this step has already been heard (no point pre-fetching)
        if (VoiceService.hasHeardScreen(`journal-step-${step}`)) return;
        
        if (step === 0) {
            VoiceService.preloadText("Now, let's notice your physical body. Sometimes our emotions show up as tension or a heavy feeling. Look at the body map and tap the area where you feel this sensation most strongly. If you prefer to use words, you can describe it in the text box below. When you have identified the area, tap Next to begin the witnessing process.");
        } else if (step === 1) {
            const t = [...selectedThoughts, customThought].filter(Boolean).join(", and ");
            const e = selectedEmotions.join(", ");
            const body = selectedArea?.label || bodySensations || "part of your body";
            const witnessIntro = `Now, step back and observe. You noticed a thought about, ${t}. Which created a feeling of, ${e}. In your, ${body}. Take a slow breath. You are the one witnessing these events, not the events themselves. You are the stillness behind them. Read the wisdom on the screen. When you're ready to explore a deeper truth, tap Next or click the Truth button at the top.`;
            VoiceService.preloadText(witnessIntro);
        } else if (step === 2) {
            VoiceService.preloadText("It is natural for our minds to create patterns, but those patterns aren't always facts. Read the Wiser Truth on your screen. Notice how it feels to shift from a critical thought to a kinder one. When you are ready to see where this thought is coming from, tap Next or the Perspective button.");
            VoiceService.preloadText("On this screen, you can see The Two Voices. One part of us speaks from our old fears, while the other speaks from a place of calm presence and love. Notice which one you are choosing right now. You are doing great work just by being aware. When you feel ready to let go, tap Next to begin the release practice.");
            VoiceService.preloadText("We will now use a simple practice to release this energy from your body. Tap Begin Practice and follow the phrases on the screen. Let each one wash through you with your breath. When you're finished, tap Next to wrap up your entry.");
            VoiceService.preloadText("I am sorry. Please forgive me. Thank you. I love you.");
            VoiceService.preloadText("To finish your journey today, look at the checklist at the top of this card. Tap each box to check off the steps you explored. Once all boxes are checked, a button will appear at the bottom that says Seal this Entry. Tap that button to save your work. You can find all your saved entries later in your Daily Log on the main dashboard. Peace be with you.");
            VoiceService.preloadText("Your entry has been sealed. You have taken a powerful step in dissolving these old patterns. You can find this reflection anytime in your Daily Log. Until next time, stay in presence.");
        }
    }, [step, voice.voiceEnabled, selectedThoughts, customThought, selectedEmotions, selectedArea, bodySensations]);

    const showScrollPrompt = () => {
        // No longer showing next prompt
    };

    const handleSelectionChange = (thoughts: string[], emotions: string[]) => {
        const newThoughts = thoughts.filter(t => !selectedThoughts.includes(t));
        setSelectedThoughts(thoughts);
        setSelectedEmotions(emotions);

        const match = FELT_EXPERIENCES.find(fe => fe.thoughts.some(t => thoughts.includes(t)));
        if (match) setCognitiveDistortion(match.cognitiveDistortion);

        if (newThoughts.length > 0) {
            showScrollPrompt();
            voice.speak(`I see, ${newThoughts[0]}. That's a thought many of us carry. Notice the feelings it creates inside you. When you're ready, scroll down and click Next.`);
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

    // Sticky nav actions per step
    const stepNavActions: Record<number, React.ReactNode> = {
        0: <><NavButton onClick={onCancel} variant="back">Cancel</NavButton><NavButton onClick={() => setStep(1)} variant="next">Next →</NavButton></>,
        1: <><NavButton onClick={() => setStep(0)} variant="back">← Back</NavButton><NavButton onClick={() => setStep(2)} variant="next">Next →</NavButton></>,
    };

    return (
        <div ref={scrollRef} className="w-full h-full relative" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            background: 'var(--journal-ambient, transparent)',
            transition: 'background 1.5s ease'
        }}>
            {/* ── Sticky bottom nav — always visible even when keyboard is open ── */}
            {step in stepNavActions && (
                <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center"
                    style={{
                        background: 'var(--bg-primary, #0c0910)',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                        backdropFilter: 'blur(12px)',
                    }}>
                    {stepNavActions[step]}
                </div>
            )}

            <div className="relative z-10 w-full max-w-4xl mx-auto pb-4 px-4 sm:px-6">

                {/* ═══ HEADER BAR — compact, docked ═══ */}
                {step < 5 && (
                    <JournalHeader currentStep={step} onStepClick={setStep} />
                )}

                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {/* ═══ STEP 0: MIND ═══ */}
                        {step === 0 && (
                            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                                {/* Compact header — no quote, no divider */}
                                <div className="flex items-center gap-3 mb-6 px-1">
                                    <span className="text-2xl">🧠</span>
                                    <div>
                                        <h2 className="font-sans font-bold text-xl text-[var(--text-main)] leading-tight">
                                            How are you feeling right now?
                                        </h2>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                                            Witness the mind · choose with presence
                                        </p>
                                    </div>
                                </div>

                                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                                    <MoodGrid
                                        selectedThoughts={selectedThoughts}
                                        onSelectionChange={handleSelectionChange}
                                    />
                                </motion.div>

                                <motion.div variants={fadeUp} className="mt-8">
                                    <GentleTextarea 
                                        label="Or in your own words:" 
                                        placeholder="What was the thought? What triggered it?" 
                                        value={customThought} 
                                        onChange={setCustomThought} 
                                    />
                                </motion.div>

                                {/* Spacer so sticky bar doesn't cover content */}
                                <div className="h-20" />
                            </motion.div>
                        )}

                        {/* ═══ STEP 1: BODY ═══ */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                {/* Compact header matching Mind step */}
                                <div className="flex items-center gap-3 mb-6 px-1">
                                    <span className="text-2xl">🫀</span>
                                    <div>
                                        <h2 className="font-sans font-bold text-xl text-[var(--text-main)] leading-tight">
                                            Where do you feel it in your body?
                                        </h2>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                                            Energy moves through the body · Tap what draws you
                                        </p>
                                    </div>
                                </div>

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

                                <div className="h-20" />
                            </motion.div>
                        )}

                        {/* ═══ STEP 2: WITNESS ═══ */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">


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
                                    onHoopComplete={() => {
                                        if (voice.voiceEnabled) {
                                            voice.speak("You have completed the release practice. Complete your checklist and click on the Seal this entry button. Return back tomorrow for the same activity.");
                                        }
                                    }}
                                    onBackStep={() => setStep(1)}
                                />
                            </motion.div>
                        )}

                        {/* ═══ STEP 5: SUCCESS ═══ */}
                        {step === 5 && (
                            <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" className="text-center py-20 space-y-8">
                                <div className="text-6xl mb-8">✨</div>
                                <h2 style={{
                                    fontSize: 'clamp(32px, 6vw, 42px)',
                                    fontFamily: "'Georgia', serif",
                                    color: 'var(--text-main)',
                                    fontWeight: 400
                                }}>
                                    Entry Sealed
                                </h2>
                                <p style={{ fontSize: 18, color: "var(--text-muted)", fontStyle: "italic", maxWidth: 400, margin: "0 auto" }}>
                                    By watching the thought and feeling the emotion, you have already begun to dissolve the pattern.
                                </p>
                                <div className="pt-10">
                                    <NavButton onClick={onCancel} variant="save">Close the Portal</NavButton>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
