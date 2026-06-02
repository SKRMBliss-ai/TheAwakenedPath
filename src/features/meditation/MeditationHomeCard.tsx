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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', damping: 22 }}
      className={`mx-3 mb-4 rounded-2xl overflow-hidden border
        ${isLive
          ? 'border-amber-400/50 shadow-[0_0_32px_rgba(212,175,55,0.22),inset_0_0_20px_rgba(212,175,55,0.06)] bg-gradient-to-br from-[#2c1f02] to-[#0d0e1c]'
          : 'border-indigo-400/25 shadow-[0_0_16px_rgba(99,102,241,0.10)] bg-gradient-to-br from-[#0e0e22] to-[#080a14]'
        }`}
    >
      {/* Top strip */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <Wind size={12} className={isLive ? 'text-amber-400' : 'text-indigo-300/60'} />
          <span className={`text-[10px] font-bold uppercase tracking-widest
            ${isLive ? 'text-amber-400' : 'text-indigo-300/60'}`}>
            Daily Meditation
          </span>
          {adminOverride && (
            <span className="ml-1 flex items-center gap-0.5 text-[8px] text-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
              <Zap size={8} /> admin
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest
          ${isLive
            ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
            : 'bg-indigo-500/10 border border-indigo-400/20 text-indigo-300/50'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-300/30'}`} />
          {isLive ? 'Live Now' : 'Upcoming'}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex-1 min-w-0">
          {isLive ? (
            <>
              <p className="text-white font-bold text-sm leading-tight">
                Silent group session in progress
              </p>
              <p className="text-amber-200/50 text-[11px] mt-0.5">
                {fmtCountdown(schedule.remainingMs)} remaining · No teacher, no student
              </p>
            </>
          ) : (
            <>
              <p className="text-white/80 font-bold text-sm leading-tight">
                9:00 AM IST daily session
              </p>
              <p className="text-indigo-200/40 text-[11px] mt-0.5">
                Starts in {fmtCountdown(schedule.untilStartMs)} · 15 min silent practice
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
              style={{ minWidth: 76 }}
              className="flex-shrink-0 h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wide
                active:scale-95 transition-transform relative overflow-hidden
                bg-amber-500 text-black shadow-[0_4px_20px_rgba(212,175,55,0.5)]
                hover:bg-amber-400"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent
                -translate-x-full animate-[shimmer_2s_infinite_linear] pointer-events-none" />
              Join →
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
        <div className="h-0.5 bg-white/5 mx-4 mb-3 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-amber-400"
            style={{
              width: `${Math.min(100, (1 - schedule.remainingMs / (15 * 60 * 1000)) * 100).toFixed(1)}%`
            }}
            transition={{ duration: 1 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default MeditationHomeCard;
