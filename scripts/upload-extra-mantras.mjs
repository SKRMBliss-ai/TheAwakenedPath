import { createRequire } from 'module';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const ADC_PATH = join(env.APPDATA || '', 'firebase', 'skrmblissai_gmail_com_application_default_credentials.json');
env.GOOGLE_APPLICATION_CREDENTIALS = ADC_PATH;

const admin = require(join(__dirname, '../functions/node_modules/firebase-admin'));
const BUCKET = 'awakened-path-2026.firebasestorage.app';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: BUCKET,
  });
}

const bucket = admin.storage().bucket();
const nasDir = '\\\\HomeNAS\\SKRMShared\\videos\\Mantras\\MantraMp30SingleChant';

const newUploads = [
  { src: 'sarsvati.mp3', dest: 'Mantras/saraswati-mantra.mp3' },
  { src: 'shiv.mp3', dest: 'Mantras/shiva-mantra.mp3' },
  { src: 'उमामहेश्वराभ्यां.mp3', dest: 'Mantras/uma-maheshwara-mantra.mp3' },
  { src: 'ॐ नमो भगवत महासुदर्शनाय.mp3', dest: 'Mantras/maha-sudarshana-mantra.mp3' },
  { src: 'TuldiAarti.mp3', dest: 'Mantras/tulsi-aarti.mp3' },
  { src: 'ganesha aarti.mp3', dest: 'Mantras/ganesha-aarti.mp3' },
  { src: 'Day1Mantra.mp3', dest: 'Mantras/shailaputri-mantra.mp3' }
];

async function run() {
  for (const item of newUploads) {
    const fullSrc = join(nasDir, item.src);
    console.log(`⏳ Uploading ${item.src} -> ${item.dest}...`);
    await bucket.upload(fullSrc, {
      destination: item.dest,
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
    console.log(`✅ Uploaded: https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(item.dest)}?alt=media\n`);
  }
  console.log('🎉 All 7 extra mantras uploaded successfully to Firebase Storage!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
