// Adapted for AwakenedPath — uses callback navigation instead of react-router-dom
import { useState, useEffect, useRef, useCallback } from 'react';
import { meditationService, getSessionSchedule } from '../features/meditation/meditationService';
import { useMeditationStore } from '../stores/meditationStore';
import type { MeditationScreen } from '../features/meditation/types';

interface SessionUser { uid: string; displayName: string | null; photoURL: string | null; }
interface Options { user: SessionUser | null; active: boolean; onNavigate: (screen: MeditationScreen) => void; }

export function useMeditationSession({ user, active, onNavigate }: Options) {
  const { setSession, setSessionStatus, setParticipants, setMessages } = useMeditationStore();
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

  // ── Leave ────────────────────────────────────────────────────────────────────
  const handleLeave = useCallback(async (autoEnd = false) => {
    if (!user) return;
    const { sessionId, setStreak, setSessionStatus: setStatus, reset } = useMeditationStore.getState();
    if (!sessionId) return;
    const durationMinutes = Math.round((Date.now() - (joinedAtRef.current ?? Date.now())) / 60000);
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
    setSessionStatus('joining');
    setSession(schedule.sessionId, schedule.startTime.getTime(), schedule.endTime.getTime());
    try {
      await meditationService.joinSession(
        schedule.sessionId, user.uid,
        user.displayName || 'Practitioner',
        user.photoURL || ''
      );
      joinedAtRef.current = Date.now();
      endHandledRef.current = false;
      setSessionStatus('live');
      const unsubP = meditationService.subscribeToParticipants(schedule.sessionId, setParticipants);
      const unsubC = meditationService.subscribeToChat(schedule.sessionId, setMessages);
      (window as any).__meditationUnsubs = [unsubP, unsubC];
      onNavigate('room');
    } catch (err) {
      console.error('[Session] join failed:', err);
      setSessionStatus('idle');
    }
  }, [user, setSession, setSessionStatus, setParticipants, setMessages, onNavigate]);

  return { remainingMs, handleJoin, handleLeave };
}
