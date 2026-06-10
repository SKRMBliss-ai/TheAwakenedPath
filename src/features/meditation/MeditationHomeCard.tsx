import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Zap } from 'lucide-react';
import { getSessionSchedule } from './meditationService';

interface Props {
  onEnter: () => void;
  adminOverride?: boolean; // skrmblissai@gmail.com always sees Live
}

function fmtCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const MeditationHomeCard = ({ onEnter, adminOverride = false }: Props) => {
  const [real, setReal] = useState(getSessionSchedule());

  useEffect(() => {
    const id = setInterval(() => setReal(getSessionSchedule()), 1000);
    return () => clearInterval(id);
  }, []);

  // Admin always sees a live 15-minute session
  const schedule = adminOverride
    ? { ...real, status: 'live' as const, remainingMs: 15 * 60 * 1000 }
    : real;

  const isLive = schedule.status === 'live';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', damping: 20, stiffness: 100 }}
      className={`mx-1 sm:mx-3 mb-4 rounded-3xl overflow-hidden relative backdrop-blur-xl border
        ${isLive
          ? 'border-teal-400/30 shadow-[0_8px_40px_rgba(45,212,191,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] bg-gradient-to-br from-teal-500/10 via-[#0d161a]/80 to-[#080a14]/90'
          : 'border-indigo-400/20 shadow-[0_8px_32px_rgba(99,102,241,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] bg-gradient-to-br from-indigo-500/10 via-[#0e0e22]/80 to-[#080a14]/90'
        }`}
    >
      {/* Decorative glowing orb behind the content */}
      {isLive && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-[64px] pointer-events-none" />
      )}
      {/* Top strip */}
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <Wind size={12} className={isLive ? 'text-teal-400' : 'text-indigo-300/60'} />
          <span className={`text-[10px] font-bold uppercase tracking-widest
            ${isLive ? 'text-teal-400' : 'text-indigo-300/60'}`}>
            Daily Meditation
          </span>
          {adminOverride && (
            <span className="ml-1 hidden sm:flex items-center gap-0.5 text-[8px] text-teal-400/60 bg-teal-400/10 px-1.5 py-0.5 rounded-full">
              <Zap size={8} /> admin
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-inner flex-shrink-0
          ${isLive
            ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            : 'bg-indigo-500/10 border border-indigo-400/20 text-indigo-300/60'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-indigo-300/30'}`} />
          {isLive ? 'Live' : 'Upcoming'}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 pb-3">
        <div className="flex-1 min-w-0 z-10 relative break-words">
          {isLive ? (
            <>
              <p className="text-white font-black text-[12px] sm:text-[15px] leading-snug tracking-wide drop-shadow-md pr-1">
                Silent group session in progress
              </p>
              <p className="text-teal-200/70 font-medium text-[10px] sm:text-xs mt-1 drop-shadow">
                {fmtCountdown(schedule.remainingMs)} remaining <span className="hidden sm:inline"><span className="opacity-50 mx-1">•</span> No teacher, no student</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-white/90 font-bold text-[12px] sm:text-[15px] leading-snug tracking-wide pr-1">
                9:00 AM IST daily session
              </p>
              <p className="text-indigo-200/50 font-medium text-[10px] sm:text-xs mt-1">
                Starts in {fmtCountdown(schedule.untilStartMs)} <span className="hidden sm:inline"><span className="opacity-50 mx-1">•</span> 30 min silent practice</span>
              </p>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLive ? (
            <motion.button
              key="join"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={onEnter}
              className="flex-shrink-0 min-w-[70px] sm:min-w-[84px] h-9 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[13px] uppercase tracking-widest
                active:scale-95 transition-all relative overflow-hidden z-10 group
                bg-gradient-to-r from-teal-500 to-teal-300 text-[#042f2e] 
                shadow-[0_0_24px_rgba(45,212,191,0.4),0_8px_16px_rgba(0,0,0,0.4)]
                hover:shadow-[0_0_32px_rgba(45,212,191,0.6),0_12px_24px_rgba(0,0,0,0.5)]
                hover:from-teal-400 hover:to-teal-200 border border-teal-200/50 flex items-center justify-center gap-1"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite_linear] pointer-events-none" />
              <span>Join</span><span className="hidden xs:inline">→</span>
            </motion.button>
          ) : (
            <motion.button
              key="view"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={onEnter}
              style={{ minWidth: 76 }}
              className="flex-shrink-0 h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-wide
                active:scale-95 transition-transform
                bg-indigo-500/15 text-indigo-200/60 border border-indigo-400/20
                hover:bg-indigo-500/25 hover:text-indigo-200/80"
            >
              Remind me
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar (live only) */}
      {isLive && (
        <div className="h-1 bg-black/40 backdrop-blur-md mx-4 mb-4 rounded-full overflow-hidden border border-white/5 shadow-inner relative z-10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300 relative shadow-[0_0_12px_rgba(45,212,191,0.8)]"
            style={{
              width: `${Math.min(100, (1 - schedule.remainingMs / (15 * 60 * 1000)) * 100).toFixed(1)}%`
            }}
            transition={{ duration: 1 }}
          >
            {/* Glow cap at the end of progress bar */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px] rounded-full" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MeditationHomeCard;
