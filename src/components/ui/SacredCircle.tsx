import React from 'react';
import { motion } from 'framer-motion';

interface SacredCircleProps {
    text?: string;
    isAnimating?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    accentColor?: string;
}

export const SacredCircle: React.FC<SacredCircleProps> = ({
    text,
    isAnimating = false,
    size = 'md',
    accentColor = '#ABCEC9'
}) => {
    const sizeClasses = {
        sm: 'w-32 h-32',
        md: 'w-48 h-48',
        lg: 'w-64 h-64 md:w-[350px] md:h-[350px]',
        xl: 'w-72 h-72 md:w-[400px] md:h-[400px]'
    };

    const textSizeClasses = {
        sm: 'text-xl md:text-2xl',
        md: 'text-2xl md:text-4xl',
        lg: 'text-4xl md:text-6xl',
        xl: 'text-5xl md:text-7xl'
    };

    return (
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
            {/* Layered Ambient Surges (Cyan & Gold) */}
            <motion.div
                animate={{
                    scale: isAnimating ? [1.1, 1.3, 1.1] : 1.1,
                    opacity: isAnimating ? [0.15, 0.3, 0.15] : 0.2
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-[80px] bg-gradient-to-tr from-[var(--glow-cyan)] via-[var(--glow-gold)] to-[var(--glow-cyan)]"
            />

            <motion.div
                animate={{
                    scale: isAnimating ? [1.4, 1.2, 1.4] : 1.4,
                    opacity: isAnimating ? [0.08, 0.2, 0.08] : 0.1
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute inset-0 rounded-full blur-[120px] bg-gradient-to-br from-[var(--glow-gold)] via-transparent to-[var(--glow-gold)]"
            />

            {/* Deep Ambient Surge */}
            <motion.div
                animate={{
                    scale: isAnimating ? [1.2, 1.4, 1.2] : 1.2,
                    opacity: isAnimating ? [0.05, 0.15, 0.05] : 0.1
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-[140px]"
                style={{ backgroundColor: accentColor }}
            />

            {/* The Main Minimalist Circle */}
            <motion.div
                animate={{
                    scale: isAnimating ? [1, 1.05, 1] : 1,
                    boxShadow: isAnimating
                        ? [`0 0 60px ${accentColor}30`, `0 0 120px ${accentColor}60`, `0 0 60px ${accentColor}30`]
                        : `0 0 60px ${accentColor}20`
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full rounded-full border border-white/20 flex items-center justify-center overflow-hidden bg-gradient-to-b from-white/[0.08] to-transparent shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
                {/* Immediate Back Glow - Card like */}
                <div className="absolute inset-0 rounded-full opacity-40 blur-3xl" style={{ backgroundColor: accentColor }} />

                {/* Inner Gold Ring (The "Mix") */}
                <div className="absolute inset-0 rounded-full border border-[rgba(255,215,0,0.15)] blur-[1px]" />

                {/* Inner Depth Mask */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(26,21,27,0.9)_90%)]" />

                {/* Minimalist Text Center */}
                {text && (
                    <motion.div
                        key={text}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative z-10 text-center px-4"
                    >
                        <h2 className={`${textSizeClasses[size]} font-serif font-bold text-white uppercase tracking-[0.2em] opacity-90 drop-shadow-2xl`}>
                            {text}
                        </h2>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
