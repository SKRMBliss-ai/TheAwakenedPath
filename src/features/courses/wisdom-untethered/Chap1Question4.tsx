import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import styles from "./Chap1Question4.module.css";
import commonStyles from "./CourseCommon.module.css";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../auth/AuthContext";
import { useCourseTracking } from "../../../hooks/useCourseTracking";
import { CourseHero } from "./CourseHero";
import { CourseLightbox } from "./CourseLightbox";

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
      title: 'THE OPENING QUESTION',
      text: 'Isn’t the mind helpful sometimes? Which part of my mind do I listen to?',
      img: 'Slide1.jpg'
    },
    {
      id: 1,
      num: '02',
      title: 'SITTING QUIETLY WITHIN',
      text: 'It is not a matter of choosing which voice to listen to; it is about sitting quietly deep inside and not being distracted by the noise the mind is creating.',
      img: 'Slide2.jpg'
    },
    {
      id: 2,
      num: '03',
      title: 'PERSONAL CHATTER',
      text: 'You have made great progress if you realize that your personal mind does not always give good advice. You must be comfortable not listening to all the personal chatter it’s creating.',
      img: 'Slide3.jpg'
    },
    {
      id: 3,
      num: '04',
      title: 'ACHIEVING CLARITY',
      text: 'Once you can sit comfortably within, despite any noise the personal thoughts and emotions are creating, you will have achieved clarity.',
      img: 'Slide4.jpg'
    },
    {
      id: 4,
      num: '05',
      title: 'THE UNINTERRUPTED VIEW',
      text: 'In this state, you can see what is going on at all levels of your being without being distracted by it. You will know which thoughts are actually helpful.',
      img: 'Slide5.jpg'
    },
    {
      id: 5,
      num: '06',
      title: 'TEMPORARY EXPRESSIONS',
      text: 'You don’t have to listen to every thought. You are perfectly capable of seeing a thought for what it is: a temporary expression passing through your mind.',
      img: 'Slide6.jpg'
    },
    {
      id: 6,
      num: '07',
      title: 'THE ANALYTICAL TOOL',
      text: 'Especially your purely intellectual thoughts. The analytical mind can be very good in that realm—you can choose to listen to these if they are of assistance.',
      img: 'Slide7.jpg'
    },
    {
      id: 7,
      num: '08',
      title: 'THE IDENTITY TRAP',
      text: 'But if you think that you are your thoughts, and you react to every thought you have—you’ll be in big trouble!',
      img: 'Slide8.jpg'
    },
    {
      id: 8,
      num: '09',
      title: 'THE VALUE TEST',
      text: 'Start with the thoughts that have no value and rob you of your joy. You’ll be surprised to see how many fall into this category.',
      img: 'Slide9.jpg'
    },
    {
      id: 9,
      num: '10',
      title: 'RELEASING THE PAST',
      text: 'What is the advantage of being bothered by thoughts of the past? The past is over; it had its day. If it wasn’t pleasant, thank God it’s over.',
      img: 'Slide10.jpg'
    },
    {
      id: 10,
      num: '11',
      title: 'VALUE VS. COST',
      text: 'Why keep hanging out with thoughts that bring back the disturbance? That has no value, only cost. These thoughts ruin lives.',
      img: 'Slide11.jpg'
    },
    {
      id: 11,
      num: '12',
      title: 'CONSTRUCTIVE FOCUS',
      text: 'Focus on constructive thoughts that rise you up. Since you are not your thoughts, you can learn to release the ones that tear you down.',
      img: 'Slide12.jpg'
    },
    {
      id: 12,
      num: '13',
      title: 'THE JOY OF BEING ALIVE',
      text: 'What if we could always appreciate that we are alive and able to experience reality as it passes before us, without self-judgement or haunting memories?',
      img: 'Slide13.jpg'
    },
    {
      id: 13,
      num: '14',
      title: 'DEEPER WISDOM',
      text: 'Centering in the awareness of being reveals an intuitive, thought-free wisdom. Your thoughts may not figure it out, but YOU will still know what to do.',
      img: 'Slide14.jpg'
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
      if (index !== activeSection && index <= 14) {
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
    <div className={styles.container} ref={containerRef}>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#B8973A] z-[110] origin-left" 
        style={{ scaleX }} 
      />
      
      <nav className={styles.navDots}>
        {/* +1 for the Hero section */}
        {Array.from({ length: slides.length + 1 }).map((_, i) => (
          <button
            key={i}
            className={cn(styles.navDot, activeSection === i && styles.active)}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </nav>

      <CourseHero 
        chapter={1}
        question={4}
        title={<>Finding the <strong>Silent Space</strong><br />The Art of <strong>Observation</strong></>}
        subtitle="A journey through 14 lessons on untethering yourself from the mind's constant noise."
      />

      <CourseLightbox 
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        onNext={goNext}
        onPrev={goPrev}
        currentIndex={lightboxIndex ?? 0}
        total={slides.length}
        imgSrc={lightboxIndex !== null ? `/WisdomUntethered/Chap1/Question4/${slides[lightboxIndex].img}` : ''}
      />

      {slides.map((slide, i) => (
        <section key={i} className={styles.slide} id={`slide-${i + 1}`} data-section={i + 1}>
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

              {i === 13 && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   className="mt-12"
                >
                  <button 
                    onClick={onOpenJournal}
                    className="px-8 py-3 border border-black hover:bg-black hover:text-white transition-all duration-300 tracking-widest text-xs uppercase"
                  >
                    Open Reflection Journal →
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
