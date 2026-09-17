import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useQuiet } from '../ui/quiet';
import { isMuted } from '../../../../lib/sfx';
import { needsDailyWelcome, rememberDailyWelcome } from '../kit/dailyWelcome';
import './DailyWelcome.css';

/** A brief, optional welcome on the first home visit of each local day. */
export function DailyWelcome() {
  const [visible, setVisible] = useState(needsDailyWelcome);
  const [muted, setMuted] = useState(true);
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
    if (!reduced && !quiet) void player?.play().catch(() => { /* Native play control remains available. */ });
    return () => { player?.pause(); };
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
