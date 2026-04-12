import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import styles from "./Chap1Question4.module.css";
import commonStyles from "./CourseCommon.module.css";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../auth/AuthContext";
import { useCourseTracking } from "../../../hooks/useCourseTracking";
import { CourseHero } from "./CourseHero";
import { CourseLightbox } from "./CourseLightbox";
import { CostValueAnalysis } from "../../practices/CostValueAnalysis";

interface Chap1Question4Props {
  onOpenJournal?: () => void;
}

export function Chap1Question4({ onOpenJournal }: Chap1Question4Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const { updateProgress } = useCourseTracking(user?.uid);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 14 slides tracking with images
  const slides = [
    {
      id: 0,
      num: '01',
      title: 'WHICH PART DO I LISTEN TO?',
      text: 'Your mind is extraordinary, but most of us never learn to tell the difference between thoughts worth using and those worth ignoring.',
      img: 'Slide1.jpg'
    },
    {
      id: 1,
      num: '02',
      title: 'THE CORE DISTINCTION',
      text: 'You are not your thoughts. You are the one noticing them. There are thoughts in your mind—and there is you, the quiet awareness observing them.',
      img: 'Slide2.jpg'
    },
    {
      id: 2,
      num: '03',
      title: 'THE DUALITY OF MIND',
      text: 'The Analytical Mind solves problems and builds worlds. The Personal Mind replays fear, judgment, and guilt. Use one, but do not follow the other.',
      img: 'Slide3.jpg'
    },
    {
      id: 3,
      num: '04',
      title: 'THE NARROW FRAME',
      text: 'The personal mind thinks it is the center of the universe. Inside this tiny orbit, every slight and worry feels incredibly urgent and heavy.',
      img: 'Slide4.jpg'
    },
    {
      id: 4,
      num: '05',
      title: 'VALUE VS. COST',
      text: 'Your partner says something slightly cold at dinner and your mind builds a case. By the time you get in bed, you are frantic and isolated. But nothing happened—they were just tired. You paid for a problem that didn\'t exist with your peace.',
      img: 'Slide5.jpg'
    },
    {
      id: 5,
      num: '06',
      title: 'THE AMPLIFICATION TRAP',
      text: 'Engaging with internal noise only gives it more power. You cannot ask a mind filled with fear to give you advice on how to be at peace.',
      img: 'Slide6.jpg'
    },
    {
      id: 6,
      num: '07',
      title: 'THE WIDER FRAME',
      text: 'Scaling back reveals that most disturbances simply stop mattering. You are on a small ball of rock spinning in a vast universe. Relax.',
      img: 'Slide7.jpg'
    },
    {
      id: 7,
      num: '08',
      title: 'THE ONE-SECOND PAUSE',
      text: 'Perspective is a daily practice. Before you start the engine, open a door, or pick up your phone—stop for one second in awareness.',
      img: 'Slide8.jpg'
    },
    {
      id: 8,
      num: '09',
      title: 'TRAINING THE NOISE',
      text: 'An untrained mind will always orbit itself. Be firm but gentle. Just as you train a dog to sit, command the mind to "Be still."',
      img: 'Slide9.jpg'
    },
    {
      id: 9,
      num: '10',
      title: 'THE ONLY REAL CHOICE',
      text: 'You cannot control what arises, only whether you open or close. Fighting discomfort creates blockages. Relaxing allows it to pass through.',
      img: 'Slide10.jpg'
    },
    {
      id: 10,
      num: '11',
      title: 'LOOSENING THE GRIP',
      text: 'Lean away from the disturbance, not into it. When triggered, relax your shoulders, belly, and heart. Let the energy rise and release.',
      img: 'Slide11.jpg'
    },
    {
      id: 11,
      num: '12',
      title: 'THE SOUND OF INTUITION',
      text: 'The mind is loud and frantic; intuition is quiet and still. Intuition does not argue or invent fear. It emerges effortlessly when the noise clears.',
      img: 'Slide12.jpg'
    },
    {
      id: 12,
      num: '13',
      title: 'A MOMENT OF STILLNESS',
      text: 'Close your eyes. Notice a thought with no value. Don’t fight it, don’t follow it. Just see it as a temporary expression passing through.',
      img: 'Slide14.jpg'
    },
    {
      id: 13,
      num: '14',
      title: 'THE SEAT OF THE WITNESS',
      text: 'Feel the one noticing the silence. That quiet awareness is YOU—the part of you that has always known exactly what to do.',
      img: 'Slide13.jpg'
    },
    {
      id: 14,
      num: '15',
      title: 'VALUABLE VS. COSTLY THOUGHTS',
      text: 'Solving a problem has value. Judging yourself, replaying the past, or worrying about "what if" only has cost. Learn to see the difference.',
      img: 'Slide15.jpg'
    },
    {
      id: 15,
      num: '16',
      title: 'AWAKENING...',
      text: 'Carry this quiet into your day. You are the observer, standing one step back from it all.',
      img: 'Slide16.jpg'
    }
  ];

  // Progress Bar
  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end end"]
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll Tracking for active dot & completion
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollPos / height);
      if (index !== activeSection && index <= slides.length) {
        setActiveSection(index);
      }

      // Completion check
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isNearBottom) {
        updateProgress('question4', { read: true });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeSection, updateProgress]);

  const scrollToSection = (index: number) => {
    const section = containerRef.current?.querySelector(`#slide-${index}`) as HTMLElement;
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goNext = () => {
    setLightboxIndex(prev => (prev === null ? 0 : (prev + 1) % slides.length));
  };
  
  const goPrev = () => {
    setLightboxIndex(prev => (prev === null ? 0 : (prev - 1 + slides.length) % slides.length));
  };

  return (
    <div className={cn(styles.container, "scroll-container")} ref={containerRef}>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#B8973A] z-[110] origin-left" 
        style={{ scaleX }} 
      />
      
      <nav className={styles.navDots}>
        {/* +1 for the Hero section, +1 for Overview */}
        {Array.from({ length: slides.length + 2 }).map((_, i) => (
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
        question={4}
        title={<>Finding the <strong>Silent Space</strong><br />The Art of <strong>Observation</strong></>}
        subtitle="A journey through 14 lessons on untethering yourself from the mind's constant noise."
        className="bg-[var(--bg-primary)] dark:bg-[#0A0908]"
      />


      <CourseLightbox 
        isOpen={lightboxIndex !== null && lightboxIndex !== -1}
        onClose={closeLightbox}
        onNext={goNext}
        onPrev={goPrev}
        currentIndex={lightboxIndex ?? 0}
        total={slides.length}
        imgSrc={lightboxIndex !== null && lightboxIndex !== -1 ? `/WisdomUntethered/Chap1/Question4/${slides[lightboxIndex].img}` : (lightboxIndex === -1 ? '/WisdomUntethered/Chap1/Question4/overview.jpg' : '')}
      />

      {/* OVERVIEW SECTION */}
      <section className={styles.slide} id="slide-0" data-section="1">
        <div className="max-w-6xl mx-auto w-full px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#B8973A]">Fundamental Framework</span>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-[var(--text-primary)]">The Map of Stillness</h2>
            <div className="w-20 h-[1px] bg-[#B8973A]/40 mx-auto" />
          </div>
          
          <div className="relative group cursor-zoom-in" onClick={() => setLightboxIndex(-1)}>
            <div className="absolute -inset-4 bg-[#B8973A]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img 
              src="/WisdomUntethered/Chap1/Question4/overview.jpg" 
              alt="The Power of Witness Consciousness Overview" 
              className="w-full h-auto rounded-3xl border border-[var(--border-subtle)] shadow-2xl relative z-10"
            />
          </div>
        </div>
      </section>

      {slides.map((slide, i) => (
        <section key={i} className={styles.slide} id={`slide-${i + 2}`} data-section={i + 2}>
          <div className={cn(styles.slideGrid, i % 2 !== 0 && styles.flip)}>
            <div className={styles.imgWrap} onClick={() => openLightbox(i)}>
              <img src={`/WisdomUntethered/Chap1/Question4/${slide.img}`} alt={slide.title} className={styles.clickableImg} />
            </div>
            
            <div className={styles.slideContent}>
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className={styles.slideNum}
              >
                {slide.num}
              </motion.span>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={styles.slideTitle}
              >
                {slide.title}
              </motion.h2>

              <div className={commonStyles.pull}>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className={styles.slideText}
                >
                  {slide.text}
                </motion.p>
              </div>

              {i === 14 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-16 w-full max-w-5xl"
                >
                  <CostValueAnalysis />
                </motion.div>
              )}

              {i === slides.length - 1 && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   className="mt-12"
                >
                  <button 
                    onClick={onOpenJournal}
                    className="px-8 py-3 border border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-300 tracking-widest text-xs uppercase"
                  >
                    Open Journal →
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
