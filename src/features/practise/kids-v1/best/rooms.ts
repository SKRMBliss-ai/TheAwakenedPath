/**
 * THE ROOMS OF MIND GYM.
 *
 * This is the join between two things that already existed and were both
 * half-right on their own.
 *
 * "My Best Every Day" had the engine that works: seven ethical virtues, ticked
 * off daily, points that accumulate, a streak, a store that already tracked
 * points per virtue. What it looked like was a checklist.
 *
 * Kids Gym v1 had the world that works: painted rooms, Chirpy, games, the
 * five-step reflection. What it did was ask a child to walk a long reflective
 * spine before they had any reason to care.
 *
 * So: each virtue IS a room. Ticking "was I kind today?" happens inside the
 * Kindness Garden, next to the games that teach kindness and the small thing
 * there is to learn about it. The points a child already earns per virtue
 * become the room's own light. Nothing new to explain — the checklist grew a
 * world around it.
 *
 * The room ids are the BEHAVIOUR ids from My Best Every Day, deliberately, so
 * every point, tick, streak and badge a child has already earned still counts.
 * No migration, no reset, no "start again".
 */

import { BEHAVIOURS } from '../../../kids/data';
import type { RoomId as GymRoomId } from '../rooms';

export interface VirtueRoom {
  /** Same id as the behaviour in My Best Every Day. Do not renumber. */
  id: string;
  name: string;
  /** The one-line invitation on the room's card. */
  tagline: string;
  /** What ticking this room's virtue actually asks. From BEHAVIOURS. */
  prompt: string;
  points: number;
  emoji: string;
  /** Two-stop gradient, darkest last. */
  ground: [string, string];
  accent: string;
  /** The warm light every room must have (UI §2.3) — never a cool hue. */
  glow: string;
  /**
   * Which Kids Gym v1 room this virtue draws its existing games from, so the
   * 67-game library lands in sensible places instead of being rebuilt. Null
   * where the room's games are all new.
   */
  gamesFrom: GymRoomId | null;
  /** The small thing there is to know here. Shown once, quietly, never as a lesson. */
  learn: { title: string; body: string };
}

const BEH = (id: string) => BEHAVIOURS.find((b) => b.id === id)!;

export const VIRTUE_ROOMS: VirtueRoom[] = [
  {
    id: 'kind',
    name: 'Kindness Garden',
    tagline: 'Things grow here when you’re kind. Slowly, but they do.',
    prompt: BEH('kind').prompt,
    points: BEH('kind').points,
    emoji: '🌱',
    ground: ['#3D1F4A', '#160A1E'],
    accent: '#FF6B9D',
    glow: 'rgba(255,183,214,0.34)',
    gamesFrom: 'kindness',
    learn: {
      title: 'Kind is a thing you do, not a thing you are',
      body: 'Nobody is kind all the time — not your friends, not grown-ups, not anybody. Kindness is something you do, one go at a time, and every single time counts on its own. Missing one doesn’t undo the rest.',
    },
  },
  {
    id: 'truth',
    name: 'Truth Lab',
    tagline: 'Where you find out what really happened.',
    prompt: BEH('truth').prompt,
    points: BEH('truth').points,
    emoji: '🔬',
    ground: ['#0E3038', '#04141A'],
    accent: '#4EA8DE',
    glow: 'rgba(255,206,138,0.28)',
    gamesFrom: 'thought',
    learn: {
      title: 'The hardest truths are the small ones',
      body: 'Big lies are easy to spot. The tricky ones are tiny — “it wasn’t me”, “I already did it”, “I only had one”. Telling a small truth when nobody would ever know is the whole skill. That’s the one worth practising.',
    },
  },
  {
    id: 'choices',
    name: 'Courage Castle',
    tagline: 'Brave isn’t not scared. Brave is scared and doing it anyway.',
    prompt: BEH('choices').prompt,
    points: BEH('choices').points,
    emoji: '🏰',
    ground: ['#2B2140', '#0D0916'],
    accent: '#9B5DE5',
    glow: 'rgba(255,190,120,0.32)',
    gamesFrom: 'story',
    learn: {
      title: 'There’s a gap between what happens and what you do',
      body: 'Something happens. Then you do something. In between there’s a gap — usually about one breath long. The gap is where you get to choose. It’s small, but it’s always there, and it gets bigger with practice.',
    },
  },
  {
    id: 'include',
    name: 'Friendship Park',
    tagline: 'Nobody plays alone here unless they want to.',
    prompt: BEH('include').prompt,
    points: BEH('include').points,
    emoji: '🌈',
    ground: ['#3B1E12', '#140A06'],
    accent: '#F15BB5',
    glow: 'rgba(255,183,94,0.36)',
    gamesFrom: 'friendship',
    learn: {
      title: 'Being left out hurts in your body',
      body: 'Scientists checked: being left out lights up the same bits of your brain as being hurt. That’s why it feels so bad — it genuinely is a kind of hurt. It’s also why letting someone in matters more than it looks like it does.',
    },
  },
  {
    id: 'body',
    name: 'Healthy Body Zone',
    tagline: 'Your body knows things before you do.',
    prompt: BEH('body').prompt,
    points: BEH('body').points,
    emoji: '🍎',
    ground: ['#0B2C25', '#04120F'],
    accent: '#43BC5F',
    glow: 'rgba(255,214,150,0.3)',
    gamesFrom: 'body',
    learn: {
      title: 'Tired and sad feel almost the same',
      body: 'A lot of the time when everything seems terrible, you’re actually just tired, or hungry, or you haven’t moved all day. It’s worth checking those first — not because your feelings aren’t real, but because sometimes the fix is a sandwich.',
    },
  },
  {
    id: 'help',
    name: 'Helping Hands Village',
    tagline: 'Small helps count. Most helps are small.',
    prompt: BEH('help').prompt,
    points: BEH('help').points,
    emoji: '🤝',
    ground: ['#3A2410', '#150D06'],
    accent: '#FFB703',
    glow: 'rgba(255,196,120,0.36)',
    gamesFrom: 'together',
    learn: {
      title: 'Helping without being asked is a different thing',
      body: 'Doing what you’re told is fine. Noticing that something needs doing and just doing it is a whole other skill, and it’s much rarer. Grown-ups notice it far more than they let on.',
    },
  },
  {
    id: 'mindheart',
    name: 'Reflection Observatory',
    tagline: 'Where you look back at what you found.',
    prompt: BEH('mindheart').prompt,
    points: BEH('mindheart').points,
    emoji: '🔭',
    ground: ['#070B24', '#03050F'],
    accent: '#00BBF9',
    glow: 'rgba(255,190,120,0.3)',
    gamesFrom: 'reflection',
    learn: {
      title: 'You can watch your own mind working',
      body: 'Here’s the strange bit: you can notice yourself thinking. The part that notices isn’t the same as the thought. Once you’ve spotted that once, you can’t really un-spot it — and it’s the most useful thing in this whole building.',
    },
  },
];

/**
 * The Pause Room, kept exactly as it was and deliberately outside the virtue
 * list. It is not a virtue to be ticked, it earns no points, and it is
 * available from everywhere at all times. A child having a hard moment needs
 * somewhere to go that isn't asking them for anything.
 */
export const PAUSE_ROOM = {
  id: 'pause',
  name: 'Pause Room',
  tagline: 'Nothing to catch in here. We’re just going slow.',
  emoji: '🌙',
  ground: ['#0B2C25', '#050F0D'] as [string, string],
  accent: '#3FB37F',
  glow: 'rgba(255,214,150,0.26)',
  gamesFrom: 'pause' as GymRoomId,
};

export function getVirtueRoom(id: string): VirtueRoom | undefined {
  return VIRTUE_ROOMS.find((r) => r.id === id);
}
