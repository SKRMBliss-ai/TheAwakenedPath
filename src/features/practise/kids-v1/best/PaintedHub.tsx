import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';

/**
 * THE HUB IS THE PAINTING.
 *
 * Every earlier version of this screen did the same wrong thing in a slightly
 * better way: take the founder's painting of the gym, blur it, darken it to a
 * third of its brightness, and draw a worse gym on top of it out of rounded
 * rectangles and photo thumbnails. The art was reference; the interface was a
 * drawing OF the reference. It never looked like the reference, because it was
 * never the reference.
 *
 * So the painting is the interface now, at full brightness, uncropped by any
 * veil. The lit domes on the shelves and the two doors in the walls are
 * already drawn — they are exactly the affordances this screen needs, and they
 * are better drawn than anything CSS was going to manage. What this file adds
 * is the ability to press them.
 *
 * HOW THE HIT TARGETS STAY ON THE ART. The stage is a box locked to the
 * painting's own aspect ratio and sized to COVER the viewport, centred, with
 * the image filling it exactly. Not `object-fit: cover` on a full-bleed image:
 * that crops by an amount nothing in the DOM can read back, so the hotspots
 * would drift off the domes as the window changed shape. With the stage
 * carrying the aspect ratio, a percentage is a percentage of the art forever,
 * and every coordinate below was measured off the painting once.
 *
 * NOTHING IS DRAWN OVER A DOME except a tick, and only on the rooms that have
 * one today. A hotspot shows itself on hover and on focus — a ring the shape
 * of the alcove — and is otherwise invisible, because the painting already
 * says "this is a room you can go into" better than a border would.
 */

/** The painting's own aspect ratio. Everything below is a % of this box. */
export const HUB_ASPECT = 1600 / 893;

/**
 * The painting itself, named once.
 *
 * Two things load it: the <img> in the stage, and the hover lift, which cuts
 * its own slice of the same file out of the same URL so the browser serves it
 * from cache rather than fetching a second copy. If these two ever disagree
 * the lifted dome is a dome from a different render of the room, which is the
 * sort of thing nobody notices until it looks subtly wrong everywhere.
 */
const HUB_ART = '/assets/home/hub-room@1600.webp';

export interface Hotspot {
  id: string;
  /** What a screen reader and a tooltip call it. */
  label: string;
  /** Percentages of the stage, measured off the artwork. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Rounding, so the ring follows the alcove rather than boxing it. */
  radius: string;
  onClick: () => void;
  /** Ticked today — the only thing ever drawn on top of a dome. */
  done?: boolean;
  /** The dome's own light, for the ring. */
  accent: string;
  /**
   * What to say on hover, for the pieces the painting does NOT name itself.
   *
   * Every dome has its title painted on it and every door has a painted sign,
   * so those say nothing extra — a label floating over a label is noise. The
   * door knobs have no lettering anywhere in the art, so they are the only
   * things here that have to introduce themselves.
   */
  hint?: string;
}

/**
 * The eight lit alcoves, the two doors, and the speech bubble — where each one
 * actually sits in the painting.
 *
 * MEASURED, NOT GUESSED, off a percentage grid laid over the art. Re-render
 * the painting and these all move; nothing here is derived from anything else,
 * so each one has to be re-measured rather than nudged.
 */
export const HUB_BOXES = {
  feelings:   { left: 25.4, top: 22.2, width: 11.8, height: 19.2, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  body:       { left: 26.3, top: 39.4, width: 11.4, height: 16.4, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  together:   { left: 26.3, top: 55.8, width: 11.4, height: 16.6, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  thought:    { left: 55.3, top: 17.2, width: 10.4, height: 17.2, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  bigfeelings:{ left: 55.8, top: 38.6, width: 10.4, height: 16.6, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  pause:      { left: 67.3, top: 13.2, width: 12.4, height: 17.0, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  story:      { left: 68.8, top: 31.2, width: 12.4, height: 15.4, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  reflection: { left: 68.8, top: 46.4, width: 13.2, height: 18.4, radius: '46% 46% 14% 14% / 34% 34% 14% 14%' },
  /**
   * THE DOORS — the painted sign and the panel above the handle, and NOT the
   * whole leaf of the door.
   *
   * These used to run the full height of the doorway, 23.6% to 80%, which put
   * the middle of the box at 51.8% — and the brass handle, which is now its
   * own hotspot, is at 50.2% to 61.2%. The most natural place on earth to
   * press a door is the middle of it, and the middle of it was the knob. A
   * child aiming at Explore Rooms would have got Chirpy instead, and would
   * have had no way of telling why.
   *
   * So the door ends where the handle begins. What is left is the piece a
   * child actually reads and aims at anyway — the lit sign with its chevron,
   * and the glowing panel under it — still around 200x230px of target at full
   * size. The foot of each door is scenery now, like the rest of the wall.
   */
  explore:    { left: 1.4,  top: 23.6, width: 12.4, height: 25.6, radius: '10% 10% 6% 6% / 8% 8% 6% 6%' },
  journey:    { left: 86.4, top: 23.6, width: 12.6, height: 25.6, radius: '10% 10% 6% 6% / 8% 8% 6% 6%' },
  /**
   * THE TWO BRASS KNOBS, which are their own fittings and not their doors.
   *
   * Measured off the art the same way as everything else: both doors were
   * drawn with the handle at the same height, so these differ only in `left`.
   *
   * They sit just under the door boxes above with about a percent of clear
   * wall between, so no press is ever ambiguous. A knob is the part of a door
   * a person takes hold of, which is why it is worth being its own way
   * through rather than another few pixels of the same button.
   */
  knobExplore: { left: 4.4,  top: 50.2, width: 7.2, height: 11.0, radius: '44% 44% 44% 44% / 50% 50% 50% 50%' },
  knobJourney: { left: 86.2, top: 50.2, width: 7.2, height: 11.0, radius: '44% 44% 44% 44% / 50% 50% 50% 50%' },
  /** The painted bubble is wiped out of the art; the live one sits here. */
  bubble:     { left: 26.4, top: 5.2,  width: 26.6, height: 14.4 },
} as const;

/**
 * The two doors, and the two knobs on them — PhoneHub sorts one flat list of
 * hotspots into three rows with these. Module-private deliberately: exporting
 * them would cost this file its fast refresh (react-refresh/only-export-components)
 * and nothing outside it needs them.
 */
const DOOR_IDS: string[] = ['explore', 'journey'];
const KNOB_IDS: string[] = ['knobExplore', 'knobJourney'];

/**
 * Every box in HUB_BOXES that is a pressable piece of the painting — i.e. all
 * of them except `bubble`, which is where the live greeting goes and has no
 * `radius` because nothing draws a focus ring on it.
 */
export type HotspotKey = Exclude<keyof typeof HUB_BOXES, 'bubble'>;

/**
 * The stage: the painting, at the size that covers the viewport.
 *
 * `min-width`/`min-height` in viewport units is what does the covering, and it
 * is deliberately arithmetic rather than `object-fit` — see the note at the top
 * on why the crop has to be something the layout knows about.
 */
export function HubStage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: `max(100vw, calc(100svh * ${HUB_ASPECT}))`,
        height: `max(100svh, calc(100vw / ${HUB_ASPECT}))`,
      }}
    >
      <img
        src={HUB_ART}
        srcSet={`/assets/home/hub-room@960.webp 960w, ${HUB_ART} 1600w`}
        sizes="100vw"
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full select-none"
      />
      {children}
    </div>
  );
}

/**
 * One pressable piece of the painting — and, on hover, the piece LIFTING OUT
 * of it.
 *
 * WHAT IS ACTUALLY MOVING. There is no separate sprite for any of these: the
 * domes and the doors exist only as pixels inside one 1600px painting, and
 * nobody drew them a second time on transparent backgrounds. So the lift is
 * the painting itself, quoted. The span below loads the same file as a
 * background, blown up and offset so that the only part of it landing inside
 * the hotspot is that hotspot's own dome, then scales the whole thing up and
 * raises it a few percent. What a child sees is their dome swelling off the
 * shelf with the rest of the room holding still behind it, because the thing
 * on top and the thing underneath are made of exactly the same paint.
 *
 * THE TWO NUMBERS. `backgroundSize` is the stage expressed as a multiple of
 * this box (a dome 11.8% wide needs the art at 1/0.118 of its own width), and
 * `backgroundPosition` is the CSS percentage that slides that oversized image
 * until the dome sits in the frame. The position formula is not `left` — CSS
 * measures background percentages against the difference between the box and
 * the image, which is what `left / (100 - width)` is. Get that wrong and every
 * dome lifts a slightly different bit of the room, which reads as the art
 * glitching rather than as a mistake in arithmetic.
 *
 * `background-origin` and `background-clip` are pinned to the border box on
 * purpose: the ring is a 2px border on this same element, and with the default
 * padding-box origin those 2px shift the slice and the lifted dome no longer
 * lines up with the painted one underneath it.
 *
 * NONE OF IT MOVES IN THE QUIET STATE. The ring still fades in, because that
 * is the only thing telling a child which one they are on; the swelling does
 * not happen at all.
 */
export function HubHotspot({ spot }: { spot: Hotspot }) {
  const m = useMotion();

  /* The slice of the painting that is this hotspot. See the note above. */
  const cutout = {
    backgroundImage: `url(${HUB_ART})`,
    backgroundSize: `${(100 / spot.width) * 100}% ${(100 / spot.height) * 100}%`,
    backgroundPosition:
      `${(spot.left / (100 - spot.width)) * 100}% ` +
      `${(spot.top / (100 - spot.height)) * 100}%`,
    backgroundRepeat: 'no-repeat',
    backgroundOrigin: 'border-box' as const,
    backgroundClip: 'border-box' as const,
  };

  /* Written out in full rather than built from a template, because Tailwind
     reads this file as text and never sees a class name it has to concatenate. */
  const lift = m.quiet
    ? ''
    : 'group-hover:-translate-y-[6%] group-hover:scale-[1.12] ' +
      'group-focus-visible:-translate-y-[6%] group-focus-visible:scale-[1.12]';

  return (
    <motion.button
      onClick={spot.onClick}
      aria-label={`${spot.label}${spot.done ? ', ticked today' : ''}`}
      whileTap={{ scale: 0.97 }}
      className="group absolute focus:outline-none hover:z-20 focus-within:z-20"
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: `${spot.width}%`,
        height: `${spot.height}%`,
        borderRadius: spot.radius,
        fontFamily: FONT,
      }}
    >
      {/* Everything that belongs to the dome rises together — the quoted
          paint, the ring around it and today's tick. A tick that stayed put
          while the dome it belongs to lifted would read as a separate object
          sitting in front of the shelf. */}
      <span
        className={`absolute inset-0 transition-transform duration-300 ease-out ${lift}`}
        style={{ transformOrigin: 'center 72%' }}
      >
        {/* The lifted dome and its ring, as one element so the two can never
            disagree about where the edge of the alcove is. Opacity only at
            rest, so nothing here paints until a child is actually on it. */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            ...cutout,
            borderRadius: spot.radius,
            border: `2px solid ${spot.accent}`,
            boxShadow:
              `0 22px 40px -14px rgba(4,2,14,0.92), ` +
              `0 0 34px -6px ${spot.accent}, ` +
              `inset 0 0 22px -8px ${spot.accent}`,
          }}
        />

        {/* Ticked today. The one thing allowed to cover any part of the art,
            because it is the only thing on this screen the painting cannot
            possibly say for itself. */}
        {spot.done && (
          <span
            className="absolute grid place-items-center rounded-full"
            style={{
              right: '-6%',
              top: '2%',
              height: '22%',
              aspectRatio: '1',
              background: spot.accent,
              boxShadow: `0 0 16px -2px ${spot.accent}`,
            }}
          >
            <Check size={14} strokeWidth={3.5} color="#0E1A1C" />
          </span>
        )}
      </span>

      {/* The name, for the fittings the painting never lettered — the knobs.
          It sits ABOVE the hotspot rather than on it, because a knob is small
          and a label printed over the top of one hides the thing it names. */}
      {spot.hint && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            background: 'rgba(10,6,22,0.92)',
            border: `1px solid ${spot.accent}`,
            color: CHROME.text,
            boxShadow: `0 0 20px -8px ${spot.accent}`,
          }}
        >
          {spot.hint}
        </span>
      )}
    </motion.button>
  );
}

/**
 * The greeting, in the place the painting drew one.
 *
 * The painted bubble says "Hello, Explorer!" and this app knows the child's
 * name, so the painted one is wiped out of the artwork (a blurred patch of
 * room is left behind) and this sits exactly over the hole. Same gradient,
 * same rounding, same tail pointing down at the boy — it has to read as the
 * thing that was painted there, because everything around it still is.
 *
 * Tappable, and it goes where the question goes. A greeting that asks "how are
 * you feeling?" and does nothing when a child answers by tapping it has taught
 * them the app isn't listening.
 */
export function HubGreeting({ name, onClick }: { name: string; onClick: () => void }) {
  const m = useMotion();
  const b = HUB_BOXES.bubble;
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      initial={m.quiet ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute flex items-center gap-[4%] px-[5%] text-left"
      style={{
        left: `${b.left}%`,
        top: `${b.top}%`,
        width: `${b.width}%`,
        height: `${b.height}%`,
        borderRadius: '38px',
        background: 'linear-gradient(150deg, #F8FBFF 0%, #EBF1FF 62%, #EDE9FF 100%)',
        boxShadow: '0 16px 38px -12px rgba(10,6,32,0.65)',
        fontFamily: FONT,
      }}
    >
      {/* The tail, pointing down at the boy standing under it. A rotated
          square sharing the bubble's own end colour, so the two can never
          disagree about the shade at the join — a triangle drawn with borders
          cannot take a gradient and shows as a slightly wrong grey. */}
      <span
        aria-hidden
        className="absolute rotate-45"
        style={{
          bottom: '-8%',
          right: '18%',
          width: '7%',
          aspectRatio: '1',
          background: '#EDE9FF',
          borderRadius: '0 0 6px 0',
        }}
      />
      <span
        className="relative block shrink-0 overflow-hidden rounded-full"
        style={{ width: '17%', aspectRatio: '1', border: '2px solid rgba(255,255,255,0.92)' }}
      >
        <img
          src="/assets/home/boy@320.webp"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute h-[300%] max-w-none"
          style={{ left: '-66%', top: '-14%' }}
        />
      </span>
      <span className="relative min-w-0 flex-1 leading-[1.18]">
        <span
          className="block font-extrabold"
          style={{ color: '#1B37C7', fontSize: 'clamp(11px, 1.28vw, 23px)' }}
        >
          {name ? `Hello, ${name}!` : 'Hello, Explorer!'}
        </span>
        <span
          className="mt-[3%] block whitespace-nowrap font-semibold"
          style={{ color: '#2B41A8', fontSize: 'clamp(8px, 0.88vw, 16px)' }}
        >
          How are you feeling today?
          <br />
          Let’s step into your mind!
        </span>
      </span>
    </motion.button>
  );
}

/** Shared by the room sheet the blue door opens. */
export const HUB_CHROME = CHROME;

/* ── The same gym, on a phone ────────────────────────────────────────── */

/**
 * A PORTRAIT SCREEN CANNOT HOLD A LANDSCAPE ROOM.
 *
 * The stage covers the viewport, which on a 430x900 phone means blowing the
 * painting up to 1612px wide and showing the middle quarter of it: the boy,
 * two domes, no doors, and half a speech bubble. Every hotspot a child needs
 * is off the side of the screen.
 *
 * So the phone gets the painting whole, letterboxed at its own aspect ratio,
 * as the thing at the top of the page — and then the rooms underneath as
 * something a thumb can actually hit. The alcoves in a 430px-wide painting are
 * about 45px across including their labels, which is under the minimum target
 * (§2.6) before you account for a six-year-old's aim.
 *
 * THE HERO IS NOT A CONTROL and is marked as such. Two ways to open the same
 * room, one of which is a 45px target inside a picture, is how a child learns
 * that tapping the picture doesn't work.
 */
export function PhoneHub({
  name,
  spots,
  onGreeting,
}: {
  name: string;
  spots: Hotspot[];
  onGreeting: () => void;
}) {
  const m = useMotion();
  const doors = spots.filter((s) => DOOR_IDS.includes(s.id));
  const knobs = spots.filter((s) => KNOB_IDS.includes(s.id));
  const rooms = spots.filter((s) => !DOOR_IDS.includes(s.id) && !KNOB_IDS.includes(s.id));

  return (
    <div className="relative flex flex-col" style={{ fontFamily: FONT }}>
      <div className="relative w-full shrink-0" style={{ aspectRatio: `${HUB_ASPECT}` }}>
        <img
          src="/assets/home/hub-room@960.webp"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
        {/* No HubGreeting in here. Its geometry is percentages of the stage,
            and at 430px wide those percentages are a 110px bubble holding
            three lines of type — the words stop being words. The greeting is
            a proper row under the hero instead. */}
        {/* The floor of the painting fading into the page under it, so the
            hero ends rather than stops. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%]"
          style={{ background: 'linear-gradient(to bottom, transparent, #1A0F2E)' }}
        />
      </div>

      <div className="relative -mt-2 flex flex-col gap-2.5 px-4 pb-32">
        {/* The same question the painted bubble asks, at a size a phone can
            print it — and it goes where the question goes. */}
        <button
          onClick={onGreeting}
          className="flex items-center gap-3 rounded-[22px] px-3.5 py-3 text-left"
          style={{
            minHeight: m.target,
            background: 'linear-gradient(150deg, #F8FBFF 0%, #EBF1FF 62%, #EDE9FF 100%)',
            boxShadow: '0 14px 32px -14px rgba(10,6,32,0.8)',
          }}
        >
          <span
            className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full"
            style={{ border: '2px solid rgba(255,255,255,0.92)' }}
          >
            <img
              src="/assets/home/boy@320.webp"
              alt=""
              aria-hidden
              draggable={false}
              className="absolute h-[300%] max-w-none"
              style={{ left: '-66%', top: '-14%' }}
            />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[16px] font-extrabold" style={{ color: '#1B37C7' }}>
              {name ? `Hello, ${name}!` : 'Hello, Explorer!'}
            </span>
            <span className="mt-0.5 block text-[12.5px] font-semibold" style={{ color: '#2B41A8' }}>
              How are you feeling today?
            </span>
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={r.onClick}
              className="flex items-center gap-2 rounded-[16px] px-3 py-3 text-left"
              style={{
                minHeight: m.target,
                background: r.done ? `${r.accent}26` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${r.done ? r.accent : 'rgba(255,255,255,0.14)'}`,
              }}
            >
              {r.done && (
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{ background: r.accent }}
                >
                  <Check size={12} strokeWidth={3.5} color="#0E1A1C" />
                </span>
              )}
              <span
                className="min-w-0 flex-1 text-[13px] font-extrabold leading-tight"
                style={{ color: CHROME.text }}
              >
                {r.label}
              </span>
            </button>
          ))}
        </div>

        {doors.map((d) => (
          <button
            key={d.id}
            onClick={d.onClick}
            className="rounded-full px-4 py-3.5 text-[14.5px] font-extrabold"
            style={{
              minHeight: m.target,
              background: `${d.accent}1F`,
              border: `1.5px solid ${d.accent}`,
              color: CHROME.text,
              boxShadow: `0 0 24px -10px ${d.accent}`,
            }}
          >
            {d.label}
          </button>
        ))}

        {/* The knobs, which on a wide screen are brass fittings on the doors
            and here are simply two more places to go. No overlap to worry
            about on a phone — the doors above are rows of their own — so
            these can be plain, quieter buttons sitting under the door each
            one belongs to. */}
        <div className="grid grid-cols-2 gap-2.5">
          {knobs.map((k) => (
            <button
              key={k.id}
              onClick={k.onClick}
              className="rounded-full px-2.5 py-2.5 text-[12px] font-extrabold leading-tight"
              style={{
                minHeight: m.target,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${k.accent}77`,
                color: CHROME.textSoft,
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
