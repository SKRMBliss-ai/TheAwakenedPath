/**
 * YouTubeSection.tsx
 * "Latest in every stream" — one card per content stream rather than a single
 * featured video plus whatever happened to be uploaded next.
 *
 * The channel publishes four distinct things: guided meditations, ambient
 * music, the Feelings & Emotions course, and the Wisdom Untethered course. A
 * plain "5 most recent" strip buries three of those whenever one stream has a
 * busy week — the person who came for a meditation sees four music tracks. So
 * each stream gets its own fixed slot, showing that stream's newest upload.
 *
 * Classification is two-tier. Curated playlists resolve server-side into a
 * `stream` field and are authoritative — a daily meditation upload need not
 * say "meditation" in its title. Anything without one falls back to title
 * keywords here, which needs no deploy to correct and no cache to invalidate.
 */
import { useEffect, useState } from 'react';
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@SoulfulIntelligenceStudio?sub_confirmation=1';
// sub_confirmation=1 opens the subscribe dialog pre-armed so the visitor only
// has to click "Confirm" — used on the Subscribe button specifically, not on
// plain channel-visit links where that prompt would be unwelcome.
const YOUTUBE_SUBSCRIBE = 'https://www.youtube.com/@SoulfulIntelligenceStudio?sub_confirmation=1';

const FS = (file: string) =>
  `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fsite%2F${encodeURIComponent(file)}?alt=media`;

type StreamKey = 'meditation' | 'music' | 'feelings' | 'untethered';

interface Stream {
  key: StreamKey;
  label: string;
  blurb: string;
  accent: string;
  /** Where to send someone who wants the whole stream, not just the newest. */
  href: string;
}

/** Accents are all drawn from the existing brand family, not invented hues. */
const STREAMS: Stream[] = [
  { key: 'meditation', label: 'Meditation',        blurb: 'Guided practice',   accent: '#6E7F6A', href: YOUTUBE_CHANNEL },
  { key: 'music',      label: 'Music',             blurb: 'Sound for stillness', accent: '#C4913A', href: YOUTUBE_CHANNEL },
  { key: 'feelings',   label: 'Feelings & Emotions', blurb: 'The course',      accent: '#4A3260', href: '/feelingsandemotioncourse' },
  { key: 'untethered', label: 'Wisdom Untethered', blurb: 'The course',        accent: '#7A5F44', href: '/mindgym' },
];

/**
 * Feelings & Emotions episode ids, mirrored from EmotionFeelingsCourse.tsx.
 * An exact id beats any keyword rule, and these titles ("What Are Feelings and
 * Emotions?") do not reliably name the series.
 */
const FEELINGS_VIDEO_IDS = new Set([
  'fTrY9KMLhAo', // EP1
  'pES3x5XlJF0', // EP2
  'nAf0fSs8dto', // EP3
]);

const MUSIC_RE = /\b(music|hz|ambient|sitar|flute|drone|raga|instrumental|frequency|tanpura|soundscape|binaural)\b/i;
const MEDITATION_RE = /\b(meditation|meditate|guided|breathwork|breathing|breath|sleep|relax|body scan|yoga nidra|affirmation|prayer)\b/i;
const UNTETHERED_RE = /\buntethered\b/i;
const FEELINGS_RE = /\bfeelings?\s*(&|and)\s*emotions?\b|\bemotions?\s+course\b/i;

/**
 * Order matters. "528Hz Guided Meditation & Ambient Music" matches both the
 * music and meditation rules; it is a two-hour ambient track, so music has to
 * win. Course series are checked first because they are the most specific.
 *
 * A server-side `stream` always wins over all of it: that comes from curated
 * playlist membership, and a daily meditation need not say "meditation" in its
 * title to belong in the meditation slot.
 */
function classify(v: Video): StreamKey | null {
  if (v.stream && STREAMS.some((s) => s.key === v.stream)) return v.stream;
  const t = v.title || '';
  if (UNTETHERED_RE.test(t)) return 'untethered';
  if (FEELINGS_VIDEO_IDS.has(v.id) || FEELINGS_RE.test(t)) return 'feelings';
  if (MUSIC_RE.test(t)) return 'music';
  if (MEDITATION_RE.test(t)) return 'meditation';
  return null;
}

// Curated fallbacks — one per stream, so the section keeps its shape when the
// API is unreachable instead of collapsing to a single column.
const FALLBACK_BY_STREAM: Record<StreamKey, Video> = {
  meditation: {
    id: 'fallback-meditation',
    title: 'Daily Prayer: When Silence Is the Most Honest Thing You Can Say',
    thumb: FS('yt-thumb-breath.webp'),
    durationSec: 423,
    publishedAt: '2026-06-08T00:00:00Z',
  },
  music: {
    id: 'fallback-music',
    title: 'Pure Sitar Stillness | Indian Classical Music for Deep Meditation',
    thumb: FS('yt-thumb-nature.webp'),
    durationSec: 315,
    publishedAt: '2026-06-02T00:00:00Z',
  },
  feelings: {
    id: 'fallback-feelings',
    title: 'The First Inner Rule: How We Learn to Hide What We Feel',
    thumb: FS('yt-thumb-presence.webp'),
    durationSec: 847,
    publishedAt: '2026-06-15T00:00:00Z',
  },
  untethered: {
    id: 'fallback-untethered',
    title: 'How To Stop Taking Things Personally | Wisdom Untethered',
    thumb: FS('yt-thumb-sleep.webp'),
    durationSec: 598,
    publishedAt: '2026-05-28T00:00:00Z',
  },
};

interface Video {
  id: string;
  title: string;
  thumb: string | null;
  durationSec?: number;
  publishedAt?: string | null;
  /** Set server-side from curated playlist membership; authoritative. */
  stream?: StreamKey | null;
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

function PlayCircle({ size = 46 }: { size?: number }) {
  return (
    <div className="si-play-circle" style={{ width: size, height: size, background: 'rgba(0,0,0,0.62)' }}>
      <span style={{
        borderLeft: `${Math.round(size * 0.28)}px solid #fff`,
        borderTop: `${Math.round(size * 0.18)}px solid transparent`,
        borderBottom: `${Math.round(size * 0.18)}px solid transparent`,
        marginLeft: Math.round(size * 0.08),
        display: 'block',
      }} />
    </div>
  );
}

function StreamCard({ stream, video, isNewest, isDark }: {
  stream: Stream; video: Video; isNewest: boolean; isDark: boolean;
}) {
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const borderC = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(196,181,160,0.42)';
  const isFallback = video.id.startsWith('fallback');

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Stream heading sits outside the card: the promise of the slot is
          "this stream, always here", which should read even while loading. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: stream.accent, flexShrink: 0 }} />
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink }}>
          {stream.label}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 10.5, color: inkSub, marginLeft: 'auto' }}>
          {stream.blurb}
        </span>
      </div>

      <a
        href={isFallback ? YOUTUBE_CHANNEL : `https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="si-video-card"
        style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          borderRadius: 16, overflow: 'hidden',
          background: cardBg, border: `1px solid ${borderC}`,
          borderTop: `3px solid ${stream.accent}`,
          textDecoration: 'none',
        }}
        aria-label={`${stream.label}: watch ${video.title}`}
      >
        <div style={{ position: 'relative', aspectRatio: '16/9', background: isDark ? '#1A1018' : '#EDE0CC', overflow: 'hidden' }}>
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
          <div className="si-play-btn"><PlayCircle size={46} /></div>

          {isNewest && (
            <span style={{
              position: 'absolute', left: 10, top: 10,
              padding: '4px 10px', borderRadius: 999,
              background: stream.accent, color: '#fff',
              fontFamily: SANS, fontSize: 9, fontWeight: 800,
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              Newest
            </span>
          )}

          {video.durationSec ? (
            <span style={{
              position: 'absolute', right: 8, bottom: 8,
              padding: '3px 8px', borderRadius: 6,
              background: 'rgba(0,0,0,0.78)', color: '#fff',
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
            }}>
              {fmtDuration(video.durationSec)}
            </span>
          ) : null}
        </div>

        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <p style={{
            fontFamily: SERIF, fontSize: 17, fontWeight: 500, margin: '0 0 10px', lineHeight: 1.3,
            color: ink, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          }}>
            {video.title}
          </p>
          <span style={{ fontFamily: SANS, fontSize: 11, color: inkSub, fontWeight: 600, marginTop: 'auto' }}>
            {fmtAgo(video.publishedAt) ?? 'On the channel'}
          </span>
        </div>
      </a>
    </div>
  );
}

export default function YouTubeSection({ palette, onTrack }: { palette: Palette; onTrack?: (action: string) => void }) {
  const [byStream, setByStream] = useState<Partial<Record<StreamKey, Video>>>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44';

  useEffect(() => {
    let cancelled = false;
    // Ask for the full cached window: filling four stream slots needs enough
    // history that a busy week in one stream — or an infrequent stream, like a
    // 3-episode course — cannot starve the others.
    fetch('/api/latest-videos?max=40')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        const list: Video[] = Array.isArray(data?.videos) ? data.videos : [];

        // The API returns newest-first, so the first match per stream wins.
        const picked: Partial<Record<StreamKey, Video>> = {};
        list.forEach((v) => {
          const k = classify(v);
          if (k && !picked[k]) picked[k] = v;
        });

        const filled = Object.keys(picked).length;
        if (filled >= 2) {
          setByStream(picked);
          setStatus('ready');
        } else {
          setByStream(FALLBACK_BY_STREAM);
          setStatus('fallback');
        }
      })
      .catch(() => {
        if (!cancelled) { setByStream(FALLBACK_BY_STREAM); setStatus('fallback'); }
      });
    return () => { cancelled = true; };
  }, []);

  // Only render streams that actually have a video, so a stream with nothing
  // published yet leaves no dead tile behind.
  const visible = STREAMS
    .map((s) => ({ stream: s, video: byStream[s.key] }))
    .filter((x): x is { stream: Stream; video: Video } => Boolean(x.video));

  const newestId = visible
    .slice()
    .sort((a, b) => new Date(b.video.publishedAt || 0).getTime() - new Date(a.video.publishedAt || 0).getTime())[0]?.video.id;

  return (
    <section
      className="si-reveal"
      style={{
        padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
        position: 'relative', zIndex: 2,
        background: isDark ? 'rgba(12,9,16,0.4)' : 'rgba(240,232,220,0.35)',
      }}
    >
      <style>{`
        .si-stream-grid { display: grid; gap: 22px; grid-template-columns: 1fr; }
        @media (min-width: 640px)  { .si-stream-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1180px) { .si-stream-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 14 }}>
            From the Studio
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 400, color: ink, marginBottom: 8, letterSpacing: '-0.01em' }}>
            Latest in every stream
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub }}>
            Meditation, music and both courses — the newest of each, every week.
          </p>
        </div>

        <a
          href={YOUTUBE_SUBSCRIBE}
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

      {/* Loading skeleton — same four-slot shape as the real thing, so the
          layout does not jump once the fetch lands. */}
      {status === 'loading' && (
        <div className="si-stream-grid">
          {STREAMS.map((s) => (
            <div key={s.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.accent }} />
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink }}>
                  {s.label}
                </span>
              </div>
              <div style={{
                borderRadius: 16, aspectRatio: '16/11',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(60,40,20,0.06)',
                animation: 'heartbeat 2s infinite',
              }} />
            </div>
          ))}
        </div>
      )}

      {status !== 'loading' && (
        <div className="si-stream-grid" role="list" aria-label="Latest video in each stream">
          {visible.map(({ stream, video }) => (
            <div key={stream.key} role="listitem" style={{ display: 'flex' }}>
              <div style={{ flex: 1, display: 'flex' }}>
                <StreamCard
                  stream={stream}
                  video={video}
                  isNewest={video.id === newestId}
                  isDark={isDark}
                />
              </div>
            </div>
          ))}
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
