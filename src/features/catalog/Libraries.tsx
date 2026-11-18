// The two in-app libraries: Mantras (Soulful Mantra Studio) and Sacred Sounds
// (meditation music). Both are SoundLibrary with their own tracks and playlists.

import { useMemo } from 'react';
import { SoundLibrary, type LibraryTrack, type Playlist } from './SoundLibrary';
import { MANTRAS, MOMENTS, DEITIES, getMantraAudioUrl, thumb } from '../mantras/mantraData';
import { SACRED_TRACKS } from '../music/musicData';
import { VoiceService } from '../../services/voiceService';
import { useTheme } from '../../theme/ThemeSystem';

const MANTRA_FALLBACK_COVER = '/marketing/mantras/bowl-lotus.webp';

export function MantraLibrary({ previewAsGuest = false, previewAsOwner = false }: { previewAsGuest?: boolean; previewAsOwner?: boolean } = {}) {
  const tracks: LibraryTrack[] = useMemo(() => MANTRAS.map((m) => ({
    id: `mantra:${m.slug}`,
    title: m.name,
    subtitle: `${m.deity} · ${m.occasions.slice(0, 2).join(' · ')}`,
    cover: m.cover || (m.videos?.[0] ? thumb(m.videos[0].id) : MANTRA_FALLBACK_COVER),
    path: m.audioUrl || getMantraAudioUrl(m.slug),
  })), []);

  const playlists: Playlist[] = useMemo(() => [
    ...MOMENTS.map((mo) => ({
      id: `moment:${mo.id}`, name: mo.label, blurb: mo.blurb,
      trackIds: MANTRAS.filter((m) => m.moments.includes(mo.id)).map((m) => `mantra:${m.slug}`),
    })),
    ...DEITIES.map((d) => ({
      id: `deity:${d}`, name: d, blurb: `Mantras to ${d}.`,
      trackIds: MANTRAS.filter((m) => m.deity === d).map((m) => `mantra:${m.slug}`),
    })),
  ], []);

  return (
    <SoundLibrary previewAsGuest={previewAsGuest} previewAsOwner={previewAsOwner} kind="mantras" kicker="Soulful Mantra Studio" title="Mantras"
      description="Sacred chants by time of day, by deity and for every festival. Tap a chant to listen."
      cover="/marketing/mantras/emblem-sunburst.webp" tracks={tracks} playlists={playlists} />
  );
}

const MOOD_BLURB: Record<string, string> = {
  Calm: 'Soft and slow, for settling down.',
  Uplifting: 'Light and warm, for a brighter mood.',
  Deep: 'Spacious sound for deeper sitting.',
  Healing: 'Gentle tones for rest and recovery.',
  Meditation: 'Guided and ambient, for meditation.',
};

export function SacredSoundsLibrary({ previewAsGuest = false }: { previewAsGuest?: boolean } = {}) {
  const { mode } = useTheme();
  const fallback = VoiceService.getStorageUrl(`/Soundscapes/Images/sacred-bg-${mode === 'dark' ? 'dark' : 'light'}.webp`);

  const tracks: LibraryTrack[] = useMemo(() => SACRED_TRACKS.map((t) => ({
    id: t.id,
    title: t.title,
    subtitle: `${t.mood} · ${t.description.split('. ')[0]}`,
    cover: t.coverImage ? (mode === 'dark' ? t.coverImage.dark : t.coverImage.light) : fallback,
    duration: t.duration,
    // Played straight from Storage, like the mantras. The old signed-URL route
    // (getSecureTrackUrl) fails server-side for every track, and these files
    // are publicly readable anyway, so it added no protection.
    path: t.audioPath,
  })), [mode, fallback]);

  const playlists: Playlist[] = useMemo(() => {
    const moods = Array.from(new Set(SACRED_TRACKS.map((t) => t.mood)));
    return moods.map((m) => ({ id: `mood:${m}`, name: m, blurb: MOOD_BLURB[m] || '', trackIds: SACRED_TRACKS.filter((t) => t.mood === m).map((t) => t.id) }));
  }, []);

  return (
    <SoundLibrary previewAsGuest={previewAsGuest} kind="sacred_sounds" kicker="Soulful Mantra Studio" title="Sacred Sounds"
      description="Meditation music for calm, sleep and deep practice. Tap a track to listen."
      cover={fallback} tracks={tracks} playlists={playlists} />
  );
}
