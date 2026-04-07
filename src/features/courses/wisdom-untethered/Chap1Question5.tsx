import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { DailyPracticeCard } from "../../practices/DailyPracticeCard";
import styles from "./Chap1Question1.module.css";
import { cn } from "../../../lib/utils";
import { useCourseTracking } from "../../../hooks/useCourseTracking";
import { CourseHero } from "./CourseHero";
import { CourseLightbox } from "./CourseLightbox";

const darkImages: Record<string, string> = {
  "slide1": "/WisdomUntethered/Chap1/Question5/01.png",
  "slide2": "/WisdomUntethered/Chap1/Question5/02.png",
  "slide3": "/WisdomUntethered/Chap1/Question5/03.png",
  "slide4": "/WisdomUntethered/Chap1/Question5/04.png",
  "slide5": "/WisdomUntethered/Chap1/Question5/05.png",
  "slide6": "/WisdomUntethered/Chap1/Question5/06.png",
  "slide7": "/WisdomUntethered/Chap1/Question5/07.png",
  "slide8": "/WisdomUntethered/Chap1/Question5/08.png",
  "slide9": "/WisdomUntethered/Chap1/Question5/09.png",
};

const lightImages: Record<string, string> = {
  "slide1": "/WisdomUntethered/Chap1/Question5/01_light.png",
  "slide2": "/WisdomUntethered/Chap1/Question5/02_light.png",
  "slide3": "/WisdomUntethered/Chap1/Question5/03_light.png",
  "slide4": "/WisdomUntethered/Chap1/Question5/04_light.png",
  "slide5": "/WisdomUntethered/Chap1/Question5/05_light.png",
  "slide6": "/WisdomUntethered/Chap1/Question5/06_light.png",
  "slide7": "/WisdomUntethered/Chap1/Question5/07_light.jpg",
  "slide8": "/WisdomUntethered/Chap1/Question5/08_light.png",
  "slide9": "/WisdomUntethered/Chap1/Question5/09_light.png",
};

const ALL_SLIDES = ["slide1", "slide2", "slide3", "slide4", "slide5", "slide6", "slide7", "slide8", "slide9"];

const slidesContent = [
  {
    id: "observer",
    tag: "The Observer",
    heading: <>The Great Discovery: You are the <em>Observer</em></>,
    body: [
      "Michael Singer teaches that the most important realization is that you are not your thoughts. You are the one who notices them.",
      "Right now, there are thoughts in your mind. But there is also you — the one who is aware that the thoughts are there. These are two completely different things.",
    ],
    pull: "You are not the voice. You are the one who hears it.",
    flip: false,
  },
  {
    id: "theatre",
    tag: "The Inner Theatre",
    heading: <>The Mind as a <em>Movie Screen</em></>,
    body: [
      "Imagine your mind is a cinema screen. Thoughts, emotions, and sensations are just movies playing across it. They arrive, they peak, and they leave.",
      "The screen itself is never affected by the movie. It remains clear and still, no matter how chaotic the film gets. That screen is your true consciousness.",
    ],
    pull: "The show may be loud, but the audience is silent.",
    flip: true,
  },
  {
    id: "steppingback",
    tag: "Stepping Back",
    heading: <>The Power of <em>One Step Back</em></>,
    body: [
      "Freedom begins when you take one step back from the mental noise. You don't have to stop the thoughts; you just have to stop being 'inside' them.",
      "When you step back into the seat of the Witness, the thoughts lose their power to pull you into a reaction. You are simply watching them drift by.",
    ],
    pull: "Freedom isn't silence. It's distance.",
    flip: false,
  },
  {
    id: "seat",
    tag: "The Center",
    heading: <>The Unchanging <em>Center</em></>,
    body: [
      "There is a silent center in you that has been there since you were a child. Your body changed, your thoughts changed, but the 'watcher' in you remained the same.",
      "This is the 'Lucid Self' — the part of you that is always awake, always aware, and never disturbed by the drama of living.",
    ],
    pull: "The one who sees remains the same.",
    flip: true,
  },
  {
    id: "objects",
    tag: "Awareness",
    heading: <>Objects vs. <em>Subject</em></>,
    body: [
      "Everything you can perceive — a tree, a feeling, a memory — is an 'object' of awareness. But who is the one perceiving them? That is the 'Subject'.",
      "Objects come and go. The Subject is always here. Freedom is resting in the Subject instead of getting lost in the objects.",
    ],
    pull: "If you can see it, it is not you.",
    flip: false,
  },
  {
    id: "rope",
    tag: "Letting Go",
    heading: <>Dropping the <em>Rope</em></>,
    body: [
      "To be free, you don't fight the mind. You just let go of the rope. When you stop struggling with a thought, you stop feeding it energy.",
      "The Witness doesn't argue. The Witness simply watches. In that watching, the struggle naturally dissolves.",
    ],
    pull: "Stop winning the tug-of-war. Just let go.",
    flip: true,
  },
  {
    id: "storms",
    tag: "The Sky",
    heading: <>Watching the <em>Storms</em></>,
    body: [
      "Emotions are like weather. They arrive, they peak, and they pass. As the Witness, you are the sky that remains clear and vast behind the clouds.",
      "A storm might be dark and loud, but it cannot touch the sky itself. You are that sky.",
    ],
    pull: "The sky is not the storm.",
    flip: false,
  },
  {
    id: "lucidity",
    tag: "Practice",
    heading: <>Daily <em>Lucidity</em></>,
    body: [
      "Witness consciousness is 'lucidity' in waking life. It means knowing you are the Observer even while the drama is happening at work or home.",
      "Instead of 'waking up' from a dream at night, you 'wake up' to the fact that you are the Witness in your daily life.",
    ],
    pull: "Wake up within the dream of daily life.",
    flip: true,
  },
  {
    id: "release",
    tag: "Final Step",
    heading: <>Resting in <em>Awareness</em></>,
    body: [
      "You are already home. You don't have to 'become' the Witness; you already are. Just relax back and see.",
      "The more you rest in this quiet center, the more the world becomes a beautiful dance that you are simply enjoying from the best seat in the house.",
    ],
    pull: "Relax back. You're already there.",
    flip: false,
  },
];



interface Chap1Question5Props {
  onOpenJournal?: () => void;
}

export function Chap1Question5({ onOpenJournal }: Chap1Question5Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { updateProgress } = useCourseTracking(user?.uid);

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

  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark'
      );
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => obs.disconnect();
  }, []);

  const imageMap = isDark ? darkImages : lightImages;


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll("[data-section]");
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
      { threshold: 0.15, root: container }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    const section = containerRef.current?.querySelector(`[data-section="${index}"]`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () => setLightboxIndex(prev => (prev === null ? 0 : (prev + 1) % ALL_SLIDES.length));
  const prevLightbox = () => setLightboxIndex(prev => (prev === null ? 0 : (prev - 1 + ALL_SLIDES.length) % ALL_SLIDES.length));

  return (
    <div
      className={styles.container}
      ref={containerRef}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <CourseHero 
        chapter={1}
        question={5}
        title={<>The <strong>Observer</strong> Discovery<br />Witnessing the <strong>Inner Theatre</strong></>}
        subtitle="Michael Singer teaches that the most important realization is that you are not your thoughts. You are the one who notices them."
      />

      <CourseLightbox 
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        onNext={nextLightbox}
        onPrev={prevLightbox}
        currentIndex={lightboxIndex ?? 0}
        total={ALL_SLIDES.length}
        imgSrc={lightboxIndex !== null ? imageMap[ALL_SLIDES[lightboxIndex]] : ''}
      />

      <nav className={styles.navDots}>
        {/* +1 for course hero */}
        {Array.from({ length: 14 + 1 }).map((_, i) => (
          <button
            key={i}
            className={cn(styles.navDot, activeSection === i && styles.active)}
            aria-label={`Section ${i + 1}`}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </nav>


      {/* OPENING BAND */}
      <div className={styles.openingBand} data-section="1">
        <p>
          "Most people spend their lives lost in the voice in their head, reacting to thoughts and emotions
          as if they were real. But you are not that voice — you are the one who hears it."
          <br /><em style={{ fontSize: "0.85rem", opacity: 0.7 }}>— Michael A. Singer · Wisdom Untethered</em>
        </p>
      </div>

      {/* SLIDE 1 */}
      <section className={styles.slide} data-section="2">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>01</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide1"]} alt="Observer" onClick={() => openLightbox(0)} className={styles.clickableImg} />
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
      <section className={styles.slide} data-section="3">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>02</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide2"]} alt="Theatre" onClick={() => openLightbox(1)} className={styles.clickableImg} />
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
      <section className={styles.slide} data-section="4">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>03</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide3"]} alt="Stepping Back" onClick={() => openLightbox(2)} className={styles.clickableImg} />
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
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>04</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide4"]} alt={slidesContent[3].tag} onClick={() => openLightbox(3)} className={styles.clickableImg} />
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
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>05</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide5"]} alt={slidesContent[4].tag} onClick={() => openLightbox(4)} className={styles.clickableImg} />
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
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>06</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide6"]} alt={slidesContent[5].tag} onClick={() => openLightbox(5)} className={styles.clickableImg} />
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
              <img src={imageMap["slide7"]} alt={slidesContent[6].tag} onClick={() => openLightbox(6)} className={styles.clickableImg} />
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
              <img src={imageMap["slide8"]} alt={slidesContent[7].tag} onClick={() => openLightbox(7)} className={styles.clickableImg} />
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
              <img src={imageMap["slide9"]} alt={slidesContent[8].tag} onClick={() => openLightbox(8)} className={styles.clickableImg} />
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

      {/* --- SECTION 11: DAILY PRACTICE --- */}
      <section className={styles.slide} data-section="11">
        <div className={styles.slideGrid}>
          <div className={styles.slideContent}>
            <span className={styles.slideTag}>The Practice</span>
            <h2 className={styles.slideH}>The <em>Clarity</em> Sit</h2>
            <p className={styles.slideP}>
              Rest in the seat of the Witness. Let everything else pass by like weather.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <DailyPracticeCard 
              questionId="question5" 
              userId={user?.uid} 
            />
          </div>
        </div>
      </section>

      {/* --- SECTION 12: COST-VALUE ANALYSIS --- */}
      <section className={cn(styles.slide, "bg-[var(--accent-primary)]/5 p-8 rounded-3xl border border-[var(--accent-primary)]/10 my-12 mx-4")} data-section="12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className={styles.slideTag}>The Logic of Freedom</span>
            <h2 className="text-3xl font-serif font-light text-[var(--text-primary)]">Cost-Value <em>Analysis</em></h2>
            <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
              Before you keep a thought, ask: what is it costing you, and what is its actual value?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Thought */}
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-400/50" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                The Burden
              </h3>
              <p className="text-lg font-serif italic text-[var(--text-primary)] leading-relaxed">
                "I'm not doing enough. I'm falling behind everything and everyone."
              </p>
            </div>

            {/* The Reality Check */}
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400/50" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                The Wisdom
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Notice the one who is watching this stress. Is the watcher behind? Is thewatcher falling? No. The watcher is simply present.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--accent-primary)]/5">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Metric</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-rose-400">The Cost</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400">The Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]/30">
                <tr>
                  <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">Inner State</td>
                  <td className="p-4 text-xs text-rose-300">Anxiety, Tightness, Chronic Stress</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">Zero</td>
                </tr>
                <tr>
                  <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">Performance</td>
                  <td className="p-4 text-xs text-rose-300">Reduced Focus, Decision Fatigue</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">Zero</td>
                </tr>
                <tr>
                  <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">Presence</td>
                  <td className="p-4 text-xs text-rose-300">Total Loss of the 'Now'</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">Zero</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-emerald-400 text-sm font-medium tracking-wide">
              Verdict: This thought is a bad investment. Release it.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 13: CLOSING ── */}
      <section className={styles.closing} data-section="13">
        <div className={styles.closingInner}>
          <span className={styles.closingTag}>The Lucid State</span>
          <h2 className={styles.closingTitle}>Go to the One Who Hears</h2>
          <p className={styles.closingBody}>Relax back into the awareness. It has never been disturbed.</p>
          <button className={styles.closingButton} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
