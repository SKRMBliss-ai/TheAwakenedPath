import { create } from 'zustand';
import type { MeditationParticipant, MeditationMessage, MeditationStreak } from '../features/meditation/types';

interface EmojiReaction { id: string; emoji: string; x: number; }

export type MediaShareType = 'none' | 'screen' | 'youtube' | 'audio';

interface MediaShare {
  type: MediaShareType;
  youtubeUrl?: string;
  audioUrl?: string;
  screenStream?: MediaStream;
  isPlaying?: boolean;
}

interface MeditationState {
  sessionId: string | null;
  sessionStartTime: number | null;
  sessionEndTime: number | null;
  sessionStatus: 'idle' | 'joining' | 'live' | 'ended';
  participants: MeditationParticipant[];
  messages: MeditationMessage[];
  emojiReactions: EmojiReaction[];
  isCameraOn: boolean;
  isChatOpen: boolean;
  cameraPermission: 'unknown' | 'granted' | 'denied' | 'requesting';
  streak: MeditationStreak | null;
  mediaShare: MediaShare;
  notificationsMuted: boolean;

  setSession: (id: string, start: number, end: number) => void;
  setSessionStatus: (s: MeditationState['sessionStatus']) => void;
  setParticipants: (p: MeditationParticipant[]) => void;
  setMessages: (m: MeditationMessage[]) => void;
  addEmojiReaction: (emoji: string) => void;
  toggleCamera: () => void;
  setCameraOn: (on: boolean) => void;
  toggleChat: () => void;
  setCameraPermission: (p: MeditationState['cameraPermission']) => void;
  setStreak: (s: MeditationStreak | null) => void;
  setMediaShare: (media: MediaShare) => void;
  clearMediaShare: () => void;
  toggleNotificationsMute: () => void;
  setNotificationsMuted: (muted: boolean) => void;
  reset: () => void;
}

export const useMeditationStore = create<MeditationState>((set) => ({
  sessionId: null, sessionStartTime: null, sessionEndTime: null,
  sessionStatus: 'idle', participants: [], messages: [], emojiReactions: [],
  isCameraOn: false, isChatOpen: false, cameraPermission: 'unknown', streak: null,
  mediaShare: { type: 'none' },
  notificationsMuted: false,

  setSession: (id, start, end) => set({ sessionId: id, sessionStartTime: start, sessionEndTime: end }),
  setSessionStatus: status => set({ sessionStatus: status }),
  setParticipants: participants => set({ participants }),
  setMessages: messages => set({ messages }),

  addEmojiReaction: emoji => {
    const reaction: EmojiReaction = { id: `${Date.now()}_${Math.random()}`, emoji, x: 10 + Math.random() * 80 };
    set(s => ({ emojiReactions: [...s.emojiReactions, reaction] }));
    setTimeout(() => set(s => ({ emojiReactions: s.emojiReactions.filter(r => r.id !== reaction.id) })), 3000);
  },

  toggleCamera: () => set(s => ({ isCameraOn: !s.isCameraOn })),
  setCameraOn: on => set({ isCameraOn: on }),
  toggleChat: () => set(s => ({ isChatOpen: !s.isChatOpen })),
  setCameraPermission: permission => set({ cameraPermission: permission }),
  setStreak: streak => set({ streak }),
  setMediaShare: media => set({ mediaShare: media }),
  clearMediaShare: () => set({ mediaShare: { type: 'none' } }),
  toggleNotificationsMute: () => set(s => ({ notificationsMuted: !s.notificationsMuted })),
  setNotificationsMuted: muted => set({ notificationsMuted: muted }),
  reset: () => set({
    sessionId: null, sessionStartTime: null, sessionEndTime: null,
    sessionStatus: 'idle', participants: [], messages: [], emojiReactions: [],
    isCameraOn: false, isChatOpen: false, cameraPermission: 'unknown',
    mediaShare: { type: 'none' },
    notificationsMuted: false,
  }),
}));
