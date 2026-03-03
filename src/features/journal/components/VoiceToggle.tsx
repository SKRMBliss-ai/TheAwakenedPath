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
                {/* Status pill removed as it's now handled by the inline message below steps */}
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
