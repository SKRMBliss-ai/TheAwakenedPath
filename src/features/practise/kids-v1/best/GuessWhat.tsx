import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import {
  SELF_REPLIES,
  gamePlayed,
  notNow,
  takeOnSelfReply,
  type GuessingGame,
} from '../kit/guessingGame';
import * as sound from '../kit/sound';
import { useSpoken } from '../ui/useSpoken';

/**
 * THE ONE PLACE IN THE APP WHERE BOTH OF THEM GET A TURN.
 *
 * Chirpy guesses at the child's day — twice, ridiculously, and then once for
 * real — and then he stops asking and hands the turn over, and the child
 * guesses at his. See kit/guessingGame for the content, the pacing, and for
 * the single rule the whole thing is built around: NOTHING HERE WRITES A
 * TICK, because a character who suggests the answers to a six-year-old is a
 * character who corrupts every number downstream of them.
 *
 * IT TALKS BY ITSELF AND IT DOES NOT WAIT FOR A "NEXT" BUTTON. Every line
 * — his guess, his reaction, the handover, the story at the end — goes
 * through the same single useSpoken as it appears, and the conversation
 * advances on a timer sized to the line. You do not press next when a friend
 * is talking to you. The timer is generous enough that the voice finishes
 * first; a beat that cuts Chirpy off mid-word reads as him being interrupted
 * by the app he lives in.
 *
 * ONE MOUTH, ONE useSpoken. The rule from ui/useSpoken holds here even
 * though the text changes six times: it is one hook whose argument changes,
 * not six hooks, so each new line cancels the last one cleanly instead of
 * racing it.
 *
 * THERE IS NO SCORE AND NO "CORRECT". Getting his day right earns the
 * discovery chime and a pleased bird, and getting it wrong earns the same
 * story told the same way — because the guess was only ever the doorway into
 * him telling them what he did, and a child who guesses wrong has not failed
 * at anything.
 */

/** What Chirpy is currently saying back, and what happens when he's finished. */
interface Said {
  line: string;
  /** 'next' moves the conversation on; 'end' folds the whole thing away. */
  then: 'next' | 'end';
}

export function GuessWhat({ game, onDone }: { game: GuessingGame; onDone: () => void }) {
  const m = useMotion();
  const [phase, setPhase] = useState<'mine' | 'his'>('mine');
  const [i, setI] = useState(0);
  const [said, setSaid] = useState<Said | null>(null);

  const accent = '#FFAE8F';
  const g = game.guesses[i];

  /**
   * How long to leave one of his lines up.
   *
   * Sized off the line rather than fixed, because his reactions run from four
   * words to forty and a single number would either cut the long ones off or
   * leave the short ones sitting there long enough for a child to wonder
   * whether it's broken. The rate roughly matches what lib/calmVoice asks
   * speechSynthesis for, plus a moment to look at his face afterwards.
   */
  const dwell = (line: string) =>
    Math.min(m.quiet ? 12000 : 9500, (m.quiet ? 1800 : 1300) + line.length * (m.quiet ? 92 : 74));

  /**
   * ALL THE TIMING LIVES HERE, in one effect, so unmounting always cancels
   * it. A child who walks into a room mid-conversation must not have the rest
   * of it fire at them from a component that no longer exists — and, more to
   * the point, must not have `gamePlayed()` recorded for a game they left
   * halfway through.
   */
  useEffect(() => {
    if (!said) return;
    const t = window.setTimeout(() => {
      if (said.then === 'end') { gamePlayed(); onDone(); return; }
      setSaid(null);
      if (i + 1 < game.guesses.length) setI(i + 1);
      else setPhase('his');
    }, dwell(said.line));
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [said, i, game.guesses.length]);

  /* The line that is on screen right now — his question, or his answer to
     theirs. Exactly one of them is ever showing. */
  const asking = phase === 'mine' ? g.line : game.handover;
  const visible = said ? said.line : asking;
  useSpoken(visible);

  const answerYesNo = (yes: boolean) => {
    if (said) return;
    sound.play('tap');
    setSaid({ line: yes ? g.onYes : g.onNo, then: 'next' });
  };

  const answerSelf = (reply: string) => {
    if (said) return;
    sound.play('tap');
    setSaid({ line: takeOnSelfReply(reply), then: 'next' });
  };

  const answerHis = (option: string) => {
    if (said) return;
    const right = option === game.his.truth;
    sound.play(right ? 'discovery' : 'tap');
    setSaid({ line: `${right ? game.his.onRight : game.his.onWrong} ${game.his.story}`, then: 'end' });
  };

  const dismiss = () => {
    notNow();
    onDone();
  };

  const pill = {
    minHeight: m.target,
    background: CHROME.pillSelected,
    border: `1px solid ${CHROME.pillBorder}`,
    color: CHROME.text,
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: m.quiet ? 0.6 : 0.42 }}
      className="mt-4 rounded-[24px] px-4 py-4 backdrop-blur-md"
      style={{
        background: CHROME.pill,
        border: `1px solid ${accent}66`,
        boxShadow: `0 0 30px -12px ${accent}`,
        fontFamily: FONT,
      }}
    >
      <div>
        <div className="min-w-0 flex-1">
          {/* WHOSE TURN IT IS, said in two words.
              Not decoration: a child who joins this halfway through the
              handover needs to know the game has flipped, and "Your go"
              above the buttons does that faster than the sentence does. */}
          <p
            className="text-[11px] font-extrabold uppercase tracking-[0.12em]"
            style={{ color: accent }}
          >
            {phase === 'mine' ? 'Chirpy’s go' : 'Your go'}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${i}-${said ? 'said' : 'ask'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {/* No `text-wrap: balance` here, deliberately. It is right for a
                  heading and wrong for this: his lines run from four words to
                  forty, and balancing a forty-word story turns the column into
                  a narrow ragged block with half the card's width unused. It
                  fills the line. */}
              <p className="mt-1.5 text-[14.5px] font-bold leading-snug" style={{ color: CHROME.text }}>
                {visible}
              </p>

              {/* Only while he's waiting on them. His own reactions carry no
                  buttons at all — they play out and move on, the way talking
                  does. */}
              {!said && (
                <>
                  {phase === 'his' ? (
                    /* His day, as three things he might have done. Stacked
                       rather than wrapped into pills: they're sentences, and
                       three sentences chasing each other round a flex row is
                       unreadable at six. */
                    <div className="mt-3 flex flex-col gap-2">
                      {game.his.options.map((o) => (
                        <button
                          key={o}
                          onClick={() => answerHis(o)}
                          className="rounded-[14px] px-3.5 py-2 text-left text-[13.5px] font-extrabold"
                          style={pill}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  ) : g.self ? (
                    /* The real guess gets three answers instead of yes/no,
                       because "are you a kind person" is not a yes/no
                       question and offering it as one is the app telling a
                       child that it is. */
                    <div className="mt-3 flex flex-wrap gap-2">
                      {SELF_REPLIES.map((r) => (
                        <button
                          key={r}
                          onClick={() => answerSelf(r)}
                          className="rounded-full px-3.5 text-[13px] font-extrabold"
                          style={pill}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Two big ones. "Yes" is as real an answer as "no" here —
                       see kit/guessingGame on why he believes the bear. */
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => answerYesNo(false)}
                        className="rounded-full px-5 text-[14px] font-extrabold"
                        style={pill}
                      >
                        No!
                      </button>
                      <button
                        onClick={() => answerYesNo(true)}
                        className="rounded-full px-5 text-[14px] font-extrabold"
                        style={pill}
                      >
                        Yes!
                      </button>
                    </div>
                  )}

                  {/* Only on the very first screen. Once they've answered
                      something, walking out mid-sentence isn't a button the
                      app needs to offer — they can go into a room, and the
                      conversation folds itself away. */}
                  {phase === 'mine' && i === 0 && (
                    <button
                      onClick={dismiss}
                      className="mt-2.5 text-[12px] font-bold"
                      style={{ color: CHROME.textSoft, minHeight: 32 }}
                    >
                      Not now
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
