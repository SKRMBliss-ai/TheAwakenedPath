import { getPracticeDay } from '../../practice/practiceContent';

/**
 * Today's Practice, as read in the room.
 *
 * This is the guide's script: the invocation to speak aloud, the virtue the
 * week is sitting with, its prayer for today, and the places to carry it. It
 * takes no props beyond styling because every word is derived from the date —
 * whoever is leading and whoever is listening are looking at the same page,
 * and the same page Friday's letter names.
 *
 * Read-only by design. Logging the day belongs in the Practice tab, not in the
 * middle of a live sit.
 */
export default function TodaysPracticePanel({ compact = false }: { compact?: boolean }) {
  const day = getPracticeDay();

  return (
    <div className="text-left">
      <p className="text-amber-400 text-[10px] uppercase tracking-[0.16em] font-bold mb-1">
        Today's Practice
      </p>
      <p className="text-white/40 text-[11px] mb-4">
        Week {day.virtue.week} of 9 · Day {day.dayInWeek + 1} of 7 · {day.virtue.name}
      </p>

      {/* The invocation — spoken aloud to open */}
      <p className="text-white/35 text-[10px] uppercase tracking-[0.13em] font-bold mb-2">
        The Three Sacred Attitudes · spoken aloud
      </p>
      <div className="space-y-2.5 text-white/85 text-[13px] leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
        {([
          ['Love', day.invocation.love, 'text-amber-400'],
          ['Focus', day.invocation.focus, 'text-rose-300'],
          ['Surrender', day.invocation.surrender, 'text-teal-300'],
        ] as const).map(([label, text, colour]) => (
          <p key={label}>
            <span className={`${colour} not-italic font-bold text-[9px] uppercase tracking-[0.13em] mr-2`}>{label}</span>
            {text}
          </p>
        ))}
        <p className="pt-2.5 border-t border-white/10">{day.invocation.close}</p>
      </div>

      {/* This week's virtue */}
      <div className="mt-5 rounded-xl border border-rose-300/25 bg-rose-400/5 p-3.5">
        <p className="text-rose-300 text-[10px] uppercase tracking-[0.13em] font-bold mb-1.5">
          This week · {day.virtue.name}
        </p>
        <p className="text-white/85 text-[13px] leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
          {day.prayer}
        </p>
      </div>

      {!compact && (
        <>
          <p className="text-white/35 text-[10px] uppercase tracking-[0.13em] font-bold mt-5 mb-2">
            Where to carry it today
          </p>
          <div className="space-y-2">
            {day.ideas.map(idea => (
              <div key={idea.place} className="flex gap-2.5 items-start rounded-lg bg-black/25 border border-white/8 p-2.5">
                <span className="text-base leading-none shrink-0">{idea.icon}</span>
                <p className="text-white/70 text-[12px] leading-relaxed">
                  <strong className="text-white/90">{idea.place}</strong> — {idea.how}
                </p>
              </div>
            ))}
          </div>

          <p className="text-white/35 text-[10px] uppercase tracking-[0.13em] font-bold mt-5 mb-2">
            Today's teaching
          </p>
          <p className="text-white/70 text-[12.5px] leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
            {day.highlight}
          </p>
        </>
      )}
    </div>
  );
}
