import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { isMuted } from '../../../../lib/sfx';
import * as sound from '../kit/sound';

/**
 * THE FEELINGS ROOM'S FILM — one clip, two jobs, no cut between them.
 *
 * It opens in the foreground: sharp, whole, and audible, with the orbs
 * gathering and blooming into light around the girl. When it finishes it
 * doesn't stop and it doesn't get replaced — it recedes. The sharp copy
 * fades away, the blurred copy underneath keeps turning, and the tappable
 * balls rise over the top of it. The room the child ends up in is the room
 * they just watched, still moving.
 *
 * WHY THIS IS ONE COMPONENT AND NOT TWO. It used to be two: a cinematic
 * that played once per device, then a separate muted loop for every visit
 * after. Which meant the sound worked exactly once and then appeared to
 * break forever — the second visit showed the same film with no audio,
 * because the loop was a different, deliberately silent element. Same
 * picture, no sound, nothing a person could reasonably read as "working".
 *
 * So the film plays every time now. It costs ten seconds, it is skippable
 * after two, and it is the difference between a room that greets you and a
 * room that used to.
 *
 * The blurred copy is what fills the screen, and it always did: the clip is
 * 16:9 and a phone is portrait, so a cover-crop of the sharp one would cut
 * through the labels and throw half the orbs off both edges. Contained and
 * centred for the film; blurred bokeh once it settles.
 */

/** Under the app's own cues (0.3–0.55) it would be lost; at 1.0 it startles. */
const VOLUME = 0.8;

export function FeelingsIntro({
  onDone,
  flash = false,
}: {
  /** Fired when the film has receded and the balls should come up. */
  onDone: () => void;
  /** The bloom when every ball bursts at once. */
  flash?: boolean;
}) {
  const m = useMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canSkip, setCanSkip] = useState(false);
  const [settled, setSettled] = useState(false);
  /**
   * True when the browser refused sound and we fell back to a silent play.
   * Not the same as the device mute toggle: a child who muted the app wants
   * silence and must not be offered a button undoing that.
   */
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setCanSkip(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const cleanup: (() => void)[] = [];

    sound.stopAll();
    v.volume = VOLUME;
    v.muted = isMuted();

    /**
     * Sound needs a gesture, and this effect is not one. The child DID tap
     * to get here, but that tap finished several renders ago: Chrome treats
     * the page as activated and lets it through, iOS Safari wants play()
     * called from inside the handler itself, which a mount effect can never
     * be. So when the browser says no, keep the picture and go and get the
     * sound from the next real touch — anywhere on screen, because any
     * touch is a gesture.
     */
    void v.play().catch(() => {
      if (v.muted) { settle(); return; }
      v.muted = true;
      setSoundBlocked(true);
      void v.play().catch(() => settle());

      const rescue = () => {
        const el = videoRef.current;
        if (!el) return;
        el.muted = false;
        el.volume = VOLUME;
        setSoundBlocked(false);
        void el.play().catch(() => { /* nothing left to try */ });
      };
      window.addEventListener('pointerdown', rescue, { once: true });
      cleanup.push(() => window.removeEventListener('pointerdown', rescue));
    });

    return () => {
      cleanup.forEach((fn) => fn());
      try { v.pause(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The film recedes. The soundtrack rides down rather than being cut, so
   * the room goes quiet the way a room does; the sharp copy fades out over
   * it, leaving the blurred one turning underneath.
   */
  function settle() {
    if (settled) return;
    setSettled(true);
    onDone();

    const v = videoRef.current;
    if (!v) return;
    const from = v.volume;
    const started = Date.now();
    const id = window.setInterval(() => {
      const el = videoRef.current;
      if (!el) { clearInterval(id); return; }
      const k = Math.min(1, (Date.now() - started) / 900);
      el.volume = from * (1 - k);
      if (k >= 1) { clearInterval(id); el.muted = true; try { el.pause(); } catch { /* ignore */ } }
    }, 50);
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0A061A' }}>
      {/*
        The blurred copy. During the film it fills the letterbox around the
        sharp one; afterwards it IS the room — warm coloured bokeh, moving,
        alive, with the crisp balls reading cleanly on top because nothing
        behind them competes for focus.
      */}
      <video
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(26px) saturate(1.3) brightness(0.62)', transform: 'scale(1.2)' }}
        autoPlay={!m.quiet}
        muted
        playsInline
        loop
      >
        <source src="/scenes/feelings-intro.webm" type="video/webm" />
        <source src="/scenes/feelings-intro.mp4" type="video/mp4" />
      </video>

      {/* A dark wash so white text stays readable over whatever drifts past. */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: settled ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{ background: 'linear-gradient(180deg, rgba(10,6,26,0.3) 0%, rgba(10,6,26,0.34) 45%, rgba(10,6,26,0.62) 100%)' }}
      />

      {/* The sharp copy — the film itself. It fades rather than cutting, so
          the room it leaves behind is visibly the room it was. */}
      <motion.video
        ref={videoRef}
        poster="/scenes/feelings-intro-poster.webp"
        className="absolute inset-0 h-full w-full object-contain"
        playsInline
        animate={{ opacity: settled ? 0 : 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
        onEnded={settle}
        onError={settle}
      >
        <source src="/scenes/feelings-intro.webm" type="video/webm" />
        <source src="/scenes/feelings-intro.mp4" type="video/mp4" />
      </motion.video>

      {/*
        THE POP. Every ball bursting at once reads as one bloom of light
        across the whole room rather than six separate little bursts.
      */}
      <AnimatePresence>
        {flash && (
          <motion.div
            className="pointer-events-none absolute inset-0"
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

      {/* Only when the browser took the sound away, never when the child did. */}
      {!settled && soundBlocked && (
        <motion.button
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            v.muted = false;
            v.volume = VOLUME;
            setSoundBlocked(false);
            void v.play().catch(() => { /* nothing more to try */ });
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-[15px] font-extrabold"
          style={{
            background: '#FFD98A',
            color: '#221A08',
            boxShadow: '0 8px 30px -6px rgba(255,217,138,0.9)',
            fontFamily: FONT,
          }}
        >
          <Volume2 size={19} strokeWidth={2.6} /> Turn on the sound
        </motion.button>
      )}

      {/* No timers anywhere else in this app (§2.9), and this is no
          exception — Skip is a plain tap-through, not a countdown. */}
      {!settled && canSkip && (
        <motion.button
          onClick={settle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-5 right-5 rounded-full px-4 py-2 text-[12.5px] font-bold backdrop-blur-md"
          style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text, fontFamily: FONT }}
        >
          Skip →
        </motion.button>
      )}
    </div>
  );
}
