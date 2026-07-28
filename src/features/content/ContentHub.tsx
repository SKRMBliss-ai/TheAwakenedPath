import { Sparkles, ArrowRight } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import { useSiteTheme } from '../../lib/siteTheme';
import { ARTICLES_REGISTRY } from './data/contentEngineData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

export default function ContentHub() {
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

  const articles = Object.values(ARTICLES_REGISTRY);

  usePageSeo({
    title: 'Mindfulness & Presence Knowledge Hub | SKRM Bliss AI',
    description: 'Explore authoritative guides, masterclasses, and definitions on meditation, presence, witness consciousness, and emotional regulation by Soulful Intelligence Studio.',
    url: 'https://www.skrmblissai.in/guides',
    image: 'https://www.skrmblissai.in/og/guides.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Mindfulness & Presence Knowledge Hub',
      url: 'https://www.skrmblissai.in/guides',
      publisher: {
        '@type': 'Organization',
        name: 'Soulful Intelligence Studio',
        url: 'https://www.skrmblissai.in',
      },
    },
  });

  return (
    <div style={{ background: bg, color: ink, fontFamily: SANS, minHeight: '100vh', position: 'relative' }}>
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

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(48px, 6vw, 88px) 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Sparkles size={14} color={gold} />
            <span>Master Knowledge Directory</span>
          </span>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, color: ink, margin: '0 0 16px', lineHeight: 1.15 }}>
            Guides, Definitions &amp; Presence Masterclasses
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px, 1.8vw, 17px)', color: inkSub, margin: 0, lineHeight: 1.6 }}>
            Authoritative, experience-driven resources to help you dissolve overthinking, cultivate witness consciousness, and live with emotional clarity.
          </p>
        </div>

        {/* Grid of Articles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
          {articles.map((art) => (
            <a
              key={art.slug}
              href={`/guides/${art.slug}`}
              style={{
                background: cardBg,
                border: `1px solid ${borderC}`,
                borderRadius: 24,
                padding: 28,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(60,40,20,0.04)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {art.category}
                  </span>
                  <span style={{ fontSize: 11, color: inkSub }}>{art.readTime}</span>
                </div>

                <h2 style={{ fontFamily: SERIF, fontSize: 22, color: ink, margin: '0 0 10px', fontWeight: 600, lineHeight: 1.3 }}>
                  {art.title}
                </h2>

                <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub, lineHeight: 1.6, margin: '0 0 20px' }}>
                  {art.subtitle}
                </p>
              </div>

              <div style={{ borderTop: `1px dashed ${borderC}`, paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: ink }}>Read Full Guide</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={14} color={gold} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>

      <SiteFooter palette={palette} />
    </div>
  );
}
