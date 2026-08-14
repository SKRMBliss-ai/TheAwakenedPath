/**
 * Single source of truth for pranayam pacing in MindGym Web App.
 * Derived from Hatha yoga specifications & medical safety guidelines.
 */

export type PranayamType = 'bhastrika' | 'kapalbhati' | 'anulom_vilom' | 'bahya' | 'bhramari';
export type PranayamLevel = 'beginner' | 'intermediate';
export type PhaseKey = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export const PHASE_ORDER: PhaseKey[] = ['inhale', 'hold1', 'exhale', 'hold2'];

export const PHASE_COLORS: Record<PhaseKey, string> = {
  inhale: '#5a8a6a',
  hold1: '#a08040',
  exhale: '#4a7a9a',
  hold2: '#a08040',
};

export const PHASE_ICONS: Record<PhaseKey, string> = {
  inhale: '🫁',
  hold1: '⏸️',
  exhale: '💨',
  hold2: '⏸️',
};

export const PHASE_SANSKRIT: Partial<Record<PhaseKey, string>> = {
  hold1: 'ANTAR KUMBHAKA',
  hold2: 'BAHYA KUMBHAKA',
};

export interface PranayamSpec {
  pattern: Record<PhaseKey, number>;
  breathsPerRound: number;
  rounds: number;
  restBetweenRoundsSec: number;
  endOfRoundInhaleSec: number;
  endOfRoundAntarSec: number;
  endOfRoundBahyaSec: number;
  leadInSec: number;
  alternatesSides: boolean;
  turnsPerRep: number;
  repUnit: string;
  inhaleLabel?: string;
  exhaleLabel?: string;
}

export const BEGINNER_SPECS: Record<PranayamType, PranayamSpec> = {
  bhastrika: {
    pattern: { inhale: 1, hold1: 0, exhale: 1, hold2: 0 },
    breathsPerRound: 21,
    rounds: 5,
    restBetweenRoundsSec: 10,
    endOfRoundInhaleSec: 4,
    endOfRoundAntarSec: 6,
    endOfRoundBahyaSec: 0,
    leadInSec: 16,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'BREATH',
    inhaleLabel: 'DEEP INHALE',
    exhaleLabel: 'DEEP EXHALE',
  },
  kapalbhati: {
    pattern: { inhale: 1, hold1: 0, exhale: 1, hold2: 0 },
    breathsPerRound: 30,
    rounds: 4,
    restBetweenRoundsSec: 15,
    endOfRoundInhaleSec: 4,
    endOfRoundAntarSec: 10,
    endOfRoundBahyaSec: 0,
    leadInSec: 15,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'STROKE',
    inhaleLabel: 'PASSIVE INHALE',
    exhaleLabel: 'PULSE EXHALE',
  },
  anulom_vilom: {
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 2 },
    breathsPerRound: 4,
    rounds: 3,
    restBetweenRoundsSec: 10,
    endOfRoundInhaleSec: 0,
    endOfRoundAntarSec: 0,
    endOfRoundBahyaSec: 0,
    leadInSec: 18,
    alternatesSides: true,
    turnsPerRep: 2,
    repUnit: 'CYCLE',
  },
  bahya: {
    pattern: { inhale: 4, hold1: 0, exhale: 6, hold2: 10 },
    breathsPerRound: 4,
    rounds: 3,
    restBetweenRoundsSec: 15,
    endOfRoundInhaleSec: 0,
    endOfRoundAntarSec: 0,
    endOfRoundBahyaSec: 0,
    leadInSec: 16,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'BREATH',
  },
  bhramari: {
    pattern: { inhale: 4, hold1: 4, exhale: 6, hold2: 0 },
    breathsPerRound: 4,
    rounds: 3,
    restBetweenRoundsSec: 15,
    endOfRoundInhaleSec: 0,
    endOfRoundAntarSec: 0,
    endOfRoundBahyaSec: 0,
    leadInSec: 14,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'HUM',
    exhaleLabel: 'HUMMING EXHALE',
  },
};

export const INTERMEDIATE_SPECS: Record<PranayamType, PranayamSpec> = { ...BEGINNER_SPECS };

export const SPECS_BY_LEVEL: Record<PranayamLevel, Record<PranayamType, PranayamSpec>> = {
  beginner: BEGINNER_SPECS,
  intermediate: INTERMEDIATE_SPECS,
};

export function activePhases(spec: PranayamSpec): PhaseKey[] {
  return PHASE_ORDER.filter((k) => spec.pattern[k] > 0);
}

export function cycleSeconds(spec: PranayamSpec): number {
  return (
    spec.pattern.inhale +
    spec.pattern.hold1 +
    spec.pattern.exhale +
    spec.pattern.hold2
  );
}

export function roundSeconds(spec: PranayamSpec): number {
  const breathing = cycleSeconds(spec) * spec.breathsPerRound;
  const retention =
    spec.endOfRoundInhaleSec +
    spec.endOfRoundAntarSec +
    spec.endOfRoundBahyaSec;
  return breathing + retention;
}

export function breathingSeconds(spec: PranayamSpec): number {
  const roundsPart = spec.rounds * roundSeconds(spec);
  const restPart = (spec.rounds - 1) * spec.restBetweenRoundsSec;
  return roundsPart + restPart;
}

export function totalSeconds(spec: PranayamSpec): number {
  return spec.leadInSec + breathingSeconds(spec);
}

export function PRACTICE_SEC_BY_LEVEL(level: PranayamLevel, type: PranayamType): number {
  return breathingSeconds(SPECS_BY_LEVEL[level][type]);
}

export function totalReps(spec: PranayamSpec): number {
  return Math.floor((spec.breathsPerRound * spec.rounds) / spec.turnsPerRep);
}

export function repsPerRound(spec: PranayamSpec): number {
  return Math.floor(spec.breathsPerRound / spec.turnsPerRep);
}

export interface BreathState {
  started: boolean;
  resting: boolean;
  round: number;
  turnInRound: number;
  repInRound: number;
  totalTurn: number;
  totalRep: number;
  side: 'left' | 'right';
  phase: PhaseKey;
  phaseTimeLeft: number;
  phaseProgress: number;
  cycleProgress: number;
  practiceProgress: number;
  practiceSecondsLeft: number;
  endOfRoundActive: boolean;
  endOfRoundPhase?: 'inhale' | 'antar' | 'bahya';
}

export function resolveBreath(spec: PranayamSpec, relSec: number): BreathState {
  const cycle = cycleSeconds(spec);
  const roundLen = roundSeconds(spec);
  const totalBreathing = breathingSeconds(spec);

  if (relSec < spec.leadInSec) {
    return {
      started: false,
      resting: false,
      round: 1,
      turnInRound: 1,
      repInRound: 1,
      totalTurn: 1,
      totalRep: 1,
      side: 'left',
      phase: 'inhale',
      phaseTimeLeft: spec.pattern.inhale,
      phaseProgress: 0,
      cycleProgress: 0,
      practiceProgress: 0,
      practiceSecondsLeft: totalBreathing,
      endOfRoundActive: false,
    };
  }

  const workSec = Math.max(0, relSec - spec.leadInSec);
  const practiceSecondsLeft = Math.max(0, Math.ceil(totalBreathing - workSec));
  const practiceProgress = Math.min(1, workSec / totalBreathing);

  const blockLen = roundLen + spec.restBetweenRoundsSec;
  let roundIdx = Math.floor(workSec / blockLen);
  let timeInBlock = workSec % blockLen;

  if (roundIdx >= spec.rounds) {
    roundIdx = spec.rounds - 1;
    timeInBlock = roundLen;
  }

  const currentRound = roundIdx + 1;

  if (timeInBlock >= roundLen) {
    const restTimeLeft = Math.ceil(blockLen - timeInBlock);
    return {
      started: true,
      resting: true,
      round: currentRound,
      turnInRound: spec.breathsPerRound,
      repInRound: repsPerRound(spec),
      totalTurn: (roundIdx + 1) * spec.breathsPerRound,
      totalRep: Math.floor(((roundIdx + 1) * spec.breathsPerRound) / spec.turnsPerRep),
      side: 'left',
      phase: 'inhale',
      phaseTimeLeft: restTimeLeft,
      phaseProgress: 0,
      cycleProgress: 0,
      practiceProgress,
      practiceSecondsLeft,
      endOfRoundActive: false,
    };
  }

  const breathingPartLen = cycle * spec.breathsPerRound;
  if (timeInBlock >= breathingPartLen) {
    const inEnd = timeInBlock - breathingPartLen;
    let endPhase: 'inhale' | 'antar' | 'bahya' = 'inhale';
    let phaseLen = spec.endOfRoundInhaleSec;
    let phaseTimeLeft = Math.ceil(spec.endOfRoundInhaleSec - inEnd);

    if (inEnd >= spec.endOfRoundInhaleSec) {
      const afterInhale = inEnd - spec.endOfRoundInhaleSec;
      if (afterInhale < spec.endOfRoundAntarSec) {
        endPhase = 'antar';
        phaseLen = spec.endOfRoundAntarSec;
        phaseTimeLeft = Math.ceil(spec.endOfRoundAntarSec - afterInhale);
      } else {
        endPhase = 'bahya';
        phaseLen = spec.endOfRoundBahyaSec;
        phaseTimeLeft = Math.ceil(spec.endOfRoundBahyaSec - (afterInhale - spec.endOfRoundAntarSec));
      }
    }

    const currentPhaseKey: PhaseKey = endPhase === 'inhale' ? 'inhale' : endPhase === 'antar' ? 'hold1' : 'hold2';
    return {
      started: true,
      resting: false,
      round: currentRound,
      turnInRound: spec.breathsPerRound,
      repInRound: repsPerRound(spec),
      totalTurn: (roundIdx + 1) * spec.breathsPerRound,
      totalRep: Math.floor(((roundIdx + 1) * spec.breathsPerRound) / spec.turnsPerRep),
      side: 'left',
      phase: currentPhaseKey,
      phaseTimeLeft: Math.max(1, phaseTimeLeft),
      phaseProgress: Math.min(1, (phaseLen - phaseTimeLeft) / phaseLen),
      cycleProgress: 1,
      practiceProgress,
      practiceSecondsLeft,
      endOfRoundActive: true,
      endOfRoundPhase: endPhase,
    };
  }

  const turnIdx = Math.floor(timeInBlock / cycle);
  const timeInCycle = timeInBlock % cycle;
  const side: 'left' | 'right' = spec.alternatesSides && turnIdx % 2 === 1 ? 'right' : 'left';

  let accum = 0;
  let activeKey: PhaseKey = 'inhale';
  let phaseLen = spec.pattern.inhale;

  for (const k of activePhases(spec)) {
    const dur = spec.pattern[k];
    if (timeInCycle < accum + dur) {
      activeKey = k;
      phaseLen = dur;
      break;
    }
    accum += dur;
  }

  const inPhase = timeInCycle - accum;
  const phaseTimeLeft = Math.ceil(phaseLen - inPhase);

  const turnInRound = turnIdx + 1;
  const totalTurn = roundIdx * spec.breathsPerRound + turnInRound;
  const repInRound = Math.floor((turnInRound - 1) / spec.turnsPerRep) + 1;
  const totalRep = Math.floor((totalTurn - 1) / spec.turnsPerRep) + 1;

  return {
    started: true,
    resting: false,
    round: currentRound,
    turnInRound,
    repInRound,
    totalTurn,
    totalRep,
    side,
    phase: activeKey,
    phaseTimeLeft: Math.max(1, phaseTimeLeft),
    phaseProgress: Math.min(1, inPhase / phaseLen),
    cycleProgress: Math.min(1, timeInCycle / cycle),
    practiceProgress,
    practiceSecondsLeft,
    endOfRoundActive: false,
  };
}

export function phaseLabel(spec: PranayamSpec, phase: PhaseKey, side: 'left' | 'right'): string {
  if (phase === 'inhale') {
    if (spec.inhaleLabel) return spec.inhaleLabel;
    if (spec.alternatesSides) return side === 'left' ? 'INHALE LEFT' : 'INHALE RIGHT';
    return 'DEEP INHALE';
  }
  if (phase === 'exhale') {
    if (spec.exhaleLabel) return spec.exhaleLabel;
    if (spec.alternatesSides) return side === 'left' ? 'EXHALE LEFT' : 'EXHALE RIGHT';
    return 'DEEP EXHALE';
  }
  if (phase === 'hold1') return 'HOLD AIR';
  if (phase === 'hold2') return 'EXHALE REST';
  return '';
}
