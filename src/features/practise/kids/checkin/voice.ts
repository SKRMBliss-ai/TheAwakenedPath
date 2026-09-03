/**
 * Two-voice speech for the check-in — ported from the prototype's
 * pickVoices()/say()/sayChirpy(). No recorded audio exists yet (see
 * MIND_GYM_AUDIO_SPEC.md — it's a sourcing brief, not delivered assets), so
 * every line falls back to the browser's speech synthesis using two
 * different voices, so the narrator and Chirpy never sound alike.
 *
 * Built as a manifest lookup from day one per the build brief §5: an empty
 * AUDIO_MANIFEST today, real recordings slot in later by line ID with zero
 * changes to call sites.
 */

/** Line IDs match docs/.../MIND_GYM_VOICE_SCRIPT.md, e.g. "p01.01", "intro.07". */
export const AUDIO_MANIFEST: Record<string, string> = {};

let voices: SpeechSynthesisVoice[] = [];
let narrator: SpeechSynthesisVoice | null = null;
let chirpyVoice: SpeechSynthesisVoice | null = null;

function pickVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  voices = window.speechSynthesis.getVoices() ?? [];
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  const find = (re: RegExp) => pool.find((v) => re.test(v.name));
  narrator = find(/Daniel|Google UK English Male|Arthur|Male/i) ?? pool[0] ?? null;
  chirpyVoice = find(/Karen|Samantha|Google UK English Female|Martha|Tessa|Female/i)
    ?? pool.find((v) => v !== narrator) ?? narrator;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  pickVoices();
  window.speechSynthesis.onvoiceschanged = pickVoices;
}

/**
 * Speaks a line. `lineId` looks up a real recording first; `fallbackText` is
 * what plays (via speech synthesis) until that recording exists.
 */
export function say(
  fallbackText: string | null | undefined,
  opts: { who?: 'narrator' | 'chirpy'; lineId?: string; quiet?: boolean; muted?: boolean } = {},
) {
  if (opts.muted || !fallbackText) return;
  const recorded = opts.lineId ? AUDIO_MANIFEST[opts.lineId] : undefined;
  if (recorded) {
    void new Audio(recorded).play().catch(() => { /* autoplay policy — stay silent */ });
    return;
  }
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fallbackText.replace(/<[^>]+>/g, ''));
    if (opts.who === 'chirpy') {
      if (chirpyVoice) u.voice = chirpyVoice;
      u.rate = 1.14;
      u.pitch = 1.75; // lighter, quicker, never authoritative
    } else {
      if (narrator) u.voice = narrator;
      u.rate = opts.quiet ? 0.8 : 0.92;
      u.pitch = opts.quiet ? 0.92 : 1;
    }
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export function stopSpeech() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
