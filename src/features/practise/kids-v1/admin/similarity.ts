/*
  "IS THERE ALREADY A THOUGHT LIKE THIS?"

  Lexical, not an AI: it runs instantly on every keystroke over a few thousand
  lines, offline. It is smart in the ways that matter for short sentences a
  child might think: contractions are expanded ("can't" = "can not"), word
  endings are trimmed ("likes" = "like"), everyday synonyms meet ("no one" =
  "nobody", "mad" = "angry"), the little words that every thought shares are
  ignored, and letter-trigrams catch typos and near-spellings.
*/

const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bwon['’]t\b/g, 'will not'], [/\bcan['’]t\b/g, 'can not'], [/\bcannot\b/g, 'can not'], [/n['’]t\b/g, ' not'],
  [/['’]m\b/g, ' am'], [/['’]re\b/g, ' are'], [/['’]ll\b/g, ' will'], [/['’]ve\b/g, ' have'],
  [/['’]d\b/g, ' would'], [/['’]s\b/g, ''],
];

const PHRASES: Array<[RegExp, string]> = [
  [/\bno one\b/g, 'nobody'], [/\bno-one\b/g, 'nobody'], [/\bnot anyone\b/g, 'nobody'],
  [/\bevery one\b/g, 'everyone'], [/\bleft out\b/g, 'leftout'], [/\bnot fair\b/g, 'unfair'],
  [/\bnot good enough\b/g, 'notgoodenough'], [/\bmess(ed)? up\b/g, 'mistake'],
];

const SYNONYMS: Record<string, string> = {
  everybody: 'everyone', anybody: 'anyone',
  mad: 'angry', cross: 'angry', furious: 'angry', annoyed: 'angry', grumpy: 'angry',
  afraid: 'scared', frightened: 'scared', terrified: 'scared', scary: 'scared', fear: 'scared',
  upset: 'sad', unhappy: 'sad', miserable: 'sad', cry: 'sad', crying: 'sad',
  nervous: 'worried', anxious: 'worried', worry: 'worried',
  glad: 'happy', joyful: 'happy', cheerful: 'happy',
  mom: 'mum', mommy: 'mum', mummy: 'mum', mother: 'mum', father: 'dad', daddy: 'dad',
  stupid: 'dumb', idiot: 'dumb',
  kid: 'child', kids: 'child', children: 'child',
  mate: 'friend', buddy: 'friend', pal: 'friend',
  wrong: 'mistake', fail: 'mistake', failed: 'mistake',
  class: 'school', classroom: 'school',
  huge: 'big', tiny: 'small', little: 'small',
  adore: 'love',
};

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'about', 'from', 'by', 'as',
  'i', 'me', 'my', 'myself', 'we', 'us', 'our', 'you', 'your', 'it', 'its', 'this', 'that', 'these', 'those',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'so', 'just', 'really', 'very',
  'will', 'would', 'can', 'could', 'should', 'have', 'has', 'had', 'there', 'then', 'than', 'too', 'what',
  'if', 'when', 'all', 'some', 'any', 'one', 'get', 'got', 'now', 'today', 'oh', 'maybe',
]);

export function normalise(text: string): string {
  let t = text.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  for (const [re, to] of CONTRACTIONS) t = t.replace(re, to);
  t = t.replace(/[^a-z0-9' -]+/g, ' ').replace(/'/g, '');
  for (const [re, to] of PHRASES) t = t.replace(re, to);
  return t.replace(/\s+/g, ' ').trim();
}

function stem(word: string): string {
  let w = word;
  if (w.length > 4 && /(ied|ies)$/.test(w)) w = `${w.slice(0, -3)}y`;
  else if (w.length > 4 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 3 && w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('es') && !w.endsWith('ses')) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

function canon(word: string): string {
  return stem(SYNONYMS[word] ?? SYNONYMS[stem(word)] ?? word);
}

/** The words that carry the meaning, in their canonical form. */
export function keywords(text: string): string[] {
  return [...new Set(normalise(text).split(' ').filter((w) => w && !STOP.has(w)).map(canon))];
}

function trigrams(text: string): Set<string> {
  const t = `  ${normalise(text)} `;
  const out = new Set<string>();
  for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3));
  return out;
}

const dice = <T,>(a: Set<T>, b: Set<T>): number => {
  if (!a.size && !b.size) return 0;
  let both = 0;
  for (const x of a) if (b.has(x)) both++;
  return (2 * both) / (a.size + b.size);
};

/** 0 to 1: how close two short sentences are in meaning and wording. */
export function similarity(a: string, b: string): number {
  if (normalise(a) === normalise(b)) return 1;
  const ka = new Set(keywords(a));
  const kb = new Set(keywords(b));
  const words = ka.size && kb.size ? dice(ka, kb) : 0;
  return Math.min(1, 0.6 * words + 0.4 * dice(trigrams(a), trigrams(b)));
}

export interface Match<T> { item: T; score: number }

/** The closest existing lines to a draft, best first. */
export function similarTo<T>(draft: string, items: readonly T[], text: (item: T) => string, min = 0.5, max = 6): Match<T>[] {
  if (keywords(draft).length === 0 && normalise(draft).length < 4) return [];
  return items
    .map((item) => ({ item, score: similarity(draft, text(item)) }))
    .filter((m) => m.score >= min)
    .sort((x, y) => y.score - x.score)
    .slice(0, max);
}

/** Letters added, dropped, changed or swapped to get from one word to the other. */
function typos(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/**
 * Search as you type. Every word of the query has to find a home — as a word,
 * the start of a word, a synonym or a near-spelling — and closer homes rank
 * higher.
 */
export function searchScore(query: string, text: string): number {
  const q = normalise(query).split(' ').filter(Boolean);
  if (!q.length) return 0;
  const words = normalise(text).split(' ').filter(Boolean);
  const canonWords = words.map(canon);
  let total = 0;
  for (const raw of q) {
    const c = canon(raw);
    let best = 0;
    words.forEach((w, i) => {
      if (w === raw || canonWords[i] === c) best = Math.max(best, 1);
      else if (raw.length >= 2 && w.startsWith(raw)) best = Math.max(best, 0.85);
      else if (raw.length >= 4) {
        const near = dice(trigrams(raw), trigrams(w));
        if (near >= 0.6 || (raw.length >= 5 && typos(raw, w) <= (raw.length >= 8 ? 2 : 1))) best = Math.max(best, 0.3 + 0.5 * near);
      }
    });
    if (!best) return 0;
    total += best;
  }
  return total / q.length;
}

export function search<T>(query: string, items: readonly T[], text: (item: T) => string): Match<T>[] {
  if (!normalise(query)) return [];
  return items
    .map((item) => ({ item, score: searchScore(query, text(item)) }))
    .filter((m) => m.score > 0)
    .sort((x, y) => y.score - x.score);
}

export function closeness(score: number): string {
  if (score >= 0.85) return 'Almost the same';
  if (score >= 0.6) return 'Similar';
  return 'A bit like it';
}
