import { useEffect } from 'react';

/** Placeholder for /breathwork until the real page exists. Kept out of search
 *  (noindex) so an empty page is never what Google shows for it. */
export default function BreathworkComingSoon() {
  useEffect(() => {
    document.title = 'Breathwork · Coming soon';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  return (
    <main
      style={{
        minHeight: '100dvh', display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 14,
        padding: 24, textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 30%, #2d4a5e, #0f1a26 70%)',
        color: '#eef6f7', fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      <span style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#e6c57d', fontWeight: 600 }}>
        Breathwork
      </span>
      <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: 'clamp(40px, 9vw, 72px)', lineHeight: 1.05 }}>
        Coming soon
      </h1>
      <p style={{ margin: 0, maxWidth: '36ch', fontSize: 16, lineHeight: 1.6, color: '#b9ced3' }}>
        Guided breathing practices are on their way.
      </p>
      <a
        href="/"
        style={{
          marginTop: 10, minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 24px',
          borderRadius: 999, background: '#e6c57d', color: '#1c1406', fontWeight: 700, textDecoration: 'none',
        }}
      >
        Back to home
      </a>
    </main>
  );
}
