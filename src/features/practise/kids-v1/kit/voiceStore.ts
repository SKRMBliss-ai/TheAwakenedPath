/**
 * THE CHILD'S OWN VOICE, KEPT.
 *
 * The app already lets a child speak instead of typing, and then throws the
 * audio away and keeps the transcript. The transcript is the useful half for
 * the app. The audio is the useful half for the CHILD — specifically for the
 * child eighteen months later.
 *
 * A six-year-old reading "I thought everyone would laugh at me" in their own
 * transcript from last spring is reading a sentence. Hearing themselves say
 * it, in their own small voice, and noticing that they aren't frightened of
 * that any more, is the single most powerful demonstration of change
 * available to this app — and it needs no scoring, no analysis, no
 * cleverness at all. Only for the recording not to be discarded.
 *
 * INDEXEDDB, NOT LOCALSTORAGE. A ten-second clip is fifteen-odd kilobytes as
 * a blob and about a third larger again base64'd into localStorage, where it
 * would be competing with the cases and their drawings for a five-megabyte
 * quota. Two hundred clips would take the whole thing out, and the failure
 * mode of a full localStorage in this app is losing a child's written cases,
 * which is far worse than losing any recording.
 *
 * IT NEVER LEAVES THE DEVICE, exactly like the cases: no upload, no
 * transcription service, no account. The browser's own speech recognition
 * does whatever it does with the microphone; this file only holds on to a
 * copy locally so it can be played back to the one person it belongs to.
 *
 * EVERY FUNCTION HERE SWALLOWS ITS OWN FAILURES. Private browsing, a denied
 * microphone, a browser with no IndexedDB, a full disk — all of it must end
 * with the app behaving exactly as it did before recordings existed. Voice
 * capture is a bonus on top of the transcript, and it may never cost a child
 * the words they actually said.
 */

const DB_NAME = 'mindgym-kidsv1-voice';
const STORE = 'clips';
const VERSION = 1;

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      // A blocked upgrade (another tab holding the old version) must not hang
      // the caller forever — the app carries on without recordings.
      req.onblocked = () => resolve(null);
    } catch { resolve(null); }
  });
}

export function newClipId(): string {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Stores one clip. Resolves either way; a failed save is a missing play
 *  button later, never a lost answer. */
export async function putClip(id: string, blob: Blob): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch { resolve(); }
  });
  db.close();
}

export async function getClip(id: string): Promise<Blob | null> {
  const db = await open();
  if (!db) return null;
  const blob = await new Promise<Blob | null>((resolve) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  db.close();
  return blob;
}

/**
 * Drops every clip whose id isn't in `keep`.
 *
 * The cases shelf keeps forty and a child can delete any of them, so without
 * this the clips belonging to deleted or aged-out cases would sit in the
 * database for the life of the install — including the recordings from cases
 * the child chose to throw away, which they are entitled to have actually
 * gone. Called after the case list changes rather than on a timer.
 */
export async function pruneClips(keep: Set<string>): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const store = db.transaction(STORE, 'readwrite').objectStore(STORE);
      const req = store.getAllKeys();
      req.onsuccess = () => {
        for (const k of req.result) if (typeof k === 'string' && !keep.has(k)) store.delete(k);
        resolve();
      };
      req.onerror = () => resolve();
    } catch { resolve(); }
  });
  db.close();
}

/* ── Which answer a clip belongs to ─────────────────────────────────────── */

/**
 * Clips live in IndexedDB; this little map of "which answer does clip X
 * belong to" lives in localStorage next to everything else, because it is a
 * few dozen bytes per entry and the code that reads it (rendering a play
 * button beside an answer) has to be synchronous. Asking IndexedDB before
 * every render to find out whether to draw a small triangle would be a lot of
 * machinery for a lookup that fits in a string.
 */
const LINK_KEY = 'mindgym.kidsv1.voiceLinks';

function readLinks(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LINK_KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? (v as Record<string, string>) : {};
  } catch { return {}; }
}

export function clipFor(answerKey: string): string | null {
  return readLinks()[answerKey] ?? null;
}

export function allLinkedClips(): Set<string> {
  return new Set(Object.values(readLinks()));
}

/**
 * Points an answer at its clip, and clears up whatever it was pointing at
 * before. Re-recording an answer is the one routine way clips are orphaned —
 * a child saying it again because the first go came out wrong — and without
 * the prune the database would keep every discarded attempt forever.
 */
export function linkClip(answerKey: string, clipId: string): void {
  const links = { ...readLinks(), [answerKey]: clipId };
  try { localStorage.setItem(LINK_KEY, JSON.stringify(links)); } catch { /* storage off */ }
  void pruneClips(new Set(Object.values(links)));
}

/* ── Recording ──────────────────────────────────────────────────────────── */

export interface VoiceTake {
  /** Stop capturing and store what was caught. Resolves with the id, or null
   *  if nothing usable was recorded. */
  stop: () => Promise<string | null>;
}

/**
 * Starts recording the microphone alongside whatever the speech recogniser is
 * doing. Returns null the moment anything is unavailable — no MediaRecorder,
 * no getUserMedia, permission refused — so callers treat recording as a thing
 * that sometimes happens rather than a thing to depend on.
 *
 * This opens its OWN microphone stream rather than sharing the recogniser's,
 * because the Web Speech API doesn't expose one. In practice browsers are
 * happy to hand the same input to both; where they aren't, this fails and the
 * transcript path is untouched.
 */
export async function startRecording(): Promise<VoiceTake | null> {
  try {
    if (typeof MediaRecorder === 'undefined') return null;
    if (!navigator.mediaDevices?.getUserMedia) return null;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.start();

    return {
      stop: () =>
        new Promise<string | null>((resolve) => {
          const finish = async () => {
            // The mic light must go out the moment recording stops, whatever
            // happens to the clip afterwards.
            stream.getTracks().forEach((t) => t.stop());
            if (!chunks.length) return resolve(null);
            const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
            // A clip this short is a tap, not a sentence.
            if (blob.size < 1200) return resolve(null);
            const id = newClipId();
            await putClip(id, blob);
            resolve(id);
          };
          rec.onstop = finish;
          try { rec.stop(); } catch { void finish(); }
        }),
    };
  } catch {
    return null;
  }
}
