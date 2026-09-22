import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BEHAVIOUR_PILLARS, type BehaviourPillar } from '../../../../assets/mind-gym-180-balanced-behaviour-scenarios';
import { useKidStore } from '../../../kids/store';
import { isMuted, setMuted } from '../../../../lib/sfx';
import { RoomScene } from '../ui/scene';
import { useQuiet } from '../ui/quiet';
import { FONT } from '../ui/chrome';
import { SpeakButton } from '../ui/SpeakButton';
import { Steady } from '../ui/Steady';
import { STEADY_GROWNUP } from '../kit/steady';
import { childAge } from '../kit/band';
import { createPracticeSession, createScenarioPool, eligibleScenarios } from '../kit/behaviourPractice';
import { themeForFeeling, roomIdForTheme, type GamesTheme } from '../kit/gamesRoomThemes';
import { todaysFeeling } from '../kit/todaysFeeling';
import * as sound from '../kit/sound';
import { stopSpeaking } from '../kit/chirpyVoice';
import { artRoomFor, type VirtueRoom } from './rooms';
import './GamesRoom.css';

/*
  THE GAMES ROOM.

  One magical place that stays put while the practice inside it changes. The
  room is always called the Games Room; the ribbon under the sign carries the
  theme the child came in to practise, and that is the only part of the title
  that moves.

  WHAT THIS IS NOT: a new stack. Everything underneath was already here and is
  untouched — the 180-scenario library, the shuffle bag that avoids the last
  three, the age filter, the session state machine in kit/behaviourPractice,
  Mind Stars, the quiet state. This file is the room those things are played
  in. The screen it replaces (see the pack's
  current_app_screen_before_redesign.png) had the same engine behind a prompt
  card and three flat buttons.

  THE ROOM DOES NOT REMOUNT BETWEEN SCENARIOS, which is the point of the
  redesign and the easiest thing to break. The painting, the scenery, the boy,
  Chirpy, the sign and the ribbon are all outside the AnimatePresence below;
  only the board's words and the three chests are keyed on the scenario. A
  child should never see the room blink.
*/

const ART = '/mind-gym/games-room';

/** The room's own name, which never changes, and the line under it. */
const ROOM_TITLE = 'Games Room';
const ROOM_TAGLINE = 'Play · Practice · Grow Brighter';

/** How many practices make a run, after which the reward chest opens. */
const RUN_LENGTH = 5;

/*
  THREE CHESTS, AND WHICH ART GOES WHERE.

  The pack ships three: a laughing one, a plain one, and one with a heart. The
  obvious thing is to hand the heart to the kindest option, and it is the one
  thing that must not happen — a child learns in two scenarios to tap the pink
  chest and stops reading the choices at all. The library's own ordering tends
  to put the warmest option last, so fixing art to position would leak it just
  as badly.

  So the art rotates by a number derived from the scenario's id: stable across
  every re-render of the same scenario, different between scenarios, and
  carrying no information about which choice is which. The chest is scenery.
  What the child reads is the plaque.
*/
const CHESTS = ['chest_laugh', 'chest_continue', 'chest_kind'] as const;
function chestArt(scenarioId: string, index: number) {
  let hash = 0;
  for (let i = 0; i < scenarioId.length; i++) hash = (hash * 31 + scenarioId.charCodeAt(i)) >>> 0;
  return CHESTS[(index + hash) % CHESTS.length];
}

/** The scenery that makes it a room rather than a background. Pure decoration:
 *  aria-hidden and untappable, so none of it is in a child's way. */
function Scenery() {
  return <div className="gr-scenery" aria-hidden="true">
    <img className="gr-rug" src={`${ART}/rug.png`} alt="" />
    <img className="gr-cushions" src={`${ART}/cushions.png`} alt="" />
    <img className="gr-books" src={`${ART}/books_stack.png`} alt="" />
    <img className="gr-plant" src={`${ART}/plant_sprout.png`} alt="" />
    <img className="gr-chalkboard" src={`${ART}/chalkboard.png`} alt="" />
    <img className="gr-goodsign" src={`${ART}/good_choices_sign.png`} alt="" />
  </div>;
}

type Flight = { x: number; y: number; toX: number; toY: number; points: number };

export function GamesRoom({ room, pillar, onExit, onGrownUp }: {
  room: VirtueRoom;
  /**
   * The door's own theme, which always wins. Left out only when a child
   * reaches the room without choosing one — then today's feeling tips it,
   * see kit/gamesRoomThemes.
   */
  pillar?: BehaviourPillar;
  onExit: () => void;
  onGrownUp: () => void;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const [muted, setMutedState] = useState(isMuted);
  const points = useKidStore(s => s.points);
  const counter = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [flight, setFlight] = useState<Flight | null>(null);

  /*
    THE THEME IS STATE, NOT JUST A PROP, because "try another game" moves it
    without leaving the room — which is the whole idea of a persistent place.
    It starts as the door's theme and only consults the feeling when there
    isn't one.
  */
  const [theme, setTheme] = useState<GamesTheme>(() => pillar ?? themeForFeeling(todaysFeeling()));

  /* A fresh bag and a fresh session per theme. Keyed on `theme` rather than
     built once, so switching genuinely starts a new run rather than dealing
     the old room's scenarios under a new ribbon. */
  const [session, setSession] = useState(() => makeSession(theme));
  function makeSession(forTheme: GamesTheme) {
    const pool = createScenarioPool(eligibleScenarios(forTheme, childAge()));
    const creditTo = roomIdForTheme(forTheme);
    return createPracticeSession({
      next: () => pool.next(),
      award: (value, scenario) => {
        useKidStore.getState().awardPoints(value, creditTo);
        useKidStore.getState().completeScenario(scenario.id);
      },
      successSound: () => { if (!quiet) sound.play('discovery'); },
    });
  }
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);

  /** Move to a different practice without unmounting the room. */
  const switchTheme = () => {
    const next = themeForFeeling(todaysFeeling(), theme);
    session.stop();
    stopSpeaking();
    celebrated.current = 0;
    setTheme(next);
    setSession(makeSession(next));
    setReward(0);
  };

  /*
    THE QUIET STATE DOES NOT PLAY. §18: an upset child needs company, not
    curriculum, and a room of treasure chests asking them to choose well is
    curriculum with sparkles on it. The session is never started, so no timer
    runs and no scenario is ever put to them.
  */
  useEffect(() => {
    if (quiet) return;
    session.start();
    return () => { session.stop(); stopSpeaking(); };
  }, [session, quiet]);

  /* Focus follows the challenge, so a keyboard or screen-reader child is
     moved to the new words rather than left where the old ones were. */
  useEffect(() => { if (!quiet) heading.current?.focus({ preventScroll: true }); }, [state.scenario.id, quiet]);

  /* The room's own music, the same low bed the other painted rooms use. */
  useEffect(() => {
    if (quiet) return;
    const cancel = sound.playMusicWhenAllowed('storyTheme');
    return () => { cancel(); sound.stopMusic(); };
  }, [quiet]);

  /*
    THE REWARD IS FOR TURNING UP, NOT FOR BEING GOOD.

    It opens on the count of practices, which is why the copy talks about
    practising rather than about the child being kind. Nothing here inspects
    which choices they made.

    The session is deliberately NOT paused underneath: it carries on to the
    next scenario behind the overlay, so dismissing this lands the child in a
    fresh challenge rather than on the one they have already answered.
  */
  const [reward, setReward] = useState(0);
  const celebrated = useRef(0);
  useEffect(() => {
    const done = state.practised;
    if (done > 0 && done % RUN_LENGTH === 0 && done !== celebrated.current) {
      celebrated.current = done;
      setReward(done);
      if (!quiet) sound.play('miniWin');
    }
  }, [state.practised, quiet]);

  const art = artRoomFor(room);
  const themeTitle = BEHAVIOUR_PILLARS[theme].title;
  const picked = state.selected === null ? null : state.scenario.choices[state.selected];
  const successful = state.phase === 'success' || state.phase === 'transition';
  const reaction = state.scenario.reactions[state.reaction];
  const filled = state.practised % RUN_LENGTH === 0 && state.practised > 0 ? RUN_LENGTH : state.practised % RUN_LENGTH;
  const leave = (action: () => void) => { session.stop(); stopSpeaking(); sound.stopMusic(); action(); };

  /** What Chirpy has to say right now — a reaction, a response, or nothing. */
  const chirpyLine = successful ? picked?.response
    : picked ? picked.response
    : reaction ? reaction.line
    : 'Choose a treasure and see what happens!';

  return <main
    className={`gr-room ${still ? 'gr-still' : ''} ${quiet ? 'gr-quiet' : ''}`}
    data-pillar={theme}
    data-phase={state.phase}
    style={{ fontFamily: FONT, '--gr-accent': art.palette.accent } as CSSProperties}
  >
    {/*
      CONTAIN, NOT COVER, and the blurred bed behind it does the rest.

      The room paintings are 820x1152 portraits. Cover on a 1512-wide window
      scales one up by about half again and shows a slice of it — which is why
      this arrived as a giant soft face behind the chests. Contain draws the
      whole painting at about 0.74, so it is drawn smaller than the source rather
      than blown up, and RoomScene fills the space either side with the same
      image blurred out. Nothing here has to be aimed at, so there is no
      reason to crop it, and `feather` melts its two vertical edges into the
      blur so it does not read as a picture hung in the middle of the wall.
    */}
    <RoomScene room={art} dim={0.34} fit="contain" feather />
    <Scenery />

    <header className="gr-top">
      <div className="gr-top-left">
        <button className="gr-chip" onClick={() => leave(onExit)}>← Leave Room</button>
        <button className="gr-chip" aria-pressed={muted} onClick={() => {
          const next = !isMuted(); setMuted(next); setMutedState(next);
          if (next) { sound.stopAll(); sound.stopMusic(); stopSpeaking(); }
        }}>{muted ? 'Sound off' : 'Sound on'}</button>
      </div>

      {/* The sign is the room's name and it does not change. The theme goes
          on the ribbon below it, never up here. */}
      {/* The painted sign already carries both lines, so the heading beside it
          is for screen readers only — a picture of a word is not a heading. */}
      <div className="gr-sign">
        <h1 className="sr-only">{ROOM_TITLE}. {ROOM_TAGLINE}</h1>
        <img src={`${ART}/room_title_games_room.png`} alt="" aria-hidden="true" />
      </div>

      <div className="gr-top-right">
        <motion.div ref={counter} className="gr-stars-count" aria-label={`Mind Stars: ${points}`}
          animate={!still && state.rewardArrived ? { scale: [1, 1.13, 1] } : { scale: 1 }}>
          <img src={`${ART}/star_filled.png`} alt="" aria-hidden="true" />
          <span>{points}</span><small>Mind Stars</small>
        </motion.div>
        <button className="gr-chip" onClick={() => leave(onGrownUp)}>♡ Talk to a grown-up</button>
      </div>
    </header>

    {/* The theme, secondary to the room's name by design. */}
    <p className="gr-ribbon"><span>{themeTitle}</span></p>

    {quiet
      /*
        No board, no chests, no progress. A sentence and the two ways out that
        matter. See ui/Steady for why this is the plainest thing in the app.
      */
      ? <section className="gr-calm">
          <Steady line="Nothing to play in here today. I'll just sit with you." />
          <button className="gr-calm-grownup" onClick={() => leave(onGrownUp)}>{STEADY_GROWNUP}</button>
          <button className="gr-calm-leave" onClick={() => leave(onExit)}>← Leave Room</button>
        </section>

      : <>
        <AnimatePresence mode="wait">
          <motion.section className="gr-play" key={state.scenario.id}
            initial={{ opacity: 0, y: still ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: still ? 0 : -8 }} transition={{ duration: still ? 0.12 : 0.32 }}>

            {/* The hanging challenge board. */}
            <div className="gr-board">
              <h2 ref={heading} tabIndex={-1}>{state.scenario.title}</h2>
              <p>{state.scenario.setup}</p>
              <SpeakButton text={`${state.scenario.title}. ${state.scenario.setup}`}
                accent={art.palette.accent} label="Read the challenge to me" />
              <ol className="gr-progress" aria-label={`${filled} of ${RUN_LENGTH} practised in this run`}>
                {Array.from({ length: RUN_LENGTH }, (_, i) => <li key={i}>
                  <img src={`${ART}/${i < filled ? 'star_filled' : 'star_empty'}.png`} alt="" aria-hidden="true" />
                </li>)}
              </ol>
            </div>

            {/* Three treasures on the rug. Each is one button: the chest and
                its plaque together, so the whole thing is the target. */}
            <div className="gr-chests" role="group" aria-label="Choose a treasure">
              {state.scenario.choices.map((choice, index) => <button key={index}
                className={`gr-chest ${state.selected === index ? 'gr-chest-open' : ''} ${successful && state.selected !== index ? 'gr-chest-quiet' : ''}`}
                disabled={successful || state.phase !== 'choices'}
                aria-label={choice.label}
                onClick={event => {
                  const source = event.currentTarget.getBoundingClientRect();
                  const target = counter.current?.getBoundingClientRect();
                  stopSpeaking();
                  if (!quiet) sound.play('tap');
                  if (session.choose(index) && target) setFlight({
                    x: source.left + source.width / 2, y: source.top + source.height / 2,
                    toX: target.left + target.width / 2, toY: target.top + target.height / 2,
                    points: choice.points,
                  });
                }}>
                <span className="gr-chest-art">
                  <img src={`${ART}/${chestArt(state.scenario.id, index)}.png`} alt="" aria-hidden="true" />
                  <img className="gr-chest-sparkle" src={`${ART}/sparkles.png`} alt="" aria-hidden="true" />
                  <span className="gr-chest-emoji" aria-hidden="true">{choice.emoji}</span>
                </span>
                <span className="gr-plaque">{choice.label}</span>
              </button>)}
            </div>

            {/* The dialogue that was doing this job before — kept, moved into
                the room beside Chirpy rather than floating above the buttons. */}
            {(state.phase === 'intro' || state.phase === 'reactions') &&
              <button className="gr-ready" onClick={() => { stopSpeaking(); session.skipDialogue(); }}>Ready to choose</button>}

            <p className="gr-prompt">
              <span aria-hidden="true">★</span>
              {state.practised
                ? `${state.practised} ${state.practised === 1 ? 'choice' : 'choices'} practised`
                : 'Choose a treasure and see what happens!'}
            </p>
          </motion.section>
        </AnimatePresence>

        {/* The boy and Chirpy sit outside the AnimatePresence on purpose —
            they are in the room, not in the challenge, and must not blink
            when the board changes. */}
        <div className="gr-cast">
          <img className="gr-boy" src={`${ART}/boy_sitting.png`} alt="" aria-hidden="true" />
          <img className="gr-chirpy" src={`${ART}/chirpy_happy.png`} alt="" aria-hidden="true" />
          <div className="gr-bubble" aria-live="polite" aria-atomic="true">
            <p>{chirpyLine}</p>
          </div>
        </div>
      </>}

    {/* ── The reward, after a run of five ─────────────────────────────── */}
    <AnimatePresence>
      {reward > 0 && <motion.div className="gr-reward" role="dialog" aria-modal="true" aria-label="Practice run complete"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="gr-reward-card"
          initial={{ scale: still ? 1 : 0.9, y: still ? 0 : 14 }} animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 190, damping: 22 }}>
          <img className="gr-reward-burst" src={`${ART}/celebration_stars.png`} alt="" aria-hidden="true" />
          <img className="gr-reward-chest" src={`${ART}/reward_chest_open.png`} alt="" aria-hidden="true" />
          <h2>{RUN_LENGTH} practised!</h2>
          <p>You tried five real-life moments in the {themeTitle} room. That is what practice is — not getting them right, just having a go.</p>
          <div className="gr-reward-actions">
            <button className="gr-reward-again" autoFocus onClick={() => { if (!quiet) sound.play('tap'); setReward(0); }}>Play again</button>
            {/* Same room, different practice — the one place the feeling
                affinity actually shows its working. */}
            <button className="gr-reward-swap" onClick={() => { if (!quiet) sound.play('tap'); switchTheme(); }}>Try another game</button>
            <button className="gr-reward-leave" onClick={() => leave(onExit)}>Leave Room</button>
          </div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>

    {state.phase === 'success' && flight && createPortal(<motion.div className="gr-points-flight" aria-hidden
      style={{ left: flight.x, top: flight.y }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0.7 }}
      animate={still ? { y: -24, opacity: [1, 1, 0], scale: 1 } : {
        x: [0, 0, flight.toX - flight.x], y: [0, -55, flight.toY - flight.y],
        scale: [0.7, 1.2, 0.6], opacity: [1, 1, 0],
      }} transition={{ duration: still ? 0.6 : 1.1, times: [0, 0.25, 1], ease: 'easeInOut' }}>
      +{flight.points} ⭐
    </motion.div>, document.body)}
  </main>;
}
