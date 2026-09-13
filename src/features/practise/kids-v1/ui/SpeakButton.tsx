import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { CHROME } from './chrome';
import { isVoiceSupported, speak, stopSpeaking } from '../kit/chirpyVoice';
import { useQuiet } from './quiet';

/**
 * "READ IT TO ME."
 *
 * The counterpart to useSpoken: one line per screen reads itself, and
 * EVERYTHING ELSE gets one of these. A pre-reader can then hear any text in
 * the app without the app talking over itself — which is what happens the
 * moment two things decide to auto-speak, since speechSynthesis has one
 * mouth and a new utterance cancels the old one.
 *
 * It is also the honest answer to "voice everything". Reading a whole screen
 * aloud unprompted is not accessibility, it's a lecture: the child who can
 * read is talked at, and the child who can't still can't choose what they
 * want repeated. A small speaker next to a sentence puts that choice where
 * it belongs.
 *
 * RENDERS NOTHING where the browser has no speechSynthesis, or in the quiet
 * state. A control that does nothing when a child taps it is worse than no
 * control, because they will try it more than once before blaming themselves.
 */
export function SpeakButton({
  text,
  accent = '#FFD98A',
  label = 'Read it to me',
}: {
  text: string;
  accent?: string;
  label?: string;
}) {
  const quiet = useQuiet();
  const [saying, setSaying] = useState(false);

  if (quiet || !isVoiceSupported() || !text) return null;

  const say = () => {
    if (saying) { stopSpeaking(); setSaying(false); return; }
    speak(text, false);
    setSaying(true);
    // speechSynthesis fires no reliable "done" on every platform, so the
    // pressed look is timed off the length of the line instead — roughly
    // the rate lib/calmVoice asks for. Being a little out is harmless; a
    // button stuck in the pressed state forever is not.
    window.setTimeout(() => setSaying(false), Math.min(20000, 900 + text.length * 75));
  };

  return (
    <button
      type="button"
      onClick={say}
      aria-label={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
      style={{
        background: saying ? accent : 'rgba(255,255,255,0.08)',
        border: `1px solid ${saying ? accent : CHROME.pillBorder}`,
        color: saying ? '#1B1630' : CHROME.textSoft,
      }}
    >
      <Volume2 size={16} />
    </button>
  );
}
