import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowLeft, Youtube, AlertCircle, Lock } from 'lucide-react';
import type { FeatureName, DeductResult } from '../tokens/tokenService';

/**
 * VideosHub — your YouTube playlists, embedded in the app.
 *
 * Each playlist auto-updates: add a video to it on YouTube and it appears here,
 * no code change needed. The video list is fetched from the `getPlaylistVideos`
 * Cloud Function (reuses the same YOUTUBE_API_KEY already used for the daily
 * reminder email), which filters out Shorts so only full videos show up.
 *
 * To add a playlist: copy the part after "list=" in the playlist URL
 *   https://www.youtube.com/playlist?list=PLxxxxxxxxxxxx   →   id: 'PLxxxxxxxxxxxx'
 */
export interface Playlist {
  id: string;        // the "list=" id from the playlist URL
  title: string;
  description?: string;
}

interface VideoItem {
  id: string;
  title: string;
  thumb: string | null;
  durationSec?: number;
}

// Calm, muted gradients cycled across the playlist cards for gentle variety.
const CARD_THEMES = [
  'linear-gradient(135deg, #695E68 0%, #1F5E59 100%)', // teal
  'linear-gradient(135deg, #5C6E9E 0%, #3C496F 100%)', // slate-blue
  'linear-gradient(135deg, #8A6E96 0%, #5C476B 100%)', // muted plum
  'linear-gradient(135deg, #4E8A6E 0%, #2F5C4A 100%)', // teal-green
];

export const PLAYLISTS: Playlist[] = [
  { id: 'PLJgH3fpxa83s7fayyCsmcJCgE3p1R7YB6', title: 'Meditations' },
  { id: 'PLJgH3fpxa83szr5qPuWlY5xapmfWodRrV', title: 'Wisdom Untethered' },
  { id: 'PLJgH3fpxa83stvs0mzdHL7YJ6nAFAlAsH', title: 'Wisdom Stories' },
  { id: 'PLJgH3fpxa83sDj2wg_DHhgTtSmxi30UWS', title: 'Power of Now' },
];

// Non-premium users get this many free videos per playlist (newest-first); the rest are locked.
const FREE_VIDEO_COUNT = 3;

interface VideosHubProps {
  isAccessValid?: boolean;
  /** Genuinely paid/admin users skip the per-video token charge entirely. */
  isPremiumUser?: boolean;
  deductTokens?: (cost: number, featureName: FeatureName) => Promise<DeductResult>;
  onUpgrade?: () => void;
}

const VIDEO_WATCH_COST = 5;

function fmtDuration(sec?: number): string {
  if (!sec || sec <= 0) return '';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Module-level cache so switching tabs doesn't re-fetch cover thumbnails every time.
const coverCache: Record<string, string> = {};

export function VideosHub({ isAccessValid = false, isPremiumUser = false, deductTokens, onUpgrade }: VideosHubProps = {}) {
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [covers, setCovers] = useState<Record<string, string>>(coverCache);

  // Videos already charged for in this session — re-selecting one you're
  // already watching (or already paid for) never charges twice.
  const chargedIds = useRef<Set<string>>(new Set());

  // Charges VIDEO_WATCH_COST once per distinct video, then plays it. Premium
  // users always bypass the charge. If the charge fails (tokens ran out),
  // send the user to upgrade instead of playing.
  const playVideo = async (v: VideoItem) => {
    if (isPremiumUser || chargedIds.current.has(v.id) || !deductTokens) {
      setActiveVideo(v);
      return;
    }
    const result = await deductTokens(VIDEO_WATCH_COST, 'video_watch');
    if (!result.success) {
      onUpgrade?.();
      return;
    }
    chargedIds.current.add(v.id);
    setActiveVideo(v);
  };

  // Fetch a cover thumbnail (first video's image) per playlist for the grid cards.
  useEffect(() => {
    const missing = PLAYLISTS.filter((pl) => !coverCache[pl.id]);
    if (missing.length === 0) return;

    Promise.all(
      missing.map((pl) =>
        fetch(`/api/playlist-videos?playlistId=${encodeURIComponent(pl.id)}`)
          .then((r) => r.json())
          .then((data) => {
            const thumb = Array.isArray(data?.videos) ? data.videos[0]?.thumb : null;
            if (thumb) coverCache[pl.id] = thumb;
          })
          .catch(() => { /* card just keeps its gradient */ })
      )
    ).then(() => setCovers({ ...coverCache }));
  }, []);

  useEffect(() => {
    if (!activePlaylist) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setVideos([]);
    setActiveVideo(null);

    fetch(`/api/playlist-videos?playlistId=${encodeURIComponent(activePlaylist.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: VideoItem[] = Array.isArray(data?.videos) ? data.videos : [];
        setVideos(list);
        if (list[0]) playVideo(list[0]);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activePlaylist]);

  if (PLAYLISTS.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <Youtube className="w-10 h-10 mx-auto text-[var(--text-muted)] opacity-40 mb-4" />
        <p className="text-[var(--text-secondary)] font-serif text-lg">Your video playlists are on their way.</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Guided sessions and teachings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl sm:text-4xl font-serif font-light text-[var(--text-primary)]">Videos</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Watch our teachings and guided sessions.</p>
      </div>

      <AnimatePresence mode="wait">
        {activePlaylist ? (
          <motion.div
            key="playlist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActivePlaylist(null)}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
              >
                <ArrowLeft size={14} /> All playlists
              </button>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {activePlaylist.title}
              </span>
            </div>

            {/* Player */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[var(--border-default)] bg-black shadow-lg">
              {failed || (!loading && videos.length === 0) ? (
                // Fallback: YouTube's own playlist player (still works even if our
                // video-list API is unavailable — just won't filter out Shorts).
                <iframe
                  src={`https://www.youtube.com/embed/videoseries?list=${activePlaylist.id}&rel=0&modestbranding=1`}
                  title={activePlaylist.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : activeVideo ? (
                <iframe
                  key={activeVideo.id}
                  src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                </div>
              )}
            </div>

            {activeVideo && (
              <h3 className="text-lg font-serif text-[var(--text-primary)] leading-snug">{activeVideo.title}</h3>
            )}

            {/* Free-tier notice */}
            {!isAccessValid && !loading && videos.length > FREE_VIDEO_COUNT && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/25">
                <p className="text-[12px] text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">{FREE_VIDEO_COUNT} free videos</span> per playlist — unlock the full library.
                </p>
                <button
                  onClick={onUpgrade}
                  className="flex-shrink-0 text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
                >
                  Upgrade
                </button>
              </div>
            )}

            {/* Full playlist grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-xl bg-[var(--bg-surface)] animate-pulse" />
                ))}
              </div>
            ) : failed || videos.length === 0 ? (
              <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)] py-4">
                <AlertCircle size={15} /> Couldn't load the full list — showing the playlist player above instead.
              </div>
            ) : videos.length > 1 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {videos.map((v, idx) => {
                  const isPlaying = activeVideo?.id === v.id;
                  const isLocked = !isAccessValid && idx >= FREE_VIDEO_COUNT;
                  return (
                    <button
                      key={v.id}
                      onClick={() => (isLocked ? onUpgrade?.() : playVideo(v))}
                      className={`relative rounded-xl overflow-hidden text-left group border transition-all ${
                        isPlaying ? 'border-[var(--accent-primary)]' : 'border-transparent hover:border-[var(--border-default)]'
                      }`}
                    >
                      <div className="aspect-video bg-[var(--bg-surface)] relative">
                        {v.thumb && (
                          <img
                            src={v.thumb}
                            alt=""
                            className="w-full h-full object-cover"
                            style={isLocked ? { filter: 'grayscale(0.6) blur(2px) brightness(0.6)' } : undefined}
                            loading="lazy"
                          />
                        )}
                        {isLocked ? (
                          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-1">
                            <Lock size={16} className="text-white" />
                            <span className="text-white text-[8px] font-bold uppercase tracking-wider">Premium</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                            <Play
                              size={22}
                              className={`text-white drop-shadow transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                              fill="currentColor"
                            />
                          </div>
                        )}
                        {v.durationSec && !isLocked ? (
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                            {fmtDuration(v.durationSec)}
                          </span>
                        ) : null}
                      </div>
                      <p className={`text-[11px] mt-1.5 leading-snug line-clamp-2 ${isLocked ? 'text-[var(--text-muted)]' : isPlaying ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}>
                        {v.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          >
            {PLAYLISTS.map((pl, i) => (
              <motion.button
                key={pl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePlaylist(pl)}
                className="relative overflow-hidden rounded-[20px] h-40 sm:h-44 text-left group shadow-lg"
                style={!covers[pl.id] ? { background: CARD_THEMES[i % CARD_THEMES.length] } : undefined}
              >
                {/* Real video thumbnail — desaturated + blurred so its own bold on-image
                    text dissolves into calm texture instead of competing with our title.
                    scale-110 base hides the blur's soft edge at the card border. */}
                {covers[pl.id] && (
                  <img
                    src={covers[pl.id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-110 transition-transform duration-700 group-hover:scale-125"
                    style={{ filter: 'grayscale(1) contrast(1.05) brightness(0.7) blur(7px)' }}
                    loading="lazy"
                  />
                )}

                {/* Duotone recolour — paints the brand gradient's hue onto the photo's
                    luminance (Spotify/Calm-style), so every card feels cohesive and the
                    thumbnail's own bold on-image text fades into texture. */}
                {covers[pl.id] && (
                  <div
                    className="absolute inset-0"
                    style={{ background: CARD_THEMES[i % CARD_THEMES.length], mixBlendMode: 'color' }}
                  />
                )}
                {!covers[pl.id] && (
                  <div className="absolute inset-0" style={{ background: CARD_THEMES[i % CARD_THEMES.length] }} />
                )}

                {/* Full-card scrim — keeps the whole card moody so our title always wins,
                    with only the top edge left a touch lighter for a sense of depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />

                {/* Play badge */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all group-hover:bg-white/30 group-hover:scale-110">
                  <Play size={16} className="text-white" fill="currentColor" style={{ marginLeft: 2 }} />
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-serif text-xl sm:text-2xl leading-tight drop-shadow-lg">{pl.title}</h3>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.18em] mt-1.5">
                    {pl.description || 'Watch playlist'}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideosHub;
