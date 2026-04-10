/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { themes } from "./constants";
import type { Theme, ThemeMode } from "./constants";
import { cn } from "../lib/utils";

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

interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    toggle: () => void;
}

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
        } catch (err) {
            console.debug("Theme initialization skipped:", err);
        }
    }, []);

    // Save preference whenever it changes
    const toggle = () => {
        const next = mode === "dark" ? "light" : "dark";
        setMode(next);
        try {
            localStorage.setItem("awakened-theme", next);
        } catch (err) {
            console.debug("Theme persistence failed:", err);
        }
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

        // RGB variants for transparency-heavy components like Tooltips
        if (mode === "dark") {
            root.style.setProperty("--bg-surface-rgb", "20, 18, 26"); // Darker surface
        } else {
            root.style.setProperty("--bg-surface-rgb", "255, 255, 255"); // White surface
        }

        // Core Text
        root.style.setProperty("--text-main", theme.textPrimary);
        root.style.setProperty("--text-primary", theme.textPrimary);
        root.style.setProperty("--text-secondary", theme.textSecondary);
        root.style.setProperty("--text-muted", theme.textMuted);
        root.style.setProperty("--text-disabled", theme.textDisabled);
        root.style.setProperty("--bg-base", theme.bgPrimary);
        root.style.setProperty("--bg-surface-hover", theme.bgSurfaceHover);

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

        // Sync dark class for Tailwind and global CSS
        if (mode === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        // Glow System (Adapts based on mode)
        if (mode === "dark") {
            root.style.setProperty("--card-glow-base", "rgba(94, 196, 176, 0.20)");
            root.style.setProperty("--card-glow-pulse", "rgba(94, 196, 176, 0.38)");
            root.style.setProperty("--card-glow-surge", "rgba(94, 196, 176, 0.65)");
            root.style.setProperty("--glow-primary", "rgba(94, 196, 176, 0.25)");
            root.style.setProperty("--accent-primary-dim", "rgba(94, 196, 176, 0.08)");
            root.style.setProperty("--video-shadow", "0 30px 100px rgba(0,0,0,0.9), 0 0 40px rgba(94, 196, 176, 0.12)");
            root.style.setProperty("--video-border", "rgba(255, 255, 255, 0.12)");
        } else {
            root.style.setProperty("--card-glow-base", "rgba(54, 171, 163, 0.04)");
            root.style.setProperty("--card-glow-pulse", "rgba(54, 171, 163, 0.08)");
            root.style.setProperty("--card-glow-surge", "rgba(54, 171, 163, 0.12)");
            root.style.setProperty("--glow-primary", "rgba(54, 171, 163, 0.06)");
            root.style.setProperty("--accent-primary-dim", "rgba(54, 171, 163, 0.12)");
            root.style.setProperty("--video-shadow", "0 20px 60px rgba(0,0,0,0.8)");
            root.style.setProperty("--video-border", "rgba(0, 0, 0, 0.05)");
        }

        // Orb Tokens
        root.style.setProperty("--orb-fill", theme.orbFill);
        root.style.setProperty("--orb-text", theme.orbText);
        root.style.setProperty("--orb-particle", theme.orbParticle);
        root.style.setProperty("--orb-shadow", theme.orbShadow);

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
            document.documentElement.classList.add("dark");
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
            document.documentElement.classList.remove("dark");
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

export function ThemeToggle({ style = {}, className = "" }: { style?: React.CSSProperties, className?: string }) {
    const { theme, mode, toggle } = useTheme();

    return (
        <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.94 }}
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            className={cn("relative w-[48px] h-[26px] rounded-[13px] border-[1.5px] p-0 flex items-center transition-colors duration-500 backdrop-blur-sm", className)}
            style={{
                borderColor: theme.borderDefault,
                background: theme.toggleTrack,
                cursor: "pointer",
                ...style,
            }}
        >
            {/* Track icons */}
            <span style={{
                position: "absolute",
                left: 6,
                fontSize: 11,
                opacity: mode === "light" ? 1 : 0.3,
                transition: "opacity 0.3s",
                lineHeight: 1,
            }}>☀️</span>
            <span style={{
                position: "absolute",
                right: 6,
                fontSize: 11,
                opacity: mode === "dark" ? 1 : 0.9,
                filter: mode === "light" ? "drop-shadow(0px 1px 1px rgba(0,0,0,0.2)) saturate(1.2)" : "none",
                transition: "all 0.3s",
                lineHeight: 1,
            }}>🌙</span>

            {/* Thumb */}
            <motion.div
                animate={{
                    x: mode === "dark" ? 22 : 2,
                    rotate: mode === "dark" ? 360 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: mode === "dark"
                        ? "linear-gradient(135deg, #0B0014, #050008)"
                        : "linear-gradient(135deg, #FAF6F1, #F0EAE2)",
                    boxShadow: mode === "dark"
                        ? "0 0 8px rgba(94,196,176,0.3), 0 2px 4px rgba(0,0,0,0.3)"
                        : "0 2px 8px rgba(61,46,64,0.15), 0 1px 2px rgba(61,46,64,0.08)",
                    border: `1.5px solid ${mode === "dark" ? "rgba(94,196,176,0.3)" : "rgba(61,139,122,0.15)"}`,
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
