import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BEHAVIOURS, COMPANIONS, BADGES, REWARDS, LEVELS, levelFor, missionsForDay,
  SAMPLE_FRIENDS, PROUD_OPTIONS, FEELING_OPTIONS, todayKey,
} from './data';
import { CompanionOrb } from './Companion';
import { useKidStore } from './store';

// ─── Home / Dashboard ─────────────────────────────────────────────────────────
export function KidDashboard({ onStart, onOpenReflection }: { onStart: () => void; onOpenReflection: () => void }) {
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
      {/* Greeting + companion */}
      <div className="flex items-center gap-3">
        <CompanionOrb c={companion} size={64} accessory={s.rewards.includes('crown') ? '👑' : s.rewards.includes('hat') ? '🎩' : undefined} />
        <div className="flex-1">
          <p className="text-[18px] font-extrabold text-[var(--kid-ink)]">Good {partOfDay}, {s.name}! ☀️</p>
          <p className="text-[13px] text-[var(--kid-ink-soft)]">Level {level.n} · {level.name}</p>
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
                onClick={() => !done && s.completeMission(m.text, m.points)}
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

      <motion.button whileTap={{ scale: 0.96 }} onClick={onStart}
        className="w-full rounded-full py-4 text-[17px] font-extrabold text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,var(--kid-accent),var(--kid-accent2))' }}>
        Start Today's Adventure! 🚀
      </motion.button>

      <button onClick={onOpenReflection} className="w-full text-[13px] font-bold text-[var(--kid-ink-soft)] py-2">
        🌙 End-of-day reflection →
      </button>
    </div>
  );
}

// ─── Daily tracker ────────────────────────────────────────────────────────────
export function DailyTracker() {
  const s = useKidStore();
  const key = todayKey();
  const today = s.completions[key] ?? {};
  const [burst, setBurst] = useState<{ id: string; pts: number } | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)]">Today's good choices 🌈</h2>
      <p className="text-[13px] text-[var(--kid-ink-soft)] -mt-1">Every day is a new chance. Tap what you did!</p>
      {BEHAVIOURS.map((b) => {
        const done = !!today[b.id];
        return (
          <div key={b.id} className="rounded-3xl p-4 shadow-sm relative overflow-hidden" style={{ background: '#fff', borderLeft: `6px solid ${b.color}` }}>
            <div className="flex items-start gap-3">
              <span className="text-[30px]">{b.icon}</span>
              <div className="flex-1">
                <p className="text-[15px] font-extrabold text-[var(--kid-ink)]">{b.title}</p>
                <p className="text-[12.5px] text-[var(--kid-ink-soft)] mt-0.5">{b.prompt}</p>
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => { if (!done) { setBurst({ id: b.id, pts: b.points }); setTimeout(() => setBurst(null), 900); } s.toggleBehaviour(b.id); }}
                    className="rounded-full px-4 py-2 text-[13px] font-extrabold transition-all"
                    style={{ background: done ? b.color : b.color + '22', color: done ? '#fff' : b.color }}
                  >
                    {done ? `Yes! +${b.points} ⭐` : `Yes! +${b.points} ⭐`}
                  </button>
                  {!done && (
                    <span className="rounded-full px-4 py-2 text-[12px] font-semibold text-[var(--kid-ink-soft)]" style={{ background: 'var(--kid-line)' }}>
                      I'm still working on it 💛
                    </span>
                  )}
                </div>
              </div>
            </div>
            <AnimatePresence>
              {burst?.id === b.id && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.6 }} animate={{ opacity: 1, y: -30, scale: 1.2 }} exit={{ opacity: 0 }}
                  className="absolute right-6 top-4 text-[22px] font-extrabold pointer-events-none" style={{ color: b.color }}
                >
                  +{burst.pts} ⭐
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mind World ───────────────────────────────────────────────────────────────
export function MindWorld() {
  const s = useKidStore();
  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-[var(--kid-ink)] mb-1">Your Mind World 🗺️</h2>
      <p className="text-[13px] text-[var(--kid-ink-soft)] mb-4">Every good choice makes an area glow brighter!</p>
      <div className="grid grid-cols-2 gap-3">
        {BEHAVIOURS.map((b) => {
          const pts = s.pointsByBehaviour[b.id] ?? 0;
          const glow = Math.min(1, pts / 100); // fully lit at 100 pts
          return (
            <div key={b.id} className="rounded-3xl p-4 text-center relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${b.color}${Math.round(20 + glow * 60).toString(16)}, #fff)` }}>
              <div className="text-[34px] mb-1" style={{ filter: `saturate(${0.4 + glow})`, opacity: 0.5 + glow * 0.5 }}>{b.icon}</div>
              <p className="text-[12.5px] font-extrabold text-[var(--kid-ink)] leading-tight">{b.area}</p>
              <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--kid-line)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round(glow * 100)}%`, background: b.color }} />
              </div>
              <p className="text-[10px] text-[var(--kid-ink-soft)] mt-1">{pts} points</p>
            </div>
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
