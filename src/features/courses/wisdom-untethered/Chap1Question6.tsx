import { useEffect, useRef, useState } from 'react';
// Bump for TS
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../../lib/utils';
import styles from './Chap1Question6.module.css';
import { useCourseTracking } from '../../../hooks/useCourseTracking';
import { CourseHero } from './CourseHero';
import { CourseLightbox } from './CourseLightbox';

const SLIDE_IMAGES: Record<string, string> = {
  "overview": "/WisdomUntethered/Chap1/Question6/overview.jpg",
  "slide1": "/WisdomUntethered/Chap1/Question6/1.jpg",
  "slide2": "/WisdomUntethered/Chap1/Question6/2.jpg",
  "slide3": "/WisdomUntethered/Chap1/Question6/3.jpg",
  "slide4": "/WisdomUntethered/Chap1/Question6/4.jpg",
  "slide5": "/WisdomUntethered/Chap1/Question6/5.jpg",
  "slide6": "/WisdomUntethered/Chap1/Question6/6.jpg",
  "slide7": "/WisdomUntethered/Chap1/Question6/7.jpg",
  "slide8": "/WisdomUntethered/Chap1/Question6/8.jpg",
  "slide9": "/WisdomUntethered/Chap1/Question6/9.jpg",
  "slide10": "/WisdomUntethered/Chap1/Question6/10.jpg",
  "slide11": "/WisdomUntethered/Chap1/Question6/11.jpg",
  "slide12": "/WisdomUntethered/Chap1/Question6/12.jpg",
  "slide13": "/WisdomUntethered/Chap1/Question6/13.jpg",
  "slide14": "/WisdomUntethered/Chap1/Question6/14.jpg",
};

const ALL_SLIDES = ["overview", ...Array.from({ length: 14 }, (_, i) => `slide${i + 1}`)];

interface Chap1Question6Props {
  onOpenJournal?: () => void;
}

export function Chap1Question6({ onOpenJournal }: Chap1Question6Props) {
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
        updateProgress('question6', { read: true });
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
        {Array.from({ length: 16 }).map((_, i) => (
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
        question={6}
        title={<>Letting Go of the <strong>Past</strong></>}
        subtitle="When the mind replays old shame — the art of releasing the person you were to become who you are"
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


      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 1 --- */}
      <section className={styles.slide} data-section="1">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>01</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide1"]} alt="The hook" onClick={() => openLightbox(1)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Hook</span>
            <h2 className={styles.slideH}>Thoughts That <em>Arrive Uninvited</em></h2>
            <p className={styles.slideP}>There's a particular kind of thought that arrives without warning. Something surfaces from years ago. A moment when you were selfish, careless, or cruel.</p>
            <div className={styles.pull}>"The mind runs it again. Reconstructing it. Sharpening the edges."</div>
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
              <img src={SLIDE_IMAGES["slide2"]} alt="The process" onClick={() => openLightbox(2)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Process</span>
            <h2 className={styles.slideH}>Keeping the <em>Old You</em> Alive</h2>
            <p className={styles.slideP}>The person you were then — that level of understanding, that level of pain or fear — is gone. Yet the guilt keeps that old version of you alive.</p>
            <p className={styles.slideP}>It feels like accountability, but it hasn't fixed anything. It's just... still there.</p>
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
              <img src={SLIDE_IMAGES["slide3"]} alt="The realization" onClick={() => openLightbox(3)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Realization</span>
            <h2 className={styles.slideH}>Not Who <em>You Are</em></h2>
            <p className={styles.slideP}>Somewhere underneath is a voice saying: you don't get to just move on. But that voice isn't yours. It's just memory holding onto a ghost.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 4 --- */}
      <section className={styles.slide} data-section="4">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>04</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide4"]} alt="The teaching" onClick={() => openLightbox(4)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Teaching</span>
            <h2 className={styles.slideH}>A New <em>Understanding</em></h2>
            <p className={styles.slideP}>By the end of this journey, you'll understand exactly what that guilt is doing and how to let the energy move through you instead of staying stuck.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 5 --- */}
      <section className={styles.slide} data-section="5">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>05</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide5"]} alt="The analogy" onClick={() => openLightbox(5)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Analogy</span>
            <h2 className={styles.slideH}>Learning the <em>Piano</em></h2>
            <p className={styles.slideP}>Imagine learning to play the piano. In the beginning, you hit a lot of wrong notes. Terrible, discordant sounds. You don't get angry at the notes — they were just part of learning.</p>
            <div className={styles.pull}>"Your past actions were wrong notes in the song of your life."</div>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 6 --- */}
      <section className={styles.slide} data-section="6">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>06</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide6"]} alt="The practice" onClick={() => openLightbox(6)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Practice</span>
            <h2 className={styles.slideH}>Stop <em>Hitting</em> the Note</h2>
            <p className={styles.slideP}>Holding onto guilt is like going back to that piano every day and repeatedly hitting the same wrong note over and over, wondering why you can't hear the symphony.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 7 --- */}
      <section className={styles.slide} data-section="7">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>07</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide7"]} alt="The weight" onClick={() => openLightbox(7)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Weight</span>
            <h2 className={styles.slideH}>Why We <em>Hold On</em></h2>
            <p className={styles.slideP}>We hold on because we think it proves we've changed. We think pain is the price of redemption. But pain isn't change. Awareness is change.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 8 --- */}
      <section className={styles.slide} data-section="8">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>08</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide8"]} alt="Narrative" onClick={() => openLightbox(8)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Narrative</span>
            <h2 className={styles.slideH}>Dropping the <em>Story</em></h2>
            <p className={styles.slideP}>The story doesn't serve the future. It only shackles the present. You are not your history; you are the one witnessing it.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 9 --- */}
      <section className={styles.slide} data-section="9">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>09</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide9"]} alt="The shift" onClick={() => openLightbox(9)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Shift</span>
            <h2 className={styles.slideH}>Witness, <em>Don't Wallow</em></h2>
            <p className={styles.slideP}>The moment you see the thought as an object in your consciousness, it loses its power to define you. It's just a ripple in the water.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 10 --- */}
      <section className={styles.slide} data-section="10">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>10</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide10"]} alt="Breath" onClick={() => openLightbox(10)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Breath</span>
            <h2 className={styles.slideH}>The <em>Release</em> Breath</h2>
            <p className={styles.slideP}>When the shame surfaces, breathe into it. Not to push it away, but to give it space to dissolve and return to the silence.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 11 --- */}
      <section className={styles.slide} data-section="11">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>11</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide11"]} alt="Visualization" onClick={() => openLightbox(11)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Visualization</span>
            <h2 className={styles.slideH}>Flow <em>State</em></h2>
            <p className={styles.slideP}>Imagine the past as a river. You are standing on the bank. You can watch the debris float past without jumping in to try and catch it.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 12 --- */}
      <section className={styles.slide} data-section="12">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>12</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide12"]} alt="Softening" onClick={() => openLightbox(12)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Softening</span>
            <h2 className={styles.slideH}>Softening the <em>Edge</em></h2>
            <p className={styles.slideP}>Relax your shoulders. Relax your heart. The past only feels solid because you are tensing against it.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 13 --- */}
      <section className={styles.slide} data-section="13">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>13</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide13"]} alt="The self" onClick={() => openLightbox(13)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Self</span>
            <h2 className={styles.slideH}>The <em>Observer</em> Returns</h2>
            <p className={styles.slideP}>The one who is aware of the guilt is already free from it. That awareness is your true home.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* --- SLIDE 14 --- */}
      <section className={styles.slide} data-section="14">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>14</span>
            <div className={styles.imageContainer}>
              <img src={SLIDE_IMAGES["slide14"]} alt="Integration" onClick={() => openLightbox(14)} className={styles.slideImg} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Integration</span>
            <h2 className={styles.slideH}>Walking <em>Forward</em></h2>
            <p className={styles.slideP}>The song goes on. You've hit higher notes, more beautiful chords. Keep playing. Don't look back at the keys you already struck.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>


      {/* --- CLOSING --- */}
      <section className={styles.closing} data-section="15">
        <div className={styles.closingInner}>
          <span className={styles.slideTag}>End of Chapter 1 · Question 6</span>
          <h2 className={styles.closingTitle}>The Door is <em>Open</em></h2>
          <p className={styles.slideP}>You don't need to carry the past to prove you've learned from it.</p>
          <button className={styles.closingButton} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
