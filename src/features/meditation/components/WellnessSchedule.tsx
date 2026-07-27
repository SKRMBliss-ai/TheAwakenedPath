import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { getSessionSchedule, SESSION_AGENDA, SESSION_TOTAL_MIN } from '../meditationService';

// ─────────────────────────────────────────────────────────────────────────────
// WellnessSchedule — the session flow everyone sees when they join.
//
//   <WellnessSchedule variant="panel" />  full agenda: done / active / upcoming,
//                                         live progress bar + remaining time
//   <WellnessSchedule variant="chip" />   compact "now" chip for the room header
//
// Self-contained: re-reads the schedule each second so the active segment and
// timers stay accurate. When the session isn't live it simply lists the flow.
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function useAgendaNow(userEmail?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { status, startTime } = getSessionSchedule(userEmail);
  const elapsedMs = status === 'live' ? now - startTime.getTime() : -1;

  let acc = 0;
  const segments = SESSION_AGENDA.map((s) => {
    const startMs = acc;
    acc += s.minutes * 60_000;
    return { ...s, startMs, endMs: acc };
  });
  const activeIdx = elapsedMs >= 0
    ? segments.findIndex((s) => elapsedMs >= s.startMs && elapsedMs < s.endMs)
    : -1;

  return { segments, elapsedMs, activeIdx, isLive: status === 'live' };
}

interface Props {
  variant?: 'panel' | 'chip';
  userEmail?: string;
  /** darker glassy styling for the video room; light for cream screens */
  dark?: boolean;
}

export default function WellnessSchedule({ variant = 'panel', userEmail, dark = true }: Props) {
  const { segments, elapsedMs, activeIdx, isLive } = useAgendaNow(userEmail);

  // ── Compact "now" chip (room header) ──────────────────────────────────────
  if (variant === 'chip') {
    if (activeIdx < 0) return null;
    const seg = segments[activeIdx];
    const remainMs = seg.endMs - elapsedMs;
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15">
        <span className="text-sm leading-none">{seg.emoji}</span>
        <span className="text-[11px] font-bold text-white whitespace-nowrap">{seg.label}</span>
        <span className="text-[11px] font-bold text-amber-400 tabular-nums">{fmt(remainMs)}</span>
      </div>
    );
  }

  // ── Full agenda panel ──────────────────────────────────────────────────────
  const textMain = dark ? '#fff' : 'var(--text-primary, #1C1814)';
  const textDim = dark ? 'rgba(255,255,255,0.55)' : 'var(--text-muted, #8A8272)';
  const rowBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const activeBg = dark ? 'rgba(251,191,36,0.12)' : 'rgba(184,151,58,0.10)';

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#A98A67' }}>
          Session Flow
        </p>
        <p className="text-[11px] font-bold" style={{ color: textDim }}>{SESSION_TOTAL_MIN} min</p>
      </div>

      <div className="space-y-1.5">
        {segments.map((seg, i) => {
          const done = isLive && activeIdx >= 0 ? i < activeIdx : (isLive && elapsedMs >= seg.endMs);
          const active = i === activeIdx;
          const segProgress = active ? Math.min(1, (elapsedMs - seg.startMs) / (seg.endMs - seg.startMs)) : 0;
          const remainMs = active ? seg.endMs - elapsedMs : 0;

          return (
            <div
              key={seg.label}
              className="relative overflow-hidden rounded-xl px-3 py-2.5 flex items-center gap-3"
              style={{
                background: active ? activeBg : rowBg,
                border: active ? '1px solid rgba(245,158,11,0.5)' : '1px solid transparent',
                opacity: done ? 0.45 : 1,
              }}
            >
              {/* live progress fill for the active segment */}
              {active && (
                <div
                  className="absolute inset-y-0 left-0 pointer-events-none transition-all duration-1000"
                  style={{ width: `${segProgress * 100}%`, background: 'rgba(245,158,11,0.12)' }}
                />
              )}

              <span className="text-xl leading-none relative">{seg.emoji}</span>
              <div className="flex-1 min-w-0 relative">
                <p className="text-[13px] font-bold leading-tight" style={{ color: active ? '#A98A67' : textMain }}>
                  {seg.label}
                </p>
                <p className="text-[10px] font-semibold" style={{ color: textDim }}>
                  {seg.minutes} min{active ? ` · ${fmt(remainMs)} left` : ''}
                </p>
              </div>

              <div className="relative flex-shrink-0">
                {done ? (
                  <Check size={14} style={{ color: textDim }} strokeWidth={3} />
                ) : active ? (
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                  </span>
                ) : (
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: textDim }}>{seg.minutes}m</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isLive && (
        <p className="mt-3 text-[10px] font-semibold text-center" style={{ color: textDim }}>
          Live Mon–Fri · 9:30 AM IST
        </p>
      )}
    </div>
  );
}
