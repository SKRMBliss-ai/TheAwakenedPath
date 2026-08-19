import {
  collection, doc, onSnapshot, query, serverTimestamp, setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * App-wide presence — "who is here right now".
 *
 * Deliberately a SEPARATE collection from `users`. The users collection is
 * owner/admin-read only because it holds emails and entitlements; a member
 * directory that every signed-in user can read must never expose those. A
 * presence doc therefore carries display information ONLY — no email, no
 * membership state. See firestore.rules.
 *
 * Presence is heartbeat-based for the same reason the meditation room is:
 * browsers do not reliably fire an event when a tab closes, the network drops
 * or a phone sleeps, so an explicit "offline" write can never be trusted.
 * A member is present only while their heartbeat stays fresh.
 */

export const PRESENCE_HEARTBEAT_MS = 30 * 1000;
/** 3 missed heartbeats → treated as gone. */
export const PRESENCE_STALE_MS = 100 * 1000;

/** Coarse activity label. Deliberately not the exact lesson/journal entry —
 *  members see that someone is practising, never what they are working on. */
export type PresenceArea = 'practice' | 'school' | 'community' | 'online';

export interface PresenceMember {
  uid: string;
  displayName: string;
  avatarUrl?: string | null;
  area: PresenceArea;
  /** Firestore Timestamp — written with serverTimestamp() so every device
   *  shares one clock and a wrong phone clock can't distort the room. */
  lastSeen?: unknown;
}

/** Map an app tab id to a coarse presence area. */
export function areaForTab(tab: string): PresenceArea {
  if (['today', 'virtues', 'chapters', 'situations', 'breathe', 'music'].includes(tab)) return 'practice';
  if (['intelligence', 'wisdom_untethered', 'emotion-course', 'videos'].includes(tab)) return 'school';
  if (['meditation', 'members', 'calendar', 'circle'].includes(tab)) return 'community';
  return 'online';
}

export const AREA_LABEL: Record<PresenceArea, string> = {
  practice: 'Practising',
  school: 'In a course',
  community: 'In the community',
  online: 'Online',
};

/** Convert a Firestore Timestamp to epoch ms. Null for a pending
 *  serverTimestamp (write not yet acknowledged) or an unexpected value. */
function tsToMillis(v: unknown): number | null {
  if (v && typeof v === 'object' && typeof (v as any).toMillis === 'function') {
    return (v as any).toMillis();
  }
  // Legacy docs may hold a client-written epoch number.
  return typeof v === 'number' ? v : null;
}

export const presenceService = {
  /** Write/refresh this member's presence. Safe to call on an interval. */
  async beat(
    uid: string,
    displayName: string,
    avatarUrl: string | null | undefined,
    area: PresenceArea,
  ): Promise<void> {
    try {
      await setDoc(
        doc(db, 'presence', uid),
        { uid, displayName, avatarUrl: avatarUrl ?? null, area, lastSeen: serverTimestamp() },
        { merge: true },
      );
    } catch {
      // Presence is ambient, never load-bearing — a failed beat must not
      // surface an error to someone who is just meditating.
    }
  },

  /**
   * Live list of members currently present.
   *
   * "Now" is the freshest SERVER heartbeat in the collection rather than the
   * reader's local clock, so a device with a skewed clock cannot filter
   * everyone else out (or keep ghosts around forever).
   */
  subscribe(cb: (members: PresenceMember[]) => void): Unsubscribe {
    const q = query(collection(db, 'presence'));
    return onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => d.data() as PresenceMember);
        const times = docs
          .map((m) => tsToMillis(m.lastSeen))
          .filter((t): t is number => t !== null);
        const now = times.length ? Math.max(...times) : null;

        const fresh = docs.filter((m) => {
          if (m.lastSeen == null) return true; // our own in-flight write
          if (now === null) return true;       // no server time yet — show everyone
          const t = tsToMillis(m.lastSeen);
          if (t === null) return true;
          return now - t < PRESENCE_STALE_MS;
        });

        fresh.sort((a, b) =>
          (a.displayName || '').localeCompare(b.displayName || ''),
        );
        cb(fresh);
      },
      () => cb([]), // offline / rules denial — show an empty room, not a crash
    );
  },
};
