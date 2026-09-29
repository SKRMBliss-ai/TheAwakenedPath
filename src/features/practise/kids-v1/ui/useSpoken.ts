import { useEffect } from 'react';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import { useQuiet } from './quiet';

/**
 * READ THIS LINE OUT LOUD.
 *
 * The same five lines that were sitting inside ui/scene's Chirpy, extracted,
 * because a six-year-old who cannot yet read is locked out of every screen
 * that isn't him — the room's question, the note from home, the season that
 * just closed, his own words coming back. Voicing one line per screen turns
 * the whole app from something you read into something you're told.
 *
 * ONE LINE PER SCREEN, and that is a hard limit rather than a guideline.
 * `speak` cancels whatever was already talking, so two of these mounted at
 * once produce a race: the child hears the first half of one sentence and
 * then the whole of another. Anything secondary on a screen gets a
 * SpeakButton instead, which is tapped rather than automatic.
 *
 * Both silences are honoured inside `speak` itself — the device mute and the
 * quiet state — so a caller never has to check.
 */
export function useSpoken(text: string | null | undefined) {
  const quiet = useQuiet();
  useEffect(() => {
    if (text) speak(text, quiet);
    return () => stopSpeaking();
  }, [text, quiet]);
}
