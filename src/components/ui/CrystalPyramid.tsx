import { motion } from 'framer-motion';

interface CrystalPyramidProps {
  className?: string;
}

export const CrystalPyramid: React.FC<CrystalPyramidProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient radial glow behind crystal */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 46%, rgba(94,196,176,0.13) 0%, rgba(129,140,248,0.06) 45%, transparent 72%)',
        }}
      />

      {/* Outer pulsing halo */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '65%',
          aspectRatio: '1',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(94,196,176,0.09) 0%, transparent 65%)',
        }}
        animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating crystal */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full"
      >
        <svg
          viewBox="0 0 400 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(0 0 48px rgba(94,196,176,0.22))' }}
        >
          <defs>
            {/* Edge glow */}
            <filter id="cp-edge" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Strong apex / vertex glow */}
            <filter id="cp-apex" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft wide glow for center light */}
            <filter id="cp-center" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="20" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Face gradients */}
            <linearGradient
              id="cp-fl"
              x1="200" y1="22" x2="28" y2="462"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#5EC4B0" stopOpacity="0.22" />
              <stop offset="48%" stopColor="#818cf8" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#5EC4B0" stopOpacity="0.04" />
            </linearGradient>

            <linearGradient
              id="cp-fr"
              x1="200" y1="22" x2="372" y2="462"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="42%" stopColor="#5EC4B0" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
            </linearGradient>

            <linearGradient
              id="cp-fi"
              x1="200" y1="22" x2="200" y2="245"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#5EC4B0" stopOpacity="0.04" />
            </linearGradient>

            {/* Central radial light */}
            <radialGradient
              id="cp-light"
              cx="200" cy="198" r="115"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.97" />
              <stop offset="14%" stopColor="#a3e7de" stopOpacity="0.82" />
              <stop offset="38%" stopColor="#5EC4B0" stopOpacity="0.42" />
              <stop offset="68%" stopColor="#818cf8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Base reflection */}
            <radialGradient id="cp-base" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5EC4B0" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#5EC4B0" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── Ground glow ── */}
          <ellipse cx="200" cy="466" rx="128" ry="16"
            fill="url(#cp-base)" filter="url(#cp-center)" />

          {/* ── Main faces ── */}
          <polygon points="200,22 28,245 200,462" fill="url(#cp-fl)" />
          <polygon points="200,22 372,245 200,462" fill="url(#cp-fr)" />

          {/* Upper inner sub-triangles */}
          <polygon points="200,22 114,133 200,198" fill="url(#cp-fi)" opacity="0.65" />
          <polygon points="200,22 286,133 200,198" fill="url(#cp-fi)" opacity="0.42" />

          {/* ── Glowing outer diamond outline ── */}
          <polygon
            points="200,22 28,245 200,462 372,245"
            fill="none"
            stroke="#5EC4B0"
            strokeWidth="1.6"
            filter="url(#cp-edge)"
            opacity="0.88"
          />

          {/* ── Equator line ── */}
          <line x1="28" y1="245" x2="372" y2="245"
            stroke="#5EC4B0" strokeWidth="0.85"
            opacity="0.52" filter="url(#cp-edge)" />

          {/* ── Center-to-vertex lines ── */}
          <line x1="200" y1="198" x2="200" y2="22"
            stroke="#a3e7de" strokeWidth="0.7" opacity="0.32" />
          <line x1="200" y1="198" x2="28" y2="245"
            stroke="#818cf8" strokeWidth="0.7" opacity="0.44" filter="url(#cp-edge)" />
          <line x1="200" y1="198" x2="372" y2="245"
            stroke="#818cf8" strokeWidth="0.7" opacity="0.44" filter="url(#cp-edge)" />
          <line x1="200" y1="198" x2="200" y2="462"
            stroke="#5EC4B0" strokeWidth="0.7" opacity="0.28" />

          {/* ── Upper facet sub-lines ── */}
          <line x1="114" y1="133" x2="286" y2="133"
            stroke="#5EC4B0" strokeWidth="0.85" opacity="0.48" filter="url(#cp-edge)" />
          <line x1="200" y1="22" x2="114" y2="133"
            stroke="#a3e7de" strokeWidth="0.6" opacity="0.28" />
          <line x1="200" y1="22" x2="286" y2="133"
            stroke="#a3e7de" strokeWidth="0.6" opacity="0.28" />
          <line x1="114" y1="133" x2="200" y2="198"
            stroke="#818cf8" strokeWidth="0.55" opacity="0.38" filter="url(#cp-edge)" />
          <line x1="286" y1="133" x2="200" y2="198"
            stroke="#818cf8" strokeWidth="0.55" opacity="0.38" filter="url(#cp-edge)" />

          {/* ── Lower facet sub-lines ── */}
          <line x1="114" y1="353" x2="286" y2="353"
            stroke="#6366f1" strokeWidth="0.85" opacity="0.36" filter="url(#cp-edge)" />
          <line x1="114" y1="353" x2="200" y2="198"
            stroke="#6366f1" strokeWidth="0.55" opacity="0.26" />
          <line x1="286" y1="353" x2="200" y2="198"
            stroke="#6366f1" strokeWidth="0.55" opacity="0.26" />
          <line x1="28" y1="245" x2="114" y2="353"
            stroke="#5EC4B0" strokeWidth="0.6" opacity="0.28" />
          <line x1="372" y1="245" x2="286" y2="353"
            stroke="#5EC4B0" strokeWidth="0.6" opacity="0.28" />

          {/* ── Central light ── */}
          <circle cx="200" cy="198" r="90"
            fill="url(#cp-light)" filter="url(#cp-center)" />
          <circle cx="200" cy="198" r="9"
            fill="white" opacity="0.92" filter="url(#cp-apex)" />
          <circle cx="200" cy="198" r="3.5" fill="white" />

          {/* ── Vertex glows ── */}
          <circle cx="200" cy="22" r="5"
            fill="#a3e7de" opacity="0.88" filter="url(#cp-apex)" />
          <circle cx="28" cy="245" r="3.5"
            fill="#818cf8" opacity="0.72" filter="url(#cp-edge)" />
          <circle cx="372" cy="245" r="3.5"
            fill="#818cf8" opacity="0.72" filter="url(#cp-edge)" />
          <circle cx="200" cy="462" r="4"
            fill="#5EC4B0" opacity="0.62" filter="url(#cp-apex)" />
        </svg>
      </motion.div>
    </div>
  );
};
