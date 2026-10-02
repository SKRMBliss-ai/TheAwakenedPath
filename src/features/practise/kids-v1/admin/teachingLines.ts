import { VIRTUE_ROOMS, roomLineId, type RoomLine, type VirtueRoom } from '../best/rooms';
import { AFFIRMATIONS, affirmationId } from '../kit/affirmations';
import { POSSIBILITIES, THEME_GUIDANCE, possibilityId, type Theme } from '../kit/storyLabContent';
import { THEMES, type LiveText } from '../kit/liveContent';
import type { ReflectionTag } from '../../../kids/store';

/*
  EVERY TEACHING LINE A CHILD CAN MEET, with a stable id the app looks
  changes up by (see roomText, liveAffirmations and possibilityLines).

  Chirpy's eighteen teaching moves from MIND_GYM_TEACHING_MOVES.md are not
  here on purpose: they only ever appeared on the old hub, which the home page
  replaced, so changing them would change nothing a child sees.
*/

export type LineGroup = 'rooms' | 'affirmations' | 'another';

export interface TeachingLine {
  id: string;
  group: LineGroup;
  /** Which room, affirmation set or theme it belongs to. */
  section: string;
  where: string;
  base: string;
  text: string;
  changed: boolean;
  added: boolean;
  /** Changed against an older version of the built-in line, so the change no longer applies. */
  stale: boolean;
  guide: string;
}

export const GROUPS: { id: LineGroup; title: string; blurb: string }[] = [
  { id: 'rooms', title: 'Room cards', blurb: 'What each of the seven rooms says: Chirpy’s welcome, the evening question, the “learn” card and what Chirpy says when a firefly goes in the jar.' },
  { id: 'affirmations', title: 'Chirpy’s kind words', blurb: 'Said when a child taps the explorer on the home page. One at random, never the same twice in a row.' },
  { id: 'another', title: '“Another way” lines', blurb: 'Step 6 of the Story Lab: gentle other ways to see what happened, chosen by what the child’s thought was about.' },
];

const ROOM_FIELDS: { line: RoomLine; where: string; guide: string }[] = [
  { line: 'tagline', where: 'Chirpy’s welcome as you walk in', guide: 'Chirpy’s one-line welcome as a child walks into the room. Playful and a little surprising; never a lesson.' },
  { line: 'prompt', where: 'The evening question', guide: 'A yes-or-no question a child answers about their day. Easy to answer honestly; concrete; no judgement either way.' },
  { line: 'weekendPrompt', where: 'The weekend question', guide: 'The same yes-or-no question for a day without school. Concrete and answerable at home.' },
  { line: 'learnTitle', where: '“Learn” card title', guide: 'The title of a small, surprising idea about this virtue. Short and intriguing, like a headline a child wants to read.' },
  { line: 'learnBody', where: '“Learn” card', guide: 'A small surprising idea told to a 7-year-old in two or three short sentences. No “you should”; no moral at the end.' },
  { line: 'caughtLine', where: 'When the firefly goes in the jar', guide: 'Chirpy’s reaction after the child says yes to the room’s question. An observation about the thing itself, never praise for being good.' },
];

export const AFFIRMATION_SETS: Record<ReflectionTag, string> = {
  brave: 'Brave', calm: 'Calm', kind: 'Kind', belonging: 'Belonging', try_again: 'Trying again', other: 'Everything else',
};
const AFFIRMATION_GUIDE = 'A first-person line a child says to themselves. Believable on a hard day, in a child’s own words; no grand claims.';

export const THEME_NAMES: Record<Theme, string> = {
  rejection: 'Being left out', failure: 'Mistakes', unfairness: 'Unfairness', uncertainty: 'Not knowing',
  loss: 'Losing something', conflict: 'Arguments', pressure: 'Pressure', comparison: 'Comparing', bright: 'Good things',
};
const ANOTHER_GUIDE = 'A gentle other way to see an upsetting moment, offered after the child has said what happened. A possibility, not a correction (“maybe…”); never dismisses the feeling.';

function roomBase(room: VirtueRoom, l: RoomLine): string | undefined {
  switch (l) {
    case 'tagline': return room.tagline;
    case 'prompt': return room.prompt;
    case 'weekendPrompt': return room.weekendPrompt;
    case 'learnTitle': return room.learn.title;
    case 'learnBody': return room.learn.body;
    case 'caughtLine': return room.caughtLine;
  }
}

function line(texts: Record<string, LiveText>, id: string, base: string): Pick<TeachingLine, 'text' | 'changed' | 'stale'> {
  const t = texts[id];
  if (!t) return { text: base, changed: false, stale: false };
  if (t.original !== base) return { text: base, changed: false, stale: true };
  return { text: t.text, changed: true, stale: false };
}

export function teachingLines(texts: Record<string, LiveText>): TeachingLine[] {
  const out: TeachingLine[] = [];

  for (const room of VIRTUE_ROOMS) {
    for (const f of ROOM_FIELDS) {
      const base = roomBase(room, f.line);
      if (!base) continue;
      const id = roomLineId(room.id, f.line);
      out.push({ id, group: 'rooms', section: room.name, where: `${room.name} · ${f.where}`, base, guide: f.guide, added: false, ...line(texts, id, base) });
    }
  }

  for (const tag of Object.keys(AFFIRMATIONS) as ReflectionTag[]) {
    AFFIRMATIONS[tag].forEach((base, i) => {
      const id = affirmationId(tag, i);
      out.push({ id, group: 'affirmations', section: AFFIRMATION_SETS[tag], where: `Kind words · ${AFFIRMATION_SETS[tag]}`, base, guide: AFFIRMATION_GUIDE, added: false, ...line(texts, id, base) });
    });
  }

  for (const theme of THEMES) {
    POSSIBILITIES[theme].forEach((o, i) => {
      const id = possibilityId(theme, i);
      out.push({ id, group: 'another', section: THEME_NAMES[theme], where: `Another way · ${THEME_NAMES[theme]}`, base: o.text, guide: `${ANOTHER_GUIDE} This set is for thoughts about: ${THEME_GUIDANCE[theme].whatItCaptures}`, added: false, ...line(texts, id, o.text) });
    });
  }

  for (const t of Object.values(texts)) {
    if (t.original !== '') continue;
    const added = { id: t.id, base: '', text: t.text, changed: false, added: true, stale: false };
    if (t.id.startsWith('affirm:new:')) {
      out.push({ ...added, group: 'affirmations', section: 'Added here', where: 'Kind words · added here', guide: AFFIRMATION_GUIDE });
      continue;
    }
    const theme = /^another:([a-z]+):new:/.exec(t.id)?.[1] as Theme | undefined;
    if (theme && THEMES.includes(theme)) {
      out.push({ ...added, group: 'another', section: THEME_NAMES[theme], where: `Another way · ${THEME_NAMES[theme]} · added here`, guide: ANOTHER_GUIDE });
    }
  }
  return out;
}
