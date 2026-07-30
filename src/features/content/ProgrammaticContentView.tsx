import { useEffect } from 'react';
import { Sparkles, Clock, ArrowRight, ChevronRight, HelpCircle, Compass } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { auth } from '../../firebase';
import { usePageSeo } from '../../lib/seo';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import { useSiteTheme } from '../../lib/siteTheme';
import { ARTICLES_REGISTRY, type ContentArticle } from './data/contentEngineData';
import { BLOCK_ANALYTICS_EMAILS, IGNORED_EMAILS } from '../../config/admin';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

interface Props {
  slug: string;
}

export default function ProgrammaticContentView({ slug }: Props) {
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

  const article: ContentArticle | undefined = ARTICLES_REGISTRY[slug] || ARTICLES_REGISTRY['feelings-vs-emotions'];

  useEffect(() => {
    // Skip tracking for team / admin members so internal visits
    // don't inflate the Page Visits counter in the Engagement Report.
    const currentEmail = (auth.currentUser?.email ?? '').toLowerCase();
    const isTeamVisit =
      BLOCK_ANALYTICS_EMAILS.includes(currentEmail) ||
      IGNORED_EMAILS.includes(currentEmail) ||
      currentEmail.includes('skrm') ||
      currentEmail.includes('shruti') ||
      currentEmail.includes('simk');
    if (isTeamVisit) return;

    try {
      addDoc(collection(db, 'activity_logs'), {
        eventType: 'PAGE_VISIT_GUIDE',
        details: article.slug,
        path: window.location.pathname,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('[GuideView] Failed to log page visit:', error);
    }
  }, [article.slug]);

  // SEO & Schema Setup
  usePageSeo({
    title: `${article.title} | SKRM Bliss AI`,
    description: article.description,
    url: `https://www.skrmblissai.in/guides/${article.slug}`,
    image: `https://www.skrmblissai.in/og/guide-${article.slug}.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': `https://www.skrmblissai.in/guides/${article.slug}/#article`,
          headline: article.title,
          description: article.description,
          author: {
            '@type': 'Person',
            name: article.author,
            jobTitle: 'Emotional Intelligence & Presence Guide',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Soulful Intelligence Studio',
            url: 'https://www.skrmblissai.in',
          },
          datePublished: article.publishDate,
          inLanguage: 'en-US',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.skrmblissai.in/' },
            { '@type': 'ListItem', position: 2, name: 'Guides & Masterclasses', item: 'https://www.skrmblissai.in/guides' },
            { '@type': 'ListItem', position: 3, name: article.title, item: `https://www.skrmblissai.in/guides/${article.slug}` },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
      ],
    },
  });

  return (
    <div style={{ background: bg, color: ink, fontFamily: SANS, minHeight: '100vh', position: 'relative' }}>
      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[
          { label: 'Home', href: '/' },
          { label: 'All Guides', href: '/guides' },
          { label: 'MindGym App', href: '/mindgym' },
          { label: 'Feelings Course', href: '/feelingsandemotioncourse' },
        ]}
      />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 24px' }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: inkSub, marginBottom: 24 }}>
          <a href="/" style={{ color: inkSub, textDecoration: 'none' }}>Home</a>
          <ChevronRight size={12} color={gold} />
          <a href="/guides" style={{ color: inkSub, textDecoration: 'none' }}>Guides &amp; Masterclasses</a>
          <ChevronRight size={12} color={gold} />
          <span style={{ color: ink, fontWeight: 600 }}>{article.category}</span>
        </nav>

        {/* Header Block */}
        <header style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Sparkles size={14} color={gold} />
            <span>{article.category} • {article.readTime}</span>
          </span>

          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, color: ink, margin: '0 0 16px', lineHeight: 1.15 }}>
            {article.title}
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(16px, 2vw, 19px)', color: inkSub, lineHeight: 1.6, margin: '0 0 24px' }}>
            {article.subtitle}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: inkSub, borderTop: `1px solid ${borderC}`, borderBottom: `1px solid ${borderC}`, padding: '12px 0' }}>
            <span>By <strong style={{ color: ink }}>{article.author}</strong></span>
            <span>•</span>
            <span>Published {new Date(article.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {article.readTime}</span>
          </div>
        </header>

        {/* AI Citation & Quick Answer Box */}
        <section aria-label="Quick Summary & AI Citation" style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 28, marginBottom: 48, backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: gold, fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Compass size={16} />
            <span>Direct Answer &amp; Key Insight</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 15, color: ink, lineHeight: 1.6, margin: '0 0 20px', fontWeight: 500 }}>
            {article.quickAnswer}
          </p>

          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div style={{ borderTop: `1px dashed ${borderC}`, paddingTop: 16 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: ink, display: 'block', marginBottom: 10 }}>
                Key Takeaways:
              </span>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {article.keyTakeaways.map((point, idx) => (
                  <li key={idx} style={{ fontSize: 13.5, color: inkSub, lineHeight: 1.5 }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Main Content Sections */}
        <article style={{ display: 'flex', flexDirection: 'column', gap: 40, marginBottom: 56 }}>
          {article.sections.map((sec, idx) => (
            <section key={idx} style={{ borderBottom: idx < article.sections.length - 1 ? `1px solid ${borderC}` : 'none', paddingBottom: 32 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 500, color: ink, margin: '0 0 16px' }}>
                {sec.heading}
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 16, color: inkSub, lineHeight: 1.75, margin: '0 0 16px' }}>
                {sec.content}
              </p>
              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,50,96,0.04)', borderRadius: 16, padding: '20px 24px 20px 40px', margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sec.bulletPoints.map((bp, bidx) => (
                    <li key={bidx} style={{ fontSize: 14.5, color: ink, lineHeight: 1.6 }}>
                      {bp}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        {/* FAQ Accordion Section */}
        {article.faqs && article.faqs.length > 0 && (
          <section style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 24, padding: 32, marginBottom: 56 }}>
            <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, color: ink, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={22} color={gold} />
              <span>Frequently Asked Questions</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {article.faqs.map((f, fidx) => (
                <div key={fidx} style={{ borderBottom: fidx < article.faqs.length - 1 ? `1px solid ${borderC}` : 'none', paddingBottom: 16 }}>
                  <h4 style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: ink, margin: '0 0 8px' }}>
                    {f.q}
                  </h4>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: inkSub, lineHeight: 1.6, margin: 0 }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Pathway CTA */}
        <section style={{ background: 'linear-gradient(135deg, #4A3260 0%, #2A1B38 100%)', color: '#fff', borderRadius: 24, padding: 36, textAlign: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', marginBottom: 56 }}>
          <Sparkles size={28} color="#FFDF9E" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, margin: '0 0 12px' }}>
            Put This Into Practice in MindGym
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(255,255,255,0.82)', maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Experience guided presence breathwork, witness reflection journaling, and emotional body scanning inside our daily mind training app.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            <a href="/mindgym" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 999, background: '#FFDF9E', color: '#2A1B38', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>
              <span>Open MindGym App</span>
              <ArrowRight size={16} />
            </a>
            <a href="/feelingsandemotioncourse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,0.25)' }}>
              <span>7-Episode Course</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* Related Guides Links */}
        {article.relatedSlugs && article.relatedSlugs.length > 0 && (
          <section>
            <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: ink, margin: '0 0 16px' }}>
              Related Guides &amp; Masterclasses
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {article.relatedSlugs.map((rslug) => {
                const rel = ARTICLES_REGISTRY[rslug];
                if (!rel) return null;
                return (
                  <a key={rslug} href={`/guides/${rel.slug}`} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 16, padding: 20, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: gold, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{rel.category}</span>
                      <h4 style={{ fontFamily: SERIF, fontSize: 18, color: ink, margin: '0 0 8px', fontWeight: 600 }}>{rel.title}</h4>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: gold, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                      Read Guide <ArrowRight size={12} />
                    </span>
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
