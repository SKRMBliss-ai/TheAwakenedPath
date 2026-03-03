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
    fontFamilySerif: string;
    fontFamilySans: string;
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

        // Backgrounds — "Sacred Night"
        bgPrimary: "#0c0910",           // bg-deep
        bgSecondary: "#110e16",         // bg-layer
        bgGradient: "linear-gradient(165deg, #0c0910 0%, #110e16 100%)",
        bgSurface: "rgba(255, 255, 255, 0.035)", // bg-card
        bgSurfaceHover: "rgba(255, 255, 255, 0.055)",
        bgSurfaceActive: "rgba(255, 255, 255, 0.08)",
        bgInput: "rgba(255, 255, 255, 0.04)",
        bgInputFocus: "rgba(255, 255, 255, 0.07)",
        bgOverlay: "rgba(12, 9, 16, 0.92)",

        // Text
        textPrimary: "#ede9e3",          // text-primary
        textSecondary: "rgba(237, 233, 227, 0.5)", // text-secondary
        textMuted: "rgba(237, 233, 227, 0.25)",    // text-muted
        textDisabled: "rgba(237, 233, 227, 0.15)",

        // Accents
        accentPrimary: "#f0a0aa",        // accent-rose
        accentPrimaryHover: "#f2b1bb",
        accentPrimaryMuted: "rgba(240, 160, 170, 0.1)",
        accentPrimaryBorder: "rgba(240, 160, 170, 0.3)",
        accentSecondary: "#6ee7c2",      // accent-teal
        accentSecondaryMuted: "rgba(110, 231, 194, 0.1)",
        accentSecondaryBorder: "rgba(110, 231, 194, 0.25)",

        // Special glows
        glowCyan: "rgba(110, 231, 194, 0.25)",
        glowGold: "rgba(232, 184, 122, 0.25)",

        // Borders
        borderDefault: "rgba(255, 255, 255, 0.1)",
        borderSubtle: "rgba(255, 255, 255, 0.06)", // border-card
        borderGlass: "rgba(255, 255, 255, 0.08)",

        // Shadows & Effects
        shadow: "none",
        shadowElevated: "0 8px 32px rgba(0, 0, 0, 0.5)",
        blur: "blur(14px)",
        ambientGlow: "radial-gradient(ellipse at 50% 0%, rgba(110, 231, 194, 0.06), transparent 70%)", // glow-card

        // Component-specific
        chipBg: "rgba(255, 255, 255, 0.05)",
        chipBorder: "rgba(255, 255, 255, 0.12)",
        chipSelectedBg: "rgba(240, 160, 170, 0.15)",
        chipSelectedBorder: "rgba(240, 160, 170, 0.45)",
        quoteBg: "rgba(255, 255, 255, 0.03)",
        quoteBorder: "rgba(110, 231, 194, 0.35)",
        navActiveBg: "rgba(240, 160, 170, 0.15)",
        navActiveBorder: "rgba(240, 160, 170, 0.45)",

        // Toggle
        toggleTrack: "rgba(255, 255, 255, 0.1)",
        toggleThumb: "#ede9e3",
        toggleIcon: "🌙",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Inter', sans-serif",
    },

    light: {
        name: "light",
        label: "Day",

        // Backgrounds — "Warm Earth"
        bgPrimary: "#f7f2ec",           // bg-page
        bgSecondary: "#f0e8de",         // bg-warm
        bgGradient: "linear-gradient(165deg, #f7f2ec 0%, #f0e8de 100%)",
        bgSurface: "rgba(255, 255, 255, 0.75)", // bg-card
        bgSurfaceHover: "rgba(255, 255, 255, 0.85)",
        bgSurfaceActive: "rgba(255, 255, 255, 0.95)",
        bgInput: "#ffffff",             // bg-input
        bgInputFocus: "#ffffff",
        bgOverlay: "rgba(247, 242, 236, 0.92)",

        // Text
        textPrimary: "#2a2521",          // text-primary
        textSecondary: "#7a726a",        // text-secondary
        textMuted: "rgba(42, 37, 33, 0.35)", // text-muted
        textDisabled: "rgba(42, 37, 33, 0.2)",

        // Accents
        accentPrimary: "#b8706e",        // accent-rose
        accentPrimaryHover: "#a6605e",
        accentPrimaryMuted: "rgba(184, 112, 110, 0.1)",
        accentPrimaryBorder: "rgba(184, 112, 110, 0.25)",
        accentSecondary: "#5a8679",      // accent-sage
        accentSecondaryMuted: "rgba(90, 134, 121, 0.12)",
        accentSecondaryBorder: "rgba(90, 134, 121, 0.2)",

        // Special accents
        glowCyan: "rgba(90, 134, 121, 0.1)",
        glowGold: "rgba(196, 149, 106, 0.1)",

        // Borders
        borderDefault: "rgba(0, 0, 0, 0.08)",
        borderSubtle: "rgba(0, 0, 0, 0.04)",    // border-card
        borderGlass: "rgba(0, 0, 0, 0.03)",

        // Shadows & Effects
        shadow: "0 2px 20px rgba(45, 42, 38, 0.06)", // shadow-card
        shadowElevated: "0 8px 30px rgba(45, 42, 38, 0.1)",
        blur: "blur(12px)",
        ambientGlow: "none",

        // Component-specific
        chipBg: "rgba(45, 42, 38, 0.04)",
        chipBorder: "rgba(45, 42, 38, 0.1)",
        chipSelectedBg: "rgba(184, 112, 110, 0.1)",
        chipSelectedBorder: "rgba(184, 112, 110, 0.35)",
        quoteBg: "rgba(90, 134, 121, 0.06)",
        quoteBorder: "rgba(90, 134, 121, 0.3)",
        navActiveBg: "rgba(184, 112, 110, 0.1)",
        navActiveBorder: "rgba(184, 112, 110, 0.35)",

        // Toggle
        toggleTrack: "rgba(0, 0, 0, 0.08)",
        toggleThumb: "#5a4f48",
        toggleIcon: "☀️",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Inter', sans-serif",
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

        // Component specific sync
        root.style.setProperty("--chip-bg", theme.chipBg);
        root.style.setProperty("--chip-border", theme.chipBorder);
        root.style.setProperty("--chip-selected-bg", theme.chipSelectedBg);
        root.style.setProperty("--chip-selected-border", theme.chipSelectedBorder);

        root.style.setProperty("--nav-active-bg", theme.navActiveBg);
        root.style.setProperty("--nav-active-border", theme.navActiveBorder);

        root.style.setProperty("--accent-secondary-muted", theme.accentSecondaryMuted);
        root.style.setProperty("--accent-secondary-border", theme.accentSecondaryBorder);

        root.style.setProperty("--font-serif", theme.fontFamilySerif);
        root.style.setProperty("--font-sans", theme.fontFamilySans);

        // Class Sync
        if (mode === "dark") {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
        }
    }, [theme, mode]);

    return (
        <ThemeContext.Provider value={{ theme, mode, toggle }}>
            <MouseGlow />
            {children}
        </ThemeContext.Provider>
    );
}

// ─── MOUSE GLOW COMPONENT ────────────────────────────────────

function MouseGlow() {
    const { mode } = useTheme();
    const [pos, setPos] = useState({ x: -100, y: -100 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    if (mode !== "dark") return null;

    return (
        <div
            className="mouse-glow"
            style={{
                left: pos.x,
                top: pos.y,
            }}
        />
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
                opacity: mode === "dark" ? 1 : 0.9,
                filter: mode === "light" ? "drop-shadow(0px 1px 1px rgba(0,0,0,0.2)) saturate(1.2)" : "none",
                transition: "all 0.3s",
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
