import { useEffect, useRef, useState } from 'react';
import {
  presenceService, areaForTab, PRESENCE_HEARTBEAT_MS,
  type PresenceMember, type PresenceArea,
} from './presenceService';

/**
 * Keeps this member's presence heartbeat alive for as long as the app is open
 * and the tab is visible.
 *
 * Pauses on a hidden tab so a forgotten background tab doesn't inflate the
 * "practising now" count all day — presence should mean someone is actually
 * there. Beats immediately on becoming visible again so returning is instant.
 */
export function usePresenceHeartbeat(
  uid: string | null | undefined,
  displayName: string | null | undefined,
  avatarUrl: string | null | undefined,
  activeTab: string,
) {
  // Held in a ref so changing tabs doesn't tear down and rebuild the interval.
  const areaRef = useRef<PresenceArea>(areaForTab(activeTab));
  areaRef.current = areaForTab(activeTab);

  const nameRef = useRef<string>('');
  nameRef.current = displayName || 'A quiet presence';

  const avatarRef = useRef<string | null | undefined>(avatarUrl);
  avatarRef.current = avatarUrl;

  useEffect(() => {
    if (!uid) return;

    let cancelled = false;
    const beat = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      presenceService.beat(uid, nameRef.current, avatarRef.current, areaRef.current);
    };

    beat();
    const id = setInterval(beat, PRESENCE_HEARTBEAT_MS);
    document.addEventListener('visibilitychange', beat);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', beat);
    };
  }, [uid]);
}

/**
 * Live roster of everyone currently present.
 *
 * Only subscribes once there is a signed-in user: the presence rules require
 * auth, so subscribing while signed out can only ever fail — it produced a
 * guaranteed permission-denied on the login screen.
 */
export function usePresentMembers(uid?: string | null) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) {
      setMembers([]);
      setLoaded(false);
      return;
    }
    const unsub = presenceService.subscribe((m) => {
      setMembers(m);
      setLoaded(true);
    });
    return unsub;
  }, [uid]);

  return { members, loaded };
}
