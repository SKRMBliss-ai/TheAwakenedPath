import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from '../ui/quiet';

/**
 * THE LIVING FEELINGS ROOM.
 *
 * The founder's orb animation, playing behind the feeling step: coloured
 * emotion orbs drifting around the girl with her lantern.
 *
 * WHY IT'S BLURRED, and this is the whole design decision. The film is 16:9
 * and settles into six labelled orbs across its width. A phone is portrait,
 * so a cover-crop keeps the girl and throws every labelled orb off both
 * edges — the layout simply cannot survive the aspect change. Sharpening it
 * up and trying to place tap targets on orbs that are half off-screen would
 * be worse than not using the film at all.
 *
 * Blurred, it becomes exactly what the scene wants underneath: warm coloured
 * bokeh, moving, alive, unmistakably the same room. The crisp labelled balls
 * a child actually taps sit on top of it (FeelingBalls), and they read
 * cleanly because nothing behind them is competing for focus.
 *
 * It also degrades honestly: if the video can't decode or autoplay — some
 * browsers, some data-saver modes — the scene underneath is still there and
 * nothing breaks.
 */

/**
 * Two encodings on purpose. H.264 is what Safari and iOS want; VP9/WebM
 * covers the Chromium builds that ship without proprietary codecs (most
 * Linux distributions, and Playwright's, which is how this was tested).
 * Browsers pick the first they can decode, so WebM leads and mp4 catches
 * everything else.
 */
const SRC_WEBM = '/scenes/feelings-orbs.webm';
const SRC_MP4 = '/scenes/feelings-orbs.mp4';

export function OrbScene({ flash = false }: { flash?: boolean }) {
  const m = useMotion();
  const video = useRef<HTMLVideoElement>(null);

  // The quiet state stops every other loop in the app; this is a loop too,
  // and a distressed child does not need a film moving behind the question.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (m.quiet) v.pause();
    else void v.play().catch(() => { /* autoplay blocked — the still scene is fine */ });
  }, [m.quiet]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <video
        ref={video}
        autoPlay={!m.quiet}
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(6px) saturate(1.3) brightness(0.85)', transform: 'scale(1.08)' }}
      >
        <source src={SRC_WEBM} type="video/webm" />
        <source src={SRC_MP4} type="video/mp4" />
      </video>

      {/* A dark wash so white text stays readable over whatever drifts past. */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,6,26,0.3) 0%, rgba(10,6,26,0.34) 45%, rgba(10,6,26,0.62) 100%)' }} />

      {/*
        THE POP. Every ball bursting at once reads as one bloom of light
        across the whole room rather than six separate little bursts, which
        is both prettier and much cheaper than animating six.
      */}
      <AnimatePresence>
        {flash && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, times: [0, 0.22, 1], ease: 'easeOut' }}
            style={{
              background:
                'radial-gradient(58% 42% at 50% 46%, rgba(255,236,190,0.95) 0%, rgba(255,180,220,0.5) 38%, rgba(160,120,255,0.15) 62%, transparent 78%)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
