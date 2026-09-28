import { thoughtsFor, type FeelingKey } from './storyLabContent';
import { preload, speak, stopSpeaking } from './chirpyVoice';

/*
  The voice Function keeps the permanent copy of every line (Firestore +
  Storage, written with admin rights). A child's browser is not allowed to
  write there, so all this does is warm the in-memory cache and then read the
  thoughts out one after another in the mind's voice, in the child's feeling.
*/

let token = 0;

export async function preloadThoughtAudios(feeling: FeelingKey): Promise<string[]> {
  const texts = thoughtsFor(feeling).map((t) => t.text);
  for (let i = 0; i < texts.length; i += 4) {
    await Promise.all(texts.slice(i, i + 4).map((text) => preload(text, 'mind', feeling)));
  }
  return texts;
}

export function playThoughtAudios(texts: string[], feeling: string, onComplete?: () => void) {
  const mine = ++token;
  let i = 0;
  const next = () => {
    if (mine !== token) return;
    if (i >= texts.length) { onComplete?.(); return; }
    const text = texts[i++];
    speak(text, false, 'mind', () => window.setTimeout(next, 700), feeling);
  };
  next();
}

export function stopThoughtAudio() {
  token += 1;
  stopSpeaking();
}
