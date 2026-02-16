import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { SacredCircle } from './SacredCircle';
import { VoiceService, useVoiceActive } from '../../services/voiceService';

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
    const isVoiceActive = useVoiceActive();

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => {
            clearInterval(interval);
            VoiceService.stop(); // Stop voice when closing or unmounting
        };
    }, [isPlaying]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative w-full flex justify-center group">
            {/* Outer Sacred Glow - Luminous halo behind the card */}
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,var(--glow-cyan),transparent_70%)] opacity-20 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,var(--glow-gold),transparent_70%)] opacity-10 blur-[160px] pointer-events-none" />

            <div className="relative h-full max-h-[900px] min-h-[600px] w-full max-w-5xl rounded-[48px] bg-[var(--bg-color)] flex flex-col items-center justify-between p-6 md:p-10 overflow-hidden text-white shadow-2xl border border-white/5">
                {/* Background Sacred Ambient - Using Dashboard Plum Palette */}
                <div className="absolute inset-0 bg-[var(--bg-body)] opacity-100" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(89,68,92,0.4)_0%,transparent_100%)]" />

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

                    {/* Step Text - Reduced min-h and margins to prevent pushing the circle out of view */}
                    <div className="mb-4 flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStepTitle}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 1 }}
                                className="text-center space-y-4 max-w-2xl"
                            >
                                {currentStepTitle && (
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#ABCEC9] opacity-80">
                                        {currentStepTitle}
                                    </h3>
                                )}
                                {currentStepInstruction && (
                                    <h2 className="text-xl md:text-3xl font-serif font-bold text-white leading-tight">
                                        {currentStepInstruction}
                                    </h2>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* The Main Sacred Circle Wrapper - Strictly controlled to prevent distortion */}
                    <div className="relative flex-none h-[300px] w-[300px] md:h-[400px] md:w-[400px] aspect-square flex items-center justify-center mb-6">
                        {/* Sage Speaking Presence - A subtle expanded aura when voice is active */}
                        <AnimatePresence>
                            {isVoiceActive && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.15, scale: 1.2 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute inset-0 rounded-full bg-[var(--glow-cyan)] blur-2xl pointer-events-none"
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                />
                            )}
                        </AnimatePresence>

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
                <footer className="relative z-10 w-full flex flex-col items-center gap-6 pb-8">
                    {/* Voice Status Indicator */}
                    <div className="h-6 flex items-center justify-center">
                        <AnimatePresence>
                            {isVoiceActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                                >
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [4, 12, 4] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                className="w-1 bg-[#ABCEC9] rounded-full"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#ABCEC9]">Sage is Guided</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

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
        </div>
    );
};
