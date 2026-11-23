// ─────────────────────────────────────────────────────────────────────────────
// The three Soulful studios: one YouTube channel each, one clear set of
// offerings under each. The home page cards, the footer and the video strip all
// read this file, so a handle or a page changes in ONE place.
//
//   Mind        → courses, the Mind Gym app, the Kids Mind Gym app
//   Mantras     → Indian mantras (also a playlist inside the Mind Gym app)
//   Meditation  → meditation music (also a playlist inside the Mind Gym app)
// ─────────────────────────────────────────────────────────────────────────────

export type StudioKey = 'mind' | 'mantra' | 'meditation';

export interface StudioOffering {
  label: string;
  /** One line: what it is. */
  line: string;
  /** Sales / explainer page. */
  learn: string;
  /** Where the product itself opens, when it is an app. */
  open?: { label: string; href: string };
}

export interface Studio {
  key: StudioKey;
  name: string;
  handle: string;
  /** Plain channel page, and the same page with the subscribe prompt armed. */
  url: string;
  subscribe: string;
  /** One line about what the channel publishes. */
  channelLine: string;
  accent: string;
  /** The studio's own logo, shown at the centre of its card. */
  logo: string;
  /** Pictures for the top of the home card: one fills it, two sit side by side. */
  images: { src: string; alt: string; contain?: boolean }[];
  offerings: StudioOffering[];
}

const yt = (handle: string) => `https://www.youtube.com/${handle}`;

export const STUDIOS: Studio[] = [
  {
    key: 'mind',
    name: 'Soulful Mind Studio',
    handle: '@SoulfulMindStudio',
    url: yt('@SoulfulMindStudio'),
    subscribe: `${yt('@SoulfulMindStudio')}?sub_confirmation=1`,
    channelLine: 'Sim Katyal’s courses, Mind Gym app demos and Kids Mind Gym videos.',
    accent: '#4A3260',
    logo: '/SoulfulStudios/Mind/soulful-mind-studio-logo.webp',
    images: [
      { src: '/marketing/adult-guide-shruti-mic.webp', alt: 'Shruti Khungar, guide for the Mind Gym app' },
      { src: '/marketing/kids/hero-sim-diary.webp', alt: 'Sim Katyal with her son and the daily diary chart' },
    ],
    offerings: [
      { label: 'Mind Gym app', line: 'Daily practice, journal, courses, mantras and meditation music.', learn: '/aboutmindgym', open: { label: 'Open the app', href: '/mindgym' } },
      { label: 'Feelings & Emotions course', line: 'A guided course by Sim Katyal.', learn: '/feelingsandemotioncourse' },
      { label: 'Kids Mind Gym', line: 'Feelings, stories and games for ages 3 to 12, with a live Zoom class.', learn: '/tiny-kids-transformations', open: { label: 'Open the kids app', href: '/mindgymforkids' } },
    ],
  },
  {
    key: 'mantra',
    name: 'Soulful Mantras Studio',
    handle: '@SoulfulMantraStudio',
    url: yt('@SoulfulMantraStudio'),
    subscribe: `${yt('@SoulfulMantraStudio')}?sub_confirmation=1`,
    channelLine: 'Sacred Indian mantras and chants, with their meaning.',
    accent: '#C4913A',
    logo: '/SoulfulStudios/Mantra/logo-light.webp',
    images: [{ src: '/marketing/mantras/exec-ce641b41-377a-428e-9ae9-53d82af4accf.png', alt: 'A golden Om on a white medallion', contain: true }],
    offerings: [
      { label: 'Mantras', line: 'Every mantra with Sanskrit, meaning and a mala counter. Also a playlist inside the Mind Gym app.', learn: '/mantras', open: { label: 'Listen in the app', href: '/mindgym' } },
      { label: 'Mantra Pass', line: 'Every mantra, paid once.', learn: '/mantras/lifetime-pass' },
    ],
  },
  {
    key: 'meditation',
    name: 'Soulful Meditation Studio',
    handle: '@SoulfulMeditationStudio',
    url: yt('@SoulfulMeditationStudio'),
    subscribe: `${yt('@SoulfulMeditationStudio')}?sub_confirmation=1`,
    channelLine: 'Meditation music for calm, sleep and deep practice.',
    accent: '#3F7F86',
    logo: '/SoulfulStudios/Meditation/emblem.webp',
    images: [{ src: '/SoulfulStudios/Meditation/banner.webp', alt: 'Soulful Meditation Studio' }],
    offerings: [
      { label: 'Meditation music', line: 'Tracks for calm, sleep and deep practice. Also a playlist inside the Mind Gym app.', learn: '/meditation-music', open: { label: 'Listen in the app', href: '/mindgym' } },
      { label: 'Meditation Music Pass', line: 'All the music, paid once.', learn: '/meditation-music/lifetime-pass' },
    ],
  },
];

export const studio = (key: StudioKey) => STUDIOS.find((s) => s.key === key)!;
