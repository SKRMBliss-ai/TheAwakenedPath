// practiceLibrary.ts
// One practice definition per Wisdom Untethered question.
// Each practice is derived directly from Singer's teaching for that question.
// Used by DailyPracticeCard.tsx and useDailyPractice.ts

export interface PracticeStep {
  instruction: string;   // what the user actually does
  duration?: number;     // seconds — shown as a countdown if present
  isRepeating?: boolean; // for practices that trigger multiple times (Q3)
}

export interface QuestionPractice {
  questionId: string;
  name: string;                  // short name shown in checkbox
  tagline: string;               // one italic line under the name
  singerSource: string;          // the exact Singer teaching this comes from
  howItWorks: string;            // plain explanation for the user
  steps: PracticeStep[];
  completionCriteria: string;    // what counts as "done" for the checkbox
  durationLabel: string;         // shown in the card header
  color: string;                 // accent colour for this question
  icon: 'brain' | 'radio' | 'planet' | 'clarity'; // maps to an icon in the card
  triggerCount?: number;         // for Q3 — how many times they need to do the pause
}

// ─────────────────────────────────────────────────────────────────────────────
// The practice library — one entry per question
// ─────────────────────────────────────────────────────────────────────────────

export const PRACTICE_LIBRARY: Record<string, QuestionPractice> = {

  // ── Q1: How can I use the mind as a tool to escape negative thoughts? ──────
  question1: {
    questionId: 'question1',
    name: '"I Can Handle This" Redirect',
    tagline: 'Use the higher mind to lift what the lower mind is dragging down.',
    singerSource:
      'Singer: "Use an affirmation, a mantra, or just tell yourself — I can handle this. ' +
      'What you are really doing is redirecting the mind\'s energy."',
    howItWorks:
      'Once today, when you notice a negative thought or anxious spiral starting — ' +
      'stop engaging with it. Say "I can handle this" slowly, three times. ' +
      'Feel the energy shift from pulling you down to something steadier. ' +
      'That\'s the practice. One real moment of redirection counts as done.',
    steps: [
      {
        instruction:
          'Notice the spiral starting. A worry, a self-criticism, a looping thought.',
      },
      {
        instruction:
          'Stop following it. Take one breath.',
        duration: 6,
      },
      {
        instruction:
          'Say slowly — out loud or silently — "I can handle this." Three times.',
        duration: 12,
      },
      {
        instruction:
          'Notice what shifts. The thought may still be there. But you are no longer inside it.',
        duration: 8,
      },
    ],
    completionCriteria:
      'Done at least once today when a real negative thought or spiral arose.',
    durationLabel: '~30 seconds when triggered',
    color: '#B8973A',
    icon: 'brain',
  },

  // ── Q2: How do I handle the narration that creates doubt, guilt, or fear? ──
  question2: {
    questionId: 'question2',
    name: 'The Radio Check',
    tagline: 'You are the listener in the room. You are not the radio.',
    singerSource:
      'Singer: "Don\'t try to silence the mind. Step back and watch it. ' +
      'See its patterns. Notice how it pulls you in. ' +
      'When you truly see what\'s happening, you stop taking the mind so seriously."',
    howItWorks:
      'Sit quietly for 2 minutes. Do not try to stop or fix any thought. ' +
      'Just notice what the mind is saying — and gently name it. ' +
      '"There\'s the worry voice." "There\'s the guilt loop." ' +
      'See the thought as an object — the radio playing in the corner — ' +
      'not as the truth about reality. You are the one who can hear it.',
    steps: [
      {
        instruction:
          'Sit quietly. Close your eyes if you can. Take one slow breath.',
        duration: 8,
      },
      {
        instruction:
          'Notice what the mind is currently saying. Don\'t answer it. Just hear it.',
        duration: 30,
      },
      {
        instruction:
          'Gently name what you hear. "There\'s the worry voice." "There\'s the planning loop." ' +
          'Just a quiet label — not a judgement.',
        duration: 25,
      },
      {
        instruction:
          'Now ask: who is noticing this? ' +
          'That one — the noticer — has been perfectly still this entire time.',
        duration: 20,
      },
      {
        instruction:
          'Take one more slow breath. Open your eyes. You are not the radio.',
        duration: 8,
      },
    ],
    completionCriteria:
      'Completed the 2-minute sitting practice at least once today.',
    durationLabel: '2 minutes',
    color: '#9575CD',
    icon: 'radio',
  },

  // ── Q3: How can I shift from personal to impersonal thinking? ──────────────
  question3: {
    questionId: 'question3',
    name: 'The One-Second Cosmic Pause',
    tagline: 'Three moments today. One second each. A complete shift in frame.',
    singerSource:
      'Singer: "Every moment is an opportunity to shift your perspective. ' +
      'When you are sitting in your car, before you start the engine — stop for a second. ' +
      'Notice that you are on a little planet spinning in the middle of nowhere. ' +
      'That\'s reality. Then start the car."',
    howItWorks:
      'Three times today — before starting the car, before walking through a door, ' +
      'before picking up your phone — pause for one second and genuinely notice: ' +
      'you are on a small planet, spinning in vast space, right now. ' +
      'Not as a concept. As something that is simply true. ' +
      'Then proceed. Mark each one below when done.',
    steps: [
      {
        instruction:
          'Before starting the car — stop. One second. ' +
          'Notice you are on a small planet spinning in the middle of nowhere. ' +
          'That\'s reality. Then start the car.',
        isRepeating: false,
      },
      {
        instruction:
          'Before walking through a door — pause. One breath. ' +
          'You are about to step into another moment of your life on this planet. ' +
          'Enter from that awareness.',
        isRepeating: false,
      },
      {
        instruction:
          'Before picking up your phone — one second. Wider frame. ' +
          'You are a conscious being on a vast planet. ' +
          'Respond from there, not from the reactive personal mind.',
        isRepeating: false,
      },
    ],
    completionCriteria:
      'All three pause moments completed today.',
    durationLabel: '1 second × 3 triggers',
    color: '#3A8BBF',
    icon: 'planet',
    triggerCount: 3,
  },

  // ── Q4: Finding the Silent Space ──────────────────────────────────────────
  question4: {
    questionId: 'question4',
    name: 'The Silent Observation',
    tagline: 'Notice the stillness behind the movement.',
    singerSource:
      'Singer: "There is a silent space behind all of it. To find it, you simply have to notice that it is there."',
    howItWorks:
      'Pause for 1 minute. Notice the sounds, thoughts, and sensations present. ' +
      'Now, notice the space in which they all occur. ' +
      'Rest in that space, even for just a few seconds.',
    steps: [
      { instruction: 'Find a quiet moment. Sit or stand comfortably.' },
      { instruction: 'Notice the sounds, thoughts, and sensations present.', duration: 20 },
      { instruction: 'Now, notice the space in which they all occur.', duration: 20 },
      { instruction: 'Rest in that space, even for just a few seconds.', duration: 20 },
    ],
    completionCriteria: 'Paused for 1 minute to observe the silent space.',
    durationLabel: '1 min',
    color: '#FF6F61',
    icon: 'clarity',
  },

  // ── Q5: Isn't the mind helpful sometimes? Which part do I listen to? ───────
  question5: {
    questionId: 'question5',
    name: 'The Clarity Sit',
    tagline: 'Sit comfortably within — despite any noise the mind is making.',
    singerSource:
      'Singer: "It is not a matter of choosing which voice to listen to. ' +
      'It is about sitting quietly deep inside and not being distracted by the noise. ' +
      'Once you can sit comfortably within, you will have achieved clarity."',
    howItWorks:
      'Sit for 3 minutes. Do not try to silence the mind. Do not try to fix anything. ' +
      'Just practice being comfortable inside — regardless of whatever the mind is doing. ' +
      'The mind can be noisy, wise, or quiet. Your job is only to remain settled beneath it. ' +
      'When you notice you\'ve been pulled in — simply notice, and settle again.',
    steps: [
      {
        instruction: 'Sit comfortably. Close your eyes. Take two slow breaths.',
        duration: 16,
      },
      {
        instruction:
          'The mind will talk. Let it. You are not trying to stop it. ' +
          'You are simply staying settled beneath the noise.',
        duration: 60,
      },
      {
        instruction:
          'When you notice you\'ve been pulled into a thought — no criticism. ' +
          'Just notice, and return to the settled place.',
        duration: 60,
      },
      {
        instruction:
          'In this clarity, you will naturally know which thoughts are useful ' +
          'and which are just noise. No effort needed.',
        duration: 24,
      },
    ],
    completionCriteria: 'Completed the 3-minute clarity sit today.',
    durationLabel: '3 minutes',
    color: '#2E9E7A',
    icon: 'clarity',
  },

  // ── Q6: The Art of Letting Go ─────────────────────────────────────────────
  question6: {
    questionId: 'question6',
    name: 'The Guilt Witness',
    tagline: 'The one who sees the guilt is not the one who is guilty.',
    singerSource:
      'Daily Guidance: Release the Weight. Whenever a memory of the past arrives to tighten your heart, use the release breath and return to the present. You are the awareness, not the history.',
    howItWorks:
      'When you feel the weight of past actions today, stop and say: ' +
      '"I am noticing a feeling of guilt." Then ask yourself: "Who is the one noticing this?" ' +
      'Feel the space between yourself and the emotion. That space is where your freedom lives.',
    steps: [
      { instruction: 'Notice the heavy feeling of guilt or regret.' },
      { instruction: 'Label it clearly: "I am noticing a feeling of guilt."', duration: 10 },
      { instruction: 'Ask: "Who is noticing this?" Search for the noticer.', duration: 20 },
      { instruction: 'Rest in the awareness that is watching the emotion.', duration: 30 },
    ],
    completionCriteria: 'Witnessed a moment of guilt or regret from the seat of awareness.',
    durationLabel: '2 minutes',
    color: '#B8973A',
    icon: 'brain',
  },

  // ── Q7: Handling the Back-and-Forth ─────────────────────────────────────────
  question7: {
    questionId: 'question7',
    name: 'The Noticing Celebration',
    tagline: 'Measure progress by how quickly you catch yourself, not by the years of silence.',
    singerSource:
      'Singer: "The swinging, the back-and-forth — this is what growth looks like. ' +
      'Noticing you have been pulled back is the ultimate sign of progress. ' +
      'It means you are no longer lost in the noise."',
    howItWorks:
      'Throughout the day, catch yourself when you\'ve been pulled into a thought loop. ' +
      'Instead of judging yourself for "failing," genuinely celebrate the noticing. ' +
      'The sit below helps train this "noticing muscle."',
    steps: [
      {
        instruction: 'Sit comfortably and find the quiet space behind the thoughts.',
        duration: 30,
      },
      {
        instruction:
          'Wait for a thought to pull you in. Watch it happen if you can.',
        duration: 60,
      },
      {
        instruction:
          'The moment you notice you\'ve been "gone" — smile mentally. ' +
          'That noticing is your awareness returning to the seat.',
        duration: 30,
      },
      {
        instruction:
          'Settle back into the sky. Untouched by the clouds that just passed.',
        duration: 60,
      },
    ],
    completionCriteria: 'Celebrated at least one moment of noticing today.',
    durationLabel: '3 minutes',
    color: '#3A8BBF',
    icon: 'clarity',
  },
};

// Helper to get a practice by questionId
export function getPractice(questionId: string): QuestionPractice | null {
  return PRACTICE_LIBRARY[questionId] ?? null;
}

// All question IDs in order
export const QUESTION_IDS = ['question1', 'question2', 'question3', 'question4', 'question5', 'question6', 'question7'];
