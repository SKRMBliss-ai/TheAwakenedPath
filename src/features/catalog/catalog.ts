// ─────────────────────────────────────────────────────────────────────────────
// One catalogue for everything SKRM Bliss sells.
//
// The offer is THREE doors, each answering "who is this for?":
//   For me           → Adult Mind Gym (monthly / yearly). Everything for adults:
//                      practice, journal, every course, mantras, meditation music.
//   For my child     → Kids Mind Gym (monthly / yearly), with the Family add-on
//                      (Kids + Adult Mind Gym for the parent).
//   Mantras & Music  → Mantra Pass, paid once: every mantra and all meditation music.
//
// The home page, the site menu and /pricing all read DOORS below, so the three
// choices look the same everywhere. Products not in a door (one course on its
// own, All Access, retired passes) can still be bought by id via
// /pricing?select=<id>, but are never shown as a main choice.
//
// Each paid product id is a key in COURSE_PRICES / COURSE_PRICES_INR (one-time)
// or PWYW_PRODUCTS (memberships) in functions/index.js — change prices in BOTH.
// What a purchase unlocks is decided ONLY here, by `owns()`.
// ─────────────────────────────────────────────────────────────────────────────

export type Currency = 'INR' | 'USD';
export type Entitlement = 'mantras' | 'sacred_sounds' | 'mind_gym' | 'kids_mind_gym' | 'emotion_course' | 'extra_tools';

export interface Product {
  id: string;
  name: string;
  /** What it unlocks. */
  unlocks: Entitlement[];
  price: Record<Currency, number>;
  /** Struck-through price, if any. */
  was?: Record<Currency, number>;
  billing: 'once' | 'month' | 'year';
  /** Short line for cards and checkout. */
  pitch: string;
  /** Kept for old purchases and links, never offered. */
  retired?: boolean;
}

const ADULT_ALL: Entitlement[] = ['mind_gym', 'emotion_course', 'mantras', 'sacred_sounds', 'extra_tools'];

export const PRODUCTS: Product[] = [
  // ── For me ───────────────────────────────────────────────────────────────
  {
    id: 'membership_monthly', name: 'Adult Mind Gym', unlocks: ADULT_ALL,
    price: { INR: 240, USD: 3 }, billing: 'month',
    pitch: 'Everything for adults: practice, journal, every course, mantras and meditation music.',
  },
  {
    id: 'membership_yearly', name: 'Adult Mind Gym', unlocks: ADULT_ALL,
    price: { INR: 2400, USD: 30 }, billing: 'year',
    pitch: 'Everything for adults, for a full year.',
  },
  // ── For my child ─────────────────────────────────────────────────────────
  {
    id: 'kids_zoom_monthly', name: 'Kids Mind Gym', unlocks: ['kids_mind_gym'],
    price: { INR: 1499, USD: 19 }, billing: 'month',
    pitch: 'The kids app, a live Zoom class, printables and WhatsApp support.',
  },
  {
    id: 'kids_zoom_yearly', name: 'Kids Mind Gym', unlocks: ['kids_mind_gym'],
    price: { INR: 13491, USD: 171 }, billing: 'year',
    pitch: 'Everything in Kids Mind Gym for a year, 12 months for the price of 9.',
  },
  {
    id: 'family_monthly', name: 'Kids + Adult Mind Gym', unlocks: ['kids_mind_gym', ...ADULT_ALL],
    price: { INR: 1999, USD: 25 }, billing: 'month',
    pitch: 'Kids Mind Gym for your child, plus Adult Mind Gym for you.',
  },
  {
    id: 'family_yearly', name: 'Kids + Adult Mind Gym', unlocks: ['kids_mind_gym', ...ADULT_ALL],
    price: { INR: 19990, USD: 250 }, billing: 'year',
    pitch: 'Kids and Adult Mind Gym for a year, 12 months for the price of 10.',
  },
  // ── Mantras & Music ──────────────────────────────────────────────────────
  {
    id: 'mantra_lifetime_pass', name: 'Mantra Pass', unlocks: ['mantras', 'sacred_sounds'],
    price: { INR: 999, USD: 14.99 }, billing: 'once',
    pitch: 'Every mantra and all meditation music, on a loop, with no ads. Pay once, keep it.',
  },
  // ── Bought by id only (not a main choice) ────────────────────────────────
  {
    id: 'emotion_feelings_course', name: 'Feelings & Emotions course', unlocks: ['emotion_course'],
    price: { INR: 415, USD: 4.99 }, billing: 'once',
    pitch: 'Just this one course, yours to keep. Also included in Adult Mind Gym.',
  },
  {
    id: 'all_access', name: 'All Access', unlocks: ['kids_mind_gym', ...ADULT_ALL],
    price: { INR: 14999, USD: 199.99 }, billing: 'once',
    pitch: 'Adult Mind Gym, Kids Mind Gym and the Mantra Pass, for life.',
  },
  // ── Retired: merged into the Mantra Pass. Kept so any old id still unlocks. ─
  {
    id: 'sacred_sounds_pass', name: 'Mantra Pass', unlocks: ['mantras', 'sacred_sounds'], retired: true,
    price: { INR: 999, USD: 14.99 }, billing: 'once', pitch: 'Now part of the Mantra Pass.',
  },
  {
    id: 'sound_bundle', name: 'Mantra Pass', unlocks: ['mantras', 'sacred_sounds'], retired: true,
    price: { INR: 999, USD: 14.99 }, billing: 'once', pitch: 'Now part of the Mantra Pass.',
  },
];

export const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;

/** Old product ids that now mean the Mantra Pass. */
export const canonicalId = (id: string) => (product(id)?.retired ? 'mantra_lifetime_pass' : id);

/** Memberships are pay-what-you-want on the backend; the amount sent is the listed price. */
export const isPwyw = (id: string) => id.startsWith('membership_') || id.startsWith('family_');

/** Refund promise per product, shown at checkout. Matches /policies#refund. */
export function refundOf(id: string): string {
  if (['mantra_lifetime_pass', 'sacred_sounds_pass', 'sound_bundle'].includes(id)) return 'Full refund within 7 days.';
  if (id === 'kids_zoom_yearly' || id === 'family_yearly') return '100% money back in the first 30 days.';
  if (id === 'kids_zoom_monthly' || id === 'family_monthly' || id === 'emotion_feelings_course') return '100% money back, any time.';
  return 'Full refund within 15 days.';
}

/** The three doors. Home, menu and /pricing all read this. */
export interface Door {
  id: 'me' | 'child' | 'mantras';
  /** The visitor's answer to "who is this for?" */
  who: string;
  /** The product the door leads to. */
  title: string;
  /** One sentence: what it is. */
  line: string;
  /** Three short "what you get" points. */
  includes: string[];
  /** Plans offered at this door, cheapest first. The last one is highlighted. */
  plans: string[];
  /** Page that explains it. */
  learnHref: string;
  /** Optional small extra offered under the plans. */
  extra?: { label: string; id: string };
}

export const DOORS: Door[] = [
  {
    id: 'me', who: 'For me', title: 'Adult Mind Gym',
    line: 'A few quiet minutes a day for a calmer, clearer mind.',
    includes: ['Daily practice, journal and Breathe', 'Every course, including Feelings & Emotions', 'All mantras and meditation music'],
    plans: ['membership_monthly', 'membership_yearly'],
    learnHref: '/aboutmindgym',
    extra: { label: 'Only want the Feelings & Emotions course?', id: 'emotion_feelings_course' },
  },
  {
    id: 'child', who: 'For my child', title: 'Kids Mind Gym',
    line: 'Feelings, stories and games for ages 3 to 12, with a live Zoom class.',
    includes: ['The kids app: feelings, stories and games', 'A live Zoom class with Sim', 'Printables and WhatsApp support for you'],
    plans: ['kids_zoom_monthly', 'kids_zoom_yearly', 'family_monthly'],
    learnHref: '/tiny-kids-transformations',
  },
  {
    id: 'mantras', who: 'For prayer & calm', title: 'Mantras & Music',
    line: 'Sacred chants with their meaning, and meditation music for calm and sleep.',
    includes: ['Every mantra and all meditation music', 'Play any track on a loop, no ads', 'New mantras added free'],
    plans: ['mantra_lifetime_pass'],
    learnHref: '/mantras',
  },
];

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

/** What a locked sound library sends people to buy. Both libraries: the Mantra Pass. */
export const UPGRADE: Record<'mantras' | 'sacred_sounds', { single: string; bundle: string }> = {
  mantras: { single: 'mantra_lifetime_pass', bundle: 'membership_yearly' },
  sacred_sounds: { single: 'mantra_lifetime_pass', bundle: 'membership_yearly' },
};
