/**
 * Two-voice speech for the check-in — ported from the prototype's
 * pickVoices()/say()/sayChirpy(). No recorded audio exists yet (see
 * MIND_GYM_AUDIO_SPEC.md — it's a sourcing brief, not delivered assets), so
 * every line falls back to the browser's speech synthesis using two
 * different voices, so the narrator and Chirpy never sound alike. Both are
 * calm female voices — see pickVoices() for why.
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

/**
 * WHY BOTH VOICES ARE FEMALE AND SLOW NOW.
 *
 * The first pass gave the narrator a male voice and Chirpy pitch 1.75 at
 * rate 1.14, which on most devices comes out squeaky and hurried. Children
 * are being asked here to slow down and notice something, and a fast bright
 * voice pulls in exactly the wrong direction — it reads as a cartoon
 * announcer rather than someone sitting next to you.
 *
 * So the narrator is now a calm female voice, unhurried, pitched slightly
 * low. Chirpy keeps a separate voice so the two never blur together, but he
 * is only a little lighter and quicker than she is, not a chipmunk.
 *
 * The names below are ordered best-first and matched in order, because
 * browser voice lists are wildly uneven. Named voices are checked before the
 * generic /female/ catch-all, otherwise a poor eSpeak voice that merely has
 * "female" in its label wins over Samantha sitting further down the list.
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
  /Martha/i,
  /female/i,
];

/** A second female voice for Chirpy, so he never sounds like the narrator. */
const CHIRPY_FEMALE = [
  /Google UK English Female/i,
  /Karen/i,
  /Tessa/i,
  /Fiona/i,
  /Microsoft (Jenny|Libby|Zira)/i,
  /Samantha/i,
  /Moira/i,
  /female/i,
];

function pickVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  voices = window.speechSynthesis.getVoices() ?? [];
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  const first = (patterns: RegExp[], exclude?: SpeechSynthesisVoice | null) => {
    for (const re of patterns) {
      const hit = pool.find((v) => v !== exclude && re.test(v.name));
      if (hit) return hit;
    }
    return null;
  };
  narrator = first(CALM_FEMALE) ?? pool[0] ?? null;
  chirpyVoice = first(CHIRPY_FEMALE, narrator)
    ?? pool.find((v) => v !== narrator)
    ?? narrator;
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
      // Lighter and a touch quicker than the narrator so he is clearly
      // someone else — but nowhere near the old 1.14/1.75, which turned
      // every line of his into a squeak.
      u.rate = 0.95;
      u.pitch = 1.2;
    } else {
      if (narrator) u.voice = narrator;
      // Slow and slightly low. The quiet state goes slower still.
      u.rate = opts.quiet ? 0.72 : 0.84;
      u.pitch = opts.quiet ? 0.86 : 0.94;
    }
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export function stopSpeech() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
