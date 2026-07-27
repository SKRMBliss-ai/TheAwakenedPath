import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight crash reporting → Firestore `error_logs`.
//
// The app previously had NO error monitoring — a prod crash (e.g. the stale-PWA
// chunk load) was only ever noticed when someone hit it in person. This records
// runtime errors so they surface in the admin Engagement Report instead of
// vanishing into the user's console. The reporter must never throw and must
// never block anything, so every path is wrapped and fire-and-forget.
// ─────────────────────────────────────────────────────────────────────────────

// Collapse error storms: skip an identical error seen again within 10s.
let lastKey = '';
let lastAt = 0;

export function reportError(err: unknown, opts: { feature?: string; kind?: string } = {}): void {
  try {
    const e = err as any;
    const message = String(e?.message ?? e ?? 'Unknown error').slice(0, 1000);
    const kind = String(opts.kind ?? 'error').slice(0, 40);

    const key = message + '|' + kind;
    const now = Date.now();
    if (key === lastKey && now - lastAt < 10_000) return;
    lastKey = key;
    lastAt = now;

    const u = auth.currentUser;
    // Fire-and-forget; a failed write (e.g. no auth / offline) is swallowed.
    void addDoc(collection(db, 'error_logs'), {
      message,
      stack: String(e?.stack ?? '').slice(0, 4000),
      feature: String(opts.feature ?? '').slice(0, 120),
      kind,
      url: (typeof location !== 'undefined' ? location.href : '').slice(0, 500),
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : '').slice(0, 500),
      uid: u?.uid ?? null,
      email: u?.email ?? null,
      timestamp: serverTimestamp(),
    }).catch(() => { /* never surface reporter failures */ });
  } catch (_) {
    /* the reporter itself must never throw */
  }
}

// Global handlers for errors that never reach a React ErrorBoundary
// (async throws, event handlers, unhandled promise rejections).
export function installGlobalErrorReporting(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (ev) => {
    const m = String(ev?.message || '');
    // Benign, extremely common browser noise — not worth logging.
    if (m.includes('ResizeObserver loop')) return;
    reportError(ev.error ?? ev.message, { kind: 'window.onerror' });
  });

  window.addEventListener('unhandledrejection', (ev) => {
    reportError(ev.reason, { kind: 'unhandledrejection' });
  });
}
