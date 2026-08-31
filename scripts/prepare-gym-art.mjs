/**
 * prepare-gym-art.mjs — turn a character illustration into the WebP set the
 * Practice Gym cards use.
 *
 *   node scripts/prepare-gym-art.mjs <source.png> [--names kids,adult] [--tolerance 26]
 *
 * Handles the three things every one of these source files needs:
 *
 *   1. BACKGROUND REMOVAL, if the source is opaque. Done as a flood fill inward
 *      from the four edges rather than "delete every white pixel" — the
 *      characters wear white trainers, hold a white mug and have white teeth,
 *      and a naive colour key punches holes straight through them. Only
 *      background CONNECTED to the frame edge is removed.
 *   2. SPLITTING, when one sheet holds several characters side by side. Columns
 *      that are entirely background become the cut lines.
 *   3. TRIM + EXPORT at 1x/2x/3x widths as WebP, which is what the cards' srcset
 *      wants and what Hosting already serves with a one-year immutable cache.
 *
 * Sharp is already a dev dependency (used by the image tooling in this repo),
 * so this adds no new package.
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Widths emitted per character, matched to what the card actually renders
 * (71-134 CSS px depending on breakpoint).
 *
 * Two steps, not three. Measured across iPhone SE/13, iPad and laptop at DPR
 * 1-3, the browser never selects anything above 320 — the only case that would
 * is a DPR3 desktop, which is vanishingly rare. Every file here is precached by
 * the service worker for every user, so an unused third step is 149KB of dead
 * weight in everyone's cache rather than a free safety margin.
 */
const WIDTHS = [160, 320];

/** Served, committed, precached — keep this small. */
const OUT_DIR = 'public/assets/gym';

/**
 * Full-resolution masters and the magenta proof sheets. Deliberately OUTSIDE
 * public/: vite.config.ts precaches `**\/*.{...png,webp...}` from the build, so
 * a 1.5MB master under public/ would land in every user's service-worker cache.
 * Both are regenerable from the committed source sheet in seconds, so this
 * directory is gitignored.
 */
const WORK_DIR = 'art-build';

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

if (!src) {
  console.error('usage: node scripts/prepare-gym-art.mjs <source.png> [--names kids,adult] [--tolerance 26]');
  process.exit(1);
}

const names = flag('names', 'kids,adult').split(',').map((s) => s.trim());
const tolerance = Number(flag('tolerance', 26));

/** Squared RGB distance — cheaper than a sqrt we'd only compare anyway. */
function near(buf, i, r, g, b, tol) {
  const dr = buf[i] - r, dg = buf[i + 1] - g, db = buf[i + 2] - b;
  return dr * dr + dg * dg + db * db <= tol * tol * 3;
}

/**
 * Clears background connected to the image border. Returns a new RGBA buffer.
 * Iterative stack, not recursion — a 1500x1000 fill would blow the call stack.
 */
function floodClearFromEdges(data, width, height, tol) {
  // Sample the four corners and use the median-ish first corner as the key.
  const r = data[0], g = data[1], b = data[2];
  const seen = new Uint8Array(width * height);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (seen[p]) return;
    if (!near(data, p * 4, r, g, b, tol)) return;
    seen[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }

  while (stack.length) {
    const p = stack.pop();
    const x = p % width, y = (p - x) / width;
    data[p * 4 + 3] = 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return { data, cleared: seen };
}

/** Column ranges that contain at least one non-transparent pixel. */
function contentColumns(data, width, height, minAlpha = 8) {
  const occupied = new Uint8Array(width);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (data[(y * width + x) * 4 + 3] > minAlpha) { occupied[x] = 1; break; }
    }
  }
  const runs = [];
  let start = -1;
  for (let x = 0; x < width; x++) {
    if (occupied[x] && start === -1) start = x;
    if ((!occupied[x] || x === width - 1) && start !== -1) {
      const end = occupied[x] ? x : x - 1;
      // Ignore slivers — stray specks left by the key, not a character.
      if (end - start > width * 0.04) runs.push([start, end]);
      start = -1;
    }
  }
  return runs;
}

/** Top and bottom bounds of the content inside a column range. */
function contentRows(data, width, height, left, right, minAlpha = 8) {
  let top = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = left; x <= right; x++) {
      if (data[(y * width + x) * 4 + 3] > minAlpha) {
        if (top === -1) top = y;
        bottom = y;
        break;
      }
    }
  }
  return [top, bottom];
}

const image = sharp(src).ensureAlpha();
const meta = await image.metadata();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

console.log(`source      : ${src}  ${width}x${height}  alpha=${meta.hasAlpha ? 'yes' : 'no'}`);

// Only key out a background if the source doesn't already have one.
let opaquePixels = 0;
for (let p = 3; p < data.length; p += 4) if (data[p] > 250) opaquePixels++;
const looksOpaque = opaquePixels / (width * height) > 0.98;

if (looksOpaque) {
  floodClearFromEdges(data, width, height, tolerance);
  console.log(`background  : keyed out by edge flood fill (tolerance ${tolerance})`);
} else {
  console.log('background  : already transparent, left alone');
}

const runs = contentColumns(data, width, height);
console.log(`subjects    : ${runs.length} found at columns ${runs.map(([a, b]) => `${a}-${b}`).join(', ')}`);

if (runs.length !== names.length) {
  console.warn(`\n! ${runs.length} subject(s) detected but ${names.length} name(s) given (${names.join(', ')}).`);
  console.warn(`  Pass --names with one name per subject, or --tolerance to adjust the key.\n`);
}

await mkdir(OUT_DIR, { recursive: true });

const manifest = [];

for (let i = 0; i < runs.length; i++) {
  const [left, right] = runs[i];
  const name = names[i] ?? `subject-${i + 1}`;
  const pad = Math.round(width * 0.01);
  const x = Math.max(0, left - pad);
  const w = Math.min(width - x, right - left + 1 + pad * 2);

  // Extract the subject, then trim to its own alpha bounding box so every
  // character is framed identically regardless of where it sat on the sheet.
  // Vertical bounds are computed here rather than left to sharp's trim(), so
  // every character is cropped tight to its own alpha on both axes and the
  // result is identical regardless of sharp's trim heuristics.
  const [top, bottom] = contentRows(data, width, height, left, right);
  const h = bottom - top + 1;

  const cut = await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .extract({ left: x, top: Math.max(0, top - pad), width: w, height: Math.min(height - Math.max(0, top - pad), h + pad * 2) })
    .png()
    .toBuffer();

  const cutMeta = await sharp(cut).metadata();
  const outputs = [];

  for (const targetW of WIDTHS) {
    const file = path.join(OUT_DIR, `${name}-character@${targetW}.webp`);
    await sharp(cut)
      .resize({ width: targetW, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100, effort: 6 })
      .toFile(file);
    outputs.push(file);
  }

  // Keep the keyed full-resolution PNG as the master to re-export from.
  const master = path.join(WORK_DIR, 'source', `${name}-character.png`);
  await mkdir(path.dirname(master), { recursive: true });
  await writeFile(master, cut);

  // A magenta proof sheet, always written. Edge flood fill cannot tell a white
  // background from a white TRAINER touching that background — enclosed whites
  // (a logo, a mug, teeth) survive, but white that runs to the frame edge is
  // removed with it. That failure is invisible against a white page and obvious
  // against magenta, so the check is produced every run rather than on request.
  const check = path.join(WORK_DIR, 'check', `${name}-on-magenta.png`);
  await mkdir(path.dirname(check), { recursive: true });
  await sharp({
    create: { width: cutMeta.width, height: cutMeta.height, channels: 4, background: '#FF00FF' },
  })
    .composite([{ input: cut }])
    .png()
    .toFile(check);

  manifest.push({ name, trimmed: `${cutMeta.width}x${cutMeta.height}`, outputs });
  console.log(`\n${name}: trimmed to ${cutMeta.width}x${cutMeta.height}`);
  console.log(`  -> ${check}  (CHECK THIS — anything missing was keyed out by mistake)`);
  outputs.forEach((f) => console.log(`  -> ${f}`));
  console.log(`  -> ${master}  (master)`);
}

console.log(`\ndone. ${manifest.length} character(s), ${manifest.length * WIDTHS.length} WebP files.`);
console.log(`\nBefore committing, open every file in ${WORK_DIR}/check/ and confirm nothing`);
console.log(`is missing. White areas that touched the background (trainers, a collar) can be`);
console.log(`removed along with it. If something vanished, lower --tolerance, or ask for the`);
console.log(`source on a flat magenta background instead of white.`);
