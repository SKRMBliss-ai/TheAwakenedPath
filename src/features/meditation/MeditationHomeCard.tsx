import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Zap } from 'lucide-react';
import { getSessionSchedule } from './meditationService';
import { useTheme } from '../../theme/ThemeSystem';

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
  const { mode } = useTheme();
  const isLight = mode === 'light';
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

  // ── Not live: collapse to a single quiet line (full card only when joinable) ──
  if (!isLive) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onEnter}
        aria-label="Daily meditation — view upcoming session"
        className={`mb-4 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md text-left transition-all
          ${isLight
            ? 'border-indigo-200/70 bg-indigo-50/40 hover:bg-indigo-50/80'
            : 'border-indigo-400/20 bg-indigo-500/5 hover:bg-indigo-500/10'}`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Wind size={14} className={isLight ? 'text-indigo-400' : 'text-indigo-300/70'} />
          <span className={`text-[12px] font-medium truncate ${isLight ? 'text-slate-700' : 'text-white/85'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider mr-1.5">Wellness Session</span>
            next session in {fmtCountdown(schedule.untilStartMs)}
          </span>
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${isLight ? 'text-indigo-500' : 'text-indigo-300/80'}`}>
          Remind me ›
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', damping: 20, stiffness: 100 }}
      className={`mb-4 rounded-3xl overflow-hidden relative backdrop-blur-xl border
        ${isLight
          ? (isLive
              ? 'border-[#8C7B8A]/40 shadow-[0_8px_28px_rgba(140,123,138,0.14)] bg-gradient-to-br from-[#EAF1F0] via-white to-white'
              : 'border-indigo-200/70 shadow-[0_8px_24px_rgba(99,102,241,0.08)] bg-gradient-to-br from-indigo-50/70 via-white to-white')
          : (isLive
              ? 'border-[#CFC2CD]/30 shadow-[0_8px_40px_rgba(180,205,205,0.18),inset_0_1px_1px_rgba(255,255,255,0.1)] bg-gradient-to-br from-[#CFC2CD]/10 via-[#0d161a]/80 to-[#080a14]/90'
              : 'border-indigo-400/20 shadow-[0_8px_32px_rgba(99,102,241,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] bg-gradient-to-br from-indigo-500/10 via-[#0e0e22]/80 to-[#080a14]/90')
        }`}
    >
      {/* Decorative glowing orb behind the content */}
      {isLive && (
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[64px] pointer-events-none ${isLight ? 'bg-[#8C7B8A]/20' : 'bg-[#CFC2CD]/20'}`} />
      )}
      {/* Top strip */}
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <Wind size={12} className={isLive ? (isLight ? 'text-[#8C7B8A]' : 'text-[#CFC2CD]') : (isLight ? 'text-indigo-400' : 'text-indigo-300/60')} />
          <span className={`text-[10px] font-bold uppercase tracking-widest
            ${isLive ? (isLight ? 'text-[#345C5A]' : 'text-[#CFC2CD]') : (isLight ? 'text-indigo-500' : 'text-indigo-300/60')}`}>
            Wellness Session
          </span>
          {adminOverride && (
            <span className={`ml-1 hidden sm:flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full ${isLight ? 'text-[#8C7B8A] bg-[#8C7B8A]/10' : 'text-[#CFC2CD]/70 bg-[#CFC2CD]/10'}`}>
              <Zap size={8} /> admin
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-inner flex-shrink-0
          ${isLive
            ? (isLight ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-600' : 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]')
            : (isLight ? 'bg-indigo-500/8 border border-indigo-300/50 text-indigo-500' : 'bg-indigo-500/10 border border-indigo-400/20 text-indigo-300/60')}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : (isLight ? 'bg-indigo-400/50' : 'bg-indigo-300/30')}`} />
          {isLive ? 'Live' : 'Upcoming'}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 pb-4 pt-0.5">
        <div className="flex-1 min-w-0 z-10 relative break-words">
          {isLive ? (
            <>
              <p className={`font-black text-[12px] sm:text-[15px] leading-snug tracking-wide pr-1 ${isLight ? 'text-slate-800' : 'text-white drop-shadow-md'}`}>
                Wellness session in progress
              </p>
              <p className={`font-medium text-[10px] sm:text-xs mt-1 ${isLight ? 'text-[#345C5A]' : 'text-[#C9DEDE]/80 drop-shadow'}`}>
                {fmtCountdown(schedule.remainingMs)} remaining
              </p>
            </>
          ) : (
            <>
              <p className={`font-bold text-[12px] sm:text-[15px] leading-snug tracking-wide pr-1 ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                9:30 AM IST · Mon–Fri session
              </p>
              <p className={`font-medium text-[10px] sm:text-xs mt-1 ${isLight ? 'text-indigo-500' : 'text-indigo-200/50'}`}>
                Starts in {fmtCountdown(schedule.untilStartMs)} <span className="hidden sm:inline"><span className="opacity-50 mx-1">•</span> 80 min guided flow</span>
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
                active:scale-95 transition-all relative overflow-hidden z-10 group flex items-center justify-center gap-1"
              style={isLight
                ? {
                    background: 'linear-gradient(to right, #8C7B8A, #4E807E)',
                    color: '#F0F7F6',
                    border: '1px solid rgba(140,123,138,0.5)',
                    boxShadow: '0 6px 16px rgba(140,123,138,0.28)',
                  }
                : {
                    background: 'linear-gradient(to right, #CFC2CD, #C9DEDE)',
                    color: '#143433',
                    border: '1px solid rgba(201,222,222,0.5)',
                    boxShadow: '0 0 24px rgba(180,205,205,0.35), 0 8px 16px rgba(0,0,0,0.4)',
                  }}
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
              className={`flex-shrink-0 h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-wide
                active:scale-95 transition-transform
                ${isLight
                  ? 'bg-indigo-500/8 text-indigo-600 border border-indigo-300/50 hover:bg-indigo-500/15'
                  : 'bg-indigo-500/15 text-indigo-200/60 border border-indigo-400/20 hover:bg-indigo-500/25 hover:text-indigo-200/80'}`}
            >
              Remind me
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default MeditationHomeCard;
