import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';
import { SACRED_TRACKS } from '../../features/music/musicData';
import { cn } from '../../lib/utils';

export const MusicMiniPlayer: React.FC = () => {
  const { status, category } = useVoiceStatus();
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const [volume, setVolume] = useState(VoiceService.volume);
  const [showVolume, setShowVolume] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Reactively track the MUSIC url (persists even while TTS interrupts)
  const [musicUrl, setMusicUrl] = useState<string | null>(VoiceService.musicUrl);

  useEffect(() => {
    setMusicUrl(VoiceService.musicUrl);
    return VoiceService.subscribe(() => {
      setMusicUrl(VoiceService.musicUrl);
    });
  }, []);

  const currentTrack = SACRED_TRACKS.find(t => t.previewUrl === musicUrl);

  // Visible whenever a music track is loaded — survives TTS interruptions
  const isVisible = !!currentTrack;

  // Poll progress
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      if (!isSeeking) {
        const p = VoiceService.audioProgress;
        // When TTS is active, audioProgress reads from TTS — always read music directly
        setProgress(p);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isVisible, isSeeking]);

  const isMusicPlaying = status === 'playing' && category === 'music';
  const isTTSInterrupting = category === 'tts' && status === 'playing' && !!musicUrl;

  const togglePlay = () => {
    if (isTTSInterrupting) return; // don't disrupt voice guidance
    if (isMusicPlaying) {
      VoiceService.pause();
    } else {
      VoiceService.resume('music');
    }
  };

  const handleSkip = (secs: number) => {
    VoiceService.skipBy(secs);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    VoiceService.setVolume(v);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekValue(progress.currentTime);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    VoiceService.seek(seekValue);
    setProgress(p => ({ ...p, currentTime: seekValue }));
    setIsSeeking(false);
  };

  const handleClose = () => {
    VoiceService.stop();
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = progress.duration > 0
    ? ((isSeeking ? seekValue : progress.currentTime) / progress.duration) * 100
    : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className={cn(
            'fixed bottom-0 right-0 left-0 lg:left-[280px] z-[1000]',
            'bg-[var(--bg-surface)]/90 backdrop-blur-2xl border-t border-[var(--border-default)]',
            'shadow-[0_-10px_40px_rgba(0,0,0,0.35)]'
          )}
        >
          {/* ── Seekable Progress Rail ─────────────────────────────────────────── */}
          <div className="relative h-1 bg-[var(--border-subtle)]/30 cursor-pointer group">
            {/* fill bar */}
            <div
              className="absolute top-0 left-0 h-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--glow-primary)] pointer-events-none"
              style={{ width: `${progressPct}%` }}
            />
            {/* invisible full-width range input */}
            <input
              type="range"
              min={0}
              max={progress.duration || 100}
              step={0.5}
              value={isSeeking ? seekValue : progress.currentTime}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {/* thumb dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--accent-primary)] shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPct}% - 6px)` }}
            />
          </div>

          {/* ── Main Row ─────────────────────────────────────────────────────────── */}
          <div className="px-4 py-2.5 sm:px-6 sm:py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-5">

              {/* Cover Art */}
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0">
                <img
                  src={currentTrack?.coverImage?.dark || '/sacred-bg-dark.png'}
                  alt={currentTrack?.title}
                  className="w-full h-full rounded-md object-cover shadow-lg"
                />
                {isMusicPlaying && (
                  <div className="absolute inset-0 flex items-end justify-center pb-1 bg-black/20 rounded-md">
                    <span className="flex gap-0.5 items-end h-3">
                      {[1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 12, 4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                          className="w-[3px] bg-[var(--accent-primary)] rounded-full"
                        />
                      ))}
                    </span>
                  </div>
                )}
              </div>

              {/* Title + status */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-[12px] font-bold text-[var(--text-primary)] truncate uppercase tracking-wider leading-tight">
                  {currentTrack?.title}
                </p>
                <p className="text-[9px] sm:text-[10px] truncate mt-0.5">
                  {isTTSInterrupting ? (
                    <span className="text-[var(--accent-primary)] italic">
                      ✦ Paused · Voice Guidance active
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">
                      {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
                    </span>
                  )}
                </p>
              </div>

              {/* ── Controls ─────────────────────────────────────────────────────── */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Rewind 15s */}
                <button
                  onClick={() => handleSkip(-15)}
                  disabled={isTTSInterrupting}
                  title="Rewind 15s"
                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all disabled:opacity-30"
                >
                  <SkipBack size={16} />
                </button>

                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  disabled={isTTSInterrupting}
                  className={cn(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full text-black flex items-center justify-center transition-all',
                    isTTSInterrupting
                      ? 'bg-[var(--accent-primary)]/40 cursor-not-allowed'
                      : 'bg-[var(--accent-primary)] hover:scale-105 active:scale-95 shadow-[0_0_16px_var(--glow-primary)]'
                  )}
                >
                  {isMusicPlaying
                    ? <Pause size={18} fill="black" />
                    : <Play size={18} fill="black" className="ml-0.5" />
                  }
                </button>

                {/* Forward 15s */}
                <button
                  onClick={() => handleSkip(15)}
                  disabled={isTTSInterrupting}
                  title="Forward 15s"
                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all disabled:opacity-30"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* ── Volume ────────────────────────────────────────────────────────── */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowVolume(v => !v)}
                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all"
                  title="Volume"
                >
                  {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full right-0 mb-3 px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl backdrop-blur-xl flex flex-col items-center gap-2 min-w-[48px]"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        {Math.round(volume * 100)}%
                      </span>
                      {/* Vertical slider */}
                      <div className="relative h-24 w-4 flex items-center justify-center">
                        <div className="absolute inset-x-1/2 -translate-x-1/2 h-full w-1 bg-[var(--border-subtle)] rounded-full" />
                        <div
                          className="absolute bottom-0 inset-x-1/2 -translate-x-1/2 w-1 bg-[var(--accent-primary)] rounded-full pointer-events-none"
                          style={{ height: `${volume * 100}%` }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.02}
                          value={volume}
                          onChange={handleVolumeChange}
                          className="absolute h-full w-full opacity-0 cursor-pointer"
                          style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close */}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                title="Stop Music"
              >
                <X size={16} />
              </button>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
