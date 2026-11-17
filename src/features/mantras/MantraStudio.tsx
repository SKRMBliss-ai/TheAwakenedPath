// ─────────────────────────────────────────────────────────────────────────────
// Soulful Mantra Studio — /mantras (library hub) and /mantras/<slug> (one mantra).
//
// The funnel: free library (text, meaning, our YouTube recording) → one paid
// product, the Sadhana Lifetime Pass (ad-free loop play in playlists + PDFs + sadhana plans).
// All catalogue and price data lives in mantraData.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { BookOpen, Repeat, ListMusic, FileText, Bell, MessageCircle, ShieldCheck, Sunrise, Play, Pause, Youtube, Volume2, VolumeX, Music2 } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { track } from '../../lib/analytics';
import { useSiteTheme, type Palette } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter, SERIF, SANS } from '../../components/site/SiteChrome';
import { useRazorpay } from '../../hooks/useRazorpay';
import { usePaypal } from '../../hooks/usePaypal';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';
import {
  MANTRAS, MOMENTS, DEITIES, MANTRA_FAQ, PASS_INCLUDES, MANTRA_BASE_URL, MANTRA_SUBSCRIBE_URL,
  MANTRA_WHATSAPP, MANTRA_PASS_ID,MANTRA_PASS_OPEN, MANTRA_PASS_REFUND_DAYS, MANTRA_PRICE_RISE, MANTRA_CURRENCY,
  passPrice, passRegularPrice, findMantra, thumb, waLink, getMantraAudioUrl, type Mantra, type Moment,
} from './mantraData';

const DEVA = "'Noto Serif Devanagari', 'Tiro Devanagari Sanskrit', 'Nirmala UI', 'Mangal', serif";
const PAGE = '/mantras';
const MANTRA_BRAND = {
  name: 'Soulful Mantra Studio',
  tagline: 'Where sacred sound meets stillness',
  logoLight: '/marketing/mantras/logo-light.webp',
  logoDark: '/marketing/mantras/logo-dark.webp',
  href: PAGE,
};
const PASS_PATH = `${PAGE}/lifetime-pass`;
const ORDER_PATH = `${PASS_PATH}/checkout`;
const GOLD_BAR = 'linear-gradient(135deg, #E9C98A 0%, #D8AE5E 50%, #EBD29C 100%)';
const BRAND_VIDEO = '/marketing/mantras/soulful-mantra-studio.mp4';
const t = (action: string, details = '') => track(action, details, PAGE);

function Kicker({ palette, children }: { palette: Palette; children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
      color: palette.BROWN, display: 'block', marginBottom: 10 }}>{children}</span>
  );
}

// Brand artwork (transparent webp, gold on any background).
const ART = {
  emblem: { src: '/marketing/mantras/emblem-sunburst.webp', w: 560, h: 424 },
  bowl: { src: '/marketing/mantras/bowl-lotus.webp', w: 560, h: 505 },
  namaste: { src: '/marketing/mantras/namaste.webp', w: 420, h: 581 },
  lockup: { src: '/marketing/mantras/lockup.webp', w: 720, h: 502 },
  subscribe: { src: '/marketing/mantras/subscribe-badge.webp', w: 760, h: 293 },
  subscribeLight: { src: '/marketing/mantras/subscribe-badge-light.webp', w: 760, h: 293 },
  subscribeDark: { src: '/marketing/mantras/subscribe-badge-dark.webp', w: 760, h: 293 },
};
type ArtKey = keyof typeof ART;

/** Decorative brand art, sized by height. */
function Art({ name, height, style }: { name: ArtKey; height: number; style?: React.CSSProperties }) {
  const a = ART[name];
  return <img src={a.src} alt="" aria-hidden="true" loading="lazy" decoding="async" width={a.w} height={a.h}
    style={{ height, width: 'auto', maxWidth: '100%', display: 'block', ...style }} />;
}

function SectionTitle({ palette, kicker, title, sub, art, artHeight = 84 }: {
  palette: Palette; kicker: string; title: string; sub?: string; art?: ArtKey; artHeight?: number;
}) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto 30px', textAlign: 'center' }}>
      {art && <Art name={art} height={artHeight} style={{ margin: '0 auto 14px' }} />}
      <Kicker palette={palette}>{kicker}</Kicker>
      <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, lineHeight: 1.15, color: palette.INK, margin: '0 0 10px' }}>{title}</h2>
      {sub && <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.65, color: palette.INK2, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function Btn({ palette, href, label, event, ghost = false, external = false }: {
  palette: Palette; href: string; label: React.ReactNode; event: string; ghost?: boolean; external?: boolean;
}) {
  return (
    <a href={href} onClick={() => t(event)} className="sms-btn"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, padding: '12px 26px',
        borderRadius: 999, textDecoration: 'none', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        background: ghost ? 'transparent' : palette.PURPLE_STRONG, color: ghost ? palette.PURPLE_STRONG : palette.ON_ACCENT,
        border: `1.5px solid ${palette.PURPLE_STRONG}`,
      }}>{label}</a>
  );
}

function MantraCard({ palette, m }: { palette: Palette; m: Mantra }) {
  const { status, category, trackId } = useVoiceStatus();
  const isPlaying = status === 'playing' && category === 'music' && trackId === m.slug;

  const quickPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    t('MANTRA_QUICK_PLAY', m.slug);
    if (isPlaying) {
      VoiceService.pause();
    } else if (status === 'paused' && trackId === m.slug) {
      VoiceService.resume('music');
    } else {
      VoiceService.playAudioURL(m.audioUrl || getMantraAudioUrl(m.slug), {
        trackId: m.slug,
        loop: true,
        category: 'music',
      });
    }
  };

  return (
    <a href={`${PAGE}/${m.slug}`} className="sms-card" onClick={() => t('MANTRA_CARD_CLICK', m.slug)}
      style={{ display: 'flex', flexDirection: 'column', background: palette.CARD, border: `1px solid ${palette.BORDER}`,
        borderRadius: 22, overflow: 'hidden', textDecoration: 'none', color: palette.INK }}>
      <span style={{ position: 'relative', display: 'block', aspectRatio: '16 / 9', background: palette.BG2, overflow: 'hidden' }}>
        <img src={m.videos && m.videos[0] ? thumb(m.videos[0].id) : (m.cover || '/marketing/mantras/emblem-sunburst.webp')} alt="" loading="lazy" width={480} height={270}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <button
          type="button"
          onClick={quickPlay}
          aria-label={isPlaying ? `Pause chant ${m.name}` : `Play chant ${m.name}`}
          style={{
            position: 'absolute', right: 12, bottom: 12,
            width: 38, height: 38, borderRadius: '50%',
            background: isPlaying ? palette.PURPLE_STRONG : 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s ease, background 0.2s ease',
            zIndex: 2,
          }}
          className="sms-btn"
          title={isPlaying ? 'Pause chant' : 'Play continuous chant'}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />}
        </button>
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 18px 18px', flex: 1 }}>
        <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.BROWN }}>{m.deity}</span>
        <strong style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, lineHeight: 1.2 }}>{m.name}</strong>
        <span lang="sa" style={{ fontFamily: DEVA, fontSize: 15, lineHeight: 1.6, color: palette.INK2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.devanagari[0]}</span>
        <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: palette.INK2 }}>{m.blurb}</span>
        <span style={{ marginTop: 'auto', paddingTop: 8, fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: palette.PURPLE_STRONG }}>
          Text, meaning and chant →
        </span>
      </span>
    </a>
  );
}

/** Soundscape Chanting Player for the single chant loop (plays without ads; download disabled). */
function MantraSoundscapePlayer({ palette, m }: { palette: Palette; m: Mantra }) {
  const { status, category, trackId } = useVoiceStatus();
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);
  const [loop, setLoop] = useState(true);
  const [volume, setVolume] = useState(VoiceService.volume || 0.8);
  const [showVolume, setShowVolume] = useState(false);

  const audioUrl = m.audioUrl || getMantraAudioUrl(m.slug);
  const isPlaying = status === 'playing' && category === 'music' && trackId === m.slug;
  const isPaused = status === 'paused' && trackId === m.slug;
  const isActive = trackId === m.slug;

  // Poll progress while this track is active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (!isSeeking) {
        setProgress(VoiceService.audioProgress);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, isSeeking]);

  const togglePlay = () => {
    t('MANTRA_SOUNDSCAPE_TOGGLE', m.slug);
    if (isPlaying) {
      VoiceService.pause();
    } else if (isPaused) {
      VoiceService.resume('music');
    } else {
      VoiceService.playAudioURL(audioUrl, { trackId: m.slug, loop, category: 'music' });
    }
  };

  const toggleLoop = () => {
    const next = !loop;
    setLoop(next);
    VoiceService.setLoop(next);
    t('MANTRA_SOUNDSCAPE_LOOP_TOGGLE', `${m.slug}:${next}`);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekVal(progress.currentTime);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekVal(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    VoiceService.seek(seekVal);
    setProgress((p) => ({ ...p, currentTime: seekVal }));
    setIsSeeking(false);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    VoiceService.setVolume(v);
  };

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = progress.duration > 0
    ? ((isSeeking ? seekVal : progress.currentTime) / progress.duration) * 100
    : 0;

  return (
    <section
      onContextMenu={(e) => e.preventDefault()}
      style={{
        background: palette.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.02)',
        border: `1.5px solid ${isPlaying ? palette.PURPLE_STRONG : palette.BORDER}`,
        borderRadius: 20,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isPlaying
          ? (palette.isDark ? '0 8px 30px rgba(169,138,103,0.18)' : '0 8px 24px rgba(74,50,96,0.12)')
          : 'none',
        transition: 'all 0.3s ease',
      }}
      aria-label="Soundscape Chanting Player"
    >
      {/* Top row: badge + equalizer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, borderRadius: 8,
            background: palette.isDark ? 'rgba(169,138,103,0.15)' : 'rgba(74,50,96,0.1)',
            color: palette.PURPLE_STRONG,
          }}>
            <Music2 size={16} aria-hidden="true" />
          </span>
          <div>
            <span style={{
              fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: palette.BROWN, display: 'block', lineHeight: 1.2,
            }}>
              Sacred Soundscape · Clean Audio
            </span>
            <span style={{ fontFamily: SANS, fontSize: 12, color: palette.INK2 }}>
              Ad-free single chant loop
            </span>
          </div>
        </div>

        {/* Animated equalizer waves */}
        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 16 }} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  borderRadius: 2,
                  background: palette.PURPLE_STRONG,
                  animation: 'sms-eq 0.75s ease-in-out infinite alternate',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main player controls: Play/Pause button + progress rail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? `Pause ${m.name}` : `Play ${m.name}`}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            background: palette.PURPLE_STRONG,
            color: palette.ON_ACCENT,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: `0 4px 14px ${palette.PURPLE_STRONG}40`,
            transition: 'transform 0.2s ease',
          }}
          className="sms-btn"
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={20} fill="currentColor" aria-hidden="true" style={{ marginLeft: 2 }} />
          )}
        </button>

        {/* Seek rail and time indicators */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            position: 'relative', height: 6, borderRadius: 3,
            background: palette.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            cursor: 'pointer', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${progressPct}%`,
              background: palette.PURPLE_STRONG,
              transition: isSeeking ? 'none' : 'width 0.2s linear',
            }} />
            <input
              type="range"
              min={0}
              max={progress.duration || 100}
              step={0.1}
              value={isSeeking ? seekVal : progress.currentTime}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer', margin: 0,
              }}
              aria-label="Seek chant position"
            />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: SANS, fontSize: 11, color: palette.INK2, marginTop: 5,
          }}>
            <span>{formatTime(isSeeking ? seekVal : progress.currentTime)}</span>
            <span>{progress.duration > 0 ? formatTime(progress.duration) : '--:--'}</span>
          </div>
        </div>
      </div>

      {/* Bottom bar: Continuous Loop toggle + Volume */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 10, borderTop: `1px solid ${palette.BORDER}` }}>
        <button
          type="button"
          onClick={toggleLoop}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: loop ? (palette.isDark ? 'rgba(169,138,103,0.2)' : 'rgba(74,50,96,0.1)') : 'transparent',
            border: `1px solid ${loop ? palette.PURPLE_STRONG : palette.BORDER}`,
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 12,
            fontFamily: SANS,
            fontWeight: 600,
            color: loop ? palette.PURPLE_STRONG : palette.INK2,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Loop chant continuously for sadhana"
        >
          <Repeat size={13} aria-hidden="true" />
          <span>{loop ? 'Looping continuously' : 'Loop chant: Off'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setShowVolume((v) => !v)}
            aria-label="Toggle volume slider"
            style={{
              background: 'transparent', border: 'none', color: palette.INK2,
              cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 4,
            }}
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          {showVolume && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolume}
              style={{ width: 64, cursor: 'pointer', accentColor: palette.PURPLE_STRONG }}
              aria-label="Volume slider"
            />
          )}
        </div>
      </div>
    </section>
  );
}

/** The one paid product. Guest checkout: Razorpay (card, UPI, wallets) and PayPal. */
function PassCheckout({ palette, layout = 'summary' }: { palette: Palette; layout?: 'summary' | 'order' }) {
  const order = layout === 'order';
  const { checkOut, isProcessing } = useRazorpay();
  const { renderCheckout, isAvailable: paypalAvailable } = usePaypal();
  // 'summary' (hub, sales page) only links to the order page; the form lives on 'order'.
  const [open, setOpen] = useState(order);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const emailOk = email.includes('@') && !!email.split('@')[1]?.includes('.');
  const ready = name.trim().length > 0 && emailOk;

  const onPaid = (paidEmail: string) => {
    t('MANTRA_PASS_PAID', paidEmail);
    setOpen(false);
    setDone(paidEmail);
  };

  useEffect(() => {
    if (!open || !ready || !MANTRA_PASS_OPEN) return;
    const userId = getAuth().currentUser?.uid || 'guest_pending';
    const paidEmail = email.trim();
    const timer = setTimeout(() => {
      renderCheckout('mantra-paypal-container', userId, paidEmail, MANTRA_PASS_ID, MANTRA_CURRENCY, () => onPaid(paidEmail), phone.trim());
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ready, name, email, phone]);

  const pay = () => {
    if (!ready) return;
    const paidEmail = email.trim();
    const userId = getAuth().currentUser?.uid || 'guest_pending';
    t('MANTRA_PASS_PAY_CLICK');
    checkOut(userId, paidEmail, name.trim(), MANTRA_PASS_ID, MANTRA_CURRENCY, () => onPaid(paidEmail), phone.trim());
  };

  const input: React.CSSProperties = {
    width: '100%', minHeight: 48, borderRadius: 14, border: `1px solid ${palette.BORDER}`, background: palette.BG,
    color: palette.INK, fontFamily: SANS, fontSize: 16, padding: '10px 14px', boxSizing: 'border-box',
  };
  const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: palette.INK2, marginBottom: 6 };
  const big = (on: boolean): React.CSSProperties => ({
    width: '100%', minHeight: 52, borderRadius: 999, border: 'none', fontFamily: SANS, fontSize: 16, fontWeight: 700,
    background: on ? palette.PURPLE_STRONG : palette.BORDER, color: on ? palette.ON_ACCENT : palette.INK2,
    cursor: on ? 'pointer' : 'not-allowed',
  });

  return (
    <div className="sms-pass" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 24, alignItems: 'start' }}>
      <div style={{ background: palette.CARD, border: `1px solid ${palette.BORDER}`, borderRadius: 28, padding: 'clamp(22px, 4vw, 34px)' }}>
        {order && (
          <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: `1px solid ${palette.BORDER}` }}>
            <Art name="bowl" height={120} style={{ margin: '0 0 14px' }} />
            <h1 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 500, lineHeight: 1.1 }}>Sadhana Lifetime Pass</h1>
            <p style={{ margin: '0 0 12px', fontSize: 13.5, color: palette.INK2 }}>By Soulful Mantra Studio</p>
            <p style={{ margin: '0 0 10px', fontSize: 15.5, lineHeight: 1.65, color: palette.INK2 }}>
              Our whole mantra library in one calm place, sorted by deity, by time of day and by festival.
              Pick what today asks for (a morning prayer, the evening lamp, a festival puja, rest) and let it play on a loop, without ads.
            </p>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: palette.INK2 }}>
              One payment. No renewals. Every mantra we record later is added for you.
            </p>
          </div>
        )}
        <h3 style={{ margin: '0 0 14px', fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>What is inside</h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 14 }}>
          {PASS_INCLUDES.map((line, i) => {
            const Icon = [Repeat, ListMusic, FileText, Sunrise, Bell, MessageCircle][i] || BookOpen;
            return (
              <li key={line} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.55, color: palette.INK2 }}>
                <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 12, background: palette.BAND, color: palette.ON_BAND }}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span style={{ paddingTop: 6 }}>{line}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ background: palette.CARD, border: `2px solid ${palette.PURPLE_STRONG}`, borderRadius: 28, padding: 'clamp(22px, 4vw, 30px)' }}>
        <span style={{ display: 'inline-block', background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, borderRadius: 999,
          padding: '5px 14px', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Founding listener price</span>
        <p style={{ margin: '14px 0 2px', fontFamily: SANS, fontSize: 44, fontWeight: 700, lineHeight: 1.05, color: palette.INK }}>
          {passPrice()}
          <span style={{ fontSize: 18, fontWeight: 500, color: palette.INK2, textDecoration: 'line-through', marginLeft: 10 }}>{passRegularPrice()}</span>
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.55, color: palette.INK2 }}>
          Pay once. No subscription. The price rises to {passRegularPrice()} {MANTRA_PRICE_RISE}.
        </p>

        {done ? (
          <div role="status" style={{ padding: '18px 18px', borderRadius: 18, background: palette.BAND, color: palette.ON_BAND, fontSize: 15, lineHeight: 1.6 }}>
            <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>Thank you. Your pass is confirmed.</strong>
            Your access link is on its way to {done}, usually the same day and always within 24 hours.
            Not there? <a href={waLink('Hi, I bought the Sadhana Lifetime Pass and need my access link.')} style={{ color: palette.ON_BAND, fontWeight: 700 }}>Message us on WhatsApp</a>.
            <a href={PAGE} style={{ display: 'block', marginTop: 10, color: palette.ON_BAND, fontWeight: 700 }}>Back to the mantra library →</a>
          </div>
        ) : !open || !MANTRA_PASS_OPEN ? (
          MANTRA_PASS_OPEN ? (
            <a href={ORDER_PATH} onClick={() => t('MANTRA_PASS_START')} className="sms-btn"
              style={{ ...big(true), display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              Get the Lifetime Pass — {passPrice()}
            </a>
          ) : (
            <button type="button" disabled style={big(false)}>Opening soon</button>
          )
        ) : (
          <div ref={formRef}>
            <h2 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>Your details</h2>
            <p style={{ margin: '0 0 14px', fontSize: 13.5, color: palette.INK2 }}>We send your access link to this email address.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <label><span style={label}>Your name</span>
                <input style={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
              <label><span style={label}>Email (your access link is sent here)</span>
                <input style={input} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
              <label><span style={label}>WhatsApp number (optional)</span>
                <input style={input} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
            </div>
            <dl style={{ margin: '18px 0 0', padding: '14px 16px', borderRadius: 16, border: `1px dashed ${palette.BORDER}`, display: 'grid',
              gridTemplateColumns: '1fr auto', gap: '8px 12px', fontSize: 14, color: palette.INK2 }}>
              <dt>Sadhana Lifetime Pass</dt>
              <dd style={{ margin: 0 }}><s style={{ marginRight: 8 }}>{passRegularPrice()}</s>{passPrice()}</dd>
              <dt style={{ fontWeight: 700, color: palette.INK, paddingTop: 8, borderTop: `1px solid ${palette.BORDER}` }}>Amount to pay</dt>
              <dd style={{ margin: 0, fontWeight: 700, color: palette.INK, paddingTop: 8, borderTop: `1px solid ${palette.BORDER}` }}>{passPrice()}</dd>
            </dl>
            <button type="button" onClick={pay} disabled={!ready || isProcessing} style={{ ...big(ready), marginTop: 16, opacity: isProcessing ? 0.7 : 1 }}>
              {isProcessing ? 'Opening secure payment…' : `Proceed to pay ${passPrice()}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: palette.INK2, margin: '10px 0 0' }}>UPI, cards, net banking and wallets, handled securely by Razorpay.</p>
            {ready && paypalAvailable !== false && (
              <>
                <p style={{ textAlign: 'center', fontSize: 12, color: palette.INK2, margin: '14px 0 8px' }}>or pay with</p>
                <div id="mantra-paypal-container" />
              </>
            )}
            {!ready && (
              <p style={{ textAlign: 'center', fontSize: 12, color: palette.INK2, margin: '12px 0 0' }}>Enter your name and email to continue.</p>
            )}
          </div>
        )}

        <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '16px 0 0', fontSize: 13, lineHeight: 1.55, color: palette.INK2 }}>
          <ShieldCheck size={17} color={palette.PURPLE_STRONG} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Full refund within {MANTRA_PASS_REFUND_DAYS} days if it is not right for you. See our{' '}
            <a href="/policies#refund" style={{ color: palette.PURPLE_STRONG }}>terms and refund policy</a>.</span>
        </p>
      </div>
    </div>
  );
}

/** Shared band that points every page at the one paid product. */
function PassBand({ palette, href }: { palette: Palette; href: string }) {
  return (
    <section style={{ background: palette.BAND, color: palette.ON_BAND, padding: 'clamp(36px, 6vw, 56px) clamp(16px, 5vw, 96px)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 420px' }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: palette.ON_BAND_ACCENT }}>Sadhana Lifetime Pass</span>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3.6vw, 38px)', fontWeight: 400, lineHeight: 1.15, margin: '8px 0' }}>
            Every mantra on a loop, without ads.
          </h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: palette.ON_BAND_SOFT }}>
            Playlists by deity, time of day and festival, lyrics and meaning PDFs, and a 21 and 40 day sadhana plan. {passPrice()} once, future mantras included.
          </p>
        </div>
        <a href={href} onClick={() => t('MANTRA_BAND_CTA')} className="sms-btn" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 50, padding: '0 28px',
          borderRadius: 999, background: palette.ON_BAND, color: '#FFFFFF', fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          See the Lifetime Pass →
        </a>
      </div>
    </section>
  );
}

const sec: React.CSSProperties = { padding: 'clamp(44px, 7vw, 76px) clamp(16px, 5vw, 96px)', scrollMarginTop: 96 };
const wrap: React.CSSProperties = { maxWidth: 1140, margin: '0 auto' };

function PageStyles({ palette }: { palette: Palette }) {
  return (
    <style>{`
      .sms-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
      .sms-card:hover, .sms-card:focus-visible { transform: translateY(-3px); border-color: ${palette.PURPLE_STRONG} !important;
        box-shadow: ${palette.isDark ? '0 14px 34px rgba(0,0,0,.5)' : '0 14px 34px rgba(60,40,30,.12)'}; }
      .sms-btn { transition: transform .2s ease, opacity .2s ease; }
      .sms-btn:hover { transform: translateY(-1px); opacity: .92; }
      .sms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
      .sms-chip { min-height: 40px; padding: 0 16px; border-radius: 999px; cursor: pointer; font-family: ${SANS}; font-size: 13.5px; font-weight: 700; white-space: nowrap; }
      .sms-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .sms-ticker { display: inline-flex; white-space: nowrap; animation: sms-ticker 38s linear infinite; }
      @keyframes sms-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes sms-eq { from { height: 4px; } to { height: 16px; } }
      @media (prefers-reduced-motion: reduce) { .sms-ticker { animation: none; } }
      @media (max-width: 860px) {
        .sms-pass, .sms-detail, .sms-listen, .sms-sales-hero { grid-template-columns: 1fr !important; }
        .sms-listen { text-align: center; }
        .sms-listen img { margin-left: auto; margin-right: auto; }
        .sms-chips { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
      }
      @media (prefers-reduced-motion: reduce) { .sms-card, .sms-btn { transition: none; } .sms-card:hover, .sms-btn:hover { transform: none; } }
    `}</style>
  );
}

const MIND_STUDIO_URL = 'https://www.skrmblissai.in';

/** Footer for every mantra page: Soulful Mantra Studio's own, with a way across
 *  to the sister vertical, Soulful Mind Studio (the main skrmblissai.in site). */
function MantraFooter({ palette }: { palette: Palette }) {
  return (
    <SiteFooter
      palette={palette}
      brand={MANTRA_BRAND}
      youtubeUrl={MANTRA_SUBSCRIBE_URL}
      socialLabels={['YouTube', 'WhatsApp']}
      description="Soft, unhurried mantra recordings with the Sanskrit text and its meaning in plain words. A sister studio of Soulful Mind Studio."
      cols={[
        {
          title: 'Mantras',
          items: [
            { label: 'Mantra Library', href: `${PAGE}#library` },
            { label: 'Sadhana Lifetime Pass', href: PASS_PATH },
            { label: 'How to begin', href: `${PAGE}#begin` },
            { label: 'Gita (coming soon)', href: `${PAGE}#gita` },
            { label: 'YouTube channel', href: MANTRA_SUBSCRIBE_URL },
          ],
        },
        {
          title: 'Soulful Mind Studio',
          items: [
            { label: 'Visit Soulful Mind Studio', href: MIND_STUDIO_URL },
            { label: 'Mind Gym', href: '/mindgym' },
            { label: 'Kids Mind Gym', href: '/tiny-kids-transformations' },
            { label: 'Feelings & Emotions course', href: '/feelingsandemotioncourse' },
          ],
        },
        {
          title: 'Contact & legal',
          items: [
            { label: 'connect@skrmblissai.in', href: 'mailto:connect@skrmblissai.in' },
            { label: 'WhatsApp +91 82175 81238', href: MANTRA_WHATSAPP },
            { label: 'Privacy', href: '/policies#privacy' },
            { label: 'Terms', href: '/policies#terms' },
            { label: 'Refunds', href: '/policies#refund' },
          ],
        },
      ]}
    />
  );
}

function Header({ palette, toggle, home }: { palette: Palette; toggle: () => void; home: boolean }) {
  const base = home ? '' : PAGE;
  return (
    <SiteHeader
      palette={palette}
      onToggleTheme={toggle}
      brand={MANTRA_BRAND}
      links={[
        { label: 'Mantra Library', href: `${base}#library` },
        { label: 'Gita · soon', href: `${base}#gita` },
        { label: 'How to begin', href: `${base}#begin`, secondary: true },
        { label: 'Questions', href: `${base}#faq`, secondary: true },
        { label: 'Soulful Mind Studio ↗', href: MIND_STUDIO_URL, secondary: true },
      ]}
      cta={{ label: 'Lifetime Pass →', href: PASS_PATH, onClick: () => t('MANTRA_HEADER_CTA') }}
    />
  );
}

// ── /mantras ─────────────────────────────────────────────────────────────────
function MantraHub() {
  const { palette, toggle } = useSiteTheme();
  const [deity, setDeity] = useState<string | null>(null);
  const [moment, setMoment] = useState<Moment | null>(null);

  usePageSeo({
    title: 'Mantra Library: Lyrics, Meaning & Chants | Soulful Mantra Studio',
    description:
      `Read and chant Sanskrit mantras with Devanagari text, transliteration, plain-English meaning and a soft studio recording. Ganesha, Lakshmi, Kubera, Surya, Dhanvantari and Tulsi mantras for morning, evening and festival puja.`,
    url: MANTRA_BASE_URL,
    image: MANTRAS[0]?.videos?.[0] ? thumb(MANTRAS[0].videos[0].id) : '/marketing/mantras/emblem-sunburst.webp',
    jsonLd: [
      {
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Soulful Mantra Studio: Mantra Library', url: MANTRA_BASE_URL,
        publisher: { '@type': 'Organization', name: 'Soulful Mantra Studio', url: 'https://www.skrmblissai.in/mantras' },
        hasPart: MANTRAS.map((m) => ({ '@type': 'CreativeWork', name: m.name, url: `${MANTRA_BASE_URL}/${m.slug}` })),
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: MANTRA_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  });

  useEffect(() => { t('PAGE_VISIT_MANTRAS'); }, []);

  const shown = useMemo(
    () => MANTRAS.filter((m) => (!deity || m.deity === deity) && (!moment || m.moments.includes(moment))),
    [deity, moment],
  );

  const chip = (on: boolean): React.CSSProperties => ({
    background: on ? palette.PURPLE_STRONG : palette.CARD, color: on ? palette.ON_ACCENT : palette.INK2,
    border: `1px solid ${on ? palette.PURPLE_STRONG : palette.BORDER}`,
  });
  const box: React.CSSProperties = { background: palette.CARD, border: `1px solid ${palette.BORDER}`, borderRadius: 24 };

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden' }}>
      <PageStyles palette={palette} />
      <Header palette={palette} toggle={toggle} home />

      {/* Hero */}
      {/* Full-width brand film on top. Silent; muted + playsInline so phones autoplay it. */}
      {/* Whole 16:9 frame, watermark-free and crisp. */}
      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: '#0B0907', borderBottom: `1px solid ${palette.BORDER}` }}>
        <video src={BRAND_VIDEO} autoPlay muted loop playsInline preload="auto"
          aria-label="Soulful Mantra Studio: Sacred sound and stillness"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <header style={{ ...sec, paddingTop: 'clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
        <div className="sms-hero" style={{ maxWidth: 780, margin: '0 auto' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '7px 14px', borderRadius: 999, border: `1px solid ${palette.BORDER}`,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.BROWN, marginBottom: 18 }}>
            Soulful Mantra Studio
          </span>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Know what you chant. <span style={{ color: palette.BROWN }}>Chant it every day.</span>
          </h1>
          <p style={{ fontSize: 17.5, lineHeight: 1.7, color: palette.INK2, margin: '0 auto 12px', maxWidth: 620 }}>
            Soft, unhurried mantra recordings with the Sanskrit text, how to say it and what it means, in plain words.
            Free to read and listen. A library that grows every week.
          </p>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: palette.BROWN, margin: '0 0 24px' }}>
            New chants every week
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Btn palette={palette} href="#library" label="Browse the library" event="MANTRA_HERO_BROWSE" />
            <Btn palette={palette} href="#pass" label={`Lifetime Pass · ${passPrice()}`} event="MANTRA_HERO_PASS" ghost />
          </div>
          <a href={MANTRA_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" onClick={() => t('MANTRA_HERO_YOUTUBE')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 18, minHeight: 32, fontSize: 13.5, fontWeight: 600, color: palette.INK2 }}>
            <Youtube size={17} aria-hidden="true" /> Listen free on our YouTube channel
          </a>
        </div>
        </div>
      </header>

      {/* Library */}
      <section id="library" style={{ ...sec, paddingTop: 0 }}>
        <div style={wrap}>
          <SectionTitle palette={palette} art="emblem" artHeight={96} kicker="Mantra Library" title="Find a mantra for this moment"
            sub="Pick a time of day or a deity. Every page has the text, the meaning and our recording." />

          <div role="group" aria-label="Filter by moment" className="sms-chips" style={{ marginBottom: 10 }}>
            <button type="button" className="sms-chip" aria-pressed={!moment} style={chip(!moment)} onClick={() => setMoment(null)}>Any time</button>
            {MOMENTS.map((mo) => (
              <button key={mo.id} type="button" className="sms-chip" title={mo.blurb} aria-pressed={moment === mo.id} style={chip(moment === mo.id)}
                onClick={() => { setMoment(moment === mo.id ? null : mo.id); t('MANTRA_FILTER_MOMENT', mo.id); }}>{mo.label}</button>
            ))}
          </div>
          <div role="group" aria-label="Filter by deity" className="sms-chips" style={{ marginBottom: 28 }}>
            <button type="button" className="sms-chip" aria-pressed={!deity} style={chip(!deity)} onClick={() => setDeity(null)}>All deities</button>
            {DEITIES.map((d) => (
              <button key={d} type="button" className="sms-chip" aria-pressed={deity === d} style={chip(deity === d)}
                onClick={() => { setDeity(deity === d ? null : d); t('MANTRA_FILTER_DEITY', d); }}>{d}</button>
            ))}
          </div>

          {shown.length > 0 ? (
            <div className="sms-grid">{shown.map((m) => <MantraCard key={m.slug} palette={palette} m={m} />)}</div>
          ) : (
            <div style={{ ...box, padding: '28px 24px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
              <p style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.6, color: palette.INK2 }}>
                We have not recorded a mantra for this combination yet. Tell us which one you would like and we will add it to the list.
              </p>
              <Btn palette={palette} href={waLink('Hi Soulful Mantra Studio, please record this mantra: ')} label="Request a mantra" event="MANTRA_REQUEST_EMPTY" external />
            </div>
          )}
        </div>
      </section>

      {/* Listen free — YouTube */}
      <section style={{ ...sec, paddingTop: 0 }}>
        <div className="sms-listen" style={{ ...box, ...wrap, maxWidth: 1000, padding: 'clamp(22px, 4vw, 36px)', display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(20px, 4vw, 44px)', alignItems: 'center' }}>
          <Art name="lockup" height={230} style={{ margin: '0 auto' }} />
          <div>
            <Kicker palette={palette}>Listen free</Kicker>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3.6vw, 36px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 8px' }}>
              Every chant is on our YouTube channel
            </h2>
            <p style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.65, color: palette.INK2 }}>
              Long, soft recordings for morning, the evening lamp, festival puja and sleep. Subscribe and the next mantra reaches you the day it is released.
            </p>
            <a href={MANTRA_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" className="sms-btn" onClick={() => t('MANTRA_SUBSCRIBE_BADGE')}
              aria-label="Subscribe to Soulful Mantra Studio on YouTube" style={{ display: 'inline-block' }}>
              <img src={palette.isDark ? ART.subscribeDark.src : ART.subscribeLight.src} alt="Subscribe to Soulful Mantra Studio on YouTube" width={ART.subscribe.w} height={ART.subscribe.h} loading="lazy" decoding="async"
                style={{ display: 'block', width: 'min(100%, 340px)', height: 'auto' }} />
            </a>
          </div>
        </div>
      </section>

      {/* How to begin */}
      <section id="begin" style={{ ...sec, background: palette.BG2 }}>
        <div style={wrap}>
          <SectionTitle palette={palette} art="namaste" artHeight={110} kicker="How to begin" title="One mantra, one time of day, 21 days"
            sub="You do not need initiation, a mala or perfect pronunciation to start." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {[
              { n: '1', h: 'Choose one', b: 'Pick a single short mantra that fits your day. Read its meaning first, so the words are not just sound.' },
              { n: '2', h: 'Fix the time', b: 'Morning after a bath, or evening beside the lamp. The same time each day matters more than how long you sit.' },
              { n: '3', h: 'Listen, then join in', b: 'Play our recording and listen for a few days. Start chanting along when it feels natural. Aim for one mala of 108, or simply five minutes.' },
            ].map((s) => (
              <div key={s.n} style={{ ...box, padding: '22px 22px' }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: '50%', background: palette.BAND, color: palette.ON_BAND,
                  fontFamily: SERIF, fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{s.n}</span>
                <h3 style={{ margin: '0 0 6px', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>{s.h}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifetime Pass */}
      <section id="pass" style={sec}>
        <SectionTitle palette={palette} art="bowl" artHeight={130} kicker="Sadhana Lifetime Pass" title="Take the whole library with you"
          sub="For daily practice without interruption: every mantra on a loop with no ads, organised playlists, the words on paper, and a plan to follow." />
        <PassCheckout palette={palette} />
        <p style={{ textAlign: 'center', margin: '18px 0 0' }}>
          <a href={PASS_PATH} onClick={() => t('MANTRA_PASS_LEARN_MORE')} style={{ display: 'inline-block', padding: '8px 4px', fontSize: 14.5, fontWeight: 700, color: palette.PURPLE_STRONG }}>
            See everything about the Lifetime Pass →
          </a>
        </p>
      </section>

      {/* Gita — coming soon */}
      <section id="gita" style={{ ...sec, background: palette.BG2 }}>
        <div style={{ ...box, ...wrap, maxWidth: 820, padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center' }}>
          <Art name="emblem" height={92} style={{ margin: '0 auto 16px' }} />
          <span style={{ display: 'inline-block', background: palette.BAND, color: palette.ON_BAND, borderRadius: 999, padding: '5px 14px',
            fontSize: 10.5, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>Coming soon</span>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 10px' }}>The Bhagavad Gita, one verse at a time</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: palette.INK2, margin: '0 auto 20px', maxWidth: 560 }}>
            We are preparing the Gita the same way as our mantras: the verse sung softly, the Sanskrit, and the meaning in plain words.
            It is not ready yet. Leave us a message and we will tell you the day it opens.
          </p>
          <Btn palette={palette} href={waLink('Hi Soulful Mantra Studio, please tell me when the Gita section opens.')}
            label={<><Bell size={17} aria-hidden="true" /> Notify me on WhatsApp</>} event="MANTRA_GITA_NOTIFY" external />
        </div>
      </section>

      {/* Request a mantra */}
      <section style={sec}>
        <div style={{ ...wrap, maxWidth: 900, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Art name="namaste" height={150} />
          <div style={{ flex: '1 1 340px' }}>
            <Kicker palette={palette}>A small studio that listens</Kicker>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3.6vw, 36px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 8px' }}>Which mantra should we record next?</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: palette.INK2 }}>
              Tell us the mantra your family chants, or the one you have always wanted to understand. We read every message ourselves.
            </p>
          </div>
          <Btn palette={palette} href={waLink('Hi Soulful Mantra Studio, please record this mantra: ')}
            label={<><MessageCircle size={17} aria-hidden="true" /> Request a mantra</>} event="MANTRA_REQUEST" external />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ ...sec, background: palette.BG2 }}>
        <SectionTitle palette={palette} art="bowl" artHeight={96} kicker="Questions" title="Before you begin" />
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'grid', gap: 10 }}>
          {MANTRA_FAQ.map((f) => (
            <details key={f.q} style={{ ...box, borderRadius: 18, padding: '4px 22px' }}>
              <summary style={{ cursor: 'pointer', padding: '14px 0', fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: palette.INK }}>{f.q}</summary>
              <p style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.7, color: palette.INK2 }}>{f.a}</p>
            </details>
          ))}
        </div>
        <p style={{ maxWidth: 780, margin: '22px auto 0', textAlign: 'center', fontSize: 12.5, lineHeight: 1.6, color: palette.INK2 }}>
          Mantra chanting is a devotional and contemplative practice. It is not medical advice or treatment.
        </p>
      </section>

      <MantraFooter palette={palette} />
    </div>
  );
}

// ── /mantras/<slug> ──────────────────────────────────────────────────────────
function MantraDetail({ m }: { m: Mantra }) {
  const { palette, toggle } = useSiteTheme();
  const [play, setPlay] = useState(false);
  const url = `${MANTRA_BASE_URL}/${m.slug}`;
  const main = m.videos && m.videos.length > 0 ? m.videos[0] : null;
  const coverImg = main ? thumb(main.id) : (m.cover || '/marketing/mantras/emblem-sunburst.webp');
  const others = MANTRAS.filter((o) => o.slug !== m.slug && (o.deity === m.deity || o.moments.some((x) => m.moments.includes(x)))).slice(0, 3);

  usePageSeo({
    title: `${m.name}: Lyrics, Meaning & How to Chant | Soulful Mantra Studio`,
    description: `${m.name} in Devanagari with transliteration, word meanings and when to chant it. ${m.blurb} Listen to our soft studio recording.`,
    url,
    image: coverImg,
    jsonLd: [
      {
        '@context': 'https://schema.org', '@type': 'Article', headline: `${m.name}: lyrics, meaning and how to chant`, url, image: coverImg,
        inLanguage: ['en', 'sa'], about: m.deity,
        publisher: { '@type': 'Organization', name: 'Soulful Mantra Studio', url: 'https://www.skrmblissai.in/mantras' },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Mantra Library', item: MANTRA_BASE_URL },
          { '@type': 'ListItem', position: 2, name: m.name, item: url },
        ],
      },
    ],
  });

  useEffect(() => { t('PAGE_VISIT_MANTRA', m.slug); }, [m.slug]);

  const box: React.CSSProperties = { background: palette.CARD, border: `1px solid ${palette.BORDER}`, borderRadius: 24, padding: 'clamp(20px, 4vw, 30px)' };
  const h2: React.CSSProperties = { fontFamily: SERIF, fontSize: 28, fontWeight: 500, margin: '0 0 12px', color: palette.INK };

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden' }}>
      <PageStyles palette={palette} />
      <Header palette={palette} toggle={toggle} home={false} />

      <main style={{ ...sec, paddingTop: 'clamp(28px, 4vw, 44px)' }}>
        <div style={wrap}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: palette.INK2, marginBottom: 18 }}>
            <a href={PAGE} style={{ color: palette.PURPLE_STRONG, fontWeight: 600, display: 'inline-block', padding: '6px 0' }}>Mantra Library</a>
            <span aria-hidden="true"> / </span>{m.name}
          </nav>

          <Kicker palette={palette}>{m.deity} · {m.occasions.join(' · ')}</Kicker>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 5vw, 54px)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 10px' }}>{m.name}</h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: palette.INK2, margin: '0 0 26px', maxWidth: 680 }}>{m.blurb}</p>

          <div className="sms-detail" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 20 }}>
              <section style={box} aria-labelledby="mantra-text">
                <h2 id="mantra-text" style={h2}>The mantra</h2>
                <p lang="sa" style={{ fontFamily: DEVA, fontSize: 'clamp(20px, 2.6vw, 26px)', lineHeight: 1.8, margin: '0 0 14px', color: palette.INK }}>
                  {m.devanagari.map((l) => <span key={l} style={{ display: 'block' }}>{l}</span>)}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', lineHeight: 1.6, margin: 0, color: palette.INK2 }}>
                  {m.transliteration.map((l) => <span key={l} style={{ display: 'block' }}>{l}</span>)}
                </p>
              </section>

              <section style={box} aria-labelledby="mantra-meaning">
                <h2 id="mantra-meaning" style={h2}>What it means</h2>
                <p style={{ fontSize: 16, lineHeight: 1.75, margin: '0 0 16px', color: palette.INK }}>{m.meaning}</p>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: 14.5, lineHeight: 1.5 }}>
                  {m.words.map(([w, g]) => (
                    <div key={w} style={{ display: 'contents' }}>
                      <dt style={{ fontFamily: SERIF, fontSize: 17, fontStyle: 'italic', fontWeight: 600, color: palette.BROWN }}>{w}</dt>
                      <dd style={{ margin: 0, color: palette.INK2 }}>{g}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section style={box} aria-labelledby="mantra-when">
                <h2 id="mantra-when" style={h2}>When and how to chant</h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.75, margin: 0, color: palette.INK2 }}>{m.when}</p>
              </section>
            </div>

            <aside style={{ display: 'grid', gap: 20 }}>
              {/* Sacred Soundscape: Clean Audio Chanting Player */}
              <MantraSoundscapePlayer palette={palette} m={m} />

              {main && (
                <section style={{ ...box, padding: 14 }} aria-label="Listen on YouTube">
                  <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
                    {play ? (
                      <iframe title={`${m.name} — Soulful Mantra Studio`} src={`https://www.youtube.com/embed/${main.id}?autoplay=1&rel=0`}
                        allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
                    ) : (
                      <button type="button" onClick={() => { setPlay(true); t('MANTRA_PLAY', m.slug); }} aria-label={`Play ${m.name}`}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: 0, border: 0, cursor: 'pointer', background: 'none' }}>
                        <img src={thumb(main.id)} alt="" width={480} height={360} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.22)' }}>
                          <span style={{ display: 'grid', placeItems: 'center', width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.94)', color: '#241E24' }}>
                            <Play size={28} fill="currentColor" aria-hidden="true" style={{ marginLeft: 4 }} />
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                  <ul style={{ listStyle: 'none', margin: '12px 6px 4px', padding: 0, display: 'grid', gap: 2 }}>
                    {m.videos?.map((v) => (
                      <li key={v.id}>
                        <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={() => t('MANTRA_YOUTUBE', v.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 36, fontSize: 14, fontWeight: 600, color: palette.PURPLE_STRONG, textDecoration: 'none' }}>
                          <Youtube size={17} aria-hidden="true" /> {v.label} on YouTube
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section style={{ ...box, borderColor: palette.PURPLE_STRONG }} aria-label="Sadhana Lifetime Pass">
                <Art name="bowl" height={110} style={{ margin: '0 0 14px' }} />
                <Kicker palette={palette}>Sadhana Lifetime Pass</Kicker>
                <h2 style={{ ...h2, fontSize: 24, marginBottom: 8 }}>Play this chant on a loop, without ads</h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: palette.INK2, margin: '0 0 16px' }}>
                  Every mantra in organised playlists by deity, time of day and festival, with a lyrics PDF and a 21 and 40 day plan. {passPrice()} once. Future mantras included.
                </p>
                <Btn palette={palette} href={PASS_PATH} label="See the Lifetime Pass" event="MANTRA_DETAIL_PASS" />
              </section>
            </aside>
          </div>

          {others.length > 0 && (
            <section style={{ marginTop: 'clamp(36px, 6vw, 60px)' }} aria-labelledby="more-mantras">
              <h2 id="more-mantras" style={{ ...h2, fontSize: 30, marginBottom: 18 }}>Chant next</h2>
              <div className="sms-grid">{others.map((o) => <MantraCard key={o.slug} palette={palette} m={o} />)}</div>
            </section>
          )}

          <p style={{ margin: '32px 0 0', fontSize: 12.5, lineHeight: 1.6, color: palette.INK2 }}>
            The mantra text is traditional. The translation and notes are written by Soulful Mantra Studio. Mantra chanting is a devotional practice, not medical advice.
          </p>
        </div>
      </main>

      <PassBand palette={palette} href={PASS_PATH} />
      <MantraFooter palette={palette} />
    </div>
  );
}

// ── /mantras/lifetime-pass (sales page) ──────────────────────────────────────
const PASS_MOMENTS: { icon: typeof Repeat; h: string; b: string }[] = [
  { icon: Repeat, h: 'Chant without interruption', b: 'No ads before, during or after. One mantra repeats for as long as you sit.' },
  { icon: Sunrise, h: 'A steadier start to the morning', b: 'Open the Morning playlist and begin the day with one short prayer.' },
  { icon: Bell, h: 'An evening ritual by the lamp', b: 'Light the diya, press play, and let the chant close the day.' },
  { icon: Play, h: 'Soft loops for winding down', b: 'Slow, quiet recordings made to play in the background as you rest.' },
  { icon: BookOpen, h: 'Know every word you chant', b: 'The Sanskrit, how to say it and what it means, on a page you can print.' },
  { icon: ListMusic, h: 'Festival puja made simple', b: 'The right mantras for Diwali, Dhanteras, Chhath and Tulsi Vivah, already in order.' },
];

function MantraPassSales() {
  const { palette, toggle } = useSiteTheme();
  const url = `${MANTRA_BASE_URL}/lifetime-pass`;

  usePageSeo({
    title: 'Sadhana Lifetime Pass: Ad-Free Mantra Playlists, Pay Once | Soulful Mantra Studio',
    description:
      'One payment for our whole mantra library: every chant on a loop without ads, playlists by deity, time of day and festival, lyrics and meaning PDFs, and 21 and 40 day sadhana plans. No subscription.',
    url,
    image: 'https://www.skrmblissai.in/marketing/mantras/lockup.webp',
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: MANTRA_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }],
  });
  useEffect(() => { t('PAGE_VISIT_MANTRA_PASS'); }, []);

  const box: React.CSSProperties = { background: palette.CARD, border: `1px solid ${palette.BORDER}`, borderRadius: 24 };
  const buy = (event: string, label = `Get the Lifetime Pass — ${passPrice()}`) =>
    MANTRA_PASS_OPEN
      ? <Btn palette={palette} href={ORDER_PATH} label={label} event={event} />
      : <span style={{ fontWeight: 700, color: palette.BROWN }}>Opening soon</span>;

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden', paddingBottom: 84 }}>
      <PageStyles palette={palette} />
      <Header palette={palette} toggle={toggle} home={false} />

      {/* Offer ticker — plain facts about the pass, nothing we cannot back up */}
      <div aria-hidden="true" style={{ overflow: 'hidden', background: GOLD_BAR, color: '#241E24', borderBottom: '1px solid rgba(36,30,36,0.18)' }}>
        <div className="sms-ticker">
          {[0, 1].map((k) => (
            <span key={k} style={{ display: 'inline-flex' }}>
              {['One payment, yours to keep', 'No ads, ever', 'Playlists by deity, time of day and festival', 'A new mantra every week',
                `${MANTRA_PASS_REFUND_DAYS}-day full refund`, 'Founding listener price'].map((x) => (
                <span key={x} style={{ padding: '9px 0', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {x}<span style={{ margin: '0 22px', opacity: 0.55 }}>✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <header style={{ ...sec, paddingTop: 'clamp(28px, 4.5vw, 56px)' }}>
        <div className="sms-sales-hero" style={{ ...wrap, maxWidth: 1200, display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 'clamp(24px, 4vw, 56px)', alignItems: 'center' }}>
          {/* Collage of our own recordings in a gold frame */}
          <figure style={{ margin: 0, padding: 'clamp(14px, 2.2vw, 22px)', borderRadius: 30, background: GOLD_BAR,
            boxShadow: palette.isDark ? '0 30px 70px rgba(0,0,0,.55)' : '0 30px 70px rgba(122,95,68,.28)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, borderRadius: 16, overflow: 'hidden' }}>
              {MANTRAS.filter((m) => m.videos && m.videos.length > 0).slice(0, 9).map((m) => (
                <img key={m.slug} src={`https://i.ytimg.com/vi/${m.videos![0].id}/mqdefault.jpg`} alt="" width={320} height={180}
                  style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }} />
              ))}
            </div>
            <figcaption style={{ textAlign: 'center', paddingTop: 14, color: '#241E24' }}>
              <span style={{ display: 'block', fontFamily: SERIF, fontSize: 'clamp(20px, 2.4vw, 26px)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Sadhana Lifetime Pass</span>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.75, marginTop: 2 }}>Soulful Mantra Studio</span>
            </figcaption>
          </figure>

          <div>
            <Kicker palette={palette}>Sadhana Lifetime Pass</Kicker>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 4.8vw, 56px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 14px' }}>
              One payment. <span style={{ color: palette.BROWN }}>A lifetime of daily chanting.</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: palette.INK2, margin: '0 0 18px', maxWidth: 560 }}>
              Our whole mantra library in one quiet place, for your morning, your evening lamp, your festivals and your rest.
            </p>
            <ul style={{ listStyle: 'none', margin: '0 0 22px', padding: 0, display: 'grid', gap: 10 }}>
              {['No ads before, during or after a chant', 'One mantra on a loop for as long as you sit', 'Playlists by deity, time of day and festival',
                'The words and their meaning beside every chant'].map((line) => (
                <li key={line} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15.5, fontWeight: 600, color: palette.INK }}>
                  <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', background: GOLD_BAR, color: '#241E24', fontSize: 13, fontWeight: 900 }}>✓</span>
                  {line}
                </li>
              ))}
            </ul>
            {buy('MANTRA_SALES_HERO_CTA')}
            <p style={{ margin: '14px 0 0', fontSize: 13.5, lineHeight: 1.6, color: palette.INK2 }}>
              <strong style={{ color: palette.INK }}>Pay once, keep it.</strong> <s>{passRegularPrice()}</s> {passPrice()} founding price · full refund within {MANTRA_PASS_REFUND_DAYS} days
              <span style={{ display: 'block' }}>UPI, cards, net banking, wallets and PayPal</span>
            </p>
          </div>
        </div>
      </header>

      {/* Key features */}
      <section style={{ ...sec, paddingTop: 0 }}>
        <div style={wrap}>
          <SectionTitle palette={palette} art="bowl" artHeight={110} kicker="Made for real days" title="A practice that fits the life you already have" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { slug: 'tulsi-mantra', h: 'For everyone at home', b: 'Short, gentle chants that children can join, parents can keep up, and grandparents already know by heart.' },
              { slug: 'om-suryaya-namah', h: 'Play it, chant it, or simply listen', b: 'On the way to work, while cooking, beside the puja lamp or at bedtime. Chant along when you want to go deeper.' },
              { slug: 'kubera-ashtalakshmi-mantra', h: 'Invite abundance, health and peace', b: 'Lakshmi and Kubera mantras have been chanted for wealth and prosperity, and Dhanvantari for good health, for centuries. Chant them daily with a calm mind and a clear intention.' },
              { slug: 'mahalakshmi-mantra', h: 'Ready for every festival', b: 'When Diwali, Dhanteras or Chhath arrives, the right mantras are already together, in the order of the puja.' },
            ].map((f) => {
              const m = findMantra(f.slug) || MANTRAS[0];
              return (
                <div key={f.h} className="sms-card" style={{ ...box, padding: 16, display: 'flex', flexDirection: 'column' }}>
                  <img src={m.videos && m.videos[0] ? thumb(m.videos[0].id) : (m.cover || '/marketing/mantras/emblem-sunburst.webp')} alt="" loading="lazy" width={480} height={360}
                    style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 16, display: 'block', marginBottom: 14 }} />
                  <h3 style={{ margin: '0 6px 6px', fontFamily: SERIF, fontSize: 25, fontWeight: 500, lineHeight: 1.2 }}>{f.h}</h3>
                  <p style={{ margin: '0 6px 6px', fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>{f.b}</p>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: 26 }}>{buy('MANTRA_SALES_FEATURES_CTA')}</div>
        </div>
      </section>

      {/* What changes in your day */}
      <section style={{ ...sec, background: palette.BG2 }}>
        <div style={wrap}>
          <SectionTitle palette={palette} art="namaste" artHeight={100} kicker="What it gives your day" title="Six quiet changes to your day" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {PASS_MOMENTS.map(({ icon: Icon, h, b }) => (
              <div key={h} style={{ ...box, padding: '20px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: '50%', background: palette.BAND, color: palette.ON_BAND }}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 22, fontWeight: 500, lineHeight: 1.2, marginBottom: 4 }}>{h}</strong>
                  <span style={{ fontSize: 14.5, lineHeight: 1.6, color: palette.INK2 }}>{b}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it is organised */}
      <section style={sec}>
        <div style={{ ...wrap, maxWidth: 900 }}>
          <SectionTitle palette={palette} art="emblem" artHeight={92} kicker="Organised for you" title="Find the right chant in a moment"
            sub="Every mantra sits in more than one playlist, so you can reach it the way you think of it." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { h: 'By deity', items: DEITIES },
              { h: 'By time of day', items: MOMENTS.filter((m) => m.id !== 'festival').map((m) => m.label) },
              { h: 'By festival', items: Array.from(new Set(MANTRAS.flatMap((m) => m.occasions))).filter((o) => /Diwali|Dhanteras|Chhath|Tulsi Vivah|Ganesh Chaturthi/.test(o)) },
            ].map((g) => (
              <div key={g.h} style={{ ...box, padding: '20px 20px' }}>
                <h3 style={{ margin: '0 0 12px', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>{g.h}</h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {g.items.map((it) => (
                    <li key={it} style={{ padding: '6px 12px', borderRadius: 999, border: `1px solid ${palette.BORDER}`, fontSize: 13.5, fontWeight: 600, color: palette.INK2 }}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section style={{ ...sec, background: palette.BG2 }}>
        <div style={wrap}>
          <SectionTitle palette={palette} kicker="How you will use it" title="Three small steps, every day" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {[
              { n: '1', h: 'Choose your moment', b: 'Morning, the evening lamp, a festival or bedtime. Open that playlist and pick one mantra.' },
              { n: '2', h: 'Press play and let it loop', b: 'Listen first. Read the meaning. Join in when the words feel familiar, with a mala or without.' },
              { n: '3', h: 'Stay with it', b: 'Follow the 21-day plan, then the 40-day plan. Same mantra, same time, a few minutes a day.' },
            ].map((s) => (
              <div key={s.n} style={{ ...box, padding: '22px 22px' }}>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: palette.BROWN, marginBottom: 8 }}>Step {s.n}</span>
                <h3 style={{ margin: '0 0 6px', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>{s.h}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is inside + price */}
      <section id="pass" style={sec}>
        <SectionTitle palette={palette} kicker="Everything in the pass" title="What you receive" />
        <PassCheckout palette={palette} />
      </section>

      {/* One payment band */}
      <section style={{ padding: '0 clamp(16px, 5vw, 96px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', background: '#241E24', color: '#F4F1EA', borderRadius: 28, padding: 'clamp(28px, 5vw, 44px)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, margin: '0 0 8px', color: '#E9C98A' }}>Paid once. Yours to keep.</h2>
          <p style={{ margin: '0 auto', maxWidth: 600, fontSize: 15.5, lineHeight: 1.65, color: 'rgba(244,241,234,0.85)' }}>
            There is nothing to renew and nothing to cancel. A single payment opens the whole library on any device, and every mantra we add later arrives in your pass at no extra cost.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={sec}>
        <SectionTitle palette={palette} art="bowl" artHeight={92} kicker="Questions" title="Before you decide" />
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'grid', gap: 10 }}>
          {MANTRA_FAQ.map((f) => (
            <details key={f.q} style={{ ...box, borderRadius: 18, padding: '4px 22px' }}>
              <summary style={{ cursor: 'pointer', padding: '14px 0', fontSize: 15.5, fontWeight: 700 }}>{f.q}</summary>
              <p style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.7, color: palette.INK2 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section style={{ ...sec, paddingTop: 0, textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 10px' }}>Begin today, keep it for life.</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, color: palette.INK2, margin: '0 0 20px' }}>
            Join at the founding price of {passPrice()}. It rises to {passRegularPrice()} {MANTRA_PRICE_RISE}.
          </p>
          {buy('MANTRA_SALES_FINAL_CTA')}
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: palette.INK2, margin: '16px 0 6px' }}>
            Full refund within {MANTRA_PASS_REFUND_DAYS} days. Mantra chanting is a devotional practice, not a substitute for medical, psychological or professional advice.
          </p>
          <a href={PAGE} onClick={() => t('MANTRA_SALES_DECLINE')} style={{ display: 'inline-block', padding: '10px 6px', fontSize: 14, color: palette.INK2 }}>
            Not now. Take me to the free mantra library
          </a>
        </div>
      </section>

      <MantraFooter palette={palette} />

      {MANTRA_PASS_OPEN && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: '#1B1714', borderTop: '1px solid rgba(233,201,138,0.3)',
          padding: '10px clamp(14px, 4vw, 40px)', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingRight: 64 }}>
            <span style={{ color: '#F4F1EA', fontSize: 14.5, fontWeight: 700, lineHeight: 1.3 }}>
              {passPrice()} · one payment
              <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(244,241,234,0.7)' }}>No subscription · {MANTRA_PASS_REFUND_DAYS}-day refund</span>
            </span>
            <a href={ORDER_PATH} onClick={() => t('MANTRA_SALES_STICKY_CTA')} className="sms-btn" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 46, padding: '0 22px',
              borderRadius: 999, background: '#E9C98A', color: '#241E24', fontSize: 14.5, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Get the pass →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── /mantras/lifetime-pass/checkout (order page) ─────────────────────────────
function MantraPassOrder() {
  const { palette, toggle } = useSiteTheme();
  usePageSeo({
    title: 'Order: Sadhana Lifetime Pass | Soulful Mantra Studio',
    description: 'Complete your order for the Sadhana Lifetime Pass. One payment, no subscription.',
    url: `${MANTRA_BASE_URL}/lifetime-pass/checkout`,
  });
  useEffect(() => { t('PAGE_VISIT_MANTRA_ORDER'); }, []);

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden' }}>
      <PageStyles palette={palette} />
      <Header palette={palette} toggle={toggle} home={false} />
      <main style={{ ...sec, paddingTop: 'clamp(24px, 4vw, 44px)' }}>
        <nav aria-label="Breadcrumb" style={{ maxWidth: 1000, margin: '0 auto 16px', fontSize: 13, color: palette.INK2 }}>
          <a href={PASS_PATH} style={{ color: palette.PURPLE_STRONG, fontWeight: 600, display: 'inline-block', padding: '6px 0' }}>← Back to the Lifetime Pass</a>
        </nav>
        <PassCheckout palette={palette} layout="order" />
        <p style={{ maxWidth: 1000, margin: '20px auto 0', fontSize: 12.5, lineHeight: 1.6, color: palette.INK2 }}>
          Your name, email and phone are used only to deliver your pass and to answer you, and are shared with our payment provider to process the payment.
          See our <a href="/policies#privacy" style={{ color: palette.PURPLE_STRONG }}>privacy policy</a> and <a href="/policies#terms" style={{ color: palette.PURPLE_STRONG }}>terms</a>.
        </p>
      </main>
      <MantraFooter palette={palette} />
    </div>
  );
}

/** `view` picks the pass pages; otherwise `slug` undefined → the library hub.
 *  An unknown slug returns null so the router can 404. */
export default function MantraStudio({ slug, view }: { slug?: string; view?: 'pass' | 'order' }) {
  if (view === 'pass') return <MantraPassSales />;
  if (view === 'order') return <MantraPassOrder />;
  if (!slug) return <MantraHub />;
  const m = findMantra(slug);
  return m ? <MantraDetail m={m} /> : null;
}
