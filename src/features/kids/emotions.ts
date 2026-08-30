import type { Companion } from './data';

/**
 * The Feelings Crew — an ORIGINAL emotion cast that guides the child and debates
 * each choice. These are NOT the Inside Out characters: different names, colours,
 * faces and personalities. They fill the same *roles* (a cheerful host, a tender
 * one, a fiery-fairness one, a cautious one, a picky-funny one, a worried planner,
 * a comparing one, a shy one, a low-energy one) because those roles are universal
 * emotional archetypes — but the characters themselves are our own.
 *
 * Reuses the CompanionOrb shape ({id,name,color,color2,emoji}) so they render
 * with the same original blob-face art.
 */
export interface Emotion extends Companion {
  role: string;
}

export const EMOTIONS: Record<string, Emotion> = {
  sunny:  { id: 'sunny',  name: 'Sunny',  trait: 'Cheerful', role: 'host & cheerleader',      emoji: '😄', color: '#FFD23F', color2: '#FF9F1C' },
  willow: { id: 'willow', name: 'Willow', trait: 'Tender',   role: 'says hard feelings are ok',emoji: '🥺', color: '#5AA9E6', color2: '#4361EE' },
  ember:  { id: 'ember',  name: 'Ember',  trait: 'Fiery',    role: 'cares about fairness',     emoji: '😤', color: '#FF6B6B', color2: '#EE4266' },
  pip:    { id: 'pip',    name: 'Pip',    trait: 'Careful',  role: 'checks if it is safe',     emoji: '😬', color: '#48CAE4', color2: '#0096C7' },
  sage:   { id: 'sage',   name: 'Sage',   trait: 'Picky',    role: 'healthy & tidy (funny)',   emoji: '😖', color: '#80ED99', color2: '#38B000' },
  fizz:   { id: 'fizz',   name: 'Fizz',   trait: 'Worried',  role: 'plans for what-ifs',       emoji: '😰', color: '#FFB703', color2: '#FB8500' },
  ash:    { id: 'ash',    name: 'Ash',    trait: 'Comparing',role: 'gratitude vs envy',        emoji: '😑', color: '#9D8DF1', color2: '#6C5CE7' },
  coco:   { id: 'coco',   name: 'Coco',   trait: 'Shy',      role: 'social & mistakes are ok',  emoji: '😳', color: '#FF8FB1', color2: '#F15BB5' },
  lull:   { id: 'lull',   name: 'Lull',   trait: 'Sleepy',   role: 'low-energy (funny nudge)',  emoji: '😴', color: '#B8B8D1', color2: '#8D99AE' },
};

export const EMOTION_LIST = Object.values(EMOTIONS);
