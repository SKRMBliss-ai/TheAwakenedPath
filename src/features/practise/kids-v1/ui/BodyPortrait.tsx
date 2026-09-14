import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from './quiet';
import type { BodyZoneId } from './bodyZones';

/**
 * THE BODY STEP'S TAP TARGET — the boy the room already paints, made tappable.
 *
 * Body Detective's room art paints a glowing blue hologram of a boy, examined
 * by a Sherlock-styled detective boy standing beside him. Until now that
 * hologram was pure background — the actual "where do you feel it?" control
 * was a SEPARATE abstract translucent shape (see git history on this file for
 * the earlier ui/bodyMap.tsx), drawn in its own small box in the scrolling
 * content column, nowhere near either painted figure. Two boy-shaped things
 * on the screen and only one of them did anything, so children reliably
 * tapped whichever one they noticed first — usually the big detective in the
 * foreground — and nothing happened.
 *
 * TWO THINGS WERE TRIED HERE BEFORE THIS, both wrong, for the record:
 *
 *   1. Cropping the hologram out of the room art as its own sprite and
 *      dropping it into the content column. That put a SECOND copy of the
 *      same boy on screen at the same time as the room's own painted one —
 *      better than an abstract shape, but now there were visibly two
 *      hologram boys.
 *
 *   2. An inline <svg> sized to the painting's own 1024×1536 with CSS
 *      `object-fit: cover` on it, on the theory that two elements with the
 *      same intrinsic ratio and the same object-fit rule in the same
 *      container always crop identically. They don't, or at least didn't
 *      here — `object-fit` is defined for replaced elements, and an inline
 *      `<svg>` sitting directly in the document is not reliably treated as
 *      one the way an `<img>` is. Rendered and measured, the tap zones sat
 *      several hundred pixels off the boy.
 *
 * WHAT ACTUALLY WORKS: doing the `object-fit: cover` arithmetic by hand.
 * RoomScene paints the room art full-bleed with real `object-fit: cover` on
 * a real `<img>`, which crops a different amount off the top/bottom or the
 * sides depending on the viewport's shape. `useCoverRect` below measures the
 * SAME container this component shares with that `<img>` (via ResizeObserver,
 * so it stays correct across every resize) and computes the exact box a
 * 1024×1536 image would occupy inside it under `cover` — scale, then centred
 * offset. An SVG viewBox="0 0 1024 1536" is then sized and positioned to
 * that exact box, so its internal coordinates land on the same pixel of the
 * painting underneath it that they're measured against, on every screen.
 */

export type { BodyZoneId };

/** The full painting's own pixel size — every zone below is measured in
 *  these, straight off public/rooms/body.webp with a grid overlaid on it. */
const ART_W = 1024;
const ART_H = 1536;

interface CoverRect { width: number; height: number; left: number; top: number }

/**
 * The box a `naturalW`×`naturalH` image would occupy inside `ref`'s element
 * under `object-fit: cover` — recomputed on every resize via
 * ResizeObserver, which is what keeps this correct as a window is dragged
 * rather than only on the size it happened to mount at.
 */
function useCoverRect(
  ref: React.RefObject<HTMLElement | null>,
  naturalW: number,
  naturalH: number,
): CoverRect | null {
  const [rect, setRect] = useState<CoverRect | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;
      const scale = Math.max(cw / naturalW, ch / naturalH);
      const width = naturalW * scale;
      const height = naturalH * scale;
      setRect({ width, height, left: (cw - width) / 2, top: (ch - height) / 2 });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, naturalW, naturalH]);

  return rect;
}

interface Zone {
  id: BodyZoneId;
  /** Where the suggestion ring centres, in the painting's own pixels. */
  cx: number;
  cy: number;
  /** The tap target(s). Two entries where a zone has a left and a right. */
  targets: { cx: number; cy: number; rx: number; ry: number }[];
}

/**
 * Measured off public/rooms/body.webp directly, not eyeballed against the
 * rendered page. Re-paint the room and these all move; re-measure rather
 * than nudging them.
 */
const ZONES: Zone[] = [
  { id: 'head',      cx: 735, cy: 400, targets: [{ cx: 735, cy: 400, rx: 100, ry: 130 }] },
  { id: 'throat',    cx: 735, cy: 500, targets: [{ cx: 735, cy: 500, rx: 55,  ry: 38  }] },
  { id: 'shoulders', cx: 735, cy: 540, targets: [
      { cx: 655, cy: 540, rx: 55, ry: 42 },
      { cx: 815, cy: 540, rx: 55, ry: 42 },
  ] },
  { id: 'chest',     cx: 730, cy: 622, targets: [{ cx: 730, cy: 622, rx: 92, ry: 68 }] },
  { id: 'tummy',     cx: 725, cy: 772, targets: [{ cx: 725, cy: 772, rx: 92, ry: 82 }] },
  { id: 'hands',     cx: 731, cy: 818, targets: [
      { cx: 602, cy: 818, rx: 42, ry: 68 },
      { cx: 860, cy: 818, rx: 42, ry: 68 },
  ] },
  { id: 'legs',      cx: 733, cy: 930, targets: [
      { cx: 676, cy: 930, rx: 56, ry: 112 },
      { cx: 790, cy: 930, rx: 56, ry: 112 },
  ] },
];

interface Ripple { id: number; cx: number; cy: number }
let rippleSeq = 0;

/**
 * The invisible layer. Rendered as a SIBLING of RoomScene, sharing its exact
 * full-bleed container — not inside the scrolling content column, which is
 * nowhere near where the painting actually put the boy.
 */
export function BodyPortrait({
  accent,
  selected,
  suggested,
  onToggle,
}: {
  accent: string;
  selected: Set<BodyZoneId>;
  suggested: BodyZoneId | null;
  onToggle: (zone: BodyZoneId) => void;
}) {
  const m = useMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const cover = useCoverRect(containerRef, ART_W, ART_H);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const tap = (zone: BodyZoneId, cx: number, cy: number) => {
    onToggle(zone);
    const id = rippleSeq++;
    setRipples((r) => [...r, { id, cx, cy }]);
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 850);
  };

  const suggestedZone = suggested ? ZONES.find((z) => z.id === suggested) : null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-10">
      {/* Nothing renders until the container has been measured once — a
          frame of zones sized to a 0×0 box is worse than a frame of nothing. */}
      {cover && (
        <motion.svg
          viewBox={`0 0 ${ART_W} ${ART_H}`}
          className="absolute"
          style={{ left: cover.left, top: cover.top, width: cover.width, height: cover.height }}
          animate={m.loop ? { opacity: [0.9, 1, 0.9] } : undefined}
          transition={m.loop ? { ...m.loop, duration: 5.6 } : undefined}
        >
          <defs>
            <radialGradient id="portraitZoneGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
              <stop offset="70%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Lit places. Drawn under the tap targets so a tap always lands. */}
          {ZONES.filter((z) => selected.has(z.id)).map((z) => (
            <g key={`glow-${z.id}`}>
              {z.targets.map((t, i) => (
                <motion.ellipse
                  key={i}
                  cx={t.cx}
                  cy={t.cy}
                  rx={t.rx * 1.05}
                  ry={t.ry * 1.05}
                  fill="url(#portraitZoneGlow)"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ transformOrigin: `${t.cx}px ${t.cy}px` }}
                />
              ))}
            </g>
          ))}

          {suggestedZone && !selected.has(suggestedZone.id) && (
            <motion.circle
              cx={suggestedZone.cx}
              cy={suggestedZone.cy}
              r={Math.max(suggestedZone.targets[0].rx, suggestedZone.targets[0].ry) * 1.15}
              fill="none"
              stroke={accent}
              strokeWidth={3}
              strokeDasharray="6 8"
              animate={{ opacity: [0.2, 0.55, 0.2] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            />
          )}

          {ZONES.map((z) =>
            z.targets.map((t, i) => (
              <ellipse
                key={`${z.id}-${i}`}
                cx={t.cx}
                cy={t.cy}
                rx={t.rx}
                ry={t.ry}
                fill="transparent"
                className="pointer-events-auto"
                onClick={() => tap(z.id, t.cx, t.cy)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={z.id}
                aria-pressed={selected.has(z.id)}
              />
            )),
          )}

          <AnimatePresence>
            {ripples.map((r) => (
              <motion.circle
                key={r.id}
                cx={r.cx}
                cy={r.cy}
                r={10}
                fill="none"
                stroke={accent}
                strokeWidth={4}
                initial={{ opacity: 0.85, r: 10 }}
                animate={{ opacity: 0, r: 90 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        </motion.svg>
      )}
    </div>
  );
}
