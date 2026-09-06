import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { SCENE_MOODS } from '../rooms';
import { CHROME, FONT } from '../ui/chrome';
import { addNote, loadNotes, MAX_NOTE } from '../kit/notes';
import { agoLabel, loadCases } from '../kit/cases';
import { shownIds } from '../kit/shown';

/**
 * WHERE A GROWN-UP WRITES THE ONE LINE. See kit/notes for the rules this
 * screen exists to enforce.
 *
 * THIS IS NOT THE "TALK TO A GROWN-UP" SCREEN and must never be confused with
 * it. That one (GrownUp.tsx) is safety-critical: a child has decided to tell
 * someone something, Chirpy is not rendered, there is no motion and no art,
 * and it points at a person. This is an ordinary utility for a parent with a
 * spare thirty seconds. They share a word in their names and nothing else.
 *
 * IT IS DELIBERATELY PLAIN. No character, no animation, no warmth aimed at
 * the adult — every pixel of charm here would be charm spent on the wrong
 * person, and a parent who finds this fun will write more notes than they
 * actually noticed things.
 *
 * THE SUM ON THE DOOR is not security and isn't pretending to be. It is a
 * speed bump that a six-year-old won't bother with and an adult clears
 * without thinking, which is exactly the amount of protection this needs: the
 * cost of a child getting in is that they read notes meant for them anyway.
 */

/** Deliberately beyond an infant-school child and trivial for an adult. */
const SUM = { q: 'What is 7 × 8?', a: 56 };

export function LeaveANote({ onBack }: { onBack: () => void }) {
  const mood = SCENE_MOODS.night;
  const [passed, setPassed] = useState(false);
  const [guess, setGuess] = useState('');
  const [from, setFrom] = useState(() => {
    try { return localStorage.getItem('mindgym.kidsv1.noteFrom') ?? ''; } catch { return ''; }
  });
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const written = loadNotes();

  /**
   * WHAT THE CHILD CHOSE TO HAND OVER — and nothing else. There is no view
   * anywhere in this app of the cases they didn't share, and there is not
   * going to be one; see kit/shown.
   */
  const shared = (() => {
    const ids = shownIds();
    return loadCases().filter((c) => c.id && ids.has(c.id));
  })();

  const send = () => {
    if (!text.trim()) return;
    addNote(text, from);
    try { localStorage.setItem('mindgym.kidsv1.noteFrom', from.trim()); } catch { /* ignore */ }
    setText('');
    setSent(true);
  };

  return (
    <div
      className="relative min-h-[100svh] w-full"
      style={{
        fontFamily: FONT,
        background: `linear-gradient(170deg, ${mood.ground[0]} 0%, ${mood.ground[1]} 100%)`,
      }}
    >
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col gap-5 px-5 pb-10 pt-4 sm:px-7">
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-11 w-11 place-items-center rounded-full"
          style={{ background: CHROME.back, border: `1px solid ${CHROME.backBorder}`, color: CHROME.text }}
        >
          <ChevronLeft size={22} />
        </button>

        {!passed ? (
          <div className="flex flex-1 flex-col justify-center gap-4">
            <h1 className="text-[22px] font-extrabold" style={{ color: CHROME.text }}>
              This bit’s for a grown-up
            </h1>
            <p className="text-[14px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
              {SUM.q}
            </p>
            <input
              inputMode="numeric"
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                if (Number(e.target.value) === SUM.a) setPassed(true);
              }}
              className="w-32 rounded-2xl px-4 py-3 text-[16px] font-bold outline-none"
              style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
              aria-label="Answer"
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <h1 className="text-[22px] font-extrabold" style={{ color: CHROME.text }}>
                Leave a note
              </h1>
              <p className="mt-1.5 text-[13.5px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
                One thing you actually saw them do. They’ll find it next time
                they’re in. You can’t take it back once it’s in there, and
                there’s nowhere here to write a complaint — that’s on purpose.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: CHROME.textSoft }}>
                From
              </span>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Mum"
                maxLength={24}
                className="rounded-2xl px-4 py-3 text-[15px] font-bold outline-none"
                style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: CHROME.textSoft }}>
                Something I noticed
              </span>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value.slice(0, MAX_NOTE)); setSent(false); }}
                rows={3}
                placeholder="I saw you let your sister go first."
                className="resize-none rounded-2xl px-4 py-3 text-[15px] font-semibold leading-snug outline-none"
                style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
              />
              <span className="text-right text-[11.5px] font-bold" style={{ color: CHROME.textSoft }}>
                {text.length}/{MAX_NOTE}
              </span>
            </label>

            <button
              onClick={send}
              disabled={!text.trim()}
              className="rounded-full px-5 py-3.5 text-[14px] font-extrabold disabled:opacity-40"
              style={{ background: '#FFC65C', color: '#2B1A05' }}
            >
              Leave it for them
            </button>

            {sent && (
              <p className="text-[13px] font-bold" style={{ color: '#8FD9C4' }}>
                It’s in. They’ll find it next time they open the gym.
              </p>
            )}

            {shared.length > 0 && (
              <div className="mt-4 flex flex-col gap-2.5">
                <span className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: '#8FD9C4' }}>
                  Shown to you
                </span>
                <p className="text-[12.5px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
                  Only what they picked out for you. They can take any of it
                  back whenever they like, and you won’t be told when they do.
                </p>
                {shared.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-[16px] px-3.5 py-3"
                    style={{ background: 'rgba(143,217,196,0.10)', border: '1px solid rgba(143,217,196,0.34)' }}
                  >
                    <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em]" style={{ color: CHROME.textSoft }}>
                      {agoLabel(c.day)}{c.feeling ? ` · ${c.feeling.toLowerCase()}` : ''}
                    </p>
                    {c.story && (
                      <p className="mt-1.5 text-[13.5px] font-bold leading-snug" style={{ color: CHROME.text }}>
                        Their mind said: “{c.story}”
                      </p>
                    )}
                    {c.other && (
                      <p className="mt-1 text-[13px] font-semibold leading-snug" style={{ color: '#FFD98A' }}>
                        They found: “{c.other}”
                      </p>
                    )}
                    {c.drawing && (
                      <img
                        src={c.drawing}
                        alt=""
                        className="mt-2 w-full max-w-[180px] rounded-[12px]"
                        style={{ background: 'rgba(255,255,255,0.9)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {written.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: CHROME.textSoft }}>
                  Already left
                </span>
                {/* The grown-up can see what they've written — they wrote it —
                    but there is nothing to press here. No edit, no delete, and
                    no indication of whether it's been read: a parent watching
                    read receipts is a different app entirely. */}
                {written.slice(0, 8).map((n) => (
                  <p
                    key={n.id}
                    className="rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold leading-snug"
                    style={{ background: 'rgba(255,255,255,0.06)', color: CHROME.textSoft }}
                  >
                    {n.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
