import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeSystem';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
}

const STEPS = ["What's Happening", "Where Feel It", "The Witness"];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    const { theme } = useTheme();

    return (
        <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-8 relative">
            <div
                className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 -z-10"
                style={{ background: theme.borderGlass }}
            />

            {STEPS.map((step, index) => {
                const isCompleted = currentStep > index + 1;
                const isActive = currentStep === index + 1;

                return (
                    <div key={step} className="flex flex-col items-center gap-2">
                        <motion.div
                            layout
                            className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500"
                            style={{
                                backgroundColor: isActive ? theme.accentPrimaryMuted : (isCompleted ? theme.accentSecondaryMuted : theme.bgSurface),
                                borderColor: isActive ? theme.accentPrimary : (isCompleted ? theme.accentSecondary : theme.borderDefault),
                                color: isActive ? theme.textPrimary : (isCompleted ? theme.accentSecondary : theme.textMuted),
                            }}
                        >
                            {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-semibold">{index + 1}</span>}
                        </motion.div>
                        <span
                            className="text-[11px] font-semibold tracking-wider font-sans uppercase whitespace-nowrap hidden sm:block"
                            style={{
                                color: isActive ? theme.textPrimary : theme.textMuted,
                            }}
                        >
                            {step}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
