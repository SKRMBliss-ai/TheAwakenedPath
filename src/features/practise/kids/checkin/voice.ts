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

import { calmVoice } from '../../../../lib/calmVoice';

/**
 * BOTH VOICES ARE CALM AND FEMALE NOW.
 *
 * The first pass gave the narrator a male voice and ran Chirpy at rate
 * 1.14, pitch 1.75, which on most devices comes out squeaky and hurried.
 * Children are being asked here to slow down and notice something, and a
 * fast bright voice pulls the other way.
 *
 * Choosing the voice is lib/calmVoice's job — shared with the kids gym and
 * the meditation fallback, because all three had the same bug: a voice list
 * that is empty on the first call, cached as "none", leaving the platform
 * default (usually male) in place.
 *
 * Chirpy is now separated from the narrator by pitch and rate rather than
 * by a second voice. On Android there is often only one English voice
 * installed, so a second one cannot be relied on to exist.
 */

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
    const { voice, confident } = calmVoice();
    if (voice) u.voice = voice;
    // When the voice couldn't be recognised by name it may well be the
    // platform default, which is often male. Pitch is the only lever left
    // at that point, so everything shifts up a little.
    const lift = confident ? 0 : 0.18;
    if (opts.who === 'chirpy') {
      // Lighter and a touch quicker than the narrator so he is clearly
      // someone else — but nowhere near the old 1.14/1.75, which turned
      // every line of his into a squeak.
      u.rate = 0.95;
      u.pitch = 1.2 + lift;
    } else {
      // Slow and slightly low. The quiet state goes slower still.
      u.rate = opts.quiet ? 0.72 : 0.84;
      u.pitch = (opts.quiet ? 0.86 : 0.94) + lift;
    }
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export function stopSpeech() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
