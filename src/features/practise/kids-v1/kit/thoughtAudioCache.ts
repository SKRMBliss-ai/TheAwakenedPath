import { speak, stopSpeaking } from './chirpyVoice';

/*
  Reads thoughts out one after another in the mind's voice, in the child's
  feeling. Ten at most: the Thought panel reads the clouds on screen, not the
  whole pool behind them, and each line is fetched only when its turn comes.
*/

export const THOUGHTS_READ = 10;

let token = 0;

export function playThoughtAudios(texts: string[], feeling: string, onComplete?: () => void) {
  const mine = ++token;
  const list = texts.slice(0, THOUGHTS_READ);
  let i = 0;
  const next = () => {
    if (mine !== token) return;
    if (i >= list.length) { onComplete?.(); return; }
    const text = list[i++];
    speak(text, false, 'mind', () => window.setTimeout(next, 700), feeling);
  };
  next();
}

export function stopThoughtAudio() {
  token += 1;
  stopSpeaking();
}
