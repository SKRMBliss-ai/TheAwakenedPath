import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Volume2, VolumeX } from "lucide-react";
import { BodyMapSelector } from "./BodyMapSelector";
import { WitnessAndRelease } from "./WitnessAndRelease";
import { useJournalVoice } from "../hooks/useJournalVoice";
import { MoodGrid } from "./MoodGrid";
import { FELT_EXPERIENCES } from "../../../data/feltExperiences";
import { getDailyQuote } from "../../../data/dailyQuotes";
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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10 p-8 text-center"
    >
      <div className="mb-6">
        <h2 className="text-3xl sm:text-5xl font-serif text-[var(--text-main)] mb-3 leading-tight">
          You are not the thought.
        </h2>
        <p className="text-xl sm:text-2xl font-serif italic text-[var(--accent-primary)] opacity-90">
          You are the awareness watching it.
        </p>
      </div>

      <div style={{
        fontFamily: "'Georgia', serif",
        fontSize: 22,
        fontStyle: 'italic',
        color: 'rgba(235,215,225,.78)',
        marginBottom: 18,
        lineHeight: 1.5,
        textAlign: 'center'
      }}>
        "{thought}"
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span style={{
          fontFamily: 'sans-serif',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,.2)',
        }}>
          Creating
        </span>
        {selectedEmotions.map(e => (
          <span key={e} style={{
            fontFamily: 'sans-serif',
            fontSize: 11,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(184,151,58,.1)',
            border: '1px solid rgba(184,151,58,.25)',
            color: 'rgba(184,151,58,.8)',
          }}>
            {e}
          </span>
        ))}
        {selectedEmotions.length > 0 && (
          <span style={{ color: 'rgba(255,255,255,.15)', fontSize: 10 }}>·</span>
        )}
        <span style={{
          fontFamily: 'sans-serif',
          fontSize: 11,
          color: 'rgba(255,255,255,.3)',
          fontStyle: 'italic',
        }}>
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
            <div className="flex items-center gap-3">
                {STEPS.map((step, i) => {
                    const isActive = i === currentStep;
                    const isDone = i < currentStep;
                    return (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                                    borderColor: isActive || isDone ? 'var(--accent-primary)' : 'var(--border-subtle)',
                                    opacity: isActive || isDone ? 1 : 0.3
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
                                "text-[9px] font-black uppercase tracking-widest",
                                isActive ? "opacity-100 text-[var(--accent-primary)]" : "opacity-30 text-[var(--text-muted)]"
                            )}>
                                {step.label}
                            </span>
                        </div>
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
                                <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    <b>Tip:</b> I can read the prompts to you.
                                    {' '}Tap here to turn it off anytime.
                                </p>
                                <button 
                                    onClick={onDismissTip}
                                    className="mt-2 text-[11px] font-bold uppercase tracking-[0.15em]"
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
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[12px] italic text-[var(--text-muted)] font-serif hidden sm:block">
                                Preparing...
                            </span>
                        </motion.div>
                    ) : isPlaying ? (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-full"
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
                                            width: 2.5, height: 12, borderRadius: 1.5,
                                            background: 'var(--accent-secondary)',
                                            opacity: 0.7,
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-[12px] italic font-serif hidden sm:block"
                                style={{ color: 'var(--accent-secondary)' }}>
                                Guiding...
                            </span>
                            <button
                                onClick={onStopVoice}
                                className="w-6 h-6 rounded-full flex items-center justify-center ml-0.5
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
                            <Volume2 className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-[1px]">Voice: On</span>
                        </>
                    ) : (
                        <>
                            <VolumeX className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-[1px]">Voice: Off</span>
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
                    width: "100%", padding: "20px", borderRadius: 20, 
                    fontSize: 20, lineHeight: 1.6,
                    background: "var(--bg-input)", border: "1.5px solid var(--border-subtle)",
                    color: "var(--text-primary)", outline: "none", resize: "none",
                    fontFamily: "'Cormorant Garamond', serif",
                    minHeight: 120,
                    transition: "all 0.3s ease",
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
          ? 'rgba(255,255,255,.04)'
          : isNext
            ? 'linear-gradient(135deg, rgba(184,151,58,.22), rgba(184,151,58,.1))'
            : 'rgba(255,255,255,.04)',
        border: disabled
          ? '1px solid rgba(255,255,255,.06)'
          : isNext
            ? '1.5px solid rgba(184,151,58,.4)'
            : '1px solid rgba(255,255,255,.1)',
        color: disabled
          ? 'rgba(255,255,255,.2)'
          : isNext
            ? '#B8973A'
            : 'rgba(255,255,255,.35)',
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

    // Voice is ON by default — show first-time tip
    const [showVoiceTip, setShowVoiceTip] = useState(false);

    useEffect(() => {
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
    useEffect(() => { /* was checking showNextPrompt */ }, [step]);

    const handleWitnessTabChange = (tabId: string) => {
        if (!voice.voiceEnabled) return;
        const t = [...selectedThoughts, customThought].filter(Boolean).join(", and ");
        const e = selectedEmotions.join(", ");
        const body = selectedArea?.label || bodySensations || "part of your body";

        const tabScripts: Record<string, string> = {
            witness: `Now, step back. A thought arose, ${t}. Which created a feeling of, ${e}. Which you felt in your, ${body}. But notice something. You are not the thought. You are not the emotion. You are not the sensation. You, are the one who was watching them happen. That awareness, that witnessing presence, that is who you truly are. When you're ready to look closer, click next to find the deeper truth.`,
            truth: "Now, let's bring in the light of truth. Thoughts are not facts. Read this antidote to yourself. How does it feel to hear a truer, kinder story? Click next to shift your perspective on this entirely.",
            perspective: "Notice where this thought is coming from. Is it from the fearful ego, or from your true being? Remind yourself, you are not the fear. You are the awareness witnessing it. Click next to begin releasing this energy.",
            release: "Let's practice a moment of deep release. Silently repeat these phrases, and let each one dissolve a layer of resistance. Click Begin Practice to start.",
            close: "As we close this practice, take a final moment to reflect. What have you learned about yourself? Check off the steps you completed on the checklist above, ask yourself the final question on the screen, and then tap Seal This Entry.",
        };
        if (tabScripts[tabId]) voice.speak(tabScripts[tabId]);
    };

    // Voice narration per step
    useEffect(() => {
        if (!voice.voiceEnabled) return;
        const intros: Record<number, { text: string; key: string }> = {
            0: {
                text: "Take a moment, and notice what's been on your mind today. Sometimes thoughts come as quiet whispers, sometimes they feel loud and heavy. If anything below feels familiar, simply tap the one that resonates. Once you've selected what's on your mind, click next to find out where this energy is hiding in your body.",
                key: "step-0-intro"
            },
            1: {
                text: "Emotions are energy in motion, and that energy always lands somewhere in the body. If you can, close your eyes for a moment. Take one slow breath. Now notice, where in your body do you feel it? Tap the area that draws your attention. Once you've found it, click next to begin the process of releasing it.",
                key: "step-1-intro"
            }
        };

        if (intros[step]) {
            voice.speak(intros[step].text);
        } else if (step === 2) {
            handleWitnessTabChange("witness");
        } else if (step === 5) {
            voice.speak("Your reflection has been saved. By watching the thought, feeling the emotion, and noticing the body, you have already begun to dissolve the pattern.");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, voice.voiceEnabled]);

    // Eagerly preload the NEXT step's audio to eliminate the 5-7 second wait
    useEffect(() => {
        if (!voice.voiceEnabled) return;
        
        if (step === 0) {
            // "intros[1].text" hardcoded so we don't need to rebuild the object
            VoiceService.preloadText("Emotions are energy in motion, and that energy always lands somewhere in the body. If you can, close your eyes for a moment. Take one slow breath. Now notice, where in your body do you feel it? Tap the area that draws your attention. Once you've found it, click next to begin the process of releasing it.");
        } else if (step === 1) {
            // We use the same generation logic as the witness tab, so it perfectly matches the cache key in handleWitnessTabChange
            const t = [...selectedThoughts, customThought].filter(Boolean).join(", and ");
            const e = selectedEmotions.join(", ");
            const body = selectedArea?.label || bodySensations || "part of your body";
            const witnessIntro = `Now, step back. A thought arose, ${t}. Which created a feeling of, ${e}. Which you felt in your, ${body}. But notice something. You are not the thought. You are not the emotion. You are not the sensation. You, are the one who was watching them happen. That awareness, that witnessing presence, that is who you truly are. When you're ready to look closer, click next to find the deeper truth.`;
            VoiceService.preloadText(witnessIntro);
        } else if (step === 2) {
            // Preload all remaining static tabs!
            VoiceService.preloadText("Now, let's bring in the light of truth. Thoughts are not facts. Read this antidote to yourself. How does it feel to hear a truer, kinder story? Click next to shift your perspective on this entirely.");
            VoiceService.preloadText("Notice where this thought is coming from. Is it from the fearful ego, or from your true being? Remind yourself, you are not the fear. You are the awareness witnessing it. Click next to begin releasing this energy.");
            VoiceService.preloadText("Let's practice a moment of deep release. Silently repeat these phrases, and let each one dissolve a layer of resistance. Click Begin Practice to start.");
            VoiceService.preloadText("I am sorry. Please forgive me. Thank you. I love you.");
            VoiceService.preloadText("You have completed the release practice. Complete your checklist and click on the Seal this entry button. Return back tomorrow for the same activity.");
            VoiceService.preloadText("As we close this practice, take a final moment to reflect. What have you learned about yourself? Check off the steps you completed on the checklist above, ask yourself the final question on the screen, and then tap Seal This Entry.");
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

    return (
        <div ref={scrollRef} className="w-full h-full relative" style={{ 
            fontFamily: "'Georgia', 'Times New Roman', serif",
            background: 'var(--journal-ambient, transparent)',
            transition: 'background 1.5s ease'
        }}>
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

                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {/* ═══ STEP 0: MIND ═══ */}
                        {step === 0 && (
                            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                                <div className="text-center mb-10">
                                    <h2 className="text-4xl md:text-6xl font-serif text-[var(--text-main)] mb-4 leading-[1.15]">
                                        How are you feeling<br />right now?
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] opacity-40">
                                        Tap what resonates · choose freely
                                    </p>
                                </div>

                                <div className="space-y-4 mb-14">
                                    <motion.div
                                        variants={fadeUp}
                                        className="flex gap-4 items-start max-w-xl mx-auto text-center justify-center"
                                    >
                                        <div>
                                            <p style={{
                                                fontSize: 18,
                                                color: "var(--text-primary)",
                                                fontStyle: "italic",
                                                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                                                lineHeight: 1.6,
                                                opacity: 0.9,
                                            }}>
                                                "{getDailyQuote().text}"
                                            </p>
                                            <p style={{
                                                fontSize: 12,
                                                color: "var(--text-muted)",
                                                letterSpacing: "0.15em",
                                                textTransform: "uppercase",
                                                fontWeight: 700,
                                                marginTop: 6,
                                                fontFamily: "system-ui, sans-serif",
                                            }}>
                                                — {getDailyQuote().author}
                                            </p>
                                        </div>
                                    </motion.div>
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

                                <div ref={bottomRef} className="flex flex-col gap-4 pt-10">
                                    <div className="flex justify-between">
                                        <NavButton onClick={onCancel} variant="back">Cancel</NavButton>
                                        <NavButton onClick={() => setStep(1)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 1: BODY ═══ */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-4xl md:text-6xl font-serif text-[var(--text-main)] mb-4 leading-[1.15]">
                                        Where do you<br />feel it?
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] opacity-40">
                                        Emotions always land somewhere physical · tap the area that draws you
                                    </p>
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

                                <div ref={bottomRef} className="flex flex-col gap-4 pt-4">
                                    <div className="flex justify-between">
                                        <NavButton onClick={() => setStep(0)} variant="back">← Back</NavButton>
                                        <NavButton onClick={() => setStep(2)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 2: WITNESS ═══ */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <WitnessSummaryCard
                                    selectedThoughts={selectedThoughts}
                                    customThought={customThought}
                                    selectedEmotions={selectedEmotions}
                                    selectedArea={selectedArea}
                                    bodySensations={bodySensations}
                                />
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
                                />
                                <div className="flex justify-between pt-4 opacity-50 hover:opacity-100 transition-opacity">
                                    <NavButton onClick={() => setStep(1)} variant="back">← Back</NavButton>
                                    <p className="text-[11px] text-[var(--text-muted)] italic font-serif py-4 max-w-[180px] text-right">
                                        Going back will reset your checklist
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 5: SUCCESS ═══ */}
                        {step === 5 && (
                            <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" className="text-center py-20 space-y-8">
                                <div className="text-6xl mb-8">✨</div>
                                <h2 style={{
                                    fontSize: 'clamp(32px, 6vw, 42px)',
                                    fontFamily: "'Georgia', serif",
                                    color: 'rgba(235,215,225,.92)',
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
