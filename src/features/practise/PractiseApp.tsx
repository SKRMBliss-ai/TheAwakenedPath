import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { sfx } from '../../lib/sfx';
import { usePractiseStore } from './store';
import { AdultGym } from './Adult';
import { KidsGym } from './Kids';
import { GlowOrb, PractiseShell } from './ui';

/**
 * Practise — the practice gym for the mind. One reusable engine, two gyms.
 * Self-contained: manages its own view state and paints its own theme,
 * independent of the app shell. Nothing outside Practise is touched.
 * The landing screen mirrors the wireframes' cosmic "Get Started" hero.
 */
export default function PractiseApp() {
  const { lastGym, setGym } = usePractiseStore();
  const [gym, setLocalGym] = useState<'adult' | 'kids' | null>(lastGym);

  const enter = (g: 'adult' | 'kids') => { sfx.swell(); setGym(g); setLocalGym(g); };
  const exit = () => { sfx.tap(); setLocalGym(null); };

  if (gym === 'adult') return <AdultGym onExitGym={exit} />;
  if (gym === 'kids') return <KidsGym onExitGym={exit} />;

  return (
    <PractiseShell variant="adult" mode="cosmic">
      <div className="mx-auto flex min-h-[85vh] max-w-md flex-col items-center justify-center py-4 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          <GlowOrb size={128} face="sleepy" />
          <h1 className="mt-6 text-3xl font-extrabold leading-tight text-white">
            My Best<br />Every Day
          </h1>
          <p className="mt-2 text-sm font-semibold" style={{ color: '#C9AEFF' }}>The Practice Gym for the Mind</p>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/65">
            Life gives us experiences. Sometimes we want to grow. Sometimes something gets stuck in our mind.
            Bring it into the gym — let’s work with it.
          </p>
        </motion.div>

        <div className="mt-8 w-full space-y-4">
          <GymCard
            emoji="🧒"
            title="Kids Gym"
            sub="For ages 5–10"
            body="Play, explore and strengthen your mind."
            tint={['#FFC978', '#FF9640']}
            onClick={() => enter('kids')}
          />
          <GymCard
            emoji="🧘"
            title="Adult Gym"
            sub="For teens & adults"
            body="Build awareness, resilience and conscious choice."
            tint={['#8B7BF0', '#4A2E9E']}
            onClick={() => enter('adult')}
          />
        </div>

        <p className="mt-8 max-w-xs text-center text-[13px] italic text-white/50">
          “You don’t have to be perfect. You just have to practise.”
        </p>
      </div>
    </PractiseShell>
  );
}

function GymCard({
  emoji, title, sub, body, tint, onClick,
}: {
  emoji: string; title: string; sub: string; body: string; tint: [string, string]; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full overflow-hidden rounded-3xl bg-white p-5 text-left shadow-[0_12px_32px_rgba(20,11,48,0.35)]"
    >
      <div className="flex items-center gap-4">
        <div
          className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-3xl shadow-sm"
          style={{ background: `linear-gradient(150deg, ${tint[0]}, ${tint[1]})` }}
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-extrabold" style={{ color: '#241B3D' }}>{title}</div>
          <div className="text-[12px] font-semibold" style={{ color: tint[1] }}>{sub}</div>
        </div>
        <ArrowRight size={20} style={{ color: tint[1] }} />
      </div>
      <p className="mt-3 text-[13px]" style={{ color: '#7C7295' }}>{body}</p>
    </motion.button>
  );
}
