/**
 * CHIRPY'S VOICE — the browser's own speechSynthesis, no server, no key.
 *
 * Under-8s read slowly, and this app is mostly Chirpy's dialogue. A child
 * who cannot yet read "Feelings live somewhere. Where's yours sitting?" at
 * the pace it appears is locked out of half the app, and the fix already
 * exists in every browser this runs in.
 *
 * SUPPORT IS PARTIAL, same as the speech-to-text half of this kit (see
 * speech.ts) — every call site treats a no-op as the normal case, never an
 * error. There is no "voice broken" state; there is only "spoke" or
 * "didn't", and the text is on screen either way.
 *
 * HONOURS BOTH SILENCES. The device mute toggle (§ the rest of this app)
 * and the quiet state both mean the same thing here that they mean
 * everywhere else: say nothing. A distressed child does not get a cheerful
 * voice reading at them just because the mute toggle happens to control
 * sound effects and not speech — one silence switch, not two.
 */

import { isMuted } from '../../../../lib/sfx';
import { speakCalmly } from '../../../../lib/calmVoice';

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Speaks one line, replacing whatever Chirpy was already saying — he only
 * ever says one thing at a time, so a new line always wins over the old one
 * rather than queueing behind it.
 */
/**
 * GEMINI SPEAKS HIM; THE BROWSER IS THE SAFETY NET.
 *
 * The comment below used to be an apology: no mainstream platform ships a
 * child's voice, so calmVoice asks for one, finds none, and hands back a calm
 * ADULT FEMALE voice. A small bird who is a child's companion — never a
 * teacher — was being read by a newsreader. That is why he sounded like nobody.
 *
 * So his real voice is Gemini TTS, performed to a written direction that lives
 * in the Function (see `chirpyVoice` in functions/index.js — deliberately not
 * here, or Chirpy's character becomes a thing any page could restyle).
 *
 * The browser voice stays as the fallback and is not a lesser path: it covers
 * the Function being down, the budget being spent, the child being offline, and
 * the first few hundred milliseconds before the audio lands. A child always
 * hears something.
 */
const VOICE_ENDPOINT = 'https://awakened-path-2026.web.app/api/chirpy-voice';

/** One line at a time — a new line always wins over the old one. */
let current: HTMLAudioElement | null = null;
/** Which line he is on, so a late arrival can check it is still wanted. */
let speaking: string | null = null;
/**
 * Lines repeat all evening, so the same text is fetched once per session and
 * then replayed from memory. The Function also sets a long Cache-Control, so
 * a repeat across sessions is served by the CDN rather than re-synthesised.
 */
const heard = new Map<string, string>();

/**
 * Bumped by every stop and every new line, so a queued utterance can tell
 * whether it is still the one wanted by the time it actually runs.
 */
let voiceToken = 0;

/**
 * Two speakers. The grown-up narrates the app; Chirpy is the child's own mind,
 * heard only when the child's thoughts are being said out loud.
 */
export type Speaker = 'grownup' | 'mind';
const VOICES: Record<Speaker, string> = { grownup: 'Enceladus', mind: 'Puck' };

function browserVoice(text: string) {
  if (!isVoiceSupported()) return;
  /*
    THE UTTERANCE CANNOT GO IN THE SAME TASK AS THE CANCEL.

    Every caller reaches here just after stopSpeaking(), which calls
    speechSynthesis.cancel() — and Chrome drops an utterance queued in the
    same task as a cancel. This function used to note that hazard and then
    queue synchronously anyway, so the line was dropped on the spot. In the
    Story Lab it was dropped twice per step: React runs the previous effect's
    cleanup (a cancel) and the next effect's body (a cancel and a speak) in
    one commit, so Chirpy went silent for the whole walk.

    A turn of the event loop is enough for the cancel to have settled. The
    token is what keeps the delay honest — a child who moves on within those
    few milliseconds must not be caught up by the previous panel's question.
  */
  const token = ++voiceToken;
  setTimeout(() => {
    if (token !== voiceToken || isMuted() || speaking !== text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      // Lifting the pitch gets most of the way to young without the chipmunk
      // effect the old 1.15-on-a-default-voice had — the rate matters as much as
      // the pitch, so he stays slow.
      speakCalmly(u, { rate: 0.9, pitch: 1.25 });
      window.speechSynthesis.speak(u);
    } catch { /* ignore — the line is still on screen */ }
  }, 60);
}

/**
 * Speaks one line, replacing whatever Chirpy was already saying — he only
 * ever says one thing at a time, so a new line always wins over the old one
 * rather than queueing behind it.
 */
export function speak(text: string, quiet: boolean, who: Speaker = 'grownup', onEnd?: () => void, feeling = '') {
  if (isMuted() || quiet || !text) return;
  stopSpeaking();

  /*
    CLAIM THE LINE HERE, and this is the bug that made him mute the first
    time he was asked for anything.

    `speaking` was only ever assigned inside `play()`. On the uncached path —
    which is every line the first time it is heard — `speak` called
    `stopSpeaking()` (setting it to null), then `browserVoice()`, which never
    touched it. So when the fetch came back, the guard below read
    `null === text` and threw the audio away. The line was synthesised, paid
    for, cached, and dropped; only a SECOND request for the same text ever
    played it, off the cache.

    Which meant the real voice never spoke on first hearing, and on any device
    where speechSynthesis has no usable voice loaded, the first press of Play
    was simply silent.
  */
  speaking = text;

  const key = `${who}|${feeling}|${text}`;
  const cached = heard.get(key);
  if (cached) { play(cached, text, onEnd, who); return; }

  /*
    THE FEELING VOICE ALWAYS WINS, THE WAY IT DID BEFORE.

    Chirpy's real voice is Gemini — for the child's own mind (`who === 'mind'`)
    it also carries the feeling (scared, excited, sad...). A browser-voice
    fallback was added to cover a slow or cold server, but a Cloud Function
    cold-start plus a fresh TTS synthesis routinely takes well over the few
    seconds the fallback waited, so the browser's flat adult voice pre-empted
    Chirpy on nearly every uncached line — the "mature lady everywhere, no
    feeling" the room had regressed into.

    So the mind voice waits for Gemini, however long it takes, and never lets
    the browser speak over it. A short line of silence before the real,
    feeling-matched voice is the right trade; the wrong grown-up voice is not.
    The grown-up narrator keeps a patient fallback, since a silent narrator on
    a broken server is worse than a plain one.
  */
  const allowBrowserFallback = who !== 'mind';
  let fellBack = false;
  let resolved = false;
  const timeoutId = allowBrowserFallback
    ? setTimeout(() => {
        if (!resolved && speaking === text) { fellBack = true; browserVoice(text); }
      }, 8000)
    : undefined;

  void fetch(VOICE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: VOICES[who], character: who, feeling }),
  })
    .then((r) => {
      if (!r.ok) console.warn(`[chirpy-voice] ${r.status}: ${key.slice(0, 30)}`);
      return r.ok ? r.blob() : null;
    })
    .then((blob) => {
      if (resolved) return;
      if (timeoutId) clearTimeout(timeoutId);
      resolved = true;
      if (fellBack) {
        /* The browser was reading (grown-up only). Swap in the real voice if
           it is still the line on screen and the browser hasn't finished. */
        if (blob) heard.set(key, URL.createObjectURL(blob));
        const stillReading = typeof window !== 'undefined' && window.speechSynthesis?.speaking;
        if (blob && stillReading && !isMuted() && speaking === text) {
          stopSpeaking(); speaking = text; play(heard.get(key)!, text, onEnd, who);
        }
        return;
      }
      /* A non-OK response (429/503 budget or rate limit, a cold-start error)
         resolves normally with blob === null. For the grown-up narrator that
         means fall back to the browser; for the mind voice, stay silent
         rather than break character with the wrong voice. */
      if (!blob) { if (allowBrowserFallback) browserVoice(text); return; }
      const url = URL.createObjectURL(blob);
      heard.set(key, url);
      /* Only if this is still the line on screen. A child who has moved on
         must not be caught up by the previous screen's audio. */
      if (!isMuted() && speaking === text) { stopSpeaking(); speaking = text; play(url, text, onEnd, who); }
    })
    .catch(() => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (allowBrowserFallback && !fellBack && speaking === text) browserVoice(text);
    });
}

/**
 * Fetches a line into the `heard` cache WITHOUT speaking it — so a later
 * `speak()` call for the same text plays instantly off the in-memory blob
 * instead of waiting on a network round trip.
 *
 * Used to warm the cache for lines a child is likely to hear soon but
 * hasn't asked for yet (every affirmation, before they tap a stone). Silent
 * failures are fine here: a line that didn't preload just falls back to the
 * normal fetch-then-browser-voice path inside `speak()`.
 */
export function preload(text: string, who: Speaker = 'grownup', feeling = ''): Promise<void> {
  if (!text || isMuted()) return Promise.resolve();
  const key = `${who}|${feeling}|${text}`;
  if (heard.has(key)) return Promise.resolve();
  return fetch(VOICE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: VOICES[who], character: who, feeling }),
  })
    .then((r) => (r.ok ? r.blob() : null))
    .then((blob) => { if (blob) heard.set(key, URL.createObjectURL(blob)); })
    .catch(() => { /* a preload miss just means speak() falls back as usual */ });
}

/*
  MIND GETS A PITCH LIFT.
  Gemini TTS has no child voice model — every "young girl of about six"
  direction is still performed by an adult voice, so it can read as a woman
  doing a young voice rather than an actual child. Raising playbackRate
  while disabling pitch preservation shifts the pitch up along with it
  (the standard trick for getting a younger voice out of adult audio),
  instead of the usual behaviour where the browser corrects pitch back
  down to keep the rate change transparent.
*/
function applyChildPitch(audio: HTMLAudioElement) {
  audio.playbackRate = 1.18;
  type PitchPreserving = { preservesPitch?: boolean; mozPreservesPitch?: boolean; webkitPreservesPitch?: boolean };
  const a = audio as unknown as PitchPreserving;
  try { a.preservesPitch = false; } catch { /* not supported */ }
  try { a.mozPreservesPitch = false; } catch { /* not supported */ }
  try { a.webkitPreservesPitch = false; } catch { /* not supported */ }
}

function play(url: string, text: string, onEnd?: () => void, who: Speaker = 'grownup') {
  try {
    const audio = new Audio(url);
    if (who === 'mind') applyChildPitch(audio);
    if (onEnd) audio.onended = () => { if (current === audio) onEnd(); };
    current = audio;
    speaking = text;
    void audio.play().catch(() => browserVoice(text));
  } catch { browserVoice(text); }
}

export function stopSpeaking() {
  /* Abandons any utterance still waiting out the cancel in browserVoice —
     without this, a line stopped within those few milliseconds would go on
     to speak over whatever replaced it. */
  voiceToken += 1;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  if (current) { try { current.pause(); } catch { /* ignore */ } current = null; }
  speaking = null;
}

/**
 * Says the child's name out loud once — when they arrive, and then not again
 * until the tab itself is reloaded.
 *
 * A plain module variable, deliberately, and not localStorage or kit/sky's
 * markVisit(): the hub unmounts every time a child steps into a room and
 * mounts again when they come back, which on a normal evening is a dozen
 * times. Component state would greet on every one of those returns, and a
 * stored day-stamp would greet once each morning forever. Neither is what
 * "someone just walked in" means. This resets when the page does, which is.
 */
let greeted = false;

export function greetByName(name: string, quiet: boolean) {
  if (greeted || !name) return;
  greeted = true;
  speak(`Hello, ${name}`, quiet);
}
