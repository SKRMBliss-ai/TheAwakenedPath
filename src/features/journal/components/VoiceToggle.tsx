import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface VoiceToggleProps {
    enabled: boolean;
    playing: boolean;
    loading: boolean;
    onToggle: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export function VoiceToggle({ enabled, playing, loading, onToggle, className, style }: VoiceToggleProps) {
    return (
        <div
            className={cn("flex items-center gap-4", className)}
            style={style}
        >
            <AnimatePresence>
                {playing && enabled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 5 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(171,206,201,0.08)] border border-[rgba(171,206,201,0.2)] backdrop-blur-xl"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.4, 1, 0.4],
                                boxShadow: [
                                    "0 0 0px var(--accent-secondary)",
                                    "0 0 10px var(--accent-secondary)",
                                    "0 0 0px var(--accent-secondary)"
                                ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]"
                        />
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] italic">
                            Now Narrating
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={onToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={enabled ? "Mute voice guide" : "Enable voice guide"}
                className={cn(
                    "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                    enabled
                        ? "bg-[var(--accent-secondary-muted)] border border-[var(--accent-secondary-border)] text-[var(--accent-secondary)]"
                        : "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] opacity-60"
                )}
                style={{
                    backdropFilter: "blur(12px)",
                    boxShadow: enabled ? "0 8px 32px rgba(171,206,201,0.15)" : "none"
                }}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : enabled ? (
                    <Volume2 className={cn("w-5 h-5", playing && "animate-pulse")} />
                ) : (
                    <VolumeX className="w-5 h-5" />
                )}

                {/* Subtle highlight ring */}
                {enabled && (
                    <motion.div
                        layoutId="voice-active-ring"
                        className="absolute -inset-[2px] rounded-full border border-[var(--accent-secondary)] opacity-20"
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                )}
            </motion.button>
        </div>
    );
}
