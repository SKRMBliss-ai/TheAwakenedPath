import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../../lib/utils';
import styles from './Chap1Question1.module.css';
import { useCourseTracking } from '../../../hooks/useCourseTracking';
import { CourseHero } from './CourseHero';
import { CourseLightbox } from './CourseLightbox';
import { VoiceService } from '../../../services/voiceService';

const SLIDE_IMAGES: Record<string, string> = {
  "overview": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/06_MindAsTool.webp"),
  "slide1": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/01_BadMood.webp"),
  "slide2": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/02_QuestionAsked.webp"),
  "slide3": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/03_HigherMind.webp"),
  "slide4": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/04_Relax.webp"),
  "slide5": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/05_Transmutation.webp"),
  "slide6": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/06_MindAsTool.webp"),
  "slide7": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question1/07_Meditation.webp"),
};

const ALL_SLIDES = ["slide1", "slide2", "slide3", "slide4", "slide5", "slide6", "slide7"];
const TOTAL_SLIDES = 10;

interface Chap1Question1Props {
  onOpenJournal?: () => void;
}

export function Chap1Question1({ onOpenJournal }: Chap1Question1Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const { updateProgress } = useCourseTracking(user?.uid);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isNearBottom) {
        updateProgress('question1', { read: true });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [user?.uid, updateProgress]);

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

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () => setLightboxIndex(prev => (prev === null ? 0 : (prev + 1) % ALL_SLIDES.length));
  const prevLightbox = () => setLightboxIndex(prev => (prev === null ? 0 : (prev - 1 + ALL_SLIDES.length) % ALL_SLIDES.length));

  return (
    <div className={cn(styles.container, "scroll-container")} ref={containerRef} style={{ height: '100%', overflowY: 'auto' }}>
      <nav className={styles.navDots}>
        {Array.from({ length: TOTAL_SLIDES + 1 }).map((_, i) => (
          <button
            key={i}
            className={cn(styles.navDot, activeSection === i && styles.active)}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to section ${i}`}
          />
        ))}
      </nav>

      <CourseHero 
        chapter={1}
        question={1}
        title={<>How to Use the Mind<br />as a <strong>Tool</strong></>}
        subtitle="When a bad mood hits and the spiral begins — Singer's two honest answers for what to actually do"
        overviewImage={SLIDE_IMAGES["overview"]}
      />

      <CourseLightbox 
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        onNext={nextLightbox}
        onPrev={prevLightbox}
        currentIndex={lightboxIndex ?? 0}
        total={ALL_SLIDES.length}
        imgSrc={lightboxIndex !== null ? SLIDE_IMAGES[ALL_SLIDES[lightboxIndex]] : ''}
      />

      <div className={styles.openingBand}>
        <p>"Most of us assume the answer is better thinking. More positive thinking. Singer says: yes — that's actually a real technique. But it's only step one. There's something deeper available."</p>
      </div>

      {/* --- SLIDE 1 --- */}
      <section className={styles.slide} data-section="1">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>01</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide1"]} alt="The hook" onClick={() => openLightbox(0)} className={styles.clickableImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The hook</span>
            <h2 className={styles.slideH}>The Bad Mood<br /><em>That Just Hits</em></h2>
            <p className={styles.slideP}>You know this feeling. Nothing dramatic happened. But something shifts inside — and suddenly your mind is running. Replaying things. Criticising. Worrying. You didn't invite it. It just arrived.</p>
            <div className={styles.pull}>"Nothing happened. But something shifted."</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 2 --- */}
      <section className={styles.slide} data-section="2">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>02</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide2"]} alt="The question" onClick={() => openLightbox(1)} className={styles.clickableImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The question</span>
            <h2 className={styles.slideH}>The Question<br /><em>Most of Us Have Asked</em></h2>
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
              <img src={SLIDE_IMAGES["slide3"]} alt="Singer's model" onClick={() => openLightbox(2)} className={styles.clickableImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Singer's model</span>
            <h2 className={styles.slideH}>The Mind Has<br /><em>Two Layers</em></h2>
            <p className={styles.slideP}>The lower mind is the reactive layer — trained by every hurt, every fear, every difficult experience. The higher mind is the layer that can redirect.</p>
          </div>
        </div>
      </section>

      <div className={styles.layersBand} data-section="4">
        <div className={styles.layersBandInner}>
          <div className={cn(styles.layerCol, styles.lower)}>
            <span className={styles.layerLabel}>Layer one</span>
            <div className={styles.layerName}>The Lower Mind</div>
            <p className={styles.layerDesc}>Reactive. Trained by past experience.</p>
          </div>
          <div className={cn(styles.layerCol, styles.higher)}>
            <span className={styles.layerLabel}>Layer two</span>
            <div className={styles.layerName}>The Higher Mind</div>
            <p className={styles.layerDesc}>Conscious. Capable of lifting you out.</p>
          </div>
        </div>
      </div>

      {/* --- SLIDE 4 --- */}
      <section className={styles.slide} data-section="5">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>04</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide4"]} alt="Step one" onClick={() => openLightbox(3)} className={styles.clickableImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Step one</span>
            <h2 className={styles.slideH}>Use the Higher Mind.<br /><em>"I Can Handle This."</em></h2>
            <p className={styles.slideP}>Singer's first practical answer: use an affirmation. "I can handle this." Not as a magic formula, but as a way to redirect energy upward.</p>
          </div>
        </div>
      </section>

      <div className={styles.mantraCard} data-section="6">
        <span className={styles.mantraTag}>The affirmation practice</span>
        <h2 className={styles.mantraTitle}>"I can handle this."</h2>
        <p className={styles.mantraBody}>Repeat it. Over and over. You are taking the energy that was about to collapse and redirecting it upward.</p>
      </div>

      {/* --- SLIDE 5 --- */}
      <section className={styles.slide} data-section="7">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>05</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide5"]} alt="Step two" onClick={() => openLightbox(4)} className={styles.clickableImg} crossOrigin="anonymous" />
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
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>06</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide6"]} alt="The real teaching" onClick={() => openLightbox(5)} className={styles.clickableImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The real teaching</span>
            <h2 className={styles.slideH}>Neither <em>Collapse Nor Fight</em></h2>
            <p className={styles.slideP}>Collapse makes it louder. Fighting makes it louder. Transmutation is the third option: simply relax and let it pass through.</p>
          </div>
        </div>
      </section>

      {/* --- SLIDE 7 --- */}
      <section className={styles.slide} data-section="9">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>07</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide7"]} alt="The mind as tool" onClick={() => openLightbox(6)} className={styles.clickableImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Conclusion</span>
            <h2 className={styles.slideH}>The Mind Is a <em>Tool</em></h2>
            <p className={styles.slideP}>The mind is a tool, not who you are. Stop asking the problem to solve itself. Soften and let it pass through.</p>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="10">
        <div className={styles.closingInner}>
          <span className={styles.closingTag}>End of Chapter 1 · Question 1</span>
          <h2 className={styles.closingTitle}>Both Paths Are<br /><em>Available Right Now</em></h2>
          <button className={styles.closingButton} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}

