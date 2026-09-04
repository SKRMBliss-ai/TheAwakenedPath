import { useEffect, useRef, useState } from 'react';

/**
 * A room's cinematic video intro — plays once, full-bleed, before the usual
 * approach/reveal/title sequence takes over. Opt-in via a room's
 * `introVideo` config (see rooms.ts); every room without one skips this
 * entirely, so CinematicRoom's normal flow is untouched for them.
 *
 * Picks the portrait or landscape cut based on viewport shape — the two
 * source clips were generated separately for exactly this (see rooms.ts's
 * comment on `introVideo`), not stretched/cropped from one another.
 */

export interface IntroVideoSources {
  mobile: string;
  mobilePoster: string;
  web: string;
  webPoster: string;
}

export function RoomIntroVideo({
  sources, onDone,
}: { sources: IntroVideoSources; onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight >= window.innerWidth : true,
  );

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const onChange = () => setIsPortrait(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    // Autoplay only fires reliably once the element has the new src loaded.
    const v = videoRef.current;
    if (v) { v.load(); void v.play().catch(() => onDone()); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPortrait]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        key={isPortrait ? 'mobile' : 'web'}
        src={isPortrait ? sources.mobile : sources.web}
        poster={isPortrait ? sources.mobilePoster : sources.webPoster}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={onDone}
        onError={onDone}
      />
    </div>
  );
}
