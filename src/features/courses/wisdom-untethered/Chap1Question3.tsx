import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { DailyPracticeCard } from '../../practices/DailyPracticeCard';
import { cn } from '../../../lib/utils';
import styles from './Chap1Question3.module.css';
import { useCourseTracking } from '../../../hooks/useCourseTracking';

interface Chap1Question3Props {
  onOpenJournal?: () => void;
}

export function Chap1Question3({ onOpenJournal }: Chap1Question3Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroStarsRef = useRef<HTMLDivElement>(null);
  const bandStarsRef = useRef<HTMLDivElement>(null);
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
    "Slide2.jpeg", "Slide1.jpeg", "Slide3.jpeg", 
    "Slide4.jpeg", "Slide5.jpeg", "Slide6.jpeg", 
    "Slide7.jpeg", "Slide8.jpeg", "Slide9.jpeg"
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
    const makeStars = (c: HTMLDivElement | null, n: number) => {
      if (!c) return;
      c.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const s = document.createElement('div');
        s.className = styles.star;
        const sz = Math.random() * 2 + 0.5;
        s.style.cssText = `
          width: ${sz}px;
          height: ${sz}px;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          background: ${isDark ? 'white' : 'var(--gold)'};
          --min-op: ${(Math.random() * 0.2 + 0.1).toFixed(2)};
          --max-op: ${(Math.random() * 0.5 + 0.4).toFixed(2)};
          --d: ${(Math.random() * 3 + 2).toFixed(1)}s;
          --delay: ${(Math.random() * 4).toFixed(1)}s;
        `;
        c.appendChild(s);
      }
    };

    makeStars(heroStarsRef.current, isDark ? 120 : 40);
    makeStars(bandStarsRef.current, isDark ? 60 : 30);
  }, [isDark]);

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

  const totalSections = 10; 

  const scrollToSection = (index: number) => {
    const section = containerRef.current?.querySelector(`[data-section="${index}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const FILE_MAP: Record<string, { dark: string, light: string }> = {
    "Slide1": { dark: "Slide1.png", light: "Slide1.png" },
    "Slide2": { dark: "Slide2.jpeg", light: "Slide2.png" },
    "Slide3": { dark: "Slide3.jpg", light: "Slide3.png" },
    "Slide4": { dark: "Slide4.jpeg", light: "Slide4Car.png" },
    "Slide5": { dark: "Slide5.jpeg", light: "Slide5.png" },
    "Slide6": { dark: "Slide6.jpeg", light: "Slide6.png" },
    "Slide7": { dark: "Slide7.png", light: "Slide7.png" },
    "Slide8": { dark: "Slide8.png", light: "Slide8.png" },
    "Slide9": { dark: "Slide9.jpeg", light: "Slide9.png" },
    "Practice": { dark: "Practice.jpeg", light: "Practice.jpeg" }
  };

  const getImgPath = (name: string) => {
    const baseName = name.replace(/\.[^/.]+$/, "");
    const mapping = FILE_MAP[baseName];
    
    const filename = mapping 
      ? (isDark ? mapping.dark : mapping.light) 
      : `${baseName}${isDark ? '.jpg' : '.png'}`;
      
    return `/WisdomUntethered/Chap1/Question3/${isDark ? '' : 'Light/'}${filename}`;
  };

  return (
    <div className={styles.container} ref={containerRef} style={{ height: '100%', overflowY: 'auto' }}>
      
      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)}>
          <button className={styles.lightboxClose}>✕</button>
          <div className={cn(
            styles.lightboxImg 
          )} onClick={e => e.stopPropagation()}>
             <img src={getImgPath(ALL_SLIDES[lightboxIndex])} alt={`Slide ${lightboxIndex + 1}`} />
          </div>
          <div className={styles.lightboxNav}>
            <button className={styles.lightboxNavBtn} onClick={(e) => { e.stopPropagation(); goLightboxPrev(); }}>←</button>
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {ALL_SLIDES.length}
            </div>
            <button className={styles.lightboxNavBtn} onClick={(e) => { e.stopPropagation(); goLightboxNext(); }}>→</button>
          </div>
        </div>
      )}

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

      <section className={styles.hero} data-section="0">
        <div className={styles.heroStars} ref={heroStarsRef} />
        <div className={styles.heroChapter}>Wisdom Untethered · Chapter 1 · Question 3</div>
        <h1 className={styles.heroTitle}>The Mind That Thinks<br />It Is the <strong>Centre of the Universe</strong></h1>
        <div className={styles.heroRule} />
        <p className={styles.heroSub}>How to shift from the narrow personal frame — to the vast, peaceful, impersonal one</p>
        <div className={styles.heroScroll}>Scroll</div>
      </section>

      <div className={styles.openingBand}>
        <p>"The personal mind has a very small frame of reference. Singer says there is a much larger frame available — and it takes only one second to access it."</p>
      </div>

      <section className={styles.slide} data-section="1">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(0)}>
            <span className={styles.slideNum}>01</span>
            <img src={getImgPath('Slide2.jpeg')} alt="You are on a planet" className={styles.clickableImg} />
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
            <img src={getImgPath('Slide1.jpeg')} alt="The narrow personal frame" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The Observation</span>
            <h2 className={styles.slideH}>The Mind's<br /><em>Very Small Frame</em></h2>
            <p className={styles.slideP}>The personal mind has a narrow field of vision. It filters everything through a single question: "How does this affect me?"</p>
            <p className={styles.slideP}>This self-focused frame generates constant worry about reputation, plans, and yesterday's words, consuming virtually all of your mental energy.</p>
            <div className={styles.pull}>The mind is not broken; it is simply addicted to thinking about itself.</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      <section className={styles.slide} data-section="3">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(2)}>
            <span className={styles.slideNum}>03</span>
            <img src={getImgPath('Slide3.jpeg')} alt="Personal vs impersonal mind" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>Singer's model</span>
            <h2 className={styles.slideH}><em>Personal</em> vs<br />Impersonal Thinking</h2>
            <p className={styles.slideP}>The personal mind is absorbed in individual desires and fears — the small story of your life. The impersonal mind is the deeper level that observes the larger reality.</p>
            <p className={styles.slideP}>Training yourself to access the impersonal level isn't a spiritual achievement; it's a practical daily shift in where you rest your attention.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 8: COSMIC PAUSE PRACTICE --- */}
      <section className={styles.slide} data-section="8">
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

      {/* ── SECTION 9: CLOSING ── */}
      <section className={styles.closing} data-section="9">
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
