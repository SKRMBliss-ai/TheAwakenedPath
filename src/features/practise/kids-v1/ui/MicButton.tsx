import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';
import { CHROME } from './chrome';
import { isSpeechSupported, startListening } from '../kit/speech';
import { startRecording, type VoiceTake } from '../kit/voiceStore';

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
  onVoice,
  accent = '#FFD98A',
  className = '',
}: {
  /** One utterance, already trimmed. Append it; never overwrite. */
  onText: (text: string) => void;
  /**
   * Optional. When given, the microphone is ALSO recorded and the clip kept
   * on the device, and this is called with its id once it's stored — so a
   * child can hear themselves say it months later (see kit/voiceStore).
   *
   * Opt-in per call site rather than on everywhere, because keeping audio is
   * a meaningfully different promise from keeping text and only the screens
   * that hold a child's own account of something want to make it. Every
   * failure path is silent: no recorder, no permission, no room on the disk,
   * and this simply never fires while the transcript arrives as usual.
   */
  onVoice?: (clipId: string) => void;
  accent?: string;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const rec = useRef<ReturnType<typeof startListening>>(null);
  const take = useRef<VoiceTake | null>(null);

  /**
   * The recogniser keeps whichever callback it was handed when it started,
   * and a result can be seconds behind that. Held in a ref so what finally
   * runs is always the current one — otherwise anything the child typed
   * while the mic was open would be overwritten by what the box held when
   * they tapped it.
   */
  const latest = useRef(onText);
  useEffect(() => { latest.current = onText; });
  const latestVoice = useRef(onVoice);
  useEffect(() => { latestVoice.current = onVoice; });

  // A recogniser left running after the screen has gone keeps the mic light
  // on and the child has nothing left to tap to stop it. The recorder is torn
  // down alongside it for the same reason — an abandoned MediaRecorder holds
  // the microphone open with nothing on screen to explain why.
  useEffect(() => () => {
    rec.current?.stop();
    rec.current = null;
    void take.current?.stop();
    take.current = null;
  }, []);

  if (!isSpeechSupported()) return null;

  /** Ends the take, if there was one, and hands the clip id to the caller. */
  const finishTake = () => {
    const t = take.current;
    take.current = null;
    if (!t) return;
    void t.stop().then((id) => { if (id) latestVoice.current?.(id); });
  };

  const toggle = () => {
    if (listening) {
      rec.current?.stop();
      rec.current = null;
      finishTake();
      setListening(false);
      return;
    }
    const started = startListening((t) => latest.current(t), () => {
      rec.current = null;
      finishTake();
      setListening(false);
    });
    if (started) {
      rec.current = started;
      setListening(true);
      // Fired off alongside, never awaited: the recogniser is already
      // listening and the child is already talking. If the recording never
      // starts, or the take lands after they've stopped, the transcript is
      // completely unaffected.
      if (latestVoice.current) {
        void startRecording().then((t) => {
          if (rec.current) take.current = t;
          // Stopped talking before the mic was granted — don't leave a
          // recorder running against a screen that has moved on.
          else void t?.stop();
        });
      }
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
