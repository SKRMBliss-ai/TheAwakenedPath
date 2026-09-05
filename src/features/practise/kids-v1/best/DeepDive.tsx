import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getRoom, type RoomId } from '../rooms';
import { CHROME, Cta, FONT, BackButton, GrownUpExit, Pill, Question, SceneLine } from '../ui/chrome';
import { Chirpy, RoomScene } from '../ui/scene';
import { BodyMap } from '../ui/bodyMap';
import { BODY_ZONE_LABEL, type BodyZoneId } from '../ui/bodyZones';
import { THOUGHTS, MAYBES } from '../kit/checkinContent';
import { FeelingBalls } from './FeelingBalls';
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
  onQuiet,
}: {
  onFinish: (answers: DeepDiveAnswers) => void;
  onGrownUp: () => void;
  onQuiet: (q: boolean) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<DeepDiveAnswers>({});
  const [bodyZones, setBodyZones] = useState<Set<BodyZoneId>>(new Set());
  const bottom = useRef<HTMLDivElement>(null);

  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const done = stepIndex >= STEPS.length;
  const art = getRoom(done ? 'reflection' : step.room);
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

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* The room cross-fades with the step — one building, several rooms. */}
      <AnimatePresence>
        <motion.div
          key={art.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <RoomScene room={art} dim={0.25} />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-5 pb-10 pt-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={() => onFinish(answers)} label="Leave" />
          <StepDots total={STEPS.length} at={stepIndex} accent={accent} />
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <div className="flex flex-1 flex-col gap-3 pt-5">
          {/* ── The chain so far. This is the point of the screen. ────── */}
          {STEPS.slice(0, stepIndex).map((s) => {
            const v = answers[s.id === 'feeling' ? 'feeling' : s.id === 'body' ? 'body' : s.id];
            if (!v) return null;
            return <AnswerCard key={s.id} step={s} value={Array.isArray(v) ? v.join(', ') : v} accent={accent} />;
          })}

          {/* ── The step being asked now ──────────────────────────────── */}
          {!done && (
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
                <FeelingBalls onPick={(_, label) => answer('feeling', label)} />
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

          {/* ── The end of the walk ───────────────────────────────────── */}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 pt-2"
            >
              <Chirpy pose="hopeful" line="Look at that. You worked all of that out yourself." align="left" />
              <Question room={art}>
                Two stories, both fitting the same day. We don’t know which is true — that’s the interesting bit.
              </Question>
              <Cta label="Done" onClick={() => { sound.play('resolve'); onFinish(answers); }} accent={accent} />
            </motion.div>
          )}

          <div ref={bottom} />
        </div>
      </div>

      {/* The quiet state's own way out, on every step. */}
      {!done && (
        <button
          onClick={() => { onQuiet(false); onFinish(answers); }}
          className="fixed inset-x-0 bottom-3 mx-auto w-fit rounded-full px-4 py-2 text-[12px] font-bold backdrop-blur-md"
          style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.textSoft }}
        >
          Let’s stop here for now
        </button>
      )}
    </div>
  );
}

/* ── An answer, kept on screen ───────────────────────────────────────── */

const CARD_LABEL: Record<StepId, string> = {
  feeling: 'I felt',
  body: 'I noticed it in my',
  story: 'My mind said',
  eyes: 'My eyes saw',
  other: 'It could also be',
};

function AnswerCard({ step, value, accent }: { step: Step; value: string; accent: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[18px] px-4 py-2.5 backdrop-blur-md"
      style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}` }}
    >
      <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em]" style={{ color: accent }}>
        {CARD_LABEL[step.id]}
      </p>
      <p className="mt-0.5 text-[14px] font-bold leading-snug" style={{ color: CHROME.text }}>
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
