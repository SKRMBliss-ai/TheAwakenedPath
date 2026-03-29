/* Chap1Question2.tsx */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Chap1Question2.module.css';

const imageMap: Record<string, string> = {
  // New specific Q2 images
  "intro":        "/WisdomUntethered/Chap1/Question2/03_WisdomUntethered.jpg",
  "claustro":     "/WisdomUntethered/Chap1/Question2/02_Claustrophobia.jpg",
  "deconstruct":  "/WisdomUntethered/Chap1/Question2/01_Deconstructing.jpg",
  "oneroot":      "/WisdomUntethered/Chap1/Question2/06_OneRoot.png",
  "futility":     "/WisdomUntethered/Chap1/Question2/04_TheSpaceOfFreedom.png", // The diagram
  "escalating":   "/WisdomUntethered/Chap1/Question2/05_EscalatingFeedback.jpg",
  "watcher":      "/WisdomUntethered/Chap1/Question2/07_ParticipantObserver.png",
  "matrix":       "/WisdomUntethered/Chap1/Question2/11_DiagnosticMatrix.jpg",
  "grip":         "/WisdomUntethered/Chap1/Question2/12_GripLoosens.jpg",
  "meditation":   "/WisdomUntethered/Chap1/Question2/14_NoticeLoosenBecome.jpg",
  "listener":     "/WisdomUntethered/Chap1/Question2/08_ListenerRadio.png",
  "riverbank":    "/WisdomUntethered/Chap1/Question2/09_Riverbank.jpg",
  "stillness":    "/WisdomUntethered/Chap1/Question2/10_StillnessChaos.jpg"
};

const TOTAL_SLIDES = 19;

export function Chap1Question2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // ── Presentation mode state ──
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ── Lightbox state ──
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

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

  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentSlide(0);
    scrollToSection(0);
  };

  const goNext = () => {
    const next = Math.min(currentSlide + 1, TOTAL_SLIDES - 1);
    setCurrentSlide(next);
    scrollToSection(next);
  };
  const goPrev = () => {
    const prev = Math.max(currentSlide - 1, 0);
    setCurrentSlide(prev);
    scrollToSection(prev);
  };
  const stopPresentation = () => {
    setIsPresenting(false);
    setCurrentSlide(0);
    scrollToSection(0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxSrc(null);
      if (isPresenting && !lightboxSrc) {
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresenting, currentSlide, lightboxSrc]);

  const openLightbox = (src: string, alt: string) => { setLightboxSrc(src); setLightboxAlt(alt); };

  const dots = Array.from({ length: TOTAL_SLIDES });
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const positionPct = TOTAL_SLIDES > 1 ? (currentSlide / (TOTAL_SLIDES - 1)) * 100 : 0;
  const ringOffset = circumference - (positionPct / 100) * circumference;

  return (
    <div className={`${styles.container} ${isPresenting ? styles.isPresenting : ''}`} ref={containerRef} style={{ height: '100%', overflowY: 'auto' }}>
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />

      {/* --- Nav & Controls --- */}
      {isPresenting && (
        <button className={styles.fullscreenReturnBtn} onClick={stopPresentation} aria-label="Exit presentation"><ArrowLeft size={18} /><span>Exit Slideshow</span></button>
      )}
      <nav className={styles.navDots}>
        {dots.map((_, i) => (
          <button key={i} className={`${styles.navDot} ${activeSection === i ? styles.active : ''}`} aria-label={`Go to section ${i + 1}`} onClick={() => scrollToSection(i)} />
        ))}
      </nav>
      <div className={styles.slideshowControl}>
        {!isPresenting ? (
          <button className={styles.slideshowPlayBtn} onClick={startPresentation} aria-label="Start presentation">
            <svg viewBox="0 0 60 60" className={styles.slideshowSvg} aria-hidden="true">
              <circle cx="30" cy="30" r="28" className={styles.svgTrack} /><polygon points="23,18 45,30 23,42" className={styles.svgPlay} />
            </svg>
            <span className={styles.slideshowLabel}>Present</span>
          </button>
        ) : (
          <div className={styles.slideshowPlayer}>
            <button className={`${styles.slideshowNavBtn} ${styles.stopBtn}`} onClick={stopPresentation} aria-label="Exit presentation">✕</button>
            <div className={styles.slideshowRingBtn} aria-label={`Slide ${currentSlide + 1} of ${TOTAL_SLIDES}`}>
              <svg viewBox="0 0 60 60" className={styles.slideshowSvg} aria-hidden="true">
                <circle cx="30" cy="30" r={radius} className={styles.svgTrack} /><circle cx="30" cy="30" r={radius} className={styles.svgRing} strokeDasharray={circumference} strokeDashoffset={ringOffset} />
                <text x="30" y="35" textAnchor="middle" className={styles.svgCountText}>{currentSlide + 1}</text>
              </svg>
            </div>
            <button className={styles.slideshowNavBtn} onClick={goPrev} aria-label="Previous slide" disabled={currentSlide === 0}>‹</button>
            <button className={`${styles.slideshowNavBtn} ${styles.nextBtn}`} onClick={goNext} aria-label="Next slide" disabled={currentSlide === TOTAL_SLIDES - 1}>›</button>
            <span className={styles.slideCounter}>{currentSlide + 1}&thinsp;/&thinsp;{TOTAL_SLIDES}</span>
          </div>
        )}
      </div>

      {/* --- Lightbox --- */}
      {lightboxSrc && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxSrc(null)} role="dialog" aria-modal="true" aria-label="Image lightbox">
          <button className={styles.lightboxClose} onClick={() => setLightboxSrc(null)} aria-label="Close image">✕</button>
          <img src={lightboxSrc} alt={lightboxAlt} className={styles.lightboxImg} onClick={e => e.stopPropagation()} />
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
            <img src={imageMap["intro"]} alt="Wisdom Untethered Intro" onClick={() => openLightbox(imageMap["intro"], "Wisdom Untethered Intro")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Question</span>
            <h2 className={styles.slideHeading}>The Endless <em>Narrator</em></h2>
            <p className={styles.slideBody}>You know that moment when you're lying in bed, trying to sleep, and a thought arrives out of nowhere. Something you said three days ago. A decision you haven't made yet. A version of a conversation that hasn't happened.</p>
            <p className={styles.slideBody}>Within seconds — the mind is off. Guilt about the past. Worry about the future. A low hum of "what if I'm getting this wrong?" You didn't ask for any of it. You were just trying to sleep.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE ROOT CAUSE ── */}
      <section className={styles.slideSection} data-section="2">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>02</span>
            <img src={imageMap["claustro"]} alt="The Root Cause" onClick={() => openLightbox(imageMap["claustro"], "The Root Cause")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Root Cause</span>
            <h2 className={styles.slideHeading}>Deep down, you're <em>afraid</em></h2>
            <p className={styles.slideBody}>The reason the mind won't stop talking is this: deep down, you're afraid you won't be okay. That's the whole engine.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE ENGINE ── */}
      <section className={styles.slideSection} data-section="3">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>03</span>
            <img src={imageMap["deconstruct"]} alt="The Engine" onClick={() => openLightbox(imageMap["deconstruct"], "The Engine")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Engine</span>
            <h2 className={styles.slideHeading}>A <em>Flawed</em> Advisor</h2>
            <p className={styles.slideBody}>The mind that is trying to solve the problem of doubt and fear — is the same mind that is generating the doubt and fear in the first place.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: DIAGRAM ── */}
      <section className={styles.slideSection} data-section="4">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>04</span>
            <img src={imageMap["futility"]} alt="The Space of Freedom" onClick={() => openLightbox(imageMap["futility"], "The Space of Freedom")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Diagram</span>
            <h2 className={styles.slideHeading}>The Space of <em>Freedom</em></h2>
            <p className={styles.slideBody}>You are the core. The thoughts are the waves on the periphery. The space between the core and the periphery is the space of freedom.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: THE SHIFT ── */}
      <section className={styles.slideSection} data-section="5">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>05</span>
            <img src={imageMap["watcher"]} alt="Participant vs Observer" onClick={() => openLightbox(imageMap["watcher"], "Participant vs Observer")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Shift</span>
            <h2 className={styles.slideHeading}>Stop Silencing.<br />Start <em>Watching</em>.</h2>
            <p className={styles.slideBody}>Singer says: stop trying to silence the mind. That doesn't work. What works is stepping back and watching it.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: THE DIAGNOSTIC MATRIX (MAIN FLOW) ── */}
      <section className={`${styles.slideSection} ${styles.matrixBand}`} data-section="6">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>06</span>
            <img src={imageMap["matrix"]} alt="Diagnostic Matrix" onClick={() => openLightbox(imageMap["matrix"], "Diagnostic Matrix")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Diagnostic</span>
            <h2 className={styles.slideHeading}>The Diagnostic <em>Matrix</em></h2>
            <p className={styles.slideBody}>Singer draws a clear line: In the engaged mind, "I am my thoughts." In witness consciousness, "I am the one noticing my thoughts."</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: THE GRIP LOOSENS ── */}
      <section className={`${styles.slideSection} ${styles.gripBand}`} data-section="7">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>07</span>
            <img src={imageMap["grip"]} alt="The Grip Loosens" onClick={() => openLightbox(imageMap["grip"], "The Grip Loosens")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <h2 className={styles.slideHeading}>The <em>Grip</em> Loosens</h2>
            <p className={styles.slideBody}>The grip is what engagement looks like in the body: Tension. Resistance. By softening, you transmute the energy.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: SUMMARY ── */}
      <div className={styles.practiceCard} data-section="8">
        <p className={styles.practiceCardEyebrow}>Summary</p>
        <h2 className={styles.practiceCardTitle}>Notice. Loosen.<br />Become the Watcher.</h2>
        <div className={styles.practiceMantra}>"I am the one who is aware."</div>
      </div>

      {/* ── SECTION 9: EXTRA WISE HEADER ── */}
      <div className={styles.chapterIntro} data-section="9">
        <div className={styles.chapterIntroInner}>
           <h2 className={styles.slideHeading}>Extra Wisdom</h2>
           <p className={styles.slideBody}>Dive deeper into the technical mechanics after the session.</p>
        </div>
      </div>

      {/* ── SECTION 10: PATTERNS (EXTRA) ── */}
      <section className={styles.slideSection} data-section="10">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["escalating"]} alt="Patterns" onClick={() => openLightbox(imageMap["escalating"], "Patterns")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Patterns</span>
            <h2 className={styles.slideHeading}>Same Fear,<br /><em>Different Clothes</em></h2>
            <p className={styles.slideBody}>When you watch, you see the patterns. The same fear showing up in different situations.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 11: PRACTICE (EXTRA) ── */}
      <section className={styles.slideSection} data-section="11">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["meditation"]} alt="The Practice" onClick={() => openLightbox(imageMap["meditation"], "The Practice")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Practice</span>
            <h2 className={styles.slideHeading}>Notice. Name.<br /><em>Detach</em>.</h2>
            <p className={styles.slideBody}>When the voice starts up, try naming it. "There's the worry voice."</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 12: ANALOGY (EXTRA) ── */}
      <section className={styles.slideSection} data-section="12">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["listener"]} alt="The Radio Analogy" onClick={() => openLightbox(imageMap["listener"], "The Radio Analogy")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Analogy</span>
            <h2 className={styles.slideHeading}>You Are the <em>Listener</em>.<br />Not the Radio.</h2>
            <p className={styles.slideBody}>The space between the listener and the radio is the space of freedom.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 13: RIVERBANK (EXTRA) ── */}
      <section className={styles.slideSection} data-section="13">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["riverbank"]} alt="The Riverbank" onClick={() => openLightbox(imageMap["riverbank"], "The Riverbank")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Visualization</span>
            <h2 className={styles.slideHeading}>You Are <em>the Riverbank</em></h2>
            <p className={styles.slideBody}>You are the bank — the unmoving observer on the shore.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 14: MEDITATION INTRO (EXTRA) ── */}
      <div className={styles.chapterIntro} data-section="14">
        <div className={styles.chapterIntroInner}>
           <h2 className={styles.slideHeading}>Restoring the <em>Watcher</em></h2>
           <p className={styles.slideBody}>A 90-second journey.</p>
        </div>
      </div>

      {/* ── SECTION 15: MEDITATION STEPS (EXTRA) ── */}
      <section className={styles.slideSection} data-section="15">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
             <span className={styles.slideNumber}>Extra</span>
             <img src={imageMap["watcher"]} alt="Guided Meditation" onClick={() => openLightbox(imageMap["watcher"], "Guided Meditation")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <h2 className={styles.slideHeading}>Step Away From Noise</h2>
            <p className={styles.slideBody}>Close your eyes... Ask yourself: <strong>Who is noticing this?</strong></p>
          </div>
        </div>
      </section>

      {/* ── SECTION 16: STILLNESS (EXTRA) ── */}
      <section className={styles.slideSection} data-section="16">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["stillness"]} alt="Internal Stillness" onClick={() => openLightbox(imageMap["stillness"], "Internal Stillness")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Promise</span>
            <h2 className={styles.slideHeading}>Stillness in <em>Chaos</em></h2>
            <p className={styles.slideBody}>The witness consciousness remains at the centre.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 17: ONE ROOT (EXTRA) ── */}
      <section className={styles.slideSection} data-section="17">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["oneroot"]} alt="One Root" onClick={() => openLightbox(imageMap["oneroot"], "One Root")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Foundation</span>
            <h2 className={styles.slideHeading}>One Root, Many Faces</h2>
            <p className={styles.slideBody}>Solve the root, and the costumes lose their power.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 18: CLOSING (EXTRA) ── */}
      <section className={styles.closing} data-section="18">
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow}>End of Chapter 1 · Question 2</p>
          <h2 className={styles.closingTitle}>You Are Not<br />the Radio</h2>
          <button className={styles.closingJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
