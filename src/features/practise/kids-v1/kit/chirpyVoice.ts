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

let cachedVoice: SpeechSynthesisVoice | null | undefined;

/**
 * A calm female voice, best-first.
 *
 * The first pass asked for /child|kids|junior/ and otherwise took whatever
 * English voice happened to come first in the list. On most devices no
 * child voice exists, so what actually played was the platform default —
 * frequently male, frequently brisk, and grating over a whole session.
 *
 * Chirpy is company on a screen that keeps asking a child to slow down and
 * notice something, so he should sound like someone sitting next to them.
 * The named voices below are the good calm female ones across the platforms
 * this runs on, checked in order. The generic /female/ match comes last on
 * purpose: a thin eSpeak voice that merely has "female" in its label would
 * otherwise beat Samantha sitting further down the list.
 */
const CALM_FEMALE = [
  /Samantha/i,
  /Google UK English Female/i,
  /Google US English/i,
  /Serena/i,
  /Moira/i,
  /Fiona/i,
  /Tessa/i,
  /Karen/i,
  /Microsoft (Aria|Jenny|Sonia|Libby|Zira)/i,
  /female/i,
];

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  cachedVoice =
    CALM_FEMALE.reduce<SpeechSynthesisVoice | undefined>(
      (found, re) => found ?? pool.find((v) => re.test(v.name)),
      undefined,
    ) ??
    pool[0] ??
    null;
  return cachedVoice;
}

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Speaks one line, replacing whatever Chirpy was already saying — he only
 * ever says one thing at a time, so a new line always wins over the old one
 * rather than queueing behind it.
 */
export function speak(text: string, quiet: boolean) {
  if (!isVoiceSupported() || isMuted() || quiet || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Slow, and barely above neutral. It was 0.92/1.15, which read as
    // bright and hurried once you'd heard it a dozen times in a sitting.
    // Unhurried is the whole point of the room he's standing in.
    u.rate = 0.84;
    u.pitch = 1.02;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch { /* ignore — the line is still on screen */ }
}

export function stopSpeaking() {
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
}
