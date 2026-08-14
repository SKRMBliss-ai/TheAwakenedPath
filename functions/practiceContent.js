/**
 * Daily Practice — the slice the weekly letter needs.
 *
 * CANONICAL SOURCE: src/features/practice/practiceContent.ts. That file holds the
 * full content (invocations, seven prayers and seven practice ideas per virtue);
 * this is a deliberately small mirror, because functions/ is a separate CommonJS
 * package and cannot import the app's TypeScript.
 *
 * What must not drift is PRACTICE_EPOCH and the ORDER of VIRTUE_NAMES — those two
 * decide which virtue a given date lands on. If Friday's letter names a different
 * virtue from the one the room is sitting with, it is because these two fell out
 * of step with the canonical file. The descriptions are prose: if they drift, the
 * letter merely reads differently, nothing breaks.
 */

/** Mon 17 Aug 2026, UTC. Must equal PRACTICE_EPOCH in practiceContent.ts. */
const PRACTICE_EPOCH = Date.UTC(2026, 7, 17);

/** Order must match VIRTUES in practiceContent.ts. */
const VIRTUES = [
    { name: 'Sincerity', desc: 'the alignment of your inner state with your outer expression — saying what you mean, meaning what you say, and living without the gap between the two' },
    { name: 'Commitment', desc: 'continuing to do what you said you would do, long after the mood that made the vow has passed' },
    { name: 'Patience', desc: 'remaining steady while life unfolds on its own timeline, without forcing it onto yours' },
    { name: 'Acceptance', desc: 'meeting what is actually here — not what should be here — without immediate resistance or the need to change it' },
    { name: 'Tolerance', desc: 'the ability to remain open and non-reactive in the presence of what is different, difficult, or disagreeable' },
    { name: 'Caring', desc: 'giving your genuine attention and warmth to another without the need for them to deserve it first' },
    { name: 'Gentleness', desc: 'handling what is fragile — including people, including yourself — with care and without force' },
    { name: 'Graciousness', desc: 'receiving and giving with openness, warmth, and ease — without awkwardness, resentment, or keeping score' },
    { name: 'Detachment', desc: 'engaging fully with life while remaining free from the compulsion to control its outcome or possess its fruits' },
];

/**
 * The virtue for a given date.
 *
 * The letter goes out on Friday evening US Eastern, which is already Saturday in
 * IST — still inside the same Mon-anchored virtue week either way, so the letter
 * names the virtue the week has been sitting with rather than jumping ahead.
 */
function virtueForDate(date = new Date()) {
    const d = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const dayNumber = Math.max(0, Math.round((d - PRACTICE_EPOCH) / 86400000));
    const weekIndex = Math.floor(dayNumber / 7);
    const virtue = VIRTUES[weekIndex % VIRTUES.length];
    return {
        name: virtue.name,
        desc: virtue.desc,
        /** 1-based position in the nine-week cycle. */
        week: (weekIndex % VIRTUES.length) + 1,
        totalWeeks: VIRTUES.length,
        /** True before the cycle opens — the letter then invites without naming a week. */
        beforeStart: d < PRACTICE_EPOCH,
    };
}

module.exports = { PRACTICE_EPOCH, VIRTUES, virtueForDate };
