import { Check, Crown, Lock, Play } from 'lucide-react';
import { sfx } from '../../lib/sfx';
import type { PracticeRoom } from './types';
import { usePractiseStore } from './store';
import { journeyState } from './journey';

/** Stops zig-zag a little so the path reads as a path, not a list. */
const OFFSETS = ['-26%', '0%', '26%'];

/**
 * The journey map: four worlds, each a short winding path of three stops and
 * a crown when the world is complete. Done stops can be replayed; the next
 * stop is highlighted; everything else is locked. It shows progress — the
 * daily work stays on Today.
 */
export function JourneyMap({ onStart }: { onStart: (r: PracticeRoom) => void }) {
  const reflections = usePractiseStore((s) => s.reflections);
  const worlds = journeyState(reflections);

  return (
    <div className="space-y-10 pb-4">
      {worlds.map(({ world, unlocked, complete, done }, wi) => {
        const nextIdx = unlocked ? done.findIndex((d) => !d) : -1;
        const count = done.filter(Boolean).length;
        return (
          <section key={world.id} aria-label={`World ${wi + 1}: ${world.title}`} style={{ opacity: unlocked ? 1 : 0.55 }}>
            <div className="rounded-3xl p-4 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${world.tint[0]}, ${world.tint[1]})` }}>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                World {wi + 1}{!unlocked && ' · locked'}
              </div>
              <div className="mt-0.5 text-lg font-bold">{world.title}</div>
              <div className="text-[13px] text-white/90">{world.sub}</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white" style={{ width: `${(count / Math.max(1, world.rooms.length)) * 100}%` }} />
                </div>
                <span className="text-[12px] font-semibold">{count}/{world.rooms.length}</span>
              </div>
            </div>

            <ol className="mt-4 flex flex-col items-center">
              {world.rooms.map((r, i) => {
                const isDone = done[i];
                const isNext = i === nextIdx;
                const open = unlocked && (isDone || isNext);
                return (
                  <li key={r.id} className="flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]})` }}>
                    {i > 0 && <span aria-hidden className="mb-1 h-6 border-l-2 border-dashed" style={{ borderColor: 'var(--p-line)' }} />}
                    <button
                      onClick={open ? () => { sfx.pop(); onStart(r); } : undefined}
                      disabled={!open}
                      aria-label={`${r.title}${isDone ? ', done, tap to practise again' : isNext ? ', next, tap to begin' : ', locked'}`}
                      className="grid h-16 w-16 place-items-center rounded-full transition active:scale-95 disabled:cursor-default"
                      style={
                        isDone
                          ? { background: 'var(--p-accent-fill, var(--p-accent))', color: '#fff' }
                          : isNext
                            ? { background: 'var(--p-surface)', color: 'var(--p-accent)', boxShadow: '0 0 0 3px var(--p-accent)' }
                            : { background: 'var(--p-line)', color: 'var(--p-muted)' }
                      }
                    >
                      {isDone ? <Check size={24} strokeWidth={3} aria-hidden /> : isNext ? <Play size={22} aria-hidden /> : <Lock size={20} aria-hidden />}
                    </button>
                    {isNext && (
                      <span className="mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
                        Next
                      </span>
                    )}
                    <span className="mt-1 max-w-[9rem] text-center text-[12px] font-semibold leading-tight" style={{ color: 'var(--p-ink)' }}>
                      {r.title}
                    </span>
                  </li>
                );
              })}
              <li className="mt-1 flex flex-col items-center">
                <span aria-hidden className="mb-1 h-6 border-l-2 border-dashed" style={{ borderColor: 'var(--p-line)' }} />
                <span
                  className="grid h-14 w-14 place-items-center rounded-full"
                  style={complete ? { background: world.tint[1], color: '#fff' } : { background: 'var(--p-line)', color: 'var(--p-muted)' }}
                  aria-label={complete ? `${world.title} complete` : `${world.title} not complete yet`}
                  role="img"
                >
                  <Crown size={22} aria-hidden />
                </span>
                <span className="mt-1 text-[12px] font-semibold" style={{ color: complete ? 'var(--p-ink)' : 'var(--p-muted)' }}>
                  {complete ? 'World complete' : 'World milestone'}
                </span>
              </li>
            </ol>
          </section>
        );
      })}
    </div>
  );
}
