import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import type { Visitor } from '../kit/visitor';

/**
 * The guest, standing about in the hub. See kit/visitor for why this is a
 * person rather than an effect, and why nothing here ever calls it rare.
 *
 * THEY ARE DRAWN, not painted — five simple silhouettes rather than five
 * pieces of art. Partly because a visitor a child sees twice a year doesn't
 * justify commissioning art before we know the idea works, and partly because
 * a slightly rough little drawing suits somebody who wandered in more than a
 * polished sprite would.
 *
 * ONE TAP, ONE LINE, THEN THEY GO. No conversation tree, no follow-up, no
 * second tap that produces more. They came, they said their thing, that's
 * the whole of it — and the child is left with something to tell somebody
 * rather than something to finish.
 *
 * NOT IN THE QUIET STATE. A child who is upset is not up for meeting anybody,
 * and the caller is expected to skip this entirely rather than pass a quieter
 * version of it.
 */
export function TheVisitor({ visitor, onGone }: { visitor: Visitor; onGone: () => void }) {
  const m = useMotion();
  const [spoken, setSpoken] = useState(false);

  const say = () => {
    if (spoken) return;
    setSpoken(true);
    // Long enough to read it twice at six years old, then they wander off.
    window.setTimeout(onGone, m.quiet ? 6000 : 4600);
  };

  return (
    <motion.button
      onClick={say}
      aria-label={spoken ? `${visitor.name}: ${visitor.line}` : `${visitor.name}. Say hello.`}
      /*
        FIXED, not absolute — the same trap DoorHandle documents falling into.
        The hub scrolls, so an absolutely-positioned guest stands at 22vh of
        the DOCUMENT, which on a long page is somewhere far below the fold
        that a child never scrolls to. A visitor nobody ever sees is not rare,
        it's absent. Fixed keeps them in the room.
      */
      className="pointer-events-auto fixed bottom-[24vh] left-3 z-30 flex items-end gap-2 border-0 bg-transparent p-0 sm:left-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.7, delay: 1.1 }}
    >
      <motion.span
        className="block"
        animate={m.quiet ? undefined : { y: [0, -5, 0] }}
        transition={m.quiet ? undefined : { repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
      >
        <VisitorArt visitor={visitor} />
      </motion.span>

      <AnimatePresence>
        {spoken && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="mb-2 max-w-[190px] rounded-[16px] px-3 py-2 text-left text-[12.5px] font-bold leading-snug"
            style={{
              background: '#0B0818',
              border: `1.5px solid ${visitor.hue}`,
              boxShadow: `0 4px 18px rgba(0,0,0,0.7), 0 0 20px -6px ${visitor.hue}`,
              color: CHROME.text,
              fontFamily: FONT,
            }}
          >
            {visitor.line}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * Whoever turned up, at the height they all stand at.
 *
 * Five of them are silhouettes built in SVG; two are real drawings (see
 * kit/visitor's `art`). Both paths render into the same 44x40 footprint and
 * take the same coloured glow, so a visitor is a visitor whichever kind of
 * picture they happen to have — the thing that must not read differently is
 * how much of the screen they take.
 */
function VisitorArt({ visitor }: { visitor: Visitor }) {
  const c = visitor.hue;
  const glow = { filter: `drop-shadow(0 0 8px ${c}88)` };

  if (visitor.art) {
    return (
      <img
        src={`${visitor.art}@160.webp`}
        srcSet={`${visitor.art}@160.webp 160w, ${visitor.art}@320.webp 320w`}
        sizes="40px"
        alt=""
        aria-hidden
        draggable={false}
        /* Height only — these plates are taller than they are wide, and the
           44x40 box the silhouettes fill would squash them. */
        style={{ height: 40, width: 'auto', ...glow }}
      />
    );
  }

  return (
    <svg viewBox="0 0 44 40" width="44" height="40" aria-hidden style={glow}>
      {visitor.shape === 'moth' && (
        <>
          <ellipse cx="22" cy="22" rx="4" ry="8" fill={c} />
          <path d="M20 18 Q 8 8 6 20 Q 8 30 20 26 Z" fill={c} opacity="0.75" />
          <path d="M24 18 Q 36 8 38 20 Q 36 30 24 26 Z" fill={c} opacity="0.75" />
          <path d="M20 15 L17 9 M24 15 L27 9" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}

      {visitor.shape === 'tortoise' && (
        <>
          <path d="M8 30 Q 22 10 36 30 Z" fill={c} />
          <path d="M14 30 Q 22 18 30 30" stroke="#0B0818" strokeWidth="1.1" fill="none" opacity="0.5" />
          <path d="M22 30 L22 21" stroke="#0B0818" strokeWidth="1.1" opacity="0.5" />
          <circle cx="39" cy="27" r="3.4" fill={c} />
          <circle cx="40.4" cy="26" r="0.7" fill="#0B0818" />
          <rect x="11" y="30" width="4" height="4" rx="1.4" fill={c} />
          <rect x="29" y="30" width="4" height="4" rx="1.4" fill={c} />
        </>
      )}

      {visitor.shape === 'fox' && (
        <>
          <path d="M12 34 Q 10 20 22 18 Q 34 20 32 34 Z" fill={c} />
          <path d="M14 20 L12 11 L20 16 Z" fill={c} />
          <path d="M30 20 L32 11 L24 16 Z" fill={c} />
          <circle cx="18" cy="25" r="1.3" fill="#0B0818" />
          <circle cx="26" cy="25" r="1.3" fill="#0B0818" />
          <path d="M32 32 Q 42 30 38 22" stroke={c} strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </>
      )}

      {visitor.shape === 'firefly' && (
        <>
          <ellipse cx="22" cy="24" rx="5" ry="7" fill={c} />
          <circle cx="22" cy="30" r="3.6" fill="#FFF3D0" />
          <path d="M18 20 Q 8 14 10 24" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M26 20 Q 36 14 34 24" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M20 17 L18 11 M24 17 L26 11" stroke={c} strokeWidth="1.1" strokeLinecap="round" />
        </>
      )}

      {visitor.shape === 'beetle' && (
        <>
          <ellipse cx="22" cy="24" rx="10" ry="11" fill={c} />
          <path d="M22 13 L22 35" stroke="#0B0818" strokeWidth="1.2" opacity="0.55" />
          <circle cx="22" cy="12" r="4" fill={c} />
          <path d="M12 20 L6 16 M12 28 L6 31 M32 20 L38 16 M32 28 L38 31" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M20 9 L18 4 M24 9 L26 4" stroke={c} strokeWidth="1.1" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
