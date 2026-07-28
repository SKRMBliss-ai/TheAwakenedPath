import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// usePageSeo — set <title>, meta description, Open Graph + Twitter cards, a
// canonical link, and (optionally) a JSON-LD block for a client-rendered SPA
// route. Every node is tagged data-seo-dynamic and cleaned up on unmount so
// routes don't leak each other's tags. Fixes broken social link previews and
// gives JS-rendering crawlers real titles/descriptions.
// (True crawl-time SEO still wants prerendering — this is the client-side layer.)
// ─────────────────────────────────────────────────────────────────────────────

export interface PageSeo {
  title: string;
  description: string;
  url: string;
  image?: string;
  /** Optional schema.org object or array rendered as <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function usePageSeo({ title, description, url, image, jsonLd }: PageSeo) {
  // Serialize jsonLd so the effect only re-runs when its content actually changes.
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const meta = (key: 'name' | 'property', val: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${val}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(key, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
      el.dataset.seoDynamic = '1';
    };

    meta('name', 'description', description);
    meta('property', 'og:type', 'website');
    meta('property', 'og:title', title);
    meta('property', 'og:description', description);
    meta('property', 'og:url', url);
    meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    meta('name', 'twitter:title', title);
    meta('name', 'twitter:description', description);
    if (image) {
      meta('property', 'og:image', image);
      meta('name', 'twitter:image', image);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;
    canonical.dataset.seoDynamic = '1';

    if (jsonLdStr) {
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.dataset.seoDynamic = '1';
      ld.text = jsonLdStr;
      document.head.appendChild(ld);
    }

    return () => {
      document.title = prevTitle;
      document.head.querySelectorAll('[data-seo-dynamic="1"]').forEach((n) => n.remove());
    };
  }, [title, description, url, image, jsonLdStr]);
}
