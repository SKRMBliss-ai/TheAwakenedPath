import { useCallback, useEffect, useRef, useState } from 'react';
import { ringBell, primeAudio } from './bell';

/**
 * The sit timer.
 *
 * Counts against a wall-clock end time rather than accumulating ticks, because
 * a phone throttles or suspends timers when the screen sleeps — an interval
 * counter would drift badly across a 20-minute sit, which is exactly when
 * accuracy matters. The interval only re-reads the clock.
 */
export function useSitTimer(onFinish: (minutes: number) => void) {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const endsAt = useRef(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const clear = useCallback(() => {
    if (iv.current) clearInterval(iv.current);
    iv.current = null;
  }, []);

  const stop = useCallback(() => {
    clear();
    setRunning(false);
  }, [clear]);

  const start = useCallback((minutes: number) => {
    primeAudio(); // must happen inside the tap that starts the sit
    clear();
    const secs = minutes * 60;
    setTotal(secs);
    setRemaining(secs);
    endsAt.current = Date.now() + secs * 1000;
    setRunning(true);
    ringBell('start');

    iv.current = setInterval(() => {
      const left = (endsAt.current - Date.now()) / 1000;
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clear();
        setRunning(false);
        ringBell('end');
        finishRef.current(minutes);
      }
    }, 250);
  }, [clear]);

  /** Ends early and reports the minutes actually sat, rounded down. */
  const endEarly = useCallback(() => {
    const done = Math.max(0, Math.floor((total - remaining) / 60));
    stop();
    return done;
  }, [total, remaining, stop]);

  useEffect(() => () => clear(), [clear]);

  return { running, remaining, total, start, stop, endEarly };
}
