/**
 * YouTubeSection.tsx
 * "Fresh from our channels" — the newest real uploads from each of our three YouTube
 * channels (Mind, Mantras and Meditation studios).
 *
 * Honesty rules, because a "latest" heading is a promise:
 *  - Every card is a real upload fetched from the channel. There are no built-in
 *    fallback videos: when the feed cannot load, the row is simply not shown.
 *  - A channel whose newest video is older than STALE_DAYS is not shown either,
 *    so we never advertise a quiet channel as "fresh".
 *  - Dates are the real publish dates ("2 days ago").
 */
import { useEffect, useState } from 'react';
import type { Palette } from '../../../lib/siteTheme';
import { STUDIOS, type StudioKey } from '../../../config/studios';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

/** A channel older than this is not "fresh", so its row is hidden. */
const STALE_DAYS = 75;

interface Channel {
  /** Query value the backend understands. */
  key: StudioKey;
  label: string;
  blurb: string;
  accent: string;
  /** Plain channel page, and the same page with the subscribe prompt armed. */
  url: string;
  subscribe: string;
}

const CHANNELS: Channel[] = STUDIOS.map((s) => ({
  key: s.key, label: s.name, blurb: s.channelLine, accent: s.accent, url: s.url, subscribe: s.subscribe,
}));

interface Video {
  id: string;
  title: string;
  thumb: string | null;
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

function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function fmtAgo(iso?: string | null): string | null {
  const days = daysSince(iso);
  if (days === null) return null;
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

function VideoCard({ video, accent, isDark }: { video: Video; accent: string; isDark: boolean }) {
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const borderC = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(196,181,160,0.42)';
  const fresh = (daysSince(video.publishedAt) ?? 999) <= 7;

  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="si-video-card"
      style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        borderRadius: 16, overflow: 'hidden',
        background: cardBg, border: `1px solid ${borderC}`, borderTop: `3px solid ${accent}`,
        textDecoration: 'none',
      }}
      aria-label={`Watch ${video.title}`}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: isDark ? '#1A1018' : '#EDE0CC', overflow: 'hidden' }}>
        {video.thumb && (
          <img src={video.thumb} alt="" className="si-thumb-img" loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        <div className="si-play-btn"><PlayCircle size={46} /></div>
        {fresh && (
          <span style={{
            position: 'absolute', left: 10, top: 10, padding: '4px 10px', borderRadius: 999,
            background: accent, color: '#fff', fontFamily: SANS, fontSize: 9, fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>New</span>
        )}
        {video.durationSec ? (
          <span style={{
            position: 'absolute', right: 8, bottom: 8, padding: '3px 8px', borderRadius: 6,
            background: 'rgba(0,0,0,0.78)', color: '#fff', fontFamily: SANS, fontSize: 11, fontWeight: 700,
          }}>{fmtDuration(video.durationSec)}</span>
        ) : null}
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{
          fontFamily: SERIF, fontSize: 17, fontWeight: 500, margin: '0 0 10px', lineHeight: 1.3, color: ink,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        }}>{video.title.replace(/[\uFFFD\uFFFE\uFFFF]+/g, '')}</p>
        <span style={{ fontFamily: SANS, fontSize: 11, color: inkSub, fontWeight: 600, marginTop: 'auto' }}>
          {fmtAgo(video.publishedAt) ?? ''}
        </span>
      </div>
    </a>
  );
}

export default function YouTubeSection({ palette, onTrack, studio }: { palette: Palette; onTrack?: (action: string) => void; studio?: StudioKey }) {
  const [rows, setRows] = useState<Partial<Record<Channel['key'], Video[]>>>({});
  const [done, setDone] = useState(false);
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#7A5F44';

  useEffect(() => {
    let cancelled = false;
    Promise.all(CHANNELS.map((c) =>
      fetch(`/api/latest-videos?channel=${c.key}&max=4`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((data): [Channel['key'], Video[]] => [c.key, Array.isArray(data?.videos) ? (data.videos as Video[]).slice(0, 4) : []])
        .catch((): [Channel['key'], Video[]] => [c.key, []]),
    )).then((pairs) => {
      if (cancelled) return;
      setRows(Object.fromEntries(pairs));
      setDone(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Only channels with a genuinely recent upload are shown.
  const visible = CHANNELS
    .filter((c) => !studio || c.key === studio)
    .map((c) => ({ channel: c, videos: rows[c.key] ?? [] }))
    .filter(({ videos }) => videos.length > 0 && (daysSince(videos[0].publishedAt) ?? 9999) <= STALE_DAYS);

  // Nothing fresh to show (or still loading): render nothing rather than a stale or empty block.
  if (!done || visible.length === 0) return null;

  return (
    <section
      className="si-reveal si-visible"
      style={{
        padding: 'clamp(64px, 9vw, 104px) clamp(24px, 6vw, 96px)',
        position: 'relative', zIndex: 2,
        background: isDark ? 'rgba(12,9,16,0.4)' : 'rgba(240,232,220,0.35)',
      }}
    >
      <style>{`
        .si-yt-grid { display: grid; gap: 22px; grid-template-columns: 1fr; }
        @media (min-width: 640px)  { .si-yt-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1100px) { .si-yt-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      <div style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 14 }}>
          From our channels
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 400, color: ink, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          {studio ? `Fresh from ${CHANNELS.find((c) => c.key === studio)?.label}` : 'Fresh from our channels'}
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub, margin: 0 }}>
          New videos, free to watch. Subscribe to get each one as it is published.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 44 }}>
        {visible.map(({ channel, videos }) => (
          <div key={channel.key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: channel.accent, flexShrink: 0, alignSelf: 'center' }} />
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink }}>
                  {channel.label}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 12, color: inkSub }}>{channel.blurb}</span>
              </div>
              <a
                href={channel.subscribe}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrack?.(`HOME_YOUTUBE_SUBSCRIBE_${channel.key.toUpperCase()}`)}
                style={{
                  display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '0 18px', borderRadius: 999,
                  background: '#FF0000', color: '#fff', textDecoration: 'none',
                  fontFamily: SANS, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap',
                }}
                aria-label={`Subscribe to ${channel.label} on YouTube`}
              >
                Subscribe
              </a>
            </div>
            <div className="si-yt-grid" role="list" aria-label={`Latest videos from ${channel.label}`}>
              {videos.map((v) => (
                <div key={v.id} role="listitem">
                  <VideoCard video={v} accent={channel.accent} isDark={isDark} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
