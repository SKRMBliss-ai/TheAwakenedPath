import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';
import {
  PLANTS, SEEDS_PER_DAY, STAGE_NAMES, daysBetween, isMagicBloom, stageOf, weekdayName,
  type Plant, type PlantInfo, type PlantKind, type Stage,
} from '../../../kids/delight';
import { useQuiet } from '../ui/quiet';
import { FONT } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { chirpySprite } from '../ui/sprites';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import * as sound from '../kit/sound';
import { BadgeSlot } from './ChildBadge';
import './Garden.css';

/*
  MY GARDEN — every good choice plants a seed, and the seed grows overnight.

  A plant's stage is worked out from the day it went in, never stored, so a
  garden nobody looks at for a week has quietly come into flower by the time
  they are back. That is the whole pull of it: something here changed while
  you were asleep, and it is yours.

  Tall things stand at the back. The newest seeds go in the front bed, where a
  child can see them, and the older plants step back a row as new ones arrive;
  anything older than the beds can show is a tiny flower out on the hills.
*/

const TAU = Math.PI * 2;

/* ── One plant, drawn ─────────────────────────────────────────────────────── */

function FlowerHead({ info, cx, cy, petal, center }: { info: PlantInfo; cx: number; cy: number; petal: string; center: string }) {
  const n = info.petals;
  const ring = (d: string) => Array.from({ length: n }, (_, i) => (
    <path key={i} d={d} transform={`translate(${cx} ${cy}) rotate(${(i * 360) / n})`} fill={petal} />
  ));
  switch (info.shape) {
    case 'round':
      return <g>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * TAU - Math.PI / 2;
          return <circle key={i} cx={cx + Math.cos(a) * 11} cy={cy + Math.sin(a) * 11} r={10.5} fill={petal} />;
        })}
        <circle cx={cx} cy={cy} r={8} fill={center} />
      </g>;
    case 'pointed':
      return <g>{ring('M0 0 C 8 -7, 8 -19, 0 -27 C -8 -19, -8 -7, 0 0 Z')}<circle cx={cx} cy={cy} r={6} fill={center} /></g>;
    case 'long':
      return <g>{ring('M0 0 C 4.6 -8, 4.6 -18, 0 -26 C -4.6 -18, -4.6 -8, 0 0 Z')}<circle cx={cx} cy={cy} r={n > 12 ? 10.5 : 7} fill={center} /></g>;
    case 'star':
      return <g>{ring('M0 0 C 11 -8, 9 -21, 0 -29 C -9 -21, -11 -8, 0 0 Z')}<circle cx={cx} cy={cy} r={6.5} fill={center} /></g>;
    case 'tulip':
      return <g transform={`translate(${cx} ${cy + 6})`}>
        <path d="M-12 0 C -15 -13, -10 -24, -3 -26 L 0 -17 L 3 -26 C 10 -24, 15 -13, 12 0 C 8 9, -8 9, -12 0 Z" fill={petal} />
        <path d="M-3 -26 C 3 -18, 4 -6, 0 6" stroke="#ffffff55" strokeWidth="1.6" fill="none" />
      </g>;
    case 'bell':
      return null;
  }
}

/** Bluebells hang their flowers from an arching stem, so they are drawn whole rather than as a head. */
function Bluebell({ stage, petal }: { stage: Stage; petal: string }) {
  const open = stage === 3;
  const bell = (x: number, y: number, k: number) => (
    <path d="M-7 0 C -7 -10, 7 -10, 7 0 L 9 7 C 5 5, 2 9, 0 6 C -2 9, -5 5, -9 7 Z" fill={petal}
      transform={`translate(${x} ${y}) scale(${k})`} />
  );
  return <g>
    <path d={open ? 'M50 150 C 48 104, 50 70, 58 54 C 64 42, 74 38, 82 44' : 'M50 150 C 48 112, 50 86, 56 74 C 61 64, 68 62, 73 66'}
      stroke="url(#gdp-stem)" strokeWidth="4.2" fill="none" strokeLinecap="round" />
    {open ? <>{bell(57, 64, 1.05)}{bell(69, 52, 1)}{bell(82, 54, .9)}</> : <>{bell(60, 80, .62)}{bell(72, 74, .55)}</>}
  </g>;
}

function Leaf({ x, y, flip, size = 1 }: { x: number; y: number; flip: boolean; size?: number }) {
  return <path d="M0 0 C 9 -8, 21 -7, 28 2 C 18 8, 7 7, 0 0 Z" fill="url(#gdp-leaf)"
    transform={`translate(${x} ${y}) scale(${flip ? -size : size} ${size}) rotate(-18)`} />;
}

export function PlantArt({ kind, stage, magic = false }: { kind: PlantKind; stage: Stage; magic?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const info = PLANTS[kind];
  const [light, deep] = info.petal;
  const petal = `url(#p${uid})`;
  const roundPetal = `url(#r${uid})`;
  const center = `url(#c${uid})`;
  const top = [146, 120, 76, 54][stage];
  const stem = `M50 150 C 46 ${150 - (150 - top) * 0.35}, 54 ${150 - (150 - top) * 0.7}, 50 ${top}`;

  let body: ReactNode = null;
  if (stage === 0) {
    body = <g>
      <path d="M30 152 C 37 139, 63 139, 70 152 Z" fill="url(#gdp-soil)" />
      <ellipse cx="50" cy="143" rx="6.5" ry="4.6" fill="url(#gdp-seed)" transform="rotate(-24 50 143)" />
      <circle cx="58" cy="134" r="1.6" fill="#fff6c8" className="gd-twinkle" />
      <circle cx="42" cy="131" r="1.1" fill="#fff6c8" className="gd-twinkle gd-twinkle-b" />
    </g>;
  } else if (info.shape === 'bell' && stage >= 2) {
    body = <g><Leaf x={49} y={128} flip={false} size={.9} /><Leaf x={51} y={118} flip size={.8} /><Bluebell stage={stage} petal={petal} /></g>;
  } else if (stage === 1) {
    body = <g>
      <path d={stem} stroke="url(#gdp-stem)" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <ellipse cx="42" cy="118" rx="9" ry="5" fill="url(#gdp-leaf)" transform="rotate(-28 42 118)" />
      <ellipse cx="58" cy="116" rx="9" ry="5" fill="url(#gdp-leaf)" transform="rotate(26 58 116)" />
    </g>;
  } else {
    const headY = stage === 2 ? 70 : 46;
    body = <g>
      <path d={stem} stroke="url(#gdp-stem)" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      <Leaf x={49} y={128} flip={false} />
      <Leaf x={51} y={stage === 2 ? 104 : 96} flip size={.9} />
      {stage === 2 ? (
        <g transform={`translate(50 ${headY + 6})`}>
          <path d="M0 0 C 9 -6, 8 -18, 0 -25 C -8 -18, -9 -6, 0 0 Z" fill={petal} />
          <path d="M0 2 C -6 -1, -9 -5, -8 -9 C -4 -6, -2 -4, 0 0 C 2 -4, 4 -6, 8 -9 C 9 -5, 6 -1, 0 2 Z" fill="url(#gdp-leaf)" />
        </g>
      ) : <>
        <circle cx="50" cy={headY} r="30" fill={`url(#g${uid})`} className={magic ? 'gd-halo gd-halo-magic' : 'gd-halo'} />
        <FlowerHead info={info} cx={50} cy={headY} petal={info.shape === 'round' ? roundPetal : petal} center={center} />
      </>}
    </g>;
  }

  return (
    <svg className="gd-plant-svg" viewBox="0 0 100 160" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`p${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <radialGradient id={`r${uid}`} cx=".38" cy=".34" r=".75">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
        <radialGradient id={`c${uid}`} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor={info.center} />
          <stop offset="1" stopColor={info.center === '#7a4a1f' ? '#4a2a10' : '#f0a12c'} />
        </radialGradient>
        <radialGradient id={`g${uid}`}>
          <stop offset="0" stopColor={deep} stopOpacity=".55" />
          <stop offset="1" stopColor={deep} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="152" rx="22" ry="4" fill="#0a0518" opacity=".35" />
      {body}
      {magic && stage === 3 && <g className="gd-sparkles">
        <path d="M22 30 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 Z" fill="#fff6c8" />
        <path d="M78 22 l1.5 -4.5 l1.5 4.5 l4.5 1.5 l-4.5 1.5 l-1.5 4.5 l-1.5 -4.5 l-4.5 -1.5 Z" fill="#fff6c8" />
        <path d="M80 62 l1.2 -3.6 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2 Z" fill="#fff6c8" />
      </g>}
    </svg>
  );
}

/** Shared paints every plant refers to by id — one copy on the page. */
export function GardenPaints() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gdp-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9bf0a8" />
          <stop offset="1" stopColor="#2e8b57" />
        </linearGradient>
        <linearGradient id="gdp-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b6f5b0" />
          <stop offset="1" stopColor="#2f9c5a" />
        </linearGradient>
        <linearGradient id="gdp-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a3a" />
          <stop offset="1" stopColor="#4a2c1c" />
        </linearGradient>
        <radialGradient id="gdp-seed" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffe0a8" />
          <stop offset="1" stopColor="#9a5a28" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Words ────────────────────────────────────────────────────────────────── */

function plantedWhen(day: string, today: string): string {
  const ago = daysBetween(day, today);
  if (ago <= 0) return 'today';
  if (ago === 1) return 'yesterday';
  if (ago < 7) return `on ${weekdayName(day)}`;
  return `${ago} days ago`;
}

const STAGE_LABEL: Record<Stage, string> = { 0: 'Seed', 1: 'Sprout', 2: 'Bud', 3: 'Flower' };

function plantStory(plant: Plant, today: string): { name: string; stage: Stage; planted: string; next: string } {
  const info = PLANTS[plant.kind];
  const stage = stageOf(plant, today);
  return {
    name: info.name,
    stage,
    planted: `Planted ${plantedWhen(plant.day, today)} when you ${info.from}.`,
    next: stage < 3
      ? `Tomorrow it will be a ${STAGE_NAMES[stage + 1]}!`
      : isMagicBloom(plant, today) ? 'It has bloomed for so long that it shimmers!' : 'It is in full bloom!',
  };
}

/* ── Layout ───────────────────────────────────────────────────────────────── */

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 700);
  useEffect(() => {
    const q = window.matchMedia('(max-width: 699px)');
    const sync = () => setNarrow(q.matches);
    sync();
    q.addEventListener('change', sync);
    return () => q.removeEventListener('change', sync);
  }, []);
  return narrow;
}

/** Fixed, scattered places on the hills for the flowers the beds no longer have room for. */
const MEADOW = Array.from({ length: 60 }, (_, i) => ({
  x: 3 + ((i * 37) % 94) + ((i * 13) % 5) * 0.3,
  y: 8 + ((i * 53) % 26),
}));

const FIREFLIES = Array.from({ length: 14 }, (_, i) => ({
  left: `${6 + ((i * 41) % 88)}%`, top: `${30 + ((i * 29) % 42)}%`,
  delay: `${-((i * 0.83) % 6)}s`, dur: `${5 + (i % 4)}s`,
}));

const DROPS = Array.from({ length: 46 }, (_, i) => ({
  left: `${4 + ((i * 31) % 92)}%`, delay: `${((i * 0.07) % 0.9).toFixed(2)}s`, dur: `${0.7 + (i % 5) * 0.08}s`,
}));

/* ── The garden ───────────────────────────────────────────────────────────── */

export function Garden({ onExit, onGrownUp, onReflectionPath }: { onExit: () => void; onGrownUp: () => void; onReflectionPath?: () => void }) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const plants = useKidStore((s) => s.plants);
  const name = useKidStore((s) => s.name);
  const today = todayKey();
  /* Read before this visit marks the garden as seen, so whatever grew since
     the last look stays lit for the whole of this one. */
  const [since] = useState(() => useKidStore.getState().gardenSeen);
  useEffect(() => { useKidStore.getState().seeGarden(); }, []);

  const narrow = useNarrow();
  const perRow = narrow ? 4 : 7;
  const rowCount = narrow ? 3 : 2;
  const shown = plants.slice(-perRow * rowCount);
  const meadow = plants.slice(0, plants.length - shown.length);
  const grew = new Set(
    since && since < today
      ? shown.filter((p) => p.day <= since && stageOf(p, today) > stageOf(p, since)).map((p) => p.id)
      : [],
  );
  /* Row 0 is the front bed: the newest, smallest things where they can be seen. */
  const rows = Array.from({ length: rowCount }, (_, r) => {
    const end = shown.length - perRow * r;
    return end > 0 ? shown.slice(Math.max(0, end - perRow), end) : [];
  });
  const plantedToday = plants.filter((p) => p.day === today).length;
  const hi = name && name !== 'Explorer' ? `, ${name}` : '';

  const welcome = plants.length === 0
    ? 'Your garden is ready for its first seed! Every good choice, like a game, a story or a diary page, plants one here.'
    : grew.size > 0
      ? `Look${hi}! ${grew.size} of your plants grew while you were ${since && daysBetween(since, today) > 1 ? 'away' : 'asleep'}!`
      : plants.every((p) => p.day === today)
        ? `You planted ${plantedToday} ${plantedToday === 1 ? 'seed' : 'seeds'} today. Come back tomorrow to see ${plantedToday === 1 ? 'it' : 'them'} sprout!`
        : `Your garden is happy to see you${hi}. Tap a plant to hear its story.`;

  const [line, setLine] = useState(welcome);
  const say = (text: string) => { setLine(text); speak(text, quiet, 'grownup'); };
  useEffect(() => {
    const t = window.setTimeout(() => speak(welcome, quiet, 'grownup'), 700);
    return () => { window.clearTimeout(t); stopSpeaking(); };
    // Said once, on the way in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [picked, setPicked] = useState<Plant | null>(null);
  const pick = (plant: Plant) => {
    if (!quiet) sound.play('tapHit');
    setPicked(plant);
    const story = plantStory(plant, today);
    say(`${story.name}. ${story.planted} ${story.next}`);
  };

  const [rain, setRain] = useState(0);
  const water = () => {
    if (!quiet) sound.play('discovery');
    setRain((n) => n + 1);
    useKidStore.getState().waterGarden();
    say(plants.length ? 'Glug, glug! Your garden says thank you.' : 'The soil is ready and waiting for your first seed!');
  };
  useEffect(() => {
    if (!rain) return;
    const t = window.setTimeout(() => setRain(0), still ? 700 : 2300);
    return () => window.clearTimeout(t);
  }, [rain, still]);

  return (
    <main className={`gd-room ${still ? 'gd-still' : ''} ${rain ? 'gd-raining' : ''}`} style={{ fontFamily: FONT }}>
      <GardenPaints />
      <div className="gd-sky" aria-hidden="true"><span className="gd-moon" /><span className="gd-stars" /></div>
      <svg className="gd-hills" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="gd-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a4aa8" /><stop offset="1" stopColor="#3a2a78" /></linearGradient>
          <linearGradient id="gd-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4aa0" /><stop offset="1" stopColor="#262a66" /></linearGradient>
          <linearGradient id="gd-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f8a72" /><stop offset="1" stopColor="#1d4a44" /></linearGradient>
          <linearGradient id="gd-lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f6b55" /><stop offset="1" stopColor="#12302b" /></linearGradient>
        </defs>
        <path d="M0 250 C 180 170, 330 190, 480 225 C 640 262, 760 150, 960 170 C 1140 188, 1260 240, 1400 205 C 1490 182, 1560 190, 1600 200 L 1600 600 L 0 600 Z" fill="url(#gd-far)" />
        <path d="M0 300 C 160 262, 330 278, 520 300 C 700 322, 880 255, 1080 268 C 1270 280, 1430 320, 1600 290 L 1600 600 L 0 600 Z" fill="url(#gd-mid)" />
        <path d="M0 352 C 220 318, 420 330, 640 345 C 880 362, 1100 322, 1320 330 C 1450 335, 1540 345, 1600 340 L 1600 600 L 0 600 Z" fill="url(#gd-near)" />
        <g>
          {meadow.slice(-MEADOW.length).map((p, i) => {
            const spot = MEADOW[i];
            return <g key={p.id} transform={`translate(${spot.x * 16} ${352 + spot.y * 1.3})`}>
              <line x1="0" y1="0" x2="0" y2="14" stroke="#7fd69a" strokeWidth="2.2" />
              <circle cx="0" cy="-2" r="7" fill={PLANTS[p.kind].petal[1]} />
              <circle cx="0" cy="-2" r="2.6" fill="#fff6c8" />
            </g>;
          })}
        </g>
        <path d="M0 420 C 300 395, 560 405, 820 412 C 1100 420, 1350 398, 1600 408 L 1600 600 L 0 600 Z" fill="url(#gd-lawn)" />
      </svg>
      <div className="gd-fence" aria-hidden="true"><span className="gd-lights" /></div>
      <div className="gd-fireflies" aria-hidden="true">
        {FIREFLIES.map((f, i) => <i key={i} style={{ left: f.left, top: f.top, animationDelay: f.delay, animationDuration: f.dur }} />)}
      </div>

      <DoorHandle side="left" label="Mind Gym" onClick={onExit} accent="#9be8b0" scale={0.4} bottomVh={64} />

      <header className="gd-head">
        <h1>My Garden <span aria-hidden="true">✿</span></h1>
        <p>Every good choice plants a seed. It grows while you sleep.</p>
        {meadow.length > 0 && (
          <p className="gd-meadow-note">+{meadow.length} more {meadow.length === 1 ? 'flower' : 'flowers'} out on the hills</p>
        )}
      </header>

      <div className="gd-tools">
        <BadgeSlot />
        <span className="gd-pouch" role="img" aria-label={`Seeds planted today: ${plantedToday} of ${SEEDS_PER_DAY}.`}>
          <b>Seeds today</b>
          <span aria-hidden="true">{Array.from({ length: SEEDS_PER_DAY }, (_, i) => <i key={i} className={i < plantedToday ? 'is-in' : ''} />)}</span>
        </span>
        <button className="gd-can" onClick={water} aria-label="Water the garden">
          <svg viewBox="0 0 64 48" aria-hidden="true" focusable="false">
            <path d="M14 18 h26 a4 4 0 0 1 4 4 v16 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 Z" fill="url(#gd-can)" />
            <path d="M44 24 L 60 12 l2 3 L 46 30 Z" fill="#7fd6c8" />
            <path d="M18 18 c0 -10, 22 -10, 22 0" fill="none" stroke="#5fb8ac" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="22" cy="30" r="3" fill="#ffffff66" />
            <defs><linearGradient id="gd-can" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8f0e4" /><stop offset="1" stopColor="#2f9c8c" /></linearGradient></defs>
          </svg>
          <span>Water</span>
        </button>
        <button className="gd-grownup chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </div>

      <section className="gd-beds" aria-label="Your garden beds">
        {rows.map((row, r) => (
          <div key={r} className={`gd-row gd-row-${r}`} style={{ '--per': perRow } as CSSProperties}>
            <span className="gd-soil" aria-hidden="true" />
            <span className="gd-box" aria-hidden="true" />
            <ul className="gd-plots">
              {Array.from({ length: perRow }, (_, i) => {
                const plant = row[i];
                if (!plant) {
                  const next = r === 0 && i === row.length && plantedToday < SEEDS_PER_DAY;
                  return <li key={`empty-${i}`} className={`gd-plot is-empty ${next ? 'is-next' : ''}`} aria-hidden="true"><span /></li>;
                }
                const stage = stageOf(plant, today);
                const story = plantStory(plant, today);
                return (
                  <li key={plant.id} className="gd-plot" style={{ '--sway': `${3.6 + ((i + r) % 4) * 0.5}s`, '--sway-delay': `${-((i * 0.7) % 3)}s` } as CSSProperties}>
                    <button
                      className={`gd-plant gd-stage-${stage} ${grew.has(plant.id) ? 'gd-grew' : ''} ${picked?.id === plant.id ? 'is-picked' : ''}`}
                      onClick={() => pick(plant)}
                      aria-label={`${story.name}, a ${STAGE_NAMES[stage]}. ${story.planted}`}
                    >
                      <PlantArt kind={plant.kind} stage={stage} magic={isMagicBloom(plant, today)} />
                      {grew.has(plant.id) && <span className="gd-grew-tag" aria-hidden="true">grew!</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <div className="gd-chirpy">
        <img src={chirpySprite(grew.size ? 'excited' : 'curious')} alt="Chirpy" />
        <AnimatePresence mode="wait">
          <motion.p key={line} className="gd-bubble" aria-live="polite"
            initial={still ? false : { opacity: 0, y: 6, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: .12 } }} transition={{ duration: .25 }}>
            {line}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {picked && (() => {
          const story = plantStory(picked, today);
          return (
            <motion.aside key={picked.id} className="gd-card" role="dialog" aria-label={story.name}
              initial={still ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
              <div className="gd-card-art"><PlantArt kind={picked.kind} stage={story.stage} magic={isMagicBloom(picked, today)} /></div>
              <div className="gd-card-text">
                <span className={`gd-chip gd-chip-${story.stage}`}>{STAGE_LABEL[story.stage]}</span>
                <h2>{story.name}</h2>
                <p>{story.planted}</p>
                <p className="gd-card-next">{story.next}</p>
              </div>
              <button className="gd-card-close" onClick={() => setPicked(null)} aria-label="Close">✕</button>
            </motion.aside>
          );
        })()}
      </AnimatePresence>

      {rain > 0 && (
        <div className="gd-rain" aria-hidden="true">
          {DROPS.map((d, i) => <i key={`${rain}-${i}`} style={{ left: d.left, animationDelay: d.delay, animationDuration: d.dur }} />)}
        </div>
      )}
    </main>
  );
}
