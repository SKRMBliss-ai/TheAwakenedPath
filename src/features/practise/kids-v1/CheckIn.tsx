import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getRoom, type RoomConfig, type RoomId } from './rooms';
import { CHROME, Cta, FONT, BackButton, GrownUpExit, Pill, Question, SceneLine } from './ui/chrome';
import { useMotion, useQuiet } from './ui/quiet';
import { Chirpy, RoomScene } from './ui/scene';
import { FEELINGS, SIZES, GOODBITS, THOUGHTS, SITUATIONS, MAYBES } from './kit/checkinContent';
import * as sound from './kit/sound';

/**
 * The check-in — P-01 through P-08. The front door, and the router.
 *
 * P-01 is the highest-value screen in the app (master plan §9): it is the
 * only place a child says how they actually feel, and everything downstream
 * branches off it. A pleasant feeling goes to what made it good and then out
 * to the rooms — a child who is fine should not be walked through a
 * reflection path about a problem they haven't got. An unpleasant one walks
 * the spine: body, thought, situation, the story, the eyes test, other
 * maybes, reflection.
 *
 * THE QUIET-STATE TRIGGER lives here, at the intensity screen. "Really big"
 * on an unpleasant feeling turns the whole interface down (see chrome.tsx's
 * QuietProvider) — motion stops, choices shrink, targets grow, Chirpy
 * disappears — and **none of it is announced**. It is a Stage-0 requirement,
 * not a later addition, precisely because it is much harder to retrofit than
 * to build in.
 *
 * Every screen auto-advances on selection, and every screen carries the
 * grown-up exit at the same position.
 *
 * THE SPINE HAPPENS IN THE ROOMS THEMSELVES. From the body screen onward, the
 * background is the actual matching room — not a neutral check-in scene —
 * so a child doing the body scan is standing in the Body Detective room, the
 * thought screen opens in the Thought Room, and so on (see `screenRoomId`
 * below). `feeling`, `size`, and `goodbit` stay in the generic check-in scene
 * because no room fits them yet — the feeling itself is what decides which
 * room the rest of the walk takes place in.
 */

type Screen =
  | 'feeling' | 'size' | 'goodbit'
  | 'body' | 'thought' | 'situation'
  | 'story' | 'eyes' | 'maybes' | 'close';

const BODY_PLACES = ['My head', 'My chest', 'My tummy', 'My hands', 'All over', 'I can’t tell'];

/** The eyes test — the camera sort, in child words (TEACHING_MOVES §10). */
const EYES = [
  { text: 'The thing that happened, out loud, in the room', answer: 'eyes' as const },
  { text: 'The bit about what it means about you', answer: 'head' as const },
];

export function CheckIn({
  onFinish,
  onGrownUp,
  onQuiet,
}: {
  /** Called with the room the child should land in, or null for the hub. */
  onFinish: (goTo: string | null) => void;
  onGrownUp: () => void;
  /** Reports the quiet-state decision up to the app shell. */
  onQuiet: (quiet: boolean) => void;
}) {
  const [screen, setScreen] = useState<Screen>('feeling');
  const [feeling, setFeeling] = useState<(typeof FEELINGS)[number] | null>(null);
  const [situation, setSituation] = useState<string>('other');
  const [thought, setThought] = useState<string>('');
  const [eyesStep, setEyesStep] = useState(0);
  const [history, setHistory] = useState<Screen[]>([]);
  const m = useMotion();
  const quiet = useQuiet();
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  // Which room the child is standing in for this screen — every screen of
  // the check-in happens inside a real room now, starting with the Feelings
  // Room for the opening "how are you feeling" beat (see `screenRoomId`).
  const room: RoomConfig = getRoom(screenRoomId(screen, feeling?.id));

  const go = (next: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) { onFinish(null); return; }
    setHistory((h) => h.slice(0, -1));
    setScreen(prev);
  };

  /** Tap → fill → pause → move. The auto-advance rule, in one place. */
  const advance = (next: Screen | (() => void)) => {
    sound.play('tap');
    timers.current.push(window.setTimeout(() => {
      if (typeof next === 'function') next(); else go(next);
    }, m.advanceMs));
  };

  const maybes = MAYBES[situation] ?? MAYBES.other;

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <RoomScene room={room} />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-5 pb-8 pt-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={back} />
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={m.transition}
              className="flex flex-col gap-5"
            >
              {/* ── P-01 · the front door, and the router ────────────── */}
              {screen === 'feeling' && (
                <>
                  <Chirpy pose="curious" line="How are you doing, then?" align="left" />
                  <Question room={room}>How are you feeling right now?</Question>
                  <Grid>
                    {FEELINGS.map((f) => (
                      <Pill
                        key={f.id}
                        label={f.label}
                        onClick={() => { setFeeling(f); advance(f.ok ? 'goodbit' : 'size'); }}
                        accent={room.palette.accent}
                      />
                    ))}
                  </Grid>
                  <Pill
                    label="I don’t know"
                    onClick={() => { setFeeling(null); advance('goodbit'); }}
                    accent={room.palette.accent}
                  />
                </>
              )}

              {/* ── intensity · the quiet-state trigger ─────────────── */}
              {screen === 'size' && (
                <>
                  {!quiet && <Chirpy pose="worried" line="Okay. How big is it?" align="left" />}
                  <Question room={room}>How big is the {feeling?.label.toLowerCase()} one?</Question>
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    {SIZES.map((s) => (
                      <Pill
                        key={s.id}
                        label={s.label}
                        onClick={() => {
                          // The trigger. Never announced — the interface just
                          // gets quieter from the next frame onwards.
                          if (s.id === 'really') onQuiet(true);
                          advance('body');
                        }}
                        accent={room.palette.accent}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* ── a pleasant feeling · what made it good ──────────── */}
              {screen === 'goodbit' && (
                <>
                  <Chirpy pose="excited" line="Oh good. What was it?" align="left" />
                  <Question room={room}>What made it a good one?</Question>
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    {GOODBITS.map((g) => (
                      <Pill key={g} label={g} onClick={() => advance('close')} accent={room.palette.accent} />
                    ))}
                  </div>
                </>
              )}

              {/* ── P-02 · the body ─────────────────────────────────── */}
              {screen === 'body' && (
                <>
                  {!quiet && <Chirpy pose="curious" line="Where’s it sitting?" align="left" />}
                  <Question room={room}>Where do you feel it?</Question>
                  <SceneLine>There’s no right place. Yours lives wherever yours lives.</SceneLine>
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    {BODY_PLACES.map((b) => (
                      <Pill key={b} label={b} onClick={() => advance('thought')} accent={room.palette.accent} />
                    ))}
                  </div>
                </>
              )}

              {/* ── P-03 · the thought · Chirpy guesses, and is often wrong ──
                  Rendered in the Thought Room, and the thoughts themselves
                  float rather than sitting in a stacked list — this is the
                  one screen in the app about a noisy, scattered mind, so the
                  choices get to look like that instead of like a form. */}
              {screen === 'thought' && (
                <>
                  {!quiet && <Chirpy pose="said2" line="I bet I know what it said. Do I?" align="left" />}
                  <Question room={room}>What’s your mind saying?</Question>
                  <FloatingThoughts
                    items={[...THOUGHTS, 'Something else']}
                    accent={room.palette.accent}
                    onPick={(t) => { setThought(t === 'Something else' ? 'something else' : t); advance('situation'); }}
                  />
                </>
              )}

              {/* ── P-04 · the situation · the most sensitive screen ── */}
              {screen === 'situation' && (
                <>
                  <Question room={room}>What happened?</Question>
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    {SITUATIONS.map((s) => (
                      <Pill key={s.id} label={`${s.emoji}  ${s.label}`} onClick={() => { setSituation(s.id); advance('story'); }} accent={room.palette.accent} />
                    ))}
                    <Pill label="Something else" onClick={() => { setSituation('other'); advance('story'); }} accent={room.palette.accent} />
                    <Pill label="I’d rather not say" onClick={() => { setSituation('other'); advance('story'); }} accent={room.palette.accent} />
                  </div>
                </>
              )}

              {/* ── P-05 · the story · the hinge ────────────────────── */}
              {screen === 'story' && (
                <>
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.2em]" style={{ color: room.palette.accent }}>
                    Here’s the story
                  </p>
                  <Question room={room}>
                    {SITUATIONS.find((s) => s.id === situation)
                      ? `So — ${SITUATIONS.find((s) => s.id === situation)!.past}, and your mind said “${thought || 'something about you'}”.`
                      : `So — something happened, and your mind said “${thought || 'something about you'}”.`}
                  </Question>
                  <SceneLine>
                    That’s the story. Not a lie, not a mistake — just the one your mind reached for first.
                  </SceneLine>
                  <Cta label="Have a proper look at it" onClick={() => advance('eyes')} accent={room.palette.accent} />
                </>
              )}

              {/* ── P-06 · the eyes test ────────────────────────────── */}
              {screen === 'eyes' && (
                <>
                  {!quiet && <Chirpy pose="hopeful" line="Try this one. It’s my favourite." align="left" />}
                  <SceneLine>Some of it your eyes saw. Some of it happened in here, where only you are.</SceneLine>
                  <Question room={room}>“{EYES[eyesStep].text}” — which one is that?</Question>
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    <Pill
                      label="My eyes saw that"
                      onClick={() => advance(eyesStep === 0 ? () => setEyesStep(1) : () => go('maybes'))}
                      accent={room.palette.accent}
                    />
                    <Pill
                      label="That happened in my head"
                      onClick={() => advance(eyesStep === 0 ? () => setEyesStep(1) : () => go('maybes'))}
                      accent={room.palette.accent}
                    />
                    <Pill
                      label="I can’t tell"
                      onClick={() => advance(eyesStep === 0 ? () => setEyesStep(1) : () => go('maybes'))}
                      accent={room.palette.accent}
                    />
                  </div>
                </>
              )}

              {/* ── P-07 · other maybes · lands on "we don't know" ──── */}
              {screen === 'maybes' && (
                <>
                  {!quiet && <Chirpy pose="said3" line="I never think of these ones." align="left" />}
                  <Question room={room}>What else could be true?</Question>
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    {maybes.map((mb) => (
                      <Pill key={mb} label={mb} onClick={() => advance('close')} accent={room.palette.accent} />
                    ))}
                    {/* Always available, and never smaller than the rest. */}
                    <Pill label="None of these yet" onClick={() => advance('close')} accent={room.palette.accent} />
                  </div>
                </>
              )}

              {/* ── P-08 · reflection · ends every session ──────────── */}
              {screen === 'close' && (
                <>
                  <Question room={room}>
                    {feeling?.ok
                      ? 'Good. That’s worth noticing too — the good ones go past fast if nobody stops for them.'
                      : 'We don’t actually know which one is true. That’s the interesting bit.'}
                  </Question>
                  {!quiet && <Chirpy pose="hopeful" line="Want to go and do something in a room?" align="left" />}
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    <Cta label="Take me to the rooms" onClick={() => onFinish(null)} accent={room.palette.accent} />
                    <Pill
                      label={feeling?.ok ? 'The Kindness Room' : 'The room that fits this'}
                      onClick={() => onFinish(suggestRoom(feeling?.id, quiet))}
                      accent={room.palette.accent}
                    />
                    <Pill label="That’s enough for now" onClick={() => onFinish(null)} accent={room.palette.accent} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* The quiet state's own way out. Not a cancel and not a
              confirmation — a real, plain, full-width exit that ends the
              session without finishing it, because a child who is having a
              hard time should not have to complete a flow to leave one.
              Required by the acceptance checklist (BUILD_BRIEF §7); sits
              below the screen so it is present on every step from the moment
              the state turns on. */}
          {quiet && screen !== 'close' && (
            <div className="pt-7">
              <Pill
                label="Let’s stop here for now"
                onClick={() => onFinish(null)}
                accent={room.palette.accent}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  const quiet = useQuiet();
  const m = useMotion();
  // One column in the quiet state. Fewer, larger, further apart (§2.6/§7).
  return (
    <div
      className={quiet ? 'flex flex-col' : 'grid grid-cols-2'}
      style={{ gap: m.gap }}
    >
      {children}
    </div>
  );
}

/**
 * Which room fits the feeling the child came in with. There isn't a
 * one-to-one room for all six feelings — Scared shares the Worry Room and
 * Happy/Excited share the Kindness Room — by design, per the room list in
 * rooms.ts; this is the single mapping everything else below reuses rather
 * than each screen guessing on its own.
 */
function feelingRoom(feelingId: string | undefined): RoomId {
  switch (feelingId) {
    case 'angry':   return 'anger';
    case 'worried': return 'worry';
    case 'scared':  return 'worry';
    case 'sad':     return 'bigfeelings';
    case 'happy':
    case 'excited': return 'kindness';
    default:        return 'feelings';
  }
}

/**
 * Which room the child is standing in for a given spine screen.
 *
 * `feeling`/`size`/`goodbit` open in the Feelings Room — "name what you
 * feel" is exactly the front door of the check-in. The eyes test sits in the
 * Thought Room rather than Reflection: sorting what your eyes actually saw
 * from what your mind added is the same territory as noticing what your
 * mind is saying, not a look-back — Reflection stays for `situation` (laying
 * out what happened) and pairs with `maybes` living in the Different Story
 * Room instead.
 */
function screenRoomId(screen: Screen, feelingId: string | undefined): RoomId {
  switch (screen) {
    case 'feeling':
    case 'size':
    case 'goodbit':   return 'feelings';
    case 'body':      return 'body';
    case 'thought':   return 'thought';
    case 'situation': return 'reflection';
    case 'story':     return 'story';
    case 'eyes':      return 'thought';
    case 'maybes':    return 'story';
    case 'close':     return feelingRoom(feelingId);
  }
}

/**
 * Which room fits what the child came in with, once the quiet state is
 * accounted for. Deliberately a suggestion offered beside "take me to the
 * rooms", never a forced redirect: a child who has just said they're angry
 * might want the Anger Room, or might very much not, and the app doesn't get
 * to decide that.
 *
 * When the quiet state is on, the answer is always the Pause Room. An upset
 * child needs company, not curriculum (TEACHING_MOVES §18) — every clever
 * room in the building is the wrong room at that moment.
 */
function suggestRoom(feelingId: string | undefined, quiet: boolean): string {
  if (quiet) return 'pause';
  return feelingRoom(feelingId);
}

/**
 * The thought screen's scattered layout — a handful of thought-bubbles
 * floating at fixed, hand-placed positions rather than stacked in a list,
 * because this is the one screen about a noisy mind. Falls back to the
 * ordinary stacked Pill list in the quiet state: scattered, moving targets
 * are the opposite of "fewer, larger, further apart" (§2.6/§7).
 */
const FLOAT_LAYOUT = [
  { top: '2%', left: '0%', rotate: -3 },
  { top: '0%', left: '54%', rotate: 2 },
  { top: '28%', left: '24%', rotate: -2 },
  { top: '34%', left: '58%', rotate: 3 },
  { top: '60%', left: '2%', rotate: 2 },
  { top: '64%', left: '52%', rotate: -1 },
];

function FloatingThoughts({
  items,
  accent,
  onPick,
}: {
  items: string[];
  accent: string;
  onPick: (item: string) => void;
}) {
  const quiet = useQuiet();
  const m = useMotion();

  if (quiet) {
    return (
      <div className="flex flex-col" style={{ gap: m.gap }}>
        {items.map((t) => (
          <Pill key={t} label={t} onClick={() => onPick(t)} accent={accent} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative" style={{ minHeight: 340 }}>
      {items.map((t, i) => {
        const pos = FLOAT_LAYOUT[i % FLOAT_LAYOUT.length];
        return (
          <motion.button
            key={t}
            onClick={() => onPick(t)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, y: [0, -7, 0] }}
            transition={{
              opacity: { duration: 0.3, delay: i * 0.08 },
              scale: { duration: 0.3, delay: i * 0.08 },
              y: { repeat: Infinity, duration: 4.5 + (i % 3) * 0.6, delay: i * 0.35, ease: 'easeInOut' },
            }}
            whileTap={{ scale: 0.96 }}
            className="absolute max-w-[62%] rounded-[20px] px-4 py-3 text-left text-[14px] font-bold leading-snug backdrop-blur-md sm:max-w-[46%]"
            style={{
              top: pos.top,
              left: pos.left,
              transform: `rotate(${pos.rotate}deg)`,
              color: CHROME.text,
              background: CHROME.pill,
              border: `1px solid ${CHROME.pillBorder}`,
              boxShadow: '0 10px 26px -12px rgba(0,0,0,0.6)',
            }}
          >
            {t}
          </motion.button>
        );
      })}
    </div>
  );
}
