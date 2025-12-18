import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, ArrowRight, Sparkles } from 'lucide-react';

export const ReframingVisual: React.FC = () => {
    const [stage, setStage] = useState<'negative' | 'question' | 'positive'>('negative');

    useEffect(() => {
        // Cycle through stages for the visualization loop
        // In a real app this might be tied to the specific steps of the practice, but for the 'active' visual state we loop to show the process.
        const interval = setInterval(() => {
            setStage((prev) => {
                if (prev === 'negative') return 'question';
                if (prev === 'question') return 'positive';
                return 'negative';
            });
        }, 5000); // 5 seconds per stage
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-72 w-full flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900/40 border border-white/5">
            {/* Background Ambient Glow */}
            <motion.div
                animate={{
                    background: stage === 'negative'
                        ? 'radial-gradient(circle at center, rgba(71,85,105,0.3) 0%, rgba(15,23,42,0) 70%)' // Slate/Dark
                        : stage === 'positive'
                            ? 'radial-gradient(circle at center, rgba(251,191,36,0.25) 0%, rgba(15,23,42,0) 70%)' // Amber/Gold
                            : 'radial-gradient(circle at center, rgba(99,102,241,0.25) 0%, rgba(15,23,42,0) 70%)' // Indigo/Question
                }}
                className="absolute inset-0 z-0 transition-colors duration-1000"
            />

            {/* Particles/Stars for Positive state */}
            {stage === 'positive' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-0"
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], y: -20 }}
                            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                            className="absolute top-1/2 left-1/2"
                        >
                            <Sparkles className="w-4 h-4 text-amber-300/50" />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {stage === 'negative' && (
                    <motion.div
                        key="neg"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-6 z-10"
                    >
                        <div className="w-28 h-28 rounded-full bg-slate-800/80 flex items-center justify-center backdrop-blur-md border border-slate-600 shadow-xl shadow-slate-950/50">
                            <CloudRain className="w-14 h-14 text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-300 text-lg font-medium mb-1">Spot the Negative</p>
                            <p className="text-slate-500 text-xs uppercase tracking-widest">Observe without judgment</p>
                        </div>
                    </motion.div>
                )}

                {stage === 'question' && (
                    <motion.div
                        key="ques"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-6 z-10"
                    >
                        <div className="flex items-center gap-6">
                            <motion.div
                                animate={{ x: [0, -10, 0], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center grayscale opacity-60"
                            >
                                <CloudRain className="w-8 h-8 text-slate-500" />
                            </motion.div>

                            <div className="flex flex-col items-center font-serif italic text-indigo-300">
                                <span className="text-xl">Is it true?</span>
                                <ArrowRight className="w-5 h-5 mt-1 animate-pulse" />
                            </div>

                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30"
                            >
                                <Sun className="w-8 h-8 text-indigo-400" />
                            </motion.div>
                        </div>
                        <p className="text-indigo-200/60 text-xs uppercase tracking-widest">Challenge the narrative</p>
                    </motion.div>
                )}

                {stage === 'positive' && (
                    <motion.div
                        key="pos"
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="flex flex-col items-center gap-6 z-10"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-dashed border-amber-500/30"
                            />
                            <div className="w-28 h-28 rounded-full bg-amber-500/10 flex items-center justify-center backdrop-blur-md border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                                <Sun className="w-14 h-14 text-amber-400 fill-amber-400/20" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-amber-200 text-lg font-medium mb-1">New Perspective</p>
                            <p className="text-amber-500/60 text-xs uppercase tracking-widest">Balanced & Empowering</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
