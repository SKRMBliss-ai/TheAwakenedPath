import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import styles from "./Chap1Question8.module.css";
import { cn } from "../../../lib/utils";
import { useCourseTracking } from "../../../hooks/useCourseTracking";
import { CourseHero } from "./CourseHero";
import { CourseLightbox } from "./CourseLightbox";

const SLIDE_IMAGES: Record<string, string> = {
  "overview": "/Courses/WisdomUntethered/Chap1/Question8/overview.webp",
  "slide1": "/Courses/WisdomUntethered/Chap1/Question8/1.webp",
  "slide2": "/Courses/WisdomUntethered/Chap1/Question8/2.webp",
  "slide3": "/Courses/WisdomUntethered/Chap1/Question8/3.webp",
  "slide4": "/Courses/WisdomUntethered/Chap1/Question8/4.webp",
};

const ALL_SLIDES = ["slide1", "slide2", "slide3", "slide4"];

interface SlideContent {
  tag: string;
  heading: React.ReactNode;
  body: string[];
  pull: string;
}

const slidesContent: SlideContent[] = [
  {
    tag: "The Choice",
    heading: <>Let Go <strong>Now</strong> or Fall</>,
    body: [
      "Life presents us with countless moments where things don't go our way. In those moments, a choice is made: Do you tighten up and resist, or do you relax and release?",
      "If you don't let go now, you will fall into the cycle of suppressed energy and future suffering."
    ],
    pull: "The moment you feel resistance is the moment you must decide: freedom or suppression."
  },
  {
    tag: "Physical Resistance",
    heading: <>Locating the <em>Contraction</em></>,
    body: [
      "Resistance is not just a thought; it is a physical event. It starts as a tightening in the chest, a knot in the stomach, or a closing of the heart.",
      "By locating this physical contraction early, you can release it before it takes over your entire being."
    ],
    pull: "Awareness is the light that dissolves the shadows of resistance."
  },
  {
    tag: "The Release",
    heading: <>The Art of <strong>Instant</strong> Letting Go</>,
    body: [
      "Letting go doesn't mean you like what's happening. It means you aren't going to let it ruin your inner peace.",
      "Relax your shoulders, soften your heart, and simply let the energy of the event pass through you without leaving a mark."
    ],
    pull: "You are not protecting yourself by closing; you are only imprisoning yourself."
  },
  {
    tag: "Staying Behind",
    heading: <>The Seat of <em>Freedom</em></>,
    body: [
      "When you let go, you remain in the seat of the witness. You see the world as it is, not through the lens of your personal preferences.",
      "This is true freedom: the ability to experience everything without being disturbed by anything."
    ],
    pull: "The world can only touch you if you let it get inside your walls. Relax your walls."
  }
];

interface Chap1Question8Props {
  onOpenJournal: () => void;
}

export function Chap1Question8({ onOpenJournal }: Chap1Question8Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const { updateProgress } = useCourseTracking(user?.uid);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const totalSections = slidesContent.length + 1; // Content slides + Closing

  const openLightbox = (index: number) => setLightboxIndex(index);
  const goLightboxNext = () => setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % ALL_SLIDES.length));
  const goLightboxPrev = () => setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + ALL_SLIDES.length) % ALL_SLIDES.length));

  const scrollToSection = (index: number) => {
    const sections = containerRef.current?.querySelectorAll('[data-section]');
    if (sections && sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !user?.uid) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isNearBottom) {
        updateProgress('question8', { read: true });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [user?.uid, updateProgress]);

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

  return (
    <div className={styles.container} ref={containerRef}>
      <CourseHero 
        chapter={1}
        question={8}
        title={<>Let Go <strong>Now</strong> or Fall</>}
        subtitle="Mastering the moment of resistance — before it becomes suffering"
        overviewImage={SLIDE_IMAGES["overview"]}
      />

      <CourseLightbox 
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNext={goLightboxNext}
        onPrev={goLightboxPrev}
        currentIndex={lightboxIndex ?? 0}
        total={ALL_SLIDES.length}
        imgSrc={lightboxIndex !== null ? SLIDE_IMAGES[ALL_SLIDES[lightboxIndex]] : ''}
      />

      <nav className={styles.navDots}>
        {Array.from({ length: totalSections + 1 }).map((_, i) => (
          <button
            key={i}
            className={cn(styles.navDot, activeSection === i && styles.active)}
            aria-label={`Go to section ${i}`}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </nav>

      <div className={styles.openingBand}>
        <p>"Your inner peace is determined by how quickly you let go of the things you cannot control."</p>
      </div>

      {slidesContent.map((slide, i) => (
        <section key={i} className={styles.slide} data-section={i + 1}>
          <div className={cn(styles.slideGrid, i % 2 !== 0 && styles.flip)}>
            <div className={styles.imgWrap}>
              <span className={styles.slideNum}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.imageContainer}>
                <img 
                  src={SLIDE_IMAGES[`slide${i + 1}`]} 
                  alt={slide.tag} 
                  onClick={() => openLightbox(i)} 
                  className={styles.clickableImg}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
            <div className={styles.slideContent}>
              <span className={styles.slideTag}>{slide.tag}</span>
              <h2 className={styles.slideH}>{slide.heading}</h2>
              {slide.body.map((p, j) => <p key={j} className={styles.slideP}>{p}</p>)}
              <blockquote className={styles.pull}>{slide.pull}</blockquote>
            </div>
          </div>
        </section>
      ))}

      <section className={styles.closing} data-section={slidesContent.length + 1}>
        <div className={styles.closingInner}>
          <div className={styles.rule}><span>Chapter Complete</span></div>
          <h2 className={styles.closingTitle}>Ready to release?</h2>
          <button onClick={onOpenJournal} className={styles.closingButton}>
            Open Journal & Reflect
          </button>
        </div>
      </section>
    </div>
  );
}
