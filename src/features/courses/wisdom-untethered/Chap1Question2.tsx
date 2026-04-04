import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { DailyPracticeCard } from '../../practices/DailyPracticeCard';
import styles from './Chap1Question2.module.css';
import { useCourseTracking } from '../../../hooks/useCourseTracking';

const TOTAL_SLIDES = 10; // Total navigable sections

// --- Neon Banana SVG Components ---

const Infographic = ({ children, viewBox="0 0 400 400" }: { children: React.ReactNode, viewBox?: string }) => (
  <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1', display: 'block', overflow: 'visible' }}>
    <defs>
      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {children}
  </svg>
);

const SVG_COMPONENTS = [
  // 0: The Endless Narrator
  () => (
    <Infographic>
      <path d="M 200 350 C 120 350, 80 280, 80 220 C 80 140, 140 80, 200 80 C 260 80, 320 140, 320 220 C 320 280, 280 350, 200 350" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 8" opacity="0.6"/>
      {/* Chaotic loops representing internal monologue */}
      <path d="M 180 180 Q 300 100 240 220 T 120 160 T 260 200 T 170 240 T 150 140 T 250 190 T 180 180" fill="none" stroke="var(--gold)" strokeWidth="3" filter="url(#neonGlow)"/>
      <circle cx="200" cy="190" r="140" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE CONSTANT LOOP</text>
    </Infographic>
  ),
  // 1: Deep down, you're afraid
  () => (
    <Infographic>
      {/* Central glowing fear */}
      <circle cx="200" cy="200" r="25" fill="var(--gold)" filter="url(#neonGlow)"/>
      {/* Rigid geometric noise as defense */}
      <polygon points="200,60 320,130 280,270 120,270 80,130" fill="none" stroke="var(--text-primary)" strokeWidth="3" opacity="0.7"/>
      <polygon points="200,90 290,150 250,250 150,250 110,150" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6"/>
      <polygon points="200,120 260,170 230,230 170,230 140,170" fill="none" stroke="var(--text-primary)" strokeWidth="1" opacity="0.4"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE SHIELD OF NOISE</text>
    </Infographic>
  ),
  // 2: A Flawed Advisor
  () => (
    <Infographic>
      {/* Infinity loop / Ouroboros */}
      <path d="M 100 200 C 100 130, 180 150, 200 200 C 220 250, 300 270, 300 200 C 300 130, 220 150, 200 200 C 180 250, 100 270, 100 200" fill="none" stroke="var(--gold)" strokeWidth="4" filter="url(#neonGlow)"/>
      <circle cx="200" cy="200" r="10" fill="var(--bg-primary)" stroke="var(--text-primary)" strokeWidth="2" opacity="0.8"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">ANXIETY FEEDING ITSELF</text>
    </Infographic>
  ),
  // 3: One Root
  () => (
    <Infographic>
      {/* Glowing tap root */}
      <path d="M 200 350 L 200 250" stroke="var(--gold)" strokeWidth="8" filter="url(#neonGlow)"/>
      <circle cx="200" cy="350" r="12" fill="var(--gold)" filter="url(#neonGlow)"/>
      {/* Chaotic branches */}
      <path d="M 200 250 C 120 180, 80 120, 50 60" stroke="var(--text-primary)" strokeWidth="2" opacity="0.5"/>
      <path d="M 200 250 C 280 180, 320 120, 350 60" stroke="var(--text-primary)" strokeWidth="2" opacity="0.5"/>
      <path d="M 200 250 C 160 160, 140 100, 120 40" stroke="var(--text-primary)" strokeWidth="2" opacity="0.7"/>
      <path d="M 200 250 C 240 160, 260 100, 280 40" stroke="var(--gold)" strokeWidth="2" opacity="0.8"/>
      <path d="M 200 250 L 200 40" stroke="var(--gold)" strokeWidth="3" opacity="0.9" filter="url(#subtleGlow)"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">ONE ROOT, MANY BRANCHES</text>
    </Infographic>
  ),
  // 4: You cannot use mind to fix mind
  () => (
    <Infographic>
      {/* Impossible geometry / nested boxes */}
      <rect x="80" y="80" width="240" height="240" fill="none" stroke="var(--text-primary)" strokeWidth="1" strokeDasharray="10 10" opacity="0.4"/>
      <rect x="120" y="120" width="160" height="160" fill="none" stroke="var(--text-primary)" strokeWidth="2" opacity="0.6"/>
      <rect x="160" y="160" width="80" height="80" fill="none" stroke="var(--gold)" strokeWidth="4" filter="url(#neonGlow)"/>
      <path d="M 200 160 L 200 80 M 160 200 L 80 200 M 240 200 L 320 200 M 200 240 L 200 320" stroke="var(--gold)" strokeWidth="1.5" opacity="0.7"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">TRAPPED IN THE FRAME</text>
    </Infographic>
  ),
  // 5: The Listener
  () => (
    <Infographic>
      {/* Chaotic noise waves at the bottom */}
      <path d="M 40 280 Q 100 180, 160 290 T 260 240 T 360 300" fill="none" stroke="var(--text-primary)" strokeWidth="3" opacity="0.6"/>
      <path d="M 40 320 Q 120 230, 180 340 T 280 280 T 360 340" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.4"/>
      {/* The silent watcher floating above */}
      <circle cx="200" cy="120" r="30" fill="none" stroke="var(--gold)" strokeWidth="2"/>
      <circle cx="200" cy="120" r="12" fill="var(--gold)" filter="url(#neonGlow)"/>
      <path d="M 200 160 L 200 250" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">DISTANCE = PEACE</text>
    </Infographic>
  ),
  // 6: The Release
  () => (
    <Infographic>
      {/* Untangling lines */}
      <path d="M 50 200 C 150 200, 180 180, 200 200 C 220 220, 250 200, 350 200" fill="none" stroke="var(--gold)" strokeWidth="4" filter="url(#neonGlow)"/>
      <path d="M 50 170 C 150 170, 160 170, 200 170 C 240 170, 250 170, 350 170" fill="none" stroke="var(--gold)" strokeWidth="1.5" opacity="0.8"/>
      <path d="M 50 230 C 150 230, 160 230, 200 230 C 240 230, 250 230, 350 230" fill="none" stroke="var(--gold)" strokeWidth="1.5" opacity="0.8"/>
      <path d="M 50 140 L 350 140 M 50 260 L 350 260" stroke="var(--text-primary)" strokeWidth="1" strokeDasharray="10 10" opacity="0.3"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE GRIP LOOSENS</text>
    </Infographic>
  ),
  // 7: Meditation
  () => (
    <Infographic>
      {/* Concentric ripples */}
      <circle cx="200" cy="200" r="140" fill="none" stroke="var(--text-primary)" strokeWidth="0.5" opacity="0.3" strokeDasharray="5 5"/>
      <circle cx="200" cy="200" r="100" fill="none" stroke="var(--gold)" strokeWidth="1" opacity="0.5"/>
      <circle cx="200" cy="200" r="60" fill="none" stroke="var(--gold)" strokeWidth="2" filter="url(#neonGlow)"/>
      <circle cx="200" cy="200" r="20" fill="var(--gold)"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE STILL POINT</text>
    </Infographic>
  )
];

interface Chap1Question2Props {
  onOpenJournal?: () => void;
}

export function Chap1Question2({ onOpenJournal }: Chap1Question2Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateProgress } = useCourseTracking(user?.uid);

  // ── Scroll Tracking ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isNearBottom) {
        updateProgress('question2', { read: true });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [user?.uid, updateProgress]);
  const [activeSection, setActiveSection] = useState(0);

  // ── Lightbox state ──
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('[data-section]');
    const dotObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = parseInt(e.target.getAttribute('data-section') || '0', 10);
          setActiveSection(idx);
        }
      });
    }, { root: container, threshold: 0.5 });
    sections.forEach(s => dotObserver.observe(s));

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add(styles.visible); });
    }, { root: container, threshold: 0.12 });
    container.querySelectorAll(`.${styles.slideSection}, .${styles.practiceCard}`).forEach(s => fadeObserver.observe(s));

    return () => { dotObserver.disconnect(); fadeObserver.disconnect(); };
  }, []);

  const scrollToSection = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const section = container.querySelector(`[data-section="${index}"]`);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const goLightboxNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % SVG_COMPONENTS.length));
  };
  const goLightboxPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + SVG_COMPONENTS.length) % SVG_COMPONENTS.length));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') goLightboxNext();
        if (e.key === 'ArrowLeft') goLightboxPrev();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex]);

  const openLightbox = (index: number) => { setLightboxIndex(index); };

  const dots = Array.from({ length: TOTAL_SLIDES });

  return (
    <div
      className={styles.container}
      ref={containerRef}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <nav className={styles.navDots}>
        {dots.map((_, i) => (
          <button key={i} className={`${styles.navDot} ${activeSection === i ? styles.active : ''}`} aria-label={`Go to section ${i + 1}`} onClick={() => scrollToSection(i)} />
        ))}
      </nav>

      {/* --- SVG Lightbox --- */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)} role="dialog" aria-modal="true" aria-label="Image lightbox">
          <button className={styles.lightboxClose} onClick={() => setLightboxIndex(null)} aria-label="Close image">✕</button>
          <div className={styles.lightboxImg} onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: '800px', aspectRatio: '1/1' }}>
            {SVG_COMPONENTS[lightboxIndex]()}
          </div>
          <div className={styles.lightboxNav} onClick={e => e.stopPropagation()}>
            <button className={styles.lightboxNavBtn} onClick={goLightboxPrev} aria-label="Previous image">←</button>
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {SVG_COMPONENTS.length}
            </div>
            <button className={styles.lightboxNavBtn} onClick={goLightboxNext} aria-label="Next image">→</button>
          </div>
        </div>
      )}

      {/* ── SECTION 0: HERO ── */}
      <section className={styles.hero} data-section="0">
        <div className={styles.heroEyebrow}>Wisdom Untethered · Chapter 1 · Question 2</div>
        <h1 className={styles.heroTitle}>The Voice in Your Head<br /><strong>Is Not Trying to Help You</strong></h1>
        <div className={styles.heroDivider}></div>
        <p className={styles.heroSubtitle}>Why your mind keeps talking — and how to stop letting it run your life</p>
        <div className={styles.heroScroll}>Scroll to Begin</div>
      </section>

      {/* ── SECTION 1: INTRO ── */}
      <section className={styles.slideSection} data-section="1">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>01</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(0)}>
                   {SVG_COMPONENTS[0]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Question</span>
            <h2 className={styles.slideHeading}>The Endless <em>Narrator</em></h2>
            <p className={styles.visualText}>
              The mind is a constant narrator, generating unsolicited noise to give the illusion of control.
            </p>
            <p className={styles.slideBodySmall}>Log in to the app for the full deep-dive on these patterns.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE ROOT CAUSE ── */}
      <section className={styles.slideSection} data-section="2">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>02</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(1)}>
                  {SVG_COMPONENTS[1]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Deconstructing Anxiety</span>
            <h2 className={styles.slideHeading}>Deep down, you're <em>afraid</em></h2>
            <p className={styles.visualText}>
              Beneath the endless mental chatter lies a singular, hidden fear: that unless you analyze everything, you will not be okay.
            </p>
            <p className={styles.slideBodySmall}>Explore the "Grip of Fear" module in our premium journey.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE ENGINE ── */}
      <section className={styles.slideSection} data-section="3">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>03</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(2)}>
                  {SVG_COMPONENTS[2]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Deception</span>
            <h2 className={styles.slideHeading}>A <em>Flawed</em> Advisor</h2>
            <p className={styles.visualText}>
              You cannot ask an anxious mind to cure its own anxiety. Consulting the noise only multiplies the noise.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ONE ROOT ── */}
      <section className={styles.slideSection} data-section="4">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>04</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(3)}>
                 {SVG_COMPONENTS[3]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Mechanics</span>
            <h2 className={styles.slideHeading}>One Root,<br/><em>Ten Thousand</em> Faces</h2>
            <p className={styles.visualText}>
              Every distraction, worry, and spiraling thought stems from a single root: your willingness to identify with the voice.
            </p>
            <p className={styles.slideBodySmall}>Detailed "Watching" exercises available in Chapter 1.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: YOU CANNOT FIX THE MIND ── */}
      <section className={`${styles.slideSection} ${styles.matrixBand}`} data-section="5">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>05</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(4)}>
                  {SVG_COMPONENTS[4]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Shift</span>
            <h2 className={styles.slideHeading}>You Cannot Use the Mind<br />to Fix <em>the Mind</em></h2>
            <p className={styles.visualText}>
              To truly step free of the loop, you must step entirely outside the frame of your own thoughts.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: THE LISTENER ── */}
      <section className={`${styles.slideSection} ${styles.gripBand}`} data-section="6">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>06</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(5)}>
                  {SVG_COMPONENTS[5]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Analogy</span>
            <h2 className={styles.slideHeading}>You Are the <em>Listener</em>.<br />Not the Radio.</h2>
            <p className={styles.visualText}>
              You are not the voice generating the static. You are the vast, silent awareness witnessing it. Distance is peace.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: THE RELEASE ── */}
      <section className={styles.slideSection} data-section="7">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>07</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(6)}>
                  {SVG_COMPONENTS[6]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Release</span>
            <h2 className={styles.slideHeading}>The <em>Grip</em> Loosens</h2>
            <p className={styles.visualText}>
              When you stop feeding the loop with your energy and attention, the mind's tight grip gracefully dissolves on its own.
            </p>
            <p className={styles.slideBodySmall}>Sign in for daily "Watcher" journal prompts.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 8: DAILY PRACTICE --- */}
      <section className={styles.slideSection} data-section="8">
        <div className={styles.slideWrapper}>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Practice</span>
            <h2 className={styles.slideHeading}>Notice the Noise.<br /><em>Become the Watcher.</em></h2>
            <p className={styles.visualText}>
              Commit to this 2-minute "Radio Check" to distance yourself from the internal monologue.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <DailyPracticeCard 
              questionId="question2" 
              userId={user?.uid} 
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 9: GUIDED MEDITATION ── */}
      <section className={styles.slideSection} data-section="9">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>08</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(7)}>
                  {SVG_COMPONENTS[7]()}
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Guided Meditation (~90 seconds)</span>
            <h2 className={styles.slideHeading}>Restoring the <em>Watcher</em></h2>
            <p className={styles.slideBody}>Close your eyes if you're somewhere you can. Take one slow breath in. And let it go.</p>
            <p className={styles.slideBody}>Now just notice — what is the mind currently saying? What thought is waiting for your attention right now?</p>
            <p className={styles.slideBody}>Don't answer it. Don't follow it. Just see it — the way you'd see a cloud from a window.</p>
            <p className={styles.slideBody}>Now ask yourself: who is noticing this? There is something in you that is watching. That has always been watching. Not the voice. Not the doubt. Not the fear. The one noticing all of it.</p>
            <p className={styles.slideBody}>Rest there for a moment.</p>
            <p className={styles.slideBody}>The voice may keep talking. That's fine. You don't have to go with it. You are the one who is aware. And that one — has always been perfectly still.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: CLOSING ── */}
      <section className={styles.closing} data-section="10">
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow}>End of Chapter 1 · Question 2</p>
          <h2 className={styles.closingTitle}>You Are Not<br />the Radio</h2>
          <button className={styles.closingJournal} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}

