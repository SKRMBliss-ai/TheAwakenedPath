// ─────────────────────────────────────────────────────────────────────────────
// Kids Zoom class — pricing, plan IDs and schedule. One place for all of it.
//
// Prices were chosen by the owner (Nov 2026):
//   Monthly  $19 / ₹1,499
//   Yearly   3 months free = 9 × monthly → $171 / ₹13,491
// Guarantee: 100% money back — any time on monthly, first 30 days on yearly.
//
// This is the Kids Mind Gym MEMBERSHIP: the app, with a live Zoom class included.
// Billed as a recurring Razorpay subscription (monthly or yearly). The amounts are
// charged by the backend from SUBSCRIPTION_PLANS / SUBSCRIPTION_PLANS_INR in
// functions/index.js (ids kids_membership_monthly / kids_membership_yearly) —
// change BOTH places together. A subscription needs a signed-in account.
// KIDS_ZOOM_BOOKING_OPEN = false switches the join buttons off.
// ─────────────────────────────────────────────────────────────────────────────

export type KidsCurrency = 'USD' | 'INR';

export const KIDS_ZOOM_BOOKING_OPEN = true;

/**
 * false (now): one-time payment for a month / a year through the course
 *   checkout (Razorpay, PayPal, Google Pay). Works today.
 * true: recurring Razorpay subscription (plans kids_membership_* are already on
 *   the backend). Turn on ONLY after Subscriptions is enabled on the Razorpay
 *   account — on 12 Nov 2026 Razorpay answered every subscription request,
 *   including the existing premium_monthly plan, with 401 Unauthorized.
 */
export const KIDS_MEMBERSHIP_RECURRING = false;

/** Months charged for the yearly plan (12 months for the price of 9). */
export const KIDS_ZOOM_YEARLY_PAID_MONTHS = 9;
export const KIDS_ZOOM_YEARLY_GUARANTEE_DAYS = 30;

const MONTHLY: Record<KidsCurrency, number> = { USD: 19, INR: 1499 };

/** INR for visitors in India, USD for everyone else (same rule as the course page). */
function detectCurrency(): KidsCurrency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' ? 'INR' : 'USD';
  } catch {
    return 'USD';
  }
}

export const KIDS_ZOOM_CURRENCY: KidsCurrency = detectCurrency();

export interface KidsZoomPlan {
  /** 'kids' = Kids Mind Gym membership; 'family' = kids membership + the adult Mind Gym app. */
  kind: 'kids' | 'family';
  /** Heading shown in the checkout panel. */
  title: string;
  /** Recurring: a key of SUBSCRIPTION_PLANS in functions/index.js. */
  productId: string;
  /** One-time: a key of COURSE_PRICES in functions/index.js. */
  oneTimeProductId: string;
  /** Price per billing period in major units of KIDS_ZOOM_CURRENCY. */
  price: number | null;
  label: string;
  period: 'month' | 'year';
}

export const KIDS_ZOOM_PLANS: { monthly: KidsZoomPlan; yearly: KidsZoomPlan } = {
  monthly: {
    kind: 'kids',
    title: 'Kids Mind Gym membership',
    productId: 'kids_membership_monthly',
    oneTimeProductId: 'kids_zoom_monthly',
    price: MONTHLY[KIDS_ZOOM_CURRENCY],
    label: 'Monthly',
    period: 'month',
  },
  yearly: {
    kind: 'kids',
    title: 'Kids Mind Gym membership',
    productId: 'kids_membership_yearly',
    oneTimeProductId: 'kids_zoom_yearly',
    price: MONTHLY[KIDS_ZOOM_CURRENCY] * KIDS_ZOOM_YEARLY_PAID_MONTHS,
    label: 'Yearly',
    period: 'year',
  },
};

// Family package: the kids membership PLUS the adult Mind Gym app, one payment.
// One-time only (adult access is granted as a time-limited membership). The
// amounts are charged by the backend from PWYW_PRODUCTS (family_monthly /
// family_yearly) in functions/index.js — change BOTH places together.
// Yearly = 10 × monthly (2 months free).
const FAMILY_MONTHLY: Record<KidsCurrency, number> = { USD: 25, INR: 1999 };

export const KIDS_FAMILY_PLANS: { monthly: KidsZoomPlan; yearly: KidsZoomPlan } = {
  monthly: {
    kind: 'family',
    title: 'Family package',
    productId: 'family_monthly',
    oneTimeProductId: 'family_monthly',
    price: FAMILY_MONTHLY[KIDS_ZOOM_CURRENCY],
    label: 'Monthly',
    period: 'month',
  },
  yearly: {
    kind: 'family',
    title: 'Family package',
    productId: 'family_yearly',
    oneTimeProductId: 'family_yearly',
    price: FAMILY_MONTHLY[KIDS_ZOOM_CURRENCY] * 10,
    label: 'Yearly',
    period: 'year',
  },
};

/** Live class schedule. Time, length and group size are still to be supplied. */
export const KIDS_ZOOM_SCHEDULE = {
  days: 'Saturday or Sunday, your choice' as string | null,
  time: 'Agreed with you on WhatsApp' as string | null,
  lengthMinutes: null as number | null, // TODO(owner): e.g. 40
  ages: '3–12 years',
  groupSize: null as string | null,     // TODO(owner)
};

export const kidsZoomConfigured = () =>
  KIDS_ZOOM_PLANS.monthly.price != null && KIDS_ZOOM_PLANS.yearly.price != null;

export function formatKidsPrice(amount: number, currency: KidsCurrency = KIDS_ZOOM_CURRENCY): string {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/** Yearly per-month cost and the saving vs paying monthly; null until prices are set. */
export function yearlyMath(m: number | null, y: number | null) {
  if (m == null || y == null) return null;
  return { perMonth: y / 12, savePerYear: m * 12 - y, savePct: m > 0 ? Math.round((1 - y / 12 / m) * 100) : 0 };
}

export const kidsZoomYearlyMath = () => yearlyMath(KIDS_ZOOM_PLANS.monthly.price, KIDS_ZOOM_PLANS.yearly.price);
export const familyYearlyMath = () => yearlyMath(KIDS_FAMILY_PLANS.monthly.price, KIDS_FAMILY_PLANS.yearly.price);
