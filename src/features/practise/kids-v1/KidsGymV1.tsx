import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted } from '../../../lib/sfx';
import { ROOMS, SCENE_MOODS, getRoom, roomPoster, storageFallback, type RoomConfig, type RoomId } from './rooms';
import { GAME_COUNT, ROOM_COUNTS } from './games/library';
import type { Game } from './games/types';
import { CHROME, FONT, BackButton, GrownUpExit, QuietProvider } from './ui/chrome';
import { useMotion, useQuiet } from './ui/quiet';
import { BoyAndChirpy, Chirpy } from './ui/scene';
import { CheckIn } from './CheckIn';
import { RoomView } from './RoomView';
import { GameShell } from './GameShell';
import { GrownUp } from './GrownUp';
import { loadProgress, recordFeeling, recordPlayed, type Progress } from './progress';
import * as sound from './kit/sound';

/**
 * MIND GYM FOR KIDS · v1
 *
 * The same twelve worlds as the live /mindgymforkids page, with 67 games
 * behind them and the check-in as the front door.
 *
 * WHAT'S DIFFERENT FROM v0, in one place so it's reviewable:
 *
 *   · The check-in is the front door and the ROUTER (master plan §4). The
 *     rooms grid is the SECOND screen, not the first — a child arrives by
 *     saying how they are, and lands in the grid when nothing much is going
 *     on. v0 opened straight onto the grid with the check-in as a card.
 *   · A room is a shelf of games, not one fixed exercise. 67 games on six
 *     engines (games/library.ts).
 *   · The quiet state is real and wired end to end (chrome.tsx). It is a
 *     Stage-0 requirement, not a later addition.
 *   · The grown-up exit is on every screen, at the same position, always.
 *
 * WHAT'S THE SAME, on purpose: the ten original rooms, their ids, their
 * painted art, and their palettes. A child who knows the old hub should
 * recognise this one.
 *
 * This component owns the whole state machine because there are only five
 * places to be, and a router for five places costs more than it saves.
 */

type View =
  | { at: 'hub' }
  | { at: 'checkin' }
  | { at: 'room'; room: RoomId }
  | { at: 'game'; room: RoomId; game: Game }
  | { at: 'grownup' };

export function KidsGymV1({ onExitGym }: { onExitGym: () => void }) {
  const [view, setView] = useState<View>({ at: 'hub' });
  /** Where "back" from the grown-up screen returns to. */
  const [before, setBefore] = useState<View>({ at: 'hub' });
  const [quiet, setQuiet] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [muted, setMutedState] = useState(isMuted());

  useEffect(() => () => sound.stopAll(), []);

  const toGrownUp = useCallback(() => {
    setBefore(view);
    setView({ at: 'grownup' });
  }, [view]);

  const finishGame = (roomId: RoomId, gameId: string) => {
    setProgress((p) => recordPlayed(p, roomId, gameId));
    setView({ at: 'room', room: roomId });
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) sound.play('tap');
  };

  return (
    <QuietProvider quiet={quiet}>
      {view.at === 'grownup' && <GrownUp onBack={() => setView(before)} />}

      {view.at === 'checkin' && (
        <CheckIn
          progress={progress}
          onFeelingPicked={(feelingId) => setProgress((p) => recordFeeling(p, feelingId))}
          onGrownUp={toGrownUp}
          onQuiet={setQuiet}
          onFinish={(goTo) => {
            const room = goTo ? ROOMS.find((r) => r.id === goTo) : undefined;
            setView(room ? { at: 'room', room: room.id } : { at: 'hub' });
          }}
        />
      )}

      {view.at === 'room' && (
        <RoomView
          room={getRoom(view.room)}
          played={progress.played}
          recent={progress.recent[view.room] ?? []}
          onExit={() => setView({ at: 'hub' })}
          onGrownUp={toGrownUp}
          onPlay={(game) => setView({ at: 'game', room: view.room, game })}
        />
      )}

      {view.at === 'game' && (
        <GameShell
          game={view.game}
          room={getRoom(view.room)}
          onExit={() => setView({ at: 'room', room: view.room })}
          onGrownUp={toGrownUp}
          onFinished={(gameId) => finishGame(view.room, gameId)}
        />
      )}

      {view.at === 'hub' && (
        <Hub
          progress={progress}
          muted={muted}
          onToggleSound={toggleSound}
          onExitGym={onExitGym}
          onCheckIn={() => { sound.play('tap'); setView({ at: 'checkin' }); }}
          onOpenRoom={(id) => { sound.play('roomCard'); setView({ at: 'room', room: id }); }}
          onGrownUp={toGrownUp}
          onCalm={() => setQuiet((q) => !q)}
          quietOn={quiet}
        />
      )}
    </QuietProvider>
  );
}

/* ── The hub ────────────────────────────────────────────────────────────
 * A night sky of poster cards. Kept close to the live page's grid, which is
 * good and matches the reference art (UI §8.1) — the changes are the quiet
 * "trains" line on each card, the game count, and the fact that the check-in
 * is now the way in rather than one card among many. */

function Hub({
  progress,
  muted,
  onToggleSound,
  onExitGym,
  onCheckIn,
  onOpenRoom,
  onGrownUp,
  onCalm,
  quietOn,
}: {
  progress: Progress;
  muted: boolean;
  onToggleSound: () => void;
  onExitGym: () => void;
  onCheckIn: () => void;
  onOpenRoom: (id: RoomId) => void;
  onGrownUp: () => void;
  onCalm: () => void;
  quietOn: boolean;
}) {
  const m = useMotion();
  const quiet = useQuiet();
  const night = SCENE_MOODS.night;
  const done = progress.played.length;

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

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={onExitGym} label="Leave the gym" />
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="flex h-11 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-bold transition"
              style={{ background: CHROME.adultExit, color: CHROME.text, border: `1px solid ${CHROME.backBorder}` }}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {muted ? 'Sounds off' : 'Sounds on'}
            </button>
            <GrownUpExit onClick={onGrownUp} />
          </div>
        </div>

        {/* The pair from the character sheet. Facing the scene, not the child
            — the hub is a place they're standing in together (§2.2). */}
        <div className="flex flex-col items-center gap-2 pt-3 text-center sm:pt-5">
          {!quiet && <BoyAndChirpy size={168} pose="excited" gaze="scene" />}
          <h1
            className="text-[30px] font-extrabold leading-tight sm:text-[38px]"
            style={{ color: CHROME.text, letterSpacing: '-0.02em', fontFamily: FONT }}
          >
            Mind Gym
          </h1>
          <p className="max-w-sm text-[14.5px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
            {ROOMS.length} rooms, {GAME_COUNT} games. Nothing in here is a test.
          </p>
          {done > 0 && (
            <p className="text-[12.5px] font-extrabold" style={{ color: '#FFD98A' }}>
              You’ve played {done} of them
            </p>
          )}
        </div>

        {/* The front door. The check-in routes; the rooms are where a child
            lands when nothing much is going on (master plan §4). */}
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={onCheckIn}
          className="mt-6 flex w-full items-center justify-between gap-4 rounded-[24px] px-5 py-5 text-left shadow-xl transition"
          style={{
            minHeight: m.target + 24,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.24)',
          }}
        >
          <div className="min-w-0">
            <p className="text-[18px] font-extrabold leading-tight" style={{ color: CHROME.text }}>
              How are you doing right now?
            </p>
            <p className="mt-1 text-[13.5px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
              Start here. It only takes a minute, and you can stop whenever you like.
            </p>
          </div>
          {!quiet && <Chirpy pose="hopeful" size={64} />}
        </motion.button>

        <div className="mt-7 flex items-center justify-between gap-3">
          <h2 className="text-[15.5px] font-extrabold" style={{ color: CHROME.text, fontFamily: FONT }}>
            Or pick a room
          </h2>
          {/* A manual way into the quiet state, for a child who knows they
              want it — and for a grown-up testing it. The automatic trigger
              is still the intensity screen, and still unannounced. */}
          <button
            onClick={onCalm}
            className="rounded-full px-3.5 py-2 text-[12px] font-extrabold transition"
            style={{
              color: CHROME.text,
              background: quietOn ? CHROME.pillSelected : CHROME.pill,
              border: quietOn ? `1.5px solid ${CHROME.pillSelectedBorder}` : `1px solid ${CHROME.pillBorder}`,
            }}
          >
            {quietOn ? 'Calm mode on' : 'Calm mode'}
          </button>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {ROOMS.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} onClick={() => onOpenRoom(room.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, index, onClick }: { room: RoomConfig; index: number; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const m = useMotion();
  const mood = SCENE_MOODS[room.scene];
  const count = ROOM_COUNTS[room.id];

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: m.quiet ? 0 : Math.min(index * 0.04, 0.5), duration: 0.4 }}
      whileHover={m.quiet ? undefined : { y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={onClick}
      aria-label={`${room.name} — ${room.trains}, ${count} games`}
      className="group relative overflow-hidden rounded-[22px] text-left shadow-2xl transition-all duration-300"
      style={{
        background: room.palette.scrim,
        border: hover ? '1px solid rgba(255,255,255,0.42)' : '1px solid rgba(255,255,255,0.16)',
        boxShadow: hover ? `0 18px 40px ${room.palette.scrim}AA` : '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {room.painted ? (
          <img
            src={roomPoster(room.id)}
            alt=""
            loading="lazy"
            draggable={false}
            className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallback) { img.style.visibility = 'hidden'; return; }
              img.dataset.fallback = 'true';
              img.src = storageFallback(`kids-rooms/full/${room.id}_full.webp`);
            }}
          />
        ) : (
          // No painted art yet — the scene's own palette, with its warm light
          // in the same place it would be in the painting.
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(58% 44% at ${mood.glowAt[0]} ${mood.glowAt[1]}, ${mood.glow} 0%, transparent 70%), linear-gradient(165deg, ${mood.ground[0]} 0%, ${mood.ground[1]} 100%)`,
            }}
          />
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 pt-14"
          style={{
            background: `linear-gradient(0deg, ${room.palette.scrim}FA 0%, ${room.palette.scrim}CC 52%, ${room.palette.scrim}00 100%)`,
          }}
        >
          <p className="text-[14.5px] font-extrabold leading-tight sm:text-[16px]" style={{ color: CHROME.text }}>
            {room.name}
          </p>
          {/* The quiet line — a child who knows what a room is for chooses
              better (UI §8.1). */}
          <p className="mt-0.5 text-[11.5px] font-semibold leading-tight" style={{ color: CHROME.textSoft }}>
            {room.trains}
          </p>
          <p className="mt-1 text-[11px] font-extrabold" style={{ color: room.palette.accent }}>
            {count} {count === 1 ? 'game' : 'games'}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
