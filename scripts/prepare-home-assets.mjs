// Mechanical extraction of the supplied, approved art. No generated artwork.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const source = process.argv[2];
if (!source) throw new Error('Pass the extracted mind_gym_assets_for_claude directory.');
const out = 'public/mind-gym/home';
await mkdir(out, { recursive: true });
await sharp(`${source}/approved_reference_home.png`).webp({ quality: 95 }).toFile(`${out}/approved-scene.webp`);
async function cut(name, rectangle, removeWhite = false, folder = 'production_assets', dest = name) {
  let input = sharp(`${source}/${folder}/${name}.png`);
  if (rectangle) input = input.extract(rectangle);
  const { data, info } = await input.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (removeWhite) {
    const visited = new Uint8Array(info.width * info.height);
    const queue = [];
    const add = (x, y) => {
      if (x < 0 || y < 0 || x >= info.width || y >= info.height) return;
      const p = y * info.width + x;
      if (visited[p]) return;
      visited[p] = 1;
      const k = p * 4;
      if (data[k + 3] < 10 || (data[k] > 235 && data[k + 1] > 235 && data[k + 2] > 235)) queue.push(p);
    };
    for (let x = 0; x < info.width; x++) { add(x, 0); add(x, info.height - 1); }
    for (let y = 0; y < info.height; y++) { add(0, y); add(info.width - 1, y); }
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i], x = p % info.width, y = Math.floor(p / info.width);
      data[p * 4 + 3] = 0;
      add(x - 1, y); add(x + 1, y); add(x, y - 1); add(x, y + 1);
    }
  }
  await sharp(data, { raw: info }).webp({ quality: 92 }).toFile(`${out}/${dest}.webp`);
}
await cut('background_environment', { left: 3, top: 11, width: 763, height: 360 });
await cut('boy_fullbody', { left: 0, top: 0, width: 210, height: 516 }, true);
await cut('chirpy', { left: 22, top: 30, width: 161, height: 140 }, true);
const icons = [['feeling', 246, 285], ['body', 355, 347], ['thought', 270, 420], ['what_happened', 372, 492], ['story', 282, 565], ['another_way', 398, 634]];
for (const [name, left, top] of icons) {
  await sharp(`${source}/approved_reference_home.png`).extract({ left, top, width: 98, height: 98 })
    .composite([{ input: Buffer.from('<svg width="98" height="98"><circle cx="49" cy="49" r="49" fill="white"/></svg>'), blend: 'dest-in' }])
    .webp({ quality: 95 }).toFile(`${out}/icon_${name}.webp`);
}
const rooms = [
  ['be_kind', 971, 246], ['tell_truth', 1310, 245],
  ['make_good_choices', 970, 433], ['include_everyone', 1310, 432],
  ['take_care_body', 969, 614], ['help_others', 1310, 608], ['mind_heart_time', 971, 776],
];
for (const [name, left, top] of rooms) {
  await sharp(`${source}/approved_reference_home.png`).extract({ left, top, width: 153, height: 94 }).webp({ quality: 95 }).toFile(`${out}/room_${name}.webp`);
}
