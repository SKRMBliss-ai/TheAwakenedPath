/**
 * My Best Every Day — a gentle, gamified ethical-behaviour tracker for children.
 *
 * All characters and worlds here are ORIGINAL — colour-and-emotion companions,
 * not any copyrighted film characters. The design idea: make good choices the
 * gameplay itself, and never shame a child for a "not yet".
 */

export interface Behaviour {
  id: string;
  icon: string;
  title: string;
  prompt: string;
  points: number;
  color: string;      // the behaviour's colour
  area: string;       // Mind World area it powers
}

export const BEHAVIOURS: Behaviour[] = [
  { id: 'kind',      icon: '❤️', title: 'Be Kind',            prompt: 'Did you use kind words or do something thoughtful today?', points: 10, color: '#FF6B9D', area: 'Kindness Garden' },
  { id: 'truth',     icon: '🔎', title: 'Tell the Truth',     prompt: 'Were you honest today, even when it was hard?',            points: 10, color: '#4EA8DE', area: 'Truth Lab' },
  { id: 'choices',   icon: '🛡️', title: 'Make Good Choices',  prompt: 'Did you choose something safe and respectful today?',      points: 10, color: '#9B5DE5', area: 'Courage Castle' },
  { id: 'include',   icon: '🌈', title: 'Include Everyone',   prompt: 'Did you help someone feel welcome or make a new friend?',  points: 10, color: '#F15BB5', area: 'Friendship Park' },
  { id: 'body',      icon: '🍎', title: 'Take Care of My Body',prompt: 'Did you eat well, move, or rest your body today?',         points: 10, color: '#43BC5F', area: 'Healthy Body Zone' },
  { id: 'help',      icon: '🤝', title: 'Help Others',        prompt: 'Did you help family, a classmate, or a friend today?',     points: 15, color: '#FFB703', area: 'Helping Hands Village' },
  { id: 'mindheart', icon: '⭐', title: 'Mind & Heart Time',  prompt: 'Did you take quiet time — gratitude, reflection, learning?',points: 10, color: '#00BBF9', area: 'Reflection Observatory' },
];

export type Shape = 'star' | 'drop' | 'spark' | 'shield' | 'leaf' | 'bolt' | 'diamond' | 'heart' | 'moon';
export type Expression = 'joy' | 'sad' | 'angry' | 'worried' | 'calm' | 'shy' | 'bored' | 'curious' | 'picky' | 'sleepy';

export interface Companion {
  id: string;
  name: string;
  trait: string;
  emoji: string;
  color: string;
  color2: string;
  /** Distinct silhouette accent, so each character reads at a glance. */
  shape?: Shape;
  /** Drives the animated face — angry brows, worried sweat, sleepy eyes, etc. */
  expression?: Expression;
}

/** Original emotion companions — a colour, a shape and a feeling; no film characters. */
export const COMPANIONS: Companion[] = [
  { id: 'sunny',  name: 'Sunny',  trait: 'Joyful',  emoji: '😄', color: '#FFD23F', color2: '#FF9F1C', shape: 'star',    expression: 'joy' },
  { id: 'marina', name: 'Marina', trait: 'Calm',    emoji: '😌', color: '#4EA8DE', color2: '#5390D9', shape: 'drop',    expression: 'calm' },
  { id: 'blaze',  name: 'Blaze',  trait: 'Brave',   emoji: '😤', color: '#FF6B6B', color2: '#EE4266', shape: 'spark',   expression: 'angry' },
  { id: 'nova',   name: 'Nova',   trait: 'Curious', emoji: '🤩', color: '#9B5DE5', color2: '#7B2CBF', shape: 'diamond', expression: 'curious' },
  { id: 'fern',   name: 'Fern',   trait: 'Kind',    emoji: '🥰', color: '#43BC5F', color2: '#2A9D8F', shape: 'leaf',    expression: 'shy' },
];

export interface Level { n: number; name: string; at: number; }
export const LEVELS: Level[] = [
  { n: 1, name: 'Kindness Explorer',      at: 0 },
  { n: 2, name: 'Good Choice Adventurer', at: 100 },
  { n: 3, name: 'Empathy Hero',           at: 250 },
  { n: 4, name: 'Courage Champion',       at: 500 },
  { n: 5, name: 'Heart Leader',           at: 900 },
];

export function levelFor(points: number): { level: Level; next?: Level; toNext: number; progress: number } {
  let level = LEVELS[0];
  for (const l of LEVELS) if (points >= l.at) level = l;
  const next = LEVELS.find((l) => l.at > points);
  const toNext = next ? next.at - points : 0;
  const span = next ? next.at - level.at : 1;
  const progress = next ? (points - level.at) / span : 1;
  return { level, next, toNext, progress };
}

export interface Badge { id: string; icon: string; name: string; how: string; }
export const BADGES: Badge[] = [
  { id: 'firstStep',  icon: '🌱', name: 'First Step',   how: 'Complete your very first good choice' },
  { id: 'kindHeart',  icon: '💖', name: 'Kind Heart',   how: 'Be kind 3 days' },
  { id: 'truthTeller',icon: '🗝️', name: 'Truth Teller', how: 'Tell the truth 3 days' },
  { id: 'helper',     icon: '🦸', name: 'Super Helper', how: 'Help others 5 times' },
  { id: 'streak3',    icon: '🔥', name: 'On Fire',      how: 'Keep a 3-day streak' },
  { id: 'streak7',    icon: '🌟', name: 'Week Star',    how: 'Keep a 7-day streak' },
  { id: 'allSeven',   icon: '🏆', name: 'Full Rainbow', how: 'Complete all 7 in one day' },
];

export interface Reward { id: string; icon: string; name: string; at: number; kind: string; }
export const REWARDS: Reward[] = [
  { id: 'hat',      icon: '🎩', name: 'Explorer Hat',      at: 50,  kind: 'accessory' },
  { id: 'cape',     icon: '🦸', name: 'Hero Cape',         at: 120, kind: 'accessory' },
  { id: 'bgSpace',  icon: '🌌', name: 'Starry Sky',        at: 200, kind: 'background' },
  { id: 'compNew',  icon: '🐣', name: 'New Companion',     at: 300, kind: 'companion' },
  { id: 'bgReef',   icon: '🐠', name: 'Coral Reef',        at: 450, kind: 'background' },
  { id: 'crown',    icon: '👑', name: 'Heart Crown',       at: 700, kind: 'accessory' },
];

/** Daily missions — rotate deterministically by day so everyone shares one. */
export interface Mission { text: string; points: number; behaviour: string; }
export const MISSIONS: Mission[] = [
  { text: 'Give someone a genuine compliment.',            points: 15, behaviour: 'kind' },
  { text: 'Help someone without being asked.',             points: 20, behaviour: 'help' },
  { text: 'Say thank you and really mean it.',             points: 10, behaviour: 'mindheart' },
  { text: 'Include someone who is playing alone.',         points: 15, behaviour: 'include' },
  { text: 'Tell the truth even if it feels hard.',         points: 15, behaviour: 'truth' },
  { text: 'Drink water and stretch your body.',            points: 10, behaviour: 'body' },
  { text: 'Take three slow breaths when you feel upset.',  points: 10, behaviour: 'mindheart' },
];

export function missionsForDay(dateKey: string): Mission[] {
  const seed = [...dateKey].reduce((a, c) => a + c.charCodeAt(0), 0);
  const a = MISSIONS[seed % MISSIONS.length];
  const b = MISSIONS[(seed + 3) % MISSIONS.length];
  return b.text === a.text ? [a, MISSIONS[(seed + 4) % MISSIONS.length]] : [a, b];
}

/** A friendly, non-shaming sample leaderboard (prototype data). */
export const SAMPLE_FRIENDS = [
  { name: 'Alex', points: 120, emoji: '🦊' },
  { name: 'Sam', points: 110, emoji: '🐼' },
  { name: 'Mia', points: 95, emoji: '🦋' },
  { name: 'Kai', points: 80, emoji: '🐢' },
];

export const PROUD_OPTIONS = ['Being kind', 'Being honest', 'Helping', 'Trying my best', 'Staying calm', 'Making a friend'];
export const FEELING_OPTIONS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🥰', label: 'Happy' },
  { emoji: '🤔', label: 'Thoughtful' },
];

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
