import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Chap1Question1.module.css';

const imageMap: Record<string, string> = {
  "Slide8.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780736954.png",
  "Slide9.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780739975.jpg",
  "Slide13.PNG": "/WisdomUntethered/Chap1/Question1/media__1774780742719.jpg",
  "Slide11.PNG": "/WisdomUntethered/Chap1/Question1/media__1774780745387.png",
  "Slide12.PNG": "/WisdomUntethered/Chap1/Question1/media__1774780747692.jpg",
  "Slide14.PNG": "/WisdomUntethered/Chap1/Question1/media__1774780798472.jpg",
  "Slide15.PNG": "/WisdomUntethered/Chap1/Question1/media__1774780800868.png",
  "Slide10.PNG": "/WisdomUntethered/Chap1/Question1/media__1774780802802.png",
  "Slide3.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780804567.jpg",
  "Slide4.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780806465.jpg",
  "Slide5.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780817160.jpg",
  "Slide2.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780818809.png",
  "Slide6.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780821170.jpg",
  "Slide7.PNG":  "/WisdomUntethered/Chap1/Question1/media__1774780822978.jpg",
};

const TOTAL_SLIDES = 16; // sections data-section="0" … "15"

export function Chap1Question1() {
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

    container.querySelectorAll(`.${styles.slideSection}, .${styles.fullImageSlide}`).forEach(s => {
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
        <div className={styles.heroEyebrow}>Wisdom Untethered · Chapter 1 · The Mind</div>
        <h1 className={styles.heroTitle}>Why You Feel <em>Numb</em><br />When Nothing Is Wrong</h1>
        <div className={styles.heroDivider}></div>
        <p className={styles.heroSubtitle}>A lesson on the heart that closes — and how to open it again</p>
        <div className={styles.heroScroll}>Scroll</div>
      </section>

      {/* ── INTRO BAND ── */}
      <div className={styles.chapterIntro}>
        <div className={styles.chapterIntroInner}>
          <p>"The most important thing you can do in life is recognise that you are not your mind. That voice in your head — it never stops talking. But here's what it never tells you: you have a heart that can close. And when it does, the whole world goes quiet in the wrong way."</p>
        </div>
      </div>

      {/* ── SLIDE 1 ── */}
      <section className={styles.slideSection} data-section="1">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>01</span>
            <img src={imageMap["Slide8.PNG"]} alt="The Feeling Nobody Talks About" onClick={() => openLightbox(imageMap["Slide8.PNG"], "The Feeling Nobody Talks About")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Where it begins</span>
            <h2 className={styles.slideHeading}>The Feeling <em>Nobody<br />Talks About</em></h2>
            <p className={styles.slideBody}>There's a state that isn't quite sadness. It isn't depression. It isn't anxiety. It's a kind of flatness — a muffled quality to life where things happen around you but don't quite reach you. Everything looks fine on the outside. Inside, something has gone quiet.</p>
            <p className={styles.slideBody}>This is what Singer calls the closed heart. And it's far more common than anyone admits.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 2 ── */}
      <section className={styles.slideSection} data-section="2">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>02</span>
            <img src={imageMap["Slide9.PNG"]} alt="It's Not Quite Depression" onClick={() => openLightbox(imageMap["Slide9.PNG"], "It's Not Quite Depression")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The search for a name</span>
            <h2 className={styles.slideHeading}><em>It's Not Quite</em><br />Depression…</h2>
            <p className={styles.slideBody}>You've Googled it. You've tried to fit it into a category — anxiety, burnout, low mood. But the label never quite fits. Because what you're experiencing isn't a disorder. It's a pattern.</p>
            <div className={styles.pullQuote}>"Why do I feel empty?" — the question the mind keeps asking, never finding the answer inside itself.</div>
            <p className={styles.slideBody}>The mind can't solve this one. Because the mind isn't where it lives.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 3 ── */}
      <section className={styles.slideSection} data-section="3">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>03</span>
            <img src={imageMap["Slide13.PNG"]} alt="When You Felt Truly Alive" onClick={() => openLightbox(imageMap["Slide13.PNG"], "When You Felt Truly Alive")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The contrast</span>
            <h2 className={styles.slideHeading}>When You Felt <br /><em>Truly Alive</em></h2>
            <p className={styles.slideBody}>You know the difference. There are moments — maybe rare, maybe distant now — when you felt completely open. When life landed on you fully. When a piece of music, a conversation, a moment in nature seemed to arrive without any barrier between you and it.</p>
            <p className={styles.slideBody}>That openness is your heart's natural state. The closedness is what happens when life hurts and we protect ourselves.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 4 ── */}
      <section className={styles.slideSection} data-section="4">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>04</span>
            <img src={imageMap["Slide11.PNG"]} alt="Building The Inner Walls" onClick={() => openLightbox(imageMap["Slide11.PNG"], "Building The Inner Walls")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>How it happens</span>
            <h2 className={styles.slideHeading}>Building the<br /><em>Inner Walls</em></h2>
            <p className={styles.slideBody}>Life hurts us. Someone rejects us. Something fails. And in that moment, the heart does something completely natural — it protects itself. It closes around the hurt, like a fist clenching.</p>
            <p className={styles.slideBody}>One closure. Then another. Then another. Over years, those protective movements build walls. What began as a single act of self-protection becomes a structure you live inside — without even knowing it was built.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 5 ── */}
      <section className={styles.slideSection} data-section="5">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>05</span>
            <img src={imageMap["Slide12.PNG"]} alt="Locking Out Life" onClick={() => openLightbox(imageMap["Slide12.PNG"], "Locking Out Life")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The cost</span>
            <h2 className={styles.slideHeading}><em>Locking Out</em><br />Life</h2>
            <p className={styles.slideBody}>Here's the painful irony: the walls that protected you from hurt also lock out everything else. Beauty. Connection. Spontaneous joy. All of it is out there — but you're inside, behind the structure you built to stay safe.</p>
            <div className={styles.pullQuote}>The same wall that keeps pain out keeps life out too.</div>
            <p className={styles.slideBody}>And the numbness you feel isn't emptiness. It's fullness that can't get through.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 6 ── */}
      <section className={styles.slideSection} data-section="6">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>06</span>
            <img src={imageMap["Slide14.PNG"]} alt="The River & The Clench" onClick={() => openLightbox(imageMap["Slide14.PNG"], "The River & The Clench")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Singer's model</span>
            <h2 className={styles.slideHeading}>The River<br /><em>&amp; The Clench</em></h2>
            <p className={styles.slideBody}>Singer describes life energy as a river — a constant, natural flow moving through you. When the heart is open, it flows. When something disturbs us and we close around it, we clench. The river is still there. But it can't get through.</p>
            <p className={styles.slideBody}>That blockage — that strangled, dimmed quality — is what we feel as numbness. We're not broken. We're clenched. And a clench can always be released.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 7 ── */}
      <section className={styles.slideSection} data-section="7">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>07</span>
            <img src={imageMap["Slide15.PNG"]} alt="Notice The Tightening" onClick={() => openLightbox(imageMap["Slide15.PNG"], "Notice The Tightening")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The signal</span>
            <h2 className={styles.slideHeading}><em>Notice</em> the<br />Tightening</h2>
            <p className={styles.slideBody}>The heart doesn't close silently. There's always a signal — a tightening in the chest, a pulling inward, a subtle hardening. Resentment, dismissiveness, a sudden flatness in the middle of something that should matter to you.</p>
            <p className={styles.slideBody}>These aren't personality traits. They're moments of closing. And the extraordinary thing Singer points to is this: you can learn to notice the closing as it happens. That noticing is the beginning of everything.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 8 ── */}
      <section className={styles.slideSection} data-section="8">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>08</span>
            <img src={imageMap["Slide10.PNG"]} alt="What Is It Actually?" onClick={() => openLightbox(imageMap["Slide10.PNG"], "What Is It Actually?")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The path forward</span>
            <h2 className={styles.slideHeading}>What Is It<br /><em>Actually?</em></h2>
            <p className={styles.slideBody}>Three steps. Not complicated. Not easy — but simple.</p>
            <p className={styles.slideBody}><strong style={{ color: 'var(--gold)', fontWeight: 400 }}>See what it is.</strong> Not depression. Not a character flaw. A closed heart — a protective movement that outlived its usefulness.</p>
            <p className={styles.slideBody}><strong style={{ color: 'var(--gold)', fontWeight: 400 }}>The practice.</strong> Five seconds. That's all. The moment of closing is the moment of practice.</p>
            <p className={styles.slideBody}><strong style={{ color: 'var(--gold)', fontWeight: 400 }}>The shift.</strong> Over time, as you choose not to close, the energy rises. The walls thin. Life gets back in.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 9 ── */}
      <section className={styles.slideSection} data-section="9">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>09</span>
            <img src={imageMap["Slide3.PNG"]} alt="Softening Beats Trying Harder" onClick={() => openLightbox(imageMap["Slide3.PNG"], "Softening Beats Trying Harder")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The counterintuitive truth</span>
            <h2 className={styles.slideHeading}><em>Softening</em><br />Beats Trying Harder</h2>
            <p className={styles.slideBody}>Everything in us wants to push. To force. To will ourselves into feeling better. But Singer points to the opposite direction: softening. Not collapse — not giving up — but releasing the clench.</p>
            <div className={styles.pullQuote}>"If you stay relaxed, the energy that was about to get caught in negativity will actually rise up inside you."</div>
            <p className={styles.slideBody}>You can't muscle your way to an open heart. But you can soften your way there.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 10 ── */}
      <section className={styles.fullImageSlide} data-section="10">
        <img src={imageMap["Slide4.PNG"]} alt="Let's Soften Right Now" onClick={() => openLightbox(imageMap["Slide4.PNG"], "Let's Soften Right Now")} className={styles.clickableImg} />
        <div className={styles.slideContent} style={{ textAlign: 'center' }}>
          <span className={styles.slideLabel} style={{ display: 'block' }}>A moment of practice</span>
          <h2 className={styles.slideHeading}>"Let's Soften<br /><em>Right Now"</em></h2>
          <p className={styles.slideBody} style={{ maxWidth: '520px', margin: '0 auto' }}>Close your eyes if you can. Notice whatever is tight in your chest, your jaw, your shoulders. Don't try to fix it. Just notice it. And for one breath — soften around it. Not away from it. Around it. Feel the difference.</p>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 11 ── */}
      <section className={styles.slideSection} data-section="11">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>11</span>
            <img src={imageMap["Slide5.PNG"]} alt="Loosening The Fist" onClick={() => openLightbox(imageMap["Slide5.PNG"], "Loosening The Fist")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>What opens</span>
            <h2 className={styles.slideHeading}>Loosening<br /><em>the Fist</em></h2>
            <p className={styles.slideBody}>When the fist opens, something flows back in. Singer calls it aliveness — the natural energetic state of an open heart. It isn't euphoria. It's something quieter and more reliable: a quality of being present, available, fully here.</p>
            <p className={styles.slideBody}>The open hand can receive what the closed fist cannot.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 12 ── */}
      <section className={styles.slideSection} data-section="12">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>12</span>
            <img src={imageMap["Slide2.PNG"]} alt="How The Walls Come Down" onClick={() => openLightbox(imageMap["Slide2.PNG"], "How The Walls Come Down")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The long arc</span>
            <h2 className={styles.slideHeading}>How the Walls<br /><em>Come Down</em></h2>
            <p className={styles.slideBody}>Not all at once. That's not how this works. The walls came up one closure at a time — one hurt responded to with protection. And they come down the same way. One moment at a time. One choice not to close, where you would have closed before.</p>
            <p className={styles.slideBody}>Singer is clear: you won't always succeed. You'll get pulled in. That's fine. What matters is that you keep returning to the practice — not as punishment, but as the natural next step.</p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>✦</span></div>

      {/* ── SLIDE 13 ── */}
      <section className={styles.slideSection} data-section="13">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>13</span>
            <img src={imageMap["Slide6.PNG"]} alt="On The Other Side" onClick={() => openLightbox(imageMap["Slide6.PNG"], "On The Other Side")} className={styles.clickableImg} />
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The result</span>
            <h2 className={styles.slideHeading}>On the<br /><em>Other Side…</em></h2>
            <p className={styles.slideBody}>Singer's promise, earned over decades of practice: the things that used to close you — the dismissive comment, the unexpected news, the small daily friction — gradually lose their power. Not because they stop happening. Because you stop clenching around them.</p>
            <div className={styles.pullQuote}>Stop closing. That's the whole practice.</div>
            <p className={styles.slideBody}>And on the other side of that discipline is a kind of freedom that is steady and available — not dependent on circumstances going well.</p>
          </div>
        </div>
      </section>

      {/* ── PRACTICE CARD ── */}
      <div className={styles.practiceCard} data-section="14">
        <p className={styles.practiceCardEyebrow}>The 5-Second Practice</p>
        <h2 className={styles.practiceCardTitle}>"I'm Not Going to<br />Close Around This."</h2>
        <p className={styles.practiceCardBody}>The next time you feel the tightening — in a conversation, in traffic, reading a message — you have a 5-second window. That's the moment of practice. Not later. Not in meditation. Right there, in the middle of it.</p>
        <div className={styles.practiceMantra}>"I'm NOT going to close around this."</div>
        <p className={styles.practiceCardBody}>You don't have to feel calm. You don't have to fix the situation. You just have to refuse the clench. Relax the area around your heart — not forcing it open, just refusing to pull it shut. That's the whole thing. Do it once today. Then again tomorrow.</p>
      </div>

      {/* ── SLIDE 15 ── */}
      <section className={styles.fullImageSlide} data-section="15">
        <img src={imageMap["Slide7.PNG"]} alt="Stay With The Feeling" onClick={() => openLightbox(imageMap["Slide7.PNG"], "Stay With The Feeling")} className={styles.clickableImg} />
        <div className={styles.slideContent} style={{ textAlign: 'center' }}>
          <span className={styles.slideLabel} style={{ display: 'block' }}>Your invitation</span>
          <h2 className={styles.slideHeading}><em>Stay</em> With<br />the Feeling</h2>
          <p className={styles.slideBody} style={{ maxWidth: '520px', margin: '0 auto' }}>After the video. After this lesson. Notice what's alive in you right now. Write it down — not what you thought, but what you felt. That thread is worth following. That's where the real work lives.</p>
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section className={styles.closing}>
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow}>End of Chapter 1 · Question 1</p>
          <h2 className={styles.closingTitle}>You Are Not<br />Your Closed Heart</h2>
          <p className={styles.closingBody}>The closing was protection. The opening is freedom. And the distance between the two is nothing more than a single breath, a softening, a choice not to clench one more time.</p>
          <button className={styles.closingJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
