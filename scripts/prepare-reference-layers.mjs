import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const source = process.argv[2];
if (!source) throw Error('Pass extracted handoffs root (home/ and story/).');
const home = 'public/mind-gym/closed-home';
const story = 'public/mind-gym/story-lab';
await mkdir(home, { recursive: true });
const rooms = { kind: 'be_kind', truth: 'tell_truth', choices: 'make_good_choices', include: 'include_everyone', body: 'take_care_body', help: 'help_others', mindheart: 'mind_heart' };
for (const [id, file] of Object.entries(rooms)) {
  await sharp(path.join(source, 'home/reference_crops', `open_${file}_reference.png`)).webp({ quality: 96 }).toFile(`${home}/open-${id}.webp`);
}
// Only illustration regions, not screenshot UI or baked controls.
const approved = path.join(source, 'story/approved_reference_story_lab.png');
await sharp(approved).extract({ left: 435, top: 402, width: 278, height: 157 }).webp({ quality: 96 }).toFile(`${story}/memory-illustration.webp`);
const sheet = path.join(source, 'story/full_asset_sheet.png');
await sharp(sheet).extract({ left: 665, top: 744, width: 126, height: 103 }).webp({ quality: 96 }).toFile(`${story}/cloud-art.webp`);
