/**
 * The rooms of Mind Gym for Kids v1.
 *
 * SAME ROOMS AS THE LIVE PAGE. All ten worlds from /mindgymforkids are here
 * under their original ids, so their painted art (public/rooms/{id}.webp)
 * carries straight over and a child who knows the old hub recognises this
 * one. Two rooms are added from the master plan's room table (§6) because
 * the game library needs somewhere to put its Big Feelings and Together
 * games: `bigfeelings` and `together`. Those two have no painted art yet, so
 * they render a `scene` gradient instead — see SCENE_MOODS below, which are
 * the five scene palettes from MIND_GYM_UI_DESIGN.md §3.1.
 *
 * What is new here versus the live page: a room is no longer one hard-coded
 * exercise. A room is a *shelf of games* (see games/library.ts) plus the line
 * that says what it trains — UI design §8.1: "each card gains a small, quiet
 * line: 'Trains: how you notice feelings' — because a child who knows what a
 * room is for chooses better."
 */

/** The ten original room ids, plus the two the game library needs. */
export type RoomId =
  | 'feelings' | 'thought' | 'body' | 'pause' | 'story'
  | 'friendship' | 'anger' | 'worry' | 'kindness' | 'reflection'
  | 'bigfeelings' | 'together';

/**
 * Scene moods, straight from UI design §3.1's art-direction table. Every one
 * carries a warm light source (§2.3: "a dark scene with only cool light, or
 * no light source at all, reads as threat") — `glow` is that light, and it is
 * never allowed to be a cool hue.
 */
export type SceneMood = 'night' | 'den' | 'investigation' | 'dawn' | 'storm';

export interface SceneDef {
  /** Two-stop ground colour, darkest last. */
  ground: [string, string];
  /** The warm light inside the frame. Non-negotiable — see §2.3. */
  glow: string;
  /** Where that light sits, as a CSS background-position pair. */
  glowAt: [string, string];
}

export const SCENE_MOODS: Record<SceneMood, SceneDef> = {
  night:         { ground: ['#1B1F4A', '#080A1F'], glow: 'rgba(255,214,150,0.30)', glowAt: ['72%', '18%'] },
  den:           { ground: ['#3A2418', '#140C08'], glow: 'rgba(255,183,94,0.38)',  glowAt: ['50%', '62%'] },
  investigation: { ground: ['#0E3038', '#04141A'], glow: 'rgba(255,206,138,0.26)', glowAt: ['28%', '34%'] },
  dawn:          { ground: ['#4A3468', '#1A1030'], glow: 'rgba(255,190,120,0.34)', glowAt: ['50%', '88%'] },
  storm:         { ground: ['#2B3140', '#0C0F16'], glow: 'rgba(255,170,110,0.24)', glowAt: ['64%', '72%'] },
};

export interface RoomPalette {
  /** Text colour that sits on the artwork. */
  ink: string;
  /** Buttons and highlights — drawn from the scene's warm light (§3.1 cta.primary). */
  accent: string;
  /** Scrim colour drawn under text so the art never eats the words. */
  scrim: string;
}

export interface RoomConfig {
  id: RoomId;
  name: string;
  /** One line, spoken at the title reveal. */
  tagline: string;
  /** The quiet line on the card — what this room is for (UI §8.1). */
  trains: string;
  /** Chirpy's line as the hub card opens the room. */
  welcome: string;
  palette: RoomPalette;
  scene: SceneMood;
  /** True when public/rooms/{id}.webp exists; false renders the scene gradient. */
  painted: boolean;
}

export const ROOMS: RoomConfig[] = [
  {
    id: 'feelings',
    name: 'Feelings Room',
    tagline: 'Every feeling has a name. Let’s go and find some.',
    trains: 'Naming what you feel',
    welcome: 'This room is all the feelings. Even the odd ones.',
    palette: { ink: '#FBF3FF', accent: '#C77DE0', scrim: '#2B1B4D' },
    scene: 'night',
    painted: true,
  },
  {
    id: 'thought',
    name: 'Thought Room',
    tagline: 'There’s someone talking in there. Let’s go and listen.',
    trains: 'Noticing what your mind says',
    welcome: 'Careful in here. It’s noisy.',
    palette: { ink: '#F2F8FF', accent: '#E8A75F', scrim: '#12233A' },
    scene: 'investigation',
    painted: true,
  },
  {
    id: 'body',
    name: 'Body Detective',
    tagline: 'Your body knows things before you do.',
    trains: 'Finding feelings in your body',
    welcome: 'Detective kit on. We’re looking for clues.',
    palette: { ink: '#EAFDFF', accent: '#3FBCD4', scrim: '#06212B' },
    scene: 'investigation',
    painted: true,
  },
  {
    id: 'pause',
    name: 'Pause Room',
    tagline: 'There’s a little gap between what happens and what you do.',
    trains: 'Finding the gap before you act',
    welcome: 'Nothing to catch in here. We’re just going slow.',
    palette: { ink: '#EAFBF3', accent: '#3FB37F', scrim: '#0B2C25' },
    scene: 'night',
    painted: true,
  },
  {
    id: 'story',
    name: 'Different Story',
    tagline: 'Your mind picked one story. There were others.',
    trains: 'Finding another story that fits',
    welcome: 'I always pick the first story. It’s a bit of a habit.',
    palette: { ink: '#FFF4F8', accent: '#D97BA5', scrim: '#3A2140' },
    scene: 'den',
    painted: true,
  },
  {
    id: 'friendship',
    name: 'Friendship Room',
    tagline: 'Friendships break a bit. Then people mend them.',
    trains: 'Saying the hard thing kindly',
    welcome: 'I’m not brilliant at this one. Let’s do it together.',
    palette: { ink: '#FFF6EC', accent: '#E8944C', scrim: '#3B1E12' },
    scene: 'den',
    painted: true,
  },
  {
    id: 'anger',
    name: 'Anger Room',
    tagline: 'Angry is allowed in here. All of it.',
    trains: 'Catching anger early',
    welcome: 'Nothing gets told off in this room. Promise.',
    palette: { ink: '#FFF0EA', accent: '#E8663C', scrim: '#2B0B0B' },
    scene: 'storm',
    painted: true,
  },
  {
    id: 'worry',
    name: 'Worry Room',
    tagline: 'Worries get smaller when someone else can see them.',
    trains: 'Looking at a worry properly',
    welcome: 'I do a LOT of worrying. I’ve had some practice.',
    palette: { ink: '#EFF3FF', accent: '#6E86E8', scrim: '#0A1130' },
    scene: 'night',
    painted: true,
  },
  {
    id: 'kindness',
    name: 'Kindness Room',
    tagline: 'The warm one. For other people, and for you.',
    trains: 'Being kind — including to yourself',
    welcome: 'It’s warm in here. I like it in here.',
    palette: { ink: '#FFF8E7', accent: '#E8862F', scrim: '#5A2E0B' },
    scene: 'den',
    painted: true,
  },
  {
    id: 'reflection',
    name: 'Reflection Room',
    tagline: 'Let’s look back at what you’ve found.',
    trains: 'Noticing what you noticed',
    welcome: 'This is where we keep the things you worked out.',
    palette: { ink: '#F2F5FF', accent: '#7C8BE0', scrim: '#070B24' },
    scene: 'dawn',
    painted: true,
  },
  {
    id: 'bigfeelings',
    name: 'Big Feelings Room',
    tagline: 'One big feeling at a time. Nothing here is too big.',
    trains: 'One big feeling at a time',
    welcome: 'The big ones live in here. They’re fine, honestly.',
    palette: { ink: '#F4F1FF', accent: '#B07CE8', scrim: '#191436' },
    scene: 'storm',
    painted: false,
  },
  {
    id: 'together',
    name: 'Together Games',
    tagline: 'Fetch a grown-up. These ones need two.',
    trains: 'Playing this with a grown-up',
    welcome: 'Go and get someone. I’ll wait right here.',
    palette: { ink: '#FFF6E9', accent: '#E8A24C', scrim: '#3A2410' },
    scene: 'den',
    painted: false,
  },
];

export function getRoom(id: RoomId): RoomConfig {
  return ROOMS.find((r) => r.id === id) ?? ROOMS[0];
}

/* ── Artwork ──────────────────────────────────────────────────────────────
 * Same files the live page uses, so nothing new ships to /public and both
 * pages stay pixel-identical where they share a room. `painted: false`
 * rooms never call these — RoomScene draws their SCENE_MOODS gradient. */

/** Full-bleed painted artwork, used inside a room. */
export const roomArt = (id: RoomId) => `/rooms/${id}.webp`;
/** Full, uncropped poster art — the hub grid's resting state. */
export const roomPoster = (id: RoomId) => `/rooms/full/${id}_full.webp`;
/** Animated room card, played on hover in the hub grid. */
export const roomCard = (id: RoomId) => `/rooms/${id}_card.webp`;

/**
 * Firebase Storage mirror of the same tree — the live page's onError
 * fallback, kept here for the same reason: /public and Storage can drift,
 * and a missing local file should degrade to the hosted copy rather than to
 * a broken image. See kids/rooms.ts's long note for the upload script.
 */
const STORAGE_BUCKET = 'awakened-path-2026.firebasestorage.app';
export const storageFallback = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(path)}?alt=media`;
