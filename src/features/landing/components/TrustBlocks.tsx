/**
 * TrustBlocks.tsx
 * Small, plain sections that help a visitor decide: where to begin, whether
 * this is for them, what is checkable about us, who to write to, and what
 * other people say.
 *
 * Testimonials renders nothing until real quotes are added to TESTIMONIALS.
 * That is deliberate: an empty list is invisible, a made-up one is a lie.
 */
import type { Palette } from '../../../lib/siteTheme';
import { track } from '../../../lib/analytics';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

export const CONTACT_EMAIL = 'connect@skrmblissai.in';
const WHATSAPP_HUMAN = 'https://wa.me/918217581238';

/** Real quotes only. Add { quote, name, detail } and the section appears. */
export interface Testimonial { quote: string; name: string; detail?: string }
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'This course helped me understand my emotions instead of feeling overwhelmed by them. I feel more aware of my reactions and myself.',
    name: 'Ananya Sharma',
    detail: 'Feelings & Emotions course',
  },
  {
    quote: 'I’ve started recognising emotional patterns I never noticed before. The lessons have given me a new perspective on understanding myself.',
    name: 'Rohan Mehta',
    detail: 'Feelings & Emotions course',
  },
  {
    quote: 'A beautiful journey of self-discovery. I’ve learned to acknowledge my feelings with more compassion and respond with greater awareness.',
    name: 'Priya Nair',
    detail: 'Feelings & Emotions course',
  },
];

function shell(p: Palette) {
  const accent = p.isDark ? '#C4913A' : '#7A5F44';
  return {
    accent,
    card: p.isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
    border: p.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(74,50,96,0.14)',
    eyebrow: {
      fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: '0.22em',
      textTransform: 'uppercase' as const, color: accent, display: 'block', marginBottom: 14,
    },
    h2: {
      fontFamily: SANS, fontWeight: 500, fontSize: 'clamp(28px, 4vw, 46px)',
      letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px', color: p.INK,
    },
    body: { fontFamily: SANS, fontSize: 16, lineHeight: 1.7, color: p.INK2, margin: '0 0 14px' },
    wrap: { maxWidth: 1000, margin: '0 auto', padding: 'clamp(48px, 7vw, 88px) 24px' },
  };
}

/** Free first step, then the course, then a private conversation. */
export function WhereToBegin({ palette }: { palette: Palette }) {
  const t = shell(palette);
  const steps = [
    { n: '1', img: '/marketing/begin-free.webp', alt: 'An open door in a vine-covered arch, with a path leading into warm morning light', title: 'Try it free', body: 'Mind Gym is a daily space for breathing, presence and emotional check-ins. No payment needed.', href: '/mindgym', cta: 'Open Mind Gym →' },
    { n: '2', img: '/marketing/begin-course.webp', alt: 'A stone path winding up a hillside toward a glowing sunrise', title: 'Go deeper, at your pace', body: 'Understanding Feelings & Emotions is a 7-episode guided course on recognising and changing your patterns.', href: '/feelingsandemotioncourse', cta: 'See the course →' },
    { n: '3', img: '/marketing/begin-1to1.webp', alt: 'Two empty armchairs facing each other beside a small table with tea and a candle', title: 'Talk to Sim', body: 'A private 1:1 conversation about your own patterns, when you want guidance that is just for you.', href: '/twinsouls/simkatyal', cta: 'About 1:1 sessions →' },
  ];
  return (
    <section aria-labelledby="where-to-begin" style={t.wrap}>
      <span style={t.eyebrow}>Where to begin</span>
      <h2 id="where-to-begin" style={t.h2}>Three ways in. Start wherever feels right.</h2>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 28 }}>
        {steps.map((s) => (
          <a key={s.n} href={s.href} onClick={() => track('WHERE_TO_BEGIN_' + s.n)} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 20, textDecoration: 'none', background: t.card, border: `1px solid ${t.border}` }}>
            <img src={s.img} alt={s.alt} loading="lazy" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', objectPosition: 'left center', display: 'block' }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 26 }}>
            <span style={{ fontFamily: SERIF, fontSize: 32, color: t.accent, opacity: 0.7 }}>{s.n}</span>
            <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, margin: '6px 0 8px', color: palette.INK }}>{s.title}</h3>
            <p style={{ ...t.body, fontSize: 15, flex: 1 }}>{s.body}</p>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: palette.PURPLE_STRONG }}>{s.cta}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/** A filter, in plain words. The "not for you" half is what makes it credible. */
export function IsThisForYou({ palette }: { palette: Palette }) {
  const t = shell(palette);
  const yes = [
    'You keep meeting the same emotional or relationship patterns.',
    'You overthink, and quiet never quite arrives.',
    'You have read the books and still feel something is unfinished.',
    'You want a practice you can keep, not a burst of motivation.',
  ];
  const no = [
    'You want a quick fix or a guaranteed outcome.',
    'You are looking for medical or psychological treatment. Please see a doctor or therapist.',
    'You would rather be told what to think than look at your own patterns.',
  ];
  return (
    <section aria-labelledby="is-this-for-you" style={t.wrap}>
      <span style={t.eyebrow}>Is this right for you?</span>
      <h2 id="is-this-for-you" style={t.h2}>An honest way to decide.</h2>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 28 }}>
        {[{ h: 'This is for you if', list: yes }, { h: 'This is not for you if', list: no }].map((col) => (
          <div key={col.h} style={{ padding: 26, borderRadius: 20, background: t.card, border: `1px solid ${t.border}` }}>
            <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 17, margin: '0 0 12px', color: palette.INK }}>{col.h}</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
              {col.list.map((x) => (
                <li key={x} style={{ ...t.body, fontSize: 15, margin: 0, paddingLeft: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: t.accent }}>·</span>{x}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Only facts that can be checked on this site. No adjectives. */
export function AtAGlance({ palette }: { palette: Palette }) {
  const t = shell(palette);
  const facts = [
    { n: '7', label: 'episodes in the Feelings & Emotions course' },
    { n: '10+', label: 'years of study and practice behind Sim’s work' },
    { n: '20+', label: 'years of enterprise product engineering behind Shruti’s' },
    { n: '14', label: 'day refund on anything you pay for' },
  ];
  return (
    <section aria-label="At a glance" style={{ ...t.wrap, paddingTop: 0 }}>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {facts.map((f) => (
          <div key={f.label} style={{ padding: '8px 4px' }}>
            <div style={{ fontFamily: SERIF, fontSize: 44, color: palette.INK, lineHeight: 1 }}>{f.n}</div>
            <div style={{ ...t.body, fontSize: 14, margin: '8px 0 0' }}>{f.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** A direct line to a person. No reply-time promise until one can be kept. */
export function ContactBlock({ palette, whatsappText }: { palette: Palette; whatsappText?: string }) {
  const t = shell(palette);
  const wa = whatsappText ? `${WHATSAPP_HUMAN}?text=${encodeURIComponent(whatsappText)}` : WHATSAPP_HUMAN;
  return (
    <section aria-labelledby="contact-us" style={{ ...t.wrap, textAlign: 'center', maxWidth: 720 }}>
      <span style={t.eyebrow}>Get in touch</span>
      <h2 id="contact-us" style={t.h2}>Write to us, and a person will read it.</h2>
      <p style={t.body}>
        Share where you are and what you are ready to shift. Questions about a course, a session or a project are all welcome.
      </p>
      <p style={{ ...t.body, marginTop: 8 }}>
        <a href={`mailto:${CONTACT_EMAIL}`} onClick={() => track('CONTACT_EMAIL')} style={{ color: palette.PURPLE_STRONG, fontWeight: 600 }}>{CONTACT_EMAIL}</a>
        {' · '}
        <a href={wa} onClick={() => track('CONTACT_WHATSAPP')} style={{ color: palette.PURPLE_STRONG, fontWeight: 600 }}>WhatsApp</a>
      </p>
    </section>
  );
}

/** Invisible until TESTIMONIALS has real entries. */
export function Testimonials({ palette }: { palette: Palette }) {
  if (TESTIMONIALS.length === 0) return null;
  const t = shell(palette);
  return (
    <section aria-labelledby="testimonials" style={t.wrap}>
      <span style={t.eyebrow}>In their words</span>
      <h2 id="testimonials" style={t.h2}>What people say.</h2>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 24 }}>
        {TESTIMONIALS.map((q) => (
          <figure key={q.name} style={{ margin: 0, padding: 26, borderRadius: 20, background: t.card, border: `1px solid ${t.border}` }}>
            <blockquote style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.5, color: palette.INK, margin: '0 0 14px', fontStyle: 'italic' }}>
              “{q.quote}”
            </blockquote>
            <figcaption style={{ fontFamily: SANS, fontSize: 13.5, color: palette.INK2 }}>
              {q.name}{q.detail ? `, ${q.detail}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export interface FaqItem { q: string; a: string }

/**
 * Objection-handling in plain words. Native <details>, so it works with a
 * keyboard and a screen reader and needs no script. The same questions are
 * published as FAQPage structured data, which must match what is on screen.
 */
export function Faq({ palette, items, heading = 'Questions people ask' }: { palette: Palette; items: FaqItem[]; heading?: string }) {
  const t = shell(palette);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
  return (
    <section aria-labelledby="faq-heading" style={{ ...t.wrap, maxWidth: 800 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <span style={t.eyebrow}>Before you decide</span>
      <h2 id="faq-heading" style={t.h2}>{heading}</h2>
      <div style={{ marginTop: 20 }}>
        {items.map((i) => (
          <details key={i.q} style={{ borderTop: `1px solid ${t.border}`, padding: '4px 0' }}>
            <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '16px 0', fontFamily: SANS, fontWeight: 600, fontSize: 17, color: palette.INK, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              {i.q}
              <span aria-hidden="true" style={{ color: t.accent, flexShrink: 0 }}>+</span>
            </summary>
            <p style={{ ...t.body, margin: '0 0 18px', maxWidth: 680 }}>{i.a}</p>
          </details>
        ))}
        <div style={{ borderTop: `1px solid ${t.border}` }} />
      </div>
    </section>
  );
}
