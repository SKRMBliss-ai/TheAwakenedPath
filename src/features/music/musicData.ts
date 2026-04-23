import { VoiceService } from '../../services/voiceService';

export interface SacredTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  previewUrl: string;
  priceUSD: number;
  description: string;
  mood: 'Calm' | 'Uplifting' | 'Deep' | 'Healing' | 'Meditation';
  coverImage?: {
    dark: string;
    light: string;
  };
}

export const SACRED_TRACKS: SacredTrack[] = [
  {
    id: 'track_1',
    title: 'Mindful Meadows',
    artist: 'Sacred Sounds',
    duration: '15:00',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/budhaTranquilRemix1.mp3'),
    priceUSD: 14.99,
    description: 'A gentle ambient journey through soft winds and bird songs. Perfect for your daily presence practice.',
    mood: 'Calm',
    coverImage: {
      dark: VoiceService.getStorageUrl('/mp3/Music/Images/sacred-bg-dark.webp'),
      light: VoiceService.getStorageUrl('/mp3/Music/Images/sacred-bg-light.webp')
    }
  },
  {
    id: 'track_2', // Changed from track_1
    title: "The Observer's Echo",
    artist: 'Sacred Sounds',
    duration: '00:28',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/WatchersPause.mp3'),
    priceUSD: 14.99,
    description: 'A short, deep sonic bridge to silence. Use this as a quick anchor to return to the witness state in between your daily activities.',
    mood: 'Deep',
    coverImage: {
      dark: VoiceService.getStorageUrl('/mp3/Music/Images/observer-echo-dark.webp'),
      light: VoiceService.getStorageUrl('/mp3/Music/Images/observer-echo-light.webp')
    }
  },
  {
    id: 'gratitude-flow',
    title: 'Gratitude Flow',
    artist: 'Sacred Sounds',
    duration: '03:59',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/OceanofHooponopono.mp3'),
    priceUSD: 14.99,
    description: 'A serene immersion in the healing frequencies of Ho’oponopono. Gentle waves and ethereal hums carry the mantra of reconciliation and love.',
    mood: 'Uplifting',
    coverImage: {
      dark: VoiceService.getStorageUrl('/mp3/Music/Images/gratitude-flow-dark.webp'),
      light: VoiceService.getStorageUrl('/mp3/Music/Images/gratitude-flow-light.webp')
    }
  },
  {
    id: 'gratitude-flow-harmonic',
    title: 'Gratitude Flow (Harmonic)',
    artist: 'Sacred Sounds',
    duration: '04:43',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/OceanofHooponoponoWithMusic.mp3'),
    priceUSD: 14.99,
    description: 'An enriched version of the Ho’oponopono journey, featuring soft melodic layers and synths that deepen the heart-opening experience.',
    mood: 'Uplifting',
    coverImage: {
      dark: VoiceService.getStorageUrl('/mp3/Music/Images/gratitude-flow-harmonic-dark.webp'),
      light: VoiceService.getStorageUrl('/mp3/Music/Images/gratitude-flow-harmonic-light.webp')
    }
  },
  {
    id: 'cellular-healing',
    title: 'Cellular Healing',
    artist: 'Sacred Sounds',
    duration: '04:09',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/budhaflutewithtabla1.mp3'),
    priceUSD: 14.99,
    description: 'Grounding Tabla rhythms meet the celestial breath of the Buddha Flute. Specifically designed to harmonize biological rhythms and restore inner peace.',
    mood: 'Healing',
    coverImage: {
      dark: VoiceService.getStorageUrl('/mp3/Music/Images/cellular-healing-dark.webp'),
      light: VoiceService.getStorageUrl('/mp3/Music/Images/cellular-healing-light.webp')
    }
  },
  {
    id: 'om-vacuum',
    title: 'Om Vacuum',
    artist: 'Sacred Sounds',
    duration: '07:59',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/OmVacuum.mp3'),
    priceUSD: 14.99,
    description: 'A concentrated primordial Om resonance that acts as a mental vacuum, drawing out thoughts and leaving only the vast, silent space of being.',
    mood: 'Deep',
    coverImage: {
      dark: VoiceService.getStorageUrl('/mp3/Music/Images/om-vacuum-dark.webp'),
      light: VoiceService.getStorageUrl('/mp3/Music/Images/om-vacuum-light.webp')
    }
  },
  {
    id: 'become-the-watcher',
    title: 'Become the Watcher with OM Sound',
    artist: 'Sacred Sounds',
    duration: '08:25',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/BecomeWatcherWithOM.mp3'),
    priceUSD: 19.99,
    description: 'A guided sonic portal into the presence of the Watcher. Merges the power of the long Om chant with silence to reveal the witnessing consciousness.',
    mood: 'Deep',
    coverImage: {
      dark: VoiceService.getStorageUrl('/mp3/Music/Images/become-watcherwithOmDark.webp'),
      light: VoiceService.getStorageUrl('/mp3/Music/Images/become-watcherwithOmLight.webp')
    }
  },
  {
    id: 'worry-small-1',
    title: 'Worry-Free Presence',
    artist: 'Sacred Sounds',
    duration: '10:00',
    previewUrl: VoiceService.getStorageUrl('/Soundscapes/MakeEveryWorryLookSmall.mp3'),
    priceUSD: 14.99,
    description: "A spacious sonic landscape designed to shrink the mind's burdens and anchor you in the eternal Now.",
    mood: 'Healing',
    coverImage: {
      dark: VoiceService.getStorageUrl('/Soundscapes/Images/MakeEveryWorryLookSmallDark1.webp'),
      light: VoiceService.getStorageUrl('/Soundscapes/Images/MakeEveryWorryLookSmallLight1.webp')
    }
  },
  {
    id: 'worry-small-2',
    title: 'Ethereal Resilience',
    artist: 'Sacred Sounds',
    duration: '12:00',
    previewUrl: VoiceService.getStorageUrl('/Soundscapes/MakeEveryWorryLookSmall1.mp3'),
    priceUSD: 14.99,
    description: 'An enriched harmonic journey that restores inner balance and makes every obstacle feel like a small wave in a vast ocean.',
    mood: 'Healing',
    coverImage: {
      dark: VoiceService.getStorageUrl('/Soundscapes/Images/MakeEveryWorryLookSmallDark2.webp'),
      light: VoiceService.getStorageUrl('/Soundscapes/Images/MakeEveryWorryLookSmallLight2.webp')
    }
  },
  {
    id: 'the-watcher-identity',
    title: 'I am the one who watches',
    artist: 'Sacred Sounds',
    duration: '10:00',
    previewUrl: VoiceService.getStorageUrl('/mp3/Music/WatchersPause.mp3'),
    priceUSD: 14.99,
    description: 'A profound meditative soundscape for resting in the seat of the Witness. Let the world fade as you return to the one who is looking.',
    mood: 'Meditation',
    coverImage: {
      dark: '/watcher-dark.webp',
      light: '/watcher-light.webp'
    }
  },
  {
    id: 'tired-of-searching-guru',
    title: 'I am tired of searching a guru',
    artist: 'Sacred Sounds',
    duration: '12:45',
    previewUrl: VoiceService.getStorageUrl('/Soundscapes/TiredOfSearchingLIVE.mp3'),
    priceUSD: 14.99,
    description: 'A transformative soundscape documenting the shift from external seeking to internal discovery. When the searcher stops, the Truth is found.',
    mood: 'Meditation',
    coverImage: {
      dark: '/guru-dark.webp',
      light: '/guru-light.webp'
    }
  }
];

