// ─────────────────────────────────────────────────────────────────────────────
// One catalogue for everything SKRM Bliss sells, across both studios.
//
//   Soulful Mind Studio   → Mind Gym (adult), Kids Mind Gym, Courses
//   Soulful Mantra Studio → Mantras, Sacred Sounds (meditation music)
//
// Every product can be bought on its own, and the bundles buy them together.
// Each paid product id is a key in COURSE_PRICES / COURSE_PRICES_INR (one-time)
// or PWYW_PRODUCTS (memberships) in functions/index.js — change prices in BOTH.
//
// What a purchase unlocks is decided ONLY here, by `owns()`. Screens ask
// `owns(profile, 'mantras')`, never a product id, so a bundle or a new tier
// is added by editing UNLOCKS below and nothing else.
// ─────────────────────────────────────────────────────────────────────────────

export type Currency = 'INR' | 'USD';
export type Entitlement = 'mantras' | 'sacred_sounds' | 'mind_gym' | 'kids_mind_gym' | 'emotion_course' | 'extra_tools';

export interface Product {
  id: string;
  name: string;
  studio: 'mind' | 'mantra' | 'both';
  /** What it unlocks. */
  unlocks: Entitlement[];
  price: Record<Currency, number>;
  /** Struck-through price, if any. */
  was?: Record<Currency, number>;
  billing: 'once' | 'month' | 'year';
  /** Short line for cards and checkout. */
  pitch: string;
}

export const PRODUCTS: Product[] = [
  // ── Soulful Mantra Studio ────────────────────────────────────────────────
  {
    id: 'mantra_lifetime_pass', name: 'Mantra Pass', studio: 'mantra', unlocks: ['mantras'],
    price: { INR: 299, USD: 4.99 }, was: { INR: 999, USD: 11.99 }, billing: 'once',
    pitch: 'Every mantra on a loop, whole playlists back to back, lyrics PDFs and sadhana plans.',
  },
  {
    id: 'sacred_sounds_pass', name: 'Sacred Sounds Pass', studio: 'mantra', unlocks: ['sacred_sounds'],
    price: { INR: 299, USD: 4.99 }, was: { INR: 999, USD: 11.99 }, billing: 'once',
    pitch: 'All meditation music on a loop, in playlists for calm, sleep and deep practice.',
  },
  {
    id: 'sound_bundle', name: 'Sound Bundle', studio: 'mantra', unlocks: ['mantras', 'sacred_sounds'],
    price: { INR: 499, USD: 7.99 }, was: { INR: 1998, USD: 23.98 }, billing: 'once',
    pitch: 'Mantras and Sacred Sounds together, paid once.',
  },
  // ── Soulful Mind Studio ──────────────────────────────────────────────────
  {
    id: 'emotion_feelings_course', name: 'Feelings & Emotions course', studio: 'mind', unlocks: ['emotion_course'],
    price: { INR: 415, USD: 4.99 }, billing: 'once',
    pitch: 'The full course, day by day, yours to keep.',
  },
  {
    id: 'membership_monthly', name: 'Mind Gym membership', studio: 'both',
    unlocks: ['mind_gym', 'emotion_course', 'mantras', 'sacred_sounds', 'extra_tools'],
    price: { INR: 240, USD: 3 }, billing: 'month',
    pitch: 'The whole adult app: practice, every course, Mantras, Sacred Sounds, Breathe and the Habit Tracker.',
  },
  {
    id: 'membership_yearly', name: 'Mind Gym membership', studio: 'both',
    unlocks: ['mind_gym', 'emotion_course', 'mantras', 'sacred_sounds', 'extra_tools'],
    price: { INR: 2400, USD: 30 }, billing: 'year',
    pitch: 'Everything in the adult app for a year.',
  },
  {
    id: 'kids_zoom_monthly', name: 'Kids Mind Gym', studio: 'mind', unlocks: ['kids_mind_gym'],
    price: { INR: 1499, USD: 19 }, billing: 'month',
    pitch: 'The kids app, a live Zoom class, printables and WhatsApp support.',
  },
  {
    id: 'kids_zoom_yearly', name: 'Kids Mind Gym', studio: 'mind', unlocks: ['kids_mind_gym'],
    price: { INR: 13491, USD: 171 }, billing: 'year',
    pitch: '12 months for the price of 9: the kids app, live Zoom class, printables and support.',
  },
  {
    id: 'family_monthly', name: 'Family package', studio: 'both',
    unlocks: ['kids_mind_gym', 'mind_gym', 'emotion_course', 'mantras', 'sacred_sounds', 'extra_tools'],
    price: { INR: 1999, USD: 25 }, billing: 'month',
    pitch: 'Kids Mind Gym for your child, the full adult app for you.',
  },
  {
    id: 'family_yearly', name: 'Family package', studio: 'both',
    unlocks: ['kids_mind_gym', 'mind_gym', 'emotion_course', 'mantras', 'sacred_sounds', 'extra_tools'],
    price: { INR: 19990, USD: 250 }, billing: 'year',
    pitch: '12 months for the price of 10: kids and adult apps together.',
  },
  // ── Everything ───────────────────────────────────────────────────────────
  {
    id: 'all_access', name: 'All Access', studio: 'both',
    unlocks: ['mind_gym', 'kids_mind_gym', 'emotion_course', 'mantras', 'sacred_sounds', 'extra_tools'],
    price: { INR: 14999, USD: 199.99 }, billing: 'once',
    pitch: 'Every app, course and library from both studios, for life.',
  },
];

export const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;

/** Memberships are pay-what-you-want on the backend; the amount sent is the listed price. */
export const isPwyw = (id: string) => id.startsWith('membership_') || id.startsWith('family_');

/** Refund promise per product, shown at checkout. Matches /policies#refund. */
export function refundOf(id: string): string {
  if (['mantra_lifetime_pass', 'sacred_sounds_pass', 'sound_bundle'].includes(id)) return 'Full refund within 7 days.';
  if (id === 'kids_zoom_yearly' || id === 'family_yearly') return '100% money back in the first 30 days.';
  if (id === 'kids_zoom_monthly' || id === 'family_monthly' || id === 'emotion_feelings_course') return '100% money back, any time.';
  return 'Full refund within 15 days.';
}

export interface PlanGroup { id: string; title: string; blurb: string; studio: string; ids: string[] }

/** How /pricing lays the products out, by need. */
export const PLAN_GROUPS: PlanGroup[] = [
  { id: 'sound', studio: 'Soulful Mantra Studio', title: 'Mantras & Meditation Music', blurb: 'Loop any track and play whole playlists. Pay once, keep it.',
    ids: ['mantra_lifetime_pass', 'sacred_sounds_pass', 'sound_bundle'] },
  { id: 'mindgym', studio: 'Soulful Mind Studio', title: 'Mind Gym & Courses', blurb: 'The adult app with every course, or one course on its own.',
    ids: ['emotion_feelings_course', 'membership_monthly', 'membership_yearly'] },
  { id: 'kids', studio: 'Soulful Mind Studio', title: 'Kids Mind Gym & Family', blurb: 'For children 3 to 12, with a live Zoom class. Family adds the adult app for you.',
    ids: ['kids_zoom_monthly', 'kids_zoom_yearly', 'family_monthly'] },
];

/** Product a library or page should pre-select, by entitlement. */
export const BEST_FOR: Record<string, string> = { mantras: 'mantra_lifetime_pass', sacred_sounds: 'sacred_sounds_pass' };

export const pricingHref = (select?: string) => (select ? `/pricing?select=${encodeURIComponent(select)}` : '/pricing');

/** INR in India, USD elsewhere (same rule as the course and kids pages). */
export const CURRENCY: Currency = (() => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' ? 'INR' : 'USD';
  } catch { return 'USD'; }
})();

export function formatPrice(amount: number, currency: Currency = CURRENCY) {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0,
    }).format(amount);
  } catch { return `${currency} ${amount}`; }
}

export const priceOf = (id: string) => formatPrice(product(id).price[CURRENCY]);
export const wasOf = (id: string) => { const w = product(id).was; return w ? formatPrice(w[CURRENCY]) : null; };

/** Minimal shape of the user profile this needs. */
export interface OwnerProfile {
  purchasedCourses?: string[];
  ownedTracks?: string[];
  membershipUntil?: { toDate?: () => Date } | string | number | Date | null;
  subscriptionStatus?: string;
}

function membershipActive(p: OwnerProfile) {
  const m = p.membershipUntil as { toDate?: () => Date } | string | number | Date | null | undefined;
  if (!m) return false;
  const ms = typeof m === 'object' && m && 'toDate' in m && typeof m.toDate === 'function'
    ? m.toDate().getTime() : new Date(m as string | number | Date).getTime();
  return ms > Date.now();
}

/**
 * Does this person own `what`? Admin/preview accounts pass `isPremium` = true.
 * Paid memberships (membershipUntil / subscription) unlock what membership_* unlocks.
 */
export function owns(p: OwnerProfile | null | undefined, what: Entitlement, isPremium = false): boolean {
  if (isPremium) return true;
  if (!p) return false;
  const bought = p.purchasedCourses ?? [];
  if (bought.some((id) => PRODUCTS.find((x) => x.id === id)?.unlocks.includes(what))) return true;
  if ((membershipActive(p) || p.subscriptionStatus === 'ACTIVE') && product('membership_monthly').unlocks.includes(what)) return true;
  return false;
}

/** The cheapest product that unlocks `what` on its own, and the bundle above it. */
export const UPGRADE: Record<'mantras' | 'sacred_sounds', { single: string; bundle: string }> = {
  mantras: { single: 'mantra_lifetime_pass', bundle: 'sound_bundle' },
  sacred_sounds: { single: 'sacred_sounds_pass', bundle: 'sound_bundle' },
};
