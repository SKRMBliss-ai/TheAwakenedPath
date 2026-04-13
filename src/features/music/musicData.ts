export interface SacredTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  previewUrl: string;
  priceUSD: number;
  description: string;
  mood: 'Calm' | 'Uplifting' | 'Deep' | 'Healing';
  coverImage?: {
    dark: string;
    light: string;
  };
}

export const SACRED_TRACKS: SacredTrack[] = [
  {
    id: 'track_1',
    title: 'Mindfulness Meadow',
    artist: 'Sacred Sounds',
    duration: '15:00',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Example preview
    priceUSD: 14.99,
    description: 'A gentle ambient journey through soft winds and bird songs. Perfect for your daily presence practice.',
    mood: 'Calm',
    coverImage: {
      dark: '/mp3/Music/Images/sacred-bg-dark.png',
      light: '/mp3/Music/Images/sacred-bg-light.png'
    }
  },
  {
    id: 'observer-echo',
    title: "The Observer's Echo",
    artist: 'Sacred Sounds',
    duration: '00:28',
    previewUrl: '/mp3/Music/WatchersPause.mp3',
    priceUSD: 14.99,
    description: 'A short, deep sonic bridge to silence. Use this as a quick anchor to return to the witness state in between your daily activities.',
    mood: 'Deep',
    coverImage: {
      dark: '/mp3/Music/Images/observer-echo-dark.png',
      light: '/mp3/Music/Images/observer-echo-light.png'
    }
  },
  {
    id: 'gratitude-flow',
    title: 'Gratitude Flow',
    artist: 'Sacred Sounds',
    duration: '03:59',
    previewUrl: '/mp3/Music/OceanofHooponopono.mp3',
    priceUSD: 14.99,
    description: 'A serene immersion in the healing frequencies of Ho’oponopono. Gentle waves and ethereal hums carry the mantra of reconciliation and love.',
    mood: 'Uplifting',
    coverImage: {
      dark: '/mp3/Music/Images/gratitude-flow-dark.png',
      light: '/mp3/Music/Images/gratitude-flow-light.png'
    }
  },
  {
    id: 'gratitude-flow-harmonic',
    title: 'Gratitude Flow (Harmonic)',
    artist: 'Sacred Sounds',
    duration: '04:43',
    previewUrl: '/mp3/Music/OceanofHooponoponoWithMusic.mp3',
    priceUSD: 14.99,
    description: 'An enriched version of the Ho’oponopono journey, featuring soft melodic layers and synths that deepen the heart-opening experience.',
    mood: 'Uplifting',
    coverImage: {
      dark: '/mp3/Music/Images/gratitude-flow-harmonic-dark.png',
      light: '/mp3/Music/Images/gratitude-flow-harmonic-light.png'
    }
  },
  {
    id: 'cellular-healing',
    title: 'Cellular Healing',
    artist: 'Sacred Sounds',
    duration: '04:09',
    previewUrl: '/mp3/Music/budhaflutewithtabla1.mp3',
    priceUSD: 14.99,
    description: 'Grounding Tabla rhythms meet the celestial breath of the Buddha Flute. Specifically designed to harmonize biological rhythms and restore inner peace.',
    mood: 'Healing',
    coverImage: {
      dark: '/mp3/Music/Images/cellular-healing-dark.png',
      light: '/mp3/Music/Images/cellular-healing-light.png'
    }
  },
  {
    id: 'om-vacuum',
    title: 'Om Vacuum',
    artist: 'Sacred Sounds',
    duration: '07:59',
    previewUrl: '/mp3/Music/OmVacuum.mp3',
    priceUSD: 14.99,
    description: 'A concentrated primordial Om resonance that acts as a mental vacuum, drawing out thoughts and leaving only the vast, silent space of being.',
    mood: 'Deep',
    coverImage: {
      dark: '/mp3/Music/Images/om-vacuum-dark.png',
      light: '/mp3/Music/Images/om-vacuum-light.png'
    }
  },
  {
    id: 'become-the-watcher',
    title: 'Become the Watcher with OM Sound',
    artist: 'Sacred Sounds',
    duration: '08:25',
    previewUrl: '/mp3/Music/BecomeWatcherWithOM.mp3',
    priceUSD: 19.99,
    description: 'A guided sonic portal into the presence of the Watcher. Merges the power of the long Om chant with silence to reveal the witnessing consciousness.',
    mood: 'Deep',
    coverImage: {
      dark: '/mp3/Music/Images/sacred-bg-dark.png',
      light: '/mp3/Music/Images/sacred-bg-light.png'
    }
  }
];
