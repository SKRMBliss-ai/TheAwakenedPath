import { useState, useEffect } from 'react';
import { useTheme } from '../../../theme/ThemeSystem';

const SessionTimer = ({ remainingMs, totalMs = 15 * 60 * 1000 }: { remainingMs: number; totalMs?: number }) => {
  const { theme, mode } = useTheme();
  const minutes  = Math.floor(remainingMs / 60000);
  const seconds  = Math.floor((remainingMs % 60000) / 1000);
  const progress = 1 - remainingMs / totalMs;
  const isWarn   = remainingMs < 3 * 60 * 1000;
  const isUrgent = remainingMs < 60 * 1000;
  const color    = isUrgent ? '#f87171' : isWarn ? '#fbbf24' : '#D4AF37';
  const R = 20, circ = 2 * Math.PI * R;

  // Live clock — ticks every second
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return (
    <div className="flex items-center gap-3 select-none">

      {/* Live clock */}
      <div className="flex flex-col items-end">
        <span className="text-[9px] uppercase tracking-widest opacity-60" style={{ color: theme.textMuted }}>Current time</span>
        <span className="font-black text-sm tabular-nums" style={{ color: theme.textSecondary }}>
          {hh}:{mm}
          <span className="font-normal text-[10px] opacity-60" style={{ color: theme.textMuted }}>:{ss}</span>
          <span className="text-[9px] ml-1 opacity-50" style={{ color: theme.textMuted }}>hrs</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-8" style={{ backgroundColor: theme.borderGlass }} />

      {/* Session countdown ring */}
      <div className="relative" style={{ width: 46, height: 46 }}>
        <svg width={46} height={46} className="-rotate-90">
          <circle cx={23} cy={23} r={R} fill="none" stroke={mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth={3} />
          <circle cx={23} cy={23} r={R} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
            strokeDasharray={`${circ}`} strokeDashoffset={`${circ - circ * progress}`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-black tabular-nums" style={{ color }}>
            {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest opacity-60" style={{ color: theme.textMuted }}>Remaining</span>
        <span className="font-black text-base tabular-nums leading-none" style={{ color }}>
          {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
        </span>
      </div>

    </div>
  );
};

export default SessionTimer;
