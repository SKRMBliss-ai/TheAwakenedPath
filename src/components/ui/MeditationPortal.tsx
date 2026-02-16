import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { SacredCircle } from './SacredCircle';

interface MeditationPortalProps {
    title: string;
    currentStepTitle: string;
    currentStepInstruction: string;
    onNext: () => void;
    onReset: () => void;
    onTogglePlay: () => void;
    isPlaying: boolean;
    progress: number; // 0 to 1
    children?: React.ReactNode;
}

export const MeditationPortal: React.FC<MeditationPortalProps> = ({
    title,
    currentStepTitle,
    currentStepInstruction,
    onNext,
    onReset,
    onTogglePlay,
    isPlaying,
    progress,
    children
}) => {
    const [mockPracticingCount] = useState(() => Math.floor(Math.random() * (15000 - 10000) + 10000).toLocaleString());
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[#1a151b] flex flex-col items-center justify-between p-8 md:p-12 overflow-hidden text-white">
            {/* Background Sacred Ambient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,54,61,1)_0%,#1a151b_100%)]" />

            {/* Ambient Corner Glows */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_top_right,var(--glow-cyan),transparent_70%)] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[radial-gradient(circle_at_bottom_left,var(--glow-gold),transparent_70%)] opacity-25 pointer-events-none" />

            {/* Top Navigation / Stats */}
            <header className="relative z-10 w-full flex justify-between items-start pt-4">
                <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <span className="text-sm font-bold tracking-widest text-white/90 font-mono">
                        {formatTime(timer)}
                    </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ABCEC9] shadow-[0_0_10px_#ABCEC9] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {mockPracticingCount} PRACTICING WITH YOU NOW
                    </span>
                </div>
            </header>

            {/* Central Portal & Title */}
            <div className="relative flex-1 w-full flex flex-col items-center justify-center">
                {/* Large Title - High Position (Secondary info in this style) */}
                <div className="mb-8 text-center h-8 flex items-center opacity-30">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={title}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-bold uppercase tracking-[0.5em] text-white"
                        >
                            {title}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Step Text moved ABOVE the circle for serenity */}
                <div className="mb-12 h-32 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepTitle}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 1 }}
                            className="text-center space-y-4 max-w-xl"
                        >
                            {currentStepTitle && (
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#ABCEC9] opacity-80">
                                    {currentStepTitle}
                                </h3>
                            )}
                            {currentStepInstruction && (
                                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
                                    {currentStepInstruction}
                                </h2>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* The Main Sacred Circle */}
                <div className="relative h-96 w-96 flex items-center justify-center">
                    {children ? children : (
                        <SacredCircle
                            isAnimating={isPlaying}
                            size="xl"
                        />
                    )}

                    {/* Progress Ring (Subtle Overlay) */}
                    <svg className="absolute inset-[-24px] w-[calc(100%+48px)] h-[calc(100%+48px)] -rotate-90 opacity-20 pointer-events-none">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="48%"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                        />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="48%"
                            fill="none"
                            stroke="#ABCEC9"
                            strokeWidth="2"
                            strokeDasharray="100 100"
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 100 - (progress * 100) }}
                            transition={{ duration: 1 }}
                        />
                    </svg>
                </div>
            </div>

            {/* Navigation Controls */}
            <footer className="relative z-10 w-full flex justify-center pb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onTogglePlay}
                        className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                    >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>

                    <button
                        onClick={onReset}
                        className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>

                    <button
                        onClick={onNext}
                        className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>
                </div>
            </footer>
        </div>
    );
};
