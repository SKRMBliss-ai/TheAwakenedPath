import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { todayKey, levelFor } from '../../../kids/data';
import { Onboarding } from '../../../kids/Onboarding';
import { RewardsScreen, Friends, Reflection } from '../../../kids/screens';
import { chirpySprite } from '../ui/sprites';
import { QuietProvider } from '../ui/chrome';
import { CheckIn } from '../CheckIn';
import { GrownUp } from '../GrownUp';
import { loadProgress, recordCheckIn, recordFeeling, type CheckInEntry, type Progress } from '../progress';
import { VIRTUE_ROOMS, PAUSE_ROOM, type VirtueRoom } from './rooms';
import { VirtueRoomView } from './VirtueRoomView';
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
  | { at: 'room'; room: VirtueRoom }
  | { at: 'pause' }
  | { at: 'deep' }
  | { at: 'reflection' }
  | { at: 'friends' }
  | { at: 'rewards' }
  | { at: 'grownup' };

export default function BestApp({ onExitGym }: { onExitGym: () => void }) {
  const onboarded = useKidStore((s) => s.onboarded);
  const [view, setView] = useState<View>({ at: 'map' });
  const [quiet, setQuiet] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  if (!onboarded) return <Onboarding />;

  const back = () => setView({ at: 'map' });

  return (
    <QuietProvider quiet={quiet}>
      <div className="min-h-[100svh] w-full" style={{ background: 'linear-gradient(170deg,#1B1030 0%,#0A0616 100%)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view.at + (view.at === 'room' ? view.room.id : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {view.at === 'map' && (
              <RoomMap
                onOpen={(r) => { sound.play('roomCard'); setView({ at: 'room', room: r }); }}
                onPause={() => setView({ at: 'pause' })}
                onExitGym={onExitGym}
                onGrownUp={() => setView({ at: 'grownup' })}
              />
            )}

            {view.at === 'room' && (
              <VirtueRoomView
                room={view.room}
                onExit={back}
                onDeepDive={() => setView({ at: 'deep' })}
              />
            )}

            {view.at === 'deep' && (
              <CheckIn
                progress={progress}
                onFeelingPicked={(id) => setProgress((p) => recordFeeling(p, id))}
                onCheckInSaved={(e: Omit<CheckInEntry, 'at'>) =>
                  setProgress((p) => recordCheckIn(p, { ...e, at: Date.now() }))
                }
                onQuiet={setQuiet}
                onGrownUp={() => setView({ at: 'grownup' })}
                onFinish={back}
              />
            )}

            {view.at === 'pause' && <PauseRoom onExit={back} />}
            {view.at === 'reflection' && <Panel onClose={back}><Reflection onClose={back} /></Panel>}
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
  onOpen,
  onPause,
  onExitGym,
  onGrownUp,
}: {
  onOpen: (r: VirtueRoom) => void;
  onPause: () => void;
  onExitGym: () => void;
  onGrownUp: () => void;
}) {
  const name = useKidStore((s) => s.name);
  const points = useKidStore((s) => s.points);
  const streak = useKidStore((s) => s.streak);
  const completions = useKidStore((s) => s.completions);
  const pointsByBehaviour = useKidStore((s) => s.pointsByBehaviour);
  const today = completions[todayKey()] ?? {};
  const doneCount = VIRTUE_ROOMS.filter((r) => today[r.id]).length;
  const { level } = levelFor(points);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-28 pt-4">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onExitGym} className="rounded-full px-3.5 py-2 text-[12.5px] font-bold text-white/85"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}>
          ← Leave
        </button>
        <button onClick={onGrownUp} className="rounded-full px-3.5 py-2 text-[12.5px] font-bold text-white/85"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}>
          Talk to a grown-up
        </button>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <img src={chirpySprite('excited')} alt="" className="h-20 w-auto" draggable={false} />
        <div className="min-w-0">
          <h1 className="text-[24px] font-extrabold leading-tight text-white">
            {name ? `Hello, ${name}` : 'Mind Gym'}
          </h1>
          <p className="text-[13px] font-semibold text-white/65">
            {level.name} · {points} points{streak > 0 ? ` · ${streak}-day streak` : ''}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[14px] font-semibold text-white/70">
        {doneCount === 0
          ? 'Seven rooms. Go into any of them and say how today actually went.'
          : doneCount === VIRTUE_ROOMS.length
            ? 'All seven, today. That’s the full rainbow.'
            : `${doneCount} of ${VIRTUE_ROOMS.length} rooms visited today.`}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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

        {/* Pause sits with them but is visibly not one of them — no tick, no
            points, no counter. Somewhere to go that asks nothing. */}
        <button
          onClick={onPause}
          className="relative overflow-hidden rounded-[22px] p-4 text-left"
          style={{
            background: `linear-gradient(165deg, ${PAUSE_ROOM.ground[0]}, ${PAUSE_ROOM.ground[1]})`,
            border: '1px dashed rgba(255,255,255,0.3)',
          }}
        >
          <span className="text-[26px]">{PAUSE_ROOM.emoji}</span>
          <span className="mt-1 block text-[14.5px] font-extrabold text-white">{PAUSE_ROOM.name}</span>
          <span className="mt-0.5 block text-[11.5px] font-semibold text-white/60">Any time. Nothing to do.</span>
        </button>
      </div>
    </div>
  );
}

function RoomCard({
  room, index, doneToday, earned, onClick,
}: {
  room: VirtueRoom; index: number; doneToday: boolean; earned: number; onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-[22px] p-4 text-left"
      style={{
        background: `radial-gradient(70% 50% at 70% 10%, ${room.glow} 0%, transparent 70%), linear-gradient(165deg, ${room.ground[0]}, ${room.ground[1]})`,
        border: `1px solid ${doneToday ? room.accent : 'rgba(255,255,255,0.16)'}`,
        boxShadow: doneToday ? `0 0 22px -6px ${room.accent}` : '0 8px 22px -10px rgba(0,0,0,0.7)',
      }}
    >
      {doneToday && (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full"
          style={{ background: room.accent }}>
          <Check size={13} strokeWidth={3.5} color="#1B1024" />
        </span>
      )}
      <span className="text-[26px]">{room.emoji}</span>
      <span className="mt-1 block text-[14.5px] font-extrabold leading-tight text-white">{room.name}</span>
      {/* Points earned in this room — the thing that makes a room feel like
          somewhere you've been rather than somewhere you might go. */}
      <span className="mt-1 block text-[11.5px] font-extrabold" style={{ color: room.accent }}>
        {earned > 0 ? `${earned} pts` : 'not yet'}
      </span>
    </motion.button>
  );
}

/* ── Pause ───────────────────────────────────────────────────────────── */

function PauseRoom({ onExit }: { onExit: () => void }) {
  return (
    <div className="grid min-h-[100svh] place-items-center px-6"
      style={{ background: `radial-gradient(60% 40% at 50% 30%, ${PAUSE_ROOM.glow} 0%, transparent 70%), linear-gradient(168deg, ${PAUSE_ROOM.ground[0]}, ${PAUSE_ROOM.ground[1]})` }}>
      <div className="flex max-w-sm flex-col items-center gap-5 text-center">
        <motion.img
          src={chirpySprite('idle')}
          alt=""
          className="h-28 w-auto"
          draggable={false}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        />
        <p className="text-[20px] font-extrabold leading-snug text-white">Nothing to catch in here.</p>
        <p className="text-[15px] font-semibold leading-relaxed text-white/70">
          Breathe in while Chirpy floats up. Out while he comes down. That’s all this room does.
        </p>
        <button onClick={onExit} className="rounded-full px-6 py-3 text-[14px] font-extrabold"
          style={{ background: PAUSE_ROOM.accent, color: '#06140F' }}>
          I’m ready
        </button>
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
