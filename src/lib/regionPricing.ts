/**
 * Which currency to show a visitor, guessed on the device (no network call).
 *
 * India is detected by timezone, because many Indian browsers report an
 * en-US or en-GB locale. Everyone else by the region subtag of their browser
 * languages. Anything unlisted is USD, which is also what the payment
 * functions fall back to (see resolvePwywAmount in functions/index.js).
 *
 * The same logic lives inline in EmotionFeelingsCourse.tsx, the PremiumPaywall
 * and priceService; new code should use this one.
 */
export type RegionCurrency = 'INR' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'SGD' | 'AED';

const REGION_TO_CURRENCY: Record<string, RegionCurrency> = {
  IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', AE: 'AED', SG: 'SGD',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR',
  PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR',
};

export const CURRENCY_SYMBOL: Record<RegionCurrency, string> = {
  INR: '₹', USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$', SGD: 'S$', AED: 'AED ',
};

export function detectRegionCurrency(): RegionCurrency {
  try {
    if (typeof window === 'undefined') return 'USD';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const l of langs) {
      const region = (l || '').split('-').pop()?.toUpperCase();
      const cur = region ? REGION_TO_CURRENCY[region] : undefined;
      if (cur) return cur;
    }
  } catch { /* fall through to USD */ }
  return 'USD';
}

export function formatPrice(amount: number, currency: RegionCurrency): string {
  const whole = Number.isInteger(amount);
  const n = whole ? amount.toLocaleString('en') : amount.toFixed(2);
  return `${CURRENCY_SYMBOL[currency]}${n}`;
}
