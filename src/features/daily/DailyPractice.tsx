import { useEffect, useRef } from 'react';
import { VoiceService } from '../../services/voiceService';
import { mountDailyPractice } from './dailyEngine';
import './daily.css';

/** Post to the daily-guide function. Returns null on any failure so the
 *  engine falls back to its built-in set. */
async function post(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try {
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), 40000);
    const res = await fetch('/api/mind-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * The adult Mind Gym daily session: share what is on your mind (typed or
 * spoken), get a guide that remembers recent sessions, work it through with
 * short exercises, and climb one step up the mountain path.
 * The engine lives in dailyEngine.ts; this component only mounts it and
 * connects it to the app's AI route, voice and navigation.
 */
export function DailyPractice({ onMore }: { onMore?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const moreRef = useRef(onMore);
  useEffect(() => {
    moreRef.current = onMore;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountDailyPractice(el, {
      guide: (input) => post({ mode: 'guide', ...input }),
      reply: async (input) => {
        const r = await post({ mode: 'reply', ...input });
        return r && typeof r.text === 'string' ? r.text : null;
      },
      speak: (text) => {
        void VoiceService.speak(text, { gender: 'FEMALE' });
      },
      onMore: () => moreRef.current?.(),
    });
  }, []);

  return <div ref={ref} className="md-daily" />;
}

export default DailyPractice;
