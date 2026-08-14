import {
  type PranayamType,
  type PranayamLevel,
  type PranayamSpec,
  SPECS_BY_LEVEL,
  totalSeconds,
} from './breathPattern';

export const INTRO_SEC = 36;
export const INTRO_SEC_INTERMEDIATE = 40;
export const REST_SEC = 10;
export const VOICE_WINDOW_SEC = 28;
export const PROMO_SEC = 18;
export const CELEBRATE_SEC = 8;
export const SUMMARY_SEC = 16;
export const TRANSITION_SEC = 1.1;

export interface TechniqueSlot {
  type: PranayamType;
  index: number;
  title: string;
  sanskrit: string;
  startSec: number;
  celebrateSec: number;
}

export interface SessionTimeline {
  level: PranayamLevel;
  specs: Record<PranayamType, PranayamSpec>;
  introSec: number;
  T_BHASTRIKA: number;
  T_CELEB_1: number;
  T_REST_1: number;
  T_KAPALBHATI: number;
  T_CELEB_2: number;
  T_REST_2: number;
  T_ANULOM: number;
  T_CELEB_3: number;
  T_REST_3: number;
  T_BAHYA: number;
  T_CELEB_4: number;
  T_REST_4: number;
  T_BHRAMARI: number;
  T_FINALE: number;
  T_SUMMARY: number;
  T_PROMO: number;
  SESSION_SEC: number;
  techniques: TechniqueSlot[];
}

const NAMES: Array<{ type: PranayamType; title: string; sanskrit: string }> = [
  { type: 'bhastrika', title: 'Bellows Breathing', sanskrit: 'Bhastrika' },
  { type: 'kapalbhati', title: 'Skull Shining Breath', sanskrit: 'Kapalbhati' },
  { type: 'anulom_vilom', title: 'Alternate Nostril Breathing', sanskrit: 'Anulom Vilom' },
  { type: 'bahya', title: 'External Breath Retention', sanskrit: 'Bahya' },
  { type: 'bhramari', title: 'Humming Bee Breath', sanskrit: 'Bhramari' },
];

export function buildTimeline(level: PranayamLevel): SessionTimeline {
  const specs = SPECS_BY_LEVEL[level];
  const slot = (t: PranayamType) => totalSeconds(specs[t]);
  const introSec = level === 'intermediate' ? INTRO_SEC_INTERMEDIATE : INTRO_SEC;

  const T_BHASTRIKA = introSec;
  const T_CELEB_1 = T_BHASTRIKA + slot('bhastrika');
  const T_REST_1 = T_CELEB_1 + CELEBRATE_SEC;
  const T_KAPALBHATI = T_REST_1 + REST_SEC;
  const T_CELEB_2 = T_KAPALBHATI + slot('kapalbhati');
  const T_REST_2 = T_CELEB_2 + CELEBRATE_SEC;
  const T_ANULOM = T_REST_2 + REST_SEC;
  const T_CELEB_3 = T_ANULOM + slot('anulom_vilom');
  const T_REST_3 = T_CELEB_3 + CELEBRATE_SEC;
  const T_BAHYA = T_REST_3 + REST_SEC;
  const T_CELEB_4 = T_BAHYA + slot('bahya');
  const T_REST_4 = T_CELEB_4 + CELEBRATE_SEC;
  const T_BHRAMARI = T_REST_4 + REST_SEC;
  const T_FINALE = T_BHRAMARI + slot('bhramari');
  const T_SUMMARY = T_FINALE + CELEBRATE_SEC;
  const T_PROMO = T_SUMMARY + SUMMARY_SEC;

  const starts = [T_BHASTRIKA, T_KAPALBHATI, T_ANULOM, T_BAHYA, T_BHRAMARI];
  const celebs = [T_CELEB_1, T_CELEB_2, T_CELEB_3, T_CELEB_4, T_FINALE];

  const techniques: TechniqueSlot[] = NAMES.map((n, i) => ({
    ...n,
    index: i + 1,
    startSec: starts[i],
    celebrateSec: celebs[i],
  }));

  return {
    level,
    specs,
    introSec,
    T_BHASTRIKA,
    T_CELEB_1,
    T_REST_1,
    T_KAPALBHATI,
    T_CELEB_2,
    T_REST_2,
    T_ANULOM,
    T_CELEB_3,
    T_REST_3,
    T_BAHYA,
    T_CELEB_4,
    T_REST_4,
    T_BHRAMARI,
    T_FINALE,
    T_SUMMARY,
    T_PROMO,
    SESSION_SEC: T_PROMO + PROMO_SEC,
    techniques,
  };
}
