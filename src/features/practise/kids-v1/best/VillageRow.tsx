import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CHROME, FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { artRoomFor, type VirtueRoom } from './rooms';

/**
 * THE VILLAGE — the rooms as a street you walk down, not a grid you pick from.
 *
 * The seven rooms have always been named like places: a garden, a castle, a
 * lab, a park, a village. The hub showed them as a grid of poster cards
 * anyway, which is a menu wearing a coat — a child reads it as "choose an
 * option", not "go somewhere". Here each room is a building along one path,
 * and choosing is walking past things until one is the one you want.
 *
 * NO NEW ART. Every building is drawn — a silhouette path and a handful of
 * windows, in the room's own accent. That is deliberate rather than a
 * shortcut: painted fronts would take seven new pieces of art to try an idea
 * that might not survive a six-year-old, and a drawn street can be thrown away
 * cheaply. The painted version is what happens if the street earns it.
 *
 * WHAT THE WINDOWS MEAN. A room's glow used to be a border on its card, lit by
 * points earned there. Here it is windows: the more a child has done in a
 * room, the more of that building is awake. So a street a month in is lit
 * unevenly — bright where they go, dark where they don't — which is a truer
 * picture of a child's month than seven identically-glowing cards, and it is
 * never once said out loud.
 *
 * WHAT IT DOESN'T DO. It doesn't replace the journey or the doors: the
 * DoorWall is still how a child is *asked* something. This is only the "or
 * pick a room" half of the hub, which is the half that was a menu.
 */

/**
 * Points behind the FIRST lit window; the rest come on a square root, so each
 * one costs more than the last — 60 points lights one, 240 lights two, 1500
 * lights all five.
 *
 * Linear was the first attempt and it flattened the whole idea: at one window
 * per 60 points every room a child actually uses was fully lit inside a month,
 * and a street where every building is at maximum says nothing about the child
 * standing on it. The point of the windows is the UNEVENNESS — bright where
 * they go, dark where they don't — and that only survives if the top of the
 * scale is months away rather than weeks.
 */
const FIRST_WINDOW = 60;

interface Shape {
  /** Silhouette, in a 60-wide × 74-tall box standing on y=74. */
  path: string;
  /** Window slots, lit in order as points accumulate. */
  windows: { x: number; y: number; w?: number; h?: number }[];
  /** The doorway, always drawn, always lit — a building you can enter. */
  door: { x: number; y: number; w: number; h: number };
}

/**
 * One silhouette per room, keyed by room id. Each is the building its name
 * already implies — a castle has battlements, the observatory has a dome —
 * because the point of the street is that a child recognises where they are
 * going before they can read the sign.
 */
const SHAPES: Record<string, Shape> = {
  // Kindness Garden — a low glasshouse under a pitched roof.
  kind: {
    path: 'M8 74 L8 40 L30 22 L52 40 L52 74 Z',
    windows: [{ x: 14, y: 44 }, { x: 38, y: 44 }, { x: 14, y: 58 }, { x: 38, y: 58 }, { x: 26, y: 32, w: 8, h: 8 }],
    door: { x: 25, y: 60, w: 10, h: 14 },
  },
  // Truth Lab — tall, narrow, a light left on at the top.
  truth: {
    path: 'M16 74 L16 26 L30 14 L44 26 L44 74 Z',
    windows: [{ x: 21, y: 30 }, { x: 33, y: 30 }, { x: 21, y: 43 }, { x: 33, y: 43 }, { x: 27, y: 20, w: 6, h: 6 }],
    door: { x: 25, y: 60, w: 10, h: 14 },
  },
  // Courage Castle — battlements, and a keep worth defending.
  choices: {
    path: 'M6 74 L6 30 L6 24 L13 24 L13 30 L20 30 L20 24 L27 24 L27 30 L34 30 L34 24 L41 24 L41 30 L48 30 L48 24 L54 24 L54 30 L54 74 Z',
    windows: [{ x: 14, y: 38 }, { x: 27, y: 38 }, { x: 40, y: 38 }, { x: 14, y: 52 }, { x: 40, y: 52 }],
    door: { x: 24, y: 56, w: 12, h: 18 },
  },
  // Friendship Park — a wide pavilion, open to everyone.
  include: {
    path: 'M6 74 L6 44 Q 30 24 54 44 L54 74 Z',
    windows: [{ x: 13, y: 50 }, { x: 26, y: 46 }, { x: 39, y: 50 }, { x: 13, y: 62 }, { x: 39, y: 62 }],
    door: { x: 25, y: 58, w: 10, h: 16 },
  },
  // Healthy Body Zone — a domed hall.
  body: {
    path: 'M10 74 L10 46 Q 30 26 50 46 L50 74 Z',
    windows: [{ x: 16, y: 52 }, { x: 27, y: 44 }, { x: 38, y: 52 }, { x: 16, y: 64 }, { x: 38, y: 64 }],
    door: { x: 25, y: 60, w: 10, h: 14 },
  },
  // Helping Hands Village — two gables leaning together.
  help: {
    path: 'M4 74 L4 44 L18 30 L30 42 L42 30 L56 44 L56 74 Z',
    windows: [{ x: 12, y: 50 }, { x: 27, y: 52 }, { x: 42, y: 50 }, { x: 12, y: 63 }, { x: 42, y: 63 }],
    door: { x: 25, y: 62, w: 10, h: 12 },
  },
  // Reflection Observatory — the dome that looks up, and the only one that does.
  mindheart: {
    path: 'M14 74 L14 40 L18 40 A 12 12 0 0 1 42 40 L46 40 L46 74 Z',
    windows: [{ x: 20, y: 46 }, { x: 34, y: 46 }, { x: 20, y: 59 }, { x: 34, y: 59 }, { x: 27, y: 30, w: 6, h: 6 }],
    door: { x: 25, y: 62, w: 10, h: 12 },
  },
};

/** The Pause Room's shelter. No windows to light: nothing is counted here. */
const PAUSE_SHAPE: Shape = {
  path: 'M12 74 L12 48 Q 30 34 48 48 L48 74 Z',
  windows: [],
  door: { x: 25, y: 58, w: 10, h: 16 },
};

export function litWindows(earned: number, slots: number) {
  if (earned < FIRST_WINDOW) return 0;
  return Math.min(slots, Math.floor(Math.sqrt(earned / FIRST_WINDOW)));
}

export function VillageRow({
  rooms,
  today,
  pointsByBehaviour,
  onOpen,
  onPause,
}: {
  rooms: VirtueRoom[];
  today: Record<string, boolean>;
  pointsByBehaviour: Record<string, number>;
  onOpen: (room: VirtueRoom) => void;
  onPause: () => void;
}) {
  return (
    <div className="relative">
      {/*
        The street scrolls sideways. `snap` so a building always ends up
        squarely in front of the child rather than half off the edge, and the
        scrollbar is left visible on desktop — a street a child can't tell is
        scrollable is a street they only ever see the first half of.
      */}
      <div
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto overflow-y-hidden pb-3 pt-2"
        style={{
          scrollbarWidth: 'thin',
          /*
            THE STREET HAS TO LOOK LIKE IT CARRIES ON, or the three buildings
            that fit on a phone are the only three a child knows exist. A hard
            edge at the viewport reads as the end of the row; this fades the
            last one out mid-stride, the way a street does going round a
            corner.

            A MASK, not an overlay panel. The first attempt painted a dark
            gradient on top, which worked only while the hub was always night —
            against the dusk and midday skies it showed up as a black rectangle
            sitting on the street. A mask fades the buildings themselves and so
            is right on every sky, present and future.
          */
          maskImage: 'linear-gradient(90deg, #000 0%, #000 82%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, #000 0%, #000 82%, transparent 100%)',
        }}
      >
        {rooms.map((room, i) => (
          <Building
            key={room.id}
            room={room}
            index={i}
            doneToday={!!today[room.id]}
            earned={pointsByBehaviour[room.id] ?? 0}
            onClick={() => onOpen(room)}
          />
        ))}
        <PauseHut index={rooms.length} onClick={onPause} />
      </div>

      {/* The path they are standing on, running the width of the street. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,225,180,0.34) 18%, rgba(255,225,180,0.34) 82%, transparent)' }}
      />
    </div>
  );
}

function Building({
  room, index, doneToday, earned, onClick,
}: {
  room: VirtueRoom; index: number; doneToday: boolean; earned: number; onClick: () => void;
}) {
  const quiet = useQuiet();
  const art = artRoomFor(room);
  const accent = art.palette.accent;
  const shape = SHAPES[room.id] ?? PAUSE_SHAPE;
  const lit = litWindows(earned, shape.windows.length);

  return (
    <motion.button
      onClick={onClick}
      aria-label={`${room.name}${doneToday ? ', ticked today' : ''}`}
      className="group relative w-[104px] flex-none snap-center border-0 bg-transparent p-0 pt-2 text-center"
      initial={quiet ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      whileHover={quiet ? undefined : { y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* The building's own light spilling onto the street behind it. Brighter
          on a room ticked today, which is the one thing the street says back. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto block h-16 w-16 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}${doneToday ? '55' : '22'} 0%, transparent 70%)`,
          filter: 'blur(6px)',
        }}
      />

      <span className="relative block">
      <svg viewBox="0 0 60 76" className="relative block h-[92px] w-full" aria-hidden>
        <path
          d={shape.path}
          fill="#1D1435"
          stroke={doneToday ? accent : 'rgba(255,255,255,0.22)'}
          strokeWidth={doneToday ? 1.6 : 1}
          strokeLinejoin="round"
        />

        {shape.windows.map((win, i) => {
          const on = i < lit;
          return (
            <rect
              key={i}
              x={win.x}
              y={win.y}
              width={win.w ?? 8}
              height={win.h ?? 9}
              rx={1.5}
              fill={on ? accent : 'rgba(255,255,255,0.07)'}
              opacity={on ? 0.92 : 1}
              style={on ? { filter: `drop-shadow(0 0 3px ${accent})` } : undefined}
            />
          );
        })}

        {/* The doorway. Always warm, whatever the child has or hasn't done —
            a room is never shut to them for not having earned it. */}
        <rect
          x={shape.door.x}
          y={shape.door.y}
          width={shape.door.w}
          height={shape.door.h}
          rx={shape.door.w / 2.4}
          fill={`${accent}`}
          opacity={0.5}
        />

        {/* Ground shadow, so the building stands on the street. */}
        <ellipse cx="30" cy="74.5" rx="22" ry="1.6" fill="rgba(0,0,0,0.5)" />
      </svg>

      {/* Today's tick sits ON the building, at the eaves. It used to hang in
          the padding above one, where it read as a loose badge belonging to
          nothing rather than as this house being done. */}
      {doneToday && (
        <span
          className="absolute right-2 top-1 grid h-5 w-5 place-items-center rounded-full"
          style={{ background: accent, boxShadow: `0 0 12px -2px ${accent}` }}
        >
          <Check size={11} strokeWidth={4} color="#0E1A1C" />
        </span>
      )}
      </span>

      <span
        className="mt-1 block px-1 text-[10.5px] font-extrabold leading-tight"
        style={{ color: doneToday ? CHROME.text : CHROME.textSoft, fontFamily: FONT }}
      >
        {room.name}
      </span>
    </motion.button>
  );
}

/** The Pause Room, at the end of the street and visibly not one of the seven:
 *  no windows to light, no tick, no name that asks anything of anybody. */
function PauseHut({ index, onClick }: { index: number; onClick: () => void }) {
  const quiet = useQuiet();
  return (
    <motion.button
      onClick={onClick}
      aria-label="Pause Room"
      className="relative w-[104px] flex-none snap-center border-0 bg-transparent p-0 pt-2 text-center"
      initial={quiet ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      whileHover={quiet ? undefined : { y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <svg viewBox="0 0 60 76" className="relative block h-[92px] w-full" aria-hidden>
        <path d={PAUSE_SHAPE.path} fill="#161129" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeLinejoin="round" />
        <rect
          x={PAUSE_SHAPE.door.x}
          y={PAUSE_SHAPE.door.y}
          width={PAUSE_SHAPE.door.w}
          height={PAUSE_SHAPE.door.h}
          rx={4}
          fill="#FFE1B4"
          opacity={0.32}
        />
        <ellipse cx="30" cy="74.5" rx="20" ry="1.5" fill="rgba(0,0,0,0.5)" />
      </svg>
      <span className="mt-1 block text-[10.5px] font-extrabold" style={{ color: CHROME.textSoft, fontFamily: FONT }}>
        Pause Room
      </span>
    </motion.button>
  );
}
