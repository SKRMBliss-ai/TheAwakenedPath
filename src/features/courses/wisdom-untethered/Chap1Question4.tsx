import { useEffect, useRef, useState } from "react";
import styles from "./Chap1Question1.module.css";
import { cn } from "../../../lib/utils";

const darkImages: Record<string, string> = {
  "slide1": "/WisdomUntethered/Chap1/Question4/01.png",
  "slide2": "/WisdomUntethered/Chap1/Question4/02.png",
  "slide3": "/WisdomUntethered/Chap1/Question4/03.png",
  "slide4": "/WisdomUntethered/Chap1/Question4/04.png",
  "slide5": "/WisdomUntethered/Chap1/Question4/05.png",
  "slide6": "/WisdomUntethered/Chap1/Question4/06.png",
  "slide7": "/WisdomUntethered/Chap1/Question4/07.png",
  "slide8": "/WisdomUntethered/Chap1/Question4/08.png",
  "slide9": "/WisdomUntethered/Chap1/Question4/09.png",
};

const lightImages: Record<string, string> = {
  "slide1": "/WisdomUntethered/Chap1/Question4/01_light.png",
  "slide2": "/WisdomUntethered/Chap1/Question4/02_light.png",
  "slide3": "/WisdomUntethered/Chap1/Question4/03_light.png",
  "slide4": "/WisdomUntethered/Chap1/Question4/04_light.png",
  "slide5": "/WisdomUntethered/Chap1/Question4/05_light.png",
  "slide6": "/WisdomUntethered/Chap1/Question4/06_light.png",
  "slide7": "/WisdomUntethered/Chap1/Question4/07_light.jpg",
  "slide8": "/WisdomUntethered/Chap1/Question4/08_light.png",
  "slide9": "/WisdomUntethered/Chap1/Question4/09_light.png",
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

const threeTypes = [
  {
    type: "bad",
    icon: "↻",
    name: "Personal Mind",
    result: "Automatic • Reactive",
    body: "Replays the past. Manufactures worry. Creates self-judgement. Runs old programs without your permission. This is not who you are — it is a layer you have been confused with.",
  },
  {
    type: "worse",
    icon: "◈",
    name: "Analytical Mind",
    result: "Useful • But Limited",
    body: "Excellent for planning, logic, and navigation. A tool for the world. But it cannot solve the problems of peace. When you try to think your way to happiness, you get lost.",
  },
  {
    type: "third",
    icon: "○",
    name: "Seat of Awareness",
    result: "Your True Self",
    body: "The one who is watching all of it. Silent. Clear. Never disturbed by anything that has ever happened. This is your native state of being.",
  },
];

const meditationSteps = [
  { label: "Step One", text: "Close your eyes. Take one slow breath in. And let it go." },
  { label: "Step Two — Pause", text: "Now notice — what thought is present right now? Don't follow it. Don't answer it. Just see it. There it is. A thought. Not you. Just a thought passing through." },
  { label: "Step Three — Pause", text: "Now ask yourself quietly — who is seeing this? There is something in you that is watching. It is not thinking. It is not judging. It is simply aware." },
  { label: "Long Pause — 5 seconds", text: "This is the seat Singer is pointing to. You do not have to create it. You are already in it. You have been in it this whole time." },
  { label: "Final — Pause", text: "The thoughts may keep coming. That is fine. You do not have to go with them. You are the one who sees them. And that one — is always quiet. Always clear. Always here." },
];

interface Chap1Question4Props {
  onOpenJournal?: () => void;
}

export function Chap1Question4({ onOpenJournal }: Chap1Question4Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark'
  );

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
          }
        });
      },
      { threshold: 0.15, root: container }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={(e) => { if(e.target === e.currentTarget) closeLightbox(); }}>
          <button className={styles.lightboxClose} onClick={closeLightbox}>✕</button>
          <div className={styles.lightboxImg} onClick={e => e.stopPropagation()}>
            <img src={imageMap[ALL_SLIDES[lightboxIndex]]} alt="Enlarged" />
          </div>
          <div className={styles.lightboxNav}>
            <button className={styles.lightboxNavBtn} onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>←</button>
            <div className={styles.lightboxCounter}>{lightboxIndex + 1} / {ALL_SLIDES.length}</div>
            <button className={styles.lightboxNavBtn} onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>→</button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className={styles.hero} data-section="0">
        <span className={styles.heroEyebrow}>Wisdom Untethered · Chapter 1 · Question 4</span>
        <h1 className={styles.heroTitle}>
          Witness <strong>Consciousness</strong>
        </h1>
        <div className={styles.heroRule} />
        <p className={styles.heroSub}>
          There is a place inside you that has never been disturbed by anything that has ever happened.
          It doesn't get anxious. It doesn't get excited. It simply sees.
          This chapter is about finding that place — and discovering it was always already there.
        </p>
        <div className={styles.heroScroll}>scroll</div>
      </section>

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

      {/* THREE LAYERS BAND */}
      <div className={styles.layersBand} data-section="5">
        <div className={styles.layersBandInner}>
          {threeTypes.map((t) => (
            <div key={t.type} className={cn(styles.layerCol, t.type === "third" ? styles.higher : styles.lower)}>
              <div className={styles.layerHeader}>
                <span className={styles.layerIcon}>{t.icon}</span>
                <span className={styles.layerLabel}>{t.result}</span>
              </div>
              <div className={styles.layerName}>{t.name}</div>
              <p className={styles.layerDesc}>{t.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SLIDE 4 */}
      <section className={styles.slide} data-section="6">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>04</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide4"]} alt="Seat" onClick={() => openLightbox(3)} className={styles.clickableImg} />
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

      {/* MANTRA CARD */}
      <div className={styles.mantraCard} data-section="7">
        <span className={styles.mantraTag}>Singer's Key Distinction</span>
        <h2 className={styles.mantraTitle}>Watching vs Seeing</h2>
        <div className={styles.mantraHighlight}>"You don't have to win the tug-of-war. Just let go of the rope."</div>
        <p className={styles.mantraBody}>True witness consciousness requires no effort. You are simply relaxing back into the part of you that is already aware.</p>
      </div>

      {/* SLIDE 5 */}
      <section className={styles.slide} data-section="8">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>05</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide5"]} alt="Objects" onClick={() => openLightbox(4)} className={styles.clickableImg} />
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
      <section className={styles.slide} data-section="9">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>06</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide6"]} alt="Rope" onClick={() => openLightbox(5)} className={styles.clickableImg} />
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

      {/* THREE OPTIONS */}
      <div className={styles.threeOptions} data-section="10">
        <div className={styles.threeOptionsInner}>
          <div className={styles.threeOptionsHeader}>
            <span className={styles.threeOptionsEyebrow}>The Choice</span>
            <h2 className={styles.threeOptionsTitle}>Engagement Options</h2>
          </div>
          <div className={styles.optionsGrid}>
            <div className={cn(styles.optionCard, styles.bad)}>
              <div className={styles.optionIcon}>↺</div>
              <div className={styles.optionName}>Past Replay</div>
              <p className={styles.optionBody}>No value. Only cost. You experience the disturbance again without new information.</p>
            </div>
            <div className={cn(styles.optionCard, styles.worse)}>
              <div className={styles.optionIcon}>⇣</div>
              <div className={styles.optionName}>Self-Judgement</div>
              <p className={styles.optionBody}>Diminishes you without purpose. It's noise, not insight.</p>
            </div>
            <div className={cn(styles.optionCard, styles.third)}>
              <div className={styles.optionIcon}>◎</div>
              <div className={styles.optionName}>Wisdom</div>
              <p className={styles.optionBody}>Authentic reflection that moves you forward from a place of clarity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE 7 */}
      <section className={styles.slide} data-section="11">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>07</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide7"]} alt="Storms" onClick={() => openLightbox(6)} className={styles.clickableImg} />
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
      <section className={styles.slide} data-section="12">
        <div className={cn(styles.slideGrid, styles.flip)}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>08</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide8"]} alt="Lucidity" onClick={() => openLightbox(7)} className={styles.clickableImg} />
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
      <section className={styles.slide} data-section="13">
        <div className={styles.slideGrid}>
          <div className={styles.imgWrap}>
            <span className={styles.slideNum}>09</span>
            <div className={styles.imageContainer}>
              <img src={imageMap["slide9"]} alt="Release" onClick={() => openLightbox(8)} className={styles.clickableImg} />
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

      {/* MEDITATION */}
      <div className={styles.meditationBand} data-section="14">
        <div className={styles.meditationInner}>
          <span className={styles.meditationEyebrow}>Guided Practice</span>
          <h2 className={styles.meditationTitle}>Seat of Awareness</h2>
          {meditationSteps.map((step, i) => (
            <div key={i}>
              <div className={styles.meditationStep}>
                <span className={styles.meditationStepLabel}>{step.label}</span>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLOSING */}
      <section className={styles.closing} data-section="15">
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
