const KEY = 'mindgym.kidsv1.welcome-day';
let rememberedDay = '';

/** Calendar day on this device, not a rolling 24-hour window or UTC date. */
export function welcomeDay(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function needsDailyWelcome(day = welcomeDay()): boolean {
  if (rememberedDay === day) return false;
  try { return localStorage.getItem(KEY) !== day; } catch { return true; }
}

/** Remember on presentation, so skipping or navigating away does not repeat it. */
export function rememberDailyWelcome(day = welcomeDay()): void {
  rememberedDay = day;
  try { localStorage.setItem(KEY, day); } catch { /* Keep session-only fallback. */ }
}
