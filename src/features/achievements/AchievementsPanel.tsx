import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { ACHIEVEMENTS, type Achievement } from './achievementsDefs';
import { ProgressFilament } from '../../components/ui/SacredUI';
import { Medal } from '../../components/domain/MedalGrid';

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
                            <Trophy className="w-4 h-4 text-[var(--accent-secondary)]" />
                            <h4 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-[0.25em] font-sans">
                                Path Milestones
                            </h4>
                        </div>
                        <p className="text-[13px] font-serif italic text-[var(--text-secondary)]">
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
