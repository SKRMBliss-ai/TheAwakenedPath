import { useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { MicButton } from '../ui/MicButton';
import { chirpySprite } from '../ui/sprites';
import { band } from '../kit/band';
import * as sound from '../kit/sound';
import type { DeepDiveAnswers } from './DeepDive';
import './StoryLabRoom.css';

const STEPS = ['Feeling', 'Body', 'Thought', 'What happened?', 'Story', 'Another way'];
const SYMBOLS = ['♡', '♧', '☁', '▣', '▤', '✧'];
const THOUGHTS = ['I can’t do it.', 'They don’t like me.', 'It’s not fair.', 'What if…?', 'I’m not sure.'];
const EVENTS = ['Someone said something', 'I had to wait', 'I didn’t get to join', 'I made a mistake', 'Something changed', 'Something else'];
const POSSIBILITIES = ['Maybe it only happened this time.', 'Maybe there’s something I don’t know yet.', 'Maybe I can try again in a different way.'];
const PROMPTS = ['What was your mind saying?', 'What actually happened?', 'Here’s the story your mind made…', 'Could anything else be true?', 'Look at everything you noticed.'];

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
  const go = (next: number) => {
    setStep(next); setWriting(false); setDraft('');
    if (!quiet) sound.play('roomCard');
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
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
  const clues = [carried.feeling || 'Not sure yet', carried.body?.join(', ') || 'Not sure yet', thought, event, confirmed ? story : '', alternative];
  const showOwn = () => { setDraft(step === 4 ? story : ''); setWriting(true); };
  const save = () => {
    if (savedOnce.current) return;
    const ok = onSave({ ...carried, thought, eyes: event, story, other: alternative, sessionId });
    savedOnce.current = ok; setSaved(ok); setSaveError(!ok);
  };
  const options = step === 2 ? (quiet ? [...THOUGHTS.slice(0, 3), 'I’m not sure.'] : THOUGHTS)
    : step === 3 ? (quiet ? [...EVENTS.slice(0, 3), 'I’m not sure.'] : EVENTS)
    : [...POSSIBILITIES, 'I’m not sure yet.'];

  return <main className={`sl-room ${still ? 'sl-still' : ''} ${quiet ? 'sl-quiet' : ''}`} style={{ fontFamily: FONT }} data-step={step}>
    <header className="sl-header">
      <button className="sl-back" onClick={() => step === 2 ? onBody() : go(step - 1)} aria-label="Previous journey step">←</button>
      <button className="sl-logo" onClick={onExit} aria-label="Back to Mind Gym">Mind<span>Gym</span></button>
      <div className="sl-title"><h1>Story Lab</h1><p>Explore your mind. Find new perspectives.</p></div>
      <button className="sl-grownup" onClick={onGrownUp}>♡ Talk to a grown-up</button>
    </header>
    <div className="sl-layout">
      <nav className="sl-rail" aria-label="Journey progress"><ol>{STEPS.map((label, i) => <li key={label} className={i === step ? 'sl-current' : i < step ? 'sl-collected' : ''} aria-current={i === step ? 'step' : undefined}>
        <span className="sl-step-symbol" aria-hidden="true">{i < step ? '✓' : SYMBOLS[i]}</span><span>{i + 1}. {label}</span><span className="sr-only">{i < step ? ' — collected' : i === step ? ' — current step' : ' — coming up'}</span>
      </li>)}</ol><p className="sl-rail-note">Small steps.<br />Brighter views.</p></nav>
      <section className="sl-theatre" aria-labelledby="sl-prompt">
        <div className="sl-memory-trail" aria-label="Collected clues">{clues.map((text, i) => text && <span key={STEPS[i]} className={`sl-clue sl-clue-${i}`}><b>{SYMBOLS[i]} {STEPS[i]}</b><span>{text}</span></span>)}</div>
        <div className="sl-stage-heading"><p>{step < 6 ? `Step ${step + 1} of 6` : 'Your journey'}</p><h2 id="sl-prompt" tabIndex={-1} ref={heading}>{PROMPTS[step - 2]}</h2>
          <p>{step === 2 ? 'Tap a thought, or tell me in your own words.' : step === 3 ? (ageBand === 'older' ? 'What happened, before deciding what it meant?' : 'What would a little camera have seen?') : step === 4 ? 'Your mind connects the pieces and tries to make sense of them.' : step === 5 ? 'Let’s explore some other possible stories.' : 'The same moment can have more than one possible story.'}</p>
        </div>
        <div className="sl-stage">
          {step === 2 && <div className="sl-thought-field">{options.map((text, i) => <motion.button key={text} className="sl-thought-cloud" style={{ '--drift-delay': `${i * -.7}s` } as CSSProperties} whileHover={still ? undefined : { scale: 1.06, y: -5 }} onClick={() => capture(text)}>{text}</motion.button>)}<img className="sl-thinking-boy" src="/mind-gym/story-lab/boy_story_lab.webp" alt="Your explorer thinking" /></div>}
          {step === 3 && <><div className="sl-memory-theatre" aria-label="Memory theatre"><div className="sl-film-perforations" /><span className="sl-memory-camera" aria-hidden="true">✧ ▣ ✧</span><p>A little moment from your day</p><small>Just what someone could see or hear.</small><div className="sl-film-perforations" /></div><div className="sl-event-options">{options.map((text, i) => <button key={text} onClick={() => capture(text)}><span aria-hidden="true">{['☏', '◷', '♧', '✧', '↝', '…'][i]}</span>{text}</button>)}</div></>}
          {step === 4 && <div className="sl-assembly">
            <div className="sl-orbit" aria-label="Your feeling, body, thought and event joining together">{[carried.feeling, carried.body?.join(', '), thought, event].map((text, i) => <motion.div key={i} className={`sl-orbit-clue sl-orbit-${i}`} initial={still ? false : { opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: still ? 0 : .8, delay: still ? 0 : i * .18 }}><b>{STEPS[i === 3 ? 3 : i]}</b><span>{text || 'Not sure yet'}</span></motion.div>)}<div className="sl-story-orb" aria-hidden="true">✧</div></div>
            <div className="sl-story-book"><small>Story my mind made</small><p>“{story}”</p></div>
            <p className="sl-confirm-ask">Does this sound like what your mind was saying?</p><div className="sl-confirm-options"><button onClick={() => capture(story)}>✓ Yes</button><button onClick={showOwn}>Almost</button><button onClick={showOwn}>✎ Change it</button><button onClick={() => capture('I’m not sure what story my mind made yet.')}>Not sure</button></div>
          </div>}
          {(step === 5 || step === 6) && <><p className="sl-same-event"><b>The same event</b> {event}</p><div className="sl-possibility-windows"><div className="sl-window sl-original"><h3>Original story</h3><span aria-hidden="true">☁</span><p>“{story}”</p></div><div className="sl-window sl-another"><h3>Another possibility</h3><span aria-hidden="true">✧</span><p>{alternative ? `“${alternative}”` : 'A little space for another way to see it…'}</p></div></div>
            {step === 5 && <div className="sl-alternatives">{options.map(text => <button key={text} onClick={() => capture(text)}>{text}</button>)}</div>}
          </>}
          {step < 6 && !writing && <button className="sl-own-words" onClick={showOwn}>{step === 3 ? 'Tell it in your own words' : step === 5 ? 'My own idea…' : 'Say it your way'} <span aria-hidden="true">✎</span></button>}
          {writing && <form className="sl-own-form" onSubmit={e => { e.preventDefault(); capture(draft); }}><label htmlFor="sl-own-answer">{step === 4 ? 'The story my mind made' : 'Your own words'}</label><textarea id="sl-own-answer" autoFocus value={draft} onChange={e => setDraft(e.target.value)} rows={2} maxLength={600} /><div><MicButton onText={text => setDraft(value => value ? `${value} ${text}` : text)} /><button type="submit" disabled={!draft.trim()}>Keep these words →</button><button type="button" onClick={() => setWriting(false)}>Cancel</button></div></form>}
          {step === 6 && <div className="sl-complete"><div className="sl-constellation" aria-label="Six connected journey pieces">{STEPS.map((label, i) => <span key={label}>{SYMBOLS[i]}<small>{label}</small></span>)}</div><button className="sl-save" onClick={save} disabled={saved}>{saved ? 'Journey saved' : '✧ Save This Journey'}</button><button onClick={onExit}>Back to Mind Gym</button></div>}
        </div>
      </section>
      <aside className="sl-guide" aria-label="Chirpy’s guide"><div className="sl-guide-bubble" role="status">{quiet ? PROMPTS[step - 2] : step === 2 ? 'Thoughts pop into our minds all the time.' : step === 3 ? 'A short answer is enough.' : step === 4 ? 'Your mind made a story from those pieces.' : step === 5 ? 'We can keep the first story and explore another.' : 'Look at everything you noticed.'}</div><img src={chirpySprite(step === 6 ? 'hopeful' : 'curious')} alt="Chirpy" /><p>Same you.<br />Brighter views. ♡</p></aside>
    </div>
    {saveError && <p role="alert">This device couldn’t save your journey. Your words are still here; you can try again.</p>}
    <footer className="sl-stop"><button onClick={onExit}>Stop for now</button>{step < 6 && step !== 4 && <button onClick={() => capture('I’m not sure yet.')}>I’m not sure — keep going</button>}</footer>
  </main>;
}
