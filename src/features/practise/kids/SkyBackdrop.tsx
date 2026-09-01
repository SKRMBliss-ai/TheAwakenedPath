import { motion } from 'framer-motion';

/**
 * The Kids Gym hub's night sky.
 *
 * WHY THIS EXISTS. The hub previously sat on a flat 3-stop CSS gradient with
 * a loop of plain white dots — functional, but flat next to the room cards'
 * own richly painted art (a magenta feelings room, a teal body-detective lab,
 * an orange kindness glow…). This gives the hub the same "drawn scene" craft
 * as /mindgymforall's NatureStage: real depth (a moon, drifting nebula
 * glow, layered stars), and — the actual point — its nebula colours are
 * pulled from the room cards' own accent palette (rooms.ts), so the vibrant
 * cinematic cards read as having come FROM this sky, not as sitting on top
 * of an unrelated background.
 *
 * Still a night sky, still dark, still cosmic — kept exactly on the visual
 * direction Kids Gym already has. Nothing here touches the room cards, the
 * mascot, or the accent hues used inside a room.
 */

/** A handful of the rooms' own accents — Feelings' magenta, Body Detective's
 *  teal, Kindness' amber — reused here so the sky and the cards read as one
 *  world instead of two unrelated palettes stacked on each other. */
const NEBULA = {
  magenta: '#C77DE0', // Feelings Room
  teal: '#3FBCD4',    // Body Detective
  amber: '#E8944C',   // Kindness / Friendship
};

interface Star {
  x: number;
  y: number;
  r: number;
  delay: number;
  duration: number;
  sparkle?: keyof typeof NEBULA;
}

/** Deterministic, not random — a fixed scatter so the sky never reflows
 *  between renders, and spread across the FULL height on purpose: this box
 *  gets `slice`-cropped by the browser depending on how tall the room grid
 *  below happens to be, and a scene clustered in one band would empty out
 *  under some crops (the same lesson NatureStage's composition learned). */
const STARS: Star[] = [
  { x: 8, y: 6, r: 1.6, delay: 0.2, duration: 3.2 },
  { x: 22, y: 14, r: 2.2, delay: 1.1, duration: 4 },
  { x: 38, y: 5, r: 1.4, delay: 0.6, duration: 3.6 },
  { x: 9, y: 15, r: 2, delay: 0, duration: 4.4, sparkle: 'teal' }, // flanks the heading, not behind it
  { x: 70, y: 4, r: 1.6, delay: 1.8, duration: 3 },
  { x: 86, y: 9, r: 2, delay: 0.4, duration: 3.8 },
  { x: 94, y: 16, r: 1.4, delay: 1.3, duration: 3.4 },
  { x: 4, y: 22, r: 1.8, delay: 0.9, duration: 4.2 },
  { x: 30, y: 25, r: 1.4, delay: 1.6, duration: 3 },
  { x: 92, y: 22, r: 2, delay: 0.3, duration: 4, sparkle: 'magenta' },
  { x: 63, y: 24, r: 1.6, delay: 1, duration: 3.6 },
  { x: 79, y: 19, r: 1.8, delay: 0.5, duration: 4.4 },
  { x: 12, y: 33, r: 1.4, delay: 1.4, duration: 3.2 },
  { x: 40, y: 36, r: 2, delay: 0.7, duration: 3.8 },
  { x: 58, y: 32, r: 1.6, delay: 1.9, duration: 3 },
  { x: 90, y: 30, r: 2.2, delay: 0.2, duration: 4.2, sparkle: 'amber' },
  { x: 20, y: 44, r: 1.4, delay: 1.2, duration: 3.6 },
  { x: 50, y: 47, r: 1.8, delay: 0.6, duration: 4 },
  { x: 75, y: 42, r: 1.4, delay: 1.7, duration: 3.4 },
  { x: 6, y: 55, r: 1.6, delay: 0.4, duration: 3.8 },
  { x: 34, y: 58, r: 2, delay: 1.5, duration: 4.4, sparkle: 'teal' },
  { x: 66, y: 54, r: 1.4, delay: 0.9, duration: 3 },
  { x: 88, y: 60, r: 1.8, delay: 0.3, duration: 3.6 },
  { x: 15, y: 68, r: 1.4, delay: 1.1, duration: 4 },
  { x: 44, y: 70, r: 1.6, delay: 0.8, duration: 3.4 },
  { x: 72, y: 66, r: 2, delay: 1.6, duration: 4.2, sparkle: 'magenta' },
  { x: 96, y: 72, r: 1.4, delay: 0.5, duration: 3.8 },
  { x: 25, y: 80, r: 1.6, delay: 1.3, duration: 3 },
  { x: 55, y: 83, r: 1.4, delay: 0.7, duration: 3.6 },
  { x: 82, y: 78, r: 1.8, delay: 1.8, duration: 4 },
];

/**
 * A small four-point sparkle, echoing the twinkle a child would draw.
 *
 * Its size is a FIXED viewBox-unit constant, deliberately not derived from
 * the star's own `r`. This band gets `slice`-cropped to very different
 * aspect ratios: on a phone the box is narrow and tall, giving a scale
 * factor around 6-7x; on a wide desktop window the same box is short and
 * very wide, pushing the scale factor to 14x+ (a 1440x648 band against this
 * 100x100 viewBox scales by max(1440/100, 648/100) = 14.4). A sparkle sized
 * from `r` looked reasonable on phone and rendered as a 150px+ solid shape
 * on desktop, at the exact same nominal size. A fixed span stays a delicate
 * accent at both extremes instead of scaling with everything else in the
 * scene.
 */
const SPARKLE_SPAN = 1.7;

function Sparkle({ x, y, color }: { x: number; y: number; color: string }) {
  const s = SPARKLE_SPAN;
  return (
    <path
      d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`}
      fill={color}
    />
  );
}

export function SkyBackdrop() {
  return (
    // Two layers, deliberately not one. KidsWorld's page is `min-h-[100svh]`
    // but grows far taller with content (10 room cards in a 3-col grid can
    // easily run 1600px+) — an `inset-0` SVG here would size its own
    // container to that FULL scrollable height, and `slice` scales uniformly
    // to cover whatever box it's given. The result: this SVG's nebula and
    // sparkle shapes rendered roughly 2x oversized (one sparkle became a
    // 270px-wide triangle) because the slice math was covering a box far
    // taller than the visible screen. NatureStage hit the same class of bug
    // and was fixed the same way: bound the art to a sane, explicit height.
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Layer 1 — the base night sky. A CSS gradient, not SVG, specifically
          because a gradient has no "scale to cover" step to get wrong: it
          resizes to any element height, including this page's unpredictable
          scrollable one, with zero distortion. This alone is what the sky
          looks like below the illustrated band. */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #150C38 0%, #2E1B62 45%, #4A2258 78%, #5C2A63 100%)' }}
      />

      {/* Layer 2 — the illustrated scene (moon, nebula glow, stars). Bounded
          to a fixed height range instead of the page's full height, so the
          slice math it depends on stays sane. Covers the header, mascot and
          roughly the first row of room cards; the plain gradient above
          continues underneath and reads as the same sky further down. */}
      <div className="absolute inset-x-0 top-0" style={{ height: 'clamp(520px, 72vh, 760px)' }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block' }}
      >
        <defs>
          <radialGradient id="kw-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4D6" />
            <stop offset="55%" stopColor="#FFE9B8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFE9B8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="kw-neb-magenta" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={NEBULA.magenta} stopOpacity="0.32" />
            <stop offset="100%" stopColor={NEBULA.magenta} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="kw-neb-teal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={NEBULA.teal} stopOpacity="0.26" />
            <stop offset="100%" stopColor={NEBULA.teal} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="kw-neb-amber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={NEBULA.amber} stopOpacity="0.22" />
            <stop offset="100%" stopColor={NEBULA.amber} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* drifting nebula glow, spread across the full height so it survives
            being slice-cropped to very different aspect ratios */}
        <circle cx="14" cy="16" r="30" fill="url(#kw-neb-magenta)" />
        <circle cx="88" cy="38" r="26" fill="url(#kw-neb-teal)" />
        <circle cx="20" cy="62" r="28" fill="url(#kw-neb-amber)" />
        <circle cx="80" cy="86" r="24" fill="url(#kw-neb-magenta)" opacity="0.7" />

        {/* the moon — a soft glow, not a literal lit disc; friendlier for
            a children's screen and reads as "watching over the rooms" */}
        <circle cx="82" cy="10" r="16" fill="url(#kw-moon)" />
        <circle cx="82" cy="10" r="5.5" fill="#FFF8E6" opacity="0.95" />

        {STARS.map((s, i) =>
          s.sparkle ? (
            // opacity-only, deliberately: a `scale` transform here previously
            // rendered as a huge misplaced triangle — framer-motion's CSS
            // transform-origin (in px) doesn't line up with this SVG's 0-100
            // viewBox coordinate space, so the origin ended up far outside the
            // shape. Opacity has no such coordinate-space dependency.
            <motion.g
              key={i}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: s.duration, delay: s.delay, ease: 'easeInOut' }}
            >
              <Sparkle x={s.x} y={s.y} color={NEBULA[s.sparkle]} />
            </motion.g>
          ) : (
            <motion.circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r * 0.35}
              fill="#FFFFFF"
              animate={{ opacity: [0.15, 0.9, 0.15] }}
              transition={{ repeat: Infinity, duration: s.duration, delay: s.delay, ease: 'easeInOut' }}
            />
          ),
        )}
      </svg>
      </div>
    </div>
  );
}
