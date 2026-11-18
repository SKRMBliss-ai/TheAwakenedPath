// ─────────────────────────────────────────────────────────────────────────────
// /pricing — the ONE place anything is bought, across both studios.
//
// Every buy / upgrade / unlock button on the site and in the app links here,
// optionally with ?select=<product id> to open that product's checkout.
// Signed-in visitors are charged on their own account (uid); everyone else
// checks out as a guest by email, exactly like the course and kids pages.
// Products, prices and refunds all come from catalog.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { Check, ShieldCheck, Loader2 } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { track } from '../../lib/analytics';
import { useSiteTheme, type Palette } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter, SERIF, SANS } from '../../components/site/SiteChrome';
import { siteNav } from '../../components/site/siteNav';
import { useRazorpay } from '../../hooks/useRazorpay';
import { usePaypal } from '../../hooks/usePaypal';
import { CURRENCY, DOORS, PRODUCTS, canonicalId, isPwyw, priceOf, product, refundOf, wasOf, type Door, type Product } from './catalog';

const t = (a: string, d = '') => track(a, d, '/pricing');
const PER: Record<Product['billing'], string> = { once: ' once', month: '/month', year: '/year' };

/** How a plan is named inside its door: "Monthly", "Yearly · save 17%", or its own name if it is an add-on. */
function optionLabel(id: string, door: Door): string {
  const p = product(id);
  const base = product(door.plans[0]);
  if (p.name !== base.name) return p.billing === 'month' ? `${p.name}, monthly` : p.name;
  if (p.billing === 'once') return 'One payment, yours to keep';
  if (p.billing === 'month') return 'Monthly';
  const monthly = PRODUCTS.find((x) => x.name === p.name && x.billing === 'month');
  if (!monthly) return 'Yearly';
  const save = Math.round((1 - p.price[CURRENCY] / (monthly.price[CURRENCY] * 12)) * 100);
  return save > 0 ? `Yearly · save ${save}%` : 'Yearly';
}

/** One door as a pricing column: who it is for, what is inside, and its plans. */
function DoorColumn({ palette, door, selected, onPick }: { palette: Palette; door: Door; selected: string | null; onPick: (id: string) => void }) {
  return (
    <section id={door.id} aria-labelledby={`door-${door.id}`} className="pr-col"
      style={{ background: palette.CARD, border: `1px solid ${palette.BORDER}`, borderRadius: 28, padding: 'clamp(20px, 2.6vw, 28px)', display: 'flex', flexDirection: 'column', gap: 14, scrollMarginTop: 90 }}>
      <span style={{ alignSelf: 'flex-start', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '6px 12px', borderRadius: 999, background: palette.BAND, color: palette.ON_BAND }}>{door.who}</span>
      <h2 id={`door-${door.id}`} style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>{door.title}</h2>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: palette.INK2 }}>{door.line}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 7 }}>
        {door.includes.map((x) => (
          <li key={x} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.45 }}>
            <Check size={16} color={palette.PURPLE_STRONG} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} /> {x}
          </li>
        ))}
      </ul>
      <div role="radiogroup" aria-label={`${door.title} plans`} style={{ display: 'grid', gap: 10, marginTop: 'auto', paddingTop: 6 }}>
        {door.plans.map((id) => {
          const p = product(id);
          const on = selected === id;
          return (
            <button key={id} type="button" role="radio" aria-checked={on} onClick={() => onPick(id)} className="pr-opt"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 56, padding: '10px 16px', borderRadius: 16,
                cursor: 'pointer', textAlign: 'left', fontFamily: SANS, color: palette.INK,
                background: on ? (palette.isDark ? 'rgba(191,176,189,0.14)' : 'rgba(105,94,104,0.08)') : 'transparent',
                border: `${on ? 2 : 1}px solid ${on ? palette.PURPLE_STRONG : palette.BORDER}` }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3 }}>{optionLabel(id, door)}</span>
              <span style={{ fontSize: 16, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {priceOf(id)}<span style={{ fontSize: 12.5, fontWeight: 500, color: palette.INK2 }}>{PER[p.billing]}</span>
              </span>
            </button>
          );
        })}
      </div>
      {door.extra && (
        <p style={{ margin: 0, fontSize: 13, color: palette.INK2 }}>
          {door.extra.label}{' '}
          <button type="button" onClick={() => onPick(door.extra!.id)}
            style={{ background: 'none', border: 'none', padding: 0, color: palette.PURPLE_STRONG, fontWeight: 700, cursor: 'pointer', fontFamily: SANS, fontSize: 13, textDecoration: 'underline' }}>
            {priceOf(door.extra.id)} once
          </button>
        </p>
      )}
    </section>
  );
}

interface Details { name: string; email: string; phone: string }

/** Other plans worth adding to this order: the default plan of each other door, skipping anything this plan already includes. */
function upsells(id: string): string[] {
  const have = new Set(product(id).unlocks);
  return DOORS.map((d) => d.plans[0]).filter((pid) => pid !== id && product(pid).name !== product(id).name && !product(pid).unlocks.every((u) => have.has(u))
    && !Array.from(have).every((u) => product(pid).unlocks.includes(u))); // not already included, and not something that makes this plan redundant
}

function Checkout({ palette, id, user, onClose, queued, onAdd, onRemove, onNext, prefill, onDetails }: {
  palette: Palette; id: string; user: User | null; onClose: () => void;
  queued: string[]; onAdd: (id: string) => void; onRemove: (id: string) => void; onNext: (id: string, d: Details) => void;
  prefill: Details | null; onDetails: (d: Details) => void;
}) {
  const p = product(id);
  const { checkOut, isProcessing } = useRazorpay();
  const { renderCheckout, isAvailable: paypalAvailable } = usePaypal();
  const [name, setName] = useState(prefill?.name || user?.displayName || '');
  const [email, setEmail] = useState(prefill?.email || user?.email || '');
  const [phone, setPhone] = useState(prefill?.phone || '');
  const [done, setDone] = useState(false);
  const emailOk = email.includes('@') && !!email.split('@')[1]?.includes('.');
  const phoneOk = phone.replace(/\D/g, '').length >= 8;
  // Email and phone are both required: access is opened by signing in with this email,
  // and we use the phone for WhatsApp support and kids class scheduling.
  const ready = name.trim().length > 0 && emailOk && phoneOk;
  const amount = isPwyw(id) ? p.price[CURRENCY] : undefined;
  const uid = user && !user.isAnonymous ? user.uid : 'guest_pending';
  const paid = () => { t('PRICING_PAID', id); onDetails({ name, email, phone }); setDone(true); };
  const addable = upsells(id).filter((x) => !queued.includes(x) && !queued.some((q) => product(q).name === product(x).name));

  useEffect(() => {
    if (!ready || done) return;
    const timer = setTimeout(() => {
      renderCheckout('pricing-paypal', uid, email.trim(), id, CURRENCY, paid, phone.trim(), amount);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ready, name, email, phone]);

  const input: React.CSSProperties = { width: '100%', minHeight: 48, borderRadius: 14, border: `1px solid ${palette.BORDER}`, background: palette.BG,
    color: palette.INK, fontFamily: SANS, fontSize: 16, padding: '10px 14px', boxSizing: 'border-box' };
  const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: palette.INK2, marginBottom: 6 };

  return (
    <div id="pricing-checkout" style={{ background: palette.CARD, border: `2px solid ${palette.PURPLE_STRONG}`, borderRadius: 28, padding: 'clamp(20px, 3vw, 28px)', fontFamily: SANS, color: palette.INK }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.BROWN }}>Your order</span>
          <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 500, margin: '4px 0 2px' }}>{p.name}</h2>
          <p style={{ margin: 0, fontSize: 14, color: palette.INK2 }}>{p.pitch}</p>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: palette.INK2, fontSize: 13.5, textDecoration: 'underline', cursor: 'pointer', minHeight: 44 }}>Change</button>
      </div>

      {done ? (
        <div role="status" style={{ marginTop: 16, padding: 18, borderRadius: 18, background: palette.BAND, color: palette.ON_BAND, lineHeight: 1.6 }}>
          <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>Thank you. Your payment is confirmed.</strong>
          {uid === 'guest_pending'
            ? <>One last step: <strong>sign in with {email}</strong> to open what you bought. Your purchase is saved to this email, so it unlocks the moment you sign in, on any device.</>
            : <>It is unlocked on your account ({email}) now.</>}
          {queued.length > 0 ? (
            <>
              <button type="button" onClick={() => onNext(queued[0], { name, email, phone })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 48, marginTop: 14, padding: '0 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 15,
                  background: palette.ON_BAND, color: palette.BAND, fontWeight: 800 }}>
                Next: pay for {product(queued[0]).name} · {priceOf(queued[0])} →
              </button>
              <p style={{ margin: '8px 0 0', fontSize: 13 }}>Your details are filled in. {queued.length > 1 ? `${queued.length} more to go.` : 'This is the last one.'}</p>
            </>
          ) : (
            <a href={uid === 'guest_pending' ? '/mindgym?claim=1' : '/mindgym'}
              style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, marginTop: 12, padding: '0 20px', borderRadius: 999,
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontWeight: 700, textDecoration: 'none' }}>
              {uid === 'guest_pending' ? 'Sign in to access →' : 'Open Mind Gym →'}
            </a>
          )}
        </div>
      ) : (
        <>
          {uid === 'guest_pending' && (
            <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.55, color: palette.INK2 }}>
              After paying you will sign in with this email to access it. Already have an account? <a href="/mindgym?claim=1" style={{ color: palette.PURPLE_STRONG, fontWeight: 700 }}>Sign in first</a>.
            </p>
          )}
          <dl style={{ margin: '16px 0 12px', padding: '14px 16px', borderRadius: 16, border: `1px dashed ${palette.BORDER}`, display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 12px', fontSize: 14.5 }}>
            <dt style={{ color: palette.INK2 }}>{p.name}{p.billing !== 'once' ? ` (${p.billing === 'month' ? 'one month' : 'one year'})` : ''}</dt>
            <dd style={{ margin: 0 }}>{wasOf(id) && <s style={{ color: palette.INK2, marginRight: 8 }}>{wasOf(id)}</s>}{priceOf(id)}</dd>
            <dt style={{ fontWeight: 700, paddingTop: 8, borderTop: `1px solid ${palette.BORDER}` }}>Amount to pay now</dt>
            <dd style={{ margin: 0, fontWeight: 700, paddingTop: 8, borderTop: `1px solid ${palette.BORDER}` }}>{priceOf(id)}</dd>
          </dl>
          {queued.length > 0 && (
            <div style={{ margin: '0 0 12px', padding: '12px 16px', borderRadius: 16, background: palette.isDark ? 'rgba(191,176,189,0.10)' : 'rgba(105,94,104,0.06)' }}>
              <p style={{ margin: '0 0 8px', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: palette.BROWN }}>Added, paid next</p>
              {queued.map((q) => (
                <div key={q} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 14, minHeight: 36 }}>
                  <span><strong>{product(q).name}</strong>{product(q).billing !== 'once' ? ` (${product(q).billing === 'month' ? 'one month' : 'one year'})` : ''}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{priceOf(q)}{' '}
                    <button type="button" onClick={() => onRemove(q)} aria-label={`Remove ${product(q).name}`}
                      style={{ marginLeft: 6, background: 'none', border: 'none', color: palette.INK2, textDecoration: 'underline', cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, minHeight: 32 }}>Remove</button>
                  </span>
                </div>
              ))}
              <p style={{ margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.5, color: palette.INK2 }}>Each plan is paid for separately. After this payment we open the next one for you, with your details filled in.</p>
            </div>
          )}
          {addable.length > 0 && (
            <div style={{ margin: '0 0 16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: palette.INK }}>Add to your order</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {addable.map((x) => (
                  <button key={x} type="button" onClick={() => { t('PRICING_ADD', x); onAdd(x); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '10px 14px', borderRadius: 14, cursor: 'pointer', fontFamily: SANS, color: palette.INK,
                      background: 'transparent', border: `1px solid ${palette.BORDER}` }}>
                    <span aria-hidden="true" style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontSize: 20, lineHeight: 1 }}>+</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{product(x).name}</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: palette.INK2, lineHeight: 1.4 }}>{product(x).pitch}</span>
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap' }}>{priceOf(x)}<span style={{ fontSize: 11.5, fontWeight: 500, color: palette.INK2 }}>{PER[product(x).billing]}</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gap: 12 }}>
            <label><span style={label}>Your name</span><input style={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
            <label><span style={label}>Email{uid !== 'guest_pending' ? ' (your account)' : ' (use this email to sign in later)'}</span>
              <input style={input} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" readOnly={uid !== 'guest_pending'} /></label>
            <label><span style={label}>WhatsApp / phone number</span><input style={input} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
          </div>
          <button type="button" disabled={!ready || isProcessing}
            onClick={() => { t('PRICING_PAY_CLICK', id); checkOut(uid, email.trim(), name.trim(), id, CURRENCY, paid, phone.trim(), amount); }}
            style={{ width: '100%', minHeight: 52, marginTop: 16, borderRadius: 999, border: 'none', fontFamily: SANS, fontSize: 16, fontWeight: 700,
              background: ready ? palette.PURPLE_STRONG : palette.BORDER, color: ready ? palette.ON_ACCENT : palette.INK2, cursor: ready ? 'pointer' : 'not-allowed',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {isProcessing ? <><Loader2 size={17} className="animate-spin" /> Opening secure payment…</> : `Proceed to pay ${priceOf(id)}`}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: palette.INK2, margin: '10px 0 0' }}>
            {ready ? 'UPI, cards, net banking and wallets by Razorpay, or pay below.' : 'Enter your name, email and phone number to continue.'}
          </p>
          {ready && paypalAvailable !== false && <div id="pricing-paypal" style={{ marginTop: 12 }} />}
          <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '14px 0 0', fontSize: 13, lineHeight: 1.55, color: palette.INK2 }}>
            <ShieldCheck size={17} color={palette.PURPLE_STRONG} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{refundOf(id)} {p.billing !== 'once' && 'One-time payment for this period; it does not renew by itself. '}See our <a href="/policies#refund" style={{ color: palette.PURPLE_STRONG }}>refund policy</a>.</span>
          </p>
        </>
      )}
    </div>
  );
}

export default function PricingPage() {
  const { palette, toggle } = useSiteTheme();
  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<string | null>(() => {
    const s = new URLSearchParams(window.location.search).get('select');
    return s && PRODUCTS.some((p) => p.id === s) ? canonicalId(s) : null;
  });
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [queued, setQueued] = useState<string[]>([]);
  const [details, setDetails] = useState<Details | null>(null);

  useEffect(() => onAuthStateChanged(getAuth(), setUser), []);
  useEffect(() => { t('PAGE_VISIT_PRICING', selected || ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selected) setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [selected]);

  usePageSeo({
    title: 'Pricing: Adult Mind Gym, Kids Mind Gym, Mantras & Music | SKRM Bliss AI',
    description: 'Three simple plans: Adult Mind Gym for you, Kids Mind Gym for your child, and the Mantra Pass for mantras and meditation music.',
    url: 'https://www.skrmblissai.in/pricing',
  });

  const pick = (id: string) => {
    t('PRICING_PICK', id);
    setQueued([]);
    setSelected(id);
    const url = new URL(window.location.href); url.searchParams.set('select', id); window.history.replaceState({}, '', url);
  };

  const sec: React.CSSProperties = { padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 40px)' };
  const wrap: React.CSSProperties = { maxWidth: 1140, margin: '0 auto' };

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden' }}>
      <SiteHeader palette={palette} onToggleTheme={toggle}
        links={siteNav()}
        cta={null} />

      <nav aria-label="Back" style={{ ...wrap, padding: '10px clamp(16px, 4vw, 40px) 0' }}>
        <a href="/" onClick={(e) => { if (document.referrer.startsWith(window.location.origin) && window.history.length > 1) { e.preventDefault(); window.history.back(); } }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, color: palette.PURPLE_STRONG, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          <span aria-hidden="true">←</span> Back
        </a>
      </nav>

      <header style={{ ...sec, paddingTop: 'clamp(16px, 3vw, 32px)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(36px, 5.4vw, 58px)', fontWeight: 400, lineHeight: 1.08, margin: '0 auto 12px', maxWidth: 760 }}>
          Who is this for?
        </h1>
        <p style={{ fontSize: 16.5, lineHeight: 1.65, color: palette.INK2, margin: '0 auto', maxWidth: 560 }}>
          Choose one plan. Each is complete on its own.
        </p>
      </header>

      {/* The three doors, each with its plans */}
      <div id="plans" style={{ ...sec, paddingTop: 0, scrollMarginTop: 90 }}>
        <div className="pr-doors" style={wrap}>
          {DOORS.map((d) => <DoorColumn key={d.id} palette={palette} door={d} selected={selected} onPick={pick} />)}
        </div>
      </div>

      {/* Checkout appears here once something is chosen */}
      <div ref={checkoutRef} style={{ scrollMarginTop: 90 }}>
        {selected && (
          <section style={{ ...sec, paddingTop: 0 }}>
            <div style={{ ...wrap, maxWidth: 620 }}>
              <Checkout key={selected} palette={palette} id={selected} user={user} onClose={() => { setSelected(null); setQueued([]); }}
                queued={queued} onAdd={(x) => setQueued((q) => [...q, x])} onRemove={(x) => setQueued((q) => q.filter((y) => y !== x))}
                onNext={(x, d) => { setDetails(d); setQueued((q) => q.slice(1)); setSelected(x); const u = new URL(window.location.href); u.searchParams.set('select', x); window.history.replaceState({}, '', u); }}
                prefill={details} onDetails={setDetails} />
            </div>
          </section>
        )}
      </div>

      <section style={{ ...sec, paddingTop: 0, textAlign: 'center', paddingBottom: 'clamp(48px, 6vw, 80px)' }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: palette.INK2, margin: '0 0 6px' }}>
          Want all three for life? <button type="button" onClick={() => pick('all_access')}
            style={{ background: 'none', border: 'none', padding: 0, color: palette.PURPLE_STRONG, fontWeight: 700, cursor: 'pointer', fontFamily: SANS, fontSize: 14.5, textDecoration: 'underline' }}>
            All Access, {priceOf('all_access')} once</button>.
        </p>
        <p style={{ fontSize: 14.5, color: palette.INK2, margin: 0 }}>
          Questions before you choose? <a href="https://wa.me/918217581238" target="_blank" rel="noopener noreferrer" style={{ color: palette.PURPLE_STRONG, fontWeight: 700 }}>Message us on WhatsApp</a>.
        </p>
      </section>

      <SiteFooter palette={palette} />

      <style>{`
        .pr-doors { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: stretch; }
        .pr-opt { transition: border-color .2s ease, background .2s ease; }
        .pr-opt:hover { border-color: ${palette.PURPLE_STRONG} !important; }
        @media (max-width: 900px) { .pr-doors { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .pr-opt { transition: none; } }
      `}</style>
    </div>
  );
}
