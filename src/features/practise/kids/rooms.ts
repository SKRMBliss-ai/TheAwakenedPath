/**
 * The ten worlds of the Kids Gym.
 *
 * Each room is pure configuration — its artwork, its palette, and the steps
 * of its exercise — so a new room is a data entry, never a new component.
 * The exercise engine in exercises.tsx renders whatever steps a room lists.
 *
 * Artwork lives in /public/rooms:
 *   {id}.webp        the painted room, used full-bleed inside the room
 *   {id}_card.webp   the animated room card, used on the hub
 */

export type RoomId =
  | 'feelings' | 'thought' | 'body' | 'pause' | 'story'
  | 'friendship' | 'anger' | 'worry' | 'kindness' | 'reflection';

/** One beat of a room's exercise. */
export type Step =
  /** Tap a thing until it gives way — a worry shrinking, a seed planted. */
  | { kind: 'tap'; prompt: string; glyph: string; taps: number; hint: string }
  /** Follow the breath. The world settles around the child. */
  | { kind: 'breath'; prompt: string; rounds: number }
  /** Choose one. The commonest beat — naming, noticing, deciding. */
  | { kind: 'pick'; prompt: string; options: string[] }
  /** Two readings of the same moment. The heart of Different Story. */
  | { kind: 'reframe'; prompt: string; a: string; b: string };

export interface RoomPalette {
  /** Text colour that sits on the artwork. */
  ink: string;
  /** Buttons and highlights. */
  accent: string;
  /** Scrim colour drawn under text so the art never eats the words. */
  scrim: string;
}

export interface KidsRoomConfig {
  id: RoomId;
  name: string;
  /** One line, spoken at the title reveal. */
  tagline: string;
  /** The button that begins the exercise. */
  invitation: string;
  /** What the child is practising. */
  practising: string;
  palette: RoomPalette;
  /** 'painted' = a full-resolution still shipped for this room.
   *  'upscaled' = derived from the room card because no still exists yet;
   *  the shell softens it slightly so it reads as depth of field. */
  art: 'painted' | 'upscaled';
  steps: Step[];
  /** The closing line — a discovery, never a score. */
  ending: string;
}

export const KIDS_WORLD: KidsRoomConfig[] = [
  {
    id: 'feelings',
    name: 'Feelings Room',
    tagline: 'What are you feeling today?',
    invitation: 'Meet my feelings',
    practising: 'Naming what I feel',
    palette: { ink: '#FBF3FF', accent: '#C77DE0', scrim: '#2B1B4D' },
    art: 'painted',
    steps: [
      { kind: 'pick', prompt: 'What are you feeling right now?', options: ['Happy', 'Worried', 'Angry', 'Sad', 'Okay', 'Excited'] },
      { kind: 'pick', prompt: 'Where do you feel it most?', options: ['In my tummy', 'In my chest', 'In my head', 'All over'] },
      { kind: 'pick', prompt: 'How big is the feeling?', options: ['A little', 'Quite big', 'Really big'] },
    ],
    ending: 'You noticed your feeling and gave it a name. That’s how feelings get easier to carry.',
  },
  {
    id: 'thought',
    name: 'Thought Room',
    tagline: 'What is your mind saying?',
    invitation: 'Catch a thought',
    practising: 'Noticing thoughts',
    palette: { ink: '#F2F8FF', accent: '#E8A75F', scrim: '#12233A' },
    art: 'painted',
    steps: [
      { kind: 'tap', prompt: 'A thought is floating past. Catch it.', glyph: '💭', taps: 3, hint: 'more taps' },
      { kind: 'pick', prompt: 'Which thought showed up?', options: ['“I’m going to mess this up.”', '“They don’t like me.”', '“I can’t do this.”', '“It’s not fair.”'] },
      { kind: 'pick', prompt: 'Is that a fact, or just a thought?', options: ['It’s just a thought', 'It might be true', 'I’m not sure yet'] },
    ],
    ending: 'You caught a thought and had a proper look at it. Thoughts come and go — you don’t have to believe every one.',
  },
  {
    id: 'body',
    name: 'Body Detective',
    tagline: 'Let’s see what your body is telling you.',
    invitation: 'Start the scan',
    practising: 'Listening to my body',
    palette: { ink: '#EAFDFF', accent: '#3FBCD4', scrim: '#06212B' },
    art: 'upscaled',
    steps: [
      { kind: 'tap', prompt: 'Warm up the scanner.', glyph: '🔍', taps: 3, hint: 'more taps' },
      { kind: 'pick', prompt: 'Where does your body feel something?', options: ['My chest', 'My tummy', 'My hands', 'My jaw', 'My breathing'] },
      { kind: 'pick', prompt: 'What does it feel like there?', options: ['Fluttery', 'Tight', 'Warm', 'Buzzy', 'Heavy'] },
    ],
    ending: 'Your body talks to you all day long. Today you stopped and listened.',
  },
  {
    id: 'pause',
    name: 'Pause Room',
    tagline: 'Let’s make a little space.',
    invitation: 'Find the quiet',
    practising: 'Breathing and slowing down',
    palette: { ink: '#EAFBF3', accent: '#3FB37F', scrim: '#0B2C25' },
    art: 'painted',
    steps: [
      { kind: 'breath', prompt: 'Breathe the box with me.', rounds: 3 },
    ],
    ending: 'The forest is quiet. So are you.',
  },
  {
    id: 'story',
    name: 'Different Story',
    tagline: 'Could there be another story?',
    invitation: 'Turn the page',
    practising: 'Seeing another point of view',
    palette: { ink: '#FFF4F8', accent: '#D97BA5', scrim: '#3A2140' },
    art: 'upscaled',
    steps: [
      { kind: 'pick', prompt: 'What happened?', options: ['A friend didn’t say hi', 'I wasn’t invited to play', 'Someone laughed', 'Nobody picked me'] },
      { kind: 'reframe', prompt: 'Two stories. Both could be true.', a: '“They don’t like me.”', b: '“Maybe they were busy, or didn’t see me.”' },
      { kind: 'pick', prompt: 'If the second story were true, how would you feel?', options: ['A bit better', 'Calmer', 'Still unsure', 'Ready to ask them'] },
    ],
    ending: 'The first story is never the only story. You found another one.',
  },
  {
    id: 'friendship',
    name: 'Friendship Room',
    tagline: 'Let’s practise being a good friend.',
    invitation: 'Cross the bridge',
    practising: 'Kind words and repair',
    palette: { ink: '#FFF6EC', accent: '#E8944C', scrim: '#3B1E12' },
    art: 'upscaled',
    steps: [
      { kind: 'pick', prompt: 'What’s happening?', options: ['Someone won’t let me join', 'A friend said something hurtful', 'I upset someone', 'We both want the same thing'] },
      { kind: 'pick', prompt: 'What could you try?', options: ['Say how I feel, calmly', 'Ask again a bit later', 'Say sorry and mean it', 'Find a way we both get a turn', 'Ask a grown-up to help'] },
    ],
    ending: 'Friendships need repairing sometimes. You just practised how to do it.',
  },
  {
    id: 'anger',
    name: 'Anger Room',
    tagline: 'It’s okay to feel angry.',
    invitation: 'Find my fire',
    practising: 'Handling big energy safely',
    palette: { ink: '#FFF0EA', accent: '#E8663C', scrim: '#2B0B0B' },
    art: 'upscaled',
    steps: [
      { kind: 'pick', prompt: 'What happened?', options: ['Something felt unfair', 'Someone broke my thing', 'I was told no', 'Someone wouldn’t listen'] },
      { kind: 'pick', prompt: 'What did you want to do?', options: ['Shout', 'Hit something', 'Run away', 'Cry'] },
      { kind: 'tap', prompt: 'Let the energy out safely. Breathe the fire down.', glyph: '🌋', taps: 4, hint: 'more breaths' },
      { kind: 'pick', prompt: 'What could you try next time?', options: ['Take five big breaths', 'Walk away, then come back', 'Tell someone how I feel', 'Squeeze my fists, then let go'] },
    ],
    ending: 'Anger is big energy — it isn’t bad. You just practised how to steer it.',
  },
  {
    id: 'worry',
    name: 'Worry Room',
    tagline: 'Let’s make that worry a little smaller.',
    invitation: 'Explore my worry',
    practising: 'Facing worries bravely',
    palette: { ink: '#EFF3FF', accent: '#6E86E8', scrim: '#0A1130' },
    art: 'painted',
    steps: [
      { kind: 'tap', prompt: 'Tap the worry to make it smaller.', glyph: '☁️', taps: 4, hint: 'more taps' },
      { kind: 'pick', prompt: 'What is the worry about?', options: ['Something at school', 'A friend thing', 'Something at home', 'Something new I have to do'] },
      { kind: 'pick', prompt: 'Is there something small you could do about it?', options: ['Tell a grown-up I trust', 'Ask a question', 'Try one small bit of it', 'Nothing — I can let it pass'] },
    ],
    ending: 'Your worry got smaller, and you got braver.',
  },
  {
    id: 'kindness',
    name: 'Kindness Room',
    tagline: 'Kindness grows when we share it.',
    invitation: 'Plant a seed',
    practising: 'Growing kindness',
    palette: { ink: '#FFF8E7', accent: '#E8862F', scrim: '#5A2E0B' },
    art: 'painted',
    steps: [
      { kind: 'tap', prompt: 'Plant a tiny seed of kindness.', glyph: '🌱', taps: 3, hint: 'more taps' },
      { kind: 'pick', prompt: 'Who is your kindness for?', options: ['Myself', 'Someone else', 'Someone who’s having a hard day'] },
      { kind: 'pick', prompt: 'What will you do?', options: ['Say something nice', 'Help without being asked', 'Include someone new', 'Share something I have', 'Say thank you'] },
    ],
    ending: 'Something beautiful grew — because you shared it.',
  },
  {
    id: 'reflection',
    name: 'Reflection Room',
    tagline: 'What did you discover?',
    invitation: 'Look back',
    practising: 'Noticing what I learned',
    palette: { ink: '#F2F5FF', accent: '#7C8BE0', scrim: '#070B24' },
    art: 'upscaled',
    steps: [
      { kind: 'pick', prompt: 'How do you feel now?', options: ['Calmer', 'Happier', 'Still thinking', 'Proud of myself'] },
      { kind: 'pick', prompt: 'What did you notice today?', options: ['Feelings come and go', 'I can pause before I react', 'I can choose what I do next', 'I’m braver than I thought'] },
    ],
    ending: 'You looked back at your own mind — and saw it a little more clearly.',
  },
];

export function getRoom(id: RoomId): KidsRoomConfig {
  return KIDS_WORLD.find((r) => r.id === id) ?? KIDS_WORLD[0];
}

/** Full-bleed painted artwork for a room. */
export const roomArt = (id: RoomId) => `/rooms/${id}.webp`;
/** Animated room card — plays on hover, in the hub grid. */
export const roomCard = (id: RoomId) => `/rooms/${id}_card.webp`;
/** Full, uncropped card art (title baked in) — the hub grid's resting state. */
export const roomFull = (id: RoomId) => `/rooms/full/${id}_full.webp`;
