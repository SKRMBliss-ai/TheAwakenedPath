import { motion } from 'framer-motion';
import type { Companion, Expression, Shape } from './data';

/**
 * An ORIGINAL, expressive emotion character — a distinct silhouette (star, drop,
 * spark, leaf, moon…) with a real animated face: joyful grins, angry brows,
 * worried sweat, sleepy lids, shy blush. Drawn entirely from SVG primitives; no
 * copyrighted characters and no imitation of any protected design.
 */
export function CompanionOrb({ c, size = 96, bounce = true, accessory }: {
  c: Companion; size?: number; bounce?: boolean; accessory?: string;
}) {
  const expr = c.expression ?? 'joy';
  const shape = c.shape ?? 'star';
  const gid = `g-${c.id}`;
  return (
    <motion.div
      animate={bounce ? { y: [0, -6, 0], rotate: [0, -2, 2, 0] } : undefined}
      transition={bounce ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{ width: size, height: size }}
      className="relative select-none"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-label={c.name} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={gid} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor={c.color} />
            <stop offset="100%" stopColor={c.color2} />
          </radialGradient>
        </defs>
        {/* soft glow */}
        <circle cx="50" cy="54" r="40" fill={c.color} opacity="0.22" />
        {/* the distinct body */}
        <Body shape={shape} gid={gid} />
        {/* topper accents that make each silhouette unique */}
        <Topper shape={shape} color2={c.color2} />
        {/* the expressive face */}
        <Face expr={expr} color2={c.color2} />
      </svg>
      {accessory && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2" style={{ fontSize: size * 0.3 }}>{accessory}</span>
      )}
    </motion.div>
  );
}

function Body({ shape, gid }: { shape: Shape; gid: string }) {
  const fill = `url(#${gid})`;
  switch (shape) {
    case 'drop':
      return <path d="M50 16 C64 34 74 46 74 60 a24 24 0 1 1 -48 0 C26 46 36 34 50 16 Z" fill={fill} />;
    case 'diamond':
      return <path d="M50 14 L82 50 L50 90 L18 50 Z" fill={fill} />;
    case 'heart':
      return <path d="M50 84 C18 60 22 30 40 30 c8 0 10 6 10 6 s2-6 10-6 c18 0 22 30 -10 54 Z" fill={fill} />;
    case 'shield':
      return <path d="M50 16 L78 26 V54 C78 72 66 82 50 88 C34 82 22 72 22 54 V26 Z" fill={fill} />;
    case 'leaf':
      return <path d="M50 14 C74 24 82 50 60 82 C40 78 22 60 30 34 C36 22 42 17 50 14 Z" fill={fill} />;
    case 'moon':
      return <path d="M64 18 A38 38 0 1 0 64 90 A30 30 0 1 1 64 18 Z" fill={fill} />;
    case 'bolt':
      return <path d="M50 12 C70 16 82 34 78 56 C74 78 60 88 50 88 C34 88 22 74 24 54 C26 32 34 16 50 12 Z" fill={fill} />;
    default: // star / spark → friendly round with points added in Topper
      return <circle cx="50" cy="54" r="34" fill={fill} />;
  }
}

function Topper({ shape, color2 }: { shape: Shape; color2: string }) {
  switch (shape) {
    case 'star':
      return (
        <g fill={color2}>
          {[0, 72, 144, 216, 288].map((a) => {
            const r = 40, cx = 50 + r * Math.cos((a - 90) * Math.PI / 180), cy = 54 + r * Math.sin((a - 90) * Math.PI / 180);
            return <circle key={a} cx={cx} cy={cy} r="5" />;
          })}
        </g>
      );
    case 'spark':
      return <path d="M50 8 C54 18 62 20 58 30 C68 26 70 34 62 40 M50 8 C46 18 38 20 42 30" stroke={color2} strokeWidth="4" fill="none" strokeLinecap="round" />;
    case 'leaf':
      return <path d="M50 14 C52 8 56 6 60 8" stroke={color2} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    case 'bolt':
      return <path d="M50 12 l-4 -8 l8 0 z" fill={color2} />;
    case 'diamond':
      return <g fill="#fff" opacity="0.7"><circle cx="40" cy="34" r="2" /><circle cx="60" cy="40" r="1.5" /></g>;
    case 'heart':
      return <path d="M50 26 l3 -6 l3 6" stroke={color2} strokeWidth="3" fill="none" strokeLinecap="round" />;
    case 'moon':
      return <g fill="#fff" opacity="0.8"><circle cx="30" cy="30" r="2" /><circle cx="24" cy="46" r="1.5" /></g>;
    default:
      return null;
  }
}

/** The heart of "emotive" — a face built per expression. Base eye centres at
 *  (40,50) and (60,50); mouth around y=64. */
function Face({ expr, color2 }: { expr: Expression; color2: string }) {
  const ink = '#2A2118';
  const eyeWhite = '#fff';
  // Shared cheeks
  const cheeks = (op = 0.35) => (
    <g fill="#FF7BA3" opacity={op}><circle cx="32" cy="60" r="5" /><circle cx="68" cy="60" r="5" /></g>
  );

  switch (expr) {
    case 'joy':
      return (
        <g>
          {cheeks(0.4)}
          <g fill={ink}><circle cx="40" cy="49" r="6" /><circle cx="60" cy="49" r="6" /></g>
          <g fill={eyeWhite}><circle cx="42" cy="47" r="2" /><circle cx="62" cy="47" r="2" /></g>
          {/* big open grin */}
          <path d="M38 60 Q50 76 62 60 Q50 66 38 60 Z" fill={ink} />
          <path d="M40 62 Q50 68 60 62" fill="#FF7BA3" />
        </g>
      );
    case 'sad':
      return (
        <g>
          {/* inner-up brows */}
          <path d="M34 42 Q40 44 44 42" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M56 42 Q60 44 66 42" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <g fill={ink}><ellipse cx="40" cy="51" rx="5" ry="6" /><ellipse cx="60" cy="51" rx="5" ry="6" /></g>
          <g fill={eyeWhite}><circle cx="41" cy="49" r="1.8" /><circle cx="61" cy="49" r="1.8" /></g>
          {/* tear */}
          <path d="M60 58 q-3 6 0 8 q3 -2 0 -8Z" fill="#5AA9E6" />
          <path d="M42 66 Q50 60 58 66" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'angry':
      return (
        <g>
          {/* down-in brows */}
          <path d="M34 44 L46 48" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M66 44 L54 48" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
          <g fill={ink}><circle cx="41" cy="53" r="4.5" /><circle cx="59" cy="53" r="4.5" /></g>
          {/* gritted mouth */}
          <path d="M40 65 h20 v5 h-20 z" fill={ink} />
          <path d="M46 65 v5 M52 65 v5" stroke="#fff" strokeWidth="1.5" />
          {/* steam puffs */}
          <g fill={color2}><circle cx="26" cy="40" r="2.5" opacity="0.6" /><circle cx="74" cy="40" r="2.5" opacity="0.6" /></g>
        </g>
      );
    case 'worried':
      return (
        <g>
          {/* raised angled brows */}
          <path d="M34 40 Q40 37 45 41" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M66 40 Q60 37 55 41" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <g fill={ink}><circle cx="40" cy="50" r="6" /><circle cx="60" cy="50" r="6" /></g>
          <g fill={eyeWhite}><circle cx="41" cy="48" r="2" /><circle cx="61" cy="48" r="2" /></g>
          {/* wavy worried mouth */}
          <path d="M42 66 q4 -4 8 0 q4 4 8 0" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* sweat drop */}
          <path d="M74 46 q-3 5 0 7 q3 -2 0 -7Z" fill="#5AA9E6" />
        </g>
      );
    case 'calm':
      return (
        <g>
          {cheeks(0.3)}
          {/* gentle closed happy eyes */}
          <path d="M35 50 Q40 46 45 50" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M55 50 Q60 46 65 50" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M42 63 Q50 69 58 63" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'shy':
      return (
        <g>
          {cheeks(0.6)}
          {/* looking-away small eyes */}
          <g fill={ink}><circle cx="42" cy="50" r="4" /><circle cx="62" cy="50" r="4" /></g>
          <g fill={eyeWhite}><circle cx="43" cy="49" r="1.4" /><circle cx="63" cy="49" r="1.4" /></g>
          <path d="M45 64 Q50 67 55 64" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'bored':
      return (
        <g>
          {/* half-lidded */}
          <path d="M34 49 h12" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <path d="M54 49 h12" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <g fill={ink}><circle cx="40" cy="51" r="2.5" /><circle cx="60" cy="51" r="2.5" /></g>
          <path d="M43 65 h14" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'sleepy':
      return (
        <g>
          {/* closed eyes */}
          <path d="M35 50 Q40 54 45 50" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M55 50 Q60 54 65 50" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          {/* small yawn */}
          <ellipse cx="50" cy="65" rx="4" ry="5" fill={ink} />
          <text x="70" y="34" fontSize="12" fill={color2} fontWeight="bold">z</text>
        </g>
      );
    case 'curious':
      return (
        <g>
          {/* one raised brow */}
          <path d="M34 41 Q40 37 46 40" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55 43 h11" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
          <g fill={ink}><circle cx="40" cy="50" r="6.5" /><circle cx="60" cy="50" r="5" /></g>
          <g fill={eyeWhite}><circle cx="42" cy="48" r="2.2" /><circle cx="62" cy="48" r="1.8" /></g>
          <circle cx="50" cy="65" r="4" fill={ink} />
          <g fill={color2}><path d="M76 40 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z" opacity="0.7" /></g>
        </g>
      );
    case 'picky':
      return (
        <g>
          {/* narrowed eyes + one raised brow */}
          <path d="M34 42 Q40 39 46 42" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55 44 h11" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 50 q4 -2 8 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M56 50 q4 -2 8 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* smirk */}
          <path d="M44 65 Q52 66 58 61" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}
