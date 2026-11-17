/**
 * upload-mantras-to-storage.mjs
 * 
 * Uploads master single-chant MP3 files to Firebase Storage:
 * gs://awakened-path-2026.firebasestorage.app/Mantras/
 *
 * Run from AwakenedPath directory:
 *   node scripts/upload-mantras-to-storage.mjs
 */

import { createRequire } from 'module';
import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Point ADC at the Firebase CLI credential file
const ADC_PATHS = [
  join(env.APPDATA || '', 'firebase', 'skrmblissai_gmail_com_application_default_credentials.json'),
  join(env.HOME || '', '.config', 'firebase', 'skrmblissai_gmail_com_application_default_credentials.json'),
];

let adcPath = null;
for (const p of ADC_PATHS) {
  if (existsSync(p)) { adcPath = p; break; }
}

if (!adcPath) {
  console.error('❌ Could not find Firebase ADC credentials.');
  process.exit(1);
}

env.GOOGLE_APPLICATION_CREDENTIALS = adcPath;
console.log(`🔑 Using credentials: ${adcPath}\n`);

const admin = require(join(__dirname, '../functions/node_modules/firebase-admin'));

const BUCKET = 'awakened-path-2026.firebasestorage.app';
const SRC_DIR = join(__dirname, '../public/audio/mantras');
const STORAGE_PREFIX = 'Mantras';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: BUCKET,
  });
}

const bucket = admin.storage().bucket();

async function uploadAll() {
  const files = readdirSync(SRC_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`📦 Found ${files.length} mantra audio files in ${SRC_DIR}`);
  console.log(`🚀 Uploading to gs://${BUCKET}/${STORAGE_PREFIX}/ ...\n`);

  for (const file of files) {
    const localPath = join(SRC_DIR, file);
    const destination = `${STORAGE_PREFIX}/${file}`;

    console.log(`⏳ Uploading ${file} -> ${destination}...`);
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(destination)}?alt=media`;
    console.log(`✅ Uploaded: ${publicUrl}\n`);
  }

  console.log('🎉 All mantra audio files uploaded successfully to Firebase Storage!');
}

uploadAll().catch(err => {
  console.error('❌ Upload failed:', err);
  process.exit(1);
});

