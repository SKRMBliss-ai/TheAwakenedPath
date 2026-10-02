/*
  THE NARRATION DIRECTOR.

  Gemini TTS has no rate, pitch or SSML controls; the only way to shape a
  performance is the natural-language direction placed before the text. So
  this module reads the passage (and what came just before it) and writes a
  short direction for one consistent storyteller: Enceladus, fully voiced,
  warm and confident, with pace and energy that follow the scene.

  Every direction is one block that ends in a colon, with the passage after
  it. Context is framed as "for your understanding only" so it is not read.
*/

const BASE =
    'Read this as a warm, confident children\'s storyteller, like a professional audiobook narrator. ' +
    'Keep the voice fully voiced, at a normal, clear speaking volume the whole way through, even in the gentlest moments. ' +
    'Use natural rises and falls in pace, emphasis and energy across the whole passage rather than reading sentence by sentence, ' +
    'and let important moments breathe with short pauses. Keep the tone friendly, reassuring and expressive, suitable for young children.';

const MODES = {
    warm: 'Tell it in a relaxed, friendly storytelling pace with gentle, natural emphasis.',
    wonder: 'Bring warmth and curiosity, a little slower than usual, with a sense of discovery and gentle emphasis on the magical details. Stay fully voiced.',
    playful: 'Brighten the energy and pick up the pace, with bouncy rhythm, clear articulation and a smile in the voice.',
    suspense: 'Slow slightly before the reveal and use controlled pauses and focused emphasis to build anticipation, the feeling of "what happens next?". Stay warm and reassuring, like sharing an exciting secret with the listener.',
    action: 'Move faster with energetic, rhythmic delivery and strong emphasis on the action words, keeping every word crisp and clear.',
    tender: 'Warm the delivery and slow a little, with gentler emotional intensity. Gentler means kinder, not quieter.',
    mysterious: 'Use an intrigued, curious tone with measured pacing and a few well-placed pauses, like inviting the child to wonder along. Keep it friendly and fully voiced.',
    bedtime: 'Settle into a calm, steady, reassuring pace, like a parent reading comfortably beside the bed, every word clearly spoken.',
};

const CUES = [
    ['bedtime', /\b(sleep|asleep|bed|goodnight|good night|dream|yawn|blanket|pillow|tuck|the end|rest(ed|ing)? now|night-?light)\b/i],
    ['action', /\b(ran|run|running|raced|race|jump(ed)?|leapt|leap|dash(ed)?|zoom(ed)?|crash(ed)?|chase[ds]?|quick|hurr(y|ied)|faster|splash(ed)?|tumbl(ed|ing))\b|!.*!/i],
    ['suspense', /\b(slowly|creak(ed)?|suddenly|wait(ed)?|behind|door|what was|who was|something (moved|was)|held (his|her|their) breath|closer|peek(ed)?|reveal)\b|\?\s*$/i],
    ['wonder', /\b(sparkl|glow(ed|ing)?|shimmer|magic|twinkl|star(s|light)?|lantern|wonder|amaz|golden|light spilled|bloom(ed)?|rainbow|firefl)/i],
    ['tender', /\b(hug(ged)?|sorry|miss(ed)?|tears?|cr(y|ied)|lonely|alone|sad|kind(ly)?|gently|hand in|friend(ship)?|love[ds]?|forgave|together again|held)\b/i],
    ['playful', /\b(giggl|laugh|silly|funny|wiggl|bounc|tickl|game|play(ed|ing)?|hooray|yay|wobbl|squeak)/i],
    ['mysterious', /\b(mystery|secret|strange|odd|puzzle|clue|hidden|map|riddle|curious)\b/i],
];

/** Picks the mode with the most cues in the passage; 0 hits means no opinion. */
function detectMode(passage) {
    const text = String(passage || '');
    let best = null;
    let bestHits = 0;
    for (const [mode, re] of CUES) {
        const hits = (text.match(new RegExp(re.source, 'gi')) || []).length;
        if (hits > bestHits) { best = mode; bestHits = hits; }
    }
    return best;
}

const quote = (s, n) => {
    const t = String(s || '').replace(/\s+/g, ' ').trim();
    return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

/**
 * buildNarrationDirection(storyContext, currentPassage)
 *
 * storyContext: { title?, previous?, next?, mode?, dialogue? }
 *   mode     forces a mode (e.g. 'bedtime' for an ending)
 *   previous the passage just read, so this one continues its mood
 *   next     the passage coming up, so the ending can lead into it
 *
 * Returns { mode, direction }.
 */
function buildNarrationDirection(storyContext = {}, currentPassage = '') {
    const ctx = storyContext || {};
    const own = detectMode(currentPassage);
    const before = detectMode(ctx.previous);
    /* A passage with no strong cue of its own carries on in the mood of the one
       before it, so a new chunk never resets to a generic neutral read. */
    const mode = MODES[ctx.mode] ? ctx.mode : own || before || 'warm';

    const parts = [BASE, MODES[mode]];
    if (/["“”]/.test(currentPassage)) {
        parts.push('For the characters\' lines, shift rhythm, attitude and energy a little so each one is distinct, keeping them natural and friendly rather than cartoonish; it is still one storyteller telling the whole story.');
    }
    const context = [];
    if (ctx.title) context.push(`this is part of "${quote(ctx.title, 80)}"`);
    if (ctx.previous) {
        context.push(`the part just read was "${quote(ctx.previous, 160)}"`);
        if (before && before !== mode) context.push(`which was ${before === 'warm' ? 'calm' : before}, so ease naturally from that into this`);
        else context.push('so continue in the same voice, energy and pace without restarting');
    }
    if (ctx.next) context.push('the story carries on after this, so do not wind down as if it is the very end');
    if (context.length) parts.push(`For your understanding only, not to be read aloud: ${context.join(', ')}.`);
    parts.push('Now read the following passage aloud:');
    return { mode, direction: parts.join(' ') };
}

const FORBIDDEN = /\b(whisper(ed|ing|s)?|breathy|hush(ed)?|asmr|eerie|creepy)\b/i;

/* Not even to forbid them: naming a delivery in the prompt can pull the
   model towards it, so these words must never appear in a direction. */
function asksForForbiddenDelivery(direction) {
    return FORBIDDEN.test(String(direction));
}

module.exports = { buildNarrationDirection, detectMode, asksForForbiddenDelivery, MODES };
