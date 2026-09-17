/**
 * THE TEACHING MOVES DOCUMENT IS THE SOURCE OF TRUTH.
 *
 * Chirpy's teaching lines used to be eighteen hand-transcribed objects in
 * kit/teachings.ts. That made the markdown a thing somebody had copied FROM
 * once, which is the worst of both worlds: the founder edits the document, the
 * app carries on saying the old words, and nothing anywhere reports the drift.
 * Adding a nineteenth move meant editing TypeScript.
 *
 * So this reads MIND_GYM_TEACHING_MOVES.md and produces the same shape the app
 * already consumes. Write a new `## 19 · …` section with a `### The move`
 * under it and Chirpy starts saying it — no code change, no build step to
 * remember (see the Vite plugin in vite.config.ts, which watches the file).
 *
 * WHAT IT READS, and it is all structure the document already uses:
 *
 *   ## 7 · Feelings pass                     → id (slug of the title), title
 *   ### The move — an experiment · ages 3–8  → kind, band
 *   > **"Spoken line."**                     → dialogue, in order
 *   > *(ten seconds of a quiet screen)*      → the pause, and how long it is
 *
 * Everything before the pause is what Chirpy says going in; everything after
 * it is the payoff. That split is the whole grammar of a trapdoor, and the
 * document already writes it that way — including across the "Then, only
 * after they've felt it:" break, where the payoff resumes in a second
 * blockquote.
 *
 * Sections with no pause (the borrowed images) are simply all opening lines:
 * they ask the child to do nothing, so there is nothing to wait for.
 *
 * IT REFUSES TO BE QUIET ABOUT A SECTION IT CANNOT READ. A parser that skips
 * what it does not understand would mean a move the founder has written, and
 * believes is live, that no child ever meets. Anything numbered that has no
 * readable move comes back in `problems`, and the build fails on it.
 */

/** "3 · You are the one noticing" → "you-are-the-one-noticing" */
function slug(title) {
  return title
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

const KINDS = {
  'a trapdoor': 'trapdoor',
  'an experiment': 'experiment',
  'a borrowed image': 'image',
  /* §18's own name for itself. It is something the child goes and does, which
     is an experiment in everything but the word. */
  'a secret game': 'experiment',
};

const BANDS = {
  'ages 3–8': 'young',
  'ages 3-8': 'young',
  'ages 9–14': 'older',
  'ages 9-14': 'older',
};

const WORD_SECONDS = {
  three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, twelve: 12, fifteen: 15, twenty: 20, thirty: 30,
};

/**
 * How long to hold the screen, read out of the stage direction itself.
 *
 * "(ten seconds of a quiet screen)" is an instruction to the app as much as a
 * note to a reader, so it is worth obeying literally. A direction that names
 * no duration ("a pause, then something mildly silly happens") gets the
 * default: long enough to fail at not-laughing, short enough that a child
 * doesn't think it has hung.
 */
const DEFAULT_HOLD = 7;
function holdFrom(direction) {
  const digits = direction.match(/(\d+)\s*second/i);
  if (digits) return Math.min(60, Number(digits[1]));
  for (const [word, n] of Object.entries(WORD_SECONDS)) {
    if (new RegExp(`\\b${word}\\s+second`, 'i').test(direction)) return n;
  }
  return DEFAULT_HOLD;
}

/**
 * `> **"Line."**` → `Line.`  ·  `> *(a pause)*` → stage direction
 *
 * ONLY BLOCKQUOTES. Everything Chirpy says is quoted in the document, and the
 * prose around it is written for an adult — the heading itself, and connective
 * asides like "Then, only after they've felt it:". Reading unquoted lines put
 * both of those in his mouth.
 */
function readQuoteLine(raw) {
  if (!/^\s*>/.test(raw)) return null;
  const line = raw.replace(/^\s*>\s?/, '').trim();
  if (!line) return null;
  const staged = line.match(/^\*\((.+)\)\*$/);
  if (staged) return { kind: 'pause', text: staged[1].trim() };
  const spoken = line
    .replace(/^\*\*(.*)\*\*$/s, '$1')
    .replace(/^[“"](.*)[”"]$/s, '$1')
    .trim();
  return spoken ? { kind: 'say', text: spoken } : null;
}

/**
 * Optional staging the prose cannot express, written in the document as its
 * own bold key so it stays readable as a document:
 *
 *   **Dare:** Absolutely no laughing.
 *   **Button:** I'm ready
 *
 * Neither is required. Without them a trapdoor uses its own first line as the
 * thing held on screen, which is what the app did before any of this existed.
 */
/**
 * A stage direction is one of two different things and they are not
 * interchangeable.
 *
 *   *(ten seconds of a quiet screen)*   → a PAUSE. The app waits.
 *   *(child answers — and children…)*   → a TURN. The child supplies words,
 *                                          and the trapdoor only springs
 *                                          because they answered FIRST.
 *
 * §14 is the second kind, and the document calls it "the strongest single move
 * in the app". Reading it as a timer turns the best thing in here into seven
 * seconds of dead air.
 */
function directionWantsAnswer(direction) {
  return /\b(child|they)\b[^.]*\b(answers?|says?|replies|tells)\b/i.test(direction);
}

function readStaging(body) {
  const replies = body.match(/^\*\*Replies:\*\*\s*(.+)$/mi);
  const dare = body.match(/^\*\*Dare:\*\*\s*(.+)$/mi);
  const button = body.match(/^\*\*Button:\*\*\s*(.+)$/mi);
  const hold = body.match(/^\*\*Hold:\*\*\s*(\d+)/mi);
  return {
    dare: dare ? dare[1].trim() : undefined,
    go: button ? button[1].trim() : undefined,
    hold: hold ? Number(hold[1]) : undefined,
    /* Semicolons rather than commas: these are whole sentences a child might
       say to a friend, and several of them contain commas. */
    replies: replies ? replies[1].split(';').map((r) => r.trim()).filter(Boolean) : undefined,
  };
}

export function parseTeachingMoves(markdown) {
  const teachings = [];
  /**
   * Numbered sections that are not moves.
   *
   * §18 is the document's own exception — "when a child arrives already upset,
   * none of the above applies" — followed by the short lines to use instead of
   * teaching. It has no `### The move` because it is not one, and its lines
   * are the most important in the file. They come back here rather than being
   * dropped, and rather than being reported as a fault.
   */
  const asides = [];
  const problems = [];

  /* Numbered sections only. "The rule everything here follows" and "Writing
     rules for anyone adding to this" are notes to the author, not moves. */
  const sections = markdown.split(/^## /m).slice(1);

  for (const section of sections) {
    const heading = section.slice(0, section.indexOf('\n')).trim();
    const numbered = heading.match(/^(\d+)\s*·\s*(.+)$/);
    if (!numbered) continue;
    const [, number, title] = numbered;

    const moveAt = section.search(/^### The move\b/m);
    if (moveAt === -1) {
      /* No move, but it still speaks: an aside like §18. Kept, named in the
         build log, and never silently swallowed — if a new section lands here
         by accident the founder sees it listed as an aside rather than as a
         teaching and knows the `### The move` heading is missing. */
      const spoken = section.split('\n').map(readQuoteLine).filter(Boolean)
        .filter((part) => part.kind === 'say').map((part) => part.text);
      if (spoken.length) {
        asides.push({ id: slug(title), number: Number(number), title, lines: spoken });
      } else {
        problems.push(`§${number} "${title}" has no "### The move" heading and nothing in quotes, so nothing can be said.`);
      }
      continue;
    }

    /* The move runs to the next ### or the end of the section. Everything
       after it — "Why this one works", "What we no longer say" — is written
       for an adult reading the document and must never reach a child. */
    const rest = section.slice(moveAt);
    const moveHeading = rest.slice(0, rest.indexOf('\n')).trim();
    const nextHeading = rest.slice(moveHeading.length).search(/^### /m);
    const body = nextHeading === -1 ? rest : rest.slice(0, moveHeading.length + nextHeading);

    const kindWord = moveHeading.match(/—\s*(a[n]? [a-z ]+?)(?:\s*·|$)/i);
    const kind = kindWord ? KINDS[kindWord[1].trim().toLowerCase()] : undefined;
    if (!kind) {
      problems.push(`§${number} "${title}": "${moveHeading}" names no move I know. Use a trapdoor, an experiment, a borrowed image or a secret game.`);
      continue;
    }

    let bandValue;
    for (const [phrase, value] of Object.entries(BANDS)) {
      if (moveHeading.includes(phrase)) { bandValue = value; break; }
    }
    /* "ages 3–8 and 9–14" names both, so it belongs to everybody — and it
       contains "ages 3–8", which the loop above would otherwise have caught. */
    if (/and\s*9[–-]14/.test(moveHeading) || /both bands/i.test(moveHeading)) bandValue = undefined;

    const parts = body.split('\n').map(readQuoteLine).filter(Boolean);
    const pauseAt = parts.findIndex((p) => p.kind === 'pause');
    const said = (from, to) => parts.slice(from, to).filter((p) => p.kind === 'say').map((p) => p.text);

    const open = pauseAt === -1 ? said(0) : said(0, pauseAt);
    const land = pauseAt === -1 ? [] : said(pauseAt + 1);

    if (!open.length) {
      problems.push(`§${number} "${title}": the move has no spoken lines. Chirpy needs at least one > **"…"** to say.`);
      continue;
    }

    const staging = readStaging(body);
    const waits = pauseAt !== -1;
    const asksFirst = waits && directionWantsAnswer(parts[pauseAt].text);

    if (asksFirst && !staging.replies) {
      problems.push(`§${number} "${title}" waits for the child's own answer, so it needs a "**Replies:** …" line — warm answers separated by semicolons. There must be no unkind option: the point is that the child is already kind and has never aimed it at themselves.`);
      continue;
    }

    /* The question itself is the last thing said before the child answers, so
       it moves out of `open` and becomes the ask. */
    const openLines = asksFirst ? open.slice(0, -1) : open;
    const ask = asksFirst ? open[open.length - 1] : undefined;

    teachings.push({
      id: slug(title),
      number: Number(number),
      title,
      kind,
      ...(bandValue ? { band: bandValue } : {}),
      open: openLines.length ? openLines : open,
      ...(asksFirst ? { pick: { ask, replies: staging.replies } } : {}),
      ...(waits && !asksFirst ? { dare: staging.dare ?? open[open.length - 1] } : {}),
      ...(waits && !asksFirst ? { go: staging.go ?? 'I’m ready' } : {}),
      ...(waits && !asksFirst ? { hold: staging.hold ?? holdFrom(parts[pauseAt].text) } : {}),
      land,
    });
  }

  if (!teachings.length) problems.push('No teaching moves found at all — has the document moved?');
  return { teachings, asides, problems };
}
