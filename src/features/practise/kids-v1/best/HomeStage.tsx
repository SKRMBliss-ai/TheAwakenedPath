import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { roomPoster, storageFallback, type RoomId } from '../rooms';

/**
 * THE HUB, AS A PLACE YOU ARE STANDING IN.
 *
 * The pieces of the home screen that make it read as the inside of the gym
 * rather than as a page about the gym: the sign over the door, the hello that
 * arrives as speech, the two lit ways out, and the rooms drawn as lit domes on
 * a shelf instead of as poster tiles in a grid.
 *
 * They live together here because they are one drawing split across four
 * components — the same rounded arch, the same warm rim light, the same
 * two-line label — and keeping them in one file is what stops the arch on the
 * room domes drifting away from the arch on the pills.
 *
 * Everything animated asks `useMotion` first. In the quiet state nothing here
 * pulses, breathes or glows brighter on approach; see ui/quiet for why that is
 * not negotiable.
 */

/* ── The sign ────────────────────────────────────────────────────────── */

/**
 * The gym's own name, top-left, the way a building has a sign rather than a
 * page having a title. Small on purpose: a child who is already inside does
 * not need to be told where they are, so this is for the adult glancing over
 * their shoulder and for the child who likes that their place has a name.
 */
export function MindGymMark() {
  return (
    <span
      className="pointer-events-none relative select-none leading-[0.92]"
      style={{ fontFamily: FONT }}
      aria-label="Mind Gym"
    >
      {/* The star sits ON the word rather than after it, the way it does on
          the sign — drawn rather than typed, because the ★ glyph renders at
          wildly different weights across platforms and came out looking like
          an asterisk on the one that matters. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="absolute -top-1.5 right-[-9px] h-[13px] w-[13px] sm:h-[15px] sm:w-[15px]"
        style={{ filter: 'drop-shadow(0 0 7px rgba(255,196,110,0.95))' }}
      >
        <path
          d="M12 1.6l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 16.8l-6.1 3.4 1.4-6.8L2.2 8.7l6.9-.8L12 1.6Z"
          fill="#FFD98A"
        />
      </svg>
      <span className="block text-[19px] font-extrabold tracking-tight text-white sm:text-[22px]">
        Mind
      </span>
      <span
        className="block text-[19px] font-extrabold tracking-tight sm:text-[22px]"
        style={{ color: '#FFC65C', textShadow: '0 0 14px rgba(255,180,80,0.55)' }}
      >
        Gym
      </span>
    </span>
  );
}

/* ── The hello ───────────────────────────────────────────────────────── */

/** The face circle in the greeting bubble, in px. */
const AVATAR = 62;

/**
 * Where the boy's head is in his own plate, measured off the art rather than
 * guessed: the shipped plate is 320x480, and the head runs y 20-110, x 94-215.
 * Everything below is derived from these six numbers, so re-drawing the boy
 * means re-measuring him here and nothing else moves.
 */
const PLATE = { w: 320, h: 480, headTop: 20, headBottom: 110, headLeft: 94, headRight: 215 };

/** How much of the circle the head should fill. Below ~0.6 he reads as a
 *  figure standing in a hole; above ~0.8 the crop cuts his cap off. */
const HEAD_FILL = 0.7;

const AVATAR_FACE = (() => {
  const headH = PLATE.headBottom - PLATE.headTop;
  /** Scale the whole plate so the head alone fills HEAD_FILL of the circle. */
  const height = (AVATAR * HEAD_FILL) / (headH / PLATE.h);
  const width = height * (PLATE.w / PLATE.h);
  const faceX = ((PLATE.headLeft + PLATE.headRight) / 2 / PLATE.w) * width;
  const faceY = ((PLATE.headTop + PLATE.headBottom) / 2 / PLATE.h) * height;
  /** Offset the oversized plate so the face lands on the circle's middle. */
  return { height, width, left: AVATAR / 2 - faceX, top: AVATAR / 2 - faceY };
})();

/**
 * The greeting, said rather than printed.
 *
 * It is a speech bubble with the child's own face in it, and it asks the one
 * question this app exists to ask. Light on a dark room because speech should
 * read as the brightest thing on screen — everything else here is scenery.
 *
 * Tappable, and it goes where the question goes. A greeting that asks "how are
 * you feeling?" and then does nothing when a child answers by tapping it is a
 * greeting that has taught them the app isn't listening.
 */
export function GreetingBubble({
  name,
  avatar,
  avatarSrcSet,
  onClick,
}: {
  name: string;
  avatar: string;
  avatarSrcSet?: string;
  onClick: () => void;
}) {
  const m = useMotion();

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      initial={m.quiet ? false : { opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative flex w-full max-w-[26rem] items-center gap-3.5 rounded-[28px] px-3 py-3 text-left sm:gap-4 sm:px-4"
      style={{
        minHeight: m.target + 24,
        fontFamily: FONT,
        background: 'linear-gradient(150deg, #F4F8FF 0%, #E8EEFF 62%, #EAE6FF 100%)',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 18px 44px -14px rgba(10,6,32,0.8), 0 0 34px -10px rgba(150,170,255,0.55)',
      }}
    >
      {/* The tail, bottom-right, pointing down at the boy standing under it.
          Drawn as a rotated square sharing the bubble's own gradient so the
          two never disagree about the colour at the join. */}
      <span
        aria-hidden
        className="absolute -bottom-2 right-10 h-6 w-6 rotate-45 rounded-[6px]"
        style={{ background: '#EAE7FF' }}
      />

      <span
        className="relative block shrink-0 overflow-hidden rounded-full"
        style={{
          width: AVATAR,
          height: AVATAR,
          background: 'radial-gradient(circle at 50% 34%, #8FC4FF 0%, #4E8EE8 100%)',
          border: '2px solid rgba(255,255,255,0.92)',
        }}
      >
        {/* CROPPED TO THE FACE, BY MEASUREMENT.
            The plate is a full-length standing boy, so a circle that just
            centres him is a picture of a t-shirt. He is therefore drawn
            oversized and positioned by hand until his head sits in the middle.

            Absolutely positioned rather than centred-and-nudged: an oversized
            child in a centring container overflows in both directions at once,
            which makes "move it down by N" mean two different things depending
            on how the container resolves the overflow, and tuning it by eye
            lands on a number that only works at one size. Left/top against a
            known box has one meaning. See AVATAR_FACE for where the numbers
            come from. */}
        <img
          src={avatar}
          srcSet={avatarSrcSet}
          sizes={`${Math.round(AVATAR_FACE.height)}px`}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute max-w-none"
          style={AVATAR_FACE}
        />
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block text-[19px] font-extrabold leading-tight sm:text-[21px]" style={{ color: '#1B37C7' }}>
          {name ? `Hello, ${name}!` : 'Hello, Explorer!'}
        </span>
        <span className="mt-0.5 block text-[13.5px] font-semibold leading-snug sm:text-[14.5px]" style={{ color: '#2B41A8' }}>
          How are you feeling today?
          <br />
          Let’s step into your mind!
        </span>
      </span>
    </motion.button>
  );
}

/* ── The two ways on ─────────────────────────────────────────────────── */

export type PillTone = 'gold' | 'blue';

const PILL = {
  gold: { src: '/assets/home/my-journey.webp', label: 'My Journey' },
  blue: { src: '/assets/home/explore-rooms.webp', label: 'Explore Rooms' },
} as const;

/**
 * One of the two lit ways on from the hub.
 *
 * The pill is a single piece of painted artwork — glass body, neon rim, face
 * and lettering all in the one image — rather than a stack of CSS gradients
 * approximating it. Both tones came off the same brush, so they sit together
 * the way the CSS versions never quite did.
 *
 * Sized by HEIGHT, with width following the art. The two pills trim to
 * slightly different aspect ratios (their glows bleed different amounts), and
 * matching them on width would stand them side by side at visibly different
 * heights — which reads as one button being more important than the other.
 * Fixing the height instead costs a few pixels of width and keeps them equal,
 * which is the whole point of having two.
 *
 * The label lives in `alt` rather than in a `<span>`: it is already painted
 * into the image, and a second copy underneath would be read out twice by a
 * screen reader and drawn twice on a device that fails to load the art.
 */
export function NeonDoorPill({
  tone,
  onClick,
}: {
  tone: PillTone;
  onClick: () => void;
}) {
  const m = useMotion();
  const pill = PILL[tone];

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={m.quiet ? undefined : { scale: 1.03 }}
      animate={m.quiet ? undefined : { opacity: [1, 0.92, 1] }}
      transition={m.quiet ? undefined : { repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
      className="relative shrink-0"
      style={{ height: m.target + 14 }}
    >
      <img
        src={pill.src}
        alt={pill.label}
        draggable={false}
        className="block h-full w-auto"
      />
    </motion.button>
  );
}

/* ── The rooms, as lit domes ─────────────────────────────────────────── */

/**
 * A room on the shelf.
 *
 * The poster art is unchanged — it is the same painting the room itself opens
 * into, and a child recognises a room by its picture long before they read its
 * name. What changed is the frame: an arch with a warm rim rather than a
 * rectangle, and the name on a plaque hung under it rather than printed over
 * the bottom of the painting.
 *
 * The plaque matters more than it looks. Room names used to sit on a gradient
 * laid over the art, which meant every name was read against a different
 * picture and the bright ones were the hardest. A plaque is the same dark
 * every time, so the names are legible in a row and the paintings get to stay
 * paintings.
 */
export function RoomDome({
  name,
  roomId,
  accent,
  index,
  note,
  doneToday = false,
  dashed = false,
  onClick,
}: {
  name: string;
  /** The room whose painted poster fills the arch. */
  roomId: RoomId;
  accent: string;
  index: number;
  /** The one line under the name — points earned, or what the room asks. */
  note: string;
  doneToday?: boolean;
  /** The Pause Room sits with the others and is visibly not one of them. */
  dashed?: boolean;
  onClick: () => void;
}) {
  const m = useMotion();

  return (
    <motion.button
      onClick={onClick}
      initial={m.quiet ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: m.quiet ? 0 : Math.min(index * 0.05, 0.45), duration: 0.42 }}
      whileHover={m.quiet ? undefined : { y: -7, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`${name}${doneToday ? ', ticked today' : ''}`}
      className="group relative flex flex-col items-stretch"
      style={{ fontFamily: FONT }}
    >
      {/* THE DOME. A tall arch — square-ish body, fully rounded top — so a
          row of these reads as alcoves in a wall rather than as cards. */}
      <span
        className="relative block overflow-hidden"
        style={{
          aspectRatio: '3 / 4',
          borderRadius: '50% 50% 20px 20px / 34% 34% 20px 20px',
          border: dashed ? '1.5px dashed rgba(255,255,255,0.42)' : `1.5px solid ${accent}`,
          boxShadow: doneToday
            ? `0 0 28px -4px ${accent}, 0 14px 34px -12px rgba(0,0,0,0.85)`
            : `0 0 20px -6px ${accent}, 0 12px 28px -12px rgba(0,0,0,0.8)`,
        }}
      >
        <img
          src={roomPoster(roomId)}
          alt=""
          loading="lazy"
          draggable={false}
          className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) { img.style.visibility = 'hidden'; return; }
            img.dataset.fallback = 'true';
            img.src = storageFallback(`kids-rooms/full/${roomId}_full.webp`);
          }}
        />

        {/* The warm light inside the glass — §2.3, and the thing that makes a
            dome read as lit from within rather than as a cut-out shape. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(70% 44% at 50% 16%, ${accent}44 0%, transparent 72%)` }}
        />

        {doneToday && (
          <span
            className="absolute right-2 top-6 grid h-7 w-7 place-items-center rounded-full"
            style={{ background: accent, boxShadow: `0 0 16px -2px ${accent}` }}
          >
            <Check size={15} strokeWidth={3.5} color="#0E1A1C" />
          </span>
        )}
      </span>

      {/* THE PLAQUE, hung across the foot of the arch and overlapping it, the
          way a sign is fixed to the front of an alcove rather than floating
          under one. */}
      {/* A fixed height, not an intrinsic one. "Kindness Garden" wraps to two
          lines and "Truth Lab" doesn't, and a plaque that shrink-wraps its own
          name puts the signs in a row at three different heights — which reads
          as a wonky shelf rather than as a set of rooms. */}
      <span
        className="relative z-10 -mt-4 mx-1 flex min-h-[54px] flex-col justify-center rounded-[14px] px-2 py-1.5 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(18,14,42,0.96) 0%, rgba(10,8,26,0.98) 100%)',
          border: `1.5px solid ${accent}`,
          boxShadow: `0 0 18px -6px ${accent}, 0 8px 18px -8px rgba(0,0,0,0.9)`,
        }}
      >
        <span className="block text-[12.5px] font-extrabold leading-tight sm:text-[13.5px]" style={{ color: CHROME.text }}>
          {name}
        </span>
        <span className="mt-0.5 block text-[10.5px] font-bold leading-tight" style={{ color: accent }}>
          {note}
        </span>
      </span>
    </motion.button>
  );
}
