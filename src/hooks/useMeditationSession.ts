// Adapted for MindGym — uses callback navigation instead of react-router-dom
import { useState, useEffect, useRef, useCallback } from 'react';
import { meditationService, getSessionSchedule, LIVE_MEDITATION_SESSION_ID, HEARTBEAT_INTERVAL_MS, MEDIA_SHARE_MAX_AGE_MS } from '../features/meditation/meditationService';
import { useMeditationStore } from '../stores/meditationStore';
import type { MeditationScreen } from '../features/meditation/types';

interface SessionUser { uid: string; displayName: string | null; photoURL: string | null; }
interface Options { user: SessionUser | null; active: boolean; onNavigate: (screen: MeditationScreen) => void; }

export function useMeditationSession({ user, active, onNavigate }: Options) {
  const { setSession, setSessionStatus, setParticipants, setMessages, setChatEnabled, setMediaShare, clearMediaShare } = useMeditationStore();
  const joinedAtRef = useRef<number | null>(null);
  const endHandledRef = useRef(false);
  // ✅ Fix: initialize from real schedule — NOT 0 — so auto-end never fires on mount
  const [remainingMs, setRemainingMs] = useState(() => getSessionSchedule().remainingMs);

  useEffect(() => {
    const tick = () => setRemainingMs(getSessionSchedule().remainingMs);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Track when we actually become active in the room so inRoomMs works
  useEffect(() => {
    if (active && !joinedAtRef.current) {
      joinedAtRef.current = Date.now();
    }
  }, [active]);

  // ── Leave ────────────────────────────────────────────────────────────────────
  const handleLeave = useCallback(async (autoEnd = false) => {
    if (!user) return;
    const { sessionId, setStreak, setSessionStatus: setStatus, reset, mediaShare } = useMeditationStore.getState();
    if (!sessionId) return;
    const durationMinutes = Math.round((Date.now() - (joinedAtRef.current ?? Date.now())) / 60000);
    // If I was the one sharing media, stop it for everyone as I leave.
    if (mediaShare.type !== 'none' && mediaShare.sharedBy === user.uid) {
      await meditationService.updateMediaShare(sessionId, 'none').catch(() => {});
    }
    await meditationService.leaveSession(sessionId, user.uid, durationMinutes);
    if (durationMinutes >= 5) {
      const streak = await meditationService.updateStreak(user.uid, sessionId.slice(0, 10)).catch(() => null);
      if (streak) setStreak(streak);
    }
    const unsubs: (() => void)[] = (window as any).__meditationUnsubs ?? [];
    unsubs.forEach(fn => fn());
    delete (window as any).__meditationUnsubs;
    setStatus('ended');
    if (autoEnd) { onNavigate('journal'); }
    else { reset(); onNavigate('landing'); }
  }, [user, onNavigate]);

  // Auto-end when timer reaches 0 inside room.
  // Guard: only fire if active AND we've actually been in the room for at least 3s
  useEffect(() => {
    if (!active || endHandledRef.current || remainingMs > 0) return;
    const inRoomMs = joinedAtRef.current ? Date.now() - joinedAtRef.current : 0;
    if (inRoomMs < 3000) return; // ignore the first few seconds to avoid mount-time false trigger
    const { sessionStatus } = useMeditationStore.getState();
    if (sessionStatus === 'live') { endHandledRef.current = true; handleLeave(true); }
  }, [remainingMs, active, handleLeave]);

  // ── Join ─────────────────────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    if (!user) return;
    const schedule = getSessionSchedule();
    if (schedule.status !== 'live') return;
    // Use the permanent live_meditation session ID (not time-based)
    // All participants share one eternal room
    const roomId = LIVE_MEDITATION_SESSION_ID;
    console.log('[Session] joining room:', roomId, 'as', user.uid);
    setSessionStatus('joining');
    setSession(roomId, schedule.startTime.getTime(), schedule.endTime.getTime());
    try {
      await meditationService.joinSession(
        roomId, user.uid,
        user.displayName || 'Practitioner',
        user.photoURL || ''
      );
      joinedAtRef.current = Date.now();
      endHandledRef.current = false;
      setSessionStatus('live');
      const unsubP = meditationService.subscribeToParticipants(roomId, (ps) => {
        console.log('[Session] present participants:', ps.map(p => p.uid));
        setParticipants(ps);
      });
      const unsubC = meditationService.subscribeToChat(roomId, setMessages);
      const unsubS = meditationService.subscribeToSession(roomId, (data) => {
        if (data && typeof data.chatEnabled === 'boolean') {
          setChatEnabled(data.chatEnabled);
        }
        // Sync YouTube/Audio sharing state from Firestore to all participants.
        // Ignore a stale share (e.g. yesterday's video left on the permanent room)
        // so it never auto-plays for whoever joins next.
        if (data?.mediaShare) {
          const ms = data.mediaShare;
          const isFresh = typeof ms.updatedAt === 'number' && Date.now() - ms.updatedAt < MEDIA_SHARE_MAX_AGE_MS;
          if (isFresh && ms.type === 'youtube' && ms.url) {
            setMediaShare({ type: 'youtube', youtubeUrl: ms.url, sharedBy: ms.sharedBy ?? undefined, isPlaying: ms.isPlaying ?? false, timestamp: ms.timestamp, updatedAt: ms.updatedAt });
          } else if (isFresh && ms.type === 'audio' && ms.url) {
            setMediaShare({ type: 'audio', audioUrl: ms.url, sharedBy: ms.sharedBy ?? undefined, isPlaying: ms.isPlaying ?? false, timestamp: ms.timestamp, updatedAt: ms.updatedAt });
          } else {
            clearMediaShare();
          }
        }
      });

      // Heartbeat: keep our presence fresh so other clients keep showing our card,
      // and so we disappear within ~45s if this tab is closed/crashes.
      const heartbeatId = window.setInterval(() => {
        meditationService.heartbeat(roomId, user.uid).catch(() => {});
      }, HEARTBEAT_INTERVAL_MS);

      (window as any).__meditationUnsubs = [unsubP, unsubC, unsubS, () => clearInterval(heartbeatId)];
      onNavigate('room');
    } catch (err) {
      console.error('[Session] join failed:', err);
      setSessionStatus('idle');
    }
  }, [user, setSession, setSessionStatus, setParticipants, setMessages, setChatEnabled, onNavigate]);

  return { remainingMs, handleJoin, handleLeave };
}
