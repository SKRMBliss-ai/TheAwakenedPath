// Audio helpers for the practice tools: a synthesised bell and lock-screen controls.

import { useEffect, useRef } from 'react';

// ── A soft bell, synthesised (no audio file to host or fail to load) ────────
let bellCtx: AudioContext | null = null;
export function softBell() {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    bellCtx = bellCtx ?? new Ctor();
    const ctx = bellCtx;
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    // A bell is a fundamental plus a few inharmonic partials that die away at different speeds.
    [[528, 0.22, 3.2], [1056 * 1.0, 0.1, 2.2], [1584 * 1.02, 0.05, 1.4]].forEach(([freq, gain, decay]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gain, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  } catch { /* a bell is a nicety; never break practice over it */ }
}

// ── Lock-screen and headphone controls ──────────────────────────────────────
export function useMediaSession(opts: {
  enabled: boolean;
  title: string | null;
  artwork: string | null;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const { enabled, title, artwork, playing, onPlay, onPause, onNext, onPrev } = opts;
  const handlers = useRef({ onPlay, onPause, onNext, onPrev });
  useEffect(() => { handlers.current = { onPlay, onPause, onNext, onPrev }; });

  useEffect(() => {
    if (!enabled || !title || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    try {
      ms.metadata = new MediaMetadata({
        title,
        artist: 'Soulful Mantra Studio',
        album: 'Mantras',
        artwork: artwork ? [{ src: new URL(artwork, location.href).href, sizes: '512x512' }] : [],
      });
    } catch { /* unsupported artwork type; metadata is optional */ }
    const set = (a: MediaSessionAction, fn: (() => void) | null) => { try { ms.setActionHandler(a, fn); } catch { /* not supported here */ } };
    set('play', () => handlers.current.onPlay());
    set('pause', () => handlers.current.onPause());
    set('nexttrack', () => handlers.current.onNext());
    set('previoustrack', () => handlers.current.onPrev());
    return () => { set('play', null); set('pause', null); set('nexttrack', null); set('previoustrack', null); };
  }, [enabled, title, artwork]);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }, [enabled, playing]);
}

