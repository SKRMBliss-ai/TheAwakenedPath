/**
 * KidsChallengeRegister.tsx — /kidschallenge/register
 *
 * Parent/guardian registration form for the kids challenge. Front-end capture
 * only (mirrors the AboutJournal/EmotionalHealthCheck waitlist pattern): the
 * submission is written to the `waitlist` Firestore collection, allow-listed
 * for exactly these fields in firestore.rules, and the team follows up with
 * Zoom details by email/WhatsApp.
 */
import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import KidsBackdrop from '../../components/site/KidsBackdrop';
import {
  KIDS_PATH, KIDS_TITLE, KIDS_FORMAT, KIDS_TIME, KIDS_GOALS, KIDS_AGE_OPTIONS,
  trackKids,
} from './kidsChallengeData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

export default function KidsChallengeRegister() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const border = palette.BORDER;
  const cardBg = palette.CARD;

  usePageSeo({
    title: `Register | ${KIDS_TITLE}`,
    description: 'Reserve your child\'s place in the 3-day live kids challenge — Friday to Sunday on Zoom.',
    url: 'https://www.skrmblissai.in/kidschallenge/register',
    image: 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2Fposter.png?alt=media',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    trackKids('PAGE_VISIT_KIDS_REGISTER', '/kidschallenge/register');
  }, []);

  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [timezone, setTimezone] = useState('');
  const [goal, setGoal] = useState(KIDS_GOALS[0]);
  const [notes, setNotes] = useState('');
  const [confirmGuardian, setConfirmGuardian] = useState(false);
  const [confirmSupervision, setConfirmSupervision] = useState(false);
  const [confirmNoSensitive, setConfirmNoSensitive] = useState(false);
  const [confirmComms, setConfirmComms] = useState(false);
  const [optInFuture, setOptInFuture] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmGuardian || !confirmSupervision || !confirmNoSensitive || !confirmComms) {
      setErrorMsg('Please confirm all the required boxes below before submitting.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'waitlist'), {
        email: email.trim().toLowerCase(),
        parentName: parentName.trim(),
        phone: phone.trim(),
        country: country.trim(),
        childName: childName.trim(),
        age: age.trim(),
        timezone: timezone.trim(),
        goal: goal,
        notes: notes.trim(),
        source: 'kids_challenge_registration',
        type: 'kids_challenge',
        mailingList: optInFuture,
        createdAt: serverTimestamp(),
      });
      trackKids('KIDS_REGISTRATION_SUBMIT', '/kidschallenge/register', `${childName} · age ${age} · ${goal}`);
      setStatus('done');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      console.error('Kids challenge registration failed:', err);
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${border}`, font: 'inherit', fontFamily: SANS,
    background: palette.BG, color: palette.INK,
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: SANS, fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 6, color: palette.INK,
  };

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK }}>
      <KidsBackdrop />
      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[{ label: 'Challenge details', href: KIDS_PATH }, { label: 'Home', href: '/' }]}
        cta={{ label: '← Back to challenge', href: KIDS_PATH }}
      />

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 2 }}>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 26, padding: 'clamp(24px, 4vw, 40px)' }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 400, color: palette.INK, margin: '0 0 6px' }}>
            🌈 Reserve Your Child&rsquo;s Place
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: palette.BROWN, margin: '0 0 12px' }}>
            {KIDS_TITLE} — 3-Day Kids Challenge
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14.5, color: palette.INK2, margin: '0 0 24px' }}>
            {KIDS_FORMAT} · {KIDS_TIME}
          </p>

          <div style={{
            background: 'rgba(196,145,58,0.12)', border: `1px solid ${border}`, borderRadius: 14,
            padding: '14px 18px', fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: palette.INK2, marginBottom: 12,
          }}>
            <strong style={{ color: palette.INK }}>Parent/Guardian registration required.</strong> After registration, we send Zoom details and preparation instructions by email/WhatsApp.
          </div>
          
          <div style={{
            background: palette.isDark ? 'rgba(155, 110, 204, 0.12)' : 'rgba(120, 60, 180, 0.05)', 
            border: `1px solid ${palette.isDark ? 'rgba(155, 110, 204, 0.2)' : 'rgba(120, 60, 180, 0.15)'}`, 
            borderRadius: 14,
            padding: '14px 18px', fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: palette.INK2, marginBottom: 26,
          }}>
            <strong style={{ color: palette.INK }}>Donation Based Course.</strong> This course is purely donation-based (you can donate anywhere from $2 to $99). We will send the payment link directly to you over email and WhatsApp after you register.
          </div>

          <form onSubmit={handleSubmit}>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: palette.INK, margin: '0 0 16px' }}>Parent / Guardian</h2>
            <div className="si-kids-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
              <div><label style={labelStyle} htmlFor="parentName">Parent / Guardian Name *</label><input id="parentName" required style={inputStyle} value={parentName} onChange={(e) => setParentName(e.target.value)} /></div>
              <div><label style={labelStyle} htmlFor="pEmail">Email Address *</label><input id="pEmail" type="email" required style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><label style={labelStyle} htmlFor="phone">WhatsApp / Mobile Number *</label><input id="phone" required style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div><label style={labelStyle} htmlFor="country">Country *</label><input id="country" required style={inputStyle} value={country} onChange={(e) => setCountry(e.target.value)} /></div>
            </div>

            <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: palette.INK, margin: '24px 0 16px' }}>Child</h2>
            <div className="si-kids-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelStyle} htmlFor="childName">Child&rsquo;s First Name *</label><input id="childName" required style={inputStyle} value={childName} onChange={(e) => setChildName(e.target.value)} /></div>
              <div>
                <label style={labelStyle} htmlFor="age">Child&rsquo;s Age *</label>
                <select id="age" required style={inputStyle} value={age} onChange={(e) => setAge(e.target.value)}>
                  <option value="">Select age</option>
                  {KIDS_AGE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div><label style={labelStyle} htmlFor="timezone">Child&rsquo;s Time Zone *</label><input id="timezone" required placeholder="e.g. India / UK / Eastern US" style={inputStyle} value={timezone} onChange={(e) => setTimezone(e.target.value)} /></div>
              <div>
                <label style={labelStyle} htmlFor="goal">Main goal</label>
                <select id="goal" style={inputStyle} value={goal} onChange={(e) => setGoal(e.target.value)}>
                  {KIDS_GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle} htmlFor="notes">Anything you&rsquo;d like the facilitator to know? (Optional)</label>
                <textarea id="notes" style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: palette.INK, margin: '24px 0 12px' }}>Parent / Guardian Confirmation</h2>
            {[
              { checked: confirmGuardian, set: setConfirmGuardian, label: 'I confirm that I am the parent or legal guardian of the child named above and give permission for my child to participate.' },
              { checked: confirmSupervision, set: setConfirmSupervision, label: "I understand that a parent/guardian remains responsible for my child's participation and supervision during the online session." },
              { checked: confirmNoSensitive, set: setConfirmNoSensitive, label: 'I understand that children will not be required to share private or sensitive personal information during the session.' },
              { checked: confirmComms, set: setConfirmComms, label: 'I agree to receive essential challenge information and reminders by email/WhatsApp.' },
            ].map((c, i) => (
              <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '10px 0', fontFamily: SANS, fontSize: 13.5, color: palette.INK2, fontWeight: 400 }}>
                <input type="checkbox" required checked={c.checked} onChange={(e) => c.set(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
                {c.label}
              </label>
            ))}
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '10px 0', fontFamily: SANS, fontSize: 13.5, color: palette.INK2, fontWeight: 400 }}>
              <input type="checkbox" checked={optInFuture} onChange={(e) => setOptInFuture(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
              I would like to receive occasional information about future Soulful Intelligence Studio children&rsquo;s programs.
            </label>

            {status === 'error' && (
              <p style={{ color: '#B42318', fontFamily: SANS, fontSize: 13, marginTop: 10 }}>{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                width: '100%', border: 0, borderRadius: 14,
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
                padding: '16px', fontSize: 16, fontWeight: 800, fontFamily: SANS,
                cursor: status === 'submitting' ? 'wait' : 'pointer', marginTop: 20,
                opacity: status === 'submitting' ? 0.7 : 1,
              }}
            >
              {status === 'submitting' ? 'Reserving…' : "YES! RESERVE MY CHILD'S PLACE 🌈"}
            </button>
          </form>

          {status === 'done' && (
            <div style={{
              marginTop: 22, background: 'rgba(52,168,83,0.10)', border: '1px solid rgba(52,168,83,0.35)',
              borderRadius: 16, padding: '20px', fontFamily: SANS,
            }}>
              <strong style={{ color: palette.INK }}>Thank you! 🌟</strong>
              <p style={{ color: palette.INK2, fontSize: 14, lineHeight: 1.6, margin: '8px 0 0' }}>
                Your registration has been received. You&rsquo;ll get an email/WhatsApp with the Zoom link, session schedule and a short preparation note shortly.
              </p>
            </div>
          )}
        </div>
      </main>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteFooter palette={palette} />
      </div>

      <style>{`
        @media (max-width: 650px) {
          .si-kids-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
