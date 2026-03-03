import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Trophy, ArrowRight } from 'lucide-react';
import { ACHIEVEMENTS, CATEGORY_LABELS, CATEGORY_COLORS, type Achievement, type AchievementCategory } from './achievementsDefs';
import { ProgressFilament } from '../../components/ui/SacredUI';

// ─── Individual Medal ──────────────────────────────────────────────────────────
const Medal: React.FC<{
    achievement: Achievement;
    unlocked: boolean;
    index: number;
    categoryColor: string;
}> = ({ achievement, unlocked, index, categoryColor }) => {
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
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-2 group relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Medal circle */}
            <div className="relative w-[60px] h-[60px]">
                {/* Glow ring for unlocked */}
                {unlocked && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ border: `1.2px solid ${achievement.color}50`, filter: `blur(4px)` }}
                    />
                )}

                {/* Main circle */}
                <div
                    className="w-full h-full rounded-full flex items-center justify-center relative border transition-all duration-700"
                    style={{
                        background: unlocked
                            ? `radial-gradient(circle at 35% 35%, ${achievement.color}35, ${achievement.color}10)`
                            : `${categoryColor}08`,
                        borderColor: unlocked ? `${achievement.color}60` : `${categoryColor}20`,
                        boxShadow: unlocked
                            ? `0 0 15px ${achievement.color}25, inset 0 0 10px ${achievement.color}05`
                            : 'none',
                    }}
                >
                    <Icon
                        size={24}
                        strokeWidth={1.5}
                        style={{
                            color: unlocked ? achievement.color : 'var(--text-disabled)',
                            opacity: unlocked ? 1 : 0.35,
                            filter: unlocked ? `drop-shadow(0 0 8px ${achievement.color}40)` : 'none'
                        }}
                    />

                    {/* Lock overlay */}
                    {!unlocked && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                            <Lock size={8} className="text-[var(--text-disabled)]" strokeWidth={2.5} />
                        </div>
                    )}

                    {/* Checkmark for unlocked */}
                    {unlocked && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg"
                            style={{ background: achievement.color }}
                        >
                            <Star size={8} fill="white" color="white" strokeWidth={0} />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Name */}
            <span
                className="text-[9px] font-sans font-bold text-center leading-tight max-w-[64px] tracking-wide transition-colors"
                style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
                {achievement.name}
            </span>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: `calc(-50% + ${tooltipXOffset}px)` }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -top-[100px] left-1/2 z-50 w-44 pointer-events-none"
                    >
                        <div
                            className="px-3.5 py-3 rounded-2xl border text-center shadow-2xl backdrop-blur-xl"
                            style={{
                                background: 'rgba(var(--bg-surface-rgb), 0.9)',
                                borderColor: unlocked ? `${achievement.color}30` : 'var(--border-subtle)',
                                boxShadow: unlocked ? `0 10px 30px ${achievement.color}15` : 'none'
                            }}
                        >
                            <h4 className="text-[14px] font-serif font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wider">{achievement.name}</h4>
                            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-sans italic mb-2">
                                {unlocked ? achievement.desc : achievement.criteria}
                            </p>
                            <div className="h-px w-8 bg-[var(--border-subtle)] mx-auto mb-2" />
                            <p className="text-[9px] font-bold tracking-widest font-sans"
                                style={{ color: unlocked ? achievement.color : 'var(--text-disabled)' }}>
                                {unlocked ? `✦ +${achievement.points} POINTS` : `🔒 UNLOCK AT ${achievement.criteria.toUpperCase()}`}
                            </p>
                        </div>
                        {/* Arrow */}
                        <div className="w-2.5 h-2.5 rotate-45 mx-auto -mt-1.5 border-r border-b"
                            style={{
                                background: 'var(--bg-surface)',
                                borderColor: unlocked ? `${achievement.color}30` : 'var(--border-subtle)',
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
    const progress = unlockedCount / achievements.length;
    const accentColor = CATEGORY_COLORS[category];

    return (
        <div className="space-y-6 pt-2">
            {/* Divider Line */}
            <div className="h-px w-full bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />

            {/* Row header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border-l-2 pl-3" style={{ borderColor: accentColor }}>
                        <h5 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--text-primary)] font-sans">
                            {CATEGORY_LABELS[category]}
                        </h5>
                        <span className="text-[9px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface-hover)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                            {unlockedCount} / {achievements.length}
                        </span>
                    </div>
                </div>

                {/* Thin Progress Filament */}
                <div className="px-1">
                    <ProgressFilament progress={progress} />
                </div>
            </div>

            {/* Medal grid */}
            <div className="flex gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none">
                {achievements
                    .sort((a, b) => {
                        const aU = unlocked.includes(a.id) ? 1 : 0;
                        const bU = unlocked.includes(b.id) ? 1 : 0;
                        return bU - aU;
                    })
                    .map((ach, i) => (
                        <Medal
                            key={ach.id}
                            achievement={ach}
                            unlocked={unlocked.includes(ach.id)}
                            index={i}
                            categoryColor={accentColor}
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

    const unlockedAch = ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
    const totalPossible = ACHIEVEMENTS.length;
    const totalUnlocked = unlocked.length;

    return (
        <div className="p-8 rounded-[32px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl space-y-10 relative overflow-hidden">
            {/* Background Grain/Noise */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

            {/* Header */}
            <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#FFD700]10 border border-[#FFD700]20">
                            <Trophy className="w-4 h-4 text-[#FFD700]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] font-sans">
                                Path of Expansion
                            </h4>
                            <p className="text-[18px] font-serif italic text-[var(--text-primary)]">Your Achievements</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[20px] font-serif text-[#FFD700] tracking-tight">
                            ✦ {points.toLocaleString()} <span className="text-[10px] font-sans font-bold uppercase tracking-widest ml-1 opacity-60">PTS</span>
                        </p>
                        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest mt-1">
                            {totalUnlocked} of {totalPossible} Milestones
                        </p>
                    </div>
                </div>

                {/* Overall progress filament focus */}
                <ProgressFilament progress={totalUnlocked / totalPossible} />
            </div>

            {/* Unlocked Highlights Row (if any) */}
            {unlockedAch.length > 0 && (
                <div className="relative z-10 bg-[var(--bg-secondary)]05 p-6 rounded-3xl border border-[var(--border-subtle)]05">
                    <div className="flex items-center gap-2 mb-6">
                        <Star size={10} className="text-[#FFD700]" fill="#FFD700" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-secondary)]">Recently Unlocked</span>
                    </div>
                    <div className="flex gap-7 overflow-x-auto pb-2 scrollbar-none">
                        {unlockedAch.slice(-5).reverse().map((ach, i) => (
                            <Medal
                                key={`unlocked-${ach.id}`}
                                achievement={ach}
                                unlocked={true}
                                index={i}
                                categoryColor={CATEGORY_COLORS[ach.category]}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Category rows */}
            <div className="space-y-10 relative z-10">
                {categories.map((cat) => (
                    <CategoryRow
                        key={cat}
                        category={cat}
                        achievements={achievementsByCategory[cat]}
                        unlocked={unlocked}
                    />
                ))}
            </div>

            {/* Footer guidance */}
            <div className="pt-4 text-center relative z-10">
                <p className="text-[10px] text-[var(--text-muted)] font-serif italic max-w-[280px] mx-auto opacity-60 leading-relaxed">
                    "The goal of the path is not reaching the end, but observing every step with unwavering presence."
                </p>
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
        const t = setTimeout(onDismiss, 5000);
        return () => clearTimeout(t);
    }, [achievement, onDismiss]);

    const Icon = achievement?.icon;

    return (
        <AnimatePresence>
            {achievement && Icon && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    layout
                    className="fixed bottom-10 right-8 z-[9999] flex items-center gap-5 px-6 py-5 rounded-[28px] border shadow-2xl backdrop-blur-2xl cursor-pointer group pointer-events-auto"
                    style={{
                        background: 'rgba(var(--bg-surface-rgb), 0.95)',
                        borderColor: `${achievement.color}40`,
                        boxShadow: `0 15px 50px rgba(0,0,0,0.3), 0 0 40px ${achievement.color}20`,
                    }}
                    onClick={onDismiss}
                >
                    <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
                        <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                            className="absolute top-1/2 left-6 w-20 h-20 -translate-y-1/2 -translate-x-1/2 rounded-full border border-white/20"
                            style={{ borderColor: achievement.color }}
                        />
                    </div>

                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 relative"
                        style={{
                            background: `${achievement.color}15`,
                            border: `1px solid ${achievement.color}30`
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                        >
                            <Icon size={26} style={{ color: achievement.color }} strokeWidth={1.5} />
                        </motion.div>
                        <div className="absolute inset-0 blur-lg opacity-40 rounded-full" style={{ background: achievement.color }} />
                    </div>

                    <div className="relative">
                        <p className="text-[10px] uppercase tracking-[0.4em] font-bold font-sans mb-1"
                            style={{ color: achievement.color }}>
                            Milestone Unlocked
                        </p>
                        <h4 className="text-[20px] font-serif italic text-[var(--text-primary)] leading-tight">
                            {achievement.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                            <Star size={10} fill={achievement.color} color={achievement.color} />
                            <p className="text-[11px] text-[var(--text-muted)] font-sans font-bold uppercase tracking-widest">
                                +{achievement.points} Essence XP
                            </p>
                        </div>
                    </div>

                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={16} className="text-[var(--text-muted)]" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
