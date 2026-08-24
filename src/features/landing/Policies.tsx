import { useEffect } from 'react';
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { usePageView } from '../../lib/analytics';

const CONTACT_EMAIL = 'connect@skrmblissai.in';
const WHATSAPP_HUMAN = '+91 82175 81238';
const LAST_UPDATED = 'July 5, 2026';

export default function Policies() {
  usePageSeo({
    title: 'Privacy, Terms & Refund Policy — Soulful Intelligence Studio',
    description:
      'Privacy policy, terms of service and refund policy for Soulful Intelligence Studio — Mind Gym, guided courses and digital services.',
    url: 'https://www.skrmblissai.in/policies',
  });

  usePageView('PAGE_VISIT_POLICIES');

  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, []);

  const { palette, toggle: toggleTheme } = useSiteTheme();
  const SERIF = "'Cormorant Garamond', Georgia, serif";
  const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

  const isDark = palette.isDark;
  const pageBg = palette.BG;
  const cardBg = isDark ? '#161220' : '#FFFFFF';
  const ink = palette.INK;
  const inkSub = palette.INK2;
  const borderC = palette.BORDER;
  const goldAccent = isDark ? '#E5C158' : '#6B5238';
  const highlightBg = isDark ? 'rgba(229, 193, 88, 0.08)' : 'rgba(107, 82, 56, 0.05)';
  const highlightBorder = isDark ? 'rgba(229, 193, 88, 0.25)' : 'rgba(107, 82, 56, 0.2)';

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: pageBg, color: ink }}>
      <SiteBackdrop />
      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[
          { label: 'Home', href: '/' },
          {
            label: 'Courses',
            subItems: [
              {
                label: 'Feelings & Emotions',
                sub: '7-Episode Guided Course',
                href: '/feelingsandemotioncourse',
              },
              {
                label: 'Power of Now',
                sub: 'Coming Soon',
                href: '#',
              },
              {
                label: 'Wisdom Untethered',
                sub: 'Coming Soon',
                href: '#',
              },
              {
                label: 'For Kids',
                sub: 'Let’s Be Our Best Every Day! (3-Day Challenge)',
                badge: 'NEW',
                href: '/tiny-kids-transformations',
              },
            ],
          },
        ]}
        cta={{ label: 'Back to course', href: '/feelingsandemotioncourse' }}
      />

      {/* Main Container with generous max-width and outer padding */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Top Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <a
              href="/feelingsandemotioncourse"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: goldAccent,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={15} /> Back to Course
            </a>
          </div>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: goldAccent,
              display: 'block',
              marginBottom: 6,
            }}
          >
            Legal &amp; Customer Protection
          </span>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 600,
              lineHeight: 1.15,
              margin: '0 0 10px',
              color: ink,
            }}
          >
            Privacy, Terms &amp; Refund Policy
          </h1>
          <p style={{ fontSize: 14, color: inkSub, margin: 0 }}>
            Soulful Intelligence Studio &amp; Mind Gym &nbsp;·&nbsp; Effective {LAST_UPDATED}
          </p>

          {/* Jump Navigation Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
            <a
              href="#refund"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                background: cardBg,
                border: `1px solid ${borderC}`,
                color: ink,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ShieldCheck size={15} style={{ color: goldAccent }} /> 100% Refund Policy
            </a>
            <a
              href="#privacy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                background: cardBg,
                border: `1px solid ${borderC}`,
                color: ink,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Lock size={15} style={{ color: goldAccent }} /> Privacy Policy
            </a>
            <a
              href="#terms"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                background: cardBg,
                border: `1px solid ${borderC}`,
                color: ink,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <FileText size={15} style={{ color: goldAccent }} /> Terms of Service
            </a>
          </div>
        </div>

        {/* Section 1: Refund Policy */}
        <section
          id="refund"
          style={{
            scrollMarginTop: 100,
            background: cardBg,
            border: `1px solid ${borderC}`,
            borderRadius: 20,
            padding: '32px 28px',
            marginBottom: 28,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(74,50,96,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: highlightBg,
                border: `1px solid ${highlightBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} style={{ color: goldAccent }} />
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, margin: 0, color: ink }}>
              Refund Policy
            </h2>
          </div>

          <div
            style={{
              background: highlightBg,
              border: `1px solid ${highlightBorder}`,
              borderRadius: 14,
              padding: '18px 20px',
              marginBottom: 20,
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: ink }}>
              🛡️ 100% Money-Back Guarantee — Anytime, No Questions Asked.
            </p>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: inkSub, margin: 0 }}>
              If the course doesn&apos;t resonate with you for any reason, simply let us know and we will refund you in full.
              There are no complex forms to fill and no justification needed.
            </p>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10, color: ink }}>
            How to Request Your Refund
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            Email us or send a direct message on WhatsApp with the email address you used to purchase:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 12,
                background: pageBg,
                border: `1px solid ${borderC}`,
                textDecoration: 'none',
                color: ink,
              }}
            >
              <Mail size={18} style={{ color: goldAccent, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: inkSub, display: 'block' }}>
                  Email Support
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{CONTACT_EMAIL}</span>
              </div>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_HUMAN.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 12,
                background: pageBg,
                border: `1px solid ${borderC}`,
                textDecoration: 'none',
                color: ink,
              }}
            >
              <MessageSquare size={18} style={{ color: goldAccent, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: inkSub, display: 'block' }}>
                  WhatsApp Support
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{WHATSAPP_HUMAN}</span>
              </div>
            </a>
          </div>

          <p style={{ fontSize: 13.5, color: inkSub, marginTop: 16, lineHeight: 1.6 }}>
            We will confirm and process your refund directly to your original payment method, typically within 5–7 business days
            (bank/card processing times may vary).
          </p>
        </section>

        {/* Section 2: Privacy Policy */}
        <section
          id="privacy"
          style={{
            scrollMarginTop: 100,
            background: cardBg,
            border: `1px solid ${borderC}`,
            borderRadius: 20,
            padding: '32px 28px',
            marginBottom: 28,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(74,50,96,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: highlightBg,
                border: `1px solid ${highlightBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={20} style={{ color: goldAccent }} />
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, margin: 0, color: ink }}>
              Privacy Policy
            </h2>
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            We deeply respect your personal privacy. We collect only what is strictly necessary to deliver the course, manage your access, and support your journey.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: ink }}>What We Collect</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            Your name, email address, optional phone/WhatsApp number for updates, and basic platform usage data. Payments are processed securely via PCI-DSS compliant gateways (Razorpay &amp; PayPal); we never view or store your full card details.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: ink }}>How We Use Your Data</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            To grant your course access, send guided episode notifications, respond to support inquiries, and continuously improve Mind Gym. We <strong>never</strong> sell or rent your personal information to third parties.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: ink }}>Trusted Service Providers</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            Information is shared only with verified service infrastructure required to operate our studio (e.g. Firebase hosting, email dispatch, and payment processors) strictly under confidentiality.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: ink }}>Your Choices &amp; Rights</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: 0 }}>
            You can unsubscribe from non-essential emails at any time. You may also request to view or delete your stored user record by emailing <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: goldAccent, fontWeight: 600, textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        {/* Section 3: Terms of Service */}
        <section
          id="terms"
          style={{
            scrollMarginTop: 100,
            background: cardBg,
            border: `1px solid ${borderC}`,
            borderRadius: 20,
            padding: '32px 28px',
            marginBottom: 28,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(74,50,96,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: highlightBg,
                border: `1px solid ${highlightBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} style={{ color: goldAccent }} />
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, margin: 0, color: ink }}>
              Terms of Service
            </h2>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8, color: ink }}>Your Access Grant</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            Upon successful enrollment, you receive a personal, non-exclusive, non-transferable license to access the Feelings &amp; Emotions Course and Mind Gym materials for your personal growth.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: ink }}>Fair Use &amp; Intellectual Property</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            All course videos, guided audio tracks, PDFs, and written materials are the intellectual property of Shruti Khungar, Sim Katyal, and Soulful Intelligence Studio. Redistribution, public sharing, or reselling is strictly prohibited.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: ink }}>Not Medical or Therapeutic Advice</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
            Our courses and somatic practices are designed for self-discovery, emotional awareness, and general wellbeing. They do not constitute licensed medical, clinical, or psychiatric therapy. If you are experiencing acute distress, please consult a qualified healthcare provider.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: ink }}>Governing Law &amp; Support</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: inkSub, margin: 0 }}>
            These terms are governed by the laws of India. For any questions or official inquiries, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: goldAccent, fontWeight: 600, textDecoration: 'underline' }}>{CONTACT_EMAIL}</a> or WhatsApp <span style={{ fontWeight: 600, color: ink }}>{WHATSAPP_HUMAN}</span>.
          </p>
        </section>
      </main>

      <SiteFooter palette={palette} />
    </div>
  );
}
