import { useState } from 'react';
import type { Palette } from '../../lib/siteTheme';

// ─────────────────────────────────────────────────────────────────────────────
// SiteChrome — the one header and footer used by every public surface:
// the brand home, the course sales page, the quiz and policy landings, and
// (via a mirrored copy) the /twinsouls portfolio.
//
// Everything is inline-styled from the palette so a single component serves
// light and dark without a stylesheet, and the logo is a self-hosted webp so
// it costs one small same-origin request instead of a Firebase Storage
// round-trip on the critical path.
// ─────────────────────────────────────────────────────────────────────────────

export const SI_LOGO_SRC = '/si-logo-light.webp';
export const SERIF = "'Cormorant Garamond', Georgia, serif";
export const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

const YOUTUBE_URL = 'https://www.youtube.com/@SoulfulIntelligenceStudio?sub_confirmation=1';
const TELEGRAM_URL = 'https://t.me/skrmblissai';
const FACEBOOK_URL = 'https://www.facebook.com/skrmbliss';
const WHATSAPP_URL = 'https://wa.me/918217581238';

export interface NavLink {
  label: string;
  href: string;
  /** hidden on narrow screens when true */
  secondary?: boolean;
  onClick?: () => void;
}

/** The brand mark. `stacked` shows the wordmark beneath, for footers. */
export function SiteLogo({ size = 40, showText = true, palette }: {
  size?: number; showText?: boolean; palette: Palette;
}) {
  return (
    <>
      <img
        src={SI_LOGO_SRC}
        alt="Soulful Intelligence Studio"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        style={{
          borderRadius: '50%',
          flexShrink: 0,
          boxShadow: `0 0 0 1px ${palette.isDark ? 'rgba(201,174,142,0.45)' : 'rgba(122,95,68,0.35)'}`,
        }}
      />
      {showText && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: palette.INK }}>
            Soulful Intelligence
          </span>
          <span style={{
            fontSize: 8.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: palette.BROWN, marginTop: 3,
          }}>
            Where soul meets intelligence
          </span>
        </span>
      )}
    </>
  );
}

function ThemeToggle({ palette, onToggle }: { palette: Palette; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={palette.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={palette.isDark ? 'Light mode' : 'Dark mode'}
      style={{
        width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
        background: 'transparent', border: `1px solid ${palette.BORDER}`, color: palette.INK2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color .2s, color .2s',
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {palette.isDark
          ? <><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" /></>
          : <path d="M20.5 14.4A8.5 8.5 0 1 1 9.6 3.5a6.8 6.8 0 0 0 10.9 10.9Z" />}
      </svg>
    </button>
  );
}

/**
 * Sticky site header. `cta` is the one filled button on the right; pass null on
 * pages that already have a stronger call to action in view.
 */
export function SiteHeader({ palette, onToggleTheme, links, cta, onLogoClick, showThemeToggle = true }: {
  palette: Palette;
  onToggleTheme: () => void;
  links: NavLink[];
  cta?: { label: string; href: string; onClick?: () => void } | null;
  onLogoClick?: () => void;
  /** Hide on pages that are deliberately single-theme, so the control never
   *  appears to do nothing. */
  showThemeToggle?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const shell = palette.isDark ? 'rgba(21,18,15,0.90)' : 'rgba(244,241,234,0.90)';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 60, background: shell,
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${palette.BORDER}`,
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        {/* flexShrink: 0 — this is a sibling of the nav row in a space-between
            flex parent. With the old minWidth: 0 (no flexShrink override) the
            row's shrink math could collapse the logo's width toward 0 before
            the nav row's own 900px breakpoint kicked in, which visually
            slid the nav links left on top of the "Soulful Intelligence"
            wordmark instead of the two staying side by side. */}
        <a href="/" onClick={onLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', flexShrink: 0 }}>
          <SiteLogo palette={palette} size={64} />
        </a>

        <nav className="si-nav-row" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={l.onClick}
              className={`si-nav${l.secondary ? ' si-hide-sm' : ''}`}
              style={{
                color: palette.INK2,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                padding: '6px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 32,
              }}
            >
              {l.label}
            </a>
          ))}
          {showThemeToggle && <ThemeToggle palette={palette} onToggle={onToggleTheme} />}
          {cta && (
            <a
              href={cta.href}
              onClick={cta.onClick}
              className="si-hide-sm"
              style={{
                background: palette.PURPLE_STRONG, color: palette.isDark ? '#15120F' : '#fff',
                padding: '9px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              {cta.label}
            </a>
          )}
        </nav>

        {/* Burger — only rendered on narrow screens by the stylesheet below */}
        <button
          className="si-burger"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          style={{
            display: 'none', width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${palette.BORDER}`, color: palette.INK,
            alignItems: 'center', justifyContent: 'center',
            // Without this the flex row shrinks the button to ~19px wide on a
            // 375px viewport, putting the primary mobile nav control under the
            // 24px minimum (WCAG 2.2 §2.5.8). Height was never the problem.
            flexShrink: 0, minWidth: 34,
          }}
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${palette.BORDER}`, background: shell, padding: '10px 20px 16px' }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => { l.onClick?.(); setOpen(false); }}
              style={{
                display: 'block', padding: '11px 2px', color: palette.INK, textDecoration: 'none',
                fontSize: 15, fontWeight: 600, borderBottom: `1px solid ${palette.BORDER}`,
              }}
            >
              {l.label}
            </a>
          ))}
          {cta && (
            <a
              href={cta.href}
              onClick={() => { cta.onClick?.(); setOpen(false); }}
              style={{
                display: 'block', marginTop: 14, textAlign: 'center', background: palette.PURPLE_STRONG,
                color: palette.isDark ? '#15120F' : '#fff', padding: '13px 18px', borderRadius: 999,
                fontWeight: 800, fontSize: 14, textDecoration: 'none',
              }}
            >
              {cta.label}
            </a>
          )}
        </div>
      )}

      <style>{`
        .si-nav:hover { color: ${palette.PURPLE_STRONG} !important; }
        @media (max-width: 860px) {
          .si-hide-sm { display: none !important; }
          .si-nav-row { gap: 12px; }
        }
        @media (max-width: 900px) {
          /* 640px was too low a threshold: a page like the course sales page
             passes 7 nav links (none marked secondary), which don't fit next
             to the logo even at iPad Air width (820px) — they wrapped onto
             the wordmark exactly like the phone-width bug this block was
             originally written to fix. 900px covers phones AND tablets in
             portrait, so the full link row only ever renders where it
             actually has room.
             Needs !important — each link also carries an inline
             display:'inline-flex' (for icon/text alignment on desktop),
             and inline styles beat a plain class rule regardless of
             media query, so without this the links stayed visible and
             overlapped the wordmark instead of collapsing to the burger. */
          .si-nav-row .si-nav { display: none !important; }
          .si-burger { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

const SOCIALS: { label: string; url: string; d: string }[] = [
  { label: 'YouTube', url: YOUTUBE_URL, d: 'M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814ZM9.999 15.5v-7l6.5 3.5-6.5 3.5Z' },
  { label: 'Telegram', url: TELEGRAM_URL, d: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z' },
  { label: 'WhatsApp', url: WHATSAPP_URL, d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z' },
  { label: 'Facebook', url: FACEBOOK_URL, d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z' },
];

const FOOTER_COLS: { title: string; items: NavLink[] }[] = [
  {
    title: 'Practise',
    items: [
      { label: 'Mind Gym', href: '/mindgym' },
      { label: 'Feelings & Emotions course', href: '/feelingsandemotioncourse' },
      { label: 'Emotional health check', href: '/knowyouremotionalhealth' },
      { label: 'About Mind Gym', href: '/aboutmindgym' },
    ],
  },
  {
    title: 'Studio',
    items: [
      { label: 'About us', href: '/about-us' },
      { label: 'Digital services', href: '/#services' },
      { label: 'Videos', href: '/#videos' },
      { label: 'YouTube channel', href: YOUTUBE_URL },
    ],
  },
  {
    title: 'Contact & legal',
    items: [
      { label: 'connect@skrmblissai.in', href: 'mailto:connect@skrmblissai.in' },
      { label: 'WhatsApp +91 82175 81238', href: WHATSAPP_URL },
      { label: 'Privacy', href: '/policies#privacy' },
      { label: 'Terms', href: '/policies#terms' },
      { label: 'Refunds', href: '/policies#refund' },
    ],
  },
];

/** Site-wide footer: brand block, three link columns, socials, legal line. */
export function SiteFooter({ palette }: { palette: Palette }) {
  return (
    <footer style={{
      background: palette.isDark ? '#100D0B' : palette.BG2,
      borderTop: `1px solid ${palette.BORDER}`,
      color: palette.INK2, fontFamily: SANS,
    }}>
      <div className="si-foot-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '52px 20px 28px' }}>
        <div className="si-foot-top" style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>
          <div className="si-foot-brand" style={{ maxWidth: 300, minWidth: 240 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 14 }}>
              <SiteLogo palette={palette} size={44} />
            </a>
            <p className="si-foot-desc" style={{ fontSize: 13.5, lineHeight: 1.7, margin: '0 0 16px', color: palette.INK2 }}>
              A studio for a quieter mind and braver ideas — practices, a course,
              free tools, and digital work made with care.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: `1px solid ${palette.BORDER}`, color: palette.INK2,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Grid on mobile (two link columns side by side, tight rhythm)
              instead of each column stacking full-width — that's what made
              the mobile footer scroll on for so long. Desktop keeps the
              original flex-wrap layout untouched. */}
          <div className="si-foot-cols">
            {FOOTER_COLS.map((col) => (
              <div key={col.title} style={{ minWidth: 150 }}>
                <h3 className="si-foot-heading" style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: palette.BROWN, margin: '0 0 14px',
                }}>
                  {col.title}
                </h3>
                {/* gap is tight because each link now carries its own vertical
                    padding to reach the 32px tap target — without this the column
                    rhythm would jump from 28px to 42px. */}
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <a
                        className="si-foot-link"
                        href={it.href}
                        {...(it.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        style={{
                          color: palette.INK2,
                          textDecoration: 'none',
                          fontSize: 13.5,
                          // WCAG 2.2 §2.5.8 Target Size (Minimum). These rendered
                          // ~18px tall. Padding is vertical-only so the column
                          // stays flush-left; widths were already over 24px.
                          display: 'inline-flex',
                          alignItems: 'center',
                          minHeight: 32,
                          padding: '6px 0',
                        }}
                      >
                        {it.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="si-foot-legal" style={{
          marginTop: 40, paddingTop: 20, borderTop: `1px solid ${palette.BORDER}`,
          display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between',
          fontSize: 12, color: palette.INK2,
        }}>
          <span>&copy; {new Date().getFullYear()} SKRM Bliss AI</span>
          <span>Terms & Privacy below</span>
        </div>
      </div>

      <style>{`
        .si-foot-link:hover { color: ${palette.PURPLE_STRONG} !important; }
        /* Desktop had NO rule here at all, so this stayed a plain block and
           the three link groups stacked one under another in the flex row's
           right slot — a single column fifteen links tall beside an empty
           middle. They are columns; lay them out as columns. */
        .si-foot-cols {
          display: grid;
          grid-template-columns: repeat(3, minmax(150px, 1fr));
          gap: 32px;
          flex: 1;
          max-width: 660px;
        }
        /* iPad fell through to the original flex-wrap layout (the 2-column
           grid only kicked in below 640px), so each link column had no
           partner beside it and stretched to the leftover width next to the
           brand block — one narrow column, three names tall. Grid this
           range too so tablet gets the same 2-up columns as phone. */
        @media (max-width: 1024px) {
          .si-foot-cols {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 28px 24px;
            width: 100%;
          }
          .si-foot-top { gap: 32px !important; }
        }
        @media (max-width: 640px) {
          .si-foot-pad { padding: 28px 20px 16px !important; }
          .si-foot-top { gap: 20px !important; }
          .si-foot-desc { margin-bottom: 10px !important; font-size: 12.5px !important; }
          .si-foot-cols { gap: 18px 14px; }
          .si-foot-heading { margin-bottom: 6px !important; }
          /* Tightened to the WCAG 2.2 §2.5.8 floor (24px) instead of the
             32px used elsewhere — still compliant, just less generous, so
             five stacked links per column don't eat the whole screen. */
          .si-foot-link { min-height: 24px !important; padding: 3px 0 !important; font-size: 13px !important; }
          .si-foot-legal { margin-top: 20px !important; padding-top: 14px !important; }
        }
      `}</style>
    </footer>
  );
}
