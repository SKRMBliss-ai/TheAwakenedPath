// ─────────────────────────────────────────────────────────────────────────────
// SILogoMark — the Soulful Intelligence badge, used wherever the studio brand
// appears inside the app.
//
// This renders the real brand asset (self-hosted webp, ~14 KB, same origin and
// precached by the service worker) rather than a drawn approximation, so the
// mark in the app is pixel-identical to the one on the website, the sales pages
// and the portfolio. A drawn monogram shows only if the image fails to load.
// ─────────────────────────────────────────────────────────────────────────────

export const SI_LOGO_SRC = '/si-logo-light.webp';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
       <circle cx="50" cy="50" r="49" fill="#A98A67" opacity="0.14"/>
       <circle cx="50" cy="50" r="45" fill="none" stroke="#A98A67" stroke-width="2"/>
       <text x="50" y="64" text-anchor="middle" font-family="Georgia,serif"
             font-size="42" font-weight="600" fill="#A98A67">SI</text>
     </svg>`,
  );

export default function SILogoMark({ size }: { size?: number }) {
  return (
    <img
      src={SI_LOGO_SRC}
      alt="Soulful Intelligence Studio"
      {...(size ? { width: size, height: size } : { width: '100%', height: '100%' })}
      loading="eager"
      decoding="async"
      style={{ objectFit: 'cover', borderRadius: '50%', display: 'block' }}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.dataset.fallback) return;
        img.dataset.fallback = '1';
        img.src = FALLBACK;
      }}
    />
  );
}
