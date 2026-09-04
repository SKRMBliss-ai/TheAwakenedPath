import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Send, Square } from 'lucide-react';
import { getRoom, type RoomConfig, type RoomId } from './rooms';
import { CHROME, Cta, FONT, BackButton, GrownUpExit, Pill, Question, SceneLine } from './ui/chrome';
import { useMotion, useQuiet } from './ui/quiet';
import { Chirpy, RoomScene } from './ui/scene';
import { BodyMap } from './ui/bodyMap';
import { BODY_ZONE_LABEL, type BodyZoneId } from './ui/bodyZones';
import { FEELINGS, SIZES, GOODBITS, THOUGHTS, SITUATIONS, MAYBES, type FeelingDef } from './kit/checkinContent';
import * as sound from './kit/sound';
import { isSpeechSupported, startListening } from './kit/speech';
import { mostFrequentFeeling, type CheckInEntry, type Progress } from './progress';

/**
 * The check-in — P-01 through P-08. The front door, and the router.
 *
 * P-01 is the highest-value screen in the app (master plan §9): it is the
 * only place a child says how they actually feel, and everything downstream
 * branches off it. A pleasant feeling goes to what made it good and then out
 * to the rooms — a child who is fine should not be walked through a
 * reflection path about a problem they haven't got. An unpleasant one walks
 * the spine: body, thought, situation, the story, other maybes, reflection.
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
 * THE SPINE HAPPENS IN THE ROOMS THEMSELVES. Every screen's background is the
 * actual matching room, not a neutral check-in scene: the opener happens in
 * the Feelings Room, the body scan in Body Detective, the thought screen (and
 * `maybes`) in the Thought Room, and so on (see `screenRoomId` below).
 *
 * THE FEELING SCREEN IS A PYRAMID, not a grid of pills — six bubbles in three
 * rows, tapped exactly like a pill would be. When this device has picked the
 * same feeling twice or more, one bubble carries a quiet "you often feel
 * this" marker (see FeelingPyramid) — never a redirect, never a value
 * judgement, just a mirror.
 *
 * THE BODY SCREEN IS A MAP, not a list — a warm, rounded, non-anatomical
 * figure (ui/bodyMap.tsx) the child taps directly, and the only screen here
 * that is deliberately multi-select: a feeling doesn't always live in one
 * place, so tapping doesn't auto-advance the way every other screen does —
 * there's a "That's it" CTA once at least one zone (or "all over"/"I can't
 * tell") is picked. A dashed ring may suggest a zone based on the feeling
 * picked, always as a possibility ("some people notice this in their..."),
 * never as a right answer to confirm.
 *
 * THE EYES TEST HAS BEEN REMOVED. The story screen used to lead into a
 * "camera sort" step before the maybes screen; it tested more like a puzzle
 * than an invitation, so `story` now goes straight to `maybes`, framed as
 * teaching Chirpy a happier way of thinking rather than as another test —
 * and `maybes` now lives in the Thought Room, with its choices floating the
 * same way the thought screen's do, rather than the Different Story Room's
 * stacked list.
 *
 * THE SITUATION SCREEN TAKES FREE TEXT. "Something else" and "I'd rather not
 * say" are gone; in their place is a text box (with a mic for speech-to-text
 * where the browser supports it) so a child can say what happened in their
 * own words instead of picking the closest preset.
 *
 * ANSWERS ARE NOW SAVED ON-DEVICE. Every finished check-in — feeling, body
 * zones, thought, situation, and the "what else could be true" pick — is
 * appended to a capped local log (progress.ts's `checkIns`), alongside the
 * feeling tally that already backed the pyramid's marker. Still local-only,
 * still no network call anywhere in this feature — see progress.ts for the
 * detail of what that log holds and why it's capped.
 */

type Screen =
  | 'feeling' | 'size' | 'goodbit'
  | 'body' | 'thought' | 'situation'
  | 'story' | 'maybes' | 'close';

const BODY_PLACES = ['My head', 'My chest', 'My tummy', 'My hands', 'All over', 'I can’t tell'];

/** Selection on the body map: a real zone, or one of the two map-less
 *  choices that sit beside it as plain pills. */
type BodySelection = BodyZoneId | 'all' | 'unsure';

/** Where people sometimes notice each unpleasant feeling — a possibility to
 *  suggest on the body map, never a right answer (§2.4). Feelings that skip
 *  the body screen entirely (the pleasant ones) have no entry. */
function suggestedBodyZone(feelingId: string | undefined): BodyZoneId | null {
  switch (feelingId) {
    case 'worried':
    case 'scared': return 'tummy';
    case 'angry':  return 'hands';
    case 'sad':    return 'chest';
    default:       return null;
  }
}

export function CheckIn({
  progress,
  onFeelingPicked,
  onCheckInSaved,
  onFinish,
  onGrownUp,
  onQuiet,
}: {
  /** This device's tallies — read for the pyramid's "you often feel this" marker. */
  progress: Progress;
  /** Called once per real feeling picked (never for "I don't know"), so the app shell can tally it. */
  onFeelingPicked: (feelingId: string) => void;
  /** Called once, when the check-in reaches its close screen, with the whole
   *  session's answers so the app shell can append them to the on-device log. */
  onCheckInSaved: (entry: Omit<CheckInEntry, 'at'>) => void;
  /** Called with the room the child should land in, or null for the hub. */
  onFinish: (goTo: string | null) => void;
  onGrownUp: () => void;
  /** Reports the quiet-state decision up to the app shell. */
  onQuiet: (quiet: boolean) => void;
}) {
  const [screen, setScreen] = useState<Screen>('feeling');
  const [feeling, setFeeling] = useState<(typeof FEELINGS)[number] | null>(null);
  const [bodyZones, setBodyZones] = useState<Set<BodySelection>>(new Set());
  const [situation, setSituation] = useState<string>('other');
  const [situationText, setSituationText] = useState('');
  const [thought, setThought] = useState<string>('');
  const [maybeChosen, setMaybeChosen] = useState('');
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<Screen[]>([]);
  const m = useMotion();
  const quiet = useQuiet();
  const timers = useRef<number[]>([]);
  const recognizer = useRef<ReturnType<typeof startListening>>(null);
  const saved = useRef(false);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    recognizer.current?.stop();
    sound.stopMusic();
  }, []);

  // The Story Room's music plays only while the story screen is up.
  useEffect(() => {
    if (screen === 'story') {
      sound.playMusic('storyTheme');
      return () => sound.stopMusic();
    }
  }, [screen]);

  // Save the whole session's answers once it actually reaches the close
  // screen — a `ref` guard rather than relying on `screen` alone, since
  // going back and forward again must not double-log the same check-in.
  useEffect(() => {
    if (screen === 'close' && !saved.current) {
      saved.current = true;
      onCheckInSaved({
        feeling: feeling?.id ?? null,
        bodyZones: Array.from(bodyZones),
        thought,
        situation: situationText.trim() || situation,
        maybe: maybeChosen,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

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

  /** A real feeling was picked (not "I don't know") — tally it and move on. */
  const pickFeeling = (f: FeelingDef) => {
    onFeelingPicked(f.id);
    setFeeling(f);
    advance(f.ok ? 'goodbit' : 'size');
  };

  const toggleBodyZone = (zone: BodyZoneId) => {
    setBodyZones((prev) => {
      // "All over" and "I can't tell" are exclusive with real zones and with
      // each other — tapping a real zone after either of those starts fresh.
      const next = new Set(prev.has('all') || prev.has('unsure') ? [] : prev);
      if (next.has(zone)) next.delete(zone); else next.add(zone);
      return next;
    });
  };

  const toggleMic = () => {
    if (listening) {
      recognizer.current?.stop();
      recognizer.current = null;
      setListening(false);
      return;
    }
    const rec = startListening(
      (text) => setSituationText((prev) => (prev ? `${prev} ${text}` : text)),
      () => setListening(false),
    );
    if (rec) {
      recognizer.current = rec;
      setListening(true);
    }
  };

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
                  {quiet ? (
                    <Grid>
                      {FEELINGS.map((f) => (
                        <Pill
                          key={f.id}
                          label={f.label}
                          onClick={() => pickFeeling(f)}
                          accent={room.palette.accent}
                        />
                      ))}
                    </Grid>
                  ) : (
                    <FeelingPyramid
                      accent={room.palette.accent}
                      usualId={mostFrequentFeeling(progress)}
                      onPick={pickFeeling}
                    />
                  )}
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

              {/* ── P-02 · the body · a map, not a list ──────────────── */}
              {screen === 'body' && (() => {
                const suggested = suggestedBodyZone(feeling?.id);
                return quiet ? (
                  <>
                    <Question room={room}>Where do you feel it?</Question>
                    <SceneLine>There’s no right place. Yours lives wherever yours lives.</SceneLine>
                    <div className="flex flex-col" style={{ gap: m.gap }}>
                      {BODY_PLACES.map((b) => (
                        <Pill key={b} label={b} onClick={() => advance('thought')} accent={room.palette.accent} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Chirpy
                      pose="curious"
                      line={suggested
                        ? `Some people notice a ${feeling?.label.toLowerCase()} feeling in their ${BODY_ZONE_LABEL[suggested]}.`
                        : 'Where’s it sitting?'}
                      align="left"
                    />
                    <Question room={room}>Where do you notice it?</Question>
                    <SceneLine>
                      {suggested
                        ? 'Is that where you notice it? Tap wherever feels right — you can pick more than one.'
                        : 'There’s no right place. Tap wherever feels right — you can pick more than one.'}
                    </SceneLine>
                    <BodyMap
                      accent={room.palette.accent}
                      suggested={suggested}
                      selected={new Set(Array.from(bodyZones).filter((z): z is BodyZoneId => z !== 'all' && z !== 'unsure'))}
                      onToggle={toggleBodyZone}
                    />
                    <div className="flex gap-2.5">
                      <Pill
                        label="All over"
                        selected={bodyZones.has('all')}
                        onClick={() => setBodyZones(new Set(['all']))}
                        accent={room.palette.accent}
                      />
                      <Pill
                        label="I can’t tell"
                        selected={bodyZones.has('unsure')}
                        onClick={() => setBodyZones(new Set(['unsure']))}
                        accent={room.palette.accent}
                      />
                    </div>
                    {bodyZones.size > 0 && (
                      <Cta label="That’s it" onClick={() => advance('thought')} accent={room.palette.accent} />
                    )}
                  </>
                );
              })()}

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

              {/* ── P-04 · the situation · the most sensitive screen ──
                  No "something else"/"I'd rather not say" pills any more —
                  a free-text box (with speech-to-text where the browser
                  supports it) replaces both, so a child says it their own
                  way instead of picking the closest preset. */}
              {screen === 'situation' && (
                <>
                  <Question room={room}>What happened?</Question>
                  <div className="flex flex-col" style={{ gap: m.gap }}>
                    {SITUATIONS.map((s) => (
                      <Pill key={s.id} label={`${s.emoji}  ${s.label}`} onClick={() => { setSituation(s.id); advance('story'); }} accent={room.palette.accent} />
                    ))}
                  </div>
                  <SituationTextBox
                    value={situationText}
                    onChange={setSituationText}
                    listening={listening}
                    onToggleMic={toggleMic}
                    accent={room.palette.accent}
                  />
                  {situationText.trim() && (
                    <Cta
                      label="That’s it"
                      onClick={() => { setSituation('other'); advance('story'); }}
                      accent={room.palette.accent}
                    />
                  )}
                </>
              )}

              {/* ── P-05 · the story · the hinge ────────────────────── */}
              {screen === 'story' && (
                <>
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.2em]" style={{ color: room.palette.accent }}>
                    Here’s the story Chirpy made out of the situation
                  </p>
                  <Question room={room}>
                    {situationText.trim()
                      ? `So — ${situationText.trim()}, and your mind said “${thought || 'something about you'}”.`
                      : SITUATIONS.find((s) => s.id === situation)
                        ? `So — ${SITUATIONS.find((s) => s.id === situation)!.past}, and your mind said “${thought || 'something about you'}”.`
                        : `So — something happened, and your mind said “${thought || 'something about you'}”.`}
                  </Question>
                  <SceneLine>
                    That’s the story. Not a lie, not a mistake — just the one your mind reached for first.
                  </SceneLine>
                  <Cta
                    label="Let’s teach Chirpy a happy way of thinking"
                    onClick={() => advance('maybes')}
                    accent={room.palette.accent}
                  />
                </>
              )}

              {/* ── P-07 · other maybes · teaching Chirpy a happier way of
                  thinking, in the Thought Room, with the choices floating
                  the same way the thought screen's do. ──────────────── */}
              {screen === 'maybes' && (
                <>
                  {!quiet && <Chirpy pose="said3" line="Go on then — teach me a happier one!" align="left" />}
                  <Question room={room}>What else could be true?</Question>
                  <FloatingThoughts
                    items={[...maybes, 'None of these yet']}
                    accent={room.palette.accent}
                    onPick={(mb) => { setMaybeChosen(mb); advance('close'); }}
                  />
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
 * The feeling screen's pyramid — the same six feelings as before, in three
 * fixed rows (1 / 2 / 3) instead of a grid, so the shape reads as a pyramid
 * without the layout itself needing to encode anything. The rows never
 * reorder by how often a feeling is picked — a stable map matters more here
 * than showing the data more cleverly, and a shuffling layout would make the
 * "you often feel this" marker below harder to find, not easier.
 *
 * That marker is the one place frequency shows at all, and only once this
 * device has seen the same feeling picked twice or more (mostFrequentFeeling
 * in progress.ts). It's a plain caption pointing at a bubble, not a size
 * change, a colour that means "correct", or a tick — a child choosing
 * differently today is not choosing wrong (§2.4).
 */
function FeelingPyramid({
  accent,
  usualId,
  onPick,
}: {
  accent: string;
  usualId: string | null;
  onPick: (feeling: FeelingDef) => void;
}) {
  const rows: FeelingDef[][] = [
    [FEELINGS[0]],
    [FEELINGS[1], FEELINGS[2]],
    [FEELINGS[3], FEELINGS[4], FEELINGS[5]],
  ];

  return (
    <div className="flex flex-col items-center gap-3.5 py-1">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-3.5">
          {row.map((f) => (
            <FeelingBubble
              key={f.id}
              feeling={f}
              accent={accent}
              isUsual={f.id === usualId}
              onClick={() => onPick(f)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function FeelingBubble({
  feeling,
  accent,
  isUsual,
  onClick,
}: {
  feeling: FeelingDef;
  accent: string;
  isUsual: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center" style={{ width: 92 }}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        aria-label={feeling.label}
        className="grid place-items-center rounded-full px-2 text-center text-[14px] font-extrabold leading-tight backdrop-blur-md transition-colors"
        style={{
          height: 88,
          width: 88,
          color: CHROME.text,
          background: CHROME.pill,
          border: isUsual ? `2px solid ${accent}` : `1px solid ${CHROME.pillBorder}`,
          boxShadow: isUsual ? `0 0 22px -4px ${accent}` : 'none',
        }}
      >
        {feeling.label}
      </motion.button>
      {/* Reserved space whether or not this bubble carries it, so the row
          doesn't jump depending on which feeling is "usual". */}
      <p
        className="mt-1.5 min-h-[26px] text-center text-[10.5px] font-bold leading-tight"
        style={{ color: accent }}
      >
        {isUsual ? '▲ You often feel this' : ''}
      </p>
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
 * feel" is exactly the front door of the check-in. `maybes` now lives in the
 * Thought Room rather than Different Story: teaching Chirpy a happier way of
 * thinking is the same territory as noticing what your mind is saying, and
 * its floating-bubble layout matches the thought screen's. Reflection stays
 * for `situation` (laying out what happened); Different Story is `story`
 * alone now that the eyes test between them is gone.
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
    case 'maybes':    return 'thought';
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

/**
 * The situation screen's free-text box — where "Something else" and "I'd
 * rather not say" used to be. Styled as a rounded speech-bubble rather than
 * a form field, with a little tail pointing up toward the question above it,
 * so it reads as "tell me" rather than "fill this in". The mic only renders
 * where the browser actually supports speech-to-text (isSpeechSupported) —
 * a control that silently does nothing is worse than no control at all.
 */
function SituationTextBox({
  value,
  onChange,
  listening,
  onToggleMic,
  accent,
}: {
  value: string;
  onChange: (text: string) => void;
  listening: boolean;
  onToggleMic: () => void;
  accent: string;
}) {
  const micAvailable = isSpeechSupported();

  return (
    <div className="relative mt-1">
      {/* The speech-bubble tail. */}
      <div
        aria-hidden
        className="absolute -top-2 left-8 h-4 w-4 rotate-45"
        style={{ background: CHROME.pill, borderLeft: `1px solid ${CHROME.pillBorder}`, borderTop: `1px solid ${CHROME.pillBorder}` }}
      />
      <div
        className="relative flex items-end gap-2 rounded-[22px] px-4 py-3 backdrop-blur-md"
        style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}` }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or tell me in your own words…"
          rows={2}
          className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent text-[14.5px] font-semibold leading-snug outline-none placeholder:opacity-60"
          style={{ color: CHROME.text }}
        />
        {micAvailable && (
          <motion.button
            type="button"
            onClick={onToggleMic}
            whileTap={{ scale: 0.92 }}
            aria-label={listening ? 'Stop listening' : 'Say it instead of typing'}
            aria-pressed={listening}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
            animate={listening ? { boxShadow: [`0 0 0 0 ${accent}66`, `0 0 0 10px ${accent}00`] } : undefined}
            transition={listening ? { repeat: Infinity, duration: 1.4 } : undefined}
            style={{
              color: CHROME.text,
              background: listening ? accent : CHROME.pillSelected,
              border: `1px solid ${CHROME.pillBorder}`,
            }}
          >
            {listening ? <Square size={15} fill="currentColor" /> : <Mic size={18} />}
          </motion.button>
        )}
      </div>
      {value.trim() && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold" style={{ color: accent }}>
          <Send size={11} /> Tap "That’s it" when you’re ready
        </p>
      )}
    </div>
  );
}
