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
export function speak(text: string, quiet: boolean) {
  if (!isVoiceSupported() || isMuted() || quiet || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // CHIRPY SOUNDS YOUNG, BUT NOT SQUEAKY.
    //
    // No mainstream platform ships a child voice for English, so lib/calmVoice
    // asks for one, finds none, and hands back a calm female voice instead.
    // Lifting its pitch to 1.25 gets most of the way to young without the
    // chipmunk effect the old 1.15-on-a-default-voice had — the rate matters
    // as much as the pitch, and he stays slow.
    //
    // A real child's voice needs recorded lines. The check-in has the hook
    // for that already (AUDIO_MANIFEST in kids/checkin/voice.ts).
    speakCalmly(u, { rate: 0.9, pitch: 1.25 });
    window.speechSynthesis.speak(u);
  } catch { /* ignore — the line is still on screen */ }
}

export function stopSpeaking() {
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
}
