import { useEffect, useMemo, useState } from 'react';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS, todayKey } from '../../../kids/data';
import { useDiaryFilledToday } from './diaryToday';
import { suggestRoom, todayPath, type TodayPath } from './todayPath';

export type DayPath = TodayPath & { room: string; roomTitle: string };

export function useTodayPath(): DayPath {
  const memories = useKidStore((s) => s.memories);
  const reflections = useKidStore((s) => s.savedReflections);
  const scenariosDone = useKidStore((s) => s.scenariosDone);
  const gameStats = useKidStore((s) => s.gameStats);
  const diaryDone = useDiaryFilledToday();
  /* A minute's tick, so "how do you feel now?" comes back on its own while the
     page is open, without waiting for a reload. */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    const room = suggestRoom(gameStats?.byRoom ?? {}, todayKey(new Date(now)));
    return {
      ...todayPath({
        now, memories: memories ?? [], reflections: reflections ?? [], scenariosDone: scenariosDone ?? {},
        gameDays: gameStats?.days ?? [], diaryDone,
      }),
      room,
      roomTitle: BEHAVIOURS.find((b) => b.id === room)?.title ?? 'Good Choices',
    };
  }, [now, memories, reflections, scenariosDone, gameStats, diaryDone]);
}
