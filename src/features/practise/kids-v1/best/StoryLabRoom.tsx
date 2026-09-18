import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { Mic } from 'lucide-react';
import { MicButton } from '../ui/MicButton';
import { chirpySprite } from '../ui/sprites';
import { band } from '../kit/band';
import * as sound from '../kit/sound';
import type { DeepDiveAnswers } from './DeepDive';
import './StoryLabRoom.css';

const STEPS = ['Feeling', 'Body', 'Thought', 'What happened?', 'Story', 'Another way'];
const STEP_ART = ['feeling', 'body', 'thought', 'what_happened', 'story', 'another_way'];
const PROMPTS = ['What was your mind saying?', 'What actually happened?', 'Here’s the story your mind made…', 'Could anything else be true?', 'Look at everything you noticed.'];
const ASIDES = ['Thoughts pop into our minds all the time.', 'A short answer is enough.', 'Your mind made a story from those pieces.', 'We can keep the first story and explore another.', 'Look at everything you noticed.'];

/**
 * One option on the stage.
 *
 * `own` marks the last card in every list — the one that opens the child's own
 * words instead of answering for them. It used to be a separate full-width
 * button under the choices, which cost a row of height on every step; the
 * sheet's own "Something else" and "My own idea…" cards are that door, so it
 * moved inside the grid and wears a microphone.
 */
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
  { text: 'Maybe there’s something I don’t know yet.', icon: '❋' },
  { text: 'Maybe I can try again in a different way.', icon: '✦' },
];
const SAY_IT: Option = { text: 'Say it your way', icon: 'mic', own: true };
const SOMETHING_ELSE: Option = { text: 'Something else', icon: 'mic', own: true };
const MY_OWN: Option = { text: 'My own idea…', icon: 'mic', own: true };

/** One mounted room: the central stage transforms, and every clue remains. */
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
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  /*
    The heading takes focus after the scene has finished sliding, not before.
    With `mode="wait"` the incoming step has not mounted yet when go() runs, so
    a requestAnimationFrame here would focus the node on its way out.
  */
  useEffect(() => {
    if (!moved.current) { moved.current = true; return; }
    const timer = setTimeout(() => heading.current?.focus({ preventScroll: true }), still ? 0 : 430);
    return () => clearTimeout(timer);
  }, [step, still]);
  const go = (next: number) => {
    setStep(next); setWriting(false); setDraft('');
    if (!quiet) sound.play('roomCard');
  };
  const capture = (value: string) => {
    const text = value.trim();
    if (!text) return;
    savedOnce.current = false; setSaved(false); setSaveError(false);
    if (step === 2) { setThought(text); setStory(text); setConfirmed(false); setAlternative(''); go(3); }
    else if (step === 3) { setEvent(text); setConfirmed(false); setAlternative(''); go(4); }
    else if (step === 4) { setStory(text); setConfirmed(true); setAlternative(''); go(5); }
    else if (step === 5) { setAlternative(text); go(6); }
  };
  /*
    WHAT THE CHILD HAS SAID SO FAR LIVES IN THE STRIP AT THE FOOT.

    It used to be a row of bubbles above the stage AND six labelled stops
    below, which said the same four things twice and took the top of the
    screen to do it. The strip already names every step in order, so the
    answer belongs under the step that asked for it.
  */
  const answers = [carried.feeling || '', carried.body?.join(', ') || '', thought, event, confirmed ? story : '', alternative];
  const showOwn = () => { setDraft(step === 4 ? story : ''); setWriting(true); };
  const save = () => {
    if (savedOnce.current) return;
    const ok = onSave({ ...carried, thought, eyes: event, story, other: alternative, sessionId });
    savedOnce.current = ok; setSaved(ok); setSaveError(!ok);
  };
  const options: Option[] = step === 2 ? (quiet ? [...THOUGHTS.slice(0, 3), SAY_IT] : [...THOUGHTS, SAY_IT])
    : step === 3 ? (quiet ? [...EVENTS.slice(0, 3), SOMETHING_ELSE] : [...EVENTS, SOMETHING_ELSE])
      : [...POSSIBILITIES, MY_OWN];
  const choose = (option: Option) => option.own ? showOwn() : capture(option.text);

  const slide = still ? {} : {
    initial: { opacity: 0, x: 90 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -90 },
    transition: { duration: .4, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  return <motion.main initial={still ? false : { opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className={`sl-room ${still ? 'sl-still' : ''} ${quiet ? 'sl-quiet' : ''}`} style={{ fontFamily: FONT }} data-step={step}>
    <header className="sl-header">
      <button className="sl-back" onClick={() => step === 2 ? onBody() : go(step - 1)} aria-label="Previous journey step">←</button>
      <button className="sl-logo" onClick={onExit} aria-label="Back to Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
      {/*
        THE SHELF OF WHAT THIS ROOM IS FOR, from the sheet's header band:
        thoughts, stories, possibilities — the three things the walk turns over,
        stacked as books beside the sign. Scenery, so aria-hidden.
      */}
      <p className="sl-header-books" aria-hidden="true"><span>THOUGHTS</span><span>STORIES</span><span>POSSIBILITIES</span></p>
      {/*
        The sign is painted on the wall of the room rather than sitting on top
        of it as a control, and it steps back once it has been read — see
        useIdleChrome.
      */}
      <div className="sl-title chrome-fade"><h1>Story Lab</h1><p>Explore your mind. Find new perspectives.</p></div>
      {/* The two notes pinned either side of the sign in the sheet. */}
      <p className="sl-header-notes" aria-hidden="true">
        <span>Different Thoughts<br />Create Brighter<br />Tomorrows ♡</span>
        <span>Same You<br />Brighter<br />Views ♡</span>
      </p>
      <button className="sl-grownup chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
    </header>

    <div className="sl-layout">
      <section className="sl-theatre" aria-labelledby="sl-prompt">
        <AnimatePresence mode="wait" initial={false}>
          {/*
            THE WHOLE SCENE TRAVELS, not just the answers.

            Going forward now reads as movement along the strip at the foot:
            the question and everything under it leave to the left together and
            the next step arrives from the right, so a child sees the journey
            advance rather than the screen redraw.
          */}
          <motion.div key={step} className="sl-scene" {...slide}>
            <div className="sl-ask">
              <img className="sl-ask-chirpy" src={step === 4 ? '/mind-gym/story-lab/chirpy-pointing.webp' : chirpySprite(step === 6 ? 'excited' : 'curious')} alt="Chirpy" />
              <div className="sl-ask-bubble">
                <h2 id="sl-prompt" tabIndex={-1} ref={heading}>{PROMPTS[step - 2]}</h2>
                <p>{step === 2 ? 'Tap a thought, or say it in your own words.' : step === 3 ? (ageBand === 'older' ? 'What happened, before deciding what it meant?' : 'What would a little camera have seen?') : step === 4 ? 'Your mind connects the pieces and tries to make sense of them.' : step === 5 ? 'Let’s explore some other possible stories.' : 'The same moment can have more than one possible story.'}</p>
              </div>
              {/* Chirpy's aside — the second bubble, moved up out of the
                  right-hand column so the stage has the full width. */}
              <p className="sl-aside" role="status">{quiet ? PROMPTS[step - 2] : ASIDES[step - 2]}</p>
            </div>

            <div className="sl-stage">
              {step === 2 && <div className="sl-thought-field">
                <img className="sl-thinking-boy" src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="Your explorer thinking" />
                <div className="sl-desk" aria-hidden="true" />
                <p className="sl-desk-note" aria-hidden="true">Your<br />Thoughts<br />Matter<br /><span>♡</span></p>
                <div className="sl-thought-clouds">{options.map((option, i) => <motion.button
                  key={option.text}
                  className={`sl-thought-cloud ${option.own ? 'sl-cloud-own' : ''}`}
                  style={{ '--drift-delay': `${i * -.7}s` } as CSSProperties}
                  whileHover={still ? undefined : { scale: 1.06, y: -5 }}
                  onClick={() => choose(option)}
                >{option.own && <span className="sl-mic" aria-hidden="true"><Mic size={14} strokeWidth={2.6} /></span>}{option.text}</motion.button>)}</div>
              </div>}

              {step === 3 && <>
                <figure className="sl-memory-theatre" aria-label="Memory theatre">
                  <img src="/mind-gym/story-lab/memory-illustration.webp" alt="An illustrated example of a moment in a school playground" />
                  <figcaption>Picture your own moment — this is just an example.</figcaption>
                </figure>
                <div className="sl-cards">{options.map(option => <button key={option.text} className={option.own ? 'sl-card-own' : ''} onClick={() => choose(option)}>
                  <span className="sl-card-icon" aria-hidden="true">{option.icon === 'mic' ? <Mic size={16} strokeWidth={2.6} /> : option.icon}</span>{option.text}
                </button>)}</div>
              </>}

              {step === 4 && <div className="sl-assembly">
                <div className="sl-orbit" aria-label="Your feeling, body, thought and event joining together">
                  {/* The founder's own art for this beat: the lit bubble from
                      the story bundle, with the sitting boy inside it. */}
                  <img className="sl-orbit-bubble" src="/mind-gym/story-lab/story-bubble.webp" alt="" aria-hidden="true" />
                  <img className="sl-orbit-boy" src="/mind-gym/story-lab/boy-sitting.webp" alt="" />
                  {[0, 1, 2, 3].map(i => <motion.div key={i} className={`sl-orbit-clue sl-orbit-${i}`}
                    initial={still ? false : { opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: still ? 0 : .7, delay: still ? 0 : .15 + i * .16 }}>
                    <span className="sl-orbit-icon" aria-hidden="true"><img src={`/mind-gym/home/icon_${STEP_ART[i]}.webp`} alt="" /></span>
                    <b>{STEPS[i]}</b><span>{answers[i] || 'Not sure yet'}</span>
                  </motion.div>)}
                  <span className="sl-orbit-arrow" aria-hidden="true">▼</span>
                </div>
                <div className="sl-book"><small>Story my mind made:</small><p>“{story}”</p></div>
                <p className="sl-confirm-ask">Does this sound like what your mind was saying?</p>
                <div className="sl-cards sl-confirm">
                  <button onClick={() => capture(story)}><span className="sl-card-icon sl-icon-yes" aria-hidden="true">✓</span>Yes</button>
                  <button onClick={showOwn}><span className="sl-card-icon sl-icon-almost" aria-hidden="true">◑</span>Almost</button>
                  <button onClick={showOwn} className="sl-card-own"><span className="sl-card-icon" aria-hidden="true"><Mic size={16} strokeWidth={2.6} /></span>Change it</button>
                  <button onClick={() => capture('I’m not sure what story my mind made yet.')}><span className="sl-card-icon sl-icon-unsure" aria-hidden="true">?</span>Not sure</button>
                </div>
              </div>}

              {(step === 5 || step === 6) && <>
                <div className="sl-possibility-windows">
                  <div className="sl-window sl-original"><h3>Original Story</h3><img src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="" /><p>“{story}”</p></div>
                  <div className="sl-window sl-another"><h3>Another Possibility</h3>{alternative ? <img src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="" /> : <span className="sl-possibility-light" aria-hidden="true">✧</span>}<p>{alternative ? `“${alternative}”` : 'A little space for another way to see it…'}</p></div>
                </div>
                {step === 5 && <div className="sl-cards sl-wide">{options.map(option => <button key={option.text} className={option.own ? 'sl-card-own' : ''} onClick={() => choose(option)}>
                  <span className="sl-card-icon" aria-hidden="true">{option.icon === 'mic' ? <Mic size={16} strokeWidth={2.6} /> : option.icon}</span>{option.text}
                </button>)}</div>}
                {step === 6 && <p className="sl-truth">More than one story can be true.<br />You get to choose what to believe.</p>}
              </>}

              {writing && <form className="sl-own-form" onSubmit={e => { e.preventDefault(); capture(draft); }}>
                <label htmlFor="sl-own-answer">{step === 4 ? 'The story my mind made' : 'Your own words'}</label>
                <textarea id="sl-own-answer" autoFocus value={draft} onChange={e => setDraft(e.target.value)} rows={2} maxLength={600} />
                <div><MicButton onText={text => setDraft(value => value ? `${value} ${text}` : text)} /><button type="submit" disabled={!draft.trim()}>Keep these words →</button><button type="button" onClick={() => setWriting(false)}>Cancel</button></div>
              </form>}

              {step === 6 && <div className="sl-complete">
                <button className="sl-save" onClick={save} disabled={saved}>{saved ? 'Journey saved' : '✧ Save This Journey'}</button>
                <button onClick={onExit}>Back to Mind Gym</button>
              </div>}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>

    {saveError && <p role="alert">This device couldn’t save your journey. Your words are still here; you can try again.</p>}

    <nav className="sl-rail" aria-label="Journey progress">
      <ol>{STEPS.map((label, i) => <li key={label} className={i === step ? 'sl-current' : i < step ? 'sl-collected' : ''} aria-current={i === step ? 'step' : undefined}>
        <span className="sl-step-symbol" aria-hidden="true"><img src={`/mind-gym/home/icon_${STEP_ART[i]}.webp`} alt="" />{i < step && <b>✓</b>}</span>
        <span className="sl-step-label">{i + 1}. {label}</span>
        <span className="sl-step-answer">{i === step ? 'You are here' : answers[i] || (i < 2 ? '(In its own room)' : '')}</span>
        <span className="sr-only">{i < step ? ' — collected' : i === step ? ' — current step' : ' — coming up'}</span>
      </li>)}</ol>
      {/*
        THE END OF THE RUN, as the sheet draws it: the destination sitting at
        the right-hand end of the line. It is a statement, not a button — there
        is nowhere to go from it, and a six-year-old who presses a thing that
        does nothing has been told the screen is broken. It lights once all six
        are behind them.
      */}
      <p className={`sl-rail-badge ${step >= 6 ? 'sl-rail-done' : ''}`}><span aria-hidden="true">★</span>You’ve Explored<br />New Perspectives!</p>
    </nav>

    <footer className="sl-stop">
      <button className="chrome-fade" onClick={onExit}>Stop for now</button>
      {step < 6 && step !== 4 && <button className="chrome-fade" onClick={() => capture('I’m not sure yet.')}>I’m not sure — keep going</button>}
    </footer>
  </motion.main>;
}
