/**
 * Pricing logic based on geographical regions (Purchasing Power Parity - PPP)
 */

interface RegionPricing {
  currency: string;
  symbol: string;
  multiplier: number; // Multplier against base USD price
}

const REGION_MAP: Record<string, RegionPricing> = {
  'IN': { currency: 'INR', symbol: '₹', multiplier: 60 }, // approx 300 INR for 5 USD base
  'US': { currency: 'USD', symbol: '$', multiplier: 1 },
  'GB': { currency: 'GBP', symbol: '£', multiplier: 0.8 },
  'EU': { currency: 'EUR', symbol: '€', multiplier: 0.9 },
  'DEFAULT': { currency: 'USD', symbol: '$', multiplier: 1 }
};

export function getRegionalPrice(baseUSD: number) {
  // Simple heuristic for region detection
  // In a production app, we would use a GeoIP service or user settings
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let regionCode = 'US';

  if (timeZone.includes('Asia/Kolkata') || timeZone.includes('Calcutta')) {
    regionCode = 'IN';
  } else if (timeZone.includes('Europe/London')) {
    regionCode = 'GB';
  } else if (timeZone.includes('Europe')) {
    regionCode = 'EU';
  }

  const region = REGION_MAP[regionCode] || REGION_MAP['DEFAULT'];
  const price = Math.round(baseUSD * region.multiplier);

  return {
    formatted: `${region.symbol}${price}`,
    amount: price,
    currency: region.currency,
    regionCode
  };
}

export function getWhatsAppLink(trackTitle: string, duration?: string) {
  const phone = '918217581238'; // Verified support number
  const message = encodeURIComponent(
    `Namaste! I am interested in an extended version of the track "${trackTitle}". 
I would like a version that is ${duration || '___'} hours long. 
Please guide me on the next steps for this custom MP3.`
  );
  return `https://wa.me/${phone}?text=${message}`;
}
