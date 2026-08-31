import { motion } from 'framer-motion';

/**
 * Pip — the Kids Gym mascot. An original character: a small, soft, violet
 * creature who travels with the child into every room and behaves differently
 * in each one (curious in Feelings, brave in Worry, nurturing in Kindness).
 *
 * Drawn entirely in SVG so it scales cleanly, themes per room, and costs
 * nothing to load. Pip is deliberately simple — a rounded body, two big eyes,
 * a small smile — so a child reads warmth instantly at any size.
 */

export type MascotMood =
  | 'curious'      // Feelings — head tilted, eyes wide
  | 'investigate'  // Thought
  | 'explorer'     // Body Detective
  | 'calm'         // Pause — eyes softly closed
  | 'storyteller'  // Different Story
  | 'supportive'   // Friendship
  | 'energetic'    // Anger
  | 'brave'        // Worry — holding a lantern
  | 'nurturing'    // Kindness
  | 'peaceful';    // Reflection

const BODY: Record<string, [string, string]> = {
  default: ['#C4A9FF', '#7C4FE0'],
  warm: ['#FFCE9E', '#F09A4B'],
  calm: ['#A9E7FF', '#4FA8E0'],
};

export function Mascot({
  mood = 'curious',
  size = 120,
  palette = 'default',
  float = true,
  accessory,
}: {
  mood?: MascotMood;
  size?: number;
  palette?: keyof typeof BODY;
  float?: boolean;
  /** An object Pip carries — reinforces the room's story. */
  accessory?: 'lantern' | 'seed' | 'none';
}) {
  const [light, dark] = BODY[palette] ?? BODY.default;
  const eyesClosed = mood === 'calm' || mood === 'peaceful';
  const bigSmile = mood === 'energetic' || mood === 'nurturing' || mood === 'storyteller';
  const tilt = mood === 'curious' || mood === 'investigate' ? -6 : 0;

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={float ? { y: [0, -7, 0] } : undefined}
      transition={float ? { repeat: Infinity, duration: 4, ease: 'easeInOut' } : undefined}
    >
      <motion.svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
        animate={{ rotate: tilt }}
        transition={{ type: 'spring', stiffness: 60 }}
      >
        <defs>
          <radialGradient id={`pip-body-${palette}`} cx="38%" cy="30%">
            <stop offset="0%" stopColor={light} />
            <stop offset="100%" stopColor={dark} />
          </radialGradient>
          <radialGradient id="pip-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor={light} stopOpacity="0.55" />
            <stop offset="100%" stopColor={light} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lantern-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFC65C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* soft aura */}
        <circle cx="60" cy="62" r="52" fill="url(#pip-glow)" />

        {/* ears */}
        <path d="M32 34 C30 20 40 16 44 28 Z" fill={dark} opacity="0.9" />
        <path d="M88 34 C90 20 80 16 76 28 Z" fill={dark} opacity="0.9" />

        {/* body — a soft rounded blob, slightly wider at the base */}
        <path
          d="M60 20
             C86 20 98 38 98 60
             C98 84 84 98 60 98
             C36 98 22 84 22 60
             C22 38 34 20 60 20 Z"
          fill={`url(#pip-body-${palette})`}
        />

        {/* arms */}
        <motion.ellipse
          cx="20" cy="66" rx="8" ry="11" fill={dark}
          animate={mood === 'energetic' ? { rotate: [0, -18, 0] } : undefined}
          transition={{ repeat: Infinity, duration: 1.2 }}
          style={{ transformOrigin: '24px 62px' }}
        />
        <ellipse cx="100" cy="66" rx="8" ry="11" fill={dark} />

        {/* feet */}
        <ellipse cx="46" cy="99" rx="11" ry="6" fill={dark} />
        <ellipse cx="74" cy="99" rx="11" ry="6" fill={dark} />

        {/* cheeks */}
        <circle cx="38" cy="66" r="6" fill="#FF9EC4" opacity="0.45" />
        <circle cx="82" cy="66" r="6" fill="#FF9EC4" opacity="0.45" />

        {/* eyes */}
        {eyesClosed ? (
          <>
            <path d="M40 56 Q47 62 54 56" stroke="#2E1B4D" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M66 56 Q73 62 80 56" stroke="#2E1B4D" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="47" cy="56" rx="9" ry="10.5" fill="#FFFFFF" />
            <ellipse cx="73" cy="56" rx="9" ry="10.5" fill="#FFFFFF" />
            <circle cx="48" cy="57" r="4.6" fill="#2E1B4D" />
            <circle cx="74" cy="57" r="4.6" fill="#2E1B4D" />
            <circle cx="46" cy="54" r="1.7" fill="#FFFFFF" />
            <circle cx="72" cy="54" r="1.7" fill="#FFFFFF" />
          </>
        )}

        {/* mouth */}
        {bigSmile ? (
          <path d="M50 74 Q60 85 70 74 Q60 79 50 74 Z" fill="#2E1B4D" opacity="0.85" />
        ) : (
          <path d="M52 75 Q60 82 68 75" stroke="#2E1B4D" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}

        {/* accessories */}
        {accessory === 'lantern' && (
          <g>
            <circle cx="108" cy="72" r="16" fill="url(#lantern-glow)" />
            <line x1="100" y1="62" x2="108" y2="68" stroke="#8A6A3A" strokeWidth="2" strokeLinecap="round" />
            <rect x="103" y="68" width="10" height="12" rx="3" fill="#FFD98A" stroke="#B8863C" strokeWidth="1.5" />
          </g>
        )}
        {accessory === 'seed' && (
          <g>
            <circle cx="104" cy="74" r="10" fill="url(#lantern-glow)" />
            <ellipse cx="104" cy="74" rx="4" ry="5.5" fill="#F5D98A" stroke="#B8863C" strokeWidth="1.2" />
          </g>
        )}
      </motion.svg>
    </motion.div>
  );
}
