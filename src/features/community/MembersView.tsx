import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { usePresentMembers } from './usePresence';
import { AREA_LABEL, type PresenceArea } from './presenceService';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../lib/utils';

const AREA_DOT: Record<PresenceArea, string> = {
  practice: 'bg-emerald-400',
  school: 'bg-sky-400',
  community: 'bg-amber-400',
  online: 'bg-[var(--text-muted)]',
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '·';
}

export function MembersView() {
  const { user } = useAuth();
  const { members, loaded } = usePresentMembers(user?.uid);

  const practising = members.filter((m) => m.area === 'practice').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-[var(--accent-primary)]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Members
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-[var(--text-primary)]">
            Here right now
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[13px] text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">{members.length}</strong> present
            {practising > 0 && (
              <> · <strong className="text-[var(--text-primary)]">{practising}</strong> practising</>
            )}
          </span>
        </div>
      </div>

      {/* Roster */}
      {!loaded ? (
        <p className="text-[13px] text-[var(--text-muted)]">Looking around…</p>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-8 text-center">
          <p className="text-[15px] font-serif italic text-[var(--text-secondary)]">
            It's quiet right now.
          </p>
          <p className="text-[13px] text-[var(--text-muted)] mt-2">
            You're the first one here — that counts too.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <motion.div
              key={m.uid}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60"
            >
              <div className="relative flex-shrink-0">
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full grid place-items-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[12px] font-bold text-[var(--text-secondary)]">
                    {initials(m.displayName || '')}
                  </div>
                )}
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-base,#000)]',
                    AREA_DOT[m.area] ?? AREA_DOT.online,
                  )}
                />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                  {m.displayName}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {AREA_LABEL[m.area] ?? AREA_LABEL.online}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[var(--text-muted)] opacity-70">
        Only names are shown here — never email addresses or progress.
      </p>
    </div>
  );
}
