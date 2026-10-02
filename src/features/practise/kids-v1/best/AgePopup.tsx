import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { useSpoken } from '../ui/useSpoken';
import { chirpySprite } from '../ui/sprites';
import { AGES, declineAge, setAge } from '../kit/band';
import { saveKidToAccount } from '../kit/kidAccount';
import { useAuth } from '../../../auth/AuthContext';
import * as sound from '../kit/sound';
import './AgePopup.css';

const HUES = [330, 22, 44, 150, 190, 212, 268, 300, 8, 110, 250];

/**
 * How old are you, asked once, the first time a child comes into Mind Gym.
 * It floats over the page instead of pushing it down: a see-through veil,
 * Chirpy bouncing, and a cloud of number balloons to pop.
 */
export function AgePopup({ onDone }: { onDone: () => void }) {
  const m = useMotion();
  const { user } = useAuth();
  const [picked, setPicked] = useState<number | 'no' | null>(null);

  const line = picked === null
    ? 'How old are you? Pop your number!'
    : picked === 'no'
      ? 'No problem! Let’s go.'
      : `${picked}! Brilliant. I’ve got games just right for you.`;
  useSpoken(line);

  const finish = (after: number) => window.setTimeout(onDone, after);

  const pick = (years: number) => {
    if (picked !== null) return;
    sound.play('balloonPop');
    window.setTimeout(() => sound.play('miniWin'), 180);
    setAge(years);
    if (user) void saveKidToAccount(user.uid, { age: years });
    setPicked(years);
    finish(2200);
  };

  const decline = () => {
    if (picked !== null) return;
    sound.play('tap');
    declineAge();
    setPicked('no');
    finish(1300);
  };

  return (
    <motion.div
      className="mg-age"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mg-age-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ fontFamily: FONT }}
    >
      <motion.div
        className="mg-age-card"
        initial={{ y: 40, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={m.quiet ? { duration: 0.4 } : { type: 'spring', stiffness: 170, damping: 16 }}
      >
        <motion.img
          className="mg-age-chirpy"
          src={chirpySprite(typeof picked === 'number' ? 'jumping' : 'excited')}
          alt=""
          aria-hidden="true"
          animate={m.quiet ? undefined : { y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        />

        <AnimatePresence mode="wait">
          <motion.h2
            key={String(picked)}
            id="mg-age-title"
            className="mg-age-title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {picked === null ? <>How old are <em>you</em>?</> : line}
          </motion.h2>
        </AnimatePresence>
        {picked === null && <p className="mg-age-sub">Pop your number! Some of my games are made for different ages.</p>}

        <div className="mg-age-balloons">
          {AGES.map((a, i) => {
            const chosen = picked === a;
            const gone = picked !== null && !chosen;
            return (
              <motion.button
                key={a}
                className={`mg-age-balloon ${chosen ? 'mg-age-chosen' : ''}`}
                style={{ '--h': HUES[i % HUES.length] } as React.CSSProperties}
                onClick={() => pick(a)}
                disabled={picked !== null}
                aria-label={`I am ${a}`}
                animate={
                  chosen ? { scale: [1, 1.5, 1.25], y: -6 }
                  : gone ? { scale: 0, opacity: 0 }
                  : m.quiet ? {} : { y: [0, -7, 0] }
                }
                transition={
                  chosen ? { duration: 0.5 }
                  : gone ? { duration: 0.3, delay: (i % 4) * 0.04 }
                  : { repeat: Infinity, duration: 2 + (i % 3) * 0.4, ease: 'easeInOut', delay: i * 0.12 }
                }
                whileHover={picked === null ? { scale: 1.12 } : undefined}
                whileTap={{ scale: 0.9 }}
              >
                {a}
                {chosen && <Confetti />}
              </motion.button>
            );
          })}
        </div>

        {picked === null && (
          <button className="mg-age-skip" onClick={decline}>I’d rather not say</button>
        )}
      </motion.div>
    </motion.div>
  );
}

function Confetti() {
  return (
    <span className="mg-age-confetti" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <motion.i
            key={i}
            style={{ background: `hsl(${HUES[i % HUES.length]} 90% 65%)` }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(a) * 70, y: Math.sin(a) * 70 + 20, opacity: 0, rotate: 200 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        );
      })}
    </span>
  );
}
