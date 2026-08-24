// ─────────────────────────────────────────────────────────────────────────────
// "Let's Be Our Best Every Day!" — 3-Day Kids Challenge
//
// Single source of truth for the program's copy so the sales page, the
// registration page and the three cross-sell placements (home, the Feelings &
// Emotions course page, and the Mind Gym kids section) never drift apart.
// ─────────────────────────────────────────────────────────────────────────────

export const KIDS_PATH = '/tiny-kids-transformations';
export const KIDS_REGISTER_PATH = '/tiny-kids-transformations/register';

export const KIDS_TITLE = "Let's Be Our Best Every Day!";
export const KIDS_TAGLINE = 'Small Choices · Big Growth · Happy Heart';
export const KIDS_AGES = 'Ages 3–12';
export const KIDS_FORMAT = 'Live on Zoom · Friday–Sunday · 30–40 minutes';
export const KIDS_TIME = '4:00 PM UK Time';

export const KIDS_BLURB =
  'A playful 3-day weekend challenge where children learn to notice what they feel, ' +
  'understand their choices, practise kindness and grow a little every day.';

export interface KidsDay {
  day: string;
  title: string;
  bullets: string[];
  practice: string;
  theme: 'pink' | 'blue' | 'green';
}

export const KIDS_DAYS: KidsDay[] = [
  {
    day: 'DAY 1 – FRIDAY',
    title: 'Meet Yourself',
    bullets: [
      'What are feelings?',
      'Thoughts, words & actions',
      'The 7 choices of the chart',
      'Make one conscious choice',
    ],
    practice: 'Make one conscious choice each day.',
    theme: 'pink',
  },
  {
    day: 'DAY 2 – SATURDAY',
    title: 'Understand Yourself',
    bullets: [
      'Recognise different feelings',
      'What happens inside me?',
      'How thoughts influence feelings',
      'Pause before reacting',
      'Choose a better response',
    ],
    practice: 'Notice one feeling, what caused it & what choice you made.',
    theme: 'blue',
  },
  {
    day: 'DAY 3 – SUNDAY',
    title: 'Grow Yourself',
    bullets: [
      'Look back & learn',
      'What made me proud?',
      'What was difficult?',
      'What can I try next time?',
      'My goal for the coming week',
    ],
    practice: 'One small goal for the week ahead.',
    theme: 'green',
  },
];

export const KIDS_AGE_BANDS = [
  { band: 'Ages 3–5', detail: 'Parent-supported stories, pictures and simple choices.' },
  { band: 'Ages 6–8', detail: 'Guided reflection and everyday, child-friendly scenarios.' },
  { band: 'Ages 9–12', detail: 'Deeper exploration of thoughts, feelings, reactions and choices.' },
];

export const KIDS_INCLUDES = [
  'Live Friday, Saturday and Sunday Zoom sessions',
  '“Let\u2019s Be Our Best Every Day!” activity chart',
  'A simple daily reflection practice',
  'Parent-supported emotional awareness activities',
  'Best Every Day Champion completion certificate',
];

export const KIDS_STEPS = [
  { label: 'Notice', quote: '“What am I feeling right now?”' },
  { label: 'Understand', quote: '“What happened inside me?”' },
  { label: 'Choose', quote: '“What could I do next?”' },
];

export const KIDS_FAQ = [
  {
    q: 'Does my child need to attend all three sessions?',
    a: 'We recommend all three — the weekend is designed as one connected journey. If a session is missed, the parent can still continue the simple activity at home.',
  },
  {
    q: 'Does a parent need to stay with the child?',
    a: 'Parent or guardian involvement is recommended, especially for younger children who may need help with the chart and activities.',
  },
  {
    q: 'Will children have to share personal or private experiences?',
    a: 'No. Children take part at a level that feels comfortable to them and are never required to disclose sensitive personal information.',
  },
  {
    q: 'Is this therapy or counselling?',
    a: 'No. This is an educational self-awareness and emotional-learning experience for children. It is not a substitute for professional mental-health care.',
  },
  {
    q: 'Is this the same as the adult Feelings & Emotions course?',
    a: 'No. The adult Feelings & Emotions course is a separate, self-paced video series. This 3-Day Kids Challenge is a separate, live interactive weekend Zoom program designed specifically for children (Ages 3–12).',
  },
  {
    q: 'How much does this kids challenge cost? Is upfront payment required?',
    a: 'Registration is free and requires no upfront payment. The program is purely donation-based (you can donate anywhere from $2 to $99). We will send the donation details directly to you over email and WhatsApp after you register.',
  },
  {
    q: 'What do we need to join?',
    a: 'A device with Zoom, a quiet corner, and something to colour with for the activity chart. We send the link and a short preparation note after registration.',
  },
];

export const KIDS_GOALS = [
  'Understand feelings',
  'Handle anger or frustration',
  'Build confidence',
  'Practise kindness',
  'Think before reacting',
  'Express feelings',
  'Build a positive routine',
  'Other',
];

export const KIDS_AGE_OPTIONS = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Drop the two supplied images in public/marketing/kids/ with these exact
// filenames and they'll appear on the sales page automatically.
export const KIDS_CHART_IMG = 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2FPosterDairy.png?alt=media';
export const KIDS_ONLY_DIARY_IMG = 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2Fdiary.jpg?alt=media';
export const KIDS_TEACHER_IMG = 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fsite%2FSimKatyalProfile.webp?alt=media';
/** The branded "Let's Be Our Best Every Day!" poster (mother + son, with the
 *  title, tagline and Emotional Awareness / Positive Choices / Happy Heart
 *  icons baked into the image itself). Used on both cross-sell placements. */
export const KIDS_POSTER_IMG = 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2Fposter.png?alt=media';

export const KIDS_TEACHER_POINTS = [
  { icon: '❤️', title: 'Understand feelings', body: 'Help children notice and name what is happening inside.' },
  { icon: '🛡️', title: 'Make better choices', body: 'Give children a pause between feeling something and reacting.' },
  { icon: '🌱', title: 'Grow every day', body: 'Focus on small, realistic choices rather than perfection.' },
];

export const KIDS_TEACHER_QUOTE =
  "I'm learning, unlearning and growing every day — so I can help more children grow a little better, every day.";

/** Fire-and-forget activity log, matching the other landing pages. */
export function trackKids(action: string, page = KIDS_PATH, details = '', email = 'anonymous') {
  try {
    if (import.meta.env.DEV) return; // never let local testing write into production analytics
    fetch('https://us-central1-awakened-path-2026.cloudfunctions.net/logWebActivity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        action,
        page,
        details: details || action,
        source: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
      }),
    }).catch(() => {});
  } catch { /* silent */ }
}
