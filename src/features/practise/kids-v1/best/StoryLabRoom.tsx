import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { MicButton } from '../ui/MicButton';
import { chirpySprite } from '../ui/sprites';
import { band } from '../kit/band';
import * as sound from '../kit/sound';
import type { DeepDiveAnswers } from './DeepDive';
import './StoryLabRoom.css';

/*
  THE WALK IS A FILMSTRIP NOW, which is what approved_reference_story_lab.png
  has been showing all along.

  The sheet is not four alternative designs for one screen — it is the screen,
  at the end of the walk: 3. Thought, 4. What Happened?, 5. Story and 6.
  Another Way standing side by side with arrows between them. So that is what
  this builds. The child starts with one panel. Answering it slides the next in
  from the right and everything shrinks to make room, and what they already
  said stays on screen, lit, in the panel that asked for it.

  EVERY PANEL IS DRAWN AT 386x675 AND THEN SCALED. That is the size of the
  sheet's own crops, so the proportions inside a panel are the sheet's
  proportions at every window size — one number changes, never the layout. The
  number is measured from the space actually available (see useFilmScale), not
  guessed from the viewport, because the header above it reflows.
*/
const PANEL_W = 386;
const PANEL_H = 675;
const PANEL_GAP = 30;

const STEPS = ['Feeling', 'Body', 'Thought', 'What happened?', 'Story', 'Another way'];
const STEP_ART = ['feeling', 'body', 'thought', 'what_happened', 'story', 'another_way'];
const TITLES = ['3. Thought', '4. What Happened?', '5. Story', '6. Another Way'];
const PROMPTS = ['What was your mind saying?', 'What actually happened?', 'Here’s the story your mind made…', 'Could anything else be true?'];
const SUBS = ['Tap a thought, or say it in your own words.', '', 'Your mind connects the pieces and tries to make sense of them.', 'Let’s see some other possible stories.'];

type Option = { text: string; icon: string; own?: boolean };

const THOUGHTS: Option[] = [
  { text: 'I can’t do it.', icon: '☁' }, { text: 'They don’t like me.', icon: '☁' },
  { text: 'It’s not fair.', icon: '☁' }, { text: 'What if…?', icon: '☁' },
  { text: 'I’m going to get in trouble.', icon: '☁' }, { text: 'I’m not sure.', icon: '☁' },
];
const EVENTS: Option[] = [
  { text: 'Someone said something', icon: '☏' }, { text: 'I had to wait', icon: '◷' },
  { text: 'I didn’t get to join', icon: '♧' }, { text: 'I made a mistake', icon: '✧' },
  { text: 'Something changed', icon: '↝' },
];
const POSSIBILITIES: Option[] = [
  { text: 'Maybe it only happened this time.', icon: '✳' },
  { text: 'Maybe they were busy with something else.', icon: '❋' },
  { text: 'Maybe I can try again in a different way.', icon: '✦' },
];
const SAY_IT: Option = { text: 'Say it your way', icon: 'mic', own: true };
const SOMETHING_ELSE: Option = { text: 'Something else', icon: 'mic', own: true };
const MY_OWN: Option = { text: 'My own idea…', icon: 'mic', own: true };

/**
 * How big a panel can be drawn, measured from the room it is actually given.
 *
 * Arithmetic against the viewport is what put buttons under the pinned strip
 * twice before: the header wraps, the question runs to three lines, and every
 * hand-written offset drifts. This measures the strip's own box instead, so it
 * is right whatever happens above it.
 */
function useFilmScale(count: number) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const measure = useCallback(() => {
    const node = box.current;
    if (!node) return;
    /* The CONTENT box, not the border box: padding on this element is not
       room a panel can be drawn in, and counting it is what put the panels
       under the pinned strip. */
    const style = getComputedStyle(node);
    const width = node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = node.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    if (!width || !height) return;
    const usable = width - (count - 1) * PANEL_GAP - 8;
    setScale(Math.max(0.2, Math.min(height / PANEL_H, usable / (count * PANEL_W))));
  }, [count]);
  useLayoutEffect(() => {
    measure();
    const node = box.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);
  return { box, scale };
}

/** True while the window is too narrow to stand more than one panel side by side. */
function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 760);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 759px)');
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return narrow;
}

/** The panel frame every step shares — the sheet's rounded window on the room. */
function Panel({ index, step, answer, chirpy, children, onBack, onHome }: {
  index: number; step: number; answer: string; chirpy: string;
  children: ReactNode; onBack: () => void; onHome: () => void;
}) {
  const current = index === step;
  const done = index < step;
  return <div className={`sl-panel ${current ? 'sl-panel-now' : ''} ${done ? 'sl-panel-done' : ''}`}>
    <div className="sl-panel-bar">
      <button className="sl-panel-back" onClick={onBack} aria-label={`Back from ${TITLES[index - 2]}`}>←</button>
      <h2>{TITLES[index - 2]}</h2>
      <button className="sl-panel-home" onClick={onHome} aria-label="Back to Mind Gym">⌂</button>
    </div>
    <p className="sl-dots" aria-hidden="true">{STEPS.map((label, i) => <span key={label} className={i === index ? 'sl-dot-now' : i < index ? 'sl-dot-done' : ''} />)}</p>
    <div className="sl-ask">
      <img className="sl-ask-chirpy" src={chirpy} alt={current ? 'Chirpy' : ''} aria-hidden={!current} />
      <div className="sl-ask-bubble"><h3>{PROMPTS[index - 2]}</h3>{SUBS[index - 2] && <p>{SUBS[index - 2]}</p>}</div>
    </div>
    <div className="sl-panel-body">{children}</div>
    {/* What they said, held in the panel that asked for it — the sheet's own
        way of keeping the whole walk on screen at once. */}
    {done && answer && <p className="sl-panel-answer"><span aria-hidden="true">✓</span>{answer}</p>}
  </div>;
}

/** One mounted room: four panels that arrive in turn and then stand together. */
export function StoryLabRoom({ carried, onBody, onExit, onGrownUp, onSave }: {
  carried: DeepDiveAnswers;
  onBody: () => void;
  onExit: () => void;
  onGrownUp: () => void;
  onSave: (answers: DeepDiveAnswers) => boolean;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || reduced;
  const [ageBand] = useState(() => band());
  const [step, setStep] = useState(2);
  const [thought, setThought] = useState('');
  const [event, setEvent] = useState('');
  const [story, setStory] = useState('');
  const [alternative, setAlternative] = useState('');
  const [draft, setDraft] = useState('');
  const [writing, setWriting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savedOnce = useRef(false);
  const [sessionId] = useState(() => `story-${Date.now()}`);
  const heading = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  /*
    ON A PHONE THERE IS ROOM FOR ONE PANEL.

    Four of them across 390px puts each at a quarter scale, where the sheet's
    12px type lands at 3px and nothing can be read or pressed. So a narrow
    window shows the panel being answered; the ones behind it are still in the
    strip at the foot, each with the answer it took.
  */
  const narrow = useNarrow();
  const reached = Math.min(step, 5);
  const panels = narrow ? [reached] : [2, 3, 4, 5].filter(index => index <= reached);
  const { box, scale } = useFilmScale(panels.length);

  /*
    EVERY ARRIVAL IS AUDIBLE. A panel sliding in is the app saying "that's
    kept, here's the next bit"; silence made it read as the screen redrawing.
    The whoosh is the soft one, not the door — this happens four times in a
    minute and a dramatic cue four times is a nag.
  */
  useEffect(() => {
    if (!moved.current) { moved.current = true; return; }
    if (!quiet) sound.play(step === 4 ? 'discovery' : step >= 6 ? 'miniWin' : 'exitRoom');
    const timer = setTimeout(() => heading.current?.focus({ preventScroll: true }), still ? 0 : 420);
    return () => clearTimeout(timer);
  }, [step, still, quiet]);

  const capture = (value: string) => {
    const text = value.trim();
    if (!text) return;
    savedOnce.current = false; setSaved(false); setSaveError(false);
    setWriting(false); setDraft('');
    if (step === 2) { setThought(text); setStory(text); setConfirmed(false); setAlternative(''); setStep(3); }
    else if (step === 3) { setEvent(text); setConfirmed(false); setAlternative(''); setStep(4); }
    else if (step === 4) { setStory(text); setConfirmed(true); setAlternative(''); setStep(5); }
    else if (step === 5) { setAlternative(text); setStep(6); }
  };
  const answers = [carried.feeling || '', carried.body?.join(', ') || '', thought, event, confirmed ? story : '', alternative];
  const showOwn = () => { if (!quiet) sound.play('tap'); setDraft(step === 4 ? story : ''); setWriting(true); };
  const pick = (option: Option) => {
    if (option.own) { showOwn(); return; }
    if (!quiet) sound.play('tap');
    capture(option.text);
  };
  const save = () => {
    if (savedOnce.current) return;
    const ok = onSave({ ...carried, thought, eyes: event, story, other: alternative, sessionId });
    savedOnce.current = ok; setSaved(ok); setSaveError(!ok);
    if (ok && !quiet) sound.play('resolve');
  };
  const back = () => { if (step === 2) { onBody(); return; } if (!quiet) sound.play('exitRoom'); setStep(step - 1); };

  const thoughtOptions = quiet ? [...THOUGHTS.slice(0, 3), SAY_IT] : [...THOUGHTS, SAY_IT];
  const eventOptions = quiet ? [...EVENTS.slice(0, 3), SOMETHING_ELSE] : [...EVENTS, SOMETHING_ELSE];
  const otherOptions = [...POSSIBILITIES, MY_OWN];

  const chosen = (index: number) => answers[index];
  const cardClass = (index: number, text: string) => {
    const value = chosen(index);
    if (!value) return '';
    return value === text ? 'sl-chosen' : 'sl-not-chosen';
  };

  /** The child's own words, in whichever panel asked for them. */
  const ownForm = <form className="sl-own-form" onSubmit={e => { e.preventDefault(); capture(draft); }}>
    <label htmlFor="sl-own-answer">{step === 4 ? 'The story my mind made' : 'Your own words'}</label>
    <textarea id="sl-own-answer" autoFocus value={draft} onChange={e => setDraft(e.target.value)} rows={2} maxLength={400} />
    <div><MicButton onText={text => setDraft(value => value ? `${value} ${text}` : text)} /><button type="submit" disabled={!draft.trim()}>Keep these words →</button><button type="button" onClick={() => setWriting(false)}>Cancel</button></div>
  </form>;

  return <motion.main initial={still ? false : { opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className={`sl-room ${still ? 'sl-still' : ''} ${quiet ? 'sl-quiet' : ''}`} style={{ fontFamily: FONT }} data-step={step}>
    <header className="sl-header">
      <button className="sl-back" onClick={back} aria-label="Previous journey step">←</button>
      <button className="sl-logo" onClick={onExit} aria-label="Back to Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
      <p className="sl-header-books" aria-hidden="true"><span>THOUGHTS</span><span>STORIES</span><span>POSSIBILITIES</span></p>
      <div className="sl-title chrome-fade"><h1>Story Lab</h1><p>Explore your mind. Find new perspectives.</p></div>
      <p className="sl-header-notes" aria-hidden="true">
        <span>Different Thoughts<br />Create Brighter<br />Tomorrows ♡</span>
        <span>Same You<br />Brighter<br />Views ♡</span>
      </p>
      <button className="sl-grownup chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
    </header>

    <div className="sl-film" ref={box} style={{ '--sl-scale': scale } as CSSProperties}>
      <div className="sl-film-row" tabIndex={-1} ref={heading}>
        <AnimatePresence initial={false}>
          {panels.map((index, position) => <motion.div
            key={index}
            className="sl-slot"
            layout={!still}
            initial={still ? false : { opacity: 0, x: 140, scale: .92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: .45, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {position > 0 && <span className="sl-film-arrow" aria-hidden="true">›</span>}
            <Panel index={index} step={step} answer={answers[index]} onBack={back} onHome={onExit}
              chirpy={index === 4 ? '/mind-gym/story-lab/chirpy-pointing.webp' : chirpySprite(index === 5 ? 'hopeful' : 'curious')}>

              {index === 2 && <div className="sl-thought-field">
                <div className="sl-thought-clouds">{thoughtOptions.map((option, i) => <button
                  key={option.text}
                  className={`sl-thought-cloud ${option.own ? 'sl-cloud-own' : ''} ${cardClass(2, option.text)}`}
                  style={{ '--drift-delay': `${i * -.7}s` } as CSSProperties}
                  disabled={step !== 2}
                  onClick={() => pick(option)}
                >{option.own && <span className="sl-mic" aria-hidden="true"><Mic size={13} strokeWidth={2.6} /></span>}{option.text}</button>)}</div>
                <img className="sl-thinking-boy" src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="Your explorer thinking" />
                <p className="sl-desk-note" aria-hidden="true">Your<br />Thoughts<br />Matter<br /><span>♡</span></p>
              </div>}

              {index === 3 && <>
                <figure className="sl-screen" aria-label="Memory theatre">
                  <img src="/mind-gym/story-lab/memory-illustration.webp" alt="An illustrated example of a moment in a school playground" />
                  <figcaption>{ageBand === 'older' ? 'What happened, before deciding what it meant?' : 'What would a little camera have seen?'}</figcaption>
                </figure>
                <div className="sl-cards">{eventOptions.map(option => <button key={option.text} className={`${option.own ? 'sl-card-own' : ''} ${cardClass(3, option.text)}`} disabled={step !== 3} onClick={() => pick(option)}>
                  <span className="sl-card-icon" aria-hidden="true">{option.icon === 'mic' ? <Mic size={15} strokeWidth={2.6} /> : option.icon}</span>{option.text}
                </button>)}</div>
              </>}

              {index === 4 && <div className="sl-assembly">
                <div className="sl-orbit" aria-label="Your feeling, body, thought and event joining together">
                  <img className="sl-orbit-bubble" src="/mind-gym/story-lab/story-bubble.webp" alt="" aria-hidden="true" />
                  <img className="sl-orbit-boy" src="/mind-gym/story-lab/boy-sitting.webp" alt="" />
                  {[0, 1, 2, 3].map(i => <div key={i} className={`sl-orbit-clue sl-orbit-${i}`}>
                    <span className="sl-orbit-icon" aria-hidden="true"><img src={`/mind-gym/home/icon_${STEP_ART[i]}.webp`} alt="" /></span>
                    <b>{STEPS[i]}</b><span>{answers[i] || 'Not sure yet'}</span>
                  </div>)}
                  <span className="sl-orbit-arrow" aria-hidden="true">▼</span>
                </div>
                <div className="sl-book"><small>Story my mind made:</small><p>“{story}”</p></div>
                <p className="sl-confirm-ask">Does this sound like what your mind was saying?</p>
                <div className="sl-cards sl-confirm">
                  <button disabled={step !== 4} onClick={() => { if (!quiet) sound.play('tap'); capture(story); }}><span className="sl-card-icon sl-icon-yes" aria-hidden="true">✓</span>Yes</button>
                  <button disabled={step !== 4} onClick={showOwn}><span className="sl-card-icon sl-icon-almost" aria-hidden="true">◑</span>Almost</button>
                  <button disabled={step !== 4} onClick={showOwn} className="sl-card-own"><span className="sl-card-icon" aria-hidden="true"><Mic size={15} strokeWidth={2.6} /></span>Change it</button>
                  <button disabled={step !== 4} onClick={() => { if (!quiet) sound.play('tap'); capture('I’m not sure what story my mind made yet.'); }}><span className="sl-card-icon sl-icon-unsure" aria-hidden="true">?</span>Not sure</button>
                </div>
              </div>}

              {index === 5 && <>
                <div className="sl-possibility-windows">
                  <div className="sl-window sl-original"><h4>Original Story</h4><img src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="" /><p>“{story}”</p></div>
                  <div className="sl-window sl-another"><h4>Another Possibility</h4>{alternative ? <img src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="" /> : <span className="sl-possibility-light" aria-hidden="true">✧</span>}<p>{alternative ? `“${alternative}”` : 'A little space for another way to see it…'}</p></div>
                </div>
                <div className="sl-cards sl-wide">{otherOptions.map(option => <button key={option.text} className={`${option.own ? 'sl-card-own' : ''} ${cardClass(5, option.text)}`} disabled={step !== 5} onClick={() => pick(option)}>
                  <span className="sl-card-icon" aria-hidden="true">{option.icon === 'mic' ? <Mic size={15} strokeWidth={2.6} /> : option.icon}</span>{option.text}
                </button>)}</div>
                <p className="sl-truth">More than one story can be true.<br />You get to choose what to believe.</p>
              </>}

              {writing && step === index && ownForm}
            </Panel>
          </motion.div>)}
        </AnimatePresence>
      </div>
    </div>

    {saveError && <p role="alert" className="sl-save-error">This device couldn’t save your journey. Your words are still here; you can try again.</p>}

    <nav className="sl-rail" aria-label="Journey progress">
      <ol>{STEPS.map((label, i) => <li key={label} className={i === step ? 'sl-current' : i < step ? 'sl-collected' : ''} aria-current={i === step ? 'step' : undefined}>
        <span className="sl-step-symbol" aria-hidden="true"><img src={`/mind-gym/home/icon_${STEP_ART[i]}.webp`} alt="" />{i < step && <b>✓</b>}</span>
        <span className="sl-step-label">{i + 1}. {label}</span>
        <span className="sl-step-answer">{i === step ? 'You are here' : answers[i] || (i < 2 ? '(In its own room)' : '')}</span>
        <span className="sr-only">{i < step ? ' — collected' : i === step ? ' — current step' : ' — coming up'}</span>
      </li>)}</ol>
      <p className={`sl-rail-badge ${step >= 6 ? 'sl-rail-done' : ''}`}><span aria-hidden="true">★</span>You’ve Explored<br />New Perspectives!</p>
    </nav>

    <footer className="sl-stop">
      <button className="chrome-fade" onClick={onExit}>Stop for now</button>
      {step >= 6 && <button className="sl-save" onClick={save} disabled={saved}>{saved ? 'Journey saved' : '✧ Save This Journey'}</button>}
      {step < 6 && step !== 4 && <button className="chrome-fade" onClick={() => capture('I’m not sure yet.')}>I’m not sure — keep going</button>}
    </footer>
  </motion.main>;
}
