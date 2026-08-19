interface MorningGlanceProps {
  name: string;
  /** One line — today's actual practice invitation. */
  invitation: string;
  onBegin: () => void;
  onOpenFullDay: () => void;
}

/**
 * The whole app, before the day has begun.
 *
 * Shown only in the morning and only before anything has been logged. The
 * reasoning: opening a practice app to a wall of cards is itself a small
 * demand, and the moment before a sit is exactly when the fewest decisions
 * should be asked for. One line, one button.
 *
 * The escape hatch is always visible — never trap someone in a simplified view.
 */
export function MorningGlance({ name, invitation, onBegin, onOpenFullDay }: MorningGlanceProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : 'Hello';

  return (
    <div className="text-center py-12 px-5">
      <div className="text-[30px] font-serif text-[var(--text-primary)] mb-1.5">
        {greeting}{name ? `, ${name}` : ''}
      </div>
      <div className="text-[13px] text-[var(--text-muted)] mb-8">
        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>

      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-2.5">
        Today
      </div>
      <p className="font-serif italic text-[18px] text-[var(--text-primary)] leading-relaxed max-w-[36ch] mx-auto mb-8">
        {invitation}
      </p>

      <button
        onClick={onBegin}
        className="px-9 py-4 rounded-full bg-[var(--accent-solid)] text-[var(--on-accent)] font-semibold text-[15px] min-h-[52px] transition-transform hover:-translate-y-0.5"
      >
        Begin
      </button>
      <button
        onClick={onOpenFullDay}
        className="block mx-auto mt-4 text-[12.5px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] py-2"
      >
        See the whole day
      </button>
    </div>
  );
}
