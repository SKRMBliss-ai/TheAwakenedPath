import { useEffect, useRef, useState } from 'react';
import styles from './Chap1Question2.module.css';

const TOTAL_SLIDES = 11;

const ALL_SLIDES = [
  "A Flawed Advisor",
  "Deep down, you're afraid",
  "A Flawed Advisor",
  "One Root",
  "Youcannotuseurmindtofixyourmind",
  "Radio",
  "The Release",
  "Gm"
];

const slideImagePaths: Record<string, string> = {
  "A Flawed Advisor": "A Flawed Advisor",
  "Deep down, you're afraid": "Deep down, you're afraid",
  "One Root": "OneRoot",
  "Youcannotuseurmindtofixyourmind": "Youcannotuseurmindtofixyourmind",
  "Radio": "Radio",
  "The Release": "The Release",
  "Gm": "Gm"
};

interface Chap1Question2Props {
  onOpenJournal?: () => void;
}

export function Chap1Question2({ onOpenJournal }: Chap1Question2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // ── Theme detection ──
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const isD = document.documentElement.classList.contains('dark') || 
                  document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(isD);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  // ── Lightbox state ──
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Track scroll for progress bar
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollY = container.scrollTop;
      const height = container.scrollHeight - container.clientHeight;
      setScrollProgress(height > 0 ? (scrollY / height) * 100 : 0);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observers for animations and dot navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add(styles.visible); });
    }, { root: container, threshold: 0.12 });

    container.querySelectorAll(`.${styles.slideSection}, .${styles.practiceCard}`).forEach(s => fadeObserver.observe(s));

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

    return () => { fadeObserver.disconnect(); dotObserver.disconnect(); };
  }, []);

  const scrollToSection = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const section = container.querySelector(`[data-section="${index}"]`);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const goLightboxNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % ALL_SLIDES.length));
  };
  const goLightboxPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + ALL_SLIDES.length) % ALL_SLIDES.length));
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
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />

      <nav className={styles.navDots}>
        {dots.map((_, i) => (
          <button key={i} className={`${styles.navDot} ${activeSection === i ? styles.active : ''}`} aria-label={`Go to section ${i + 1}`} onClick={() => scrollToSection(i)} />
        ))}
      </nav>

      {/* --- Lightbox --- */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)} role="dialog" aria-modal="true" aria-label="Image lightbox">
          <button className={styles.lightboxClose} onClick={() => setLightboxIndex(null)} aria-label="Close image">✕</button>
          <div className={styles.lightboxImg} onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: '800px' }}>
            <img 
               src={`/WisdomUntethered/Chap1/Question2/${slideImagePaths[ALL_SLIDES[lightboxIndex]]}${isDarkMode ? 'Dark' : 'Light'}${ 
                 (slideImagePaths[ALL_SLIDES[lightboxIndex]] === "OneRoot") ? '.jpg' : 
                 ((slideImagePaths[ALL_SLIDES[lightboxIndex]] === "Deep down, you're afraid" || 
                   slideImagePaths[ALL_SLIDES[lightboxIndex]] === "Youcannotuseurmindtofixyourmind" ||
                   slideImagePaths[ALL_SLIDES[lightboxIndex]] === "The Release") && isDarkMode) ? '.jpg' : '.png' 
               }`}
               alt={ALL_SLIDES[lightboxIndex]}
               style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
            />
          </div>
          <div className={styles.lightboxNav} onClick={e => e.stopPropagation()}>
            <button className={styles.lightboxNavBtn} onClick={goLightboxPrev} aria-label="Previous image">←</button>
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
                  <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/A Flawed AdvisorDark.png" : "/WisdomUntethered/Chap1/Question2/A Flawed AdvisorLight.png"} 
                     alt="The Endless Narrator" 
                     className={styles.slideImage}
                   />
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Question</span>
            <h2 className={styles.slideHeading}>The Endless <em>Narrator</em></h2>
            <ul className={styles.slideList}>
              <li>Thoughts arrive uninvited: past regrets, future worries.</li>
              <li>A "low hum" of doubt keeps the mind racing.</li>
              <li><strong>Singer's Inquiry:</strong> Why does this voice have so much power?</li>
            </ul>
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
                  <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/Deep down, you're afraidDark.jpg" : "/WisdomUntethered/Chap1/Question2/Deep down, you're afraidLight.png"} 
                     alt="Deep down, you're afraid" 
                     className={styles.slideImage}
                   />
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Deconstructing Anxiety</span>
            <h2 className={styles.slideHeading}>Deep down, you're <em>afraid</em></h2>
            <ul className={styles.slideList}>
              <li>The engine of talk is the fear that you won't be "okay."</li>
              <li>We believe our well-being depends on external outcomes.</li>
              <li>The mind creates noise to "protect" you from imagined risk.</li>
            </ul>
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
                  <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/A Flawed AdvisorDark.png" : "/WisdomUntethered/Chap1/Question2/A Flawed AdvisorLight.png"} 
                     alt="A Flawed Advisor" 
                     className={styles.slideImage}
                   />
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Deception</span>
            <h2 className={styles.slideHeading}>A <em>Flawed</em> Advisor</h2>
            <ul className={styles.slideList}>
              <li>The mind that creates the fear cannot solve it for you.</li>
              <li>Asking an anxious mind for "quiet" only creates more noise.</li>
              <li>The mind isn't broken — it's simply the wrong tool for peace.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ONE ROOT ── */}
      <section className={styles.slideSection} data-section="4">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>04</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(3)}>
                 <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/OneRootDark.jpg" : "/WisdomUntethered/Chap1/Question2/OneRootLight.jpg"} 
                     alt="One Root" 
                     className={styles.slideImage}
                   />
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Mechanics</span>
            <h2 className={styles.slideHeading}>One Root,<br/><em>Ten Thousand</em> Faces</h2>
            <ul className={styles.slideList}>
              <li>Engagement = Confirmation. The mind grows what you feed.</li>
              <li>Reasoning with thoughts only validates their "seriousness."</li>
              <li><strong>The Solution:</strong> Become the one who watches without answering.</li>
            </ul>
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
                  <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/YoucannotuseurmindtofixyourmindDark.jpg" : "/WisdomUntethered/Chap1/Question2/YoucannotuseurmindtofixyourmindLight.png"} 
                     alt="The Shift" 
                     className={styles.slideImage}
                   />
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Shift</span>
            <h2 className={styles.slideHeading}>You Cannot Use the Mind<br />to Fix <em>the Mind</em></h2>
            <ul className={styles.slideList}>
              <li>Stepping back reveals patterns: same fear, different clothes.</li>
              <li>You stop believing you are the narration.</li>
              <li>Freedom comes when the patterns are felt, not just understood.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: THE LISTENER ── */}
      <section className={`${styles.slideSection} ${styles.gripBand}`} data-section="6">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>06</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(5)}>
                  <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/RadioDark.png" : "/WisdomUntethered/Chap1/Question2/RadioLight.png"} 
                     alt="The Listener" 
                     className={styles.slideImage}
                   />
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Analogy</span>
            <h2 className={styles.slideHeading}>You Are the <em>Listener</em>.<br />Not the Radio.</h2>
            <ul className={styles.slideList}>
              <li><strong>Step 1:</strong> Notice and name the loop ("Worry voice").</li>
              <li><strong>Step 2:</strong> Withdraw engagement. Don't fix it.</li>
              <li><strong>Insight:</strong> The one who notices is always perfectly still.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: THE RELEASE ── */}
      <section className={styles.slideSection} data-section="7">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>07</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(6)}>
                  <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/The ReleaseDark.jpg" : "/WisdomUntethered/Chap1/Question2/The ReleaseLight.png"} 
                     alt="The Release" 
                     className={styles.slideImage}
                   />
                </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Release</span>
            <h2 className={styles.slideHeading}>The <em>Grip</em> Loosens</h2>
            <ul className={styles.slideList}>
              <li>The mind quiets naturally when it isn't "fed" by energy.</li>
              <li>Freedom is felt when spirals no longer move you.</li>
              <li>Distance from judgment creates intimacy with life.</li>
            </ul>
            <p className={styles.slideBodySmall}>Sign in for daily "Watcher" journal prompts.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: PRACTICE (MANTRA) ── */}
      <div className={styles.practiceCard} data-section="8">
        <p className={styles.practiceCardEyebrow}>The Practice</p>
        <h2 className={styles.practiceCardTitle}>Notice the Noise. Loosen the Grip.<br />Become the Watcher.</h2>
        <div className={styles.practiceMantra}>"I am the one who is aware."</div>
      </div>

      {/* ── SECTION 9: GUIDED MEDITATION ── */}
      <section className={styles.slideSection} data-section="9">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>08</span>
                <div className={styles.clickableImg} onClick={() => openLightbox(7)}>
                  <img 
                     src={isDarkMode ? "/WisdomUntethered/Chap1/Question2/GmDark.png" : "/WisdomUntethered/Chap1/Question2/GmLight.png"} 
                     alt="Meditation" 
                     className={styles.slideImage}
                   />
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
