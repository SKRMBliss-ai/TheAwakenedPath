import type { Pattern, StrengthId } from './types';

/**
 * The coach: reads a person's planned response to a situation.
 *
 * Two layers, deliberately separate:
 *  1. MARKERS — computed on the device from the person's own words. Instant,
 *     private, and the basis of the progress view. They are things a steadier
 *     response tends to contain, not a grade of the person.
 *  2. AI WORDING — optional and only when the person asks. Their words go to
 *     the app's own backend (/api/witness → Gemini) and come back as a
 *     suggested rewrite. If that fails, an on-device suggestion is used.
 */

export type MarkerId = 'feeling' | 'owns' | 'pause' | 'no-blame' | 'need';

export const MARKERS: { id: MarkerId; label: string; hint: string; strength: StrengthId }[] = [
  { id: 'feeling', label: 'Names a feeling', hint: 'Say what you felt — “I felt hurt”, “I was anxious”.', strength: 'awareness' },
  { id: 'owns', label: 'Speaks for yourself', hint: 'Start from “I” rather than “you”.', strength: 'perspective' },
  { id: 'pause', label: 'Takes a pause', hint: 'Give yourself a beat — “Let me think about that.”', strength: 'pausing' },
  { id: 'no-blame', label: 'No blame words', hint: 'Swap “you always / you never” for what actually happened.', strength: 'self-compassion' },
  { id: 'need', label: 'Asks for something', hint: 'End with what you need — “Can we…?”, “I’d like…”.', strength: 'letting-go' },
];

const FEELING = /\b(feel|felt|feeling|hurt|angry|anxious|worried|scared|afraid|sad|upset|frustrated|overwhelmed|embarrassed|ashamed|disappointed|nervous|tense|stressed|uneasy|lonely|annoyed)\b/i;
const OWNS = /\b(i|i'm|i’m|i’d|i'd|i’ll|i'll|my|me)\b/i;
const PAUSE = /\b(pause|breathe|breath|take a moment|a moment|let me think|give me a (minute|moment)|step back|calm|slow down|think about (it|that)|get back to you|sleep on it|before i (respond|answer|reply|react))\b/i;
const BLAME = /\b(you always|you never|your fault|because of you|you made me|you should|you're so|you’re so|stupid|idiot|ridiculous|how dare|shut up)\b/i;
const NEED = /\b(can we|could we|could you|would you|i need|i'd like|i’d like|i would like|i want to ask|please|let's|let’s|would it be ok|is it ok if|my request)\b/i;

/** Which markers a response contains. */
export function markersOf(text: string): MarkerId[] {
  const t = text.trim();
  if (!t) return [];
  const out: MarkerId[] = [];
  if (FEELING.test(t)) out.push('feeling');
  if (OWNS.test(t) && !/^\s*you\b/i.test(t)) out.push('owns');
  if (PAUSE.test(t)) out.push('pause');
  if (!BLAME.test(t)) out.push('no-blame');
  if (NEED.test(t)) out.push('need');
  return out;
}

/** The first marker a response is missing, in the order that helps most. */
export function nextMarker(have: MarkerId[]): MarkerId | null {
  for (const id of ['pause', 'feeling', 'owns', 'need', 'no-blame'] as MarkerId[]) {
    if (!have.includes(id)) return id;
  }
  return null;
}

function clip(s: string, n = 70): string {
  const t = s.trim().replace(/\s+/g, ' ');
  return t.length > n ? t.slice(0, n - 1).replace(/[\s,.;:]+\S*$/, '') + '…' : t;
}

/**
 * A steadier version built only from what the person already told us:
 * a pause, their own feeling word, the event in their words, and a request.
 * Used instantly, and as the fallback if the AI is unavailable.
 */
export function deviceSuggestion(pattern: Pattern | undefined, response: string): string {
  const feeling = pattern?.feeling?.trim() ? clip(pattern.feeling, 40).toLowerCase() : '';
  const event = pattern?.event?.trim() ? clip(pattern.event, 80) : '';
  const parts: string[] = ['Let me take a moment before I answer.'];
  if (event && feeling) parts.push(`When ${event.charAt(0).toLowerCase() + event.slice(1).replace(/[.!?]+$/, '')}, I felt ${feeling}.`);
  else if (feeling) parts.push(`I’m feeling ${feeling}.`);
  else if (event) parts.push(`About what happened — ${event.charAt(0).toLowerCase() + event.slice(1).replace(/[.!?]+$/, '')} — I’d like to talk it through.`);
  const have = markersOf(response);
  parts.push(have.includes('need') ? 'I’d like us to find a way that works for both of us.' : 'Can we find a way that works for both of us?');
  return parts.join(' ');
}

export interface CoachReply {
  better: string;
  why: string;
  source: 'ai' | 'device';
}

const API_BASE = 'https://awakened-path-2026.web.app';

/** Ask the AI for a steadier wording. Never throws; falls back on-device. */
export async function askCoach(opts: { pattern?: Pattern; response: string }): Promise<CoachReply> {
  const { pattern, response } = opts;
  const fallback: CoachReply = {
    better: deviceSuggestion(pattern, response),
    why: 'A pause, your own feeling, and one clear request — the three things a steadier reply usually has.',
    source: 'device',
  };
  const situation = pattern
    ? [
        pattern.event && `What happened: ${pattern.event}`,
        pattern.thought && `What their mind said: ${pattern.thought}`,
        pattern.feeling && `What they felt: ${pattern.feeling}`,
        pattern.urge && `What they wanted to do: ${pattern.urge}`,
      ].filter(Boolean).join('\n')
    : '';
  const thought = [
    'You are a warm, practical counsellor. A person is practising how to respond to a hard situation.',
    situation && `The situation:\n${situation}`,
    `Their planned response:\n"${response.trim()}"`,
    'Reply with exactly two lines and nothing else.',
    'Line 1 starts with "BETTER:" — a rewrite of THEIR planned response in first person, calm, honest and kind to both sides, under 45 words.',
    'Line 2 starts with "WHY:" — one short sentence on what changed and why it helps.',
  ].filter(Boolean).join('\n\n');

  try {
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), 30000);
    const res = await fetch(`${API_BASE}/api/witness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought }),
      signal: ctl.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) return fallback;
    const data = (await res.json()) as { reflection?: string };
    const text = data.reflection ?? '';
    const better = /BETTER:\s*([\s\S]*?)(?:\n\s*WHY:|$)/i.exec(text)?.[1]?.trim().replace(/^["“]|["”]$/g, '');
    const why = /WHY:\s*([\s\S]*)$/i.exec(text)?.[1]?.trim();
    if (!better) return fallback;
    return { better, why: why || fallback.why, source: 'ai' };
  } catch {
    return fallback;
  }
}

/** One paragraph of counsel for today, from the person's own recent history. */
export async function askDailyCounsel(summary: string): Promise<string | null> {
  const thought = [
    'You are a warm daily counsellor for a mind-training app. Read this short summary of a person\'s recent practice and write 3 sentences:',
    'one noticing what is going well, one gentle thing to work on next, one small action for today. Plain language, no diagnosis, no lists.',
    `Summary:\n${summary}`,
  ].join('\n\n');
  try {
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), 30000);
    const res = await fetch(`${API_BASE}/api/witness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought }),
      signal: ctl.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { reflection?: string };
    return data.reflection?.trim() || null;
  } catch {
    return null;
  }
}

/** Average marker count of the newest `n` responses vs the `n` before them. */
export function trendOf(counts: number[], n = 3): { latest: number; before: number; delta: number } | null {
  // counts is newest-first
  if (counts.length < n * 2) return null;
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const latest = avg(counts.slice(0, n));
  const before = avg(counts.slice(n, n * 2));
  return { latest, before, delta: latest - before };
}
