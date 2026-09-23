import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useQuiet } from '../ui/quiet';
import { isMuted } from '../../../../lib/sfx';
import { needsDailyWelcome, rememberDailyWelcome } from '../kit/dailyWelcome';
import './DailyWelcome.css';

/** A brief, optional welcome on the first home visit of each local day. */
export function DailyWelcome() {
  const [visible, setVisible] = useState(needsDailyWelcome);
  /*
    THE WELCOME COMES WITH ITS SOUND ON.

    It opened silent with an "Enable sound" button a child had to find, which
    meant almost nobody ever heard it. Browsers will not autoplay audible video
    without a prior gesture, so this asks for sound first and only falls back
    to silence if the browser refuses — where it does, the button is still
    there and the film still plays.
  */
  const [muted, setMuted] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const silent = quiet || isMuted();

  useEffect(() => {
    if (!visible) return;
    rememberDailyWelcome();
    dialog.current?.showModal();
    const player = video.current;
    const cleanup: (() => void)[] = [];
    if (!reduced && !quiet) {
      player?.play().catch(() => {
        /* Autoplay with sound was refused. Mute and try once more, so the
           film still runs — rather than a still frame and no explanation. */
        setMuted(true);
        void player.play().catch(() => { /* Native play control remains available. */ });

        /* The very first tap anywhere on the dialog is a real gesture, so
           sound can come straight back without the child having to find and
           press "Enable sound" themselves. */
        const rescue = () => {
          const el = video.current;
          if (!el) return;
          setMuted(false);
          el.muted = false;
          void el.play().catch(() => { /* native controls remain available */ });
        };
        dialog.current?.addEventListener('pointerdown', rescue, { once: true });
        cleanup.push(() => dialog.current?.removeEventListener('pointerdown', rescue));
      });
    }
    return () => { player?.pause(); cleanup.forEach((fn) => fn()); };
  }, [visible, reduced, quiet]);

  const finish = () => {
    video.current?.pause();
    dialog.current?.close();
    setVisible(false);
  };

  if (!visible) return null;
  return <dialog ref={dialog} className="mg-daily-welcome" aria-labelledby="mg-welcome-title" onCancel={finish} onClose={() => setVisible(false)}>
    <header><h2 id="mg-welcome-title">Welcome to Mind Gym</h2><button autoFocus onClick={finish}>Skip welcome →</button></header>
    <video ref={video} src="/mind-gym/welcome/welcomevideo.mp4" controls playsInline muted={silent || muted}
      preload="metadata" onEnded={finish} onError={finish} aria-label="Mind Gym welcome video" />
    <footer><p>A little hello to start your day.</p>{!silent && <button onClick={() => setMuted(value => !value)}>{muted ? 'Enable sound' : 'Mute sound'}</button>}</footer>
  </dialog>;
}
