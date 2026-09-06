import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS } from '../../../kids/data';
import { Onboarding } from '../../../kids/Onboarding';
import { RewardsScreen, Friends } from '../../../kids/screens';
import { CHROME, Cta, FONT, QuietProvider, BackButton, GrownUpExit } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import { BoyAndChirpy, RoomScene } from '../ui/scene';
import { chirpySprite } from '../ui/sprites';
import { skyNow, roomPoster, storageFallback } from '../rooms';
import { GrownUp } from '../GrownUp';
import { DeepDive } from './DeepDive';
import { DoorHandle } from '../ui/DoorHandle';
import { FloatingJar } from './FloatingJar';
import { HelpChirpy } from './HelpChirpy';
import { ReflectionRoom } from './ReflectionRoom';
import { VIRTUE_ROOMS, PAUSE_ROOM, artRoomFor, type VirtueRoom } from './rooms';
import { VirtueRoomView } from './VirtueRoomView';
import { VillageRow } from './VillageRow';
import { ChirpyRemembers } from './ChirpyRemembers';
import { ReleasedSky } from './LetThemGo';
import { TheVisitor } from './TheVisitor';
import { NoteFound } from './NoteFound';
import { LeaveANote } from './LeaveANote';
import { OneMinute } from './OneMinute';
import { recollectionForToday, type ChirpyRecollection } from '../kit/chirpyMemory';
import { reportingDay, type ReportingDay } from '../kit/reportingDay';
import { visitorForToday, type Visitor } from '../kit/visitor';
import { noteWaiting, type Note } from '../kit/notes';
import { welcomeBackLine } from '../kit/awayFor';
import { saveCase } from '../kit/cases';
import { greetByName, stopSpeaking } from '../kit/chirpyVoice';
import { COMPANY } from '../kit/feelingCompanions';
import { markVisit, releasedCount } from '../kit/sky';
import * as sound from '../kit/sound';

/**
 * MIND GYM — the one app.
 *
 * This replaces both halves of what was here before. My Best Every Day had
 * the engine that works and looked like a checklist; Kids Gym v1 had the
 * world that works and asked too much of a child before they cared. This is
 * the first with the second painted onto it.
 *
 * WHAT A CHILD ACTUALLY DOES, in order:
 *
 *   1. Opens it. Sees seven rooms, each glowing with the points they've
 *      already earned there. No question is asked yet.
 *   2. Goes into a room. Ticks whether they managed that virtue today —
 *      which is the entire product, and takes one tap.
 *   3. Maybe plays a game in there, or reads the one small thing.
 *   4. If something is still bothering them, ONE situation goes through the
 *      five steps with Chirpy. Once a day. Offered, never demanded.
 *
 * Step 2 is the product. Steps 3 and 4 are why they come back. The old v1
 * made step 4 the front door, which is why it felt like hard work.
 *
 * NOTHING RESETS. The store is My Best Every Day's existing one, unchanged,
 * so every point, tick, streak and badge already earned still counts.
 */

type View =
  | { at: 'map' }
  /** `step` is the position in the run when the child is on the journey. */
  | { at: 'room'; room: VirtueRoom; step: number | null }
  | { at: 'pause' }
  | { at: 'deep' }
  | { at: 'helpchirpy' }
  | { at: 'reflection' }
  | { at: 'friends' }
  | { at: 'rewards' }
  | { at: 'grownup' }
  /** The parent's note composer. Nothing to do with 'grownup', which is the
   *  safety screen — see LeaveANote's note on why they must not be conflated. */
  | { at: 'leavenote' }
  /** The short way in, for an evening with nothing in the tank. */
  | { at: 'oneminute' };

/**
 * WALKING THROUGH, NOT FADING THROUGH.
 *
 * Every screen change used to be the same soft fade, which is what an app does
 * when one page swaps for another. This app claims to be a building, and the
 * whole of its navigation is door handles — so a room should arrive the way a
 * room does when you walk into it: through a doorway that opens.
 *
 * The doorway is an inset() clip-path with its top corners rounded, growing
 * from a small arch at the foot of the screen until it is the screen. Same
 * arch as the fittings in DoorHandle, so one motif carries the app.
 *
 * Both keyframes are written with identical structure — four insets, four
 * radii, all in percent — because framer-motion interpolates a clip-path
 * string by walking the numbers in it. Drop the `round` from one side, or
 * mix px and %, and the animation silently becomes a hard cut.
 *
 * `plain` is the reduced-motion and quiet-state path: the old fade, unchanged.
 */
const ARCH_SHUT = 'inset(84% 43% 0% 43% round 44% 44% 0% 0%)';
const ARCH_OPEN = 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)';

function archWipe(plain: boolean) {
  if (plain) {
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.28 },
    };
  }
  return {
    initial: { clipPath: ARCH_SHUT, opacity: 0.4 },
    animate: { clipPath: ARCH_OPEN, opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      clipPath: { duration: 0.52, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.22 },
    },
  };
}

export default function BestApp({ onExitGym }: { onExitGym: () => void }) {
  const onboarded = useKidStore((s) => s.onboarded);
  const completions = useKidStore((s) => s.completions);

  /** Same arithmetic as the Observatory's jar — one per virtue per day it was
   *  ticked. The one-minute door shows it back as a plain fact. */
  const lifetimeFireflies = BEHAVIOURS.reduce(
    (n, b) => n + Object.values(completions).filter((day) => day[b.id]).length,
    0,
  );
  const [view, setView] = useState<View>({ at: 'map' });
  const [quiet, setQuiet] = useState(false);
  const reduced = useReducedMotion();

  /**
   * WHICH DAY THIS WHOLE SESSION IS ABOUT — decided once, on arrival, and
   * then held.
   *
   * It cannot be recomputed per render, because the rule that picks it
   * ("yesterday, if yesterday is still empty") is invalidated by the very
   * first tick the child makes: they answer the Kindness Garden for
   * yesterday, yesterday is no longer empty, the next render says "today",
   * and the room they are still standing in flips to a day with nothing in
   * it — so their tick reads as having done nothing at all. Deciding it at
   * the door and passing it down is what stops the app changing the subject
   * mid-sentence.
   */
  const [reporting] = useState(() => reportingDay(useKidStore.getState().completions));

  // The two reasons a screen change stays a plain fade: the child asked their
  // device for less motion, or the app has quietened itself because they're
  // upset (§7). A doorway sweeping open is a flourish, and a flourish is the
  // first thing to go in both cases.
  const plainMotion = quiet || !!reduced;

  if (!onboarded) return <Onboarding />;

  const back = () => setView({ at: 'map' });

  /**
   * The journey: room by room, in order, ending at the Observatory. Answering
   * one room carries the child to the next, so the day's round is a walk
   * through a building rather than seven separate trips out to a menu.
   */
  const startJourney = () => {
    sound.play('enterRoom');
    setView({ at: 'room', room: VIRTUE_ROOMS[0], step: 0 });
  };

  const nextRoom = (step: number) => {
    const next = step + 1;
    if (next >= VIRTUE_ROOMS.length) {
      sound.play('resolve');
      setView({ at: 'reflection' });
      return;
    }
    sound.play('roomCard');
    setView({ at: 'room', room: VIRTUE_ROOMS[next], step: next });
  };

  return (
    <QuietProvider quiet={quiet}>
      <div className="min-h-[100svh] w-full" style={{ background: 'linear-gradient(170deg,#1B1030 0%,#0A0616 100%)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view.at + (view.at === 'room' ? view.room.id : '')}
            {...archWipe(plainMotion)}
          >
            {view.at === 'map' && (
              <RoomMap
                reporting={reporting}
                onOpen={(r) => { sound.play('roomCard'); setView({ at: 'room', room: r, step: null }); }}
                onStartJourney={startJourney}
                onDeepDive={() => setView({ at: 'deep' })}
                onHelpChirpy={() => setView({ at: 'helpchirpy' })}
                onPause={() => setView({ at: 'pause' })}
                onOneMinute={() => setView({ at: 'oneminute' })}
                onExitGym={onExitGym}
                onGrownUp={() => setView({ at: 'grownup' })}
              />
            )}

            {view.at === 'room' && (
              <VirtueRoomView
                room={view.room}
                reporting={reporting}
                journey={view.step !== null ? { index: view.step, total: VIRTUE_ROOMS.length } : undefined}
                onExit={back}
                onGrownUp={() => setView({ at: 'grownup' })}
                onDeepDive={() => setView({ at: 'deep' })}
                onNext={view.step !== null ? () => nextRoom(view.step as number) : undefined}
              />
            )}

            {view.at === 'deep' && (
              <DeepDive
                onQuiet={setQuiet}
                onGrownUp={() => setView({ at: 'grownup' })}
                /* The five answers used to be dropped here. They are the
                   hardest thinking in the app and the only material the
                   Observatory can show a child about themselves. */
                onFinish={(answers) => { saveCase(answers); back(); }}
              />
            )}

            {view.at === 'helpchirpy' && (
              <HelpChirpy onExit={back} onGrownUp={() => setView({ at: 'grownup' })} />
            )}

            {view.at === 'pause' && <PauseRoom onExit={back} />}
            {view.at === 'reflection' && (
              <ReflectionRoom
                onExit={back}
                onGrownUp={() => setView({ at: 'grownup' })}
                onLeaveNote={() => setView({ at: 'leavenote' })}
              />
            )}
            {/* Back to the Observatory, not the hub — it is the only way in
                here, and a grown-up who came to read what was shown to them
                should land where they were rather than at the front door. */}
            {view.at === 'leavenote' && <LeaveANote onBack={() => setView({ at: 'reflection' })} />}
            {view.at === 'oneminute' && (
              <OneMinute lifetimeFireflies={lifetimeFireflies} onExit={back} />
            )}
            {view.at === 'friends' && <Panel onClose={back}><Friends /></Panel>}
            {view.at === 'rewards' && <Panel onClose={back}><RewardsScreen /></Panel>}
            {view.at === 'grownup' && <GrownUp onBack={back} />}
          </motion.div>
        </AnimatePresence>

        {/* The bottom bar. Friendship and rewards live here rather than as
            rooms on the map, because they aren't things you practise — they're
            things you go and look at. */}
        {(view.at === 'map' || view.at === 'room') && (
          <BottomBar
            onFriends={() => setView({ at: 'friends' })}
            onRewards={() => setView({ at: 'rewards' })}
            onReflection={() => setView({ at: 'reflection' })}
            onPause={() => setView({ at: 'pause' })}
          />
        )}
      </div>
    </QuietProvider>
  );
}

/* ── The map ─────────────────────────────────────────────────────────── */

function RoomMap({
  reporting,
  onOpen,
  onStartJourney,
  onDeepDive,
  onHelpChirpy,
  onPause,
  onOneMinute,
  onExitGym,
  onGrownUp,
}: {
  /** The day this session is answering for — see BestApp, where it's fixed. */
  reporting: ReportingDay;
  onOpen: (r: VirtueRoom) => void;
  onStartJourney: () => void;
  onDeepDive: () => void;
  onHelpChirpy: () => void;
  onPause: () => void;
  onOneMinute: () => void;
  onExitGym: () => void;
  onGrownUp: () => void;
}) {
  const name = useKidStore((s) => s.name);
  const completions = useKidStore((s) => s.completions);
  const pointsByBehaviour = useKidStore((s) => s.pointsByBehaviour);

  /**
   * The jar has to show the same day the rooms are writing to. Before the
   * afternoon that can be YESTERDAY (see kit/reportingDay) — and a hub still
   * showing an empty "today" while the rooms filed a tick against yesterday
   * would mean a child taps a firefly in and watches nothing arrive.
   */
  const today = completions[reporting.key] ?? {};
  const caughtToday = VIRTUE_ROOMS.filter((r) => today[r.id]).map((r) => r.id);
  const doneCount = caughtToday.length;

  // The sky the child actually walks in under — dawn, midday, dusk or night,
  // on their own clock. Never announced; it's just what the place looks like
  // at that hour.
  const night = skyNow();

  /**
   * Whether Chirpy has something of theirs to bring back tonight — usually
   * not; see kit/chirpyMemory for the rest interval. Read once on arrival
   * rather than every render, so it can't appear mid-session or vanish under
   * the child's finger, and skipped entirely in the quiet state.
   */
  const quiet = useQuiet();
  const [recollection, setRecollection] = useState<ChirpyRecollection | null>(null);
  useEffect(() => {
    if (!quiet) setRecollection(recollectionForToday());
  }, [quiet]);

  /**
   * And whether anybody else is in tonight — almost never; see kit/visitor
   * for the odds and, more importantly, for why this is a guest rather than
   * an effect. Rolled once in an effect rather than during render, because
   * the roll writes to storage.
   */
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  useEffect(() => {
    if (!quiet) setVisitor(visitorForToday());
  }, [quiet]);

  /**
   * And whether anyone at home has left them anything. Read on arrival so a
   * note written while the child is looking at the hub doesn't materialise
   * under their hands — it will be there next time, which is how notes work.
   */
  const [note, setNote] = useState<Note | null>(null);
  useEffect(() => { setNote(noteWaiting()); }, []);

  /**
   * And whether this is a coming-back, after a real absence. Read once on
   * arrival because the call stamps today as seen — see kit/awayFor, and
   * particularly its list of the things this must never say.
   */
  const [welcomeBack, setWelcomeBack] = useState<string | null>(null);
  useEffect(() => { setWelcomeBack(welcomeBackLine()); }, []);

  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{
        fontFamily: FONT,
        background: `linear-gradient(168deg, ${night.ground[0]} 0%, ${night.ground[1]} 100%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(52% 38% at 76% 12%, ${night.glow} 0%, transparent 72%)` }}
      />

      {/* Every firefly the child has taken to the Observatory and let go of,
          drifting in the gym's own sky. Never counted anywhere on screen —
          a number beside it would turn letting go into scoring. */}
      <ReleasedSky count={releasedCount()} />

      {/* Somebody who isn't Chirpy, roughly one evening in twenty, saying one
          thing and then going. Nothing anywhere calls it rare. */}
      <AnimatePresence>
        {visitor && <TheVisitor visitor={visitor} onGone={() => setVisitor(null)} />}
      </AnimatePresence>

      <DoorWall
        onFireflies={onStartJourney}
        onStuck={onDeepDive}
        onChirpy={onHelpChirpy}
      />

      {/* Tonight's lights, standing at the foot of the door that fills it.
          Movable, and it remembers where it was put. */}
      <FloatingJar caught={caughtToday} />

      <div className="relative mx-auto w-full max-w-6xl px-[74px] pb-32 pt-4 sm:px-20">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={onExitGym} label="Leave the gym" />
          <GrownUpExit onClick={onGrownUp} />
        </div>

        {/*
          THE WELCOME GETS OUT OF THE WAY.

          It used to be a fixed 300-odd pixels of hello — the pair at full
          size, the big name, the level line, the progress line — which meant
          the rooms themselves started below the fold on a phone and a child
          had to scroll to find the thing they came for. It now says hello
          properly for five seconds and then folds itself into a single line,
          with a chime and a scatter of sparks so the fold reads as a small
          piece of magic rather than as the layout twitching.

          Five seconds because that's about how long the greeting is worth
          looking at, and because nothing here is a countdown a child has to
          beat — the rooms are already tappable underneath while it plays.
        */}
        {/* Reclaims the width the door handles reserve. The greeting lives
            at the top of the page and the fittings hang at three-quarters
            height, so these two never share a line — and "Hello, Shaarav"
            deserves to be one. */}
        <div className="-mx-[58px] sm:mx-0">
          <WelcomeBanner
            name={name}
            doneCount={doneCount}
            total={VIRTUE_ROOMS.length}
          />
        </div>

        {/*
          BACK AFTER A WHILE. Chirpy's own news, never a word about the gap —
          see kit/awayFor. Dismissed by tapping it, and gone for the day
          either way.
        */}
        <AnimatePresence>
          {welcomeBack && (
            <motion.button
              key="welcomeback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              onClick={() => setWelcomeBack(null)}
              className="mt-3 flex w-full items-center gap-2.5 rounded-[20px] px-3.5 py-3 text-left backdrop-blur-md"
              style={{
                background: CHROME.pill,
                border: '1px solid rgba(143,217,196,0.45)',
              }}
            >
              <img
                src={chirpySprite('excited')}
                alt=""
                aria-hidden
                draggable={false}
                className="h-9 w-9 shrink-0 select-none"
              />
              <span className="text-[13.5px] font-bold leading-snug" style={{ color: CHROME.text }}>
                {welcomeBack}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/*
          THE SHORT WAY IN, and deliberately not a fourth door.

          The three fittings on the right wall are the things there are to
          DO here; a fourth brass handle beside them would read as a fourth
          activity, which is the opposite of what this is. It's one quiet
          line saying the app will take a minute if a minute is all there
          is — phrased as capacity rather than as feeling, because a
          six-year-old on a bad evening can tell you he doesn't want to do
          much long before he can tell you he's sad.
        */}
        <button
          onClick={onOneMinute}
          className="mt-3 block text-[12.5px] font-bold"
          style={{ color: CHROME.textSoft, minHeight: 40 }}
        >
          Only got a minute? Come and sit down →
        </button>

        {/* A note somebody at home left them, folded, waiting to be opened.
            Above Chirpy's recollection because it came from a person. */}
        <AnimatePresence>
          {note && <NoteFound note={note} onDone={() => setNote(null)} />}
        </AnimatePresence>

        {/* Every so often — see kit/chirpyMemory for how rarely — he brings
            back something they said weeks ago, mostly right. Never in the
            quiet state: a child who is already upset is not asked to go back
            to an afternoon that upset them. */}
        <AnimatePresence>
          {recollection && (
            <ChirpyRemembers
              recollection={recollection}
              onDone={() => setRecollection(null)}
            />
          )}
        </AnimatePresence>

        {/*
          TWO DOORS, SIDE BY SIDE.

          They were stacked, with the jar leading and the knot underneath, to
          avoid implying a child should do both every day. Side by side says
          the same thing better: two doors in a wall, you pick one, you don't
          walk through both. What keeps them from reading as a daily
          checklist is that neither is marked, counted or ticked — they're
          places, not tasks.

          Drawn as lit archways rather than rows, because a door you can see
          light spilling out from under is a more inviting thing to a
          six-year-old than a rectangle with a title in it.
        */}
        {/*
          The two journeys have left the scroll flow entirely — they are the
          hub's own left and right doors now (see the DoorHandles above this
          container), so they cost the rooms nothing at all. What used to be
          110px of cards here is 0px.
        */}

        {/* Chirpy's ask used to be a card here, and the map a small grey
            link under it. Both are doors on the right wall now — see
            DoorWall. The map is still reachable from the bottom bar's
            "Look back", which is where a child goes looking for it. */}

        <h2 className="mt-5 text-[15.5px] font-extrabold" style={{ color: CHROME.text, fontFamily: FONT }}>
          Or pick a room
        </h2>

        {/* THE STREET, above the posters. The same seven rooms drawn as
            buildings you walk past — lit by what's been done in each — with
            the painted cards still underneath for now, so the two ways of
            showing a room can be watched side by side before either wins. */}
        <div className="mt-3">
          <VillageRow
            rooms={VIRTUE_ROOMS}
            today={today}
            pointsByBehaviour={pointsByBehaviour}
            onOpen={onOpen}
            onPause={onPause}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {VIRTUE_ROOMS.map((r, i) => (
            <RoomCard
              key={r.id}
              room={r}
              index={i}
              doneToday={!!today[r.id]}
              earned={pointsByBehaviour[r.id] ?? 0}
              onClick={() => onOpen(r)}
            />
          ))}

          {/* Pause sits with them but is visibly not one of them — no tick,
              no points, no counter. Somewhere that asks nothing. */}
          <PauseCard onClick={onPause} />
        </div>
      </div>
    </div>
  );
}

/**
 * A room card, and it is deliberately the Kids Gym hub card: the same painted
 * poster art, the same aspect, the same scrim gradient, the same hover lift.
 * What's added is the only new information a virtue room has — whether it was
 * ticked today, and what has been earned in it.
 */
/* ── The welcome, and how it leaves ──────────────────────────────────── */

/** How long the full greeting stays before folding itself away. */
const WELCOME_MS = 2000;

/**
 * Says hello, then gets out of the way.
 *
 * Expanded it's the pair from the character sheet at full size, the child's
 * name, and where they're up to. Folded it's one line: a small Chirpy, the
 * name, and the same numbers. Everything below — the two doors, and the
 * rooms — rises by about 260px when it goes, which is the difference between
 * a child seeing the rooms on landing and having to scroll for them.
 *
 * `layout` on the shared container is what makes the rest of the page glide
 * up rather than jump. The sparks and the chime fire once, at the moment of
 * the fold, so it reads as the greeting doing something rather than the page
 * reflowing.
 */
function WelcomeBanner({
  name, doneCount, total,
}: {
  name: string;
  doneCount: number;
  total: number;
}) {
  const [dismissed, setDismissed] = useState(false);
  /** Recorded once per mount; the star for today arrives on the way in. */
  const [stars] = useState(() => markVisit());
  const [sparks, setSparks] = useState(false);
  const quiet = useQuiet();
  /* Derived rather than stored, so turning Calm mode on folds the greeting
     immediately without a second source of truth to keep in step. */
  const open = !dismissed && !quiet;

  useEffect(() => {
    // The quiet state gets the folded version from the start and no chime —
    // an upset child does not need a five-second flourish (§7).
    if (quiet || dismissed) return;
    const t = window.setTimeout(() => {
      setDismissed(true);
      setSparks(true);
      sound.play('discovery');
      window.setTimeout(() => setSparks(false), 1200);
    }, WELCOME_MS);
    return () => clearTimeout(t);
  }, [quiet, dismissed]);

  /*
    AND IT SAYS THE NAME OUT LOUD, ONCE.

    "Hello, Shaarav" was only ever text, which a child who can't read yet
    doesn't get at all — and being greeted by name is most of the reason
    this banner exists. So it's spoken on the way in, the same as every
    other line in the app (ui/scene's Chirpy).

    Once per visit, not once per hub. This component mounts again every
    single time a child comes back out of a room, and being told hello
    fourteen times in an evening is how a greeting turns into a nag —
    greetByName holds the "already said it" flag in the module, outside
    React, so the remounts can't reset it.
  */
  useEffect(() => {
    greetByName(name, quiet);
    return () => stopSpeaking();
  }, [name, quiet]);

  /**
   * No level, no points, no streak. The greeting used to read "Kindness
   * Explorer · 45 points · 2-day streak", which is a scoreboard bolted onto
   * an app whose own rules say nothing is scored — and the streak in
   * particular took something away on the days a child was too sad to come,
   * which are the days this is for. The sky only ever grows.
   */


  return (
    <motion.div layout className="relative flex flex-col items-center gap-1.5 pt-3 text-center">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="full"
            layout
            exit={{ opacity: 0, scale: 0.86, y: -18 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-2"
          >
            <BoyAndChirpy size={168} pose="excited" gaze="scene" />
            <h1
              className="text-[30px] font-extrabold leading-tight sm:text-[38px]"
              style={{ color: CHROME.text, letterSpacing: '-0.02em', fontFamily: FONT }}
            >
              {name ? `Hello, ${name}` : 'Mind Gym'}
            </h1>
            <StarSky count={stars} />
            <p className="max-w-sm text-[13.5px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
              {doneCount === 0
                ? 'Seven rooms. Go in and say how today actually went.'
                : doneCount === total
                  ? 'All seven, today. That’s the full rainbow.'
                  : `${doneCount} of ${total} rooms so far today.`}
            </p>
          </motion.div>
        ) : (
          /* Folded. Tappable, so a child who wants the big hello back can
             have it — nothing here is a one-way door. */
          <motion.button
            key="folded"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            onClick={() => setDismissed(false)}
            className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 backdrop-blur-md"
            style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}` }}
            aria-label="Show the welcome again"
          >
            <img
              src={chirpySprite('excited')}
              alt=""
              aria-hidden
              draggable={false}
              style={{ height: 34, width: 'auto', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
            />
            <span className="text-[14px] font-extrabold leading-none" style={{ color: CHROME.text }}>
              {name ? `Hello, ${name}` : 'Mind Gym'}
            </span>
            <span className="text-[11.5px] font-bold leading-none" style={{ color: CHROME.textSoft }}>
              {stars === 1 ? '1 night' : `${stars} nights`}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {sparks && <FoldSparks />}
    </motion.div>
  );
}

/** The scatter the greeting leaves behind. Fires once, decorative only. */
function FoldSparks() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-8 grid place-items-center">
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2 + (i % 3) * 0.2;
        const d = 70 + ((i * 29) % 60);
        return (
          <motion.span
            key={i}
            className="absolute block rounded-full"
            style={{
              width: 5 + ((i * 13) % 5),
              height: 5 + ((i * 13) % 5),
              background: i % 3 === 0 ? '#FFD98A' : i % 3 === 1 ? '#C48BE8' : '#FFFFFF',
              boxShadow: '0 0 12px rgba(255,214,150,0.9)',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7, opacity: 0, scale: 0.3 }}
            transition={{ duration: 1, ease: 'easeOut', delay: (i % 5) * 0.04 }}
          />
        );
      })}
    </span>
  );
}

/* ── The two doors ───────────────────────────────────────────────────── */

/**
 * One of the two journeys, drawn as a lit archway.
 *
 * An arch rather than a card because a door is a place you go through, and
 * that is the honest description of both of these — neither is a task to
 * complete. The light pooling at the threshold is doing the real work: it
 * says something is on in there, which is a far better invitation to a
 * six-year-old than any wording would be.
 *
 * Both doors are identical in size, shape and treatment; only the colour of
 * their light differs. Making the daily one bigger or brighter would tell a
 * child which one they're supposed to pick, and the whole point of having
 * two is that some days it's the other one.
 */
function RoomCard({
  room, index, doneToday, earned, onClick,
}: {
  room: VirtueRoom; index: number; doneToday: boolean; earned: number; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const art = artRoomFor(room);
  const accent = art.palette.accent;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={onClick}
      aria-label={`${room.name}${doneToday ? ', ticked today' : ''}`}
      className="group relative overflow-hidden rounded-[22px] text-left shadow-2xl transition-all duration-300"
      style={{
        background: art.palette.scrim,
        border: doneToday
          ? `1.5px solid ${accent}`
          : hover ? '1px solid rgba(255,255,255,0.42)' : '1px solid rgba(255,255,255,0.16)',
        boxShadow: doneToday
          ? `0 0 26px -6px ${accent}, 0 8px 24px rgba(0,0,0,0.35)`
          : hover ? `0 18px 40px ${art.palette.scrim}AA` : '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={roomPoster(art.id)}
          alt=""
          loading="lazy"
          draggable={false}
          className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) { img.style.visibility = 'hidden'; return; }
            img.dataset.fallback = 'true';
            img.src = storageFallback(`kids-rooms/full/${art.id}_full.webp`);
          }}
        />

        {doneToday && (
          <span
            className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full"
            style={{ background: accent, boxShadow: `0 0 16px -2px ${accent}` }}
          >
            <Check size={15} strokeWidth={3.5} color="#0E1A1C" />
          </span>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 pt-14"
          style={{
            background: `linear-gradient(0deg, ${art.palette.scrim}FA 0%, ${art.palette.scrim}CC 52%, ${art.palette.scrim}00 100%)`,
          }}
        >
          <p className="text-[14.5px] font-extrabold leading-tight sm:text-[16px]" style={{ color: CHROME.text }}>
            {room.name}
          </p>
          <p className="mt-1 text-[11px] font-extrabold" style={{ color: accent }}>
            {earned > 0 ? `${earned} pts` : 'not yet'}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function PauseCard({ onClick }: { onClick: () => void }) {
  const art = artRoomFor(PAUSE_ROOM);
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-[22px] text-left shadow-2xl"
      style={{ background: art.palette.scrim, border: '1px dashed rgba(255,255,255,0.34)' }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={roomPoster(art.id)}
          alt=""
          loading="lazy"
          draggable={false}
          className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) { img.style.visibility = 'hidden'; return; }
            img.dataset.fallback = 'true';
            img.src = storageFallback(`kids-rooms/full/${art.id}_full.webp`);
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 pt-14"
          style={{
            background: `linear-gradient(0deg, ${art.palette.scrim}FA 0%, ${art.palette.scrim}CC 52%, ${art.palette.scrim}00 100%)`,
          }}
        >
          <p className="text-[14.5px] font-extrabold leading-tight sm:text-[16px]" style={{ color: CHROME.text }}>
            {PAUSE_ROOM.name}
          </p>
          <p className="mt-1 text-[11px] font-semibold" style={{ color: CHROME.textSoft }}>
            Any time. Nothing to do.
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Pause ───────────────────────────────────────────────────────────── */

function PauseRoom({ onExit }: { onExit: () => void }) {
  const art = artRoomFor(PAUSE_ROOM);
  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <RoomScene room={art} dim={0.2} />
      <div className="relative grid min-h-[100svh] place-items-center px-6">
        <div className="flex max-w-sm flex-col items-center gap-5 text-center">
          {/*
            THE PACER IS THE CALM PLATE — the boy sitting with his eyes shut
            and Chirpy asleep on his shoulder, rather than the standing
            sprite that carries lines everywhere else.

            This is the one room where he is not company but an instrument:
            the child breathes to his rise and fall, so he does NOT get the
            draggable companion treatment the other rooms give him
            (ui/FloatingFeeling). Dragging the thing you are breathing to
            stops it being a thing you can breathe to, and a second boy on
            screen beside this one would be two of him.
          */}
          <motion.img
            src={COMPANY.src}
            alt=""
            aria-hidden
            className="h-36 w-auto"
            draggable={false}
            style={{ filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.55))' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          />
          <p className="text-[22px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
            Nothing to catch in here.
          </p>
          <p className="text-[15px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
            Breathe in while he floats up. Out while he comes down. That’s all this room does.
          </p>
          <Cta label="I’m ready" onClick={onExit} accent={art.palette.accent} />
        </div>
      </div>
    </div>
  );
}

/* ── Panels that wrap the existing My Best screens ───────────────────── */

function Panel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="min-h-[100svh]" style={{ background: 'linear-gradient(180deg,#FDF4FF 0%,#F0F9FF 100%)', color: '#3A2E4F' }}>
      <div className="mx-auto max-w-md px-4 pb-28 pt-4 sm:max-w-xl">
        <button onClick={onClose} className="mb-3 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-bold shadow">
          ← Back to the rooms
        </button>
        {children}
      </div>
    </div>
  );
}

/* ── Bottom bar ──────────────────────────────────────────────────────── */

function BottomBar({
  onFriends, onRewards, onReflection, onPause,
}: {
  onFriends: () => void; onRewards: () => void; onReflection: () => void; onPause: () => void;
}) {
  const points = useKidStore((s) => s.points);
  const rewards = useKidStore((s) => s.rewards);

  const items = [
    { key: 'friends', emoji: '🤝', label: 'Friends', onClick: onFriends, badge: null as string | null },
    { key: 'rewards', emoji: '🎁', label: 'Rewards', onClick: onRewards, badge: rewards.length ? String(rewards.length) : null },
    { key: 'look', emoji: '🔭', label: 'Look back', onClick: onReflection, badge: null },
    { key: 'pause', emoji: '🌙', label: 'Pause', onClick: onPause, badge: null },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto mb-3 flex max-w-md items-center justify-around rounded-full px-2 py-2 shadow-2xl sm:max-w-lg"
        style={{ background: 'rgba(28,18,46,0.94)', border: '1px solid rgba(255,255,255,0.16)', marginInline: 12 }}>
        {items.map((it) => (
          <button key={it.key} onClick={it.onClick}
            className="relative flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5">
            <span className="text-[19px]">{it.emoji}</span>
            <span className="text-[9px] font-extrabold text-white/70">{it.label}</span>
            {it.badge && (
              <span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-extrabold"
                style={{ background: '#FFB703', color: '#2B1A05' }}>{it.badge}</span>
            )}
          </button>
        ))}
        <div className="ml-1 rounded-full px-3 py-1.5 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <span className="block text-[13px] font-extrabold leading-none text-white">{points}</span>
          <span className="block text-[8px] font-bold text-white/55">points</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ONE STAR PER DAY THE CHILD CAME.
 *
 * The replacement for "2-day streak". It only ever grows: come every day
 * and it fills quickly, come once a fortnight and it fills slowly, and
 * nothing is ever taken back. A child who was too sad to open the app on
 * Tuesday has not lost anything on Wednesday, which is the entire point.
 *
 * Past twelve it stops drawing every star and says the number instead —
 * a hundred dots is noise, and the sky should stay a picture rather than
 * becoming the scoreboard it replaced.
 */
function StarSky({ count }: { count: number }) {
  const m = useMotion();
  const shown = Math.min(count, 12);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: shown }).map((_, i) => (
          <motion.span
            key={i}
            className="block rounded-full"
            style={{
              width: 7,
              height: 7,
              background: '#FFE7B4',
              boxShadow: '0 0 10px rgba(255,214,150,0.95)',
            }}
            animate={m.loop ? { opacity: [0.55, 1, 0.55] } : undefined}
            transition={m.loop
              ? { repeat: Infinity, duration: 2.6 + (i % 4) * 0.7, ease: 'easeInOut', delay: (i % 5) * 0.3 }
              : undefined}
          />
        ))}
      </div>
      <p className="text-[13px] font-semibold" style={{ color: CHROME.textSoft }}>
        {count === 1 ? 'One night in the gym' : `${count} nights in the gym`}
      </p>
    </div>
  );
}

/* ── The right-hand wall ──────────────────────────────────────────────── */

/**
 * THREE DOORS, ONE WALL, ONE VOICE AT A TIME.
 *
 * They used to be spread about: fireflies on the left wall, the stuck door
 * on the right, and Chirpy's ask as a card down in the scroll with the map
 * as a small grey link beneath it. Four different shapes for four things a
 * child can do, and the two that looked like buttons were the two that
 * mattered least.
 *
 * All three are fittings on the same wall now. A child learns one gesture —
 * reach right, take the handle — and it works for every way out of this
 * screen. Stacking them also makes them read as a set rather than as one
 * control that happens to be there, which is most of why they were missed
 * when there was only ever one per wall.
 *
 * Lowest is easiest to reach, so the everyday journey sits at the bottom
 * and the two a child only wants on some days sit above it.
 *
 * WHY ONE SPEAKS EVERY SO OFTEN. At rest these are deliberately almost
 * invisible, and the honest cost of that is a child can look straight past
 * all three. So on a slow cycle one door says what it is, in its own
 * words, and then goes quiet again. One at a time: three tooltips at once
 * is a menu, and a menu is the thing this navigation exists not to be.
 */

/**
 * Module-level so the wording doesn't re-roll on every render. The first
 * line of each pool is that door's own label, so the first thing a nudge
 * ever does is repeat the name before it starts finding other words for it.
 */
const FIREFLY_TIPS = [
  'My Firefly Jar',
  'How did today go?',
  'Been good at something today?',
  'Come and light one up',
];

const STUCK_TIPS = [
  'How Are You Feeling Today?',
  'Something on your mind?',
  'Had a rubbish bit today?',
];

const CHIRPY_TIPS = [
  'Something’s Bugging Chirpy — Find Out What',
  'Got a funny feeling? Come and check',
  'Chirpy’s got a funny feeling',
  'He won’t say what it is. Come and see?',
];

/** How long between nudges, and how long a nudge hangs about. */
const NUDGE_EVERY_MS = 15000;
const NUDGE_HOLD_MS = 3600;

function DoorWall({
  onFireflies,
  onStuck,
  onChirpy,
}: {
  onFireflies: () => void;
  onStuck: () => void;
  onChirpy: () => void;
}) {
  const m = useMotion();
  // Which door speaks, and what it says — picked together, in the timer, so
  // no child render-cycle has to reach for Math.random() to decide.
  const [speaking, setSpeaking] = useState<{ door: 0 | 1 | 2; line: string } | null>(null);

  useEffect(() => {
    // Never in the quiet state. A child who is upset does not need three
    // doors taking it in turns to call out to them — the effect simply
    // doesn't start the cycle, rather than starting it and then clearing
    // state back out, so there is nothing to reset on the way in.
    if (m.quiet) return;
    const pools = [FIREFLY_TIPS, STUCK_TIPS, CHIRPY_TIPS] as const;
    let hold: number | undefined;
    const cycle = window.setInterval(() => {
      const door = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      const pool = pools[door];
      setSpeaking({ door, line: pool[Math.floor(Math.random() * pool.length)] });
      hold = window.setTimeout(() => setSpeaking(null), NUDGE_HOLD_MS);
    }, NUDGE_EVERY_MS);
    return () => {
      clearInterval(cycle);
      if (hold) clearTimeout(hold);
    };
  }, [m.quiet]);

  // If the quiet state turns on mid-nudge, stop showing it — computed at
  // render time rather than via a second effect writing state.
  const active = m.quiet ? null : speaking;

  return (
    <>
      <DoorHandle
        side="right"
        bottomVh={20}
        /*
          "Catch the Fireflies" was an instruction, and it described the
          animation rather than the thing. What's actually behind this door
          is a child saying how their day went, virtue by virtue, and the jar
          is where those answers end up — so the door is named for the jar,
          and the jar is theirs. Possessive on purpose: the two doors above
          are questions for the days something is wrong, and this one is a
          place that belongs to them and is open every night regardless.
        */
        label="My Firefly Jar"
        nudge={active?.door === 0 ? active.line : null}
        onClick={onFireflies}
        accent="#FFC65C"
        peephole="fireflies"
      />
      <DoorHandle
        side="right"
        bottomVh={42}
        label="How Are You Feeling Today?"
        nudge={active?.door === 1 ? active.line : null}
        onClick={onStuck}
        accent="#C48BE8"
        peephole="thread"
      />
      <DoorHandle
        side="right"
        bottomVh={64}
        label="Something’s Bugging Chirpy — Find Out What"
        nudge={active?.door === 2 ? active.line : null}
        onClick={onChirpy}
        accent="#8FD9C4"
        peephole="pacer"
      />
    </>
  );
}
