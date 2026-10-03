import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BEHAVIOURS, BADGES, REWARDS, todayKey } from './data';
import { EGG_STICKER_IDS, earnedStickers, type StickerStats } from './stickers';
import {
  EGG_FRIEND_BY_ID, MEMORY_LIMIT, SEEDS_PER_DAY, eggPrizeFor, plantKindFor,
  type EggPrize, type Memory, type NewMemory, type PlacedItem, type Plant,
} from './delight';
import { CREATURE_BY_ID, WORLD_BY_ID, baseOf, eggsReady, nextHatch, shinyOf, type WorldId } from './buddies';

/**
 * Kid progress lives on THIS DEVICE only (localStorage), never on a server —
 * the safest default for a children's app: no personal data collected, nothing
 * to leak. A parent/teacher can later opt into cloud sync; the prototype does
 * not need it, and not collecting children's data by default is the right call.
 */

type DayCompletions = Record<string, boolean>; // behaviourId -> done
type Reflection = { proud?: string; feeling?: string };

export type ReflectionTag = 'brave' | 'calm' | 'kind' | 'belonging' | 'try_again' | 'other';

export interface SavedReflection {
  id: string;
  sourceSessionId?: string;
  createdAt: string;
  feeling?: string;
  body?: string;
  thought?: string;
  whatHappened?: string;
  originalStory?: string;
  anotherWay?: string;
  /** Short label rendered on the brick — 60 chars max. */
  pathLabel: string;
  tag: ReflectionTag;
  favourite: boolean;
  timesPlayed: number;
  /** Affirmation chosen by the child during playback. */
  affirmation?: string;
}

/** What the Games Room has counted, so the sticker book can be worked out from it. */
export interface GameStats {
  practised: number;
  /** Choices practised per room id (kind, truth, choices, include, body, help). */
  byRoom: Record<string, number>;
  /** Runs of five finished. */
  runs: number;
  /** The days the Games Room was played on. */
  days: string[];
}

const NO_GAME_STATS: GameStats = { practised: 0, byRoom: {}, runs: 0, days: [] };

/**
 * The numbers the sticker book is worked out from. Choices practised before
 * the counters existed are still in `scenariosDone`, so a child who has been
 * playing for weeks does not start the book from nothing.
 */
export function stickerStatsOf(s: {
  points: number; gameStats: GameStats; scenariosDone: Record<string, string[]>; eggStickers: string[];
}): StickerStats {
  const earlier = Object.values(s.scenariosDone)
    .reduce((n, day) => n + day.filter((id) => !id.startsWith('home:')).length, 0);
  return {
    points: s.points,
    practised: Math.max(s.gameStats.practised, earlier),
    byRoom: s.gameStats.byRoom,
    runs: s.gameStats.runs,
    days: s.gameStats.days.length,
    eggStickers: s.eggStickers,
  };
}

const DAYS_KEPT = 120;

/**
 * What any activity changes, wherever it happened: Chirpy remembers it, the
 * day counts as one the child showed up for (which is what hatches the egg),
 * and — if it was the kind of thing that plants one — a seed goes into the
 * garden, up to the day's pouch. Doing the same thing again on the same day
 * updates the memory rather than adding another, so five games in a row do
 * not push the feeling a child shared this morning out of what he remembers.
 */
function activityPatch(s: KidState, memory: NewMemory, plant = true): Pick<KidState, 'memories' | 'activeDays' | 'plants'> {
  const today = todayKey();
  const fresh: Memory = { ...memory, day: today, at: Date.now() };
  const [newest, ...older] = s.memories;
  const same = newest && newest.day === today && newest.kind === memory.kind && newest.detail === memory.detail;
  const memories = (same ? [fresh, ...older] : [fresh, ...s.memories]).slice(0, MEMORY_LIMIT);
  const activeDays = s.activeDays.includes(today) ? s.activeDays : [...s.activeDays, today].slice(-DAYS_KEPT);
  const kind = plant ? plantKindFor(memory) : null;
  const plantedToday = s.plants.filter((p) => p.day === today).length;
  const plants = kind && plantedToday < SEEDS_PER_DAY
    ? [...s.plants, { id: `${today}-${s.plants.length}-${Math.random().toString(36).slice(2, 7)}`, kind, day: today }]
    : s.plants;
  return { memories, activeDays, plants };
}

export type BuddyHatch = { id: string; shiny: boolean } | { bonus: number };

/** Stars a finished feelings journey earns, and how many journeys a day earn them. */
export const JOURNEY_STARS = 20;
export const JOURNEYS_REWARDED_PER_DAY = 3;
/** What an egg holds once a world (and every shiny one in it) has hatched. */
const EGG_BONUS_STARS = 25;
/** Journeys already rewarded this visit, so saving one again after a change earns nothing twice. */
const rewardedJourneys = new Set<string>();

interface KidState {
  onboarded: boolean;
  name: string;
  avatarId: string;
  points: number;
  pointsByBehaviour: Record<string, number>;
  completions: Record<string, DayCompletions>;   // dateKey -> {behaviourId: true}
  missionsDone: Record<string, string[]>;         // dateKey -> [mission text]
  reflections: Record<string, Reflection>;
  /** Saved reflections from Story Lab journeys — one per completed journey. */
  savedReflections: SavedReflection[];
  monthReviews: Record<string, Record<string, string>>; // "YYYY-MM" -> {q1..q4}
  scenariosDone: Record<string, string[]>;               // dateKey -> [scenarioId]
  streak: number;
  badges: string[];
  rewards: string[];
  gameStats: GameStats;
  /** Sticker ids, in the order they were earned. */
  stickers: string[];
  /** Earned but not yet celebrated on screen — a child who leaves mid-way sees them next time. */
  stickerQueue: string[];

  /* See delight.ts for what these are for and the rules they follow. */
  /** What Chirpy remembers, newest first. */
  memories: Memory[];
  /** Days the gym was opened, and days something was actually done in it. */
  visitDays: string[];
  activeDays: string[];
  plants: Plant[];
  /** The last day the garden was looked at, so tomorrow can say what grew since. */
  gardenSeen: string;
  wateredOn: string;
  eggHatchedOn: string;
  eggsHatched: number;
  /** What came out of the most recent egg. */
  eggPrize: EggPrize | null;
  friends: string[];
  jokesTold: number[];
  eggStickers: string[];
  corner: PlacedItem[];
  cornerWall: string;
  /** Week (its Monday) -> the chapters read that week, 0-6. */
  chaptersRead: Record<string, number[]>;
  storiesFinished: string[];
  /** Week -> the story read that week. Set at the first chapter, so a story changed mid-week can't swap it out. */
  storyByWeek: Record<string, string>;

  /* See buddies.ts: the creatures a child collects by levelling up. */
  /** The world eggs hatch in: their buddy's world. Null until they choose one. */
  buddyWorld: WorldId | null;
  /** World -> what has hatched there, in order: `rex`, or `rex*` for a shiny one. */
  buddies: Record<string, string[]>;
  /** The one who stands on the home page. */
  buddyId: string | null;
  /** World -> the buddy last chosen there, so going back to a world brings its buddy back too. */
  buddyPicks: Record<string, string>;
  /** Level eggs opened so far, in any world. Eggs waiting = levels gained minus this. */
  buddyEggsOpened: number;
  /** Day -> feelings journeys that have earned stars that day. */
  journeyStars: Record<string, number>;

  completeOnboarding: (name: string, avatarId: string) => void;
  setName: (name: string) => void;
  toggleBehaviour: (behaviourId: string) => void;
  setBehaviourOn: (dateKey: string, behaviourId: string, done: boolean) => void;
  awardPoints: (points: number, behaviourId?: string) => void;
  completeScenario: (scenarioId: string) => void;
  completeMission: (text: string, points: number) => void;
  setReflection: (r: Reflection) => void;
  setMonthReview: (month: string, key: string, value: string) => void;
  addSavedReflection: (r: SavedReflection) => void;
  toggleReflectionFavourite: (id: string) => void;
  markReflectionPlayed: (id: string) => void;
  setReflectionAffirmation: (id: string, affirmation: string) => void;
  /** A good choice practised in a Games Room theme. Returns the stickers it earned. */
  recordPractice: (roomId: string) => string[];
  /** A run of five finished. Returns the stickers it earned. */
  recordRun: () => string[];
  /** Picks up stickers earned some other way (Mind Stars won elsewhere, say). */
  syncStickers: () => string[];
  /** These have been celebrated; take them off the queue. */
  clearStickerQueue: (ids: string[]) => void;
  noteVisit: () => void;
  /** Something done anywhere in the gym. Chirpy remembers it, and it may plant a seed. */
  noteActivity: (memory: NewMemory) => void;
  seeGarden: () => void;
  waterGarden: () => void;
  /** Opens today's egg if it is ready. Returns what was inside, or null if it is not ready yet. */
  hatchEgg: () => EggPrize | null;
  /** Puts a thing in the corner and returns the id it was given there. */
  placeInCorner: (item: Omit<PlacedItem, 'uid'>) => string;
  updateInCorner: (uid: string, patch: Partial<PlacedItem>) => void;
  removeFromCorner: (uid: string) => void;
  setCornerWall: (id: string) => void;
  /** A chapter read to its last page. Reports whether it was new, and whether it finished the story. */
  readChapter: (week: string, chapter: number, storyId: string, title: string) => { firstTime: boolean; finished: boolean };
  /** Go to a world. Its first buddy is picked with pickStarter. */
  chooseWorld: (world: WorldId) => void;
  /** The first buddy in a world, chosen from its three starters. */
  pickStarter: (world: WorldId, id: string) => void;
  /** Opens one waiting level egg in the buddy's world: a new creature, or stars once every one has hatched. */
  hatchBuddyEgg: () => BuddyHatch | null;
  setBuddy: (id: string) => void;
  /** Stars for finishing a feelings journey, the first few times a day. A
      journey saved again after an edit (same session) earns nothing more. */
  rewardJourney: (sessionId?: string) => number;
  reset: () => void;
}

function computeStreak(completions: Record<string, DayCompletions>): number {
  const has = (d: Date) => {
    const c = completions[todayKey(d)];
    return !!c && Object.values(c).some(Boolean);
  };
  const cur = new Date();
  if (!has(cur)) cur.setDate(cur.getDate() - 1); // today not done yet doesn't break it
  let streak = 0;
  while (has(cur)) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}

function recomputeBadges(s: Pick<KidState, 'completions' | 'streak' | 'badges'>): string[] {
  const earned = new Set(s.badges);
  const days = Object.values(s.completions);
  const countBehaviour = (id: string) => days.filter((d) => d[id]).length;
  const anyDone = days.some((d) => Object.values(d).some(Boolean));
  const check = (id: string, cond: boolean) => { if (cond) earned.add(id); };

  check('firstStep', anyDone);
  check('kindHeart', countBehaviour('kind') >= 3);
  check('truthTeller', countBehaviour('truth') >= 3);
  check('helper', countBehaviour('help') >= 5);
  check('streak3', s.streak >= 3);
  check('streak7', s.streak >= 7);
  check('allSeven', days.some((d) => BEHAVIOURS.every((b) => d[b.id])));
  void BADGES;
  return Array.from(earned);
}

function recomputeRewards(points: number, current: string[]): string[] {
  const set = new Set(current);
  for (const r of REWARDS) if (points >= r.at) set.add(r.id);
  return Array.from(set);
}

export const useKidStore = create<KidState>()(
  persist(
    (set) => {
      /** Applies a change to the counters, then hands back whatever it newly earned. */
      const earn = (change: (s: KidState) => Partial<KidState>): string[] => {
        const fresh: string[] = [];
        set((s) => {
          const patch = change(s);
          const ids = earnedStickers(stickerStatsOf({ ...s, ...patch })).filter((id) => !s.stickers.includes(id));
          fresh.push(...ids);
          if (!ids.length) return patch;
          return { ...patch, stickers: [...s.stickers, ...ids], stickerQueue: [...s.stickerQueue, ...ids] };
        });
        return fresh;
      };

      return {
      onboarded: false,
      name: '',
      avatarId: 'sunny',
      points: 0,
      pointsByBehaviour: {},
      completions: {},
      missionsDone: {},
      reflections: {},
      savedReflections: [],
      monthReviews: {},
      scenariosDone: {},
      streak: 0,
      badges: [],
      rewards: [],
      gameStats: NO_GAME_STATS,
      stickers: [],
      stickerQueue: [],
      memories: [],
      visitDays: [],
      activeDays: [],
      plants: [],
      gardenSeen: '',
      wateredOn: '',
      eggHatchedOn: '',
      eggsHatched: 0,
      eggPrize: null,
      friends: [],
      jokesTold: [],
      eggStickers: [],
      corner: [],
      cornerWall: 'treehouse',
      chaptersRead: {},
      storiesFinished: [],
      storyByWeek: {},
      buddyWorld: null,
      buddies: {},
      buddyId: null,
      buddyPicks: {},
      buddyEggsOpened: 0,
      journeyStars: {},

      completeOnboarding: (name, avatarId) => set({ onboarded: true, name: name.trim() || 'Explorer', avatarId }),
      setName: (name) => { if (name.trim()) set({ name: name.trim() }); },

      toggleBehaviour: (behaviourId) => set((s) => {
        const key = todayKey();
        const beh = BEHAVIOURS.find((b) => b.id === behaviourId);
        if (!beh) return s;
        const day = { ...(s.completions[key] ?? {}) };
        const wasDone = !!day[behaviourId];
        const delta = wasDone ? -beh.points : beh.points;
        if (wasDone) delete day[behaviourId]; else day[behaviourId] = true;

        const completions = { ...s.completions, [key]: day };
        const points = Math.max(0, s.points + delta);
        const pointsByBehaviour = {
          ...s.pointsByBehaviour,
          [behaviourId]: Math.max(0, (s.pointsByBehaviour[behaviourId] ?? 0) + delta),
        };
        const streak = computeStreak(completions);
        return {
          completions, points, pointsByBehaviour, streak,
          badges: recomputeBadges({ completions, streak, badges: s.badges }),
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      setBehaviourOn: (dateKey, behaviourId, done) => set((s) => {
        const beh = BEHAVIOURS.find((b) => b.id === behaviourId);
        if (!beh) return s;
        const day = { ...(s.completions[dateKey] ?? {}) };
        const wasDone = !!day[behaviourId];
        if (wasDone === done) return s;
        if (done) day[behaviourId] = true; else delete day[behaviourId];
        const delta = done ? beh.points : -beh.points;
        const completions = { ...s.completions, [dateKey]: day };
        const points = Math.max(0, s.points + delta);
        const pointsByBehaviour = {
          ...s.pointsByBehaviour,
          [behaviourId]: Math.max(0, (s.pointsByBehaviour[behaviourId] ?? 0) + delta),
        };
        const streak = computeStreak(completions);
        return {
          completions, points, pointsByBehaviour, streak,
          badges: recomputeBadges({ completions, streak, badges: s.badges }),
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      setMonthReview: (month, key, value) => set((s) => ({
        monthReviews: { ...s.monthReviews, [month]: { ...s.monthReviews[month], [key]: value } },
      })),

      completeScenario: (scenarioId) => set((s) => {
        const key = todayKey();
        const done = s.scenariosDone[key] ?? [];
        if (done.includes(scenarioId)) return s;
        return { scenariosDone: { ...s.scenariosDone, [key]: [...done, scenarioId] } };
      }),

      awardPoints: (pts, behaviourId) => set((s) => {
        const points = s.points + pts;
        return {
          points,
          pointsByBehaviour: behaviourId
            ? { ...s.pointsByBehaviour, [behaviourId]: (s.pointsByBehaviour[behaviourId] ?? 0) + pts }
            : s.pointsByBehaviour,
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      completeMission: (text, missionPoints) => set((s) => {
        const key = todayKey();
        const done = s.missionsDone[key] ?? [];
        if (done.includes(text)) return s;
        const points = s.points + missionPoints;
        return {
          missionsDone: { ...s.missionsDone, [key]: [...done, text] },
          points,
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      setReflection: (r) => set((s) => ({ reflections: { ...s.reflections, [todayKey()]: { ...s.reflections[todayKey()], ...r } } })),

      addSavedReflection: (r) => set((s) => ({ savedReflections: [...s.savedReflections, r] })),

      toggleReflectionFavourite: (id) => set((s) => ({
        savedReflections: s.savedReflections.map((r) => r.id === id ? { ...r, favourite: !r.favourite } : r),
      })),

      markReflectionPlayed: (id) => set((s) => ({
        savedReflections: s.savedReflections.map((r) => r.id === id ? { ...r, timesPlayed: r.timesPlayed + 1 } : r),
      })),

      setReflectionAffirmation: (id, affirmation) => set((s) => ({
        savedReflections: s.savedReflections.map((r) => r.id === id ? { ...r, affirmation } : r),
      })),

      recordPractice: (roomId) => earn((s) => {
        const today = todayKey();
        return {
          ...activityPatch(s, { kind: 'game', detail: roomId }),
          gameStats: {
            ...s.gameStats,
            practised: s.gameStats.practised + 1,
            byRoom: { ...s.gameStats.byRoom, [roomId]: (s.gameStats.byRoom[roomId] ?? 0) + 1 },
            days: s.gameStats.days.includes(today) ? s.gameStats.days : [...s.gameStats.days, today],
          },
        };
      }),

      recordRun: () => earn((s) => ({ gameStats: { ...s.gameStats, runs: s.gameStats.runs + 1 } })),

      syncStickers: () => earn(() => ({})),

      clearStickerQueue: (ids) => set((s) => ({ stickerQueue: s.stickerQueue.filter((id) => !ids.includes(id)) })),

      noteVisit: () => set((s) => {
        const today = todayKey();
        return s.visitDays.includes(today) ? s : { visitDays: [...s.visitDays, today].slice(-DAYS_KEPT) };
      }),

      noteActivity: (memory) => set((s) => activityPatch(s, memory)),

      seeGarden: () => set((s) => (s.gardenSeen === todayKey() ? s : { gardenSeen: todayKey() })),

      waterGarden: () => set({ wateredOn: todayKey() }),

      hatchEgg: () => {
        let prize: EggPrize | null = null;
        set((s) => {
          const today = todayKey();
          if (s.eggHatchedOn === today || !s.activeDays.includes(today)) return s;
          const inside = eggPrizeFor({
            day: today, hatched: s.eggsHatched, friends: s.friends, jokesTold: s.jokesTold,
            eggStickers: s.eggStickers, allEggStickers: EGG_STICKER_IDS,
          });
          prize = inside;
          const friend = inside.type === 'friend' ? EGG_FRIEND_BY_ID[inside.id] : undefined;
          return {
            eggHatchedOn: today,
            eggsHatched: s.eggsHatched + 1,
            eggPrize: inside,
            friends: inside.type === 'friend' ? [...s.friends, inside.id] : s.friends,
            jokesTold: inside.type === 'joke' && !s.jokesTold.includes(inside.index) ? [...s.jokesTold, inside.index] : s.jokesTold,
            /* The egg is the celebration, so a sticker found in one goes
               straight into the book rather than queueing for another pop. */
            eggStickers: inside.type === 'sticker' ? [...s.eggStickers, inside.id] : s.eggStickers,
            stickers: inside.type === 'sticker' && !s.stickers.includes(inside.id) ? [...s.stickers, inside.id] : s.stickers,
            memories: [{ kind: 'egg' as const, day: today, at: Date.now(), detail: friend?.name }, ...s.memories].slice(0, MEMORY_LIMIT),
          };
        });
        return prize;
      },

      placeInCorner: (item) => {
        const uid = `${item.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
        set((s) => ({ corner: [...s.corner, { ...item, uid }] }));
        return uid;
      },
      updateInCorner: (uid, patch) => set((s) => ({ corner: s.corner.map((c) => (c.uid === uid ? { ...c, ...patch } : c)) })),
      removeFromCorner: (uid) => set((s) => ({ corner: s.corner.filter((c) => c.uid !== uid) })),
      setCornerWall: (id) => set({ cornerWall: id }),

      readChapter: (week, chapter, storyId, title) => {
        let result = { firstTime: false, finished: false };
        set((s) => {
          const read = s.chaptersRead[week] ?? [];
          const firstTime = !read.includes(chapter);
          const nowRead = firstTime ? [...read, chapter].sort((a, b) => a - b) : read;
          const finished = firstTime && nowRead.length >= 7 && !s.storiesFinished.includes(storyId);
          result = { firstTime, finished };
          /* Reading it again still counts as reading today, but only the first
             read plants a seed and earns its stars. */
          const activity = activityPatch(s, { kind: 'adventure', detail: title }, firstTime);
          if (!firstTime) return activity;
          const points = s.points + 10;
          return {
            ...activity,
            chaptersRead: { ...s.chaptersRead, [week]: nowRead },
            storyByWeek: s.storyByWeek[week] ? s.storyByWeek : { ...s.storyByWeek, [week]: storyId },
            storiesFinished: finished ? [...s.storiesFinished, storyId] : s.storiesFinished,
            points,
            pointsByBehaviour: { ...s.pointsByBehaviour, mindheart: (s.pointsByBehaviour.mindheart ?? 0) + 10 },
            rewards: recomputeRewards(points, s.rewards),
          };
        });
        return result;
      },

      chooseWorld: (world) => set((s) => {
        const owned = s.buddies[world] ?? [];
        const pick = s.buddyPicks[world];
        return { buddyWorld: world, buddyId: pick && owned.includes(pick) ? pick : owned[0] ?? s.buddyId };
      }),

      pickStarter: (world, id) => set((s) => {
        if ((s.buddies[world] ?? []).length || !WORLD_BY_ID[world].starters.includes(id)) return s;
        return { buddyWorld: world, buddies: { ...s.buddies, [world]: [id] }, buddyId: id, buddyPicks: { ...s.buddyPicks, [world]: id } };
      }),

      hatchBuddyEgg: () => {
        let out: BuddyHatch | null = null;
        set((s) => {
          const world = s.buddyWorld;
          if (!world || !(s.buddies[world] ?? []).length || eggsReady(s.points, s.buddyEggsOpened) <= 0) return s;
          const owned = s.buddies[world];
          const next = nextHatch(world, owned);
          if (!next) {
            out = { bonus: EGG_BONUS_STARS };
            const points = s.points + EGG_BONUS_STARS;
            return { buddyEggsOpened: s.buddyEggsOpened + 1, points, rewards: recomputeRewards(points, s.rewards) };
          }
          out = next;
          return {
            buddyEggsOpened: s.buddyEggsOpened + 1,
            buddies: { ...s.buddies, [world]: [...owned, next.shiny ? shinyOf(next.id) : next.id] },
          };
        });
        return out;
      },

      setBuddy: (id) => set((s) => {
        const creature = CREATURE_BY_ID[baseOf(id)];
        if (!creature || !(s.buddies[creature.world] ?? []).includes(id)) return s;
        return { buddyId: id, buddyWorld: creature.world, buddyPicks: { ...s.buddyPicks, [creature.world]: id } };
      }),

      rewardJourney: (sessionId) => {
        if (sessionId && rewardedJourneys.has(sessionId)) return 0;
        if (sessionId) rewardedJourneys.add(sessionId);
        let given = 0;
        set((s) => {
          const today = todayKey();
          const done = s.journeyStars[today] ?? 0;
          if (done >= JOURNEYS_REWARDED_PER_DAY) return s;
          given = JOURNEY_STARS;
          const points = s.points + JOURNEY_STARS;
          return {
            points,
            pointsByBehaviour: { ...s.pointsByBehaviour, mindheart: (s.pointsByBehaviour.mindheart ?? 0) + JOURNEY_STARS },
            rewards: recomputeRewards(points, s.rewards),
            journeyStars: { ...s.journeyStars, [today]: done + 1 },
          };
        });
        return given;
      },

      reset: () => set({
        onboarded: false, name: '', avatarId: 'sunny', points: 0, pointsByBehaviour: {},
        completions: {}, missionsDone: {}, reflections: {}, savedReflections: [], monthReviews: {}, scenariosDone: {},
        streak: 0, badges: [], rewards: [], gameStats: NO_GAME_STATS, stickers: [], stickerQueue: [],
        memories: [], visitDays: [], activeDays: [], plants: [], gardenSeen: '', wateredOn: '',
        eggHatchedOn: '', eggsHatched: 0, eggPrize: null, friends: [], jokesTold: [], eggStickers: [],
        corner: [], cornerWall: 'treehouse', chaptersRead: {}, storiesFinished: [], storyByWeek: {},
        buddyWorld: null, buddies: {}, buddyId: null, buddyPicks: {}, buddyEggsOpened: 0, journeyStars: {},
      }),
      };
    },
    { name: 'my-best-every-day' },
  ),
);
