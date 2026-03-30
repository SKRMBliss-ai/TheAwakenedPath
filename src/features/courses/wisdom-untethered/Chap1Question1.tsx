/* Chap1Question1.tsx */
import { useEffect, useRef, useState } from 'react';
import styles from './Chap1Question1.module.css';

const darkImages: Record<string, string> = {
  "slide1": "/WisdomUntethered/Chap1/Question1/01_BadMood.png",
  "slide2": "/WisdomUntethered/Chap1/Question1/02_QuestionAsked.png",
  "slide3": "/WisdomUntethered/Chap1/Question1/03_HigherMind.png",
  "slide4": "/WisdomUntethered/Chap1/Question1/04_Relax.png",
  "slide5": "/WisdomUntethered/Chap1/Question1/05_Transmutation.png",
  "slide6": "/WisdomUntethered/Chap1/Question1/06_MindAsTool.png",
  "slide7": "/WisdomUntethered/Chap1/Question1/07_Meditation.png",
  "placeholder_alive": "/WisdomUntethered/Chap1/Question1/01_BadMood.png",
};

const lightImages: Record<string, string> = {
  "slide1": "/WisdomUntethered/Chap1/Question1/01_BadMood_light.png",
  "slide2": "/WisdomUntethered/Chap1/Question1/02_QuestionAsked_light.png",
  "slide3": "/WisdomUntethered/Chap1/Question1/03_HigherMind_light.png",
  "slide4": "/WisdomUntethered/Chap1/Question1/04_Relax_light.png",
  "slide5": "/WisdomUntethered/Chap1/Question1/05_Transmutation_light.png",
  "slide6": "/WisdomUntethered/Chap1/Question1/06_MindAsTool_light.png",
  "slide7": "/WisdomUntethered/Chap1/Question1/07_Meditation_light.jpeg",
  "placeholder_alive": "/WisdomUntethered/Chap1/Question1/01_BadMood_light.png",
};

const ALL_SLIDES = ["slide1", "slide2", "slide3", "slide4", "slide5", "slide6", "slide7"];

const TOTAL_SLIDES = 13; // sections data-section="0" ... "12"

interface Chap1Question1Props {
  onOpenJournal?: () => void;
}

export function Chap1Question1({ onOpenJournal }: Chap1Question1Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // ── Theme detection ──
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark'
  );
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark'
      );
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => obs.disconnect();
  }, []);
  const imageMap = isDark ? darkImages : lightImages;

  // ── Lightbox ──
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

    container.querySelectorAll(`.${styles.slide}, .${styles.mantraCard}, .${styles.threeOptions}, .${styles.meditationBand}, .${styles.layersBand}`).forEach(s => {
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

  const goLightboxNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % ALL_SLIDES.length));
  };
  const goLightboxPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + ALL_SLIDES.length) % ALL_SLIDES.length));
  };


  // ── Keyboard shortcuts ──
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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const dots = Array.from({ length: TOTAL_SLIDES });

  return (
    <div
      className={styles.container}
      ref={containerRef}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />


      {/* --- Nav Dots --- */}
      <nav className={styles.navDots}>
        {dots.map((_, i) => (
          <button
            key={i}
            className={`${styles.navDot} ${activeSection === i ? styles.active : ''}`}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </nav>


      {/* --- Lightbox --- */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)}>
          <button className={styles.lightboxClose}>✕</button>
          <img 
            src={imageMap[ALL_SLIDES[lightboxIndex]]} 
            alt="Enlarged view" 
            className={styles.lightboxImg} 
            onClick={e => e.stopPropagation()} 
          />
          <div className={styles.lightboxNav}>
            <button className={styles.lightboxNavBtn} onClick={(e) => { e.stopPropagation(); goLightboxPrev(); }}>←</button>
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {ALL_SLIDES.length}
            </div>
            <button className={styles.lightboxNavBtn} onClick={(e) => { e.stopPropagation(); goLightboxNext(); }}>→</button>
          </div>
        </div>
      )}

      {/* --- HERO --- */}
      <section className={styles.hero} data-section="0">
        <div className={styles.heroEyebrow}>Wisdom Untethered · Chapter 1 · Question 1</div>
        <h1 className={styles.heroTitle}>How to Use the Mind<br />as a <strong>Tool</strong></h1>
        <div className={styles.heroRule}></div>
        <p className={styles.heroSub}>When a bad mood hits and the spiral begins — Singer's two honest answers for what to actually do</p>
        <div className={styles.heroScroll}>Scroll</div>
      </section>

      {/* --- OPENING BAND --- */}
      <div className={styles.openingBand}>
        <p>"Most of us assume the answer is better thinking. More positive thinking. Singer says: yes — that's actually a real technique. But it's only step one. There's something deeper available."</p>
      </div>

      {/* --- SLIDE 1 --- */}
      <section className={styles.slide} data-section="1">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>01</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide1"]} alt="The hook" onClick={() => openLightbox(0)} className={styles.clickableImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The hook</span>
            <h2 className={styles.slideH}>The Bad Mood<br /><em>That Just Hits</em></h2>
            <p className={styles.slideP}>You know this feeling. Nothing dramatic happened. But something shifts inside — and suddenly your mind is running. Replaying things. Criticising. Worrying. You didn't invite it. It just arrived.</p>
            <p className={styles.slideP}>And the harder you try to think your way out of it, the worse it gets. The mind that's creating the spiral is being asked to solve the spiral. That's the trap most of us are stuck in.</p>
            <div className={styles.pull}>"Nothing happened. But something shifted."</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 2 --- */}
      <section className={styles.slide} data-section="2">
        <div className={`${styles.slideGrid} ${styles.flip}`}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>02</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide2"]} alt="The question" onClick={() => openLightbox(1)} className={styles.clickableImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The question</span>
            <h2 className={styles.slideH}>The Question<br /><em>Most of Us Have Asked</em></h2>
            <p className={styles.slideP}>This lesson is based on the very first question in Wisdom Untethered — from the opening chapter called The Mind, in the section called The Foundation.</p>
            <p className={styles.slideP}>Someone asked Michael Singer: "How can I use the mind as a tool to escape negative thoughts or feelings?" Most of us have already asked this in some form.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 3 --- */}
      <section className={styles.slide} data-section="3">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>03</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide3"]} alt="Singer's model" onClick={() => openLightbox(2)} className={styles.clickableImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Singer's model</span>
            <h2 className={styles.slideH}>The Mind Has<br /><em>Two Layers</em></h2>
            <p className={styles.slideP}>The lower mind is the reactive layer — trained by every hurt, every fear, every difficult experience. The higher mind is the layer that can redirect.</p>
          </div>
        </div>
      </section>

      {/* --- LAYERS INTERLUDE --- */}
      <div className={styles.layersBand} data-section="4">
        <div className={styles.layersBandInner}>
          <div className={`${styles.layerCol} ${styles.lower}`}>
            <span className={styles.layerLabel}>Layer one</span>
            <div className={styles.layerName}>The Lower Mind</div>
            <p className={styles.layerDesc}>Reactive. Trained by past experience. Pulls you automatically toward old patterns.</p>
          </div>
          <div className={`${styles.layerCol} ${styles.higher}`}>
            <span className={styles.layerLabel}>Layer two</span>
            <div className={styles.layerName}>The Higher Mind</div>
            <p className={styles.layerDesc}>Conscious. Capable of lifting you out of conditioned patterns.</p>
          </div>
        </div>
        <p className={styles.layersBandQ}>Which one are you feeding right now?</p>
      </div>

      {/* --- SLIDE 4 --- */}
      <section className={styles.slide} data-section="5">
        <div className={`${styles.slideGrid} ${styles.flip}`}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>04</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide4"]} alt="Step one" onClick={() => openLightbox(3)} className={styles.clickableImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Step one</span>
            <h2 className={styles.slideH}>Use the Higher Mind.<br /><em>"I Can Handle This."</em></h2>
            <p className={styles.slideP}>Singer's first practical answer: use an affirmation. "I can handle this." Not as a magic formula, but as a way to redirect energy upward.</p>
          </div>
        </div>
      </section>

      {/* --- MANTRA CARD --- */}
      <div className={styles.mantraCard} data-section="6">
        <span className={styles.mantraTag}>The affirmation practice</span>
        <h2 className={styles.mantraTitle}>When the Spiral Begins —<br />Say This Instead</h2>
        <div className={styles.mantraHighlight}>"I can handle this."</div>
        <p className={styles.mantraBody}>Repeat it. Over and over. You are taking the energy that was about to collapse and redirecting it upward.</p>
      </div>

      {/* --- SLIDE 5 --- */}
      <section className={styles.slide} data-section="7">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>05</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide5"]} alt="Step two" onClick={() => openLightbox(4)} className={styles.clickableImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Step two</span>
            <h2 className={styles.slideH}><em>Relax</em> in the<br />Face of It</h2>
            <p className={styles.slideP}>The deeper level: relax. Let go. If you stay relaxed, the energy transmutes and rises up inside you.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 6 --- */}
      <section className={styles.slide} data-section="8">
        <div className={`${styles.slideGrid} ${styles.flip}`}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>06</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide6"]} alt="The third option" onClick={() => openLightbox(5)} className={styles.clickableImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The third option</span>
            <h2 className={styles.slideH}>Transmutation:<br /><em>Neither Collapse Nor Fight</em></h2>
            <p className={styles.slideP}>Collapse makes it louder. Fighting makes it louder. Transmutation is the third option: simply relax and let it pass through.</p>
          </div>
        </div>
      </section>

      {/* --- THREE OPTIONS --- */}
      <div className={styles.threeOptions} data-section="9">
        <div className={styles.threeOptionsInner}>
          <div className={styles.threeOptionsHeader}>
            <span className={styles.threeOptionsEyebrow}>Singer's three options</span>
            <h2 className={styles.threeOptionsTitle}>What to Do When a Negative Feeling Arrives</h2>
          </div>
          <div className={styles.optionsGrid}>
            <div className={`${styles.optionCard} ${styles.bad}`}>
              <div className={styles.optionIcon}>↓</div>
              <div className={styles.optionName}>Collapse</div>
              <span className={styles.optionResult}>Makes it louder</span>
            </div>
            <div className={`${styles.optionCard} ${styles.worse}`}>
              <div className={styles.optionIcon}>✕</div>
              <div className={styles.optionName}>Fight</div>
              <span className={styles.optionResult}>Also makes it louder</span>
            </div>
            <div className={`${styles.optionCard} ${styles.third}`}>
              <div className={styles.optionIcon}>↑</div>
              <div className={styles.optionName}>Transmute</div>
              <span className={styles.optionResult}>The energy rises</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SLIDE 7 --- */}
      <section className={styles.slide} data-section="10">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>07</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide7"]} alt="The real teaching" onClick={() => openLightbox(6)} className={styles.clickableImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The real teaching</span>
            <h2 className={styles.slideH}>The Mind Is a Tool.<br /><em>Not Who You Are.</em></h2>
            <p className={styles.slideP}>The mind is a tool, not who you are. Stop asking the problem to solve itself. Soften and let it pass through.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- MEDITATION BAND --- */}
      <div className={styles.meditationBand} data-section="11">
        <div className={styles.meditationInner}>
          <span className={styles.meditationEyebrow}>Guided meditation</span>
          <h2 className={styles.meditationTitle}>Soften Around It</h2>
          <div className={styles.meditationStep}>
            <span className={styles.meditationStepLabel}>Steps</span>
            <p>Settle. Notice. Watch. Soften. Transmute. Return.</p>
          </div>
        </div>
      </div>


      {/* --- CLOSING --- */}
      <section className={styles.closing} data-section="12">
        <div className={styles.closingInner}>
          <span className={styles.closingTag}>End of Chapter 1 · Question 1</span>
          <h2 className={styles.closingTitle}>Both Paths Are<br /><em>Available Right Now</em></h2>
          <p className={styles.closingBody}>Redirect or Transmute. Choose one today.</p>
          <button className={styles.closingButton} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
