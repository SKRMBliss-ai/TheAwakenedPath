import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { sfx } from '../../lib/sfx';
import { usePractiseStore } from './store';
import { AdultGym } from './Adult';
import { KidsGym } from './Kids';
import { PractiseShell } from './ui';

/**
 * Practise — the practice gym for the mind. One reusable engine, two gyms.
 * Self-contained: manages its own view state and paints its own light theme,
 * independent of the app shell. Nothing outside Practise is touched.
 */
export default function PractiseApp() {
  const { lastGym, setGym } = usePractiseStore();
  const [gym, setLocalGym] = useState<'adult' | 'kids' | null>(lastGym);

  const enter = (g: 'adult' | 'kids') => { sfx.chime(); setGym(g); setLocalGym(g); };
  const exit = () => { sfx.tap(); setLocalGym(null); };

  if (gym === 'adult') return <AdultGym onExitGym={exit} />;
  if (gym === 'kids') return <KidsGym onExitGym={exit} />;

  return (
    <PractiseShell variant="adult">
      <div className="mx-auto max-w-md py-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-4xl">🌳</div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight" style={{ color: 'var(--p-ink)' }}>
            My Best<br />Every Day
          </h1>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--p-accent)' }}>The Practice Gym for the Mind</p>
          <p className="mt-3 text-[13px] leading-relaxed" style={{ color: 'var(--p-muted)' }}>
            Life gives us experiences. Sometimes we want to grow. Sometimes something gets stuck in our mind.
            Bring it into the gym — let’s work with it.
          </p>
        </motion.div>

        <div className="mt-7 space-y-4">
          <GymCard
            emoji="🧒"
            title="Kids Gym"
            sub="For ages 5–10"
            body="Play, explore and strengthen your mind."
            tint="#E7F9EC"
            onClick={() => enter('kids')}
          />
          <GymCard
            emoji="🧘"
            title="Adult Gym"
            sub="For teens & adults"
            body="Build awareness, resilience and conscious choice."
            tint="#E2F0EA"
            onClick={() => enter('adult')}
          />
        </div>

        <p className="mt-8 text-center text-[13px] italic" style={{ color: 'var(--p-muted)' }}>
          “You don’t have to be perfect. You just have to practise.”
        </p>
      </div>
    </PractiseShell>
  );
}

function GymCard({
  emoji, title, sub, body, tint, onClick,
}: {
  emoji: string; title: string; sub: string; body: string; tint: string; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full overflow-hidden rounded-3xl p-5 text-left shadow-[0_2px_20px_rgba(30,40,35,0.06)]"
      style={{ background: `linear-gradient(135deg, ${tint}, var(--p-surface))`, border: '1px solid var(--p-line)' }}
    >
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: 'var(--p-surface)' }}>
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-extrabold" style={{ color: 'var(--p-ink)' }}>{title}</div>
          <div className="text-[12px] font-semibold" style={{ color: 'var(--p-accent)' }}>{sub}</div>
        </div>
        <ArrowRight size={20} style={{ color: 'var(--p-accent)' }} />
      </div>
      <p className="mt-3 text-[13px]" style={{ color: 'var(--p-muted)' }}>{body}</p>
    </motion.button>
  );
}
