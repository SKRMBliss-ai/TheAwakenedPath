import { motion } from 'framer-motion';
import { SCENE_MOODS, roomArt, storageFallback, type RoomConfig } from '../rooms';
import { FONT, Scrim } from './chrome';
import { useMotion, useQuiet } from './quiet';
import { BOY_SRC, BOY_SRCSET, chirpySprite, type ChirpyPose } from './sprites';

/**
 * The place: a full-bleed scene, and the two characters who live in it.
 *
 * "Build a place a child would tell the truth in" is the whole design thesis
 * (UI design §1) — dark, warm, contained, unhurried, private. Two rules from
 * that document are enforced here rather than left to each screen:
 *
 *   §2.3  Every dark scene must contain a visible WARM light source. A dark
 *         scene with only cool light reads as threat. That's the difference
 *         between a den and a basement, and it's why `glow` in SCENE_MOODS
 *         is always a warm hue and is painted here unconditionally, on top
 *         of painted art as well as gradients.
 *
 *   §2.2  During any screen where the child reports their own inner state,
 *         the character looks OUT AT THE SCENE, not out of the screen —
 *         shared gaze, not direct gaze. Children talk more easily side by
 *         side than face to face. `gaze="scene"` is the default for exactly
 *         that reason; `gaze="child"` is opt-in, for invitations only.
 */

/* ── The scene ──────────────────────────────────────────────────────── */

export function RoomScene({ room, dim = 0 }: { room: RoomConfig; dim?: number }) {
  const mood = SCENE_MOODS[room.scene];
  const quiet = useQuiet();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ground. Under painted art too — it shows through the edges on a
          wide screen where the art can't reach, and it stops the page
          flashing white before the image decodes. */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(165deg, ${mood.ground[0]} 0%, ${mood.ground[1]} 100%)` }}
      />

      {room.painted && (
        <img
          src={roomArt(room.id)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) { img.style.display = 'none'; return; }
            img.dataset.fallback = 'true';
            img.src = storageFallback(`kids-rooms/${room.id}.webp`);
          }}
        />
      )}

      {/* The warm light source. Non-negotiable — see §2.3 above. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(58% 46% at ${mood.glowAt[0]} ${mood.glowAt[1]}, ${mood.glow} 0%, transparent 72%)`,
        }}
      />

      {!quiet && <Motes />}

      {dim > 0 && (
        <div className="absolute inset-0" style={{ background: `rgba(4,6,14,${dim})` }} />
      )}

      <Scrim room={room} />
    </div>
  );
}

const MOTES = [
  { left: '11%', size: 5, depth: 0.2, delay: 0, duration: 11 },
  { left: '27%', size: 9, depth: 0.6, delay: 1.4, duration: 8 },
  { left: '44%', size: 4, depth: 0.15, delay: 2.9, duration: 12 },
  { left: '59%', size: 10, depth: 0.8, delay: 0.7, duration: 6.5 },
  { left: '73%', size: 6, depth: 0.4, delay: 3.4, duration: 9.5 },
  { left: '86%', size: 8, depth: 0.55, delay: 2, duration: 8.5 },
  { left: '19%', size: 7, depth: 0.5, delay: 4.4, duration: 9 },
  { left: '65%', size: 5, depth: 0.25, delay: 3.1, duration: 11.5 },
];

/** Slow depth-layered light motes, so the painting has weather. Never in the
 *  quiet state — motion is the first thing to go (§7). */
function Motes() {
  return (
    <div className="absolute inset-0">
      {MOTES.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: m.left,
            width: m.size,
            height: m.size,
            background: 'radial-gradient(circle, rgba(255,232,190,0.9) 0%, rgba(255,206,140,0) 70%)',
            filter: `blur(${(1 - m.depth) * 2.2}px)`,
          }}
          initial={{ top: '104%', opacity: 0 }}
          animate={{ top: '-8%', opacity: [0, 0.25 + m.depth * 0.5, 0] }}
          transition={{ repeat: Infinity, duration: m.duration, delay: m.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

/* ── Chirpy ─────────────────────────────────────────────────────────── */

/**
 * Chirpy, with a line.
 *
 * He is a COMPANION, not a teacher (§2.7): he wonders, guesses, gets it
 * wrong, and is never corrected. Characters who know things create
 * performance pressure; characters who are also working it out create
 * company — and a trapdoor only works if the child doesn't feel tested.
 *
 * Renders nothing at all in the quiet state. Callers don't need to check:
 * his absence when a child is distressed is a rule, not a preference, so it
 * is enforced in one place instead of at nine call sites.
 */
export function Chirpy({
  line,
  align = 'right',
}: {
  /** Kept in the signature so the 17 call sites need no edit. */
  pose?: ChirpyPose;
  line?: string | null;
  size?: number;
  align?: 'left' | 'right';
}) {
  const quiet = useQuiet();
  const m = useMotion();
  if (quiet || !line) return null;

  // THE SPRITE IS GONE, THE VOICE IS NOT.
  //
  // Chirpy used to stand next to every line he said, on every screen. Now
  // that the child's own feeling turns up in the room — and has Chirpy in
  // its arms — there were two of him on screen at once, one of them a
  // 92px cutout sitting on top of the painting.
  //
  // So the rooms keep what he says and lose the second copy of him. The
  // bubble is still unmistakably his: same voice, same warmth, same place
  // on the screen. He is in the room, just not standing in front of it.
  //
  // (He still appears in person where being present IS the point: walking
  // and talking through the reveal in DeepDive, and alone in the Pause
  // Room, where he is the entire screen.)
  return (
    <div className={`flex ${align === 'left' ? 'justify-start' : 'justify-end'}`}>
      <motion.div
        key={line}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.transition}
        className="max-w-[88%] rounded-[20px] px-4 py-2.5 text-[14.5px] font-extrabold leading-snug shadow-xl"
        style={{ background: 'rgba(255,255,255,0.95)', color: '#241D3D', fontFamily: FONT }}
      >
        {line}
      </motion.div>
    </div>
  );
}

export function TheBoy({
  size = 190,
  gaze = 'scene',
  className = '',
}: {
  size?: number;
  gaze?: 'scene' | 'child';
  className?: string;
}) {
  const m = useMotion();
  return (
    <motion.img
      src={BOY_SRC}
      srcSet={BOY_SRCSET}
      sizes={`${size}px`}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
      style={{
        height: size,
        width: 'auto',
        filter: 'drop-shadow(0 18px 34px rgba(0,0,0,0.5))',
        // Turned away = looking at the scene with the child, not at them.
        transform: gaze === 'scene' ? 'scaleX(-1)' : 'none',
      }}
      animate={{ y: [0, -6, 0] }}
      transition={m.loop ? { ...m.loop, duration: 5.5 } : undefined}
    />
  );
}

/**
 * The intrinsic aspect of the shipped art, so a wrapper can be sized from a
 * height alone. Chirpy is positioned against that wrapper — without a real
 * width, `left`/`right` resolve against a zero-width box and he lands over
 * the boy's face.
 */
const BOY_ASPECT = 320 / 558;
const CHIRPY_ASPECT = 240 / 288;

/** The pair, as they appear on the character sheet — Chirpy on the shoulder. */
export function BoyAndChirpy({
  size = 190,
  pose = 'curious',
  gaze = 'scene',
}: {
  size?: number;
  pose?: ChirpyPose;
  gaze?: 'scene' | 'child';
}) {
  const quiet = useQuiet();
  const boyW = size * BOY_ASPECT;
  const chirpyH = size * 0.34;
  const chirpyW = chirpyH * CHIRPY_ASPECT;

  // He perches on the shoulder the raised arm ISN'T on. The art waves with
  // its right hand, and `gaze="scene"` mirrors the whole figure — so the
  // free shoulder swaps sides with the gaze.
  const shoulder = gaze === 'scene' ? { right: -chirpyW * 0.42 } : { left: -chirpyW * 0.42 };

  return (
    <div className="relative" style={{ height: size, width: boyW }}>
      <TheBoy size={size} gaze={gaze} />
      {!quiet && (
        <img
          src={chirpySprite(pose)}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute"
          style={{
            height: chirpyH,
            width: chirpyW,
            top: size * 0.13,
            ...shoulder,
            filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.5))',
          }}
        />
      )}
    </div>
  );
}
