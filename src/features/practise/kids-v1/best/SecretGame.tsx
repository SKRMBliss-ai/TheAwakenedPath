import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { useSpoken } from '../ui/useSpoken';
import {
  missionGiven,
  missionReported,
  type Mission,
  type MissionReply,
} from '../kit/missions';
import * as sound from '../kit/sound';

/**
 * Chirpy handing over a secret game, and Chirpy asking about it afterwards.
 *
 * Two cards, one file, because they are two halves of one conversation and
 * splitting them across two files is how the second half drifts out of the
 * voice of the first. See kit/missions for what a mission is and, more
 * importantly, for the list of things this deliberately does not do — no
 * score, no streak, no record of whether they actually managed it.
 *
 * THE COLOUR IS ITS OWN. Every other card on the hub is Chirpy talking about
 * something in here; these two are about something out there. A child should
 * be able to tell at a glance that this one is different before they have
 * read a word of it.
 */
const SECRET = '#7FE0C0';

/* ── Handing it over ─────────────────────────────────────────────────── */

/**
 * THE LINES ARRIVE ONE AT A TIME and the button waits for the last of them.
 *
 * Same reason the teaching payoffs are staged: three sentences at once is a
 * paragraph, and a paragraph is the thing a child's eye slides off. It also
 * matters more here than usual — the middle line IS the mission, and a child
 * who skims past it is carrying nothing out of the door.
 */
export function SecretGameGiven({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const m = useMotion();
  const [said, setSaid] = useState(0);

  useSpoken(mission.give.slice(0, said).join(' '));

  useEffect(() => {
    if (said >= mission.give.length) return;
    const t = window.setTimeout(
      () => setSaid((n) => n + 1),
      said === 0 ? 260 : (m.quiet ? 2600 : 2000),
    );
    return () => window.clearTimeout(t);
  }, [said, mission.give.length, m.quiet]);

  /*
    RECORDED ON SIGHT, not on the button.

    Children navigate away rather than dismissing things — this is the bug
    that made Chirpy's arc repeat the same clue every evening for weeks (see
    ChirpyArc). A mission that is only marked as given when a child presses
    "Go on then" would be handed over again tomorrow, and the day after, and
    the child would never once be asked how it went.

    Four seconds: long enough that a card glimpsed during a mis-tap doesn't
    count, short enough that anybody who actually read it is carrying it.
  */
  const taken = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (taken.current) return;
      taken.current = true;
      missionGiven(mission.id);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [mission.id]);

  const all = said >= mission.give.length;

  return (
    <Card>
      <Eyebrow>A secret game</Eyebrow>

      {mission.give.slice(0, said).map((line, i) => (
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34 }}
          className="mt-1.5 text-[14.5px] font-bold leading-snug"
          style={{ color: i === 0 ? CHROME.text : CHROME.textSoft, textWrap: 'balance' }}
        >
          {line}
        </motion.p>
      ))}

      {all && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* THE MISSION, PULLED OUT. The lines above are Chirpy talking; this
              is the thing being handed over, and it is the one part a child
              has to still have in their head tomorrow. */}
          <p
            className="mt-3 rounded-[16px] px-3.5 py-2.5 text-[13.5px] font-extrabold leading-snug"
            style={{
              background: `${SECRET}1A`,
              border: `1px solid ${SECRET}77`,
              color: CHROME.text,
            }}
          >
            {mission.secret}
          </p>
          <p className="mt-2 text-[12px] font-bold" style={{ color: CHROME.textSoft }}>
            Nobody can see you doing it. Not even me — I’ll just ask.
          </p>
          <button
            onClick={() => { sound.play('resolve'); onDone(); }}
            className="mt-2.5 text-[12.5px] font-bold"
            style={{ color: CHROME.textSoft, minHeight: 36 }}
          >
            Okay
          </button>
        </motion.div>
      )}
    </Card>
  );
}

/* ── Asking about it ─────────────────────────────────────────────────── */

/**
 * The half that makes it a mission rather than a suggestion.
 *
 * EVERY ANSWER IS A REAL ANSWER. Each reply carries its own response, which is
 * the whole reason `replies` is a list of objects rather than a list of
 * strings: "I didn't get a go" landing on the same generic line as "it went
 * brilliantly" tells a child that the app was not really listening, only
 * waiting. And the no-answer is never last in the list, where it would read
 * as the afterthought option.
 *
 * NOTHING IS RECORDED ABOUT WHICH ONE THEY PICKED. The app stores that the
 * conversation happened. What they did out there is theirs.
 */
export function SecretGameBack({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const m = useMotion();
  const [chose, setChose] = useState<MissionReply | null>(null);
  const [said, setSaid] = useState(0);

  useSpoken(chose ? chose.land.slice(0, said).join(' ') : mission.ask);

  useEffect(() => {
    if (!chose || said >= chose.land.length) return;
    const t = window.setTimeout(
      () => setSaid((n) => n + 1),
      said === 0 ? 260 : (m.quiet ? 2600 : 1900),
    );
    return () => window.clearTimeout(t);
  }, [chose, said, m.quiet]);

  const answer = (r: MissionReply) => {
    sound.play('tap');
    setChose(r);
    /* Spent the moment they say anything at all. A child who answers and then
       wanders off has had the conversation, and must not be asked the same
       question again tomorrow. */
    missionReported(mission.id);
  };

  const all = chose ? said >= chose.land.length : false;

  return (
    <Card>
      <Eyebrow>That secret game</Eyebrow>

      <AnimatePresence mode="wait">
        {!chose ? (
          <motion.div key="ask" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p
              className="mt-1.5 text-[14.5px] font-bold leading-snug"
              style={{ color: CHROME.text, textWrap: 'balance' }}
            >
              {mission.ask}
            </p>
            <div className="mt-2.5 flex flex-col items-start gap-2">
              {mission.replies.map((r) => (
                <button
                  key={r.text}
                  onClick={() => answer(r)}
                  className="rounded-full px-3.5 text-left text-[13px] font-extrabold"
                  style={{
                    minHeight: m.target,
                    background: CHROME.pillSelected,
                    border: `1px solid ${CHROME.pillBorder}`,
                    color: CHROME.text,
                  }}
                >
                  {r.text}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="land" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {chose.land.slice(0, said).map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34 }}
                className="mt-1.5 text-[14.5px] font-bold leading-snug"
                style={{ color: i === 0 ? CHROME.text : CHROME.textSoft, textWrap: 'balance' }}
              >
                {line}
              </motion.p>
            ))}
            {all && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => { sound.play('resolve'); onDone(); }}
                className="mt-2.5 text-[12.5px] font-bold"
                style={{ color: CHROME.textSoft, minHeight: 36 }}
              >
                Okay
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ── The shell both halves share ─────────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  const m = useMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: m.quiet ? 0.6 : 0.45 }}
      className="mt-4 rounded-[24px] px-4 py-4 backdrop-blur-md"
      style={{ background: CHROME.pill, border: `1px solid ${SECRET}55`, fontFamily: FONT }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] font-extrabold uppercase tracking-[0.12em]"
      style={{ color: SECRET }}
    >
      {children}
    </p>
  );
}
