import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SCENE_MOODS, roomArt, storageFallback, type RoomConfig } from '../rooms';
import { FONT, Scrim } from './chrome';
import { useMotion, useQuiet } from './quiet';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import { startAmbience, stopAmbience } from '../kit/ambience';
import { boyPlateForRoom, type BoyEmotion, type ChirpyPose } from './sprites';

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

  /**
   * THE ROOM'S OWN SOUND. Every screen in the app renders one of these, so
   * this is the single place that knows which room a child is standing in —
   * which makes it the only sane place to hang the room tone.
   *
   * Silent in the quiet state, like the motes above and Chirpy himself: a
   * distressed child gets a still, silent room, and that rule is enforced
   * here rather than trusted to nine call sites. See kit/ambience for why
   * this is synthesised rather than sampled, and why it is so very quiet.
   */
  useEffect(() => {
    if (quiet) { stopAmbience(); return; }
    startAmbience(room.scene);
    return () => stopAmbience();
  }, [room.scene, quiet]);

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
  // Accepted, not read: every call site still passes a pose, and there is
  // only one boy sprite to show it on. Left in the type so none of them
  // need editing.
  line,
  size = 54,
  align = 'right',
  roomId = null,
}: {
  pose?: ChirpyPose;
  line?: string | null;
  size?: number;
  align?: 'left' | 'right';
  /** Which room this line is being said in — see TheBoy's `roomId`. */
  roomId?: string | null;
}) {
  const quiet = useQuiet();
  const m = useMotion();

  // THE VOICE IS LITERAL NOW, TOO. Under-8s read slowly, and this app is
  // mostly Chirpy's dialogue — a child who can't keep up with the words on
  // screen is locked out of half of it. Speaking is automatic rather than
  // tap-to-hear because the audience this matters most for (pre-readers)
  // is exactly the audience least likely to find and use a small icon.
  //
  // One escape hatch, not two: it honours the same mute toggle as every
  // sound effect in the app (kit/chirpyVoice.ts), so a child who has
  // muted the app gets silence here as well, without a second switch to
  // find. And it never speaks in the quiet state — a calm, unhurried
  // reading voice is still a voice, and a distressed child gets to choose
  // whether anything talks at them right now.
  useEffect(() => {
    if (line) speak(line, quiet);
    return () => stopSpeaking();
  }, [line, quiet]);

  if (quiet || !line) return null;

  // THE BOY STANDS BESIDE HIS OWN LINE NOW, NOT CHIRPY.
  //
  // This is the one figure every room already has: the same character who
  // drifts and bounces through the room once a feeling's been named
  // (ui/FloatingFeeling) is now who's standing here too, next to whatever
  // the room is saying. One character carrying every line, everywhere,
  // rather than two competing for the same job — Chirpy as a small sprite
  // beside the text, and the boy as a second, separate floating figure a
  // few pixels away. A child was never going to read those as one
  // conversation.
  //
  // `pose` stays in the signature even though it does nothing here — every
  // call site still passes it, and there is only one boy sprite to show.
  // Chirpy keeps his own face precisely where he is still HIMSELF as a
  // character with something at stake (HelpChirpy.tsx, where the child is
  // asked to help HIM specifically) — this component was never his only
  // appearance, just his most common one.
  return (
    <div className={`flex items-end gap-2 ${align === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* One boy, one source of truth about how he looks and moves. This used
          to be its own <img> with its own bob, which is how the room plates
          and the gaits would have missed half the app the moment they landed. */}
      <TheBoy
        size={size}
        gaze="child"
        className="shrink-0"
        gait={gaitForRoom(roomId)}
        roomId={roomId}
      />
      <motion.div
        key={line}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.transition}
        className="max-w-[80%] rounded-[20px] px-4 py-2.5 text-[14.5px] font-extrabold leading-snug shadow-xl"
        style={{ background: 'rgba(255,255,255,0.95)', color: '#241D3D', fontFamily: FONT }}
      >
        {line}
      </motion.div>
    </div>
  );
}

/**
 * HOW HE MOVES.
 *
 * He used to do one thing everywhere: rise six pixels and sink back, every
 * five and a half seconds, in all seven rooms and on the hub. That is not a
 * character being alive, it is a sprite on a sine wave, and a child reads the
 * difference immediately — the boy was furniture that happened to bob.
 *
 * So each room gets a gait. The shapes are deliberately not interchangeable:
 * the Castle marches, the Park bounces, the Observatory barely moves at all,
 * and the hub dances, because the hub is the one place he is not waiting for
 * anybody. It is the cheapest possible characterisation and it is most of
 * what "alive" means on screen.
 *
 * EVERY LOOP CLOSES. The first and last frame of each track are identical, so
 * the cycle joins itself instead of snapping back to the start — a jump at
 * the seam is the thing that makes a loop look like a loop.
 *
 * AND NONE OF IT RUNS IN THE QUIET STATE. `m.loop` is undefined when the app
 * has quietened itself or the device asked for less motion, and that is the
 * switch: he stands still. A distressed child does not get a dancing cartoon.
 */
export type BoyGait = 'still' | 'sway' | 'walk' | 'march' | 'bounce' | 'drift' | 'dance';

interface Gait {
  y: number[];
  x: number[];
  rotate: number[];
  seconds: number;
}

const GAITS: Record<BoyGait, Gait> = {
  /** The old behaviour, kept for anywhere that genuinely wants stillness. */
  still:  { y: [0, -6, 0],          x: [0, 0, 0],             rotate: [0, 0, 0],            seconds: 5.5 },
  /** Weight shifting foot to foot. Somebody standing in a garden. */
  sway:   { y: [0, -5, 0, -5, 0],   x: [0, 7, 0, -7, 0],      rotate: [0, 1.6, 0, -1.6, 0], seconds: 6.4 },
  /** Actually crossing the floor and coming back. */
  walk:   { y: [0, -9, 0, -9, 0],   x: [-16, -5, 7, -5, -16], rotate: [0, -2, 0, 2, 0],     seconds: 5.2 },
  /** Knees up. Faster, squarer, pleased with itself. */
  march:  { y: [0, -14, 0, -14, 0], x: [0, 4, 0, -4, 0],      rotate: [0, -3, 0, 3, 0],     seconds: 3.4 },
  /** Two hops and a little one, the way children actually bounce. */
  bounce: { y: [0, -19, 0, -8, 0],  x: [0, 2, 0, -2, 0],      rotate: [0, 4, 0, -4, 0],     seconds: 2.7 },
  /** Barely there. For the room where the whole point is sitting still. */
  drift:  { y: [0, -10, 0],         x: [0, 9, 0],             rotate: [0, 1, 0],            seconds: 9 },
  /** The hub. Shoulders, hips, a shuffle each way. */
  dance:  { y: [0, -15, 0, -15, 0], x: [-11, 0, 11, 0, -11],  rotate: [-5, 0, 5, 0, -5],    seconds: 3.2 },
};

/** Which gait belongs to which virtue room. Keyed by the room ids in
 *  best/rooms.ts — the same ids as the behaviours, which never renumber. */
const ROOM_GAIT: Record<string, BoyGait> = {
  kind: 'sway',
  truth: 'walk',
  choices: 'march',
  include: 'bounce',
  body: 'march',
  help: 'walk',
  mindheart: 'drift',
};

export function gaitForRoom(roomId: string | null | undefined): BoyGait {
  return (roomId && ROOM_GAIT[roomId]) || 'still';
}

export function TheBoy({
  size = 190,
  gaze = 'scene',
  className = '',
  emotion = 'calm',
  gait = 'still',
  roomId = null,
}: {
  size?: number;
  gaze?: 'scene' | 'child';
  className?: string;
  emotion?: BoyEmotion;
  /** How he passes the time here. See GAITS. */
  gait?: BoyGait;
  /**
   * Which room he's standing in, so he can wear that room's own plate if one
   * has been drawn. Null on the hub, which is nobody's room.
   */
  roomId?: string | null;
}) {
  const m = useMotion();
  const plate = boyPlateForRoom(roomId, emotion);
  const step = GAITS[gait];

  return (
    <motion.img
      /* Keyed on the plate so moving between rooms mounts a fresh <img> and
         re-attempts that room's own art. Without it the element persists,
         React never rewrites the src we patched in onError, and the first
         room that falls back would pin the fallback everywhere after it. */
      key={plate.src}
      src={plate.src}
      srcSet={plate.srcset}
      sizes={`${size}px`}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
      /* THE ROOM'S PLATE IS OPTIONAL AND MOSTLY ABSENT — see sprites.ts.
         Asking for art that hasn't been drawn yet must cost the child
         nothing, so a failed load quietly becomes the plate that exists
         rather than a broken-image icon where a boy should be. */
      onError={(e) => {
        const img = e.currentTarget;
        if (img.dataset.fellBack) return;
        img.dataset.fellBack = 'true';
        img.srcset = plate.fallbackSrcset;
        img.src = plate.fallbackSrc;
      }}
      style={{
        height: size,
        width: 'auto',
        filter: 'drop-shadow(0 18px 34px rgba(0,0,0,0.5))',
        /* Turned away = looking at the scene with the child, not at them.
           It lives in `style` as a motion value rather than as a CSS
           `transform` string, and that is load-bearing: framer-motion builds
           its own transform from x/y/rotate, and a plain `transform` here
           would be overwritten by it — which is exactly what was happening,
           so the shared-gaze rule in §2.2 above was silently not applying
           anywhere the boy was also bobbing. Which was everywhere. */
        scaleX: gaze === 'scene' ? -1 : 1,
      }}
      animate={m.loop ? { y: step.y, x: step.x, rotate: step.rotate } : { y: 0, x: 0, rotate: 0 }}
      transition={m.loop ? { ...m.loop, duration: step.seconds } : { duration: 0.3 }}
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

/** The pair, as they appear on the character sheet — Chirpy on the shoulder. */
export function BoyAndChirpy({
  size = 240,
  gaze = 'scene',
  emotion = 'calm',
  gait = 'still',
  roomId = null,
}: {
  size?: number;
  /** How he passes the time. The hub hands him 'dance'. */
  gait?: BoyGait;
  roomId?: string | null;
  /**
   * Accepted, not read. Chirpy lives on the boy's back in the artwork now
   * rather than being a second sprite pinned to his shoulder, so there is
   * nothing left here for a pose to change — but every call site still
   * passes one, and they shouldn't all need editing to say so.
   */
  pose?: ChirpyPose;
  gaze?: 'scene' | 'child';
  emotion?: 'calm' | 'worry' | 'scared' | 'sad';
}) {
  const boyW = size * BOY_ASPECT;

  // Chirpy is now rendered on the boy sprite itself (built in), so no need
  // to render him separately here. The boy is bigger now (default 240 instead of 190).
  return (
    <div className="relative" style={{ height: size, width: boyW }}>
      <TheBoy size={size} gaze={gaze} emotion={emotion} gait={gait} roomId={roomId} />
    </div>
  );
}
