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
/** Kids Gym v1 — its own feature folder (`practise/kids-v1`), importing
 *  nothing from `practise/kids` except the two things that are genuinely
 *  shared assets rather than v0 behaviour (Chirpy's sprite paths and the
 *  sound table). That separation is the point: v1 can be reworked freely
 *  without any chance of moving the live /mindgymforkids page. */
/**
 * /mindgymforkidsv1 now serves the merged app: My Best Every Day's engine
 * (the seven virtues, the daily tick, the points and streak that already
 * work) wearing Kids Gym v1's world (rooms, Chirpy, the games, the five-step
 * reflection). The old KidsGymV1 shell is still in the tree and still
 * imports cleanly — its check-in, games and rooms are what this is built
 * from — it simply isn't the front door any more.
 */
const KidsGymV1 = lazy(() => import('../practise/kids-v1/best/BestApp'));

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

  if (route === 'kidsV1') {
    return (
      <Suspense fallback={<GymFallback />}>
        <KidsGymV1 onExitGym={exit} />
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
