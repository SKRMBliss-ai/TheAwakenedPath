import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getRoom, type RoomId } from '../rooms';
import { CHROME, Cta, FONT, GrownUpExit, Pill, Question, SceneLine } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { Chirpy, RoomScene } from '../ui/scene';
import { useMotion, useQuiet } from '../ui/quiet';
import { Eye, MessageCircle, Paintbrush, RotateCcw } from 'lucide-react';
import { chirpySprite, type ChirpyPose } from '../ui/sprites';
import { BodyMap } from '../ui/bodyMap';
import { BODY_ZONE_LABEL, type BodyZoneId } from '../ui/bodyZones';
import { DrawingCanvas, type DrawingCanvasHandle } from '../ui/DrawingCanvas';
import { THOUGHTS, MAYBES } from '../kit/checkinContent';
import { FeelingBalls } from './FeelingBalls';
import { FeelingsIntro } from './FeelingsIntro';
import { FloatingFeeling } from '../ui/FloatingFeeling';
import { setTodaysFeeling } from '../kit/todaysFeeling';
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

export interface DeepDiveAnswers {
  feeling?: string;
  body?: string[];
  story?: string;
  eyes?: string;
  other?: string;
  /** What they drew of it, as a PNG data URL, when they made one. */
  drawing?: string;
}

export function DeepDive({
  onFinish,
  onGrownUp,
  onQuiet,
}: {
  onFinish: (answers: DeepDiveAnswers) => void;
  onGrownUp: () => void;
  onQuiet: (q: boolean) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<DeepDiveAnswers>({});
  const [bodyZones, setBodyZones] = useState<Set<BodyZoneId>>(new Set());
  /** Whether the mind's-story card is showing its other side. */
  const [turned, setTurned] = useState(false);
  /** Set the instant a feeling ball is tapped, so the room blooms with it. */
  const [orbFlash, setOrbFlash] = useState(false);
  /**
   * Has the opening film receded yet on THIS visit?
   *
   * It used to be a per-device flag: the cinematic played once ever, and
   * every visit after got a separate, deliberately silent loop instead.
   * Which meant the sound worked exactly once and then looked broken
   * forever — same picture, no audio, because it was a different element.
   * The film plays every time now, is skippable after two seconds, and
   * carries its own sound the whole way.
   *
   * The quiet state still gets no cinematic at all (§7).
   */
  const [filmSettled, setFilmSettled] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const quiet = useQuiet();
  /**
   * ONE beat runs after the five answered STEPS: the reveal. The four cards
   * sit as a grid, the mind's-story card can be turned over to its other
   * side, and Chirpy walks the room owning up while the child looks — all on
   * the same screen, so nothing that belongs together is split across taps.
   *
   * It was two screens (a tap-through confession, then a separate "which one
   * will you carry?" question). Both are gone: the confession now talks by
   * itself while the cards are visible, and the choice is the card turn. A
   * child who flips the card back and forth IS holding both stories up
   * against each other, which is the thing the question was clumsily asking
   * them to do.
   *
   * Not a `Step` — nothing is asked — so it's a phase of the same stepIndex
   * counter rather than a sixth entry in that array. StepDots still counts
   * only the five real steps.
   */
  const phase: 'ask' | 'reveal' | 'done' =
    stepIndex < STEPS.length ? 'ask'
    : stepIndex === STEPS.length ? 'reveal'
    : 'done';
  // The reveal happens in the room the story step used — "the hinge" —
  // rather than cutting to Reflection early.
  const art = getRoom(phase === 'done' ? 'reflection' : phase === 'ask' ? step.room : 'story');
  const accent = art.palette.accent;

  // Each new step opens below the last answer, so the page follows the child
  // down rather than making them hunt for what just appeared.
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [stepIndex]);

  /** All four cards are on the table — the case is assembled. */
  const caseComplete = !!(answers.feeling && answers.body && answers.story && answers.eyes);
  const onFeelingStep = step.id === 'feeling' && phase === 'ask';
  const filmPlaying = onFeelingStep && !filmSettled && !quiet;

  const finishFeelingIntro = () => setFilmSettled(true);

  /**
   * The one way out, used by both exits.
   *
   * Clearing the quiet state on the way out is what the old "let's stop here
   * for now" button did, and it has to keep happening now that button is
   * gone: a child who tripped the quiet state on the way in would otherwise
   * be left in it with no way back, since nothing else in this walk turns it
   * off again.
   */
  const leave = () => { onQuiet(false); onFinish(answers); };

  const answer = (key: keyof DeepDiveAnswers, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStepIndex((i) => i + 1);
  };

  // The Different Story Room plays its lullaby while the two stories are up.
  // It stops when the child leaves the reveal, and on unmount, so it can
  // never follow them into another room.
  useEffect(() => {
    if (phase === 'reveal') {
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
          key={onFeelingStep ? 'feelingsfilm' : art.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* The Feelings Room IS the film — sharp and audible while it
              plays, then the same clip blurred and turning behind the balls
              once it recedes. One element throughout, so the room the child
              ends up looking at is visibly the one they just watched. Every
              other step keeps its painted still. */}
          {onFeelingStep
            ? <FeelingsIntro onDone={finishFeelingIntro} flash={orbFlash} />
            : <RoomScene room={art} dim={phase === 'ask' ? 0.25 : turned ? 0.08 : 0.55} />}
        </motion.div>
      </AnimatePresence>

      {/*
        THE ROOM ANSWERS THE FLIP.

        This is the whole thesis of the walk, delivered as a toy instead of
        a paragraph: turn the card to the other story and the room warms,
        brightens and lifts; turn it back and it cools. The child finds out
        with their thumb that changing the story changes the world, and they
        will do it eight times, which is eight repetitions of the lesson
        without a word of instruction. It is why the sentence that used to
        explain all this could be deleted.

        Not in the quiet state. A room that surges with light because a
        distressed child touched something is the app being pleased with
        itself at the wrong moment.
      */}
      <StoryLight on={turned && phase !== 'ask' && !quiet} />

      {/* Once the child has named it, the feeling turns up in the room and
          keeps them company for the rest of the walk. Not on the first step
          — there is nothing to be company about until they have answered,
          and putting a face on the screen while they choose would be the
          app suggesting one. */}
      <FloatingFeeling feeling={answers.feeling ?? null} />

      {/* The way back out, as a fitting on the left wall rather than a
          chevron in the corner. Present the whole time, asking nothing. */}
      <DoorHandle side="left" label="Leave" onClick={leave} accent={accent} />

      {/* Padded clear of both handles so nothing ever sits under them. */}
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-[68px] pb-10 pt-4 sm:px-20">
        <div className="flex items-center justify-between gap-3">
          <StepDots total={STEPS.length} at={stepIndex} accent={accent} />
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <div className="flex flex-1 flex-col gap-3 pt-5">
          {/* ── The chain so far, as four cards in two rows. ─────────────
              Top row is what the child brought in: the feeling, and where
              they found it. Bottom row is the two accounts of the same
              afternoon, side by side — the one their mind wrote, and the one
              their eyes actually saw. Reading down a column is the whole
              skill, and it only works if all four are visible at once, which
              is why they stopped being a scrolling stack.

              The fifth answer ("what else could be true") deliberately has
              no cell of its own: it is the BACK of the mind's-story card.
              Two accounts of one afternoon belong on one object with two
              faces, not as a fifth thing in a list — and turning it over is
              a better version of the question that used to be asked here in
              words. */}
          {stepIndex > 0 && (
            /* The set completing is a moment and nothing marked it. Four
               cards arriving one at a time is good; the fourth landing means
               the case is assembled, and a small settle and glow earns that
               beat without a word. Fires once — keyed on completeness, not
               repeated on every later render. */
            <motion.div
              className="grid grid-cols-2 items-stretch gap-3 rounded-[24px]"
              animate={caseComplete && !quiet
                ? { scale: [1, 1.025, 1], boxShadow: [`0 0 0px ${accent}00`, `0 0 42px -6px ${accent}`, `0 0 0px ${accent}00`] }
                : {}}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            >
              {answers.feeling && (
                <AnswerCard label="I felt" value={answers.feeling} accent={accent} />
              )}
              {answers.body && (
                <AnswerCard label="I noticed it in my" value={answers.body.join(', ')} accent={accent} />
              )}
              {answers.story && (
                <FlipLantern
                  frontLabel="What my mind said"
                  frontText={answers.story}
                  backLabel="What else could be true"
                  backText={answers.other ?? ''}
                  accent={accent}
                  canTurn={!!answers.other}
                  turned={turned}
                  onTurn={() => {
                    // Paper first, then the room's chime a beat later if this
                    // turn is the one that reveals the other story — the
                    // sound arrives with the light rather than before it.
                    sound.play('exitRoom');
                    setTurned((t) => {
                      if (!t) window.setTimeout(() => sound.play('discovery'), 260);
                      return !t;
                    });
                  }}
                />
              )}
              {answers.eyes && (
                <Lantern eyebrow="What actually happened" text={answers.eyes} hue="#8FD9C4" sway={7.6} icon="eye" />
              )}
            </motion.div>
          )}

          {/* ── The step being asked now ──────────────────────────────── */}
          {phase === 'ask' && !filmPlaying && (
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
                  onPick={(_, label) => { setTodaysFeeling(label); answer('feeling', label); }}
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

          {/* ── Chirpy owns up, while the cards stay up ────────────────
              The voice that wrote the child's story a moment ago admits, in
              its own words, that it guesses fast and gets it wrong — and it
              does so WITHOUT being tapped. It used to be a tap-through
              monologue on a screen of its own, which meant the cards it is
              about weren't on screen while it talked, and a child had to
              keep pressing to hear someone else's confession. He now paces
              the room and says it at his own speed, above the two stories he
              is talking about, and the child's hands are free to turn the
              card over while he does. */}
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4 pt-1"
            >
              {/* The instruction that used to live here is gone. The card
                  has a lifted corner, a shimmer and a wobble; turning it
                  floods the room with light. A seven-year-old does not need
                  "that's the interesting bit" explained to them — they need
                  it to happen. */}
              <WalkingChirpy lines={CONFESSION} turned={turned} />
              <Cta
                label="I've had a good look"
                onClick={() => { sound.play('discovery'); setStepIndex((i) => i + 1); }}
                accent={accent}
              />
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 pt-2"
            >
              <Chirpy pose="hopeful" line="Look at that. You worked all of that out yourself." align="left" />
              {/* A case the child worked, not a lesson they sat through. The
                  stamp says the not-knowing IS the finding — which is the
                  same idea the old paragraph laboured, in two words a child
                  can read at a glance. */}
              <CaseStamp accent={accent} />
              {/* The teaching the walk exists for, said once and not pressed:
                  a choice is available. The app does not make it, does not
                  ask them to declare it, and does not check later — a child
                  who is told which story to take home has been told how to
                  feel, and will start giving the answer they think is wanted
                  at the story step, which costs everything upstream. */}
              <SceneLine>You’re the one who decides which of them you carry about. And you can change your mind whenever you like.</SceneLine>
              {/* The one place in the whole walk where the child MAKES
                  something rather than choosing from something. Entirely
                  optional and entirely unmarked — there is no picture that
                  counts as trying harder than another. If they make one, it
                  rides along in the case that gets kept (see kit/cases.ts),
                  which is the only reason the Observatory ever has anything
                  to look at besides words. */}
              <DrawInvite accent={accent} onSave={(url) => setAnswers((a) => ({ ...a, drawing: url }))} />
              {/* No "Done" button. The way on is the handle on the right
                  wall, which has been there the whole walk — the child
                  leaves through the room, not through a form. */}
              <DoorHandle
                side="right"
                label="Go on"
                onClick={() => { sound.play('resolve'); leave(); }}
                accent={accent}
              />
            </motion.div>
          )}

          {/* scrollIntoView({block:'end'}) above aligns this element's
              bottom edge with the viewport's, so each new step opens fully
              in view rather than half-under the fold. */}
          <div ref={bottom} className="scroll-mb-4" />
        </div>
      </div>

    </div>
  );
}

/* ── An answer, kept on screen ───────────────────────────────────────── */

/** Top-row card: a plain statement of something the child brought in. */
function AnswerCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col justify-start rounded-[18px] px-3.5 py-3 backdrop-blur-md"
      style={{ background: 'rgba(12,10,26,0.52)', border: `1px solid ${CHROME.pillBorder}` }}
    >
      <p className="text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em]" style={{ color: accent }}>
        {label}
      </p>
      <p className="mt-1 text-[14px] font-bold leading-snug" style={{ color: CHROME.text }}>
        {value}
      </p>
    </motion.div>
  );
}

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
 * One account of the afternoon, as a hanging lantern.
 *
 * Both bottom-row lanterns are identical apart from the colour of their
 * flame. The mind's story gets no crack, no thorn, no red — nothing that
 * tells a child which one the app would like them to believe. If the
 * preferred answer is visible, they will pick it to be agreeable and learn
 * nothing, which wastes the whole walk that got them here.
 *
 * They sway very slightly, out of phase with each other, so the pair reads
 * as two things hanging in a room rather than two boxes in a form.
 */
function Lantern({
  eyebrow,
  text,
  hue,
  sway,
  hint,
  icon,
  peel,
}: {
  eyebrow: string;
  text: string;
  hue: string;
  /** Seconds per sway. Fixed per lantern rather than random, so the two are
   *  out of phase with each other without the render being impure. */
  sway: number;
  /** A quiet line at the foot — only the turnable one has anything to say. */
  hint?: string;
  /**
   * The bottom row is a confrontation, not two more list items, and four
   * identical cards were hiding that. A thought bubble on what the mind
   * said, an open eye on what actually happened: the distinction lands
   * before the eyebrow text is read, which for a seven-year-old means it
   * lands at all.
   */
  icon?: 'thought' | 'eye';
  /** The turnable card lifts a corner, so nobody has to be told it turns. */
  peel?: boolean;
}) {
  const m = useMotion();
  return (
    <motion.div
      animate={m.loop ? { rotate: peel ? [-1.8, 1.8, -1.8] : [-0.9, 0.9, -0.9] } : undefined}
      transition={m.loop ? { rotate: { repeat: Infinity, duration: peel ? sway * 0.7 : sway, ease: 'easeInOut' } } : undefined}
      className="relative flex h-full min-h-[168px] flex-col items-center gap-1.5 overflow-hidden rounded-[22px] px-3 pb-3 pt-4 text-center backdrop-blur-md"
      style={{
        transformOrigin: 'top center',
        background: `linear-gradient(180deg, ${hue}33 0%, rgba(12,10,26,0.58) 62%)`,
        border: `1px solid ${hue}77`,
        boxShadow: `0 0 34px -14px ${hue}`,
      }}
    >
      {/*
        THE CORNER THAT IS ALREADY LIFTING, with warm light showing under
        it, a shimmer that sweeps the card every few seconds, and a wobble.
        The ⤾ glyph was too polite; a card that looks alive needs no
        instruction above it, which is what let the instruction go.
      */}
      {peel && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-0 w-0"
            style={{
              borderTop: '22px solid #FFD98A',
              borderLeft: '22px solid transparent',
              borderTopRightRadius: 22,
              filter: 'drop-shadow(-2px 3px 5px rgba(0,0,0,0.5))',
            }}
          />
          {m.loop && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[22px]"
              style={{
                background:
                  'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.28) 50%, transparent 62%)',
              }}
              animate={{ backgroundPositionX: ['-160%', '160%'] }}
              transition={{ repeat: Infinity, duration: 2.4, repeatDelay: 3.2, ease: 'easeInOut' }}
            />
          )}
        </>
      )}

      {icon && (
        <span aria-hidden style={{ color: hue, opacity: 0.95 }}>
          {icon === 'thought' ? <MessageCircle size={17} strokeWidth={2.6} /> : <Eye size={17} strokeWidth={2.6} />}
        </span>
      )}

      {/* The flame. Same size in both; only the colour differs. */}
      <motion.span
        className="block h-6 w-6 shrink-0 rounded-full"
        style={{ background: hue, filter: `blur(1px) drop-shadow(0 0 14px ${hue})` }}
        animate={m.loop ? { opacity: [0.75, 1, 0.75], scale: [1, 1.08, 1] } : undefined}
        transition={m.loop ? { repeat: Infinity, duration: 2.8, ease: 'easeInOut' } : undefined}
      />
      <p className="text-[9.5px] font-extrabold uppercase leading-tight tracking-[0.14em]" style={{ color: hue }}>
        {eyebrow}
      </p>
      <p className="text-[13.5px] font-extrabold leading-snug" style={{ color: CHROME.text, textWrap: 'balance' }}>
        {text}
      </p>
      {hint && (
        <p className="mt-auto pt-1 text-[9.5px] font-bold" style={{ color: CHROME.textSoft }}>
          {hint}
        </p>
      )}
    </motion.div>
  );
}

/**
 * The mind's story — with its other side on the back.
 *
 * Two accounts of one afternoon live on one object with two faces, so
 * turning it is a physical version of the thing this whole walk teaches:
 * the same day, read another way. It replaces a screen that asked "which of
 * these will you carry?" in words and made the child commit to an answer —
 * this asks nothing, records nothing, and can be turned back and forth as
 * many times as they like, which is closer to what actually helps.
 *
 * Both faces sit in the same CSS grid cell so the card is as tall as its
 * longer side and neither face is clipped when it comes round.
 */
function FlipLantern({
  frontLabel, frontText, backLabel, backText, canTurn, turned, onTurn, accent,
}: {
  frontLabel: string;
  frontText: string;
  backLabel: string;
  backText: string;
  accent: string;
  /** False until the child has answered "what else could be true" — until
   *  then there is genuinely nothing on the back to turn to. */
  canTurn: boolean;
  turned: boolean;
  onTurn: () => void;
}) {
  return (
    <motion.button
      onClick={canTurn ? onTurn : undefined}
      disabled={!canTurn}
      whileTap={canTurn ? { scale: 0.97 } : undefined}
      className="relative w-full rounded-[22px] text-left"
      style={{
        perspective: 1000,
        // A soft ring of the room's own light, so the turnable card is
        // visibly the live one among the four.
        boxShadow: canTurn ? `0 0 26px -8px ${accent}` : 'none',
      }}
      aria-label={canTurn ? `Turn the card over. Showing: ${turned ? backLabel : frontLabel}` : frontLabel}
    >
      <motion.div
        className="grid h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: turned ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.3, 1.2, 0.4, 1] }}
      >
        <div style={{ gridArea: '1 / 1', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <Lantern
            eyebrow={frontLabel}
            text={frontText}
            hue="#C48BE8"
            sway={6.4}
            icon="thought"
            peel={canTurn}
          />
        </div>
        <div
          style={{
            gridArea: '1 / 1',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Lantern eyebrow={backLabel} text={backText} hue="#FFD98A" sway={7.2} icon="thought" peel />
        </div>
      </motion.div>
    </motion.button>
  );
}

/**
 * Chirpy, pacing the room and talking to himself.
 *
 * He advances his own lines on a timer rather than waiting to be tapped —
 * the child's hands are busy turning the card over, and a confession that
 * has to be prodded out of someone line by line isn't a confession, it's a
 * form. Timing is per line and proportional to its length, so the short ones
 * don't sit there and the long ones aren't yanked away.
 *
 * He stops on the last line rather than looping. Nothing here advances the
 * screen; the child leaves when they're ready, from the button below him.
 */
function WalkingChirpy({ lines, turned }: { lines: string[]; turned: boolean }) {
  const [i, setI] = useState(0);
  const quiet = useQuiet();
  const m = useMotion();

  /**
   * THE PAYOFF THAT DIDN'T EXIST.
   *
   * The child just taught Chirpy something. He should be visibly surprised
   * by it — that inverts the authority the right way round: the small one
   * explaining, the guide learning. It interrupts whatever he was confessing
   * and then hands back, because a reaction that queues politely behind a
   * monologue is not a reaction.
   */
  const [reacting, setReacting] = useState(false);
  const seen = useRef(false);
  useEffect(() => {
    if (!turned) { seen.current = false; return; }
    if (seen.current) return;
    seen.current = true;
    setReacting(true);
    const t = window.setTimeout(() => setReacting(false), 3200);
    return () => clearTimeout(t);
  }, [turned]);

  useEffect(() => {
    if (i >= lines.length - 1) return; // he's said his piece; he waits.
    const t = window.setTimeout(() => setI((n) => n + 1), Math.max(3400, lines[i].length * 58));
    return () => clearTimeout(t);
  }, [i, lines]);

  // He is absent whenever the interface has gone quiet — the one rule about
  // him that has no exceptions.
  if (quiet) return null;

  const pose: ChirpyPose = reacting ? 'excited' : i < 2 ? 'worried' : i < 4 ? 'said1' : 'hopeful';
  const said = reacting ? 'Oh! I didn’t think of that one. You’re better at this than me.' : lines[i];

  return (
    <div className="flex flex-col gap-1">
      {/* The bubble stays put. Only he moves — a speech bubble that wanders
          about is a lovely idea and unreadable for a six-year-old. */}
      <div className="min-h-[64px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={reacting ? 'reaction' : i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="rounded-[20px] px-4 py-2.5 text-[14.5px] font-extrabold leading-snug shadow-xl"
            style={{ background: 'rgba(255,255,255,0.95)', color: '#241D3D' }}
          >
            {said}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative h-[86px] w-full">
        {/* He jumps when it lands. Nothing else on this screen does, so the
            child reads it as him reacting to them rather than as decoration. */}
        <motion.img
          src={chirpySprite(pose)}
          alt="Chirpy"
          className="absolute bottom-0"
          style={{ height: 78, width: 'auto', filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.55))' }}
          // scaleX flips him to face the way he's walking. When the child
          // turns the card he stops pacing and jumps on the spot instead —
          // he has just been told something and is not going to keep
          // strolling through it.
          animate={
            reacting
              ? { y: [0, -26, 0, -14, 0], rotate: [0, -8, 6, -3, 0], scale: [1, 1.12, 1, 1.06, 1] }
              : m.loop
                ? { left: ['2%', '58%', '18%', '66%', '2%'], scaleX: [1, 1, -1, 1, -1] }
                : { left: '2%' }
          }
          transition={
            reacting
              ? { duration: 1.1, ease: 'easeOut' }
              : m.loop
                ? { duration: 32, repeat: Infinity, ease: 'easeInOut', times: [0, 0.28, 0.5, 0.78, 1] }
                : undefined
          }
          draggable={false}
        />
      </div>
    </div>
  );
}

/**
 * THE ROOM, WHEN THE OTHER STORY IS SHOWING.
 *
 * Warm light floods up from the floor, motes lift through it, and the whole
 * scene goes a few degrees warmer. It arrives over about a second — fast
 * enough to feel caused by the thumb that turned the card, slow enough not
 * to be a flash. Turning back takes it away just as smoothly, which is what
 * makes the pair worth doing again.
 */
function StoryLight({ on }: { on: boolean }) {
  return (
    <AnimatePresence>
      {on && (
        <motion.div
          aria-hidden
          /* No z-index. z-[1] put the warm grade OVER the four cards and
             washed the text off them — the light is supposed to fill the
             room behind the case, not shine through the paper. With z-auto
             it paints above the room art (which precedes it) and below the
             content (which follows it), purely by DOM order. */
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {/* Light off the floor. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 62% at 50% 104%, rgba(255,214,150,0.5) 0%, rgba(255,186,120,0.22) 34%, transparent 70%)',
            }}
          />
          {/* A warmer grade over the whole room. */}
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{ background: 'linear-gradient(180deg, rgba(255,196,120,0.5) 0%, rgba(255,164,96,0.28) 100%)' }}
          />
          {LIFT.map((p, i) => (
            <motion.span
              key={i}
              className="absolute block rounded-full"
              style={{
                left: `${p.x}%`,
                width: p.s,
                height: p.s,
                background: i % 2 ? '#FFE7B4' : '#FFD08A',
                boxShadow: '0 0 12px rgba(255,214,150,0.9)',
              }}
              initial={{ bottom: '-4%', opacity: 0 }}
              animate={{ bottom: '86%', opacity: [0, 0.95, 0] }}
              transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Deterministic — random numbers during render are a purity error. */
const LIFT = Array.from({ length: 14 }, (_, i) => ({
  x: 4 + ((i * 27) % 92),
  s: 3 + ((i * 13) % 5),
  dur: 5.4 + ((i * 7) % 30) / 10,
  delay: ((i * 11) % 40) / 10,
}));

/**
 * The ending, as the stamp on a case file rather than a paragraph about
 * epistemology. "Nobody knows which one is true" read as an anticlimax; a
 * case that stays open reads as the good ending, and children like an
 * unsolved case. Same idea, two words, no reading age required.
 */
function CaseStamp({ accent }: { accent: string }) {
  const m = useMotion();
  return (
    <motion.div
      className="self-start rounded-[10px] px-3.5 py-2"
      initial={{ opacity: 0, scale: 1.5, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: -7 }}
      transition={m.quiet ? { duration: 0.5 } : { type: 'spring', stiffness: 260, damping: 13, delay: 0.3 }}
      style={{ border: `2.5px solid ${accent}`, background: 'rgba(12,10,26,0.4)' }}
    >
      <p
        className="text-[15px] font-extrabold uppercase leading-none tracking-[0.16em]"
        style={{ color: accent, fontFamily: FONT }}
      >
        Case stays open
      </p>
    </motion.div>
  );
}

/**
 * THE COLOURS ON OFFER — one steady "ink" plus the six feeling hues from
 * FeelingBalls (kit/checkinContent.ts's FEELINGS), so a knot a child draws
 * uses the same palette as the room where they first named the feeling.
 * Not decorative: it's the one piece of continuity between "I felt scared"
 * as a tapped word, three steps ago, and scared as a colour they choose now.
 */
const INK = '#2B2438';
const DRAW_COLORS = [
  INK,
  'hsl(44 85% 55%)',  // happy
  'hsl(22 85% 55%)',  // excited
  'hsl(212 70% 55%)', // sad
  'hsl(8 75% 58%)',   // angry
  'hsl(268 55% 64%)', // scared
  'hsl(180 55% 45%)', // worried
];

/**
 * THE ONE PLACE IN THE WALK WHERE THE CHILD MAKES SOMETHING.
 *
 * Everything else in the deep dive is picking from what's offered — a
 * feeling ball, a body zone, a maybe. This is the single exception, and it
 * stays optional the whole way through: a ghost pill to start, "Never mind"
 * to back out mid-drawing, and a blank canvas at "Keep this" is treated as
 * changing your mind rather than as an empty answer to be nagged about.
 *
 * NEVER MARKED, same as everywhere else here. There is no picture that
 * counts as trying harder than another, no gallery ranking one drawing
 * above the last, and nothing that treats an abstract scribble as "less
 * finished" than a recognisable one — the point was making a mark, not
 * making art.
 */
function DrawInvite({ accent, onSave }: { accent: string; onSave: (dataUrl: string) => void }) {
  const m = useMotion();
  const [stage, setStage] = useState<'invite' | 'drawing' | 'saved'>('invite');
  const [color, setColor] = useState(INK);
  const [thumb, setThumb] = useState<string | null>(null);
  const canvas = useRef<DrawingCanvasHandle>(null);

  if (stage === 'invite') {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => { sound.play('tap'); setStage('drawing'); }}
        className="mx-auto flex items-center gap-2 rounded-[999px] px-4 text-[13.5px] font-bold backdrop-blur-md"
        style={{ minHeight: m.target, background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
      >
        <Paintbrush size={16} strokeWidth={2.4} />
        Draw what the knot looked like
      </motion.button>
    );
  }

  if (stage === 'saved' && thumb) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-1.5">
        <div
          className="flex items-center gap-3 rounded-[18px] px-3.5 py-3 backdrop-blur-md"
          style={{ background: 'rgba(12,10,26,0.52)', border: `1px solid ${CHROME.pillBorder}` }}
        >
          <img src={thumb} alt="" className="h-16 w-16 shrink-0 rounded-[10px] object-cover" />
          <p className="text-[13px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
            Kept, right there in your case.
          </p>
        </div>
        <button
          onClick={() => { canvas.current?.clear(); setStage('drawing'); }}
          className="ml-1 text-[12px] font-bold"
          style={{ color: CHROME.textSoft }}
        >
          Draw a different one
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5">
      <SceneLine>Any way at all. It doesn’t need to look like anything.</SceneLine>

      <DrawingCanvas ref={canvas} color={color} />

      <div className="flex items-center justify-center gap-2">
        {DRAW_COLORS.map((c) => (
          <button
            key={c}
            aria-label="Choose this colour"
            aria-pressed={c === color}
            onClick={() => setColor(c)}
            className="rounded-full transition"
            style={{
              width: 30,
              height: 30,
              background: c,
              border: c === color ? '3px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.25)',
              boxShadow: c === color ? '0 0 0 2px rgba(0,0,0,0.35)' : 'none',
            }}
          />
        ))}
      </div>

      <div className="flex gap-2.5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { sound.play('roomCard'); canvas.current?.clear(); }}
          className="flex items-center justify-center gap-1.5 rounded-[999px] px-4 text-[13.5px] font-bold"
          style={{ minHeight: m.target, background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
        >
          <RotateCcw size={15} strokeWidth={2.4} />
          Clear
        </motion.button>
        <div className="flex-1">
          <Cta
            label="Keep this"
            accent={accent}
            onClick={() => {
              // A blank canvas at "Keep this" reads as changing your mind,
              // not as an answer that needs a nudge — this walk never nags.
              if (canvas.current?.isBlank()) { setStage('invite'); return; }
              const url = canvas.current?.toDataURL() ?? '';
              sound.play('discovery');
              onSave(url);
              setThumb(url);
              setStage('saved');
            }}
          />
        </div>
      </div>

      <button onClick={() => setStage('invite')} className="mx-auto text-[12px] font-bold" style={{ color: CHROME.textSoft }}>
        Never mind
      </button>
    </motion.div>
  );
}

