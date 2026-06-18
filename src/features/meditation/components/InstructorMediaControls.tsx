/**
 * InstructorMediaControls — Allows instructor to share YouTube videos and audio with the group.
 * Syncs via Firestore so all participants see the media simultaneously.
 * Screen Share removed — use YouTube URL sharing instead.
 * Only visible to skrmblissai@gmail.com
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Music, Volume2, VolumeX, MessageSquareOff, MessageSquare } from 'lucide-react';
import { useMeditationStore } from '../../../stores/meditationStore';
import { meditationService } from '../meditationService';

interface Props {
  userEmail: string | null;
  sessionId: string | null;
  myUid: string;
}

const INSTRUCTOR_EMAIL = 'skrmblissai@gmail.com';

const InstructorMediaControls = ({ userEmail, sessionId, myUid }: Props) => {
  const store = useMeditationStore();
  const { notificationsMuted, toggleNotificationsMute, chatEnabled, mediaShare, clearMediaShare } = store;
  const [showMenu, setShowMenu] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  
  const isInstructor = userEmail === INSTRUCTOR_EMAIL;

  if (!isInstructor || !sessionId) return null;

  const isSharing = store.mediaShare.type !== 'none';
  const isPlaying = store.mediaShare.isPlaying;

  const handleTogglePlayPause = async () => {
    const newIsPlaying = !isPlaying;
    
    // Calculate current timestamp based on previous state
    let currentTimestamp = store.mediaShare.timestamp || 0;
    if (isPlaying && store.mediaShare.updatedAt) {
      currentTimestamp += (Date.now() - store.mediaShare.updatedAt) / 1000;
    }
    
    store.setMediaShare({ ...store.mediaShare, isPlaying: newIsPlaying, timestamp: currentTimestamp, updatedAt: Date.now() });
    
    // Update firestore
    await meditationService.updateMediaState(sessionId, newIsPlaying, currentTimestamp);
  };

  const handleToggleChat = async () => {
    try {
      await meditationService.toggleRoomChat(sessionId, !chatEnabled);
    } catch (e) {
      console.error("Failed to toggle chat", e);
    }
  };

  const handleYouTubeShare = async () => {
    console.log("SHARE CLICKED:", youtubeUrl);
    if (!youtubeUrl.trim()) return;
    try {
      console.log("Updating Firestore with sessionId:", sessionId);
      // Write to Firestore — useMeditationSession propagates it to ALL participants
      await meditationService.updateMediaShare(sessionId, 'youtube', youtubeUrl.trim(), myUid);
      console.log("Firestore updated successfully!");
      setYoutubeUrl('');
      setShowMenu(false);
    } catch (e) {
      console.error('Failed to share YouTube:', e);
    }
  };

  const handleAudioShare = async () => {
    if (!audioUrl.trim()) return;
    try {
      await meditationService.updateMediaShare(sessionId, 'audio', audioUrl.trim(), myUid);
      setAudioUrl('');
      setShowMenu(false);
    } catch (e) {
      console.error('Failed to share audio:', e);
    }
  };

  const handleStop = async () => {
    try {
      // Clear in Firestore so ALL participants stop seeing the media
      await meditationService.updateMediaShare(sessionId, 'none');
      clearMediaShare();
    } catch (e) {
      console.error('Failed to stop sharing:', e);
    }
  };

  const handleSeek = async (seconds: number) => {
    let currentTimestamp = store.mediaShare.timestamp || 0;
    if (isPlaying && store.mediaShare.updatedAt) {
      currentTimestamp += (Date.now() - store.mediaShare.updatedAt) / 1000;
    }
    const newTimestamp = Math.max(0, currentTimestamp + seconds);
    store.setMediaShare({ ...store.mediaShare, timestamp: newTimestamp, updatedAt: Date.now() });
    await meditationService.updateMediaState(sessionId, !!isPlaying, newTimestamp);
  };

  return (
    <div className="fixed top-20 left-4 z-[10015] flex flex-col gap-2">
      {/* Active share indicator */}
      {mediaShare.type !== 'none' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider"
        >
          ✓ Sharing {mediaShare.type === 'youtube' ? 'YouTube' : 'Audio'}
        </motion.div>
      )}
      
      {/* Play/Pause Button for Media */}
      {isSharing && store.mediaShare.type === 'youtube' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleSeek(-15)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-all group backdrop-blur-md"
            title="Rewind 15s"
          >
            <span className="text-[10px] font-bold">-15s</span>
          </button>
          
          <button
            onClick={handleTogglePlayPause}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all group backdrop-blur-md"
          >
            {isPlaying ? (
              <>
                <div className="flex gap-1 items-center h-3">
                  <span className="w-1 h-3 bg-amber-400"></span>
                  <span className="w-1 h-3 bg-amber-400"></span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Pause</span>
              </>
            ) : (
              <>
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-amber-400 border-b-[5px] border-b-transparent"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleSeek(15)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-all group backdrop-blur-md"
            title="Forward 15s"
          >
            <span className="text-[10px] font-bold">+15s</span>
          </button>
        </div>
      )}

      {/* Control button */}
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileTap={{ scale: 0.95 }}
        className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-all w-fit"
        title="Instructor: Share media"
      >
        <Music size={18} />
      </motion.button>

      {/* Menu Overlay for click-outside to close */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 0 }}
            className="absolute top-14 left-0 w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <h3 className="text-sm font-bold text-white">Admin Controls</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mute Notifications */}
            <button
              onClick={toggleNotificationsMute}
              className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              {notificationsMuted ? (
                <>
                  <VolumeX size={14} className="text-red-400" />
                  <span className="text-sm font-bold text-white">Notifications Muted</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-emerald-400" />
                  <span className="text-sm font-bold text-white">Notifications On</span>
                </>
              )}
            </button>

            {/* Toggle Chat */}
            <button
              onClick={handleToggleChat}
              className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              {!chatEnabled ? (
                <>
                  <MessageSquareOff size={14} className="text-red-400" />
                  <span className="text-sm font-bold text-white">Chat Disabled</span>
                </>
              ) : (
                <>
                  <MessageSquare size={14} className="text-emerald-400" />
                  <span className="text-sm font-bold text-white">Chat Enabled</span>
                </>
              )}
            </button>

            {/* Share header */}
            <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02]">
              <p className="text-xs font-bold uppercase text-white/40">Share with Group</p>
            </div>

            {/* Stop current share */}
            {mediaShare.type !== 'none' && (
              <button
                onClick={handleStop}
                className="w-full px-4 py-2.5 text-left flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border-b border-white/5 transition-colors"
              >
                <X size={14} className="text-red-400" />
                <span className="text-sm font-bold text-red-400">Stop Sharing</span>
              </button>
            )}

            {/* YouTube */}
            <div className="p-4 border-b border-white/5">
              <label className="flex items-center gap-2 mb-2 text-white/50">
                <Youtube size={14} />
                <span className="text-xs font-bold uppercase text-white/70">YouTube URL (syncs for everyone)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 px-2.5 py-1.5 text-sm rounded border border-white/10 bg-black/50 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50"
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
            <div className="p-4">
              <label className="flex items-center gap-2 mb-2 text-white/50">
                <Music size={14} />
                <span className="text-xs font-bold uppercase text-white/70">Audio URL (syncs for everyone)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="flex-1 px-2.5 py-1.5 text-sm rounded border border-white/10 bg-black/50 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorMediaControls;
