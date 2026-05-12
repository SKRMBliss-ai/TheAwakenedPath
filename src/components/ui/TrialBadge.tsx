import { motion } from 'framer-motion';
import { useTokens } from '../../features/tokens/useTokens';
import { useTheme } from '../../theme/ThemeSystem';

interface TrialBadgeProps {
  onUpgrade?: () => void;
  compact?: boolean;
}

function getDaysRemaining(trialExpiresAt: any): number {
  if (!trialExpiresAt) return 0;
  const expiry =
    typeof trialExpiresAt.toDate === 'function'
      ? trialExpiresAt.toDate().getTime()
      : new Date(trialExpiresAt).getTime();
  const diff = expiry - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function TrialBadge({ onUpgrade, compact = false }: TrialBadgeProps) {
  const { tokensRemaining, tokensTotal, trialExpiresAt, isEmpty, isLow, isTrialExpired } = useTokens();
  const { theme } = useTheme();
  const daysLeft = getDaysRemaining(trialExpiresAt);

  // Colors
  const color = isEmpty || isTrialExpired ? '#EF4444' : isLow ? '#F59E0B' : '#5EC4B0';
  const bg = isEmpty || isTrialExpired
    ? 'rgba(239,68,68,0.1)'
    : isLow
    ? 'rgba(245,158,11,0.1)'
    : 'rgba(94,196,176,0.08)';
  const border = isEmpty || isTrialExpired
    ? 'rgba(239,68,68,0.25)'
    : isLow
    ? 'rgba(245,158,11,0.25)'
    : 'rgba(94,196,176,0.2)';

  const pct = Math.max(0, Math.min(1, tokensRemaining / tokensTotal));
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const statusLabel = isTrialExpired
    ? 'Trial Expired'
    : isEmpty
    ? 'Tokens Empty'
    : `Trial · ${daysLeft}d left`;

  if (compact) {
    return (
      <button
        onClick={onUpgrade}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all hover:opacity-80 active:scale-95"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <svg width="16" height="16" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={radius} fill="none" stroke={`${color}30`} strokeWidth="4" />
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span className="text-[10px] font-bold" style={{ color }}>
          {tokensRemaining}/{tokensTotal}
        </span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl p-4"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
          <svg width="52" height="52" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r={radius} fill="none" stroke={`${color}25`} strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-[9px] font-black"
            style={{ color }}
          >
            {Math.round(pct * 100)}%
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color }}>
            {statusLabel}
          </p>
          <p className="text-[13px] font-bold mt-0.5" style={{ color: theme.textPrimary }}>
            {tokensRemaining} <span className="opacity-40 font-normal text-[11px]">/ {tokensTotal} tokens</span>
          </p>
          {!isTrialExpired && (
            <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: `${color}20` }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct * 100}%`, background: color }}
              />
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {(isEmpty || isTrialExpired || isLow) && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            style={{ background: color, color: '#fff' }}
          >
            {isEmpty || isTrialExpired ? 'Upgrade' : 'Top Up'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
