import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { CHROME, FONT } from '../ui/chrome';
import { isMuted } from '../../../../lib/sfx';
import * as sound from '../kit/sound';

/**
 * The Feelings Room's opening — the founder's animation, played sharp and
 * full-bleed, once, before the room hands over to the child.
 *
 * This is a DIFFERENT job from OrbScene. OrbScene is the ambient loop that
 * sits blurred behind the tappable balls for as long as the step is open —
 * it has to repeat forever without becoming a spectacle. This clip is the
 * opposite: a single built arc (the orbs gather, then bloom into light
 * around the girl) that only means something once. Looping it would replay
 * that bloom every ten seconds regardless of anything the child has done,
 * which cheapens the real one — the one they make themselves a moment
 * later by tapping a ball. So it plays through exactly once per device
 * (see kit/introSeen.ts) and then gets out of the way for good.
 */

/** Under the app's own cues (0.3–0.55) it would be lost; at 1.0 it startles. */
const VOLUME = 0.8;

export function FeelingsIntro({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canSkip, setCanSkip] = useState(false);
  /**
   * True when the browser refused sound and we fell back to a silent play.
   * Not the same as the device mute toggle: a child who muted the app wants
   * silence and must not be offered a button undoing that.
   */
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    // A beat before "Skip" appears, so it doesn't compete with the opening
    // second of the clip for attention.
    const t = window.setTimeout(() => setCanSkip(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const cleanup: (() => void)[] = [];

    // The hub's fold chime may still be ringing as this mounts; two pieces
    // of audio over one another is worse than either alone.
    sound.stopAll();

    v.volume = VOLUME;
    v.muted = isMuted();

    /**
     * Sound needs a gesture, and this effect is not one.
     *
     * The child DID tap to get here, but that tap finished several renders
     * ago. Chrome treats the page as activated and lets the sound through;
     * iOS Safari wants play() called from inside the handler itself, which
     * a mount effect can never be. So: ask for sound, and when the browser
     * says no, keep the picture and go and get the sound from the next real
     * touch — which is always a gesture, wherever on the screen it lands.
     */
    void v.play().catch(() => {
      if (v.muted) { onDone(); return; }   // device-muted: silence is wanted
      v.muted = true;
      setSoundBlocked(true);
      void v.play().catch(() => onDone());

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

    // Leaving mid-clip (Skip, or the back arrow) must take the audio with
    // it — React unmounting the element normally does that, but pausing
    // first means it never outlives the picture even for a frame.
    return () => {
      cleanup.forEach((fn) => fn());
      try { v.pause(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function turnSoundOn() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = VOLUME;
    setSoundBlocked(false);
    void v.play().catch(() => { /* nothing more to try */ });
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0A061A' }}>
      {/*
        A blurred, over-scaled copy of the same frame fills the letterbox.
        The clip is 16:9 and the phone is portrait, so `object-cover` would
        crop it to a slice — half the orbs gone, the labels sliced through
        (which is exactly why OrbScene gives up and blurs the whole thing).
        An intro can't do that: the whole point is that the child SEES the
        six orbs gather and bloom. So the sharp copy is `contain`ed and the
        bars are filled with the same picture, thrown out of focus.

        Stays muted whatever the sharp copy is doing — one picture, one
        soundtrack, never the same audio twice a few milliseconds apart.
      */}
      <video
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(28px) saturate(1.25) brightness(0.55)', transform: 'scale(1.2)' }}
        autoPlay
        muted
        playsInline
        loop
      >
        <source src="/scenes/feelings-intro.webm" type="video/webm" />
        <source src="/scenes/feelings-intro.mp4" type="video/mp4" />
      </video>

      <video
        ref={videoRef}
        poster="/scenes/feelings-intro-poster.webp"
        className="absolute inset-0 h-full w-full object-contain"
        autoPlay
        playsInline
        onEnded={onDone}
        onError={onDone}
      >
        <source src="/scenes/feelings-intro.webm" type="video/webm" />
        <source src="/scenes/feelings-intro.mp4" type="video/mp4" />
      </video>

      {/* Only when the browser took the sound away, never when the child did. */}
      {soundBlocked && (
        <motion.button
          onClick={turnSoundOn}
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
          exception — Skip is a plain tap-through, not a countdown, and it
          only appears once the clip has had a moment to land. */}
      {canSkip && (
        <motion.button
          onClick={onDone}
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
