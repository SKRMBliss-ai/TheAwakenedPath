/**
 * prepare-room-art.mjs — turn a regenerated Kids Gym room illustration into
 * the WebP set the room hub and CinematicRoom actually use.
 *
 *   node scripts/prepare-room-art.mjs <room-id> <source.png>
 *
 * Unlike scripts/prepare-gym-art.mjs (the two entry characters), room art
 * needs no background removal or splitting — these are already complete,
 * opaque scenes, one per file. This script only resizes and converts.
 *
 * Produces the same three files rooms.ts already expects, at the SAME
 * filenames, so no code changes are needed to pick up a regenerated room:
 *
 *   public/rooms/{id}.webp             full-bleed CinematicRoom background
 *   public/rooms/{id}_card.webp        hub tile, hover state
 *   public/rooms/full/{id}_full.webp   hub tile, resting state
 *
 * The background export is close to the source's native resolution — that
 * is the entire point of this regeneration. CinematicRoom.tsx stretches it
 * full-bleed (object-cover, min-h-[100svh]) across the whole screen; the
 * previous 820x1152 sources rendered visibly soft on anything wider than a
 * phone (a 1.76x forced upscale at 1440px, before Retina/DPR is even
 * counted). The two hub-tile exports are much smaller: they render at
 * roughly 120-200 CSS px, so shipping them at background resolution would
 * only add bytes to the PWA precache with no visible benefit — the same
 * lesson prepare-gym-art.mjs's width ladder already applies.
 *
 * The source PNG is never copied into public/ — it stays wherever it was
 * passed from (this repo's convention: art-build/rooms/source/{id}.png,
 * gitignored, regenerable, and therefore fine to lose). Only the WebP
 * derivatives are committed.
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const [, , roomId, srcPath] = process.argv;

if (!roomId || !srcPath) {
  console.error('usage: node scripts/prepare-room-art.mjs <room-id> <source.png>');
  process.exit(1);
}

const OUT_DIR = 'public/rooms';

const meta = await sharp(srcPath).metadata();
console.log(`source      : ${srcPath}  ${meta.width}x${meta.height}`);

await mkdir(OUT_DIR, { recursive: true });
await mkdir(path.join(OUT_DIR, 'full'), { recursive: true });

// The hub tile's own container (KidsWorld.tsx) is a fixed, very tall
// aspect-ratio box — `aspectRatio: '205 / 768'`, about 1:3.75 — used for
// BOTH the resting (`full/{id}_full.webp`) and hover (`{id}_card.webp`)
// images, via `object-contain`. A plain resize of a source this much wider
// (1024x1536 is about 1:1.5) leaves that box mostly empty, letterboxed top
// and bottom — confirmed visually: it showed as solid colour bars around
// the art. These two need a CROP to the container's own aspect, not a
// resize; only the full-bleed background (its own container just fills
// whatever aspect the screen is) is a plain resize.
const HUB_TILE_ASPECT = 205 / 768;

const targets = [
  { file: path.join(OUT_DIR, `${roomId}.webp`), width: 1024, quality: 82, label: 'background (full-bleed)', crop: false },
  { file: path.join(OUT_DIR, `${roomId}_card.webp`), width: 480, quality: 84, label: 'hub tile (hover state)', crop: true },
  { file: path.join(OUT_DIR, 'full', `${roomId}_full.webp`), width: 480, quality: 84, label: 'hub tile (resting state)', crop: true },
];

for (const t of targets) {
  let img = sharp(srcPath);
  if (t.crop) {
    const height = Math.round(t.width / HUB_TILE_ASPECT);
    // Plain centre crop, not sharp's content-aware 'attention' mode —
    // tried that first, and it centred on the glowing orbs/thought-bubble
    // icons (higher local contrast) instead of the child, cropping faces
    // half out of frame. Every room in this set poses its child roughly
    // centred horizontally in the source (confirmed by eye across all 10
    // room descriptions), so a plain centre crop is the predictable choice.
    img = img.resize({ width: t.width, height, fit: 'cover', position: 'centre' });
  } else {
    img = img.resize({ width: t.width, withoutEnlargement: true });
  }
  await img.webp({ quality: t.quality, effort: 6 }).toFile(t.file);
  const outMeta = await sharp(t.file).metadata();
  console.log(`${t.label.padEnd(28)} -> ${t.file}  ${outMeta.width}x${outMeta.height}`);
}

console.log(`\ndone: ${roomId}`);
