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
    duration: '15:00',
    previewUrl: '/mp3/Music/WatchersPause.mp3',
    priceUSD: 14.99,
    description: 'A sonic mirror for the witnessing consciousness. Soft ripples of frequency that return to silence, reminding you of the silent space in which all sound arises.',
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
    duration: '15:00',
    previewUrl: '/mp3/Music/OceanofHooponopono.mp3',
    priceUSD: 14.99,
    description: 'An uplifting, heart-opening composition inspired by the practice of Ho’oponopono. Weaves celestial synthesizers with soft oceanic layers for total reconciliation.',
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
    duration: '15:00',
    previewUrl: '/mp3/Music/OceanofHooponoponoWithMusic.mp3',
    priceUSD: 14.99,
    description: 'A melodic expansion of the forgiveness journey. Features uplifting harmonic layers woven into the serene Oceanic Echoes of Ho’oponopono.',
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
    duration: '15:00',
    previewUrl: '/mp3/Music/budhaflutewithtabla1.mp3',
    priceUSD: 14.99,
    description: 'A delicate fusion of Buddha Flute and grounding Tabla. Designed to stimulate molecular harmony and deep physical restoration through rhythmic resonance.',
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
    duration: '15:00',
    previewUrl: '/mp3/Music/OmVacuum.mp3',
    priceUSD: 14.99,
    description: 'A profound, sustained resonance of the primordial Om. A vacuum of sound that dissolves thought and anchors the soul into pure frequency.',
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
    duration: '15:00',
    previewUrl: '/mp3/Music/BecomeWatcherWithOM.mp4',
    priceUSD: 19.99,
    description: 'A transformative video-guided meditation merging the primordial Om with direct self-inquiry. A visual and sonic portal into the witnessing consciousness.',
    mood: 'Deep',
    coverImage: {
      dark: '/mp3/Music/Images/sacred-bg-dark.png',
      light: '/mp3/Music/Images/sacred-bg-light.png'
    }
  }
];
