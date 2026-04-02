import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';
import styles from './Chap1Question3.module.css';

interface Chap1Question3Props {
  onOpenJournal?: () => void;
}

export function Chap1Question3({ onOpenJournal }: Chap1Question3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroStarsRef = useRef<HTMLDivElement>(null);
  const bandStarsRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') goLightboxNext();
        if (e.key === 'ArrowLeft') goLightboxPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex]);

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
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const p = (container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100;
      setScrollProgress(p);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
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

  const totalSections = 13; 

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
    <div className={styles.container} ref={containerRef}>
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />
      
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

      <div className={styles.cosmicBand} data-section="4">
        <div className={styles.cosmicBandStars} ref={bandStarsRef} />
        <div className={styles.cosmicBandInner}>
          <span className={styles.cosmicBandTag}>The core pause</span>
          <h2 className={styles.cosmicBandTitle}>"Stop for One Second.<br />Notice Where You Are."</h2>
          <p className={styles.cosmicBandBody}>Before you start your car or walk through a door: Stop. For one second, acknowledge you are on a spinning planet. Then proceed.</p>
          <span className={styles.cosmicItalic}>This single second is a complete shift in frame.</span>
        </div>
      </div>

      <section className={styles.slide} data-section="5">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(3)}>
            <span className={styles.slideNum}>04</span>
            <img src={getImgPath('Slide4.jpeg')} alt="The car practice" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The car practice</span>
            <h2 className={styles.slideH}>Before You<br /><em>Start the Engine</em></h2>
            <p className={styles.slideP}>A moment of genuine noticing interruptions the spiral of daily worries with the weight of actual reality.</p>
            <div className={styles.pull}>One second of genuine perspective is worth an hour of anxious thinking.</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      <section className={styles.slide} data-section="6">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(4)}>
            <span className={styles.slideNum}>05</span>
            <img src={getImgPath('Slide5.jpeg')} alt="Every doorway is a practice moment" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>Every threshold</span>
            <h2 className={styles.slideH}>Every Doorway<br /><em>is a Transition</em></h2>
            <p className={styles.slideP}>Every time you walk through a door, pick up the phone, or engage with the world, you have a chance to arrive from the impersonal rather than the reactive.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      <section className={styles.slide} data-section="7">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(5)}>
            <span className={styles.slideNum}>06</span>
            <img src={getImgPath('Slide6.jpeg')} alt="The untrained mind" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The Untrained State</span>
            <h2 className={styles.slideH}>What the Untrained<br /><em>Mind Does</em></h2>
            <p className={styles.slideP}>Left unchecked, the untethered mind orbits the self endlessly — replaying the past and rehearsing the future instead of resting in the present peace.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      <section className={styles.slide} data-section="8">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(6)}>
            <span className={styles.slideNum}>07</span>
            <img src={getImgPath('Slide7.jpeg')} alt="The mind can be trained" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The dog analogy</span>
            <h2 className={styles.slideH}>The Mind<br /><em>Can Be Trained</em></h2>
            <p className={styles.slideP}>Train the mind with consistency and firmness. Like training a dog to sit, you gently redirect it back to the impersonal frame every time it pulls toward habitual worry.</p>
            <div className={styles.pull}>Instead of being lost in thought, you start to recognise the deeper reality of every moment.</div>
          </div>
        </div>
      </section>

      <section className={styles.slide} data-section="9">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(7)}>
            <span className={styles.slideNum}>08</span>
            <img src={getImgPath('Slide8.jpeg')} alt="In the wider frame" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>Final expansion</span>
            <h2 className={styles.slideH}>Let Your Awareness<br /><em>Expand</em></h2>
            <p className={styles.slideP}>Move your awareness past this room, this city, this planet. As you expand, your personal concerns become proportionate and manageable.</p>
          </div>
        </div>
      </section>

      <div className={styles.meditationBand} data-section="10">
        <div className={styles.meditationInner}>
          <span className={styles.meditationEyebrow}>The Expansion Practice</span>
          <h2 className={styles.meditationTitle}>Resting in the<br />Impersonal</h2>
          <div className={styles.medStep}>
            <p>Close your eyes. Let your awareness move past this room, past this city, to the vast, spinning planet we all share.</p>
          </div>
          <span className={styles.medPause}>— pause —</span>
          <div className={styles.medStep}>
            <p>From this vast frame, notice what your mind is currently holding. A worry, a plan, a concern. How large does it actually seem from here?</p>
          </div>
          <span className={styles.medPause}>— pause —</span>
          <div className={styles.medStep}>
            <p>Carry this wider frame back with you. You are larger than any single concern. This peace is always available.</p>
          </div>
        </div>
      </div>

      <section className={styles.slide} data-section="11">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(8)}>
            <span className={styles.slideNum}>09</span>
            <img src={getImgPath('Slide9.jpeg')} alt="In that reality, there is peace" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The result</span>
            <h2 className={styles.slideH}><em>In That Reality,</em><br />There Is Peace</h2>
            <p className={styles.slideP}>Instead of being lost in thought, you recognise the deeper reality of every moment. In that reality, there is peace.</p>
            <div className={styles.pull}>That peace is not a destination. It is available in the next second.</div>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="12">
        <div className={styles.closingInner}>
          <span className={styles.closingTag}>Chapter 1 · Question 3</span>
          <h2 className={styles.closingTitle}>A Little Planet.<br />A Vast Universe.</h2>
          <p className={styles.closingBody}>The impersonal mind is available in the next pause — the breath before you walk through the door or start the ignition. Try it once today. Notice what shifts.</p>
          <button className={styles.closingBtn} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
