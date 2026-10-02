import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../firebase';
import {
  cleanItems, removeLiveItem, setLiveItems, upsertLiveItem, useLiveContent, type LiveKind,
} from './liveContent';

/* The network half of kit/liveContent: functions/index.js `kidsContent`. */

function call<T>(data: Record<string, unknown>, timeout = 20000): Promise<T> {
  return httpsCallable<Record<string, unknown>, T>(functions, 'kidsContent', { timeout })(data).then((r) => r.data);
}

let loading: Promise<void> | null = null;

/** Fetch the shared content. A child who is offline keeps this device's last copy, or the built-in content. */
export function loadLiveContent(fresh = false): Promise<void> {
  if (loading && !fresh) return loading;
  const run = call<{ items: unknown }>({ action: 'get', fresh }, fresh ? 20000 : 12000)
    .then(({ items }) => setLiveItems(cleanItems(items)))
    .catch((err: unknown) => {
      if (useLiveContent.getState().status === 'empty') useLiveContent.setState({ status: 'offline' });
      if (fresh) throw err;
    })
    .finally(() => { if (loading === run) loading = null; });
  loading = run;
  return run;
}

export interface WhoAmI { admin: boolean; email: string | null; verified: boolean }
export const whoAmI = () => call<WhoAmI>({ action: 'whoami' });

export async function saveLive(kind: LiveKind, id: string, data: Record<string, unknown>): Promise<void> {
  const r = await call<{ updatedBy: string; updatedAt: number }>({ action: 'save', kind, id, data });
  upsertLiveItem({ kind, id, data, updatedAt: r.updatedAt ?? Date.now(), updatedBy: r.updatedBy ?? null });
}

export async function deleteLive(kind: LiveKind, id: string): Promise<void> {
  await call({ action: 'delete', kind, id });
  removeLiveItem(kind, id);
}

export interface Suggestion { text: string; why: string }
export const suggestWording = (text: string, where: string, guide: string, again = false) =>
  call<{ suggestions: Suggestion[]; cached: boolean }>({ action: 'suggest', text, where, guide, again }, 45000);

/** What went wrong, in words for the person at the keyboard. */
export function problemText(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  const code = e?.code ?? '';
  if (code.endsWith('permission-denied')) return 'This account can’t change the shared content. Sign in with an admin account.';
  if (code.endsWith('unauthenticated')) return 'Sign in first.';
  if (code.endsWith('resource-exhausted') || code.endsWith('unavailable') || code.endsWith('invalid-argument')) {
    return e?.message || 'That didn’t work. Try again in a minute.';
  }
  if (code.endsWith('not-found') || code.endsWith('internal')) {
    return 'The content service isn’t reachable yet. It goes live with the next deploy; try again after that.';
  }
  return 'That didn’t work. Check the connection and try again.';
}
