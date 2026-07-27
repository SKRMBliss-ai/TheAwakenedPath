import type { Palette } from '../../lib/siteTheme';

// ─────────────────────────────────────────────────────────────────────────────
// QuietMind — a small "a quieter mind" spot illustration: a calm figure inside
// soft concentric rings. Used as a warm feature accent.
//
// Inline SVG (no request, ~1 KB), STATIC (no animation) so it stays cheap on
// low-end phones and slow connections. Purely decorative → aria-hidden.
// ─────────────────────────────────────────────────────────────────────────────

export default function QuietMind({
  palette,
  size = 200,
}: { palette: Palette; size?: number }) {
  const ring = palette.PURPLE;
  const body = palette.isDark ? palette.PURPLE : '#AA98A9'; // the brand mauve
  const core = palette.BROWN;
  const arm = palette.PURPLE_STRONG;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ display: 'block' }}
    >
      <g transform="translate(100 104)" fill="none">
        <g stroke={ring} strokeWidth="1">
          <circle r="46" opacity="0.55" />
          <circle r="63" opacity="0.34" />
          <circle r="80" opacity="0.18" />
        </g>
      </g>
      {/* seated figure */}
      <g transform="translate(100 104)">
        <path
          d="M0 -32 C 23 -32 32 -8 32 7 C 32 28 15 42 0 42 C -15 42 -32 28 -32 7 C -32 -8 -23 -32 0 -32 Z"
          fill={body}
          opacity="0.92"
        />
        <circle cx="0" cy="5" r="11" fill={core} />
        <g stroke={arm} strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
          <path d="M-49 -2 Q -64 7 -49 15" />
          <path d="M49 -2 Q 64 7 49 15" />
        </g>
      </g>
    </svg>
  );
}
