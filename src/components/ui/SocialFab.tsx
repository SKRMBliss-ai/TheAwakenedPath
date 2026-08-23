import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// SocialFab — the collapsible "connect" floating button used on the course
// sales page, extracted so every surface (home, course, app, tools) shares one
// implementation instead of four drifting copies.
//
// Icons are inline SVG paths (no icon-library import, no network requests) so
// this stays cheap on slow connections.
// ─────────────────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = '918217581238';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to know more.")}`;
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/JegHhDRjo1q72y0c9M3XYF';
const YOUTUBE_URL = 'https://www.youtube.com/@SoulfulIntelligenceStudio?sub_confirmation=1';
const FACEBOOK_URL = 'https://www.facebook.com/skrmbliss';
const TELEGRAM_URL = 'https://t.me/skrmblissai';

const P = {
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z',
  youtube: 'M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814ZM9.999 15.5v-7l6.5 3.5-6.5 3.5Z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z',
  telegram: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z',
};

const LINKS = [
  { url: WHATSAPP_URL, label: 'Chat with us', bg: '#25D366', path: P.whatsapp },
  { url: WHATSAPP_GROUP_URL, label: 'WhatsApp group', bg: '#128C4B', path: P.whatsapp },
  { url: TELEGRAM_URL, label: 'Telegram', bg: '#229ED9', path: P.telegram },
  { url: YOUTUBE_URL, label: 'YouTube', bg: '#FF0000', path: P.youtube },
  { url: FACEBOOK_URL, label: 'Facebook', bg: '#1877F2', path: P.facebook },
];

interface Props {
  /** lifts the button above a sticky bottom bar when one is present */
  raised?: boolean;
  onTrack?: (event: string) => void;
}

export default function SocialFab({ raised = false, onTrack }: Props) {
  const [open, setOpen] = useState(false);

  // Determine bottom spacing: raised for mobile app nav bar, else standard 24px
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const isAppRoute = typeof window !== 'undefined' && (window.location.pathname.startsWith('/mindgym') || window.location.pathname === '/app');
  const effectiveRaised = raised || (isMobile && isAppRoute);

  return (
    <div
      className="si-floating-dock"
      style={{
        position: 'fixed',
        right: isMobile ? 16 : 24,
        bottom: effectiveRaised ? 88 : 24,
        zIndex: 130,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
        transition: 'bottom .3s ease',
      }}
    >
      {open && LINKS.map((l, i) => (
        <a
          key={l.label}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { onTrack?.(`SOCIAL_${l.label.toUpperCase().replace(/\s+/g, '_')}`); setOpen(false); }}
          aria-label={l.label}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
            animation: `sfab-in .18s ease ${i * 0.04}s both`,
          }}
        >
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999,
            background: '#fff', color: '#211A0D', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', whiteSpace: 'nowrap',
          }}>{l.label}</span>
          <span style={{
            width: 44, height: 44, borderRadius: '50%', background: l.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.5)', flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true"><path d={l.path} /></svg>
          </span>
        </a>
      ))}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Connect with us'}
        aria-expanded={open}
        style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: open ? '#211A0D' : '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px -8px rgba(18,140,75,0.6)',
          transition: 'background .25s, transform .2s',
        }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d={P.whatsapp} /></svg>
        )}
      </button>

      <style>{`@keyframes sfab-in{from{opacity:0;transform:translateY(10px) scale(.9)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
