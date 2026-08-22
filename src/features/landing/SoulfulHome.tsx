import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter, SI_LOGO_SRC } from '../../components/site/SiteChrome';
import HeroMark from '../../components/site/HeroMark';

// ── New immersive section components ────────────────────────────────────────
import SacredGeometry from './components/SacredGeometry';
import CursorGlow from './components/CursorGlow';
import HeroSection from './components/HeroSection';
import WhatBringsYou from './components/WhatBringsYou';
import TinyTransformation from './components/TinyTransformation';
import FeatureGrid from './components/FeatureGrid';
import FeaturedCourse from './components/FeaturedCourse';
import InteractiveReflection from './components/InteractiveReflection';
import YouTubeSection from './components/YouTubeSection';
import FreeGuides from './components/FreeGuides';
import AiKnowledgeBlock from './components/AiKnowledgeBlock';
import FinalCta from './components/FinalCta';

// ─────────────────────────────────────────────────────────────────────────────
// Soulful Intelligence — Brand Home (skrmblissai.in root)
// Warm, immersive, editorial. Sacred geometry drifts behind the entire page.
// The "For me / For my business" audience toggle still works; the wellbeing
// world is completely redesigned while the brands world is preserved.
// ─────────────────────────────────────────────────────────────────────────────

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";
const SI_LOGO = SI_LOGO_SRC;
const WHATSAPP = 'https://wa.me/918217581238?text=' + encodeURIComponent("Hi Soulful Intelligence — I'd like to talk about a project.");
const YOUTUBE  = 'https://www.youtube.com/@SoulfulIntelligenceStudio';

const track = (action: string) => {
  try {
    fetch('https://us-central1-awakened-path-2026.cloudfunctions.net/logWebActivity', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'anonymous', action, page: '/', details: action, source: document.referrer || 'direct' }),
    }).catch(() => {});
  } catch (_) { /* silent */ }
};

// Inline icon helper — kept for the Brands section
const Ico = ({ d, size = 26 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.split('|').map((seg, i) => <path key={i} d={seg} />)}
  </svg>
);

const SERVICES = [
  { icon: 'M7 2.5h10a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V4A1.5 1.5 0 0 1 7 2.5Z|M10 5.5h4|M11 18.5h2', title: 'Apps & Websites', body: 'From idea to launch — fast, modern, mobile-first builds.' },
  { icon: 'M3 6.5h18v11H3z|M3 10h18|M7.5 6.5 6 10|M12 6.5 10.5 10|M16.5 6.5 15 10', title: 'YouTube & Content', body: 'Channel setup, editing, thumbnails, and growth management.' },
  { icon: 'M5 9.5h14v9H5z|M9 14h.01M15 14h.01|M12 6.5v3|M12 4.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z|M3 12.5v3M21 12.5v3', title: 'AI Chatbots', body: 'Support, sales & lead-gen bots wired into your business.' },
  { icon: 'M12 3a9 9 0 1 0 0 18c1 0 1.6-.7 1.6-1.5 0-1.4 1-1.9 2-1.9h1.6A3.8 3.8 0 0 0 21 13.8 9 9 0 0 0 12 3Z|M7.5 11.5h.01M10 8h.01M14.5 8h.01', title: 'Graphic Design', body: 'Logos, brand kits, social creative — a look people remember.' },
  { icon: 'M12 3c3.5 2 5.5 5.5 5.5 9.5L14 16h-4l-3.5-3.5C6.5 8.5 8.5 5 12 3Z|M12 10.5a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z|M10 16l-1 4 3-1.6 3 1.6-1-4', title: 'Startup Setup', body: 'Landing pages, funnels, automations — the whole 0-to-1 stack.' },
  { icon: 'M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z', title: '…& everything else', body: 'If a startup needs it, we probably build it. Just ask.' },
];

export default function SoulfulHome() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;
  const INK    = palette.INK;
  const INK2   = palette.INK2;
  const CARD   = palette.CARD;
  const CLAY    = palette.BROWN;

  // ── Audience toggle ──────────────────────────────────────────────────────
  const [audience, setAudience] = useState<'you' | 'brands' | 'products'>(() => {
    if (typeof window === 'undefined') return 'you';
    const param = new URLSearchParams(window.location.search).get('for');
    if (param === 'brands') return 'brands';
    if (param === 'products') return 'products';
    return 'you';
  });

  const chooseAudience = (next: 'you' | 'brands' | 'products') => {
    setAudience(next);
    track(next === 'brands' ? 'HOME_TAB_BRANDS' : next === 'products' ? 'HOME_TAB_PRODUCTS' : 'HOME_TAB_YOU');
    try {
      const url = new URL(window.location.href);
      if (next === 'brands') url.searchParams.set('for', 'brands');
      else if (next === 'products') url.searchParams.set('for', 'products');
      else url.searchParams.delete('for');
      window.history.replaceState({}, '', url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) { /* ignore */ }
  };

  // Master SEO + AEO + GEO Schema Graph setup
  usePageSeo({
    title: 'Soulful Intelligence — Where Soul Meets Intelligence | SKRM Bliss AI',
    description: 'A studio for a quieter mind and braver ideas. Home of Mind Gym, guided courses on emotions and presence, free wellbeing tools, and pay-what-you-feel digital services for brands & startups.',
    url: 'https://www.skrmblissai.in',
    image: 'https://www.skrmblissai.in/og/home.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://www.skrmblissai.in/#organization',
          name: 'Soulful Intelligence Studio',
          alternateName: ['SKRM Bliss AI', 'Soulful Intelligence'],
          url: 'https://www.skrmblissai.in',
          logo: SI_LOGO,
          sameAs: [YOUTUBE, 'https://www.skrmblissai.in/feelingsandemotioncourse', 'https://www.skrmblissai.in/mindgym'],
          description: 'Home of Mind Gym, guided courses on presence and emotions, free wellbeing tools, and pay-what-you-feel digital studio services.',
          founder: {
            '@type': 'Person',
            name: 'Sim Katyal',
            jobTitle: 'Mindfulness & Emotional Intelligence Guide',
          },
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.skrmblissai.in/#website',
          url: 'https://www.skrmblissai.in',
          name: 'SKRM Bliss AI | Soulful Intelligence Studio',
          publisher: {
            '@id': 'https://www.skrmblissai.in/#organization',
          },
          inLanguage: 'en-US',
        },
        {
          '@type': 'SoftwareApplication',
          '@id': 'https://www.skrmblissai.in/mindgym/#app',
          name: 'MindGym',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web, iOS, Android (PWA)',
          url: 'https://www.skrmblissai.in/mindgym',
          description: 'A daily mind training app for presence, emotional mastery, guided breathwork, reflection journaling, and habit tracking.',
          author: {
            '@id': 'https://www.skrmblissai.in/#organization',
          },
        },
      ],
    },
  });

  // ── Intersection Observer for si-reveal elements ─────────────────────────
  useEffect(() => {
    track('PAGE_VISIT_HOME');
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('si-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    // Observe all si-reveal elements that are below the fold
    document.querySelectorAll<HTMLElement>('.si-reveal').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        io.observe(el);
      } else {
        el.classList.add('si-visible');
      }
    });

    return () => io.disconnect();
  }, [audience]);



  // ── Page background color ─────────────────────────────────────────────────
  const pageBg = isDark ? '#0D0A12' : '#F9F5EF';

  return (
    <div style={{
      background: pageBg,
      color: isDark ? '#EDE9E3' : '#2A2118',
      fontFamily: SANS,
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative',
      paddingBottom: 72,  // space for fixed bottom tab bar
    }}>
      {/* ── Sacred geometry — fixed behind the entire page ─────────────────── */}
      <SacredGeometry isDark={isDark} />

      {/* ── Cursor warm glow ─────────────────────────────────────────────── */}
      <CursorGlow />

      {/* ── Navigation header ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <SiteHeader
          palette={palette}
          onToggleTheme={toggleTheme}
          links={audience === 'brands'
            ? [
                { label: 'What we build', href: '#services' },
                { label: 'How it works', href: '#how', secondary: true },
                { label: 'For me', href: '?for=you', secondary: true, onClick: () => chooseAudience('you') },
                { label: 'About Us', href: '/twinsouls/', onClick: () => track('HOME_ABOUT_US') },
              ]
            : [
                { label: 'Mind Gym', href: '#mindgym', onClick: () => chooseAudience('you') },
                { label: 'Course', href: '/feelingsandemotioncourse', onClick: () => track('HOME_COURSE_CLICK') },
                { label: 'Free Guides', href: '#tools', secondary: true, onClick: () => chooseAudience('you') },
                { label: 'Videos', href: '#videos', secondary: true, onClick: () => chooseAudience('you') },
                { label: 'About Us', href: '/twinsouls/', onClick: () => track('HOME_ABOUT_US') },
                { label: 'Sign In', href: '/mindgym', secondary: true, onClick: () => track('HOME_SIGN_IN') },
              ]}
          cta={audience === 'brands'
            ? { label: 'Start a project →', href: WHATSAPP, onClick: () => track('HOME_BRANDS_WHATSAPP') }
            : { label: 'Enter Mind Gym →', href: '/mindgym', onClick: () => track('HOME_ENTER_APP') }}
        />
      </div>

      {/* ── Audience toggle — fixed bottom tab bar ── */}
      <nav
        role="tablist"
        aria-label="Choose what you're here for"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'stretch',
          height: 68,
          background: isDark
            ? 'rgba(13,10,18,0.88)'
            : 'rgba(252,249,245,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}
      >
        {([
          { key: 'you' as const,      label: 'For me',          sub: 'Wellbeing & courses', icon: 'M4 20C4 11 11 4 20 4c0 9-7 16-16 16Z|M9 15c2-3 5-5 8-6' },
          { key: 'brands' as const,   label: 'For my business', sub: 'Websites & apps',      icon: 'M4 7h16v12H4z|M9 7V5h6v2|M4 12h16' },
          { key: 'products' as const, label: 'Our Products',    sub: 'Apps you can use',     icon: 'M5 8h14M5 14h14M8 3v18M16 3v18M3 8h18v8H3z' },
        ]).map((t) => {
          const on = audience === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={on}
              onClick={() => chooseAudience(t.key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '0 8px 8px',
                position: 'relative',
                fontFamily: SANS,
                transition: 'opacity 0.2s',
                color: on
                  ? (isDark ? '#EDE9E3' : '#2A2118')
                  : (isDark ? 'rgba(237,233,227,0.42)' : 'rgba(42,33,24,0.38)'),
              }}
            >
              {/* Gold active indicator line at top */}
              <span style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                right: '20%',
                height: 2.5,
                borderRadius: '0 0 3px 3px',
                background: on ? '#C4913A' : 'transparent',
                transition: 'background 0.25s',
              }} />
              <span style={{ opacity: on ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                <Ico d={t.icon} size={20} />
              </span>
              <span style={{ fontSize: 11, fontWeight: on ? 700 : 500, letterSpacing: '0.01em', lineHeight: 1.2 }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>


      {/* ════════════════════════════════════════════════════════════════════
          FOR YOU — the immersive wellbeing world
         ════════════════════════════════════════════════════════════════════ */}
      {audience === 'you' && (
        <main id="mindgym" style={{ position: 'relative', zIndex: 2 }}>

          {/* 1. Hero */}
          <HeroSection
            palette={palette}
            onStartPractice={() => { track('HOME_HERO_START'); window.location.href = '/mindgym'; }}
            onExploreMindGym={() => { track('HOME_HERO_EXPLORE'); document.getElementById('mindgym-features')?.scrollIntoView({ behavior: 'smooth' }); }}
          />

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 2. What brings you here */}
          <WhatBringsYou palette={palette} />

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 3. Tiny transformation */}
          <TinyTransformation palette={palette} />

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 4. Experience Mind Gym — feature grid */}
          <div id="mindgym-features">
            <FeatureGrid
              palette={palette}
              onExplore={() => { track('HOME_FEATURES_EXPLORE'); window.location.href = '/mindgym'; }}
            />
          </div>

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* Testimonials + stats section removed — it was fabricated social
              proof (invented people and numbers). It goes back only with real,
              consented testimonials and truthful figures. */}

          {/* 6. Featured Course banner */}
          <FeaturedCourse palette={palette} />

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 7. Interactive Reflection */}
          <InteractiveReflection palette={palette} />

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 8. YouTube section */}
          <div id="videos">
            <YouTubeSection palette={palette} onTrack={track} />
          </div>

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 9. Free guides */}
          <div id="tools">
            <FreeGuides palette={palette} />
          </div>

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 9.5 AI Master Knowledge & Citation Hub */}
          <AiKnowledgeBlock palette={palette} />

          {/* Section divider */}
          <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

          {/* 10. Pay-what-you-feel philosophy */}
          <section
            className="si-reveal"
            style={{ padding: 'clamp(56px, 8vw, 80px) clamp(24px, 6vw, 96px)', textAlign: 'center', position: 'relative', zIndex: 2 }}
          >
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{ marginBottom: 18, color: CLAY, display: 'flex', justifyContent: 'center' }}>
                <Ico d={'M8 12V6.5a1.5 1.5 0 0 1 3 0V12|M11 12V5.5a1.5 1.5 0 0 1 3 0V12|M14 12V7a1.5 1.5 0 0 1 3 0v7a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-3a1.5 1.5 0 0 1 3 0'} size={36} />
              </div>
              <p style={{
                fontFamily: SERIF,
                fontSize: 'clamp(20px, 3vw, 30px)',
                fontWeight: 400, fontStyle: 'italic', lineHeight: 1.45,
                color: isDark ? 'rgba(237,233,227,0.85)' : '#4A3C2E',
                margin: '0 0 14px',
              }}>
                "Take what you need. Give what you can. Everything here is offered pay-what-you-feel."
              </p>
              <p style={{ fontFamily: SANS, fontSize: 13, color: isDark ? 'rgba(237,233,227,0.5)' : '#7A5F44', fontWeight: 600 }}>— The Soulful Intelligence promise</p>
            </div>
          </section>

          {/* 11. Final emotional CTA */}
          <FinalCta
            palette={palette}
            onCta={() => track('HOME_FINAL_CTA')}
          />

        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          FOR BRANDS — the digital services world (preserved from original)
         ════════════════════════════════════════════════════════════════════ */}
      {audience === 'brands' && (<>
        {/* Brands hero */}
        <section style={{ position: 'relative', padding: 'clamp(64px, 8vw, 110px) 24px clamp(48px, 6vw, 80px)', textAlign: 'center', overflow: 'hidden', zIndex: 2 }}>
          {/* Ambient Glowing Aura */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 70% at 50% 0%, ${palette.PURPLE}30 0%, ${palette.BROWN}18 40%, transparent 75%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-6%', left: '50%', transform: 'translateX(-50%)', opacity: isDark ? 0.35 : 0.22, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
            <HeroMark palette={palette} size={540} />
          </div>

          <div style={{ position: 'relative', maxWidth: 840, margin: '0 auto' }}>
            {/* Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: isDark ? 'rgba(196,145,58,0.15)' : 'rgba(196,145,58,0.1)',
                border: '1px solid rgba(196,145,58,0.3)',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: isDark ? '#C4913A' : '#7A5F44',
                marginBottom: 24,
              }}
            >
              <Sparkles size={12} /> SOULFUL INTELLIGENCE · DIGITAL STUDIO
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(40px, 5.8vw, 68px)',
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
                margin: '0 0 20px',
                color: INK,
              }}
            >
              We build websites, apps &amp; content for your business.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(16px, 2.2vw, 19px)',
                lineHeight: 1.65,
                color: INK2,
                maxWidth: 640,
                margin: '0 auto 20px',
                fontWeight: 500,
              }}
            >
              The same studio behind Mind Gym also builds digital products for startups and growing brands — websites, mobile apps, content, and AI chatbots. Done properly, and made to last.
            </motion.p>

            {/* Pay What You Feel Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 22px',
                borderRadius: 999,
                background: isDark ? 'rgba(74,50,96,0.25)' : 'rgba(74,50,96,0.08)',
                border: '1px solid rgba(196,145,58,0.35)',
                margin: '0 0 36px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: INK }}>
                And you <span style={{ color: isDark ? '#C4913A' : '#8B6A1A', fontWeight: 800 }}>pay what you feel</span> it&rsquo;s worth.
              </span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('HOME_BRANDS_WHATSAPP')}
                className="si-btn-breathe"
                style={{
                  padding: '16px 36px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #4A3260 0%, #362248 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 10px 32px rgba(74,50,96,0.35)',
                }}
              >
                <MessageCircle size={18} fill="currentColor" /> Start a project →
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02 }}
                href="#services"
                style={{
                  padding: '16px 28px',
                  borderRadius: 999,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
                  color: INK,
                  border: `1px solid ${palette.BORDER}`,
                  textDecoration: 'none',
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  backdropFilter: 'blur(12px)',
                }}
              >
                See what we build
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Services grid */}
        <section id="services" style={{ padding: '30px 24px 72px', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44' }}>
                WHAT WE BUILD
              </span>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 400, margin: '10px 0 0', color: INK }}>
                Everything a startup needs.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {SERVICES.map((s, idx) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -6, boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.45)' : '0 16px 40px rgba(74,50,96,0.12)' }}
                  style={{
                    background: isDark
                      ? 'linear-gradient(145deg, rgba(38,30,22,0.85) 0%, rgba(24,18,14,0.9) 100%)'
                      : 'linear-gradient(145deg, rgba(255,252,247,0.95) 0%, rgba(248,242,233,0.9) 100%)',
                    border: `1.5px solid ${isDark ? 'rgba(196,145,58,0.25)' : 'rgba(196,181,160,0.5)'}`,
                    borderRadius: 24,
                    padding: '30px 24px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.04)',
                    transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  {/* Icon Circular Well */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: isDark ? 'rgba(196,145,58,0.15)' : 'rgba(196,145,58,0.1)',
                      border: '1px solid rgba(196,145,58,0.3)',
                      color: isDark ? '#FFDF9E' : '#7A5F44',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    <Ico d={s.icon} size={26} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: INK, fontFamily: SANS }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: INK2, margin: 0, lineHeight: 1.6, fontFamily: SANS }}>
                    {s.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          style={{
            padding: '64px 24px 80px',
            background: isDark
              ? 'linear-gradient(180deg, rgba(20,15,26,0.9) 0%, rgba(13,10,18,0.95) 100%)'
              : 'linear-gradient(180deg, rgba(244,238,228,0.9) 0%, rgba(250,246,238,0.95) 100%)',
            position: 'relative',
            zIndex: 2,
            borderTop: `1px solid ${palette.BORDER}`,
          }}
        >
          <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44' }}>
              HOW IT WORKS
            </span>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 400, margin: '10px 0 32px', color: INK }}>
              No quotes, no pressure — just tell us what you&rsquo;re building.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
              {[
                { n: '01', t: 'Tell us the idea', b: 'A message on WhatsApp is enough to start.' },
                { n: '02', t: 'We scope it together', b: 'A clear plan — what, when, and how it works.' },
                { n: '03', t: 'Pay what you feel', b: 'You decide what the work is worth to you.' },
              ].map((stepItem, idx) => (
                <motion.div
                  key={stepItem.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  style={{
                    background: CARD,
                    border: `1.5px solid ${isDark ? 'rgba(196,145,58,0.25)' : 'rgba(196,181,160,0.4)'}`,
                    borderRadius: 22,
                    padding: '28px 24px',
                    textAlign: 'left',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: isDark ? '#C4913A' : '#8B6A1A', marginBottom: 8 }}>
                    {stepItem.n}
                  </div>
                  <h4 style={{ fontSize: 16.5, fontWeight: 700, margin: '0 0 6px', color: INK, fontFamily: SANS }}>
                    {stepItem.t}
                  </h4>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.55, fontFamily: SANS }}>
                    {stepItem.b}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('HOME_SERVICES_WHATSAPP')}
              className="si-btn-breathe"
              style={{
                padding: '16px 36px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #4A3260 0%, #362248 100%)',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 10px 32px rgba(74,50,96,0.35)',
              }}
            >
              <MessageCircle size={18} fill="currentColor" /> Start a project on WhatsApp →
            </motion.a>
          </div>
        </section>
      </>)}

      {/* ════════════════════════════════════════════════════════════════════
          OUR PRODUCTS — apps built by Soulful Intelligence Studios
         ════════════════════════════════════════════════════════════════════ */}
      {audience === 'products' && (
        <main style={{ position: 'relative', zIndex: 2 }}>
          <section style={{ padding: '64px 24px 80px', textAlign: 'center' }}>
            <div style={{ maxWidth: 1060, margin: '0 auto' }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44' }}>
                STUDIO PRODUCTS
              </span>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 400, margin: '10px 0 24px', color: INK }}>
                Apps you can use today
              </h2>
              <p style={{ fontSize: 14.5, color: INK2, maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7, fontFamily: SANS }}>
                From habit tracking to piano lessons — these are real products we built. Try them.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {[
                  {
                    emoji: '🎹',
                    title: 'Dyno\'s Song Adventure',
                    desc: 'Teach your child their first piano song — guided parent walkthrough plus a five-level game.',
                    href: 'https://simplypiano.web.app',
                    tag: 'Music Education'
                  },
                  {
                    emoji: '✅',
                    title: 'Bliss Habit Tracker',
                    desc: 'Build habits that stick with daily tracking, streaks, and meaningful progress visualization.',
                    href: 'https://habitquest-2026.web.app',
                    tag: 'Productivity'
                  },
                  {
                    emoji: '📚',
                    title: 'Exam Buddy',
                    desc: 'CBSE Grade 10 study companion with AI-powered explanations and practice tests.',
                    href: 'https://cbse-x-prep-buddy.web.app',
                    tag: 'Learning'
                  },
                ].map((app, idx) => (
                  <motion.a
                    key={app.title}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      background: isDark
                        ? 'linear-gradient(145deg, rgba(38,30,22,0.85) 0%, rgba(24,18,14,0.9) 100%)'
                        : 'linear-gradient(145deg, rgba(255,252,247,0.95) 0%, rgba(248,242,233,0.9) 100%)',
                      border: `1.5px solid ${isDark ? 'rgba(196,145,58,0.25)' : 'rgba(196,181,160,0.5)'}`,
                      borderRadius: 24,
                      padding: '32px 24px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.04)',
                      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: 48, lineHeight: 1, marginBottom: 16 }}>{app.emoji}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: isDark ? '#FFDF9E' : '#7A5F44', marginBottom: 10 }}>
                      {app.tag}
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: INK, fontFamily: SANS }}>
                      {app.title}
                    </h3>
                    <p style={{ fontSize: 13.5, color: INK2, margin: 0, lineHeight: 1.6, fontFamily: SANS, flex: 1 }}>
                      {app.desc}
                    </p>
                    <span style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: isDark ? '#C4913A' : '#7A5F44', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      Open app →
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ── Footer & social fab (shared) ─────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteFooter palette={palette} />
      </div>

      {/* ── Responsive breakpoints ────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          /* Hero: stack on mobile */
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          /* Course banner: stack on mobile */
          .si-course-grid {
            grid-template-columns: 1fr !important;
          }
          /* Reflection: stack on mobile */
          .si-reflection-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .si-hide-sm { display: none !important; }
        }
        /* Card hover for brands section */
        .si-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px -20px rgba(0,0,0,${isDark ? '0.65' : '0.3'}); }
        /* Skeleton sheen */
        .si-skel { position: relative; overflow: hidden; }
        .si-skel::after {
          content: ''; position: absolute; inset: 0; transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)'}, transparent);
          animation: si-sheen 1.5s infinite;
        }
        @keyframes si-sheen { to { transform: translateX(100%); } }
        @media (prefers-reduced-motion: reduce) { .si-skel::after { animation: none; } }
      `}</style>
    </div>
  );
}
