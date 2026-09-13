import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { chirpySprite } from '../ui/sprites';
import { RoomScene } from '../ui/scene';
import { DIM } from '../ui/scenery';
import { artRoomFor, PAUSE_ROOM } from './rooms';
import { agoLabel, loadCases } from '../kit/cases';
import { starCount } from '../kit/sky';
import { useSpoken } from '../ui/useSpoken';

/**
 * THE ONE-MINUTE DOOR.
 *
 * Everything else in this app assumes a child with the bandwidth for a round:
 * seven rooms, a question in each, maybe a knot to untangle afterwards. On the
 * evenings that assumption fails — and it fails on exactly the evenings this
 * app is supposed to be for — the child's only options were to do the whole
 * thing or to close it.
 *
 * So this asks for NOTHING. No tick, no question, no feeling to name, no
 * points, no game, nothing to finish. It shows the child two or three things
 * that are already theirs, one at a time, at their own pace, and then says
 * goodnight. That's the entire screen.
 *
 * IT IS NOT THE PAUSE ROOM. That one is an instrument — the boy rises and
 * falls and the child breathes to him. This one doesn't ask them to do even
 * that. Breathing on purpose is still a thing you have to have the energy to
 * do, and a child who hasn't got it needs somewhere that wants nothing at all.
 *
 * THE VISIT COUNTS EXACTLY AS MUCH AS A FULL ROUND. Same star, same sky, no
 * asterisk anywhere. A child who came here on a bad night did the harder
 * thing, and the sky is not going to be the place that quietly disagrees.
 *
 * NOTHING IN HERE IS ENCOURAGEMENT. No "well done for coming", no "tomorrow's
 * a new day", no "you're doing great" — a child who feels awful and is told
 * they're doing great learns that this app doesn't understand them. It just
 * shows them their own things and lets them go.
 */

interface Beat {
  /** What Chirpy says while it's up. Never a question. */
  line: string;
  /** Their drawing, when the beat is a picture. */
  drawing?: string;
  /** Their own words, when the beat is something they wrote. */
  quote?: string;
  /** A plain fact about them, when the beat is neither. */
  fact?: string;
}

/**
 * Two or three things of theirs, newest last so the run ends on something
 * recent. Everything here already exists elsewhere in the app; this screen
 * invents no content of its own, because a child who is having a bad evening
 * should be shown evidence rather than told a story.
 */
function beatsFor(lifetimeFireflies: number): Beat[] {
  const beats: Beat[] = [];
  const cases = loadCases();

  const withDrawing = cases.find((c) => c.drawing);
  if (withDrawing?.drawing) {
    beats.push({
      line: 'You drew this. I still like it.',
      drawing: withDrawing.drawing,
    });
  }

  // Their own sentence — the "other story" is the one they worked hardest for.
  const withWords = cases.find((c) => (c.other ?? '').trim().length > 12);
  if (withWords?.other) {
    beats.push({
      line: `You worked this one out ${agoLabel(withWords.day)}.`,
      quote: withWords.other.trim(),
    });
  }

  if (lifetimeFireflies > 0) {
    beats.push({
      line: 'And these are all yours.',
      fact: lifetimeFireflies === 1
        ? 'One firefly, caught by you.'
        : `${lifetimeFireflies} fireflies. Every one of them yours.`,
    });
  }

  const nights = starCount();
  if (!beats.length) {
    // A brand-new child, or one who has only ever ticked. There is still
    // something true to say, and it is not a pep talk.
    beats.push({
      line: nights > 1 ? `You’ve come here ${nights} times now.` : 'You came. That’s the whole thing.',
      fact: 'Nothing to do in here tonight.',
    });
  }

  return beats.slice(0, 3);
}

export function OneMinute({
  lifetimeFireflies,
  onExit,
}: {
  lifetimeFireflies: number;
  onExit: () => void;
}) {
  const m = useMotion();
  const art = artRoomFor(PAUSE_ROOM);
  const accent = art.palette.accent;

  const [beats] = useState(() => beatsFor(lifetimeFireflies));
  const [at, setAt] = useState(0);

  /*
    NO STAR IS AWARDED HERE, and that is the point rather than an omission:
    the hub already marked the visit when the child opened the app (see
    BestApp's markVisit). Coming through this door therefore counts exactly
    as much as a full round of seven rooms, by construction — there is no
    separate accounting for a bad night that could ever drift apart from the
    good ones.
  */

  const done = at >= beats.length;
  const beat = beats[Math.min(at, beats.length - 1)];

  /* Read aloud — this is the screen for the evening a child has the least
     energy to decode text, so asking them to read it would defeat it. */
  useSpoken(done
    ? 'That\u2019s it. Nothing else tonight.'
    : [beat.line, beat.quote ? `You said: ${beat.quote}` : '', beat.fact ?? ''].filter(Boolean).join(' '));

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <RoomScene room={art} dim={DIM.content} />

      <div className="relative grid min-h-[100svh] place-items-center px-6">
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <img
            src={chirpySprite(done ? 'hopeful' : 'curious')}
            alt=""
            aria-hidden
            draggable={false}
            className="select-none"
            style={{ height: 76, width: 'auto', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.5))' }}
          />

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={at}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: m.quiet ? 0.6 : 0.4 }}
                className="flex w-full flex-col items-center gap-4"
              >
                <p className="text-[18px] font-extrabold leading-snug" style={{ color: CHROME.text, textWrap: 'balance' }}>
                  {beat.line}
                </p>

                {beat.drawing && (
                  <img
                    src={beat.drawing}
                    alt=""
                    className="w-full max-w-[240px] rounded-[18px]"
                    style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${CHROME.pillBorder}` }}
                  />
                )}

                {beat.quote && (
                  <p
                    className="border-l-2 pl-3 text-left text-[15px] font-semibold italic leading-snug"
                    style={{ color: CHROME.text, borderColor: accent }}
                  >
                    “{beat.quote}”
                  </p>
                )}

                {beat.fact && (
                  <p className="text-[15px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
                    {beat.fact}
                  </p>
                )}

                {/*
                  SELF-PACED, and never a countdown. "One minute" is a promise
                  about how little this asks, not a timer running at a child
                  who is already having a hard time. Nothing advances on its
                  own and nothing expires.
                */}
                <button
                  onClick={() => setAt((i) => i + 1)}
                  className="rounded-full px-6 text-[14px] font-extrabold"
                  style={{ minHeight: m.target, background: accent, color: '#12210F' }}
                >
                  {at === beats.length - 1 ? 'Okay' : 'Go on'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center gap-5"
              >
                <p className="text-[19px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
                  That’s it. Nothing else tonight.
                </p>
                <button
                  onClick={onExit}
                  className="rounded-full px-6 text-[14px] font-extrabold"
                  style={{ minHeight: m.target, background: accent, color: '#12210F' }}
                >
                  Night
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Out, at every single moment, without finishing anything. */}
          {!done && (
            <button
              onClick={onExit}
              className="text-[12.5px] font-bold"
              style={{ color: CHROME.textSoft, minHeight: 40 }}
            >
              I’ll go now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
