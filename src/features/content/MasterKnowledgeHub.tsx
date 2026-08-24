import { useState } from 'react';
import { Sparkles, Compass, ArrowRight, Play, Search } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
import { useSiteTheme } from '../../lib/siteTheme';
import { ARTICLES_REGISTRY, GLOSSARY_REGISTRY, VIDEO_REGISTRY, TOPIC_HUBS } from './data/contentEngineData';
import { usePageView } from '../../lib/analytics';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

export default function MasterKnowledgeHub() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.72)' : '#6B5744';
  const bg = isDark ? '#0D0A12' : '#F9F5EF';
  const cardBg = isDark ? 'rgba(26,20,30,0.7)' : 'rgba(255,255,255,0.85)';
  const borderC = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(196,181,160,0.35)';
  // #C4913A is tuned for the dark background (6.98:1). On the light cream it
  // drops to 2.59:1, so small uppercase labels using this token failed WCAG AA.
  // #8B6A1A is the same amber family (already the gold used in the daily email)
  // and reaches 4.63:1 on #F9F5EF.
  const gold = isDark ? '#C4913A' : '#8B6A1A';

  const [activeTab, setActiveTab] = useState<'all' | 'guides' | 'glossary' | 'videos' | 'journeys'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = Object.values(ARTICLES_REGISTRY);
  const glossary = Object.values(GLOSSARY_REGISTRY);
  const videos = Object.values(VIDEO_REGISTRY);

  usePageSeo({
    title: 'Master Knowledge Platform | SKRM Bliss AI',
    description: 'Explore our interconnected knowledge ecosystem for meditation, presence, witness consciousness, emotional intelligence, and overthinking recovery.',
    url: 'https://www.skrmblissai.in/knowledge',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'DataCatalog',
      name: 'Master Knowledge Platform',
      url: 'https://www.skrmblissai.in/knowledge',
      publisher: {
        '@type': 'Organization',
        name: 'Soulful Intelligence Studio',
        url: 'https://www.skrmblissai.in',
      },
    },
  });

  usePageView('PAGE_VISIT_KNOWLEDGE_HUB');

  return (
    <div style={{ background: bg, color: ink, fontFamily: SANS, minHeight: '100vh', position: 'relative' }}>
      <SiteBackdrop />
      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[
          { label: 'Home', href: '/' },
          { label: 'MindGym App', href: '/mindgym' },
          { label: 'Feelings Course', href: '/feelingsandemotioncourse' },
          { label: 'Quiz', href: '/knowyouremotionalhealth' },
        ]}
      />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(48px, 6vw, 88px) 24px' }}>
        {/* Master Header */}
        <header style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 56px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Sparkles size={14} color={gold} />
            <span>World-Class Knowledge Platform</span>
          </span>

          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 400, color: ink, margin: '0 0 16px', lineHeight: 1.12 }}>
            Meditation, Presence &amp; Emotional Intelligence Directory
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px, 2vw, 18px)', color: inkSub, margin: '0 0 32px', lineHeight: 1.6 }}>
            An interconnected knowledge base connecting guides, glossary terms, guided video masterclasses, and daily MindGym practices.
          </p>

          {/* Interactive Search Bar */}
          <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
            <Search size={20} color={gold} style={{ position: 'absolute', left: 18, top: 16 }} />
            <input
              type="text"
              placeholder="Search concepts (e.g. 'presence', 'overthinking', 'observer')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 52px',
                borderRadius: 999,
                background: cardBg,
                border: `1px solid ${borderC}`,
                color: ink,
                fontSize: 15,
                fontFamily: SANS,
                outline: 'none',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.4)' : '0 10px 30px rgba(60,40,20,0.06)',
              }}
            />
          </div>
        </header>

        {/* Visual Topic Hubs Row */}
        <section aria-label="Topic Hubs" style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, color: ink, margin: '0 0 20px', fontWeight: 500 }}>
            Explore Core Topic Hubs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {TOPIC_HUBS.map((hub) => (
              <div key={hub.id} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 24, padding: 28, backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Compass size={20} color={gold} />
                  <h3 style={{ fontFamily: SERIF, fontSize: 22, color: ink, margin: 0, fontWeight: 600 }}>{hub.name}</h3>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub, margin: '0 0 16px', lineHeight: 1.5 }}>{hub.tagline}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {hub.featuredArticleSlugs.map((slug) => (
                    <a key={slug} href={`/guides/${slug}`} style={{ fontSize: 12, fontWeight: 700, color: ink, textDecoration: 'none', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.08)', padding: '6px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>{ARTICLES_REGISTRY[slug]?.title.split(':')[0] || slug}</span>
                      <ArrowRight size={12} color={gold} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32, borderBottom: `1px solid ${borderC}`, paddingBottom: 16 }}>
          {(['all', 'guides', 'glossary', 'videos', 'journeys'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                border: 'none',
                background: activeTab === tab ? (isDark ? '#4A3260' : '#4A3260') : 'transparent',
                color: activeTab === tab ? '#fff' : inkSub,
                fontSize: 13.5,
                fontWeight: 700,
                fontFamily: SANS,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'all' ? '🌟 All Knowledge' : tab === 'guides' ? '📖 Guides' : tab === 'glossary' ? '📖 Glossary' : tab === 'videos' ? '🎥 Video Classes' : '📚 Journeys'}
            </button>
          ))}
        </div>

        {/* Dynamic Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 64 }}>
          {(activeTab === 'all' || activeTab === 'guides') &&
            articles.map((art) => (
              <a key={art.slug} href={`/guides/${art.slug}`} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: gold, textTransform: 'uppercase' }}>{art.category} • Guide</span>
                  <h3 style={{ fontFamily: SERIF, fontSize: 20, color: ink, margin: '6px 0 8px', fontWeight: 600 }}>{art.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: inkSub, margin: 0, lineHeight: 1.5 }}>{art.subtitle}</p>
                </div>
                <div style={{ borderTop: `1px dashed ${borderC}`, paddingTop: 14, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: gold }}>Read Master Guide</span>
                  <ArrowRight size={14} color={gold} />
                </div>
              </a>
            ))}

          {(activeTab === 'all' || activeTab === 'glossary') &&
            glossary.map((term) => (
              <a key={term.slug} href={`/glossary/${term.slug}`} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: gold, textTransform: 'uppercase' }}>Glossary Definition</span>
                  <h3 style={{ fontFamily: SERIF, fontSize: 20, color: ink, margin: '6px 0 8px', fontWeight: 600 }}>{term.term}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: inkSub, margin: 0, lineHeight: 1.5 }}>{term.shortDefinition}</p>
                </div>
                <div style={{ borderTop: `1px dashed ${borderC}`, paddingTop: 14, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: gold }}>View Term &amp; Practice</span>
                  <ArrowRight size={14} color={gold} />
                </div>
              </a>
            ))}

          {(activeTab === 'all' || activeTab === 'videos') &&
            videos.map((vid) => (
              <a key={vid.id} href={`/videos/${vid.id}`} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: gold, textTransform: 'uppercase' }}>Video Masterclass • {vid.duration}</span>
                  <h3 style={{ fontFamily: SERIF, fontSize: 20, color: ink, margin: '6px 0 8px', fontWeight: 600 }}>{vid.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: inkSub, margin: 0, lineHeight: 1.5 }}>{vid.description}</p>
                </div>
                <div style={{ borderTop: `1px dashed ${borderC}`, paddingTop: 14, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: gold, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Play size={12} /> Watch &amp; Read Transcript</span>
                  <ArrowRight size={14} color={gold} />
                </div>
              </a>
            ))}
        </div>
      </main>

      <SiteFooter palette={palette} />
    </div>
  );
}
