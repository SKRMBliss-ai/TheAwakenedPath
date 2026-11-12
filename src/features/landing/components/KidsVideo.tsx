/**
 * KidsVideo — plays a marketing MP4 if the file exists under public/, else
 * shows a tidy "coming soon" placeholder. It probes with a HEAD request and
 * checks the content type, because the SPA fallback answers 200 with HTML for
 * missing paths — so a plain status check would render a broken player.
 */
import { useEffect, useState } from 'react';
import { Play, Film } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';
import type { KidsVideoConfig } from '../kidsVideos';

const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

type State = 'checking' | 'ready' | 'missing';

export default function KidsVideo({
  video, palette, large = false,
}: { video: KidsVideoConfig; palette: Palette; large?: boolean }) {
  const [state, setState] = useState<State>('checking');

  useEffect(() => {
    let alive = true;
    fetch(video.src, { method: 'HEAD' })
      .then((r) => {
        const ok = r.ok && (r.headers.get('content-type') || '').startsWith('video/');
        if (alive) setState(ok ? 'ready' : 'missing');
      })
      .catch(() => { if (alive) setState('missing'); });
    return () => { alive = false; };
  }, [video.src]);

  const frame: React.CSSProperties = {
    position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: large ? 28 : 18,
    overflow: 'hidden', background: palette.BAND, border: `1px solid ${palette.BAND_BORDER}`,
  };

  if (state === 'ready') {
    return (
      <div style={frame}>
        <video
          src={video.src} poster={video.poster} controls playsInline preload="metadata"
          aria-label={`${video.title} video`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ ...frame, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 16 }}
      role="img"
      aria-label={`${video.title} video, coming soon`}
      data-video-placeholder={video.name}
    >
      <div>
        <span style={{
          display: 'inline-grid', placeItems: 'center', width: large ? 64 : 44, height: large ? 64 : 44,
          borderRadius: '50%', background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, marginBottom: 10,
        }}>
          {large ? <Play size={26} fill="currentColor" /> : <Film size={18} />}
        </span>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: large ? 24 : 17, color: palette.ON_BAND, lineHeight: 1.2 }}>
          {video.title}
        </p>
        <p style={{ margin: '4px 0 0', fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: palette.ON_BAND_ACCENT }}>
          Video coming soon
        </p>
      </div>
    </div>
  );
}
