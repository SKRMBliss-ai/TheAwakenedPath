import { useEffect, useState } from 'react';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

// Cropped from the twins' marketing photo (Firebase Storage: Marketting/shsm.png)
// down to just one figure, with the near-white backdrop keyed to transparent —
// the source frame has a lot of empty white margin around both figures, which
// read as a floating rectangle when dropped straight into a solid-color banner.
const PHOTO_URL = '/marketing/shsm-left.webp';

// A single fixed calendar date, not "N days from whenever this page loads" —
// the latter resets for every visitor on every visit, which is a fake
// deadline. Change this one line to move the real deadline.
const DEADLINE = new Date('2026-08-31T23:59:59+05:30');

function useCountdown(deadline: Date) {
  const [remaining, setRemaining] = useState(() => deadline.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(deadline.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);
  const clamped = Math.max(0, remaining);
  const days = Math.floor(clamped / 86400000);
  const hours = Math.floor((clamped % 86400000) / 3600000);
  const minutes = Math.floor((clamped % 3600000) / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: clamped <= 0 };
}

const Segment = ({ value, isDark }: { value: number; isDark: boolean }) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 34, height: 34, borderRadius: 10,
      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)'}`,
      fontFamily: SANS, fontSize: 15, fontWeight: 800, color: '#fff',
    }}
  >
    {String(value).padStart(2, '0')}
  </span>
);

export default function UrgencyBanner({ isDark, onCta }: { isDark: boolean; onCta: () => void }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(DEADLINE);

  if (expired) return null;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: 72,
        background: isDark
          ? 'linear-gradient(90deg, #2A1B3D 0%, #4A3260 55%, #2A1B3D 100%)'
          : 'linear-gradient(90deg, #3A2354 0%, #5D3D78 55%, #3A2354 100%)',
      }}
    >
      {/* Photo peeking in from the left edge — the source image already has
          the twins facing each other with a gap between them, so cropping
          to just the left figure and bleeding it off-screen reads as a
          portrait accent rather than needing a separate cutout asset. */}
      <img
        src={PHOTO_URL}
        alt=""
        aria-hidden="true"
        className="si-urgency-photo"
        style={{
          position: 'absolute', left: 0, top: 0,
          height: 72, width: 130,
          objectFit: 'cover', objectPosition: '55% 22%',
          pointerEvents: 'none',
          // Fades the cutout's right edge into the banner instead of ending
          // in a hard rectangle — the PNG has no built-in edge falloff.
          WebkitMaskImage: 'linear-gradient(to right, black 55%, transparent 92%)',
          maskImage: 'linear-gradient(to right, black 55%, transparent 92%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 1120, margin: '0 auto',
          padding: '0 20px 0 150px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 18, flexWrap: 'wrap',
          height: '100%',
        }}
        className="si-urgency-content"
      >
        <span
          className="si-urgency-copy"
          style={{ fontFamily: SERIF, fontSize: 15, fontStyle: 'italic', color: '#F5EFE3', textAlign: 'center' }}
        >
          Founding-member pricing ends soon
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Segment value={days} isDark={isDark} />
          <Segment value={hours} isDark={isDark} />
          <Segment value={minutes} isDark={isDark} />
          <Segment value={seconds} isDark={isDark} />
        </div>

        <button
          onClick={onCta}
          style={{
            padding: '9px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: '#fff', color: '#3A2354',
            fontFamily: SANS, fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap',
          }}
        >
          Enroll Now →
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .si-urgency-photo { display: none; }
          .si-urgency-copy { display: none; }
          .si-urgency-content { padding-left: 16px !important; gap: 10px !important; }
        }
      `}</style>
    </div>
  );
}
