import type { Palette } from '../../lib/siteTheme';

// ─────────────────────────────────────────────────────────────────────────────
// SectionMotif — the sacred-geometry figure (flower-of-life + hexagon, same
// family as the logo and HeroMark), meant to sit softly BEHIND a heading band
// as a watermark.
//
// Inline SVG, so it adds zero network requests and stays crisp at any size —
// which matters on slow connections. It is deliberately STATIC (no animation)
// so it costs nothing on low-end phones. Purely decorative → aria-hidden.
// ─────────────────────────────────────────────────────────────────────────────

export default function SectionMotif({
  palette,
  size = 300,
  opacity = 0.12,
}: { palette: Palette; size?: number; opacity?: number }) {
  const stroke = palette.PURPLE;
  const accent = palette.BROWN;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size * 0.6}
      viewBox="0 0 300 180"
      style={{ display: 'block', opacity, pointerEvents: 'none' }}
    >
      <g transform="translate(150 90)" fill="none">
        <g stroke={stroke} strokeWidth="0.8">
          <circle r="30" />
          <circle cx="30" cy="0" r="30" />
          <circle cx="-30" cy="0" r="30" />
          <circle cx="15" cy="26" r="30" />
          <circle cx="-15" cy="26" r="30" />
          <circle cx="15" cy="-26" r="30" />
          <circle cx="-15" cy="-26" r="30" />
        </g>
        <polygon points="0,-52 45,-26 45,26 0,52 -45,26 -45,-26" stroke={accent} strokeWidth="0.6" opacity="0.7" />
      </g>
      <circle cx="150" cy="90" r="3" fill={accent} />
    </svg>
  );
}
