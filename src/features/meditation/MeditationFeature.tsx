/**
 * MeditationFeature — self-contained meditation room feature for AwakenedPath/MindGym.
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
import { getSessionSchedule, getTodayMeditationSessionId } from './meditationService';
import { useMeditationSession } from '../../hooks/useMeditationSession';
import { Flame, BarChart2, ChevronDown } from 'lucide-react';

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
          // Use stable today's session ID — getSessionSchedule() returns
          // tomorrow's ID once today's live window has passed, which would
          // put two admins joining at different times into different sessions.
          const realId = getTodayMeditationSessionId();
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
  const [realSchedule, setRealSchedule] = useState(getSessionSchedule(user.email || undefined));
  const [now, setNow] = useState(new Date());
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

  // Live clock
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const join = () => onNavigate('prejoin');

  return (
    <div className="flex flex-col items-center py-8 px-6 min-h-full relative">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/25 text-[10px] uppercase tracking-[0.5em] font-bold mb-2">AWAKEN · MindGym</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Daily Meditation</h1>
        <p className="text-white/30 text-sm mt-2">No teacher · No student · Just practitioners</p>
        {/* Live clock */}
        <p className="text-white/25 text-xs font-mono tabular-nums mt-3">
          {hh}:{mm}:{ss} <span className="text-white/15">hrs</span>
          {import.meta.env.DEV && (
            <span className="ml-2 text-amber-400/50 text-[9px] not-italic font-sans uppercase tracking-widest">
              · dev: 5-min slots
            </span>
          )}
        </p>
      </div>

      {/* AWAKEN orb — same as dashboard */}
      <div className="relative flex flex-col items-center mb-8">
        <AwakenOrb size={148} />
        <div className={`mt-5 flex items-center gap-2 px-4 py-1.5 rounded-full border ${isLive?'bg-emerald-500/10 border-emerald-500/30':'bg-white/5 border-white/10'}`}>
          <span className={`w-2 h-2 rounded-full ${isLive?'bg-emerald-400 animate-pulse':'bg-white/20'}`} />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${isLive?'text-emerald-400':'text-white/30'}`}>
            {isLive ? 'Session Live' : 'Between Sessions'}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-xs flex flex-col items-center gap-4">
        {isLive ? (
          <>
            <button onClick={join}
              className="w-full py-5 rounded-3xl bg-amber-500 text-black font-black text-base active:scale-95 transition-all shadow-[0_12px_40px_rgba(212,175,55,0.4)] hover:bg-amber-400 relative overflow-hidden">
              Just Show Up →
            </button>
            <p className="text-white/20 text-[10px] uppercase tracking-widest">
              {Math.floor(remainingMs/60000)}m {Math.floor((remainingMs%60000)/1000)}s remaining in session
            </p>
          </>
        ) : (
          <>
            <div className="w-full py-5 rounded-3xl bg-slate-800/50 border border-amber-400/15 flex flex-col items-center gap-1">
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Next session in</p>
              <p className="text-amber-400 font-black text-3xl tabular-nums">
                {String(waitMin).padStart(2,'0')}:{String(waitS).padStart(2,'0')}
                <span className="text-amber-400/40 text-base font-normal ml-1.5">hrs</span>
              </p>
            </div>
            <p className="text-white/15 text-[10px] text-center">
              {import.meta.env.DEV
                ? '⚡ Dev mode: 5-min slots (4 min live · 1 min gap)'
                : 'Daily session at 9:00 AM IST · 30 min (9:00–9:30)'}
            </p>
          </>
        )}
      </div>

      {/* Streak pill */}
      {streak && (
        <div className="flex items-center gap-3 mt-6 px-5 py-3 rounded-2xl bg-slate-800/40 border border-amber-400/15">
          <Flame size={16} className="text-amber-400" />
          <span className="text-white/70 text-sm font-bold">{streak.currentStreak}-day streak</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40 text-xs">{streak.totalSessions} sessions</span>
        </div>
      )}

      {/* Philosophy tags */}
      <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-xs">
        {['Small daily practice','Consistency over intensity','Silent collective presence'].map(t=>(
          <span key={t} className="px-3 py-1 rounded-full bg-white/5 border border-white/8 text-white/25 text-[10px]">{t}</span>
        ))}
      </div>

      {/* Stats toggle */}
      <button onClick={()=>setShowStats(v=>!v)}
        className="mt-8 flex items-center gap-2 text-white/25 hover:text-white/50 transition-colors text-xs font-bold uppercase tracking-widest">
        <BarChart2 size={14}/>
        {showStats ? 'Hide Stats' : 'My Practice Stats'}
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
