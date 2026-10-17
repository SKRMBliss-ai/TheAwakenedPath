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

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

export const CONTACT_EMAIL = 'connect@skrmblissai.in';
const WHATSAPP_HUMAN = 'https://wa.me/918217581238';

/** Real quotes only. Add { quote, name, detail } and the section appears. */
export interface Testimonial { quote: string; name: string; detail?: string }
export const TESTIMONIALS: Testimonial[] = [];

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
    { n: '1', title: 'Try it free', body: 'Mind Gym is a daily space for breathing, presence and emotional check-ins. No payment needed.', href: '/mindgym', cta: 'Open Mind Gym →' },
    { n: '2', title: 'Go deeper, at your pace', body: 'Understanding Feelings & Emotions is a 7-episode guided course on recognising and changing your patterns.', href: '/feelingsandemotioncourse', cta: 'See the course →' },
    { n: '3', title: 'Talk to Sim', body: 'A private 1:1 conversation about your own patterns, when you want guidance that is just for you.', href: '/twinsouls/simkatyal', cta: 'About 1:1 sessions →' },
  ];
  return (
    <section aria-labelledby="where-to-begin" style={t.wrap}>
      <span style={t.eyebrow}>Where to begin</span>
      <h2 id="where-to-begin" style={t.h2}>Three ways in. Start wherever feels right.</h2>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 28 }}>
        {steps.map((s) => (
          <a key={s.n} href={s.href} style={{ display: 'flex', flexDirection: 'column', padding: 26, borderRadius: 20, textDecoration: 'none', background: t.card, border: `1px solid ${t.border}` }}>
            <span style={{ fontFamily: SERIF, fontSize: 32, color: t.accent, opacity: 0.7 }}>{s.n}</span>
            <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, margin: '6px 0 8px', color: palette.INK }}>{s.title}</h3>
            <p style={{ ...t.body, fontSize: 15, flex: 1 }}>{s.body}</p>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: palette.PURPLE_STRONG }}>{s.cta}</span>
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
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: palette.PURPLE_STRONG, fontWeight: 600 }}>{CONTACT_EMAIL}</a>
        {' · '}
        <a href={wa} style={{ color: palette.PURPLE_STRONG, fontWeight: 600 }}>WhatsApp</a>
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
