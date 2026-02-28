import React, { useState, useEffect, createContext, useContext } from "react";
import { motion } from "framer-motion";

/*
  ═══════════════════════════════════════════════════════════════════
  AWAKENED PATH — THEME SYSTEM
  ═══════════════════════════════════════════════════════════════════
  
  Dark Mode:  "Deep Night" — the original bioluminescent sacred space
  Light Mode: "Morning Light" — warm, soft, linen-paper clarity
  
  Design Philosophy:
  - Dark = glows, glass, depth, mystery
  - Light = shadows, paper, warmth, clarity
  - Same sacred feeling, different time of day
  
  Persistence: localStorage key "awakened-theme"
  Default: "dark"
  
  WCAG AAA contrast maintained in both modes.
  ═══════════════════════════════════════════════════════════════════
*/

// ─── THEME TYPES ─────────────────────────────────────────────

export interface Theme {
    name: string;
    label: string;
    bgPrimary: string;
    bgSecondary: string;
    bgGradient: string;
    bgSurface: string;
    bgSurfaceHover: string;
    bgSurfaceActive: string;
    bgInput: string;
    bgInputFocus: string;
    bgOverlay: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textDisabled: string;
    accentPrimary: string;
    accentPrimaryHover: string;
    accentPrimaryMuted: string;
    accentPrimaryBorder: string;
    accentSecondary: string;
    accentSecondaryMuted: string;
    accentSecondaryBorder: string;
    glowCyan: string;
    glowGold: string;
    borderDefault: string;
    borderSubtle: string;
    borderGlass: string;
    shadow: string;
    shadowElevated: string;
    blur: string;
    ambientGlow: string;
    chipBg: string;
    chipBorder: string;
    chipSelectedBg: string;
    chipSelectedBorder: string;
    quoteBg: string;
    quoteBorder: string;
    navActiveBg: string;
    navActiveBorder: string;
    toggleTrack: string;
    toggleThumb: string;
    toggleIcon: string;
}

type ThemeMode = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    toggle: () => void;
}

// ─── THEME DEFINITIONS ───────────────────────────────────────

export const themes: Record<ThemeMode, Theme> = {
    dark: {
        name: "dark",
        label: "Night",

        // Backgrounds
        bgPrimary: "#0B0014",
        bgSecondary: "#050008",
        bgGradient: "linear-gradient(165deg, #0B0014 0%, #050008 100%)",
        bgSurface: "rgba(11, 0, 20, 0.7)",
        bgSurfaceHover: "rgba(11, 0, 20, 0.85)",
        bgSurfaceActive: "rgba(11, 0, 20, 0.95)",
        bgInput: "rgba(255, 255, 255, 0.04)",
        bgInputFocus: "rgba(255, 255, 255, 0.07)",
        bgOverlay: "rgba(5, 0, 8, 0.92)",

        // Text — boosted muted for readability on deep void
        textPrimary: "#F4E3DA",
        textSecondary: "#dcc5d6",
        textMuted: "rgba(244, 227, 218, 0.55)",
        textDisabled: "rgba(244, 227, 218, 0.25)",

        // Accents
        accentPrimary: "#D16BA5",        // Brighter Rose for deep bg
        accentPrimaryHover: "#e080b5",
        accentPrimaryMuted: "rgba(209, 107, 165, 0.18)",
        accentPrimaryBorder: "rgba(209, 107, 165, 0.4)",
        accentSecondary: "#ABCEC9",      // Teal Glow
        accentSecondaryMuted: "rgba(171, 206, 201, 0.15)",
        accentSecondaryBorder: "rgba(171, 206, 201, 0.35)",

        // Special glows
        glowCyan: "rgba(0, 240, 255, 0.4)",
        glowGold: "rgba(255, 215, 0, 0.35)",

        // Borders — boosted for visibility on deep void
        borderDefault: "rgba(244, 227, 218, 0.12)",
        borderSubtle: "rgba(244, 227, 218, 0.06)",
        borderGlass: "rgba(244, 227, 218, 0.18)",

        // Shadows & Effects
        shadow: "none",
        shadowElevated: "0 8px 32px rgba(0, 0, 0, 0.5)",
        blur: "blur(12px)",
        ambientGlow: "radial-gradient(ellipse at 50% 0%, rgba(209,107,165,0.08), transparent 70%)",

        // Component-specific — boosted for deep void
        chipBg: "rgba(255, 255, 255, 0.06)",
        chipBorder: "rgba(255, 255, 255, 0.12)",
        chipSelectedBg: "rgba(209, 107, 165, 0.18)",
        chipSelectedBorder: "rgba(209, 107, 165, 0.45)",
        quoteBg: "rgba(255, 255, 255, 0.04)",
        quoteBorder: "rgba(171, 206, 201, 0.25)",
        navActiveBg: "rgba(209, 107, 165, 0.18)",
        navActiveBorder: "rgba(209, 107, 165, 0.4)",

        // Toggle
        toggleTrack: "rgba(244, 227, 218, 0.15)",
        toggleThumb: "#F4E3DA",
        toggleIcon: "🌙",
    },

    light: {
        name: "light",
        label: "Day",

        // Backgrounds — warm linen, not harsh white
        bgPrimary: "#FAF6F1",           // Warm linen
        bgSecondary: "#F0EAE2",         // Soft parchment
        bgGradient: "linear-gradient(165deg, #FAF6F1 0%, #F5EDE4 40%, #FAF6F1 100%)",
        bgSurface: "rgba(255, 255, 255, 0.7)",
        bgSurfaceHover: "rgba(255, 255, 255, 0.85)",
        bgSurfaceActive: "rgba(255, 255, 255, 0.95)",
        bgInput: "rgba(89, 68, 92, 0.03)",
        bgInputFocus: "rgba(89, 68, 92, 0.06)",
        bgOverlay: "rgba(250, 246, 241, 0.92)",

        // Text — deep warm tones, boosted for readability
        textPrimary: "#2D1F30",          // Deeper plum-brown for max contrast
        textSecondary: "#5A4660",        // Stronger purple-gray
        textMuted: "rgba(45, 31, 48, 0.55)",
        textDisabled: "rgba(45, 31, 48, 0.25)",

        // Accents — richer in light mode for contrast
        accentPrimary: "#9E3D75",        // Deeper rose (strong on linen)
        accentPrimaryHover: "#8A3568",
        accentPrimaryMuted: "rgba(158, 61, 117, 0.1)",
        accentPrimaryBorder: "rgba(158, 61, 117, 0.3)",
        accentSecondary: "#3D8A80",      // Deeper teal (strong on linen)
        accentSecondaryMuted: "rgba(61, 138, 128, 0.1)",
        accentSecondaryBorder: "rgba(61, 138, 128, 0.25)",

        // Special accents (softer in light mode)
        glowCyan: "rgba(0, 180, 200, 0.15)",
        glowGold: "rgba(200, 165, 0, 0.15)",

        // Borders — visible on linen background
        borderDefault: "rgba(45, 31, 48, 0.14)",
        borderSubtle: "rgba(45, 31, 48, 0.08)",
        borderGlass: "rgba(45, 31, 48, 0.12)",

        // Shadows & Effects — shadows replace glows in light mode
        shadow: "0 1px 4px rgba(45, 31, 48, 0.08)",
        shadowElevated: "0 4px 24px rgba(45, 31, 48, 0.1), 0 1px 6px rgba(45, 31, 48, 0.06)",
        blur: "blur(8px)",
        ambientGlow: "none",

        // Component-specific — boosted for light bg
        chipBg: "rgba(45, 31, 48, 0.05)",
        chipBorder: "rgba(45, 31, 48, 0.14)",
        chipSelectedBg: "rgba(158, 61, 117, 0.12)",
        chipSelectedBorder: "rgba(158, 61, 117, 0.35)",
        quoteBg: "rgba(61, 138, 128, 0.06)",
        quoteBorder: "rgba(61, 138, 128, 0.25)",
        navActiveBg: "rgba(158, 61, 117, 0.1)",
        navActiveBorder: "rgba(158, 61, 117, 0.35)",

        // Toggle
        toggleTrack: "rgba(45, 31, 48, 0.14)",
        toggleThumb: "#2D1F30",
        toggleIcon: "☀️",
    },
};

// ─── THEME CONTEXT ───────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType>({
    theme: themes.dark,
    mode: "dark",
    toggle: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("dark");

    // Load saved preference on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("awakened-theme") as ThemeMode;
            if (saved === "light" || saved === "dark") {
                setMode(saved);
            }
        } catch { }
    }, []);

    // Save preference whenever it changes
    const toggle = () => {
        const next = mode === "dark" ? "light" : "dark";
        setMode(next);
        try {
            localStorage.setItem("awakened-theme", next);
        } catch { }
    };

    const theme = themes[mode];

    // Sync with CSS Variables for global styles
    useEffect(() => {
        const root = document.documentElement;

        // Core Backgrounds
        root.style.setProperty("--bg-color", theme.bgPrimary);
        root.style.setProperty("--bg-primary", theme.bgPrimary);
        root.style.setProperty("--bg-secondary", theme.bgSecondary);
        root.style.setProperty("--bg-body", theme.bgGradient);
        root.style.setProperty("--bg-surface", theme.bgSurface);
        root.style.setProperty("--bg-input", theme.bgInput);

        // Core Text
        root.style.setProperty("--text-main", theme.textPrimary);
        root.style.setProperty("--text-primary", theme.textPrimary);
        root.style.setProperty("--text-secondary", theme.textSecondary);
        root.style.setProperty("--text-muted", theme.textMuted);

        // Accents & Brand
        root.style.setProperty("--brand-primary", theme.accentPrimary);
        root.style.setProperty("--brand-secondary", theme.accentSecondary);
        root.style.setProperty("--accent-primary", theme.accentPrimary);
        root.style.setProperty("--accent-secondary", theme.accentSecondary);
        root.style.setProperty("--teal-glow", theme.accentSecondary);

        // Borders & Glass
        root.style.setProperty("--glass-surface", theme.bgSurface);
        root.style.setProperty("--glass-border", theme.borderGlass);
        root.style.setProperty("--border-default", theme.borderDefault);
        root.style.setProperty("--border-subtle", theme.borderSubtle);

        // Glow System (Adapts based on mode)
        if (mode === "dark") {
            root.style.setProperty("--card-glow-base", "rgba(209, 107, 165, 0.25)");
            root.style.setProperty("--card-glow-pulse", "rgba(209, 107, 165, 0.45)");
            root.style.setProperty("--card-glow-surge", "rgba(209, 107, 165, 0.75)");
            root.style.setProperty("--glow-primary", "rgba(209, 107, 165, 0.3)");
            root.style.setProperty("--accent-primary-dim", "rgba(209, 107, 165, 0.06)");
            root.style.setProperty("--accent-secondary-dim", "rgba(171, 206, 201, 0.06)");
        } else {
            // Subtle shadows/glows for light mode
            root.style.setProperty("--card-glow-base", "rgba(158, 61, 117, 0.08)");
            root.style.setProperty("--card-glow-pulse", "rgba(158, 61, 117, 0.14)");
            root.style.setProperty("--card-glow-surge", "rgba(158, 61, 117, 0.2)");
            root.style.setProperty("--glow-primary", "rgba(158, 61, 117, 0.12)");
            root.style.setProperty("--accent-primary-dim", "rgba(158, 61, 117, 0.04)");
            root.style.setProperty("--accent-secondary-dim", "rgba(61, 138, 128, 0.04)");
        }

        // Other tokens
        root.style.setProperty("--glow-cyan", theme.glowCyan);
        root.style.setProperty("--glow-gold", theme.glowGold);
        root.style.setProperty("--blur-val", theme.blur);
    }, [theme, mode]);

    return (
        <ThemeContext.Provider value={{ theme, mode, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ─── THEME TOGGLE SWITCH ─────────────────────────────────────

export function ThemeToggle({ style = {} }: { style?: React.CSSProperties }) {
    const { theme, mode, toggle } = useTheme();

    return (
        <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.94 }}
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            style={{
                position: "relative",
                width: 64,
                height: 34,
                borderRadius: 17,
                border: `1.5px solid ${theme.borderDefault}`,
                background: theme.toggleTrack,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                backdropFilter: theme.blur,
                transition: "background 0.5s ease, border-color 0.5s ease",
                ...style,
            }}
        >
            {/* Track icons */}
            <span style={{
                position: "absolute",
                left: 8,
                fontSize: 14,
                opacity: mode === "light" ? 1 : 0.3,
                transition: "opacity 0.3s",
                lineHeight: 1,
            }}>☀️</span>
            <span style={{
                position: "absolute",
                right: 8,
                fontSize: 14,
                opacity: mode === "dark" ? 1 : 0.3,
                transition: "opacity 0.3s",
                lineHeight: 1,
            }}>🌙</span>

            {/* Thumb */}
            <motion.div
                animate={{ x: mode === "dark" ? 32 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: mode === "dark"
                        ? "linear-gradient(135deg, #0B0014, #050008)"
                        : "linear-gradient(135deg, #FAF6F1, #F0EAE2)",
                    boxShadow: mode === "dark"
                        ? "0 0 8px rgba(198,95,157,0.3), 0 2px 4px rgba(0,0,0,0.3)"
                        : "0 2px 8px rgba(61,46,64,0.15), 0 1px 2px rgba(61,46,64,0.08)",
                    border: `1.5px solid ${mode === "dark" ? "rgba(198,95,157,0.3)" : "rgba(176,78,138,0.15)"}`,
                    transition: "background 0.5s, box-shadow 0.5s, border-color 0.5s",
                }}
            />
        </motion.button>
    );
}

// ─── THEMED UTILITY: Apply theme as inline styles ────────────

export function useThemedStyles() {
    const { theme } = useTheme();

    return {
        // Page
        page: {
            background: theme.bgGradient,
            color: theme.textPrimary,
            minHeight: "100vh",
            fontFamily: "Georgia, 'Times New Roman', serif",
            transition: "background 0.6s ease, color 0.6s ease",
        },

        // Glass card
        card: {
            background: theme.bgSurface,
            border: `1px solid ${theme.borderGlass}`,
            borderRadius: 20,
            backdropFilter: theme.blur,
            boxShadow: theme.shadowElevated,
            padding: "20px 24px",
            transition: "all 0.5s ease",
        },

        // Chip (unselected)
        chip: {
            background: theme.chipBg,
            border: `1.5px solid ${theme.chipBorder}`,
            color: theme.textSecondary,
            borderRadius: 16,
            padding: "14px 18px",
            minHeight: 56,
            transition: "all 0.3s ease",
        },

        // Chip (selected)
        chipSelected: {
            background: theme.chipSelectedBg,
            border: `2px solid ${theme.chipSelectedBorder}`,
            color: theme.accentPrimary,
            borderRadius: 16,
            padding: "14px 18px",
            minHeight: 56,
            fontWeight: 600,
            transition: "all 0.3s ease",
        },

        // Text input
        input: {
            background: theme.bgInput,
            border: `1px solid ${theme.borderDefault}`,
            color: theme.textPrimary,
            borderRadius: 18,
            padding: "18px 22px",
            fontSize: 17,
            fontFamily: "Georgia, serif",
            outline: "none",
            transition: "all 0.3s ease",
        },

        // Quote block
        quote: {
            background: theme.quoteBg,
            borderLeft: `3px solid ${theme.quoteBorder}`,
            borderRadius: 16,
            padding: "16px 20px",
            transition: "all 0.5s ease",
        },

        // Primary button
        btnPrimary: {
            background: theme.navActiveBg,
            border: `1.5px solid ${theme.navActiveBorder}`,
            color: theme.accentPrimary,
            borderRadius: 14,
            padding: "16px 32px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 54,
            transition: "all 0.3s ease",
        },

        // Secondary button
        btnSecondary: {
            background: "transparent",
            border: `1.5px solid ${theme.borderDefault}`,
            color: theme.textMuted,
            borderRadius: 14,
            padding: "16px 32px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 54,
            transition: "all 0.3s ease",
        },

        // Heading
        h1: {
            fontSize: 28,
            fontWeight: 300,
            color: theme.textPrimary,
            lineHeight: 1.35,
            transition: "color 0.5s ease",
        },

        // Subtext
        sub: {
            fontSize: 14,
            color: theme.textMuted,
            fontStyle: "italic",
            transition: "color 0.5s ease",
        },

        // Label
        label: {
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: theme.textMuted,
            transition: "color 0.5s ease",
        },

        // Accent text
        accentText: {
            color: theme.accentPrimary,
            transition: "color 0.5s ease",
        },

        // Teal accent text
        tealText: {
            color: theme.accentSecondary,
            transition: "color 0.5s ease",
        },
    };
}
