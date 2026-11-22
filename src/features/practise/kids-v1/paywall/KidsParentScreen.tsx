import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { useRazorpay } from '../../../../hooks/useRazorpay';
import { usePaypal } from '../../../../hooks/usePaypal';
import { ConsentCheckboxes, PaypalDivider } from '../../../../components/checkout';
import { detectRegionCurrency, formatPrice, type RegionCurrency } from '../../../../lib/regionPricing';
import { KIDS_PATH, KIDS_POSTER_IMG, KIDS_TEACHER_IMG } from '../../../landing/kidsChallengeData';
import { HoldGate } from './HoldGate';
import { APP_FEATURES, FEATURE_VIDEOS, KIDS_PLANS, WALKTHROUGH_FALLBACK, WALKTHROUGH_VIDEO, YEARLY_EXTRAS, type KidsPlanId } from './kidsPlans';
import './KidsPaywall.css';

/**
 * THE PARENT SCREEN — what anyone sees at /mindgymforkids without an active
 * kids membership (and what a lapsed member sees to renew).
 *
 * It is written for the grown-up, not the child: what the app is, the two
 * plans, and one press-and-hold button. Sign-in and payment only appear after
 * the hold, so a child tapping around never reaches a checkout.
 *
 * Payment reuses the site's existing gateway unchanged (useRazorpay /
 * usePaypal → /api/*-order → /api/*-verify → grantPurchase). The app opens by
 * itself when the profile snapshot shows kidsMembershipUntil in the future —
 * this screen never decides access.
 */
const PAYPAL_CONTAINER = 'kp-paypal';

export function KidsParentScreen({ lapsed = false, upgradeOnly = false, onClose, onExitGym }: {
  /** They had a membership and it ended. */
  lapsed?: boolean;
  /** Opened by a monthly member from the grown-ups area: yearly only. */
  upgradeOnly?: boolean;
  onClose?: () => void;
  onExitGym: () => void;
}) {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(upgradeOnly);
  const [plan, setPlan] = useState<KidsPlanId>('kids_membership_yearly');
  const currency = useMemo(() => detectRegionCurrency(), []);
  const signedIn = !!user && !user.isAnonymous;

  return (
    <main className="kp" data-unlocked={unlocked}>
      <div className="kp-bg" aria-hidden="true" />
      <div className="kp-wrap">
        <header className="kp-top">
          <button type="button" className="kp-link" onClick={onClose ?? onExitGym}>
            ← {onClose ? 'Back' : 'Back to Mind Gym'}
          </button>
          <span className="kp-eyebrow">For grown-ups</span>
        </header>

        <section className="kp-hero">
          <div className="kp-hero-copy">
            <h1>{upgradeOnly ? 'Upgrade to yearly' : lapsed ? 'Welcome back' : 'Mind Gym for Kids'}</h1>
            <p className="kp-lede">
              {upgradeOnly
                ? 'Add the live 3-day challenge and Sim’s personal guidance. Your remaining days are kept.'
                : lapsed
                  ? 'Your membership has ended. Everything your child made is still here on this device, ready when you renew.'
                  : 'A gentle daily practice where children aged 5 to 10 notice what they feel, make one good choice, and grow a little every day.'}
            </p>
            {!upgradeOnly && (
              <ul className="kp-ticks">
                {APP_FEATURES.map((f) => <li key={f}>{f}</li>)}
              </ul>
            )}
          </div>
          {!upgradeOnly && (
            <video
              className="kp-video"
              src={WALKTHROUGH_VIDEO.src ?? WALKTHROUGH_FALLBACK}
              poster={WALKTHROUGH_VIDEO.poster}
              controls playsInline preload="none"
              aria-label={WALKTHROUGH_VIDEO.title}
            />
          )}
        </section>

        {!upgradeOnly && <FeatureTour />}

        <section className="kp-plans" aria-label="Membership plans">
          {(Object.values(KIDS_PLANS)).filter((p) => !upgradeOnly || p.extras).map((p) => (
            <button
              type="button"
              key={p.id}
              className="kp-plan"
              data-best={p.extras}
              aria-pressed={plan === p.id}
              onClick={() => setPlan(p.id)}
            >
              {p.extras && <span className="kp-badge">Most complete</span>}
              <span className="kp-plan-name">{p.name}</span>
              <span className="kp-price">{formatPrice(p.price[currency], currency)}<small> {p.period}</small></span>
              <ul>
                <li>The full Mind Gym for Kids app</li>
                {p.extras
                  ? YEARLY_EXTRAS.map((x) => <li key={x} className="kp-extra">{x}</li>)
                  : <li className="kp-muted">Live challenge and Sim’s guidance are in the yearly plan</li>}
              </ul>
              <span className="kp-choose">{plan === p.id ? 'Selected' : 'Choose'}</span>
            </button>
          ))}
        </section>

        <section className="kp-sim">
          <img src={KIDS_TEACHER_IMG} alt="Sim Katyal" loading="lazy" width={72} height={72} />
          <p>
            <b>With the yearly plan, Sim is there for you too.</b> Join her live 3-day
            {' '}<a href={KIDS_PATH} target="_blank" rel="noreferrer">Tiny Kids Transformations</a> challenge, and write to her
            whenever you’re unsure how to help your child with a big feeling.
          </p>
          <img className="kp-poster" src={KIDS_POSTER_IMG} alt="" loading="lazy" />
        </section>

        {!unlocked ? (
          <section className="kp-gate">
            <HoldGate label="Grown-ups: unlock" hint="Press and hold" onOpen={() => setUnlocked(true)} />
            <p className="kp-fine">Children: please ask a grown-up to help with this part.</p>
          </section>
        ) : !signedIn ? (
          <ParentAccount />
        ) : (
          <Checkout plan={plan} currency={currency} />
        )}

        <footer className="kp-foot">
          <p>
            Renewal is never automatic: you pay again only if you choose to. Once you sign in, your child’s name,
            age and what they save in the app are stored in your account so they follow you to other devices.
            {' '}<a href="/policies" target="_blank" rel="noreferrer">Privacy and terms</a>
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ── Feature by feature ──────────────────────────────────────────────────
   One tile per part of the app. A tile with no video yet (src: null in
   kidsPlans.ts) shows a "coming soon" placeholder; give it a src and it
   becomes a player. */

function FeatureTour() {
  return (
    <section className="kp-tour" aria-labelledby="kp-tour-title">
      <h2 id="kp-tour-title">What’s inside</h2>
      <div className="kp-tour-grid">
        {FEATURE_VIDEOS.map((v) => (
          <article key={v.id} className="kp-tile">
            {v.src ? (
              <video className="kp-tile-media" src={v.src} poster={v.poster} controls playsInline preload="none" aria-label={v.title} />
            ) : (
              <div className="kp-tile-media kp-tile-soon" aria-hidden="true"><span>▶</span><small>Video coming soon</small></div>
            )}
            <h3>{v.title}</h3>
            <p>{v.blurb}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Sign in or create the parent account ─────────────────────────────── */

function authMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'That email and password don’t match. Check them, or create an account.';
  }
  if (code.includes('email-already-in-use')) return 'That email already has an account. Choose “I have an account”.';
  if (code.includes('weak-password')) return 'Please use a password of at least 6 characters.';
  if (code.includes('invalid-email')) return 'That email address doesn’t look right.';
  if (code.includes('popup-closed') || code.includes('cancelled-popup')) return '';
  if (code.includes('network')) return 'No connection. Please check the internet and try again.';
  return 'Sign-in didn’t work. Please try again.';
}

function ParentAccount() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, linkWithGoogle, upgradeAnonymousUser, resetPassword } = useAuth();
  const anon = !!user?.isAnonymous;
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setMsg('');
    try { await fn(); } catch (e) { setMsg(authMessage(e)); } finally { setBusy(false); }
  };

  const google = () => run(async () => {
    if (anon) {
      // Keep the anonymous account's data when possible; if that Google
      // account already exists, sign in to it instead.
      try { await linkWithGoogle(); } catch { await signInWithGoogle(); }
    } else {
      await signInWithGoogle();
    }
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    void run(async () => {
      if (mode === 'existing') await signInWithEmail(em, pass);
      else if (anon) await upgradeAnonymousUser(em, pass);
      else await signUpWithEmail(em, pass);
    });
  };

  const forgot = () => run(async () => {
    if (!email.trim()) { setMsg('Type your email above first, then tap “Forgot password”.'); return; }
    await resetPassword(email.trim().toLowerCase());
    setMsg('We’ve emailed you a link to set a new password.');
  });

  return (
    <section className="kp-panel" aria-labelledby="kp-acc-title">
      <h2 id="kp-acc-title">First, your grown-up account</h2>
      <p className="kp-sub">The membership is saved to this account, so it works on every phone, tablet and computer you sign in on.</p>

      <button type="button" className="kp-btn kp-btn-google" onClick={google} disabled={busy}>
        Continue with Google
      </button>
      <div className="kp-or"><span>or</span></div>

      <div className="kp-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'new'} onClick={() => { setMode('new'); setMsg(''); }}>Create account</button>
        <button type="button" role="tab" aria-selected={mode === 'existing'} onClick={() => { setMode('existing'); setMsg(''); }}>I have an account</button>
      </div>
      <form onSubmit={submit} className="kp-form">
        <label>Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Password
          <input type="password" required minLength={6} autoComplete={mode === 'new' ? 'new-password' : 'current-password'} value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        <button type="submit" className="kp-btn kp-btn-primary" disabled={busy}>
          {busy ? 'One moment…' : mode === 'new' ? 'Create account' : 'Sign in'}
        </button>
        {mode === 'existing' && <button type="button" className="kp-link" onClick={forgot} disabled={busy}>Forgot password</button>}
      </form>
      {msg && <p className="kp-msg" role="status">{msg}</p>}
    </section>
  );
}

/* ── Pay ──────────────────────────────────────────────────────────────── */

function Checkout({ plan, currency }: { plan: KidsPlanId; currency: RegionCurrency }) {
  const { user, profile, signOut } = useAuth();
  const { checkOut, isProcessing } = useRazorpay();
  const { renderCheckout, isProcessing: paypalBusy, isAvailable: paypalAvailable } = usePaypal();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [paid, setPaid] = useState(false);

  const p = KIDS_PLANS[plan];
  const price = p.price[currency];
  // PayPal can't settle INR; the server falls back to USD, so show and load USD.
  const paypalCurrency: RegionCurrency = currency === 'INR' ? 'USD' : currency;
  const paypalPrice = p.price[paypalCurrency];
  const uid = user?.uid ?? '';
  const email = user?.email ?? profile?.email ?? '';
  const name = user?.displayName ?? profile?.displayName ?? '';

  useEffect(() => {
    if (!uid || !agreeTerms || paid) return;
    void renderCheckout(PAYPAL_CONTAINER, uid, email, plan, paypalCurrency, () => setPaid(true), profile?.phoneNumber || undefined, paypalPrice);
    // renderCheckout is recreated every render; the inputs below are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, plan, paypalCurrency, paypalPrice, agreeTerms, paid]);

  if (paid) {
    return (
      <section className="kp-panel kp-done" role="status">
        <h2>Thank you. Opening the gym…</h2>
        <p className="kp-sub">This takes a few seconds. If nothing happens, refresh the page.</p>
      </section>
    );
  }

  const card = (
    <button
      type="button"
      className="kp-btn kp-btn-primary"
      disabled={!agreeTerms || isProcessing}
      onClick={() => void checkOut(uid, email, name, plan, currency, () => setPaid(true), profile?.phoneNumber || undefined, price)}
    >
      {isProcessing ? 'Opening secure payment…' : `Pay ${formatPrice(price, currency)} by card or UPI`}
    </button>
  );
  const paypal = paypalAvailable !== false && (
    <div className="kp-paypal" data-disabled={!agreeTerms}>
      {currency === 'INR' && <p className="kp-fine">PayPal charges in US dollars: {formatPrice(paypalPrice, 'USD')}.</p>}
      {!agreeTerms && <p className="kp-fine">Tick the box above to pay with PayPal or Apple Pay.</p>}
      <div id={PAYPAL_CONTAINER} aria-busy={paypalBusy} />
    </div>
  );
  const inrFirst = currency === 'INR';

  return (
    <section className="kp-panel" aria-labelledby="kp-pay-title">
      <h2 id="kp-pay-title">{p.name} membership · {formatPrice(price, currency)}</h2>
      <p className="kp-sub">
        Signed in as <b>{email || 'your account'}</b>.{' '}
        <button type="button" className="kp-link" onClick={() => void signOut()}>Use a different account</button>
      </p>
      <ConsentCheckboxes
        agreeTerms={agreeTerms} setAgreeTerms={setAgreeTerms}
        agreeMarketing={agreeMarketing} setAgreeMarketing={setAgreeMarketing}
        isDark
      />
      <div className="kp-pay">
        {inrFirst ? card : paypal}
        {paypal && <PaypalDivider />}
        {inrFirst ? paypal : card}
      </div>
      <p className="kp-fine">One payment {p.period}. No automatic renewal.</p>
    </section>
  );
}
