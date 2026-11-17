// ─────────────────────────────────────────────────────────────────────────────
// PathChooser — the home page's "what are you here for?" doors.
//
// Five big cards, grouped by the visitor's need rather than by product, across
// both studios (Soulful Mind Studio and Soulful Mantra Studio), then one
// All Access band. Prices come from the single catalogue, so a price change
// in catalog.ts shows up here without touching this file.
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight, Brain, Baby, GraduationCap, Sparkles, Headphones } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';
import { track } from '../../../lib/analytics';
import { priceOf } from '../../catalog/catalog';
import { VoiceService } from '../../../services/voiceService';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

interface Door {
  id: string;
  studio: 'Soulful Mind Studio' | 'Soulful Mantra Studio';
  need: string;
  title: string;
  body: string;
  price: string;
  cta: string;
  href: string;
  img: string;
  Icon: typeof Brain;
  /** Show the whole picture (transparent artwork) instead of cropping to fill. */
  contain?: boolean;
  /** Wide card on desktop. */
  wide?: boolean;
}

export default function PathChooser({ palette }: { palette: Palette }) {
  const isDark = palette.isDark;
  const sounds = VoiceService.getStorageUrl(`/Soundscapes/Images/sacred-bg-${isDark ? 'dark' : 'light'}.webp`);

  const doors: Door[] = [
    {
      id: 'mindgym', studio: 'Soulful Mind Studio', Icon: Brain, wide: true,
      need: 'For a calmer, clearer mind',
      title: 'Mind Gym',
      body: 'A few quiet minutes a day: practice, journal, breathe, and every course inside one app.',
      price: `Free to start · membership from ${priceOf('membership_monthly')}/month`,
      cta: 'Start free', href: '/mindgym', img: '/mind-gym-product.png',
    },
    {
      id: 'kids', studio: 'Soulful Mind Studio', Icon: Baby,
      need: 'For my child, ages 3 to 12',
      title: 'Kids Mind Gym',
      body: 'Feelings, stories and games, with a live Zoom class and WhatsApp support for you.',
      price: `From ${priceOf('kids_zoom_monthly')}/month`,
      cta: 'See Kids Mind Gym', href: '/tiny-kids-transformations', img: '/marketing/kids/hero-sim-diary.webp',
    },
    {
      id: 'courses', studio: 'Soulful Mind Studio', Icon: GraduationCap,
      need: 'To learn one thing in depth',
      title: 'Courses',
      body: 'Step-by-step courses, laid out day by day. Start with Feelings & Emotions.',
      price: `From ${priceOf('emotion_feelings_course')} · included in membership`,
      cta: 'See the courses', href: '/feelingsandemotioncourse', img: '/feelings/happy.webp',
    },
    {
      id: 'mantras', studio: 'Soulful Mantra Studio', Icon: Sparkles,
      need: 'To chant and pray',
      title: 'Mantras',
      body: 'Sacred chants with their meaning, in playlists for morning, the evening lamp and every festival.',
      price: `Free library · Mantra Pass ${priceOf('mantra_lifetime_pass')} once`,
      cta: 'Open the mantras', href: '/mantras', img: '/marketing/mantras/bowl-lotus.webp', contain: true,
    },
    {
      id: 'music', studio: 'Soulful Mantra Studio', Icon: Headphones,
      need: 'To relax or sleep',
      title: 'Meditation Music',
      body: 'Soft soundscapes for calm, sleep and deep practice, playing on a loop.',
      price: `Listen free · Sounds Pass ${priceOf('sacred_sounds_pass')} once`,
      cta: 'Listen now', href: '/mindgym?tab=music', img: sounds,
    },
  ];

  const card = palette.CARD;

  return (
    <section aria-labelledby="choose-path" className="si-reveal"
      style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto clamp(24px, 4vw, 40px)' }}>
          <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: palette.BROWN }}>
            Two studios · one home
          </span>
          <h2 id="choose-path" style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.1, color: palette.INK, margin: '10px 0 10px' }}>
            Where would you like to begin?
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: palette.INK2, margin: 0 }}>
            Pick the door that fits. Everything works on its own, and everything comes together in All Access.
          </p>
        </div>

        <div className="pc-grid">
          {doors.map(({ id, studio, need, title, body, price, cta, href, img, Icon, wide, contain }) => (
            <a key={id} href={href} onClick={() => track('HOME_DOOR_CLICK', id)} className={`pc-card${wide ? ' pc-wide' : ''}`}
              style={{ background: card, border: `1px solid ${palette.BORDER}`, color: palette.INK }}>
              <span className="pc-img" style={{ background: isDark ? '#1B1714' : '#F1ECE2' }}>
                <img src={img} alt="" loading="lazy" decoding="async" style={contain ? { objectFit: 'contain', padding: '6%' } : undefined} />
              </span>
              <span className="pc-body">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.BROWN }}>
                  <Icon size={15} aria-hidden="true" /> {need}
                </span>
                <span style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 500, lineHeight: 1.1 }}>{title}</span>
                <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: palette.INK2 }}>{body}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: palette.INK }}>{price}</span>
                <span style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 20px', borderRadius: 999,
                    background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontFamily: SANS, fontSize: 14.5, fontWeight: 700 }}>
                    {cta} <ArrowRight size={16} aria-hidden="true" />
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: palette.INK2, textAlign: 'right' }}>{studio}</span>
                </span>
              </span>
            </a>
          ))}
        </div>

        {/* Everything together */}
        <a href="/pricing?select=all_access" onClick={() => track('HOME_DOOR_CLICK', 'all_access')} className="pc-all"
          style={{ background: 'linear-gradient(135deg, #2A2228 0%, #3A2E2A 100%)', color: '#F4F1EA' }}>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E9C98A' }}>
              All Access · everything, both studios
            </span>
            <span style={{ display: 'block', fontFamily: SERIF, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.2, margin: '6px 0 4px' }}>
              Mind Gym, Kids Mind Gym, every course, Mantras and Meditation Music
            </span>
            <span style={{ display: 'block', fontFamily: SANS, fontSize: 14, color: 'rgba(244,241,234,0.8)' }}>
              One payment of {priceOf('all_access')}, yours for life. Or buy any one on its own.
            </span>
          </span>
          <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48, padding: '0 24px', borderRadius: 999,
            background: '#E9C98A', color: '#241E24', fontFamily: SANS, fontSize: 15, fontWeight: 800 }}>
            Get All Access <ArrowRight size={16} aria-hidden="true" />
          </span>
        </a>
      </div>

      <style>{`
        .pc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
        .pc-card { display: flex; flex-direction: column; border-radius: 28px; overflow: hidden; text-decoration: none;
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
        .pc-card:hover, .pc-card:focus-visible { transform: translateY(-4px); border-color: ${palette.PURPLE_STRONG} !important;
          box-shadow: ${isDark ? '0 20px 50px rgba(0,0,0,.55)' : '0 20px 50px rgba(60,40,30,.14)'}; }
        .pc-img { display: grid; place-items: center; aspect-ratio: 16 / 9; overflow: hidden; }
        .pc-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s ease; }
        .pc-card:hover .pc-img img { transform: scale(1.04); }
        .pc-body { display: flex; flex-direction: column; gap: 10px; padding: 22px 24px 24px; flex: 1; }
        .pc-wide { grid-column: 1 / -1; flex-direction: row; }
        .pc-wide .pc-img { flex: 1.1; aspect-ratio: auto; min-height: 300px; }
        .pc-wide .pc-body { flex: 1; justify-content: center; padding: clamp(24px, 3vw, 40px); }
        .pc-all { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px;
          border-radius: 28px; padding: clamp(22px, 3vw, 34px); text-decoration: none; transition: transform .3s ease; }
        .pc-all:hover { transform: translateY(-3px); }
        @media (max-width: 760px) {
          .pc-grid { grid-template-columns: 1fr; }
          .pc-wide { flex-direction: column; }
          .pc-wide .pc-img { aspect-ratio: 16 / 9; min-height: 0; }
          .pc-all { flex-direction: column; align-items: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pc-card, .pc-img img, .pc-all { transition: none; }
          .pc-card:hover, .pc-all:hover { transform: none; }
          .pc-card:hover .pc-img img { transform: none; }
        }
      `}</style>
    </section>
  );
}
