import type { NavLink } from './SiteChrome';

/**
 * THE site menu. It mirrors the three doors in catalog.ts (DOORS), so a visitor
 * sees the same three choices in the menu, on the home page and on /pricing:
 *   For me (Adult Mind Gym) · For my child (Kids Mind Gym) · Mantras & Music · Pricing
 * Courses live inside Adult Mind Gym, not as a separate item.
 * Pass `home: true` on the home page so in-page links scroll.
 */
export function siteNav({ home = false }: { home?: boolean } = {}): NavLink[] {
  const base = home ? '' : '/';
  return [
    {
      label: 'For me',
      subItems: [
        { label: 'Adult Mind Gym', sub: 'Practice, journal, every course, mantras and music', href: '/aboutmindgym' },
        { label: 'Feelings & Emotions course', sub: 'Included in Adult Mind Gym', href: '/feelingsandemotioncourse' },
        { label: 'Open the app', sub: 'Free to start', href: '/mindgym' },
      ],
    },
    { label: 'For my child', href: '/tiny-kids-transformations' },
    {
      label: 'Mantras & Music',
      href: '/mantras',
      subItems: [
        { label: 'Mantra Pass', sub: 'Lifetime ad-free chanting, 108 mala counter, puja sequences', href: '/mantras/lifetime-pass' },
        { label: 'Meditation Music Pass', sub: 'All meditation music for calm, sleep and deep practice', href: '/meditation-music/lifetime-pass', badge: 'NEW' },
        { label: 'Daily Sadhana', sub: 'Morning rituals, 21-day sankalp & sleep timer', href: '/mantras#begin' },
      ],
    },
    { label: 'Pricing', href: '/pricing' },
    {
      label: 'More',
      secondary: true,
      subItems: [
        { label: 'Free guides', sub: 'Articles and tools', href: `${base}#tools` },
        { label: 'Videos', sub: 'Watch on YouTube', href: `${base}#videos` },
        { label: 'About us', sub: 'Shruti Khungar & Sim Katyal', href: '/about-us' },
      ],
    },
  ];
}
