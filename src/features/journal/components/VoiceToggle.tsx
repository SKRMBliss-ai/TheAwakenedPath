import { motion } from "framer-motion";

interface VoiceToggleProps {
    enabled: boolean;
    playing: boolean;
    loading: boolean;
    onToggle: () => void;
}

export function VoiceToggle({ enabled, playing, loading, onToggle }: VoiceToggleProps) {
    return (
        <motion.button
            onClick={onToggle}
            whileTap={{ scale: 0.94 }}
            aria-label={enabled ? "Mute voice guide" : "Enable voice guide"}
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 100,
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: enabled
                    ? "var(--accent-secondary-muted)"
                    : "var(--bg-surface)",
                border: `2px solid ${enabled
                    ? "var(--accent-secondary-border)"
                    : "var(--border-subtle)"
                    }`,
                backdropFilter: "blur(8px)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
        >
            {loading ? (
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    ⏳
                </motion.span>
            ) : enabled ? (
                playing ? "🔊" : "🔈"
            ) : (
                "🔇"
            )}
        </motion.button>
    );
}
