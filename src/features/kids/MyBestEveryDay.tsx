import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useKidStore } from './store';
import { Onboarding } from './Onboarding';
import { KidDashboard, DailyTracker, MindWorld, RewardsScreen, Friends, Reflection } from './screens';
import { ChoiceScene } from './ChoiceScene';
import { scenarioForDay, scenariosForBehaviour, type Scenario } from './scenarios';
import { todayKey } from './data';

/**
 * My Best Every Day — a gentle, gamified daily ethical-behaviour game for kids,
 * living inside the practice area. Original emotion companions and a "Mind
 * World"; good choices are the gameplay. Data stays on-device (see store.ts).
 *
 * Self-contained: manages its own screen state and paints its own bright, light
 * theme via CSS vars, independent of the app's dark theme.
 */

type Tab = 'home' | 'today' | 'world' | 'rewards' | 'friends';

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'today', icon: '🌈', label: 'Today' },
  { id: 'world', icon: '🗺️', label: 'World' },
  { id: 'rewards', icon: '🎁', label: 'Rewards' },
  { id: 'friends', icon: '🤝', label: 'Friends' },
];

export default function MyBestEveryDay() {
  const onboarded = useKidStore((s) => s.onboarded);
  const reset = useKidStore((s) => s.reset);
  const [tab, setTab] = useState<Tab>('home');
  const [reflecting, setReflecting] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const playForBehaviour = (behaviour: string) => {
    const list = scenariosForBehaviour(behaviour);
    setScenario(list[Math.floor(Math.random() * list.length)] ?? scenarioForDay(todayKey()));
  };

  return (
    <div
      className="min-h-screen -mx-4 sm:mx-0"
      style={{
        // Bright, playful, light — its own world.
        ['--kid-ink' as string]: '#3A2E4F',
        ['--kid-ink-soft' as string]: '#8A7E9A',
        ['--kid-line' as string]: '#ECE4F2',
        ['--kid-accent' as string]: '#9B5DE5',
        ['--kid-accent2' as string]: '#F15BB5',
        background: 'linear-gradient(180deg,#FDF4FF 0%,#F0F9FF 100%)',
        color: '#3A2E4F',
      }}
    >
      {!onboarded ? (
        <Onboarding />
      ) : (
        <div className="max-w-md mx-auto px-4 pt-4 pb-28">
          {/* header */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[15px] font-extrabold" style={{ color: 'var(--kid-accent)' }}>My Best Every Day</h1>
            <button onClick={() => { if (confirm('Start over? This clears your progress on this device.')) reset(); }}
              className="text-[10px] font-bold text-[var(--kid-ink-soft)]">restart</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={scenario ? 'scene' : reflecting ? 'reflect' : tab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {scenario ? (
                <ChoiceScene scenario={scenario} onDone={() => setScenario(null)} />
              ) : reflecting ? (
                <Reflection onClose={() => setReflecting(false)} />
              ) : tab === 'home' ? (
                <KidDashboard
                  onStart={() => setScenario(scenarioForDay(todayKey()))}
                  onOpenTracker={() => setTab('today')}
                  onOpenReflection={() => setReflecting(true)}
                />
              ) : tab === 'today' ? (
                <DailyTracker />
              ) : tab === 'world' ? (
                <MindWorld onPlay={playForBehaviour} />
              ) : tab === 'rewards' ? (
                <RewardsScreen />
              ) : (
                <Friends />
              )}
            </motion.div>
          </AnimatePresence>

          {/* bottom nav */}
          {!reflecting && !scenario && (
            <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
              <div className="mx-3 mb-3 rounded-full shadow-lg flex items-center justify-around px-2 py-2" style={{ background: '#fff' }}>
                {NAV.map((n) => (
                  <button key={n.id} onClick={() => setTab(n.id)}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-all"
                    style={{ background: tab === n.id ? 'var(--kid-accent)' + '18' : 'transparent' }}>
                    <span className="text-[20px]" style={{ filter: tab === n.id ? 'none' : 'grayscale(0.3)' }}>{n.icon}</span>
                    <span className="text-[9px] font-bold" style={{ color: tab === n.id ? 'var(--kid-accent)' : 'var(--kid-ink-soft)' }}>{n.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
