import sharp from 'sharp';
import path from 'path';

const files = [
  {
    input: 'C:/Users/shrut/.gemini/antigravity/brain/feff9c7c-857d-4921-87de-3578cc639562/witness_etheric_1777360663230.png',
    output: 'C:/Github/Bliss/MindGym/public/assets/landing/witness.webp'
  },
  {
    input: 'C:/Users/shrut/.gemini/antigravity/brain/feff9c7c-857d-4921-87de-3578cc639562/release_etheric_1777360683827.png',
    output: 'C:/Github/Bliss/MindGym/public/assets/landing/release.webp'
  },
  {
    input: 'C:/Users/shrut/.gemini/antigravity/brain/feff9c7c-857d-4921-87de-3578cc639562/present_etheric_1777360703056.png',
    output: 'C:/Github/Bliss/MindGym/public/assets/landing/present.webp'
  },
  {
    input: 'C:/Users/shrut/.gemini/antigravity/brain/feff9c7c-857d-4921-87de-3578cc639562/practice_etheric_1777360724678.png',
    output: 'C:/Github/Bliss/MindGym/public/assets/landing/practice.webp'
  }
];

async function convert() {
  for (const f of files) {
    try {
      await sharp(f.input)
        .webp({ quality: 85 })
        .toFile(f.output);
      console.log(`Converted: ${f.output}`);
    } catch (e) {
      console.error(`Failed ${f.input}: ${e.message}`);
    }
  }
}

convert();
