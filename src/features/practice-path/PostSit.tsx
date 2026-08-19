import { motion } from 'framer-motion';

interface PostSitProps {
  open: boolean;
  minutes: number;
  onChoose: (settled: number) => void;
  onSkip: () => void;
}

const CHOICES = [
  { glyph: '🕊', label: 'Settled', settled: 5 },
  { glyph: '🌊', label: 'Somewhere between', settled: 3 },
  { glyph: '🌬', label: 'Restless', settled: 1 },
];

/**
 * One screen between the bell and the form.
 *
 * Three large targets rather than a 1–5 scale: immediately after a sit is the
 * worst moment to ask someone to calibrate a number. The choice pre-fills the
 * rating, which they can still adjust in the log if they want to.
 */
export function PostSit({ open, minutes, onChoose, onSkip }: PostSitProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center"
      style={{ background: 'radial-gradient(760px 600px at 50% 45%, #1b2245, #0c0f20 74%)' }}
      role="dialog"
      aria-modal="true"
      aria-label="How was that?"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 0.9, 0.3, 1] }}
        className="text-center px-6 max-w-[430px] w-full"
      >
        <div className="text-[32px] font-serif text-[var(--practice-accent)] mb-1.5">
          {minutes} {minutes === 1 ? 'minute' : 'minutes'}
        </div>
        <div className="text-[19px] font-serif italic text-[#ecebf4] mb-7">How was that?</div>

        <div className="flex flex-col gap-2.5">
          {CHOICES.map((c) => (
            <button
              key={c.label}
              onClick={() => onChoose(c.settled)}
              className="flex items-center gap-3.5 rounded-2xl border border-white/14 bg-white/[0.035] px-5 py-4 text-left text-[15px] text-[#ecebf4] min-h-[56px] transition-colors hover:border-[var(--practice-accent)]/50 hover:bg-[var(--practice-accent)]/10"
            >
              <span className="text-[21px]">{c.glyph}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onSkip}
          className="mt-5 text-[12.5px] text-white/40 hover:text-white/80 py-2"
        >
          Skip
        </button>
      </motion.div>
    </div>
  );
}
