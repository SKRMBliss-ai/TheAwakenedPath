/**
 * MeditationRoom — Zoom/Google Meet-style silent group meditation.
 * Gallery grid of participant tiles, self-view pinned bottom-right,
 * join/leave sounds via Web Audio API.
 * Supports both light and dark themes via CSS variables.
 */
import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicOff, MessageSquare, LogOut, Camera, CameraOff, FlipHorizontal, Wind } from 'lucide-react';
import { useMeditationStore } from '../../stores/meditationStore';
import { useMeditationSession } from '../../hooks/useMeditationSession';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useTheme } from '../../theme/ThemeSystem';
import { meditationService } from './meditationService';
import type { MeditationScreen, MeditationParticipant } from './types';
import { playJoinChime, playParticipantJoin, playEndWarning, playLeaveSound } from './useRoomSounds';
import SessionTimer from './components/SessionTimer';
import ChatPanel from './components/ChatPanel';
import InstructorMediaControls from './components/InstructorMediaControls';
import MediaViewer from './components/MediaViewer';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';
interface AuthUser { uid: string; displayName: string | null; photoURL: string | null; email: string | null; }

// Calculate responsive grid columns
function gridCols(n: number): number {
  if (n <= 1) return 1;
  if (n <= 2) return 2;
  if (n <= 4) return 2;
  if (n <= 9) return 3;
  return 4;
}

// ── Joining overlay ──────────────────────────────────────────────────────────
const JoiningOverlay = () => (
  <motion.div
    initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
    className="fixed inset-0 z-[10020] flex flex-col items-center justify-center gap-5"
    style={{ background: 'var(--room-bg, #0a0d1a)' }}
  >
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="w-20 h-20 rounded-full flex items-center justify-center"
      style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)' }}
    >
      <Wind size={32} className="text-amber-400" />
    </motion.div>
    <p style={{ color: 'var(--room-text, rgba(255,255,255,0.7))' }} className="font-bold text-base tracking-wide">Joining session…</p>
    <p style={{ color: 'var(--room-text-muted, rgba(255,255,255,0.3))' }} className="text-xs uppercase tracking-widest">Connecting to practitioners</p>
  </motion.div>
);

// ── Participant video tile ───────────────────────────────────────────────────
const VideoTile = ({ participant, stream, isLocal = false }:
  { participant: MeditationParticipant; stream?: MediaStream; isLocal?: boolean }) => {
  const { mode } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      
      // If the participant just re-enabled their camera, force playback to resume.
      // We rely on the Firestore sync state (participant.videoEnabled) because 
      // WebRTC 'unmute' events can be unreliable on iOS/Safari.
      if (participant.videoEnabled) {
        video.play().catch(() => {});
      }

      const handleUnmute = () => video.play().catch(() => {});
      stream.getVideoTracks().forEach(t => t.addEventListener('unmute', handleUnmute));
      return () => {
        stream.getVideoTracks().forEach(t => t.removeEventListener('unmute', handleUnmute));
      };
    } else {
      video.srcObject = null;
    }
  }, [stream, participant.videoEnabled]);

  // For local user: trust stream existence. For remote: also check participant flag.
  const hasVideo = isLocal
    ? !!stream && participant.videoEnabled
    : !!stream && participant.videoEnabled;


  const initials = (participant.displayName || 'P').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const firstName = (participant.displayName || 'Practitioner').split(' ')[0];

  const borderColor = mode === 'dark'
    ? 'rgba(212, 175, 55, 0.35)'
    : 'rgba(212, 175, 55, 0.5)';
  const tileBackground = mode === 'dark'
    ? '#1a1a2e'
    : '#ffffff';
  const tileAvatarBg = mode === 'dark'
    ? '#0f0f20'
    : '#f5f5fb';
  const shadowColor = mode === 'dark'
    ? '0 0 30px rgba(0,0,0,0.5), 0 0 15px rgba(212,175,55,0.1)'
    : '0 4px 20px rgba(0,0,0,0.08)';
  const textColor = mode === 'dark' ? '#ffffff' : '#1a1a2e';

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden min-h-0 transition-all duration-200"
      style={{
        background: tileBackground,
        border: `2.5px solid ${borderColor}`,
        boxShadow: shadowColor,
      }}
    >
      {hasVideo
        ? <video ref={videoRef} autoPlay playsInline muted
            className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`} />
        : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: tileAvatarBg }}>
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
              style={{
                background: mode === 'dark' ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.08)',
                border: `1.5px solid ${borderColor}`
              }}
            >
              <span className="text-amber-400 font-black text-xl">{initials}</span>
            </div>
          </div>
        )
      }
      {/* Bottom gradient - theme-aware */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: mode === 'dark'
          ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
          : 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
      }} />
      {/* Name + mute */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-xs font-bold drop-shadow-lg" style={{ color: textColor }}>
          {isLocal ? `${firstName} (You)` : firstName}
        </span>
        <div className="flex items-center gap-1 rounded-full px-1.5 py-0.5" style={{
          background: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(4px)'
        }}>
          <MicOff size={10} className="text-red-400" />
        </div>
      </div>
      {/* Local badge */}
      {isLocal && (
        <div className="absolute top-2 right-2 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{
          background: mode === 'dark' ? 'rgba(212, 175, 55, 0.9)' : 'rgba(212, 175, 55, 0.95)'
        }}>
          YOU
        </div>
      )}
    </div>
  );
};

// ── Main Room ────────────────────────────────────────────────────────────────
const MeditationRoom = ({
  user, onNavigate, initialCameraOn = false, initialStream = null
}: {
  user: AuthUser;
  onNavigate: (s: MeditationScreen) => void;
  initialCameraOn?: boolean;
  initialStream?: MediaStream | null;
}) => {
  const store = useMeditationStore();
  const { handleLeave, remainingMs } = useMeditationSession({ user, active: true, onNavigate });
  const { sessionId, isCameraOn, isChatOpen, participants, emojiReactions, cameraPermission, messages, notificationsMuted } = store;
  const [showJoining, setShowJoining] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; sender: string } | null>(null);
  const prevCountRef = useRef(0);
  const endWarnedRef = useRef(false);
  const prevMessagesLengthRef = useRef(messages.length);

  // ── Unread badge & Toast logic ─────────────────────────────────────────────
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
      setToastMessage(null);
      prevMessagesLengthRef.current = messages.length;
    } else {
      if (messages.length > prevMessagesLengthRef.current) {
        const newMsgs = messages.slice(prevMessagesLengthRef.current);
        const textMsgs = newMsgs.filter(m => m.type === 'text' && m.uid !== user.uid);
        if (textMsgs.length > 0) {
          setUnreadCount(prev => prev + textMsgs.length);
          const lastMsg = textMsgs[textMsgs.length - 1];
          setToastMessage({ id: lastMsg.id, text: lastMsg.text, sender: lastMsg.displayName.split(' ')[0] });
          if (!notificationsMuted) {
             const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             osc.connect(gain);
             gain.connect(ctx.destination);
             osc.frequency.setValueAtTime(800, ctx.currentTime);
             osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
             gain.gain.setValueAtTime(0.3, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
             osc.start(ctx.currentTime);
             osc.stop(ctx.currentTime + 0.2);
          }
          const t = setTimeout(() => setToastMessage(null), 4000);
          return () => clearTimeout(t);
        }
      }
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, isChatOpen, user.uid, notificationsMuted]);

  const webrtc = useWebRTC({ sessionId: sessionId ?? '', myUid: user.uid, enabled: !!sessionId });

  // ── Joining animation + chime ──────────────────────────────────────────────
  useEffect(() => {
    playJoinChime();
    const t = setTimeout(() => setShowJoining(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // ── Seed camera stream from pre-join lobby ───────────────────────────────
  useEffect(() => {
    if (initialCameraOn && initialStream) {
      // Reuse the stream already acquired in pre-join — no second getUserMedia needed
      webrtc.adoptStream(initialStream);
      store.setCameraOn(true);
      if (sessionId) meditationService.updateVideoEnabled(sessionId, user.uid, true).catch(() => {});
    } else if (initialCameraOn && !initialStream) {
      // Camera was on but stream wasn't preserved — restart it
      webrtc.startCamera().then(() => {
        store.setCameraOn(true);
        if (sessionId) meditationService.updateVideoEnabled(sessionId, user.uid, true).catch(() => {});
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Participant join ping ──────────────────────────────────────────────────
  useEffect(() => {
    const present = participants.filter(p => p.isPresent && p.uid !== user.uid).length;
    if (present > prevCountRef.current && prevCountRef.current > 0) playParticipantJoin();
    prevCountRef.current = present;
  }, [participants, user.uid]);

  // ── 2-min end warning ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!endWarnedRef.current && remainingMs > 0 && remainingMs < 2 * 60 * 1000) {
      endWarnedRef.current = true;
      playEndWarning();
    }
  }, [remainingMs]);

  // Camera toggle
  const handleToggleCamera = useCallback(async () => {
    if (isCameraOn) {
      webrtc.stopCamera();
      store.setCameraOn(false);
      if (sessionId) await meditationService.updateVideoEnabled(sessionId, user.uid, false);
    } else {
      // Set camera on BEFORE awaiting startCamera so the video tile mounts
      // before the stream arrives — this ensures useEffect([stream]) fires on mount
      store.setCameraOn(true);
      await webrtc.startCamera();
      if (sessionId) await meditationService.updateVideoEnabled(sessionId, user.uid, true);
    }
  }, [isCameraOn, webrtc, store, sessionId, user.uid]);

  const handleLeaveWithSound = useCallback(() => {
    playLeaveSound();
    setTimeout(() => handleLeave(false), 300);
  }, [handleLeave]);

  useEffect(() => () => webrtc.cleanup(), []);

  // Best-effort presence cleanup if the tab is closed / app backgrounded without
  // tapping Leave. The heartbeat staleness filter is the real safety net, but
  // this makes our card vanish for others almost instantly in the common case.
  useEffect(() => {
    if (!sessionId) return;
    const markGone = () => { meditationService.leaveSession(sessionId, user.uid, 0); };
    window.addEventListener('beforeunload', markGone);
    window.addEventListener('pagehide', markGone);
    return () => {
      window.removeEventListener('beforeunload', markGone);
      window.removeEventListener('pagehide', markGone);
    };
  }, [sessionId, user.uid]);

  if (!sessionId) return null;

  // Build participant list: include self in the main grid!
  // NOTE: Do NOT filter by webrtc.disconnectedPeers here — presence (the card)
  // is independent of the WebRTC video link. Peer connections briefly enter
  // 'disconnected' / 'failed' states during ICE negotiation (especially on
  // mobile↔desktop across NATs); if we hide cards on that, both users see
  // an empty room even though they're both in the session.
  const presentParticipants = participants.filter(p => p.isPresent);

  // Only treat media as "shared" if its owner is still present. If the sharer
  // left abruptly (their card already aged out), the video stops for everyone —
  // no more stale video playing for a participant who isn't even in the room.
  const sharerPresent = !store.mediaShare.sharedBy
    || presentParticipants.some(p => p.uid === store.mediaShare.sharedBy);
  const showMedia = store.mediaShare.type !== 'none' && sharerPresent;

  const meParticipant = presentParticipants.find(p => p.uid === user.uid) ?? {
    uid: user.uid, displayName: user.displayName || 'You',
    videoEnabled: isCameraOn, joinedAt: Date.now(), isPresent: true
  };
  const otherParticipants = presentParticipants.filter(p => p.uid !== user.uid);

  const gridParticipants = [meParticipant, ...otherParticipants];
  const visibleParticipants = gridParticipants.slice(0, 8);
  const overflow = Math.max(0, gridParticipants.length - 8);

  const gridCount = visibleParticipants.length + (overflow > 0 ? 1 : 0);
  const cols = gridCols(Math.max(gridCount, 1));
  const rows = Math.ceil(gridCount / cols);

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col overflow-hidden select-none"
      style={{ background: 'var(--room-bg, #0a0d1a)' }}
    >
      {/* Inject CSS variables for room theming — respects global theme mode */}
      <style>{`
        :root, .dark {
          --room-bg: #0a0d1a;
          --room-surface: #111827;
          --room-border: rgba(255,255,255,0.08);
          --room-text: rgba(255,255,255,0.85);
          --room-text-muted: rgba(255,255,255,0.3);
          --tile-bg: #1a1a2e;
          --tile-avatar-bg: #0f0f20;
          --tile-border: rgba(212,175,55,0.22);
        }
        :root:not(.dark), .light-mode {
          --room-bg: #f0f2f8;
          --room-surface: #ffffff;
          --room-border: rgba(0,0,0,0.08);
          --room-text: rgba(15,20,40,0.87);
          --room-text-muted: rgba(15,20,40,0.5);
          --tile-bg: #ffffff;
          --tile-avatar-bg: #f5f5fb;
          --tile-border: rgba(212,175,55,0.5);
        }
      `}</style>

      {/* Joining overlay */}
      <AnimatePresence>{showJoining && <JoiningOverlay />}</AnimatePresence>

      {/* ── TOP BAR (like Zoom header) ──────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-10"
        style={{ background: 'var(--room-surface)', borderBottom: '1px solid var(--room-border)' }}
      >
        <div className="flex items-center gap-3">
          <Wind size={16} className="text-amber-400" />
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: 'var(--room-text)' }}>Daily Meditation</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--room-text-muted)' }}>
              {showMedia ? (
                <>🔊 {store.mediaShare.type === 'youtube' ? 'Video' : store.mediaShare.type === 'audio' ? 'Audio' : 'Screen'} Sharing · Mics Muted</>
              ) : (
                <>Silent room · Participant mics disabled</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold" style={{ color: 'var(--room-text-muted)' }}>
              {participants.filter(p => p.isPresent).length} present
            </span>
          </div>
          <SessionTimer remainingMs={remainingMs} />
        </div>
      </div>

      {/* ── MAIN CONTENT (Video gallery or Media viewer) ────────────────────── */}
      {showMedia ? (
        // Media sharing layout — video player left, participant tiles right
        <div className="flex-1 relative overflow-hidden flex flex-col lg:flex-row gap-2 p-2">
          {/* Main media viewer — takes remaining space */}
          <div className="flex-1 min-h-0 min-w-0">
            <MediaViewer
              mediaType={store.mediaShare.type as 'youtube' | 'audio'}
              youtubeUrl={store.mediaShare.youtubeUrl}
              audioUrl={store.mediaShare.audioUrl}
            />
          </div>

          {/* Participant sidebar — always visible, fixed width on desktop, horizontal strip on mobile */}
          <div className="flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden"
               style={{ width: 'auto', minWidth: 0 }}>
            {visibleParticipants.map(p => {
              const isMe = p.uid === user.uid;
              return (
                <div
                  key={p.uid}
                  className="flex-shrink-0 rounded-xl overflow-hidden border"
                  style={{
                    width: 130,
                    height: 100,
                    background: 'var(--tile-bg)',
                    borderColor: 'var(--tile-border)',
                    minWidth: 120,
                  }}
                >
                  <VideoTile
                    participant={{ ...p, videoEnabled: isMe ? isCameraOn : p.videoEnabled }}
                    stream={isMe ? (webrtc.localStream ?? undefined) : webrtc.remoteStreams.get(p.uid)}
                    isLocal={isMe}
                  />
                </div>
              );
            })}
            {overflow > 0 && (
              <div
                className="flex items-center justify-center rounded-2xl min-h-[120px]"
                style={{ background: 'var(--tile-bg)', border: '2px solid var(--tile-border)' }}
              >
                <div className="text-center">
                  <p className="text-amber-400 font-black text-xl">+{overflow}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--room-text-muted)' }}>more present</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Normal gallery view
        <div className="flex-1 relative p-3 overflow-hidden">
          <div
            className="h-full grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`
            }}
          >
            {visibleParticipants.map(p => {
              const isMe = p.uid === user.uid;
              return (
                <VideoTile
                  key={p.uid}
                  participant={{ ...p, videoEnabled: isMe ? isCameraOn : p.videoEnabled }}
                  stream={isMe ? (webrtc.localStream ?? undefined) : webrtc.remoteStreams.get(p.uid)}
                  isLocal={isMe}
                />
              );
            })}
            {overflow > 0 && (
              <div
                className="flex items-center justify-center rounded-2xl min-h-[80px]"
                style={{ background: 'var(--tile-bg)', border: '2px solid var(--tile-border)' }}
              >
                <div className="text-center">
                  <p className="text-amber-400 font-black text-2xl">+{overflow}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--room-text-muted)' }}>more</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Floating emoji reactions ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[10008]">
        <AnimatePresence>
          {emojiReactions.map(r => (
            <motion.span key={r.id}
              initial={{ y: '85vh', x: `${r.x}vw`, opacity: 1, scale: 1 }}
              animate={{ y: '15vh', opacity: 0, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute text-3xl pointer-events-none" style={{ left: 0, bottom: 0 }}>
              {r.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Floating WhatsApp (Left) ─────────────────────────────────────────── */}
      <WhatsAppButton position="left" bottomOffset={96} />

      {/* ── INSTRUCTOR MEDIA CONTROLS ─────────────────────────────────────── */}
      <InstructorMediaControls userEmail={user.email} sessionId={sessionId} myUid={user.uid} />

      {/* ── CHAT PANEL & TOAST ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Invisible overlay for clicking outside to close chat */}
            <div 
              className="fixed inset-0 z-[10009]" 
              onClick={store.toggleChat}
            />
            <ChatPanel sessionId={sessionId} user={user} onClose={store.toggleChat} />
          </>
        )}
        {toastMessage && !isChatOpen && (
          <motion.div
            key={toastMessage.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[10010] border border-[var(--tile-border)] rounded-2xl px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex flex-col gap-1 cursor-pointer w-[90%] max-w-sm"
            style={{ background: 'var(--room-surface)' }}
            onClick={store.toggleChat}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={12} className="text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-amber-400">{toastMessage.sender}</span>
            </div>
            <span className="text-sm sm:text-base line-clamp-2" style={{ color: 'var(--room-text)' }}>{toastMessage.text}</span>
            <span className="text-[9px] uppercase tracking-widest mt-1 opacity-50" style={{ color: 'var(--room-text-muted)' }}>Tap to reply</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM CONTROLS (Zoom-style) ────────────────────────────────────── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8, type: 'spring', damping: 22 }}
        className="flex-shrink-0 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
        style={{ background: 'var(--room-surface)', borderTop: '1px solid var(--room-border)' }}
      >
        {cameraPermission === 'denied' && (
          <p className="text-amber-400/60 text-[10px] text-center mb-2">
            Camera access denied — others see your avatar
          </p>
        )}
        <div className="flex items-center justify-around max-w-sm mx-auto">

          {/* Mic — always off, non-interactive */}
          <div className="flex flex-col items-center gap-1 opacity-30 cursor-not-allowed">
            <div className="w-11 h-11 rounded-full bg-red-600/80 flex items-center justify-center">
              <MicOff size={18} className="text-white" />
            </div>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--room-text-muted)' }}>Muted</span>
          </div>

          {/* Camera */}
          <button onClick={handleToggleCamera}
            className="flex flex-col items-center gap-1 group">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all
              ${isCameraOn ? 'bg-white/15 group-hover:bg-white/20' : 'bg-red-600/80 group-hover:bg-red-500'}`}>
              {isCameraOn ? <Camera size={18} className="text-white" /> : <CameraOff size={18} className="text-white" />}
            </div>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--room-text-muted)' }}>
              {isCameraOn ? 'Camera' : 'Start'}
            </span>
          </button>

          {/* Flip camera (when on) */}
          {isCameraOn && (
            <button onClick={webrtc.switchCamera} className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-white/10 group-hover:bg-white/15 flex items-center justify-center transition-all">
                <FlipHorizontal size={18} className="text-white/70" />
              </div>
              <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--room-text-muted)' }}>Flip</span>
            </button>
          )}

          {/* Chat */}
          <button onClick={store.toggleChat} className="flex flex-col items-center gap-1 group relative">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all
              ${isChatOpen ? 'bg-amber-500/30 border border-amber-400/40' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <MessageSquare size={18} className={isChatOpen ? 'text-amber-400' : 'text-white/70'} />
              {unreadCount > 0 && !isChatOpen && (
                <div className="absolute top-0 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[var(--room-surface)] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </div>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--room-text-muted)' }}>Chat</span>
          </button>

          {/* Participants count */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-white/8 flex flex-col items-center justify-center">
              <span className="font-black text-sm leading-none" style={{ color: 'var(--room-text)' }}>
                {participants.filter(p => p.isPresent).length}
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--room-text-muted)' }}>Present</span>
          </div>

          {/* Leave — red, like Zoom end call */}
          <button onClick={handleLeaveWithSound} className="flex flex-col items-center gap-1 group">
            <div className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 flex items-center justify-center transition-all
              shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <LogOut size={18} className="text-white -scale-x-100" />
            </div>
            <span className="text-[9px] text-red-400/70 uppercase tracking-widest">Leave</span>
          </button>

        </div>
      </motion.div>
    </div>
  );
};

export default MeditationRoom;
