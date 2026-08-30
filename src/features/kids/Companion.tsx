import { motion } from 'framer-motion';
import type { Companion } from './data';

/**
 * An ORIGINAL emotion companion — a soft glowing blob with a simple friendly
 * face, drawn entirely from primitives. No copyrighted characters.
 */
export function CompanionOrb({ c, size = 96, bounce = true, accessory }: {
  c: Companion; size?: number; bounce?: boolean; accessory?: string;
}) {
  return (
    <motion.div
      animate={bounce ? { y: [0, -6, 0] } : undefined}
      transition={bounce ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{ width: size, height: size }}
      className="relative select-none"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-label={c.name}>
        <defs>
          <radialGradient id={`g-${c.id}`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor={c.color} />
            <stop offset="100%" stopColor={c.color2} />
          </radialGradient>
        </defs>
        {/* glow */}
        <circle cx="50" cy="52" r="42" fill={c.color} opacity="0.25" />
        {/* body */}
        <circle cx="50" cy="50" r="36" fill={`url(#g-${c.id})`} />
        {/* cheeks */}
        <circle cx="34" cy="58" r="6" fill="#fff" opacity="0.35" />
        <circle cx="66" cy="58" r="6" fill="#fff" opacity="0.35" />
        {/* eyes */}
        <circle cx="40" cy="46" r="5.5" fill="#2A2118" />
        <circle cx="60" cy="46" r="5.5" fill="#2A2118" />
        <circle cx="42" cy="44" r="1.8" fill="#fff" />
        <circle cx="62" cy="44" r="1.8" fill="#fff" />
        {/* smile */}
        <path d="M40 60 Q50 70 60 60" stroke="#2A2118" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* little sparkle antenna */}
        <circle cx="50" cy="12" r="3.5" fill={c.color} />
        <line x1="50" y1="16" x2="50" y2="24" stroke={c.color} strokeWidth="2.5" />
      </svg>
      {accessory && (
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[22px]" style={{ fontSize: size * 0.28 }}>
          {accessory}
        </span>
      )}
    </motion.div>
  );
}
