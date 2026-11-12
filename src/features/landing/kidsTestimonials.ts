// ─────────────────────────────────────────────────────────────────────────────
// Kids Mind Gym — Wall of Fame.
//
// Add one entry per real parent/child story and the "Wall of Fame" section on
// /tiny-kids-transformations appears automatically (it is hidden while this
// list is empty). Video stories show first as a row of portrait players; text
// stories follow as cards.
//
//   { name: 'Parent name', role: 'Mum of a 6-year-old', quote: '…' }
//   { name: '…', quote: '…', photo: '/marketing/kids/wall/name.webp' }
//   { name: '…', quote: '…', video: '/marketing/kids/wall/name.mp4', poster: '/marketing/kids/wall/name.jpg' }
// ─────────────────────────────────────────────────────────────────────────────

export interface KidsTestimonial {
  name: string;
  quote: string;
  /** e.g. "Mum of a 6-year-old · London" */
  role?: string;
  photo?: string;
  video?: string;
  poster?: string;
}

export const KIDS_TESTIMONIALS: KidsTestimonial[] = [];
