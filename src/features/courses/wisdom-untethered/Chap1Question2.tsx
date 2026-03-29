import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Chap1Question1.module.css';

const imageMap: Record<string, string> = {
  // New specific Q2 images
  "Slide7.jpeg": "/WisdomUntethered/Chap1/Question2/03_WisdomUntethered.jpg",
  "Slide6.jpeg": "/WisdomUntethered/Chap1/Question2/02_Claustrophobia.jpg",
  "Slide5.jpeg": "/WisdomUntethered/Chap1/Question2/01_Deconstructing.jpg",
  "Slide4.jpeg": "/WisdomUntethered/Chap1/Question2/04_Futility.jpg",
  "Slide3.jpeg": "/WisdomUntethered/Chap1/Question2/05_EscalatingFeedback.jpg",
  
  // Reused Question 1 images (for the ones not uploaded for Q2 yet)
  "Slide2.jpeg": "/WisdomUntethered/Chap1/Question1/10_HowTheWallsComeDown.jpg",   // "The root" 
  "Slide1.jpeg": "/WisdomUntethered/Chap1/Question1/07_WhenYouFeltTrulyAlive.jpg", // "The shift"
  "Slide13.jpeg": "/WisdomUntethered/Chap1/Question1/05_LockingOutLife.jpg",        // "The radio"
  "Slide11.jpeg": "/WisdomUntethered/Chap1/Question1/06_TheRiverAndTheClench.jpg",  // "The riverbank"
  "Slide9.jpeg": "/WisdomUntethered/Chap1/Question1/08_NoticeTheTightening.jpg",    // "Stillness in Chaos"
  "Slide10.jpeg": "/WisdomUntethered/Chap1/Question1/02_WhatIsItActually.jpg",      // "Matrix"
  "Slide12.jpeg": "/WisdomUntethered/Chap1/Question1/09_The5SecondPractice.png",    // "The Grip Loosens"
  "Slide8.jpeg": "/WisdomUntethered/Chap1/Question1/04_TheFeelingNobodyTalksAbout.jpg", // "Closing"
};

const TOTAL_SLIDES = 15; // sections data-section="0" … "14"

export function Chap1Question2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // ── Presentation mode (manual only — no auto-advance) ──
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ── Lightbox ──
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  // ── Scroll progress bar ──
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

  // ── Intersection observers ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll('[data-section]');

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add(styles.visible); });
    }, { root: container, threshold: 0.12 });

    container.querySelectorAll(`.${styles.slideSection}, .${styles.fullImageSlide}, .${styles.practiceCard}`).forEach(s => {
      fadeObserver.observe(s);
    });

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

  // ── Presentation controls ──
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

  // ── Keyboard shortcuts (Esc closes lightbox / ArrowRight advances) ──
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

  const openLightbox = (src: string, alt: string) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };

  const dots = Array.from({ length: TOTAL_SLIDES });

  // Ring shows position through deck (0 → 100%)
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const positionPct = TOTAL_SLIDES > 1 ? (currentSlide / (TOTAL_SLIDES - 1)) * 100 : 0;
  const ringOffset = circumference - (positionPct / 100) * circumference;

  return (
    <div
      className={`${styles.container} ${isPresenting ? styles.isPresenting : ''}`}
      ref={containerRef}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />

      {/* ── Fullscreen Return Button ── */}
      {isPresenting && (
        <button
          className={styles.fullscreenReturnBtn}
          onClick={stopPresentation}
          aria-label="Exit presentation"
        >
          <ArrowLeft size={18} />
          <span>Exit Slideshow</span>
        </button>
      )}

      {/* ── Nav Dots ── */}
      <nav className={styles.navDots}>
        {dots.map((_, i) => (
          <button
            key={i}
            className={`${styles.navDot} ${activeSection === i ? styles.active : ''}`}
            aria-label={`Go to section ${i + 1}`}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </nav>

      {/* ── Floating Presentation Controls ── */}
      <div className={styles.slideshowControl}>
        {!isPresenting ? (
          <button
            className={styles.slideshowPlayBtn}
            onClick={startPresentation}
            aria-label="Start presentation"
            title="Present slides"
          >
            <svg viewBox="0 0 60 60" className={styles.slideshowSvg} aria-hidden="true">
              <circle cx="30" cy="30" r="28" className={styles.svgTrack} />
              <polygon points="23,18 45,30 23,42" className={styles.svgPlay} />
            </svg>
            <span className={styles.slideshowLabel}>Present</span>
          </button>
        ) : (
          <div className={styles.slideshowPlayer}>
            {/* Stop / Return */}
            <button
              className={`${styles.slideshowNavBtn} ${styles.stopBtn}`}
              onClick={stopPresentation}
              aria-label="Exit presentation"
              title="Exit"
            >✕</button>

            {/* Position ring */}
            <div className={styles.slideshowRingBtn} aria-label={`Slide ${currentSlide + 1} of ${TOTAL_SLIDES}`}>
              <svg viewBox="0 0 60 60" className={styles.slideshowSvg} aria-hidden="true">
                <circle cx="30" cy="30" r={radius} className={styles.svgTrack} />
                <circle
                  cx="30" cy="30" r={radius}
                  className={styles.svgRing}
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                />
                <text x="30" y="35" textAnchor="middle" className={styles.svgCountText}>
                  {currentSlide + 1}
                </text>
              </svg>
            </div>

            {/* Prev */}
            <button
              className={styles.slideshowNavBtn}
              onClick={goPrev}
              aria-label="Previous slide"
              title="Previous (←)"
              disabled={currentSlide === 0}
            >‹</button>

            {/* Next */}
            <button
              className={`${styles.slideshowNavBtn} ${styles.nextBtn}`}
              onClick={goNext}
              aria-label="Next slide"
              title="Next (→)"
              disabled={currentSlide === TOTAL_SLIDES - 1}
            >›</button>

            {/* Slide counter */}
            <span className={styles.slideCounter}>{currentSlide + 1}&thinsp;/&thinsp;{TOTAL_SLIDES}</span>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxSrc(null)}
            aria-label="Close image"
          >✕</button>
          <img
            src={lightboxSrc}
            alt={lightboxAlt}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── HERO ── */}
      <section className={styles.hero} data-section="0">
        <div className={styles.heroEyebrow}>Wisdom Untethered · Chapter 1 · Question 2</div>
        <h1 className={styles.heroTitle}>The Voice That Creates<br /><strong>Doubt, Guilt &amp; Fear</strong></h1>
        <div className={styles.heroDivider}></div>
        <p className={styles.heroSubtitle}>Why your mind keeps talking — and how to stop letting it run your life</p>
        <div className={styles.heroScroll}>Scroll</div>
      </section>

      {/* ── INTRO BAND ── */}
      <div className={styles.chapterIntro}>
        <div className={styles.chapterIntroInner}>
          <p>"The voice in your head never stops. It narrates, judges, worries. But here is what Singer wants you to see — that voice is not trying to hurt you. It is trying to protect you. The tragedy is that the protection itself has become the prison."</p>
        </div>
      </div>

      {/* ── SLIDE 1 ── */}
      <section className={styles.slideSection} data-section="1">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>01</span>
            <img src={imageMap["Slide7.jpeg"]} alt="Wisdom Untethered — A visual guide to moving from mental noise to witness consciousness" onClick={() => openLightbox(imageMap["Slide7.jpeg"], "A visual guide to moving from mental noise to witness consciousness")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The question</span>
            <h2 className={styles.slideHeading}>From <em>Mental Noise</em><br />to Witness Consciousness</h2>
            <p className={styles.slideBody}>Singer's question for this chapter is deceptively simple: how do you handle the narrator inside your head — the voice that generates doubt about your decisions, guilt about your past, and fear about your future? The answer he points to changes everything.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 2 ── */}
      <section className={styles.slideSection} data-section="2">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>02</span>
            <img src={imageMap["Slide6.jpeg"]} alt="The claustrophobia of the late-night mind" onClick={() => openLightbox(imageMap["Slide6.jpeg"], "The claustrophobia of the late-night mind")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Where it lives</span>
            <h2 className={styles.slideHeading}>The Claustrophobia of the<br /><em>Late-Night Mind</em></h2>
            <p className={styles.slideBody}>You know this experience. It's 11pm, the day is over, and yet the mind is only getting started. "What if." "I should have." "What did they mean?" "Did I forget?" The thoughts loop — not solving anything, just revisiting the same unsolvable questions.</p>
            <p className={styles.slideBody}>Singer names three things happening simultaneously: the endless loop of unsolvable narratives, the body responding to thoughts as if they were physical threats, and — beneath all of it — an awareness that has always been present and always been quiet.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 3 ── */}
      <section className={styles.slideSection} data-section="3">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>03</span>
            <img src={imageMap["Slide5.jpeg"]} alt="Deconstructing the anatomy of everyday anxiety" onClick={() => openLightbox(imageMap["Slide5.jpeg"], "Deconstructing the anatomy of everyday anxiety")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The anatomy</span>
            <h2 className={styles.slideHeading}>Deconstructing<br /><em>Everyday Anxiety</em></h2>
            <p className={styles.slideBody}>Singer breaks anxiety into three parts. The fuel — the core fear: "I'm afraid I won't be okay." The engine — the mind's relentless mechanical habit of scanning for problems and trying to solve them. The output — the surface worries about work, money, relationships that we spend our energy on.</p>
            <div className={styles.pullQuote}>We treat the outputs as separate problems. Singer points to the single fuel powering all of them.</div>
            <p className={styles.slideBody}>You don't have to fix ten thousand things. You have one core pattern showing up in ten thousand different situations.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 4 ── */}
      <section className={styles.slideSection} data-section="4">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>04</span>
            <img src={imageMap["Slide2.jpeg"]} alt="Finding the singular root beneath the surface noise" onClick={() => openLightbox(imageMap["Slide2.jpeg"], "Finding the singular root beneath the surface noise")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The root</span>
            <h2 className={styles.slideHeading}>One Root,<br /><em>Ten Thousand Faces</em></h2>
            <p className={styles.slideBody}>The work email that spirals you. The broken relationship you can't stop thinking about. The financial worry that wakes you at 3am. These look like three separate problems. But trace each one downward and you find the same thing at the bottom: "I might not be okay."</p>
            <p className={styles.slideBody}>Singer's insight is both disturbing and liberating: you do not have 10,000 distinct problems to solve. You have one core pattern manifesting in 10,000 different ways. And that means the work is not about fixing your life — it's about addressing the pattern itself.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 5 ── */}
      <section className={styles.slideSection} data-section="5">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>05</span>
            <img src={imageMap["Slide4.jpeg"]} alt="The futility of thinking your way out of thinking" onClick={() => openLightbox(imageMap["Slide4.jpeg"], "The futility of thinking your way out of thinking")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The trap</span>
            <h2 className={styles.slideHeading}>You Cannot Use the Mind<br /><em>to Fix the Mind</em></h2>
            <p className={styles.slideBody}>This is the central paradox Singer names. You're asking a mind filled with doubt, fear, and insecurity to give you advice about how to be at peace. The mind is an evolutionary survival tool designed to detect threats. It is not a peace-generating instrument.</p>
            <div className={styles.pullQuote}>Asking a threat-detection system for peace only generates more perceived threats.</div>
            <p className={styles.slideBody}>The more you engage with the fearful mind, the more you confirm to it that there is something serious to be afraid of. The more you try to think your way out, the deeper in you go.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 6 ── */}
      <section className={styles.slideSection} data-section="6">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>06</span>
            <img src={imageMap["Slide3.jpeg"]} alt="The escalating feedback loop of mental engagement" onClick={() => openLightbox(imageMap["Slide3.jpeg"], "The escalating feedback loop of mental engagement")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The mechanism</span>
            <h2 className={styles.slideHeading}>The Escalating<br /><em>Feedback Loop</em></h2>
            <p className={styles.slideBody}>Here is exactly how it works. The mind generates a fearful thought. You give it attention — you engage with it. The mind registers that attention as proof that this is a real danger. So it amplifies the noise. Which draws more of your attention. Which confirms the danger further.</p>
            <p className={styles.slideBody}>Singer is precise about this: your own precious awareness — the very energy of your consciousness — is being used to amplify the noise that disturbs you. The loop doesn't need an external threat. It feeds on your engagement with it.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 7 ── */}
      <section className={styles.slideSection} data-section="7">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>07</span>
            <img src={imageMap["Slide1.jpeg"]} alt="Shifting the paradigm from participant to observer" onClick={() => openLightbox(imageMap["Slide1.jpeg"], "Shifting the paradigm from participant to observer")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The shift</span>
            <h2 className={styles.slideHeading}>From <em>Participant</em><br />to Observer</h2>
            <p className={styles.slideBody}>Singer's instruction is not what we expect. He doesn't say: calm the mind. He doesn't say: fix the thoughts. He says: step back and watch. Move from inside the storm to outside it.</p>
            <p className={styles.slideBody}>Inside the box: "I am the storm." Total identification with the mental content. Outside the box — the seat of awareness: "I observe the storm." The storm is still there. But the relationship to it has completely changed.</p>
            <div className={styles.pullQuote}>The goal is never to stop the storm. The goal is simply to step out of the box.</div>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 8 ── */}
      <section className={styles.slideSection} data-section="8">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>08</span>
            <img src={imageMap["Slide13.jpeg"]} alt="Creating intentional space between the listener and the noise" onClick={() => openLightbox(imageMap["Slide13.jpeg"], "Creating intentional space between the listener and the noise")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The analogy</span>
            <h2 className={styles.slideHeading}><em>You Are the Listener.</em><br />You Are Not the Radio.</h2>
            <p className={styles.slideBody}>Imagine a room with a radio playing loudly in the corner — frantic noise, static, urgent voices. On the other side of the room sits someone who is completely aware of the radio, but completely unbothered by it. They are the witness consciousness — aware, listening, but entirely unmoved.</p>
            <p className={styles.slideBody}>The space between the listener and the radio is the space of freedom. Singer calls this creating intentional space between yourself and the conditioned mind. The radio keeps playing. But you are not the radio. And the distance between you and it — that is where peace lives.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 9 ── */}
      <section className={styles.slideSection} data-section="9">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>09</span>
            <img src={imageMap["Slide11.jpeg"]} alt="Thoughts are objects floating in the river of your awareness" onClick={() => openLightbox(imageMap["Slide11.jpeg"], "Thoughts are objects floating in the river of your awareness")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Your true nature</span>
            <h2 className={styles.slideHeading}>You Are<br /><em>the Riverbank</em></h2>
            <p className={styles.slideBody}>Singer offers a clarifying image: thoughts are objects floating in the river of your awareness. They come and go — the leaf of a worry, the box of a plan, the tangled knot of an old regret. They drift past, requiring no action.</p>
            <p className={styles.slideBody}>You are not the thoughts. You are not even the river. You are the bank — the unmoving observer on the shore, watching the stream of time and awareness flow by. The bank does not become the leaf. It simply holds its ground while everything passes.</p>
            <div className={styles.pullQuote}>Establishing the permanent identity of the watcher is the whole work.</div>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 10 ── */}
      <section className={styles.slideSection} data-section="10">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>10</span>
            <img src={imageMap["Slide9.jpeg"]} alt="Anchoring internal stillness within external chaos" onClick={() => openLightbox(imageMap["Slide9.jpeg"], "Anchoring internal stillness within external chaos")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The promise</span>
            <h2 className={styles.slideHeading}>Internal Stillness<br /><em>Within External Chaos</em></h2>
            <p className={styles.slideBody}>This is what Singer is pointing toward: not a life free from noise and difficulty, but a life where you stand in the golden center — unmoved, peaceful, anchored — while the outer ring of the world keeps spinning.</p>
            <p className={styles.slideBody}>The world will always be demanding, always moving, inherently uncontrollable. That is not a problem to be solved. The witness consciousness does not need the outer ring to quieten down. It simply remains at the centre, undisturbed by what cannot be controlled.</p>
            <p className={styles.slideBody}>You do not have to escape the noise to find peace. You can stand in the centre of the world without being of it.</p>
          </div>
        </div>
      </section>

      {/* ── PARCHMENT: DIAGNOSTIC MATRIX (Slide 11) ── */}
      <div className={styles.chapterIntro} style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <section className={styles.matrixSlide} data-section="11">
          <div className={styles.slideWrapper}>
            <div className={styles.slideImageWrap}>
              <span className={styles.slideNumber}>11</span>
              <img src={imageMap["Slide10.jpeg"]} alt="Diagnostic Matrix: Two paradigms of experience" onClick={() => openLightbox(imageMap["Slide10.jpeg"], "Diagnostic Matrix: Two paradigms of experience")} className={styles.clickableImg} />
            </div>
            <div className={styles.slideContent}>
              <span className={styles.slideLabel}>Two ways of being</span>
              <h2 className={styles.slideHeading}>The Diagnostic<br /><em>Matrix</em></h2>
              <p className={styles.slideBody}>Singer draws a clear line between two modes of living. In the engaged mind: "I am my thoughts." You grasp, analyse, attempt to fix. The body tightens, breathing shallows, and every fearful thought amplifies the signal.</p>
              <p className={styles.slideBody}>In witness consciousness: "I am the one noticing my thoughts." You watch, allow, let pass. The body softens and expands. And fear, when it arises, does not amplify — it unplugs. The radio loses its power the moment you stop feeding it your attention.</p>
              <div className={styles.pullQuote}>Which paradigm are you living from right now?</div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 12 ── */}
      <section className={styles.slideSection} data-section="12">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>12</span>
            <img src={imageMap["Slide12.jpeg"]} alt="Transmuting nervous energy through physical release" onClick={() => openLightbox(imageMap["Slide12.jpeg"], "Transmuting nervous energy through physical release")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The release</span>
            <h2 className={styles.slideHeading}><em>The Grip</em><br />Loosens</h2>
            <p className={styles.slideBody}>The grip is what engagement looks like in the body. Resistance. Tension. The effort of trying to control what cannot be controlled — trapping the energy inside, exhausting you, producing nothing.</p>
            <p className={styles.slideBody}>The release is not collapse. It is surrender — softening, allowing, transmuting the energy by letting it pass through rather than fighting it. Singer calls this the transmutation of energy. When you stop gripping what disturbs you, the disturbance itself begins to dissolve. Not because you solved it. Because you stopped feeding it.</p>
            <p className={styles.slideBody}>Over time, the things that used to spiral you for hours barely move you at all. That is not distance from life. That is freedom inside it.</p>
          </div>
        </div>
      </section>

      {/* ── INSIGHT CARD / PRACTICE CARD ── */}
      <div className={styles.practiceCard} data-section="13">
        <p className={styles.practiceCardEyebrow}>The practice</p>
        <h2 className={styles.practiceCardTitle}>Notice the Noise.<br />Loosen the Grip.<br />Become the Watcher.</h2>
        <p className={styles.practiceCardBody}>Singer's instruction is not to silence the mind. It is to stop taking it so seriously. When the voice of doubt, guilt, or fear arrives — don't fight it, don't follow it. Step back and watch it. Notice the pattern. See it for what it is: the mind doing its old thing, trying to protect you from a danger that is mostly imagined.</p>
        <div className={styles.practiceMantra}>"You are not your mind.<br />You are the one who is aware of it."</div>
        <p className={styles.practiceCardBody}>Just once today — when the narrator starts its loop — try naming it instead of joining it. "There's the worry voice." "There's the guilt loop." See it as an object in your awareness, not as the truth about reality. That small gap between you and the thought is where the whole practice begins.</p>
      </div>

      {/* ── SLIDE 13 ── */}
      <section className={styles.fullImageSlide} data-section="14">
        <img src={imageMap["Slide8.jpeg"]} alt="Notice the noise. Loosen the grip. Become the watcher." onClick={() => openLightbox(imageMap["Slide8.jpeg"], "Notice the noise. Loosen the grip. Become the watcher.")} className={styles.clickableImg} />
        <div className={styles.slideContent} style={{ textAlign: 'center' }}>
          <span className={styles.slideLabel} style={{ display: 'block' }}>Your invitation</span>
          <h2 className={styles.slideHeading}><em>Notice. Loosen.<br />Become the Watcher.</em></h2>
          <p className={styles.slideBody} style={{ maxWidth: '520px', margin: '0 auto' }}>Three words. That is the entire teaching of this question distilled to its simplest form. Notice the noise — don't pretend it isn't there. Loosen the grip — stop feeding the feedback loop with your engagement. And become the watcher — the one who is aware, always available, always still beneath the storm.</p>
          <p className={styles.slideBody} style={{ maxWidth: '520px', margin: '1rem auto 0' }}>Take one moment today to sit with what you've read here. What is the voice in your head currently saying? Can you notice it — just notice it — without following it all the way in? Write what you found in your journal. Not what the voice said. What it felt like to watch it instead of become it.</p>
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section className={styles.closing}>
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow}>End of Chapter 1 · Question 2</p>
          <h2 className={styles.closingTitle}>You Are Not<br />the Radio</h2>
          <p className={styles.closingBody}>The mind will keep playing its noise. That's what minds do. But somewhere in this lesson, you found the listener — the one sitting quietly on the other side of the room, aware of everything, disturbed by nothing. That one has always been there. And that one is you.</p>
          <button className={styles.closingJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
