import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { isMuted, setMuted } from '../../../../lib/sfx';
import { BEHAVIOURS } from '../../../kids/data';
import { RewardsScreen, Friends } from '../../../kids/screens';
import { CHROME, Cta, FONT, QuietProvider, BackButton, GrownUpExit } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import { BoyAndChirpy, RoomScene } from '../ui/scene';
import { BOY_SRC, BOY_SRCSET } from '../ui/sprites';
import { skyNow, timeOfDayForHour, type RoomId } from '../rooms';
import { GrownUp } from '../GrownUp';
import { DeepDive } from './DeepDive';
import { DoorHandle } from '../ui/DoorHandle';
import { GreetingBubble, HubRoom, MindGymMark, NeonDoorPill, RoomDome } from './HomeStage';
import { FloatingJar } from './FloatingJar';
import { HelpChirpy } from './HelpChirpy';
import { ReflectionRoom } from './ReflectionRoom';
import { VIRTUE_ROOMS, PAUSE_ROOM, artRoomFor, type VirtueRoom } from './rooms';
import { VirtueRoomView } from './VirtueRoomView';
import { ChirpyRemembers } from './ChirpyRemembers';
import { ChirpyArc } from './ChirpyArc';
import { GuessWhat } from './GuessWhat';
import { ReleasedSky } from './LetThemGo';
import { TheVisitor } from './TheVisitor';
import { NoteFound } from './NoteFound';
import { LeaveANote } from './LeaveANote';
import { OneMinute } from './OneMinute';
import { SeasonEnd } from './SeasonEnd';
import { FirstNight } from './FirstNight';
import { seasonJustEnded, type Keepsake } from '../kit/seasons';
import { reportingDay, type ReportingDay } from '../kit/reportingDay';
import { visitorForToday, type Visitor } from '../kit/visitor';
import { hubMoment, type HubMoment } from '../kit/hubMoment';
import { welcomeBackShown } from '../kit/awayFor';
import { othersToday } from '../kit/others';
import { saveCase } from '../kit/cases';
import { greetByName, stopSpeaking } from '../kit/chirpyVoice';
import { COMPANY } from '../kit/feelingCompanions';
import { markVisit, releasedCount } from '../kit/sky';
import { startSkyAmbience, stopAmbience } from '../kit/ambience';
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

  /**
   * Whether three months just closed. Read once on arrival — the check writes
   * the season's start date on a first ever run, and it must not re-fire
   * while the child is looking at the curtain.
   */
  const [seasonOver, setSeasonOver] = useState<Keepsake | null>(null);
  useEffect(() => {
    setSeasonOver(seasonJustEnded(useKidStore.getState().completions));
  }, []);

  // The two reasons a screen change stays a plain fade: the child asked their
  // device for less motion, or the app has quietened itself because they're
  // upset (§7). A doorway sweeping open is a flourish, and a flourish is the
  // first thing to go in both cases.
  const plainMotion = quiet || !!reduced;

  // The gym's own opening, not the shared one — see FirstNight. The old
  // Onboarding is still what MyBestEveryDay uses and is untouched.
  if (!onboarded) return <FirstNight />;

  /*
    THE CURTAIN COMES DOWN OVER EVERYTHING. A season ending is not a card on
    the hub competing with a note and a visitor — it is the screen, once,
    and the child gets to it whatever they were about to do. It is also the
    only thing here allowed to pre-empt the hub, which is why it sits above
    the view switch rather than inside it.
  */
  if (seasonOver) {
    return (
      <QuietProvider quiet={quiet}>
        <SeasonEnd keepsake={seasonOver} onDone={() => setSeasonOver(null)} />
      </QuietProvider>
    );
  }

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

  const quiet = useQuiet();

  /** Where the "Explore Rooms" door lands — the shelf itself, which on a
   *  phone is below the fold and was otherwise only findable by scrolling. */
  const roomsRef = useRef<HTMLHeadingElement>(null);

  /**
   * THE HUB HAD NO SOUND AT ALL.
   *
   * Room tone is hung off RoomScene (see ui/scene), and the hub is the one
   * screen that doesn't use it — it paints its own sky from skyNow(). So the
   * place a child spends most of their time was the only silent room in the
   * building. It gets the bed matching whatever sky it's showing, so dawn
   * and midnight don't sound the same.
   */
  useEffect(() => {
    if (quiet) { stopAmbience(); return; }
    startSkyAmbience(timeOfDayForHour(new Date().getHours()));
    return () => stopAmbience();
  }, [quiet]);

  /**
   * AND THE MUSIC, ONCE, ON ARRIVAL.
   *
   * The lullaby was written for this app and played in exactly one place —
   * the two-stories reveal inside the deep dive — so almost no child would
   * ever have heard it. It plays on the way in now, under the room tone,
   * quiet enough to sit beneath Chirpy's voice rather than argue with it.
   *
   * Keyed off the mount rather than looped forever: a bed that never stops
   * becomes something to switch off, and the tone underneath is what carries
   * the place. `playMusic` is a no-op while muted, so this needs no guard of
   * its own beyond the quiet state.
   */
  useEffect(() => {
    if (quiet) { sound.stopMusic(); return; }
    sound.playMusic('twoStories');
    return () => sound.stopMusic();
  }, [quiet]);

  /**
   * THE ONE THING THIS HUB HAS TO SAY TONIGHT — a note from home, or Chirpy,
   * or nothing, and never more than one. See kit/hubMoment for the order and
   * for what stacking four of these actually looked like.
   *
   * Chosen once on arrival rather than per render, so it can't change under
   * a child mid-read.
   */
  const vw = useViewportWidth();

  const [moment, setMoment] = useState<HubMoment | null>(null);
  useEffect(() => {
    setMoment(hubMoment(quiet, pointsByBehaviour));
    // pointsByBehaviour is deliberately NOT a dependency. It changes the
    // instant the child ticks anything, and re-running this would swap the
    // card out from under them mid-conversation — and, worse, would re-peek
    // the whole chain. What Chirpy has to say tonight is decided when they
    // arrive and then left alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
   * How many other children caught one tonight — null on every install that
   * has no endpoint configured, which is currently all of them. See
   * kit/others, and particularly why this is never invented.
   */
  const [others, setOthers] = useState<number | null>(null);
  useEffect(() => {
    let dead = false;
    void othersToday().then((n) => { if (!dead) setOthers(n); });
    return () => { dead = true; };
  }, []);

  /**
   * THE EIGHT ALCOVES, AS ONE LIST.
   *
   * Assembled here rather than inline because the same eight are drawn twice
   * on this page in two different arrangements — up the two walls beside the
   * boy on a wide screen, and in a grid under him on a phone — and two
   * hand-rolled copies of "seven virtue rooms and then Pause" is exactly how
   * the Pause Room ends up scoring points on one of them.
   */
  /**
   * How big the boy is allowed to be. He is the subject of this screen, so he
   * takes whatever the viewport can spare — but a 288px figure on a 390px
   * phone leaves no width for anything beside him, and he is not the only
   * thing a child came for.
   */
  const boySize = vw >= 1280 ? 288 : vw >= 640 ? 236 : 196;

  const alcoves = [
    ...VIRTUE_ROOMS.map((r, i) => {
      const art = artRoomFor(r);
      const earned = pointsByBehaviour[r.id] ?? 0;
      return {
        key: r.id,
        name: r.name,
        roomId: art.id,
        accent: art.palette.accent,
        index: i,
        doneToday: !!today[r.id],
        note: earned > 0 ? `${earned} pts` : 'not yet',
        dashed: false,
        onClick: () => onOpen(r),
      };
    }),
    /* Pause sits with them and is visibly not one of them — no tick, no
       points, no counter. Somewhere that asks nothing. */
    {
      key: PAUSE_ROOM.id,
      name: PAUSE_ROOM.name,
      roomId: artRoomFor(PAUSE_ROOM).id,
      accent: artRoomFor(PAUSE_ROOM).palette.accent,
      index: VIRTUE_ROOMS.length,
      doneToday: false,
      note: 'any time',
      dashed: true,
      onClick: onPause,
    },
  ];

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* The gym, painted — see HomeStage's HubRoom. What used to be here was
          a navy gradient and a radial glow standing in for a place. */}
      <HubRoom />

      {/* The hour of the day, laid over the painting rather than replacing it:
          the room is the same room at seven in the morning and at bedtime, and
          only the light through it changes. */}
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

      <DoorWall onStuck={onDeepDive} onChirpy={onHelpChirpy} />

      {/* Tonight's lights, standing at the foot of the door that fills it.
          Movable, and it remembers where it was put. */}
      <FloatingJar caught={caughtToday} />

      <div className="relative mx-auto w-full max-w-6xl px-[74px] pb-32 pt-4 sm:px-20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BackButton onClick={onExitGym} label="Leave the gym" />
            {/* The sign over the door. Beside the way out rather than above
                the greeting: the top-left corner is where a building puts its
                name, and the greeting's job is to say hello, not to brand. */}
            <MindGymMark />
          </div>
          <div className="flex items-center gap-2">
            {/* THE WAY OUT OF THE SOUND. It is on by default now — voice,
                room tone and the lullaby — and turning something on by
                default without shipping the switch is how you get a parent
                uninstalling an app on a train. This is the whole app's
                silence, not a music toggle: it is the same flag Chirpy's
                voice and every cue read. */}
            <SoundToggle />
            <GrownUpExit onClick={onGrownUp} />
          </div>
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
        {/*
          THE STAGE: two lit ways on, with the child standing between them.

          Straight off the reference art, and the arrangement is the point —
          the pills are not a toolbar above the content, they are the two doors
          of the room the boy is standing in, one to each side of him. A child
          reads "I am in here, and there are two ways on" without a word of it
          being written down.

          They stack under the greeting on a phone, where there is no room to
          stand beside anything.
        */}
        <div className="-mx-[58px] sm:mx-0">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-5">
            <div className="order-2 sm:order-1 sm:shrink-0">
              <NeonDoorPill
                tone="blue"
                onClick={() => {
                  sound.play('arcadeBlip');
                  roomsRef.current?.scrollIntoView({ behavior: quiet ? 'auto' : 'smooth', block: 'start' });
                }}
              />
            </div>

            <div className="order-1 min-w-0 flex-1 sm:order-2">
              <WelcomeBanner
                name={name}
                doneCount={doneCount}
                total={VIRTUE_ROOMS.length}
                others={others}
                onOneMinute={onOneMinute}
                onFeeling={onDeepDive}
              />
            </div>

            <div className="order-3 sm:shrink-0">
              <NeonDoorPill
                tone="gold"
                onClick={() => { sound.play('arcadeBlip'); onStartJourney(); }}
              />
            </div>
          </div>
        </div>

        {/*
          THE FLOOR OF THE GYM — the boy on the star, with a wall of alcoves
          either side of him. This is the reference painting's own composition,
          and it is here because the old one had a bug worth naming: the boy
          lived INSIDE the greeting banner, which folds itself away after two
          seconds. He was on screen for two seconds per visit and then gone for
          the rest of it. Every per-room gait, every bit of characterisation in
          ui/scene's GAITS, was being drawn for nobody.

          So he is his own thing now, he does not fold, and he is the largest
          object on the page. The shelves flank him from xl up, where there is
          real width to put them; below that they would squeeze him to nothing,
          so the grid under the fold carries them instead.
        */}
        <div className="mt-1 flex items-start justify-center gap-5 xl:gap-8">
          <Shelf alcoves={alcoves.slice(0, 4)} />

          <div className="flex shrink-0 flex-col items-center">
            {/* HE DANCES ON THE HUB, and only here. Every room has him doing
                something quieter and room-specific (ui/scene's GAITS); the hub
                is the one screen where he isn't waiting on the child to answer
                anything, so it's the one place he gets to just enjoy himself.
                Facing out, too — this is the hello, which is the one moment
                §2.2's shared-gaze rule exempts. */}
            <BoyAndChirpy size={boySize} pose="excited" gaze="child" gait="dance" />

            {/* The star he is standing on, echoing the one inlaid in the
                painted floor behind him. It is what stops a cut-out figure
                floating: something on the ground under his feet. */}
            <StageStar />

            {/*
              THE ONE THING THIS HUB HAS TO SAY TONIGHT, said where he is
              standing. It used to sit in the page flow under the room grid,
              which put it below the fold the moment the shelves took the full
              height of the screen — and the whole point of this card is that
              it is the single thing the hub wanted to tell the child.

              Under the boy rather than beside him because he is who says it:
              Chirpy's memory, Chirpy's arc, Chirpy's guessing game and the
              note from home all read as coming out of the figure on the star.

              See kit/hubMoment for the order, and for what four of these
              stacked together did to this page.
            */}
            <div className="w-full max-w-[420px]">
      <AnimatePresence mode="wait">
      {moment?.kind === 'note' && (
      <NoteFound key="note" note={moment.note} onDone={() => setMoment(null)} />
      )}
      {moment?.kind === 'welcome' && (
      <WelcomeBackCard key="welcome" line={moment.line} onDone={() => setMoment(null)} />
      )}
      {moment?.kind === 'arc' && (
      <ChirpyArc key="arc" beat={moment.beat} onDone={() => setMoment(null)} />
      )}
      {moment?.kind === 'memory' && (
      <ChirpyRemembers
      key="memory"
      recollection={moment.recollection}
      onDone={() => setMoment(null)}
      />
      )}
      {moment?.kind === 'game' && (
      <GuessWhat key="game" game={moment.game} onDone={() => setMoment(null)} />
      )}
      </AnimatePresence>
            </div>
          </div>

          <Shelf alcoves={alcoves.slice(4)} />
        </div>

        {/*
          ONE CARD. Whatever tonight's single thing is — a note from home, or
          Chirpy, or nothing at all. See kit/hubMoment for the order, and for
          what four of these stacked together actually did to this page.
        */}


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

        {/* Below xl the walls are too narrow to stand a shelf against, so the
            same eight alcoves lie down here as a grid instead. Hidden, not
            removed, once the shelves take over: "Explore Rooms" scrolls to
            this heading, and a heading that vanishes at 1280px would send that
            button nowhere on exactly the screens where the rooms are already
            visible — so the ref moves up to the stage at that width. */}
        <h2
          ref={roomsRef}
          className="mt-5 scroll-mt-4 text-[15.5px] font-extrabold xl:hidden"
          style={{ color: CHROME.text, fontFamily: FONT }}
        >
          Or pick a room
        </h2>

        <div className="mt-3 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:hidden">
          {alcoves.map((a) => (
            <RoomDome
              key={a.key}
              name={a.name}
              roomId={a.roomId}
              accent={a.accent}
              index={a.index}
              doneToday={a.doneToday}
              note={a.note}
              dashed={a.dashed}
              onClick={a.onClick}
            />
          ))}
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
/**
 * How wide the window is, in px, and again whenever it changes.
 *
 * The boy is sized in JS rather than CSS because his size is a number handed
 * to a component that draws an <img> at that height — there is no class to put
 * on him. Everything else on this page does its responsiveness in Tailwind,
 * and should keep doing so; this exists for the one case that can't.
 *
 * Seeded to a desktop width rather than 0 so the first paint on a wide screen
 * isn't a phone-sized boy who jumps.
 */
function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

/* ── The two walls ───────────────────────────────────────────────────── */

/** What one alcove needs to draw itself. Assembled once in the hub — see the
 *  `alcoves` list there for why this is a list and not two lots of JSX. */
interface Alcove {
  key: string;
  name: string;
  roomId: RoomId;
  accent: string;
  index: number;
  doneToday: boolean;
  note: string;
  dashed: boolean;
  onClick: () => void;
}

/**
 * A wall of the gym, with its rooms lit in it.
 *
 * Four small alcoves in a column, which is what the reference painting has on
 * each side of the boy. Narrow on purpose: the boy is the subject of this
 * screen and these are the room he is standing in, so a shelf wide enough to
 * compete with him would be the menu winning again.
 *
 * Hidden below xl. There is no honest way to stand a four-storey shelf beside
 * a 288px boy on a 390px phone, and the grid under the fold already says the
 * same thing with room to breathe.
 */
function Shelf({ alcoves }: { alcoves: Alcove[] }) {
  // 84px is not a taste: four alcoves, each w*4/3 tall plus its plaque, have
  // to clear the bottom bar between the greeting and the floor. At 92px the
  // fourth one was behind the nav.
  return (
    <div className="hidden w-[84px] shrink-0 flex-col gap-2 xl:flex 2xl:w-[96px]">
      {alcoves.map((a) => (
        <RoomDome
          key={a.key}
          name={a.name}
          roomId={a.roomId}
          accent={a.accent}
          index={a.index}
          doneToday={a.doneToday}
          note={a.note}
          dashed={a.dashed}
          compact
          onClick={a.onClick}
        />
      ))}
    </div>
  );
}

/**
 * The star under his feet.
 *
 * A cut-out figure with nothing beneath them reads as pasted on, however good
 * the drawing is — the eye wants contact with a floor. The painted room has a
 * star inlaid in its own floor at exactly this spot, so this is a live copy of
 * it, lining up with the one behind and giving him something to stand on at
 * every viewport shape.
 *
 * It breathes rather than spins. A rotating star under a dancing boy is two
 * things moving at cross purposes, and the floor should be the still one.
 */
function StageStar() {
  const m = useMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none -mt-[42px] h-[54px] w-[186px] shrink-0"
      style={{
        background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,214,150,0.5) 0%, rgba(255,190,110,0.16) 42%, transparent 72%)',
        borderRadius: '50%',
      }}
      animate={m.loop ? { opacity: [0.68, 1, 0.68], scaleX: [1, 1.05, 1] } : { opacity: 0.85 }}
      transition={m.loop ? { ...m.loop, duration: 4.4 } : { duration: 0.3 }}
    />
  );
}

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
  name, doneCount, total, others, onOneMinute, onFeeling,
}: {
  name: string;
  doneCount: number;
  total: number;
  /** Other children tonight, or null when there's no server to ask. */
  others: number | null;
  onOneMinute: () => void;
  /** Where the bubble's question goes — the child's own weather. */
  onFeeling: () => void;
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
      {/*
        THE BUBBLE DOESN'T FOLD, AND THE BOY DOES.

        What used to collapse after five seconds was the whole hello, down to a
        small grey pill with the child's name in it. That threw away the one
        thing on this screen that asks them anything: the greeting is a speech
        bubble now, it says how are you feeling today, and it is a way into
        their own weather — so folding it away two seconds after they arrive
        would be the app asking a question and then leaving the room.

        The 168px dancing boy is what costs the rooms their place on the fold,
        so he is what goes. The nights chip underneath brings him back; nothing
        here is a one-way door.
      */}
      <GreetingBubble
        name={name}
        avatar={BOY_SRC}
        avatarSrcSet={BOY_SRCSET}
        onClick={onFeeling}
      />

      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="full"
            layout
            exit={{ opacity: 0, scale: 0.86, y: -18 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-2"
          >
            {/* The boy used to be here, and being here is what made him
                invisible: this whole branch folds away two seconds after the
                child arrives. He is on the stage under the greeting now and
                he stays. */}
            <StarSky count={stars} />
            <p className="max-w-sm text-[13.5px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
              {doneCount === 0
                ? 'Seven rooms. Go in and say how today actually went.'
                : doneCount === total
                  ? 'All seven, today. That’s the full rainbow.'
                  : `${doneCount} of ${total} rooms so far today.`}
            </p>
            <MinutePill onClick={onOneMinute} />
          </motion.div>
        ) : (
          <motion.div
            key="folded"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <button
              onClick={() => setDismissed(false)}
              className="rounded-full px-3.5 py-2 text-[11.5px] font-bold"
              style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
              aria-label="Show the welcome again"
            >
              {stars === 1 ? '1 night in the gym' : `${stars} nights in the gym`}
            </button>

            <MinutePill onClick={onOneMinute} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other children, out there somewhere — and nothing at all when
          there's no server to ask. See kit/others. */}
      {others !== null && (
        <p className="text-[11.5px] font-semibold" style={{ color: CHROME.textSoft }}>
          {others} other children caught one tonight, too.
        </p>
      )}

      {sparks && <FoldSparks />}
    </motion.div>
  );
}

/**
 * ON OR OFF, for everything that makes a noise.
 *
 * Reads and writes lib/sfx's single mute flag, which Chirpy's voice, the
 * room tone, the lullaby and every cue all consult. One switch, not four —
 * a child who wants quiet wants quiet, not a mixing desk.
 *
 * Stopping is immediate rather than at the next natural break: a child
 * reaching for this is being talked at right now, and "it'll stop when the
 * sentence finishes" is not an answer.
 */
function SoundToggle() {
  const [muted, setMutedState] = useState(() => isMuted());
  return (
    <button
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
        if (next) { stopSpeaking(); sound.stopMusic(); sound.stopAll(); stopAmbience(); }
        else sound.play('tap');
      }}
      aria-label={muted ? 'Turn the sound on' : 'Turn the sound off'}
      aria-pressed={!muted}
      className="grid h-11 w-11 place-items-center rounded-full"
      style={{ background: CHROME.adultExit, color: CHROME.text, border: `1px solid ${CHROME.backBorder}` }}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}

/**
 * THE SHORT WAY IN.
 *
 * It used to be a row of its own between the hello and the rooms, which cost
 * the page a whole line and put one more thing between a child and what they
 * came for. It now rides along with the greeting in both of that banner's
 * states, so it costs no height at all.
 *
 * IN BOTH STATES, and that matters more than it looks. Putting it only on the
 * folded greeting meant it was absent for the first five seconds of every
 * single visit — which is precisely the wrong five seconds, because the child
 * this exists for is the one who opened the app with nothing in the tank and
 * should not have to sit through a flourish to find the door built for them.
 */
function MinutePill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-2 text-[11.5px] font-bold"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.22)', color: CHROME.textSoft }}
    >
      Only got a minute?
    </button>
  );
}

/**
 * Chirpy, pleased you're back. One of the four things kit/hubMoment can
 * choose between, and the only one that is only true today — which is why it
 * outranks the two that keep.
 *
 * Tapping it dismisses it, and it's spent for the day either way: see
 * awayFor's split between peeking and committing.
 */
function WelcomeBackCard({ line, onDone }: { line: string; onDone: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      onClick={() => { welcomeBackShown(); onDone(); }}
      className="mt-3 flex w-full items-center gap-2.5 rounded-[20px] px-3.5 py-3 text-left backdrop-blur-md"
      style={{ background: CHROME.pill, border: '1px solid rgba(143,217,196,0.45)' }}
    >
      <span className="min-w-0 flex-1">
        {/* 36px was the smallest and squarest of the lot. See
            ChirpyRemembers for why every one of them came off the hub. */}
        <span
          className="block text-[11px] font-extrabold uppercase tracking-[0.12em]"
          style={{ color: '#8FD9C4' }}
        >
          Chirpy
        </span>
        <span className="mt-1 block text-[13.5px] font-bold leading-snug" style={{ color: CHROME.text }}>
          {line}
        </span>
      </span>
    </motion.button>
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
const STUCK_TIPS = [
  'Your Weather Today',
  'How are you feeling today?',
  'Sunny in there? Or a bit grey?',
  'Had a rubbish bit today?',
];

const CHIRPY_TIPS = [
  'Chirpy’s Weather Today',
  'How’s Chirpy doing, do you think?',
  'He’s gone a bit quiet. Go and ask him?',
  'Somebody should check on him',
];

/** How long between nudges, and how long a nudge hangs about. */
const NUDGE_EVERY_MS = 15000;
const NUDGE_HOLD_MS = 3600;

function DoorWall({
  onStuck,
  onChirpy,
}: {
  onStuck: () => void;
  onChirpy: () => void;
}) {
  const m = useMotion();
  // Which door speaks, and what it says — picked together, in the timer, so
  // no child render-cycle has to reach for Math.random() to decide.
  const [speaking, setSpeaking] = useState<{ door: 0 | 1; line: string } | null>(null);

  useEffect(() => {
    // Never in the quiet state. A child who is upset does not need the
    // doors taking it in turns to call out to them — the effect simply
    // doesn't start the cycle, rather than starting it and then clearing
    // state back out, so there is nothing to reset on the way in.
    if (m.quiet) return;
    const pools = [STUCK_TIPS, CHIRPY_TIPS] as const;
    let hold: number | undefined;
    const cycle = window.setInterval(() => {
      const door = Math.floor(Math.random() * 2) as 0 | 1;
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
      {/*
        TWO WALLS, AND THE TWO WEATHERS.

        All three fittings used to hang down the right-hand edge, stacked, so
        the hub had one wall with a column of handles on it and an entirely
        blank one opposite. That is not a room, it is a menu that has been
        pushed to one side — and it made the most important door in the app
        the middle item in a list of three.

        Now the main flow has a wall to itself. The child's own door is on the
        left, Chirpy's is on the right, and they face each other across the
        room, which is the whole relationship this app is built on said in
        furniture: you go in one side and ask how you are, you go in the other
        and ask how he is, and neither is the more important question.

        WHY "WEATHER". "How Are You Feeling Today?" is a form title. Weather
        is what a six-year-old already has words for — sunny, a bit grey,
        absolutely chucking it down — and it is the standard device in primary
        classrooms for exactly that reason. It also does something the old
        name couldn't: it makes the pair legible at a glance. Your weather,
        his weather. A child does not need either explained.
      */}
      {/*
        THE FIREFLY DOOR HAS GONE, and the wall is better for it.

        It used to hang above the child's own weather, leading to the nightly
        run through the rooms. That run is now the "My Journey" pill on the
        stage — lit, named, and impossible to walk past — so the handle was a
        second, quieter way into the same place under a different name. Two
        names for one destination is the sort of thing a six-year-old takes as
        two destinations.

        What's left is exactly the pair the wall was described for: your
        weather on one side, Chirpy's on the other, facing each other.
      */}
      <DoorHandle
        side="left"
        bottomVh={30}
        label="Your Weather Today"
        nudge={active?.door === 0 ? active.line : null}
        onClick={onStuck}
        accent="#C48BE8"
      />
      <DoorHandle
        side="right"
        bottomVh={30}
        label="Chirpy’s Weather Today"
        nudge={active?.door === 1 ? active.line : null}
        onClick={onChirpy}
        accent="#8FD9C4"
      />
    </>
  );
}
