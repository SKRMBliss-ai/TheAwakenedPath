// ══════════════════════════════════════════════════════════════════════════════
// AWAKENED PATH — ACHIEVEMENTS & POINTS SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

export interface Achievement {
    id: string;
    name: string;
    desc: string;
    icon: string;       // emoji used as medal face
    color: string;      // accent colour for glow
    category: AchievementCategory;
    points: number;     // awarded on unlock
    criteria: string;   // human-readable unlock condition
    // Check function — receives current user stats
    check: (stats: UserStats) => boolean;
}

export type AchievementCategory =
    | 'witnessing'
    | 'presence-study'
    | 'streaks'
    | 'practices';

export interface UserStats {
    journalEntries: number;
    videosWatched: number;
    chaptersComplete: number;   // 0-4
    currentStreak: number;
    maxStreak: number;
    panicUsed: number;
    bodyTruthTests: number;
    voiceWitnessed: number;
    remindersEnabled: boolean;
    statsViewed: number;
}

// ─── Point awards per event ───────────────────────────────────────────────────
export const POINT_EVENTS: Record<string, number> = {
    journal_entry: 15,
    video_watched: 10,
    chapter_complete: 50,
    panic_used: 5,
    body_truth_test: 10,
    streak_3: 25,
    streak_7: 75,
    streak_28: 200,
    voice_witnessed: 20,
    reminders_enabled: 15,
    stats_viewed: 2,
    all_chapters: 100,
    practice_session: 30,
};

// ─── Achievement Definitions ──────────────────────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [

    // ── WITNESSING ────────────────────────────────────────────────────────────
    {
        id: 'first_thought',
        name: 'First Thought',
        desc: 'You witnessed your first thought.',
        icon: '🌱',
        color: '#7EC8A0',
        category: 'witnessing',
        points: 15,
        criteria: '1 journal entry',
        check: (s) => s.journalEntries >= 1,
    },
    {
        id: 'the_observer',
        name: 'The Observer',
        desc: 'You have witnessed yourself 5 times.',
        icon: '👁️',
        color: '#ABCEC9',
        category: 'witnessing',
        points: 50,
        criteria: '5 journal entries',
        check: (s) => s.journalEntries >= 5,
    },
    {
        id: 'dedicated_witness',
        name: 'Dedicated Witness',
        desc: '20 entries of honest witnessing.',
        icon: '📖',
        color: '#C65F9D',
        category: 'witnessing',
        points: 100,
        criteria: '20 journal entries',
        check: (s) => s.journalEntries >= 20,
    },
    {
        id: 'inner_scribe',
        name: 'Inner Scribe',
        desc: 'A soul dedicated to 50 moments of truth.',
        icon: '✍️',
        color: '#F4A261',
        category: 'witnessing',
        points: 200,
        criteria: '50 journal entries',
        check: (s) => s.journalEntries >= 50,
    },

    // ── PRESENCE STUDY ────────────────────────────────────────────────────────
    {
        id: 'first_lesson',
        name: 'First Teaching',
        desc: 'You received your first teaching.',
        icon: '🎬',
        color: '#9B8CC9',
        category: 'presence-study',
        points: 10,
        criteria: '1 video watched',
        check: (s) => s.videosWatched >= 1,
    },
    {
        id: 'chapter1_complete',
        name: 'The Observer',
        desc: 'You Are Not Your Mind — chapter complete.',
        icon: '🧠',
        color: '#7B9FCC',
        category: 'presence-study',
        points: 50,
        criteria: 'Chapter I fully watched',
        check: (s) => s.chaptersComplete >= 1,
    },
    {
        id: 'chapter2_complete',
        name: 'Inner Body',
        desc: 'Consciousness — chapter complete.',
        icon: '🫀',
        color: '#C65F9D',
        category: 'presence-study',
        points: 50,
        criteria: 'Chapter II fully watched',
        check: (s) => s.chaptersComplete >= 2,
    },
    {
        id: 'chapter3_complete',
        name: 'Into the Now',
        desc: 'Moving Into the Now — chapter complete.',
        icon: '⏳',
        color: '#F4A261',
        category: 'presence-study',
        points: 50,
        criteria: 'Chapter III fully watched',
        check: (s) => s.chaptersComplete >= 3,
    },
    {
        id: 'fully_awakened',
        name: 'Fully Awakened',
        desc: 'You have walked the full Presence Study.',
        icon: '✨',
        color: '#FFD700',
        category: 'presence-study',
        points: 200,
        criteria: 'All 4 chapters complete',
        check: (s) => s.chaptersComplete >= 4,
    },

    // ── STREAKS ───────────────────────────────────────────────────────────────
    {
        id: 'streak_3',
        name: 'Returning',
        desc: 'You returned for 3 days in a row.',
        icon: '🌙',
        color: '#7EC8A0',
        category: 'streaks',
        points: 25,
        criteria: '3-day streak',
        check: (s) => s.maxStreak >= 3,
    },
    {
        id: 'streak_7',
        name: 'Unwavering',
        desc: '7 days of unbroken presence.',
        icon: '🔥',
        color: '#F4A261',
        category: 'streaks',
        points: 75,
        criteria: '7-day streak',
        check: (s) => s.maxStreak >= 7,
    },
    {
        id: 'streak_28',
        name: 'The Presence',
        desc: '28 days — a full moon cycle of awakening.',
        icon: '🌕',
        color: '#FFD700',
        category: 'streaks',
        points: 200,
        criteria: '28-day streak',
        check: (s) => s.maxStreak >= 28,
    },

    // ── PRACTICES ─────────────────────────────────────────────────────────────
    {
        id: 'still_point',
        name: 'Still Point',
        desc: 'You used the grounding anchor in a moment of panic.',
        icon: '🌊',
        color: '#ABCEC9',
        category: 'practices',
        points: 5,
        criteria: 'Use presence anchor once',
        check: (s) => s.panicUsed >= 1,
    },
    {
        id: 'body_truth',
        name: 'Body Truth',
        desc: 'You listened to what your body was saying.',
        icon: '🫁',
        color: '#C65F9D',
        category: 'practices',
        points: 10,
        criteria: 'Complete 1 Body Truth Test',
        check: (s) => s.bodyTruthTests >= 1,
    },
    {
        id: 'silent_voice',
        name: 'The Silent Voice',
        desc: 'You spoke a thought and witnessed it from the outside.',
        icon: '🎙️',
        color: '#9B8CC9',
        category: 'practices',
        points: 20,
        criteria: 'Use Voice Witness once',
        check: (s) => s.voiceWitnessed >= 1,
    },
    {
        id: 'presence_bell',
        name: 'Presence Bell',
        desc: 'You invited the Now to ring for you throughout the day.',
        icon: '🔔',
        color: '#FFD700',
        category: 'practices',
        points: 15,
        criteria: 'Enable Presence Reminders',
        check: (s) => s.remindersEnabled,
    },
];

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
    'witnessing': 'Witnessing',
    'presence-study': 'The Presence Study',
    'streaks': 'Streaks',
    'practices': 'Practices',
};

export type { UserStats as AchievementUserStats };
