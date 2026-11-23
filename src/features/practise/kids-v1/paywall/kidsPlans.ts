import type { RegionCurrency } from '../../../../lib/regionPricing';

/**
 * The two Mind Gym for Kids membership plans, as the parent screen shows them.
 *
 * PRICES ARE DISPLAY ONLY. The amount actually charged is decided on the
 * server (PWYW_PRODUCTS.kids_membership_* in functions/index.js, where
 * min === suggested, i.e. a fixed price). Change a price in BOTH places.
 */
export type KidsPlanId = 'kids_membership_monthly' | 'kids_membership_yearly';

export interface KidsPlan {
  id: KidsPlanId;
  name: string;
  period: string;
  days: number;
  /** Yearly only: the live challenge place and Sim's personal guidance. */
  extras: boolean;
  price: Record<RegionCurrency, number>;
}

export const KIDS_PLANS: Record<KidsPlanId, KidsPlan> = {
  kids_membership_monthly: {
    id: 'kids_membership_monthly',
    name: 'Monthly',
    period: 'for 30 days',
    days: 30,
    extras: false,
    price: { USD: 3, INR: 240, EUR: 3, GBP: 3, CAD: 4, AUD: 4, AED: 12, SGD: 4 },
  },
  kids_membership_yearly: {
    id: 'kids_membership_yearly',
    name: 'Yearly',
    period: 'for 12 months',
    days: 365,
    extras: true,
    price: { USD: 30, INR: 2400, EUR: 30, GBP: 25, CAD: 40, AUD: 45, AED: 110, SGD: 40 },
  },
};

export const APP_FEATURES = [
  'The whole Mind Gym for Kids app, on every device you sign in on',
  'Daily feelings check-in, good-choices rooms and games',
  'My Inner Diary, Story Lab and My Corner',
];

export const YEARLY_EXTRAS = [
  'A place in the 3-day live Tiny Kids Transformations challenge on Zoom',
  'Personal guidance from Sim: ask questions by email or WhatsApp',
  'Request a 1:1 Zoom call with Sim',
];

/** Fired by the "For grown-ups" link on the kids home; KidsGate listens. */
export const PARENTS_EVENT = 'mg:parents';

/**
 * SALES VIDEOS for the parent screen.
 *
 * `src: null` is a placeholder: the walkthrough falls back to the short
 * welcome video, and a feature tile shows "Video coming soon". To publish a
 * video, put a WEB-SIZED file (1080p H.264 .mp4, ideally under ~40 MB — not
 * the 4K master) in public/mind-gym/sales/ and set its path here, or paste a
 * Firebase Storage URL. Nothing else needs to change.
 */
export interface SalesVideo { id: string; title: string; blurb: string; src: string | null; poster?: string }

export const WALKTHROUGH_VIDEO: SalesVideo = {
  id: 'walkthrough',
  title: 'A walk through Mind Gym for Kids',
  blurb: 'Two minutes inside the app.',
  src: null, // e.g. '/mind-gym/sales/walkthrough-1080.mp4'
  poster: '/assets/home/hub-room@960.webp',
};

export const WALKTHROUGH_FALLBACK = '/mind-gym/welcome/welcomevideo.mp4';

export const FEATURE_VIDEOS: SalesVideo[] = [
  { id: 'feelings', title: 'How Are You Feeling?', blurb: 'A five-step check-in that helps a child name a feeling and choose what to do next.', src: null },
  { id: 'choices', title: 'Good Choices rooms and games', blurb: 'Seven rooms for kindness, truth, including others and more, with games where nobody loses.', src: null },
  { id: 'diary', title: 'My Inner Diary', blurb: 'A month at a glance: small steps, coloured in day by day.', src: null },
  { id: 'storylab', title: 'Story Lab', blurb: 'Turning a hard moment into a story with a different ending.', src: null },
  { id: 'corner', title: 'My Corner and buddies', blurb: 'A cosy place to rest, revisit and look after a growing buddy.', src: null },
];
