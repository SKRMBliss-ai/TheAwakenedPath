import { useRef, useState } from 'react';
import { ArrowRight, Bell, Sparkles, Volume2, ShieldCheck, ChevronLeft, ChevronRight, Moon, Flame, Play, X } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';
import { track } from '../../../lib/analytics';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

interface FeaturedMantra {
  name: string;
  deity: string;
  tagline: string;
  cover: string;
  slug: string;
}

const FEATURED_MANTRAS: FeaturedMantra[] = [
  {
    name: 'Om Namah Shivaya',
    deity: 'Lord Shiva',
    tagline: 'Inner stillness & dissolution of fear',
    cover: '/marketing/mantras/covers/shiva-meditation-ganga.webp',
    slug: 'om-namah-shivaya',
  },
  {
    name: 'Om Gan Ganapataye Namah',
    deity: 'Lord Ganesha',
    tagline: 'Removal of obstacles & auspicious beginnings',
    cover: '/marketing/mantras/covers/om-gan-ganapataye-namah.webp',
    slug: 'om-gan-ganapataye-namah',
  },
  {
    name: 'Maha Lakshmi Gayatri',
    deity: 'Maa Lakshmi',
    tagline: 'Abundance, grace & inner radiance',
    cover: '/marketing/mantras/covers/lakshmi-lotus-coins.webp',
    slug: 'om-mahalakshmyai-cha-vidmahe',
  },
  {
    name: 'Saraswati Vandana',
    deity: 'Maa Saraswati',
    tagline: 'Wisdom, clarity of speech & creative focus',
    cover: '/marketing/mantras/covers/saraswati-veena.webp',
    slug: 'saraswati-vandana',
  },
  {
    name: 'Dhanvantari Mantra',
    deity: 'Lord Dhanvantari',
    tagline: 'Holistic health, healing & vitality',
    cover: '/marketing/mantras/covers/dhanvantari-nectar-kalash.webp',
    slug: 'om-namo-bhagavate-vasudevaya-dhanvantaraye',
  },
  {
    name: 'Durga Durgatinashini',
    deity: 'Maa Durga',
    tagline: 'Divine protection, strength & courage',
    cover: '/marketing/mantras/covers/durga-lion.webp',
    slug: 'sarva-mangala-mangalye',
  },
  {
    name: 'Surya Gayatri',
    deity: 'Surya Dev',
    tagline: 'Energy, morning vitality & vitality of soul',
    cover: '/marketing/mantras/covers/surya-rising-sun.webp',
    slug: 'om-adityaya-vidmahe',
  },
  {
    name: 'Tulsi Aarti & Stotram',
    deity: 'Tulsi Maharani',
    tagline: 'Purity, home harmony & sacred devotion',
    cover: '/marketing/mantras/covers/tulsi-vrindavan-diya.webp',
    slug: 'vrinda-vrinda-tulsi-namaha',
  },
];

export default function MantrasNewOffering({ palette }: { palette: Palette }) {
  const isDark = palette.isDark;
  const railRef = useRef<HTMLDivElement>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const scrollRail = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section
      aria-label="New Offering: Soulful Mantra Studio"
      className="si-reveal"
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(50px, 7vw, 90px) clamp(16px, 4vw, 40px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* ── 1. Section Eyebrow & Header ─────────────────────────────────── */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto clamp(28px, 4vw, 44px)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              background: isDark ? 'rgba(216,174,94,0.14)' : 'rgba(216,174,94,0.18)',
              border: '1px solid rgba(216,174,94,0.4)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: isDark ? '#E9C98A' : '#8B6A1A',
              marginBottom: 16,
            }}
          >
            <Flame size={13} color="#E9C98A" />
            NEW OFFERING · SOULFUL MANTRA STUDIO
          </div>

          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(36px, 5.2vw, 56px)',
              fontWeight: 400,
              lineHeight: 1.1,
              color: palette.INK,
              margin: '0 0 14px',
            }}
          >
            Where sacred sound meets stillness.
          </h2>

          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px, 2vw, 17px)',
              lineHeight: 1.65,
              color: palette.INK2,
              margin: '0 auto',
            }}
          >
            A quiet, ad-free digital sanctuary created specifically for the rhythm of your home and daily practice.
            Listen to 25+ sacred Vedic chants with Devanagari text, word meanings, a smart 108 mala counter, and 1-tap puja sequences.
          </p>
        </div>

        {/* ── 2. Showcase Feature Card ────────────────────────────────────── */}
        <div
          style={{
            background: palette.CARD,
            border: `1px solid ${palette.BORDER}`,
            borderRadius: 32,
            padding: 'clamp(24px, 4vw, 40px)',
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.5)' : '0 20px 50px rgba(60,40,30,0.08)',
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
              gap: 'clamp(24px, 4vw, 48px)',
              alignItems: 'center',
            }}
            className="mo-feature-grid"
          >
            {/* Visual: Mantra Pass Walkthrough Video */}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 24,
                  overflow: 'hidden',
                  aspectRatio: '16 / 9',
                  background: '#0D0A12',
                  border: `1.5px solid ${isDark ? 'rgba(233,201,138,0.35)' : 'rgba(216,174,94,0.45)'}`,
                  boxShadow: isDark
                    ? '0 24px 60px rgba(0,0,0,0.6), 0 0 32px rgba(216,174,94,0.18)'
                    : '0 20px 50px rgba(60,40,30,0.18), 0 0 28px rgba(216,174,94,0.22)',
                }}
              >
                {!isPlayingVideo ? (
                  <div
                    onClick={() => {
                      setIsPlayingVideo(true);
                      track('HOME_MANTRAS_VIDEO_PLAY');
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Play Mantra Pass Walkthrough Video"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsPlayingVideo(true);
                        track('HOME_MANTRAS_VIDEO_PLAY');
                      }
                    }}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      display: 'block',
                      overflow: 'hidden',
                    }}
                    className="group"
                  >
                    <img
                      src="/marketing/mantras/mantra-pass-video-poster.webp"
                      alt="Mantra Pass Walkthrough — Chant in Peace with 108 Mala Counter"
                      loading="lazy"
                      width={1280}
                      height={720}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      className="group-hover:scale-105"
                    />

                    {/* Gradient depth vignette */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.52) 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Top Pill Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 999,
                        background: 'rgba(15,10,20,0.82)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(233,201,138,0.45)',
                        color: '#E9C98A',
                        fontFamily: SANS,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <Play size={12} fill="#E9C98A" />
                      <span>1-Min Walkthrough</span>
                    </div>

                    {/* Center Pulsing Play Button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: 68,
                          height: 68,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Outer animated ripple */}
                        <div
                          className="mo-play-ripple"
                          style={{
                            position: 'absolute',
                            inset: -8,
                            borderRadius: '50%',
                            border: '2px solid rgba(233,201,138,0.7)',
                            pointerEvents: 'none',
                          }}
                        />
                        {/* Circle button */}
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #F5DC9C 0%, #D8AE5E 100%)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.6), 0 0 28px rgba(216,174,94,0.65)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
                          }}
                          className="group-hover:scale-110"
                        >
                          <Play size={24} fill="#1A140B" color="#1A140B" style={{ marginLeft: 3 }} />
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: SANS,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          color: '#FFFFFF',
                          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                          background: 'rgba(0,0,0,0.55)',
                          padding: '4px 12px',
                          borderRadius: 999,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        Watch Walkthrough
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/KluTr0iPoJk?autoplay=1&rel=0&modestbranding=1&playsinline=1"
                      title="Mantra Pass Walkthrough Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(false)}
                      aria-label="Close video player"
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.78)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                      className="hover:opacity-80"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Pill Under Video */}
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: palette.INK2,
                  fontFamily: SANS,
                }}
              >
                <Sparkles size={14} color="#D8AE5E" />
                <span>Walkthrough · 108 Mala counter, ad-free sacred chanting &amp; puja sequences</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isDark ? '#E9C98A' : '#8B6A1A',
                  }}
                >
                  THE MANTRA PASS EXPERIENCE
                </span>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(26px, 3vw, 34px)',
                    fontWeight: 500,
                    lineHeight: 1.15,
                    color: palette.INK,
                    margin: '6px 0 10px',
                  }}
                >
                  Designed for quiet devotion, not counting beads.
                </h3>
                <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: palette.INK2, margin: 0 }}>
                  Streaming platforms interrupt sacred moments with noisy advertisements. The Mantra Pass is your peaceful, ad-free temple at home.
                </p>
              </div>

              {/* 4 Core Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="mo-pillars-grid">
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${palette.BORDER}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: palette.PURPLE_STRONG, marginBottom: 4 }}>
                    <Bell size={16} />
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: palette.INK }}>108 Mala Counter</span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.45, color: palette.INK2, margin: 0 }}>
                    Rings a soft temple bell chime at 108 repetitions.
                  </p>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${palette.BORDER}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: palette.PURPLE_STRONG, marginBottom: 4 }}>
                    <Sparkles size={16} />
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: palette.INK }}>1-Tap Puja Sequences</span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.45, color: palette.INK2, margin: 0 }}>
                    Complete festival chanting order for Diwali & Navratri.
                  </p>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${palette.BORDER}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: palette.PURPLE_STRONG, marginBottom: 4 }}>
                    <Volume2 size={16} />
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: palette.INK }}>Sanskrit & Meaning</span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.45, color: palette.INK2, margin: 0 }}>
                    Authentic text with Hindi & English word translations.
                  </p>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${palette.BORDER}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: palette.PURPLE_STRONG, marginBottom: 4 }}>
                    <Moon size={16} />
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: palette.INK }}>Sankalp & Sleep Timer</span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.45, color: palette.INK2, margin: 0 }}>
                    21 & 40-day discipline tracker with gentle night loop.
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6 }}>
                <a
                  href="/mantras/lifetime-pass"
                  onClick={() => track('HOME_MANTRAS_PASS_CTA')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #E9C98A 0%, #D8AE5E 100%)',
                    color: '#1A140B',
                    fontFamily: SANS,
                    fontSize: 14.5,
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(216,174,94,0.3)',
                  }}
                >
                  Get Mantra Pass (₹999 once) <ArrowRight size={16} />
                </a>

                <a
                  href="/mantras"
                  onClick={() => track('HOME_MANTRAS_EXPLORE_CTA')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 20px',
                    borderRadius: 999,
                    background: 'transparent',
                    border: `1.5px solid ${palette.BORDER}`,
                    color: palette.INK,
                    fontFamily: SANS,
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Explore Free Library →
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingVideo(true);
                    track('HOME_MANTRAS_WATCH_VIDEO_BTN');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 18px',
                    borderRadius: 999,
                    background: isDark ? 'rgba(233,201,138,0.1)' : 'rgba(216,174,94,0.12)',
                    border: `1.5px solid ${isDark ? 'rgba(233,201,138,0.35)' : 'rgba(216,174,94,0.45)'}`,
                    color: isDark ? '#E9C98A' : '#7D5A18',
                    fontFamily: SANS,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:scale-105 active:scale-95"
                >
                  <Play size={14} fill="currentColor" /> Watch Walkthrough
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: palette.INK2, fontFamily: SANS }}>
                <ShieldCheck size={14} color="#85C27E" />
                <span>One-time payment · Lifetime access · Free future mantras · 14-day refund guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Mantra Artwork Rail ──────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 400, margin: 0, color: palette.INK }}>
                Explore Sacred Recordings
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: palette.INK2, fontFamily: SANS }}>
                Tap any chant to view lyrics, word-by-word meaning, and audio in the library.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollRail(-1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: palette.CARD,
                  color: palette.INK,
                  border: `1px solid ${palette.BORDER}`,
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollRail(1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: palette.CARD,
                  color: palette.INK,
                  border: `1px solid ${palette.BORDER}`,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={railRef}
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: 12,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="mo-rail"
          >
            {FEATURED_MANTRAS.map((m) => (
              <a
                key={m.slug}
                href={`/mantras/${m.slug}`}
                onClick={() => track('HOME_MANTRAS_CARD_CLICK', m.slug)}
                style={{
                  flex: '0 0 240px',
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: palette.CARD,
                  border: `1px solid ${palette.BORDER}`,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, border-color 0.25s ease',
                }}
                className="mo-card"
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden', background: '#1C1425' }}>
                  <img
                    src={m.cover}
                    alt={m.name}
                    loading="lazy"
                    width={240}
                    height={150}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'rgba(10,8,6,0.72)',
                      backdropFilter: 'blur(4px)',
                      fontSize: 9.5,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#E9CFA4',
                    }}
                  >
                    {m.deity}
                  </span>
                </div>
                <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 16.5,
                      fontWeight: 600,
                      color: palette.INK,
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {m.name}
                  </span>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 12,
                      color: palette.INK2,
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {m.tagline}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .mo-card:hover { transform: translateY(-4px); border-color: ${palette.PURPLE_STRONG} !important; }
        .mo-rail::-webkit-scrollbar { display: none; }
        @keyframes moRipple {
          0% { transform: scale(0.92); opacity: 0.85; }
          50% { transform: scale(1.18); opacity: 0.35; }
          100% { transform: scale(1.36); opacity: 0; }
        }
        .mo-play-ripple {
          animation: moRipple 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        @media (max-width: 900px) {
          .mo-feature-grid { grid-template-columns: 1fr !important; }
          .mo-pillars-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
