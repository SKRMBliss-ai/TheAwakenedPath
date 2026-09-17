import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing extracted home/ and story/ handoffs.');
for (const pack of ['home', 'story']) {
  const out = `public/mind-gym/${pack === 'home' ? 'closed-home' : 'story-lab'}`;
  await mkdir(out, { recursive: true });
  const folder = path.join(source, pack, 'production_assets');
  for (const file of await readdir(folder)) {
    if (!file.endsWith('.png')) continue;
    await sharp(path.join(folder, file)).webp({ quality: 92 }).toFile(`${out}/${file.replace('.png', '.webp')}`);
  }
  const refs = path.join(source, pack, 'reference_crops');
  const files = (await readdir(refs)).filter(f => f.endsWith('.png'));
  const tiles = await Promise.all(files.map(async (file, i) => ({ input: await sharp(path.join(refs, file)).resize(280, 200, { fit: 'contain', background: '#211332' }).png().toBuffer(), left: (i % 4) * 280, top: Math.floor(i / 4) * 200 })));
  await sharp({ create: { width: 1120, height: Math.ceil(files.length / 4) * 200, channels: 4, background: '#211332' } }).composite(tiles).png().toFile(path.join(source, `${pack}-reference-contact.png`));
  if (pack === 'home') {
    const doors = [['kind', 1000, 182], ['truth', 1322, 182], ['choices', 1000, 363], ['include', 1322, 363], ['body', 1000, 540], ['help', 1322, 540], ['mindheart', 1000, 715]];
    for (const [id, left, top] of doors) {
      const ref = path.join(source, 'home', 'approved_reference_closed_doors.png');
      await sharp(ref).extract({ left, top, width: 212, height: 175 }).webp({ quality: 95 }).toFile(`${out}/frame-${id}.webp`);
      await sharp(ref).extract({ left: left + 43, top: top + 47, width: 151, height: 122 }).webp({ quality: 95 }).toFile(`${out}/door-${id}.webp`);
    }
    for (const file of files.filter(f => /^closed_.*_room_reference/.test(f))) {
      await sharp(path.join(refs, file)).webp({ quality: 95 }).toFile(`${out}/${file.replace('_reference.png', '.webp')}`);
    }
    // Remove sheet captions from the environment. The already prepared
    // canonical boy and icons remain the home character/step assets.
    const meta = await sharp(path.join(folder, 'background_environment.png')).metadata();
    await sharp(path.join(folder, 'background_environment.png')).extract({ left: 3, top: 11, width: meta.width - 12, height: meta.height - 27 }).webp({ quality: 94 }).toFile(`${out}/environment.webp`);
  }
}
