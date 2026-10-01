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
 * Three speakers. The grown-up narrates the app; Chirpy is the child's own mind,
 * heard only when the child's thoughts are being said out loud; the guide is a
 * deeper, slower voice for breathing and meditation in the reflection room.
 */
export type Speaker = 'grownup' | 'mind' | 'guide';
const VOICES: Record<Speaker, string> = { grownup: 'Enceladus', mind: 'Enceladus', guide: 'Enceladus' };

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
      // Low and slow, to stay close to the deep narrator it stands in for.
      speakCalmly(u, { rate: 0.85, pitch: 0.8 });
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
  if (cached) { play(cached, text, onEnd); return; }

  /*
    GEMINI FIRST, BROWSER ONLY AS A LAST RESORT — AND LATE ENOUGH NEVER TO
    PRE-EMPT IT.

    Chirpy's real voice is Gemini; for the child's own mind (`who === 'mind'`)
    it also carries the feeling (scared, excited, sad...). Two failures have to
    be avoided at once:

      - the browser's flat adult voice jumping in and reading over Chirpy on
        every slow line (the "mature lady everywhere, no feeling" regression), and
      - total silence when the server is genuinely down or out of budget.

    Now that a line is cached after its first hearing and served straight back,
    the real voice returns in well under a second for anything heard before —
    so a long fallback delay almost never fires. The browser voice only speaks
    when the server truly does not answer, where a low, slow browser voice beats
    nothing. The mind voice is given the longer leash, since its feeling is the
    whole point and it is worth waiting for.
  */
  const fallbackDelay = who === 'mind' ? 10000 : 8000;
  let fellBack = false;
  let resolved = false;
  const timeoutId: number | undefined = setTimeout(() => {
    if (!resolved && speaking === text) { fellBack = true; browserVoice(text); }
  }, fallbackDelay) as unknown as number;

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
        /* The browser had already started reading. Swap in the real voice if
           it is still the line on screen and the browser hasn't finished. */
        if (blob) heard.set(key, URL.createObjectURL(blob));
        const stillReading = typeof window !== 'undefined' && window.speechSynthesis?.speaking;
        if (blob && stillReading && !isMuted() && speaking === text) {
          stopSpeaking(); speaking = text; play(heard.get(key)!, text, onEnd);
        }
        return;
      }
      /* A non-OK response (429/503 budget or rate limit, a cold-start error)
         resolves normally with blob === null — the server gave us nothing, so
         fall back to the browser rather than leave the child in silence. */
      if (!blob) { browserVoice(text); return; }
      const url = URL.createObjectURL(blob);
      heard.set(key, url);
      /* Only if this is still the line on screen. A child who has moved on
         must not be caught up by the previous screen's audio. */
      if (!isMuted() && speaking === text) { stopSpeaking(); speaking = text; play(url, text, onEnd); }
    })
    .catch(() => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (!fellBack && speaking === text) browserVoice(text);
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
  EVERY LINE GETS A LITTLE MORE DEPTH.
  Slowing playback slightly with pitch preservation turned off lowers the
  voice along with it, which adds weight without another synthesis.
*/
function applyDepth(audio: HTMLAudioElement) {
  audio.playbackRate = 0.88;
  type PitchPreserving = { preservesPitch?: boolean; mozPreservesPitch?: boolean; webkitPreservesPitch?: boolean };
  const a = audio as unknown as PitchPreserving;
  try { a.preservesPitch = false; } catch { /* not supported */ }
  try { a.mozPreservesPitch = false; } catch { /* not supported */ }
  try { a.webkitPreservesPitch = false; } catch { /* not supported */ }
}

/*
  A BASS BOOST ON THE WAY TO THE SPEAKER.
  Lowering the pitch only goes so far before it sounds slowed down; most of
  what reads as "depth" is the chest resonance under 250Hz, which small
  speakers lose. So the low end is lifted and the hiss at the top is eased
  off. Only used once the audio context is running (it needs a tap first):
  an element wired into a suspended context would play silently.
*/
let depthCtx: AudioContext | null = null;
function withBass(audio: HTMLAudioElement) {
  try {
    depthCtx ??= new AudioContext();
    if (depthCtx.state !== 'running') { void depthCtx.resume(); return; }
    const low = depthCtx.createBiquadFilter();
    low.type = 'lowshelf'; low.frequency.value = 220; low.gain.value = 7;
    const warmth = depthCtx.createBiquadFilter();
    warmth.type = 'peaking'; warmth.frequency.value = 130; warmth.Q.value = 0.9; warmth.gain.value = 3;
    const high = depthCtx.createBiquadFilter();
    high.type = 'highshelf'; high.frequency.value = 5000; high.gain.value = -4;
    const level = depthCtx.createGain();
    level.gain.value = 0.8;
    depthCtx.createMediaElementSource(audio).connect(low);
    low.connect(warmth).connect(high).connect(level).connect(depthCtx.destination);
  } catch { /* plays without the boost */ }
}

function play(url: string, text: string, onEnd?: () => void) {
  try {
    const audio = new Audio(url);
    applyDepth(audio);
    withBass(audio);
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
