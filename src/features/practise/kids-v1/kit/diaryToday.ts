import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';

/* A day counts as written once a good choice is ticked for it or any words are
   kept against it — either is the child telling the diary how today went. */
export function useDiaryFilledToday(): boolean {
  return useKidStore((s) => {
    const today = todayKey();
    if (Object.values(s.completions[today] ?? {}).some(Boolean)) return true;
    const month = s.monthReviews[today.slice(0, 7)] ?? {};
    return Object.entries(month).some(([k, v]) => k.startsWith(`${today}:`) && !!v?.trim());
  });
}

export const DIARY_NUDGES = [
  'Your diary hasn’t heard about today yet. Want to tell it?',
  'How did today go? Your diary is keeping a page just for you.',
  'One small thing from today is enough. Your diary would love it.',
  'Today’s page is still empty. It only takes a minute.',
  'What was the best bit of today? Pop it in your diary.',
  'Did you do something kind today? Your diary wants to know.',
];
