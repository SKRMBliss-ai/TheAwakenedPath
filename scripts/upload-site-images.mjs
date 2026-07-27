/**
 * upload-site-images.mjs
 * Run from the project root:
 *   node scripts/upload-site-images.mjs
 *
 * Uses firebase-admin (CJS) via createRequire.
 * ADC credentials file is at:
 *   %APPDATA%\firebase\skrmblissai_gmail_com_application_default_credentials.json
 */

import { createRequire } from 'module';
import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Point ADC at the Firebase CLI credential file ────────────────────────────
const ADC_PATHS = [
  join(env.APPDATA || '', 'firebase', 'skrmblissai_gmail_com_application_default_credentials.json'),
  join(env.HOME || '', '.config', 'firebase', 'skrmblissai_gmail_com_application_default_credentials.json'),
];

let adcPath = null;
for (const p of ADC_PATHS) {
  if (existsSync(p)) { adcPath = p; break; }
}

if (!adcPath) {
  console.error('❌  Could not find Firebase ADC credentials. Run: npx firebase-tools login');
  process.exit(1);
}

// Set GOOGLE_APPLICATION_CREDENTIALS so firebase-admin uses this file
env.GOOGLE_APPLICATION_CREDENTIALS = adcPath;
console.log(`🔑  Using credentials: ${adcPath}\n`);

// ── Load firebase-admin CJS ───────────────────────────────────────────────────
const admin = require(join(__dirname, '../functions/node_modules/firebase-admin'));

const BUCKET = 'awakened-path-2026.firebasestorage.app';
const STORAGE_PREFIX = 'EmotionAndFeelingsCourse/site';
const ARTIFACT_DIR = 'C:\\Users\\shrut\\.gemini\\antigravity-ide\\brain\\6aacff1f-4611-4087-923c-ca0e0b970a58';
const ROOT = join(__dirname, '..');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: BUCKET,
  });
}

const bucket = admin.storage().bucket();

// ── File manifests ────────────────────────────────────────────────────────────
const ARTIFACT_FILES = [
  { file: 'feature_daily_practice_1785121290883.png',  remote: 'feature-daily-practice.webp' },
  { file: 'feature_journaling_1785121304115.png',       remote: 'feature-journaling.webp' },
  { file: 'feature_courses_1785121316281.png',          remote: 'feature-courses.webp' },
  { file: 'feature_breathwork_1785121338213.png',       remote: 'feature-breathwork.webp' },
  { file: 'feature_sound_1785121351268.png',            remote: 'feature-sound.webp' },
  { file: 'feature_live_1785121363310.png',             remote: 'feature-live.webp' },
  { file: 'reflection_journal_1785121386978.png',       remote: 'reflection-journal.webp' },
  { file: 'yt_thumb_breath_1785121397344.png',          remote: 'yt-thumb-breath.webp' },
  { file: 'yt_thumb_nature_1785121408861.png',          remote: 'yt-thumb-nature.webp' },
  { file: 'yt_thumb_sleep_1785121430461.png',           remote: 'yt-thumb-sleep.webp' },
  { file: 'media__1785120330001.png',                   remote: 'yt-thumb-presence.webp' },
];

async function uploadFile(localPath, remoteName, mimeType = 'image/png') {
  if (!existsSync(localPath)) {
    console.warn(`  ⚠  Skipping (not found): ${localPath}`);
    return;
  }

  const destination = `${STORAGE_PREFIX}/${remoteName}`;
  try {
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
      },
      public: true,
    });
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(destination)}?alt=media`;
    console.log(`  ✅  ${remoteName}`);
    console.log(`      ${publicUrl}\n`);
  } catch (err) {
    console.error(`  ❌  ${remoteName}: ${err.message}\n`);
  }
}

async function main() {
  console.log('🚀  Uploading site images to Firebase Storage...\n');
  console.log(`📦  Bucket : ${BUCKET}`);
  console.log(`📁  Prefix : ${STORAGE_PREFIX}\n`);

  for (const { file, remote } of ARTIFACT_FILES) {
    const localPath = join(ARTIFACT_DIR, file);
    await uploadFile(localPath, remote);
  }

  console.log(`\n✨  Upload complete!`);
  console.log(`\n🔗  Storage Console:`);
  console.log(`    https://console.firebase.google.com/u/1/project/awakened-path-2026/storage/${BUCKET}/files/~2FEmotionAndFeelingsCourse~2Fsite\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('\n🔥  Fatal:', err.message || err);
  process.exit(1);
});
