import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Dictation for a text field, using the browser's own SpeechRecognition
 * (Chrome / Edge / Safari). No library, no API key of ours.
 *
 * Honest about its limits: where the API doesn't exist (`supported` is false)
 * the caller should hide the control rather than show a dead button, and in
 * some browsers the recognition itself runs on the browser maker's speech
 * service — the UI says so next to the button.
 *
 * TypeScript's DOM lib doesn't ship these types, hence the minimal local ones.
 */

interface RecAlternative { transcript: string }
interface RecResult { isFinal: boolean; 0: RecAlternative }
interface RecEvent { results: ArrayLike<RecResult> }
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings, or type instead.',
  'service-not-allowed': 'Speech input isn’t allowed in this browser. You can type instead.',
  'audio-capture': 'No microphone was found. You can type instead.',
  'no-speech': 'Didn’t catch anything. Try again, or type instead.',
  network: 'Speech input needs a connection right now. You can type instead.',
};

/**
 * @param value    the field's current text (dictation is appended to it)
 * @param onChange receives the field's new text as the person speaks
 */
export function useSpeechInput(value: string, onChange: (text: string) => void) {
  const [supported] = useState(() => getCtor() !== null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor || recRef.current) return;
    const rec = new Ctor();
    // What was already typed stays; speech is added after it.
    const base = valueRef.current.trim();
    rec.lang = navigator.language || 'en-IN';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let spoken = '';
      for (let i = 0; i < e.results.length; i++) spoken += e.results[i][0].transcript;
      spoken = spoken.replace(/\s+/g, ' ').trim();
      onChangeRef.current(base && spoken ? `${base} ${spoken}` : base || spoken);
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted') setError(ERRORS[e.error] ?? 'Speech input stopped unexpectedly. You can type instead.');
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
    };
    setError(null);
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setError('Speech input couldn’t start. You can type instead.');
    }
  }, []);

  // Never leave the microphone open after the screen is gone.
  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, error, start, stop, toggle: listening ? stop : start };
}
