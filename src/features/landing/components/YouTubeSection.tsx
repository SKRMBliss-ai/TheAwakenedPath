/**
 * YouTubeSection.tsx
 * Netflix-style premium YouTube section.
 * - Featured video card (large, 16:7 aspect)
 * - 4-card horizontal carousel
 * - Live /api/latest-videos fetch + curated fallbacks
 * - Duration badges, category tags, publish date
 * - Large Subscribe button
 */
import { useEffect, useState } from 'react';
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@SoulfulIntelligenceStudio';

const FS = (file: string) =>
  `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fsite%2F${encodeURIComponent(file)}?alt=media`;

// Curated fallback videos — guaranteed premium look while API populates
const FALLBACK_VIDEOS = [
  {
    id: 'fallback-1',
    title: 'The First Inner Rule: How We Learn to Hide What We Feel',
    thumb: FS('yt-thumb-presence.webp'),
    category: 'Inner Work',
    durationSec: 847,
    publishedAt: '2026-06-15T00:00:00Z',
  },
  {
    id: 'fallback-2',
    title: 'Daily Prayer: When Silence Is the Most Honest Thing You Can Say',
    thumb: FS('yt-thumb-breath.webp'),
    category: 'Meditation',
    durationSec: 423,
    publishedAt: '2026-06-08T00:00:00Z',
  },
  {
    id: 'fallback-3',
    title: 'Release Stress Instantly: Deep Breathing for Sleep Rest',
    thumb: FS('yt-thumb-sleep.webp'),
    category: 'Breathwork',
    durationSec: 612,
    publishedAt: '2026-05-22T00:00:00Z',
  },
  {
    id: 'fallback-4',
    title: 'Let Go to Grow: Understanding the Art of Letting Go',
    thumb: FS('yt-thumb-nature.webp'),
    category: 'Mindfulness',
    durationSec: 1124,
    publishedAt: '2026-05-10T00:00:00Z',
  },
  {
    id: 'fallback-5',
    title: 'How Your Body Pays the Price of Stress — Somatic Signals You Ignore',
    thumb: FS('yt-thumb-presence.webp'),
    category: 'Body & Mind',
    durationSec: 965,
    publishedAt: '2026-04-28T00:00:00Z',
  },
];

interface Video {
  id: string;
  title: string;
  thumb: string | null;
  category?: string;
  durationSec?: number;
  publishedAt?: string | null;
}

function fmtDuration(sec?: number): string | null {
  if (!sec || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function fmtAgo(iso?: string | null): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const m = Math.round(days / 30);
  if (m < 12) return m <= 1 ? 'a month ago' : `${m} months ago`;
  const y = Math.round(days / 365);
  return y <= 1 ? 'a year ago' : `${y} years ago`;
}

function PlayCircle({ size = 52, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div className="si-play-circle" style={{ width: size, height: size, background: dark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.88)' }}>
      <span style={{
        borderLeft: `${Math.round(size * 0.28)}px solid ${dark ? '#fff' : '#1A1018'}`,
        borderTop: `${Math.round(size * 0.18)}px solid transparent`,
        borderBottom: `${Math.round(size * 0.18)}px solid transparent`,
        marginLeft: Math.round(size * 0.08),
        display: 'block',
      }} />
    </div>
  );
}

function FeaturedCard({ video, isDark }: { video: Video; isDark: boolean }) {
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44';

  return (
    <a
      href={video.id.startsWith('fallback') ? YOUTUBE_CHANNEL : `https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="si-video-card"
      style={{ display: 'block', borderRadius: 24 }}
      aria-label={`Watch: ${video.title}`}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/7', overflow: 'hidden', borderRadius: '24px 24px 0 0', background: isDark ? '#1A1018' : '#EDE0CC' }}>
        {video.thumb && (
          <img
            src={video.thumb}
            alt=""
            className="si-thumb-img"
            loading="eager"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* Scrim */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)' }} />
        {/* Play */}
        <div className="si-play-btn"><PlayCircle size={68} dark /></div>
        {/* Duration */}
        {video.durationSec && (
          <span style={{
            position: 'absolute', right: 14, bottom: 14,
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            fontFamily: SANS, fontSize: 12, fontWeight: 700,
          }}>
            {fmtDuration(video.durationSec)}
          </span>
        )}
        {/* Category + title over scrim */}
        <div style={{ position: 'absolute', left: 22, right: 100, bottom: 20 }}>
          {video.category && (
            <span style={{
              display: 'inline-block', padding: '4px 10px', borderRadius: 999, marginBottom: 8,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
              fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)',
            }}>
              {video.category}
            </span>
          )}
          <p style={{
            fontFamily: SERIF, color: '#fff', fontWeight: 600,
            fontSize: 'clamp(17px, 2.2vw, 26px)', lineHeight: 1.25, margin: 0,
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}>
            {video.title}
          </p>
        </div>
      </div>

      {/* Card footer */}
      <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: SANS, fontSize: 12, color: inkSub, fontWeight: 600 }}>
          {fmtAgo(video.publishedAt)}
        </span>
        <span style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: isDark ? '#C4913A' : '#4A3260',
        }}>
          Newest ↗
        </span>
      </div>
    </a>
  );
}

function SmallCard({ video, isDark }: { video: Video; isDark: boolean }) {
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44';

  return (
    <a
      href={video.id.startsWith('fallback') ? YOUTUBE_CHANNEL : `https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="si-video-card"
      style={{ width: 'clamp(240px, 30vw, 300px)' }}
      aria-label={`Watch: ${video.title}`}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: isDark ? '#1A1018' : '#EDE0CC', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
        {video.thumb && (
          <img
            src={video.thumb}
            alt=""
            className="si-thumb-img"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div className="si-play-btn"><PlayCircle size={40} dark /></div>
        {video.durationSec && (
          <span style={{
            position: 'absolute', right: 8, bottom: 8,
            padding: '3px 8px', borderRadius: 6,
            background: 'rgba(0,0,0,0.78)', color: '#fff',
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
          }}>
            {fmtDuration(video.durationSec)}
          </span>
        )}
        {video.category && (
          <span style={{
            position: 'absolute', left: 8, top: 8,
            padding: '3px 8px', borderRadius: 999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)',
          }}>
            {video.category}
          </span>
        )}
      </div>
      {/* Card footer */}
      <div style={{ padding: '13px 15px 16px' }}>
        <p style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.35,
          color: ink, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {video.title}
        </p>
        {video.publishedAt && (
          <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: 0, fontWeight: 600 }}>
            {fmtAgo(video.publishedAt)}
          </p>
        )}
      </div>
    </a>
  );
}

export default function YouTubeSection({ palette, onTrack }: { palette: Palette; onTrack?: (action: string) => void }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44';

  useEffect(() => {
    let cancelled = false;
    fetch('/api/latest-videos?max=5')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        const list: Video[] = Array.isArray(data?.videos) ? data.videos : [];
        if (list.length >= 2) {
          // Merge categories from fallback if API doesn't provide them
          const enriched = list.map((v, i) => ({
            ...v,
            category: (v as any).category ?? FALLBACK_VIDEOS[i % FALLBACK_VIDEOS.length]?.category,
          }));
          setVideos(enriched);
          setStatus('ready');
        } else {
          setVideos(FALLBACK_VIDEOS);
          setStatus('fallback');
        }
      })
      .catch(() => {
        if (!cancelled) { setVideos(FALLBACK_VIDEOS); setStatus('fallback'); }
      });
    return () => { cancelled = true; };
  }, []);

  const featured = videos[0] ?? null;
  const supporting = videos.slice(1, 5);

  return (
    <section
      className="si-reveal"
      style={{
        padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
        position: 'relative', zIndex: 2,
        background: isDark ? 'rgba(12,9,16,0.4)' : 'rgba(240,232,220,0.35)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 14 }}>
            From the Studio
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 400, color: ink, marginBottom: 8, letterSpacing: '-0.01em' }}>
            Latest from the Studio
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub }}>
            Guided practices, talks and reflections — new videos every week.
          </p>
        </div>

        {/* Subscribe button */}
        <a
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onTrack?.('HOME_YOUTUBE_SUBSCRIBE')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '13px 24px', borderRadius: 999,
            background: '#FF0000', color: '#fff', textDecoration: 'none',
            fontFamily: SANS, fontSize: 13.5, fontWeight: 800,
            boxShadow: '0 6px 24px rgba(255,0,0,0.25)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(255,0,0,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,0,0,0.25)'; }}
          aria-label="Subscribe to Soulful Intelligence on YouTube"
        >
          <svg width="20" height="14" viewBox="0 0 24 17" fill="none" aria-hidden="true">
            <path d="M23.5 2.5s-.3-2-1.2-2.8C21.1-.3 19.7-.4 19 .5 16.2.7 12 .7 12 .7s-4.2 0-7-.2C4.3-.4 2.9-.3 1.7-.3 .8.5.5 2.5.5 2.5S.2 4.8.2 7v2.3c0 2.2.3 4.5.3 4.5s.3 2 1.2 2.8c1.2.9 2.7.8 3.4 1 2.4.2 10.1.3 10.1.3s4.2 0 7-.2c.7-.1 2.2-.2 3.3-1.1.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.5V7c0-2.2-.3-4.5-.3-4.5Z" fill="white" fillOpacity=".25" />
            <path d="M9.8 5.5l6.3 3.5-6.3 3.5V5.5Z" fill="white" />
          </svg>
          Subscribe
        </a>
      </div>

      {/* Loading skeleton */}
      {status === 'loading' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ borderRadius: 24, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(60,40,20,0.06)', aspectRatio: '16/7', animation: 'heartbeat 2s infinite' }} />
          <div style={{ display: 'flex', gap: 20, overflow: 'hidden' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ width: 260, flexShrink: 0, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(60,40,20,0.06)', aspectRatio: '16/9', animation: 'heartbeat 2s infinite' }} />
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {status !== 'loading' && featured && (
        <div style={{ display: 'grid', gap: 24 }}>
          <FeaturedCard video={featured} isDark={isDark} />

          {/* Horizontal carousel */}
          {supporting.length > 0 && (
            <div className="si-carousel" role="list" aria-label="More videos from the studio">
              {supporting.map((v) => (
                <div key={v.id} role="listitem">
                  <SmallCard video={v} isDark={isDark} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Channel link */}
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <a
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onTrack?.('HOME_YOUTUBE_CHANNEL')}
          style={{
            fontFamily: SANS, fontSize: 13, fontWeight: 700,
            color: isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44',
            textDecoration: 'none', transition: 'color 0.2s ease',
            // WCAG 2.2 §2.5.8: this rendered ~19px tall. The underline lives on
            // the inner span so it still hugs the text instead of dropping to
            // the bottom of the enlarged box.
            display: 'inline-flex', alignItems: 'center',
            minHeight: 32, padding: '6px 4px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = isDark ? '#EDE9E3' : '#4A3260'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44'; }}
          aria-label="Visit Soulful Intelligence YouTube channel"
        >
          <span style={{ borderBottom: '1px solid currentColor', paddingBottom: 2 }}>
            Visit Channel →
          </span>
        </a>
      </div>
    </section>
  );
}
