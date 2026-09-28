import { db } from '../../../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { thoughtsFor, type FeelingKey } from './storyLabContent';
import { isMuted } from '../../../../lib/sfx';

const THOUGHTS_COLLECTION = 'thought-audio-cache';
const CACHE_VERSION = 1;

interface CachedThoughtAudio {
  id: string;
  feeling: FeelingKey;
  text: string;
  audioUrl: string;
  timestamp: any;
  version: number;
}

let currentPlayingToken = 0;
let currentAudio: HTMLAudioElement | null = null;

/**
 * Generates audio blob for a thought text using the chirpy voice endpoint with whisper tone.
 */
async function generateThoughtAudio(text: string): Promise<Blob> {
  const endpoint = 'https://awakened-path-2026.web.app/api/chirpy-voice';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        character: 'mind',
        voice: 'Leda',
        tone: 'whisper',
      }),
    });

    if (!response.ok) throw new Error(`Voice endpoint returned ${response.status}`);

    return await response.blob();
  } catch (error) {
    console.error('Failed to generate thought audio:', error);
    throw error;
  }
}

/**
 * Caches a thought's audio in Firestore if not already cached.
 */
export async function cacheThoughtAudio(feeling: FeelingKey, text: string): Promise<string | null> {
  const cacheId = `${feeling}:${text}`.replace(/\s+/g, '_').toLowerCase().slice(0, 100);

  try {
    const docRef = doc(db, THOUGHTS_COLLECTION, cacheId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cached = docSnap.data() as CachedThoughtAudio;
      if (cached.version === CACHE_VERSION) {
        return cached.audioUrl;
      }
    }

    // Generate audio blob for this thought
    const blob = await generateThoughtAudio(text);

    // Store blob in Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `thought-audio/${feeling}/${cacheId}.wav`);
    await uploadBytes(storageRef, blob, { contentType: 'audio/wav' });

    // Get the download URL
    const audioUrl = `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/${encodeURIComponent(`thought-audio/${feeling}/${cacheId}.wav`)}?alt=media`;

    // Store metadata in Firestore
    await setDoc(docRef, {
      id: cacheId,
      feeling,
      text,
      audioUrl,
      timestamp: serverTimestamp(),
      version: CACHE_VERSION,
    } as CachedThoughtAudio);

    return audioUrl;
  } catch (error) {
    console.error('Error caching thought audio:', error);
    return null;
  }
}

/**
 * Preloads all thought audio for a given feeling.
 */
export async function preloadThoughtAudios(feeling: FeelingKey): Promise<Map<string, string>> {
  const audioMap = new Map<string, string>();
  const thoughts = thoughtsFor(feeling);

  for (const thought of thoughts) {
    const url = await cacheThoughtAudio(feeling, thought.text);
    if (url) {
      audioMap.set(thought.text, url);
    }
  }

  return audioMap;
}

/**
 * Stops the current playing audio.
 */
export function stopThoughtAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  currentPlayingToken++;
}

/**
 * Plays thought audio files one at a time.
 * Returns a token that can be used to cancel playback.
 */
export function playThoughtAudios(
  audioUrls: string[],
  onComplete?: () => void
): number {
  stopThoughtAudio();

  if (audioUrls.length === 0 || isMuted()) {
    return ++currentPlayingToken;
  }

  const token = ++currentPlayingToken;
  let currentIndex = 0;

  const playNext = () => {
    if (token !== currentPlayingToken) return;
    if (currentIndex >= audioUrls.length) {
      currentAudio = null;
      onComplete?.();
      return;
    }

    currentAudio = new Audio(audioUrls[currentIndex]);
    currentAudio.onended = () => {
      currentIndex++;
      playNext();
    };

    currentAudio.onerror = () => {
      console.error('Error playing thought audio:', audioUrls[currentIndex]);
      currentIndex++;
      playNext();
    };

    currentAudio.play().catch(err => {
      console.error('Failed to play audio:', err);
      currentIndex++;
      playNext();
    });
  };

  playNext();
  return token;
}

/**
 * Hook-friendly cancel function for thought audio playback.
 */
export function createThoughtAudioController() {
  return {
    play: playThoughtAudios,
    stop: stopThoughtAudio,
  };
}
