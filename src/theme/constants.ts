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
        textPrimary: "#ede9e3",
        textSecondary: "rgba(237, 233, 227, 0.90)",
        textMuted: "rgba(237, 233, 227, 0.85)",
        textDisabled: "rgba(237, 233, 227, 0.60)",
        accentPrimary: "#5EC4B0",
        accentPrimaryHover: "#72CEBC",
        accentPrimaryMuted: "rgba(94, 196, 176, 0.1)",
        accentPrimaryBorder: "rgba(94, 196, 176, 0.3)",
        accentSecondary: "#5EC4B0",
        accentSecondaryMuted: "rgba(94, 196, 176, 0.1)",
        accentSecondaryBorder: "rgba(94, 196, 176, 0.25)",
        glowCyan: "rgba(94, 196, 176, 0.12)",
        glowGold: "rgba(232, 184, 122, 0.15)",
        orbFill: "radial-gradient(circle at 40% 35%, rgba(94,196,176,0.18) 0%, rgba(60,160,140,0.10) 60%, rgba(40,130,115,0.03) 100%)",
        orbText: "rgba(255, 255, 255, 0.95)",
        orbParticle: "rgba(255, 255, 255, 0.5)",
        orbShadow: "none",
        borderDefault: "rgba(255, 255, 255, 0.35)",
        borderSubtle: "rgba(255, 255, 255, 0.15)",
        borderGlass: "rgba(255, 255, 255, 0.1)",
        shadow: "none",
        shadowElevated: "0 8px 32px rgba(0, 0, 0, 0.5)",
        blur: "blur(14px)",
        ambientGlow: "radial-gradient(ellipse at 50% 0%, rgba(94, 196, 176, 0.05), transparent 70%)",
        chipBg: "rgba(255, 255, 255, 0.05)",
        chipBorder: "rgba(255, 255, 255, 0.12)",
        chipSelectedBg: "rgba(94, 196, 176, 0.15)",
        chipSelectedBorder: "rgba(94, 196, 176, 0.45)",
        quoteBg: "rgba(255, 255, 255, 0.03)",
        quoteBorder: "rgba(94, 196, 176, 0.35)",
        navActiveBg: "rgba(94, 196, 176, 0.15)",
        navActiveBorder: "rgba(94, 196, 176, 0.45)",
        toggleTrack: "rgba(255, 255, 255, 0.1)",
        toggleThumb: "#ede9e3",
        toggleIcon: "🌙",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Inter', sans-serif",
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
        textPrimary: "#2A2421", // Darker for better aging eyes
        textSecondary: "#4A4440",
        textMuted: "#66615C",
        textDisabled: "#A8A4A0",
        accentPrimary: "#2E8F89", // Slightly deeper teal for contrast
        accentPrimaryHover: "#24736E",
        accentPrimaryMuted: "rgba(46, 143, 137, 0.08)",
        accentPrimaryBorder: "rgba(46, 143, 137, 0.3)",
        accentSecondary: "#2E8F89",
        accentSecondaryMuted: "rgba(46, 143, 137, 0.1)",
        accentSecondaryBorder: "rgba(46, 143, 137, 0.2)",
        glowCyan: "rgba(46, 143, 137, 0.08)",
        glowGold: "rgba(196, 149, 106, 0.08)",
        orbFill: "radial-gradient(circle at 40% 35%, rgba(46, 143, 137, 0.35) 0%, rgba(36, 115, 110, 0.2) 60%, rgba(20, 80, 75, 0.1) 100%)",
        orbText: "#2A2421",
        orbParticle: "rgba(46, 143, 137, 0.4)",
        orbShadow: "0 8px 30px rgba(46, 143, 137, 0.08)",
        borderDefault: "#DED9D1", // Clearer borders
        borderSubtle: "#EBE7E0",
        borderGlass: "rgba(45, 40, 35, 0.12)",
        shadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        shadowElevated: "0 10px 30px rgba(45, 42, 38, 0.06)",
        blur: "blur(10px)",
        ambientGlow: "none",
        chipBg: "#F7F5F2",
        chipBorder: "#E8E4DF",
        chipSelectedBg: "rgba(46, 143, 137, 0.08)",
        chipSelectedBorder: "rgba(46, 143, 137, 0.45)",
        quoteBg: "rgba(46, 143, 137, 0.04)",
        quoteBorder: "rgba(46, 143, 137, 0.25)",
        navActiveBg: "rgba(46, 143, 137, 0.08)",
        navActiveBorder: "rgba(46, 143, 137, 0.45)",
        toggleTrack: "rgba(0, 0, 0, 0.08)",
        toggleThumb: "#4A4440",
        toggleIcon: "☀️",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Inter', sans-serif",
    },
};
