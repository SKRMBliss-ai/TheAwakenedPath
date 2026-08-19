/**
 * Display metadata for each Wisdom Untethered question.
 *
 * Extracted from the former TodayPath component, which was dead code - nothing
 * rendered it, but this data was still imported from it by DashboardGrid and
 * VoiceGuidance. It lives on its own now so the data has no dependency on a UI
 * module that no longer exists.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Question display names
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTION_META: Record<string, {
  shortTitle: string;
  journalPrompt: string;
  dailyIntent: string;
}> = {
  question1: {
    shortTitle: 'Q1 · Using the Mind as a Tool',
    journalPrompt: 'When did the spiral start today, and what shifted when you redirected?',
    dailyIntent: 'I will notice my mind\'s chatter and consciously redirect it to a steady affirmation today.',
  },
  question2: {
    shortTitle: 'Q2 · The Doubting Narrator',
    journalPrompt: 'What voice did you notice today? What did naming it feel like?',
    dailyIntent: 'I will witness the doubting voice without becoming it, naming it silently and letting it pass.',
  },
  question3: {
    shortTitle: 'Q3 · Personal to Impersonal',
    journalPrompt: 'Which of the three pauses landed most? What shifted in that second?',
    dailyIntent: 'I will practice the three-second pause before reacting, honoring the space between thought and action.',
  },
  question4: {
    shortTitle: 'Q4 · Finding the Silent Space',
    journalPrompt: 'What did the space behind the noise feel like today?',
    dailyIntent: 'I will anchor my awareness in the silence behind the noise at least three times today.',
  },
  question5: {
    shortTitle: 'Q5 · Witness Consciousness',
    journalPrompt: 'What did sitting comfortably within the noise feel like today?',
    dailyIntent: 'I will remain as the observer today, allowing life\'s flow to happen without losing my seat of awareness.',
  },
  question6: {
    shortTitle: 'Q6 · Letting Go of the Past',
    journalPrompt: 'What memory arose today, and did you release its energy through the breath?',
    dailyIntent: 'I will breathe through past memories today, refusing to feed the narratives of who I used to be.',
  },
  question7: {
    shortTitle: 'Q7 · Handling the Back-and-Forth',
    journalPrompt: 'How quickly did you notice the pull-back today? Celebrate that moment.',
    dailyIntent: 'I will celebrate every moment I notice the mind pulling me back, recognizing it as a return to awareness.',
  },
};
