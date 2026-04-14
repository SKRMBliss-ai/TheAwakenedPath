import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import styles from "./Chap1Question1.module.css";
import { cn } from "../../../lib/utils";
import { useCourseTracking } from "../../../hooks/useCourseTracking";
import { CourseHero } from "./CourseHero";
import { CourseLightbox } from "./CourseLightbox";
import { VoiceService } from "../../../services/voiceService";

const darkImages: Record<string, string> = {
  "slide1": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/01.webp"),
  "slide2": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/02.webp"),
  "slide3": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/03.webp"),
  "slide4": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/04.webp"),
  "slide5": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/05.webp"),
  "slide6": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/06.webp"),
  "slide7": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/07.webp"),
  "slide8": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/08.webp"),
  "slide9": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/09.webp"),
};

const lightImages: Record<string, string> = {
  "slide1": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/01_light.webp"),
  "slide2": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/02_light.webp"),
  "slide3": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/03_light.webp"),
  "slide4": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/04_light.webp"),
  "slide5": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/05_light.webp"),
  "slide6": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/06_light.webp"),
  "slide7": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/07_light.webp"),
  "slide8": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/08_light.webp"),
  "slide9": VoiceService.getStorageUrl("/WisdomUntethered/Chap1/Question5/09_light.webp"),
};

const ALL_SLIDES = ["slide1", "slide2", "slide3", "slide4", "slide5", "slide6", "slide7", "slide8", "slide9"];

const slidesContent = [
  {
    id: "observer",
    tag: "The Observer",
    heading: <>The Great Discovery: You are the <em>Observer</em></>,
    body: [
      "In our last session, we looked at the narrow focus of the personal mind. Now, we discover the one who is looking.",
      "Most of us spend our lives thinking we are the voice in our heads. We are not. We are the one listening to that voice."
    ],
    pull: "You are the silent distance between the thought—and the observing awareness."
  },
  {
    id: "theatre",
    tag: "The Analogy",
    heading: <>The Mind is a <em>Theatre</em></>,
    body: [
      "Imagine your mind is a grand theatre. Thoughts are the actors on the stage. They perform dramas, tragedies, and comedies.",
      "You are the one sitting in the quiet, darkened audience. You are not the actor. You are the witness."
    ],
    pull: "The witness is always at peace, no matter what happens on stage."
  },
  {
    id: "seat",
    tag: "Singer's Teaching",
    heading: <>The Seat of <em>Awareness</em></>,
    body: [
      "The goal of untethering is to stay in your seat. When a frightening actor walks onto the stage, you don't jump up and try to fight them.",
      "You simply notice their presence and stay in your awareness. You allow the scene to play out without becoming part of it."
    ],
    pull: "Freedom is the ability to watch your mind without following it."
  },
  {
    id: "perspective",
    tag: "Perspective",
    heading: <>A Shift in <em>Identity</em></>,
    body: [
      "This shift from 'I am my thoughts' to 'I am the one noticing my thoughts' is the root of all spiritual freedom.",
      "Once you realize you are the observer, the mind's drama loses its power to touch you."
    ],
    pull: "Identity is not found in the noise; it is found in the silence that hears the noise."
  },
  {
    id: "breath",
    tag: "The Anchor",
    heading: <>Resting in the <em>Gap</em></>,
    body: [
      "There is a gap between a thought arising and your reaction to it. That gap is where your freedom lives.",
      "Practice noticing that brief moment of silence before the mind starts its commentary."
    ],
    pull: "The gap is small—but it contains the entire universe of peace."
  },
  {
    id: "discovery",
    tag: "The Discovery",
    heading: <>The <em>Witness</em> is Free</>,
    body: [
      "The witness does not judge. The witness does not fix. The witness only sees.",
      "When you rest in the witness, you are already free. There is nothing more to do."
    ],
    pull: "The observer is never trapped by the observed."
  },
  {
    id: "practical",
    tag: "The Practice",
    heading: <>Staying <em>Centered</em></>,
    body: [
      "In your daily life, when you feel triggered, ask: 'Who is noticing this?'",
      "That question pulls you out of the drama and back into the seat of awareness."
    ],
    pull: "Awareness is the only tool you need for complete liberation."
  },
  {
    id: "peace",
    tag: "Inner Peace",
    heading: <>The <em>Abiding</em> Quiet</>,
    body: [
      "Behind the loudest thought is a profound stillness. It has never been disturbed by anything that has happened to you.",
      "This stillness is your true nature. You are simply coming home to it."
    ],
    pull: "Peace is not the absence of thoughts; it is the presence of awareness."
  },
  {
    id: "final",
    tag: "The Journey",
    heading: <>Walking as the <em>Observer</em></>,
    body: [
      "Continue your day with this one truth: You are the one who sees.",
      "Whatever arises, notice it, relax your heart, and remain in the seat of the witness."
    ],
    pull: "The journey is not about reaching a destination; it is about where you are looking from."
  }
];

interface Chap1Question5Props {
  onOpenJournal?: () => void;
}

export function Chap1Question5({ onOpenJournal }: Chap1Question5Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const { updateProgress } = useCourseTracking(user?.uid);
  const [isDark, setIsDark] = useState(true);

  // ── Lightbox ──
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  // ── Scroll Tracking ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isNearBottom) {
        updateProgress('question5', { read: true });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [user?.uid, updateProgress]);

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

  const imageMap = isDark ? darkImages : lightImages;

  return (
    <div className={cn(styles.container, "scroll-container")} ref={containerRef} style={{ height: '100%', overflowY: 'auto' }}>
      
      <CourseHero 
        chapter={1}
        question={5}
        title={<>The Great Discovery: You are the <strong>Observer</strong></>}
        subtitle="Moving from the drama of identity — to the peace of pure awareness"
      />

      <CourseLightbox 
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNext={goLightboxNext}
        onPrev={goLightboxPrev}
        currentIndex={lightboxIndex ?? 0}
        total={ALL_SLIDES.length}
        imgSrc={lightboxIndex !== null ? imageMap[ALL_SLIDES[lightboxIndex]] : ''}
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
        <p>"The most fundamental truth of your spiritual life: there are thoughts in your head—and there is you, the one hearing them."</p>
      </div>

      {/* SLIDE 1 */}
      <section className={styles.slide} data-section="1">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>01</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide1"]} 
                alt={slidesContent[0].tag} 
                onClick={() => openLightbox(0)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[0].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[0].heading}</h2>
            {slidesContent[0].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[0].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 2 */}
      <section className={styles.slide} data-section="2">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>02</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide2"]} 
                alt={slidesContent[1].tag} 
                onClick={() => openLightbox(1)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[1].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[1].heading}</h2>
            {slidesContent[1].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[1].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 3 */}
      <section className={styles.slide} data-section="3">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>03</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide3"]} 
                alt={slidesContent[2].tag} 
                onClick={() => openLightbox(2)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[2].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[2].heading}</h2>
            {slidesContent[2].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[2].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 4 */}
      <section className={styles.slide} data-section="5">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>04</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide4"]} 
                alt={slidesContent[3].tag} 
                onClick={() => openLightbox(3)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[3].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[3].heading}</h2>
            {slidesContent[3].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[3].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 5 */}
      <section className={styles.slide} data-section="6">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>05</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide5"]} 
                alt={slidesContent[4].tag} 
                onClick={() => openLightbox(4)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[4].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[4].heading}</h2>
            {slidesContent[4].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[4].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 6 */}
      <section className={styles.slide} data-section="7">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>06</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide6"]} 
                alt={slidesContent[5].tag} 
                onClick={() => openLightbox(5)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[5].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[5].heading}</h2>
            {slidesContent[5].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[5].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 7 */}
      <section className={styles.slide} data-section="8">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>07</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide7"]} 
                alt={slidesContent[6].tag} 
                onClick={() => openLightbox(6)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[6].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[6].heading}</h2>
            {slidesContent[6].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[6].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 8 */}
      <section className={styles.slide} data-section="9">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>08</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide8"]} 
                alt={slidesContent[7].tag} 
                onClick={() => openLightbox(7)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[7].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[7].heading}</h2>
            {slidesContent[7].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[7].pull}</blockquote>
          </div>
        </div>
      </section>

      <div className={styles.rule}><span>✦</span></div>

      {/* SLIDE 9 */}
      <section className={styles.slide} data-section="10">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>09</span>
            <div className={styles.imageContainer}>
              <img 
                src={imageMap["slide9"]} 
                alt={slidesContent[8].tag} 
                onClick={() => openLightbox(8)} 
                className={styles.clickableImg} 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>{slidesContent[8].tag}</span>
            <h2 className={styles.slideH}>{slidesContent[8].heading}</h2>
            {slidesContent[8].body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
            <blockquote className={styles.pull}>{slidesContent[8].pull}</blockquote>
          </div>
        </div>
      </section>


      <section className={styles.closing} data-section="11">
        <div className={styles.closingInner}>
          <span className={styles.closingTag}>Chapter 1 · Question 5</span>
          <h2 className={styles.closingTitle}>The Observer is <em>Here</em></h2>
          <p className={styles.closingBody}>Notice the one who is alive right now, behind the noise. Freedom is only one breath away.</p>
          <button className={styles.closingBtn} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
