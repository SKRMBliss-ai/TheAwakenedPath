import { isMuted } from '../../../../lib/sfx';

let context: AudioContext | undefined;
let lastBell = 0;
/** Soft two-note doorbell, shared by hover, focus and touch. */
export function playDoorbell() {
  if (isMuted() || typeof window === 'undefined' || Date.now() - lastBell < 650) return;
  lastBell = Date.now();
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
    const now = context.currentTime;
    for (const [delay, frequency] of [[0, 880], [.18, 659.25]]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(.09, now + delay + .012);
      gain.gain.exponentialRampToValueAtTime(.001, now + delay + .65);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(now + delay); oscillator.stop(now + delay + .7);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
  } catch { /* Browsers may require a first user gesture before sound. */ }
}

let lastNote = 0;
/** One soft, short note — the home cards each have their own pitch, so moving across
 *  them plays three rising notes. Silent when sound is off or the quiet state is on. */
export function playHoverNote(frequency: number) {
  if (isMuted() || typeof window === 'undefined' || Date.now() - lastNote < 220) return;
  lastNote = Date.now();
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.05, now + .015);
    gain.gain.exponentialRampToValueAtTime(.001, now + .45);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(now); oscillator.stop(now + .5);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch { /* needs a first gesture */ }
}
