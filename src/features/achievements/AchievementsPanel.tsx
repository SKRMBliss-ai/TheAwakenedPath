import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { ACHIEVEMENTS, type Achievement } from './achievementsDefs';
import { ProgressFilament } from '../../components/ui/SacredUI';
import { Medal } from '../../components/domain/MedalGrid';

// ─── Badge Celebration Particles ─────────────────────────────────────────────
const PARTICLE_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 15, 75, 135, 195, 255, 315];
const PARTICLE_DISTANCES = [55, 70, 48, 65, 72, 50, 60, 68, 45, 75, 52, 63, 58, 66, 46, 71, 54, 62];
const PARTICLE_SIZES = [4, 3, 5, 3, 4, 5, 3, 4, 5, 3, 4, 3, 5, 4, 3, 5, 4, 3];
const PARTICLE_DELAYS = [0, 0.05, 0.1, 0.02, 0.08, 0.12, 0.04, 0.07, 0.03, 0.11, 0.06, 0.09, 0.01, 0.08, 0.1, 0.04, 0.07, 0.05];

const BadgeParticles: React.FC<{ color: string }> = ({ color }) => (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }}>
        {PARTICLE_ANGLES.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const dist = PARTICLE_DISTANCES[i];
            const x = Math.cos(rad) * dist;
            const y = Math.sin(rad) * dist;
            const size = PARTICLE_SIZES[i];
            return (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: size,
                        height: size,
                        background: color,
                        boxShadow: `0 0 ${size * 2}px ${color}`,
                        top: '50%',
                        left: '50%',
                        marginTop: -size / 2,
                        marginLeft: -size / 2,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{ x, y, opacity: 0, scale: 1.2 }}
                    transition={{
                        duration: 0.75,
                        delay: PARTICLE_DELAYS[i],
                        ease: [0.2, 0, 0.8, 1],
                    }}
                />
            );
        })}
    </div>
);

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

export const AchievementToast: React.FC<{
    achievement: Achievement | null;
    onDismiss: () => void;
}> = ({ achievement, onDismiss }) => {
    // Stable key so particles only animate on a new achievement
    const particleKey = useMemo(() => achievement?.id ?? '', [achievement?.id]);

    React.useEffect(() => {
        if (!achievement) return;

        // Play celebration sound
        import('../../services/voiceService').then(({ VoiceService }) => {
            VoiceService.playEffect('/mp3/tibetanbell.mp3');
        });

        const t = setTimeout(onDismiss, 6000);
        return () => clearTimeout(t);
    }, [achievement, onDismiss]);

    if (!achievement) return null;
    const Icon = achievement.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ type: "spring", stiffness: 300, damping: 25, mass: 1 }}
                className="fixed top-6 left-[150px] lg:left-[440px] z-[9999] cursor-pointer group"
                onClick={onDismiss}
            >
                {/* Intense Background Glow (Surge) */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-[-15px] rounded-[30px] blur-[16px] pointer-events-none mix-blend-plus-lighter hidden dark:block"
                    style={{ background: achievement.color }}
                />

                <div className="relative flex items-center gap-4 px-5 py-3 rounded-[20px] border shadow-2xl backdrop-blur-3xl overflow-hidden bg-[var(--bg-surface)]"
                    style={{
                        borderColor: `${achievement.color}40`,
                        boxShadow: `0 10px 25px -10px rgba(0,0,0,0.5), inset 0 0 10px ${achievement.color}10`
                    }}>

                    {/* Inner sheen */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                    <div className="relative flex flex-col items-start pr-3 border-r border-[var(--border-subtle)]/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-1 h-1 rounded-full"
                                style={{ background: achievement.color, boxShadow: `0 0 4px ${achievement.color}` }}
                            />
                            <p className="text-[8px] uppercase tracking-[0.3em] font-bold" style={{ color: achievement.color }}>MEDAL UNLOCKED</p>
                        </div>
                        <h4 className="text-[16px] font-serif font-light text-[var(--text-primary)] tracking-tight">{achievement.name}</h4>
                        <p className="text-[10px] font-serif italic text-[var(--text-secondary)] mt-0.5 opacity-80">+{achievement.points} EXP</p>
                    </div>

                    <div className="relative w-10 h-10 flex-shrink-0">
                        {/* Particle burst — re-mounts on each new badge */}
                        <AnimatePresence>
                            <BadgeParticles key={particleKey} color={achievement.color} />
                        </AnimatePresence>

                        {/* Ring-pulse */}
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            initial={{ scale: 0.6, opacity: 0.9 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            style={{ border: `2px solid ${achievement.color}` }}
                        />

                        {/* Icon circle */}
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background: `radial-gradient(circle, ${achievement.color}20, ${achievement.color}05)`,
                                border: `1px solid ${achievement.color}30`,
                                boxShadow: `0 0 12px ${achievement.color}40`
                            }}>
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Icon size={18} style={{ color: achievement.color, filter: `drop-shadow(0 0 4px ${achievement.color})` }} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto"
                        aria-label="Close"
                    >
                        <X size={12} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
