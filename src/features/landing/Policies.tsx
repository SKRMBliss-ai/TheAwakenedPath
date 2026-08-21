import { useEffect } from 'react';
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';

// ─────────────────────────────────────────────────────────────────────────────
// Standalone policy pages — Privacy, Terms, Refund — rendered at /policies
// (with #privacy / #terms / #refund anchors). Same standalone-route pattern as
// the marketing pages: no auth/theme providers. Linked from the course footer
// so the sales page reads as a real, accountable business.
//
// NOTE: this is a clear, reasonable starting template. Review the business/legal
// specifics (registered entity name, jurisdiction, processing timelines) before
// relying on it — it is not a substitute for legal advice.
// ─────────────────────────────────────────────────────────────────────────────

const SERIF = "'Cormorant Garamond', Georgia, serif";
const GOLD_TEXT = '#6B5238';
const TAN_BORDER = 'border border-[#8B7355]/35';
const CREAM = '#F5F0E4';
const INK = '#2A2420';
const INK_SECONDARY = '#4E4438';
const TEAL = '#8C7B8A';

const CONTACT_EMAIL = 'connect@skrmblissai.in';
const WHATSAPP_HUMAN = '+91 82175 81238';
const LAST_UPDATED = 'July 5, 2026';

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <section id={id} className={`scroll-mt-24 py-10 border-b ${TAN_BORDER}`}>
        <h2 className="text-[clamp(24px,4vw,34px)] font-semibold tracking-tight mb-6" style={{ fontFamily: SERIF, color: INK }}>
            {title}
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed font-medium" style={{ color: INK_SECONDARY }}>
            {children}
        </div>
    </section>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-bold mt-5 mb-1" style={{ color: INK }}>{children}</h3>
);

export default function Policies() {
    // Without this the prerendered page inherits the shell's title/description,
    // making /policies a duplicate of the home page in Google's eyes.
    usePageSeo({
        title: 'Privacy, Terms & Refund Policy — Soulful Intelligence Studio',
        description:
            'Privacy policy, terms of service and refund policy for Soulful Intelligence Studio — Mind Gym, guided courses and digital services.',
        url: 'https://www.skrmblissai.in/policies',
    });

    useEffect(() => {
        // Standalone pages don't auto-scroll to the hash reliably before render,
        // so nudge it once the content is mounted.
        const id = window.location.hash.replace('#', '');
        if (id) {
            const el = document.getElementById(id);
            if (el) setTimeout(() => el.scrollIntoView({ behavior: 'auto', block: 'start' }), 60);
        }
    }, []);

    const { palette, toggle: toggleTheme } = useSiteTheme();
    const bg = palette.isDark ? '#0D0A12' : CREAM;

    return (
        <div className="min-h-screen w-full antialiased" style={{ fontFamily: "'Outfit', system-ui, -apple-system, sans-serif", background: bg, color: palette.INK }}>
            <SiteHeader
                palette={palette}
                onToggleTheme={toggleTheme}
                links={[
                    { label: 'Home', href: '/' },
                    { label: 'Course', href: '/feelingsandemotioncourse' },
                ]}
                cta={{ label: 'Back to course', href: '/feelingsandemotioncourse' }}
            />

            <main className="max-w-2xl mx-auto px-6 py-12">
                <p className="text-[11px] uppercase tracking-[0.22em] font-bold mb-2" style={{ color: GOLD_TEXT }}>
                    Legal &amp; Policies
                </p>
                <h1 className="text-[clamp(28px,5vw,44px)] font-semibold tracking-tight mb-2" style={{ fontFamily: SERIF, color: INK }}>
                    Our Policies
                </h1>
                <p className="text-sm font-semibold mb-4" style={{ color: INK_SECONDARY }}>
                    Mind Gym · Emotion &amp; Feelings Course &nbsp;·&nbsp; Last updated {LAST_UPDATED}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-bold uppercase tracking-wide mb-4" style={{ color: TEAL }}>
                    <a href="#privacy" className="hover:opacity-70">Privacy</a>
                    <a href="#terms" className="hover:opacity-70">Terms</a>
                    <a href="#refund" className="hover:opacity-70">Refunds</a>
                </div>

                <Section id="refund" title="Refund Policy">
                    <p className="text-base font-bold" style={{ color: INK }}>
                        100% money-back guarantee — anytime, no questions asked.
                    </p>
                    <p>
                        If the course doesn&apos;t resonate with you, for any reason, simply tell us and we&apos;ll refund
                        you in full. There are no forms to fill and no justification needed.
                    </p>
                    <H3>How to request a refund</H3>
                    <p>
                        Email us at <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline" style={{ color: TEAL }}>{CONTACT_EMAIL}</a>{' '}
                        or message us on WhatsApp at <span className="font-bold" style={{ color: INK }}>{WHATSAPP_HUMAN}</span> with the
                        email address you used to purchase. We&apos;ll confirm and process your refund to your original
                        payment method, typically within 5–7 business days (bank/card processing times may vary).
                    </p>
                </Section>

                <Section id="privacy" title="Privacy Policy">
                    <p>
                        We respect your privacy and collect only what we need to run the course and support you.
                    </p>
                    <H3>What we collect</H3>
                    <p>
                        Your email address (when you join the list or purchase), basic usage information, and — for
                        purchases — the details needed to process payment. Payments are handled by our payment provider
                        (Razorpay); we do not see or store your full card details.
                    </p>
                    <H3>How we use it</H3>
                    <p>
                        To deliver the course and your access, respond to your questions, send you course-related updates,
                        and occasionally share relevant news. We do <span className="font-bold" style={{ color: INK }}>not</span> sell
                        your personal data.
                    </p>
                    <H3>Who we share it with</H3>
                    <p>
                        Only trusted service providers who help us operate — for example our payment processor (Razorpay)
                        and email delivery tools — and only to the extent needed to provide the service.
                    </p>
                    <H3>Your choices</H3>
                    <p>
                        You can unsubscribe from emails at any time, and you can ask us to access or delete your data by
                        emailing <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline" style={{ color: TEAL }}>{CONTACT_EMAIL}</a>.
                    </p>
                </Section>

                <Section id="terms" title="Terms of Service">
                    <H3>Your access</H3>
                    <p>
                        On successful payment you receive access to the Emotion &amp; Feelings Course for your personal,
                        non-commercial use. Access is provided for the lifetime of the course, subject to ongoing platform
                        availability.
                    </p>
                    <H3>Fair use</H3>
                    <p>
                        Please don&apos;t share your login, redistribute, resell, or publicly post the course videos or
                        materials. The content remains the property of Mind Gym and its creators.
                    </p>
                    <H3>Not medical advice</H3>
                    <p>
                        This course is for education and personal wellbeing. It is not a substitute for professional
                        medical, psychological, or therapeutic advice. If you are in distress, please seek qualified help.
                    </p>
                    <H3>Liability</H3>
                    <p>
                        The course is provided &quot;as is.&quot; To the extent permitted by law, our liability is limited to
                        the amount you paid for the course. These terms are governed by the laws of India.
                    </p>
                    <H3>Contact</H3>
                    <p>
                        Questions about these terms? Email{' '}
                        <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline" style={{ color: TEAL }}>{CONTACT_EMAIL}</a>{' '}
                        or WhatsApp <span className="font-bold" style={{ color: INK }}>{WHATSAPP_HUMAN}</span>.
                    </p>
                </Section>

                <p className="text-xs mt-8 font-medium" style={{ color: INK_SECONDARY }}>
                    Mind Gym · skrmblissai.in · {CONTACT_EMAIL}
                </p>
            </main>

            <SiteFooter palette={palette} />
        </div>
    );
}
