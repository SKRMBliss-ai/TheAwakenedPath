/**
 * BUDDIES — the creatures a child collects by earning Mind Stars.
 *
 * Every good thing done in the gym earns stars; stars fill a level bar; every
 * level gives an egg; every egg hatches a new creature from the world the
 * child chose. Dinosaurs for one child, unicorns or sea creatures or space
 * friends for another, and the first one is always theirs to pick.
 *
 * The rules it keeps, the same as the rest of the gym:
 *   - Nothing is ever lost. Stars are never spent, a level is never taken
 *     back, and a buddy is never sad, hungry or left behind on a missed day.
 *   - No luck that can disappoint. What hatches next is decided by an order
 *     made for each world, so every egg is a new friend; the surprise is in
 *     the reveal, never in a chance of getting nothing.
 *   - Every fact is true (the legends say they are legends), so collecting a
 *     dinosaur also means learning something real about it.
 *
 * Plain data and plain functions; the store keeps what has hatched and the
 * screens draw it.
 */

export type WorldId = 'dino' | 'magic' | 'ocean' | 'space';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Creature {
  id: string;
  world: WorldId;
  /** Their own name: "Rory". */
  name: string;
  /** What they are: "T. rex". */
  kind: string;
  rarity: Rarity;
  /** One true thing about the real animal (or, for a legend, that it is one). */
  fact: string;
  /** What they say when tapped. */
  hello: string;
}

export interface World {
  id: WorldId;
  name: string;
  emoji: string;
  tagline: string;
  /** "dinos", "friends": how the collection talks about them. */
  plural: string;
  /** Sky, horizon and ground of the world's backdrop. */
  colors: [string, string, string];
  /** The three a child chooses their first buddy from. */
  starters: [string, string, string];
  /** The order eggs hatch in. Anything already owned is skipped. */
  order: string[];
  /** Explorer titles, from the first level to the last. */
  ranks: [string, string, string, string, string];
}

export const WORLDS: World[] = [
  {
    id: 'dino', name: 'Dino Island', emoji: '🦖', plural: 'dinos',
    tagline: 'Hatch real dinosaurs and learn amazing dino facts!',
    colors: ['#ffb86b', '#ff7a6b', '#3d2a6e'],
    starters: ['rex', 'trike', 'longneck'],
    order: ['stego', 'rex', 'trike', 'longneck', 'raptor', 'anky', 'ptero', 'para', 'pachy', 'spino', 'plesio', 'crystal'],
    ranks: ['Egg Finder', 'Dino Spotter', 'Fossil Hunter', 'Dino Ranger', 'Dino Legend'],
  },
  {
    id: 'magic', name: 'Unicorn Sky', emoji: '🦄', plural: 'friends',
    tagline: 'Unicorns, rainbows and baby dragons!',
    colors: ['#ffd1f1', '#b9a2ff', '#4b3a9c'],
    starters: ['unicorn', 'pegasus', 'dragon'],
    order: ['bunny', 'unicorn', 'pegasus', 'dragon', 'lamb', 'fox', 'phoenix', 'rainbow'],
    ranks: ['Wish Maker', 'Star Rider', 'Rainbow Keeper', 'Sky Guardian', 'Unicorn Legend'],
  },
  {
    id: 'ocean', name: 'Ocean Reef', emoji: '🐬', plural: 'sea friends',
    tagline: 'Dive deep and meet amazing sea creatures!',
    colors: ['#9ff3ff', '#36a9f0', '#123a86'],
    starters: ['dolphin', 'turtle', 'octopus'],
    order: ['puffer', 'dolphin', 'turtle', 'octopus', 'seahorse', 'shark', 'narwhal', 'whale'],
    ranks: ['Shell Finder', 'Wave Rider', 'Reef Explorer', 'Ocean Ranger', 'Ocean Legend'],
  },
  {
    id: 'space', name: 'Star Station', emoji: '🚀', plural: 'space friends',
    tagline: 'Blast off and meet friends from the stars!',
    colors: ['#6a4fd8', '#271663', '#0b0727'],
    starters: ['robot', 'alien', 'pup'],
    order: ['rocket', 'robot', 'alien', 'pup', 'ufo', 'jelly', 'planet', 'galaxy'],
    ranks: ['Star Spotter', 'Space Cadet', 'Moon Walker', 'Galaxy Ranger', 'Space Legend'],
  },
];

export const WORLD_BY_ID: Record<WorldId, World> = Object.fromEntries(WORLDS.map((w) => [w.id, w])) as Record<WorldId, World>;

const c = (world: WorldId, id: string, name: string, kind: string, rarity: Rarity, fact: string, hello: string): Creature =>
  ({ id, world, name, kind, rarity, fact, hello });

export const CREATURES: Creature[] = [
  /* Dino Island. Two of them were never dinosaurs, and saying so is the fact
     every dinosaur-mad child most likes to tell a grown-up. */
  c('dino', 'rex', 'Rory', 'T. rex', 'rare',
    'T. rex had teeth as long as bananas, and it could smell its dinner from far, far away!',
    'RAWR! That means hello in dinosaur!'),
  c('dino', 'trike', 'Trixie', 'Triceratops', 'common',
    'Triceratops means “three-horned face”. It ate plants, and it had hundreds of teeth for chewing them!',
    'Horns up! Let’s be brave together.'),
  c('dino', 'longneck', 'Lulu', 'Brachiosaurus', 'common',
    'Brachiosaurus was as tall as a four-storey building, so it could eat leaves from the very tops of trees!',
    'I can see everything from up here. Hello down there!'),
  c('dino', 'stego', 'Spike', 'Stegosaurus', 'common',
    'Stegosaurus had big plates along its back and four sharp spikes on the end of its tail.',
    'Want to count my plates with me?'),
  c('dino', 'anky', 'Tank', 'Ankylosaurus', 'common',
    'Ankylosaurus was covered in bony armour, like a living tank, and it had a heavy club on the end of its tail.',
    'I’m tough on the outside and soft on the inside!'),
  c('dino', 'para', 'Toot', 'Parasaurolophus', 'common',
    'Parasaurolophus had a long hollow crest. Scientists think it could blow air through it to make a sound like a trumpet!',
    'Toot toot! That’s my happy song!'),
  c('dino', 'pachy', 'Bonk', 'Pachycephalosaurus', 'common',
    'Pachycephalosaurus had a dome of bone on top of its head that was thicker than a big dictionary!',
    'Bonk! I use my head to think good thoughts.'),
  c('dino', 'raptor', 'Zip', 'Velociraptor', 'rare',
    'Velociraptor was about as big as a turkey, and it had feathers!',
    'Zoom! I’m fast, but I always stop to help a friend.'),
  c('dino', 'ptero', 'Sky', 'Pteranodon', 'rare',
    'Pteranodon wasn’t a dinosaur! It was a flying reptile with wings wider than a car.',
    'Wheee! Let’s fly over the treetops!'),
  c('dino', 'spino', 'Sails', 'Spinosaurus', 'epic',
    'Spinosaurus was even longer than T. rex, and it spent lots of time in rivers catching fish!',
    'Splash! The river is my favourite place.'),
  c('dino', 'plesio', 'Nessie', 'Plesiosaur', 'epic',
    'Plesiosaurs swam in the sea with four big flippers. They lived when the dinosaurs did, but they weren’t dinosaurs!',
    'Blub blub! Want to go for a swim?'),
  c('dino', 'crystal', 'Prism', 'Crystal Rex', 'legendary',
    'The Crystal Rex is a legend of Dino Island. It only appears to explorers who keep on trying, like you!',
    'You found me! Every kind thing you do makes me sparkle.'),

  /* Unicorn Sky: the creatures are from stories, so the facts are about the stories. */
  c('magic', 'unicorn', 'Sparkle', 'Unicorn', 'common',
    'People have told stories about unicorns for more than two thousand years!',
    'Hello, friend! Let’s make today sparkly.'),
  c('magic', 'pegasus', 'Breeze', 'Pegasus', 'common',
    'There is a group of stars in the night sky named after Pegasus, the flying horse!',
    'Up, up and away! Hold on tight!'),
  c('magic', 'dragon', 'Ember', 'Baby Dragon', 'rare',
    'In stories from China, dragons are kind and wise, and they bring good luck!',
    'I can only breathe warm hugs, not fire!'),
  c('magic', 'bunny', 'Luna', 'Moon Bunny', 'common',
    'In stories from China, Japan and Korea, people see a rabbit in the shapes on the Moon. Look tonight!',
    'Hop hop! Let’s look at the Moon tonight.'),
  c('magic', 'lamb', 'Puff', 'Cloud Lamb', 'common',
    'Real clouds are made of tiny drops of water floating in the sky. Puff is made of the softest ones!',
    'Fluffy hug incoming!'),
  c('magic', 'fox', 'Kit', 'Star Fox', 'rare',
    'In stories from Japan, a magic fox grows a new tail each time it grows wiser. Kit has three!',
    'Every time you learn something, I grow a little wiser too.'),
  c('magic', 'phoenix', 'Flare', 'Phoenix', 'epic',
    'In old stories, the phoenix is a bird that always rises again, just like you when you try again!',
    'Never give up! I never do.'),
  c('magic', 'rainbow', 'Aurora', 'Rainbow Unicorn', 'legendary',
    'Aurora is a legend of Unicorn Sky. Her mane holds every colour of the rainbow, and every colour of feeling!',
    'All your feelings are welcome here. Every single colour.'),

  /* Ocean Reef. */
  c('ocean', 'dolphin', 'Splash', 'Dolphin', 'common',
    'Dolphins have names! Each dolphin has its very own whistle that its friends know.',
    'Eee-eee! That’s my whistle for you!'),
  c('ocean', 'turtle', 'Myrtle', 'Sea Turtle', 'common',
    'Sea turtles can hold their breath for hours while they sleep underwater!',
    'Slow and steady. Let’s take a deep breath together.'),
  c('ocean', 'octopus', 'Inky', 'Octopus', 'common',
    'An octopus has three hearts and blue blood!',
    'Eight arms means eight hugs!'),
  c('ocean', 'puffer', 'Puffy', 'Pufferfish', 'common',
    'When a pufferfish feels scared, it fills up with water and turns into a big spiky ball!',
    'When I feel scared I puff up. Then I breathe, and I feel better.'),
  c('ocean', 'seahorse', 'Coral', 'Seahorse', 'rare',
    'Seahorse dads carry their babies in a pouch until they are born!',
    'Let’s hold tails and be friends!'),
  c('ocean', 'shark', 'Finn', 'Gentle Shark', 'rare',
    'Sharks were swimming in the sea before the dinosaurs were even born!',
    'I’m a gentle shark. Let’s swim together!'),
  c('ocean', 'narwhal', 'Twirl', 'Narwhal', 'epic',
    'A narwhal’s long tusk is really a tooth, and it can grow longer than a grown-up is tall!',
    'My tooth is longer than you are tall!'),
  c('ocean', 'whale', 'Pearl', 'Rainbow Whale', 'legendary',
    'Pearl is a legend of Ocean Reef. Real blue whales are the biggest animals that have ever lived, even bigger than dinosaurs!',
    'The ocean is big, and so is your heart.'),

  /* Star Station. */
  c('space', 'robot', 'Bolt', 'Robot', 'common',
    'Real robots called rovers have driven around on Mars and sent photos home to Earth!',
    'Beep boop! Kindness levels: one hundred percent!'),
  c('space', 'alien', 'Zib', 'Alien', 'common',
    'Space is so big that light from some stars takes thousands of years to reach your eyes!',
    'Greetings, Earth friend! Your planet is my favourite.'),
  c('space', 'pup', 'Comet', 'Astro-Pup', 'common',
    'Astronauts float in space, so they sleep in sleeping bags tied to the wall!',
    'Woof! Ready for lift-off?'),
  c('space', 'rocket', 'Zoom', 'Rocket Pal', 'common',
    'To get to space, a rocket goes more than two hundred times faster than a car on the motorway!',
    '3, 2, 1… let’s go!'),
  c('space', 'ufo', 'Orbit', 'UFO Kitty', 'rare',
    'There is no wind on the Moon, so the footprints astronauts left there are still there today!',
    'Meow! I flew here from a planet made of yarn.'),
  c('space', 'jelly', 'Glimmer', 'Star Jelly', 'rare',
    'Real jellyfish have been to space! Scientists sent them up to learn how bodies grow.',
    'I glow brighter when you smile!'),
  c('space', 'planet', 'Rings', 'Planet Pal', 'epic',
    'Saturn’s rings are made of billions of bits of ice and rock, some as small as sand and some as big as a house!',
    'Let’s spin round and round!'),
  c('space', 'galaxy', 'Nebula', 'Galaxy Dragon', 'legendary',
    'Nebula is a legend of Star Station. Real nebulas are giant clouds of gas and dust where new stars are born!',
    'You shine brighter than a thousand stars.'),
];

export const CREATURE_BY_ID: Record<string, Creature> = Object.fromEntries(CREATURES.map((x) => [x.id, x]));

export function creaturesOf(world: WorldId): Creature[] {
  return WORLD_BY_ID[world].order.map((id) => CREATURE_BY_ID[id]);
}

/* ── Shiny ones ──────────────────────────────────────────────────────────────
   Once a world is complete its eggs hatch shiny ones: the same friends in
   new colours, marked with a star. Kept in the collection as `id*`. */

export const shinyOf = (id: string) => `${id}*`;
export const isShiny = (owned: string) => owned.endsWith('*');
export const baseOf = (owned: string) => (isShiny(owned) ? owned.slice(0, -1) : owned);

/* ── Rarity ─────────────────────────────────────────────────────────────── */

export const RARITY: Record<Rarity, { label: string; stars: number; color: string; deep: string }> = {
  common: { label: 'Common', stars: 1, color: '#8fe388', deep: '#2f9a4e' },
  rare: { label: 'Rare', stars: 2, color: '#7cc8ff', deep: '#2f6fd6' },
  epic: { label: 'Epic', stars: 3, color: '#d2a2ff', deep: '#8a3fe0' },
  legendary: { label: 'Legendary', stars: 4, color: '#ffd45c', deep: '#e08a12' },
};

/* ── Levels ──────────────────────────────────────────────────────────────────
   The first level comes after 20 stars, which one good choice and a tick or
   two will earn, so a first visit nearly always ends with an egg. After that
   each level asks for 15 more stars than the one before: always close enough
   to see, never so close that it stops meaning something. */

export const FIRST_LEVEL_STARS = 20;
export const LEVEL_STEP = 15;

/** Stars needed, in total, to reach `level`. Level 1 is where everyone starts. */
export function starsForLevel(level: number): number {
  const n = Math.max(0, Math.floor(level) - 1);
  return FIRST_LEVEL_STARS * n + (LEVEL_STEP * n * (n - 1)) / 2;
}

export interface LevelInfo {
  level: number;
  /** Stars it took to reach this level, and to reach the next. */
  floor: number;
  next: number;
  /** Stars so far into this level, and how many the whole level needs. */
  into: number;
  need: number;
  /** How many more until the next level. */
  left: number;
  /** 0 to 1. */
  progress: number;
}

export function levelOf(stars: number): LevelInfo {
  const s = Math.max(0, Math.floor(stars));
  let level = 1;
  while (starsForLevel(level + 1) <= s) level++;
  const floor = starsForLevel(level);
  const next = starsForLevel(level + 1);
  const need = next - floor;
  const into = s - floor;
  return { level, floor, next, into, need, left: next - s, progress: need ? into / need : 1 };
}

/** One egg for every level above the first. */
export const eggsEarned = (stars: number) => levelOf(stars).level - 1;

export function eggsReady(stars: number, opened: number): number {
  return Math.max(0, eggsEarned(stars) - opened);
}

/** The explorer title for a level, in the world's own words. */
export function rankOf(world: WorldId, level: number): string {
  const r = WORLD_BY_ID[world].ranks;
  return level >= 15 ? r[4] : level >= 10 ? r[3] : level >= 6 ? r[2] : level >= 3 ? r[1] : r[0];
}

/** A buddy grows up with the child: 0 just hatched, 1 little, 2 big, 3 hero. */
export type Growth = 0 | 1 | 2 | 3;
export function growthOf(level: number): Growth {
  return level >= 15 ? 3 : level >= 10 ? 2 : level >= 5 ? 1 : 0;
}
export const GROWTH_NAMES = ['Baby', 'Little', 'Big', 'Hero'] as const;

/* ── What hatches next ───────────────────────────────────────────────────── */

export interface Hatch { id: string; shiny: boolean }

/** The next creature this world's egg holds: the next in its order not yet
    owned, then the shiny ones, then nothing (the store gives stars instead). */
export function nextHatch(world: WorldId, owned: readonly string[]): Hatch | null {
  const order = WORLD_BY_ID[world].order;
  const fresh = order.find((id) => !owned.includes(id));
  if (fresh) return { id: fresh, shiny: false };
  const shiny = order.find((id) => !owned.includes(shinyOf(id)));
  return shiny ? { id: shiny, shiny: true } : null;
}

/** The ones still to hatch, in the order they will, so the collection can
    say which level each arrives at. */
export function stillToHatch(world: WorldId, owned: readonly string[]): string[] {
  return WORLD_BY_ID[world].order.filter((id) => !owned.includes(id));
}

/** The level the k-th still-to-hatch creature arrives at, counting from 0,
    given how many eggs have been opened so far. */
export function hatchLevel(k: number, opened: number): number {
  return opened + k + 2;
}
