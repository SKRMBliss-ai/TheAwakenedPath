import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  STICKERS, STICKER_BY_ID, STICKER_GROUPS, leftLabel,
  type NextSticker, type StickerDef, type StickerShape, type StickerStats,
} from '../../../kids/stickers';
import './Stickers.css';

/*
  THE STICKERS' LOOK: DIE-CUT, WHITE-EDGED, A LITTLE GLOSSY.

  A sticker is a coloured shape with a white border all the way round, a soft
  highlight across the top and one emoji in the middle. The shapes (circle,
  flower, star, shield...) are drawn here rather than shipped as images, so the
  whole set is one component and a new sticker is a line in the catalogue.
  The white border is the same shape drawn thicker underneath, which is what
  keeps it clean on shapes made of several circles.

  A sticker not yet earned is the same shape as a dashed outline with a
  question mark in it: the child can see what is still to come and the shape of
  it, but not what it is.
*/

function starPoints(n = 5, outer = 45, inner = 25): string {
  const points: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    points.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return points.join(' ');
}
const STAR = starPoints();
const PETALS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return { cx: 50 + 29 * Math.cos(a), cy: 50 + 29 * Math.sin(a) };
});

type Paint = Record<string, string | number>;

function Shape({ shape, paint }: { shape: StickerShape; paint: Paint }) {
  switch (shape) {
    case 'circle': return <circle cx="50" cy="50" r="40" {...paint} />;
    case 'squircle': return <rect x="10" y="10" width="80" height="80" rx="26" {...paint} />;
    case 'star': return <polygon points={STAR} {...paint} />;
    case 'badge': return <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" {...paint} />;
    case 'heart':
      return <path d="M50 86C23 66 10 49 10 34 10 20 20 11 33 11c8 0 14 4 17 10 3-6 9-10 17-10 13 0 23 9 23 23 0 15-13 32-40 52Z" {...paint} />;
    case 'shield':
      return <path d="M50 9 87 22v25c0 21-15 35-37 45C28 82 13 68 13 47V22Z" {...paint} />;
    case 'flower':
      return <g {...paint}>{PETALS.map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r="18" />)}<circle cx="50" cy="50" r="32" /></g>;
    case 'cloud':
      return <g {...paint}><circle cx="30" cy="58" r="19" /><circle cx="49" cy="40" r="23" /><circle cx="71" cy="52" r="21" /><rect x="22" y="54" width="58" height="26" rx="13" /></g>;
  }
}

export function StickerArt({ sticker, size = 72, locked = false, className = '' }: {
  sticker: StickerDef; size?: number; locked?: boolean; className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const [top, bottom] = sticker.colors;
  const shine = !!sticker.rare && !locked;
  return (
    <span
      className={`stk ${locked ? 'stk-locked' : ''} ${shine ? 'stk-rare' : ''} ${className}`}
      style={{ '--stk': `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      <svg className="stk-svg" viewBox="0 0 100 100" focusable="false">
        <defs>
          <linearGradient id={`g${uid}`} gradientUnits="userSpaceOnUse" x1="50" y1="8" x2="50" y2="92">
            <stop offset="0" stopColor={top} />
            <stop offset="1" stopColor={bottom} />
          </linearGradient>
          <clipPath id={`c${uid}`}><Shape shape={sticker.shape} paint={{}} /></clipPath>
          {locked && (
            <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
              <rect x="-10" y="-10" width="120" height="120" fill="#fff" />
              <Shape shape={sticker.shape} paint={{ fill: '#000' }} />
            </mask>
          )}
        </defs>
        {locked ? (
          <>
            <g opacity=".08"><Shape shape={sticker.shape} paint={{ fill: '#fff' }} /></g>
            {/* Only the outside of the stroke shows, so a shape built from several circles keeps one outline. */}
            <g mask={`url(#m${uid})`}>
              <Shape shape={sticker.shape} paint={{ fill: 'none', stroke: '#ffffff66', strokeWidth: 5, strokeDasharray: '5 5' }} />
            </g>
          </>
        ) : (
          <>
            <Shape shape={sticker.shape} paint={{ fill: '#fff', stroke: '#fff', strokeWidth: 9, strokeLinejoin: 'round' }} />
            <Shape shape={sticker.shape} paint={{ fill: `url(#g${uid})` }} />
            <g clipPath={`url(#c${uid})`}>
              <ellipse cx="38" cy="22" rx="34" ry="15" fill="#fff" opacity=".32" transform="rotate(-18 38 22)" />
              <ellipse cx="50" cy="100" rx="48" ry="22" fill="#000" opacity=".13" />
              {shine && <rect className="stk-shine" x="-40" y="-10" width="22" height="120" fill="#fff" opacity=".5" />}
            </g>
          </>
        )}
      </svg>
      <span className="stk-glyph">{locked ? '?' : sticker.glyph}</span>
    </span>
  );
}

/* ── A sticker arriving ───────────────────────────────────────────────────── */

const SPARKS = Array.from({ length: 10 }, (_, i) => i);

/**
 * Whatever has just been earned, popping out under the points — one sticker
 * with its name and what it was for, or up to three side by side when a
 * choice earns several at once, so the sticker for the choice a child has just
 * made never waits behind the ones before it. It never covers the board or the
 * chests, takes nothing to dismiss and goes by itself after a few seconds: the
 * point of it is the moment, not another thing to press.
 */
export function StickerPop({ stickers, more, onDone, still }: {
  stickers: StickerDef[]; more: number; onDone: () => void; still: boolean;
}) {
  const key = stickers.map((s) => s.id).join(',');
  useEffect(() => {
    const timer = window.setTimeout(onDone, 4600);
    return () => window.clearTimeout(timer);
  }, [key, onDone]);

  const one = stickers.length === 1 ? stickers[0] : null;
  const total = stickers.length + more;

  return (
    <motion.div
      className="stk-pop"
      role="status"
      onClick={onDone}
      initial={{ opacity: 0, y: still ? 0 : -14, scale: still ? 1 : 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: still ? 0 : -10, scale: still ? 1 : 0.88, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 250, damping: 21, delay: still ? 0 : 0.25 }}
    >
      <span className="stk-pop-glow" aria-hidden="true" />
      <span className="stk-pop-art">
        {stickers.map((sticker, i) => (
          <motion.span
            key={sticker.id}
            className="stk-pop-one"
            style={{ marginLeft: i ? -22 : 0, zIndex: stickers.length - i }}
            initial={still ? false : { scale: 0, rotate: -34 }}
            animate={{ scale: 1, rotate: one ? -3 : (i - 1) * 7 }}
            transition={{ type: 'spring', stiffness: 190, damping: 11, delay: still ? 0 : 0.4 + i * 0.15 }}
          >
            <StickerArt sticker={sticker} size={one ? 92 : 74} />
          </motion.span>
        ))}
      </span>
      <span className="stk-pop-text">
        <small>{one ? 'A new sticker for your book!' : `${total} new stickers for your book!`}</small>
        <b className={one ? '' : 'stk-pop-names'}>{stickers.map((s) => s.name).join(', ')}</b>
        {one && <em>{one.how}</em>}
        {more > 0 && <i>+{more} more waiting in your book</i>}
      </span>
      {!still && (
        <span className="stk-pop-sparks" aria-hidden="true">
          {SPARKS.map((i) => <i key={i} style={{ '--a': `${i * 36}deg`, '--d': `${(i % 3) * 0.06}s` } as CSSProperties} />)}
        </span>
      )}
    </motion.div>
  );
}

/* ── The teaser under the points ──────────────────────────────────────────── */

/**
 * The way into the book, and the reason to keep playing: the next sticker as a
 * mystery shape, how close it is, and how many choices away.
 */
export function StickerHud({ next, count, onOpen, bump }: {
  next: NextSticker | null; count: number; onOpen: () => void; bump: number;
}) {
  const fraction = next ? next.have / next.sticker.need : 1;
  const where = next ? `${leftLabel(next)} to your next sticker` : 'Every sticker found';
  return (
    <button
      className="stk-hud"
      onClick={onOpen}
      aria-label={`Open my sticker book. ${count} of ${STICKERS.length} stickers collected. ${where}.`}
    >
      <span className="stk-hud-next">
        <StickerArt sticker={next?.sticker ?? STICKERS[0]} size={48} locked={!!next} />
      </span>
      <span className="stk-hud-body">
        <span className="stk-hud-head">
          <b>Sticker book</b>
          <small key={bump} className="stk-hud-count">{count}/{STICKERS.length}</small>
        </span>
        <span className="stk-hud-meter" aria-hidden="true"><i style={{ width: `${Math.max(6, fraction * 100)}%` }} /></span>
        <span className="stk-hud-note">{next ? `${leftLabel(next)} to a new sticker` : 'Every sticker found!'}</span>
      </span>
    </button>
  );
}

/* ── Stickers earned on a run, shown on the run's own card ────────────────── */

export function StickerRow({ ids, total = ids.length }: { ids: string[]; total?: number }) {
  const stickers = ids.map((id) => STICKER_BY_ID[id]).filter(Boolean);
  if (!stickers.length) return null;
  return (
    <div className="stk-row" aria-label="Stickers you earned">
      <p>{total === 1 ? 'A new sticker for your book' : `${total} new stickers for your book`}</p>
      <ul>
        {stickers.map((sticker, i) => (
          <motion.li
            key={sticker.id}
            initial={{ scale: 0, rotate: -24, opacity: 0 }}
            animate={{ scale: 1, rotate: ((i % 3) - 1) * 4, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.35 + i * 0.16 }}
          >
            <StickerArt sticker={sticker} size={62} />
            <span className="stk-row-name">{sticker.name}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ── The book ─────────────────────────────────────────────────────────────── */

/** A small turn each sticker keeps, so the page reads as stuck down by hand. */
function tilt(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 13) - 6;
}

export function StickerBook({ owned, stats, onClose, still }: {
  owned: string[]; stats: StickerStats; onClose: () => void; still: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const newest = owned.slice(-2);
  const fraction = owned.length / STICKERS.length;

  return (
    <motion.div
      className="stk-veil"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: still ? 0.1 : 0.3 }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="stk-book"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stk-book-title"
        initial={{ opacity: 0, y: still ? 0 : 18, scale: still ? 1 : 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: still ? 0 : 10, scale: still ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <header className="stk-book-head">
          <div className="stk-book-title">
            <h2 id="stk-book-title">My Sticker Book</h2>
            <p>{owned.length} of {STICKERS.length} stickers</p>
          </div>
          <span className="stk-book-meter" aria-hidden="true"><i style={{ width: `${Math.max(3, fraction * 100)}%` }} /></span>
          <button ref={closeRef} className="stk-book-close" onClick={onClose} aria-label="Close sticker book">✕</button>
        </header>

        <div className="stk-book-body">
          {STICKER_GROUPS.map((group) => {
            const stickers = STICKERS.filter((s) => s.group === group.id);
            const got = stickers.filter((s) => owned.includes(s.id)).length;
            return (
              <section key={group.id} className="stk-sec" aria-label={group.title}>
                <h3>
                  <span className="stk-sec-dot" style={{ background: `linear-gradient(${group.colors[0]}, ${group.colors[1]})` }} aria-hidden="true" />
                  {group.title}
                  <small>{got}/{stickers.length}</small>
                </h3>
                <ul className="stk-grid">
                  {stickers.map((sticker) => {
                    const have = owned.includes(sticker.id);
                    const progress = Math.min(sticker.have(stats), sticker.need);
                    return (
                      <li
                        key={sticker.id}
                        className={`stk-cell ${have ? 'is-earned' : 'is-locked'}`}
                        aria-label={have ? `${sticker.name}. Collected.` : `Not found yet. ${sticker.how}`}
                      >
                        {have && newest.includes(sticker.id) && <span className="stk-new" aria-hidden="true">New!</span>}
                        <span className="stk-cell-art" style={{ transform: have ? `rotate(${tilt(sticker.id)}deg)` : undefined }}>
                          <StickerArt sticker={sticker} size={76} locked={!have} />
                        </span>
                        {have ? (
                          <b>{sticker.name}</b>
                        ) : (
                          <>
                            <small>{sticker.how}</small>
                            <span className="stk-cell-count" aria-hidden="true">{progress} of {sticker.need}</span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
