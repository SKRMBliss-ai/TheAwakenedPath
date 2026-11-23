import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const read = () => {
  try {
    return localStorage.getItem('mg-daily-sound') !== 'off';
  } catch {
    return true;
  }
};

/** The daily session's sound switch, shown in the app's top bar. Shares its
 *  setting with the session through localStorage and a window event. */
export function DailySoundToggle() {
  const [on, setOn] = useState(read);
  useEffect(() => {
    const sync = () => setOn(read());
    window.addEventListener('mg-daily-sound', sync);
    return () => window.removeEventListener('mg-daily-sound', sync);
  }, []);
  return (
    <button
      onClick={() => {
        const next = !read();
        try {
          localStorage.setItem('mg-daily-sound', next ? 'on' : 'off');
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new CustomEvent('mg-daily-sound'));
      }}
      aria-label={on ? 'Turn session sounds off' : 'Turn session sounds on'}
      aria-pressed={on}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all active:scale-95"
    >
      {on ? <Volume2 className="w-[18px] h-[18px]" /> : <VolumeX className="w-[18px] h-[18px]" />}
    </button>
  );
}
