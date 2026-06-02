// Web Audio API — all sounds generated programmatically, zero file dependencies

type AC = AudioContext & { createGain(): GainNode };

function ctx(): AC | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)() as AC;
  } catch { return null; }
}

function tone(
  ac: AC,
  freq: number,
  startAt: number,
  duration: number,
  peakGain = 0.18,
  type: OscillatorType = 'sine'
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/** Soft ascending chime — played when YOU join */
export function playJoinChime() {
  const ac = ctx(); if (!ac) return;
  const t = ac.currentTime;
  // C5 → E5 → G5 gentle arpeggio
  tone(ac, 523.25, t,        0.6, 0.14); // C5
  tone(ac, 659.25, t + 0.13, 0.6, 0.12); // E5
  tone(ac, 783.99, t + 0.26, 0.9, 0.10); // G5
}

/** Single soft ping — when another participant joins */
export function playParticipantJoin() {
  const ac = ctx(); if (!ac) return;
  tone(ac, 880, ac.currentTime, 0.5, 0.07);
}

/** Gentle two-note descend — when session is about to end (2-min warning) */
export function playEndWarning() {
  const ac = ctx(); if (!ac) return;
  const t = ac.currentTime;
  tone(ac, 659.25, t,        0.8, 0.10);
  tone(ac, 523.25, t + 0.22, 1.2, 0.08);
}

/** Soft single low tone — when YOU leave */
export function playLeaveSound() {
  const ac = ctx(); if (!ac) return;
  tone(ac, 392, ac.currentTime, 0.7, 0.10, 'sine');
}
