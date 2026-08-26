import { cellForWord } from '../../data/emotionMatrix';

/**
 * The Love / Fear lens.
 *
 * Beneath every emotion is one of two roots: love (which opens, connects, trusts)
 * or fear (which contracts, defends, separates). The teaching is not that fear is
 * wrong — it is that both are always available, and awareness lets you choose
 * again. This module estimates the lean from the named emotions and holds the
 * copy for the choice and its gentle reframe.
 */

export type Polarity = 'love' | 'fear' | 'neutral';

/**
 * Estimate the love/fear lean from the emotions the person named. Uses the
 * emotion matrix's pleasantness axis — pleasant feelings open (love), unpleasant
 * ones contract (fear) — as a first read the person then confirms or overrides.
 */
export function deriveLoveFear(emotions: string[]): Polarity {
  const cells = emotions.map(cellForWord).filter(Boolean) as { pleasantness: number }[];
  if (!cells.length) return 'neutral';
  const avg = cells.reduce((a, c) => a + c.pleasantness, 0) / cells.length;
  if (avg >= 3.5) return 'love';
  if (avg <= 2.5) return 'fear';
  return 'neutral';
}

/** A reframe that never shames the fear — it just opens the other door. */
export function loveReframe(polarity: Polarity): string {
  if (polarity === 'fear')
    return 'Fear is not wrong — it is simply the other choice. If you met this exact moment from love instead, what would you do differently?';
  if (polarity === 'love')
    return 'This came from love. Notice how it feels in the body — open, warm, unhurried. This is your natural state; you can return to it.';
  return 'Underneath this is either love or fear. Which one, if you look honestly? And which would you rather choose now?';
}

export const POLARITY_META: Record<Polarity, { label: string; color: string; note: string }> = {
  love: { label: 'Love', color: '#E8B04B', note: 'opens · connects · trusts' },
  neutral: { label: 'Neutral', color: '#B9A5B7', note: 'the quiet middle' },
  fear: { label: 'Fear', color: '#7EA6E0', note: 'contracts · defends · separates' },
};

// ── Aggregate a stretch of entries into a single "where am I living" balance ──
export interface VibrationBalance {
  love: number;
  fear: number;
  neutral: number;
  total: number;
  /** −1 (all fear) … +1 (all love). */
  balance: number;
}

export function vibrationOf(polarities: (Polarity | undefined | null)[]): VibrationBalance {
  let love = 0, fear = 0, neutral = 0;
  for (const p of polarities) {
    if (p === 'love') love++;
    else if (p === 'fear') fear++;
    else if (p === 'neutral') neutral++;
  }
  const total = love + fear + neutral;
  const balance = total ? (love - fear) / total : 0;
  return { love, fear, neutral, total, balance };
}

/** A warm, encouraging word for where the balance sits — never a rank. */
export function vibrationWord(balance: number): string {
  if (balance >= 0.5) return 'Living mostly in love';
  if (balance >= 0.15) return 'Leaning toward love';
  if (balance > -0.15) return 'Love and fear, in balance';
  if (balance > -0.5) return 'Fear has been close — and love is one choice away';
  return 'A tender stretch — be gentle; love is always available';
}
