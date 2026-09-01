/**
 * upload-rooms-to-storage.mjs — push public/rooms/ to Firebase Storage.
 *
 * Why this exists instead of the gsutil command rooms.ts originally
 * suggested: gsutil requires installing the Google Cloud SDK, which isn't
 * always already on hand (confirmed: not on the machine this was run from —
 * "gsutil is not recognized" in PowerShell). This needs only Node, which
 * building this app already requires, plus one temporary package install.
 *
 * SETUP (one-time):
 *   1. npm install --no-save firebase-admin
 *      (--no-save: this is a one-off migration utility, not something the
 *      app itself needs at runtime or build time — see functions/package.json
 *      for the app's own, separate use of firebase-admin in Cloud Functions)
 *   2. Firebase Console -> Project Settings -> Service Accounts ->
 *      "Generate new private key". Save the downloaded JSON somewhere
 *      OUTSIDE this repo (e.g. your home folder) — it grants full admin
 *      access to this Firebase project. NEVER commit it; it is not caught
 *      by .gitignore because it can land anywhere you choose to save it.
 *
 * RUN (every time public/rooms/ changes — safe to repeat):
 *   node scripts/upload-rooms-to-storage.mjs "C:\path\to\service-account.json"
 *   (or set GOOGLE_APPLICATION_CREDENTIALS and omit the argument)
 *
 * Uploads every file under public/rooms/ to the SAME relative path under
 * kids-rooms/ in the bucket (public/rooms/feelings.webp ->
 * kids-rooms/feelings.webp, public/rooms/full/feelings_full.webp ->
 * kids-rooms/full/feelings_full.webp) — exactly what rooms.ts's
 * roomArt/roomCard/roomFull expect. (Prefix is kids-rooms/, not rooms/ —
 * a dedicated namespace for this content, not a separate bucket; see
 * rooms.ts's doc comment for why.)
 */

// The modular API (firebase-admin/app + firebase-admin/storage), not the
// older `import admin from 'firebase-admin'; admin.credential.cert(...)`
// style — confirmed that one fails under real ESM with a recent
// firebase-admin version ("Cannot read properties of undefined (reading
// 'cert')": admin.credential comes back undefined through the default-
// import interop). The modular named exports don't have that ambiguity.
import { cert, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const BUCKET = 'awakened-path-2026.firebasestorage.app';
const SRC_DIR = 'public/rooms';

const keyPath = process.argv[2] ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error('usage: node scripts/upload-rooms-to-storage.mjs <path-to-service-account.json>');
  console.error('   or: set GOOGLE_APPLICATION_CREDENTIALS and omit the argument');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(keyPath),
  storageBucket: BUCKET,
});
const bucket = getStorage(app).bucket();

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

const files = [...walk(SRC_DIR)].filter((f) => f.endsWith('.webp'));
console.log(`uploading ${files.length} files from ${SRC_DIR} to gs://${BUCKET}/kids-rooms/ ...\n`);

let done = 0;
for (const file of files) {
  const rel = path.relative(SRC_DIR, file).split(path.sep).join('/'); // Windows path -> URL path
  const dest = `kids-rooms/${rel}`;
  await bucket.upload(file, {
    destination: dest,
    metadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' },
  });
  done++;
  console.log(`[${done}/${files.length}] ${file} -> gs://${BUCKET}/${dest}`);
}

console.log('\ndone.');
