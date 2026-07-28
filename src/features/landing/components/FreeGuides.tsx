/**
 * FreeGuides.tsx
 * Redesigned free guide cards — matching the warm editorial aesthetic.
 * Reuses existing lead-capture logic from the original SoulfulHome.
 */
import { useState } from 'react';
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const GUIDE_COVER = (file: string) =>
  `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2FFreeGuides%2F${file}?alt=media`;

const LOG_URL = 'https://us-central1-awakened-path-2026.cloudfunctions.net/logWebActivity';

interface Guide {
  eyebrow: string;
  title: string;
  subtitle: string;
  cover: string | null;
  href: string | null;
  accent: string;
}

const GUIDES: Guide[] = [
  {
    eyebrow: 'Free Guide · Presence',
    title: 'Living in the Now',
    subtitle: "A plain-English guide to the key ideas of Eckhart Tolle\u2019s The Power of Now.",
    cover: GUIDE_COVER('living-in-the-now.webp'),
    href: GUIDE_COVER('Living-in-the-Now%20(1).pdf'),
    accent: '#8C7B9E',
  },
  {
    eyebrow: 'Free Guide · Letting Go',
    title: 'Set Yourself Free',
    subtitle: "The core practices from Michael Singer\u2019s The Untethered Soul, made simple.",
    cover: GUIDE_COVER('SetYourSelfFree.webp'),
    href: GUIDE_COVER('Set-Yourself-Free%20(1).pdf'),
    accent: '#9E8C6B',
  },
  {
    eyebrow: 'Free Guide · Emotions',
    title: 'Understanding Your Emotions',
    subtitle: 'A gentle starter guide — the first ideas from the Feelings & Emotions course.',
    cover: GUIDE_COVER('UnderstandingEmotions.webp'),
    href: GUIDE_COVER('Understanding-Feelings-and-Emotions.pdf'),
    accent: '#6B8C9E',
  },
  {
    eyebrow: 'Free Guide · Practice',
    title: 'Daily Practice Starter Kit',
    subtitle: 'Begin your daily practice — 5-minute rituals for presence, clarity and calm.',
    cover: null,
    href: GUIDE_COVER('Daily-Practice-Starter-Kit.pdf'),
    accent: '#8C6B7E',
  },
];

const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneValid = (v: string) => v.replace(/\D/g, '').length >= 8;

function captureLead(email: string, phone: string, title: string) {
  try {
    fetch(LOG_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action: 'GUIDE_LEAD', page: '/', details: `guide: ${title} | phone: ${phone}`, source: document.referrer || 'direct' }),
    }).catch(() => {});
  } catch (_) { /* silent */ }
}

function GuideCard({ guide, palette }: { guide: Guide; palette: Palette }) {
  const [step, setStep] = useState<'idle' | 'form' | 'done'>('idle');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#9C8B78';
  const bg     = isDark ? 'rgba(30,24,18,0.72)' : 'rgba(249,245,239,0.92)';
  const bdColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(196,181,160,0.35)';
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13.5,
    border: `1px solid ${bdColor}`, background: 'transparent', color: ink,
    outline: 'none', fontFamily: SANS,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid(email)) { setErr('Please enter a valid email.'); return; }
    if (!phoneValid(phone)) { setErr('Please enter a valid phone number.'); return; }
    setErr('');
    captureLead(email.trim(), phone.trim(), guide.title);
    setStep('done');
    if (guide.href) {
      try {
        window.open(guide.href, '_blank', 'noopener,noreferrer');
      } catch (_) {}
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: bg, border: `1px solid ${bdColor}`,
      borderRadius: 20, overflow: 'hidden',
      transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease',
      boxShadow: '0 8px 40px rgba(60,40,20,0.07)',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(60,40,20,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(60,40,20,0.07)'; }}
    >
      {/* Cover */}
      <div style={{
        position: 'relative', aspectRatio: '3/2', overflow: 'hidden',
        background: guide.cover ? (isDark ? '#1A1018' : '#EDE0CC')
          : `linear-gradient(135deg, ${guide.accent}22 0%, ${guide.accent}44 100%)`,
      }}>
        {guide.cover ? (
          <img src={guide.cover} alt={guide.title} loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.background =
                `linear-gradient(135deg, ${guide.accent}22 0%, ${guide.accent}44 100%)`;
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          /* Geometric placeholder */
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <circle cx="40" cy="40" r="36" stroke={guide.accent} strokeWidth="1" opacity="0.5" />
              <circle cx="40" cy="40" r="24" stroke={guide.accent} strokeWidth="1" opacity="0.4" />
              <circle cx="40" cy="40" r="12" stroke={guide.accent} strokeWidth="1" opacity="0.6" fill={`${guide.accent}20`} />
              <path d="M40 4 L40 76 M4 40 L76 40 M12.5 12.5 L67.5 67.5 M67.5 12.5 L12.5 67.5" stroke={guide.accent} strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>
        )}
        {/* Eyebrow overlay */}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)',
        }}>
          {guide.eyebrow}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: ink, margin: 0, lineHeight: 1.2 }}>
          {guide.title}
        </h3>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: inkSub, margin: 0, lineHeight: 1.6 }}>
          {guide.subtitle}
        </p>

        {step === 'idle' && (
          <button
            onClick={() => setStep('form')}
            style={{
              marginTop: 'auto', alignSelf: 'flex-start',
              padding: '9px 18px', borderRadius: 999, cursor: 'pointer',
              border: 'none', background: guide.accent, color: '#fff',
              fontFamily: SANS, fontSize: 12.5, fontWeight: 800,
              transition: 'filter 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
            aria-label={`Get free PDF: ${guide.title}`}
          >
            Download Free →
          </button>
        )}

        {step === 'form' && (
          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <p style={{ fontFamily: SANS, fontSize: 12, color: inkSub, margin: 0, fontWeight: 600 }}>Where should we send it?</p>
            <input type="email" inputMode="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} aria-label="Email address" />
            <input type="tel" inputMode="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} aria-label="Phone number" />
            {err && <span style={{ fontFamily: SANS, fontSize: 11.5, color: '#B4453B', fontWeight: 700 }}>{err}</span>}
            <button type="submit" style={{
              padding: '10px 18px', borderRadius: 999, cursor: 'pointer', border: 'none',
              background: guide.accent, color: '#fff', fontFamily: SANS, fontSize: 13, fontWeight: 800,
            }}>
              Get my free PDF →
            </button>
            <span style={{ fontFamily: SANS, fontSize: 10, color: inkSub }}>No spam — occasional emails you can leave any time.</span>
          </form>
        )}

        {step === 'done' && (
          guide.href ? (
            <a href={guide.href} target="_blank" rel="noopener noreferrer" download style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 999,
              background: guide.accent, color: '#fff',
              fontFamily: SANS, fontSize: 12.5, fontWeight: 800, textDecoration: 'none', alignSelf: 'flex-start',
            }}>
              ↓ Download PDF
            </a>
          ) : (
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: ink, margin: 0, fontWeight: 700, lineHeight: 1.5 }}>
              You're on the list — we'll email this guide to you shortly. ✓
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default function FreeGuides({ palette }: { palette: Palette }) {
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#9C8B78';

  return (
    <section
      className="si-reveal"
      style={{ padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 2 }}
    >
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#9C8B78', marginBottom: 14 }}>
          Complimentary
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, color: ink, marginBottom: 10, letterSpacing: '-0.01em' }}>
          Free resources for your journey
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 14, color: inkSub, maxWidth: 400, margin: '0 auto' }}>
          Thoughtfully created guides to support your growth.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20, maxWidth: 1100, margin: '0 auto',
      }}>
        {GUIDES.map((g, i) => <GuideCard key={i} guide={g} palette={palette} />)}
      </div>
    </section>
  );
}
