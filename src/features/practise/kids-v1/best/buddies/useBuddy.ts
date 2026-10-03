import { useKidStore } from '../../../../kids/store';
import {
  CREATURE_BY_ID, WORLD_BY_ID, baseOf, eggsReady, levelOf, nextHatch, rankOf,
  type Creature, type Hatch, type LevelInfo, type World, type WorldId,
} from '../../../../kids/buddies';

export interface BuddyState {
  stars: number;
  level: LevelInfo;
  world: World | null;
  /** What has hatched in the buddy's world. */
  owned: string[];
  buddyId: string | null;
  buddy: Creature | null;
  /** Level eggs waiting to be opened. */
  ready: number;
  /** What the next egg holds, if a world has been started. */
  next: Hatch | null;
  rank: string;
  /** No buddy chosen yet: the first thing to do is pick a world and a starter. */
  starting: boolean;
}

/** Everything the screens need to know about the child's buddies, worked out from the store. */
export function useBuddy(): BuddyState {
  const stars = useKidStore((s) => s.points);
  const worldId = useKidStore((s) => s.buddyWorld);
  const buddies = useKidStore((s) => s.buddies);
  const buddyId = useKidStore((s) => s.buddyId);
  const opened = useKidStore((s) => s.buddyEggsOpened);
  return buddyStateOf({ stars, worldId, buddies, buddyId, opened });
}

export function buddyStateOf({ stars, worldId, buddies, buddyId, opened }: {
  stars: number; worldId: WorldId | null; buddies: Record<string, string[]>; buddyId: string | null; opened: number;
}): BuddyState {
  const level = levelOf(stars);
  const world = worldId ? WORLD_BY_ID[worldId] : null;
  const owned = worldId ? buddies[worldId] ?? [] : [];
  const starting = !world || !owned.length;
  return {
    stars, level, world, owned, buddyId,
    buddy: buddyId ? CREATURE_BY_ID[baseOf(buddyId)] ?? null : null,
    ready: eggsReady(stars, opened),
    next: world && owned.length ? nextHatch(world.id, owned) : null,
    rank: rankOf(worldId ?? 'dino', level.level),
    starting,
  };
}
