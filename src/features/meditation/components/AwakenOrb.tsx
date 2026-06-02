/**
 * AwakenOrb — the same dark-purple / gold orb from the main dashboard,
 * used as a non-interactive ambient centrepiece on the meditation landing screen.
 */
import { motion } from 'framer-motion';

interface Props {
  size?: number; // diameter in px, default 140
}

const AwakenOrb = ({ size = 140 }: Props) => {
  const ring = size + 16; // outer ring sits 8px beyond edge on each side

  return (
    <div className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>

      {/* Outer pulsing gold ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: 0,
          border: '1px solid rgba(184,151,58,.28)',
        }}
        animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.035, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
      />

      {/* Second, slower ring further out */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -10,
          border: '1px solid rgba(184,151,58,.10)',
        }}
        animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.05, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orb sphere */}
      <motion.div
        className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(ellipse at 37% 30%, #3D2640 0%, #180E22 55%, #090510 100%)',
          border: '1px solid rgba(184,151,58,.35)',
          boxShadow: '0 0 0 1px rgba(184,151,58,.15), 0 0 28px rgba(184,151,58,.25), 0 0 60px rgba(184,151,58,.10)',
        }}
        animate={{
          scale: [1, 1.022, 1],
          boxShadow: [
            '0 0 0 1px rgba(184,151,58,.15), 0 0 28px rgba(184,151,58,.25), 0 0 60px rgba(184,151,58,.10)',
            '0 0 0 1px rgba(184,151,58,.20), 0 0 40px rgba(184,151,58,.35), 0 0 80px rgba(184,151,58,.15)',
            '0 0 0 1px rgba(184,151,58,.15), 0 0 28px rgba(184,151,58,.25), 0 0 60px rgba(184,151,58,.10)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Inner highlight */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '8%', left: '12%', width: '42%', height: '30%',
            background: 'radial-gradient(ellipse, rgba(255,248,255,.07) 0%, transparent 78%)',
            transform: 'rotate(-18deg)',
          }}
        />

        {/* AWAKEN label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-sans text-[11px] tracking-[.3em] uppercase font-black select-none"
          style={{ color: 'rgba(225,205,215,.75)' }}
        >
          AWAKEN
        </motion.span>
      </motion.div>
    </div>
  );
};

export default AwakenOrb;
