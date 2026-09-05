/**
 * PICKING A CALM FEMALE VOICE OUT OF speechSynthesis.
 *
 * Three places in this app speak (Chirpy in the kids gym, the check-in
 * narrator, the meditation fallback) and all three were getting a male
 * voice despite asking for a female one. Two reasons, both worth writing
 * down because both are easy to reintroduce:
 *
 * 1. getVoices() IS EMPTY ON FIRST CALL in Chrome. The list arrives
 *    asynchronously and the browser fires `voiceschanged` when it does.
 *    Code that calls getVoices() once at module load, caches the result and
 *    never looks again ends up caching "no voice", which means the
 *    utterance goes out with `voice` unset — and an unset voice is the
 *    platform default, which on most devices is male. Every "why is it
 *    still male" bug traces back here. So: never cache an empty list, and
 *    re-pick when the event fires.
 *
 * 2. MATCHING FEMALE NAMES IS NOT ENOUGH ON ITS OWN. On Android the voices
 *    are often called nothing more than "English (United Kingdom)" — no
 *    name, no gender, nothing to match against. When no pattern hits, the
 *    old code fell through to voices[0], and voices[0] is frequently male.
 *    Excluding the known male names matters more than matching the female
 *    ones, because it's what governs that fallback.
 *
 * There is no API for a voice's gender, so this is a name list and will
 * never be perfect. `confident` says whether we actually recognised a
 * female voice or just avoided the male ones, which lets a caller nudge the
 * pitch up when it's working blind.
 */

/** Good calm female voices across the platforms this runs on, best first. */
const FEMALE = [
  /Samantha/i,
  /Google UK English Female/i,
  /Google US English$/i,
  /Serena/i,
  /Moira/i,
  /Fiona/i,
  /Tessa/i,
  /Karen/i,
  /Microsoft (Aria|Jenny|Sonia|Libby|Zira|Michelle|Ava|Emma)/i,
  /Martha|Amelie|Anna|Nicky|Allison|Susan|Victoria|Kathy|Ava|Joanna|Salli|Kendra/i,
  /\bfemale\b/i,
];

/**
 * Voices to refuse outright. This is the half that actually fixes the bug:
 * it governs which voice wins when nothing in FEMALE matches, which is the
 * common case on Android.
 */
const MALE = [
  /\bmale\b/i,
  /Daniel|Alex|Fred|Ralph|Aaron|Arthur|Gordon|Oliver|Rishi|Tom|Lee|Reed/i,
  /Microsoft (David|Mark|George|Guy|Ryan|Christopher|Eric|Roger|Brian|James)/i,
  /Google (UK|US) English Male/i,
];

/**
 * Actual child voices, where a platform has one.
 *
 * Mostly it does not. The Web Speech API exposes whatever the OS ships, and
 * no mainstream desktop or mobile platform ships a child voice for English
 * — the earlier code searched for one and, finding nothing, silently fell
 * through to the platform default. It is still worth asking, because some
 * Android TTS engines do install them and a real one beats anything we can
 * fake with pitch. Recorded lines are the only reliable answer; the kids
 * check-in already has the hook for them (AUDIO_MANIFEST).
 */
const CHILD = [/child/i, /\bkid(s)?\b/i, /junior/i, /\bboy\b/i];

export interface CalmVoice {
  voice: SpeechSynthesisVoice | null;
  /** True when a voice was recognised by name, false when we only avoided the male ones. */
  confident: boolean;
  /** True when the platform actually gave us a child voice. */
  child: boolean;
}

function choose(): CalmVoice {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { voice: null, confident: false, child: false };
  }
  const all = window.speechSynthesis.getVoices() ?? [];
  // An empty list means it hasn't loaded yet, NOT that there are no voices.
  // Returning early without caching is the whole point — see the note above.
  if (!all.length) return { voice: null, confident: false, child: false };

  const en = all.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : all;

  for (const re of CHILD) {
    const hit = pool.find((v) => re.test(v.name));
    if (hit) return { voice: hit, confident: true, child: true };
  }

  for (const re of FEMALE) {
    const hit = pool.find((v) => re.test(v.name));
    if (hit) return { voice: hit, confident: true, child: false };
  }

  // Nothing recognisable. Take the first voice that isn't a known male one,
  // rather than whatever happens to sit at index 0.
  const notMale = pool.find((v) => !MALE.some((re) => re.test(v.name)));
  return { voice: notMale ?? pool[0] ?? null, confident: false, child: false };
}

let cached: CalmVoice | null = null;

/** The voice to use, re-resolved until the browser has actually given us a list. */
export function calmVoice(): CalmVoice {
  if (cached?.voice) return cached;
  cached = choose();
  return cached;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Warm the list, and take the real answer when it arrives.
  choose();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cached = choose();
  });
}

/**
 * Applies the voice and a calm delivery to an utterance.
 *
 * `rate` and `pitch` are the values for a voice we recognised. When we
 * didn't, the pitch goes up a little: we may well be speaking through a
 * default voice that is male, and a few percent of pitch is the only lever
 * left once the voice itself can't be chosen.
 */
export function speakCalmly(
  u: SpeechSynthesisUtterance,
  { rate = 0.84, pitch = 1 }: { rate?: number; pitch?: number } = {},
) {
  const { voice, confident, child } = calmVoice();
  if (voice) u.voice = voice;
  u.rate = rate;
  // A real child voice needs no help. Otherwise, when we couldn't even
  // recognise the voice by name, lift the pitch: we may be speaking through
  // a male default and there is no other lever left.
  u.pitch = child ? pitch : confident ? pitch : pitch + 0.18;
}
