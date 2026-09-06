import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';
import { CHROME } from './chrome';
import { isSpeechSupported, startListening } from '../kit/speech';

/**
 * "SAY IT INSTEAD OF TYPING" — on every box in the app that asks for words.
 *
 * Typing is the single biggest tax this app charges. A seven-year-old who
 * has just worked out something true about their day then has to hunt for
 * it letter by letter on a phone keyboard, and what comes out is three
 * words because three words is all the typing they could face. The thought
 * was bigger than that. Speaking gets the whole of it.
 *
 * It lived inside the check-in's situation box and nowhere else, which is
 * why this is a component rather than a fourth copy of the same twenty
 * lines: the recogniser, its lifecycle and the pulsing button are all in
 * here, and a box wanting dictation adds one tag.
 *
 * SUPPORT IS PARTIAL (Chrome/Edge/most of Safari; not Firefox — see
 * kit/speech.ts), so where there is no SpeechRecognition this renders
 * nothing at all. A mic that does nothing when a child taps it is worse
 * than no mic, because they will try it more than once before concluding
 * it is them rather than the app.
 *
 * IT ADDS, IT DOES NOT REPLACE. What comes back is appended to whatever is
 * already in the box, so speaking after typing (or twice in a row) never
 * eats what was there. A child cannot get their sentence back once it's
 * gone, and they will not trust the mic again if it takes one.
 */
export function MicButton({
  onText,
  accent = '#FFD98A',
  className = '',
}: {
  /** One utterance, already trimmed. Append it; never overwrite. */
  onText: (text: string) => void;
  accent?: string;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const rec = useRef<ReturnType<typeof startListening>>(null);

  /**
   * The recogniser keeps whichever callback it was handed when it started,
   * and a result can be seconds behind that. Held in a ref so what finally
   * runs is always the current one — otherwise anything the child typed
   * while the mic was open would be overwritten by what the box held when
   * they tapped it.
   */
  const latest = useRef(onText);
  useEffect(() => { latest.current = onText; });

  // A recogniser left running after the screen has gone keeps the mic light
  // on and the child has nothing left to tap to stop it.
  useEffect(() => () => { rec.current?.stop(); rec.current = null; }, []);

  if (!isSpeechSupported()) return null;

  const toggle = () => {
    if (listening) {
      rec.current?.stop();
      rec.current = null;
      setListening(false);
      return;
    }
    const started = startListening((t) => latest.current(t), () => {
      rec.current = null;
      setListening(false);
    });
    if (started) {
      rec.current = started;
      setListening(true);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      aria-label={listening ? 'Stop listening' : 'Say it instead of typing'}
      aria-pressed={listening}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${className}`}
      animate={listening ? { boxShadow: [`0 0 0 0 ${accent}66`, `0 0 0 10px ${accent}00`] } : undefined}
      transition={listening ? { repeat: Infinity, duration: 1.4 } : undefined}
      style={{
        color: listening ? '#1B1630' : CHROME.text,
        background: listening ? accent : CHROME.pillSelected,
        border: `1px solid ${CHROME.pillBorder}`,
      }}
    >
      {listening ? <Square size={15} fill="currentColor" /> : <Mic size={18} />}
    </motion.button>
  );
}
