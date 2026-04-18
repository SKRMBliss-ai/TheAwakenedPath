import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../features/auth/AuthContext';
import { AnchorButton } from '../ui/SacredUI';

export const PhonePromptModal: React.FC = () => {
    const { profile, user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Check if skipped within last 10 visits
    let hasRecentlySkipped = false;
    if (profile?.phonePromptSkippedAtVisit !== undefined) {
        const currentVisit = profile.visitCount || 0;
        const skipVisit = profile.phonePromptSkippedAtVisit;
        // Suppress for next 10 logins
        if (currentVisit - skipVisit <= 10) {
            hasRecentlySkipped = true;
        }
    }

    // Only show if it's the 2nd visit (or more) and phone is missing
    const shouldShow = profile && (profile.visitCount || 0) >= 2 && !profile.phoneNumber && isOpen && !hasRecentlySkipped;

    if (!shouldShow && !isSuccess) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !phone) return;

        setIsSubmitting(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                phoneNumber: phone
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to save phone number:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        if (!user) return;
        setIsOpen(false);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                phonePromptSkippedAt: new Date(),
                phonePromptSkippedAtVisit: profile?.visitCount || 0
            });
        } catch (error) {
            console.error("Failed to log skip:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[var(--bg-surface)] rounded-[32px] overflow-hidden shadow-2xl border border-[var(--border-default)] backdrop-blur-xl"
                    >
                        <div className="h-1.5 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent w-full opacity-70" />
                        
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 text-center space-y-6">
                            {isSuccess ? (
                                <div className="py-8 space-y-4 animate-in fade-in zoom-in duration-500">
                                    <div className="flex justify-center">
                                        <CheckCircle2 size={64} className="text-[#5EC4B0]" />
                                    </div>
                                    <h2 className="text-2xl font-serif text-[var(--text-primary)]">Path Connected.</h2>
                                    <p className="text-sm text-[var(--text-secondary)] opacity-80">We shall walk this journey together.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent-primary)]">Stay in Flow</p>
                                        <h2 className="text-2xl font-serif text-[var(--text-primary)] leading-tight">Deepen Your Journey.</h2>
                                    </div>

                                    <div className="w-12 h-px bg-[var(--accent-primary)] mx-auto opacity-30" />

                                    <p className="text-[15px] text-[var(--text-primary)] font-sans font-medium leading-relaxed">
                                        "Connection is the bridge to awareness."
                                        <br />
                                        <span className="text-[13px] block mt-2 opacity-100 font-normal text-[var(--text-secondary)]">
                                            Share your WhatsApp number for sacred reminders and personal guidance on your path.
                                        </span>
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4 text-center">
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent-primary)] opacity-50" size={18} />
                                            <input
                                                type="tel"
                                                placeholder="+1 234 567 890"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] outline-none text-[var(--text-primary)] font-sans placeholder:text-[var(--text-muted)] transition-all shadow-inner"
                                            />
                                        </div>

                                        <AnchorButton
                                            variant="solid"
                                            type="submit"
                                            disabled={isSubmitting || !phone}
                                            className="w-full bg-[var(--accent-primary)] text-black hover:bg-[var(--accent-primary)]/90 uppercase tracking-widest font-bold"
                                        >
                                            {isSubmitting ? 'Syncing...' : 'Connect Number'}
                                        </AnchorButton>

                                        <button 
                                            type="button"
                                            onClick={handleSkip}
                                            className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-bold mt-2"
                                        >
                                            I don't need reminders on WhatsApp
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
