/**
 * MediaViewer — Displays shared YouTube videos, audio, or screen content
 * Audio is played for all participants (shared meditation music/guidance)
 * Participant mics remain muted (silent room)
 */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeSystem';

interface Props {
  mediaType: 'youtube' | 'audio' | 'screen';
  youtubeUrl?: string;
  audioUrl?: string;
  screenStream?: MediaStream;
}

const MediaViewer = ({ mediaType, youtubeUrl, audioUrl, screenStream }: Props) => {
  const { mode } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (screenStream && videoRef.current) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Ensure audio plays for all participants
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {
        // Auto-play blocked, user interaction required
      });
    }
  }, [audioUrl]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
      style={{
        background: mode === 'dark' ? '#1a1a2e' : '#f5f5fb',
        border: `2px solid ${mode === 'dark' ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.5)'}`
      }}
    >
      {mediaType === 'youtube' && youtubeUrl && (
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={getYouTubeEmbedUrl(youtubeUrl)}
          title="Shared Meditation Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      )}

      {mediaType === 'audio' && audioUrl && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl animate-pulse">🎵</div>
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            autoPlay
            muted={false}
            crossOrigin="anonymous"
            style={{
              width: '80%',
              maxWidth: '400px'
            }}
          />
          <p style={{ color: 'var(--text-muted)' }} className="text-sm text-center">
            🔊 Meditation Audio Playing for All<br/>
            <span className="text-xs opacity-75">(Participant mics muted)</span>
          </p>
        </div>
      )}

      {mediaType === 'screen' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
      )}
    </motion.div>
  );
};

export default MediaViewer;
