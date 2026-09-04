import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from './rooms';
import type { Game, TeachMove } from './games/types';
import { MOVE_LABEL } from './games/types';
import { filterGames, gamesInRoom, pickNextGame } from './games/library';
import { CHROME, Cta, FONT, BackButton, GrownUpExit } from './ui/chrome';
import { useMotion, useQuiet } from './ui/quiet';
import { Chirpy, RoomScene } from './ui/scene';
import * as sound from './kit/sound';

/**
 * A room, opened: its shelf of games.
 *
 * Entering is a small cinematic — the camera settles, the room names itself,
 * and only then does the shelf appear. Same sequence in every room, so it
 * becomes something a child learns to expect rather than something they have
 * to read.
 *
 * "How a room picks a game: rotate, don't randomise" (master plan §6). The
 * shelf itself is in a STABLE order — flagship first, then authored order —
 * because a child who loved a game needs to find it in the same place
 * tomorrow. The rotation lives in "Pick one for me", which avoids the last
 * two played and gently favours untried ones. Both behaviours matter and
 * they'd fight each other if the shelf shuffled itself.
 */

type Phase = 'arrive' | 'shelf';

export function RoomView({
  room,
  onExit,
  onPlay,
  onGrownUp,
  played,
  recent,
}: {
  room: RoomConfig;
  onExit: () => void;
  onPlay: (game: Game) => void;
  onGrownUp: () => void;
  /** Every game this child has finished, for the "new" mark and the rotation. */
  played: string[];
  /** The last few games played in this room, so "pick one" doesn't repeat. */
  recent: string[];
}) {
  const [phase, setPhase] = useState<Phase>('arrive');
  const [move, setMove] = useState<TeachMove | null>(null);
  const m = useMotion();
  const quiet = useQuiet();

  useEffect(() => {
    sound.play('enterRoom');
    const t = window.setTimeout(() => setPhase('shelf'), 1900);
    return () => { clearTimeout(t); sound.stopAll(); };
  }, [room.id]);

  const shelf = useMemo(() => gamesInRoom(room.id), [room.id]);
  const shown = useMemo(() => (move ? filterGames(shelf, { move }) : shelf), [shelf, move]);

  // Which teaching moves this room actually has. No empty filter chips.
  const moves = useMemo(() => {
    const set = new Set<TeachMove>();
    for (const g of shelf) set.add(g.move);
    return [...set];
  }, [shelf]);

  const surprise = () => {
    const g = pickNextGame(room.id, recent, played);
    if (g) { sound.play('roomCard'); onPlay(g); }
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* Arriving is cinematic — the painting is the point. The shelf is a
          list to read, so it sits behind a much heavier veil. Same reasoning
          as GameShell's. */}
      <RoomScene room={room} dim={phase === 'arrive' ? 0.26 : 0.55} />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-3xl flex-col px-5 pb-12 pt-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={onExit} label="Back to the gym" />
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'arrive' ? (
            <motion.div
              key="arrive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.8 }}
              className="flex flex-1 flex-col justify-center gap-3"
            >
              <h1
                className="text-[38px] font-extrabold leading-[1.05] sm:text-[46px]"
                style={{ color: CHROME.text, letterSpacing: '-0.015em', textWrap: 'balance', fontFamily: FONT }}
              >
                {room.name}
              </h1>
              <p className="text-[17px] font-bold leading-snug" style={{ color: CHROME.textSoft, textWrap: 'balance' }}>
                {room.tagline}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="shelf"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={m.transition}
              className="flex flex-1 flex-col gap-5 pt-5"
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-[27px] font-extrabold leading-tight" style={{ color: CHROME.text, letterSpacing: '-0.015em', fontFamily: FONT }}>
                  {room.name}
                </h1>
                {/* The quiet line: what this room is for (UI §8.1). */}
                <p className="text-[13.5px] font-bold" style={{ color: room.palette.accent }}>
                  Trains: {room.trains.toLowerCase()} · {shelf.length} games
                </p>
              </div>

              {!quiet && <Chirpy pose="curious" line={room.welcome} align="left" size={78} />}

              <Cta label="Pick one for me" onClick={surprise} accent={room.palette.accent} />

              {/* Filter by how a game teaches. Hidden in the quiet state —
                  an upset child does not need a taxonomy. */}
              {!quiet && moves.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <Chip label="All" on={move === null} onClick={() => setMove(null)} />
                  {moves.map((mv) => (
                    <Chip key={mv} label={MOVE_LABEL[mv]} on={move === mv} onClick={() => setMove(mv)} />
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {shown.map((g, i) => (
                  <GameCard
                    key={g.id}
                    game={g}
                    room={room}
                    index={i}
                    isNew={!played.includes(g.id)}
                    onClick={() => { sound.play('roomCard'); onPlay(g); }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-2 text-[12.5px] font-extrabold transition"
      style={{
        color: CHROME.text,
        background: on ? CHROME.pillSelected : CHROME.pill,
        border: on ? `1.5px solid ${CHROME.pillSelectedBorder}` : `1px solid ${CHROME.pillBorder}`,
      }}
    >
      {label}
    </button>
  );
}

function GameCard({
  game,
  room,
  index,
  isNew,
  onClick,
}: {
  game: Game;
  room: RoomConfig;
  index: number;
  isNew: boolean;
  onClick: () => void;
}) {
  const m = useMotion();
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: m.quiet ? 0 : Math.min(index * 0.035, 0.4), duration: 0.35 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="flex flex-col gap-1.5 rounded-[22px] p-4 text-left backdrop-blur-md transition"
      style={{
        minHeight: m.target + 32,
        background: CHROME.pill,
        border: `1px solid ${CHROME.pillBorder}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[16.5px] font-extrabold leading-tight" style={{ color: CHROME.text }}>
          {game.name}
        </span>
        {/* "Not played yet", never "unlocked" and never a score. The only
            mark on a card in the whole app. */}
        {isNew && (
          <span
            className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
            style={{ background: `${room.palette.accent}2E`, color: room.palette.accent }}
          >
            New
          </span>
        )}
      </div>
      <span className="text-[13px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
        {game.trains}
      </span>
      {game.flagship && (
        <span className="text-[11.5px] font-extrabold uppercase tracking-wider" style={{ color: room.palette.accent }}>
          Start here
        </span>
      )}
    </motion.button>
  );
}
