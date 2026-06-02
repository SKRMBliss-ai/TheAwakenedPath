/**
 * InstructorMediaControls — Allows instructor to share screen, YouTube videos, and audio
 * Only visible to skrmblissai@gmail.com
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Monitor, Music, Volume2, VolumeX } from 'lucide-react';
import { useMeditationStore } from '../../../stores/meditationStore';

interface Props {
  userEmail: string | null;
  sessionId: string | null;
}

const INSTRUCTOR_EMAIL = 'skrmblissai@gmail.com';

const InstructorMediaControls = ({ userEmail, sessionId }: Props) => {
  const { mediaShare, setMediaShare, clearMediaShare, notificationsMuted, toggleNotificationsMute } = useMeditationStore();
  const [showMenu, setShowMenu] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const isInstructor = userEmail === INSTRUCTOR_EMAIL;

  if (!isInstructor || !sessionId) return null;

  const handleYouTubeShare = () => {
    if (!youtubeUrl.trim()) return;
    setMediaShare({
      type: 'youtube',
      youtubeUrl: youtubeUrl.trim(),
      isPlaying: true
    });
    setYoutubeUrl('');
    setShowMenu(false);
  };

  const handleAudioShare = () => {
    if (!audioUrl.trim()) return;
    setMediaShare({
      type: 'audio',
      audioUrl: audioUrl.trim(),
      isPlaying: true
    });
    setAudioUrl('');
    setShowMenu(false);
  };

  const handleScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true as any,
        audio: false
      });
      setMediaShare({
        type: 'screen',
        screenStream: stream,
        isPlaying: true
      });
      setShowMenu(false);

      // Stop sharing when user stops screen share
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        clearMediaShare();
      };
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  };

  const handleStop = () => {
    if (mediaShare.screenStream) {
      mediaShare.screenStream.getTracks().forEach(t => t.stop());
    }
    clearMediaShare();
  };

  return (
    <div className="fixed top-20 right-4 z-[10015] flex flex-col gap-2">
      {/* Active share indicator */}
      {mediaShare.type !== 'none' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider"
        >
          ✓ Sharing {mediaShare.type === 'youtube' ? 'YouTube' : mediaShare.type === 'audio' ? 'Audio' : 'Screen'}
        </motion.div>
      )}

      {/* Control button */}
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileTap={{ scale: 0.95 }}
        className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-all"
        title="Instructor: Share media"
      >
        <Music size={18} />
      </motion.button>

      {/* Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-0 w-80 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Admin Controls</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-1 hover:bg-[var(--bg-base)] rounded transition-colors"
              >
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Mute Notifications */}
            <button
              onClick={toggleNotificationsMute}
              className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[var(--bg-base)] transition-colors border-b border-[var(--border-subtle)]"
            >
              {notificationsMuted ? (
                <>
                  <VolumeX size={14} className="text-red-400" />
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications Muted</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications On</span>
                </>
              )}
            </button>

            {/* Share header */}
            <div className="px-4 py-2 border-b border-[var(--border-subtle)]">
              <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Share with Group</p>
            </div>

            {/* Stop current share */}
            {mediaShare.type !== 'none' && (
              <button
                onClick={handleStop}
                className="w-full px-4 py-2.5 text-left flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border-b border-[var(--border-subtle)] transition-colors"
              >
                <X size={14} className="text-red-400" />
                <span className="text-sm font-bold text-red-400">Stop Sharing</span>
              </button>
            )}

            {/* YouTube */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <label className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                <Youtube size={14} />
                <span className="text-xs font-bold uppercase">YouTube URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 px-2.5 py-1.5 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-base)]"
                  style={{ color: 'var(--text-primary)' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleYouTubeShare()}
                />
                <button
                  onClick={handleYouTubeShare}
                  disabled={!youtubeUrl.trim()}
                  className="px-3 py-1.5 rounded bg-amber-500 text-black text-xs font-bold disabled:opacity-40 hover:bg-amber-400 transition-colors"
                >
                  Share
                </button>
              </div>
            </div>

            {/* Audio */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <label className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                <Music size={14} />
                <span className="text-xs font-bold uppercase">Audio URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="flex-1 px-2.5 py-1.5 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-base)]"
                  style={{ color: 'var(--text-primary)' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAudioShare()}
                />
                <button
                  onClick={handleAudioShare}
                  disabled={!audioUrl.trim()}
                  className="px-3 py-1.5 rounded bg-amber-500 text-black text-xs font-bold disabled:opacity-40 hover:bg-amber-400 transition-colors"
                >
                  Share
                </button>
              </div>
            </div>

            {/* Screen Share */}
            <button
              onClick={handleScreenShare}
              className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[var(--bg-base)] transition-colors"
            >
              <Monitor size={14} style={{ color: 'var(--accent-primary)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Share Your Screen</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorMediaControls;
