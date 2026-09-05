import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { todayKey, levelFor } from '../../../kids/data';
import { Onboarding } from '../../../kids/Onboarding';
import { RewardsScreen, Friends, Reflection } from '../../../kids/screens';
import { CHROME, Cta, FONT, QuietProvider, BackButton, GrownUpExit } from '../ui/chrome';
import { BoyAndChirpy, RoomScene } from '../ui/scene';
import { chirpySprite } from '../ui/sprites';
import { SCENE_MOODS, roomPoster, storageFallback } from '../rooms';
import { CheckIn } from '../CheckIn';
import { GrownUp } from '../GrownUp';
import { loadProgress, recordCheckIn, recordFeeling, type CheckInEntry, type Progress } from '../progress';
import { VIRTUE_ROOMS, PAUSE_ROOM, artRoomFor, type VirtueRoom } from './rooms';
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
                onGrownUp={() => setView({ at: 'grownup' })}
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

  const night = SCENE_MOODS.night;

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

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-32 pt-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <BackButton onClick={onExitGym} label="Leave the gym" />
          <GrownUpExit onClick={onGrownUp} />
        </div>

        {/* The pair from the character sheet, exactly as the Kids Gym hub had
            them — facing the scene, not the child. */}
        <div className="flex flex-col items-center gap-2 pt-3 text-center sm:pt-5">
          <BoyAndChirpy size={168} pose="excited" gaze="scene" />
          <h1
            className="text-[30px] font-extrabold leading-tight sm:text-[38px]"
            style={{ color: CHROME.text, letterSpacing: '-0.02em' }}
          >
            {name ? `Hello, ${name}` : 'Mind Gym'}
          </h1>
          <p className="max-w-sm text-[14.5px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
            {level.name} · {points} points{streak > 0 ? ` · ${streak}-day streak` : ''}
          </p>
          <p className="max-w-sm text-[13.5px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
            {doneCount === 0
              ? 'Seven rooms. Go in and say how today actually went.'
              : doneCount === VIRTUE_ROOMS.length
                ? 'All seven, today. That’s the full rainbow.'
                : `${doneCount} of ${VIRTUE_ROOMS.length} rooms so far today.`}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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

          {/* Pause sits with them but is visibly not one of them — no tick,
              no points, no counter. Somewhere that asks nothing. */}
          <PauseCard onClick={onPause} />
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
function RoomCard({
  room, index, doneToday, earned, onClick,
}: {
  room: VirtueRoom; index: number; doneToday: boolean; earned: number; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const art = artRoomFor(room);
  const accent = art.palette.accent;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onClick={onClick}
      aria-label={`${room.name}${doneToday ? ', ticked today' : ''}`}
      className="group relative overflow-hidden rounded-[22px] text-left shadow-2xl transition-all duration-300"
      style={{
        background: art.palette.scrim,
        border: doneToday
          ? `1.5px solid ${accent}`
          : hover ? '1px solid rgba(255,255,255,0.42)' : '1px solid rgba(255,255,255,0.16)',
        boxShadow: doneToday
          ? `0 0 26px -6px ${accent}, 0 8px 24px rgba(0,0,0,0.35)`
          : hover ? `0 18px 40px ${art.palette.scrim}AA` : '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={roomPoster(art.id)}
          alt=""
          loading="lazy"
          draggable={false}
          className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) { img.style.visibility = 'hidden'; return; }
            img.dataset.fallback = 'true';
            img.src = storageFallback(`kids-rooms/full/${art.id}_full.webp`);
          }}
        />

        {doneToday && (
          <span
            className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full"
            style={{ background: accent, boxShadow: `0 0 16px -2px ${accent}` }}
          >
            <Check size={15} strokeWidth={3.5} color="#0E1A1C" />
          </span>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 pt-14"
          style={{
            background: `linear-gradient(0deg, ${art.palette.scrim}FA 0%, ${art.palette.scrim}CC 52%, ${art.palette.scrim}00 100%)`,
          }}
        >
          <p className="text-[14.5px] font-extrabold leading-tight sm:text-[16px]" style={{ color: CHROME.text }}>
            {room.name}
          </p>
          <p className="mt-1 text-[11px] font-extrabold" style={{ color: accent }}>
            {earned > 0 ? `${earned} pts` : 'not yet'}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function PauseCard({ onClick }: { onClick: () => void }) {
  const art = artRoomFor(PAUSE_ROOM);
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-[22px] text-left shadow-2xl"
      style={{ background: art.palette.scrim, border: '1px dashed rgba(255,255,255,0.34)' }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={roomPoster(art.id)}
          alt=""
          loading="lazy"
          draggable={false}
          className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) { img.style.visibility = 'hidden'; return; }
            img.dataset.fallback = 'true';
            img.src = storageFallback(`kids-rooms/full/${art.id}_full.webp`);
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 pt-14"
          style={{
            background: `linear-gradient(0deg, ${art.palette.scrim}FA 0%, ${art.palette.scrim}CC 52%, ${art.palette.scrim}00 100%)`,
          }}
        >
          <p className="text-[14.5px] font-extrabold leading-tight sm:text-[16px]" style={{ color: CHROME.text }}>
            {PAUSE_ROOM.name}
          </p>
          <p className="mt-1 text-[11px] font-semibold" style={{ color: CHROME.textSoft }}>
            Any time. Nothing to do.
          </p>
        </div>
      </div>
    </motion.button>
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
          <motion.img
            src={chirpySprite('idle')}
            alt=""
            className="h-28 w-auto"
            draggable={false}
            style={{ filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.55))' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          />
          <p className="text-[22px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
            Nothing to catch in here.
          </p>
          <p className="text-[15px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
            Breathe in while Chirpy floats up. Out while he comes down. That’s all this room does.
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
