import { create } from 'zustand';
import type { AgeBand, SafetyRouting, Theme } from './storyLabContent';
import {
  BEHAVIOUR_PILLARS, CATEGORISED_SCENARIOS, type BehaviourPillar, type PillarScenario,
} from '../../../../assets/mind-gym-180-balanced-behaviour-scenarios';
import { MAX_PAGES, MAX_PAGE_TEXT, type ParentStory } from '../../../kids/delight';

/*
  WHAT THE ADMIN PAGES HAVE ADDED OR CHANGED, shared by every child.

  The server side is functions/index.js `kidsContent`; the network side is
  kit/liveContentApi. This file is only the store and the rules for reading
  it, so the pure content modules (storyLabContent, the Games Room's
  scenarios, the rooms) can consult it without pulling Firebase in.

  Everything from the server is checked here before the app uses it: a
  malformed document must cost a child one missing thought, never a crash.
*/

export type LiveKind = 'story' | 'feeling' | 'thought' | 'game' | 'text';

export interface LiveItem {
  kind: LiveKind;
  id: string;
  data: Record<string, unknown>;
  updatedAt: number | null;
  updatedBy: string | null;
}

export const THEMES = [
  'rejection', 'failure', 'unfairness', 'uncertainty', 'loss', 'conflict', 'pressure', 'comparison', 'bright',
] as const satisfies readonly Theme[];
export const AGE_BANDS = ['3-5', '6-8', '9-11', '12-14'] as const satisfies readonly AgeBand[];
export const PILLARS = Object.keys(BEHAVIOUR_PILLARS) as BehaviourPillar[];
/** The Feelings Crew who comment on a Games Room question, as the 180 built-in ones use them. */
export const CREW = ['sunny', 'willow', 'pip', 'fizz', 'coco', 'sage', 'ember', 'lull'] as const;

/** Which room each pillar's games are played in — the inverse of behaviourPractice's ROOM_PILLARS. */
const ROOM_FOR_PILLAR: Record<BehaviourPillar, string> = {
  BeKind: 'kind', TellTheTruth: 'truth', MakeGoodChoices: 'choices',
  IncludeEveryone: 'include', TakeCareOfMyBody: 'body', HelpOthers: 'help',
};

export interface LiveFeeling {
  id: string;
  label: string;
  hue: number;
  /** A pleasant feeling, like Happy. */
  ok: boolean;
  minAge?: number;
  /** Where its thoughts lead in the Story Lab when a thought has no theme of its own. */
  theme: Theme;
}

export interface LiveThought {
  id: string;
  /** A feeling id: one of the built-in ones (worried, bored…) or an added feeling. */
  feeling: string;
  text: string;
  icon: string;
  ageBand?: AgeBand;
  theme?: Theme;
  safety: SafetyRouting;
}

export type LiveGame = PillarScenario & {
  minAge?: number;
  maxAge?: number;
  /** Set on a built-in question to take it out of the Games Room. */
  hidden?: boolean;
};

/** A changed teaching line, or an added one (original ''). */
export interface LiveText { id: string; text: string; original: string }

interface Derived {
  stories: ParentStory[];
  feelings: LiveFeeling[];
  thoughts: LiveThought[];
  games: LiveGame[];
  texts: Record<string, LiveText>;
}

interface LiveState extends Derived {
  items: LiveItem[];
  /** cached: from this device's last copy; ready: fresh from the server; offline: never reached it. */
  status: 'empty' | 'cached' | 'ready' | 'offline';
}

const CACHE_KEY = 'mindgym.kidsv1.live';

type Data = Record<string, unknown>;
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown, min: number, max: number): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : undefined;
const oneOf = <T extends string>(v: unknown, list: readonly T[]): T | undefined =>
  (list as readonly unknown[]).includes(v) ? (v as T) : undefined;
const list = (v: unknown): Data[] => (Array.isArray(v) ? v.filter((x): x is Data => !!x && typeof x === 'object') : []);

function storyFrom(id: string, d: Data): ParentStory {
  const week = typeof d.week === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.week) ? d.week : undefined;
  return {
    id,
    title: str(d.title, 80),
    cover: str(d.cover, 8) || '📖',
    color: typeof d.color === 'string' && /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#ffd86b',
    keepsake: '',
    chapters: list(d.chapters).slice(0, 7).map((ch) => ({
      title: str(ch.title, 60),
      pages: list(ch.pages).slice(0, MAX_PAGES).map((p) => ({ scene: str(p.scene, 24), text: str(p.text, MAX_PAGE_TEXT) })),
    })),
    week,
  };
}

function feelingFrom(id: string, d: Data): LiveFeeling | null {
  const label = str(d.label, 24);
  if (!label || !/^[a-z][a-z0-9-]{0,30}$/.test(id)) return null;
  return {
    id, label,
    hue: num(d.hue, 0, 360) ?? 200,
    ok: d.ok === true,
    minAge: num(d.minAge, 3, 14),
    theme: oneOf(d.theme, THEMES) ?? 'uncertainty',
  };
}

function thoughtFrom(id: string, d: Data): LiveThought | null {
  const text = str(d.text, 160);
  const feeling = str(d.feeling, 32).toLowerCase();
  if (!text || !feeling) return null;
  return {
    id, feeling, text,
    icon: str(d.icon, 8) || '☁',
    ageBand: oneOf(d.ageBand, AGE_BANDS),
    theme: oneOf(d.theme, THEMES),
    safety: d.safety === 'adult-support' ? 'adult-support' : 'routine',
  };
}

function gameFrom(id: string, d: Data): LiveGame | null {
  const pillar = oneOf(d.pillar, PILLARS);
  if (!pillar) return null;
  const choices = list(d.choices).slice(0, 4).map((c) => ({
    emoji: str(c.emoji, 8) || '💬',
    label: str(c.label, 60),
    points: num(c.points, 0, 30) ?? 5,
    best: c.best === true ? true : undefined,
    response: str(c.response, 300),
  })).filter((c) => c.label && c.response);
  const game: LiveGame = {
    id, pillar,
    behaviour: ROOM_FOR_PILLAR[pillar],
    world: BEHAVIOUR_PILLARS[pillar].title,
    title: str(d.title, 60),
    setup: str(d.setup, 300),
    reactions: list(d.reactions).slice(0, 4)
      .map((r) => ({ who: oneOf(r.who, CREW) ?? 'sunny', line: str(r.line, 140) }))
      .filter((r) => r.line),
    choices,
    minAge: num(d.minAge, 3, 14),
    maxAge: num(d.maxAge, 3, 14),
    hidden: d.hidden === true || undefined,
  };
  if (game.hidden) return game;
  return game.title && game.setup && choices.length >= 2 && choices.some((c) => c.best) ? game : null;
}

function derive(items: readonly LiveItem[]): Derived {
  const out: Derived = { stories: [], feelings: [], thoughts: [], games: [], texts: {} };
  for (const it of items) {
    const d = it.data;
    if (it.kind === 'story') out.stories.push(storyFrom(it.id, d));
    else if (it.kind === 'feeling') { const f = feelingFrom(it.id, d); if (f) out.feelings.push(f); }
    else if (it.kind === 'thought') { const t = thoughtFrom(it.id, d); if (t) out.thoughts.push(t); }
    else if (it.kind === 'game') { const g = gameFrom(it.id, d); if (g) out.games.push(g); }
    else if (it.kind === 'text') {
      const text = str(d.text, 600);
      if (text) out.texts[it.id] = { id: it.id, text, original: typeof d.original === 'string' ? d.original : '' };
    }
  }
  return out;
}

/** Only well-formed rows survive; anything else from the network is dropped here. */
export function cleanItems(raw: unknown): LiveItem[] {
  if (!Array.isArray(raw)) return [];
  const kinds: readonly LiveKind[] = ['story', 'feeling', 'thought', 'game', 'text'];
  return raw.flatMap((x): LiveItem[] => {
    if (!x || typeof x !== 'object') return [];
    const r = x as Data;
    const kind = oneOf(r.kind, kinds);
    const id = typeof r.id === 'string' ? r.id : '';
    if (!kind || !id || !r.data || typeof r.data !== 'object' || Array.isArray(r.data)) return [];
    return [{
      kind, id, data: r.data as Data,
      updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : null,
      updatedBy: typeof r.updatedBy === 'string' ? r.updatedBy : null,
    }];
  });
}

function fromCache(): LiveState {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const items = raw ? cleanItems((JSON.parse(raw) as { items?: unknown }).items) : [];
    return { items, ...derive(items), status: items.length ? 'cached' : 'empty' };
  } catch {
    return { items: [], ...derive([]), status: 'empty' };
  }
}

export const useLiveContent = create<LiveState>(() => fromCache());

/** Replace everything (a fresh load) or apply one change, and keep this device's copy in step. */
export function setLiveItems(items: LiveItem[], status: LiveState['status'] = 'ready'): void {
  useLiveContent.setState({ items, ...derive(items), status });
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items })); } catch { /* storage off: the app still has it in memory */ }
}

export function upsertLiveItem(item: LiveItem): void {
  const { items, status } = useLiveContent.getState();
  const rest = items.filter((x) => !(x.kind === item.kind && x.id === item.id));
  setLiveItems([...rest, item], status);
}

export function removeLiveItem(kind: LiveKind, id: string): void {
  const { items, status } = useLiveContent.getState();
  setLiveItems(items.filter((x) => !(x.kind === kind && x.id === id)), status);
}

/* ── Reading it ───────────────────────────────────────────────────────────── */

/**
 * A teaching line as the app should say it. A change only applies while the
 * built-in line is still the one it was written against, so editing the line
 * in the code can never make an old change land on a different sentence.
 */
export function liveText(id: string, base: string, texts: Record<string, LiveText> = useLiveContent.getState().texts): string {
  const t = texts[id];
  return t && t.original === base ? t.text : base;
}

/** Lines added (rather than changed) under an id prefix, e.g. every new affirmation. */
export function addedLines(prefix: string, texts: Record<string, LiveText> = useLiveContent.getState().texts): LiveText[] {
  return Object.values(texts).filter((t) => t.id.startsWith(prefix) && t.original === '');
}

/** Normalised feeling id for a label a child picked ("Worried" -> "worried"). */
export function feelingId(feeling: string | undefined): string {
  return (feeling ?? '').trim().toLowerCase();
}

const BUILT_IN_GAME_IDS = new Set(CATEGORISED_SCENARIOS.map((s) => s.id));

/** The Games Room's questions for one room, with admin changes, hidden ones and new ones applied. */
export function withLiveGames(pillar: BehaviourPillar, age: number | undefined, base: PillarScenario[]): PillarScenario[] {
  const games = useLiveContent.getState().games;
  if (!games.length) return base;
  const byId = new Map(games.map((g) => [g.id, g]));
  const builtIn = base
    .filter((s) => !byId.get(s.id)?.hidden)
    .map((s) => byId.get(s.id) ?? s);
  const fits = (g: LiveGame) => age === undefined
    || ((g.minAge === undefined || age >= g.minAge) && (g.maxAge === undefined || age <= g.maxAge));
  const added = games.filter((g) => !g.hidden && g.pillar === pillar && !BUILT_IN_GAME_IDS.has(g.id) && fits(g));
  const merged = [...builtIn, ...added];
  return merged.length ? merged : base;
}
