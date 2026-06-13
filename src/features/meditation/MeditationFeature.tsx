/**
 * MeditationFeature — self-contained meditation room feature for MindGym/MindGym.
 * Manages its own internal screen state (landing → room → journal) without react-router-dom.
 */
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { meditationService } from './meditationService';
import { useMeditationStore } from '../../stores/meditationStore';
import type { MeditationScreen } from './types';
import AwakenOrb from './components/AwakenOrb';
import MeditationRoom from './MeditationRoom';
import MeditationJournal from './MeditationJournal';
import MeditationPreJoin from './MeditationPreJoin';
import { getSessionSchedule, LIVE_MEDITATION_SESSION_ID } from './meditationService';
import { useMeditationSession } from '../../hooks/useMeditationSession';
import { Flame, ChevronDown } from 'lucide-react';
import { useTheme } from '../../theme/ThemeSystem';

// Simple inline dashboard for the landing page
import MeditationDashboard from './MeditationDashboard';

interface AuthUser { uid: string; displayName: string | null; photoURL: string | null; email: string | null; }
interface Props {
  user: AuthUser;
  adminOverride?: boolean;
  /** Called whenever the active screen changes. Pass true when the room is live. */
  onRoomStateChange?: (inRoom: boolean) => void;
}

export const MeditationFeature = ({ user, adminOverride = false, onRoomStateChange }: Props) => {
  const [screen, setScreen] = useState<MeditationScreen>('landing');
  const [prejoinCameraOn, setPrejoinCameraOn] = useState(false);
  const [prejoinStream, setPrejoinStream] = useState<MediaStream | null>(null);

  const navigate = (s: MeditationScreen) => setScreen(s);

  // Notify parent ONLY when the screen changes so it can collapse / expand sidebar,
  // without overriding the user's manual expand/collapse actions.
  const prevScreen = useRef(screen);
  useEffect(() => {
    if (prevScreen.current !== screen) {
      onRoomStateChange?.(screen === 'room');
      prevScreen.current = screen;
    }
  }, [screen, onRoomStateChange]);

  return (
    <AnimatePresence mode="wait">
      {screen === 'landing' && (
        <motion.div key="landing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <LandingScreen user={user} onNavigate={navigate} adminOverride={adminOverride} />
        </motion.div>
      )}

      {/* Pre-join lobby — shown before actually entering the room */}
      {screen === 'prejoin' && (
        <PrejoinWrapper
          key="prejoin"
          user={user}
          onNavigate={navigate}
          adminOverride={adminOverride}
          onCameraState={(camOn, stream) => { setPrejoinCameraOn(camOn); setPrejoinStream(stream); }}
        />
      )}

      {screen === 'room' && (
        <MeditationRoom
          key="room"
          user={user}
          onNavigate={navigate}
          initialCameraOn={prejoinCameraOn}
          initialStream={prejoinStream}
        />
      )}
      {screen === 'journal' && (
        <motion.div key="journal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-[10000]">
          <MeditationJournal user={user} onNavigate={navigate} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── PrejoinWrapper — calls handleJoin (Firebase) then reports camera state up ──

const PrejoinWrapper = ({ user, onNavigate, onCameraState, adminOverride = false }:
  { user: AuthUser; onNavigate:(s:MeditationScreen)=>void; onCameraState:(c:boolean,s:MediaStream|null)=>void; adminOverride?: boolean }) => {
  const { participants } = useMeditationStore();
  const { handleJoin } = useMeditationSession({ user, active: false, onNavigate });

  return (
    <MeditationPreJoin
      displayName={user.displayName || 'Practitioner'}
      avatarUrl={user.photoURL || undefined}
      participants={participants}
      onJoin={async (camOn, stream) => {
        onCameraState(camOn, stream);
        if (adminOverride) {
          // Admin bypasses the live-window guard — patch schedule temporarily
          const { setSession, setSessionStatus, setParticipants, setMessages } = useMeditationStore.getState();
          const now = new Date();
          // Use the SINGLE permanent room ID so admins and regular users always
          // share one room (same presence collection + signaling channel).
          const realId = LIVE_MEDITATION_SESSION_ID;
          const fakeEnd = new Date(now.getTime() + 60 * 60 * 1000);
          setSession(realId, now.getTime(), fakeEnd.getTime());
          setSessionStatus('joining');
          const { meditationService: svc } = await import('./meditationService');
          await svc.joinSession(realId, user.uid, user.displayName || 'Admin', user.photoURL || '');
          setSessionStatus('live');
          const unsubP = svc.subscribeToParticipants(realId, setParticipants);
          const unsubC = svc.subscribeToChat(realId, setMessages);
          const unsubS = svc.subscribeToSession(realId, (data) => {
            const { setChatEnabled, setMediaShare, clearMediaShare } = useMeditationStore.getState();
            if (data && typeof data.chatEnabled === 'boolean') setChatEnabled(data.chatEnabled);
            if (data?.mediaShare) {
              const ms = data.mediaShare;
              if (ms.type === 'youtube' && ms.url) setMediaShare({ type: 'youtube', youtubeUrl: ms.url, isPlaying: ms.isPlaying ?? false, timestamp: ms.timestamp, updatedAt: ms.updatedAt });
              else if (ms.type === 'audio' && ms.url) setMediaShare({ type: 'audio', audioUrl: ms.url, isPlaying: ms.isPlaying ?? false, timestamp: ms.timestamp, updatedAt: ms.updatedAt });
              else if (ms.type === 'none') clearMediaShare();
            }
          });
          (window as any).__meditationUnsubs = [unsubP, unsubC, unsubS];
          onNavigate('room');
        } else {
          await handleJoin();
        }
      }}
      onCancel={() => onNavigate('landing')}
    />
  );
};

// ── Landing Screen ─────────────────────────────────────────────────────────────

const LandingScreen = ({ user, onNavigate, adminOverride = false }:
  { user: AuthUser; onNavigate:(s:MeditationScreen)=>void; adminOverride?: boolean }) => {
  const { remainingMs } = useMeditationSession({ user, active: false, onNavigate });
  const { streak } = useMeditationStore();
  const { theme } = useTheme();
  const [realSchedule, setRealSchedule] = useState(getSessionSchedule(user.email || undefined));
  const [, setNow] = useState(new Date());
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    meditationService.getStreak(user.uid).then(s => {
      if (s) useMeditationStore.getState().setStreak(s);
    });
    const id = setInterval(() => { setRealSchedule(getSessionSchedule(user.email || undefined)); setNow(new Date()); }, 1000);
    return () => clearInterval(id);
  }, [user.uid, user.email]);

  // Admin always sees live session
  const schedule = adminOverride
    ? { ...realSchedule, status: 'live' as const, remainingMs: 15 * 60 * 1000 }
    : realSchedule;

  const isLive  = schedule.status === 'live';
  const waitSec = Math.ceil(realSchedule.untilStartMs / 1000);
  const waitMin = Math.floor(waitSec / 60), waitS = waitSec % 60;


  const join = () => onNavigate('prejoin');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 min-h-full relative">

      {/* Orb — the singular hero element */}
      <div className="relative flex flex-col items-center mb-10">
        <AwakenOrb size={160} />
      </div>

      {/* CTA — one clear action */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        {isLive ? (
          <>
            <button onClick={join}
              className="w-full py-5 rounded-3xl bg-amber-500 text-black font-black text-lg active:scale-95 transition-all shadow-[0_12px_40px_rgba(212,175,55,0.4)] hover:bg-amber-400">
              Just Show Up →
            </button>
            <p className="text-base font-medium tabular-nums" style={{ color: theme.textSecondary }}>
              {Math.floor(remainingMs/60000)}m {Math.floor((remainingMs%60000)/1000)}s remaining
            </p>
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: theme.textSecondary }}>
              Next session in
            </p>
            <p className="text-amber-500 font-black text-5xl tabular-nums tracking-tight dark:text-amber-400">
              {String(waitMin).padStart(2,'0')}:{String(waitS).padStart(2,'0')}
            </p>
          </>
        )}
      </div>

      {/* Minimal stats — single clear line */}
      {streak && (
        <p className="mt-10 text-base font-medium" style={{ color: theme.textSecondary }}>
          <Flame size={16} className="inline text-amber-500 dark:text-amber-400 mr-1.5 -mt-0.5" />
          {streak.currentStreak}-day streak · {streak.totalSessions} sessions
        </p>
      )}

      {/* Stats toggle */}
      <button onClick={()=>setShowStats(v=>!v)}
        className="mt-6 text-sm font-semibold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
        style={{ color: theme.textMuted }}>
        {showStats ? 'Hide' : 'Stats'}
        <motion.span animate={{ rotate: showStats?180:0 }} transition={{ duration:0.3 }}><ChevronDown size={14}/></motion.span>
      </button>

      <AnimatePresence>
        {showStats && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
            className="w-full max-w-sm mt-4 overflow-hidden">
            <MeditationDashboard user={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeditationFeature;
