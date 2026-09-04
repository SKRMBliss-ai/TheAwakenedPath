/**
 * Speech-to-text for the situation screen's free-text box, via the browser's
 * own SpeechRecognition — no server, no API key, nothing leaves the device
 * any more than typing would. Support is real but partial (Chrome/Edge/most
 * of Safari; not Firefox), so every call site must treat `null` as the
 * normal "not available here" case, not an error — the mic icon simply
 * doesn't render rather than showing a control that does nothing.
 *
 * TypeScript's DOM lib doesn't ship SpeechRecognition types, hence the
 * hand-rolled interfaces below — just the handful of members this file
 * actually touches, not a full copy of the spec.
 */

interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechWindow {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

function getCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSupported(): boolean {
  return getCtor() !== null;
}

/**
 * Starts listening for one utterance and reports it once. Returns the live
 * recognizer so the caller can `.stop()` it early (tapping the mic again),
 * or null if this browser has no SpeechRecognition at all.
 */
export function startListening(
  onResult: (text: string) => void,
  onEnd?: () => void,
): SpeechRecognitionLike | null {
  const Ctor = getCtor();
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => {
    const text = e.results?.[0]?.[0]?.transcript;
    if (typeof text === 'string' && text.trim()) onResult(text.trim());
  };
  rec.onerror = () => onEnd?.();
  rec.onend = () => onEnd?.();

  try {
    rec.start();
  } catch {
    return null;
  }
  return rec;
}
