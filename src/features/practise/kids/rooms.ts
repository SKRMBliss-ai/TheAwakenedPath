import type { MascotMood } from './Mascot';

/**
 * The ten worlds of the Kids Gym. Each room is pure configuration — its
 * palette, its story beats, how Pip behaves inside it — so a new room is a
 * data entry plus one environment component, never a rewrite of the engine.
 */

export type RoomId =
  | 'feelings' | 'thought' | 'body' | 'pause' | 'story'
  | 'friendship' | 'anger' | 'worry' | 'kindness' | 'reflection';

export interface RoomPalette {
  /** Background gradient stops, painted far → near. */
  sky: string[];
  /** The room's light source / accent glow. */
  glow: string;
  /** Text colour that sits on the environment. */
  ink: string;
  /** Button + highlight colour. */
  accent: string;
}

export interface KidsRoomConfig {
  id: RoomId;
  name: string;
  /** One line, spoken at the title reveal. */
  tagline: string;
  /** The button that starts the exercise. */
  invitation: string;
  /** What the child is practising — shown on the room card. */
  practising: string;
  glyph: string;
  mood: MascotMood;
  palette: RoomPalette;
  /** Whether the full world is built yet. */
  status: 'ready' | 'soon';
}

export const KIDS_WORLD: KidsRoomConfig[] = [
  {
    id: 'pause',
    name: 'Pause Room',
    tagline: 'Let’s make a little space.',
    invitation: 'Find the quiet',
    practising: 'Breathing and slowing down',
    glyph: '🌿',
    mood: 'calm',
    status: 'ready',
    palette: { sky: ['#0B2C25', '#14493A', '#2B7A5B'], glow: '#8FE9B8', ink: '#EAFBF3', accent: '#3FB37F' },
  },
  {
    id: 'worry',
    name: 'Worry Room',
    tagline: 'Let’s make that worry a little smaller.',
    invitation: 'Explore my worry',
    practising: 'Facing worries bravely',
    glyph: '🏔️',
    mood: 'brave',
    status: 'ready',
    palette: { sky: ['#0A1130', '#1B2A5E', '#3E4E8F'], glow: '#A9BEFF', ink: '#EFF3FF', accent: '#6E86E8' },
  },
  {
    id: 'kindness',
    name: 'Kindness Room',
    tagline: 'Kindness grows when we share it.',
    invitation: 'Plant a seed',
    practising: 'Growing kindness',
    glyph: '🌻',
    mood: 'nurturing',
    status: 'ready',
    palette: { sky: ['#9C4A1E', '#D9873A', '#FFCF7A'], glow: '#FFE9A8', ink: '#FFF8E7', accent: '#E8862F' },
  },
  {
    id: 'feelings',
    name: 'Feelings Room',
    tagline: 'What are you feeling today?',
    invitation: 'Meet my feelings',
    practising: 'Naming what I feel',
    glyph: '🌈',
    mood: 'curious',
    status: 'soon',
    palette: { sky: ['#2B1B4D', '#5B3A8C', '#A96FC9'], glow: '#FFC9EC', ink: '#FBF3FF', accent: '#C77DE0' },
  },
  {
    id: 'thought',
    name: 'Thought Room',
    tagline: 'What is your mind saying?',
    invitation: 'Catch a thought',
    practising: 'Noticing thoughts',
    glyph: '📚',
    mood: 'investigate',
    status: 'soon',
    palette: { sky: ['#12233A', '#1E3A57', '#3A6384'], glow: '#FFD79E', ink: '#F2F8FF', accent: '#E8A75F' },
  },
  {
    id: 'body',
    name: 'Body Detective',
    tagline: 'Let’s see what your body is telling you.',
    invitation: 'Scan my body',
    practising: 'Listening to my body',
    glyph: '🔍',
    mood: 'explorer',
    status: 'soon',
    palette: { sky: ['#06212B', '#0C3C4D', '#1B6C82'], glow: '#7EE8F0', ink: '#EAFDFF', accent: '#3FBCD4' },
  },
  {
    id: 'story',
    name: 'Different Story',
    tagline: 'Could there be another story?',
    invitation: 'Turn the page',
    practising: 'Seeing another point of view',
    glyph: '📖',
    mood: 'storyteller',
    status: 'soon',
    palette: { sky: ['#3A2140', '#6B3A63', '#C08AA8'], glow: '#FFD9E8', ink: '#FFF4F8', accent: '#D97BA5' },
  },
  {
    id: 'friendship',
    name: 'Friendship Room',
    tagline: 'Let’s practise being a good friend.',
    invitation: 'Cross the bridge',
    practising: 'Kind words and repair',
    glyph: '🏡',
    mood: 'supportive',
    status: 'soon',
    palette: { sky: ['#3B1E12', '#7A3F1E', '#D98A46'], glow: '#FFD9A0', ink: '#FFF6EC', accent: '#E8944C' },
  },
  {
    id: 'anger',
    name: 'Anger Room',
    tagline: 'It’s okay to feel angry.',
    invitation: 'Find my fire',
    practising: 'Handling big energy safely',
    glyph: '🌋',
    mood: 'energetic',
    status: 'soon',
    palette: { sky: ['#2B0B0B', '#6B1B14', '#C4442A'], glow: '#FFB07A', ink: '#FFF0EA', accent: '#E8663C' },
  },
  {
    id: 'reflection',
    name: 'Reflection Room',
    tagline: 'What did you discover?',
    invitation: 'Look back',
    practising: 'Noticing what I learned',
    glyph: '✨',
    mood: 'peaceful',
    status: 'soon',
    palette: { sky: ['#070B24', '#141C4A', '#2E3A7A'], glow: '#BFD0FF', ink: '#F2F5FF', accent: '#7C8BE0' },
  },
];

export function getRoom(id: RoomId): KidsRoomConfig {
  return KIDS_WORLD.find((r) => r.id === id) ?? KIDS_WORLD[0];
}
