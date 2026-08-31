import { ArrowLeft } from 'lucide-react';
import { GymScreen } from './ui/GymScreen';
import { GymCard } from './ui/GymCard';
import { GymButton } from './ui/GymButton';
import type { GymSurface } from './theme/gymTokens';

/**
 * Honest placeholder for /mindgymforkids and /mindgymforadults.
 *
 * These two URLs have to resolve from the moment /mindgymforall ships — the
 * entry screen's only two actions point at them, and a 404 behind a primary CTA
 * is worse than an unfinished room. They are painted in each gym's real tokens,
 * so this doubles as the first check that the Kids and Adult palettes hold up on
 * a device. Both are replaced wholesale by the real shells in the next slices.
 */
export default function GymPlaceholder({
  surface,
  title,
  lines,
  onBack,
}: {
  surface: Exclude<GymSurface, 'all'>;
  title: string;
  lines: string[];
  onBack: () => void;
}) {
  return (
    <GymScreen surface={surface} width="canvas">
      <div className="flex min-h-[100svh] flex-col justify-center py-12">
        <button
          onClick={onBack}
          className="mb-8 inline-flex w-fit items-center gap-2 text-[14px] font-medium"
          style={{ color: 'var(--gym-ink-muted)', minHeight: 44 }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </button>

        <h1
          style={{
            fontFamily: 'var(--gym-font-display)',
            fontSize: 'clamp(2rem, 8vw, 2.75rem)',
            lineHeight: 1.1,
            color: 'var(--gym-ink)',
          }}
        >
          {title}
        </h1>

        <GymCard tone="accent" radius="panel" className="mt-6">
          <div className="space-y-2 text-[15px] sm:text-[16px]" style={{ color: 'var(--gym-ink-soft)', lineHeight: 1.6 }}>
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </GymCard>

        <GymButton variant="outline" onClick={onBack} className="mt-6">
          Back to the entrance
        </GymButton>
      </div>
    </GymScreen>
  );
}
