import { Sparkles, Play, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import { useSiteTheme } from '../../lib/siteTheme';
import { VIDEO_REGISTRY, type VideoResource } from './data/contentEngineData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

interface Props {
  videoId: string;
}

export default function ProgrammaticVideoView({ videoId }: Props) {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.72)' : '#6B5744';
  const bg = isDark ? '#0D0A12' : '#F9F5EF';
  const cardBg = isDark ? 'rgba(26,20,30,0.7)' : 'rgba(255,255,255,0.85)';
  const borderC = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(196,181,160,0.35)';
  const gold = '#C4913A';

  const video: VideoResource = VIDEO_REGISTRY[videoId] || VIDEO_REGISTRY['ep1-feelings-and-emotions'];

  usePageSeo({
    title: `${video.title} | Soulful Intelligence Studio`,
    description: video.description,
    url: `https://www.skrmblissai.in/videos/${video.id}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'VideoObject',
          '@id': `https://www.skrmblissai.in/videos/${video.id}/#video`,
          name: video.title,
          description: video.description,
          thumbnailUrl: `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
          uploadDate: video.uploadDate,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.skrmblissai.in/' },
            { '@type': 'ListItem', position: 2, name: 'Knowledge Hub', item: 'https://www.skrmblissai.in/knowledge' },
            { '@type': 'ListItem', position: 3, name: video.title, item: `https://www.skrmblissai.in/videos/${video.id}` },
          ],
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
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'MindGym App', href: '/mindgym' },
          { label: 'Feelings Course', href: '/feelingsandemotioncourse' },
        ]}
      />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 24px' }}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: inkSub, marginBottom: 24 }}>
          <a href="/" style={{ color: inkSub, textDecoration: 'none' }}>Home</a>
          <ChevronRight size={12} color={gold} />
          <a href="/knowledge" style={{ color: inkSub, textDecoration: 'none' }}>Knowledge Hub</a>
          <ChevronRight size={12} color={gold} />
          <span style={{ color: ink, fontWeight: 600 }}>{video.title}</span>
        </nav>

        {/* Video Header */}
        <header style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Play size={14} color={gold} />
            <span>YouTube Masterclass • {video.duration}</span>
          </span>

          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, color: ink, margin: '0 0 16px', lineHeight: 1.15 }}>
            {video.title}
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px, 1.8vw, 17px)', color: inkSub, margin: 0, lineHeight: 1.6 }}>
            {video.description}
          </p>
        </header>

        {/* YouTube Video Player Embed */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: 24, overflow: 'hidden', marginBottom: 40, boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: `1px solid ${borderC}` }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>

        {/* Key Takeaways */}
        <section style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 28, marginBottom: 40, backdropFilter: 'blur(12px)' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 22, color: ink, margin: '0 0 16px', fontWeight: 500 }}>
            Key Video Lessons &amp; Insights
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {video.keyTakeaways.map((point, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={16} color={gold} />
                <span style={{ fontSize: 14, color: ink, lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Transcript Summary */}
        <section style={{ marginBottom: 48 }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 22, color: ink, margin: '0 0 12px', fontWeight: 500 }}>
            Masterclass Transcript Summary
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 15.5, color: inkSub, lineHeight: 1.7, margin: 0 }}>
            {video.transcriptSummary}
          </p>
        </section>

        {/* Action Callouts */}
        <section style={{ background: 'linear-gradient(135deg, #4A3260 0%, #2A1B38 100%)', color: '#fff', borderRadius: 24, padding: 32, textAlign: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', marginBottom: 48 }}>
          <Sparkles size={28} color="#FFDF9E" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, margin: '0 0 10px' }}>
            Watch Full 7-Episode Course
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Unlock all 7 guided video modules, reflection worksheets, and deep inner freedom exercises.
          </p>
          <a href="/feelingsandemotioncourse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 999, background: '#FFDF9E', color: '#2A1B38', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>
            <span>Explore 7-Episode Course</span>
            <ArrowRight size={16} />
          </a>
        </section>
      </main>

      <SiteFooter palette={palette} />
    </div>
  );
}
