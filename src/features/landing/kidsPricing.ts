// ─────────────────────────────────────────────────────────────────────────────
// Kids Zoom class — pricing, plan IDs and schedule.
//
// ⚠ PLACEHOLDERS. Nothing here is a real price. The owner must fill in every
// field marked TODO below. While `price` is null the sales page shows
// "Price to be confirmed" and the buy buttons stay disabled, so nothing can be
// charged at an invented amount.
//
// To go live:
//   1. Set `price` (major units of `currency`, e.g. 19 for $19) for both plans.
//   2. Set `razorpayPlanId` for both plans. The backend
//      (functions/index.js → createRazorpaySubscription) only accepts plan ids
//      it knows (today: premium_monthly / premium_yearly), so a matching entry
//      must be added to SUBSCRIPTION_PLANS / SUBSCRIPTION_PLANS_INR there with
//      the same id and price. That is a functions deploy, kept out of this change.
//   3. Optionally set `paypalPlanId` (P-xxxx) to show the PayPal button too.
//   4. Fill in `KIDS_ZOOM_SCHEDULE`.
// ─────────────────────────────────────────────────────────────────────────────

export interface KidsZoomPlan {
  /** Matches the backend plan key. TODO(owner): confirm / add on the backend. */
  razorpayPlanId: string;
  /** PayPal Billing Plan id (P-xxx). Empty = no PayPal button. TODO(owner) */
  paypalPlanId: string;
  /** Price per billing period in major units of `currency`. null = not set. TODO(owner) */
  price: number | null;
  label: string;
  period: 'month' | 'year';
}

export const KIDS_ZOOM_CURRENCY: 'USD' | 'INR' = 'USD'; // TODO(owner): confirm

export const KIDS_ZOOM_PLANS: { monthly: KidsZoomPlan; yearly: KidsZoomPlan } = {
  monthly: {
    razorpayPlanId: 'kids_zoom_monthly', // TODO(owner): placeholder id, not on the backend yet
    paypalPlanId: '',
    price: null,
    label: 'Monthly',
    period: 'month',
  },
  yearly: {
    razorpayPlanId: 'kids_zoom_yearly', // TODO(owner): placeholder id, not on the backend yet
    paypalPlanId: '',
    price: null,
    label: 'Yearly',
    period: 'year',
  },
};

/** Live class schedule. TODO(owner): all values are placeholders until supplied. */
export const KIDS_ZOOM_SCHEDULE = {
  days: null as string | null,          // e.g. "Saturdays"
  time: null as string | null,          // e.g. "4:00 PM UK time"
  lengthMinutes: null as number | null, // e.g. 40
  ages: 'About 5–10 years',
  groupSize: null as string | null,
};

export const kidsZoomConfigured = () =>
  KIDS_ZOOM_PLANS.monthly.price != null && KIDS_ZOOM_PLANS.yearly.price != null;

export function formatKidsPrice(amount: number, currency = KIDS_ZOOM_CURRENCY): string {
  try {
    return new Intl.NumberFormat('en', {
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
