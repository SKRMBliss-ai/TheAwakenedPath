import SacredGeometry from '../../features/landing/components/SacredGeometry';
import { useSiteTheme } from '../../lib/siteTheme';

/**
 * The backdrop specifically for Kids Challenge pages.
 * It renders the spiritual SacredGeometry mandala, but overlays
 * a distant, dim polka-dot pattern of emotional characters.
 */
export default function KidsBackdrop() {
  const { palette } = useSiteTheme();
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* 1. The base Sacred Geometry Mandala */}
      <SacredGeometry isDark={palette.isDark} />

      {/* 2. The repeating emotion character background */}
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/marketing/kids_emotion_pattern.png')",
          backgroundSize: '900px 900px', // Scale the pattern so characters are bigger and fewer
          backgroundRepeat: 'repeat',
          opacity: palette.isDark ? 0.05 : 0.06, // Keep it very faint like distant polka dots
          mixBlendMode: palette.isDark ? 'lighten' : 'multiply',
          zIndex: 1, 
        }}
      />
    </div>
  );
}
