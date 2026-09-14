import { motion } from 'framer-motion';
import { CHROME } from './chrome';

/**
 * THE LIT CARD, and the trail it sits on.
 *
 * Every room in this app is a dark painted scene with a veil over it, and
 * until now everything a child had to READ sat on that scene in a translucent
 * grey panel. That is the right treatment for a label and the wrong one for a
 * sentence: the panel takes its colour from whatever happens to be painted
 * behind it, so the same card is legible over the floor and nearly gone over
 * a lamp, and a child reading it is doing two jobs at once.
 *
 * So anything that is genuinely CONTENT — the child's own words, the question
 * the room exists to ask, the thing there is to learn — goes on a lit card
 * instead. Warm cream, a coloured edge in the room's own accent, a numbered
 * bead on the shoulder where it belongs to a sequence. It reads as a piece of
 * paper somebody handed you in a dim room, which is exactly the relationship
 * a child should have with these words.
 *
 * THE SCENE IS STILL THE HERO and this does not change that. There are never
 * more than a handful of these on a screen, they are narrow, and the room is
 * at full brightness around them for the first three seconds either way (see
 * SETTLE_MS in ui/scene). What they replace is not the painting; it is the
 * grey rectangles that were sitting on top of the painting.
 *
 * Shared rather than copied because the Truth Lab and the virtue rooms both
 * use it, and two hand-maintained copies of a card style is how an app ends
 * up with two card styles.
 */

/** The numbered bead, sitting on a card's shoulder like a seal. */
export function Bead({ n, tint, inline = false }: { n: number; tint: string; inline?: boolean }) {
  return (
    <span
      className={
        inline
          ? 'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-extrabold'
          : 'absolute -left-3 top-3 grid h-7 w-7 place-items-center rounded-full text-[13px] font-extrabold'
      }
      style={{
        background: `linear-gradient(160deg, ${tint} 0%, ${tint}CC 100%)`,
        color: '#FFFDF8',
        border: '2px solid rgba(255,255,255,0.55)',
        boxShadow: `0 0 14px -2px ${tint}`,
      }}
    >
      {n}
    </span>
  );
}

/**
 * The dashed run between one card and the next.
 *
 * It belongs to the card BELOW rather than the one above, which is the only
 * way a trail built out of conditionally-rendered steps never ends in a line
 * pointing at nothing.
 */
export function Connector({ tint }: { tint: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-3 left-0 flex h-3 w-6 items-center justify-center"
    >
      <span className="block h-full w-0" style={{ borderLeft: `2px dashed ${tint}99` }} />
    </span>
  );
}

/** The cream face every lit card shares. */
export const CARD_FACE = 'linear-gradient(150deg, #FFFBF2 0%, #FFF4E4 100%)';

/** Ink dark enough to read on it. Not CHROME.text — that is for dark panels. */
export const CARD_INK = '#1E2456';

/**
 * One laid card.
 *
 * `n` makes it part of a numbered trail and draws the bead and the run coming
 * into it; without one it is simply a lit card, which is what the virtue
 * rooms want — their content is a few separate things rather than a sequence.
 */
export function LitCard({
  tint,
  label,
  n,
  glow = false,
  aside,
  className = '',
  children,
}: {
  tint: string;
  label?: string;
  n?: number;
  /** A lit edge, for the one card on a screen that is the point of it. */
  glow?: boolean;
  /** Something to stand at the right-hand end — a face, usually. */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`relative ${className}`}
    >
      {n !== undefined && <Connector tint={tint} />}
      <div
        className={`relative rounded-[24px] py-3.5 pr-3 ${n !== undefined ? 'ml-3 pl-8' : 'pl-4'}`}
        style={{
          background: CARD_FACE,
          border: `2px solid ${tint}`,
          boxShadow: glow
            ? `0 0 34px -4px ${tint}, 0 14px 30px -14px rgba(0,0,0,0.8)`
            : `0 0 20px -10px ${tint}, 0 12px 26px -16px rgba(0,0,0,0.75)`,
        }}
      >
        {n !== undefined && <Bead n={n} tint={tint} />}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {label && (
              <p
                className="text-[11px] font-extrabold uppercase tracking-[0.1em]"
                style={{ color: tint }}
              >
                {label}
              </p>
            )}
            <div
              className={`text-[14.5px] font-extrabold leading-snug ${label ? 'mt-0.5' : ''}`}
              style={{ color: CARD_INK }}
            >
              {children}
            </div>
          </div>
          {aside}
        </div>
      </div>
    </motion.div>
  );
}

/** The heading for a step that is a GROUP of cards rather than one. */
export function StepHead({ n, tint, label }: { n: number; tint: string; label: string }) {
  return (
    <div className="relative">
      <Connector tint={tint} />
      <div className="relative ml-3 flex items-center gap-2.5 pl-1">
        <Bead n={n} tint={tint} inline />
        <p className="text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: tint }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/** A quiet line under a card, on the dark rather than on the cream. */
export function UnderNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-1 text-[12.5px] font-bold leading-snug"
      /* Nothing behind this one but the room. Harmless where there is a scrim
         under it; the difference between readable and not in the Truth Lab,
         which runs its painting undimmed. */
      style={{ color: CHROME.textSoft, textShadow: '0 2px 10px rgba(6,3,16,0.95)' }}
    >
      {children}
    </p>
  );
}
