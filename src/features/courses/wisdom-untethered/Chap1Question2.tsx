import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Chap1Question1.module.css';

const imageMap: Record<string, string> = {
  // New specific Q2 images
  "intro":        "/WisdomUntethered/Chap1/Question2/03_WisdomUntethered.jpg",
  "claustro":     "/WisdomUntethered/Chap1/Question2/02_Claustrophobia.jpg",
  "deconstruct":  "/WisdomUntethered/Chap1/Question2/01_Deconstructing.jpg",
  "oneroot":      "/WisdomUntethered/Chap1/Question2/06_OneRoot.png",
  "futility":     "/WisdomUntethered/Chap1/Question2/04_TheSpaceOfFreedom.png",
  "escalating":   "/WisdomUntethered/Chap1/Question2/05_EscalatingFeedback.jpg",
  "participant":  "/WisdomUntethered/Chap1/Question2/07_ParticipantObserver.png",
  "listener":     "/WisdomUntethered/Chap1/Question2/08_ListenerRadio.png",
  "riverbank":    "/WisdomUntethered/Chap1/Question2/09_Riverbank.jpg",
  "stillness":    "/WisdomUntethered/Chap1/Question2/10_StillnessChaos.jpg",
  "matrix":       "/WisdomUntethered/Chap1/Question2/11_DiagnosticMatrix.jpg",
  "grip":         "/WisdomUntethered/Chap1/Question2/12_GripLoosens.jpg",
  "meditation":   "/WisdomUntethered/Chap1/Question1/08_NoticeTheTightening.jpg",
  "watcher":      "/WisdomUntethered/Chap1/Question2/14_NoticeLoosenBecome.jpg",
  
  // Reused Question 1 images
  "placeholder_walls":     "/WisdomUntethered/Chap1/Question1/10_HowTheWallsComeDown.jpg",   
  "placeholder_alive":     "/WisdomUntethered/Chap1/Question1/07_WhenYouFeltTrulyAlive.jpg", 
  "placeholder_locking":   "/WisdomUntethered/Chap1/Question1/05_LockingOutLife.jpg",        
  "placeholder_river":     "/WisdomUntethered/Chap1/Question1/06_TheRiverAndTheClench.jpg",  
  "placeholder_tightening": "/WisdomUntethered/Chap1/Question1/08_NoticeTheTightening.jpg",    
  "placeholder_matrix":    "/WisdomUntethered/Chap1/Question1/02_WhatIsItActually.jpg",      
  "placeholder_practice":  "/WisdomUntethered/Chap1/Question1/09_The5SecondPractice.png",    
  "placeholder_feeling":   "/WisdomUntethered/Chap1/Question1/04_TheFeelingNobodyTalksAbout.png", 
};

const TOTAL_SLIDES = 19; // Main: 0-9, Extras: 10-18

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
        <h1 className={styles.heroTitle}>The Voice in Your Head<br /><strong>Is Not Trying to Help You</strong></h1>
        <div className={styles.heroDivider}></div>
        <p className={styles.heroSubtitle}>Why your mind keeps talking — and how to stop letting it run your life</p>
        <div className={styles.heroScroll}>Scroll to Begin</div>
      </section>

      {/* ── SLIDE 1: INTRO ── */}
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

      {/* ── SLIDE 2: THE ROOT CAUSE ── */}
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
            <p className={styles.slideBody}>You believe — without ever examining it — that if things don't go exactly the way you need them to go, your well-being is at risk. It's not malicious. It's not broken. It's genuinely trying to protect you.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 3: THE ENGINE ── */}
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
            <p className={styles.slideBody}>You're asking a mind filled with anxiety to give you advice about how to feel at peace. You're asking the thing that's creating the noise to tell you how to find quiet. It can't do it.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 4: DAILY LIFE ── */}
      <section className={styles.slideSection} data-section="4">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>04</span>
            <img src={imageMap["oneroot"]} alt="Daily Life" onClick={() => openLightbox(imageMap["oneroot"], "Daily Life")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>In Daily Life</span>
            <h2 className={styles.slideHeading}>Working the <em>Case</em></h2>
            <p className={styles.slideBody}>You get a message at work that's slightly ambiguous. Immediately the mind starts working the case. "What did they mean? Should I reply now? What if they're upset with me?"</p>
            <p className={styles.slideBody}>Every time you engage — the mind gets louder. It takes the engagement as confirmation that the situation is real and serious. The more you try to solve it, the more it grows.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 5: THE SHIFT ── */}
      <section className={styles.slideSection} data-section="5">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>05</span>
            <img src={imageMap["futility"]} alt="The Shift" onClick={() => openLightbox(imageMap["futility"], "The Shift")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Shift</span>
            <h2 className={styles.slideHeading}>Stop Silencing.<br />Start <em>Watching</em>.</h2>
            <p className={styles.slideBody}>Singer says: stop trying to silence the mind. That doesn't work. What works is stepping back and watching it. Not fighting it. Not agreeing with it. Just watching.</p>
            <div className={styles.pullQuote}>When you step back, you stop being inside the story.</div>
          </div>
        </div>
      </section>

      {/* ── SLIDE 6: PATTERNS ── */}
      <section className={styles.slideSection} data-section="6">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>06</span>
            <img src={imageMap["escalating"]} alt="Patterns" onClick={() => openLightbox(imageMap["escalating"], "Patterns")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Patterns</span>
            <h2 className={styles.slideHeading}>Same Fear,<br /><em>Different Clothes</em></h2>
            <p className={styles.slideBody}>When you watch, you see the patterns. The same fear showing up in different situations. The same story — "I might not be okay" — playing out in a hundred variations.</p>
            <p className={styles.slideBody}>When you see the pattern clearly enough, you stop taking it so seriously. You stop believing that the endless narration holds the key to your wellbeing.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 7: GUIDED MEDITATION INTRO ── */}
      <div className={styles.chapterIntro} data-section="7">
        <div className={styles.chapterIntroInner}>
          <span className={styles.slideLabel} style={{ display: 'block', marginBottom: '1rem' }}>Guided Practice</span>
          <h2 className={styles.slideHeading} style={{ fontSize: '2.5rem' }}>Restoring the <em>Watcher</em></h2>
          <p className={styles.slideBody}>A 90-second journey to the golden center.</p>
        </div>
      </div>

      {/* ── SLIDE 8: GUIDED MEDITATION STEPS ── */}
      <section className={styles.slideSection} data-section="8">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
             <span className={styles.slideNumber}>08</span>
             <img src={imageMap["watcher"]} alt="Guided Meditation" onClick={() => openLightbox(imageMap["watcher"], "Guided Meditation")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <h2 className={styles.slideHeading}>Step Away From the <em>Noise</em></h2>
            <p className={styles.slideBody}>Close your eyes... Take one slow breath... Notice what the mind is currently saying.</p>
            <p className={styles.slideBody}>Don't answer it. Just see it like a cloud from a window. Now ask yourself: <strong>Who is noticing this?</strong></p>
            <div className={styles.pullQuote}>Rest there. The one noticing is perfectly still.</div>
          </div>
        </div>
      </section>

      {/* ── SLIDE 9: SUMMARY ── */}
      <div className={styles.practiceCard} data-section="9">
        <p className={styles.practiceCardEyebrow}>Summary</p>
        <h2 className={styles.practiceCardTitle}>Notice. Loosen.<br />Become the Watcher.</h2>
        <p className={styles.practiceCardBody}>The voice in your head is just a mechanism trying to protect you. You don't have to silence it; you only have to stop being it.</p>
        <div className={styles.practiceMantra}>"I am the one who is aware."</div>
      </div>

      {/* ── SLIDE 10: EXTRA SECTION HEADER ── */}
      <div className={styles.chapterIntro} data-section="10" style={{ backgroundColor: 'var(--parchment)', borderTop: '2px solid var(--gold)', marginTop: '8rem' }}>
        <div className={styles.chapterIntroInner}>
           <h2 className={styles.slideHeading} style={{ color: 'var(--gold)' }}>Extra Wisdom</h2>
           <p className={styles.slideBody}>Dive deeper into the technical mechanics of Singer's teaching after the YouTube session.</p>
        </div>
      </div>

      {/* ── SLIDE 11: PRACTICE (EXTRA) ── */}
      <section className={styles.slideSection} data-section="11">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["meditation"]} alt="The Practice" onClick={() => openLightbox(imageMap["meditation"], "The Practice")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Practice</span>
            <h2 className={styles.slideHeading}>Notice. Name.<br /><em>Detach</em>.</h2>
            <p className={styles.slideBody}>Today — just once — when the voice starts up with guilt, doubt, or fear, try naming it. "There's the worry voice." "There's the guilt loop."</p>
            <p className={styles.slideBody}>Don't fix it. Just see it as the mind doing its thing — the same way you'd notice a radio playing in another room.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 12: ANALOGY (EXTRA) ── */}
      <section className={styles.slideSection} data-section="12">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["listener"]} alt="The Radio Analogy" onClick={() => openLightbox(imageMap["listener"], "The Radio Analogy")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Analogy</span>
            <h2 className={styles.slideHeading}>You Are the <em>Listener</em>.<br />Not the Radio.</h2>
            <p className={styles.slideBody}>The space between the listener and the radio is the space of freedom. The radio keeps playing. But you are not the radio. And the distance between you and it — that is where peace lives.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 13: RESULT (EXTRA) ── */}
      <section className={styles.slideSection} data-section="13">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["grip"]} alt="The Result" onClick={() => openLightbox(imageMap["grip"], "The Result")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Result</span>
            <h2 className={styles.slideHeading}>Freedom <em>Inside</em> Life</h2>
            <p className={styles.slideBody}>The voice doesn't disappear. But its grip loosens. One day you realise the thing that used to spiral you for hours barely moved you at all.</p>
            <p className={styles.slideBody}>That's not distance from life. That's freedom inside it.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 14: RIVERBANK (EXTRA) ── */}
      <section className={styles.slideSection} data-section="14">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["riverbank"]} alt="The Riverbank" onClick={() => openLightbox(imageMap["riverbank"], "The Riverbank")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Visualization</span>
            <h2 className={styles.slideHeading}>You Are <em>the Riverbank</em></h2>
            <p className={styles.slideBody}>Thoughts are objects floating in the river. You are the bank — the unmoving observer on the shore. The bank does not become the leaf; it simply holds its ground while everything passes.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 15: DIAGNOSTIC MATRIX (EXTRA) ── */}
      <section className={styles.slideSection} data-section="15">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["matrix"]} alt="Diagnostic Matrix" onClick={() => openLightbox(imageMap["matrix"], "Diagnostic Matrix")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Mechanics</span>
            <h2 className={styles.slideHeading}>The Diagnostic <em>Matrix</em></h2>
            <p className={styles.slideBody}>Singer draws a clear line: In the engaged mind, "I am my thoughts." In witness consciousness, "I am the one noticing my thoughts." One path leads to circular feedback; the other to instant peace.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 16: THE GRIP (EXTRA) ── */}
      <section className={styles.slideSection} data-section="16">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["grip"]} alt="The Grip" onClick={() => openLightbox(imageMap["grip"], "The Grip")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <h2 className={styles.slideHeading}>The <em>Grip</em> Loosens</h2>
            <p className={styles.slideBody}>The grip is what engagement looks like in the body: Tension. Resistance. By softening, you transmute the energy, letting it pass through rather than fighting it.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 17: Stillness (EXTRA) ── */}
      <section className={styles.slideSection} data-section="17">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["stillness"]} alt="Internal Stillness" onClick={() => openLightbox(imageMap["stillness"], "Internal Stillness")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Promise</span>
            <h2 className={styles.slideHeading}>Stillness in <em>Chaos</em></h2>
            <p className={styles.slideBody}>The witness consciousness does not need the outer ring to quieten down. It simply remains at the centre, undisturbed by what cannot be controlled.</p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 18: ONE ROOT (EXTRA) ── */}
      <section className={styles.slideSection} data-section="18">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>Extra</span>
            <img src={imageMap["oneroot"]} alt="One Root" onClick={() => openLightbox(imageMap["oneroot"], "One Root")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Foundation</span>
            <h2 className={styles.slideHeading}>One Root,<br /><em>Ten Thousand Faces</em></h2>
            <p className={styles.slideBody}>Every worry is just the same fear wearing a different costume. Solve the root, and the costumes lose their power.</p>
          </div>
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
