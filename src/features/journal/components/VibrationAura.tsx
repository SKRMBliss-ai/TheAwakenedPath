import { vibrationWord, type VibrationBalance } from '../loveFear';

/** Warm-gold (love) → cool-blue (fear), by balance. A soft aura, not a gauge. */
function auraColor(balance: number): string {
  // −1 → blue, 0 → violet, +1 → gold
  if (balance >= 0) {
    return `color-mix(in srgb, #E8B04B ${Math.round(balance * 100)}%, #B9A5B7)`;
  }
  return `color-mix(in srgb, #7EA6E0 ${Math.round(-balance * 100)}%, #B9A5B7)`;
}

/** The small aura orb — sits beside the user's name. */
export function AuraDot({ balance, size = 12 }: { balance: number; size?: number }) {
  const color = auraColor(balance);
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: size, height: size,
        background: `radial-gradient(circle at 40% 35%, ${color}, ${color} 60%, transparent)`,
        boxShadow: `0 0 ${size * 0.8}px ${color}`,
      }}
      aria-hidden
    />
  );
}

/** The fuller card — the spectrum meter (a gentle rise toward love, not a pyramid
 *  you sit at the bottom of) plus the encouraging word. */
export function VibrationCard({ balance }: { balance: VibrationBalance }) {
  const pct = Math.round(((balance.balance + 1) / 2) * 100); // 0..100, 50 = even
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <AuraDot balance={balance.balance} size={16} />
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
          Where you’ve been living
        </p>
      </div>

      {balance.total === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)]">
          Journal a few times and your love↔fear balance will gather here — a mirror to return you gently toward love.
        </p>
      ) : (
        <>
          <p className="text-[15px] font-serif text-[var(--text-primary)] mb-3">{vibrationWord(balance.balance)}</p>

          {/* The spectrum: fear (left) → love (right). A marker rises toward love. */}
          <div className="relative h-3 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #7EA6E0, #B9A5B7 50%, #E8B04B)' }}>
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow"
              style={{ left: `${pct}%`, background: auraColor(balance.balance) }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)]">
            <span>🌊 fear</span>
            <span>☀ love</span>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] mt-2">
            {balance.love} from love · {balance.fear} from fear · {balance.neutral} neutral, across your recent entries.
            Every entry is a chance to choose again.
          </p>
        </>
      )}
    </div>
  );
}
