import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scenario, Choice } from './scenarios';
import { EMOTIONS } from './emotions';
import { CompanionOrb } from './Companion';
import { useKidStore } from './store';

/**
 * A Choice Scene — the ethical decision as gameplay. The scenario appears, the
 * Feelings Crew debate it (animated, one after another), and the child chooses.
 * The best choice earns the most points with a celebration; gentler choices are
 * met with kind guidance and a chance to think again — never a scolding.
 */
export function ChoiceScene({ scenario, onDone }: { scenario: Scenario; onDone: () => void }) {
  const awardPoints = useKidStore((s) => s.awardPoints);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [celebrated, setCelebrated] = useState(false);

  const choose = (c: Choice) => {
    setPicked(c);
    if (c.best) {
      awardPoints(c.points, scenario.behaviour);
      setCelebrated(true);
    }
  };

  const crew = scenario.reactions.map((r) => ({ r, e: EMOTIONS[r.who] })).filter((x) => x.e);

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Scene header */}
      <div className="text-center mb-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--kid-accent)' }}>{scenario.world}</p>
        <h2 className="text-[20px] font-extrabold text-[var(--kid-ink)]">{scenario.title}</h2>
      </div>

      {/* The situation */}
      <div className="rounded-3xl p-4 shadow-sm mb-4" style={{ background: '#fff' }}>
        <p className="text-[14.5px] leading-relaxed text-[var(--kid-ink)] text-center">{scenario.setup}</p>
      </div>

      {/* The emotions debating */}
      <div className="space-y-2 mb-4">
        {crew.map(({ r, e }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 * i }}
            className={`flex items-end gap-2 ${i % 2 ? 'flex-row-reverse' : ''}`}
          >
            <CompanionOrb c={e} size={44} bounce={false} />
            <div className="rounded-2xl px-3 py-2 max-w-[75%] shadow-sm" style={{ background: e.color + '22', border: `1.5px solid ${e.color}55` }}>
              <span className="text-[10px] font-extrabold" style={{ color: e.color2 }}>{e.name}</span>
              <p className="text-[13px] text-[var(--kid-ink)] leading-snug">{r.line}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* The decision — the gameplay */}
      {!celebrated && (
        <div className="mt-auto space-y-2">
          <p className="text-[12px] font-bold text-[var(--kid-ink-soft)] text-center mb-1">What do you choose?</p>
          {scenario.choices.map((c) => (
            <motion.button
              key={c.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => choose(c)}
              className="w-full flex items-center gap-3 rounded-2xl p-3 text-left shadow-sm transition-all"
              style={{
                background: picked?.label === c.label ? (c.best ? '#E8F8EE' : '#FFF4E6') : '#fff',
                border: picked?.label === c.label ? `2px solid ${c.best ? '#43BC5F' : '#FFB703'}` : '2px solid transparent',
              }}
            >
              <span className="text-[24px]">{c.emoji}</span>
              <span className="flex-1 text-[14px] font-bold text-[var(--kid-ink)]">{c.label}</span>
            </motion.button>
          ))}

          {/* Kind guidance after a non-best pick — try again, no shame */}
          <AnimatePresence>
            {picked && !picked.best && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-3 mt-1 text-center" style={{ background: '#FFF4E6' }}>
                <p className="text-[13px] text-[var(--kid-ink)]">{picked.response}</p>
                <button onClick={() => setPicked(null)} className="mt-2 text-[12px] font-extrabold" style={{ color: 'var(--kid-accent)' }}>
                  Let's think again 💭
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Celebration */}
      <AnimatePresence>
        {celebrated && picked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-auto text-center rounded-3xl p-5"
            style={{ background: 'linear-gradient(160deg,#FFF6D6,#E8F8EE)' }}
          >
            {/* confetti */}
            <div className="relative h-0">
              {['🎉', '⭐', '✨', '💛', '🌟', '🎊'].map((c, i) => (
                <motion.span key={i} className="absolute text-[22px]"
                  initial={{ y: 0, x: (i - 3) * 24, opacity: 1 }}
                  animate={{ y: -70 - i * 6, opacity: 0 }}
                  transition={{ duration: 1.2, delay: i * 0.05 }}
                  style={{ left: '50%' }}>
                  {c}
                </motion.span>
              ))}
            </div>
            <div className="text-[46px] mb-1 mt-2">🎉</div>
            <p className="text-[19px] font-extrabold text-[var(--kid-ink)]">Great choice!</p>
            <p className="text-[13px] text-[var(--kid-ink)] my-2">{picked.response}</p>
            <p className="text-[22px] font-extrabold my-2" style={{ color: '#FFB703' }}>+{picked.points} ⭐</p>
            {/* the crew cheers */}
            <div className="flex justify-center gap-1 my-2">
              {crew.slice(0, 5).map(({ e }, i) => (
                <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: 2, delay: i * 0.1 }}>
                  <CompanionOrb c={e} size={36} bounce={false} />
                </motion.div>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={onDone}
              className="w-full rounded-full py-3 text-[15px] font-extrabold text-white shadow-lg mt-2"
              style={{ background: 'linear-gradient(135deg,var(--kid-accent),var(--kid-accent2))' }}>
              Keep going! 🚀
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {!celebrated && (
        <button onClick={onDone} className="text-[12px] text-[var(--kid-ink-soft)] mt-3">← back</button>
      )}
    </div>
  );
}
