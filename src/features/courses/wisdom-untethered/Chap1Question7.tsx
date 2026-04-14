import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../../lib/utils';
import styles from './Chap1Question7.module.css';
import { useCourseTracking } from '../../../hooks/useCourseTracking';
import { CourseHero } from './CourseHero';
import { CourseLightbox } from './CourseLightbox';
import { VoiceService } from '../../../services/voiceService';

const SLIDE_IMAGES: Record<string, string> = {
  "overview": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/12.webp"),
  "slide1": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/1.webp"),
  "slide2": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/2.webp"),
  "slide3": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/3.webp"),
  "slide4": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/4.webp"),
  "slide5": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/5.webp"),
  "slide6": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/6.webp"),
  "slide7": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/7.webp"),
  "slide8": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/8.webp"),
  "slide9": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/9.webp"),
  "slide10": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/10.webp"),
  "slide11": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question7/11.webp"),
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
        {Array.from({ length: 13 }).map((_, i) => (
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
        title={<>Living in <strong>Spontaneous Flow</strong></>}
        subtitle="Moving from calculated control to the intuitive grace of being"
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
              <img src={SLIDE_IMAGES["slide1"]} alt="The hook" onClick={() => openLightbox(1)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Hook</span>
            <h2 className={styles.slideH}>The Exhaustion of <em>Management</em></h2>
            <p className={styles.slideP}>Most of us spend our days managing. Managing our image, managing our thoughts, managing the people around us. It's incredibly tiring.</p>
            <div className={styles.pull}>"What if you just let life live through you?"</div>
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
              <img src={SLIDE_IMAGES["slide2"]} alt="The process" onClick={() => openLightbox(2)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Process</span>
            <h2 className={styles.slideH}>The <em>Natural</em> State</h2>
            <p className={styles.slideP}>You don't tell your heart how to beat. You don't tell your lungs how to breathe. The most complex functions of your body happen on their own. Why should your life be any different?</p>
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
              <img src={SLIDE_IMAGES["slide3"]} alt="The realization" onClick={() => openLightbox(3)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Realization</span>
            <h2 className={styles.slideH}>Trusting the <em>Source</em></h2>
            <p className={styles.slideP}>When you stop forcing, you start flowing. You begin to trust that the same energy that runs the galaxies can handle your Tuesday afternoon.</p>
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
              <img src={SLIDE_IMAGES["slide4"]} alt="The teaching" onClick={() => openLightbox(4)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Teaching</span>
            <h2 className={styles.slideH}>The Art of <em>Non-Doing</em></h2>
            <p className={styles.slideP}>Non-doing doesn't mean being inactive. It means your actions come from a place of stillness rather than a place of strain.</p>
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
              <img src={SLIDE_IMAGES["slide5"]} alt="The analogy" onClick={() => openLightbox(5)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Analogy</span>
            <h2 className={styles.slideH}>The <em>River's</em> Wisdom</h2>
            <p className={styles.slideP}>A river doesn't think about where to turn. It simply goes. When it hits a rock, it flows around it. It doesn't argue with reality.</p>
            <div className={styles.pull}>"Be like water, my friend."</div>
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
              <img src={SLIDE_IMAGES["slide6"]} alt="The practice" onClick={() => openLightbox(6)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Practice</span>
            <h2 className={styles.slideH}>Wait and <em>Listen</em></h2>
            <p className={styles.slideP}>Before you act, pause. Listen for the subtle nudge of intuition. It's often quieter than the loud demands of the mind.</p>
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
              <img src={SLIDE_IMAGES["slide7"]} alt="The weight" onClick={() => openLightbox(7)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Weight</span>
            <h2 className={styles.slideH}>Dropping the <em>Oars</em></h2>
            <p className={styles.slideP}>You've been rowing so hard against the current. What happens if you just let the boat drift for a while? You might find it takes you exactly where you need to be.</p>
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
              <img src={SLIDE_IMAGES["slide8"]} alt="Narrative" onClick={() => openLightbox(8)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Narrative</span>
            <h2 className={styles.slideH}>Beyond <em>Stories</em></h2>
            <p className={styles.slideP}>Flow happens in the present. Stories happen in the past. When you drop the story of 'I should be doing this,' you open the door to 'Life is doing this.'</p>
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
              <img src={SLIDE_IMAGES["slide9"]} alt="The shift" onClick={() => openLightbox(9)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Shift</span>
            <h2 className={styles.slideH}>Intuitive <em>Grace</em></h2>
            <p className={styles.slideP}>The world needs your presence more than your planning. When you are present, you move with a grace that logic can't explain.</p>
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
              <img src={SLIDE_IMAGES["slide10"]} alt="Breath" onClick={() => openLightbox(10)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Breath</span>
            <h2 className={styles.slideH}>Breathe Into <em>Now</em></h2>
            <p className={styles.slideP}>Feel the air entering and leaving. This is life's flow in its simplest form. Let the rest of your life follow this rhythm.</p>
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
              <img src={SLIDE_IMAGES["slide11"]} alt="Visualization" onClick={() => openLightbox(11)} className={styles.slideImg} crossOrigin="anonymous" />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>Visualization</span>
            <h2 className={styles.slideH}>Dancing with <em>Life</em></h2>
            <p className={styles.slideP}>Life is a dance. There is no destination, only the movement itself. Enjoy the steps you are taking right now.</p>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>


      {/* --- CLOSING --- */}
      <section className={styles.closing} data-section="12">
        <div className={styles.closingInner}>
          <span className={styles.slideTag}>End of Chapter 1 · Question 7</span>
          <h2 className={styles.closingTitle}>Let Life <em>Live You</em></h2>
          <p className={styles.slideP}>The greatest freedom is realized when you stop trying to be the CEO of the universe and simply take your seat as a witness to the unfolding.</p>
          <button className={styles.closingButton} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
