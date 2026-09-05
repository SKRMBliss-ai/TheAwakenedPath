import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getRoom, type RoomId } from '../rooms';
import { Cta, FONT, BackButton, GrownUpExit, Pill, Question, SceneLine } from '../ui/chrome';
import { Chirpy, RoomScene } from '../ui/scene';
import { BodyMap } from '../ui/bodyMap';
import { BODY_ZONE_LABEL, type BodyZoneId } from '../ui/bodyZones';
import { THOUGHTS, MAYBES } from '../kit/checkinContent';
import { FeelingBalls } from './FeelingBalls';
import { OrbScene } from './OrbScene';
import { AnswerGrid } from './AnswerGrid';
import { WanderingChirpy } from './WanderingChirpy';
import type { ChirpyPose } from '../ui/sprites';
import * as sound from '../kit/sound';

/**
 * THE FIVE STEPS, ON ONE SCREEN.
 *
 * feeling → body → mind's story → eyes → another story.
 *
 * The old version put each step on its own screen and swapped between them,
 * which meant that by the time a child reached "what else could be true?"
 * they could no longer see the story their mind had made, and the question
 * had lost the thing it was about. Everything now happens in one place: each
 * answer stays on screen as a small card, and the next question opens
 * underneath it. A child can look up and see their own chain of reasoning —
 * which is the entire skill this sequence teaches.
 *
 * The room behind them still changes with the step (feelings room, then Body
 * Detective, then the Thought Room), because that world is worth keeping. It
 * cross-fades rather than cutting, so it reads as walking through a building
 * rather than as five separate screens.
 */

type StepId = 'feeling' | 'body' | 'story' | 'eyes' | 'other';

interface Step {
  id: StepId;
  room: RoomId;
  /** What Chirpy says as this step opens. He wonders; he never concludes. */
  chirpy: string;
  question: string;
  hint?: string;
}

const STEPS: Step[] = [
  { id: 'feeling', room: 'feelings', chirpy: 'Have a look. Any of these bouncing about in you?', question: 'How are you feeling right now?', hint: 'Pop the one that fits. There’s no wrong one.' },
  { id: 'body', room: 'body', chirpy: 'Feelings live somewhere. Where’s yours sitting?', question: 'Where do you notice it?', hint: 'Tap anywhere — and as many places as you like.' },
  { id: 'story', room: 'thought', chirpy: 'I bet I know what your mind said. Do I?', question: 'What did your mind say about it?', hint: 'This is the story your mind made. Stories aren’t facts yet.' },
  { id: 'eyes', room: 'thought', chirpy: 'Now the tricky bit. What did your EYES actually see?', question: 'What actually happened?', hint: 'Just the bit a camera would have caught. No guessing what it meant.' },
  { id: 'other', room: 'story', chirpy: 'Go on then — teach me a happier one.', question: 'What else could be true?', hint: 'Any of these. Or none, if none of them fit.' },
];

const EYES_OPTIONS = [
  'Someone said something',
  'Someone walked away',
  'I didn’t get picked',
  'Something didn’t work',
  'Somebody looked at me',
  'I’m not sure what I saw',
];

/**
 * Chirpy's confession, delivered one line at a time (tap to advance) once
 * the five steps are answered — before the choice below.
 *
 * This is the beat the whole walk has been building to: the same voice that
 * just guessed the child's story a moment ago, at the "story" step, is now
 * the one owning up to guessing. A companion admitting this about himself is
 * a confession; the app explaining it about the child's own mind is a
 * lecture, and a lectured child stops answering honestly (see
 * chirpy/README.md — "Chirpy wonders, he never concludes"). So every line
 * stays in his voice, tentative, and never turns into a moral.
 */
const CONFESSION = [
  'Can I tell you something?',
  'That story — the one your mind wrote a minute ago. I do that too. All the time.',
  'I fill in the gaps really fast, and I don’t check first.',
  'I’m not trying to trick you. I’m trying to get there before something bad does.',
  'But I get it wrong. Loads.',
  'So next time I say something big about you — you’re allowed to stop and check. Did your eyes actually see that?',
];

/** One pose per confession line, so his face follows what he's admitting. */
const CONFESSION_POSES: ChirpyPose[] = ['curious', 'worried', 'worried', 'said1', 'said2', 'hopeful'];

export interface DeepDiveAnswers {
  feeling?: string;
  body?: string[];
  story?: string;
  eyes?: string;
  other?: string;
}

export function DeepDive({
  onFinish,
  onGrownUp,
}: {
  onFinish: (answers: DeepDiveAnswers) => void;
  onGrownUp: () => void;
  /** Kept so the caller's contract doesn't change; this walk never turns the
   *  quiet state on by itself — the intensity beat upstream is what does. */
  onQuiet?: (q: boolean) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<DeepDiveAnswers>({});
  const [bodyZones, setBodyZones] = useState<Set<BodyZoneId>>(new Set());
  /** Set the instant a feeling ball is tapped, so the room blooms with it. */
  const [orbFlash, setOrbFlash] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  /**
   * Two beats run after the five answered STEPS and before the walk ends:
   * Chirpy's confession, then the choice of which story to carry. Neither is
   * a `Step` in the STEPS sense — one is a monologue, the other needs its
   * own two-story layout — so they're phases of the same stepIndex counter
   * rather than additions to that array. StepDots below still counts only
   * the five real steps; these two are the coda, same as `done` already was.
   */
  const phase: 'ask' | 'confession' | 'done' =
    stepIndex < STEPS.length ? 'ask'
    : stepIndex === STEPS.length ? 'confession'
    : 'done';
  const done = phase === 'done';
  // The confession happens in the room the story step used — "the hinge" —
  // rather than cutting to Reflection early.
  const art = getRoom(phase === 'done' ? 'reflection' : phase === 'ask' ? step.room : 'story');
  const accent = art.palette.accent;

  // Each new step opens below the last answer, so the page follows the child
  // down rather than making them hunt for what just appeared.
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [stepIndex]);

  const answer = (key: keyof DeepDiveAnswers, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStepIndex((i) => i + 1);
  };

  // The lullaby plays over the cards, while Chirpy wanders and talks. It
  // stops on unmount so it can never follow the child into another room.
  useEffect(() => {
    if (phase !== 'ask') {
      sound.playMusic('twoStories');
      return () => sound.stopMusic();
    }
  }, [phase]);

  useEffect(() => () => sound.stopMusic(), []);

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* The room cross-fades with the step — one building, several rooms. */}
      <AnimatePresence>
        <motion.div
          key={phase === 'ask' && step.id === 'feeling' ? 'orbfilm' : art.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* The feeling step plays the orb film; every other step keeps
              its painted still. Same room either way — one of them moves. */}
          {phase === 'ask' && step.id === 'feeling'
            ? <OrbScene flash={orbFlash} />
            : <RoomScene room={art} dim={0.25} />}
        </motion.div>
      </AnimatePresence>

      {/* He wanders the whole screen, over the cards, not inside the column
          — a creature in the room rather than a row in the layout. */}
      {!done && phase === 'confession' && (
        <WanderingChirpy
          lines={CONFESSION}
          poses={CONFESSION_POSES}
          onFinished={() => setStepIndex((i) => i + 1)}
        />
      )}

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-5 pb-10 pt-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={() => onFinish(answers)} label="Leave" />
          <StepDots total={STEPS.length} at={stepIndex} accent={accent} />
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <div className="flex flex-1 flex-col gap-3 pt-5">
          {/* ── The chain so far, as four cards in two columns. The bottom
                 row puts the story the mind wrote directly beside what
                 actually happened, and the left one turns over to show the
                 other thing that could be true. See AnswerGrid. ────────── */}
          <AnswerGrid answers={answers} accent={accent} />

          {/* ── The step being asked now ──────────────────────────────── */}
          {phase === 'ask' && (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-3.5 pt-1"
            >
              <Chirpy pose={step.id === 'other' ? 'hopeful' : 'curious'} line={step.chirpy} align="left" />
              <Question room={art}>{step.question}</Question>
              {step.hint && <SceneLine>{step.hint}</SceneLine>}

              {step.id === 'feeling' && (
                <FeelingBalls
                  onPick={(_, label) => answer('feeling', label)}
                  onBurst={() => setOrbFlash(true)}
                />
              )}

              {step.id === 'body' && (
                <>
                  <BodyMap
                    accent={accent}
                    suggested={null}
                    selected={bodyZones}
                    onToggle={(z) =>
                      setBodyZones((prev) => {
                        const next = new Set(prev);
                        if (next.has(z)) next.delete(z); else next.add(z);
                        return next;
                      })
                    }
                  />
                  <Cta
                    label={bodyZones.size ? 'That’s where' : 'Not anywhere really'}
                    onClick={() =>
                      answer('body', bodyZones.size
                        ? Array.from(bodyZones).map((z) => BODY_ZONE_LABEL[z])
                        : ['nowhere in particular'])
                    }
                    accent={accent}
                  />
                </>
              )}

              {step.id === 'story' && (
                <ChoiceList
                  items={[...THOUGHTS, 'Something else']}
                  accent={accent}
                  onPick={(t) => answer('story', t)}
                />
              )}

              {step.id === 'eyes' && (
                <ChoiceList items={EYES_OPTIONS} accent={accent} onPick={(t) => answer('eyes', t)} />
              )}

              {step.id === 'other' && (
                <ChoiceList
                  items={[...MAYBES.other, 'None of these yet']}
                  accent={accent}
                  onPick={(t) => answer('other', t)}
                />
              )}
            </motion.div>
          )}

          {/* ── The closing beat ───────────────────────────────────────
                 Chirpy wanders the room saying his piece line by line on his
                 own clock (see WanderingChirpy) while the child looks at
                 their four cards and turns the left one over. Nothing to tap
                 through: six tap-to-advance lines turn into a task to finish,
                 and a child tapping fast reads none of them.

                 There is no "which one will you carry?" question any more.
                 Asking a child to pick a story to keep quietly makes one of
                 them the winner; the flip already says the honest thing —
                 both are on the same card, and you can turn it whenever you
                 like. */}
          {!done && phase !== 'ask' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 pt-2"
            >
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: accent }}>
                Two stories, one card
              </p>
              <Question room={art}>
                Turn the left card over. Both of them fit today — nobody knows which is true, and that’s the interesting bit.
              </Question>
              <Cta label="Done" onClick={() => { sound.play('resolve'); onFinish(answers); }} accent={accent} />
            </motion.div>
          )}

          <div ref={bottom} className="scroll-mb-8" />
        </div>
      </div>

    </div>
  );
}

/* ── An answer, kept on screen ───────────────────────────────────────── */

function StepDots({ total, at, accent }: { total: number; at: number; accent: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          animate={{ scale: i === at ? 1.3 : 1 }}
          className="block h-2 w-2 rounded-full"
          style={{ background: i < at ? accent : i === at ? '#fff' : 'rgba(255,255,255,0.28)' }}
        />
      ))}
    </div>
  );
}

function ChoiceList({
  items, accent, onPick,
}: {
  items: string[]; accent: string; onPick: (item: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((t) => (
        <Pill key={t} label={t} accent={accent} onClick={() => { sound.play('tap'); onPick(t); }} />
      ))}
    </div>
  );
}

/**
 * One of the two stories, as a hanging lantern.
 *
 * Both lanterns are identical apart from the colour of their flame. The
 * mind's story gets no crack, no thorn, no red — nothing that tells a child
 * which one the app would like them to pick. If the preferred answer is
 * visible, they will pick it to be agreeable and learn nothing, which
 * wastes the whole walk that got them here.
 *
 * They sway very slightly, out of phase with each other, so the pair reads
 * as two things hanging in a room rather than two buttons in a form.
 */
