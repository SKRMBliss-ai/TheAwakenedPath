import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * A PLAIN DRAWING SURFACE — pointer-driven freehand marks on a paper-warm
 * background, nothing more.
 *
 * This is a primitive, not a screen: it knows how to take a colour and put
 * ink where a finger goes, and how to hand that ink back as a PNG data URL
 * when asked. It has no opinion about why a child is drawing, what happens
 * to the picture afterwards, or whether drawing was offered at all — that
 * belongs to whoever embeds this (see DeepDive.tsx's DrawInvite for the
 * "would you like to?" wrapper around it).
 *
 * POINTER EVENTS, not separate touch/mouse handlers, because a single set
 * of handlers covers finger, mouse and stylus identically — the usual
 * source of "works on desktop, breaks on the phone" bugs in a drawing
 * surface is exactly this split, and Pointer Events remove the split
 * entirely.
 *
 * SIZED ONCE, ON MOUNT. Re-measuring on every resize and rescaling the
 * backing store would either stretch the child's marks or throw them away;
 * neither is acceptable mid-drawing. A phone rotated mid-picture keeps the
 * canvas at its original size rather than distorting it — a minor visual
 * cost against actually losing what was drawn.
 */

export interface DrawingCanvasHandle {
  clear: () => void;
  toDataURL: () => string;
  isBlank: () => boolean;
}

/** Warm and paper-like, not the app's own dark chrome — a drawing wants to
 *  feel like it's on a page, not floating in the room's night sky. */
const PAPER = '#FBF3E4';

/** Chunky enough for a small finger; this is not a precision tool. */
const BRUSH = 7;

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, { color: string; height?: number }>(
  function DrawingCanvas({ color, height = 208 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const hasDrawnRef = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    // Mirrored into a ref rather than read from the `color` closure directly:
    // the pointer handlers below are plain DOM-event callbacks, not React
    // state, so they need a stable place to read the CURRENT colour from
    // without themselves being redefined (and re-bound) on every swatch tap.
    const colorRef = useRef(color);
    useEffect(() => { colorRef.current = color; }, [color]);

    const paintPaper = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      // Capped at 2x — a crisp line doesn't need more, and every extra
      // device pixel here is more PNG to fit in localStorage later.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      paintPaper(ctx, rect.width, rect.height);
      ctxRef.current = ctx;
    }, []);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        paintPaper(ctx, rect.width, rect.height);
        hasDrawnRef.current = false;
      },
      toDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
      isBlank: () => !hasDrawnRef.current,
    }));

    const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const dot = (ctx: CanvasRenderingContext2D, p: { x: number; y: number }) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, BRUSH / 2, 0, Math.PI * 2);
      ctx.fillStyle = colorRef.current;
      ctx.fill();
    };

    return (
      <canvas
        ref={canvasRef}
        // touch-action: none is load-bearing — without it, a finger drawing
        // a stroke also scrolls the page underneath it, which on a phone
        // makes drawing anything but a straight vertical line impossible.
        style={{ width: '100%', height, touchAction: 'none', borderRadius: 18, display: 'block' }}
        onPointerDown={(e) => {
          e.preventDefault();
          const canvas = canvasRef.current;
          const ctx = ctxRef.current;
          if (!canvas || !ctx) return;
          canvas.setPointerCapture(e.pointerId);
          const p = posFromEvent(e);
          lastPoint.current = p;
          // A tap with no drag still has to leave a mark — otherwise a
          // child dotting in eyes or full stops finds nothing happens.
          dot(ctx, p);
          hasDrawnRef.current = true;
        }}
        onPointerMove={(e) => {
          const ctx = ctxRef.current;
          const last = lastPoint.current;
          if (!ctx || !last) return;
          const p = posFromEvent(e);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = BRUSH;
          ctx.strokeStyle = colorRef.current;
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          lastPoint.current = p;
        }}
        onPointerUp={(e) => {
          lastPoint.current = null;
          try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch { /* already released */ }
        }}
        onPointerLeave={() => { lastPoint.current = null; }}
      />
    );
  },
);
