import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';
import { useTheme } from '../../../theme/ThemeSystem';
import { useMeditationStore } from '../../../stores/meditationStore';

interface Props {
  mediaType: 'youtube' | 'audio';
  youtubeUrl?: string;
  audioUrl?: string;
  sessionId?: string;
  userEmail?: string | null;
}

const MediaViewer = ({ mediaType, youtubeUrl, audioUrl }: Props) => {
  const { mode } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const store = useMeditationStore();
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  
  // Track if we are currently handling an external sync event to prevent infinite loops
  const isSyncingRef = useRef(false);

  // Ensure audio plays for all participants
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  // Extract YouTube ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : '';
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
      controls: 0, // Always hide controls for everyone
      disablekb: 1, // Disable keyboard controls for everyone
    }
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    // We let the useEffect handle playing based on Firestore state
    setIsPlayerReady(true);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // With custom controls, we don't rely on clicking the video to update Firestore anymore
    // The custom Play/Pause button handles Firestore updates
    if (event.data === 1 /* PLAYING */) {
      setNeedsInteraction(false);
    }
  };

  // Listen to Firebase state changes and update the player
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady) return;

    const { isPlaying, timestamp, updatedAt } = store.mediaShare;
    
    // Calculate what the true timestamp should be right now
    let expectedTime = timestamp || 0;
    if (isPlaying && updatedAt) {
      const secondsSinceUpdate = (Date.now() - updatedAt) / 1000;
      expectedTime += secondsSinceUpdate;
    }

    // We only seek if the timestamp difference is significant (e.g. > 2 seconds) to avoid stuttering
    const currentTime = player.getCurrentTime() || 0;
    const timeDiff = Math.abs(currentTime - expectedTime);
    
    isSyncingRef.current = true;
    
    if (timeDiff > 2 && expectedTime > 0) {
      player.seekTo(expectedTime, true);
    }

    if (isPlaying) {
      player.playVideo();
      // Browser autoplay policies might block programmatic play for participants.
      // Check after a short delay if the video actually started playing.
      setTimeout(() => {
        if (playerRef.current && store.mediaShare.isPlaying) {
          const state = playerRef.current.getPlayerState();
          // If not PLAYING (1) and not BUFFERING (3), it means it was blocked.
          if (state !== 1 && state !== 3) {
            setNeedsInteraction(true);
          }
        }
      }, 1500);
    } else {
      player.pauseVideo();
    }
    
    // Reset sync flag shortly after
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 500);
  }, [store.mediaShare.isPlaying, store.mediaShare.timestamp, store.mediaShare.updatedAt, isPlayerReady]);

  if (mediaType === 'youtube' && youtubeUrl) {
    const videoId = getYouTubeId(youtubeUrl);
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-2xl bg-black border border-[var(--tile-border)]">
        {videoId ? (
          <div className="absolute inset-0 w-full h-full">
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={onReady}
              onStateChange={onStateChange}
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
            Invalid YouTube URL
          </div>
        )}
        
        {/* Invisible overlay blocks all clicks for EVERYONE so they cannot pause/play the video by clicking it */}
        <div className="absolute inset-0 z-10" />

        {/* Autoplay Block Resolution Overlay */}
        {needsInteraction && store.mediaShare.isPlaying && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <button
              onClick={() => {
                playerRef.current?.playVideo();
                setNeedsInteraction(false);
              }}
              className="px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex flex-col items-center gap-2 active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-black border-b-[8px] border-b-transparent ml-1"></div>
              </div>
              <span className="text-sm tracking-wide">Tap to Sync Video</span>
            </button>
            <p className="text-white/70 text-[11px] mt-6 font-bold uppercase tracking-widest text-center leading-relaxed">
              Your browser paused the video.<br/>Tap to catch up to the live session.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
      style={{
        background: mode === 'dark' ? '#1a1a2e' : '#f5f5fb',
        border: `2px solid ${mode === 'dark' ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.5)'}`
      }}
    >
      {mediaType === 'audio' && audioUrl && (
        <div className="flex flex-col items-center gap-6 relative z-20">
          <div className="text-6xl animate-pulse">🎵</div>
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            autoPlay
            muted={false}
            crossOrigin="anonymous"
            style={{ width: '80%', maxWidth: '400px' }}
          />
          <p style={{ color: 'var(--text-muted)' }} className="text-sm text-center">
            🔊 Meditation Audio Playing for All<br/>
            <span className="text-xs opacity-75">(Participant mics muted)</span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default MediaViewer;
