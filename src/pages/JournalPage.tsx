import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme/ThemeSystem';
import { StepIndicator } from '../components/StepIndicator';
import { ThoughtFeelingSelector } from '../features/journal/components/ThoughtFeelingSelector';
import { BodyMapSelector } from '../features/journal/components/BodyMapSelector';
import { WitnessStep } from '../components/WitnessStep';
import { FELT_EXPERIENCES } from '../data/feltExperiences';
import { ArrowRight, Save, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useJournalVoice } from '../features/journal/hooks/useJournalVoice';

export function JournalPage({ onSave }: { onSave?: () => void }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [step, setStep] = useState<number>(1);
    const [isSaving, setIsSaving] = useState(false);

    // Voice guidance
    const voice = useJournalVoice();
    const hasSpokenStep = useRef<Record<number, boolean>>({});

    // State for Step 1
    const [selectedThoughts, setSelectedThoughts] = useState<string[]>([]);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

    // State for Step 2
    const [selectedBodyArea, setSelectedBodyArea] = useState<string | null>(null);

    // Derived state
    const activeCategories = FELT_EXPERIENCES.filter(fe =>
        fe.thoughts.some(t => selectedThoughts.includes(t))
    );

    const activeBodyAreas = activeCategories.flatMap(fe => fe.bodyAreas);

    // Auto-speak when step changes
    useEffect(() => {
        if (!voice.voiceEnabled || hasSpokenStep.current[step]) return;
        hasSpokenStep.current[step] = true;

        // Small delay for page transition animation
        const timer = setTimeout(() => {
            if (step === 1) {
                voice.speakStep1();
            } else if (step === 2) {
                voice.speakStep2(activeBodyAreas);
            } else if (step === 3) {
                voice.speakStep3(activeCategories);
            }
        }, 800);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, voice.voiceEnabled]);

    const handleNext = () => {
        voice.stop();
        setStep(s => Math.min(s + 1, 3));
    };
    const handlePrev = () => {
        voice.stop();
        setStep(s => Math.max(s - 1, 1));
    };

    const handleSave = async () => {
        if (!user || isSaving) return;
        setIsSaving(true);
        voice.stop();

        try {
            const entryData = {
                thoughts: selectedThoughts.join(' | '),
                emotions: selectedEmotions.join(', '),
                bodyArea: selectedBodyArea || '',
                bodySensations: activeCategories
                    .filter(fe => fe.bodyAreas.includes(selectedBodyArea || ''))
                    .flatMap(fe => fe.sensations)
                    .join(', '),
                reflections: activeCategories.map(fe => fe.cognitiveDistortion).join(', '),
                guidance: activeCategories[0]?.microIntervention.instruction || '',
                duration: '2 mins',
                feltExperienceIds: activeCategories.map(fe => fe.id),
                selectedThoughts,
                autoTaggedEmotions: selectedEmotions,
                cognitiveDistortions: activeCategories.map(fe => fe.cognitiveDistortion),
                microInterventionShown: activeCategories[0]?.microIntervention.technique || '',
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'users', user.uid, 'journal'), entryData);

            // Speak a completion message
            voice.speak("Beautiful work. Your reflection has been saved. Remember, you are not your thoughts... you are the one who witnesses them.");

            onSave?.();
        } catch (error) {
            console.error('Error saving journal entry:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 max-w-2xl mx-auto" style={{ background: theme.bgGradient, color: theme.textPrimary }}>
            {/* Voice toggle button */}
            <div className="flex items-center justify-between mb-4">
                <StepIndicator currentStep={step} />
                <button
                    onClick={voice.toggleVoice}
                    className="p-3 rounded-full backdrop-blur-xl border transition-all flex items-center justify-center"
                    style={{
                        background: voice.voiceEnabled ? theme.accentPrimary + '15' : theme.bgSurface,
                        border: `1px solid ${voice.voiceEnabled ? theme.accentPrimary + '40' : theme.borderDefault}`,
                        color: voice.voiceEnabled ? theme.accentPrimary : theme.textMuted,
                    }}
                    aria-label={voice.voiceEnabled ? 'Mute voice guidance' : 'Enable voice guidance'}
                >
                    {voice.isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : voice.voiceEnabled ? (
                        <Volume2 className="w-5 h-5" />
                    ) : (
                        <VolumeX className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Voice status indicator */}
            <AnimatePresence>
                {(voice.isPlaying || voice.isLoading) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-center gap-2 mb-4 py-2"
                    >
                        {voice.isLoading ? (
                            <span className="text-xs italic" style={{ color: theme.textMuted }}>
                                Preparing voice guidance...
                            </span>
                        ) : (
                            <>
                                {/* Animated equalizer bars */}
                                <div className="flex items-end gap-[2px] h-4">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-[3px] rounded-full"
                                            style={{ background: theme.accentPrimary }}
                                            animate={{
                                                height: ['4px', `${10 + Math.random() * 6}px`, '4px'],
                                            }}
                                            transition={{
                                                duration: 0.6 + i * 0.1,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs italic" style={{ color: theme.textMuted }}>
                                    Listening to your guide...
                                </span>
                                <button
                                    onClick={voice.stop}
                                    className="text-xs underline"
                                    style={{ color: theme.textMuted }}
                                >
                                    Stop
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl text-center font-serif italic mb-8" style={{ color: theme.textPrimary }}>
                            What's weighing on your mind right now?
                        </h2>

                        <ThoughtFeelingSelector
                            selectedThoughts={selectedThoughts}
                            onSelectionChange={(thoughts, emotions) => {
                                setSelectedThoughts(thoughts);
                                setSelectedEmotions(emotions);
                            }}
                        />

                        <div className="flex justify-end mt-8">
                            <button
                                disabled={selectedThoughts.length === 0}
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all"
                                style={{
                                    background: selectedThoughts.length > 0 ? theme.navActiveBg : theme.bgSurface,
                                    color: selectedThoughts.length > 0 ? theme.accentPrimary : theme.textDisabled,
                                    border: `1.5px solid ${selectedThoughts.length > 0 ? theme.navActiveBorder : theme.borderDefault}`,
                                    opacity: selectedThoughts.length > 0 ? 1 : 0.5
                                }}
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl text-center font-serif italic mb-2" style={{ color: theme.textPrimary }}>
                            Where do you feel this in your body?
                        </h2>
                        <p className="text-center text-sm mb-8" style={{ color: theme.textMuted }}>
                            Select the area that feels the most resonant.
                        </p>

                        <BodyMapSelector
                            activeAreas={activeBodyAreas}
                            selectedArea={selectedBodyArea}
                            onSelectArea={setSelectedBodyArea}
                            activeCategories={activeCategories}
                        />

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handlePrev}
                                className="px-6 py-4 rounded-2xl font-semibold transition-all"
                                style={{ color: theme.textMuted, border: `1px solid ${theme.borderDefault}` }}
                            >
                                Back
                            </button>
                            <button
                                disabled={!selectedBodyArea}
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all"
                                style={{
                                    background: selectedBodyArea ? theme.navActiveBg : theme.bgSurface,
                                    color: selectedBodyArea ? theme.accentPrimary : theme.textDisabled,
                                    border: `1.5px solid ${selectedBodyArea ? theme.navActiveBorder : theme.borderDefault}`,
                                    opacity: selectedBodyArea ? 1 : 0.5
                                }}
                            >
                                The Witness <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <WitnessStep
                            selectedThoughts={selectedThoughts}
                            selectedEmotions={selectedEmotions}
                            selectedBodyArea={selectedBodyArea!}
                            activeCategories={activeCategories}
                        />

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handlePrev}
                                className="px-6 py-4 rounded-2xl font-semibold transition-all"
                                style={{ color: theme.textMuted, border: `1px solid ${theme.borderDefault}` }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all"
                                style={{
                                    background: theme.navActiveBg,
                                    color: theme.accentPrimary,
                                    border: `1.5px solid ${theme.navActiveBorder}`,
                                    opacity: isSaving ? 0.6 : 1,
                                }}
                            >
                                {isSaving ? 'Saving...' : 'Save Reflection'} <Save className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
