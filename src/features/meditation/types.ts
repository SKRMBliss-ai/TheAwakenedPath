// Meditation Room Types — MindGym / MindGym

export interface MeditationParticipant {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: number;
  videoEnabled: boolean;
  isPresent: boolean;
  /** Heartbeat timestamp — presence is only honoured if this is recent. */
  lastSeen?: number;
}

export interface MeditationMessage {
  id: string;
  sessionId: string;
  uid: string;
  displayName: string;
  avatarUrl?: string;
  text: string;
  type: 'text' | 'emoji' | 'system';
  timestamp: number;
  isDeleted?: boolean;
}

export interface MeditationJournalEntry {
  id: string;
  uid: string;
  sessionId: string;
  date: string;
  moodBefore: number;   // 1–5
  moodAfter: number;    // 1–5
  stayedPresent: boolean;
  noticed: string;
  oneWord: string;
  notes?: string;
  timestamp: number;
}

export interface MeditationBadge {
  id: string;
  type: 'streak_7' | 'streak_30' | 'streak_100' | 'sessions_10' | 'sessions_50' | 'sessions_100' | 'minutes_100' | 'minutes_1000';
  earnedAt: number;
}

export interface MeditationStreak {
  uid: string;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  lastSessionDate: string;
  badges: MeditationBadge[];
}

export interface MeditationAttendance {
  id?: string;
  uid: string;
  sessionId: string;
  joinedAt: number;
  leftAt?: number;
  durationMinutes?: number;
  date: string;
}

export type MeditationScreen = 'landing' | 'prejoin' | 'room' | 'journal';
