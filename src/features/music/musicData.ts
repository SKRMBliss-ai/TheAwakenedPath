export interface SacredTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  previewUrl: string;
  priceUSD: number;
  description: string;
  mood: 'Calm' | 'Uplifting' | 'Deep' | 'Healing';
}

export const SACRED_TRACKS: SacredTrack[] = [
  {
    id: 'track_1',
    title: 'Mindfulness Meadow',
    artist: 'Sacred Sounds AI',
    duration: '12:45',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Example preview
    priceUSD: 4.99,
    description: 'A gentle ambient journey through soft winds and bird songs. Perfect for your daily presence practice.',
    mood: 'Calm'
  },
  {
    id: 'track_2',
    title: "The Observer's Echo",
    artist: 'Sacred Sounds AI',
    duration: '22:10',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    priceUSD: 7.99,
    description: 'Deep resonant frequencies designed to help you detach from the thinking mind and anchor into being.',
    mood: 'Deep'
  },
  {
    id: 'track_3',
    title: 'Gratitude Flow',
    artist: 'Sacred Sounds AI',
    duration: '15:30',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    priceUSD: 5.99,
    description: 'An uplifting, heart-opening composition that weaves celestial synthesizers with soft acoustic layers.',
    mood: 'Uplifting'
  },
  {
    id: 'track_4',
    title: 'Cellular Healing',
    artist: 'Sacred Sounds AI',
    duration: '45:00',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    priceUSD: 14.99,
    description: 'Extended track focusing on delta wave stimulation for deep rest and physical restoration.',
    mood: 'Healing'
  }
];
