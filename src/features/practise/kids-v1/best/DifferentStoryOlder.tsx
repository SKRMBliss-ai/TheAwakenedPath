import { useState } from 'react';
import { motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { MicButton } from '../ui/MicButton';
import { useMotion } from '../ui/quiet';
import { LitCard, StepHead, UnderNote } from '../ui/trail';
import { type StoryCase } from '../kit/differentStory';
import * as sound from '../kit/sound';

/**
 * THE DIFFERENT STORY ROOM, FOR 9–14.
 *
 * §10 and §11 of the founder's document each have two moves, and the room was
 * running the 3–8 one for everybody: sort the pre-written bits into two piles,
 * then turn over four pre-written alternatives. That version is good and it is
 * right for a six-year-old, who cannot be asked to write four sentences and
 * for whom a physical sorting game IS the thinking.
 *
 * For a thirteen-year-old it is a tapping exercise with the answers already
 * in it. The document's own 9–14 moves are completely different in shape, and
 * both of them turn on the child PRODUCING something:
 *
 *   §10  "Write down what happened, exactly as a security camera would have
 *         recorded it. No feelings, no reasons, no 'obviously'. Now write down
 *         everything else you know about it. That second list is longer,
 *         isn't it."
 *   §11  "Your mind picked a story in about a tenth of a second and then
 *         stopped looking. Find two more that fit everything you actually
 *         know. Not nicer ones — just ones that also fit."
 *
 * THE ASYMMETRY IS THE WHOLE OF §10 AT THIS AGE, and it cannot be handed over
 * pre-made. A child who is given two lists learns that the app thinks one is
 * longer. A child who writes both and then looks at them has found it, and
 * the finding is theirs. So this room says nothing about which list is longer
 * until the child has written both — and then it says what is actually true
 * of what they wrote, including on the occasions when it is not longer.
 *
 * EVERYTHING CAN BE SPOKEN RATHER THAN TYPED. Four text fields on a phone is
 * a genuinely heavy ask, and the app already has speech-to-text where the
 * browser supports it. The mic is beside every box for that reason and not as
 * a flourish.
 *
 * AND NOBODY IS EVER STUCK. §11 wants the child to generate the alternatives,
 * and a blank box with no way past it would stop the exercise dead for a child
 * who cannot think of one — which teaches them that they are bad at this. The
 * room's own suggestions are behind a "can't think of any", offered as a
 * prompt rather than as the answer, and taking them is not a failure.
 */
export function DifferentStoryOlder({
  kase,
  accent,
  tints,
  onCarry,
}: {
  kase: StoryCase;
  accent: string;
  tints: readonly string[];
  /** Called with the account the child decides to take out of the room. */
  onCarry: (account: string) => void;
}) {
  const m = useMotion();

  const [camera, setCamera] = useState('');
  const [added, setAdded] = useState('');
  /** Both lists submitted — the asymmetry can be looked at. */
  const [compared, setCompared] = useState(false);
  const [mine, setMine] = useState<string[]>(['', '']);
  const [stuck, setStuck] = useState(false);
  const [locked, setLocked] = useState(false);

  const wrote = (t: string) => t.trim().length > 0;
  const bothWritten = wrote(camera) && wrote(added);

  /* Words rather than characters. "They walked past me and said nothing" is a
     longer THOUGHT than "they hate me", and a comparison by string length
     would call the short bitter one the shorter list, which is backwards. */
  const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
  const secondIsLonger = words(added) > words(camera);

  const suggestions = kase.others;
  const offered = mine.filter(wrote);
  const enough = offered.length >= 2 || (stuck && offered.length >= 1);

  return (
    <>
      {/* ── 1 · What a camera got ─────────────────────────────────────── */}
      <StepHead n={1} tint={tints[0]} label="As a security camera saw it" />
      <UnderNote>No feelings, no reasons, no “obviously”. Only what it recorded.</UnderNote>
      <Box
        value={camera}
        onChange={setCamera}
        placeholder="What the camera got…"
        accent={tints[0]}
        locked={compared}
      />

      {/* ── 2 · Everything else you know ──────────────────────────────── */}
      {wrote(camera) && (
        <>
          <StepHead n={2} tint={tints[1]} label="Now everything else you know about it" />
          <Box
            value={added}
            onChange={setAdded}
                placeholder="Everything else…"
            accent={tints[1]}
            locked={compared}
          />
        </>
      )}

      {bothWritten && !compared && (
        <button
          onClick={() => { sound.play('roomCard'); setCompared(true); }}
          className="ml-3 rounded-full px-4 py-3 text-[14px] font-extrabold"
          style={{
            minHeight: m.target,
            background: `${accent}1F`,
            border: `1.5px solid ${accent}`,
            color: CHROME.text,
          }}
        >
          Put them side by side
        </button>
      )}

      {/* ── 3 · The thing they just found ─────────────────────────────
          Said only after both lists exist, and it says what is TRUE of the
          two they actually wrote. The document's line is "that second list is
          longer, isn't it" — which is usually right and is not always, and an
          app that asserts it either way has stopped looking at the child and
          started reciting. */}
      {compared && (
        <LitCard n={3} tint={tints[2]} label={secondIsLonger ? 'Look at that' : 'Have a look'}>
          {secondIsLonger
            ? 'That second list is longer, isn’t it. That’s the bit your mind made. It might be right — but it’s a different kind of thing from the first list.'
            : 'Shorter than I expected, that second one. Either way: the first list is what happened, and the second is what your mind made of it. Both allowed. Different kinds of thing.'}
        </LitCard>
      )}

      {/* ── 4 · Two more that fit ─────────────────────────────────────── */}
      {compared && (
        <>
          <StepHead n={4} tint={tints[3]} label="Find two more that fit" />
          <UnderNote>
            Not nicer ones. Ones that also fit everything on your first list. Your mind picked its
            one in about a tenth of a second and then stopped looking.
          </UnderNote>

          {[0, 1].map((i) => (
            <Box
              key={i}
              value={mine[i]}
              onChange={(t) => setMine((v) => v.map((x, j) => (j === i ? t : x)))}
                    placeholder={i === 0 ? 'Another one that fits…' : 'And one more…'}
              accent={tints[3]}
              locked={locked}
            />
          ))}

          {!stuck && !locked && (
            <button
              onClick={() => { sound.play('tap'); setStuck(true); }}
              className="ml-3 text-left text-[12.5px] font-bold"
              style={{ color: CHROME.textSoft, minHeight: 36 }}
            >
              Can’t think of any
            </button>
          )}

          {/* Offered as a nudge, never as the answer — see the note above. */}
          {stuck && (
            <div className="ml-3 flex flex-col gap-1.5">
              <UnderNote>Some that would fit. Borrow one if it helps, or ignore them.</UnderNote>
              {suggestions.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    sound.play('tap');
                    setMine((v) => {
                      const slot = v.findIndex((x) => !wrote(x));
                      return slot < 0 ? v : v.map((x, j) => (j === slot ? o : x));
                    });
                  }}
                  className="rounded-[16px] px-3.5 py-2.5 text-left text-[13.5px] font-bold leading-snug"
                  style={{
                    minHeight: m.target,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${tints[3]}55`,
                    color: CHROME.text,
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 5 · Which are you taking ──────────────────────────────────
          Their own sentences, and their mind's original, all looking the
          same. Taking the mind's one is a complete answer — the room has no
          preference and records nothing about which. */}
      {compared && enough && !locked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34 }}
          className="flex flex-col gap-2"
        >
          <StepHead n={5} tint={tints[4]} label="Which are you taking with you" />
          <UnderNote>
            You don’t have to believe any of them. You just have to notice your mind had options and
            only showed you one.
          </UnderNote>
          {[kase.minds, ...offered].map((o) => (
            <button
              key={o}
              onClick={() => { setLocked(true); onCarry(o); }}
              className="ml-3 rounded-[18px] px-4 py-3 text-left text-[14px] font-extrabold leading-snug"
              style={{
                minHeight: m.target,
                background: 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${tints[4]}77`,
                color: CHROME.text,
              }}
            >
              {o}
            </button>
          ))}
        </motion.div>
      )}
    </>
  );
}

/**
 * A box to write in, or to speak into.
 *
 * `locked` greys it rather than removing it: once a child has moved past a
 * step, what they wrote stays on the page — it is their own words, the next
 * step is about them, and a list that vanishes when you scroll past it is the
 * mistake this whole room was rebuilt to stop making.
 */
function Box({
  value, onChange, placeholder, accent, locked,
}: {
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
  accent: string;
  locked: boolean;
}) {
  return (
    <div
      className="ml-3 flex items-end gap-2 rounded-[20px] px-4 py-3"
      style={{
        background: locked ? 'rgba(255,255,255,0.04)' : CHROME.pill,
        border: `1px solid ${locked ? 'rgba(255,255,255,0.12)' : `${accent}88`}`,
        fontFamily: FONT,
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={locked}
        rows={2}
        className="max-h-32 min-h-[46px] flex-1 resize-none bg-transparent text-[14.5px] font-semibold leading-snug outline-none placeholder:opacity-55"
        style={{ color: locked ? CHROME.textSoft : CHROME.text }}
      />
      {!locked && <MicButton accent={accent} onText={(t) => onChange(value ? `${value} ${t}` : t)} />}
    </div>
  );
}
