import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from './rooms';
import type { Game } from './games/types';
import { BAND_LABEL } from './games/types';
import { CHROME, Cta, FONT, GrownUpExit, Question } from './ui/chrome';
import { DoorHandle } from './ui/DoorHandle';
import { useMotion } from './ui/quiet';
import { Chirpy, RoomScene } from './ui/scene';
import { ChooseEngine } from './engines/Choose';
import { BodyTapEngine } from './engines/BodyTap';
import { SortEngine } from './engines/Sort';
import { DialEngine } from './engines/Dial';
import { TimedEngine } from './engines/Timed';
import { StoryEngine } from './engines/Story';
import * as sound from './kit/sound';

/**
 * R-01 · the game shell. ONE shell, parameterised per room and per game —
 * the whole screen inventory is 19 screens plus 6 engines (master plan §9),
 * and this is the file that keeps it that way.
 *
 * Four phases, the same for all 67 games so a child learns the shape once:
 *
 *   NAME     the game names itself. Master plan §6: "show the game's name on
 *            entry so a child who loves one can ask for it again" — which is
 *            also how a game becomes a thing a child owns rather than
 *            something the app served them.
 *   PLAY     the engine runs.
 *   NOTICE   SH-NAME, the shared naming component that ends every game
 *            (§9). What did you catch? — never how did you do.
 *   CLOSE    the game's one closing line, then out.
 *
 * The grown-up exit is rendered on every phase at the same position (§2.10).
 */

type Phase = 'name' | 'play' | 'notice' | 'close';

/** SH-NAME's options. Discoveries, in the child's voice — never achievements. */
const NOTICED = [
  'I caught a thought',
  'I found it in my body',
  'I noticed a feeling change',
  'I found another story',
  'I stopped before I did something',
  'I’m not sure yet',
];

export function GameShell({
  game,
  room,
  onExit,
  onFinished,
  onGrownUp,
}: {
  game: Game;
  room: RoomConfig;
  onExit: () => void;
  onFinished: (gameId: string) => void;
  onGrownUp: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('name');
  const [noticed, setNoticed] = useState<string | null>(null);
  const m = useMotion();

  useEffect(() => {
    if (phase !== 'name') return;
    sound.play('enterRoom');
    const t = window.setTimeout(() => setPhase('play'), 2400);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => () => sound.stopAll(), []);

  const finishPlay = () => {
    // An off-screen game's noticing happens later, in real life — asking
    // "what did you catch?" now would be asking about something that hasn't
    // happened yet. Those games go straight to their closing line.
    setPhase(game.offScreen ? 'close' : 'notice');
  };

  const pickNoticed = (n: string) => {
    sound.play('tap');
    setNoticed(n);
    window.setTimeout(() => setPhase('close'), m.advanceMs);
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* The way out is a fitting on the left wall, the same one on every
          screen in the app. No chevron in the corner any more: a child who
          learns one door learns them all. */}
      <DoorHandle side="left" label="Back" onClick={onExit} accent={room.palette.accent} />

      {/* The scrim is not optional (UI §3.1) — but it covers the bottom
          55%, and these screens centre their content vertically, so it lands
          over the brightest part of a painting. The title beat keeps the art
          cinematic; every beat that has to be READ gets a full-frame veil on
          top of the scrim. Art is the room, not the page. */}
      <RoomScene room={room} dim={phase === 'name' ? 0.34 : 0.5} />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-[74px] pb-8 pt-4 sm:px-20">
        <div className="flex items-center justify-between gap-3">
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            {phase === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col items-start gap-3"
              >
                <p className="text-[12px] font-extrabold uppercase tracking-[0.2em]" style={{ color: room.palette.accent }}>
                  {room.name} · {BAND_LABEL[game.band]}
                </p>
                <h1
                  className="text-[36px] font-extrabold leading-[1.06] sm:text-[42px]"
                  style={{ color: CHROME.text, letterSpacing: '-0.015em', textWrap: 'balance', fontFamily: FONT }}
                >
                  {game.name}
                </h1>
                <p className="text-[15px] font-bold" style={{ color: CHROME.textSoft }}>
                  {game.trains}
                </p>
                <div className="mt-4 w-full">
                  <Chirpy pose="curious" line={game.opener} align="left" />
                </div>
              </motion.div>
            )}

            {phase === 'play' && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={m.transition}>
                <Engine game={game} room={room} onDone={finishPlay} />
              </motion.div>
            )}

            {phase === 'notice' && (
              <motion.div
                key="notice"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={m.transition}
                className="flex flex-col gap-4"
              >
                <Question room={room}>What did you catch?</Question>
                <div className="flex flex-col" style={{ gap: m.gap }}>
                  {NOTICED.map((n) => (
                    <button
                      key={n}
                      onClick={() => pickNoticed(n)}
                      className="w-full rounded-[999px] px-5 py-3 text-left text-[15.5px] font-bold backdrop-blur-md transition"
                      style={{
                        minHeight: m.target,
                        color: CHROME.text,
                        background: noticed === n ? CHROME.pillSelected : CHROME.pill,
                        border: noticed === n ? `1.5px solid ${CHROME.pillSelectedBorder}` : `1px solid ${CHROME.pillBorder}`,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'close' && (
              <motion.div
                key="close"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col gap-6"
              >
                <Question room={room}>{game.close}</Question>
                {game.offScreen && (
                  <p className="text-[15px] font-bold leading-snug" style={{ color: CHROME.textSoft }}>
                    Nothing to do here now. The rest of it happens out there.
                  </p>
                )}
                <Cta
                  label="Back to the room"
                  onClick={() => { sound.play('exitRoom'); onFinished(game.id); }}
                  accent={room.palette.accent}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * The engine switch. Exhaustive over `Game`'s discriminant, so adding a
 * seventh engine is a type error here rather than a blank screen in front of
 * a child — which is the point of the union being narrow in types.ts.
 */
function Engine({ game, room, onDone }: { game: Game; room: RoomConfig; onDone: () => void }) {
  switch (game.engine) {
    case 'choose': return <ChooseEngine game={game} room={room} onDone={onDone} />;
    case 'body':   return <BodyTapEngine game={game} room={room} onDone={onDone} />;
    case 'sort':   return <SortEngine game={game} room={room} onDone={onDone} />;
    case 'dial':   return <DialEngine game={game} room={room} onDone={onDone} />;
    case 'timed':  return <TimedEngine game={game} room={room} onDone={onDone} />;
    case 'story':  return <StoryEngine game={game} room={room} onDone={onDone} />;
  }
}
