import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Trophy } from 'lucide-react';
import { ACHIEVEMENTS, CATEGORY_LABELS, type Achievement, type AchievementCategory } from './achievementsDefs';

// ─── Individual Medal ──────────────────────────────────────────────────────────
const Medal: React.FC<{
    achievement: Achievement;
    unlocked: boolean;
    index: number;
}> = ({ achievement, unlocked, index }) => {
    const [hovered, setHovered] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-2.5 group relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Medal circle */}
            <div className="relative w-[76px] h-[76px]">
                {/* Glow ring for unlocked */}
                {unlocked && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.12, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ border: `1.5px solid ${achievement.color}60`, filter: `blur(3px)` }}
                    />
                )}

                {/* Main circle */}
                <div
                    className="w-full h-full rounded-full flex items-center justify-center relative border-2 transition-all duration-500"
                    style={{
                        background: unlocked
                            ? `radial-gradient(circle at 35% 35%, ${achievement.color}40, ${achievement.color}10)`
                            : 'var(--bg-surface)',
                        borderColor: unlocked ? `${achievement.color}70` : 'var(--border-default)',
                        filter: unlocked ? 'none' : 'grayscale(100%)',
                        opacity: unlocked ? 1 : 0.45,
                        boxShadow: unlocked
                            ? `0 0 20px ${achievement.color}30, inset 0 0 10px ${achievement.color}10`
                            : 'none',
                    }}
                >
                    <span className="text-3xl select-none" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>
                        {achievement.icon}
                    </span>

                    {/* Lock overlay */}
                    {!unlocked && (
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] flex items-center justify-center">
                            <Lock size={10} className="text-[var(--text-disabled)]" strokeWidth={2} />
                        </div>
                    )}

                    {/* Checkmark for unlocked */}
                    {unlocked && (
                        <div
                            className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: achievement.color }}
                        >
                            <Star size={9} fill="white" color="white" strokeWidth={0} />
                        </div>
                    )}
                </div>
            </div>

            {/* Name */}
            <span
                className="text-[10px] font-sans font-bold text-center leading-tight max-w-[76px] tracking-wide transition-colors"
                style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-disabled)' }}
            >
                {achievement.name}
            </span>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -top-[90px] left-1/2 -translate-x-1/2 z-50 w-44 pointer-events-none"
                    >
                        <div
                            className="px-3 py-2.5 rounded-xl border text-center shadow-2xl backdrop-blur-lg"
                            style={{
                                background: 'var(--bg-surface)',
                                borderColor: unlocked ? `${achievement.color}40` : 'var(--border-subtle)',
                            }}
                        >
                            <p className="text-[11px] font-bold text-[var(--text-primary)] mb-0.5">{achievement.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] leading-snug font-serif italic">
                                {unlocked ? achievement.desc : achievement.criteria}
                            </p>
                            <p className="text-[9px] font-bold mt-1.5"
                                style={{ color: unlocked ? achievement.color : 'var(--text-disabled)' }}>
                                {unlocked ? `✦ +${achievement.points} pts earned` : `🔒 ${achievement.criteria}`}
                            </p>
                        </div>
                        {/* Arrow */}
                        <div className="w-2 h-2 rotate-45 mx-auto -mt-1 border-r border-b"
                            style={{
                                background: 'var(--bg-surface)',
                                borderColor: unlocked ? `${achievement.color}40` : 'var(--border-subtle)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Category Row ──────────────────────────────────────────────────────────────
const CategoryRow: React.FC<{
    category: AchievementCategory;
    achievements: Achievement[];
    unlocked: string[];
}> = ({ category, achievements, unlocked }) => {
    const unlockedCount = achievements.filter((a) => unlocked.includes(a.id)).length;

    return (
        <div className="space-y-4">
            {/* Row header */}
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] font-sans">
                        {CATEGORY_LABELS[category]}
                    </h5>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {unlockedCount} / {achievements.length} unlocked
                    </p>
                </div>
                {/* Mini progress dots */}
                <div className="flex gap-1">
                    {achievements.map((a) => (
                        <div
                            key={a.id}
                            className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                            style={{
                                background: unlocked.includes(a.id) ? a.color : 'var(--border-default)',
                                opacity: unlocked.includes(a.id) ? 1 : 0.4,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Medal grid */}
            <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
                {achievements.map((ach, i) => (
                    <Medal
                        key={ach.id}
                        achievement={ach}
                        unlocked={unlocked.includes(ach.id)}
                        index={i}
                    />
                ))}
            </div>
        </div>
    );
};

// ─── Main Panel ────────────────────────────────────────────────────────────────
interface AchievementsPanelProps {
    unlocked: string[];
    points: number;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ unlocked, points }) => {
    const categories: AchievementCategory[] = ['witnessing', 'presence-study', 'streaks', 'practices'];

    const achievementsByCategory = useMemo(() =>
        categories.reduce((acc, cat) => {
            acc[cat] = ACHIEVEMENTS.filter((a) => a.category === cat);
            return acc;
        }, {} as Record<AchievementCategory, Achievement[]>),
        []
    );

    const totalPossible = ACHIEVEMENTS.length;
    const totalUnlocked = unlocked.length;

    return (
        <div className="p-8 rounded-[24px] border-2 border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-[#FFD700]" />
                    <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                        Achievements
                    </h4>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[11px] font-bold" style={{ color: '#FFD700' }}>
                        ✦ {points.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {totalUnlocked}/{totalPossible}
                    </span>
                </div>
            </div>

            {/* Overall progress bar */}
            <div className="h-[3px] w-full rounded-full bg-[var(--border-subtle)] overflow-hidden">
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: totalPossible > 0 ? totalUnlocked / totalPossible : 0 }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full origin-left"
                    style={{ background: 'linear-gradient(90deg, #ABCEC9, #FFD700)' }}
                />
            </div>

            {/* Category rows */}
            <div className="space-y-8">
                {categories.map((cat) => (
                    <CategoryRow
                        key={cat}
                        category={cat}
                        achievements={achievementsByCategory[cat]}
                        unlocked={unlocked}
                    />
                ))}
            </div>
        </div>
    );
};

// ─── Unlock Toast ──────────────────────────────────────────────────────────────
export const AchievementToast: React.FC<{
    achievement: Achievement | null;
    onDismiss: () => void;
}> = ({ achievement, onDismiss }) => {
    React.useEffect(() => {
        if (!achievement) return;
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [achievement, onDismiss]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, x: 80, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 80, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed bottom-8 right-6 z-[9999] flex items-center gap-4 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl cursor-pointer"
                    style={{
                        background: 'var(--bg-surface)',
                        borderColor: `${achievement.color}50`,
                        boxShadow: `0 8px 40px ${achievement.color}25`,
                    }}
                    onClick={onDismiss}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
                        style={{ background: `${achievement.color}20`, border: `1.5px solid ${achievement.color}50` }}
                    >
                        {achievement.icon}
                    </div>
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold font-sans mb-0.5"
                            style={{ color: achievement.color }}>
                            Achievement Unlocked
                        </p>
                        <p className="text-[13px] font-serif font-medium text-[var(--text-primary)]">
                            {achievement.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-sans">
                            +{achievement.points} pts
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
