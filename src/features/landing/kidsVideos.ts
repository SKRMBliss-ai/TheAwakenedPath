// ─────────────────────────────────────────────────────────────────────────────
// Kids Mind Gym marketing videos.
//
// One entry per Remotion composition. To publish a video, export the
// composition as MP4 and drop it at the `src` path below (under public/) — no
// code change needed. Until the file exists the page shows a placeholder.
// Optional: add public/marketing/kids/<name>.jpg and set `poster`.
// ─────────────────────────────────────────────────────────────────────────────

export type KidsVideoName =
  | 'MindGymAd' | 'Guide1-start' | 'Guide2-feelings' | 'Guide3-storylab'
  | 'Guide4-games' | 'Guide5-diary' | 'Guide6-corner' | 'Guide7-rewards' | 'Guide8-grownup';

export interface KidsVideoConfig {
  name: KidsVideoName;
  title: string;
  blurb: string;
  src: string;
  poster?: string;
}

const dir = '/marketing/kids';
const v = (name: KidsVideoName, title: string, blurb: string): KidsVideoConfig =>
  ({ name, title, blurb, src: `${dir}/${name}.mp4` });

export const KIDS_AD_VIDEO = v(
  'MindGymAd', 'Kids Mind Gym in one minute',
  'A quick look at the Kids Mind Gym: feelings, stories, games, a diary and a calm corner.',
);

export const KIDS_GUIDE_VIDEOS: KidsVideoConfig[] = [
  v('Guide1-start', 'Getting started', 'How your child gets in and finds their way around.'),
  v('Guide2-feelings', 'Feelings', 'Naming and understanding what they feel.'),
  v('Guide3-storylab', 'Story Lab', 'Making up stories that explore feelings and choices.'),
  v('Guide4-games', 'Games', 'Playful games that practise calm, focus and kindness.'),
  v('Guide5-diary', 'Diary', 'A place of their own to write or draw about their day.'),
  v('Guide6-corner', 'Calm corner', 'Simple tools for when big feelings arrive.'),
  v('Guide7-rewards', 'Rewards', 'Small celebrations for showing up and practising.'),
  v('Guide8-grownup', 'For grown-ups', 'What parents can see and how to support at home.'),
];
