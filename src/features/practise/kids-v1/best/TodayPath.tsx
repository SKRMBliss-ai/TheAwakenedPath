import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { speak } from '../kit/chirpyVoice';
import { PATH_ORDER, type PathStepId } from '../kit/todayPath';
import type { DayPath } from '../kit/useTodayPath';
import './TodayPath.css';

/*
  THE PATH ON THE HOME PAGE: four stepping stones and an arrow.

  The stones say the order of the day (feel, practise, diary, play) and which
  one is now. The arrow stands next to the real thing in the room to tap for
  it: the Start My Journey button, today's door on the shelf, the diary, the
  treasures. As each is done the arrow moves on, so a child is never left
  looking at a dozen things wondering which one is theirs.
*/

const STONES: Record<PathStepId, { label: string; icon: ReactNode }> = {
  feel: { label: 'Feel', icon: <img src="/mind-gym/home/icon_feeling.webp" alt="" /> },
  practise: { label: 'Practise', icon: '🎮' },
  diary: { label: 'Diary', icon: '📖' },
  play: { label: 'Play', icon: '🎈' },
};

/** What Chirpy says about the step that is now. No names: one recording serves every child. */
function pathLine(path: DayPath): string {
  switch (path.current) {
    case 'feel': return path.feelAgain ? 'How do you feel now? Tell me again.' : 'First, tell me how you feel.';
    case 'practise': return `Practise time! Open the ${path.roomTitle} door.`;
    case 'diary': return 'Now fill in today’s page in your diary.';
    default: return 'You did it all today! Now it’s play time.';
  }
}

/** The word on the arrow itself. */
function arrowWord(path: DayPath): string {
  switch (path.current) {
    case 'feel': return path.feelAgain ? 'Check in again!' : 'Start here!';
    case 'practise': return 'Practise here!';
    case 'diary': return 'Diary time!';
    default: return 'Play time!';
  }
}

export function PathSteps({ path, title, variant, quiet, onGo }: {
  path: DayPath; title: string; variant: 'card' | 'strip'; quiet: boolean; onGo: (step: PathStepId) => void;
}) {
  const line = pathLine(path);
  return (
    <div className={`tp tp-${variant}`}>
      <b className="tp-title">{title}</b>
      <p className="tp-say">
        <span>{line}</span>
        <button className="tp-hear" onClick={() => speak(line, quiet)} aria-label="Hear it">🔊</button>
      </p>
      <ol className="tp-stones" aria-label="Today’s path">
        {PATH_ORDER.map((id) => {
          const state = path.current === id ? 'now' : path.done[id] ? 'done' : 'later';
          const stone = STONES[id];
          return (
            <li key={id} className={`tp-stone is-${state}`}>
              <button onClick={() => onGo(id)} aria-current={state === 'now' ? 'step' : undefined}
                aria-label={`${stone.label}${state === 'done' ? ', done today' : state === 'now' ? ', do this now' : ''}`}>
                <span className="tp-icon" aria-hidden="true">{stone.icon}</span>
                {state === 'done' && <span className="tp-tick" aria-hidden="true">✓</span>}
                {state === 'now' && id === 'feel' && path.feelAgain && <span className="tp-again" aria-hidden="true">↻</span>}
              </button>
              <span className="tp-label" aria-hidden="true">{stone.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── The arrow ─────────────────────────────────────────────────────────── */

type Side = 'left' | 'right' | 'top' | 'bottom';

/*
  HOW EACH STEP IS POINTED AT. The home page is painted edge to edge, so the
  rule is: never cover the next thing a child might tap.

    arrow  a swooping arrow from the first side, in order, where it and its
           word fit on screen without landing on another button. If no side is
           clear, it falls back to a tag.
    tag    the word itself, pinned to the target with a pointer: above it, or
           on a door (inside it, pointing at the door), where there is no free
           side to come from. A phone is all tags: there is no spare side.
*/
type Tag = 'top' | 'inside';
type Mode = { sides: Side[]; tag: Tag };
const MODES: Record<'wide' | 'narrow', Record<PathStepId, Mode>> = {
  wide: {
    feel: { sides: ['left', 'bottom', 'top', 'right'], tag: 'top' },
    practise: { sides: [], tag: 'inside' },
    diary: { sides: ['top', 'left', 'right', 'bottom'], tag: 'top' },
    play: { sides: ['right', 'top', 'left', 'bottom'], tag: 'top' },
  },
  narrow: {
    feel: { sides: [], tag: 'top' },
    practise: { sides: [], tag: 'top' },
    diary: { sides: [], tag: 'top' },
    play: { sides: [], tag: 'top' },
  },
};

/** The visible thing to point at: of everything marked for this step, the
    highest-ranked one that is actually on screen (a phone hides the shelf
    behind a button, so the button stands in for the door). */
function findTarget(world: HTMLElement, step: PathStepId): HTMLElement | null {
  let best: HTMLElement | null = null;
  let rank = -Infinity;
  world.querySelectorAll<HTMLElement>(`[data-guide="${step}"]`).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!el.getClientRects().length || r.width < 4 || r.height < 4 || el.closest('[hidden]')) return;
    const n = Number(el.dataset.guideRank ?? 0);
    if (n > rank) { rank = n; best = el; }
  });
  return best;
}

/** A door is drawn smaller than its button (the art is fitted, not stretched),
    so the halo goes round the drawing rather than round the empty cell. */
function drawnBox(el: HTMLElement): DOMRect {
  const r = el.getBoundingClientRect();
  const img = el.querySelector('img');
  if (!img || !img.naturalWidth || getComputedStyle(img).objectFit !== 'contain') return r;
  const box = img.getBoundingClientRect();
  const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  return new DOMRect(box.left + (box.width - w) / 2, box.top + (box.height - h) / 2, w, h);
}

interface Placed {
  w: number; h: number;
  halo: { x: number; y: number; w: number; h: number };
  /** Absent for a tag: the word is pinned on the target instead. */
  arrow?: { tip: { x: number; y: number }; side: Side; len: number };
  pill: { x: number; y: number; tag?: Tag };
}

interface Box { left: number; top: number; right: number; bottom: number }
const GAP = 10;
const PILL_H = 34;
const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** Everything a child might tap, or read as part of a control, in room coordinates. */
function obstaclesFor(world: HTMLElement, target: HTMLElement, wr: DOMRect): Box[] {
  const out: Box[] = [];
  world.querySelectorAll<HTMLElement>('button, a, .mg-steps li, .mg-greeting, .tp-strip').forEach((el) => {
    if (el === target || el.contains(target) || target.contains(el) || el.closest('.gd-layer')) return;
    const r = el.getBoundingClientRect();
    if (!el.getClientRects().length || r.width < 2 || r.height < 2) return;
    out.push({ left: r.left - wr.left, top: r.top - wr.top, right: r.right - wr.left, bottom: r.bottom - wr.top });
  });
  return out;
}

function placeArrow(world: HTMLElement, step: PathStepId, word: string): Placed | null {
  const target = findTarget(world, step);
  if (!target) return null;
  const wr = world.getBoundingClientRect();
  const tr = drawnBox(target);
  const t = { left: tr.left - wr.left, top: tr.top - wr.top, right: tr.right - wr.left, bottom: tr.bottom - wr.top };
  const W = wr.width;
  /* Only the part of the room on screen counts: on a wide window the painted
     room runs on below the fold. */
  const visTop = Math.max(0, -wr.top);
  const visBottom = Math.min(wr.height, window.innerHeight - wr.top);
  const len = Math.round(Math.min(100, Math.max(60, W * 0.065)));
  const pillW = word.length * 9 + 34;
  const halo = { x: t.left - 6, y: t.top - 6, w: t.right - t.left + 12, h: t.bottom - t.top + 12 };
  const cx = (t.left + t.right) / 2;
  const cy = (t.top + t.bottom) / 2;
  const mode = MODES[W < 761 ? 'narrow' : 'wide'][step];
  const blocks = mode.sides.length ? obstaclesFor(world, target, wr) : [];
  const onScreen = (b: Box) => b.left >= 4 && b.right <= W - 4 && b.top >= visTop + 4 && b.bottom <= visBottom - 4;

  for (const side of mode.sides) {
    const tip = side === 'left' ? { x: t.left - GAP, y: cy }
      : side === 'right' ? { x: t.right + GAP, y: cy }
      : side === 'top' ? { x: cx, y: t.top - GAP }
      : { x: cx, y: t.bottom + GAP };
    /* Where the tail lands (see ArrowShape: it swoops in from one side). */
    const bend = len * 0.42;
    const tail = side === 'left' ? { x: tip.x - len, y: tip.y - bend }
      : side === 'right' ? { x: tip.x + len, y: tip.y - bend }
      : side === 'top' ? { x: tip.x + bend, y: tip.y - len }
      : { x: tip.x - bend, y: tip.y + len };
    /* The word sits beyond the tail; from the left or right it can also sit
       on top of the tail when the room is narrow. */
    const spots = side === 'left' ? [{ x: tail.x - pillW - 2, y: tail.y - PILL_H / 2 }, { x: tail.x - pillW / 2, y: tail.y - PILL_H - 4 }]
      : side === 'right' ? [{ x: tail.x + 2, y: tail.y - PILL_H / 2 }, { x: tail.x - pillW / 2, y: tail.y - PILL_H - 4 }]
      : side === 'top' ? [{ x: tail.x - pillW / 2, y: tail.y - PILL_H - 2 }]
      : [{ x: tail.x - pillW / 2, y: tail.y + 2 }];
    const shaft: Box = {
      left: Math.min(tip.x, tail.x) - 4, right: Math.max(tip.x, tail.x) + 4,
      top: Math.min(tip.y, tail.y) - 4, bottom: Math.max(tip.y, tail.y) + 4,
    };
    for (const spot of spots) {
      const pill: Box = { left: spot.x, top: spot.y, right: spot.x + pillW, bottom: spot.y + PILL_H };
      if (!onScreen(pill) || !onScreen(shaft)) continue;
      if (blocks.some((b) => overlaps(b, pill) || overlaps(b, shaft))) continue;
      return { w: W, h: wr.height, halo, arrow: { tip, side, len }, pill: { x: Math.round(spot.x), y: Math.round(spot.y) } };
    }
  }

  /* No clear side: pin the word on the target itself, just above it with its
     pointer touching, or on it where the space above is another thing to tap
     (a door under a door; a phone's treasures, packed tile on tile). */
  const tag: Tag = target.matches('.mg-cabinet-door') || (W < 761 && target.matches('.tr')) ? 'inside' : mode.tag;
  const x = Math.min(Math.max(cx - pillW / 2, 6), W - pillW - 6);
  const y = tag === 'top' ? t.top - PILL_H - 9 : t.top + (t.bottom - t.top) * 0.66 - PILL_H / 2;
  return { w: W, h: wr.height, halo, pill: { x: Math.round(x), y: Math.round(y), tag } };
}

/** The arrow drawn pointing along +x and ending at (0,0), then turned to face its side. */
function ArrowShape({ side, len, tip }: { side: Side; len: number; tip: { x: number; y: number } }) {
  const b = len * 0.42;
  /* A swoop: in from above, dipping under the line, and arriving level, so the
     head (drawn flat along +x) sits square on the end of it. */
  const d = `M ${-len} ${-b} C ${-len * 0.72} ${b * 0.75}, ${-len * 0.4} 0, -12 0`;
  const turn = side === 'left' ? '' : side === 'right' ? ' scale(-1 1)' : side === 'top' ? ' rotate(90)' : ' rotate(-90)';
  const head = 'M 0 0 L -19 -13 Q -14 0 -19 13 Z';
  return (
    <g transform={`translate(${tip.x} ${tip.y})${turn}`}>
      <g className="gd-nudge">
        <path className="gd-glow" d={d} />
        <path className="gd-line" d={d} />
        <path className="gd-trail" d={d} />
        <path className="gd-head" d={head} />
      </g>
    </g>
  );
}

export function GuideArrow({ worldRef, path, still }: { worldRef: RefObject<HTMLElement | null>; path: DayPath; still: boolean }) {
  const word = arrowWord(path);
  const step = path.current;
  const [placed, setPlaced] = useState<Placed | null>(null);

  /* A passive effect, not a layout one: the room's ref is attached after this
     child's layout effects run, so a layout effect would find no room at all. */
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    let frame = 0;
    let last = '';
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = placeArrow(world, step, word);
        const key = next ? JSON.stringify(next) : '';
        if (key !== last) { last = key; setPlaced(next); }
      });
    };
    measure();
    /* Doors open, panels unfold on a phone, the page scrolls: look again often
       enough that the arrow never points at where something used to be. */
    const every = setInterval(measure, 500);
    const resize = new ResizeObserver(measure);
    resize.observe(world);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(every);
      resize.disconnect();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [worldRef, step, word]);

  if (!placed) return null;
  const { halo } = placed;
  return (
    <div className={`gd-layer ${still ? 'gd-still' : ''}`} aria-hidden="true">
      <svg className="gd-svg" width={placed.w} height={placed.h} viewBox={`0 0 ${placed.w} ${placed.h}`}>
        <rect key={`halo-${step}`} className="gd-halo" x={halo.x} y={halo.y} width={halo.w} height={halo.h}
          rx={Math.min(26, halo.h / 2)} />
        {placed.arrow && <ArrowShape key={`arrow-${step}`} side={placed.arrow.side} len={placed.arrow.len} tip={placed.arrow.tip} />}
      </svg>
      <span key={`pill-${step}-${word}`} className={`gd-pill ${placed.pill.tag ? `gd-tag gd-tag-${placed.pill.tag}` : ''}`}
        style={{ left: placed.pill.x, top: placed.pill.y }}>{word}</span>
    </div>
  );
}
