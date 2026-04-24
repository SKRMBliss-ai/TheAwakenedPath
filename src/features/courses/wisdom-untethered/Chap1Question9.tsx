import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import styles from "./Chap1Question9.module.css";
import { cn } from "../../../lib/utils";
import { useCourseTracking } from "../../../hooks/useCourseTracking";
import { CourseHero } from "./CourseHero";
import { CourseLightbox } from "./CourseLightbox";

const SLIDE_IMAGES: Record<string, string> = {
  "overview": "/Courses/WisdomUntethered/Chap1/Question9/overview.webp",
  "slide1": "/Courses/WisdomUntethered/Chap1/Question9/1.webp",
  "slide2": "/Courses/WisdomUntethered/Chap1/Question9/2.webp",
  "slide3": "/Courses/WisdomUntethered/Chap1/Question9/3.webp",
  "slide4": "/Courses/WisdomUntethered/Chap1/Question9/4.webp",
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
    tag: "The Center",
    heading: <>The Secret of the <strong>Middle Way</strong></>,
    body: [
      "Most of our lives are spent chasing what we want and running from what we don't want. This keeps us in a state of constant agitation.",
      "The Middle Way is the path of remaining in the center, unmoved by the swinging pendulum of attraction and aversion."
    ],
    pull: "Peace is found not in getting what you want, but in finding the one who is okay without it."
  },
  {
    tag: "Attraction and Aversion",
    heading: <>Transcending the <em>Pendulum</em></>,
    body: [
      "When we like something, we try to cling to it. When we dislike something, we try to push it away. Both are forms of resistance to the present moment.",
      "By simply observing these impulses without acting on them, you begin to move toward the center."
    ],
    pull: "The center is the only place where the pendulum doesn't pull you."
  },
  {
    tag: "Inner Balance",
    heading: <>The Point of <strong>Pure Balance</strong></>,
    body: [
      "In the center, you are neither for nor against. You are simply present. This is not indifference; it is profound engagement with reality as it is.",
      "From this point of balance, you can act with clarity and compassion, rather than reacting from habit."
    ],
    pull: "True balance is the ability to stand in the middle of a storm and remain still."
  },
  {
    tag: "The Home Within",
    heading: <>Resting in the <em>Silence</em></>,
    body: [
      "The more you rest in the center, the more you discover a deep silence that has always been there.",
      "This silence is your home. It is from here that you participate in the dance of life without getting lost in the music."
    ],
    pull: "The silence at the center is the source of all your strength."
  }
];

interface Chap1Question9Props {
  onOpenJournal: () => void;
}

export function Chap1Question9({ onOpenJournal }: Chap1Question9Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const { updateProgress } = useCourseTracking(user?.uid);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const totalSections = slidesContent.length + 1;

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
        updateProgress('question9', { read: true });
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
        question={9}
        title={<>The Secret of the <strong>Middle Way</strong></>}
        subtitle="Finding the point of pure balance — between the highs and the lows"
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
        <p>"Balance is not something you find, it's something you create by remaining in the center."</p>
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
          <h2 className={styles.closingTitle}>Ready to find your center?</h2>
          <button onClick={onOpenJournal} className={styles.closingButton}>
            Open Journal & Reflect
          </button>
        </div>
      </section>
    </div>
  );
}
