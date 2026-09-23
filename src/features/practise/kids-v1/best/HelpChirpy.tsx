import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, Cta, FONT, GrownUpExit, Pill, Question, SceneLine } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { useMotion, useQuiet } from '../ui/quiet';
import { RoomScene } from '../ui/scene';
import { DIM } from '../ui/scenery';
import type { RoomConfig } from '../rooms';
import { chirpySprite, type ChirpyPose } from '../ui/sprites';
import { getRoom } from '../rooms';
import { knotForToday } from '../kit/chirpyKnots';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import * as sound from '../kit/sound';

/**
 * HELPING CHIRPY — the same five steps, pointed the other way round.
 *
 * Everywhere else the child is the one being asked how they feel. Here they
 * are the one asking, and Chirpy is the one who cannot work out what is
 * wrong. Same skill, no exposure: a child who cannot yet say "I felt left
 * out" about their own afternoon will say it about a small purple monster
 * without blinking, and the saying is the part that teaches.
 *
 * IT IS DELIBERATELY EASIER THAN THE REAL THING. He hands over each piece
 * when asked — his feeling, where it sits, the story his mind wrote, what
 * actually happened — so the child is never stuck, never wrong, and gets to
 * the good bit: spotting the gap between what happened and what he made of
 * it. Four taps, about ninety seconds.
 *
 * THE CHILD IS NEVER MARKED. Every other story they can offer him is one he
 * is glad of. He thanks them for the noticing, not for the answer — there
 * isn't one — and the screen ends with him better, which is the payoff the
 * app had nowhere else: the child was useful to someone.
 *
 * His troubles stay small and ordinary on purpose (see kit/chirpyKnots).
 * A child made responsible for a distressed grown-up — or a monster
 * standing in for one — has been handed something that is not theirs.
 */

type Beat = 'ask' | 'feeling' | 'body' | 'story' | 'eyes' | 'offer' | 'thanks';

const ORDER: Beat[] = ['ask', 'feeling', 'body', 'story', 'eyes', 'offer', 'thanks'];

export function HelpChirpy({ onExit, onGrownUp }: { onExit: () => void; onGrownUp: () => void }) {
  const knot = knotForToday();
  // The Different Story room: where two accounts of one afternoon belong.
  const art = getRoom('story');
  const accent = art.palette.accent;
  const m = useMotion();
  const quiet = useQuiet();
  const [beat, setBeat] = useState<Beat>('ask');
  const [gave, setGave] = useState<string | null>(null);

  const step = ORDER.indexOf(beat);
  const next = () => setBeat(ORDER[Math.min(step + 1, ORDER.length - 1)]);

  /** What he is saying at this moment, and how he looks while he says it. */
  const said: Record<Beat, string> = {
    ask: knot.opener,
    feeling: knot.feeling,
    body: knot.body,
    story: knot.story,
    eyes: knot.eyes,
    offer: 'So… do you think it might have been something else?',
    thanks: gave ? knot.thanks : '',
  };
  const pose: Record<Beat, ChirpyPose> = {
    ask: 'worried', feeling: 'worried', body: 'worried',
    story: 'said1', eyes: 'said2', offer: 'curious', thanks: 'excited',
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <RoomScene room={art} dim={beat === 'thanks' ? DIM.arrive : DIM.content} />

      {/* When the child hands him another story, his room lifts too — the
          same language the deep dive uses, so the child recognises what just
          happened without being told it is the same thing. */}
      <AnimatePresence>
        {beat === 'thanks' && !quiet && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{
              background:
                'radial-gradient(120% 62% at 50% 104%, rgba(255,214,150,0.5) 0%, rgba(255,186,120,0.2) 34%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <DoorHandle side="left" label="Back" onClick={onExit} accent={accent}  scale={0.7} />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-[74px] pb-10 pt-4 sm:px-20">
        <div className="flex items-center justify-end gap-3">
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <div className="flex flex-1 flex-col gap-4 pt-6">
          {/* What he has said so far, kept on screen. The child is building
              a picture of someone else's afternoon, and they cannot do that
              if the pieces keep scrolling away. */}
          <div className="flex flex-col gap-2">
            {step >= 1 && <Kept label="He feels" value={knot.feeling} accent={accent} />}
            {step >= 2 && <Kept label="It sits" value={knot.body} accent={accent} />}
            {step >= 3 && <Kept label="His mind said" value={knot.story} accent="#C48BE8" />}
            {step >= 4 && <Kept label="What actually happened" value={knot.eyes} accent="#8FD9C4" />}
            {gave && <Kept label="You said" value={gave} accent="#FFD98A" />}
          </div>

          <ChirpyOnStage line={said[beat]} pose={pose[beat]} cheer={beat === 'thanks'} quiet={quiet} />

          {beat === 'ask' && (
            <>
              <Question room={art}>Chirpy needs a hand.</Question>
              <Cta label="Go on then" onClick={() => { sound.play('tap'); next(); }} accent={accent} />
            </>
          )}

          {beat === 'feeling' && <Ask q="What are you feeling?" cta="And where do you feel it?" onNext={next} accent={accent} room={art} />}
          {beat === 'body' && <Ask q="Where do you feel it?" cta="What did your mind say?" onNext={next} accent={accent} room={art} />}
          {beat === 'story' && <Ask q="What did your mind say about it?" cta="And what actually happened?" onNext={next} accent={accent} room={art} />}
          {beat === 'eyes' && (
            <>
              <SceneLine>
                Those two aren’t quite the same thing, are they.
              </SceneLine>
              <Cta label="Tell him" onClick={() => { sound.play('discovery'); next(); }} accent={accent} />
            </>
          )}

          {beat === 'offer' && (
            <>
              <Question room={art}>What else could be true?</Question>
              <SceneLine>Any of these. He’ll be glad of all of them.</SceneLine>
              <div className="flex flex-col gap-2.5">
                {knot.maybes.map((t) => (
                  <Pill
                    key={t}
                    label={t}
                    accent={accent}
                    onClick={() => {
                      sound.play('tap');
                      setGave(t);
                      window.setTimeout(() => setBeat('thanks'), m.advanceMs);
                      window.setTimeout(() => sound.play('resolve'), m.advanceMs + 240);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {beat === 'thanks' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              {/* The only place in this app where the child is thanked for
                  something rather than noticed for it. He is better because
                  of them, and that is the whole reason this screen exists. */}
              <SceneLine>
                You did the thing you do when something’s stuck. On somebody else.
              </SceneLine>
              <DoorHandle side="right" label="Go on" onClick={onExit} accent={accent}  scale={0.7} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/** One question, one way on. He always answers; the child is never stuck. */
function Ask({ q, cta, onNext, accent, room }: { q: string; cta: string; onNext: () => void; accent: string; room: RoomConfig }) {
  return (
    <>
      <Question room={room}>{q}</Question>
      <Cta label={cta} onClick={() => { sound.play('tap'); onNext(); }} accent={accent} />
    </>
  );
}

function Kept({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-[16px] px-3.5 py-2.5 backdrop-blur-md"
      style={{ background: 'rgba(12,10,26,0.5)', border: `1px solid ${CHROME.pillBorder}` }}
    >
      <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {label}
      </p>
      <p className="mt-0.5 text-[13.5px] font-bold leading-snug" style={{ color: CHROME.text }}>
        {value}
      </p>
    </motion.div>
  );
}

/** Him, talking, at a size that actually inhabits the room. */
function ChirpyOnStage({ line, pose, cheer, quiet }: { line: string; pose: ChirpyPose; cheer: boolean; quiet: boolean }) {
  const m = useMotion();

  // Same voice, same rules as everywhere else Chirpy talks — see the note
  // in ui/scene.tsx. This screen builds its own Chirpy rather than reusing
  // the shared one (he stands full-size here, not tucked in a corner), so
  // it needs its own copy of the wiring rather than getting it for free.
  useEffect(() => {
    if (line) speak(line, quiet);
    return () => stopSpeaking();
  }, [line, quiet]);

  return (
    <div className="flex items-end gap-2.5">
      <motion.img
        src={chirpySprite(pose)}
        alt="Chirpy"
        draggable={false}
        style={{ height: 116, width: 'auto', filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.55))' }}
        /* The keyframes run once when `cheer` flips and hold on the last
           value — no state, no timer, and nothing for the effect linter to
           object to. He jumps because the child helped him, then settles. */
        animate={cheer
          ? { y: [0, -28, 0, -14, 0], rotate: [0, -9, 7, -3, 0] }
          : m.loop ? { y: [0, -5, 2, -2, 0] } : { y: 0 }}
        transition={cheer
          ? { duration: 1.2, ease: 'easeOut' }
          : m.loop ? { ...m.loop, duration: 3.6 } : undefined}
      />
      <AnimatePresence mode="wait">
        {line && (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="max-w-[78%] rounded-[20px] px-4 py-2.5 text-[14.5px] font-extrabold leading-snug shadow-xl"
            style={{ background: 'rgba(255,255,255,0.95)', color: '#241D3D' }}
          >
            {line}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
