/**
 * JitsiMeditationRoom — reliable group video for the daily meditation room.
 *
 * Replaces the custom mesh-WebRTC video layer with an embedded Jitsi Meet room.
 * Jitsi handles all the hard parts (NAT traversal, mobile networks, SFU routing)
 * so video works dependably across devices. We keep our own concerns around it:
 *   - access gating + attendance/streak logging (done in the pre-join flow before
 *     this component mounts; useMeditationSession.handleLeave records the exit)
 *   - a slim branded header with the session timer + Leave button
 *
 * The room is a single permanent, hard-to-guess public room on meet.jit.si.
 * meet.jit.si rooms are stateless when empty, so there is no stale shared-video
 * or ghost-participant problem here.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Wind, LogOut, ListChecks, X, Sparkles } from 'lucide-react';
import { useMeditationSession } from '../../hooks/useMeditationSession';
import { auth } from '../../firebase';
import SessionTimer from './components/SessionTimer';
import WellnessSchedule from './components/WellnessSchedule';
import TodaysPracticePanel from './components/TodaysPracticePanel';
import type { MeditationScreen } from './types';

interface AuthUser { uid: string; displayName: string | null; photoURL: string | null; email: string | null; }

// JaaS (8x8 hosted Jitsi). The room is created on demand and is stateless when
// empty — no ghost participants or stale shared-video to manage. Access is gated
// by a per-user JWT minted server-side (/api/jitsi-token), so users never log in.
const JAAS_DOMAIN = '8x8.vc';
const JITSI_ROOM = 'DailyMeditation';

declare global {
  interface Window { JitsiMeetExternalAPI?: any; }
}

// Load JaaS's iframe API script (tenant-scoped URL) once, reusing across mounts.
function loadJitsiScript(appId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.getElementById('jitsi-external-api') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Jitsi script failed')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'jitsi-external-api';
    s.src = `https://${JAAS_DOMAIN}/${appId}/external_api.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Jitsi script failed'));
    document.body.appendChild(s);
  });
}

// Ask our Cloud Function for a JaaS access token for the current Firebase user.
async function fetchJaasToken(room: string): Promise<{ jwt: string; appId: string; room: string }> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('Not signed in');
  const res = await fetch(`/api/jitsi-token?room=${encodeURIComponent(room)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return res.json();
}

const JitsiMeditationRoom = ({
  user, onNavigate, initialStream = null,
}: {
  user: AuthUser;
  onNavigate: (s: MeditationScreen) => void;
  initialStream?: MediaStream | null;
}) => {
  const { handleLeave, remainingMs } = useMeditationSession({ user, active: true, onNavigate });
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const leftRef = useRef(false);
  const [count, setCount] = useState(1);
  const [loadError, setLoadError] = useState(false);
  // One overlay at a time — both anchor to the same corner, so opening either
  // has to close the other rather than stack on top of it.
  const [overlay, setOverlay] = useState<'none' | 'schedule' | 'practice'>('none');
  const toggleOverlay = (which: 'schedule' | 'practice') =>
    setOverlay(prev => (prev === which ? 'none' : which));

  const doLeave = useCallback(() => {
    if (leftRef.current) return;
    leftRef.current = true;
    try { apiRef.current?.dispose(); } catch { /* ignore */ }
    apiRef.current = null;
    handleLeave(false);
  }, [handleLeave]);

  useEffect(() => {
    // Release the camera grabbed by the pre-join lobby so Jitsi can open it
    // (otherwise the device reports the camera as busy and Jitsi shows no video).
    if (initialStream) {
      try { initialStream.getTracks().forEach(t => t.stop()); } catch { /* ignore */ }
    }

    let disposed = false;
    (async () => {
      const { jwt, appId, room } = await fetchJaasToken(JITSI_ROOM);
      await loadJitsiScript(appId);
      if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return;
      const api = new window.JitsiMeetExternalAPI(JAAS_DOMAIN, {
        roomName: `${appId}/${room}`,
        jwt,
        parentNode: containerRef.current,
        userInfo: { displayName: user.displayName || 'Practitioner' },
        configOverwrite: {
          startWithAudioMuted: true,      // silent meditation — mics off by default
          startWithVideoMuted: false,
          prejoinPageEnabled: false,      // we have our own gate; skip Jitsi's lobby
          disableDeepLinking: true,
          disableInviteFunctions: true,
          enableClosePage: false,
          toolbarButtons: [
            'microphone', 'camera', 'desktop', 'tileview', 'hangup',
            'chat', 'raisehand', 'sharedvideo', 'select-background', 'fullscreen', 'settings',
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          TILE_VIEW_MAX_COLUMNS: 3,
        },
      });
      apiRef.current = api;

      const refreshCount = () => setCount(api.getNumberOfParticipants?.() ?? 1);
      api.addEventListener('videoConferenceJoined', () => {
        api.executeCommand('setTileView', true);
        refreshCount();
      });
      api.addEventListener('participantJoined', refreshCount);
      api.addEventListener('participantLeft', refreshCount);
      // User clicked Jitsi's own hangup → run our leave (attendance + nav).
      api.addEventListener('readyToClose', () => doLeave());
    })().catch((err) => {
      console.error('[Jitsi] init failed:', err);
      setLoadError(true);
    });

    return () => {
      disposed = true;
      try { apiRef.current?.dispose(); } catch { /* ignore */ }
      apiRef.current = null;
    };
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col" style={{ background: '#0a0d1a' }}>
      {/* Slim branded header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <Wind size={16} className="text-amber-400" />
          <div>
            <p className="font-bold text-sm leading-none text-white">Wellness Session</p>
            <p className="text-[10px] mt-0.5 text-white/40">{count} present · Silent room</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* What we're doing right now (live segment + its countdown) */}
          <div className="hidden md:block">
            <WellnessSchedule variant="chip" userEmail={auth.currentUser?.email || undefined} />
          </div>
          <button
            onClick={() => toggleOverlay('practice')}
            aria-label="Today's practice"
            aria-pressed={overlay === 'practice'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] font-bold transition-all"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Today's Practice</span>
          </button>
          <button
            onClick={() => toggleOverlay('schedule')}
            aria-label="Session schedule"
            aria-pressed={overlay === 'schedule'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] font-bold transition-all"
          >
            <ListChecks size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Schedule</span>
          </button>
          <SessionTimer remainingMs={remainingMs} />
          <button
            onClick={doLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold transition-all"
          >
            <LogOut size={14} className="-scale-x-100" /> Leave
          </button>
        </div>
      </div>

      {/* Session schedule / today's practice overlay */}
      {overlay !== 'none' && (
        <div
          className={`absolute top-14 right-3 z-20 max-w-[calc(100vw-24px)] max-h-[72vh] overflow-y-auto rounded-2xl p-4 shadow-2xl ${
            overlay === 'practice' ? 'w-[360px]' : 'w-[300px]'
          }`}
          style={{ background: 'rgba(17,24,39,0.97)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <button
            onClick={() => setOverlay('none')}
            aria-label={overlay === 'practice' ? "Close today's practice" : 'Close schedule'}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-white/60"
          >
            <X size={14} />
          </button>
          {overlay === 'practice'
            ? <TodaysPracticePanel />
            : <WellnessSchedule userEmail={auth.currentUser?.email || undefined} dark />}
        </div>
      )}

      {/* Jitsi fills the rest */}
      <div ref={containerRef} className="flex-1 min-h-0 w-full">
        {loadError && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <p className="text-white/70 text-sm font-bold">Couldn’t load the video room.</p>
            <p className="text-white/40 text-xs">Check your connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-bold"
            >
              Reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JitsiMeditationRoom;
