import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Volume2, VolumeX } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { isMuted, setMuted } from '../../../../lib/sfx';
import { BEHAVIOURS } from '../../../kids/data';
import { RewardsScreen, Friends } from '../../../kids/screens';
import { CHROME, Cta, FONT, QuietProvider, BackButton, GrownUpExit } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import { RoomScene } from '../ui/scene';
import { timeOfDayForHour } from '../rooms';
import { GrownUp } from '../GrownUp';
import { DeepDive } from './DeepDive';
import { HubBoy, HubGreeting, HubHotspot, HubStage, HUB_BOXES, PhoneHub, type Hotspot, type HotspotKey } from './PaintedHub';
import { FloatingJar } from './FloatingJar';
import { HelpChirpy } from './HelpChirpy';
import { DifferentStoryRoom } from './DifferentStoryRoom';
import { TruthLabRoom } from './TruthLabRoom';
import { ReflectionRoom } from './ReflectionRoom';
import { VIRTUE_ROOMS, PAUSE_ROOM, accentFor, artRoomFor, type VirtueRoom } from './rooms';
import { VirtueRoomView } from './VirtueRoomView';
import { ChirpyRemembers } from './ChirpyRemembers';
import { ChirpyArc } from './ChirpyArc';
import { GuessWhat } from './GuessWhat';
import { TeachingMoment } from './TeachingMoment';
import { SecretGameBack, SecretGameGiven } from './SecretGame';
import { HowOld } from './HowOld';
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
  /** The room the painting's Different Story dome has always pointed at. */
  | { at: 'story' }
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
                onReflection={() => setView({ at: 'reflection' })}
                onStory={() => setView({ at: 'story' })}
                onRewards={() => setView({ at: 'rewards' })}
                onFriends={() => setView({ at: 'friends' })}
                onOneMinute={() => setView({ at: 'oneminute' })}
                onExitGym={onExitGym}
                onGrownUp={() => setView({ at: 'grownup' })}
              />
            )}

            {/*
              THE TRUTH LAB IS ITS OWN ROOM, and the branch is here rather
              than at each entrance so there is only ever one of it. The dome
              on the shelf, the row in the room sheet and the fourth stop on
              the journey all arrive at the same place — a room that changed
              shape depending on which door you came through would be the
              single most confusing thing in the building.
            */}
            {view.at === 'room' && view.room.id === 'truth' && (
              <TruthLabRoom
                reporting={reporting}
                journey={view.step !== null ? { index: view.step, total: VIRTUE_ROOMS.length } : undefined}
                onExit={back}
                onGrownUp={() => setView({ at: 'grownup' })}
                onNext={view.step !== null ? () => nextRoom(view.step as number) : undefined}
              />
            )}

            {view.at === 'room' && view.room.id !== 'truth' && (
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
            {view.at === 'story' && (
              <DifferentStoryRoom onExit={back} onGrownUp={() => setView({ at: 'grownup' })} />
            )}
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

        {/*
          NO BOTTOM BAR. It used to run across every hub and every room with
          Friends, Rewards, Look Back and Pause on it, and three of those four
          were a second way into somewhere the painting already goes: Pause is
          a lit dome on the middle shelf, Look Back is the knob on the journey
          door, and the rooms are the whole left-hand wall. A strip of emoji
          re-listing the picture behind it was the last piece of the old menu
          hub still standing, and it sat across the bottom of the art.

          What genuinely had nowhere else to live is what a child has earned,
          so that is all that is left, and it perches rather than docks — see
          RewardPerch. Friends moved behind the blue door with the rooms; it is
          somewhere you go and look, not something you practise.
        */}
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
  onReflection,
  onStory,
  onRewards,
  onFriends,
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
  /** The Observatory — looking back over the walk, not the Reflection Room dome. */
  onReflection: () => void;
  onStory: () => void;
  onRewards: () => void;
  onFriends: () => void;
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

  const quiet = useQuiet();

  /** Where the "Explore Rooms" door lands — the shelf itself, which on a
   *  phone is below the fold and was otherwise only findable by scrolling. */

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
  /** The blue door's room sheet — every room, including the unshelved ones. */
  const [sheet, setSheet] = useState(false);


  /**
   * NOTHING IS SAID UNTIL THE CHILD ASKS FOR IT.
   *
   * `moment` is what Chirpy has tonight; `asked` is whether the boy has been
   * tapped. Both have to be true before a word appears.
   *
   * WHY IT IS GATED AT ALL. The hub used to open by talking. A child would
   * land on their own front room and be immediately told a thing, several
   * times an evening, and the single worst-behaved line in the app — the one
   * about whether you're any good at your job — became its catchphrase
   * because of it. That particular bug was a recording fault and is fixed
   * (see ChirpyArc), but a screen that speaks before it is spoken to was
   * always going to produce another one eventually.
   *
   * So the moment is still CHOSEN on arrival, exactly as before — it must not
   * change under the child, and the choosing peeks at storage — and it simply
   * waits. Tap the boy and Chirpy says tonight's thing. Don't, and the hub is
   * a quiet room with your own figure standing in it, which is a perfectly
   * good thing for it to be.
   */
  const [asked, setAsked] = useState(false);
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
   * Tapping the boy. If Chirpy has nothing tonight this is a no-op with a
   * sound on it, which is the honest outcome — better than inventing a line
   * so the tap has something to show for itself.
   */
  const askChirpy = () => {
    sound.play(moment ? 'roomCard' : 'tap');
    setAsked(true);
  };

  /** Tonight's moment, but only once it has been asked for. */
  const said = asked ? moment : null;

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
   * THE EIGHT ALCOVES THE PAINTING DREW, wired to where each one goes.
   *
   * The painting names its own rooms, and those names are the scene rooms in
   * rooms.ts rather than the virtue rooms this hub used to list — so the map
   * below is where the two halves of the app are joined. Five of them land on
   * a virtue room whose art IS that painting (Body Detective on the Healthy
   * Body Zone, the Truth Lab dome on the Truth Lab room, and so on); Feelings Room opens
   * the walk that asks how today went; Pause is Pause.
   *
   * KINDNESS GARDEN HAS NO DOME, because the painting has no ninth alcove. It
   * is not lost: the blue door lists every room, and the journey behind the
   * gold door still walks all seven virtues in order. A room missing from the
   * shelf is a room you reach another way, not a room that is gone.
   */
  const virtue = (id: string) => VIRTUE_ROOMS.find((r) => r.id === id);
  const dome = (
    key: HotspotKey,
    label: string,
    accent: string,
    onClick: () => void,
    done = false,
  ): Hotspot => ({ id: key, label, accent, onClick, done, ...HUB_BOXES[key] });

  const open = (id: string) => () => { const r = virtue(id); if (r) onOpen(r); };
  const ticked = (id: string) => !!today[id];

  const spots: Hotspot[] = [
    dome('feelings', 'Feelings Room', '#E8A2D0', onDeepDive),
    dome('body', 'Body Detective', '#6FD3E8', open('body'), ticked('body')),
    dome('together', 'Together Games', '#E8944C', open('include'), ticked('include')),
    /* The one alcove whose painted name is out of date — see `sign` on
       Hotspot for why the replacement is drawn rather than repainted. */
    {
      ...dome('thought', 'Truth Lab', '#C48BE8', open('truth'), ticked('truth')),
      sign: { text: 'Truth Lab', left: 17.5, top: 73.2, width: 72.7, height: 25.4 },
    },
    dome('bigfeelings', 'Big Feelings', '#E86FB4', open('choices'), ticked('choices')),
    dome('pause', 'Pause Room', '#8FD9C4', onPause),
    /*
      THE SIGN AND THE ROOM AGREE NOW.

      This dome has said Different Story since the painting arrived and it
      opened Helping Hands Village, because the hub matched domes to rooms by
      shared ARTWORK — the Helping Hands room is painted with the Different
      Story scene, so the wiring followed the picture rather than the words.
      Press the ship in the bottle, get asked whether you tidied up.

      Helping Hands has not gone anywhere: it is in the room sheet behind the
      blue door and it is still the sixth stop on the journey, which is
      exactly where the Kindness Garden lives too. A room with no shelf is a
      room you reach another way.
    */
    dome('story', 'Different Story', '#7FC7F0', onStory),
    dome('reflection', 'Reflection Room', '#9FB4F5', open('mindheart'), ticked('mindheart')),

    /*
      NOTHING ON THE DOORWAYS ANY MORE.

      Each of the two doors has carried a control at some point — first the
      lit panel, then the brass knob, most recently the knob with a label
      taking its turn announcing itself every few seconds. All of it sat at
      the extreme left and right of the painting, which is the one part of
      this artwork the hub cannot promise to show anybody: the stage is sized
      to COVER the viewport, so on any screen narrower than the painting the
      doors are the first thing the crop eats. Measured at 1280x820, the
      Explore Rooms hotspot sat at x = -30 with its label at x = -34 — a
      button and a caption hanging off the side of the screen, which reads as
      something broken rather than as a way out.

      So the doorways are scenery now, like the rest of the wall, and the two
      places they led have moved to the strip at the foot of the screen where
      the layout can actually guarantee they are on it. See HubAside.
    */
  ];

  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{ fontFamily: FONT, background: '#1A0F2E' }}
    >
      {/*
        THE PAINTING, AT FULL BRIGHTNESS AND UNCROPPED BY ANY VEIL.

        It used to be blurred to 9px and dimmed to a third, with a CSS gym
        drawn on top of it. See best/PaintedHub for why that was always going
        to look like a copy of the reference rather than the reference.
      */}
      <div className="hidden md:block">
        <HubStage>
          <HubGreeting name={name} onClick={onDeepDive} />
          {/* The boy, breathing, over the painted one — and the switch that
              lets Chirpy speak. See HubBoy, and `asked` above. */}
          <HubBoy waiting={!!moment && !asked} onTap={askChirpy} />
          {spots.map((sp) => <HubHotspot key={sp.id} spot={sp} />)}
        </HubStage>
      </div>

      {/* A portrait screen cannot hold a landscape room — see PhoneHub. */}
      <div className="md:hidden">
        <PhoneHub
          name={name}
          spots={spots}
          onGreeting={onDeepDive}
          waiting={!!moment && !asked}
          onTapBoy={askChirpy}
        />
      </div>

      {/* Every firefly the child has taken to the Observatory and let go of,
          drifting in the gym's own sky. Never counted anywhere on screen —
          a number beside it would turn letting go into scoring. */}
      <ReleasedSky count={releasedCount()} />

      {/* Somebody who isn't Chirpy, roughly one evening in twenty, saying one
          thing and then going. Nothing anywhere calls it rare. */}
      <AnimatePresence>
        {visitor && <TheVisitor visitor={visitor} onGone={() => setVisitor(null)} />}
      </AnimatePresence>

      {/* Tonight's lights, standing at the foot of the door that fills it.
          Movable, and it remembers where it was put. */}
      <FloatingJar caught={caughtToday} />

      {/* What the bottom bar was actually for. Bottom LEFT because the whole
          right-hand gutter is spoken for — the jar hangs there and HubAside
          sits under it. */}
      <RewardPerch onRewards={onRewards} />

      {/*
        THE CHROME, AND AS LITTLE OF IT AS THE APP CAN HONESTLY GET AWAY WITH.

        The painting has no room for a toolbar — it has a sign in the top-left
        corner already, which is why MindGymMark is gone from here. What stays
        is the way out of the gym, the way out of the sound, and the way to a
        grown-up, which is on every screen at the same position and is never
        negotiable (§2.10).
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto">
          <BackButton onClick={onExitGym} label="Leave the gym" />
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <SoundToggle />
          <GrownUpExit onClick={onGrownUp} />
        </div>
      </div>

      {/*
        ONE CARD, over the floor — the one piece of the painting with nothing
        on it. Whatever tonight's single thing is: a note from home, or Chirpy,
        or nothing at all. See kit/hubMoment for the order, and for what four
        of these stacked together did to this page.
      */}
      {/* On a phone the foot of the screen is a stack: nav bar, then the
          nights strip, then this. On a wide screen the strip is off to the
          right and only the bar is underneath. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[9.5rem] z-20 flex justify-center px-4 md:bottom-20">
        {/* Its own dark ground. Every card that lands in here is translucent
            by design — they were written for a dim room — and the painting
            underneath is a lit floor at full brightness, which turns all of
            them into unreadable grey. */}
        <div
          className="pointer-events-auto w-full max-w-[25rem] rounded-[26px] backdrop-blur-md"
          style={{ background: 'rgba(10,6,22,0.72)' }}
        >
          {/* `said` is tonight's moment once the boy has been tapped, and
              null until then — so every branch below is gated by one thing
              in one place rather than by six copies of the same check. */}
          <AnimatePresence mode="wait">
            {said?.kind === 'note' && (
              <NoteFound key="note" note={said.note} onDone={() => setMoment(null)} />
            )}
            {said?.kind === 'welcome' && (
              <WelcomeBackCard key="welcome" line={said.line} onDone={() => setMoment(null)} />
            )}
            {said?.kind === 'arc' && (
              <ChirpyArc key="arc" beat={said.beat} onDone={() => setMoment(null)} />
            )}
            {said?.kind === 'memory' && (
              <ChirpyRemembers
                key="memory"
                recollection={said.recollection}
                onDone={() => setMoment(null)}
              />
            )}
            {said?.kind === 'teaching' && (
              <TeachingMoment
                key={`teaching-${said.teaching.id}`}
                teaching={said.teaching}
                onDone={() => setMoment(null)}
              />
            )}
            {/* Asked once, ever, and it unlocks two-thirds of the teaching
                library — see kit/band. */}
            {said?.kind === 'age' && (
              <HowOld key="age" onDone={() => setMoment(null)} />
            )}

            {/* The two halves of a secret game — handing one over, and
                asking about it days later. See kit/missions. */}
            {said?.kind === 'mission' && (
              <SecretGameGiven
                key={`mission-${said.mission.id}`}
                mission={said.mission}
                onDone={() => setMoment(null)}
              />
            )}
            {said?.kind === 'missionback' && (
              <SecretGameBack
                key={`missionback-${said.mission.id}`}
                mission={said.mission}
                onDone={() => setMoment(null)}
              />
            )}
            {said?.kind === 'game' && (
              <GuessWhat key="game" game={said.game} onDone={() => setMoment(null)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Says hello by name out loud, once per visit, and offers the short way
          in. It has no drawing of its own any more — the painting has the boy
          and the bubble — so it is a strip rather than a stage. */}
      <HubAside
        name={name}
        doneCount={doneCount}
        total={VIRTUE_ROOMS.length}
        others={others}
        onOneMinute={onOneMinute}
        onEveryRoom={() => { sound.play('roomCard'); setSheet(true); }}
        onStartJourney={() => { sound.play('arcadeBlip'); onStartJourney(); }}
      />

      {/* The blue door opens this: every room the gym has, including the one
          the painting had no shelf for. */}
      <AnimatePresence>
        {sheet && (
          <RoomSheet
            key="sheet"
            today={today}
            pointsByBehaviour={pointsByBehaviour}
            onOpen={(r) => { setSheet(false); onOpen(r); }}
            onPause={() => { setSheet(false); onPause(); }}
            onChirpy={() => { setSheet(false); onHelpChirpy(); }}
            onReflection={() => { setSheet(false); onReflection(); }}
            onFriends={() => { setSheet(false); onFriends(); }}
            onClose={() => setSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * A room card, and it is deliberately the Kids Gym hub card: the same painted
 * poster art, the same aspect, the same scrim gradient, the same hover lift.
 * What's added is the only new information a virtue room has — whether it was
 * ticked today, and what has been earned in it.
 */
/* ── What the blue door opens ────────────────────────────────────────── */

/**
 * EVERY ROOM, AS A LIST OF NAMES.
 *
 * The painting has eight alcoves and the gym has nine rooms, so one of them —
 * the Kindness Garden — has no shelf to stand on. This is where it lives, and
 * it is also the answer to "what if a child wants a room they can't see from
 * here": the blue door in the left wall is labelled Explore Rooms, and this is
 * what exploring them looks like.
 *
 * NAMES, NOT PICTURES. The old hub drew every room as a photo card, and the
 * photo cards are exactly what made it look like a menu rather than a place —
 * the painting does the pictures now, and far better. A list can say the one
 * thing a painting can't: which of them have been ticked today.
 */
function RoomSheet({
  today,
  pointsByBehaviour,
  onOpen,
  onPause,
  onChirpy,
  onReflection,
  onFriends,
  onClose,
}: {
  today: Record<string, boolean>;
  pointsByBehaviour: Record<string, number>;
  onOpen: (room: VirtueRoom) => void;
  onPause: () => void;
  /** Chirpy's own ask. His door went with the wall the painting replaced. */
  onChirpy: () => void;
  /** The Observatory. Its knob became its door — see the knob list above. */
  onReflection: () => void;
  /** Not a room, and printed as one would be a lie — see below. */
  onFriends: () => void;
  onClose: () => void;
}) {
  const m = useMotion();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      style={{ background: 'rgba(8,5,20,0.72)', backdropFilter: 'blur(6px)', fontFamily: FONT }}
    >
      {/* Tapping the dark closes it. A child who opened the wrong door should
          not have to find a cross to get back out of it. */}
      <button aria-label="Close" className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={m.quiet ? false : { y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="relative m-3 w-full max-w-md rounded-[26px] p-4"
        style={{
          background: 'linear-gradient(168deg, rgba(30,20,58,0.98) 0%, rgba(14,9,30,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.9)',
        }}
      >
        <p className="text-[17px] font-extrabold" style={{ color: CHROME.text }}>
          Every room
        </p>
        <p className="mt-0.5 text-[12.5px] font-semibold" style={{ color: CHROME.textSoft }}>
          Go in and say how today actually went.
        </p>

        <div className="mt-3 flex flex-col gap-1.5">
          {VIRTUE_ROOMS.map((r) => {
            const accent = accentFor(r);
            const earned = pointsByBehaviour[r.id] ?? 0;
            const done = !!today[r.id];
            return (
              <button
                key={r.id}
                onClick={() => onOpen(r)}
                className="flex items-center gap-3 rounded-[16px] px-3 py-3 text-left"
                style={{
                  minHeight: m.target,
                  background: done ? `${accent}22` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${done ? accent : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                  style={{ background: done ? accent : 'transparent', border: `2px solid ${done ? accent : 'rgba(255,255,255,0.24)'}` }}
                >
                  {done && <Check size={15} strokeWidth={3.5} color="#0E1A1C" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-extrabold leading-tight" style={{ color: CHROME.text }}>
                    {r.name}
                  </span>
                  <span className="block text-[11.5px] font-bold" style={{ color: accent }}>
                    {earned > 0 ? `${earned} pts` : 'not yet'}
                  </span>
                </span>
              </button>
            );
          })}

          {/* Pause sits with them and is visibly not one of them — no tick, no
              points, no counter. Somewhere that asks nothing. */}
          <button
            onClick={onPause}
            className="flex items-center gap-3 rounded-[16px] px-3 py-3 text-left"
            style={{ minHeight: m.target, background: 'transparent', border: '1px dashed rgba(255,255,255,0.34)' }}
          >
            <span className="h-7 w-7 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold leading-tight" style={{ color: CHROME.text }}>
                {PAUSE_ROOM.name}
              </span>
              <span className="block text-[11.5px] font-bold" style={{ color: CHROME.textSoft }}>
                any time
              </span>
            </span>
          </button>

          {/* Chirpy asking for a hand. He had a door on the right wall until
              the painting replaced the walls, and a feature whose only way in
              was a fitting that no longer exists is a feature that is gone. */}
          <button
            onClick={onChirpy}
            className="flex items-center gap-3 rounded-[16px] px-3 py-3 text-left"
            style={{ minHeight: m.target, background: 'rgba(143,217,196,0.10)', border: '1px solid rgba(143,217,196,0.42)' }}
          >
            <span className="h-7 w-7 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold leading-tight" style={{ color: CHROME.text }}>
                Chirpy needs a hand
              </span>
              <span className="block text-[11.5px] font-bold" style={{ color: '#8FD9C4' }}>
                he’s been working up to asking
              </span>
            </span>
          </button>

          {/* THE OBSERVATORY, which lost its shortcut when the gold door's
              knob became the gold door. It is where the journey ends, so
              most children arrive by walking; this is for the evening when
              somebody just wants to go and look at what they've collected
              without doing all seven rooms again first. */}
          <button
            onClick={onReflection}
            className="flex items-center gap-3 rounded-[16px] px-3 py-3 text-left"
            style={{ minHeight: m.target, background: 'rgba(255,198,92,0.10)', border: '1px solid rgba(255,198,92,0.42)' }}
          >
            <span className="h-7 w-7 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold leading-tight" style={{ color: CHROME.text }}>
                Look back
              </span>
              <span className="block text-[11.5px] font-bold" style={{ color: '#FFC65C' }}>
                everything you’ve caught
              </span>
            </span>
          </button>
        </div>

        {/*
          FRIENDS, UNDER A RULE RATHER THAN IN THE LIST.

          It was on the bottom bar, beside Pause and Look Back, which put "go
          and look at your friends" at exactly the same weight as "go and say
          how today went" — and it is not that, it is somewhere you visit. It
          is also not a room, so it cannot go in the list above without the
          list starting to lie about what it contains.

          A rule and a quieter row is the honest shape: still one tap from the
          blue door, visibly not part of the round.
        */}
        <button
          onClick={onFriends}
          className="mt-3 w-full rounded-[14px] border-t px-3 pb-1 pt-3 text-left text-[12.5px] font-bold"
          style={{ minHeight: m.target, borderColor: 'rgba(255,255,255,0.12)', color: CHROME.textSoft }}
        >
          Friends →
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── The hello, and the short way in ─────────────────────────────────── */

/**
 * WHAT IS LEFT OF THE WELCOME once the painting does the welcoming.
 *
 * This used to be a stage: the pair from the character sheet at 168px, the
 * name, a star sky, a line about how many rooms were done, and a fold-away
 * animation to get all of it off the screen again five seconds later. The
 * painting has a boy and a speech bubble in it now, so none of that is needed
 * — and the one thing it did that the painting cannot is say the child's name
 * OUT LOUD, which is most of why it existed.
 *
 * So: a strip along the foot of the screen. It speaks the greeting once per
 * visit, records the night, and carries the short way in for a child who
 * arrived with nothing in the tank.
 */
function HubAside({
  name, doneCount, total, others, onOneMinute, onEveryRoom, onStartJourney,
}: {
  name: string;
  doneCount: number;
  total: number;
  others: number | null;
  onOneMinute: () => void;
  /** The room sheet, which used to be the left-hand door. */
  onEveryRoom: () => void;
  /** The walk through all seven, which used to be the right-hand door. */
  onStartJourney: () => void;
}) {
  const quiet = useQuiet();
  /** Recorded once per mount; the star for today arrives on the way in. */
  const [stars] = useState(() => markVisit());

  /*
    AND IT SAYS THE NAME OUT LOUD, ONCE.

    "Hello, Shaarav" is only text, which a child who can't read yet doesn't get
    at all — and being greeted by name is most of the reason this exists. Once
    per visit, not once per hub: this mounts again every time a child comes
    back out of a room, and being told hello fourteen times in an evening is
    how a greeting turns into a nag. greetByName holds the "already said it"
    flag in the module, outside React, so the remounts can't reset it.
  */
  useEffect(() => {
    greetByName(name, quiet);
    return () => stopSpeaking();
  }, [name, quiet]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5.5rem] z-30 flex justify-end px-3 md:bottom-2">
      <div
        className="pointer-events-auto flex max-w-[62vw] flex-wrap items-center justify-end gap-2 rounded-full px-3 py-2 backdrop-blur-md"
        style={{ background: 'rgba(12,8,26,0.62)', border: '1px solid rgba(255,255,255,0.14)', fontFamily: FONT }}
      >
        {/* The counts are for a screen with room for them. On a phone this
            strip has the nav bar under it and Chirpy's card over it, and three
            wrapped lines of arithmetic between the two is how the card ends up
            unreadable — so the phone keeps only the door built for a child
            with nothing in the tank. */}
        <span className="hidden px-1 text-[11.5px] font-bold md:inline" style={{ color: CHROME.textSoft }}>
          {stars === 1 ? '1 night in the gym' : `${stars} nights in the gym`}
        </span>
        <span className="hidden px-1 text-[11.5px] font-bold md:inline" style={{ color: CHROME.textSoft }}>
          {doneCount === 0 ? 'no rooms yet today' : `${doneCount} of ${total} rooms today`}
        </span>
        {/* THE TWO DOORS, REHOUSED. They were controls on the painted
            doorways until the crop kept putting them off the side of the
            screen — see the note where the hotspots used to be. Here they are
            in normal flow at the foot of the page, which is the one place the
            layout can promise a child will actually find them.

            Both survive on a phone, unlike the counts either side of them:
            they are the only ways to these two places, and a strip that
            hides its navigation on small screens has hidden the navigation. */}
        <StripPill onClick={onEveryRoom} accent="#6FA8F0">Every room</StripPill>
        <StripPill onClick={onStartJourney} accent="#FFC65C">My Journey</StripPill>
        <MinutePill onClick={onOneMinute} />

        {/* Other children, out there somewhere — and nothing at all when
            there's no server to ask. See kit/others. */}
        {others !== null && (
          <span className="hidden items-center gap-1.5 px-1 md:flex">
            <img
              src="/assets/home/other-child@160.webp"
              alt=""
              aria-hidden
              draggable={false}
              className="h-6 w-6 shrink-0 rounded-full"
              style={{ objectFit: 'cover', objectPosition: '50% 22%', border: '1.5px solid rgba(255,255,255,0.34)' }}
            />
            <span className="text-[11.5px] font-semibold" style={{ color: CHROME.textSoft }}>
              {others} other children tonight
            </span>
          </span>
        )}
      </div>
    </div>
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
/**
 * A way through, in the strip at the foot of the hub.
 *
 * Carries its destination's own colour, unlike the minute pill next to it,
 * because these two are places to go rather than a quiet offer — and because
 * the blue and the gold are the colours those two doorways were painted, so a
 * child who learnt the doors has not had to learn anything new.
 */
function StripPill({
  onClick, accent, children,
}: {
  onClick: () => void;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-2 text-[11.5px] font-extrabold"
      style={{ background: `${accent}1F`, border: `1px solid ${accent}`, color: CHROME.text }}
    >
      {children}
    </button>
  );
}

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

/* ── What a child has earned ─────────────────────────────────────────── */

/**
 * THE ONE THING THE PAINTING CANNOT SAY.
 *
 * Everything else that lived on the old bottom bar is somewhere in the picture
 * already — Pause is a lit dome, Look Back is the knob on the gold door, the
 * rooms are the whole left wall — so the bar had become a caption listing the
 * art behind it. Points and unopened rewards are the exception: nothing in a
 * painted room can show a number that changes.
 *
 * SO IT PERCHES INSTEAD OF DOCKING. A bar is a piece of furniture bolted
 * across the foot of the screen and it cut the floor of the gym in half; this
 * is Chirpy sitting on a small ledge in the corner with the count beside him,
 * taking up about a sixth of the width and none of the middle. Bottom LEFT,
 * because the right-hand gutter already has the firefly jar hanging in it with
 * HubAside underneath.
 *
 * AND ONLY ON THE HUB. The bar also rode along into every room, which meant a
 * child halfway through saying how their day went had a running points total
 * and a way out to the rewards screen sitting under the question. A room asks
 * one thing at a time; the score can wait in the hall.
 */
function RewardPerch({ onRewards }: { onRewards: () => void }) {
  const m = useMotion();
  const points = useKidStore((s) => s.points);
  const rewards = useKidStore((s) => s.rewards);

  return (
    <div className="pointer-events-none fixed bottom-4 left-3 z-40 sm:bottom-5 sm:left-5">
      <motion.button
        onClick={onRewards}
        aria-label={
          `Rewards. ${points} points` +
          (rewards.length ? `, ${rewards.length} waiting to be opened` : '')
        }
        whileTap={{ scale: 0.94 }}
        /* He bobs, and he stops bobbing in the quiet state like everything
           else the boy and Chirpy do — see ui/quiet. */
        animate={m.loop ? { y: [0, -5, 0] } : undefined}
        transition={m.loop}
        className="pointer-events-auto relative flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-4 backdrop-blur-md"
        style={{
          minHeight: m.target,
          background: 'rgba(12,8,26,0.72)',
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 16px 32px -16px rgba(0,0,0,0.92)',
          fontFamily: FONT,
        }}
      >
        <img
          src="/chirpy/chirpy-excited@160.webp"
          srcSet="/chirpy/chirpy-excited@160.webp 160w, /chirpy/chirpy-excited@320.webp 320w"
          sizes="44px"
          alt=""
          aria-hidden
          draggable={false}
          className="h-12 w-10 shrink-0 select-none object-contain"
          style={{ filter: 'drop-shadow(0 2px 10px rgba(255,183,3,0.45))' }}
        />
        <span className="flex flex-col items-start leading-none">
          <span className="text-[15px] font-extrabold text-white">{points}</span>
          <span className="mt-0.5 text-[8.5px] font-bold text-white/55">points</span>
        </span>
        {rewards.length > 0 && (
          <span
            className="absolute -top-0.5 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-extrabold"
            style={{ background: '#FFB703', color: '#2B1A05' }}
          >
            {rewards.length}
          </span>
        )}
      </motion.button>
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

