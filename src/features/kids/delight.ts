/**
 * THE THINGS THAT ASK A CHILD TO COME BACK TOMORROW.
 *
 * Five small pulls, and the rules they live by. Everything here is plain data
 * and plain functions; the screens draw it and the store keeps it.
 *
 *   - A garden that grows overnight: every good choice plants a seed, and the
 *     seed is a sprout tomorrow, a bud the day after, a flower after that.
 *   - Chirpy's surprise egg: one a day, and it hatches once the child has done
 *     one thing that day. Inside is a friend, a joke or a rare sticker.
 *   - A corner of the treehouse that is theirs, furnished with what they have
 *     earned and arranged however they like.
 *   - Chirpy remembers them, and says so when they come back.
 *   - A story in seven chapters a week, one opening each day.
 *
 * None of them punishes a missed day. A garden left alone keeps growing, the
 * egg simply waits, and every chapter of the week stays open once it opens.
 * Nothing is ever taken away.
 */

/* ── Days ─────────────────────────────────────────────────────────────────── */

/** `YYYY-MM-DD` in the child's own time zone, matching data.todayKey. */
export function dayDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dayKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Whole days from `from` to `to`; rounding absorbs the hour a clock change adds or removes. */
export function daysBetween(from: string, to: string): number {
  return Math.round((dayDate(to).getTime() - dayDate(from).getTime()) / 86400000);
}

export function weekdayName(key: string): string {
  return dayDate(key).toLocaleDateString('en', { weekday: 'long' });
}

/** Monday is 0, Sunday is 6. */
export function weekdayIndex(key: string): number {
  return (dayDate(key).getDay() + 6) % 7;
}

/** The Monday that starts the week `key` falls in. */
export function weekStartKey(key: string): string {
  const date = dayDate(key);
  date.setDate(date.getDate() - weekdayIndex(key));
  return dayKeyOf(date);
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ── What Chirpy remembers ───────────────────────────────────────────────── */

export type MemoryKind = 'game' | 'story' | 'feeling' | 'diary' | 'calm' | 'adventure' | 'egg' | 'garden';

export interface Memory {
  kind: MemoryKind;
  day: string;
  at: number;
  /** The Games Room theme, the feeling, the chapter title, the friend's name. */
  detail?: string;
}

export type NewMemory = Omit<Memory, 'day' | 'at'>;

/** Kept newest first, and only this many: Chirpy remembers the last few things, not a log. */
export const MEMORY_LIMIT = 8;

/* ── The garden ──────────────────────────────────────────────────────────── */

export type PlantKind =
  | 'kind' | 'truth' | 'choices' | 'include' | 'body' | 'help'
  | 'story' | 'diary' | 'calm' | 'adventure';

export interface Plant {
  id: string;
  kind: PlantKind;
  /** The day it was planted. Its stage is worked out from this, so it grows whether or not anyone looks. */
  day: string;
}

/** A day's seed pouch. More choices still earn stars and stickers; they just wait to be planted tomorrow. */
export const SEEDS_PER_DAY = 5;

export type FlowerShape = 'round' | 'pointed' | 'long' | 'tulip' | 'bell' | 'star';

export interface PlantInfo {
  name: string;
  /** Petal colours, light and deep. */
  petal: [string, string];
  center: string;
  shape: FlowerShape;
  petals: number;
  /** Where its seed came from, finishing "Planted when you…". */
  from: string;
}

export const PLANTS: Record<PlantKind, PlantInfo> = {
  kind:      { name: 'Kindness Rose',    petal: ['#ffc2de', '#e94f97'], center: '#ffe27a', shape: 'round',   petals: 7,  from: 'were kind in the Games Room' },
  truth:     { name: 'Truth Bluebell',   petal: ['#bfe1ff', '#4a86e8'], center: '#ffffff', shape: 'bell',    petals: 3,  from: 'told the truth in the Games Room' },
  choices:   { name: 'Brave Sunflower',  petal: ['#ffe58a', '#f0a12c'], center: '#7a4a1f', shape: 'long',    petals: 13, from: 'made a good choice in the Games Room' },
  include:   { name: 'Friendship Daisy', petal: ['#ffffff', '#cdb6ff'], center: '#ffcf4a', shape: 'long',    petals: 11, from: 'included everyone in the Games Room' },
  body:      { name: 'Strong Tulip',     petal: ['#ffc59c', '#f0703a'], center: '#ffe9a6', shape: 'tulip',   petals: 3,  from: 'took care of your body in the Games Room' },
  help:      { name: 'Helper Lily',      petal: ['#bff5f0', '#25a9a6'], center: '#ffe08a', shape: 'pointed', petals: 6,  from: 'helped others in the Games Room' },
  story:     { name: 'Story Starbloom',  petal: ['#e3ccff', '#8a5bdc'], center: '#fff2b0', shape: 'star',    petals: 5,  from: 'finished a Story Lab journey' },
  diary:     { name: 'Memory Moonflower', petal: ['#fff8dc', '#b9a7ff'], center: '#fff2b0', shape: 'round',  petals: 5,  from: 'wrote in your Inner Diary' },
  calm:      { name: 'Calm Lotus',       petal: ['#ffe1f0', '#ff8fc4'], center: '#fff6c8', shape: 'pointed', petals: 8,  from: 'took calm breaths in the Reflection Room' },
  adventure: { name: 'Adventure Star',   petal: ['#fff0a8', '#ffb03a'], center: '#fffbe6', shape: 'star',    petals: 5,  from: 'read a chapter of the weekly adventure' },
};

const GAME_ROOMS = ['kind', 'truth', 'choices', 'include', 'body', 'help'] as const;

/** Which seed an activity plants, if it plants one at all. Picking a feeling is noticed, not planted. */
export function plantKindFor(memory: NewMemory): PlantKind | null {
  switch (memory.kind) {
    case 'game': return (GAME_ROOMS as readonly string[]).includes(memory.detail ?? '') ? memory.detail as PlantKind : 'kind';
    case 'story': return 'story';
    case 'diary': return 'diary';
    case 'calm': return 'calm';
    case 'adventure': return 'adventure';
    default: return null;
  }
}

/** 0 seed, 1 sprout, 2 bud, 3 flower — one step a night. */
export type Stage = 0 | 1 | 2 | 3;
export const STAGE_NAMES = ['seed', 'sprout', 'bud', 'flower'] as const;

export function stageOf(plant: Plant, today: string): Stage {
  const days = daysBetween(plant.day, today);
  return days <= 0 ? 0 : days >= 3 ? 3 : days as Stage;
}

/** A flower that has been open for a few days starts to shimmer. */
export function isMagicBloom(plant: Plant, today: string): boolean {
  return daysBetween(plant.day, today) >= 6;
}

/** How many plants moved on a stage between two days — the "look what grew!" count. */
export function grewBetween(plants: readonly Plant[], from: string, to: string): number {
  if (!from || from >= to) return 0;
  return plants.filter((p) => p.day <= from && stageOf(p, to) > stageOf(p, from)).length;
}

export function bloomsOf(plants: readonly Plant[], today: string): number {
  return plants.filter((p) => stageOf(p, today) === 3).length;
}

/* ── The surprise egg ────────────────────────────────────────────────────── */

export interface EggFriend { id: string; emoji: string; name: string; line: string; color: string }

export const EGG_FRIENDS: EggFriend[] = [
  { id: 'owl', emoji: '🦉', name: 'Pip the Owlet', line: 'Pip loves big questions. Hoo-hoo-who are you today?', color: '#c9a6ff' },
  { id: 'ladybug', emoji: '🐞', name: 'Dot the Ladybug', line: 'Dot has seven spots, one for every day of the week.', color: '#ff8a8a' },
  { id: 'snail', emoji: '🐌', name: 'Shelly the Snail', line: 'Shelly goes slowly, so she notices everything.', color: '#ffd38a' },
  { id: 'hedgehog', emoji: '🦔', name: 'Bramble the Hedgehog', line: 'Bramble looks prickly, but gives the gentlest hugs.', color: '#e0b48a' },
  { id: 'bunny', emoji: '🐰', name: 'Clover the Bunny', line: 'Clover hops three times when she is happy. Try it!', color: '#ffc6e4' },
  { id: 'butterfly', emoji: '🦋', name: 'Flutter the Butterfly', line: 'Flutter was a caterpillar once. Big changes take time.', color: '#8ec8ff' },
  { id: 'squirrel', emoji: '🐿️', name: 'Nutmeg the Squirrel', line: 'Nutmeg saves acorns, and kind words, for later.', color: '#f0a46a' },
  { id: 'fish', emoji: '🐠', name: 'Bubbles the Fish', line: 'Bubbles blows a bubble every time someone shares.', color: '#7fe3e0' },
  { id: 'chick', emoji: '🐥', name: 'Sunny the Chick', line: 'Sunny is Chirpy’s tiny cousin. Cheep cheep!', color: '#ffe08a' },
  { id: 'turtle', emoji: '🐢', name: 'Moss the Turtle', line: 'Moss carries his home on his back and never hurries.', color: '#8fe3a3' },
  { id: 'panda', emoji: '🐼', name: 'Bao the Panda', line: 'Bao loves bamboo, naps and humming songs.', color: '#e6e3f5' },
  { id: 'fox', emoji: '🦊', name: 'Ember the Fox', line: 'Ember is brave, and she asks for help when she needs it.', color: '#ff9a5a' },
];

export const EGG_FRIEND_BY_ID: Record<string, EggFriend> = Object.fromEntries(EGG_FRIENDS.map((f) => [f.id, f]));

export const JOKES: Array<[string, string]> = [
  ['What do you call a sleeping dinosaur?', 'A dino-snore!'],
  ['Why did the cookie go to the doctor?', 'Because it felt crummy!'],
  ['What do clouds wear under their clothes?', 'Thunderwear!'],
  ['Why are fish so clever?', 'Because they live in schools!'],
  ['What do you call a bear with no teeth?', 'A gummy bear!'],
  ['Why did the teddy bear say no to pudding?', 'Because she was already stuffed!'],
  ['What did one plate say to the other plate?', 'Lunch is on me!'],
  ['What has ears but cannot hear?', 'A field of corn!'],
  ['Why did the banana go to the party?', 'Because it was a-peeling!'],
  ['What do you call a dog who does magic tricks?', 'A labracadabrador!'],
  ['What is an owl’s favourite subject?', 'Owl-gebra!'],
  ['Why did the bicycle fall over?', 'Because it was two-tired!'],
  ['What kind of tree fits in your hand?', 'A palm tree!'],
  ['What did the ocean say to the beach?', 'Nothing. It just waved!'],
  ['Why was the maths book sad?', 'It had too many problems!'],
  ['What is orange and sounds like a parrot?', 'A carrot!'],
  ['Why did the scarecrow win a prize?', 'Because he was outstanding in his field!'],
  ['What do you call a train that sneezes?', 'An achoo-choo train!'],
  ['Why did Chirpy sit on the clock?', 'He wanted to be on time!'],
  ['What do you call a snowman in summer?', 'A puddle!'],
  ['Why do bees hum?', 'Because they forgot the words!'],
  ['What did the big flower say to the little flower?', 'Hi, bud!'],
  ['How does the moon cut his hair?', 'Eclipse it!'],
  ['What do you call a cow with no legs?', 'Ground beef! Moo-ha-ha!'],
];

export type EggPrize =
  | { type: 'friend'; id: string }
  | { type: 'joke'; index: number }
  | { type: 'sticker'; id: string };

/** Every seventh egg is golden, and a golden egg always holds a rare sticker while any are left. */
export function isGoldenEgg(hatched: number): boolean {
  return (hatched + 1) % 7 === 0;
}

/** The shell for a given day: a new colour every morning, so even the egg says "today is new". */
export function eggLook(day: string, golden: boolean): { shell: [string, string]; spots: string } {
  if (golden) return { shell: ['#fff3b8', '#f2b52c'], spots: '#fffbe6' };
  const looks: Array<{ shell: [string, string]; spots: string }> = [
    { shell: ['#fff1f8', '#ffb6d9'], spots: '#ff7fb5' },
    { shell: ['#eef8ff', '#9fd2ff'], spots: '#4a86e8' },
    { shell: ['#f1fff4', '#a8eab8'], spots: '#36b36a' },
    { shell: ['#f6f0ff', '#cbb2ff'], spots: '#8a5bdc' },
    { shell: ['#fff8e8', '#ffd58f'], spots: '#f0a12c' },
    { shell: ['#effffd', '#9eeee6'], spots: '#25a9a6' },
  ];
  return looks[hash(day) % looks.length];
}

/**
 * What is inside today's egg. Friends come most often, because a friend is
 * something to keep; a joke is for the moment; a rare sticker is rare. The
 * pick never repeats a friend or a sticker the child already has, and only
 * starts repeating jokes once every one has been told.
 */
export function eggPrizeFor(input: {
  day: string; hatched: number; friends: readonly string[]; jokesTold: readonly number[];
  eggStickers: readonly string[]; allEggStickers: readonly string[];
}): EggPrize {
  const seed = hash(`${input.day}:${input.hatched}`);
  const freshFriends = EGG_FRIENDS.filter((f) => !input.friends.includes(f.id));
  const freshStickers = input.allEggStickers.filter((id) => !input.eggStickers.includes(id));
  const untold = JOKES.map((_, i) => i).filter((i) => !input.jokesTold.includes(i));
  const jokePool = untold.length ? untold : JOKES.map((_, i) => i);

  const friend = (): EggPrize | null => freshFriends.length ? { type: 'friend', id: freshFriends[seed % freshFriends.length].id } : null;
  const sticker = (): EggPrize | null => freshStickers.length ? { type: 'sticker', id: freshStickers[seed % freshStickers.length] } : null;
  const joke = (): EggPrize => ({ type: 'joke', index: jokePool[seed % jokePool.length] });

  if (isGoldenEgg(input.hatched)) return sticker() ?? friend() ?? joke();
  const turn = input.hatched % 3;
  if (turn === 1) return joke();
  return friend() ?? (turn === 2 ? sticker() : null) ?? joke();
}

/* ── My corner of the treehouse ──────────────────────────────────────────── */

export type Unlock =
  | { by: 'free' }
  | { by: 'stickers'; n: number }
  | { by: 'stars'; n: number }
  | { by: 'blooms'; n: number }
  | { by: 'story'; id: string };

export interface CornerItem {
  id: string;
  name: string;
  src: string;
  /** Width as a share of the room's width at scale 1. */
  w: number;
  unlock: Unlock;
  /** Rugs lie flat under everything else. */
  floor?: boolean;
  /** A rug painted from straight above is squashed to lie in the room's perspective. */
  flat?: number;
}

const C = '/mind-gym/corner/';

export const CORNER_ITEMS: CornerItem[] = [
  { id: 'beanbag', name: 'Comfy Beanbag', src: `${C}beanbag.webp`, w: 12, unlock: { by: 'free' } },
  { id: 'starrug', name: 'Star Rug', src: `${C}starrug.webp`, w: 24, unlock: { by: 'free' }, floor: true },
  { id: 'lantern', name: 'Star Lantern', src: `${C}lantern.webp`, w: 5.5, unlock: { by: 'stickers', n: 1 } },
  { id: 'plantpot', name: 'Heart Plant', src: `${C}plantpot.webp`, w: 8, unlock: { by: 'stickers', n: 3 } },
  { id: 'tablecup', name: 'Cocoa Table', src: `${C}tablecup.webp`, w: 10, unlock: { by: 'stickers', n: 5 } },
  { id: 'bench', name: 'Cosy Bench', src: `${C}bench.webp`, w: 16, unlock: { by: 'stickers', n: 8 } },
  { id: 'crystals', name: 'Glow Crystals', src: `${C}crystals.webp`, w: 9, unlock: { by: 'stickers', n: 12 } },
  { id: 'magicbook', name: 'Magic Book', src: `${C}magicbook.webp`, w: 10, unlock: { by: 'stickers', n: 16 } },
  { id: 'waterfall', name: 'Tiny Waterfall', src: `${C}waterfall.webp`, w: 12, unlock: { by: 'stickers', n: 20 } },
  { id: 'window', name: 'Sunset Window', src: `${C}window.webp`, w: 15, unlock: { by: 'stickers', n: 25 } },
  { id: 'chest', name: 'Treasure Chest', src: `${C}chest.webp`, w: 8, unlock: { by: 'stickers', n: 30 } },
  { id: 'lamp', name: 'Treehouse Lamp', src: `${C}lamp.webp`, w: 7, unlock: { by: 'stars', n: 100 } },
  { id: 'cushions', name: 'Star Cushions', src: `${C}cushions.webp`, w: 13, unlock: { by: 'stars', n: 200 } },
  { id: 'mandala', name: 'Moon Rug', src: `${C}mandala.webp`, w: 26, unlock: { by: 'stars', n: 350 }, floor: true, flat: 0.42 },
  { id: 'books', name: 'Be Kind Books', src: `${C}books.webp`, w: 9, unlock: { by: 'stars', n: 500 } },
  { id: 'v3lantern', name: 'Garden Lantern', src: `${C}v3lantern.webp`, w: 10, unlock: { by: 'stars', n: 750 } },
  { id: 'v3crystals', name: 'Crystal Grotto', src: `${C}v3crystals.webp`, w: 17, unlock: { by: 'stars', n: 1000 } },
  { id: 'sprout', name: 'Garden Sprout', src: `${C}sprout.webp`, w: 8, unlock: { by: 'blooms', n: 3 } },
  { id: 'bush', name: 'Flower Bush', src: `${C}bush.webp`, w: 11, unlock: { by: 'blooms', n: 10 } },
  { id: 'lostar', name: 'Twinkle the Star', src: `${C}lostar.webp`, w: 7, unlock: { by: 'story', id: 'lost-star' } },
  { id: 'cloud', name: 'Nimbus Cloud', src: `${C}cloud.webp`, w: 13, unlock: { by: 'story', id: 'cloud' } },
  { id: 'swirl', name: 'Treasure Swirl', src: `${C}swirl.webp`, w: 12, unlock: { by: 'story', id: 'treasure' } },
  { id: 'hearts', name: 'Moonlight Hearts', src: `${C}hearts.webp`, w: 11, unlock: { by: 'story', id: 'moon' } },
];

export const CORNER_ITEM_BY_ID: Record<string, CornerItem> = Object.fromEntries(CORNER_ITEMS.map((i) => [i.id, i]));

export interface CornerWall { id: string; name: string; filter: string; swatch: [string, string]; unlock: Unlock }

export const CORNER_WALLS: CornerWall[] = [
  { id: 'treehouse', name: 'Treehouse', filter: 'none', swatch: ['#f4b860', '#5b3a8c'], unlock: { by: 'free' } },
  { id: 'sunset', name: 'Sunset', filter: 'hue-rotate(-28deg) saturate(1.25)', swatch: ['#ffb36b', '#d9487a'], unlock: { by: 'stars', n: 150 } },
  { id: 'ocean', name: 'Ocean', filter: 'hue-rotate(58deg) saturate(1.1)', swatch: ['#7fd6ff', '#2f5bd6'], unlock: { by: 'stars', n: 300 } },
  { id: 'forest', name: 'Forest', filter: 'hue-rotate(118deg) saturate(.95)', swatch: ['#a8e57f', '#2f8c5a'], unlock: { by: 'stars', n: 450 } },
  { id: 'candy', name: 'Candy', filter: 'hue-rotate(-72deg) saturate(1.35) brightness(1.05)', swatch: ['#ffb3e6', '#c04fd9'], unlock: { by: 'stars', n: 650 } },
  { id: 'starlight', name: 'Starlight', filter: 'hue-rotate(22deg) brightness(.72) saturate(1.3)', swatch: ['#8f9bff', '#1f1a5c'], unlock: { by: 'stars', n: 900 } },
];

export interface CornerProgress { stickers: number; stars: number; blooms: number; stories: readonly string[] }

export function isUnlocked(unlock: Unlock, p: CornerProgress): boolean {
  switch (unlock.by) {
    case 'free': return true;
    case 'stickers': return p.stickers >= unlock.n;
    case 'stars': return p.stars >= unlock.n;
    case 'blooms': return p.blooms >= unlock.n;
    case 'story': return p.stories.includes(unlock.id);
  }
}

/** What it takes, in words a six-year-old can read. */
export function unlockLabel(unlock: Unlock): string {
  switch (unlock.by) {
    case 'free': return 'Ready for you';
    case 'stickers': return `Collect ${unlock.n} ${unlock.n === 1 ? 'sticker' : 'stickers'}`;
    case 'stars': return `Reach ${unlock.n} Mind Stars`;
    case 'blooms': return `Grow ${unlock.n} ${unlock.n === 1 ? 'flower' : 'flowers'}`;
    case 'story': return `Finish “${ADVENTURES.find((a) => a.id === unlock.id)?.title ?? 'a story'}”`;
  }
}

/** One thing standing in the corner. `id` is a CornerItem id, or `friend:<id>` for a hatched friend. */
export interface PlacedItem { uid: string; id: string; x: number; y: number; scale: number; flip: boolean }

/* ── The weekly adventure ────────────────────────────────────────────────── */

export interface StoryPage { text: string; scene: string }
export interface Chapter { title: string; pages: StoryPage[] }
export interface Adventure {
  id: string;
  title: string;
  cover: string;
  color: string;
  /** The corner decoration finishing the whole story unlocks. */
  keepsake: string;
  chapters: Chapter[];
}

export const ADVENTURES: Adventure[] = [
  {
    id: 'lost-star', title: 'Chirpy and the Lost Star', cover: '⭐', color: '#ffd86b', keepsake: 'lostar',
    chapters: [
      { title: 'The Falling Star', pages: [
        { scene: '🌙✨🌿', text: 'One quiet night, something went plink in the Mind Gym garden.' },
        { scene: '🐦⭐🍃', text: 'Chirpy hopped over. A tiny star was hiding under a leaf, shivering. Its light was very, very dim.' },
        { scene: '⭐💧', text: '“Are you lost?” whispered Chirpy. The little star nodded. “I fell, and now I can’t find my way home.”' },
      ] },
      { title: 'A Kind Hello', pages: [
        { scene: '🐦🤝⭐', text: 'Chirpy didn’t laugh or poke. He sat down next to the star and said, “Hello. I’m Chirpy. You’re safe here.”' },
        { scene: '⭐✨🧣', text: 'Something magical happened. The star glowed a little brighter. Kind words are like warm blankets.' },
        { scene: '⭐🐦🌌', text: '“My name is Twinkle,” said the star. “Will you help me get home?” “Of course,” said Chirpy. “Let’s go together.”' },
      ] },
      { title: 'The Map in the Sky', pages: [
        { scene: '🦉📜✨', text: 'First they visited Pip the owl, who knows every star by name.' },
        { scene: '🗺️⛰️💫', text: 'Pip unrolled a map of the sky. “Your home is above Whispering Hill,” she hooted. “Follow the path of glowing stones.”' },
        { scene: '👣👣👣', text: '“It’s so far,” said Twinkle. “Far is just lots of small steps,” said Pip. “One at a time.”' },
      ] },
      { title: 'The Wobbly Bridge', pages: [
        { scene: '🌉🌊😟', text: 'At the river there was a wobbly rope bridge. Chirpy’s tummy did a flip-flop.' },
        { scene: '🐦💬💛', text: '“I feel scared,” Chirpy said out loud. Saying it made the feeling a little smaller.' },
        { scene: '🌸🫧🌉', text: 'He took three slow breaths, in like smelling a flower and out like blowing a bubble, then crossed one step at a time. Brave means trying gently, even when you feel scared.' },
      ] },
      { title: 'Sharing the Light', pages: [
        { scene: '🌲✨🌑', text: 'On the other side they met a firefly called Flick, sitting all alone in the dark.' },
        { scene: '⭐💫✨', text: '“My light went out,” Flick sniffed. Twinkle thought for a moment, then shared a sparkle of her own glow.' },
        { scene: '✨⭐💖', text: 'Flick lit up! And guess what? Twinkle didn’t get any dimmer. When you share kindness, you never run out.' },
      ] },
      { title: 'The Honest Turn', pages: [
        { scene: '🪨🪨❓', text: 'The path split in two. Chirpy pointed left. “This way!” But after a while, the stones stopped glowing.' },
        { scene: '🐦💭🙈', text: 'Chirpy could have pretended. Instead he said, “I made a mistake. I think I chose the wrong way.”' },
        { scene: '🔙🪨✨', text: '“Thank you for telling the truth,” said Twinkle. They turned around together, and the stones lit up again.' },
      ] },
      { title: 'Home in the Sky', pages: [
        { scene: '⛰️🌌⭐', text: 'At the top of Whispering Hill, the whole sky was waiting. Twinkle’s family twinkled hello.' },
        { scene: '⭐🐦💛', text: '“Thank you, Chirpy. Thank you, {name},” said Twinkle. “You were kind, brave and honest.”' },
        { scene: '🌠🏡🌙', text: 'Up, up she floated, into her place in the sky. Look out of your window tonight. The star that winks at you is Twinkle, saying thank you.' },
      ] },
    ],
  },
  {
    id: 'cloud', title: 'Nimbus the Little Cloud', cover: '☁️', color: '#8ec8ff', keepsake: 'cloud',
    chapters: [
      { title: 'A Very Full Cloud', pages: [
        { scene: '☁️🌳☀️', text: 'High above the treehouse floated a little cloud called Nimbus.' },
        { scene: '🌫️☁️😶', text: 'Nimbus felt heavy and grey inside, full to the brim with a feeling he didn’t understand.' },
        { scene: '🐦☁️❔', text: '“Why are you so quiet?” asked Chirpy. “I don’t know,” sighed Nimbus. “I just feel… stuck.”' },
      ] },
      { title: 'Where Do You Feel It?', pages: [
        { scene: '☁️💭💓', text: '“Where do you feel it?” Chirpy asked gently. Nimbus thought. “In my middle. It’s tight, like a knot.”' },
        { scene: '🫶✨💜', text: '“Feelings live in our bodies too,” said Chirpy. “Noticing where is the first step.”' },
        { scene: '☁️💨😌', text: 'Nimbus took a slow, puffy breath. The knot loosened, just a tiny bit.' },
      ] },
      { title: 'Naming the Feeling', pages: [
        { scene: '☁️💬🐦', text: '“Can you give the feeling a name?” asked Chirpy. Nimbus whispered, “I think… I feel left out.”' },
        { scene: '☁️☁️☁️', text: '“The other clouds made a big shape together, and nobody asked me to join.”' },
        { scene: '🪟🌬️☁️', text: 'As soon as he said it, Nimbus felt lighter. Naming a feeling is like opening a window. Fresh air comes in.' },
      ] },
      { title: 'Clover’s Wind Game', pages: [
        { scene: '🐰🌬️🌼', text: 'Clover the bunny hopped by. “When I feel stuck, I play the wind game!”' },
        { scene: '🌬️☁️💨', text: '“Breathe in slowly… and blow out like the wind. Whoooosh!” Nimbus tried it. Whoooosh!' },
        { scene: '🍃🍂🍃', text: 'Every whoosh helped the grey feeling move along, like leaves blowing down a path.' },
      ] },
      { title: 'Gentle Rain', pages: [
        { scene: '☁️💧💧', text: 'Suddenly, plip, plop, Nimbus began to rain. Just a little.' },
        { scene: '🌧️🐦💙', text: '“Oh no, am I crying?” he worried. “It’s okay,” said Chirpy. “Sometimes feelings need to come out.”' },
        { scene: '🌷🌱🌻', text: 'Down below, the thirsty flowers lifted their faces and drank. Even sad feelings can help things grow.' },
      ] },
      { title: 'The Rainbow', pages: [
        { scene: '☀️🌦️✨', text: 'Then the sun peeked out. Sunlight and raindrops met in the sky…' },
        { scene: '🌈🌳😮', text: '…and made a RAINBOW! Red, orange, yellow, green, blue and purple, right across the treehouse.' },
        { scene: '☁️🌈😊', text: '“I made that?” gasped Nimbus. “You did,” smiled Chirpy. “Your feelings and the sunshine, together.”' },
      ] },
      { title: 'Room for Everyone', pages: [
        { scene: '☁️🤝☁️', text: 'The other clouds floated over. “We’re sorry we left you out,” they said. “Will you play with us?”' },
        { scene: '🐉🫖🐰', text: 'Together they made the best cloud shapes ever: a dragon, a teapot and a giant smiling bunny.' },
        { scene: '☁️💛☁️', text: 'Whenever a cloud floated alone after that, Nimbus was the first to say, “Come and join us!” Who could you include today, {name}?' },
      ] },
    ],
  },
  {
    id: 'treasure', title: 'The Treehouse Treasure Hunt', cover: '🗝️', color: '#ffb48a', keepsake: 'swirl',
    chapters: [
      { title: 'The Secret Note', pages: [
        { scene: '🚪✉️⭐', text: 'One morning, a note slid under the treehouse door. It was sealed with a golden star.' },
        { scene: '📜🔍✨', text: 'Chirpy read it out loud: “The treasure waits where kind hands work together. Find the five clues!”' },
        { scene: '🐦🪶🎉', text: '“A treasure hunt!” cheered Chirpy, flapping so hard a feather fell off. “Let’s go, {name}!”' },
      ] },
      { title: 'Clue One: The Slow Friend', pages: [
        { scene: '🐌🛤️⏳', text: 'In the garden, Shelly the snail was trying to cross the path. It was taking ages.' },
        { scene: '🍃🐌🐦', text: 'Chirpy didn’t rush her. He laid down a big leaf so she could slide across safely.' },
        { scene: '📝🌳✨', text: '“Thank you!” said Shelly. Under the leaf was the first clue: a tiny drawing of a swing.' },
      ] },
      { title: 'Clue Two: Taking Turns', pages: [
        { scene: '🦔🐿️😤', text: 'At the swing, Bramble the hedgehog and Nutmeg the squirrel were arguing. “My turn!” “No, MY turn!”' },
        { scene: '🔄🔢😊', text: '“What if you take turns?” said Chirpy. “Count to twenty each, then swap!”' },
        { scene: '😂🧱✨', text: 'Swinging and counting turned into a giggly game. When they finished, a clue fluttered down: a picture of building blocks.' },
      ] },
      { title: 'Clue Three: Oops!', pages: [
        { scene: '🧱💥🐦', text: 'In the playroom stood a tall block tower. Chirpy flew too close. CRASH! It tumbled down.' },
        { scene: '😳🐦💬', text: 'Chirpy’s cheeks went hot and he wanted to fly away. Instead he said, “I’m sorry. That was me. Can I help fix it?”' },
        { scene: '🧱🏆🧱', text: 'Everyone rebuilt it together, even taller than before! On the top block was clue three: a drawing of a pond.' },
      ] },
      { title: 'Clue Four: The Quiet Pond', pages: [
        { scene: '🌊🪷🔍', text: 'At the pond, the water was still and the clue was nowhere to be seen.' },
        { scene: '🐢🤫🪷', text: '“Shh,” said Moss the turtle. “Some clues you can only find when you are very, very still.”' },
        { scene: '🐠🫧🚪', text: 'Chirpy breathed slowly and listened. Bubbles the fish popped up and whispered, “Look for the door that needs everyone.”' },
      ] },
      { title: 'Clue Five: The Everyone Door', pages: [
        { scene: '🚪🐦💪', text: 'Behind the treehouse was a round door with a big golden handle. Chirpy pulled. It didn’t budge.' },
        { scene: '🐰🐌🦔🐿️🐢', text: 'Clover pulled too. Then Shelly, Bramble, Nutmeg, Moss… and you, {name}! Everybody pulled together.' },
        { scene: '🚪✨🤝', text: 'CREAK! The door swung open. Some doors only open when everyone is included.' },
      ] },
      { title: 'The Real Treasure', pages: [
        { scene: '🎁✨😮', text: 'Inside was a shining chest. Everyone held their breath as Chirpy lifted the lid…' },
        { scene: '📿🪞💛', text: 'Friendship bracelets, one for every friend! And at the bottom, a little mirror with a note: “The treasure is YOU, and all of you together.”' },
        { scene: '🌟🤗🌟', text: 'Being kind, taking turns, saying sorry, being still and including everyone. Those were the real treasures all along.' },
      ] },
    ],
  },
  {
    id: 'moon', title: 'The Moon Who Couldn’t Sleep', cover: '🌙', color: '#c9a6ff', keepsake: 'hearts',
    chapters: [
      { title: 'Wide Awake', pages: [
        { scene: '🌙😣✨', text: 'One night, the Moon just couldn’t fall asleep. She tossed and turned across the sky.' },
        { scene: '🌙💭⏰', text: '“If I don’t sleep, I’ll be grumpy tomorrow,” she worried, which made it even harder to sleep.' },
        { scene: '🐦🌙🛏️', text: 'Chirpy fluttered up in his pyjamas. “Can’t sleep either? Let’s try some sleepy magic together.”' },
      ] },
      { title: 'A Sip of Water', pages: [
        { scene: '🥛🌙🐦', text: '“First,” said Chirpy, “bodies like to be looked after.” He brought the Moon a cup of cool water.' },
        { scene: '🍎💃⭐', text: '“Did you eat good food today? Did you move and play?” “I danced with the stars!” said the Moon.' },
        { scene: '🌙🧸💤', text: '“Then your body has worked hard, and now it’s ready to rest.” The Moon felt a little cosier already.' },
      ] },
      { title: 'Stretchy Stars', pages: [
        { scene: '⭐🙆⭐', text: 'The stars came over to help. “Let’s do a stretchy star!”' },
        { scene: '🙌✨🍜', text: 'Reach up high, high, high… wiggle your fingers… and flop down like a floppy noodle!' },
        { scene: '😆🌙💫', text: 'They did it three times. The Moon giggled. Her shoulders felt soft and loose.' },
      ] },
      { title: 'The Worry Jar', pages: [
        { scene: '🌙🐝💭', text: '“I still have worries buzzing around my head,” said the Moon.' },
        { scene: '🦉🫙✨', text: 'Pip the owl brought a jar full of stardust. “Whisper each worry into the jar. It will keep them safe until morning.”' },
        { scene: '🫙🔒😌', text: 'The Moon whispered three worries in. The lid went click. Her head felt quiet and roomy.' },
      ] },
      { title: 'The Humming Song', pages: [
        { scene: '🐼🎵🌙', text: 'Bao the panda began to hum a slow, low song. Mmmmmm…' },
        { scene: '🎶💜🎶', text: '“Hum with me,” said Bao. “Can you feel the buzz in your chest?” The Moon hummed. Chirpy hummed. The whole sky hummed.' },
        { scene: '🎵😌💤', text: 'Humming slows your breathing down all by itself. Try it now. Mmmmmm.' },
      ] },
      { title: 'Three Kind Things', pages: [
        { scene: '🐑❌💛', text: '“Let’s count kind things from today,” Chirpy whispered. “Not sheep. Kind things!”' },
        { scene: '🦔🌻☁️', text: '“I lit the path for a lost hedgehog,” said the Moon. “I shared my seeds,” said Chirpy. “I helped a cloud,” said a star.' },
        { scene: '✨✨✨', text: 'What kind things did you do today, {name}? Counting them is like collecting little lights.' },
      ] },
      { title: 'Goodnight, Moon', pages: [
        { scene: '🥱🌙🌌', text: 'The Moon gave a big, slow yawn. Her eyes grew heavy. Her glow went soft and silver.' },
        { scene: '🥛🫙🎵', text: '“Thank you, friends,” she murmured. “Water, stretching, a worry jar, humming and kind thoughts. That’s my sleepy magic.”' },
        { scene: '🌙💤🏡', text: 'And the Moon fell fast asleep, glowing gently over every bed, including yours. Goodnight, {name}.' },
      ] },
    ],
  },
];

/** Weeks since a Monday long ago, so the four stories take turns forever. */
const EPOCH_MONDAY = '2024-01-01';

/**
 * A grown-up's story takes the one week it is booked for; every other week
 * keeps the built-in rotation, which never shifts to make room — so writing a
 * new story can't swap the one a child is halfway through.
 */
export function adventureForWeek(weekKey: string, parentStories: readonly ParentStory[] = []): Adventure {
  const own = parentStories.find((s) => s.week === weekKey && storyProblems(s).length === 0);
  if (own) return own;
  const weeks = Math.floor(daysBetween(EPOCH_MONDAY, weekKey) / 7);
  return ADVENTURES[((weeks % ADVENTURES.length) + ADVENTURES.length) % ADVENTURES.length];
}

/* ── Stories a grown-up writes ───────────────────────────────────────────── */

/** Written in the Story Studio. `week` is the Monday it is told; without one it is a draft. */
export interface ParentStory extends Adventure { week?: string }

export const MAX_PAGES = 6;
/** About as much as the book's page holds at a size a child can read. */
export const MAX_PAGE_TEXT = 240;

/** What still stands between a story and the map, first thing first. */
export function storyProblems(story: Adventure): string[] {
  const problems: string[] = [];
  if (!story.title.trim()) problems.push('Give the story a title.');
  if (story.chapters.length !== 7) problems.push('A story needs seven chapters, one for each day.');
  story.chapters.forEach((ch, i) => {
    if (!ch.title.trim()) problems.push(`Chapter ${i + 1} needs a title.`);
    if (!ch.pages.length) problems.push(`Chapter ${i + 1} needs at least one page.`);
    ch.pages.forEach((pg, j) => {
      if (!pg.text.trim()) problems.push(`Chapter ${i + 1}, page ${j + 1} has no words yet.`);
    });
  });
  return problems;
}

/** Chapter n (0-based) opens on day n of the week, and stays open all week once it has. */
export function chapterOpen(chapter: number, today: string): boolean {
  return chapter <= weekdayIndex(today);
}

export function withName(text: string, name: string): string {
  return text.replace(/\{name\}/g, name || 'friend');
}

/* ── Chirpy's welcome back ───────────────────────────────────────────────── */

const PRACTISED: Record<string, string> = {
  kind: 'being kind', truth: 'telling the truth', choices: 'making good choices',
  include: 'including everyone', body: 'taking care of your body', help: 'helping others',
};

function remembered(m: Memory): string {
  switch (m.kind) {
    case 'game': return `you practised ${PRACTISED[m.detail ?? ''] ?? 'good choices'} in the Games Room`;
    case 'story': return m.detail ? `you looked at a ${m.detail.toLowerCase()} feeling in the Story Lab` : 'you finished a Story Lab journey';
    case 'feeling': return m.detail ? `you told me you felt ${m.detail.toLowerCase()}` : 'you told me how you felt';
    case 'diary': return 'you wrote in your Inner Diary';
    case 'calm': return m.detail === 'quiet' ? 'you had some quiet time in the Reflection Room' : 'you took some calm breaths with me';
    case 'adventure': return m.detail ? `we read “${m.detail}” together` : 'we read a story together';
    case 'egg': return m.detail ? `${m.detail} hatched out of your egg` : 'your egg hatched';
    case 'garden': return 'you watered your garden';
  }
}

function followUp(m: Memory): string {
  switch (m.kind) {
    case 'game': return 'Want to play again?';
    case 'story': return 'How is that feeling now?';
    case 'feeling': return 'How is that feeling today?';
    case 'diary': return 'What will today’s page say?';
    case 'calm': return 'Shall we breathe together again?';
    case 'adventure': return 'The next chapter is waiting!';
    case 'egg': return 'I wonder what today’s egg holds!';
    case 'garden': return 'Your flowers missed you!';
  }
}

export interface Greeting { title: string; line: string }

/**
 * What Chirpy says when a child comes back, written to kit/awayFor's rules: it
 * is only ever about something the child did and chose to tell him, and it
 * never names how long they were gone, never says they were missed and never
 * asks why. "Last time", not "on Tuesday".
 *
 * After a real absence he does not reach back for what they told him weeks
 * ago at all; he has news of his own instead, and only if there is some.
 * Nothing on a first visit, and nothing once they have started today, unless
 * the egg is ready — that is news every time.
 */
export function rememberedGreeting(input: {
  name: string; today: string; memories: readonly Memory[]; grew: number; eggReady: boolean;
}): Greeting | null {
  const hi = input.name ? `, ${input.name}` : '';
  if (input.eggReady) return { title: `Your egg is wiggling${hi}!`, line: 'Something is about to hatch. Tap your egg to see!' };
  if (input.memories.some((m) => m.day === input.today)) return null;
  const last = input.memories.find((m) => m.day < input.today);
  if (!last) return null;
  if (daysBetween(last.day, input.today) >= 7) {
    return input.grew > 0
      ? { title: `Hello${hi}!`, line: 'Guess what? Your garden kept growing while I was napping. Come and see what came up!' }
      : null;
  }
  const when = daysBetween(last.day, input.today) === 1 ? 'Yesterday' : 'Last time';
  return { title: `Welcome back${hi}!`, line: `${when} ${remembered(last)}. ${followUp(last)}` };
}
