// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle, Bell, Activity, Sparkles, Play, CheckCircle2, X, ChevronRight, Lock } from 'lucide-react';
import { useWitnessingVoice } from '../hooks/useWitnessingVoice';
import { getNoMindGrounding } from '../services/geminiService';
import { BodyTruthTest } from './BodyTruthTest';
import { usePresenceScheduler } from '../hooks/usePresenceScheduler';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../../theme/ThemeSystem';
import { db } from '../../../firebase';
import { doc, onSnapshot, setDoc, arrayUnion } from 'firebase/firestore';
import { useAchievements } from '../../achievements/useAchievements';
import { type UserStats } from '../../achievements/achievementsDefs';
import { isAdminEmail } from '../../../config/admin';

import { CHAPTERS } from '../teachingData';
import { VoiceService } from '../../../services/voiceService';

// ─── GRAIN OVERLAY ───────────────────────────────────────────────────────────
const GrainOverlay = () => (
    <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none', zIndex: 100 }}>
        <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
);

// ─── GHOST BUTTON — Theme Aware ──────────────────────────────────────────────
const GhostButton: React.FC<{
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    accentColor?: string;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
}> = ({ onClick, children, disabled, accentColor, onMouseDown, onMouseUp }) => {
    const [hov, setHov] = useState(false);
    return (
        <motion.button
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            disabled={disabled}
            className={`
                relative overflow-hidden px-10 py-4 rounded-full cursor-pointer
                transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                flex items-center justify-center gap-2.5
                font-sans text-[9px] font-bold uppercase tracking-[0.5em]
                ${disabled ? 'cursor-not-allowed opacity-40' : ''}
                ${hov
                    ? 'bg-[var(--bg-surface-hover)] border-[var(--accent-primary-border)] text-[var(--text-primary)] shadow-lg'
                    : 'bg-transparent border-[var(--border-default)] text-[var(--text-muted)]'
                }
                border
            `}
        >
            {children}
        </motion.button>
    );
};

// ─── SOLID BUTTON — Theme Aware ──────────────────────────────────────────────
const SolidButton: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={onClick}
        className="relative overflow-hidden px-12 py-4 rounded-full cursor-pointer border-none
            bg-[var(--accent-primary)] text-[var(--bg-primary)]
            font-sans text-[10px] font-bold uppercase tracking-[0.3em]
            shadow-lg hover:shadow-xl transition-all duration-500"
    >
        {children}
    </motion.button>
);

// ─── PROGRESS FILAMENT — Theme Aware ─────────────────────────────────────────
const ProgressFilament: React.FC<{ progress: number; label?: string }> = ({ progress, label }) => (
    <div className="w-full">
        {label && (
            <div className="flex justify-between mb-4 text-[10px] tracking-[0.2em] uppercase font-sans font-bold text-[var(--text-secondary)]">
                <span>{label}</span>
                <span className="text-[var(--text-primary)] text-[11px]">{Math.round(progress * 100)}%</span>
            </div>
        )}
        <div className="h-[4px] relative rounded-full bg-[var(--border-subtle)] shadow-inner">
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-0 bottom-0 rounded-full origin-left"
                style={{
                    background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                    boxShadow: '0 0 16px var(--accent-primary), 0 0 8px var(--accent-primary)',
                }}
            />
            <motion.div
                animate={{ left: `calc(${progress * 100}% - 6px)` }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--text-primary)]"
                style={{ boxShadow: '0 0 16px var(--accent-primary), 0 0 24px var(--accent-primary)' }}
            />
        </div>
    </div>
);

// ─── CHAPTER ICON ORB — Theme Aware ──────────────────────────────────────────
const ChapterOrb: React.FC<{ icon: any; color: string; active: boolean }> = ({ icon: Icon, color, active }) => (
    <div className="relative w-[52px] h-[52px] flex-shrink-0">
        {active && (
            <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-1.5 rounded-full pointer-events-none"
                style={{ border: `1px solid ${color}60` }}
            />
        )}
        <div
            className="w-full h-full rounded-full border flex items-center justify-center transition-all duration-500"
            style={{
                background: active ? `radial-gradient(circle, ${color}25, ${color}05)` : 'var(--bg-surface)',
                boxShadow: active ? `0 0 20px ${color}30` : 'none',
                borderColor: active ? `${color}40` : 'var(--border-subtle)',
            }}
        >
            <Icon size={20} strokeWidth={1.5} style={{ color: active ? color : 'var(--text-muted)', transition: 'color 0.4s' }} />
        </div>
    </div>
);

// ─── VIDEO PLAYER — Inline YouTube ───────────────────────────────────────────
const VideoPlayer: React.FC<{
    youtubeId: string;
    onClose: () => void;
    onComplete: () => void;
}> = ({ youtubeId, onClose, onComplete }) => {
    useEffect(() => {
        // Pause any background music when a teaching video starts
        VoiceService.pause();

        // Mark watched after 15 seconds of playback
        const timer = setTimeout(onComplete, 15000);
        return () => clearTimeout(timer);
    }, [youtubeId, onComplete]);

    return (
        <div
            className="relative w-full rounded-[20px] overflow-hidden bg-black shadow-2xl border border-[var(--border-default)]"
            style={{ aspectRatio: '16/9' }}
        >
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title="Video Lesson"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border-none
                    text-white cursor-pointer flex items-center justify-center z-10
                    hover:bg-black/80 transition-colors"
            >
                <X size={18} />
            </button>
        </div>
    );
};

// ─── SECTION DIVIDER ─────────────────────────────────────────────────────────
const SectionDivider: React.FC<{ label: string; color?: string }> = ({ label, color }) => (
    <div className="flex items-center gap-3 py-5">
        <div className="h-px flex-1" style={{ background: color ? `${color}20` : 'var(--border-subtle)' }} />
        <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-[var(--text-muted)] font-sans">
            {label}
        </span>
        <div className="h-px flex-1" style={{ background: color ? `${color}20` : 'var(--border-subtle)' }} />
    </div>
);

// ─── TEACHINGS SECTION ───────────────────────────────────────────────────────
const TeachingsSection: React.FC<{
    chapter: any;
    playingVideo: any;
    setPlayingVideo: (v: any) => void;
    watchedParts: string[];
    markAsWatched: (id: string) => void;
}> = ({ chapter, playingVideo, setPlayingVideo, watchedParts, markAsWatched }) => {
    if (!chapter.parts || chapter.parts.length === 0) return null;
    const isScrollable = chapter.parts.length >= 6;
    const watchedCount = chapter.parts.filter((p: any) => watchedParts.includes(p.id)).length;

    return (
        <div className="px-7 pb-8">
            {/* Section header with progress */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[var(--text-muted)] opacity-50" />
                    <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-[var(--text-secondary)] font-sans">
                        Lessons
                    </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-sans font-medium">
                    {watchedCount}/{chapter.parts.length} completed
                </span>
            </div>

            {/* Inline Video Player */}
            <AnimatePresence>
                {playingVideo && playingVideo.chapterId === chapter.id && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.97 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.97 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-8 overflow-hidden rounded-[32px] border border-[var(--border-subtle)] bg-black/5 shadow-2xl"
                    >
                        <VideoPlayer
                            youtubeId={playingVideo.youtubeId}
                            onClose={() => setPlayingVideo(null)}
                            onComplete={() => markAsWatched(playingVideo.partId)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video List — Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chapter.parts.map((part: any, idx: number) => {
                    const isWatched = watchedParts.includes(part.id);
                    const isPlaying = playingVideo?.partId === part.id;

                    return (
                        <motion.button
                            key={part.id}
                            whileHover={{ y: -3, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPlayingVideo({
                                chapterId: chapter.id,
                                partId: part.id,
                                youtubeId: part.youtubeId,
                            })}
                            className={`
                                flex flex-col cursor-pointer rounded-[20px]
                                transition-all duration-300 text-left border overflow-hidden
                                ${isPlaying
                                    ? 'bg-[var(--bg-surface-hover)] border-[var(--accent-primary)] shadow-xl ring-1 ring-[var(--accent-primary)]/20'
                                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-primary-muted)] hover:bg-[var(--bg-surface-hover)] hover:shadow-md'
                                }
                            `}
                        >
                            {/* Thumbnail – full width, 16:9 */}
                            <div className="relative w-full aspect-video bg-black/40 flex-shrink-0">
                                <img
                                    src={`https://img.youtube.com/vi/${part.youtubeId}/mqdefault.jpg`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{ opacity: isPlaying ? 0.9 : 0.72 }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                {/* Play / Live overlay */}
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    {isPlaying ? (
                                        <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] animate-ping" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                            <Play size={14} fill="white" color="white" className="ml-0.5 opacity-90" />
                                        </div>
                                    )}
                                </div>
                                {/* Watched badge */}
                                {isWatched && (
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-[var(--bg-surface)] rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2
                                                size={16}
                                                className="text-[var(--accent-primary)]"
                                                fill="currentColor"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info — full width text */}
                            <div className="p-3.5">
                                <p className="text-[9px] font-sans font-black opacity-30 mb-1 tracking-wider">
                                    {part.id.includes('bonus') ? 'BONUS' : part.id.toUpperCase()}
                                </p>
                                <h5 className="text-[13px] font-serif font-medium leading-snug text-[var(--text-primary)] mb-2 line-clamp-2">
                                    {part.title}
                                </h5>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[10px] text-[var(--text-secondary)] font-sans tracking-wider font-bold">
                                        {part.duration}
                                    </span>
                                    {isPlaying && (
                                        <span className="text-[9px] text-[var(--accent-primary)] font-sans font-black uppercase tracking-widest animate-pulse">
                                            Live
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
interface PowerOfNowProps {
    initialChapter?: string;
    onReturn?: () => void;
}

export const PowerOfNow: React.FC<PowerOfNowProps> = ({ initialChapter, onReturn }) => {
    const { user } = useAuth();
    const {
        isListening, transcript, reflection, isProcessing,
        startListening, stopListening
    } = useWitnessingVoice();
    const { lastReminder, requestPermission } = usePresenceScheduler();

    // Admin Check
    const isAdmin = isAdminEmail(user?.email);

    // UI State
    const [panicMode, setPanicMode] = useState(false);
    const [groundingText, setGroundingText] = useState('');
    const [expanded, setExpanded] = useState<string | null>(initialChapter || 'observer');
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        typeof Notification !== 'undefined' && Notification.permission === 'granted'
    );

    // Video Teaching State
    const [playingVideo, setPlayingVideo] = useState<{
        chapterId: string;
        partId: string;
        youtubeId: string;
    } | null>(null);
    const [watchedParts, setWatchedParts] = useState<string[]>([]);

    // Sync Progress from Firestore
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(
            doc(db, 'users', user.uid, 'progress', 'powerOfNow'),
            (snap) => {
                if (snap.exists()) {
                    setWatchedParts(snap.data().watched || []);
                }
            }
        );
        return unsub;
    }, [user]);

    const { awardEvent, checkAndUnlock } = useAchievements();

    const markAsWatched = async (partId: string) => {
        if (!user || watchedParts.includes(partId)) return;
        try {
            await setDoc(
                doc(db, 'users', user.uid, 'progress', 'powerOfNow'),
                { watched: arrayUnion(partId) },
                { merge: true }
            );

            // Award points for video watched
            await awardEvent('video_watched');

            // Calculate current stats to check for chapter completions
            const newWatched = [...watchedParts, partId];
            const chaptersComplete = CHAPTERS.filter(ch =>
                ch.parts.every(p => newWatched.includes(p.id))
            ).length;

            checkAndUnlock({
                journalEntries: 0,
                situationalPractices: 0,
                journeyActivities: 0,
                videosWatched: newWatched.length,
                chaptersComplete,
                currentStreak: 0,
                maxStreak: 0,
                panicUsed: panicMode ? 1 : 0,
                bodyTruthTests: 0,
                voiceWitnessed: 0,
                remindersEnabled: notificationsEnabled,
                statsViewed: 0,
            });

        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    // Watch for notification change to award 'Presence Bell'
    useEffect(() => {
        if (notificationsEnabled) {
            awardEvent('reminders_enabled');
            checkAndUnlock({
                journalEntries: 0,
                situationalPractices: 0,
                journeyActivities: 0,
                videosWatched: watchedParts.length,
                chaptersComplete: CHAPTERS.filter(ch => ch.parts.every(p => watchedParts.includes(p.id))).length,
                currentStreak: 0,
                maxStreak: 0,
                panicUsed: 0,
                bodyTruthTests: 0,
                voiceWitnessed: 0,
                remindersEnabled: true,
                statsViewed: 0,
            });
        }
    }, [notificationsEnabled, awardEvent, checkAndUnlock, watchedParts]);

    useEffect(() => {
        if (initialChapter) setExpanded(initialChapter);
    }, [initialChapter]);

    const handleEnableNotifications = () => {
        requestPermission();
        setNotificationsEnabled(true);
    };

    const togglePanic = () => {
        setPanicMode(p => !p);
        if (!panicMode) {
            awardEvent('panic_used');
            checkAndUnlock({
                journalEntries: 0,
                situationalPractices: 0,
                journeyActivities: 0,
                videosWatched: watchedParts.length,
                chaptersComplete: 0,
                currentStreak: 0,
                maxStreak: 0,
                panicUsed: 1,
                bodyTruthTests: 0,
                voiceWitnessed: 0,
                remindersEnabled: notificationsEnabled,
                statsViewed: 0,
            });
        }
    };

    const runGrounding = async (input: string) => {
        const exercise = await getNoMindGrounding(input);
        setGroundingText(exercise);
    };

    // Watch for voice reflection completion
    useEffect(() => {
        if (reflection) {
            awardEvent('voice_witnessed');
            checkAndUnlock({
                journalEntries: 0,
                situationalPractices: 0,
                journeyActivities: 0,
                videosWatched: watchedParts.length,
                chaptersComplete: 0,
                currentStreak: 0,
                maxStreak: 0,
                panicUsed: 0,
                bodyTruthTests: 0,
                voiceWitnessed: 1,
                remindersEnabled: notificationsEnabled,
                statsViewed: 0,
            });
        }
    }, [reflection, awardEvent, checkAndUnlock, watchedParts, notificationsEnabled]);

    // ── Compute real progress ─────────────────────────────────────────────────
    const totalParts = CHAPTERS.reduce((sum, ch) => sum + ch.parts.length, 0);
    const progressValue = totalParts > 0 ? watchedParts.length / totalParts : 0;

    // ── Animation variants ────────────────────────────────────────────────────
    const pageIn = {
        hidden: { opacity: 0, y: 16, filter: 'blur(12px)' },
        visible: {
            opacity: 1, y: 0, filter: 'blur(0px)',
            transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }
        },
    };
    const childIn = {
        hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
        visible: {
            opacity: 1, y: 0, filter: 'blur(0px)',
            transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        },
    };

    return (
        <div className="w-full mx-auto px-6 pt-12 pb-40 relative">
            <GrainOverlay />

            {/* Subtle ambient glow — small and restrained */}
            <motion.div
                animate={{ opacity: [0.04, 0.08, 0.04], scale: [1, 1.04, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="fixed top-[35%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full pointer-events-none -z-10"
                style={{
                    background: 'radial-gradient(ellipse, var(--accent-primary-muted), transparent)',
                    filter: 'blur(100px)',
                }}
            />

            <motion.div variants={pageIn} initial="hidden" animate="visible" className="relative z-10">

                {/* ═══════════════════════════════════════════════════════════════
                    HEADER — Clean, no glow blobs
                ═══════════════════════════════════════════════════════════════ */}
                <motion.header variants={childIn} className="mb-16 relative">
                    <div className="flex flex-col gap-8">
                        {/* Label */}
                        <div className="flex items-center gap-2.5">
                            <Sparkles
                                size={12}
                                className="text-[var(--accent-secondary)] opacity-50"
                                strokeWidth={1.5}
                            />
                            <span className="text-[9px] tracking-[0.6em] uppercase text-[var(--text-secondary)] font-bold font-sans">
                                Consciousness Stream
                            </span>
                        </div>

                        {/* Title + Progress side by side */}
                        <div className="flex justify-between items-start flex-wrap gap-6">
                            <div>
                                <h1 className="text-[clamp(40px,5vw,60px)] font-serif font-light tracking-tight m-0 leading-[0.95] text-[var(--text-primary)]">
                                    The Power<br />of Now
                                </h1>
                                <p className="text-[10px] tracking-[0.65em] uppercase text-[var(--text-secondary)] font-sans font-bold mt-4 opacity-90">
                                    Eckhart Tolle · Living Study
                                </p>
                            </div>

                            {/* Real progress — computed from watched videos */}
                            <div className="text-right pt-2">
                                <p className="text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-[var(--text-primary)] font-sans font-bold mb-1">
                                    Progress
                                </p>
                                <motion.span
                                    key={watchedParts.length}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[44px] sm:text-[50px] font-serif font-light leading-none text-[var(--accent-primary)] flex items-baseline justify-end gap-1.5"
                                >
                                    {watchedParts.length}
                                    <span className="text-[20px] font-medium text-[var(--text-secondary)]">
                                        / {totalParts}
                                    </span>
                                </motion.span>
                            </div>
                        </div>

                        {/* Progress filament — real data */}
                        <div className="pt-2">
                            <ProgressFilament progress={progressValue} label="Teachings Completed" />
                        </div>
                    </div>
                </motion.header>

                {/* ═══════════════════════════════════════════════════════════════
                    CHAPTERS — Clean accordion, no glow blobs
                ═══════════════════════════════════════════════════════════════ */}
                <motion.div variants={childIn} className="flex flex-col gap-2">
                    {CHAPTERS.map((chapter) => {
                        const isOpen = expanded === chapter.id;
                        const chWatched = chapter.parts.filter(p => watchedParts.includes(p.id)).length;

                        return (
                            <motion.div key={chapter.id} layout className="relative">
                                {/* Clean card — NO glow blobs */}
                                <motion.div
                                    layout
                                    className="rounded-[24px] border overflow-hidden relative z-10 transition-all duration-500"
                                    style={{
                                        background: 'var(--bg-surface)',
                                        borderColor: isOpen ? `${chapter.color}25` : 'var(--border-subtle)',
                                        boxShadow: isOpen ? `0 8px 32px rgba(0,0,0,0.06)` : 'none',
                                    }}
                                >
                                    {/* Active accent — thin colored top-line instead of glow */}
                                    {isOpen && (
                                        <div
                                            className="absolute top-0 left-6 right-6 h-px"
                                            style={{
                                                background: `linear-gradient(90deg, transparent, ${chapter.color}40, transparent)`
                                            }}
                                        />
                                    )}

                                    {/* ── CHAPTER TRIGGER ── */}
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : chapter.id)}
                                        className="w-full bg-transparent border-none cursor-pointer p-5 px-7 flex items-center gap-5 text-left
                                            hover:bg-[var(--bg-surface-hover)] transition-colors duration-300"
                                    >
                                        <ChapterOrb icon={chapter.icon} color={chapter.color} active={isOpen} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[8px] tracking-[0.55em] uppercase text-[var(--text-muted)] font-sans font-bold">
                                                        Chapter {chapter.num}
                                                    </span>
                                                    {chWatched > 0 && (
                                                        <span className="text-[9px] text-[var(--accent-primary)] font-sans font-medium">
                                                            {chWatched}/{chapter.parts.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0.6 : 0.25 }}
                                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                >
                                                    <ChevronRight size={16} className="text-[var(--text-muted)]" />
                                                </motion.div>
                                            </div>
                                            <h4
                                                className="text-[24px] font-serif font-light m-0 tracking-tight transition-colors duration-400"
                                                style={{ color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                            >
                                                {chapter.subtitle}
                                            </h4>
                                            {/* Description — only visible when collapsed */}
                                            <AnimatePresence>
                                                {!isOpen && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 0.6, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="text-xs font-serif italic text-[var(--text-muted)] mt-1.5 leading-relaxed overflow-hidden"
                                                    >
                                                        {chapter.desc}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </button>

                                    {/* ── CHAPTER CONTENT ── */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{
                                                    height: 'auto', opacity: 1,
                                                    transition: {
                                                        height: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                                                        opacity: { duration: 0.4, delay: 0.15 }
                                                    }
                                                }}
                                                exit={{
                                                    height: 0, opacity: 0,
                                                    transition: {
                                                        height: { duration: 0.4 },
                                                        opacity: { duration: 0.15 }
                                                    }
                                                }}
                                                className="overflow-hidden"
                                            >
                                                {/* Description */}
                                                <div className="px-7 pb-6">
                                                    <p className="text-sm font-serif italic text-[var(--text-muted)] leading-relaxed font-light
                                                        pl-4 border-l border-[var(--border-subtle)] max-w-[550px]">
                                                        {chapter.desc}
                                                    </p>
                                                </div>

                                                {/* ── TEACHINGS ── */}
                                                <TeachingsSection
                                                    chapter={chapter}
                                                    playingVideo={playingVideo}
                                                    setPlayingVideo={setPlayingVideo}
                                                    watchedParts={watchedParts}
                                                    markAsWatched={markAsWatched}
                                                />

                                                {/* ── DIVIDER before Practice Tool ── */}
                                                {(chapter.id === 'observer' || chapter.id === 'consciousness' || chapter.id === 'now') && (
                                                    <div className="px-7">
                                                        <SectionDivider label="Interactive Practice" color={chapter.color} />

                                                        {!isAdmin && (
                                                            <div className="flex flex-col items-center justify-center py-12 mb-8 opacity-70">
                                                                <div className="w-16 h-16 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] shadow-inner flex items-center justify-center mb-5">
                                                                    <Lock size={22} className="text-[var(--text-muted)]" strokeWidth={1.5} />
                                                                </div>
                                                                <h3 className="text-2xl font-serif font-light text-[var(--text-primary)] mb-2 tracking-tight">Practice Coming Soon</h3>
                                                                <p className="text-sm font-serif italic text-[var(--text-muted)] tracking-wide">This deeper integration is being prepared for you.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* ── CHAPTER I: WITNESS THE VOICE ── */}
                                                {isAdmin && chapter.id === 'observer' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.7, delay: 0.1 }}
                                                        className="px-7 pb-10 flex flex-col items-center gap-8 text-center"
                                                    >
                                                        {/* Mic orb */}
                                                        <div className="relative flex items-center justify-center">
                                                            <motion.div
                                                                animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.12, 0.05] }}
                                                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                                                className="absolute w-36 h-36 rounded-full pointer-events-none"
                                                                style={{ background: chapter.color, filter: 'blur(30px)' }}
                                                            />
                                                            <AnimatePresence>
                                                                {isListening && (
                                                                    <motion.div
                                                                        initial={{ scale: 1, opacity: 0.4 }}
                                                                        animate={{ scale: 2.2, opacity: 0 }}
                                                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                                                        className="absolute w-20 h-20 rounded-full"
                                                                        style={{ background: chapter.color }}
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                            <div
                                                                className="w-20 h-20 rounded-full border flex items-center justify-center relative transition-all duration-500"
                                                                style={{
                                                                    background: isListening
                                                                        ? `radial-gradient(circle, ${chapter.color}30, ${chapter.color}08)`
                                                                        : 'var(--bg-surface)',
                                                                    boxShadow: isListening ? `0 0 30px ${chapter.color}40` : 'none',
                                                                    borderColor: isListening ? `${chapter.color}50` : 'var(--border-subtle)',
                                                                }}
                                                            >
                                                                <Mic
                                                                    size={26}
                                                                    strokeWidth={1.5}
                                                                    style={{
                                                                        color: isListening ? chapter.color : 'var(--text-muted)',
                                                                        transition: 'color 0.4s'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-3xl font-serif font-light text-[var(--text-primary)] mb-3 tracking-tight">
                                                                Witness the Voice
                                                            </h3>
                                                            <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed font-serif italic font-light mx-auto">
                                                                Share a thought that has been circling. Let the Observer's light shine on it.
                                                            </p>
                                                        </div>

                                                        <GhostButton onMouseDown={startListening} onMouseUp={stopListening}>
                                                            {isListening ? 'Listening with Deep Presence…' : 'Anchor Consciousness'}
                                                        </GhostButton>

                                                        {/* Transcript + Reflection */}
                                                        <AnimatePresence>
                                                            {(transcript || reflection || isProcessing) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 0.7 }}
                                                                    className="w-full grid grid-cols-2 gap-5 text-left"
                                                                >
                                                                    <div>
                                                                        <p className="text-[8px] tracking-[0.5em] uppercase text-[var(--text-muted)] font-sans font-bold mb-3">
                                                                            Mind's Form
                                                                        </p>
                                                                        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                                                                            <p className="text-lg font-serif italic text-[var(--text-secondary)] leading-relaxed m-0 font-light">
                                                                                "{transcript || 'Listening to the thought…'}"
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[8px] tracking-[0.5em] uppercase text-[var(--accent-primary)] font-sans font-bold mb-3 opacity-90">
                                                                            Presence's Light
                                                                        </p>
                                                                        <div
                                                                            className="p-6 rounded-2xl border"
                                                                            style={{
                                                                                background: `${chapter.color}06`,
                                                                                borderColor: `${chapter.color}15`
                                                                            }}
                                                                        >
                                                                            <p className="text-lg font-serif text-[var(--accent-primary)] leading-relaxed m-0 font-light">
                                                                                {isProcessing
                                                                                    ? 'Seeing beyond the veil…'
                                                                                    : (reflection || 'Silent witnessing…')
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}

                                                {/* ── CHAPTER II: INNER BODY ── */}
                                                {isAdmin && chapter.id === 'consciousness' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="px-7 pb-10"
                                                    >
                                                        <BodyTruthTest onComplete={() => {
                                                            awardEvent('body_truth_test');
                                                            checkAndUnlock({
                                                                journalEntries: 0,
                                                                situationalPractices: 0,
                                                                journeyActivities: 0,
                                                                videosWatched: watchedParts.length,
                                                                chaptersComplete: 0,
                                                                currentStreak: 0,
                                                                maxStreak: 0,
                                                                panicUsed: 0,
                                                                bodyTruthTests: 1,
                                                                voiceWitnessed: 0,
                                                                remindersEnabled: notificationsEnabled,
                                                                statsViewed: 0,
                                                            });
                                                        }} />
                                                    </motion.div>
                                                )}

                                                {/* ── CHAPTER III: MOVING INTO THE NOW ── */}
                                                {isAdmin && chapter.id === 'now' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="px-7 pb-12 flex flex-col items-center gap-7 text-center"
                                                    >
                                                        <div className="relative">
                                                            <motion.div
                                                                animate={{ opacity: [0.04, 0.1, 0.04] }}
                                                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                                                className="absolute w-28 h-28 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                                style={{ background: chapter.color, filter: 'blur(30px)' }}
                                                            />
                                                            <div
                                                                className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                                                                style={{
                                                                    background: `${chapter.color}0A`,
                                                                    border: `1px solid ${chapter.color}18`
                                                                }}
                                                            >
                                                                <Bell size={26} strokeWidth={1.5} style={{ color: chapter.color }} />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-3xl font-serif font-light text-[var(--text-primary)] mb-3">
                                                                The Routine as Ritual
                                                            </h3>
                                                            <p className="text-sm font-serif italic text-[var(--text-muted)] max-w-sm leading-relaxed font-light mx-auto">
                                                                Every transition is an invitation to leave the mind and arrive in the Now.
                                                            </p>
                                                        </div>

                                                        {notificationsEnabled
                                                            ? <GhostButton disabled>Reminders Active</GhostButton>
                                                            : <SolidButton onClick={handleEnableNotifications}>Awaken Reminders</SolidButton>
                                                        }

                                                        <AnimatePresence>
                                                            {lastReminder && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 16 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="w-full pt-7 border-t border-[var(--border-subtle)] flex flex-col items-center gap-4"
                                                                >
                                                                    <p className="text-[8px] tracking-[0.5em] uppercase text-[var(--text-muted)] font-sans font-bold">
                                                                        Latest Gate to Presence
                                                                    </p>
                                                                    <div className="px-7 py-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-sm">
                                                                        <p className="text-lg text-[var(--accent-primary)] font-serif italic leading-relaxed m-0 font-light">
                                                                            "{lastReminder}"
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}

                                                {/* ── CHAPTER IV: BEYOND THE STORM ── */}
                                                {chapter.id === 'bonus' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="px-7 pb-12 flex flex-col items-center gap-9 text-center"
                                                    >
                                                        <div className="relative">
                                                            <motion.div
                                                                animate={{ opacity: [0.04, 0.1, 0.04] }}
                                                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                                                className="absolute w-28 h-28 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                                style={{ background: chapter.color, filter: 'blur(30px)' }}
                                                            />
                                                            <div
                                                                className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                                                                style={{
                                                                    background: `${chapter.color}0A`,
                                                                    border: `1px solid ${chapter.color}18`
                                                                }}
                                                            >
                                                                <Sparkles size={28} strokeWidth={1.5} style={{ color: chapter.color }} />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-3xl font-serif font-light text-[var(--text-primary)] mb-4 tracking-tight">
                                                                Presence Portal
                                                            </h3>
                                                            <p className="text-sm font-serif italic text-[var(--text-muted)] max-w-sm leading-relaxed font-light mx-auto">
                                                                When the mind's storm is too loud, enter the portal to return to the silence of being.
                                                            </p>
                                                        </div>

                                                        <GhostButton onClick={togglePanic}>
                                                            Enter Presence Portal
                                                        </GhostButton>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════
                PANIC OVERLAY — Theme Aware
            ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {panicMode && (
                    <motion.div
                        initial={{ opacity: 0, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(20px)' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-8"
                        style={{ background: 'var(--bg-deep)', backdropFilter: 'blur(40px)' }}
                    >
                        {/* Subtle ambient glow — restrained */}
                        <motion.div
                            animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.05, 1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
                            style={{
                                background: 'radial-gradient(circle, var(--accent-primary-muted), transparent)',
                                filter: 'blur(100px)',
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="max-w-lg w-full text-center relative z-10 flex flex-col items-center gap-8"
                        >
                            {/* Orb */}
                            <div className="relative w-20 h-20">
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0, 0.25] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute -inset-2 rounded-full border border-[var(--accent-primary-border)]"
                                />
                                <div className="w-full h-full rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center">
                                    <AlertCircle size={28} strokeWidth={1.5} className="text-[var(--accent-primary)]" />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-6xl font-serif font-light text-[var(--text-primary)] mb-4 tracking-tight leading-none">
                                    Stay Here
                                </h2>
                                <p className="text-lg font-serif italic text-[var(--text-secondary)] leading-relaxed font-light m-0">
                                    {groundingText || 'The thoughts are noise. Your breath is the silence.\nFeel the life within your hands right now.'}
                                </p>
                            </div>

                            <div
                                className="w-16 h-px"
                                style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary-border), transparent)' }}
                            />

                            {!groundingText ? (
                                <div className="flex flex-col gap-3 w-full max-w-sm">
                                    <button
                                        onClick={() => runGrounding('Panic')}
                                        className="px-8 py-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)]
                                            text-[var(--text-secondary)] font-serif text-lg font-light italic
                                            cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
                                    >
                                        I am lost in worry
                                    </button>
                                    <button
                                        onClick={togglePanic}
                                        className="bg-transparent border-none cursor-pointer text-[8px]
                                            tracking-[0.5em] uppercase text-[var(--text-muted)] font-sans font-bold
                                            p-3 hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        No, I have returned
                                    </button>
                                </div>
                            ) : (
                                <SolidButton onClick={() => setGroundingText('')}>
                                    I have Returned
                                </SolidButton>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
