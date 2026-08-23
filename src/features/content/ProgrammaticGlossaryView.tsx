import { BookOpen, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
import { useSiteTheme } from '../../lib/siteTheme';
import { GLOSSARY_REGISTRY, ARTICLES_REGISTRY, type GlossaryTerm } from './data/contentEngineData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

interface Props {
  termSlug: string;
}

export default function ProgrammaticGlossaryView({ termSlug }: Props) {
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

  const term: GlossaryTerm = GLOSSARY_REGISTRY[termSlug] || GLOSSARY_REGISTRY['presence'];

  usePageSeo({
    title: `${term.term} — Meaning, Principles & Daily Practice | SKRM Bliss AI`,
    description: term.shortDefinition,
    url: `https://www.skrmblissai.in/glossary/${term.slug}`,
    image: 'https://www.skrmblissai.in/og/guides.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'DefinedTerm',
          '@id': `https://www.skrmblissai.in/glossary/${term.slug}/#term`,
          name: term.term,
          description: term.fullDefinition,
          inDefinedTermSet: 'https://www.skrmblissai.in/knowledge',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.skrmblissai.in/' },
            { '@type': 'ListItem', position: 2, name: 'Knowledge Hub', item: 'https://www.skrmblissai.in/knowledge' },
            { '@type': 'ListItem', position: 3, name: term.term, item: `https://www.skrmblissai.in/glossary/${term.slug}` },
          ],
        },
      ],
    },
  });

  return (
    <div style={{ background: bg, color: ink, fontFamily: SANS, minHeight: '100vh', position: 'relative' }}>
      <SiteBackdrop />
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

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 24px' }}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: inkSub, marginBottom: 24 }}>
          <a href="/" style={{ color: inkSub, textDecoration: 'none' }}>Home</a>
          <ChevronRight size={12} color={gold} />
          <a href="/knowledge" style={{ color: inkSub, textDecoration: 'none' }}>Knowledge Hub</a>
          <ChevronRight size={12} color={gold} />
          <span style={{ color: ink, fontWeight: 600 }}>{term.term}</span>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <BookOpen size={14} color={gold} />
            <span>Glossary Definition • {term.category}</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, color: ink, margin: 0, lineHeight: 1.1 }}>
              {term.term}
            </h1>
            {term.phonetic && <span style={{ fontFamily: SANS, fontSize: 16, color: inkSub }}>{term.phonetic}</span>}
          </div>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(17px, 2.2vw, 20px)', color: ink, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            {term.shortDefinition}
          </p>
        </header>

        {/* Full Definition Box */}
        <section style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 24, padding: 32, marginBottom: 40, backdropFilter: 'blur(12px)' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, color: ink, margin: '0 0 12px', fontWeight: 500 }}>
            In-Depth Meaning &amp; Context
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 15.5, color: inkSub, lineHeight: 1.7, margin: 0 }}>
            {term.fullDefinition}
          </p>
          {term.etymology && (
            <p style={{ fontFamily: SANS, fontSize: 13, color: gold, margin: '16px 0 0', fontStyle: 'italic' }}>
              Etymology: {term.etymology}
            </p>
          )}
        </section>

        {/* Key Principles */}
        {term.keyPrinciples && term.keyPrinciples.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h3 style={{ fontFamily: SERIF, fontSize: 24, color: ink, margin: '0 0 16px', fontWeight: 500 }}>
              Core Principles &amp; Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {term.keyPrinciples.map((prin, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)', border: `1px solid ${borderC}`, borderRadius: 16, padding: 16 }}>
                  <CheckCircle2 size={18} color={gold} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14.5, color: ink, lineHeight: 1.6 }}>{prin}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Daily Practice */}
        <section style={{ background: 'linear-gradient(135deg, #4A3260 0%, #2A1B38 100%)', color: '#fff', borderRadius: 24, padding: 32, marginBottom: 48, boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#FFDF9E', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            How to Practice Today in MindGym
          </span>
          <h3 style={{ fontFamily: SERIF, fontSize: 24, margin: '0 0 12px', fontWeight: 400 }}>
            Daily Somatic Ritual for {term.term}
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 24px' }}>
            {term.dailyPractice}
          </p>
          <a href="/mindgym" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 999, background: '#FFDF9E', color: '#2A1B38', fontWeight: 800, textDecoration: 'none', fontSize: 13.5 }}>
            <span>Practice Now in MindGym App</span>
            <ArrowRight size={14} />
          </a>
        </section>

        {/* Related Articles */}
        {term.relatedArticleSlugs && term.relatedArticleSlugs.length > 0 && (
          <section>
            <h3 style={{ fontFamily: SERIF, fontSize: 22, color: ink, margin: '0 0 16px', fontWeight: 500 }}>
              Related Guides &amp; Masterclasses
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {term.relatedArticleSlugs.map((rslug) => {
                const art = ARTICLES_REGISTRY[rslug];
                if (!art) return null;
                return (
                  <a key={rslug} href={`/guides/${art.slug}`} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 16, padding: 20, textDecoration: 'none' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: 'uppercase' }}>{art.category}</span>
                    <h4 style={{ fontFamily: SERIF, fontSize: 18, color: ink, margin: '4px 0 8px', fontWeight: 600 }}>{art.title}</h4>
                    <span style={{ fontSize: 12, color: gold, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Read Guide <ArrowRight size={12} /></span>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <SiteFooter palette={palette} />
    </div>
  );
}
