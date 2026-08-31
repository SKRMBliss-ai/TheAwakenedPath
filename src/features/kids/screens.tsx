import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BEHAVIOURS, COMPANIONS, BADGES, REWARDS, LEVELS, levelFor, missionsForDay,
  SAMPLE_FRIENDS, PROUD_OPTIONS, FEELING_OPTIONS, todayKey,
} from './data';
import { CompanionOrb } from './Companion';
import { EMOTION_LIST } from './emotions';
import { useKidStore } from './store';
import { sfx } from '../../lib/sfx';

// ─── Home / Dashboard ─────────────────────────────────────────────────────────
export function KidDashboard({ onStart, adventuresDone, adventuresTotal, onOpenTracker, onOpenReflection }: { onStart: () => void; adventuresDone: number; adventuresTotal: number; onOpenTracker: () => void; onOpenReflection: () => void }) {
  const s = useKidStore();
  const key = todayKey();
  const today = s.completions[key] ?? {};
  const todayPoints = BEHAVIOURS.reduce((a, b) => a + (today[b.id] ? b.points : 0), 0)
    + (s.missionsDone[key]?.reduce((a) => a + 0, 0) ?? 0);
  const { level, next, toNext, progress } = levelFor(s.points);
  const missions = missionsForDay(key);
  const missionsDone = s.missionsDone[key] ?? [];
  const nextReward = REWARDS.find((r) => !s.rewards.includes(r.id));
  const companion = COMPANIONS.find((c) => c.id === s.avatarId) ?? COMPANIONS[0];
  const hour = new Date().getHours();
  const partOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-4">
      {/* Headquarters hero — the crew floating above the control room */}
      <div className="rounded-3xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#fff, #F3ECFF)' }}>
        <div className="flex justify-center gap-1 mb-1">
          {EMOTION_LIST.slice(0, 6).map((e, i) => (
            <motion.div key={e.id} animate={{ y: [0, -5, 0] }} transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}>
              <CompanionOrb c={e} size={34} bounce={false} />
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <CompanionOrb c={companion} size={56} accessory={s.rewards.includes('crown') ? '👑' : s.rewards.includes('hat') ? '🎩' : undefined} />
          <div className="flex-1">
            <p className="text-[17px] font-extrabold text-[var(--kid-ink)]">Good {partOfDay}, {s.name}! ☀️</p>
            <p className="text-[12px] text-[var(--kid-ink-soft)]">Level {level.n} · {level.name}</p>
            <p className="text-[11px] italic mt-0.5" style={{ color: 'var(--kid-accent)' }}>"We've got awesome choices waiting for you!" — Sunny</p>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard big={`${todayPoints}`} label="points today" emoji="⭐" tint="#FFB703" />
        <StatCard big={`${s.streak}`} label={`day streak`} emoji="🔥" tint="#FF6B6B" />
      </div>

      {/* Level progress */}
      <Card>
        <div className="flex justify-between text-[12px] font-bold text-[var(--kid-ink-soft)] mb-1">
          <span>Level {level.n}</span>
          <span>{next ? `${toNext} pts to Level ${next.n}` : 'Top level! 🏆'}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--kid-line)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,var(--kid-accent),var(--kid-accent2))' }}
            initial={{ width: 0 }} animate={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </Card>

      {/* Today's missions */}
      <div>
        <h3 className="text-[14px] font-extrabold text-[var(--kid-ink)] mb-2">🌟 Today's Missions</h3>
        <div className="space-y-2">
          {missions.map((m) => {
            const done = missionsDone.includes(m.text);
            return (
              <button
                key={m.text}
                onClick={() => { if (!done) { s.completeMission(m.text, m.points); sfx.success(); } }}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left shadow-sm transition-all"
                style={{ background: done ? '#E8F8EE' : '#fff', opacity: done ? 0.85 : 1 }}
              >
                <span className="text-[22px]">{done ? '✅' : '🎯'}</span>
                <span className="flex-1 text-[13.5px] font-semibold text-[var(--kid-ink)]">{m.text}</span>
                <span className="text-[12px] font-extrabold" style={{ color: '#FFB703' }}>+{m.points}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next reward */}
      {nextReward && (
        <Card>
          <div className="flex items-center gap-3">
            <span className="text-[30px]">{nextReward.icon}</span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[var(--kid-ink)]">Next reward: {nextReward.name}</p>
              <p className="text-[12px] text-[var(--kid-ink-soft)]">{Math.max(0, nextReward.at - s.points)} more points to unlock! 🎁</p>
            </div>
          </div>
        </Card>
      )}

      {(() => {
        const allDone = adventuresDone >= adventuresTotal;
        return (
          <div>
            {/* Adventure progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {Array.from({ length: adventuresTotal }).map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full transition-colors"
                  style={{ background: i < adventuresDone ? 'var(--kid-accent)' : 'var(--kid-line)' }} />
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={onStart}
              className="w-full rounded-full py-4 text-[16px] font-extrabold text-white shadow-lg"
              style={{ background: allDone ? 'linear-gradient(135deg,#43BC5F,#2A9D8F)' : 'linear-gradient(135deg,var(--kid-accent),var(--kid-accent2))' }}>
              {adventuresDone === 0 ? "Start Today's Adventure! 🚀"
                : allDone ? 'All adventures done! 🎉 Replay a favourite'
                : `Next Adventure → ${adventuresDone}/${adventuresTotal} done ✨`}
            </motion.button>
            {allDone && (
              <p className="text-[12px] text-center mt-1.5" style={{ color: 'var(--kid-accent)' }}>
                Amazing — you explored every choice today! Come back tomorrow for fresh ones. 🌈
              </p>
            )}
          </div>
        );
      })()}

      <button onClick={onOpenTracker} className="w-full text-[13px] font-bold text-[var(--kid-ink-soft)] py-1.5">
        ✅ Log today's good choices →
      </button>
      <button onClick={onOpenReflection} className="w-full text-[13px] font-bold text-[var(--kid-ink-soft)] py-1.5">
        🌙 End-of-day reflection →
      </button>
    </div>
  );
}

// ─── Daily tracker — a grid of flippable cards ────────────────────────────────
export function DailyTracker() {
  const s = useKidStore();
  const key = todayKey();
  const today = s.completions[key] ?? {};
  const doneCount = BEHAVIOURS.filter((b) => today[b.id]).length;

  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)]">Today's good choices 🌈</h2>
      <p className="text-[13px] text-[var(--kid-ink-soft)] mb-3">Tap a card to flip it. {doneCount}/7 done — every day is a new chance!</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BEHAVIOURS.map((b) => (
          <FlipBehaviourCard key={b.id} b={b} done={!!today[b.id]} onYes={() => s.toggleBehaviour(b.id)} />
        ))}
      </div>
    </div>
  );
}

function FlipBehaviourCard({ b, done, onYes }: { b: typeof BEHAVIOURS[number]; done: boolean; onYes: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const [burst, setBurst] = useState(false);

  const yes = () => {
    if (!done) { setBurst(true); sfx.success(); setTimeout(() => setBurst(false), 1000); }
    else sfx.tap();
    onYes();
  };

  return (
    <div className="relative" style={{ perspective: 900, height: 168 }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* FRONT */}
        <button
          onClick={() => { setFlipped(true); sfx.flip(); }}
          className="absolute inset-0 rounded-3xl p-3 flex flex-col items-center justify-center text-center shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            background: done ? `linear-gradient(160deg, ${b.color}, ${b.color}cc)` : '#fff',
            border: `3px solid ${b.color}${done ? 'ff' : '33'}`,
          }}
        >
          <motion.div animate={done ? { scale: [1, 1.2, 1] } : {}} className="text-[42px]">{done ? '✅' : b.icon}</motion.div>
          <p className="text-[13px] font-extrabold mt-1 leading-tight" style={{ color: done ? '#fff' : 'var(--kid-ink)' }}>{b.title}</p>
          <p className="text-[10px] mt-1" style={{ color: done ? '#fff' : 'var(--kid-ink-soft)' }}>{done ? `+${b.points} earned! ⭐` : 'tap to flip →'}</p>
        </button>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-3xl p-3 flex flex-col shadow-md"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: b.color + '18', border: `3px solid ${b.color}` }}
        >
          <p className="text-[11.5px] text-[var(--kid-ink)] leading-snug flex-1">{b.prompt}</p>
          <button onClick={yes} className="rounded-full py-2 text-[12px] font-extrabold text-white mt-1" style={{ background: b.color }}>
            {done ? '✓ Done!' : `Yes! +${b.points} ⭐`}
          </button>
          <button onClick={() => { setFlipped(false); sfx.tap(); }} className="text-[10px] font-bold mt-1" style={{ color: b.color }}>
            {done ? 'flip back' : "still working on it 💛"}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {burst && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.6 }} animate={{ opacity: 1, y: -40, scale: 1.3 }} exit={{ opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 top-4 text-[24px] font-extrabold pointer-events-none z-10" style={{ color: b.color }}
          >
            +{b.points} ⭐
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mind World ───────────────────────────────────────────────────────────────
export function MindWorld({ onPlay }: { onPlay: (behaviourId: string) => void }) {
  const s = useKidStore();
  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)] mb-1">Your Mind World 🗺️</h2>
      <p className="text-[13px] text-[var(--kid-ink-soft)] mb-4">Tap a world to play a choice — every good choice makes it glow brighter!</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BEHAVIOURS.map((b) => {
          const pts = s.pointsByBehaviour[b.id] ?? 0;
          const glow = Math.min(1, pts / 100); // fully lit at 100 pts
          return (
            <button key={b.id} onClick={() => onPlay(b.id)} className="rounded-3xl p-4 text-center relative overflow-hidden active:scale-95 transition-transform" style={{ background: `linear-gradient(160deg, ${b.color}${Math.round(20 + glow * 60).toString(16)}, #fff)` }}>
              <div className="text-[34px] mb-1" style={{ filter: `saturate(${0.4 + glow})`, opacity: 0.5 + glow * 0.5 }}>{b.icon}</div>
              <p className="text-[12.5px] font-extrabold text-[var(--kid-ink)] leading-tight">{b.area}</p>
              <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--kid-line)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round(glow * 100)}%`, background: b.color }} />
              </div>
              <p className="text-[10px] text-[var(--kid-ink-soft)] mt-1">{pts} points</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Rewards + badges + levels ────────────────────────────────────────────────
export function RewardsScreen() {
  const s = useKidStore();
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)] mb-2">🏆 Levels</h2>
        <div className="space-y-1.5">
          {LEVELS.map((l) => {
            const reached = s.points >= l.at;
            return (
              <div key={l.n} className="flex items-center gap-3 rounded-2xl p-2.5" style={{ background: reached ? '#fff' : 'transparent', opacity: reached ? 1 : 0.5 }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-extrabold text-white" style={{ background: reached ? 'var(--kid-accent)' : 'var(--kid-ink-soft)' }}>{l.n}</span>
                <span className="flex-1 text-[13.5px] font-bold text-[var(--kid-ink)]">{l.name}</span>
                <span className="text-[11px] text-[var(--kid-ink-soft)]">{reached ? '✓' : `${l.at} pts`}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)] mb-2">🎖️ Badges</h2>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map((bd) => {
            const got = s.badges.includes(bd.id);
            return (
              <div key={bd.id} className="rounded-2xl p-2 text-center" style={{ background: got ? '#fff' : 'var(--kid-line)', opacity: got ? 1 : 0.55 }} title={bd.how}>
                <div className="text-[26px]" style={{ filter: got ? 'none' : 'grayscale(1)' }}>{bd.icon}</div>
                <div className="text-[9px] font-bold text-[var(--kid-ink)] leading-tight mt-0.5">{bd.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)] mb-2">🎁 Rewards</h2>
        <div className="grid grid-cols-3 gap-2">
          {REWARDS.map((r) => {
            const got = s.rewards.includes(r.id);
            return (
              <div key={r.id} className="rounded-2xl p-3 text-center" style={{ background: got ? '#fff' : 'var(--kid-line)', opacity: got ? 1 : 0.6 }}>
                <div className="text-[30px]" style={{ filter: got ? 'none' : 'grayscale(1)' }}>{r.icon}</div>
                <div className="text-[10.5px] font-bold text-[var(--kid-ink)] leading-tight mt-1">{r.name}</div>
                <div className="text-[9px] text-[var(--kid-ink-soft)] mt-0.5">{got ? 'Unlocked! ✨' : `${r.at} pts`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Friends & challenges (sample) ────────────────────────────────────────────
export function Friends() {
  const s = useKidStore();
  const me = { name: s.name || 'You', points: s.points, emoji: '⭐', you: true };
  const board = [...SAMPLE_FRIENDS.map((f) => ({ ...f, you: false })), me].sort((a, b) => b.points - a.points);
  const team = board.reduce((a, f) => a + f.points, 0);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-4">
      <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)]">7-Day Kindness Challenge 🌈</h2>
      <Card>
        <p className="text-[13px] font-bold text-[var(--kid-ink)] text-center">Together we earned</p>
        <p className="text-[30px] font-extrabold text-center" style={{ color: 'var(--kid-accent)' }}>{team} points! 🎉</p>
        <p className="text-[11px] text-[var(--kid-ink-soft)] text-center">Everyone wins when we lift each other up.</p>
      </Card>
      <div className="space-y-1.5">
        {board.map((f, i) => (
          <div key={f.name} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: f.you ? 'var(--kid-accent)' + '18' : '#fff', border: f.you ? '2px solid var(--kid-accent)' : 'none' }}>
            <span className="text-[18px] w-6 text-center">{medals[i] ?? '⭐'}</span>
            <span className="text-[20px]">{f.emoji}</span>
            <span className="flex-1 text-[14px] font-bold text-[var(--kid-ink)]">{f.name}{f.you ? ' (you)' : ''}</span>
            <span className="text-[13px] font-extrabold" style={{ color: 'var(--kid-accent)' }}>{f.points}</span>
          </div>
        ))}
      </div>
      <Card>
        <p className="text-[12px] text-[var(--kid-ink-soft)] text-center">
          👨‍👩‍👧 Friends join with a safe invite code approved by a parent or teacher.
          Real invites arrive in the next update — for now, meet your practice pals!
        </p>
      </Card>
    </div>
  );
}

// ─── End-of-day reflection ────────────────────────────────────────────────────
export function Reflection({ onClose }: { onClose: () => void }) {
  const s = useKidStore();
  const key = todayKey();
  const today = s.completions[key] ?? {};
  const done = BEHAVIOURS.filter((b) => today[b.id]);
  const points = done.reduce((a, b) => a + b.points, 0);
  const refl = s.reflections[key] ?? {};

  return (
    <div className="space-y-4 text-center">
      <div className="text-[52px]">🎉</div>
      <h2 className="text-[20px] font-extrabold text-[var(--kid-ink)]">Look what you did today!</h2>
      <div className="grid grid-cols-3 gap-2">
        <StatCard big={`${points}`} label="points" emoji="⭐" tint="#FFB703" />
        <StatCard big={`${done.length}`} label="good choices" emoji="✅" tint="#43BC5F" />
        <StatCard big={`${s.streak}`} label="day streak" emoji="🔥" tint="#FF6B6B" />
      </div>

      <div className="text-left">
        <p className="text-[14px] font-extrabold text-[var(--kid-ink)] mb-2">What are you proud of? 🌟</p>
        <div className="flex flex-wrap gap-2">
          {PROUD_OPTIONS.map((p) => (
            <button key={p} onClick={() => s.setReflection({ proud: p })}
              className="rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-all"
              style={{ background: refl.proud === p ? 'var(--kid-accent)' : '#fff', color: refl.proud === p ? '#fff' : 'var(--kid-ink)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="text-left">
        <p className="text-[14px] font-extrabold text-[var(--kid-ink)] mb-2">How do you feel?</p>
        <div className="flex gap-2">
          {FEELING_OPTIONS.map((f) => (
            <button key={f.label} onClick={() => s.setReflection({ feeling: f.label })}
              className="flex-1 rounded-2xl py-3 transition-all"
              style={{ background: refl.feeling === f.label ? 'var(--kid-accent)' + '22' : '#fff', border: refl.feeling === f.label ? '2px solid var(--kid-accent)' : '2px solid transparent' }}>
              <div className="text-[26px]">{f.emoji}</div>
              <div className="text-[11px] font-bold text-[var(--kid-ink)]">{f.label}</div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-[14px] font-bold text-[var(--kid-ink-soft)] pt-2">Tomorrow is another chance to grow. 🌱</p>
      <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
        className="w-full rounded-full py-3.5 text-[15px] font-extrabold text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,var(--kid-accent),var(--kid-accent2))' }}>
        Good night! 🌙
      </motion.button>
    </div>
  );
}

// ─── shared bits ──────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl p-4 shadow-sm" style={{ background: '#fff' }}>{children}</div>;
}
function StatCard({ big, label, emoji, tint }: { big: string; label: string; emoji: string; tint: string }) {
  return (
    <div className="rounded-3xl p-3 text-center shadow-sm" style={{ background: '#fff' }}>
      <div className="text-[22px]">{emoji}</div>
      <div className="text-[22px] font-extrabold" style={{ color: tint }}>{big}</div>
      <div className="text-[11px] font-bold text-[var(--kid-ink-soft)] leading-tight">{label}</div>
    </div>
  );
}
