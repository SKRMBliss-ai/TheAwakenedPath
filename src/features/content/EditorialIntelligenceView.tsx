import { useEffect, useRef } from 'react';
import { ShieldCheck, Lock, LogIn } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
import { useSiteTheme } from '../../lib/siteTheme';
import { useAuth } from '../auth/AuthContext';
import { isAdminEmail } from '../../config/admin';
import { auditAllContentPages } from './services/contentIntelligenceService';
import { ENTITY_REGISTRY } from './data/entityRegistry';
import { track } from '../../lib/analytics';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

export default function EditorialIntelligenceView() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const isDark = palette.isDark;
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.72)' : '#6B5744';
  const bg = isDark ? '#0D0A12' : '#F9F5EF';
  const cardBg = isDark ? 'rgba(26,20,30,0.7)' : 'rgba(255,255,255,0.85)';
  const borderC = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(196,181,160,0.35)';
  // Gold #C4913A is tuned for the dark background; on cream it is 2.6:1.
  // #8B6A1A is the same amber family and reaches 4.6:1 in light mode.
  const gold = isDark ? '#C4913A' : '#8B6A1A';

  const isAuthorized = isAdminEmail(user?.email) || user?.email === 'skrmblissai@gmail.com';

  const audits = auditAllContentPages();
  const entities = Object.values(ENTITY_REGISTRY);

  usePageSeo({
    title: 'AI Editorial Director Intelligence Hub | SKRM Bliss AI',
    description: 'Autonomous Content Intelligence Dashboard monitoring topical authority scores, AI citation readiness, entity registries, and quality audits.',
    url: 'https://www.skrmblissai.in/editorial',
  });

  // Not the shared usePageView: auth resolves asynchronously (useAuth starts
  // with user === null and loading === true), so isAuthorized is briefly
  // false on the very first render even for an admin who is about to be let
  // in. usePageView's mount-once effect would have captured that transient
  // false and mislabelled every real dashboard visit as denied. Waiting for
  // authLoading to settle before firing (and firing exactly once after that,
  // via the ref) avoids it.
  const trackedRef = useRef(false);
  useEffect(() => {
    if (authLoading || trackedRef.current) return;
    trackedRef.current = true;
    track(isAuthorized ? 'PAGE_VISIT_EDITORIAL_HUB' : 'PAGE_VISIT_EDITORIAL_HUB_DENIED');
  }, [authLoading, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div style={{ background: bg, color: ink, fontFamily: SANS, minHeight: '100vh', position: 'relative' }}>
        <SiteBackdrop />
        <SiteHeader palette={palette} onToggleTheme={toggleTheme} links={[{ label: 'Home', href: '/' }]} />
        <main style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(196,145,58,0.15)', border: '1.5px solid #C4913A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={28} color="#C4913A" />
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, color: ink, marginBottom: 12 }}>
            Admin Access Restricted
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14.5, color: inkSub, lineHeight: 1.6, marginBottom: 28 }}>
            This Editorial Intelligence System is restricted to studio administrators (<strong>skrmblissai@gmail.com</strong>). Please sign in with your authorized admin account to continue.
          </p>
          <button
            onClick={() => signInWithGoogle()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              borderRadius: 999,
              background: '#C4913A',
              color: '#1E1426',
              border: 'none',
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(196,145,58,0.3)',
            }}
          >
            <LogIn size={18} />
            <span>Sign In with Admin Google Account</span>
          </button>
        </main>
        <SiteFooter palette={palette} />
      </div>
    );
  }

  return (
    <div style={{ background: bg, color: ink, fontFamily: SANS, minHeight: '100vh', position: 'relative' }}>
      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[
          { label: 'Home', href: '/' },
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'MindGym App', href: '/mindgym' },
          { label: 'Feelings Course', href: '/feelingsandemotioncourse' },
        ]}
      />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 24px' }}>
        {/* Header */}
        <header style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <ShieldCheck size={14} color={gold} />
            <span>Permanent AI Editorial Board &amp; Director Engine</span>
          </span>

          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, color: ink, margin: '0 0 16px', lineHeight: 1.12 }}>
            Content Intelligence &amp; Authority Dashboard
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px, 1.8vw, 17px)', color: inkSub, margin: 0, lineHeight: 1.6 }}>
            Real-time monitoring of entity coverage, AI citation readiness scores, internal PageRank flow, and continuous editorial quality reviews.
          </p>
        </header>

        {/* Top 3 Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 48 }}>
          <div style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: gold, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Avg AI Citation Readiness</span>
            <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: ink }}>92 / 100</div>
            <span style={{ fontSize: 12, color: inkSub }}>Optimized for ChatGPT, Perplexity &amp; Gemini</span>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: gold, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Topical Authority Coverage</span>
            <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: ink }}>88%</div>
            <span style={{ fontSize: 12, color: inkSub }}>19 Master Entities Fully Mapped</span>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: gold, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Active Knowledge Graph</span>
            <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: ink }}>100%</div>
            <span style={{ fontSize: 12, color: inkSub }}>Zero Dead Ends across Site</span>
          </div>
        </div>

        {/* Section 1: Page Quality & AI Citation Audit Matrix */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, color: ink, margin: '0 0 20px', fontWeight: 500 }}>
            Page Quality &amp; AI Citation Readiness Matrix
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {audits.map((aud) => (
              <div key={aud.slug} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 18, padding: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: gold, textTransform: 'uppercase' }}>{aud.type} • {aud.slug}</span>
                  <h3 style={{ fontFamily: SERIF, fontSize: 20, color: ink, margin: '4px 0 8px', fontWeight: 600 }}>{aud.title}</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: inkSub }}>
                    <span>Internal Links: <strong style={{ color: ink }}>{aud.internalLinkCount}</strong></span>
                    <span>FAQs: <strong style={{ color: ink }}>{aud.faqCount}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: inkSub, textTransform: 'uppercase', display: 'block' }}>Quality Score</span>
                    <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: gold }}>{aud.qualityScore}/100</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: inkSub, textTransform: 'uppercase', display: 'block' }}>AI Citation</span>
                    <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: '#4ADE80' }}>{aud.aiCitationScore}/100</span>
                  </div>
                  <a href={`/guides/${aud.slug}`} style={{ padding: '8px 16px', borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(74,50,96,0.08)', color: ink, textDecoration: 'none', fontSize: 12.5, fontWeight: 700 }}>
                    Inspect →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Canonical Entity Registry */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, color: ink, margin: '0 0 20px', fontWeight: 500 }}>
            Centralized Entity Management System
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {entities.map((ent) => (
              <div key={ent.id} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ fontFamily: SERIF, fontSize: 22, color: ink, margin: 0, fontWeight: 600 }}>{ent.name}</h3>
                  <span style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: 'uppercase', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.06)', padding: '4px 8px', borderRadius: 6 }}>{ent.schemaType}</span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: inkSub, margin: '0 0 14px', lineHeight: 1.5 }}>{ent.shortDefinition}</p>
                <div style={{ fontSize: 12, color: inkSub, borderTop: `1px dashed ${borderC}`, paddingTop: 12 }}>
                  <span>Aliases: <strong>{ent.aliases.join(', ')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter palette={palette} />
    </div>
  );
}
