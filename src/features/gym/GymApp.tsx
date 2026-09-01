import { Suspense, lazy } from 'react';
import MindGymForAll from './MindGymForAll';
import { useGymRoute, type GymRoute } from './lib/gymRouter';

/**
 * The real practice engine, at its one home.
 *
 * AdultGym and KidsWorld were originally built (as `src/features/practise/`)
 * behind the existing gated /mindgym app's "practise" tab. That tab has been
 * removed — see UntetheredSoulApp.tsx — so these public URLs are now the only
 * way to reach them. Both are self-contained: their own Zustand store
 * (`usePractiseStore`, localStorage-only, no server, no auth — see
 * features/practise/store.ts), no Firebase/auth imports anywhere in the
 * feature. That is exactly why they can drop in here with zero providers.
 *
 * Their visual style (light lavender for Adult, a night-sky gradient for
 * Kids) intentionally does NOT match the cream/sage/violet tokens built for
 * /mindgymforall — kept as-is on request rather than restyled, so this is a
 * deliberate, known inconsistency, not an oversight.
 */
const AdultGym = lazy(() => import('../practise/Adult').then((m) => ({ default: m.AdultGym })));
const KidsWorld = lazy(() => import('../practise/kids/KidsWorld').then((m) => ({ default: m.KidsWorld })));

const GymFallback = () => (
  <div className="grid min-h-screen place-items-center bg-[#FBF7F0] text-[13px] text-[#8A8078]">
    Loading…
  </div>
);

/**
 * MY BEST EVERY DAY — the Practice Gym shell.
 *
 * One shell, three URLs. `main.tsx` matches the whole `/mindgymfor*` family and
 * mounts this once; from here navigation is client-side (see lib/gymRouter),
 * so moving between gyms costs no reload.
 *
 * Deliberately mounts NO providers. Unlike /mindgym, nothing here needs auth,
 * the dark ThemeProvider, or achievements — AdultGym/KidsWorld and
 * MindGymForAll are all fully self-contained.
 */
export default function GymApp({ initialRoute }: { initialRoute: GymRoute }) {
  const [route, navigate] = useGymRoute(initialRoute);
  const exit = () => navigate('all');

  if (route === 'kids') {
    return (
      <Suspense fallback={<GymFallback />}>
        <KidsWorld onExitGym={exit} />
      </Suspense>
    );
  }

  if (route === 'adults') {
    return (
      <Suspense fallback={<GymFallback />}>
        <AdultGym onExitGym={exit} />
      </Suspense>
    );
  }

  return <MindGymForAll onEnter={navigate} />;
}
