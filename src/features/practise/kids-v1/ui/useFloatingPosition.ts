import { useCallback, useRef, useState } from 'react';

/**
 * LETS A CHILD PICK THEIR OWN SPOT — and keeps it.
 *
 * Wrap any room element (the boy, a chest, a badge) with the handlers this
 * returns and it becomes draggable anywhere inside its room, and wherever it
 * was left is where it comes back next time — this session, tomorrow, on
 * any device signed into the same browser, because the position is written
 * to localStorage rather than component state.
 *
 * Stored as a PERCENTAGE of the room's own box, not pixels, so a saved spot
 * still makes sense after a resize or on a different screen size — "a third
 * of the way across, a quarter of the way down" survives; "412px, 90px"
 * would not.
 *
 * One shared localStorage key holds every element's position, keyed by the
 * id the caller passes in (e.g. "games-room:boy"), so every room and every
 * draggable thing in it can use this same hook without colliding.
 */

const STORE_KEY = 'mind-gym-floating-positions:v1';

export type FloatPos = { xPct: number; yPct: number };

type Store = Record<string, FloatPos>;

function readStore(): Store {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Store; } catch { return {}; }
}

function writeOne(id: string, pos: FloatPos) {
  try {
    const store = readStore();
    store[id] = pos;
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch { /* a lost drag is not worth breaking the room over */ }
}

/** The room ancestor a dragged element's percentage is measured against. */
const ROOM_SELECTOR = '[data-floating-room]';

export function useFloatingPosition(id: string, defaultPos: FloatPos) {
  const [pos, setPos] = useState<FloatPos>(() => readStore()[id] ?? defaultPos);
  const dragging = useRef(false);
  const elRef = useRef<HTMLElement | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    dragging.current = true;
    elRef.current = e.currentTarget;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('gr-floating-drag');
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const room = e.currentTarget.closest(ROOM_SELECTOR) as HTMLElement | null;
    const box = (room ?? document.body).getBoundingClientRect();
    if (!box.width || !box.height) return;
    const xPct = Math.min(94, Math.max(0, ((e.clientX - box.left) / box.width) * 100));
    const yPct = Math.min(94, Math.max(0, ((e.clientY - box.top) / box.height) * 100));
    setPos({ xPct, yPct });
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.classList.remove('gr-floating-drag');
    setPos((current) => { writeOne(id, current); return current; });
  }, [id]);

  return {
    pos,
    /** Spread onto the draggable element. Includes an inline `left`/`top`
        so callers don't have to remember the percentage-to-style step. */
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      style: { left: `${pos.xPct}%`, top: `${pos.yPct}%` } as React.CSSProperties,
    },
  };
}
