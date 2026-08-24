import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// NotFoundView — the in-app 404.
//
// Before this existed, any unrecognised path fell through to the Mind Gym app,
// so a typo'd or stale URL silently rendered the app while the server had
// already served the *home* page's prerendered HTML. Crawlers therefore saw an
// unlimited supply of "index, follow" duplicates of the home page (soft-404s).
//
// This view renders honest 404 content and, critically, flips the robots tag to
// noindex so those URLs drop out of the index. Styling is self-contained and
// mirrors public/404.html (the server-served twin for missing *assets*) so both
// look identical.
// ─────────────────────────────────────────────────────────────────────────────

const LINKS: any[] = [
  { label: 'About Mind Gym', href: '/aboutmindgym' },
  { label: 'Articles', href: '/guides' },
  {
    label: 'Courses',
    href: '',
    subItems: [
      {
        label: 'For All',
        sub: 'Feelings & Emotions · Power of Now · Wisdom Untethered',
        href: '/feelingsandemotioncourse',
      },
      {
        label: 'For Kids',
        sub: 'Let’s Be Our Best Every Day! (3-Day Challenge)',
        badge: 'NEW',
        href: '/tiny-kids-transformations',
      },
    ],
  },
  { label: 'Emotional health check', href: '/knowyouremotionalhealth' },
];

export default function NotFoundView() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Page not found — SKRM Bliss AI';

    // Flip robots to noindex. usePageSeo stamps an "index, follow" tag on the
    // shell; leaving it would keep every bad URL indexable.
    const robots = document.querySelector('meta[name="robots"]');
    const prevRobots = robots?.getAttribute('content') ?? null;
    if (robots) robots.setAttribute('content', 'noindex, follow');
    else {
      const m = document.createElement('meta');
      m.name = 'robots';
      m.content = 'noindex, follow';
      m.dataset.notFound = '1';
      document.head.appendChild(m);
    }

    return () => {
      document.title = prevTitle;
      if (robots && prevRobots) robots.setAttribute('content', prevRobots);
      else document.querySelector('meta[data-not-found="1"]')?.remove();
    };
  }, []);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg-base, #F4F1EA)',
        color: 'var(--text-primary, #241C33)',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        lineHeight: 1.6,
      }}
    >
      <div style={{ width: '100%', maxWidth: '34rem', textAlign: 'center' }}>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #5C5468)',
            margin: '0 0 1.25rem',
          }}
        >
          Error 404
        </p>

        <h1
          style={{
            fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
            lineHeight: 1.2,
            margin: '0 0 0.875rem',
          }}
        >
          This page has wandered off.
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted, #5C5468)',
            margin: '0 auto 2rem',
            maxWidth: '26rem',
          }}
        >
          The link may be out of date, or the address slightly different. Nothing is
          broken on your side — let&rsquo;s get you back.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              padding: '0.75rem 1.5rem',
              borderRadius: 999,
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'var(--accent-primary, #4A3260)',
              color: 'var(--bg-base, #F4F1EA)',
              border: '1.5px solid transparent',
            }}
          >
            Back to home
          </a>
          <a
            href="/mindgym"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              padding: '0.75rem 1.5rem',
              borderRadius: 999,
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              color: 'var(--text-primary, #241C33)',
              border: '1.5px solid var(--border-default, rgba(36,28,51,0.14))',
            }}
          >
            Open Mind Gym
          </a>
        </div>

        <nav
          aria-label="Other pages"
          style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-default, rgba(36,28,51,0.14))',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #5C5468)',
              margin: '0 0 0.75rem',
            }}
          >
            Or try one of these
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem 1.25rem',
              justifyContent: 'center',
            }}
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  color: 'var(--text-muted, #5C5468)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
