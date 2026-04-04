import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PowerOfNow } from '../soul-intelligence/components/PowerOfNow';
import { useAuth } from '../auth/AuthContext';
import { AnchorButton } from '../../components/ui/SacredUI';
import { Lock } from 'lucide-react';
import { useRazorpay } from '../../hooks/useRazorpay';
import { isAdminEmail, isUnlockedUser } from '../../config/admin';

interface CoursesHubProps {
    initialChapter?: string;
    onCourseSelect?: (courseId: string) => void;
}

export const CoursesHub: React.FC<CoursesHubProps> = ({ initialChapter, onCourseSelect }) => {
    const { user, isAccessValid } = useAuth();
    const { checkOut, isProcessing } = useRazorpay();
    const [activeCourseId, setActiveCourseId] = useState<'power-of-now' | 'untethered'>('power-of-now');
    
    // Check for admin/unlocked status
    const isWisdomAuthorized = isAccessValid || (user && (isAdminEmail(user.email) || isUnlockedUser(user.email)));

    const handleUnlock = async () => {
        if (!user) {
            alert("Please sign in first to unlock this journey.");
            return;
        }

        await checkOut(
            user.uid,
            user.email || '',
            user.displayName || 'Seeker',
            'wisdom_untethered',
            () => {
                // Success callback: Firestore is updated by the cloud function
                alert("Success! The path of Wisdom Untethered is now open for you.");
            }
        );
    };

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

                    {/* Wisdom Untethered Tab */}
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
                            className="flex flex-col items-center justify-center py-32 px-6 text-center"
                        >
                            <div className="w-24 h-24 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] shadow-inner flex items-center justify-center mb-8 relative">
                                {isWisdomAuthorized ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="w-16 h-16 rounded-full border border-[var(--accent-primary)]/40 shadow-[0_0_20px_var(--glow-primary)] flex items-center justify-center"
                                    >
                                        <div className="w-4 h-4 rounded-full bg-[var(--accent-primary)]" />
                                    </motion.div>
                                ) : (
                                    <div className="relative">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="w-12 h-12 rounded-full border border-dashed border-[var(--text-muted)] opacity-50"
                                        />
                                        <Lock size={16} className="absolute inset-0 m-auto text-[var(--text-muted)] opacity-50" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-4xl font-serif font-light text-[var(--text-primary)] mb-4 tracking-tight">Wisdom Untethered</h2>
                            
                            {isWisdomAuthorized ? (
                                <>
                                    <p className="text-lg font-serif italic text-[var(--accent-primary)] mb-10 opacity-90 tracking-wide">The path is open for you.</p>
                                    <AnchorButton 
                                        variant="glow"
                                        onClick={() => onCourseSelect?.('wisdom_untethered')}
                                        className="!px-12 !py-5"
                                    >
                                        Enter Journey
                                    </AnchorButton>
                                </>
                            ) : (
                                <div className="text-center flex flex-col items-center">
                                    <p className="text-lg font-serif italic text-[var(--accent-primary)] mb-6 opacity-90 tracking-wide">A Deep Exploration of Being</p>
                                    <p className="text-sm text-[var(--text-muted)] text-center max-w-sm leading-relaxed mb-10">
                                        Join us for an advanced journey into the depths of your inner world. 
                                        Unlock full access to all Michael Singer inspired meditations and wisdom chapters.
                                    </p>
                                    
                                    <div className="flex flex-col items-center gap-4">
                                        <AnchorButton 
                                            variant="glow"
                                            onClick={handleUnlock}
                                            disabled={isProcessing}
                                            className="!px-14 !py-5 flex items-center gap-2"
                                        >
                                            {isProcessing ? "Opening Gateway..." : (
                                                <>
                                                    <Lock size={16} />
                                                    Unlock Full Journey · $9
                                                </>
                                            )}
                                        </AnchorButton>
                                        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] opacity-50 font-medium">
                                            Lifetime Access · One-time Contribution
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

