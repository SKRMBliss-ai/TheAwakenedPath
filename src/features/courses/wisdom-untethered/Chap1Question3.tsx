import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { DailyPracticeCard } from '../../practices/DailyPracticeCard';
import { cn } from '../../../lib/utils';
import styles from './Chap1Question3.module.css';
import commonStyles from './CourseCommon.module.css';
import { useCourseTracking } from '../../../hooks/useCourseTracking';
import { CourseHero } from './CourseHero';
import { CourseLightbox } from './CourseLightbox';
import { VoiceService } from '../../../services/voiceService';

interface Chap1Question3Props {
  onOpenJournal?: () => void;
}

export function Chap1Question3({ onOpenJournal }: Chap1Question3Props) {
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
        updateProgress('question3', { read: true });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [user?.uid, updateProgress]);

  const [activeSection, setActiveSection] = useState(0);
  const [isDark, setIsDark] = useState(true);

  // ── Lightbox ──
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const ALL_SLIDES = [
    "Slide2.webp", "Slide1.webp", "Slide3.webp", 
    "Slide4.webp", "Slide5.webp", "Slide6.webp", 
    "Slide7.webp", "Slide8.webp", "Slide9.webp"
  ];

  const goLightboxNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % ALL_SLIDES.length));
  };

  const goLightboxPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + ALL_SLIDES.length) % ALL_SLIDES.length));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  // Theme Detection
  useEffect(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    setIsDark(isCurrentlyDark);
    
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = containerRef.current?.querySelectorAll('[data-section]');
    if (!sections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            const sectionIndex = parseInt(entry.target.getAttribute('data-section') || '0');
            setActiveSection(sectionIndex);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const totalSections = 12; 

  const scrollToSection = (index: number) => {
    const section = containerRef.current?.querySelector(`[data-section="${index}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const FILE_MAP: Record<string, { dark: string, light: string }> = {
    "Slide1": { dark: "Slide1.webp", light: "Slide1.webp" },
    "Slide2": { dark: "Slide2.webp", light: "Slide2.webp" },
    "Slide3": { dark: "Slide3.webp", light: "Slide3.webp" },
    "Slide4": { dark: "Slide4.webp", light: "Slide4Car.webp" },
    "Slide5": { dark: "Slide5.webp", light: "Slide5.webp" },
    "Slide6": { dark: "Slide6.webp", light: "Slide6.webp" },
    "Slide7": { dark: "Slide7.webp", light: "Slide7.webp" },
    "Slide8": { dark: "Slide8.webp", light: "Slide8.webp" },
    "Slide9": { dark: "Slide9.webp", light: "Slide9.webp" },
    "Practice": { dark: "Practice.webp", light: "Practice.webp" }
  };

  const getImgPath = (name: string) => {
    const baseName = name.replace(/\.[^/.]+$/, "");
    const mapping = FILE_MAP[baseName];
    
    const filename = mapping 
      ? (isDark ? mapping.dark : mapping.light) 
      : `${baseName}${isDark ? '.webp' : '.webp'}`;
      
    return VoiceService.getStorageUrl(`/WisdomUntethered/Chap1/Question3/${isDark ? '' : 'Light/'}${filename}`);
  };

  return (
    <div className={cn(styles.container, "scroll-container")} ref={containerRef} style={{ height: '100%', overflowY: 'auto' }}>
      
      <CourseHero 
        chapter={1}
        question={3}
        title={<>The Mind That Thinks<br />It Is the <strong>Centre of the Universe</strong></>}
        subtitle="How to shift from the narrow personal frame — to the vast, peaceful, impersonal one"
      />

      <CourseLightbox 
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNext={goLightboxNext}
        onPrev={goLightboxPrev}
        currentIndex={lightboxIndex ?? 0}
        total={ALL_SLIDES.length}
        imgSrc={lightboxIndex !== null ? getImgPath(ALL_SLIDES[lightboxIndex]) : ''}
      />

      <nav className={styles.navDots}>
        {Array.from({ length: totalSections }).map((_, i) => (
          <button
            key={i}
            className={cn(styles.navDot, activeSection === i && styles.active)}
            aria-label={`Section ${i + 1}`}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </nav>

      <div className={styles.openingBand}>
        <p>"The personal mind has a very small frame of reference. Singer says there is a much larger frame available — and it takes only one second to access it."</p>
      </div>

      <section className={styles.slide} data-section="1">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(0)}>
            <span className={styles.slideNum}>01</span>
            <img src={getImgPath('Slide2.webp')} alt="You are on a planet" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>Reality check</span>
            <h2 className={styles.slideH}>You Are on<br /><em>a Planet</em></h2>
            <p className={styles.slideP}>In this very moment, you are standing on a small ball of rock and water, spinning through an incomprehensibly vast universe at extraordinary speed — without any effort on your part.</p>
            <p className={styles.slideP}>Actually feeling this truth is the first bridge from the narrow personal mind to the vast impersonal one.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      <section className={styles.slide} data-section="2">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(1)}>
            <span className={styles.slideNum}>02</span>
            <img src={getImgPath('Slide1.webp')} alt="The narrow personal frame" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>The Observation</span>
            <h2 className={styles.slideH}>The Mind's<br /><em>Very Small Frame</em></h2>
            <p className={styles.slideP}>The personal mind has a narrow field of vision. It filters everything through a single question: "How does this affect me?"</p>
            <p className={styles.slideP}>This self-focused frame generates constant worry about reputation, plans, and yesterday's words, consuming virtually all of your mental energy.</p>
            <div className={commonStyles.pull}>The mind is not broken; it is simply addicted to thinking about itself.</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      <section className={styles.slide} data-section="3">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(2)}>
            <span className={styles.slideNum}>03</span>
            <img src={getImgPath('Slide3.webp')} alt="Personal vs impersonal mind" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>Singer's model</span>
            <h2 className={styles.slideH}><em>Personal</em> vs<br />Impersonal Thinking</h2>
            <p className={styles.slideP}>The personal mind is absorbed in individual desires and fears — the small story of your life. The impersonal mind is the deeper level that observes the larger reality.</p>
            <p className={styles.slideP}>Training yourself to access the impersonal level isn't a spiritual achievement; it's a practical daily shift in where you rest your attention.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 4 --- */}
      <section className={styles.slide} data-section="4">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(3)}>
            <span className={styles.slideNum}>04</span>
            <img src={getImgPath('Slide4.webp')} alt="The Car Analogy" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>The Car Analogy</span>
            <h2 className={styles.slideH}>You Are the <em>Driver</em></h2>
            <p className={styles.slideP}>Most people are like passengers in the backseat of their own car, screaming as the mind drives wherever it wants. But you can climb into the driver's seat.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 5 --- */}
      <section className={styles.slide} data-section="5">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(4)}>
            <span className={styles.slideNum}>05</span>
            <img src={getImgPath('Slide5.webp')} alt="The Universe" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>The Universe</span>
            <h2 className={styles.slideH}>Resting in the <em>Vastness</em></h2>
            <p className={styles.slideP}>When you shift to the impersonal mind, the drama of your day feels much less significant. You aren't ignoring it; you're just seeing it in its true context.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 6 --- */}
      <section className={styles.slide} data-section="6">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(5)}>
            <span className={styles.slideNum}>06</span>
            <img src={getImgPath('Slide6.webp')} alt="The Witness" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>The Witness</span>
            <h2 className={styles.slideH}>Step <em>Entirely</em> Back</h2>
            <p className={styles.slideP}>The goal isn't to fix the personal mind, but to step entirely back into the one who sees the personal mind.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 7 --- */}
      <section className={styles.slide} data-section="7">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(6)}>
            <span className={styles.slideNum}>07</span>
            <img src={getImgPath('Slide7.webp')} alt="The Ocean" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>The Ocean</span>
            <h2 className={styles.slideH}>Waves vs <em>Depths</em></h2>
            <p className={styles.slideP}>The personal mind is the choppy surface of the ocean. The impersonal mind is the deep, silent water beneath.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 8 --- */}
      <section className={styles.slide} data-section="8">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(7)}>
            <span className={styles.slideNum}>08</span>
            <img src={getImgPath('Slide8.webp')} alt="The Sky" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>The Sky</span>
            <h2 className={styles.slideH}>Passing <em>Clouds</em></h2>
            <p className={styles.slideP}>Thoughts are just clouds drifting through the sky of your awareness. The sky is never affected by what drifts through it.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 9 --- */}
      <section className={styles.slide} data-section="9">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(8)}>
            <span className={styles.slideNum}>09</span>
            <img src={getImgPath('Slide9.webp')} alt="The Discovery" className={styles.clickableImg} crossOrigin="anonymous" />
          </div>
          <div>
            <span className={styles.slideTag}>The Discovery</span>
            <h2 className={styles.slideH}>Freedom is <em>Here</em></h2>
            <p className={styles.slideP}>You don't have to find freedom; you have to find the part of you that is already free.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 10: COSMIC PAUSE PRACTICE --- */}
      <section className={styles.slide} data-section="10">
        <div className={styles.slideGrid}>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Practice</span>
            <h2 className={styles.slideH}>The <em>One-Second</em><br />Cosmic Pause</h2>
            <p className={styles.slideP}>
              Before you start your car, walk through a door, or pick up your phone: Stop. For one second, acknowledge you are on a spinning planet.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <DailyPracticeCard 
              questionId="question3" 
              userId={user?.uid} 
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 11: CLOSING ── */}
      <section className={styles.closing} data-section="11">
        <div className={styles.closingInner}>
          <span className={styles.closingTag}>Chapter 1 · Question 3</span>
          <h2 className={styles.closingTitle}>A Little Planet.<br />A Vast Universe.</h2>
          <p className={styles.closingBody}>The impersonal mind is available in the next pause. Try it once today. Notice what shifts.</p>
          <button className={styles.closingBtn} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
