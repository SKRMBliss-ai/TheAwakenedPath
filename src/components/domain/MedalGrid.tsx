import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import { ACHIEVEMENTS, type Achievement } from '../../features/achievements/achievementsDefs';
import { cn } from '../../lib/utils';
import React from 'react';

// ─── Individual Medal (Compact) ──────────────────────────────────────────────
export const Medal: React.FC<{
    achievement: Achievement;
    unlocked: boolean;
    index: number;
    showTooltip?: boolean;
}> = ({ achievement, unlocked, index, showTooltip = true }) => {
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
                className={cn(
                    "text-[8px] font-bold uppercase tracking-wider text-center transition-all duration-300",
                    unlocked ? "text-[var(--text-primary)] opacity-90" : "text-[var(--text-disabled)] opacity-40"
                )}
            >
                {achievement.name.split(' ')[0]}
            </span>

            {/* Premium Tooltip */}
            {hovered && showTooltip && (
                <div
                    ref={tooltipRef}
                    className="absolute bottom-full mb-3 z-[100] w-52 pointer-events-none"
                    style={{ left: `calc(50% + ${tooltipXOffset}px)`, transform: 'translateX(-50%)' }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl backdrop-blur-xl space-y-2"
                        style={{ borderLeft: `3px solid ${unlocked ? achievement.color : 'var(--border-subtle)'}` }}
                    >
                        <div className="flex justify-between items-start">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                                {achievement.name}
                            </h5>
                            <span className="text-[9px] font-bold text-[var(--text-muted)]">{achievement.points} PTS</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-serif italic">
                            {unlocked ? achievement.desc : achievement.criteria}
                        </p>
                        <div className="pt-2 flex justify-between items-center text-[8px] font-black uppercase tracking-tighter">
                            <span className={unlocked ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}>
                                {unlocked ? 'Soul Achievement Unlocked' : 'Path Yet Unfollowed'}
                            </span>
                            <div className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                                {achievement.category}
                            </div>
                        </div>
                    </motion.div>
                    {/* Tooltip Arrow */}
                    <div className="w-2.5 h-2.5 bg-[var(--bg-surface)] border-r border-b border-[var(--border-default)] rotate-45 mx-auto -mt-1.5" />
                </div>
            )}
        </motion.div>
    );
};

interface MedalGridProps {
    unlocked: string[];
    showTooltips?: boolean;
    className?: string;
}

export const MedalGrid: React.FC<MedalGridProps> = ({ unlocked, showTooltips = true, className }) => {
    return (
        <div className={cn("grid grid-cols-4 sm:grid-cols-8 gap-x-4 gap-y-7", className)}>
            {ACHIEVEMENTS.map((ach: Achievement, i: number) => (
                <Medal
                    key={ach.id}
                    achievement={ach}
                    unlocked={unlocked.includes(ach.id)}
                    index={i}
                    showTooltip={showTooltips}
                />
            ))}
        </div>
    );
};
