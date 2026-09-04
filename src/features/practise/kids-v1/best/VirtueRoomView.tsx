import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';
import { chirpySprite } from '../ui/sprites';
import { gamesInRoom } from '../games/library';
import { roomGamesFor, type RoomGame } from './roomGames';
import { RoomGamePlayer } from './RoomGamePlayer';
import type { VirtueRoom } from './rooms';
import * as sound from '../kit/sound';

/**
 * Inside one virtue room.
 *
 * Three things live here and nothing else: today's tick, the games, and the
 * one small thing there is to learn. The tick is the point of the whole app —
 * it is My Best Every Day's daily question, moved out of a checklist and into
 * the room the question is about.
 *
 * THE TICK CAN GO BOTH WAYS, and that matters more than it looks. A child can
 * untick. There is no confirmation, no "are you sure", no sad face. Recording
 * "not today" has to be exactly as cheap as recording "yes", or the number
 * stops meaning anything and the child learns to perform for their own app.
 */
export function VirtueRoomView({
  room,
  onExit,
  onDeepDive,
}: {
  room: VirtueRoom;
  onExit: () => void;
  onDeepDive: () => void;
}) {
  const completions = useKidStore((s) => s.completions);
  const pointsByBehaviour = useKidStore((s) => s.pointsByBehaviour);
  const toggleBehaviour = useKidStore((s) => s.toggleBehaviour);
  const awardPoints = useKidStore((s) => s.awardPoints);

  const [playing, setPlaying] = useState<RoomGame | null>(null);
  const [showLearn, setShowLearn] = useState(false);

  const doneToday = !!completions[todayKey()]?.[room.id];
  const earned = pointsByBehaviour[room.id] ?? 0;
  const newGames = roomGamesFor(room.id);
  const libraryGames = room.gamesFrom ? gamesInRoom(room.gamesFrom) : [];

  const finishGame = (pts: number) => {
    awardPoints(pts, room.id);
    sound.play('resolve');
    setPlaying(null);
  };

  return (
    <div
      className="min-h-[100svh] w-full"
      style={{
        background: `radial-gradient(60% 40% at 70% 8%, ${room.glow} 0%, transparent 70%), linear-gradient(168deg, ${room.ground[0]} 0%, ${room.ground[1]} 100%)`,
      }}
    >
      <div className="mx-auto w-full max-w-xl px-5 pb-28 pt-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onExit}
            className="rounded-full px-3.5 py-2 text-[12.5px] font-bold text-white/90"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            ← All rooms
          </button>
          <span className="rounded-full px-3 py-1.5 text-[12px] font-extrabold" style={{ background: `${room.accent}2E`, color: '#fff' }}>
            {earned} pts earned here
          </span>
        </div>

        {playing ? (
          <div className="pt-6">
            <RoomGamePlayer game={playing} accent={room.accent} onDone={finishGame} />
            <button onClick={() => setPlaying(null)} className="mt-4 w-full text-[12.5px] font-bold text-white/50">
              Leave this one
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1 pt-4 text-center">
              <span className="text-[40px]">{room.emoji}</span>
              <h1 className="text-[26px] font-extrabold leading-tight text-white">{room.name}</h1>
              <p className="max-w-xs text-[14px] font-semibold leading-snug text-white/70">{room.tagline}</p>
            </div>

            {/* ── Today's tick — the actual point of the app ───────────── */}
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={() => { sound.play(doneToday ? 'tap' : 'discovery'); toggleBehaviour(room.id); }}
              className="mt-6 flex w-full items-center gap-4 rounded-[24px] px-5 py-5 text-left"
              style={{
                background: doneToday ? `${room.accent}2E` : 'rgba(255,255,255,0.09)',
                border: `1px solid ${doneToday ? room.accent : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{
                  background: doneToday ? room.accent : 'transparent',
                  border: `2px solid ${doneToday ? room.accent : 'rgba(255,255,255,0.35)'}`,
                }}
              >
                {doneToday && <Check size={22} strokeWidth={3} color="#1B1024" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-extrabold leading-snug text-white">{room.prompt}</span>
                <span className="mt-1 block text-[12.5px] font-semibold text-white/60">
                  {doneToday ? `Ticked for today · +${room.points}. Tap to change it.` : 'Tap if you did. Tap again if you change your mind.'}
                </span>
              </span>
            </motion.button>

            {/* ── The one small thing to learn ──────────────────────────── */}
            <button
              onClick={() => setShowLearn((v) => !v)}
              className="mt-3 flex w-full items-center gap-3 rounded-[20px] px-4 py-3.5 text-left"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              <img src={chirpySprite('said2')} alt="" className="h-9 w-auto" draggable={false} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold text-white">{room.learn.title}</span>
              </span>
              <span className="text-[12px] font-bold text-white/50">{showLearn ? '−' : '+'}</span>
            </button>
            <AnimatePresence>
              {showLearn && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden px-4 pt-3 text-[14px] font-semibold leading-relaxed text-white/80"
                >
                  {room.learn.body}
                </motion.p>
              )}
            </AnimatePresence>

            {/* ── This room's own games ─────────────────────────────────── */}
            {newGames.length > 0 && (
              <>
                <h2 className="mt-7 text-[13px] font-extrabold uppercase tracking-[0.16em] text-white/70">
                  Made for this room
                </h2>
                <div className="mt-3 flex flex-col gap-2.5">
                  {newGames.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { sound.play('roomCard'); setPlaying(g); }}
                      className="rounded-[20px] px-4 py-3.5 text-left"
                      style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <span className="block text-[14.5px] font-extrabold text-white">{g.title}</span>
                      <span className="mt-0.5 block text-[12.5px] font-semibold text-white/60">
                        +{g.points} · nobody loses this one
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {libraryGames.length > 0 && (
              <p className="mt-5 text-center text-[12.5px] font-semibold text-white/45">
                {libraryGames.length} more games from the big library are wired to this room
              </p>
            )}

            {/* ── The deep dive, offered once, never pushed ─────────────── */}
            <button
              onClick={onDeepDive}
              className="mt-7 w-full rounded-[22px] px-5 py-4 text-left"
              style={{ background: `${room.accent}1F`, border: `1px solid ${room.accent}66` }}
            >
              <span className="block text-[14.5px] font-extrabold text-white">
                Something happened today you’re still thinking about?
              </span>
              <span className="mt-1 block text-[12.5px] font-semibold text-white/65">
                Take it through the five steps with Chirpy. Once a day is plenty.
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
