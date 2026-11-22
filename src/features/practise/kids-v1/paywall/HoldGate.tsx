import { useEffect, useRef, useState } from 'react';

/**
 * The grown-up gate: a button that only fires after a ~1.4s press-and-hold.
 * Same mechanism as the old check-in's "Grown-ups" gate (kids/checkin/
 * CheckInFlow.tsx). It is a speed bump for a small child, not security;
 * nothing behind it can be bought without a signed-in adult account.
 *
 * Keyboard: holding Space or Enter works the same way.
 */
const HOLD_MS = 1400;
const TICK_MS = 30;

export function HoldGate({ label, hint = 'Press and hold', onOpen, className = '' }: {
  label: string;
  hint?: string;
  onOpen: () => void;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setProgress(0);
  };
  const start = () => {
    if (timer.current) return;
    let ticks = 0;
    timer.current = setInterval(() => {
      ticks += 1;
      const p = Math.min((ticks * TICK_MS) / HOLD_MS, 1);
      setProgress(p);
      if (p >= 1) { stop(); onOpen(); }
    }, TICK_MS);
  };
  useEffect(() => stop, []);

  const isHoldKey = (k: string) => k === ' ' || k === 'Enter';

  return (
    <button
      type="button"
      className={`kp-hold ${className}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (isHoldKey(e.key) && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={(e) => { if (isHoldKey(e.key)) stop(); }}
      onBlur={stop}
      aria-label={`${label}. ${hint} for two seconds.`}
    >
      <span className="kp-hold-fill" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <span className="kp-hold-text"><b>{label}</b><small>{hint}</small></span>
    </button>
  );
}
