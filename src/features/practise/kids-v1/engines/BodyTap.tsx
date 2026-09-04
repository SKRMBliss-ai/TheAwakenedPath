import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from '../rooms';
import type { BodyGame, BodyZone } from '../games/types';
import { CHROME, Pill, Question } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import * as sound from '../kit/sound';

/**
 * E2 · Body tap — a body with tappable regions and generous targets. 4 games.
 *
 * Regions are invisible until touched and keep a soft warm glow once chosen
 * (UI design §8.2). Nothing is ever the "right" region: TEACHING_MOVES §12's
 * caveat, in child words, is the whole rule here —
 *
 *   "There's no right place. My cross lives in my jaw. Someone else's lives
 *    in their hands. Yours lives wherever yours lives."
 *
 * — so no zone is scored, no zone is suggested, and "I can't tell" renders as
 * a FULL-WIDTH option, the same size and weight as everything else. That last
 * bit is in the acceptance checklist for a reason: making it smaller, or a
 * link, tells a child it's the lesser answer, and then they stop using it.
 */

interface ZoneDef {
  id: BodyZone;
  label: string;
  /** Ellipse on a 0–100 × 0–100 viewBox. */
  cx: number; cy: number; rx: number; ry: number;
}

/**
 * A single neutral figure. Deliberately not gendered, not aged and not
 * detailed — a child maps their own body onto it, and detail invites them to
 * decide it isn't them.
 */
const ZONES: ZoneDef[] = [
  { id: 'head',   label: 'Head',   cx: 50, cy: 11, rx: 9,    ry: 10 },
  { id: 'face',   label: 'Face',   cx: 50, cy: 14, rx: 6,    ry: 5.5 },
  { id: 'throat', label: 'Throat', cx: 50, cy: 22, rx: 5,    ry: 3.5 },
  { id: 'chest',  label: 'Chest',  cx: 50, cy: 34, rx: 13,   ry: 8 },
  { id: 'tummy',  label: 'Tummy',  cx: 50, cy: 50, rx: 12,   ry: 8 },
  { id: 'arms',   label: 'Arms',   cx: 31, cy: 43, rx: 5.5,  ry: 14 },
  { id: 'hands',  label: 'Hands',  cx: 29, cy: 60, rx: 5.5,  ry: 5.5 },
  { id: 'legs',   label: 'Legs',   cx: 50, cy: 75, rx: 11,   ry: 16 },
  { id: 'feet',   label: 'Feet',   cx: 50, cy: 93, rx: 13,   ry: 4 },
];

/** Mirrored partners, so tapping one arm lights both. Bodies are symmetrical;
 *  a child pointing at "my hands" means both of them. */
const MIRROR: Partial<Record<BodyZone, { cx: number }>> = {
  arms: { cx: 69 },
  hands: { cx: 71 },
};

export function BodyTapEngine({
  game,
  room,
  onDone,
}: {
  game: BodyGame;
  room: RoomConfig;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<BodyZone[]>([]);
  const [affirming, setAffirming] = useState<string | null>(null);
  const m = useMotion();
  const quiet = useQuiet();
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const round = game.rounds[i];
  const need = round.need ?? 1;

  const advance = () => {
    setChosen([]);
    setAffirming(null);
    if (i + 1 < game.rounds.length) setI(i + 1);
    else onDone();
  };

  const finish = () => {
    if (round.affirm) {
      setAffirming(round.affirm);
      timers.current.push(window.setTimeout(advance, quiet ? 2600 : 1900));
    } else {
      timers.current.push(window.setTimeout(advance, m.advanceMs));
    }
  };

  const tapZone = (z: BodyZone) => {
    if (affirming) return;
    sound.play('tapHit');
    const next = chosen.includes(z) ? chosen.filter((x) => x !== z) : [...chosen, z];
    setChosen(next);
    if (next.length >= need) timers.current.push(window.setTimeout(finish, 380));
  };

  const cantTell = () => {
    if (affirming) return;
    sound.play('tap');
    finish();
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={m.transition}>
          <Question room={room}>{round.prompt}</Question>
        </motion.div>
      </AnimatePresence>

      {/* A panel behind the figure. Several rooms' paintings already contain
          a body — the detective's hologram, the volcano — and a translucent
          silhouette drawn straight onto those disappears into them. The
          figure has to read as a thing the child taps, not as part of the
          scenery, so it gets its own surface to stand on. */}
      <div
        className="mx-auto w-full max-w-[300px] rounded-[28px] px-4 py-3 backdrop-blur-md"
        style={{ background: `${room.palette.scrim}B8`, border: `1px solid ${CHROME.pillBorder}` }}
      >
        <svg viewBox="0 0 100 100" className="w-full" style={{ overflow: 'visible' }} role="group" aria-label="Body">
          {/* The figure. One flat silhouette — the zones sit on top of it and
              are what actually respond, so the outline never needs to be
              anatomically precise to be tappable. */}
          <g fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.52)" strokeWidth="0.7" strokeLinejoin="round">
            {/* head, neck */}
            <ellipse cx="50" cy="11" rx="8.5" ry="9.5" />
            <rect x="46.5" y="18" width="7" height="7" rx="3" />
            {/* torso */}
            <path d="M50 24 C60 24 63.5 28 64 34 L64 52 C64 56.5 62 58.5 59 58.5 L41 58.5 C38 58.5 36 56.5 36 52 L36 34 C36.5 28 40 24 50 24 Z" />
            {/* arms, meeting the torso at the shoulder */}
            <ellipse cx="31" cy="43" rx="5" ry="14" />
            <ellipse cx="69" cy="43" rx="5" ry="14" />
            <circle cx="29" cy="60" r="4.8" />
            <circle cx="71" cy="60" r="4.8" />
            {/* two legs, with a gap — one block reads as a robe */}
            <rect x="40" y="56" width="8.6" height="36" rx="4.3" />
            <rect x="51.4" y="56" width="8.6" height="36" rx="4.3" />
            <ellipse cx="44.3" cy="93" rx="6" ry="3.4" />
            <ellipse cx="55.7" cy="93" rx="6" ry="3.4" />
          </g>

          {ZONES.map((z) => {
            const on = chosen.includes(z.id);
            const partner = MIRROR[z.id];
            return (
              <g key={z.id}>
                <ZoneHit zone={z} on={on} onTap={() => tapZone(z.id)} label={z.label} />
                {partner && <ZoneHit zone={{ ...z, cx: partner.cx }} on={on} onTap={() => tapZone(z.id)} label={z.label} mirrored />}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Full width, same size and weight as every other choice. Never
          smaller, never a link (acceptance checklist, BUILD_BRIEF §7). */}
      {round.cantTell && !affirming && (
        <Pill label={round.cantTell} onClick={cantTell} accent={room.palette.accent} />
      )}

      <AnimatePresence>
        {affirming && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.transition}
            className="text-[15px] font-bold leading-snug"
            style={{ color: CHROME.textSoft }}
          >
            {affirming}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ZoneHit({
  zone,
  on,
  onTap,
  label,
  mirrored,
}: {
  zone: ZoneDef;
  on: boolean;
  onTap: () => void;
  label: string;
  mirrored?: boolean;
}) {
  return (
    <g>
      {/* The glow. Warm, always — a cool highlight on a body reads clinical. */}
      <motion.ellipse
        cx={zone.cx}
        cy={zone.cy}
        rx={zone.rx}
        ry={zone.ry}
        fill="url(#kv1-zone-glow)"
        initial={false}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.85 }}
        style={{ transformOrigin: `${zone.cx}px ${zone.cy}px` }}
        transition={{ duration: 0.35 }}
      />
      {/* The target. Invisible until touched, and padded well past the glow
          so an upset child's inaccurate tap still lands (§2.6). */}
      <ellipse
        cx={zone.cx}
        cy={zone.cy}
        rx={zone.rx + 3}
        ry={zone.ry + 3}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={onTap}
        role={mirrored ? undefined : 'button'}
        aria-label={mirrored ? undefined : label}
        aria-hidden={mirrored || undefined}
      />
      <defs>
        <radialGradient id="kv1-zone-glow">
          <stop offset="0%" stopColor="rgba(255,214,150,0.85)" />
          <stop offset="60%" stopColor="rgba(255,183,94,0.35)" />
          <stop offset="100%" stopColor="rgba(255,183,94,0)" />
        </radialGradient>
      </defs>
    </g>
  );
}
