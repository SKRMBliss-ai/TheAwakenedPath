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
import { Wind, LogOut } from 'lucide-react';
import { useMeditationSession } from '../../hooks/useMeditationSession';
import SessionTimer from './components/SessionTimer';
import type { MeditationScreen } from './types';

interface AuthUser { uid: string; displayName: string | null; photoURL: string | null; email: string | null; }

const JITSI_DOMAIN = 'meet.jit.si';
// Long random suffix so strangers can't stumble into the public room by guessing.
const JITSI_ROOM = 'MindGymDailyMeditation-7f3a91c4e2';

declare global {
  interface Window { JitsiMeetExternalAPI?: any; }
}

// Load Jitsi's iframe API script once, reusing it across mounts.
function loadJitsiScript(): Promise<void> {
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
    s.src = `https://${JITSI_DOMAIN}/external_api.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Jitsi script failed'));
    document.body.appendChild(s);
  });
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
    loadJitsiScript()
      .then(() => {
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return;
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: JITSI_ROOM,
          parentNode: containerRef.current,
          userInfo: { displayName: user.displayName || 'Practitioner' },
          configOverwrite: {
            startWithAudioMuted: true,      // silent meditation — mics off by default
            startWithVideoMuted: false,
            prejoinPageEnabled: false,      // we have our own gate; skip Jitsi's lobby
            disableDeepLinking: true,
            disableInviteFunctions: true,
            enableClosePage: false,
            disableThirdPartyRequests: true,
            toolbarButtons: [
              'microphone', 'camera', 'tileview', 'hangup',
              'chat', 'raisehand', 'sharedvideo', 'select-background', 'fullscreen',
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
      })
      .catch(() => setLoadError(true));

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
            <p className="font-bold text-sm leading-none text-white">Daily Meditation</p>
            <p className="text-[10px] mt-0.5 text-white/40">{count} present · Silent room</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SessionTimer remainingMs={remainingMs} />
          <button
            onClick={doLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold transition-all"
          >
            <LogOut size={14} className="-scale-x-100" /> Leave
          </button>
        </div>
      </div>

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
