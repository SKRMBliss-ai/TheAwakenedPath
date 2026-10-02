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

/** The clip currently playing — carries a real duration and currentTime for the progress bar. */
export function currentClip(): HTMLAudioElement | null { return current; }
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

/**
 * Where a line sits in a story, so the server's narration director can carry
 * the mood over from the page before instead of starting each page cold.
 * `mode` forces a reading (e.g. 'bedtime' for a story's last line).
 */
export interface NarrationContext { title?: string; previous?: string; next?: string; mode?: string }
const VOICES: Record<Speaker, string> = { grownup: 'Enceladus', mind: 'Enceladus', guide: 'Enceladus' };

/**
 * Speaks one line, replacing whatever Chirpy was already saying — he only
 * ever says one thing at a time, so a new line always wins over the old one
 * rather than queueing behind it.
 */
export function speak(text: string, quiet: boolean, who: Speaker = 'grownup', onEnd?: () => void, feeling = '', context?: NarrationContext) {
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

  const key = `${who}|${feeling}|${context ? JSON.stringify(context) : ''}|${text}`;
  const cached = heard.get(key);
  if (cached) { play(cached, text, onEnd); return; }
  if (Date.now() < restingUntil) return;

  /* NO SYSTEM VOICE. The browser's voice used to step in when the server was
     slow or refusing, and children heard a flat adult voice instead of
     Chirpy. Now a line that can't be fetched simply stays on screen. */
  void fetchLine(key, { text, voice: VOICES[who], character: who, feeling, context }).then((url) => {
    if (url && !isMuted() && speaking === text) { stopSpeaking(); speaking = text; play(url, text, onEnd); }
  });
}

/*
  NOTHING IS FETCHED AHEAD ANY MORE. Lines used to be pre-fetched in bulk (every
  thought for a feeling, every affirmation), which on a free Gemini allowance
  spent most of the day recording lines nobody heard. A line is fetched only
  when it is about to be spoken, and two asks for the same line at once share
  one request.
*/
const pending = new Map<string, Promise<string | null>>();
/*
  WHEN THE SERVER SAYS HE IS RESTING — a 503 once Gemini's allowance is spent,
  or a 429 for asking too fast — nothing is asked again until the wait it names
  is over. Every line until then goes straight to the browser voice; a room
  reading ten lines used to send ten requests that were sure to be refused.
*/
let restingUntil = 0;

function fetchLine(key: string, body: Record<string, unknown>): Promise<string | null> {
  const waiting = pending.get(key);
  if (waiting) return waiting;
  const job = fetch(VOICE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => {
      if (r.ok) return r.blob();
      if (r.status === 503 || r.status === 429) {
        const wait = Number(r.headers.get('Retry-After'));
        restingUntil = Date.now() + (wait > 0 ? wait * 1000 : r.status === 429 ? 60_000 : 5 * 60_000);
      }
      void r.text().then((why) => console.warn(`[chirpy-voice] ${r.status}: ${why.slice(0, 120)}`)).catch(() => {});
      return null;
    })
    .then((blob) => {
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      heard.set(key, url);
      return url;
    })
    .catch(() => null)
    .finally(() => pending.delete(key));
  pending.set(key, job);
  return job;
}

function play(url: string, text: string, onEnd?: () => void) {
  try {
    const audio = new Audio(url);
    if (onEnd) audio.onended = () => { if (current === audio) onEnd(); };
    current = audio;
    speaking = text;
    void audio.play().catch(() => { /* autoplay refused — text is on screen */ });
  } catch { /* ignore */ }
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
