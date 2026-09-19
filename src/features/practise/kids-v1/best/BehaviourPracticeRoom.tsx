import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BEHAVIOUR_PILLARS, type BehaviourPillar } from '../../../../assets/mind-gym-180-balanced-behaviour-scenarios';
import { useKidStore } from '../../../kids/store';
import { EMOTIONS } from '../../../kids/emotions';
import { CompanionOrb } from '../../../kids/Companion';
import { isMuted, setMuted } from '../../../../lib/sfx';
import { RoomScene } from '../ui/scene';
import { useQuiet } from '../ui/quiet';
import { FONT } from '../ui/chrome';
import { SpeakButton } from '../ui/SpeakButton';
import { childAge } from '../kit/band';
import { createPracticeSession, createScenarioPool, eligibleScenarios } from '../kit/behaviourPractice';
import * as sound from '../kit/sound';
import { stopSpeaking } from '../kit/chirpyVoice';
import { artRoomFor, type VirtueRoom } from './rooms';
import './BehaviourPracticeRoom.css';

type Flight = { x: number; y: number; toX: number; toY: number; points: number };
const ROOM_LIGHTS: Record<BehaviourPillar, string> = {
  BeKind: '✿', TellTheTruth: '✧', MakeGoodChoices: '◇',
  IncludeEveryone: '◌', TakeCareOfMyBody: '❧', HelpOthers: '✦',
};

/** Persistent painted room; only the role-play content changes between rounds. */
export function BehaviourPracticeRoom({ room, pillar, onExit, onGrownUp }: {
  room: VirtueRoom; pillar: BehaviourPillar; onExit: () => void; onGrownUp: () => void;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const [muted, setMutedState] = useState(isMuted);
  const points = useKidStore(s => s.points);
  const counter = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [session] = useState(() => {
    const pool = createScenarioPool(eligibleScenarios(pillar, childAge()));
    return createPracticeSession({
      next: () => pool.next(),
      award: (value, scenario) => {
        useKidStore.getState().awardPoints(value, room.id);
        useKidStore.getState().completeScenario(scenario.id);
      },
      successSound: () => { if (!quiet) sound.play('discovery'); },
    });
  });
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  useEffect(() => { session.start(); return () => { session.stop(); stopSpeaking(); }; }, [session]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [state.scenario.id]);
  const art = artRoomFor(room);
  const picked = state.selected === null ? null : state.scenario.choices[state.selected];
  const successful = state.phase === 'success' || state.phase === 'transition';
  const reaction = state.scenario.reactions[state.reaction];
  const character = reaction && EMOTIONS[reaction.who];
  const leave = (action: () => void) => { session.stop(); stopSpeaking(); action(); };

  return <main className={`bp-room ${still ? 'bp-still' : ''}`} data-pillar={pillar} data-phase={state.phase}
    style={{ fontFamily: FONT, '--bp-accent': art.palette.accent } as CSSProperties}>
    <RoomScene room={art} dim={0.25} />
    <header className="bp-header">
      <button onClick={() => leave(onExit)}>← Leave Room</button>
      <div className="bp-room-name">{BEHAVIOUR_PILLARS[pillar].title}<small>Real-life practice</small></div>
      <motion.div ref={counter} className="bp-counter" aria-label={`Mind Stars: ${points}`}
        animate={!still && state.rewardArrived ? { scale: [1, 1.13, 1] } : { scale: 1 }}>
        <span aria-hidden>⭐</span> <span>{points}</span><small>Mind Stars</small>
      </motion.div>
    </header>
    <div className="bp-utilities">
      <button aria-pressed={muted} onClick={() => { const next = !isMuted(); setMuted(next); setMutedState(next); if (next) { sound.stopAll(); stopSpeaking(); } }}>{muted ? 'Sound off' : 'Sound on'}</button>
      <button onClick={() => leave(onGrownUp)}>Talk to a grown-up</button>
    </div>
    <div className="bp-world-light" aria-hidden data-lit={successful}>{ROOM_LIGHTS[pillar]}</div>
    <AnimatePresence mode="wait">
      {state.phase !== 'transition' && <motion.section className="bp-stage" key={state.scenario.id}
        initial={{ opacity: 0, scale: still ? 1 : 0.97 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: still ? 1 : 0.98 }} transition={{ duration: still ? 0.12 : 0.28 }}>
        <div className="bp-situation">
          <h1 ref={heading} tabIndex={-1}>{state.scenario.title}</h1>
          <p>{state.scenario.setup}</p>
          <SpeakButton text={state.scenario.setup} accent={art.palette.accent} label="Read the situation to me" />
        </div>
        <div className="bp-cast" aria-live="polite" aria-atomic="true">
          {character && !quiet && <CompanionOrb c={character} size={90} bounce={!still && state.phase === 'reactions'} />}
          <div className="bp-speech">
            {successful ? <><strong>Great practising!</strong><p>{picked?.response}</p><span>+{picked?.points} ⭐</span></>
              : picked ? <p>{picked.response}</p>
              : reaction ? <><strong>{character?.name ?? reaction.who}</strong><p>{reaction.line}</p></>
              : <p>Picture yourself here. What might you do?</p>}
          </div>
        </div>
        {(state.phase === 'intro' || state.phase === 'reactions') && <button className="bp-skip" onClick={() => { stopSpeaking(); session.skipDialogue(); }}>Ready to choose</button>}
        {(state.phase === 'choices' || state.phase === 'success') && <div className="bp-choices" aria-label="Choose what you would do">
          {state.scenario.choices.map((choice, index) => <motion.button key={index}
            className={`bp-choice ${successful && state.selected === index ? 'bp-chosen' : ''}`}
            disabled={successful} whileTap={still ? undefined : { scale: 0.97 }}
            animate={!still && state.selected === index ? (successful ? { y: -8, scale: 1.03 } : { x: [0, -3, 3, 0] }) : { y: 0, scale: 1 }}
            onClick={event => {
              const source = event.currentTarget.getBoundingClientRect();
              const target = counter.current?.getBoundingClientRect();
              stopSpeaking();
              if (session.choose(index) && target) setFlight({ x: source.left + source.width / 2, y: source.top + source.height / 2,
                toX: target.left + target.width / 2, toY: target.top + target.height / 2, points: choice.points });
            }}>
            <span aria-hidden className="bp-choice-symbol">{choice.emoji}</span><span>{choice.label}</span>
          </motion.button>)}
        </div>}
      </motion.section>}
    </AnimatePresence>
    <p className="bp-practised" aria-live="polite">{state.practised ? `${state.practised} ${state.practised === 1 ? 'choice' : 'choices'} practised` : 'A place to try helpful choices. No need to be perfect.'}</p>
    {state.phase === 'success' && flight && createPortal(<motion.div className="bp-points-flight" aria-hidden
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
