import { useState, useEffect } from 'react';
import { Sparkles, Play, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
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
  // Gold #C4913A is tuned for the dark background; on cream it is 2.6:1.
  // #8B6A1A is the same amber family and reaches 4.6:1 in light mode.
  const gold = isDark ? '#C4913A' : '#8B6A1A';

  const video: VideoResource = VIDEO_REGISTRY[videoId] || VIDEO_REGISTRY['ep1-feelings-and-emotions'];

  useEffect(() => {
    console.log(`[VideoView] Loading video: ${video.title} (${video.youtubeId})`);
  }, [video]);

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

  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isPreviewEnded, setIsPreviewEnded] = useState<boolean>(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setIsPreviewEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: gold, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Play size={14} color={gold} />
              <span>YouTube Masterclass • {video.duration}</span>
            </span>

            <span style={{ fontSize: 11, fontWeight: 800, background: isPreviewEnded ? '#E53935' : 'rgba(196,145,58,0.2)', color: isPreviewEnded ? '#fff' : gold, padding: '4px 12px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isPreviewEnded ? '🔒 60s Preview Ended' : `⏱️ Free 60s Preview • 0:${timeLeft < 10 ? '0' : ''}${timeLeft}`}
            </span>
          </div>

          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, color: ink, margin: '0 0 16px', lineHeight: 1.15 }}>
            {video.title}
          </h1>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px, 1.8vw, 17px)', color: inkSub, margin: 0, lineHeight: 1.6 }}>
            {video.description}
          </p>
        </header>

        {/* YouTube Video Player Embed with 60s Lock Overlay */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: 24, overflow: 'hidden', marginBottom: 40, boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: `1px solid ${borderC}` }}>
          {!isPreviewEnded ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => console.log(`[VideoView] iframe loaded: ${video.youtubeId}`)}
              onError={() => console.error(`[VideoView] iframe failed to load: ${video.youtubeId}`)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
            />
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(26,20,30,0.95) 0%, rgba(13,10,18,0.98) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, zIndex: 10, backdropFilter: 'blur(16px)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(196,145,58,0.2)', border: '1.5px solid #C4913A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>🔒</span>
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: 26, color: '#EDE9E3', margin: '0 0 8px', fontWeight: 500 }}>
                60-Second Free Preview Ended
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(237,233,227,0.72)', maxWidth: 480, margin: '0 0 24px', lineHeight: 1.5, textAlign: 'center' }}>
                You have reached the end of the 60-second preview. Enroll in the Feelings &amp; Emotions course to unlock all 7 full video masterclasses, worksheets, and lifetime app access.
              </p>
              <a href="/feelingsandemotioncourse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 999, background: '#C4913A', color: '#1E1426', fontWeight: 800, textDecoration: 'none', fontSize: 14.5, boxShadow: '0 8px 24px rgba(196,145,58,0.4)' }}>
                <span>Unlock Full Course &amp; App →</span>
              </a>
            </div>
          )}
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
