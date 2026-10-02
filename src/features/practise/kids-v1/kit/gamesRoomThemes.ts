import type { BehaviourPillar } from '../../../../assets/mind-gym-180-balanced-behaviour-scenarios';
import { ROOM_PILLARS } from './behaviourPractice';

/**
 * WHICH PRACTICE THE GAMES ROOM OFFERS, AND WHY IT IS NOT A DIAGNOSIS.
 *
 * A child usually arrives through a door — Be Kind, Tell the Truth — and that
 * door decides, full stop. ROOM_PILLARS in behaviourPractice is that mapping
 * and it is the one that wins; nothing here overrides it. This file only
 * answers the other case: somebody walks in without having picked a theme.
 *
 * Then, and only then, the feeling they named this morning tips the choice.
 * The affinity below is from the asset pack's
 * config/games_room_theme_map.json, translated into this repo's own pillar
 * ids — the pack calls them be_honest and say_good_things, the repo calls the
 * same two Tell the Truth and Make Good Choices, and the repo's names are the
 * ones painted on the doors a child has already read.
 *
 * WHAT THIS MUST NEVER BECOME. A feeling is not a verdict on a child, and a
 * list like this is one careless step away from reading as one: sad children
 * get the loneliness games, angry children get the honesty games. So it tips
 * a choice and nothing else. Nothing downstream is told which feeling picked
 * the theme, the room never mentions it, and a feeling that is not listed
 * simply gets the whole set — which is also what happens on any day nobody
 * has said anything at all.
 */
export type GamesTheme = BehaviourPillar;

const EVERY: GamesTheme[] = [
  'BeKind', 'TellTheTruth', 'MakeGoodChoices',
  'IncludeEveryone', 'TakeCareOfMyBody', 'HelpOthers',
];

/**
 * Feeling → the themes that tend to have something to say to it.
 *
 * Keyed on the ids the Feelings Room stores (see kit/todaysFeeling). Edit
 * freely: it is a starter affinity, as the pack's own note says, not a
 * clinical rule, and being wrong here costs a child nothing worse than a
 * game about honesty on a day they felt left out.
 */
export const THEME_AFFINITY: Readonly<Record<string, GamesTheme[]>> = {
  happy:       ['BeKind', 'MakeGoodChoices', 'HelpOthers'],
  excited:     ['TakeCareOfMyBody', 'BeKind', 'HelpOthers'],
  calm:        ['BeKind', 'HelpOthers', 'IncludeEveryone'],
  sad:         ['IncludeEveryone', 'HelpOthers', 'BeKind'],
  angry:       ['TellTheTruth', 'MakeGoodChoices', 'BeKind'],
  worried:     ['TellTheTruth', 'TakeCareOfMyBody', 'HelpOthers'],
  scared:      ['TellTheTruth', 'HelpOthers', 'TakeCareOfMyBody'],
  jealous:     ['IncludeEveryone', 'BeKind', 'TellTheTruth'],
  embarrassed: ['BeKind', 'MakeGoodChoices', 'IncludeEveryone'],
};

/** The themes worth offering today. The whole set when nothing is known. */
export function themesForFeeling(feeling: string | null | undefined): GamesTheme[] {
  const key = (feeling ?? '').trim().toLowerCase();
  return THEME_AFFINITY[key] ?? EVERY;
}

/**
 * One theme to practise.
 *
 * `avoid` is the theme just played, so "try another game" actually moves —
 * with only three or six candidates, a plain random pick repeats itself often
 * enough that a child would notice and conclude the button is broken.
 */
export function themeForFeeling(
  feeling: string | null | undefined,
  avoid?: GamesTheme | null,
  random: () => number = Math.random,
): GamesTheme {
  const pool = themesForFeeling(feeling).filter(t => t !== avoid);
  const from = pool.length ? pool : EVERY.filter(t => t !== avoid);
  return from[Math.min(from.length - 1, Math.floor(Math.max(0, random()) * from.length))];
}

/** The virtue-room id a theme belongs to, for awarding its points. */
export function roomIdForTheme(theme: GamesTheme): string {
  const found = Object.entries(ROOM_PILLARS).find(([, pillar]) => pillar === theme);
  return found ? found[0] : 'kind';
}
