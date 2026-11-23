import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '../../../auth/AuthContext';
import { HoldGate } from './HoldGate';
import { PARENTS_EVENT } from './kidsPlans';
import './KidsPaywall.css';

const KidsParentScreen = lazy(() => import('./KidsParentScreen').then((m) => ({ default: m.KidsParentScreen })));
const KidsExtras = lazy(() => import('./KidsExtras').then((m) => ({ default: m.KidsExtras })));

/**
 * THE DOOR TO MIND GYM FOR KIDS.
 *
 * The kids app is a paid membership, sold separately from everything else on
 * the site. This wraps the app and shows one of three things:
 *   - a quiet loader while sign-in state and the profile arrive;
 *   - the parent screen, if there is no active kids membership;
 *   - the app.
 *
 * It also owns the members' grown-ups area (membership, Sim, the challenge),
 * opened by the "For grown-ups" link on the kids home via PARENTS_EVENT and
 * guarded by the same press-and-hold.
 *
 * The rest of the /mindgymfor* family mounts no providers on purpose; the
 * AuthProvider lives HERE so only the kids app pays for it.
 */
export default function KidsGate({ children, onExitGym }: { children: ReactNode; onExitGym: () => void }) {
  return (
    <AuthProvider>
      <Gate onExitGym={onExitGym}>{children}</Gate>
    </AuthProvider>
  );
}

export function KidsLoader() {
  return (
    <div className="kp-loader" role="status" aria-label="Opening Mind Gym">
      <span className="kp-loader-star" aria-hidden="true">✦</span>
      <p>Opening Mind Gym…</p>
    </div>
  );
}

type Area = 'none' | 'hold' | 'open' | 'upgrade';

function Gate({ children, onExitGym }: { children: ReactNode; onExitGym: () => void }) {
  const { user, profile, loading, hasKidsMembership } = useAuth();
  const [area, setArea] = useState<Area>('none');
  // Remember that this session had access, so a lapse mid-visit reads as
  // "renew" rather than as a first-time sales page.
  const [hadAccess, setHadAccess] = useState(false);

  useEffect(() => { if (hasKidsMembership) setHadAccess(true); }, [hasKidsMembership]);

  useEffect(() => {
    const open = () => setArea('hold');
    window.addEventListener(PARENTS_EVENT, open);
    return () => window.removeEventListener(PARENTS_EVENT, open);
  }, []);

  // Signed in but the profile snapshot hasn't landed: still deciding.
  if (loading || (user && !profile)) return <KidsLoader />;

  if (!hasKidsMembership) {
    const lapsed = hadAccess || !!profile?.kidsMembershipUntil;
    return (
      <Suspense fallback={<KidsLoader />}>
        <KidsParentScreen lapsed={lapsed} onExitGym={onExitGym} />
      </Suspense>
    );
  }

  if (area === 'open') {
    return (
      <Suspense fallback={<KidsLoader />}>
        <KidsExtras onClose={() => setArea('none')} onUpgrade={() => setArea('upgrade')} />
      </Suspense>
    );
  }
  if (area === 'upgrade') {
    return (
      <Suspense fallback={<KidsLoader />}>
        <KidsParentScreen upgradeOnly onClose={() => setArea('open')} onExitGym={onExitGym} />
      </Suspense>
    );
  }

  return (
    <>
      {children}
      {area === 'hold' && (
        <div className="kp-holdsheet" role="dialog" aria-modal="true" aria-label="For grown-ups"
          onClick={(e) => { if (e.target === e.currentTarget) setArea('none'); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setArea('none'); }}>
          <div className="kp-holdsheet-card">
            <h2>This part is for grown-ups</h2>
            <p>Membership, the live challenge and messages to Sim.</p>
            <HoldGate label="Grown-ups: open" onOpen={() => setArea('open')} />
            <button type="button" className="kp-link" autoFocus onClick={() => setArea('none')}>Back to the gym</button>
          </div>
        </div>
      )}
    </>
  );
}
