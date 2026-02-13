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
        sm: 'w-48 h-48',
        md: 'w-64 h-64',
        lg: 'w-80 h-80 md:w-[480px] md:h-[480px]',
        xl: 'w-96 h-96 md:w-[600px] md:h-[600px]'
    };

    const textSizeClasses = {
        sm: 'text-xl md:text-2xl',
        md: 'text-2xl md:text-4xl',
        lg: 'text-4xl md:text-6xl',
        xl: 'text-5xl md:text-7xl'
    };

    return (
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
            {/* Deep Ambient Surge */}
            <motion.div
                animate={{
                    scale: isAnimating ? [1.2, 1.4, 1.2] : 1.2,
                    opacity: isAnimating ? [0.05, 0.15, 0.05] : 0.1
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-[120px]"
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
