/**
 * THE THING CHIRPY IS WORRIED ABOUT.
 *
 * He had no spine. Episodes, yes — a knot the child helps him with, a
 * confession inside the deep dive, and now a memory of things they told him —
 * but nothing he WANTS across the whole thing. Every companion that has ever
 * landed with children wants something for the length of the story and you
 * find it out slowly: that slow finding-out is most of what makes a character
 * feel like a person rather than a mascot with dialogue.
 *
 * So Chirpy is quietly frightened that he isn't actually any good at helping.
 *
 * WHY THAT FEAR AND NOT ANOTHER. It had to be small, true and childlike, and
 * it had to be something a six-year-old recognises in themselves — every
 * child who has ever tried to cheer up a friend has wondered whether they
 * made it worse. It also inverts the relationship the same way HelpChirpy
 * does, which is the best thing this app already does: the child ends up
 * reassuring the helper.
 *
 * THE ONE I REJECTED, deliberately: "I'm afraid you'll stop coming." It is
 * the obvious choice and it is a retention dark pattern wearing a beak. A
 * child who believes a character will be sad if they don't open an app has
 * been handed an obligation, and this app does not do that to children.
 *
 * IT IS NOT A QUEST. There is no task, no progress bar, nothing to collect,
 * no reward at the end, and nothing anywhere tells the child this is
 * happening. He mentions things occasionally, weeks apart, and eventually he
 * says the real one. The child does nothing except keep turning up. The
 * payoff is that they know him — which is the only payoff this kind of story
 * has ever needed.
 *
 * IT ENDS. Seven beats and then it is over for good, and he never brings it
 * up again. A worry a character keeps restating isn't a character, it's a
 * loop, and children notice loops fast.
 */

const KEY = 'mindgym.kidsv1.chirpyArc';

/**
 * Days between beats, minimum. Deliberately slow: six clues at three days
 * apart is a fortnight and a half at the very fastest, and realistically a
 * couple of months, because a child does not open this every single day. That
 * pace is the point — it should feel like getting to know somebody rather
 * than reading a script.
 */
const REST_DAYS = 3;

/**
 * The clues, in order. None of them asks the child anything, none is a puzzle,
 * and each is written so a child could read it as Chirpy just being Chirpy —
 * the pattern is only visible looking back, which is how you actually notice
 * this about a friend.
 */
const CLUES = [
  'Do you ever wonder if you’re any good at your job? No reason.',
  'I looked up how to be helpful last night. There’s a lot of it.',
  'I keep a list of things I’ve said. Some of them aren’t very good.',
  'Last week I told someone their feeling was probably fine. I still don’t know if it was.',
  'Sometimes you go quiet after I say something, and I count the seconds.',
  'I’m not actually trained for any of this, you know. I just turn up.',
];

/** The one he's been circling. */
const REVEAL =
  'Can I tell you the actual thing? I worry I’m not really helping. That you’d be doing all of this just as well on your own, and I’m only… here.';

/**
 * What the child can say back. All three are true answers and none is the
 * right one — including the one that admits doubt, which a child should be
 * allowed to give to a friend without the app treating it as a wrong button.
 */
export const REPLIES = [
  'You do help.',
  'I like that you’re here.',
  'I don’t know. But I’d rather you came.',
];

/** How he takes each of them. Never argues, never corrects, never explains. */
const TAKES: Record<string, string> = {
  'You do help.': 'Oh. Right. I’m going to keep that one.',
  'I like that you’re here.': 'That’s… actually better than what I was hoping for.',
  'I don’t know. But I’d rather you came.': 'That’s fair. I’d rather come, too.',
};

/**
 * Much later, once, he mentions it again — not to reopen it, but the way
 * people do when something somebody said has quietly stayed with them. This
 * is the whole reason the answer is stored at all.
 */
const CALLBACK_AFTER_DAYS = 30;

export interface ArcBeat {
  kind: 'clue' | 'reveal' | 'callback';
  line: string;
}

interface Arc {
  /** 0–5 clues, 6 the reveal, 7 done. */
  stage?: number;
  /** ISO day of the last beat, for the rest interval. */
  last?: string;
  /** What the child said back, kept for the callback. */
  answer?: string;
  /** ISO day they said it. */
  answeredOn?: string;
  /** Whether the late callback has already happened. */
  calledBack?: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000,
  );
}

function read(): Arc {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Arc) : {};
  } catch { return {}; }
}

function write(a: Arc): void {
  try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* storage off — he keeps it to himself */ }
}

/**
 * What he'd say today, or null — which is most days.
 *
 * READ-ONLY. Nothing is recorded until the child has actually seen the beat,
 * so a hub that mounts and unmounts while they navigate can't burn three
 * clues in an evening. See `beatShown`.
 */
export function arcBeatForToday(): ArcBeat | null {
  const a = read();
  const stage = a.stage ?? 0;
  const t = today();

  if (a.last && daysBetween(a.last, t) < REST_DAYS) return null;

  if (stage < CLUES.length) return { kind: 'clue', line: CLUES[stage] };
  if (stage === CLUES.length) return { kind: 'reveal', line: REVEAL };

  // Done — apart from the one late callback.
  if (!a.calledBack && a.answer && a.answeredOn && daysBetween(a.answeredOn, t) >= CALLBACK_AFTER_DAYS) {
    return {
      kind: 'callback',
      line: `I was thinking about when you said “${a.answer}”. No reason. Just was.`,
    };
  }
  return null;
}

/** The child has seen a clue or the callback. Moves him on. */
export function beatShown(kind: ArcBeat['kind']): void {
  const a = read();
  if (kind === 'callback') { write({ ...a, calledBack: true, last: today() }); return; }
  if (kind === 'clue') { write({ ...a, stage: (a.stage ?? 0) + 1, last: today() }); }
  // The reveal doesn't advance on being SEEN — only on being answered, so a
  // child who closes the app mid-sentence gets asked again rather than
  // silently losing the one moment the whole arc was built for.
}

/** They said something back. Ends the arc and keeps their words. */
export function answerReveal(reply: string): string {
  const a = read();
  write({
    ...a,
    stage: CLUES.length + 1,
    last: today(),
    answer: reply,
    answeredOn: today(),
  });
  return TAKES[reply] ?? 'I’m going to keep that one.';
}
