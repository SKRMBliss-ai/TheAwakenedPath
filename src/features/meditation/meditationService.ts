import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, orderBy, limit, onSnapshot,
  updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../../firebase';
import type {
  MeditationParticipant, MeditationMessage,
  MeditationJournalEntry, MeditationStreak,
  MeditationBadge, MeditationAttendance
} from './types';

type MeditationBadgeType = MeditationBadge['type'];

const pad = (n: number) => String(n).padStart(2, '0');

// ── Permanent session ID ────────────────────────────────────────────────────
// All participants join the same live meditation room, forever.
// Historical tracking happens via meditation_attendance with date-based IDs.
export const LIVE_MEDITATION_SESSION_ID = 'live_meditation';

// ── Liveness / heartbeat ──────────────────────────────────────────────────────
// Because the room is permanent, presence cannot rely on a clean "leave" (tabs
// get closed, sessions crash, users log out abruptly). Instead each participant
// writes a `lastSeen` heartbeat; a card is only shown if the heartbeat is fresh.
export const HEARTBEAT_INTERVAL_MS = 15 * 1000;
export const PRESENCE_STALE_MS = 60 * 1000; // 4 missed heartbeats → considered gone

// Convert a Firestore Timestamp (server time) to epoch ms. Returns null for a
// pending/unresolved serverTimestamp or a non-Timestamp value.
function tsToMillis(v: any): number | null {
  return v && typeof v.toMillis === 'function' ? v.toMillis() : null;
}
// A shared media item older than this is ignored (kills "yesterday's video"
// auto-playing for whoever joins the permanent room next).
export const MEDIA_SHARE_MAX_AGE_MS = 3 * 60 * 60 * 1000;

// DEV mode : 5-min slots (4 min live · 1 min gap) — easy to test immediately
// PROD mode : single daily session at 9:00 AM IST (UTC+5:30 = UTC 03:30), 1 hour (9:00–10:00)
const IS_DEV = import.meta.env.DEV;

// Test users who always see live session
const TEST_EMAILS = ['simkatyal1@gmail.com'];

export function getSessionSchedule(userEmail?: string): {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  status: 'live' | 'waiting';
  remainingMs: number;
  untilStartMs: number;
} {
  const now = new Date();
  const isTestUser = userEmail && TEST_EMAILS.includes(userEmail);

  // ── DEV: rolling 5-minute slots ────────────────────────────────────────────
  if (IS_DEV) {
    const SLOT = 5 * 60, LIVE = 4 * 60;
    const total = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
    const pos = total % SLOT;
    const slotStartSecs = total - pos;
    let isLive = pos < LIVE;

    // Test users always see live session
    if (isTestUser) {
      isLive = true;
    }

    const start = new Date(now); start.setHours(0,0,0,0);
    start.setTime(start.getTime() + slotStartSecs * 1000);
    const end   = isTestUser ? new Date(now.getTime() + 60 * 60 * 1000) : new Date(start.getTime() + LIVE * 1000); // Test users get 1 hour window
    const next  = new Date(start.getTime() + SLOT * 1000);
    const sessionId = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}-${pad(start.getHours())}-${pad(start.getMinutes())}`;
    return {
      sessionId, startTime: start, endTime: end,
      status: isLive ? 'live' : 'waiting',
      remainingMs: isLive ? Math.max(0, end.getTime() - now.getTime()) : 0,
      untilStartMs: isLive ? 0 : Math.max(0, next.getTime() - now.getTime()),
    };
  }

  // ── PROD: fixed 9:00–10:00 AM IST daily session ──────────────────────────
  // IST = UTC+5:30 → 9:00 AM IST = 03:30 AM UTC
  const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
  const SESSION_HOUR_IST = 9, SESSION_MIN_IST = 0;
  const LIVE_MS = 60 * 60 * 1000; // 9:00 → 10:00 AM IST

  // Today's 9 AM IST expressed as a UTC Date
  const todayUtcMidnight = new Date(now); todayUtcMidnight.setUTCHours(0,0,0,0);
  const sessionUtcMs = todayUtcMidnight.getTime()
    + (SESSION_HOUR_IST * 60 + SESSION_MIN_IST) * 60 * 1000
    - IST_OFFSET_MS;

  let start = new Date(sessionUtcMs);
  let end   = new Date(sessionUtcMs + LIVE_MS);
  const nowMs = now.getTime();

  let status: 'live' | 'waiting';
  let remainingMs = 0, untilStartMs = 0;

  // Test users always see live session
  if (isTestUser) {
    status = 'live';
    start = new Date(now.getTime() - 5 * 60 * 1000); // Started 5 min ago
    end = new Date(now.getTime() + 55 * 60 * 1000);  // Ends in 55 min
    remainingMs = end.getTime() - nowMs;
  } else if (nowMs < start.getTime()) {
    status = 'waiting'; untilStartMs = start.getTime() - nowMs;
  } else if (nowMs < end.getTime()) {
    status = 'live'; remainingMs = end.getTime() - nowMs;
  } else {
    // After today's session → tomorrow 9 AM IST
    start = new Date(start.getTime() + 24*60*60*1000);
    status = 'waiting'; untilStartMs = start.getTime() - nowMs;
  }

  const sessionId = `${start.getUTCFullYear()}-${pad(start.getUTCMonth()+1)}-${pad(start.getUTCDate())}-${pad(start.getUTCHours())}-${pad(start.getUTCMinutes())}`;

  return {
    sessionId, startTime: start, endTime: end,
    status, remainingMs, untilStartMs,
  };
}

/**
 * Returns a stable session ID for "today's" meditation session, regardless of
 * whether the live window has passed. This is used by admin-override joins so
 * that two admins joining at different points in the day still end up in the
 * SAME session (rather than today's vs. tomorrow's, which is what
 * getSessionSchedule does once today's live window ends).
 *
 * Always uses today's UTC date + 9:00 AM IST (= 03:30 UTC).
 */
export function getTodayMeditationSessionId(): string {
  const now = new Date();
  const todayUtcMidnight = new Date(now);
  todayUtcMidnight.setUTCHours(0, 0, 0, 0);
  // 9:00 AM IST = 03:30 UTC (IST is UTC+5:30)
  const start = new Date(todayUtcMidnight.getTime() + (3 * 60 + 30) * 60 * 1000);
  return `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}-${pad(start.getUTCHours())}-${pad(start.getUTCMinutes())}`;
}

export const meditationService = {

  async joinSession(_sessionId: string, uid: string, displayName: string, avatarUrl: string): Promise<void> {
    const { startTime, endTime } = getSessionSchedule();
    // Always use the permanent live_meditation session for WebRTC & presence
    // Parameter _sessionId is kept for backward compatibility but not used
    const permanentSessionId = LIVE_MEDITATION_SESSION_ID;

    await setDoc(doc(db, 'meditation_sessions', permanentSessionId), {
      id: permanentSessionId, startTime: startTime.getTime(), endTime: endTime.getTime(), status: 'live',
      lastUpdated: Date.now(),
    }, { merge: true });
    await setDoc(doc(db, 'meditation_sessions', permanentSessionId, 'participants', uid),
      { uid, displayName, avatarUrl, joinedAt: Date.now(), videoEnabled: false, isPresent: true, lastSeen: serverTimestamp() });

    // Track attendance historically with date-based ID for analytics
    const attendanceId = `${uid}_${new Date().toISOString().slice(0, 10)}`;
    await setDoc(doc(db, 'meditation_attendance', attendanceId),
      { uid, sessionId: permanentSessionId, joinedAt: Date.now(), date: new Date().toISOString().slice(0, 10) }, { merge: true });
  },

  // Keep the participant's presence heartbeat fresh while they're in the room.
  // Uses serverTimestamp() so every device writes on the SAME clock — presence
  // must never depend on a phone's possibly-wrong local clock.
  async heartbeat(sessionId: string, uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'meditation_sessions', sessionId, 'participants', uid),
        { lastSeen: serverTimestamp(), isPresent: true });
    } catch { /* participant doc may not exist yet — non-critical */ }
  },

  async toggleRoomChat(sessionId: string, chatEnabled: boolean): Promise<void> {
    await setDoc(doc(db, 'meditation_sessions', sessionId), { chatEnabled }, { merge: true });
  },

  async updateMediaShare(sessionId: string, type: 'youtube' | 'audio' | 'none', url?: string, sharedBy?: string): Promise<void> {
    await setDoc(doc(db, 'meditation_sessions', sessionId), {
      mediaShare: { type, url: url ?? null, sharedBy: sharedBy ?? null, isPlaying: true, timestamp: 0, updatedAt: Date.now() }
    }, { merge: true });
  },

  async updateMediaState(sessionId: string, isPlaying: boolean, timestamp: number): Promise<void> {
    await updateDoc(doc(db, 'meditation_sessions', sessionId), {
      'mediaShare.isPlaying': isPlaying,
      'mediaShare.timestamp': timestamp,
      'mediaShare.updatedAt': Date.now()
    });
  },

  async leaveSession(sessionId: string, uid: string, durationMinutes: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'meditation_sessions', sessionId, 'participants', uid),
        { isPresent: false, leftAt: Date.now() });
      await updateDoc(doc(db, 'meditation_attendance', `${uid}_${sessionId}`),
        { leftAt: Date.now(), durationMinutes });
    } catch { }
  },

  async updateVideoEnabled(sessionId: string, uid: string, videoEnabled: boolean): Promise<void> {
    await updateDoc(doc(db, 'meditation_sessions', sessionId, 'participants', uid), { videoEnabled });
  },

  subscribeToParticipants(sessionId: string, cb: (p: MeditationParticipant[]) => void): Unsubscribe {
    const q = query(collection(db, 'meditation_sessions', sessionId, 'participants'), where('isPresent', '==', true));
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => d.data() as MeditationParticipant);
      // Reference "now" = the freshest SERVER heartbeat in the room (Timestamps
      // only, never the reader's local clock). This makes presence immune to
      // device clock skew — a phone with a wrong clock can't filter others out.
      const serverTimes = docs.map(p => tsToMillis((p as any).lastSeen)).filter((t): t is number => t !== null);
      const now = serverTimes.length ? Math.max(...serverTimes) : null;
      const fresh = docs.filter(p => {
        const v = (p as any).lastSeen;
        if (v == null) return true;     // our own in-flight serverTimestamp write — keep
        if (now === null) return true;  // no server heartbeat yet — don't filter anyone out
        // Accept Firestore Timestamps AND legacy client-written epoch-ms numbers
        // (docs from an older bundle). Without the number case, those days-old
        // ghosts were treated as "unknown" and shown forever.
        const t = tsToMillis(v) ?? (typeof v === 'number' ? v : null);
        if (t === null) return true;
        return now - t < PRESENCE_STALE_MS;
      });
      cb(fresh);
    });
  },

  async sendSignal(sessionId: string, signal: { from: string; to: string; type: 'offer'|'answer'|'ice_candidate'; data: string }): Promise<void> {
    await addDoc(collection(db, 'meditation_sessions', sessionId, 'signals'),
      { ...signal, timestamp: Date.now(), processed: false });
  },

  subscribeToSignals(sessionId: string, myUid: string, cb: (s: any) => void): Unsubscribe {
    const q = query(
      collection(db, 'meditation_sessions', sessionId, 'signals'),
      where('to', '==', myUid), where('processed', '==', false), orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, snap => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          cb({ id: change.doc.id, ...change.doc.data() });
          updateDoc(change.doc.ref, { processed: true }).catch(() => {});
        }
      });
    });
  },

  async sendMessage(sessionId: string, msg: Omit<MeditationMessage, 'id'|'timestamp'>): Promise<void> {
    await addDoc(collection(db, 'meditation_sessions', sessionId, 'chat'),
      { ...msg, timestamp: Date.now(), sessionId });
  },

  async deleteMessage(sessionId: string, messageId: string): Promise<void> {
    await updateDoc(doc(db, 'meditation_sessions', sessionId, 'chat', messageId), {
      isDeleted: true,
      text: 'Message removed by moderator.',
      type: 'text'
    });
  },

  subscribeToChat(sessionId: string, cb: (m: MeditationMessage[]) => void): Unsubscribe {
    const q = query(collection(db, 'meditation_sessions', sessionId, 'chat'), orderBy('timestamp','asc'), limit(60));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as MeditationMessage))));
  },

  subscribeToSession(sessionId: string, cb: (data: any) => void): Unsubscribe {
    return onSnapshot(doc(db, 'meditation_sessions', sessionId), snap => {
      if (snap.exists()) cb(snap.data());
    });
  },

  async saveJournalEntry(entry: Omit<MeditationJournalEntry, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'meditation_journals'), { ...entry, timestamp: Date.now() });
    return ref.id;
  },

  async getJournalEntries(uid: string, n = 30): Promise<MeditationJournalEntry[]> {
    const q = query(collection(db, 'meditation_journals'), where('uid','==',uid), orderBy('timestamp','desc'), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MeditationJournalEntry));
  },

  async getStreak(uid: string): Promise<MeditationStreak | null> {
    const snap = await getDoc(doc(db, 'meditation_streaks', uid));
    return snap.exists() ? snap.data() as MeditationStreak : null;
  },

  async updateStreak(uid: string, sessionDate: string): Promise<MeditationStreak> {
    const existing = await this.getStreak(uid);
    if (!existing) {
      const fresh: MeditationStreak = { uid, currentStreak:1, longestStreak:1, totalSessions:1, totalMinutes:30, lastSessionDate: sessionDate, badges:[] };
      await setDoc(doc(db, 'meditation_streaks', uid), fresh);
      return fresh;
    }
    if (existing.lastSessionDate === sessionDate) return existing;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yStr = yesterday.toISOString().slice(0,10);
    const newCurrent = existing.lastSessionDate === yStr ? existing.currentStreak+1 : 1;
    const updated: MeditationStreak = {
      ...existing, currentStreak: newCurrent,
      longestStreak: Math.max(existing.longestStreak, newCurrent),
      totalSessions: existing.totalSessions+1, totalMinutes: existing.totalMinutes+30,
      lastSessionDate: sessionDate, badges: [...existing.badges],
    };
    const checks: [MeditationBadgeType, ()=>boolean][] = [
      ['streak_7',()=>updated.currentStreak>=7], ['streak_30',()=>updated.currentStreak>=30],
      ['streak_100',()=>updated.currentStreak>=100], ['sessions_10',()=>updated.totalSessions>=10],
      ['sessions_50',()=>updated.totalSessions>=50], ['sessions_100',()=>updated.totalSessions>=100],
      ['minutes_100',()=>updated.totalMinutes>=100], ['minutes_1000',()=>updated.totalMinutes>=1000],
    ];
    for (const [type, check] of checks) {
      if (!updated.badges.find(b=>b.type===type) && check())
        updated.badges.push({ id:`${type}_${Date.now()}`, type, earnedAt: Date.now() });
    }
    await setDoc(doc(db, 'meditation_streaks', uid), updated);
    return updated;
  },

  async getAttendanceHistory(uid: string, n = 30): Promise<MeditationAttendance[]> {
    const q = query(collection(db, 'meditation_attendance'), where('uid','==',uid), orderBy('joinedAt','desc'), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MeditationAttendance));
  },
};
