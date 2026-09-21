/**
 * Wipe the example story printed on the Story Lab's open book.
 *
 * story-book-open.png comes from the handoff with a sample story set across
 * its pages ("Story my mind made: / They don't want me to be part of it."),
 * and the panel renders the CHILD'S own story over the top of it — so the two
 * sit on each other and neither can be read. It is the same rule the
 * Reflection Path handoff states outright: the plate is a frame, never a
 * carrier for a child's words.
 *
 * The page is a smooth cream gradient and the lettering is a dark, blue-
 * dominant ink, so the two separate cleanly by colour. Each row of the page
 * area gets the median of its own un-inked pixels, and every inked pixel in
 * that row is replaced with it — which follows the gradient down the page and
 * leaves the gutter shadow, the gold corners and the sparkles untouched,
 * because none of those are blue ink and most sit outside the page window.
 *
 * Idempotent: a book with no ink left on it comes back unchanged.
 *
 * Run: node scripts/clear-story-book-text.mjs
 */
import sharp from 'sharp';
import { rename } from 'node:fs/promises';

const FILE = 'public/mind-gym/story-lab/story-book-open.png';

/* The page window, as a fraction of the plate — inside the covers and above
   the fanned page block, so the wipe can never reach the binding or the gold. */
const X0 = 0.145, X1 = 0.875, Y0 = 0.175, Y1 = 0.70;

const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;

const isInk = (r, g, b) => b > r + 22 && r < 190 && (r + g + b) / 3 < 175;

const x0 = Math.round(w * X0), x1 = Math.round(w * X1);
const y0 = Math.round(h * Y0), y1 = Math.round(h * Y1);

let painted = 0;
for (let y = y0; y < y1; y++) {
  // The page colour on this row, taken from the pixels that are not lettering.
  const rs = [], gs = [], bs = [];
  for (let x = x0; x < x1; x++) {
    const i = (y * w + x) * 4;
    if (data[i + 3] < 200) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (isInk(r, g, b)) continue;
    rs.push(r); gs.push(g); bs.push(b);
  }
  if (rs.length < 40) continue;
  const mid = (a) => { a.sort((m, n) => m - n); return a[a.length >> 1]; };
  const pr = mid(rs), pg = mid(gs), pb = mid(bs);

  for (let x = x0; x < x1; x++) {
    const i = (y * w + x) * 4;
    if (data[i + 3] < 200) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (!isInk(r, g, b)) continue;
    data[i] = pr; data[i + 1] = pg; data[i + 2] = pb;
    painted++;
  }
}

/*
  THE GHOST, AND WHY A SECOND PASS IS NEEDED.

  Replacing the ink alone leaves the lettering embossed on the page: each glyph
  is drawn with a pale cream highlight and a soft drop shadow, and neither is
  blue, so neither matches isInk. Chasing them by colour would mean a threshold
  loose enough to eat the gutter shading too.

  Inside the text block there is nothing but page, so that block is simply
  repainted: every row is filled with a gradient interpolated between the page
  colour just outside the block on each side. That keeps the page's vertical
  warmth and its left-to-right falloff, and takes the glyphs, their highlights
  and their shadows with one stroke.
*/
const bx0 = Math.round(w * 0.205), bx1 = Math.round(w * 0.80);
const by0 = Math.round(h * 0.285), by1 = Math.round(h * 0.645);
const sample = (x, y) => { const i = (y * w + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

for (let y = by0; y < by1; y++) {
  const L = sample(Math.max(0, bx0 - 12), y);
  const R = sample(Math.min(w - 1, bx1 + 12), y);
  const span = bx1 - bx0;
  for (let x = bx0; x < bx1; x++) {
    const i = (y * w + x) * 4;
    if (data[i + 3] < 200) continue;
    const t = (x - bx0) / span;
    data[i] = Math.round(L[0] + (R[0] - L[0]) * t);
    data[i + 1] = Math.round(L[1] + (R[1] - L[1]) * t);
    data[i + 2] = Math.round(L[2] + (R[2] - L[2]) * t);
  }
}

if (!painted) {
  console.log('No lettering found — the book is already clear.');
} else {
  /* A light blur over the wiped window only, so the anti-aliased haloes left
     around each glyph melt into the page instead of ghosting. */
  const window = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
    .blur(1.6)
    .toBuffer();

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .composite([{ input: window, raw: { width: x1 - x0, height: y1 - y0, channels: 4 }, left: x0, top: y0 }])
    .png()
    .toFile(FILE + '.tmp');
  await rename(FILE + '.tmp', FILE);
  console.log(`Cleared ${painted} inked pixels from the page.`);
}
