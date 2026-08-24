import { useState, useEffect } from 'react';
import SacredGeometry from '../../features/landing/components/SacredGeometry';
import { useSiteTheme } from '../../lib/siteTheme';

/**
 * The backdrop specifically for Kids Challenge pages.
 * It renders the spiritual SacredGeometry mandala, but overlays
 * a distant, dim polka-dot pattern of emotional characters that scroll in parallax.
 */
export default function KidsBackdrop() {
  const { palette } = useSiteTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* 1. The base Sacred Geometry Mandala */}
      <SacredGeometry isDark={palette.isDark} />

      {/* 2. The repeating emotion character background with scroll parallax */}
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/marketing/kids_emotion_pattern.png')",
          backgroundSize: '1800px 1800px', // Scale the pattern so characters are huge and sparse
          backgroundPosition: `center ${scrollY * -0.35}px`, // Parallax scroll effect
          backgroundRepeat: 'repeat',
          opacity: palette.isDark ? 0.25 : 0.08, // Clearly visible in dark mode, tasteful in light mode
          mixBlendMode: palette.isDark ? 'screen' : 'multiply',
          zIndex: 1, 
        }}
      />
    </div>
  );
}
