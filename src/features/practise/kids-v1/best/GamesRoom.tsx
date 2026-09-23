import {
  useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties,
} from 'react';
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
import { stopSpeaking, speak } from '../kit/chirpyVoice';
import { artRoomFor, type VirtueRoom } from './rooms';
import './GamesRoom.css';

/*
  THE GAMES ROOM — a living magical place, not a quiz page.

  The room stays mounted between challenges. Only the board text and chest
  labels change. Everything else — painting, boy, Chirpy, scenery, ambient
  animations — persists. The child can tap the rug, the books, or the plant
  any time and find something small waiting there.
*/

const ART = '/mind-gym/games-room';
const ROOM_TITLE = 'Games Room';
const ROOM_TAGLINE = 'Play · Practice · Grow Brighter';
const RUN_LENGTH = 5;

const THEME_BADGES: { pillar: BehaviourPillar; img: string }[] = [
  { pillar: 'BeKind', img: 'subtitle_be_kind' },
  { pillar: 'TellTheTruth', img: 'subtitle_be_honest' },
  { pillar: 'MakeGoodChoices', img: 'subtitle_say_good_things' },
  { pillar: 'IncludeEveryone', img: 'subtitle_include_everyone' },
  { pillar: 'TakeCareOfMyBody', img: 'subtitle_take_care_my_body' },
  { pillar: 'HelpOthers', img: 'subtitle_help_others' },
];

const CHESTS = ['chest_laugh', 'chest_continue', 'chest_kind'] as const;
function chestArt(scenarioId: string, index: number) {
  let hash = 0;
  for (let i = 0; i < scenarioId.length; i++) hash = (hash * 31 + scenarioId.charCodeAt(i)) >>> 0;
  return CHESTS[(index + hash) % CHESTS.length];
}

/* ── Room awakening ─────────────────────────────────────────────────────── */
type AwakePhase = 'dim' | 'lighting' | 'ready';

/* Chirpy's opening lines, used before the first challenge appears. */
const INVITE_LINES = [
  "Ooh… something's waiting for us.",
  "Want to see what the room has today?",
  "I heard one of the treasure chests giggle.",
  "Something moved behind those books just now…",
  "The rug's been saving a secret for you.",
];
function pickInvite() { return INVITE_LINES[Math.floor(Math.random() * INVITE_LINES.length)]; }

/* ── Discovery layer ────────────────────────────────────────────────────── */
type DiscoveryId = 'rug' | 'books' | 'plant' | 'cushions';

interface DiscoveryBeat {
  /** Lines Chirpy says, revealed one at a time with a 2.5s gap. */
  lines: string[];
  /** Dismiss label. */
  close?: string;
}

function discoveryFor(id: DiscoveryId, feeling: string): DiscoveryBeat {
  switch (id) {
    case 'rug': return {
      lines: ['Can you feel your feet right now?', 'Both of them. Just sitting there.', '…did you notice them before I asked?'],
      close: 'Yep, I feel them.',
    };
    case 'books': return {
      lines: ['Right now — think about hopping.', 'Really picture it. Hopping on one leg.', '…are you hopping?', 'Thinking and doing are two different things. Your brain can say anything it likes. Your legs are yours.'],
      close: 'Got it.',
    };
    case 'plant': return {
      lines: ['This plant grew all by itself. Nobody told it when to grow.', 'Feelings do that too. They show up without asking.', "You didn't choose this one. It just arrived."],
      close: 'Hm. Yes.',
    };
    case 'cushions': return {
      lines: [
        `Say this in your head: "I am ${feeling || 'this feeling'}."\n\nNow say: "I notice I am ${feeling || 'this feeling'}."\n\nFeel any difference?`,
        'In the second one — there are two of you. The feeling, and the one who noticed.',
      ],
      close: 'I felt it.',
    };
  }
}

function DiscoveryOverlay({ id, feeling, still, quiet, onClose }: {
  id: DiscoveryId; feeling: string; still: boolean; quiet: boolean; onClose: () => void;
}) {
  const beat = discoveryFor(id, feeling);
  const [lineIndex, setLineIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lineIndex >= beat.lines.length - 1) return;
    timer.current = setTimeout(() => setLineIndex(i => i + 1), 2600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [lineIndex, beat.lines.length]);

  useEffect(() => {
    const line = beat.lines[lineIndex];
    if (line && !quiet) speak(line, quiet);
  }, [lineIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return <motion.div className="gr-discovery"
    initial={{ opacity: 0, y: still ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: still ? 0 : -8 }} transition={{ duration: still ? 0.1 : 0.3 }}
    role="dialog" aria-label="A room secret" aria-live="polite">
    <p className="gr-discovery-text">{beat.lines[lineIndex]}</p>
    {lineIndex === beat.lines.length - 1 && (
      <button className="gr-discovery-close" onClick={() => { stopSpeaking(); onClose(); }}>
        {beat.close ?? 'Close'}
      </button>
    )}
    {lineIndex < beat.lines.length - 1 && (
      <button className="gr-discovery-skip" onClick={() => {
        if (timer.current) clearTimeout(timer.current);
        setLineIndex(beat.lines.length - 1);
      }} aria-label="Skip to end">→</button>
    )}
  </motion.div>;
}

/* ── Ambient layer — fireflies and star motes ────────────────────────────── */
function AmbientLayer({ still }: { still: boolean }) {
  if (still) return null;
  return <div className="gr-ambient" aria-hidden="true">
    <span className="gr-firefly gr-ff-1" />
    <span className="gr-firefly gr-ff-2" />
    <span className="gr-firefly gr-ff-3" />
    <span className="gr-starmote gr-sm-1">✦</span>
    <span className="gr-starmote gr-sm-2">✦</span>
    <span className="gr-starmote gr-sm-3">★</span>
  </div>;
}

/* ── Clickable scenery ────────────────────────────────────────────────────── */
function Scenery({ onDiscover, discoveryActive, still }: {
  onDiscover: (id: DiscoveryId) => void;
  discoveryActive: boolean;
  still: boolean;
}) {
  return <div className="gr-scenery" aria-label="Room decorations">
    {/* Rug — tappable */}
    <button className="gr-scenery-btn gr-rug-btn" disabled={discoveryActive}
      aria-label="Tap the rug — there might be a secret"
      onClick={() => onDiscover('rug')}>
      <img className="gr-rug" src={`${ART}/rug.png`} alt="" />
    </button>

    {/* Books — tappable */}
    <button className="gr-scenery-btn gr-books-btn" disabled={discoveryActive}
      aria-label="Tap the books — see what they know"
      onClick={() => onDiscover('books')}>
      <img className="gr-books" src={`${ART}/books_stack.png`} alt="" />
    </button>

    {/* Plant — tappable */}
    <button className="gr-scenery-btn gr-plant-btn" disabled={discoveryActive}
      aria-label="Tap the plant — it has something to say"
      onClick={() => onDiscover('plant')}>
      <img className={`gr-plant ${still ? '' : 'gr-plant-sway'}`} src={`${ART}/plant_sprout.png`} alt="" />
    </button>

    {/* Cushions — tappable */}
    <button className="gr-scenery-btn gr-cushions-btn" disabled={discoveryActive}
      aria-label="Tap the cushions — try a little experiment"
      onClick={() => onDiscover('cushions')}>
      <img className="gr-cushions" src={`${ART}/cushions.png`} alt="" />
    </button>

    {/* Pure decoration */}
    <img className="gr-chalkboard" src={`${ART}/chalkboard.png`} alt="" aria-hidden="true" />
    <img className="gr-goodsign" src={`${ART}/good_choices_sign.png`} alt="" aria-hidden="true" />
    <img className="gr-lamp gr-lamp-left" src={`${ART}/lamp.png`} alt="" aria-hidden="true" />
    <img className="gr-lamp gr-lamp-right" src={`${ART}/lamp.png`} alt="" aria-hidden="true" />
  </div>;
}

/* ── Visual micro-consequence after a chest pick ─────────────────────────── */
function Consequence({ emoji, label, still }: { emoji?: string; label: string; still: boolean }) {
  return <motion.div className="gr-consequence"
    initial={{ opacity: 0, scale: still ? 1 : 0.85, y: still ? 0 : 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: still ? 1 : 0.9 }}
    transition={{ duration: still ? 0.1 : 0.38, type: 'spring', stiffness: 240, damping: 22 }}>
    {emoji && <span className="gr-consequence-emoji" aria-hidden="true">{emoji}</span>}
    <p>{label}</p>
  </motion.div>;
}

type Flight = { x: number; y: number; toX: number; toY: number; points: number };

export function GamesRoom({ room, pillar, onExit, onGrownUp }: {
  room: VirtueRoom;
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

  /* ── Awakening sequence ───────────────────────────────────────────────── */
  const [awakePhase, setAwakePhase] = useState<AwakePhase>('dim');
  const [inviteLine] = useState(pickInvite);
  useEffect(() => {
    if (quiet) { setAwakePhase('ready'); return; }
    const t1 = setTimeout(() => setAwakePhase('lighting'), 600);
    const t2 = setTimeout(() => { setAwakePhase('ready'); sound.play('enterRoom'); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Room discovery ───────────────────────────────────────────────────── */
  const [discovery, setDiscovery] = useState<DiscoveryId | null>(null);
  const openDiscovery = useCallback((id: DiscoveryId) => {
    stopSpeaking();
    sound.play('roomCard');
    setDiscovery(id);
  }, []);

  /* ── Idle surprise ────────────────────────────────────────────────────── */
  /* Every 25–40 s, if the child is idle (no discovery, not in distress),
     give one small ambient burst — a wobble on the books, Chirpy hops once.
     Implemented as a CSS class toggled briefly on the element. */
  const [bookWiggle, setBookWiggle] = useState(false);
  useEffect(() => {
    if (still || quiet || discovery) return;
    const interval = 25000 + Math.random() * 15000;
    const t = setTimeout(() => {
      setBookWiggle(true);
      setTimeout(() => setBookWiggle(false), 800);
    }, interval);
    return () => clearTimeout(t);
  });

  /* ── Theme + session ──────────────────────────────────────────────────── */
  const [theme, setTheme] = useState<GamesTheme>(() => pillar ?? themeForFeeling(todaysFeeling()));
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

  const switchTheme = () => {
    const next = themeForFeeling(todaysFeeling(), theme);
    session.stop(); stopSpeaking();
    celebrated.current = 0;
    setTheme(next); setSession(makeSession(next)); setReward(0);
  };

  useEffect(() => {
    if (quiet) return;
    session.start();
    return () => { session.stop(); stopSpeaking(); };
  }, [session, quiet]);

  useEffect(() => { if (!quiet) heading.current?.focus({ preventScroll: true }); }, [state.scenario.id, quiet]);

  useEffect(() => {
    if (quiet) return;
    const cancel = sound.playMusicWhenAllowed('storyTheme');
    return () => { cancel(); sound.stopMusic(); };
  }, [quiet]);

  /* ── Reward ───────────────────────────────────────────────────────────── */
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

  /* Chirpy's line — invite during awakening, then reaction/feedback. */
  const chirpyLine = awakePhase !== 'ready'
    ? (awakePhase === 'lighting' ? inviteLine : '…')
    : successful
      ? picked?.response
      : picked
        ? picked.response
        : reaction
          ? reaction.line
          : 'Choose a treasure and see what happens!';

  /* Consequence emoji — shown in the board area after picking. */
  const consequenceEmoji = picked?.points && picked.points >= 8 ? '😊'
    : picked?.points && picked.points >= 5 ? '🤔'
    : picked ? '💭' : undefined;

  /* Today's feeling, for the "noticing" discovery. */
  const todayFeeling = todaysFeeling() ?? 'this feeling';

  return <main
    className={`gr-room ${still ? 'gr-still' : ''} ${quiet ? 'gr-quiet' : ''} gr-awake-${awakePhase}`}
    data-pillar={theme}
    data-phase={state.phase}
    style={{ fontFamily: FONT, '--gr-accent': art.palette.accent } as CSSProperties}
  >
    {/*
      'cover', not 'contain'. Contained, the painting sat as a letterboxed
      panel with dead bands either side of it — and the scenery below is
      positioned against the viewport, so the books, the chalkboard and the
      plant all landed in those bands, floating on flat purple instead of
      standing in the room.
    */}
    <RoomScene room={art} dim={awakePhase === 'dim' ? 0.5 : 0.16} art={`${ART}/background.png`} fit="cover" />

    <div className="gr-warm-glow" aria-hidden="true" />
    <AmbientLayer still={still} />

    {/* Awakening dim overlay */}
    <AnimatePresence>
      {awakePhase === 'dim' && !still && (
        <motion.div className="gr-awake-veil" aria-hidden="true"
          initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} />
      )}
    </AnimatePresence>

    <Scenery
      onDiscover={openDiscovery}
      discoveryActive={discovery !== null}
      still={still}
    />

    <header className="gr-top">
      <div className="gr-top-left">
        <button className="gr-chip" onClick={() => leave(onExit)}>← Leave Room</button>
        <button className="gr-chip" aria-pressed={muted} onClick={() => {
          const next = !isMuted(); setMuted(next); setMutedState(next);
          if (next) { sound.stopAll(); sound.stopMusic(); stopSpeaking(); }
        }}>{muted ? 'Sound off' : 'Sound on'}</button>
      </div>

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

    {/* Theme ribbon */}
    <motion.p className="gr-ribbon"
      initial={{ opacity: 0, y: still ? 0 : -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: still ? 0 : 0.7, duration: still ? 0.1 : 0.5 }}>
      <span>{themeTitle}</span>
    </motion.p>

    {/* Discovery overlay — teaching move experience */}
    <AnimatePresence>
      {discovery && (
        <DiscoveryOverlay
          key={discovery}
          id={discovery}
          feeling={todayFeeling}
          still={still}
          quiet={quiet}
          onClose={() => setDiscovery(null)}
        />
      )}
    </AnimatePresence>

    {quiet
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

            {/* Visual consequence after picking */}
            <AnimatePresence>
              {successful && picked && (
                <Consequence
                  emoji={consequenceEmoji}
                  label={picked.response}
                  still={still}
                />
              )}
            </AnimatePresence>

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

        {/* Cast — outside AnimatePresence, never blinks between scenarios */}
        <div className="gr-cast">
          <img className="gr-boy" src={`${ART}/boy_sitting.png`} alt="" aria-hidden="true" />
          <img className={`gr-chirpy ${still ? '' : 'gr-chirpy-float'}`}
            src={`${ART}/chirpy_happy.png`} alt="" aria-hidden="true" />
          <div className="gr-bubble" aria-live="polite" aria-atomic="true">
            <p>{chirpyLine}</p>
          </div>
        </div>

        {/* Theme badges — the six pillars, switchable */}
        <nav className="gr-themes" aria-label="Practice themes">
          {THEME_BADGES.map(({ pillar, img }) => (
            <button key={pillar}
              className={`gr-theme-badge ${pillar === theme ? 'gr-theme-active' : ''}`}
              aria-pressed={pillar === theme}
              onClick={() => {
                if (pillar === theme) return;
                session.stop(); stopSpeaking();
                celebrated.current = 0;
                setTheme(pillar); setSession(makeSession(pillar)); setReward(0);
                if (!quiet) sound.play('tap');
              }}>
              <img src={`${ART}/${img}.png`} alt={BEHAVIOUR_PILLARS[pillar].title} />
            </button>
          ))}
          <span className="gr-themes-note">Same fun room. Different scenarios. A kinder you!</span>
        </nav>

        {/* Book wiggle surprise */}
        {bookWiggle && <div className="gr-book-sparkle" aria-hidden="true">✦</div>}
      </>}

    {/* ── The reward, after a run of five ──────────────────────────────── */}
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
