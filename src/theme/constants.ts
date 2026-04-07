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
        textMuted: "rgba(237, 233, 227, 0.78)",
        textDisabled: "rgba(237, 233, 227, 0.45)",
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
        borderDefault: "rgba(255, 255, 255, 0.25)",
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
        textSecondary: "#4a4340",
        textMuted: "rgba(42, 37, 33, 0.82)",
        textDisabled: "rgba(42, 37, 33, 0.55)",
        accentPrimary: "#36ABA3",
        accentPrimaryHover: "#2E8F89",
        accentPrimaryMuted: "rgba(54, 171, 163, 0.12)",
        accentPrimaryBorder: "rgba(54, 171, 163, 0.35)",
        accentSecondary: "#36ABA3",
        accentSecondaryMuted: "rgba(54, 171, 163, 0.15)",
        accentSecondaryBorder: "rgba(54, 171, 163, 0.25)",
        glowCyan: "rgba(54, 171, 163, 0.1)",
        glowGold: "rgba(196, 149, 106, 0.1)",
        orbFill: "radial-gradient(circle at 40% 35%, rgba(54, 171, 163, 0.20) 0%, rgba(40, 140, 134, 0.14) 60%, rgba(30, 110, 105, 0.05) 100%)",
        orbText: "rgba(60,40,50,0.75)",
        orbParticle: "rgba(54, 171, 163, 0.3)",
        orbShadow: "0 8px 40px rgba(54, 171, 163, 0.08)",
        borderDefault: "rgba(0, 0, 0, 0.28)",
        borderSubtle: "rgba(0, 0, 0, 0.18)",
        borderGlass: "rgba(0, 0, 0, 0.14)",
        shadow: "0 1px 3px rgba(45, 40, 35, 0.06)",
        shadowElevated: "0 4px 12px rgba(45, 42, 38, 0.12)",
        blur: "blur(12px)",
        ambientGlow: "none",
        chipBg: "rgba(45, 42, 38, 0.04)",
        chipBorder: "rgba(45, 42, 38, 0.08)",
        chipSelectedBg: "rgba(54, 171, 163, 0.1)",
        chipSelectedBorder: "rgba(54, 171, 163, 0.35)",
        quoteBg: "rgba(54, 171, 163, 0.06)",
        quoteBorder: "rgba(54, 171, 163, 0.3)",
        navActiveBg: "rgba(54, 171, 163, 0.1)",
        navActiveBorder: "rgba(54, 171, 163, 0.35)",
        toggleTrack: "rgba(0, 0, 0, 0.06)",
        toggleThumb: "#5a4f48",
        toggleIcon: "☀️",
        fontFamilySerif: "'Cormorant Garamond', Georgia, serif",
        fontFamilySans: "'Outfit', 'Inter', sans-serif",
    },
};
