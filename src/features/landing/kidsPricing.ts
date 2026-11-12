// ─────────────────────────────────────────────────────────────────────────────
// Kids Zoom class — pricing, plan IDs and schedule. One place for all of it.
//
// Prices were chosen by the owner (Nov 2026):
//   Monthly  $19 / ₹1,499
//   Yearly   3 months free = 9 × monthly → $171 / ₹13,491
// Guarantee: 100% money back — any time on monthly, first 30 days on yearly.
//
// Sold as ONE-TIME passes (no auto-renewal) through the same guest checkout as
// the Feelings course: Razorpay + PayPal + Google Pay. The amounts are charged
// by the backend from COURSE_PRICES / COURSE_PRICES_INR in functions/index.js
// (ids kids_zoom_monthly / kids_zoom_yearly) — change BOTH places together.
// KIDS_ZOOM_BOOKING_OPEN = false switches the buy buttons off.
// ─────────────────────────────────────────────────────────────────────────────

export type KidsCurrency = 'USD' | 'INR';

export const KIDS_ZOOM_BOOKING_OPEN = true;

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
  /** Backend product id — a key of COURSE_PRICES in functions/index.js. */
  productId: string;
  /** Price per billing period in major units of KIDS_ZOOM_CURRENCY. */
  price: number | null;
  label: string;
  period: 'month' | 'year';
}

export const KIDS_ZOOM_PLANS: { monthly: KidsZoomPlan; yearly: KidsZoomPlan } = {
  monthly: {
    productId: 'kids_zoom_monthly',
    price: MONTHLY[KIDS_ZOOM_CURRENCY],
    label: 'Monthly',
    period: 'month',
  },
  yearly: {
    productId: 'kids_zoom_yearly',
    price: MONTHLY[KIDS_ZOOM_CURRENCY] * KIDS_ZOOM_YEARLY_PAID_MONTHS,
    label: 'Yearly',
    period: 'year',
  },
};

/** Live class schedule. Time, length and group size are still to be supplied. */
export const KIDS_ZOOM_SCHEDULE = {
  days: 'Every Friday · Saturday · Sunday' as string | null,
  time: null as string | null,          // TODO(owner): e.g. "4:00 PM UK time"
  lengthMinutes: null as number | null, // TODO(owner): e.g. 40
  ages: 'About 5–10 years',
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
export function kidsZoomYearlyMath() {
  const m = KIDS_ZOOM_PLANS.monthly.price;
  const y = KIDS_ZOOM_PLANS.yearly.price;
  if (m == null || y == null) return null;
  return { perMonth: y / 12, savePerYear: m * 12 - y, savePct: m > 0 ? Math.round((1 - y / 12 / m) * 100) : 0 };
}
