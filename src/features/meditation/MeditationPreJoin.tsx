/**
 * MeditationPreJoin — Zoom/Meet-style "check your camera before joining" lobby.
 * User sees their own camera preview, can toggle it, then clicks Join.
 * Audio is always disabled — this is a silent room.
 * Supports both light and dark themes via CSS variables.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, MicOff, Users, X } from 'lucide-react';
import { useTheme } from '../../theme/ThemeSystem';
import type { MeditationParticipant } from './types';

interface Props {
  displayName: string;
  avatarUrl?: string;
  participants: MeditationParticipant[];
  onJoin: (cameraOn: boolean, stream: MediaStream | null) => void;
  onCancel: () => void;
}

const MeditationPreJoin = ({ displayName, avatarUrl, participants, onJoin, onCancel }: Props) => {
  const { mode } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [joining, setJoining] = useState(false);
  const others = participants.filter(p => p.isPresent).length;

  // Start camera preview
  const enableCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      setCameraOn(true);
      setCameraError(false);
      if (videoRef.current) { videoRef.current.srcObject = s; }
    } catch { setCameraError(true); }
  }, []);

  const disableCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOn(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stream]);

  const toggleCamera = () => cameraOn ? disableCamera() : enableCamera();

  // Attach stream to video element when both are ready
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Only stop tracks on unmount if we didn't hand the stream off to the room
  const handedOffRef = useRef(false);
  useEffect(() => () => {
    if (!handedOffRef.current) stream?.getTracks().forEach(t => t.stop());
  }, [stream]);

  const handleJoin = async () => {
    setJoining(true);
    // Detach from the preview <video> element — the room will adopt the same stream
    if (videoRef.current) videoRef.current.srcObject = null;
    handedOffRef.current = true; // prevent cleanup from stopping tracks
    await onJoin(cameraOn, stream);
  };

  const initials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg-surface, #1a1a2e)',
          border: '1.5px solid var(--border-default, rgba(255,255,255,0.1))',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-3"
          style={{ borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.06))' }}
        >
          <div>
            <p
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              AWAKEN · MindGym
            </p>
            <h2 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>Ready to join?</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-base)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera preview */}
        <div
          className="relative mx-4 mt-4 rounded-2xl overflow-hidden"
          style={{
            aspectRatio: '16/9',
            background: mode === 'dark' ? 'var(--bg-base)' : '#f5f5fb',
            border: `1.5px solid var(--border-default)`,
          }}
        >
          {cameraOn
            ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover opacity-70" />
                  : <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: mode === 'dark' ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.08)',
                        border: `1.5px solid ${mode === 'dark' ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.4)'}`
                      }}
                    >
                      <span className="text-amber-400 font-black text-2xl">{initials}</span>
                    </div>
                }
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {cameraError ? 'Camera unavailable — check browser permissions' : 'Camera is off'}
                </p>
                {cameraError && (
                  <p className="text-[10px] text-center px-4" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    Tip: tap the camera icon in your browser address bar to allow access
                  </p>
                )}
              </div>
            )
          }

          {/* Always-muted badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 backdrop-blur-sm
            px-2.5 py-1 rounded-full" style={{
              background: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}>
            <MicOff size={11} className="text-red-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{
              color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
            }}>Silent Room</span>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-3 left-3 backdrop-blur-sm px-2.5 py-1 rounded-lg" style={{
            background: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
          }}>
            <p className="text-xs font-bold" style={{ color: mode === 'dark' ? '#ffffff' : '#1a1a2e' }}>
              {displayName} <span style={{ opacity: 0.5, fontWeight: 'normal' }}>(You)</span>
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 px-4 py-4">
          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: cameraOn ? 'var(--bg-surface)' : 'var(--bg-base)',
              border: `1.5px solid ${cameraOn ? 'var(--border-default)' : 'var(--border-subtle)'}`,
              color: cameraOn ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {cameraOn ? <Camera size={16} /> : <CameraOff size={16} />}
            {cameraOn ? 'Camera On' : 'Camera Off'}
          </button>

          {/* Mic — always disabled, shown as informational */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm cursor-not-allowed opacity-40"
            style={{ border: '1.5px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            <MicOff size={16} className="text-red-400/60" />
            Mic Off
          </div>
        </div>

        {/* Participant count */}
        {others > 0 && (
          <div className="flex items-center gap-2 mx-4 mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Users size={13} className="text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-xs font-bold">
              {others} {others === 1 ? 'person is' : 'people are'} meditating right now
            </p>
          </div>
        )}

        {/* Silent room notice */}
        <p className="text-[11px] text-center px-6 pb-4 leading-relaxed" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          🔇 This is a silent room — audio is permanently disabled for everyone.
          <br />No teacher · No student · Just practitioners.
        </p>

        {/* Join button */}
        <div className="px-4 pb-5">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-4 rounded-2xl bg-amber-500 text-black font-black text-base
              disabled:opacity-60 active:scale-[0.98] transition-all
              shadow-[0_8px_30px_rgba(212,175,55,0.4)] hover:bg-amber-400
              flex items-center justify-center gap-2"
          >
            {joining
              ? <><span className="w-4 h-4 rounded-full border-2 border-t-black border-black/30 animate-spin" /> Joining…</>
              : 'Join Session'
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MeditationPreJoin;
