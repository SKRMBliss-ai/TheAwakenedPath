import { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { CHROME } from './chrome';
import { clipFor, getClip } from '../kit/voiceStore';

/**
 * "HEAR YOURSELF SAYING IT."
 *
 * A small play button next to an answer the child spoke rather than typed.
 * The transcript has always been kept; this plays back the voice that said
 * it — see kit/voiceStore for why that is worth keeping at all.
 *
 * ITS WHOLE VALUE IS DELAYED. Pressing it the same evening is mildly
 * amusing. Pressing it in fourteen months, and hearing a smaller voice
 * describing something that isn't frightening any more, is the thing this
 * was built for — and it needs no analysis, no comparison, and nothing said
 * about it by the app. The child does all the noticing.
 *
 * RENDERS NOTHING WITHOUT A CLIP. An answer typed rather than spoken, a
 * browser with no recorder, a permission the parent declined — all of them
 * simply have no button, rather than a disabled one that invites a child to
 * keep pressing something broken.
 */
export function HearYourself({ answerKey, accent = '#FFD98A' }: { answerKey: string; accent?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const id = clipFor(answerKey);

  // The object URL is made once per clip and revoked when this goes away —
  // a screen that mounts a dozen of these and leaks every blob would hold
  // the whole recording history in memory for the session.
  useEffect(() => {
    let dead = false;
    let made: string | null = null;
    if (id) {
      void getClip(id).then((blob) => {
        if (dead || !blob) return;
        made = URL.createObjectURL(blob);
        setUrl(made);
      });
    }
    return () => {
      dead = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [id]);

  useEffect(() => () => { audio.current?.pause(); }, []);

  if (!id || !url) return null;

  const toggle = () => {
    if (playing) {
      audio.current?.pause();
      setPlaying(false);
      return;
    }
    const a = audio.current ?? new Audio(url);
    audio.current = a;
    a.onended = () => setPlaying(false);
    a.currentTime = 0;
    void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? 'Stop' : 'Hear yourself saying it'}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-full pl-2.5 pr-3 text-[11.5px] font-extrabold"
      style={{
        background: CHROME.pill,
        border: `1px solid ${CHROME.pillBorder}`,
        color: CHROME.text,
      }}
    >
      {playing
        ? <Square size={11} fill="currentColor" />
        : <Play size={12} fill={accent} color={accent} />}
      {playing ? 'Stop' : 'Hear yourself'}
    </button>
  );
}
