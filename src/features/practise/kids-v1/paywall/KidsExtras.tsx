import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../firebase';
import { useAuth } from '../../../auth/AuthContext';
import { useKidStore } from '../../../kids/store';
import { KIDS_FORMAT, KIDS_PATH, KIDS_TEACHER_IMG, KIDS_TIME } from '../../../landing/kidsChallengeData';
import './KidsPaywall.css';

/**
 * THE GROWN-UPS AREA for members: membership status, and the two things the
 * yearly plan adds — writing to Sim, and a place in the live 3-day challenge.
 *
 * Both actions are callables (kidsGuidanceRequest / kidsChallengeReserve in
 * functions/index.js) that check kidsExtrasUntil on the server. `hasKidsExtras`
 * here only decides what to SHOW; a monthly member sees the same three things
 * with an upgrade button instead.
 */
type Sent = 'idle' | 'sending' | 'done' | 'error';

function untilText(t: unknown): string {
  if (!t) return '';
  const d = typeof (t as { toDate?: () => Date }).toDate === 'function' ? (t as { toDate: () => Date }).toDate() : new Date(t as string);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function callableMessage(err: unknown): string {
  const m = (err as { message?: string })?.message ?? '';
  return m && !/internal/i.test(m) ? m : 'That didn’t go through. Please try again in a moment.';
}

export function KidsExtras({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  const { user, profile, hasKidsExtras, signOut } = useAuth();
  const kidName = useKidStore((s) => s.name);
  const until = untilText(profile?.kidsMembershipUntil);
  const [phone, setPhone] = useState(profile?.phoneNumber ?? '');

  return (
    <main className="kp kp-area">
      <div className="kp-bg" aria-hidden="true" />
      <div className="kp-wrap">
        <header className="kp-top">
          <button type="button" className="kp-link" onClick={onClose}>← Back to the gym</button>
          <span className="kp-eyebrow">For grown-ups</span>
        </header>

        <section className="kp-panel">
          <h1 className="kp-h1-small">Your membership</h1>
          <p className="kp-sub">
            {hasKidsExtras ? 'Yearly plan' : 'Monthly plan'}{until ? ` · active until ${until}` : ''}
            {user?.email ? <> · {user.email}</> : null}
          </p>
          <div className="kp-row">
            <button type="button" className="kp-btn kp-btn-ghost" onClick={onUpgrade}>
              {hasKidsExtras ? 'Add another year' : 'Upgrade to yearly'}
            </button>
            <button type="button" className="kp-link" onClick={() => void signOut()}>Sign out</button>
          </div>
        </section>

        {!hasKidsExtras && (
          <section className="kp-panel kp-locked">
            <h2>Included with the yearly plan</h2>
            <ul className="kp-ticks">
              <li>Ask Sim a question about your child, by email or WhatsApp</li>
              <li>Request a 1:1 Zoom call with Sim</li>
              <li>A place in the 3-day live Tiny Kids Transformations challenge</li>
            </ul>
            <button type="button" className="kp-btn kp-btn-primary" onClick={onUpgrade}>Upgrade to yearly</button>
          </section>
        )}

        {hasKidsExtras && (
          <>
            <section className="kp-panel">
              <label className="kp-field">Your WhatsApp number (so Sim and the team can reach you)
                <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 900000" />
              </label>
            </section>
            <AskSim phone={phone} />
            <Reserve phone={phone} defaultChild={kidName ?? ''} />
          </>
        )}
      </div>
    </main>
  );
}

function AskSim({ phone }: { phone: string }) {
  const [kind, setKind] = useState<'question' | 'call'>('question');
  const [message, setMessage] = useState('');
  const [childAge, setChildAge] = useState('');
  const [state, setState] = useState<Sent>('idle');
  const [err, setErr] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending'); setErr('');
    try {
      await httpsCallable(functions, 'kidsGuidanceRequest')({ kind, message, childAge, phone });
      setState('done'); setMessage('');
    } catch (ex) { setErr(callableMessage(ex)); setState('error'); }
  };

  return (
    <section className="kp-panel" aria-labelledby="kp-sim-title">
      <div className="kp-sim-head">
        <img src={KIDS_TEACHER_IMG} alt="" width={56} height={56} loading="lazy" />
        <div>
          <h2 id="kp-sim-title">Personal guidance from Sim</h2>
          <p className="kp-sub">Sim reads every message herself and replies by email or WhatsApp.</p>
        </div>
      </div>
      {state === 'done' ? (
        <div role="status">
          <p className="kp-ok">{kind === 'call' ? 'Your call request has reached Sim. She’ll write back with a time.' : 'Your question has reached Sim. She’ll reply personally.'}</p>
          <button type="button" className="kp-link" onClick={() => setState('idle')}>Send another</button>
        </div>
      ) : (
        <form onSubmit={send} className="kp-form">
          <div className="kp-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={kind === 'question'} onClick={() => setKind('question')}>Ask a question</button>
            <button type="button" role="tab" aria-selected={kind === 'call'} onClick={() => setKind('call')}>Request a 1:1 call</button>
          </div>
          <label>{kind === 'call' ? 'What would you like to talk about, and which days suit you?' : 'Your question'}
            <textarea required minLength={5} maxLength={2000} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <label>Your child’s age (optional)
            <input inputMode="numeric" maxLength={2} value={childAge} onChange={(e) => setChildAge(e.target.value)} />
          </label>
          <button type="submit" className="kp-btn kp-btn-primary" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : kind === 'call' ? 'Request the call' : 'Send to Sim'}
          </button>
          {err && <p className="kp-msg" role="alert">{err}</p>}
          <p className="kp-fine">This is educational guidance, not therapy or medical advice. If your child is in danger, contact local emergency services.</p>
        </form>
      )}
    </section>
  );
}

function Reserve({ phone, defaultChild }: { phone: string; defaultChild: string }) {
  const [childName, setChildName] = useState(defaultChild);
  const [childAge, setChildAge] = useState('');
  const [state, setState] = useState<Sent>('idle');
  const [already, setAlready] = useState(false);
  const [err, setErr] = useState('');

  const reserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending'); setErr('');
    try {
      let timezone = '';
      try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* leave blank */ }
      const res = await httpsCallable(functions, 'kidsChallengeReserve')({ childName, childAge, phone, timezone });
      setAlready(!!(res.data as { already?: boolean })?.already);
      setState('done');
    } catch (ex) { setErr(callableMessage(ex)); setState('error'); }
  };

  return (
    <section className="kp-panel" aria-labelledby="kp-ch-title">
      <h2 id="kp-ch-title">3-day live challenge</h2>
      <p className="kp-sub">
        {KIDS_FORMAT} · {KIDS_TIME}. Your place is included, with no donation asked.{' '}
        <a href={KIDS_PATH} target="_blank" rel="noreferrer">See what happens each day</a>
      </p>
      {state === 'done' ? (
        <p className="kp-ok" role="status">
          {already ? 'Your place is already reserved.' : 'Your place is reserved.'} We’ll send the Zoom link and a short preparation note by email and WhatsApp.
        </p>
      ) : (
        <form onSubmit={reserve} className="kp-form">
          <label>Child’s first name
            <input required maxLength={60} value={childName} onChange={(e) => setChildName(e.target.value)} />
          </label>
          <label>Child’s age
            <input required inputMode="numeric" maxLength={2} value={childAge} onChange={(e) => setChildAge(e.target.value)} />
          </label>
          <button type="submit" className="kp-btn kp-btn-primary" disabled={state === 'sending'}>
            {state === 'sending' ? 'Reserving…' : 'Reserve our place'}
          </button>
          {!phone.trim() && <p className="kp-fine">Add your WhatsApp number above first.</p>}
          {err && <p className="kp-msg" role="alert">{err}</p>}
        </form>
      )}
    </section>
  );
}
