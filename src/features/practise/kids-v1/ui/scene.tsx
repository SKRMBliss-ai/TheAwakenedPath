import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SCENE_MOODS, roomArt, storageFallback, type RoomConfig } from '../rooms';
import { FONT, Scrim } from './chrome';
import { useMotion, useQuiet } from './quiet';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import { startAmbience, stopAmbience } from '../kit/ambience';
import { boyPlateForRoom, chirpySprite, chirpySrcSet, type BoyEmotion, type ChirpyPose } from './sprites';
import { DIM, GAITS, ROOM_PROPS, type BoyGait, type RoomProp } from './scenery';

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

/**
 * HOW LONG THE ROOM GETS TO BE THE ROOM BEFORE THE TEXT ARRIVES.
 *
 * Somebody painted these rooms, and until now nobody ever saw one: the dim
 * that holds the artwork back so the questions stay readable was painted on
 * at the same instant as the artwork itself, so a child walked into a room
 * that was already three-quarters dark. The picture was doing no work at all.
 *
 * So the door opens onto the room at full brightness, and the dim arrives
 * three seconds later, slowly. It costs nothing — a child is still reading
 * Chirpy's line at that point — and it is the difference between a place and
 * a background.
 *
 * THE HUB IS NOT AFFECTED and never was: it paints its own sky rather than
 * using RoomScene, and it has no dim of any kind. The painting there is at
 * full brightness the whole time, which is the whole thesis of that screen.
 */
const SETTLE_MS = 3000;

export function RoomScene({
  room,
  dim = DIM.content,
  art,
  objectPosition = 'center',
  fit = 'cover',
}: {
  room: RoomConfig;
  dim?: number;
  /**
   * A different painting for the same room, where one screen wants its own.
   *
   * The Truth Lab and two steps of the DeepDive walk share the `thought`
   * room — same palette, same tone, same storage key — but the walk's two
   * steps want the boy at his desk while the Lab wants the room its sign
   * hangs in. One override beats splitting the room in rooms.ts and having
   * to keep two entries of everything else in step.
   */
  art?: string;
  /**
   * CSS object-position for the room painting. Default 'center'. Pass 'top'
   * for the body room so the hologram boy's face is never cropped on short
   * or landscape screens — the overflow goes to the bottom instead.
   */
  objectPosition?: string;
  /**
   * 'cover' (the default) fills the screen and crops whatever does not fit.
   * 'contain' fits the whole painting on screen instead, and is there for the
   * one room where the painting is also the control.
   *
   * The Body Detective asks the child to point at a place on a painted boy.
   * Under cover that boy was cropped differently on every screen: a phone in
   * portrait threw his right hand past the right edge, and a laptop in
   * landscape cut his legs off below the fold. The tap targets went with
   * them — they are measured against the painting, so they were correct and
   * off-screen at the same time, which reads exactly like a broken control.
   *
   * Contain cannot crop, so every zone is always reachable. The letterbox it
   * would otherwise leave is filled by a blurred, scaled copy of the same
   * painting underneath, so the room still runs to the edges of the screen.
   */
  fit?: 'cover' | 'contain';
}) {
  const mood = SCENE_MOODS[room.scene];
  const quiet = useQuiet();

  /* Starts undimmed and settles. Keyed off the mount, so walking into a room
     restarts it and changing the dim mid-stay (the games dim further) does
     not — the arrival is the thing being protected, not every later change. */
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(t);
  }, []);

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

      {/* The bed under a contained painting, so 'fits on screen' does not
          also mean 'two black bars'. Same image, blurred past legibility and
          scaled out, which is the trick the feelings film already uses. */}
      {room.painted && fit === 'contain' && (
        <img
          aria-hidden
          src={art ?? roomArt(room.id)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'blur(34px) saturate(1.15) brightness(0.55)', transform: 'scale(1.18)' }}
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}

      {room.painted && (
        <img
          key={art ?? room.id}
          src={art ?? roomArt(room.id)}
          alt=""
          className={`absolute inset-0 h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
          style={{ objectPosition }}
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

      {/* The room's own furniture, where somebody drew it any. Above the
          painting so it reads as objects IN the room, below the dim and the
          scrim so it recedes with everything else. See ROOM_PROPS. */}
      <Props roomId={room.id} />

      {/* The dim, arriving late and slowly — see SETTLE_MS. Animated rather
          than transitioned so framer-motion owns the timing, and rendered
          even at zero so there is one element fading rather than one
          appearing. */}
      {dim > 0 && (
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgb(4,6,14)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: settled ? dim : 0 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
      )}

      {/*
        `dim={0}` MEANS UNDIMMED, INCLUDING THIS.

        The scrim used to paint whatever the dim was set to, so a room asking
        for no dim at all still got a veil that runs from 58% at the top to
        95% at the foot — which is most of a blackout. The Truth Lab is the
        one caller that asks for zero, it asks because its trail is opaque
        cards that need no help being read, and it was getting the darkest
        room in the building anyway. A prop that says none should mean none.
      */}
      {dim > 0 && <Scrim room={room} on={settled} />}
    </div>
  );
}

/**
 * The objects lying about in a room, drifting.
 *
 * One <img> each, absolutely placed against the room, on a slow vertical
 * float — no two share a duration or a delay, because four things rising and
 * falling in step reads as one thing on a lift rather than as a room with
 * stuff in it.
 *
 * Renders nothing at all for the rooms nobody drew props for, which is most of
 * them, and nothing in the quiet state.
 */
function Props({ roomId }: { roomId: string }) {
  const quiet = useQuiet();
  const props = ROOM_PROPS[roomId];
  if (quiet || !props) return null;
  // NOT ON A PHONE. These hug the walls, and a 430px screen has no walls: the
  // content column already runs from 74px to 356px of it, so a compass pinned
  // 3% from the edge lands under the question rather than beside it. There is
  // no size that fixes that — the room is simply too narrow to have anything
  // standing in the corners of it.
  return (
    <div className="absolute inset-0 hidden sm:block">
      {props.map((p) => <Prop key={p.src} prop={p} />)}
    </div>
  );
}

function Prop({ prop }: { prop: RoomProp }) {
  return (
    <motion.img
      src={prop.src}
      alt=""
      aria-hidden
      loading="lazy"
      draggable={false}
      className="absolute"
      style={{
        left: prop.left,
        right: prop.right,
        top: prop.top,
        height: prop.size,
        width: 'auto',
        opacity: prop.opacity,
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
      }}
      animate={{ y: [0, -prop.rise, 0] }}
      transition={{ repeat: Infinity, duration: prop.seconds, delay: prop.delay, ease: 'easeInOut' }}
      /* A prop that 404s must leave no gap and no broken-image icon — it is
         decoration, and the room is complete without it. */
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
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
  pose = 'curious',
  line,
  size = 74,
  align = 'right',
}: {
  pose?: ChirpyPose;
  line?: string | null;
  size?: number;
  align?: 'left' | 'right';
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

  /*
    CHIRPY IS CHIRPY AGAIN.

    For a while this component drew the BOY beside the line instead, on the
    reasoning that one character carrying every line beats two competing for
    the job. The reasoning was sound; the reason it was needed was not. There
    was one flat, squashed, low-resolution bird sprite, so putting him next to
    every sentence in the app looked cheap — and the fix chosen was to stop
    drawing him rather than to draw him better.

    There are ten proper plates of him now, one per expression, and every one
    of these call sites has been passing the right expression the whole time:
    `curious` in the game shell, `worried` when the check-in asks how big it
    is, `said2` when he bets he knows what the thought said. All of it was
    being thrown away — `pose` was in the signature with a comment explaining
    that nothing read it.

    So he is back, he is the one who talks, and the division is clean: the boy
    is the child's own figure (the hub, and ui/FloatingFeeling's companion),
    and Chirpy is the voice. Two characters, two jobs, neither doing the
    other's.
  */
  return (
    <div className={`flex items-end gap-2 ${align === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
      <motion.img
        /* Keyed on the pose so a change of expression mounts a fresh <img>
           and re-runs the entrance rather than cross-fading in place, which
           at this size reads as the drawing glitching. */
        key={pose}
        src={chirpySprite(pose)}
        srcSet={chirpySrcSet(pose)}
        sizes={`${size}px`}
        alt=""
        aria-hidden
        draggable={false}
        className="shrink-0 select-none"
        /* Height only, width auto — these plates are taller than they are
           wide, and an h-N w-N pair squashes him flat. That squashing is most
           of what made the old sprite look cheap. */
        style={{ height: size, width: 'auto', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.5))' }}
        initial={{ opacity: 0, scale: 0.82, y: 6 }}
        animate={m.loop
          ? { opacity: 1, scale: 1, y: [0, -5, 0], rotate: [0, -2.5, 0] }
          : { opacity: 1, scale: 1, y: 0, rotate: 0 }}
        transition={m.loop
          ? {
              opacity: { duration: 0.3 },
              scale: { type: 'spring', stiffness: 300, damping: 18 },
              y: { ...m.loop, duration: 3.4 },
              rotate: { ...m.loop, duration: 3.4 },
            }
          : { duration: 0.3 }}
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
      /* Omitted rather than empty when a plate ships in one size only — an
         `srcset=""` is a candidate list with nothing in it, which browsers
         handle but no spec obliges them to handle the same way. */
      srcSet={plate.srcset || undefined}
      sizes={plate.srcset ? `${size}px` : undefined}
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
        img.srcset = plate.fallbackSrcset ?? '';
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
const BOY_ASPECT = 320 / 480;

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
  emotion?: BoyEmotion;
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
