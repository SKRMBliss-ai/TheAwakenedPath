import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme/ThemeSystem';
import { StepIndicator } from '../components/StepIndicator';
import { ThoughtFeelingSelector } from '../features/journal/components/ThoughtFeelingSelector';
import { BodyMapSelector } from '../features/journal/components/BodyMapSelector';
import { WitnessStep } from '../components/WitnessStep';
import { FELT_EXPERIENCES } from '../data/feltExperiences';
import { ArrowRight, Save } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function JournalPage({ onSave }: { onSave?: () => void }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [step, setStep] = useState<number>(1);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSave = async () => {
        if (!user || isSaving) return;
        setIsSaving(true);

        try {
            // Build entry matching JournalCalendar's expected fields
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
                // New structured fields
                feltExperienceIds: activeCategories.map(fe => fe.id),
                selectedThoughts,
                autoTaggedEmotions: selectedEmotions,
                cognitiveDistortions: activeCategories.map(fe => fe.cognitiveDistortion),
                microInterventionShown: activeCategories[0]?.microIntervention.technique || '',
                // Timestamps
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'users', user.uid, 'journal'), entryData);
            onSave?.();
        } catch (error) {
            console.error('Error saving journal entry:', error);
        } finally {
            setIsSaving(false);
        }
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
