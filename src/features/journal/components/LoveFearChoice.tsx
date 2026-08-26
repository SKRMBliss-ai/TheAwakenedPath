import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deriveLoveFear, loveReframe, POLARITY_META, type Polarity } from '../loveFear';

/**
 * The Love / Fear moment — the heart of the practice. After naming the feeling,
 * the person sees its root, and is reminded they can always choose again. Fear is
 * never shamed; it is simply the other door. Seeded from the named emotions, but
 * the person decides — because making the choice conscious is the whole point.
 */
export function LoveFearChoice({
  emotions,
  value,
  onChange,
}: {
  emotions: string[];
  value: Polarity | null;
  onChange: (p: Polarity) => void;
}) {
  const suggested = useMemo(() => deriveLoveFear(emotions), [emotions]);
  const chosen = value ?? (emotions.length ? suggested : null);

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">
        Underneath it — love or fear?
      </p>
      <p className="text-[12px] text-[var(--text-muted)] mb-3">
        Every feeling has one of two roots. Neither is wrong — but you always get to choose which one you feed.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(['fear', 'love'] as const).map((p) => {
          const meta = POLARITY_META[p];
          const active = chosen === p;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="rounded-xl border p-3 text-center transition-all active:scale-[0.98]"
              style={{
                borderColor: active ? meta.color : 'var(--border-subtle)',
                background: active ? meta.color + '22' : 'transparent',
              }}
            >
              <div className="text-[15px] font-serif" style={{ color: active ? meta.color : 'var(--text-primary)' }}>
                {p === 'love' ? '☀ ' : '🌊 '}{meta.label}
              </div>
              <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">{meta.note}</div>
            </button>
          );
        })}
      </div>

      {emotions.length > 0 && !value && (
        <p className="text-[11px] text-[var(--text-muted)] mt-2 text-center">
          From what you named, this looks like <b style={{ color: POLARITY_META[suggested].color }}>{POLARITY_META[suggested].label.toLowerCase()}</b> — tap to confirm or choose the other.
        </p>
      )}

      <AnimatePresence mode="wait">
        {chosen && (
          <motion.div
            key={chosen}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-xl p-3"
            style={{ background: POLARITY_META[chosen].color + '14', border: `1px solid ${POLARITY_META[chosen].color}33` }}
          >
            <p className="text-[13px] leading-relaxed font-serif italic text-[var(--text-secondary)]">
              {loveReframe(chosen)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
