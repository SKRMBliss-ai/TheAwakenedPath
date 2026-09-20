/**
 * Clean the Reflection Path handoff art for compositing into a scene.
 *
 * MindGym_Reflection_Path_Implementation_Pack ships its "production_assets" as
 * untrimmed slices off the contact sheet. Two things come with that, and both
 * shipped into the room:
 *
 *   1. Every plate carries its own filename printed across the bottom
 *      ("plant_pot.png"), plus a sliver of the caption belonging to the tile
 *      above it. Dropped into the scene these render as literal text floating
 *      in mid-air — visible in the corner of the Reflection Room.
 *
 *   2. The tiles are not cut-outs. They sit on the sheet's flat white, so
 *      compositing one over the room paints a white card behind the object
 *      rather than the object alone.
 *
 * So each plate gets two passes. First the background is lifted: a flood fill
 * inward from the edges clears anything near-white that is CONNECTED to the
 * border, which takes the sheet's backing without touching white that belongs
 * to the art (a shirt, a cloud, the glow inside a lantern) because that white
 * is enclosed by colour.
 *
 * Then the plate is cropped to its artwork. Colour is no use for finding that
 * edge — the sheet sets its labels in the same dark browns the pots and
 * lanterns are painted in — but the sheet does leave a clear gutter of empty
 * pixels around every tile. So the rows are split into bands wherever the ink
 * stops, and the band carrying the most of it wins; the filename underneath
 * and the sliver of the caption above are each their own, far smaller band.
 * The same pass runs left-to-right, which takes the strip of whatever stood
 * beside the tile on the sheet.
 *
 * Idempotent: a plate that is already clean is left exactly as it is.
 *
 * Run: node scripts/trim-reflection-captions.mjs
 */
import sharp from 'sharp';
import { readdir, rename } from 'node:fs/promises';
import path from 'node:path';

const DIR = 'public/mind-gym/reflection';

/** Near-white enough to be the contact sheet's backing. */
const isBacking = (r, g, b) => r > 228 && g > 228 && b > 228;

/**
 * Clear the sheet's white backing, working inward from the border so that
 * white enclosed by artwork survives.
 */
function liftBackground(data, w, h) {
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    seen[p] = 1;
    const i = p * 4;
    if (data[i + 3] < 24) { stack.push(p); return; }      // already transparent
    if (!isBacking(data[i], data[i + 1], data[i + 2])) return;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    const i = p * 4;
    if (data[i + 3] !== 0) { data[i + 3] = 0; cleared++; }
    const x = p % w, y = (p / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return cleared;
}

/** How many pixels in this row are actually drawn on. */
function inkedPixels(data, w, y) {
  let n = 0;
  for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] >= 40) n++;
  return n;
}

/**
 * The vertical span the artwork occupies.
 *
 * Colour cannot separate a caption from the art here — the sheet sets its
 * labels in the same dark browns the pots and lanterns are painted in, so
 * "is this pixel saturated" says yes to both. What does separate them is that
 * the sheet leaves a clear run of empty rows between a tile and its label.
 *
 * So the rows are split into bands wherever they go blank, and the band
 * carrying the most ink wins. A filename underneath and the sliver of the
 * caption belonging to the tile above are each their own, far smaller band,
 * and both fall outside the keeper.
 */
function artBand(data, w, h) {
  const ink = Array.from({ length: h }, (_, y) => inkedPixels(data, w, y));
  const blank = Math.max(1, Math.round(w * 0.006));
  const bands = [];
  let start = -1;
  for (let y = 0; y < h; y++) {
    const on = ink[y] > blank;
    if (on && start < 0) start = y;
    if (!on && start >= 0) { bands.push([start, y - 1]); start = -1; }
  }
  if (start >= 0) bands.push([start, h - 1]);
  if (!bands.length) return [0, h - 1];

  let best = bands[0], bestInk = -1;
  for (const [a, b] of bands) {
    let total = 0;
    for (let y = a; y <= b; y++) total += ink[y];
    if (total > bestInk) { bestInk = total; best = [a, b]; }
  }
  return best;
}

/** artBand, turned on its side: the widest band of ink across the kept rows. */
function artBandX(data, w, top, bottom) {
  const rows = bottom - top + 1;
  const ink = new Array(w).fill(0);
  for (let x = 0; x < w; x++) {
    let n = 0;
    for (let y = top; y <= bottom; y++) if (data[(y * w + x) * 4 + 3] >= 40) n++;
    ink[x] = n;
  }
  const blank = Math.max(1, Math.round(rows * 0.006));
  const bands = [];
  let start = -1;
  for (let x = 0; x < w; x++) {
    const on = ink[x] > blank;
    if (on && start < 0) start = x;
    if (!on && start >= 0) { bands.push([start, x - 1]); start = -1; }
  }
  if (start >= 0) bands.push([start, w - 1]);
  if (!bands.length) return [0, w - 1];
  let best = bands[0], bestInk = -1;
  for (const [a, b] of bands) {
    let total = 0;
    for (let x = a; x <= b; x++) total += ink[x];
    if (total > bestInk) { bestInk = total; best = [a, b]; }
  }
  return best;
}

let changed = 0;
for (const file of (await readdir(DIR)).filter((f) => f.endsWith('.png'))) {
  const full = path.join(DIR, file);
  const { data, info } = await sharp(full).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const cleared = liftBackground(data, w, h);

  const [top, bottom] = artBand(data, w, h);
  const height = bottom - top + 1;

  /* And the same left-to-right, because the slice also catches a strip of
     whatever stood beside the tile on the sheet — the edge of a lantern down
     the side of the rug, and so on. Measured over the kept rows only, so the
     caption underneath cannot vote on where the art starts. */
  const [left, right] = artBandX(data, w, top, bottom);
  const width = right - left + 1;
  if (height <= 0 || width <= 0) continue;
  if (!cleared && top === 0 && bottom === h - 1 && left === 0 && right === w - 1) continue;

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width, height })
    .png()
    .toFile(full + '.tmp');
  await rename(full + '.tmp', full);
  console.log(`${file}: ${w}x${h} -> ${width}x${height}  (${cleared} backing px cleared)`);
  changed++;
}
console.log(changed ? `\nCleaned ${changed} plate(s).` : '\nNothing to clean.');
