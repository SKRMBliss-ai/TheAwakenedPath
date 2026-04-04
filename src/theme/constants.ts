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
        textSecondary: "rgba(237, 233, 227, 0.85)",
        textMuted: "rgba(237, 233, 227, 0.65)",
        textDisabled: "rgba(237, 233, 227, 0.3)",
        accentPrimary: "#f0a0aa",
        accentPrimaryHover: "#f2b1bb",
        accentPrimaryMuted: "rgba(240, 160, 170, 0.1)",
        accentPrimaryBorder: "rgba(240, 160, 170, 0.3)",
        accentSecondary: "#f0a0aa",
        accentSecondaryMuted: "rgba(240, 160, 170, 0.1)",
        accentSecondaryBorder: "rgba(240, 160, 170, 0.25)",
        glowCyan: "rgba(240, 160, 170, 0.1)",
        glowGold: "rgba(232, 184, 122, 0.15)",
        orbFill: "radial-gradient(circle at 40% 35%, rgba(200,160,190,0.22) 0%, rgba(180,140,170,0.12) 60%, rgba(160,120,150,0.04) 100%)",
        orbText: "rgba(255, 255, 255, 0.95)",
        orbParticle: "rgba(255, 255, 255, 0.5)",
        orbShadow: "none",
        borderDefault: "rgba(255, 255, 255, 0.25)",
        borderSubtle: "rgba(255, 255, 255, 0.15)",
        borderGlass: "rgba(255, 255, 255, 0.1)",
        shadow: "none",
        shadowElevated: "0 8px 32px rgba(0, 0, 0, 0.5)",
        blur: "blur(14px)",
        ambientGlow: "radial-gradient(ellipse at 50% 0%, rgba(240, 160, 170, 0.04), transparent 70%)",
        chipBg: "rgba(255, 255, 255, 0.05)",
        chipBorder: "rgba(255, 255, 255, 0.12)",
        chipSelectedBg: "rgba(240, 160, 170, 0.15)",
        chipSelectedBorder: "rgba(240, 160, 170, 0.45)",
        quoteBg: "rgba(255, 255, 255, 0.03)",
        quoteBorder: "rgba(240, 160, 170, 0.35)",
        navActiveBg: "rgba(240, 160, 170, 0.15)",
        navActiveBorder: "rgba(240, 160, 170, 0.45)",
        toggleTrack: "rgba(255, 255, 255, 0.1)",
        toggleThumb: "#ede9e3",
        toggleIcon: "🌙",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Inter', sans-serif",
    },
    light: {
        name: "light",
        label: "Day",
        bgPrimary: "#f7f2ec",
        bgSecondary: "#f0e8de",
        bgGradient: "linear-gradient(165deg, #f7f2ec 0%, #f0e8de 100%)",
        bgSurface: "rgba(255, 255, 255, 0.65)",
        bgSurfaceHover: "rgba(255, 255, 255, 0.75)",
        bgSurfaceActive: "rgba(255, 255, 255, 0.85)",
        bgInput: "#ffffff",
        bgInputFocus: "#ffffff",
        bgOverlay: "rgba(247, 242, 236, 0.92)",
        textPrimary: "#2a2521",
        textSecondary: "#5c544e",
        textMuted: "rgba(42, 37, 33, 0.45)",
        textDisabled: "rgba(42, 37, 33, 0.25)",
        accentPrimary: "#b8706e",
        accentPrimaryHover: "#a6605e",
        accentPrimaryMuted: "rgba(184, 112, 110, 0.1)",
        accentPrimaryBorder: "rgba(184, 112, 110, 0.25)",
        accentSecondary: "#5a8679",
        accentSecondaryMuted: "rgba(90, 134, 121, 0.12)",
        accentSecondaryBorder: "rgba(90, 134, 121, 0.15)",
        glowCyan: "rgba(90, 134, 121, 0.08)",
        glowGold: "rgba(196, 149, 106, 0.08)",
        orbFill: "radial-gradient(circle at 40% 35%, rgba(175,140,165,0.22) 0%, rgba(155,120,145,0.18) 60%, rgba(145,110,135,0.06) 100%)",
        orbText: "rgba(60,40,50,0.75)",
        orbParticle: "rgba(160,120,140,0.3)",
        orbShadow: "0 8px 40px rgba(140,100,120,0.08)",
        borderDefault: "rgba(0, 0, 0, 0.08)",
        borderSubtle: "rgba(0, 0, 0, 0.04)",
        borderGlass: "rgba(0, 0, 0, 0.04)",
        shadow: "0 1px 3px rgba(45, 40, 35, 0.04)",
        shadowElevated: "0 4px 12px rgba(45, 42, 38, 0.06)",
        blur: "blur(12px)",
        ambientGlow: "none",
        chipBg: "rgba(45, 42, 38, 0.04)",
        chipBorder: "rgba(45, 42, 38, 0.08)",
        chipSelectedBg: "rgba(184, 112, 110, 0.1)",
        chipSelectedBorder: "rgba(184, 112, 110, 0.35)",
        quoteBg: "rgba(90, 134, 121, 0.06)",
        quoteBorder: "rgba(90, 134, 121, 0.3)",
        navActiveBg: "rgba(184, 112, 110, 0.1)",
        navActiveBorder: "rgba(184, 112, 110, 0.35)",
        toggleTrack: "rgba(0, 0, 0, 0.06)",
        toggleThumb: "#5a4f48",
        toggleIcon: "☀️",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Inter', sans-serif",
    },
};
