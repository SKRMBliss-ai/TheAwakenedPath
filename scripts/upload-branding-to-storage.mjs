import { createRequire } from 'module';
import { readdirSync, statSync } from 'fs';
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
const localDir = join(__dirname, '../public/marketing/mantras');

async function uploadFile(localPath, destPath, contentType) {
  console.log(`⏳ Uploading ${destPath}...`);
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });
  console.log(`✅ Uploaded: https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(destPath)}?alt=media\n`);
}

async function run() {
  const files = readdirSync(localDir);
  for (const f of files) {
    const full = join(localDir, f);
    if (!statSync(full).isFile()) continue;
    let type = 'application/octet-stream';
    if (f.endsWith('.webp')) type = 'image/webp';
    else if (f.endsWith('.mp4')) type = 'video/mp4';
    else if (f.endsWith('.png')) type = 'image/png';
    else if (f.endsWith('.jpg') || f.endsWith('.jpeg')) type = 'image/jpeg';

    await uploadFile(full, `Marketing/mantras/${f}`, type);
  }
  console.log('🎉 All marketing branding files successfully uploaded to Google Cloud Storage (Marketing/mantras/)!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
