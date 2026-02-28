const fs = require('fs');
const filepath = 'src/features/journal/components/GentleJournalForm.tsx';
let txt = fs.readFileSync(filepath, 'utf8');

// The split point:
const splitPoint = 'let initialConditionObj = null;';
let firstPart = txt.substring(0, txt.indexOf(splitPoint));

// Append new content
const newContent = `
    const [openRegion, setOpenRegion] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<any | null>(null);
    const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
    const [openReflection, setOpenReflection] = useState(initialData?.reflections || "");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to top on step change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [step]);

    const handleToggleThought = (label: string) => {
        setSelectedThoughts(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
    };

    const handleToggleEmotion = (emotion: string) => {
        setSelectedEmotions(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
    };

    const handleToggleRegion = (id: string) => {
        setOpenRegion(prev => prev === id ? null : id);
    };

    const handleSelectCondition = (condition: any) => {
        if (selectedArea?.id === condition.id) {
            setSelectedArea(null);
            setSelectedPatterns([]);
        } else {
            setSelectedArea(condition);
            setSelectedPatterns([]);
            setTimeout(() => {
                const el = document.getElementById('expanded-patterns');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 200);
        }
    };

    const handleTogglePattern = (pattern: string) => {
        setSelectedPatterns((prev) =>
            prev.includes(pattern) ? prev.filter((p) => p !== pattern) : [...prev, pattern]
        );
    };

    const handleSave = () => {
        const thoughtsStr = selectedThoughts.join(' | ') + (customThought ? \` | \${customThought}\` : '');
        const entry = {
            thoughts: thoughtsStr,
            bodySensations: bodySensations || selectedArea?.bodyFeels || "",
            bodyArea: selectedArea?.label || "",
            emotions: selectedEmotions.join(', '),
            reflections: openReflection,
            guidance: selectedArea?.helps || "",
        };
        onSave(entry);
        setStep(5); // confirmation
    };

    const hasAnything = selectedThoughts.length > 0 || customThought || selectedEmotions.length > 0 || bodySensations || selectedArea || openReflection;

    return (
        <div ref={scrollRef} className="w-full h-full" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            <div className="relative z-10 w-full max-w-xl mx-auto pb-32">
                {step < 5 && <StepTracker current={step} />}

                <div style={{ marginTop: 24 }}>
                    <AnimatePresence mode="wait">

                        {step === 0 && (
                            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "white" }}>What's on your mind?</h2>
                                </motion.div>
                                
                                <motion.div variants={fadeUp} style={{ padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", fontStyle: "italic", fontFamily: "'Georgia', serif", lineHeight: 1.6 }}>
                                        "The beginning of freedom is the realization that you are not the thinker."
                                    </p>
                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                        — Eckhart Tolle
                                    </p>
                                </motion.div>

                                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", fontFamily: "'Georgia', serif" }}>
                                        Did any of these thoughts come up?
                                    </p>
                                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic", marginTop: -8 }}>
                                        Tap all that sound familiar — you can also write your own below
                                    </p>
                                    
                                    <div className="flex flex-col gap-3 mt-4">
                                        {THOUGHT_PROMPTS.map(t => (
                                            <ThoughtCheck 
                                                key={t.id} 
                                                thought={t} 
                                                isSelected={selectedThoughts.includes(t.label)} 
                                                onClick={() => handleToggleThought(t.label)} 
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="pt-4">
                                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", fontFamily: "'Georgia', serif", marginBottom: 16 }}>
                                        Or in your own words:
                                    </p>
                                    <GentleTextarea
                                        label=""
                                        placeholder="What was the thought? What triggered it?"
                                        value={customThought}
                                        onChange={setCustomThought}
                                    />
                                </motion.div>

                                <div className="flex justify-between pt-4">
                                    <NavButton onClick={onCancel} variant="back">Cancel</NavButton>
                                    <NavButton onClick={() => setStep(1)} variant="next">Next →</NavButton>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "white" }}>What did that make you feel?</h2>
                                </motion.div>

                                {(selectedThoughts.length > 0 || customThought) && (
                                    <motion.div variants={fadeUp} style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(209,107,165,0.05)", borderLeft: "3px solid rgba(209,107,165,0.5)" }}>
                                        <p style={{ fontSize: 12, color: "rgba(209,107,165,0.7)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                                            Your thought was:
                                        </p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                            {selectedThoughts.map(t => (
                                                <p key={t} style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>"{t}"</p>
                                            ))}
                                            {customThought && (
                                                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>"{customThought}"</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
                                    {EMOTION_GROUPS.map(group => (
                                        <div key={group.label} className="space-y-4">
                                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                                                {group.label}
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {group.emotions.map(emotion => (
                                                    <EmotionChip
                                                        key={emotion}
                                                        emotion={emotion}
                                                        isSelected={selectedEmotions.includes(emotion)}
                                                        onClick={() => handleToggleEmotion(emotion)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>

                                <div className="flex justify-between pt-4 mt-8">
                                    <NavButton onClick={() => setStep(0)} variant="back">← Back</NavButton>
                                    <NavButton onClick={() => setStep(2)} variant="next">Next →</NavButton>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "white" }}>Where do you feel it in your body?</h2>
                                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "'Georgia', serif" }}>
                                        Emotion is energy in motion. It always lands somewhere physical.
                                    </p>
                                </motion.div>

                                {selectedEmotions.length > 0 && (
                                    <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center pb-4">
                                        {selectedEmotions.map(e => (
                                            <span key={e} style={{ padding: "6px 14px", borderRadius: 100, background: "rgba(171,206,201,0.1)", border: "1px solid rgba(171,206,201,0.2)", color: "rgba(171,206,201,0.8)", fontSize: 13 }}>
                                                {e}
                                            </span>
                                        ))}
                                    </motion.div>
                                )}

                                <motion.div variants={fadeUp} className="space-y-4">
                                    <div style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(209,107,165,0.04)", border: "1px solid rgba(209,107,165,0.08)" }}>
                                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", fontFamily: "'Georgia', serif", marginBottom: 4 }}>
                                            Is your body trying to tell you something?
                                        </p>
                                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                                            Optional — if something below sounds familiar, tap it
                                        </p>
                                    </div>

                                    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-4">
                                        {BODY_REGIONS.map((region) => (
                                            <div key={region.id} className="flex flex-col gap-2">
                                                <RegionCard region={region} isOpen={openRegion === region.id} onClick={() => handleToggleRegion(region.id)} />
                                                <AnimatePresence>
                                                    {openRegion === region.id && (
                                                        <motion.div variants={expandCollapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden pl-4 pr-1">
                                                            <div className="flex flex-col gap-3 py-2">
                                                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                                                                    Tap the one that feels most familiar right now:
                                                                </p>
                                                                {region.conditions.map((condition: any) => (
                                                                    <div key={condition.id} className="flex flex-col gap-2">
                                                                        <ConditionCard condition={condition} isOpen={selectedArea?.id === condition.id} onClick={() => handleSelectCondition(condition)} />
                                                                        <AnimatePresence>
                                                                            {selectedArea?.id === condition.id && (
                                                                                <motion.div id="expanded-patterns" variants={expandCollapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
                                                                                    <div className="pt-4 pb-6 px-1 space-y-6">
                                                                                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontFamily: "'Georgia', serif" }}>
                                                                                            Do any of these inner patterns ring true?
                                                                                        </p>
                                                                                        <div className="flex flex-col gap-3">
                                                                                            {condition.patterns.map((p: string) => (
                                                                                                <PatternCheck key={p} pattern={p} isSelected={selectedPatterns.includes(p)} onClick={() => handleTogglePattern(p)} />
                                                                                            ))}
                                                                                        </div>
                                                                                        {selectedPatterns.length > 0 && (
                                                                                            <InsightCard condition={condition} />
                                                                                        )}
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </motion.div>
                                </motion.div>

                                <GentleTextarea
                                    label="Or in your own words:"
                                    hint="Notice any tension, warmth, tightness, heaviness, or lightness."
                                    placeholder="For example: tightness in my shoulders..."
                                    value={bodySensations}
                                    onChange={setBodySensations}
                                />

                                <div className="flex justify-between pt-4 mt-8">
                                    <NavButton onClick={() => setStep(1)} variant="back">← Back</NavButton>
                                    <NavButton onClick={() => setStep(3)} variant="next">Next →</NavButton>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "white" }}>Step back and witness</h2>
                                </motion.div>

                                <motion.div variants={fadeUp} style={{ position: "relative", padding: "32px 20px", borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                                    
                                    <div style={{ textAlign: "center", width: "100%" }}>
                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Thought</p>
                                        <div style={{ padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", display: "inline-block", minWidth: 200, maxWidth: "100%" }}>
                                            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontFamily: "'Georgia', serif", fontStyle: "italic", wordWrap: "break-word" }}>
                                                "{selectedThoughts[0] || customThought || "A passing thought..."}"
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ width: 2, height: 24, background: "linear-gradient(to bottom, rgba(209,107,165,0.5), transparent)" }} />

                                    <div style={{ textAlign: "center", width: "100%" }}>
                                        <p style={{ fontSize: 11, color: "rgba(209,107,165,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Emotion</p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                                            {selectedEmotions.length > 0 ? selectedEmotions.map(e => (
                                                <span key={e} style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(209,107,165,0.1)", color: "rgba(209,107,165,0.8)", fontSize: 14 }}>{e}</span>
                                            )) : <span style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(209,107,165,0.05)", color: "rgba(209,107,165,0.5)", fontSize: 14 }}>Unspoken feeling</span>}
                                        </div>
                                    </div>

                                    <div style={{ width: 2, height: 24, background: "linear-gradient(to bottom, rgba(171,206,201,0.5), transparent)" }} />

                                    <div style={{ textAlign: "center", width: "100%" }}>
                                        <p style={{ fontSize: 11, color: "rgba(171,206,201,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Body</p>
                                        <div style={{ padding: "16px", borderRadius: 16, border: "1px dashed rgba(171,206,201,0.3)", display: "inline-block", minWidth: 200, maxWidth: "100%" }}>
                                            <p style={{ fontSize: 15, color: "rgba(171,206,201,0.8)", fontFamily: "'Georgia', serif" }}>
                                                {selectedArea?.label || bodySensations || "Physical sensation"}
                                            </p>
                                        </div>
                                    </div>

                                </motion.div>

                                <motion.div variants={fadeUp} style={{ padding: "24px", borderRadius: 16, background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
                                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "'Georgia', serif", lineHeight: 1.6 }}>
                                        You are not the thought, not the emotion, not the sensation.<br/>
                                        <span style={{ color: "white", fontStyle: "italic" }}>You are the one who is watching.</span>
                                    </p>
                                </motion.div>

                                <GentleTextarea
                                    label="Anything else to release?"
                                    hint="This space is fully yours."
                                    placeholder="Write freely..."
                                    value={openReflection}
                                    onChange={setOpenReflection}
                                />

                                <div className="flex justify-between pt-4 mt-8">
                                    <NavButton onClick={() => setStep(2)} variant="back">← Back</NavButton>
                                    <NavButton onClick={handleSave} variant="save" disabled={!hasAnything}>Save Entry</NavButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
\`;

fs.writeFileSync(filepath, firstPart + newContent);
