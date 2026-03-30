import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Chap1Question2.module.css';
import { Q2Infographic } from './Q2Infographics';

const TOTAL_SLIDES = 11;

interface Chap1Question2Props {
  isPresenting?: boolean;
  onExitPresentation?: () => void;
}

export function Chap1Question2({ isPresenting: propPresenting = false, onExitPresentation }: Chap1Question2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // ── Theme detection ──
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const isD = document.documentElement.classList.contains('dark') || 
                  document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(isD);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  // ── Presentation mode state ──
  const [isPresenting, setIsPresenting] = useState(propPresenting);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsPresenting(propPresenting);
    if (propPresenting) {
      setCurrentSlide(0);
    }
  }, [propPresenting]);

  // ── Lightbox state ──
  const [lightboxContent, setLightboxContent] = useState<ReactNode | null>(null);

  // Track scroll for progress bar
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollY = container.scrollTop;
      const height = container.scrollHeight - container.clientHeight;
      setScrollProgress(height > 0 ? (scrollY / height) * 100 : 0);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observers for animations and dot navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add(styles.visible); });
    }, { root: container, threshold: 0.12 });

    container.querySelectorAll(`.${styles.slideSection}, .${styles.practiceCard}`).forEach(s => fadeObserver.observe(s));

    const sections = container.querySelectorAll('[data-section]');
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

  const goNext = () => {
    const next = Math.min(currentSlide + 1, TOTAL_SLIDES - 1);
    setCurrentSlide(next);
    scrollToSection(next);
  };
  const goPrev = () => {
    const prev = Math.max(currentSlide - 1, 0);
    setCurrentSlide(prev);
    scrollToSection(prev);
  };
  const stopPresentation = () => {
    setIsPresenting(false);
    setCurrentSlide(0);
    scrollToSection(0);
    onExitPresentation?.();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxContent(null);
      if (isPresenting && !lightboxContent) {
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresenting, currentSlide, lightboxContent]);

  const openLightbox = (content: ReactNode) => { setLightboxContent(content); };

  const dots = Array.from({ length: TOTAL_SLIDES });

  return (
    <div className={`${styles.container} ${isPresenting ? styles.isPresenting : ''}`} ref={containerRef} style={{ height: '100%', overflowY: 'auto' }}>
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />

      {/* --- Nav & Controls --- */}
      {isPresenting && (
        <button className={styles.fullscreenReturnBtn} onClick={stopPresentation} aria-label="Exit presentation"><ArrowLeft size={18} /><span>Exit Slideshow</span></button>
      )}
      <nav className={styles.navDots}>
        {dots.map((_, i) => (
          <button key={i} className={`${styles.navDot} ${activeSection === i ? styles.active : ''}`} aria-label={`Go to section ${i + 1}`} onClick={() => scrollToSection(i)} />
        ))}
      </nav>

      {/* --- Lightbox --- */}
      {lightboxContent && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxContent(null)} role="dialog" aria-modal="true" aria-label="Image lightbox">
          <button className={styles.lightboxClose} onClick={() => setLightboxContent(null)} aria-label="Close image">✕</button>
          <div className={styles.lightboxImg} onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: '800px', pointerEvents: 'none' }}>
            {lightboxContent}
          </div>
        </div>
      )}

      {/* ── SECTION 0: HERO ── */}
      <section className={styles.hero} data-section="0">
        <div className={styles.heroEyebrow}>Wisdom Untethered · Chapter 1 · Question 2</div>
        <h1 className={styles.heroTitle}>The Voice in Your Head<br /><strong>Is Not Trying to Help You</strong></h1>
        <div className={styles.heroDivider}></div>
        <p className={styles.heroSubtitle}>Why your mind keeps talking — and how to stop letting it run your life</p>
        <div className={styles.heroScroll}>Scroll to Begin</div>
      </section>

      {/* ── SECTION 1: INTRO ── */}
      <section className={styles.slideSection} data-section="1">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>01</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="intro" isDark={isDarkMode} />)}>
               <Q2Infographic type="intro" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Question</span>
            <h2 className={styles.slideHeading}>The Endless <em>Narrator</em></h2>
            <p className={styles.slideBody}>You know that moment when you're lying in bed, trying to sleep, and a thought arrives out of nowhere. Something you said three days ago. A decision you haven't made yet. A version of a conversation that hasn't happened.</p>
            <p className={styles.slideBody}>And within seconds — the mind is off. Guilt about the past. Worry about the future. A low hum of "what if I'm getting this wrong?"</p>
            <p className={styles.slideBody}>Here's the question Singer wants you to sit with. Why does the mind do this? Where does all that doubt and fear and guilt actually come from? And more importantly — why does it have so much power over you?</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE ROOT CAUSE ── */}
      <section className={styles.slideSection} data-section="2">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>02</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="root_cause" isDark={isDarkMode} />)}>
               <Q2Infographic type="root_cause" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Deconstructing Anxiety</span>
            <h2 className={styles.slideHeading}>Deep down, you're <em>afraid</em></h2>
            <p className={styles.slideBody}>The reason the mind won't stop talking is this: deep down, you're afraid you won't be okay. That's it. That's the whole engine.</p>
            <p className={styles.slideBody}>You believe — and most of us believe this without ever examining it — that if you make the wrong decision, if you say the wrong thing, if things don't go exactly the way you need them to go — your well-being is at risk. And so the mind talks. Constantly. Trying to figure out how to make sure you'll be okay.</p>
            <p className={styles.slideBody}>It's not malicious. It's not broken. It's genuinely trying to protect you. But here's what Singer points to — and this takes a moment to really land.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE ENGINE ── */}
      <section className={styles.slideSection} data-section="3">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>03</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="flawed_advisor" isDark={isDarkMode} />)}>
               <Q2Infographic type="flawed_advisor" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Deception</span>
            <h2 className={styles.slideHeading}>A <em>Flawed</em> Advisor</h2>
            <p className={styles.slideBody}>The mind that is trying to solve the problem of doubt and fear — is the same mind that is generating the doubt and fear in the first place.</p>
            <p className={styles.slideBody}>Think about that. You're asking a mind filled with anxiety to give you advice about how to feel at peace. You're asking the thing that's creating the noise to tell you how to find quiet.</p>
            <p className={styles.slideBody}>It can't do it. Not because it doesn't want to. Because it is the problem.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ONE ROOT ── */}
      <section className={styles.slideSection} data-section="4">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>04</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="one_root" isDark={isDarkMode} />)}>
               <Q2Infographic type="one_root" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Mechanics</span>
            <h2 className={styles.slideHeading}>One Root,<br/><em>Ten Thousand</em> Faces</h2>
            <p className={styles.slideBody}>Here's what that actually looks like in daily life. You get a message at work that's slightly ambiguous. Could mean nothing. Could mean something. And immediately the mind starts working the case. What did they mean? Should I reply now or wait? What if they're upset with me?</p>
            <p className={styles.slideBody}>You try to reason your way through it. You talk to someone about it. You go back and re-read the message four times. And every time you engage — the mind gets louder. More urgent. More convinced that this matters.</p>
            <p className={styles.slideBody}>Because that's what the mind does when you engage with it. It takes the engagement as confirmation that the situation is real and serious. The more you try to solve it, the more it grows.</p>
            <p className={styles.slideBody}>Singer says: stop trying to silence the mind. That doesn't work either. What works is something different — stepping back and watching it. Not fighting it. Not agreeing with it. Just watching.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: YOU CANNOT FIX THE MIND ── */}
      <section className={`${styles.slideSection} ${styles.matrixBand}`} data-section="5">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>05</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="shift" isDark={isDarkMode} />)}>
               <Q2Infographic type="shift" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Shift</span>
            <h2 className={styles.slideHeading}>You Cannot Use the Mind<br />to Fix <em>the Mind</em></h2>
            <p className={styles.slideBody}>This is the shift Singer is pointing to — and it's not a small one.</p>
            <p className={styles.slideBody}>When you step back and watch the mind instead of being inside it, something changes. You start to see the patterns. The same fear showing up in different clothes. The same doubt cycling through different situations. The same story — "I might not be okay" — playing out in a hundred different variations.</p>
            <p className={styles.slideBody}>And when you truly see it — when you see the pattern clearly enough — you stop taking it so seriously.</p>
            <p className={styles.slideBody}>You stop believing that the endless narration holds the key to your wellbeing. Because you can see — it's just the mind doing what minds do. You are not your mind. And the moment that actually lands — not as an idea, but as something felt — you're free. Not because the thoughts stop. But because they stop running the show.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: THE LISTENER ── */}
      <section className={`${styles.slideSection} ${styles.gripBand}`} data-section="6">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>06</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="listener" isDark={isDarkMode} />)}>
               <Q2Infographic type="listener" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Analogy</span>
            <h2 className={styles.slideHeading}>You Are the <em>Listener</em>.<br />Not the Radio.</h2>
            <p className={styles.slideBody}>Here's what this looks like as a practice.</p>
            <p className={styles.slideBody}>When the voice starts up with guilt, doubt, or fear, try this instead of engaging with it. Just notice it. Name it, even, if that helps. "There's the worry voice." "There's the guilt loop."</p>
            <p className={styles.slideBody}>Don't try to answer it. Don't try to fix what it's pointing at. Just see it as the mind doing its thing — the same way you'd notice a radio playing in another room. You're not the radio. You're the one who can hear it.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: THE RELEASE ── */}
      <section className={styles.slideSection} data-section="7">
        <div className={styles.slideWrapper}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>07</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="grip" isDark={isDarkMode} />)}>
               <Q2Infographic type="grip" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>The Release</span>
            <h2 className={styles.slideHeading}>The <em>Grip</em> Loosens</h2>
            <p className={styles.slideBody}>Over time, Singer says, the mind naturally quiets. Not because you forced it — but because you stopped feeding it. Every time you step back instead of engage, you withdraw a little of the energy that keeps the narration alive.</p>
            <p className={styles.slideBody}>The voice doesn't disappear. But its grip loosens. And one day — you realise the thing that used to spiral you for hours barely moved you at all.</p>
            <p className={styles.slideBody}>That's not distance from life. That's freedom inside it.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: PRACTICE (MANTRA) ── */}
      <div className={styles.practiceCard} data-section="8">
        <p className={styles.practiceCardEyebrow}>The Practice</p>
        <h2 className={styles.practiceCardTitle}>Notice the Noise. Loosen the Grip.<br />Become the Watcher.</h2>
        <div className={styles.practiceMantra}>"I am the one who is aware."</div>
      </div>

      {/* ── SECTION 9: GUIDED MEDITATION ── */}
      <section className={styles.slideSection} data-section="9">
        <div className={`${styles.slideWrapper} ${styles.reverse}`}>
          <div className={styles.slideImageWrap}>
            <span className={styles.slideNumber}>08</span>
            <div className={styles.clickableImg} onClick={() => openLightbox(<Q2Infographic type="meditation" isDark={isDarkMode} />)}>
               <Q2Infographic type="meditation" isDark={isDarkMode} />
            </div>
          </div>
          <div className={styles.slideContent}>
            <span className={styles.slideLabel}>Guided Meditation (~90 seconds)</span>
            <h2 className={styles.slideHeading}>Restoring the <em>Watcher</em></h2>
            <p className={styles.slideBody}>Close your eyes if you're somewhere you can. Take one slow breath in. And let it go.</p>
            <p className={styles.slideBody}>Now just notice — what is the mind currently saying? What thought is waiting for your attention right now?</p>
            <p className={styles.slideBody}>Don't answer it. Don't follow it. Just see it — the way you'd see a cloud from a window.</p>
            <p className={styles.slideBody}>Now ask yourself: who is noticing this? There is something in you that is watching. That has always been watching. Not the voice. Not the doubt. Not the fear. The one noticing all of it.</p>
            <p className={styles.slideBody}>Rest there for a moment.</p>
            <p className={styles.slideBody}>The voice may keep talking. That's fine. You don't have to go with it. You are the one who is aware. And that one — has always been perfectly still.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: CLOSING ── */}
      <section className={styles.closing} data-section="10">
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow}>End of Chapter 1 · Question 2</p>
          <h2 className={styles.closingTitle}>You Are Not<br />the Radio</h2>
          <button className={styles.closingJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
