/**
 * useWeeklyAssignment
 *
 * Determines which Wisdom Untethered question is assigned for the current week
 * based on how many weeks have passed since the user's account was created.
 *
 * - Week 0 (first 7 days) → question1
 * - Week 1 → question2
 * - Week 2 → question3
 * - Week N → question(N % totalQuestions)
 *
 * Designed to scale to 200+ questions — totalQuestions is derived from
 * QUESTION_IDS.length, so adding new questions automatically extends the cycle.
 */

import { useMemo } from 'react';
import { QUESTION_IDS } from '../features/practices/practiceLibrary';

export interface WeeklyAssignment {
  /** The question ID assigned for this week, e.g. "question3" */
  questionId: string;
  /** Human-readable question number, e.g. 3 */
  questionNumber: number;
  /** How many weeks into the journey the user is (0-indexed) */
  weekNumber: number;
  /** How many days remain in this week's assignment (1–7) */
  daysRemaining: number;
  /** Label for display, e.g. "Week 3 of your journey" */
  weekLabel: string;
  /** True if this is the very first week */
  isFirstWeek: boolean;
}

/**
 * @param accountCreatedAt - JS Date or ISO string of when the account was created.
 *   If null/undefined, defaults to treating today as Day 1 (Week 0).
 */
export function useWeeklyAssignment(
  accountCreatedAt: Date | string | null | undefined
): WeeklyAssignment {
  return useMemo(() => {
    const totalQuestions = QUESTION_IDS.length;

    // Determine the start date
    let startDate: Date;
    if (accountCreatedAt) {
      startDate = typeof accountCreatedAt === 'string'
        ? new Date(accountCreatedAt)
        : accountCreatedAt;
    } else {
      // Fallback: treat today as day 1 of Week 0
      startDate = new Date();
    }

    // Normalize to start of day (midnight UTC) to avoid timezone drift
    const startMs = Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const today = new Date();
    const todayMs = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const daysSinceStart = Math.max(0, Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24)));
    const weekNumber = Math.floor(daysSinceStart / 7);
    const dayOfWeek = daysSinceStart % 7; // 0 = first day of this week's assignment
    const daysRemaining = 7 - dayOfWeek;

    // Cycle through available questions
    const questionIndex = weekNumber % totalQuestions;
    const questionId = QUESTION_IDS[questionIndex];
    const questionNumber = questionIndex + 1;

    const weekLabel = weekNumber === 0
      ? 'Your first week'
      : `Week ${weekNumber + 1} of your journey`;

    return {
      questionId,
      questionNumber,
      weekNumber,
      daysRemaining,
      weekLabel,
      isFirstWeek: weekNumber === 0,
    };
  }, [accountCreatedAt]);
}
