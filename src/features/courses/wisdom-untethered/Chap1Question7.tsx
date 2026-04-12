import { useEffect, useRef, useState } from 'react';
import { DailyPracticeCard } from '../../practices/DailyPracticeCard';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../../lib/utils';
import styles from './Chap1Question7.module.css';
import { useCourseTracking } from '../../../hooks/useCourseTracking';
import { CourseHero } from './CourseHero';
import { CourseLightbox } from './CourseLightbox';

const SLIDE_IMAGES: Record<string, string> = {
  "overview": "/WisdomUntethered/Chap1/Question7/12.jpg",
  "slide1": "/WisdomUntethered/Chap1/Question7/1.png",
  "slide2": "/WisdomUntethered/Chap1/Question7/2.png",
  "slide3": "/WisdomUntethered/Chap1/Question7/3.png",
  "slide4": "/WisdomUntethered/Chap1/Question7/4.jpg",
  "slide5": "/WisdomUntethered/Chap1/Question7/5.png",
  "slide6": "/WisdomUntethered/Chap1/Question7/6.png",
  "slide7": "/WisdomUntethered/Chap1/Question7/7.png",
  "slide8": "/WisdomUntethered/Chap1/Question7/8.png",
  "slide9": "/WisdomUntethered/Chap1/Question7/9.png",
  "slide10": "/WisdomUntethered/Chap1/Question7/10.png",
  "slide11": "/WisdomUntethered/Chap1/Question7/11.png",
};

const ALL_SLIDES = ["overview", ...Array.from({ length: 11 }, (_, i) => `slide${i + 1}`)];

interface Chap1Question7Props {
  onOpenJournal?: () => void;
}

export function Chap1Question7({ onOpenJournal }: Chap1Question7Props) {
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
        updateProgress('question7', { read: true });
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

    container.querySelectorAll(`.${styles.slide}`).forEach(s => {
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
        {Array.from({ length: 15 }).map((_, i) => (
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
        question={7}
        title={<>Handling the <strong>Back-and-Forth</strong></>}
        subtitle="Why we seemingly fail in our practice — and why 'failing' is the most important sign of progress there is"
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

      {/* --- OVERVIEW SLIDE --- */}
      <section className={styles.slide} data-section="1">
        <div className={cn(styles.slideGrid, styles.solo)}>
          <div className={styles.imgWrap}>
            <div className={cn(styles.imageContainer, styles.wide)}>
              <img 
                src={SLIDE_IMAGES["overview"]} 
                alt="Overview: The Art of the Swing" 
                onClick={() => openLightbox(0)} 
                className={styles.slideImg} 
              />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 1 --- */}
      <section className={styles.slide} data-section="2">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>01</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide1"]} alt="The hook" onClick={() => openLightbox(1)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Hook</span>
            <h2 className={styles.slideH}>The <em>Reappearing</em> Noise</h2>
            <p className={styles.slideP}>Imagine a moment of genuine shift — real quiet, real clarity. And then, an hour later, something happens. A comment. A thought. And you're right back in the loop.</p>
            <div className={styles.pull}>"So why does it keep slipping away?"</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 2 --- */}
      <section className={styles.slide} data-section="3">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>02</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide2"]} alt="Expectation" onClick={() => openLightbox(2)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Expectation</span>
            <h2 className={styles.slideH}>Growth Isn't <em>Linear</em></h2>
            <p className={styles.slideP}>Most people assume spiritual growth is a clean climb. You touch something higher, and you stay there. But real growth looks like glimpses followed by pull-backs.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 3 --- */}
      <section className={styles.slide} data-section="4">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>03</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide3"]} alt="The analogy" onClick={() => openLightbox(3)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Analogy</span>
            <h2 className={styles.slideH}>Deep Cleaning <em>the Home</em></h2>
            <p className={styles.slideP}>Think about a deep clean. You clear one room, and it feels good. But then you open a cupboard you haven't touched in years. Dust and old papers fall out.</p>
            <div className={styles.pull}>"The more you clean, the more you find. Not because it's dirtier, but because you're reaching deeper."</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 4 --- */}
      <section className={styles.slide} data-section="5">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>04</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide4"]} alt="The storage" onClick={() => openLightbox(4)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Storage</span>
            <h2 className={styles.slideH}>Stored Impressions: <em>Samskaras</em></h2>
            <p className={styles.slideP}>Throughout your life, you've stored unresolved experiences. Old hurt, old embarrassment. Singer calls these *Samskaras*. They are like bruises inside that life occasionally hits.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 5 --- */}
      <section className={styles.slide} data-section="6">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>05</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide5"]} alt="The choice" onClick={() => openLightbox(5)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Choice</span>
            <h2 className={styles.slideH}>The Pull-Back is <em>the Opportunity</em></h2>
            <p className={styles.slideP}>Stop treating the pull-back as the problem. When something activates and pulls you into your mind, that is your moment to grow.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 6 --- */}
      <section className={styles.slide} data-section="7">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>06</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide6"]} alt="The process" onClick={() => openLightbox(6)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Process</span>
            <h2 className={styles.slideH}>Relax <em>Into</em> the Discomfort</h2>
            <p className={styles.slideP}>Don't suppress or fight. Just relax. Open up around the disturbance. Let it pass through you like weather passing through the sky.</p>
            <div className={styles.pull}>"The sky doesn't fight the rain. It just allows it."</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 7 --- */}
      <section className={styles.slide} data-section="8">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>07</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide7"]} alt="The perspective" onClick={() => openLightbox(7)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Perspective</span>
            <h2 className={styles.slideH}>You Are <em>the Sky</em></h2>
            <p className={styles.slideP}>You have always been the sky. The clouds may be dark, the wind may be loud, but the sky remains untouched behind it all.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 8 --- */}
      <section className={styles.slide} data-section="9">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>08</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide8"]} alt="Judgment" onClick={() => openLightbox(8)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Judgment</span>
            <h2 className={styles.slideH}>Drop the <em>Spiritual Story</em></h2>
            <p className={styles.slideP}>The thought "I'm not doing this right" is just another pull. The mind is taking your journey and turning it into a story about adequacy.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 9 --- */}
      <section className={styles.slide} data-section="10">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>09</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide9"]} alt="The shift" onClick={() => openLightbox(9)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Shift</span>
            <h2 className={styles.slideH}>Speed of <em>Noticing</em></h2>
            <p className={styles.slideP}>Stop measuring progress by how long the quiet lasts. Instead, notice how quickly you catch yourself when you've left it. That moment of noticing is the progress.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 10 --- */}
      <section className={styles.slide} data-section="11">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>10</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide10"]} alt="The sign" onClick={() => openLightbox(10)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Sign</span>
            <h2 className={styles.slideH}>The Fact <em>You Can See It</em></h2>
            <p className={styles.slideP}>A month ago, you might have stayed lost for days. Now you notice in minutes. The fact that you can see it happening means you are no longer lost in it.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 11 --- */}
      <section className={styles.slide} data-section="12">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>11</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide11"]} alt="Meditation" onClick={() => openLightbox(11)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Meditation</span>
            <h2 className={styles.slideH}>Witnessing <em>the Swing</em></h2>
            <p className={styles.slideP}>Sit with the back-and-forth directly. Don't try to resolve it. Just learn to watch the movement between the noise and the silence.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- PRACTICE SECTION --- */}
      <section className={styles.slide} data-section="13">
        <div className={styles.slideGrid}>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Daily Guidance</span>
            <h2 className={styles.slideH}>Measure <em>Awareness</em></h2>
            <p className={styles.slideP}>
              When you feel the pull, celebrate the noticing. Returning to awareness is the practice itself.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <DailyPracticeCard questionId="question7" userId={user?.uid} />
          </div>
        </div>
      </section>

      {/* --- CLOSING --- */}
      <section className={styles.closing} data-section="14">
        <div className={styles.closingInner}>
          <span className={styles.slideTag}>End of Chapter 1 · Question 7</span>
          <h2 className={styles.closingTitle}>The House <em>Becomes Clear</em></h2>
          <p className={styles.slideP}>Each time something surfaces and passes through, that is one less room to clean.</p>
          <button className={styles.closingButton} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
