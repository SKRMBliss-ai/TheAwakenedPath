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
    "Slide1.jpeg", "Slide2.jpeg", "Slide3.jpeg", 
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

  const totalSections = 14; 

  const scrollToSection = (index: number) => {
    const section = containerRef.current?.querySelector(`[data-section="${index}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getImgPath = (name: string) => `/WisdomUntethered/Chap1/Question3/${isDark ? '' : 'Light/'}${name}`;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />
      
      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)}>
          <button className={styles.lightboxClose}>✕</button>
          <div className={styles.lightboxImg} onClick={e => e.stopPropagation()}>
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
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(0)}>
            <span className={styles.slideNum}>01</span>
            <img src={getImgPath('Slide1.jpeg')} alt="The narrow personal frame" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The hook</span>
            <h2 className={styles.slideH}>The Mind's<br /><em>Very Small Frame</em></h2>
            <p className={styles.slideP}>When was the last time you actually felt the fact that you are standing on a planet? Not as a concept — as something genuinely real? Most of us spend approximately zero seconds a day thinking about this. Singer says that's the whole problem.</p>
            <p className={styles.slideP}>The personal mind has a narrow field of vision. It thinks about your reputation, your worries, your plans, what someone said yesterday, whether you're falling behind. Everything gets filtered through one question: how does this affect me?</p>
            <div className={styles.pull}>The personal mind is not broken. It is simply addicted to thinking about itself.</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      <section className={styles.slide} data-section="2">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(1)}>
            <span className={styles.slideNum}>02</span>
            <img src={getImgPath('Slide2.jpeg')} alt="You are on a planet" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>Reality check</span>
            <h2 className={styles.slideH}>You Are on<br /><em>a Planet</em></h2>
            <p className={styles.slideP}>Right now — in this moment — you are standing on a small ball of rock and water, spinning through an incomprehensibly vast universe, at extraordinary speed, without any effort on your part. That is simply true. That is what is actually happening.</p>
            <p className={styles.slideP}>Singer says: notice this. Not as an idea. Actually feel the reality of it for one second before you start your day, start your car, walk through a door. That one second of genuine perspective is the bridge from the personal mind to the impersonal one.</p>
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
            <p className={styles.slideP}>The personal mind is absorbed in your desires and fears — the small story of what you want, what you're afraid of, how things are going for you. This is where most of us spend virtually all of our mental energy.</p>
            <p className={styles.slideP}>The impersonal mind is the deeper, more peaceful level — thought patterns not about your personal concerns, but about the larger reality of life itself. Singer's invitation is to train yourself to access this level — not as a spiritual achievement, but as a daily practice starting right now.</p>
          </div>
        </div>
      </section>

      <div className={styles.cosmicBand} data-section="4">
        <div className={styles.cosmicBandStars} ref={bandStarsRef} />
        <div className={styles.cosmicBandInner}>
          <span className={styles.cosmicBandTag}>Singer's core practice</span>
          <h2 className={styles.cosmicBandTitle}>"Stop for One Second.<br />Notice Where You Are."</h2>
          <p className={styles.cosmicBandBody}>When you're sitting in your car before you start the engine — stop. For one second. Notice that you're on a little planet spinning in the middle of nowhere. That's reality. Then start the car.</p>
          <p className={styles.cosmicBandBody}>When you arrive at your destination, before getting out — stop again. You just moved across a small stretch of space on the surface of a vast planet, and now you're about to step into another moment of your life. Notice that. Then get out.</p>
          <span className={styles.cosmicItalic}>It only takes a second. But that second is a complete shift in frame.</span>
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
            <p className={styles.slideP}>This is Singer at his most practical. The car practice doesn't require meditation, quiet, or solitude. It requires one second of genuine noticing before an action you were going to take anyway.</p>
            <p className={styles.slideP}>The mind that was about to spiral into the day's worries is interrupted — briefly, cleanly — by actual reality. You're on a planet. This moment is one of billions. The email you're stressed about is real. But in the larger frame, its importance is something the personal mind invented.</p>
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
            <h2 className={styles.slideH}>Every Doorway<br /><em>is a Practice Moment</em></h2>
            <p className={styles.slideP}>Singer extends the practice to every threshold. Every time you walk through a doorway. Every time you pick up the phone. Every time you engage with the world — there is a one-second opportunity to shift frames before the personal mind rushes back in.</p>
            <p className={styles.slideP}>The meeting room door. The front door of your home. The moment before you respond to a difficult message. Each one is a chance to arrive from the impersonal rather than the reactive personal — not as a ritual, but as a genuine noticing of where you actually are.</p>
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
            <span className={styles.slideTag}>Without practice</span>
            <h2 className={styles.slideH}>What the Untrained<br /><em>Mind Does</em></h2>
            <p className={styles.slideP}>Singer is direct about the alternative. If you don't train the mind toward the larger frame, it will do what it always does: worry, desire, dwell on the past, rehearse the future. Not because you're flawed — because that's simply how an untrained mind operates.</p>
            <p className={styles.slideP}>The personal mind, left unchecked, orbits the self endlessly. It generates anxiety about things that will probably never happen. It replays conversations already over. It plans for futures that may never arrive — all consuming energy that could be resting in the peace of the impersonal frame.</p>
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
            <p className={styles.slideP}>Singer's analogy is warm and practical. You can train a dog to sit — with consistency, with firmness, without cruelty. At first you have to be clear: "Be still. Quiet down." The mind pulls back toward its habitual orbit. You redirect it again.</p>
            <p className={styles.slideP}>Over time — with repetition, with the car practice, the doorway pause, the one-second stop — it becomes natural. The mind that once rushed automatically into personal worry starts to widen. To see the moment before reacting to it.</p>
            <div className={styles.pull}>Eventually, it becomes natural. Instead of being lost in thought, you start to recognise the deeper reality of every moment.</div>
          </div>
        </div>
      </section>

      <div className={styles.practiceSection} data-section="9">
        <div className={styles.practiceInner}>
          <span className={styles.practiceEyebrow}>Singer's three-part practice</span>
          <h2 className={styles.practiceTitle}>Three Moments.<br />One Second Each.</h2>
          <p className={styles.practiceSubtitle}>Do these today — exactly as described. No preparation needed.</p>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>①</div>
              <h3 className={styles.stepTitle}>Before You Start the Car</h3>
              <p className={styles.stepBody}>Before your hand reaches the ignition — stop. Notice you are on a small planet spinning in the middle of nowhere. That's reality. Then start the car.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>②</div>
              <h3 className={styles.stepTitle}>Before You Walk Through a Door</h3>
              <p className={styles.stepBody}>Any door. Pause for one second. You are about to step into another moment of your life on this planet. Enter from that awareness — not from the personal mind's noise.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>③</div>
              <h3 className={styles.stepTitle}>Before You Pick Up Your Phone</h3>
              <p className={styles.stepBody}>Before you open a message or begin a call — one breath, wider frame. You are a conscious being on a vast planet. Respond from there, not from the reactive personal mind.</p>
            </div>
          </div>
          <div className={styles.practiceNote}>
            "It only takes a second — and it will train your mind to see beyond its narrow, self-centered concerns."
            <cite>— Michael A. Singer, Wisdom Untethered</cite>
          </div>
        </div>
      </div>

      <section className={styles.slide} data-section="10">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap} onClick={() => openLightbox(7)}>
            <span className={styles.slideNum}>08</span>
            <img src={getImgPath('Slide8.jpeg')} alt="In the wider frame" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The guided meditation</span>
            <h2 className={styles.slideH}>Let Your Awareness<br /><em>Expand</em></h2>
            <p className={styles.slideP}>Singer closes this teaching with a practice of genuine expansion. Let your awareness move past this room. Past this building. Past this city. You are on a small planet. It is spinning right now, in this moment, without any effort from you.</p>
            <p className={styles.slideP}>From inside that vastness — notice how your personal concerns become proportionate. Not unreal. Just smaller. The worry that felt enormous becomes one small thing happening on a vast planet. That is the impersonal view. And it is always available.</p>
          </div>
        </div>
      </section>

      <div className={styles.meditationBand} data-section="11">
        <div className={styles.meditationInner}>
          <span className={styles.meditationEyebrow}>Guided meditation · ~90 seconds</span>
          <h2 className={styles.meditationTitle}>Expanding Into<br />the Impersonal</h2>
          <div className={styles.medStep}>
            <span className={styles.medLabel}>Settle</span>
            <p>Close your eyes if you can. Take one slow breath in — and let it go completely.</p>
          </div>
          <span className={styles.medPause}>— pause —</span>
          <div className={styles.medStep}>
            <span className={styles.medLabel}>Expand</span>
            <p>Let your awareness move past this room. Past this building. Past this city. You are on a small planet. It is spinning right now, without any effort from you.</p>
          </div>
          <span className={styles.medPause}>— pause —</span>
          <div className={styles.medStep}>
            <span className={styles.medLabel}>Notice</span>
            <p>From inside that vastness — notice what your mind is currently holding. A worry. A plan. A concern. See it from the wider frame. How large does it actually seem from here?</p>
          </div>
          <span className={styles.medPause}>— pause —</span>
          <div className={styles.medStep}>
            <span className={styles.medLabel}>Rest</span>
            <p>This is the impersonal view. This is always available. Not because the concern isn't real — but because you are larger than any single concern. Rest here for a moment.</p>
          </div>
          <span className={styles.medPause}>— pause —</span>
          <div className={styles.medStep}>
            <span className={styles.medLabel}>Return</span>
            <p>Take one more slow breath. And come back. Carry this wider frame with you — one second at a time, at every doorway, every car, every phone.</p>
          </div>
        </div>
      </div>

      <section className={styles.slide} data-section="12">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap} onClick={() => openLightbox(8)}>
            <span className={styles.slideNum}>09</span>
            <img src={getImgPath('Slide9.jpeg')} alt="In that reality, there is peace" className={styles.clickableImg} />
          </div>
          <div>
            <span className={styles.slideTag}>The result</span>
            <h2 className={styles.slideH}><em>In That Reality,</em><br />There Is Peace</h2>
            <p className={styles.slideP}>Singer's closing statement: "Instead of being lost in thought, you start to recognise the deeper reality of every moment. In that reality, there is peace."</p>
            <p className={styles.slideP}>Not the peace of everything going well. Not the peace of a quiet mind. The peace of seeing clearly — from the impersonal frame, where the universe is vast, the planet is small, this moment is one of billions, and you are present for it.</p>
            <div className={styles.pull}>That peace is not a destination. It is available in the next second. In the next doorway. In the next moment before you start the car.</div>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="13">
        <div className={styles.closingInner}>
          <span className={styles.closingTag}>End of Chapter 1 · Question 3</span>
          <h2 className={styles.closingTitle}>A Little Planet.<br />A Vast Universe.<br /><em>One Second.</em></h2>
          <p className={styles.closingBody}>The impersonal mind is not somewhere you have to get to. It's available in the next pause before you turn the ignition — in the breath before you walk through the door — in the moment before you pick up the phone. Try it once today. Notice what shifts.</p>
          <button className={styles.closingBtn} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
