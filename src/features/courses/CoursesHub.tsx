import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PowerOfNow } from '../soul-intelligence/components/PowerOfNow';

interface CoursesHubProps {
    initialChapter?: string;
}

export const CoursesHub: React.FC<CoursesHubProps> = ({ initialChapter }) => {
    const [activeCourseId, setActiveCourseId] = useState<'power-of-now' | 'untethered'>('power-of-now');

    return (
        <div className="w-full flex flex-col min-h-screen">
            {/* Courses Navigation Pills */}
            <div className="flex justify-center mb-8 relative z-20 pt-8" style={{ marginTop: '0px' }}>
                <div className="bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-[var(--border-subtle)] inline-flex gap-2 backdrop-blur-xl shadow-lg">
                    {/* Power of Now Tab */}
                    <button
                        onClick={() => setActiveCourseId('power-of-now')}
                        className={`relative px-8 py-3 rounded-xl text-xs font-serif tracking-wide transition-all duration-300 font-medium z-10 ${
                            activeCourseId === 'power-of-now' 
                                ? 'text-[var(--text-primary)]' 
                                : 'text-[var(--text-primary)] opacity-50 hover:opacity-100'
                        }`}
                    >
                        {activeCourseId === 'power-of-now' && (
                            <motion.div
                                layoutId="courses-active-tab"
                                className="absolute inset-0 bg-[var(--text-primary)]/10 rounded-xl"
                                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 w-full text-center">Power of Now</span>
                    </button>

                    {/* The Untethered Soul Tab */}
                    <button
                        onClick={() => setActiveCourseId('untethered')}
                        className={`relative px-8 py-3 rounded-xl text-xs font-serif tracking-wide transition-all duration-300 font-medium z-10 ${
                            activeCourseId === 'untethered' 
                                ? 'text-[var(--text-primary)]' 
                                : 'text-[var(--text-primary)] opacity-50 hover:opacity-100'
                        }`}
                    >
                        {activeCourseId === 'untethered' && (
                            <motion.div
                                layoutId="courses-active-tab"
                                className="absolute inset-0 bg-[var(--text-primary)]/10 rounded-xl"
                                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 w-full text-center">Wisdom Untethered</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {activeCourseId === 'power-of-now' ? (
                        <motion.div 
                            key="power-of-now"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                        >
                            <PowerOfNow initialChapter={initialChapter} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="untethered"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center justify-center py-32 px-6"
                        >
                            <div className="w-24 h-24 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] shadow-inner flex items-center justify-center mb-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-12 h-12 rounded-full border border-dashed border-[var(--text-muted)] opacity-50"
                                />
                            </div>
                            <h2 className="text-4xl font-serif font-light text-[var(--text-primary)] mb-4 tracking-tight">Wisdom Untethered</h2>
                            <p className="text-lg font-serif italic text-[var(--accent-primary)] mb-6 opacity-90 tracking-wide">Coming Soon</p>
                            <p className="text-sm text-[var(--text-muted)] text-center max-w-sm leading-relaxed">
                                A journey into the depths of your inner world is being prepared. 
                                In the meantime, continue anchoring your presence in the Power of Now.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
