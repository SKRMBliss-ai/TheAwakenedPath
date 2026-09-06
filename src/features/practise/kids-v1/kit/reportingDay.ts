/**
 * WHICH DAY THE CHILD IS ACTUALLY ABLE TO ANSWER FOR.
 *
 * "Did you use kind words today?" asked at ten past seven in the morning is a
 * question about a day that has not happened. A child answering it is either
 * guessing at their own future or, far more likely, learning that the tick is
 * a thing you press rather than a thing that means something — which quietly
 * dismantles the one mechanic the whole app rests on.
 *
 * The room asks it anyway, every hour of the day, because the app has only
 * ever had one notion of "now". So this is the fix: before the afternoon, if
 * YESTERDAY has nothing recorded against it, that is the day the rooms ask
 * about and the day the ticks land on. A child at breakfast can tell you
 * exactly how yesterday went. That is a real question with a real answer.
 *
 * IT ONLY OFFERS A DAY THAT IS STILL OPEN. If they already did yesterday —
 * played last night, as most evenings — there is nothing to catch up on, and
 * the app goes back to asking about today. A child who sat down last night and
 * answered honestly must never be asked the same seven questions again over
 * breakfast; that reads as the app not having listened, which is the exact
 * charge this whole feature exists to avoid.
 *
 * IT IS NEVER SILENT ABOUT WHICH DAY IT MEANS. Callers get `isYesterday` and
 * are expected to say so on screen. A tick that lands on a different day from
 * the one the child thought they were answering is worse than the original
 * bug, because now the app is wrong AND confident. See VirtueRoomView, which
 * labels the question rather than rewording it — the seven prompts don't all
 * carry the word "today" in a position that could be swapped.
 */

/** Before this hour, yesterday is still the day worth asking about. */
const MORNING_UNTIL = 14;

export interface ReportingDay {
  /** ISO day the ticks belong to. */
  key: string;
  /** True when the app is catching up on yesterday rather than asking about today. */
  isYesterday: boolean;
  /**
   * Whether the day being reported on was a Saturday or Sunday.
   *
   * Not a detail — several of the seven questions quietly assume a
   * classroom, and a child at home all weekend has no honest answer to
   * "did you make a new friend?". See VIRTUE_ROOMS' weekendPrompt.
   *
   * It follows the REPORTED day, not the day the child is holding the
   * phone: catching up on Sunday over Monday breakfast has to ask Sunday's
   * version of the question, or the fix trades one wrong day for another.
   */
  isWeekend: boolean;
}

function weekend(d: Date): boolean {
  const n = d.getDay();
  return n === 0 || n === 6;
}

function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * `now` is injectable so the rule can be checked at any hour without waiting
 * for one — there is no other way to test a function whose entire job is
 * knowing what time it is.
 */
export function reportingDay(
  completions: Record<string, Record<string, boolean>>,
  now: Date = new Date(),
): ReportingDay {
  const todayKey = isoDay(now);
  if (now.getHours() >= MORNING_UNTIL) {
    return { key: todayKey, isYesterday: false, isWeekend: weekend(now) };
  }

  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterdayKey = isoDay(y);

  const yesterdayDone = Object.values(completions[yesterdayKey] ?? {}).some(Boolean);
  return yesterdayDone
    ? { key: todayKey, isYesterday: false, isWeekend: weekend(now) }
    : { key: yesterdayKey, isYesterday: true, isWeekend: weekend(y) };
}
