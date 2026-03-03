import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Trophy } from 'lucide-react';
import { ACHIEVEMENTS, type Achievement } from './achievementsDefs';
import { ProgressFilament } from '../../components/ui/SacredUI';

// ─── Individual Medal (Compact) ──────────────────────────────────────────────
const Medal: React.FC<{
    achievement: Achievement;
    unlocked: boolean;
    index: number;
}> = ({ achievement, unlocked, index }) => {
    const [hovered, setHovered] = React.useState(false);
    const Icon = achievement.icon;

    // Tooltip position safety
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [tooltipXOffset, setTooltipXOffset] = React.useState(0);

    React.useEffect(() => {
        if (hovered && tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            const padding = 20;
            if (rect.right > window.innerWidth - padding) {
                setTooltipXOffset(-(rect.right - window.innerWidth + padding));
            } else if (rect.left < padding) {
                setTooltipXOffset(padding - rect.left);
            }
        }
    }, [hovered]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-1.5 group relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Medal circle */}
            <div className="relative w-[54px] h-[54px]">
                {/* Glow ring for unlocked */}
                {unlocked && (
                    <motion.div
                        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ border: `1.2px solid ${achievement.color}40`, filter: `blur(4px)` }}
                    />
                )}

                {/* Main circle */}
                <div
                    className="w-full h-full rounded-full flex items-center justify-center relative border transition-all duration-700"
                    style={{
                        background: unlocked
                            ? `radial-gradient(circle at 35% 35%, ${achievement.color}25, ${achievement.color}05)`
                            : 'rgba(var(--bg-surface-rgb), 0.2)',
                        borderColor: unlocked
                            ? `${achievement.color}50`
                            : 'var(--border-subtle)',
                        boxShadow: unlocked
                            ? `0 0 12px ${achievement.color}15, inset 0 0 8px ${achievement.color}05`
                            : 'none',
                    }}
                >
                    <Icon
                        size={20}
                        strokeWidth={1.5}
                        style={{
                            color: unlocked ? achievement.color : 'var(--text-disabled)',
                            opacity: unlocked ? 1 : 0.2,
                            filter: unlocked ? `drop-shadow(0 0 8px ${achievement.color}40)` : 'none'
                        }}
                    />

                    {/* Lock overlay */}
                    {!unlocked && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                            <Lock size={7} className="text-[var(--text-disabled)] opacity-60" strokeWidth={2.5} />
                        </div>
                    )}

                    {/* Tiny star for unlocked */}
                    {unlocked && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg"
                            style={{ background: achievement.color }}
                        >
                            <Star size={6} fill="white" color="white" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Name - very tiny */}
            <span
                className="text-[8px] font-sans font-bold text-center leading-tight tracking-wider uppercase opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
                {achievement.name.split(' ')[0]}
            </span>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: `calc(-50% + ${tooltipXOffset}px)` }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-3 left-1/2 z-[100] w-48 pointer-events-none"
                    >
                        <div
                            className="px-4 py-3.5 rounded-2xl border text-center shadow-2xl backdrop-blur-2xl"
                            style={{
                                background: 'rgba(var(--bg-surface-rgb), 0.98)',
                                borderColor: unlocked ? `${achievement.color}40` : 'var(--border-subtle)',
                                boxShadow: unlocked ? `0 10px 40px ${achievement.color}20` : '0 10px 40px rgba(0,0,0,0.2)'
                            }}
                        >
                            <p className="text-[8px] uppercase tracking-[0.3em] font-bold mb-1 opacity-50 font-sans">
                                {unlocked ? 'Unlocked' : 'Locked'}
                            </p>
                            <h4 className="text-[13px] font-serif font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wider">{achievement.name}</h4>
                            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-sans italic mb-3">
                                {unlocked ? achievement.desc : achievement.criteria}
                            </p>
                            <div className="h-px w-8 bg-[var(--border-subtle)] mx-auto mb-2" />
                            <p className="text-[9px] font-bold tracking-widest font-sans"
                                style={{ color: unlocked ? achievement.color : 'var(--text-muted)' }}>
                                {unlocked ? `✦ +${achievement.points} POINTS` : `REACH: ${achievement.criteria.toUpperCase()}`}
                            </p>
                        </div>
                        {/* Arrow */}
                        <div className="w-2.5 h-2.5 rotate-45 mx-auto -mt-1.5 border-r border-b"
                            style={{
                                background: 'rgba(var(--bg-surface-rgb), 0.98)',
                                borderColor: unlocked ? `${achievement.color}40` : 'var(--border-subtle)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main Panel (Compact Strip) ───────────────────────────────────────────────
interface AchievementsPanelProps {
    unlocked: string[];
    points: number;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ unlocked, points }) => {
    const totalPossible = ACHIEVEMENTS.length;
    const totalUnlocked = unlocked.length;
    const progress = totalUnlocked / totalPossible;

    return (
        <div className="p-7 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-7 relative group/panel">
            {/* Minimal Header */}
            <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-3 h-3 text-[var(--accent-secondary)]" />
                            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] font-sans">
                                Path Milestones
                            </h4>
                        </div>
                        <p className="text-[11px] font-serif italic text-[var(--text-primary)] opacity-80">
                            {totalUnlocked} of {totalPossible} aspects awakened
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[16px] font-serif text-[var(--accent-secondary)] tracking-tight">
                            ✦ {points.toLocaleString()} <span className="text-[9px] opacity-60">PTS</span>
                        </p>
                    </div>
                </div>

                {/* Single Progress Bar */}
                <div className="px-0.5">
                    <ProgressFilament progress={progress} />
                </div>
            </div>

            {/* Tight 4x4 Grid */}
            <div className="grid grid-cols-4 gap-y-8 gap-x-2 relative z-10">
                {ACHIEVEMENTS.map((ach, i) => (
                    <Medal
                        key={ach.id}
                        achievement={ach}
                        unlocked={unlocked.includes(ach.id)}
                        index={i}
                    />
                ))}
            </div>

            {/* Subtle radial light in bg */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--accent-secondary-dim),transparent_70%)] pointer-events-none opacity-20" />
        </div>
    );
};

// Placeholder for Toast (remains same)
export const AchievementToast: React.FC<{
    achievement: Achievement | null;
    onDismiss: () => void;
}> = ({ achievement, onDismiss }) => {
    React.useEffect(() => {
        if (!achievement) return;
        const t = setTimeout(onDismiss, 5000);
        return () => clearTimeout(t);
    }, [achievement, onDismiss]);

    if (!achievement) return null;
    const Icon = achievement.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed bottom-10 right-8 z-[9999] flex items-center gap-5 px-6 py-5 rounded-[28px] border shadow-2xl backdrop-blur-2xl cursor-pointer"
                style={{
                    background: 'rgba(var(--bg-surface-rgb), 0.95)',
                    borderColor: `${achievement.color}40`,
                }}
                onClick={onDismiss}
            >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${achievement.color}15` }}>
                    <Icon size={24} style={{ color: achievement.color }} />
                </div>
                <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: achievement.color }}>Unlocked</p>
                    <h4 className="text-[18px] font-serif italic text-[var(--text-primary)]">{achievement.name}</h4>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
