import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPANIONS } from './data';
import { CompanionOrb } from './Companion';
import { useKidStore } from './store';

/** A short, interactive onboarding — the app teaches itself by doing. */
export function Onboarding() {
  const completeOnboarding = useKidStore((s) => s.completeOnboarding);
  const toggleBehaviour = useKidStore((s) => s.toggleBehaviour);
  const [screen, setScreen] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [firstYes, setFirstYes] = useState(false);

  const finish = () => {
    completeOnboarding(name, avatar ?? 'sunny');
    if (firstYes) toggleBehaviour('help'); // their first real point
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 py-8 text-center">
      <AnimatePresence mode="wait">
        {/* 1 · Welcome */}
        {screen === 0 && (
          <Slide key="s0">
            <div className="text-[64px] mb-3">🧠✨</div>
            <h1 className="text-[26px] font-extrabold text-[var(--kid-ink)] mb-2">Welcome to your Mind Adventure!</h1>
            <p className="text-[15px] text-[var(--kid-ink-soft)] mb-6 max-w-xs mx-auto">
              Every day you can make small, good choices and collect <b>⭐ points</b>. Ready to play?
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's your name?"
              className="w-full max-w-xs rounded-2xl border-2 px-4 py-3 text-[16px] text-center outline-none mb-4"
              style={{ borderColor: 'var(--kid-line)', background: '#fff' }}
            />
            <KidButton onClick={() => setScreen(1)}>Let's go! 🚀</KidButton>
          </Slide>
        )}

        {/* 2 · Choose companion */}
        {screen === 1 && (
          <Slide key="s1">
            <h1 className="text-[22px] font-extrabold text-[var(--kid-ink)] mb-1">Pick your companion</h1>
            <p className="text-[14px] text-[var(--kid-ink-soft)] mb-5">They'll cheer you on every day.</p>
            <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
              {COMPANIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAvatar(c.id)}
                  className="rounded-3xl p-3 border-4 transition-all"
                  style={{ borderColor: avatar === c.id ? c.color2 : 'transparent', background: avatar === c.id ? c.color + '22' : '#fff' }}
                >
                  <CompanionOrb c={c} size={64} bounce={avatar === c.id} />
                  <div className="text-[12px] font-bold mt-1 text-[var(--kid-ink)]">{c.name}</div>
                  <div className="text-[10px] text-[var(--kid-ink-soft)]">{c.trait}</div>
                </button>
              ))}
            </div>
            <KidButton onClick={() => setScreen(2)} disabled={!avatar}>Choose {avatar ? COMPANIONS.find((c) => c.id === avatar)!.name : ''} →</KidButton>
          </Slide>
        )}

        {/* 3 · How points work */}
        {screen === 2 && (
          <Slide key="s2">
            <h1 className="text-[22px] font-extrabold text-[var(--kid-ink)] mb-4">How it works</h1>
            <div className="flex items-center justify-center gap-2 text-[15px] font-bold text-[var(--kid-ink)] mb-6 flex-wrap">
              <Pill>💚 Kind choice</Pill> <span>→</span>
              <Pill>⭐ Points</Pill> <span>→</span>
              <Pill>🎁 Rewards</Pill> <span>→</span>
              <Pill>🚀 Level up!</Pill>
            </div>
            <p className="text-[14px] text-[var(--kid-ink-soft)] mb-6 max-w-xs mx-auto">
              Every good choice grows your <b>Mind World</b> and unlocks fun surprises.
            </p>
            <KidButton onClick={() => setScreen(3)}>Try it now! 👇</KidButton>
          </Slide>
        )}

        {/* 4 · First action */}
        {screen === 3 && (
          <Slide key="s3">
            {!firstYes ? (
              <>
                <div className="text-[52px] mb-2">🤝</div>
                <h1 className="text-[22px] font-extrabold text-[var(--kid-ink)] mb-1">Did you help someone today?</h1>
                <p className="text-[14px] text-[var(--kid-ink-soft)] mb-6">A little help counts — even holding a door!</p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <KidButton onClick={() => setFirstYes(true)}>Yes, I did! 💚</KidButton>
                  <button onClick={finish} className="text-[13px] text-[var(--kid-ink-soft)] underline">Not yet — that's okay</button>
                </div>
              </>
            ) : (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="text-[64px] mb-2">🎉</div>
                <h1 className="text-[24px] font-extrabold text-[var(--kid-ink)] mb-1">Awesome!</h1>
                <p className="text-[18px] font-bold mb-6" style={{ color: '#FFB703' }}>You earned +15 points! ⭐</p>
                <KidButton onClick={finish}>Start my adventure! 🌈</KidButton>
              </motion.div>
            )}
          </Slide>
        )}
      </AnimatePresence>

      {/* progress dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-2 h-2 rounded-full" style={{ background: i === screen ? 'var(--kid-accent)' : 'var(--kid-line)' }} />
        ))}
      </div>
    </div>
  );
}

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function KidButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full px-7 py-3.5 text-[16px] font-extrabold text-white shadow-lg disabled:opacity-40 transition-opacity"
      style={{ background: 'linear-gradient(135deg, var(--kid-accent), var(--kid-accent2))' }}
    >
      {children}
    </motion.button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full px-3 py-1.5 bg-white shadow-sm text-[13px]">{children}</span>;
}
