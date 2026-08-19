import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock } from 'lucide-react';
import {
  getUpcomingSessions, getSessionSchedule, SESSION_AGENDA, SESSION_TOTAL_MIN,
} from '../meditation/meditationService';
import { cn } from '../../lib/utils';

interface CalendarViewProps {
  userEmail?: string;
  onEnterSession?: () => void;
}

/** Local timezone label, e.g. "Europe/Berlin" — members are worldwide, so the
 *  calendar is explicit about whose clock it is showing. */
function localZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'your local time';
  } catch {
    return 'your local time';
  }
}

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const dateFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function relativeDay(d: Date) {
  const now = new Date();
  if (isSameDay(d, now)) return 'Today';
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return null;
}

export function CalendarView({ userEmail, onEnterSession }: CalendarViewProps) {
  const sessions = useMemo(() => getUpcomingSessions(10, userEmail), [userEmail]);
  const live = getSessionSchedule(userEmail).status === 'live';
  const zone = localZone();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays size={14} className="text-[var(--accent-primary)]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Calendar
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[var(--text-primary)]">
          We sit together
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-2">
          Every weekday · {SESSION_TOTAL_MIN} minutes · shown in {zone}
        </p>
      </div>

      {/* Upcoming */}
      <div className="space-y-2">
        {sessions.map((s, i) => {
          const rel = relativeDay(s.startTime);
          const isLiveNow = s.isNext && live;
          return (
            <motion.div
              key={s.sessionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border transition-colors',
                s.isNext
                  ? 'border-amber-400/40 bg-amber-500/10'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50',
              )}
            >
              {/* Date block */}
              <div className="flex flex-col items-center justify-center w-14 flex-shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  {dayFmt.format(s.startTime)}
                </span>
                <span className="text-[15px] font-bold text-[var(--text-primary)]">
                  {dateFmt.format(s.startTime)}
                </span>
              </div>

              <div className="w-px self-stretch bg-[var(--border-subtle)]" />

              {/* Detail */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium text-[var(--text-primary)]">
                    Wellness Session
                  </span>
                  {rel && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {rel}
                    </span>
                  )}
                  {isLiveNow && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                      </span>
                      Live now
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[var(--text-muted)]">
                  <Clock size={11} />
                  {timeFmt.format(s.startTime)} – {timeFmt.format(s.endTime)}
                </div>
              </div>

              {s.isNext && onEnterSession && (
                <button
                  onClick={onEnterSession}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-[var(--accent-primary)] text-black hover:opacity-90 transition-opacity"
                >
                  {isLiveNow ? 'Join' : 'Open room'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* What happens in a session */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-5">
        <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">
          What we do
        </h2>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {SESSION_AGENDA.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2.5 text-[13px]">
              <span className="text-[15px]">{seg.emoji}</span>
              <span className="text-[var(--text-secondary)] flex-1">{seg.label}</span>
              <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                {seg.minutes}m
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
