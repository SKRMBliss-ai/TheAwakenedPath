import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme/ThemeSystem';
import { StepIndicator } from '../components/StepIndicator';
import { ThoughtFeelingSelector } from '../features/journal/components/ThoughtFeelingSelector';
import { BodyMapSelector } from '../features/journal/components/BodyMapSelector';
import { WitnessStep } from '../components/WitnessStep';
import { FELT_EXPERIENCES } from '../data/feltExperiences';
import { ArrowRight, Save } from 'lucide-react';
// import { useNavigate } from 'react-router-dom'; // If using react-router

export function JournalPage({ onSave }: { onSave?: () => void }) {
    const { theme } = useTheme();
    const [step, setStep] = useState<number>(1);

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

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleSave = () => {
        // Generate journal entry
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            feltExperienceIds: activeCategories.map(fe => fe.id),
            selectedThoughts,
            autoTaggedEmotions: selectedEmotions,
            cognitiveDistortions: activeCategories.map(fe => fe.cognitiveDistortion),
            bodyArea: selectedBodyArea || "",
            bodySensations: [], // Add logic if user selects specific sensations later
            witnessReflection: "",
            microInterventionShown: activeCategories[0]?.microIntervention.technique || "",
            theme: theme.name
        };

        // Save to local storage
        const existing = JSON.parse(localStorage.getItem('awakened-entries') || '[]');
        localStorage.setItem('awakened-entries', JSON.stringify([...existing, entry]));

        onSave?.();
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 max-w-2xl mx-auto" style={{ background: theme.bgGradient, color: theme.textPrimary }}>
            <StepIndicator currentStep={step} />

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
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all"
                                style={{
                                    background: theme.navActiveBg,
                                    color: theme.accentPrimary,
                                    border: `1.5px solid ${theme.navActiveBorder}`,
                                }}
                            >
                                Save Reflection <Save className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
