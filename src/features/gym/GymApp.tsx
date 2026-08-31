import MindGymForAll from './MindGymForAll';
import GymPlaceholder from './GymPlaceholder';
import { useGymRoute, type GymRoute } from './lib/gymRouter';

/**
 * MY BEST EVERY DAY — the Practice Gym shell.
 *
 * One shell, three URLs. `main.tsx` matches the whole `/mindgymfor*` family and
 * mounts this once; from here navigation is client-side (see lib/gymRouter),
 * so moving between gyms costs no reload.
 *
 * Deliberately mounts NO providers. Unlike /mindgym, nothing here needs auth,
 * the dark ThemeProvider, or achievements yet — and staying provider-free keeps
 * this first slice unable to affect the existing app in any way. Providers get
 * added at the exact slice that needs them (persistence), not before.
 */
export default function GymApp({ initialRoute }: { initialRoute: GymRoute }) {
  const [route, navigate] = useGymRoute(initialRoute);

  if (route === 'kids') {
    return (
      <GymPlaceholder
        surface="kids"
        title="Kids Gym"
        lines={[
          'The rooms are being built.',
          'Twelve practice rooms — Feelings, Thoughts, Pause, Body Detective, Courage and more — are coming next.',
        ]}
        onBack={() => navigate('all')}
      />
    );
  }

  if (route === 'adults') {
    return (
      <GymPlaceholder
        surface="adults"
        title="Adult Gym"
        lines={[
          'Your practice space is being prepared.',
          'Bring something that is on your mind, or take today’s practice — both arrive in the next step.',
        ]}
        onBack={() => navigate('all')}
      />
    );
  }

  return <MindGymForAll onEnter={navigate} />;
}
