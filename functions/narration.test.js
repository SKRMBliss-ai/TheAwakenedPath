const test = require('node:test');
const assert = require('node:assert');
const { buildNarrationDirection, asksForForbiddenDelivery } = require('./narration');

const CASES = [
    {
        name: 'quiet magical discovery',
        context: { title: 'The Lantern Fox', previous: 'Mia pushed the long grass aside and stepped into the clearing.' },
        passage: 'There, in the middle of the clearing, a tiny lantern was glowing all by itself. Its golden light shimmered across the dewy grass like scattered stars.',
        expect: 'wonder',
    },
    {
        name: 'suspense before a reveal',
        context: { title: 'The Lantern Fox', previous: 'Something rustled behind the old oak tree.', next: 'Out stepped a small red fox, holding a map.' },
        passage: 'Mia waited. The rustling came closer, and closer. Slowly, a pair of bright eyes peeked out from behind the tree. Who was it?',
        expect: 'suspense',
    },
    {
        name: 'fast playful action',
        context: { title: 'The Lantern Fox', previous: 'The fox grinned and flicked its tail.' },
        passage: 'Then they raced down the hill! They jumped over puddles and splashed through the stream, laughing all the way. Faster and faster they ran!',
        expect: 'action',
    },
    {
        name: 'tender emotional scene',
        context: { title: 'The Lantern Fox', previous: 'The fox sat down quietly and looked at the ground.' },
        passage: '"I miss my family," said the little fox. Mia sat down beside him and gently held his paw. "You are not alone," she said kindly. "We will find them together."',
        expect: 'tender',
    },
    {
        name: 'calm bedtime ending',
        context: { title: 'The Lantern Fox', previous: 'The fox curled up beside his family at last.', mode: 'bedtime' },
        passage: 'Mia walked home under the stars, warm and happy. She climbed into bed, pulled up her blanket, and fell fast asleep. The end.',
        expect: 'bedtime',
    },
];

for (const c of CASES) {
    test(c.name, () => {
        const { mode, direction } = buildNarrationDirection(c.context, c.passage);
        console.log(`\n── ${c.name} → ${mode}\n${direction}\n\n${c.passage}\n`);
        assert.strictEqual(mode, c.expect);
        assert.ok(!asksForForbiddenDelivery(direction), `forbidden delivery word in: ${direction}`);
        assert.ok(direction.endsWith(':'), 'direction must end in a colon so the passage follows it');
    });
}

test('a passage with no cues carries on the mood of the one before', () => {
    const { mode, direction } = buildNarrationDirection(
        { previous: 'The stars began to sparkle and glow over the magic lake.' },
        'Mia stood very still and looked up.',
    );
    assert.strictEqual(mode, 'wonder');
    assert.match(direction, /continue in the same voice/);
});

test('the guide and mind directions in index.js never ask for a forbidden delivery', () => {
    const src = require('fs').readFileSync(require('path').join(__dirname, 'index.js'), 'utf8');
    const block = src.slice(src.indexOf('const MIND_DIRECTION'), src.indexOf('function mindTone'));
    assert.ok(block.length > 100);
    assert.ok(!asksForForbiddenDelivery(block), 'MIND/GUIDE/MIND_TONES must not mention whispering or similar');
});
