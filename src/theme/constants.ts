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
    orbFill: string;
    orbText: string;
    orbParticle: string;
    orbShadow: string;
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

export type ThemeMode = "dark" | "light";

export const themes: Record<ThemeMode, Theme> = {
    dark: {
        name: "dark",
        label: "Night",
        bgPrimary: "#0c0910",
        bgSecondary: "#110e16",
        bgGradient: "linear-gradient(165deg, #0c0910 0%, #110e16 100%)",
        bgSurface: "rgba(255, 255, 255, 0.06)",
        bgSurfaceHover: "rgba(255, 255, 255, 0.08)",
        bgSurfaceActive: "rgba(255, 255, 255, 0.1)",
        bgInput: "rgba(255, 255, 255, 0.04)",
        bgInputFocus: "rgba(255, 255, 255, 0.07)",
        bgOverlay: "rgba(12, 9, 16, 0.92)",
        textPrimary: "#f5f2ec",
        textSecondary: "#ede9e3",
        textMuted: "rgba(237, 233, 227, 0.96)",
        textDisabled: "rgba(237, 233, 227, 0.78)",
        accentPrimary: "#CFC2CD",
        accentPrimaryHover: "#E0D5DE",
        accentPrimaryMuted: "rgba(207,194,205, 0.1)",
        accentPrimaryBorder: "rgba(207,194,205, 0.3)",
        accentSecondary: "#CFC2CD",
        accentSecondaryMuted: "rgba(207,194,205, 0.1)",
        accentSecondaryBorder: "rgba(207,194,205, 0.25)",
        glowCyan: "rgba(207,194,205, 0.12)",
        glowGold: "rgba(122,95,68, 0.18)",
        orbFill: "radial-gradient(circle at 40% 35%, rgba(207,194,205,0.18) 0%, rgba(140,123,138,0.12) 60%, rgba(92,91,122,0.04) 100%)",
        orbText: "rgba(255, 255, 255, 0.95)",
        orbParticle: "rgba(255, 255, 255, 0.5)",
        orbShadow: "none",
        borderDefault: "rgba(255, 255, 255, 0.35)",
        borderSubtle: "rgba(255, 255, 255, 0.15)",
        borderGlass: "rgba(255, 255, 255, 0.1)",
        shadow: "none",
        shadowElevated: "0 8px 32px rgba(0, 0, 0, 0.5)",
        blur: "blur(14px)",
        ambientGlow: "radial-gradient(ellipse at 50% 0%, rgba(207,194,205, 0.05), transparent 70%)",
        chipBg: "rgba(255, 255, 255, 0.05)",
        chipBorder: "rgba(255, 255, 255, 0.12)",
        chipSelectedBg: "rgba(207,194,205, 0.15)",
        chipSelectedBorder: "rgba(207,194,205, 0.45)",
        quoteBg: "rgba(255, 255, 255, 0.03)",
        quoteBorder: "rgba(207,194,205, 0.35)",
        navActiveBg: "rgba(207,194,205, 0.15)",
        navActiveBorder: "rgba(207,194,205, 0.45)",
        toggleTrack: "rgba(255, 255, 255, 0.1)",
        toggleThumb: "#ede9e3",
        toggleIcon: "🌙",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Outfit', sans-serif",
    },
    light: {
        name: "light",
        label: "Day",
        bgPrimary: "#FDFCF9", // Crisper white-paper
        bgSecondary: "#F5F2ED",
        bgGradient: "linear-gradient(165deg, #FDFCF9 0%, #F5F2ED 100%)",
        bgSurface: "#FFFFFF", // Pure white for cards to pop
        bgSurfaceHover: "#F9F8F6",
        bgSurfaceActive: "#F2F0ED",
        bgInput: "#FFFFFF",
        bgInputFocus: "#FFFFFF",
        bgOverlay: "rgba(253, 252, 249, 0.96)",
        textPrimary: "#231F1C", // Crisp, high-contrast
        textSecondary: "#3C3733", // Crisp secondary — never faded
        textMuted: "#54504A",     // "muted" is still clearly readable, not grey-on-grey
        textDisabled: "#8A857F",  // only truly-disabled controls
        accentPrimary: "#8C7B8A", // Deep teal-smoke — readable on light bg
        accentPrimaryHover: "#695E68",
        accentPrimaryMuted: "rgba(140,123,138, 0.08)",
        accentPrimaryBorder: "rgba(140,123,138, 0.3)",
        accentSecondary: "#8C7B8A",
        accentSecondaryMuted: "rgba(140,123,138, 0.1)",
        accentSecondaryBorder: "rgba(140,123,138, 0.2)",
        glowCyan: "rgba(140,123,138, 0.08)",
        glowGold: "rgba(122,95,68, 0.10)",
        orbFill: "radial-gradient(circle at 40% 35%, rgba(140,123,138, 0.35) 0%, rgba(140,123,138, 0.2) 60%, rgba(92, 91, 122, 0.1) 100%)",
        orbText: "#2A2421",
        orbParticle: "rgba(140,123,138, 0.4)",
        orbShadow: "0 8px 30px rgba(140,123,138, 0.08)",
        borderDefault: "#DED9D1", // Clearer borders
        borderSubtle: "#EBE7E0",
        borderGlass: "rgba(45, 40, 35, 0.12)",
        shadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        shadowElevated: "0 10px 30px rgba(45, 42, 38, 0.06)",
        blur: "blur(10px)",
        ambientGlow: "none",
        chipBg: "#F7F5F2",
        chipBorder: "#E8E4DF",
        chipSelectedBg: "rgba(140,123,138, 0.08)",
        chipSelectedBorder: "rgba(140,123,138, 0.45)",
        quoteBg: "rgba(140,123,138, 0.04)",
        quoteBorder: "rgba(140,123,138, 0.25)",
        navActiveBg: "rgba(140,123,138, 0.08)",
        navActiveBorder: "rgba(140,123,138, 0.45)",
        toggleTrack: "rgba(0, 0, 0, 0.08)",
        toggleThumb: "#4A4440",
        toggleIcon: "☀️",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Outfit', sans-serif",
    },
};
