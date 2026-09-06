import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS } from '../../../kids/data';
import { oneTrueLine } from '../kit/oneTrueLine';
import { getRoom } from '../rooms';
import { CHROME, Cta, FONT, GrownUpExit, Question } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { FloatingFeeling } from '../ui/FloatingFeeling';
import { MicButton } from '../ui/MicButton';
import { HearYourself } from '../ui/HearYourself';
import { allLinks, linkClip } from '../kit/voiceStore';
import { Chirpy, RoomScene } from '../ui/scene';
import { LifetimeJar } from './LifetimeJar';
import { LetThemGo } from './LetThemGo';
import { starCount } from '../kit/sky';
import { agoLabel, deleteCaseAt, deleteDrawingAt, loadCases, type Case } from '../kit/cases';
import { shownIds, toggleShown } from '../kit/shown';
import { allHung, hangIn, takeDown } from '../kit/hung';
import { VIRTUE_ROOMS } from './rooms';

/**
 * THE REFLECTION OBSERVATORY — where the day's journey ends.
 *
 * A child arrives here having just been round the rooms, so this is the one
 * place in the app that talks about the whole picture rather than one virtue.
 * It holds what "Look Back & Learn" held: the month grid, the four questions,
 * and the counts.
 *
 * THE GRID IS THE POINT. Seven virtues down, the days of the month across,
 * every square tappable — including past days, because a child remembering on
 * Thursday that they were kind on Tuesday should be able to say so. It reads
 * as a star map on the observatory wall rather than as a spreadsheet, which
 * is both nicer and more honest about what it is: a record of a lot of small
 * things, most of which are empty, and that being completely fine.
 *
 * EMPTY SQUARES ARE NOT FAILURES and nothing here may imply they are. There
 * is no red, no "missed", no percentage, no comparison to last month. A blank
 * square means a day nobody ticked, which is most days for most people.
 */
export function ReflectionRoom({
  onExit,
  onGrownUp,
  onLeaveNote,
}: {
  onExit: () => void;
  onGrownUp: () => void;
  /** Opens the parent's note composer — NOT the safety screen. */
  onLeaveNote: () => void;
}) {
  const s = useKidStore();
  const art = getRoom('reflection');
  const accent = art.palette.accent;

  /**
   * Lifted out of the shelf/wall components and into state here, rather
   * than each of them calling loadCases() straight from localStorage on
   * every render: deleting a doodle needs the SAME list both of them are
   * reading to update in one place, or the wall could clear a picture the
   * shelf still thinks is there.
   */
  const [cases, setCases] = useState(() => loadCases());
  const deleteDrawing = (index: number) => setCases(deleteDrawingAt(index));
  const deleteCase = (index: number) => setCases(deleteCaseAt(index));

  /**
   * Which of the four answers have a recording, held in state rather than
   * read from storage at render time — writing the link doesn't re-render
   * React, so a child who had just spoken their answer got no play button
   * until they left the room and came back.
   */
  const [voiceClips, setVoiceClips] = useState<Record<string, string>>(() => allLinks());
  const keepVoice = (answerKey: string, clipId: string) => {
    linkClip(answerKey, clipId);
    setVoiceClips((v) => ({ ...v, [answerKey]: clipId }));
  };

  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isThisMonth = month.getMonth() === now.getMonth() && month.getFullYear() === now.getFullYear();

  const keyFor = (d: number) =>
    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const totalFor = (behaviourId: string) =>
    days.reduce((n, d) => n + (s.completions[keyFor(d)]?.[behaviourId] ? 1 : 0), 0);

  const stars = starCount();
  const monthTotal = BEHAVIOURS.reduce((n, b) => n + totalFor(b.id), 0);
  const review = s.monthReviews[monthKey] ?? {};

  /**
   * EVERY FIREFLY THIS CHILD HAS EVER CAUGHT — not just the month the grid
   * happens to be showing. One entry per virtue per day it was ticked, so
   * a virtue done on ten different days contributes ten lights rather than
   * one; the lifetime jar is exactly the place a repeat is allowed to be a
   * second light instead of overwriting the first, which is what both the
   * grid and the daily catch jar do on purpose.
   */
  const allCaught = BEHAVIOURS.flatMap((b) => {
    const n = Object.values(s.completions).filter((day) => day[b.id]).length;
    return Array<string>(n).fill(b.id);
  });

  const QUESTIONS = [
    { key: 'learned', emoji: '💗', q: 'What did I learn about myself this month?' },
    { key: 'proud', emoji: '🌟', q: 'What made me feel proud?' },
    { key: 'hard', emoji: '💡', q: 'What was hard? What could I try next time?' },
    { key: 'next', emoji: '🎯', q: 'What am I aiming for next month?' },
  ];

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* Whatever the child named today comes with them into this room —
          bouncing, draggable, and parked wherever they last put him. */}
      <FloatingFeeling />

      {/* Every firefly this child has ever caught, floating free and
          draggable — the one number in this room that isn't scoped to
          whichever month the grid happens to be showing. */}
      <LifetimeJar caught={allCaught} />

      {/* The way out is a fitting on the left wall, the same one on every
          screen in the app. No chevron in the corner any more: a child who
          learns one door learns them all. */}
      <DoorHandle side="left" label="Back" onClick={onExit} accent={accent} />

      <RoomScene room={art} dim={0.42} />

      <div className="relative mx-auto w-full max-w-4xl px-[74px] pb-28 pt-4 sm:px-20">
        <div className="flex items-center justify-between gap-3">
          <GrownUpExit onClick={onGrownUp} />
        </div>

        <div className="flex flex-col items-center gap-2 pt-5 text-center">
          <Chirpy pose="hopeful" line="Come and see the whole map." align="left" />
          <Question room={art}>Look Back &amp; Learn</Question>
          <p className="max-w-md text-[13.5px] font-semibold" style={{ color: CHROME.textSoft }}>
            {stars === 1 ? 'One night in the gym' : `${stars} nights in the gym`}
          </p>
        </div>

        {/* THE ONE SENTENCE. Everything else in this room is a record a child
            of six has to be taught to read — a grid, a shelf, a jar. This is
            the room saying the thing out loud, in words, once. See
            kit/oneTrueLine for the rules it keeps (never a target, never the
            virtue they do least, and no favourite unless there really is
            one). */}
        <p
          className="mx-auto mt-4 max-w-md text-center text-[18px] font-extrabold leading-snug sm:text-[20px]"
          style={{ color: CHROME.text, textWrap: 'balance' }}
        >
          {oneTrueLine(s.completions)}
        </p>

        {/* The other thing you can do with a jar. Sits under the sentence
            rather than on the jar itself — see LetThemGo on why this is not
            a second gesture hung off a thing a child already taps. */}
        <LetThemGo lifetimeTotal={allCaught.length} />

        {/* ── The star map, ALWAYS FIRST ──────────────────────────────
            It used to sit below the cases shelf, which meant a child with
            a growing pile of worked-out cases had to scroll past all of
            them to reach the one thing this room is actually for: marking
            today. The shelf and the doodle wall below can both grow without
            limit; this can't be allowed to move because of it. */}
        <div
          className="mt-5 rounded-[22px] p-3 backdrop-blur-md sm:p-4"
          style={{ background: 'rgba(10,8,24,0.55)', border: `1px solid ${CHROME.pillBorder}` }}
        >
          <div className="flex items-center justify-between gap-3 px-1 pb-3">
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-[15px] font-bold"
              style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
              aria-label="Previous month"
            >‹</button>
            <p className="text-[14.5px] font-extrabold" style={{ color: CHROME.text }}>
              {month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </p>
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-[15px] font-bold"
              style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
              aria-label="Next month"
            >›</button>
          </div>

          {/* Scrolls sideways on a phone rather than shrinking the squares
              past the point a thumb can hit one. */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: daysInMonth * 22 + 132 }}>
              <div className="flex items-center gap-1 pb-1.5 pl-[124px]">
                {days.map((d) => (
                  <span
                    key={d}
                    className="w-[18px] shrink-0 text-center text-[9px] font-bold"
                    style={{ color: isThisMonth && d === now.getDate() ? accent : 'rgba(255,255,255,0.4)' }}
                  >
                    {d}
                  </span>
                ))}
                <span className="ml-1 w-[26px] shrink-0 text-center text-[9px] font-extrabold" style={{ color: CHROME.textSoft }}>
                  ALL
                </span>
              </div>

              {BEHAVIOURS.map((b) => (
                <div key={b.id} className="flex items-center gap-1 py-[3px]">
                  <span className="w-[120px] shrink-0 truncate pr-1 text-[11px] font-bold" style={{ color: CHROME.text }}>
                    <span className="mr-1">{b.icon}</span>{b.title}
                  </span>
                  {days.map((d) => {
                    const on = !!s.completions[keyFor(d)]?.[b.id];
                    const future = isThisMonth && d > now.getDate();
                    return (
                      <button
                        key={d}
                        disabled={future}
                        onClick={() => s.setBehaviourOn(keyFor(d), b.id, !on)}
                        aria-label={`${b.title}, day ${d}${on ? ', done' : ''}`}
                        className="h-[18px] w-[18px] shrink-0 rounded-full transition-all"
                        style={{
                          background: on ? b.color : 'rgba(255,255,255,0.07)',
                          boxShadow: on ? `0 0 10px -2px ${b.color}` : 'none',
                          border: `1px solid ${on ? b.color : 'rgba(255,255,255,0.12)'}`,
                          opacity: future ? 0.25 : 1,
                          cursor: future ? 'default' : 'pointer',
                        }}
                      />
                    );
                  })}
                  <span
                    className="ml-1 w-[26px] shrink-0 text-center text-[11px] font-extrabold"
                    style={{ color: totalFor(b.id) ? b.color : 'rgba(255,255,255,0.35)' }}
                  >
                    {totalFor(b.id)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="pt-2.5 text-center text-[11.5px] font-semibold" style={{ color: CHROME.textSoft }}>
            Tap any day to mark it — past days too. An empty square is just a day nobody ticked.
          </p>
        </div>

        {/* Kept beside the grid rather than down with the cases — this
            summarises the SAME data the grid just showed, not the child's
            own words, so it belongs with the thing it's counting. */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Stat big={String(monthTotal)} label="good choices this month" accent={accent} />
          <Stat big={String(s.badges.length)} label="badges earned" accent={accent} />
        </div>

        {/* ── The four questions ─────────────────────────────────────── */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {QUESTIONS.map((q) => (
            <motion.div
              key={q.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] p-3.5 backdrop-blur-md"
              style={{ background: 'rgba(10,8,24,0.5)', border: `1px solid ${CHROME.pillBorder}` }}
            >
              <label className="mb-2 block text-[13px] font-extrabold" style={{ color: CHROME.text }}>
                <span className="mr-1.5">{q.emoji}</span>{q.q}
              </label>
              <div className="flex items-end gap-2">
                <textarea
                  value={review[q.key] ?? ''}
                  onChange={(e) => s.setMonthReview(monthKey, q.key, e.target.value)}
                  rows={3}
                  placeholder="Whatever comes to mind…"
                  className="min-w-0 flex-1 resize-none rounded-[14px] bg-transparent px-3 py-2 text-[13.5px] font-semibold outline-none placeholder:opacity-45"
                  style={{ color: CHROME.text, border: `1px solid ${CHROME.pillBorder}` }}
                />
                {/* These four are the longest answers the app ever asks a
                    child for, and they're asked at the end of a month —
                    exactly where typing them out is most likely to shorten
                    the answer to nothing. */}
                <MicButton
                  accent={accent}
                  onText={(t) => {
                    const prev = review[q.key] ?? '';
                    s.setMonthReview(monthKey, q.key, prev ? `${prev} ${t}` : t);
                  }}
                  /* And keep the voice, not just the words. These four
                     questions are the only place in the app a child talks at
                     length about themselves, which makes them the only
                     recordings worth having in a year's time. */
                  onVoice={(clipId) => keepVoice(`${monthKey}:${q.key}`, clipId)}
                />
              </div>

              {/* Only appears once there IS a recording — see HearYourself. */}
              <div className="mt-2 flex">
                <HearYourself clipId={voiceClips[`${monthKey}:${q.key}`] ?? null} accent={accent} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── The cases, folded away by default ───────────────────────
            This used to sit right under the grid. It's down here now for
            the same reason the grid had to move up in the first place: the
            grid is what this room is FOR, and a growing pile of case text
            pushed it further down every time a child worked something out.
            Collapsed rather than removed, because the words underneath are
            still the most important thing this app keeps — just not the
            first thing this particular room needs to show. This section is
            also expected to move house entirely once there's a better room
            for it; it stays lightweight here on purpose. */}
        <CaseShelf accent={accent} cases={cases} onDelete={deleteCase} />

        {/* ── The doodle wall, LAST ───────────────────────────────────
            Everything the child has drawn while working something out,
            gathered into one gallery rather than left scattered inside
            each case card — a fridge door, not a filing cabinet. It sits
            at the very bottom on purpose: the grid at the top is what this
            room is FOR, the pictures are what make it worth lingering on
            the way out. */}
        <DoodleWall cases={cases} onDelete={deleteDrawing} />

        <p className="py-5 text-center text-[13px] font-bold" style={{ color: accent }}>
          I am the master of my choices.
        </p>

        <Cta label="Back to the rooms" onClick={onExit} accent={accent} />

        {/* THE WAY IN FOR A PARENT, and deliberately the dullest thing on the
            screen: small, grey, at the very bottom, under the way out. An
            adult scrolling to the end of this room will find it; a
            six-year-old has already tapped "Back to the rooms". What's behind
            it is the note composer, not the safety screen — see LeaveANote. */}
        <button
          onClick={onLeaveNote}
          className="mx-auto mt-6 block text-[11.5px] font-bold"
          style={{ color: 'rgba(255,255,255,0.42)', minHeight: 40 }}
        >
          For a grown-up · leave a note
        </button>
      </div>
    </div>
  );
}

function Stat({ big, label, accent }: { big: string; label: string; accent: string }) {
  return (
    <div
      className="rounded-[18px] px-2 py-3 text-center backdrop-blur-md"
      style={{ background: 'rgba(10,8,24,0.5)', border: `1px solid ${CHROME.pillBorder}` }}
    >
      <p className="text-[22px] font-extrabold leading-none" style={{ color: accent }}>{big}</p>
      <p className="mt-1 text-[10.5px] font-bold leading-tight" style={{ color: CHROME.textSoft }}>{label}</p>
    </div>
  );
}

/**
 * How far back the shelf reaches before it stops on its own.
 *
 * Not a limit on what is KEPT — kit/cases holds forty of them regardless.
 * A child who opens this after two months of most-evenings is looking at a
 * wall of their own text, and the ones that teach them something are the
 * recent ones they can still remember the day of. Everything older is one
 * tap away rather than gone, because it is theirs and because they cannot
 * throw away what the app won't show them.
 */
const SHELF_DAYS = 20;

/** The oldest day the shelf shows unasked. Same UTC day-key as saveCase. */
function shelfCutoff(): string {
  return new Date(Date.now() - SHELF_DAYS * 86400000).toISOString().slice(0, 10);
}

/**
 * THE SHELF — the cases this child has worked, newest first, in days, folded
 * away behind a header until tapped open.
 *
 * Two lines each: what their mind said, and what else they found could be
 * true. Nothing else fits on a card and nothing else is the point.
 *
 * GROUPED BY DAY, because two cases worked on the same evening belong to
 * that evening — read as a flat list they look like two unrelated events
 * that happen to sit next to each other. The heading carries the distance
 * ("3 weeks ago") and the cards under it carry the words, so the date is
 * said once per day rather than once per card. Distance rather than dates
 * throughout: "2026-08-15" means nothing to a seven-year-old.
 *
 * No case is ever marked good or better. They are things that happened and
 * things the child worked out, sitting next to each other, which is the only
 * form this can take without becoming a report card.
 *
 * Text only. Whatever picture a case came with lives in DoodleWall now, not
 * here — one gallery for every drawing, rather than one image buried inside
 * each card, which is also what lets a picture be cleared without touching
 * the words it was drawn next to.
 *
 * COLLAPSED BY DEFAULT, and this is provisional plumbing rather than a
 * finished design — the plan is for this whole shelf to move into a room
 * of its own eventually, and it isn't worth the visual weight of a fully
 * expanded, always-on list here in the meantime. Nothing renders at all
 * when there are no cases yet: a header for an empty thing you can't even
 * open is a dead end, not an invitation.
 */
function CaseShelf({
  accent,
  cases,
  onDelete,
}: {
  accent: string;
  cases: Case[];
  onDelete: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showOlder, setShowOlder] = useState(false);
  const [arming, setArming] = useState<number | null>(null);

  /**
   * Which of these the child has handed to a grown-up. Held in state so the
   * label flips under their finger; the truth is in localStorage (kit/shown).
   */
  const [sharedWith, setSharedWith] = useState<Set<string>>(() => shownIds());
  const flipShown = (id: string) => {
    toggleShown(id);
    setSharedWith(shownIds());
  };

  if (!cases.length) return null;

  const cutoff = shelfCutoff();
  // The index is the case's position in the stored list, and deleting needs
  // it — so it is carried along rather than recovered from the day, which
  // several cases can share.
  const all = cases.map((c, index) => ({ c, index }));
  const olderCount = all.filter((x) => x.c.day < cutoff).length;
  const shown = showOlder ? all : all.filter((x) => x.c.day >= cutoff);

  // Newest first already (saveCase prepends), so same-day cases are always
  // adjacent and a single pass is enough to gather them.
  const days: { day: string; items: typeof all }[] = [];
  for (const item of shown) {
    const last = days[days.length - 1];
    if (last && last.day === item.c.day) last.items.push(item);
    else days.push({ day: item.c.day, items: [item] });
  }

  return (
    <div className="mt-5">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.98 }}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-[16px] px-4 py-3 backdrop-blur-md"
        style={{ background: 'rgba(12,10,26,0.42)', border: `1px solid ${CHROME.pillBorder}` }}
      >
        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: accent }}>
          Cases you worked out · {cases.length}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} color={CHROME.textSoft} />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-4 pt-3">
              {days.map(({ day, items }) => (
                <div key={day}>
                  <p className="mb-1.5 px-1 text-[10.5px] font-extrabold uppercase tracking-[0.14em]" style={{ color: accent }}>
                    {agoLabel(day)}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {items.map(({ c, index }) => {
                      const armed = arming === index;
                      return (
                        <motion.div
                          key={index}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.3 }}
                          className="relative rounded-[20px] py-3 pl-4 pr-12 backdrop-blur-md"
                          style={{
                            background: 'rgba(12,10,26,0.52)',
                            border: `1px solid ${armed ? '#E8735F' : CHROME.pillBorder}`,
                          }}
                        >
                          {c.feeling && (
                            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em]" style={{ color: CHROME.textSoft }}>
                              {c.feeling.toLowerCase()}
                            </p>
                          )}
                          {c.story && (
                            <p className="mt-1.5 text-[14px] font-bold leading-snug" style={{ color: CHROME.text }}>
                              Your mind said: “{c.story}”
                            </p>
                          )}
                          {c.other && (
                            <p className="mt-1 text-[13.5px] font-semibold leading-snug" style={{ color: '#FFD98A' }}>
                              You found: “{c.other}”
                            </p>
                          )}

                          {/*
                            HANDING IT TO SOMEBODY, and taking it back.

                            Plain words rather than an icon: "share" is a verb
                            a six-year-old knows from a very different context
                            (a button that sends things to strangers), and the
                            one thing this must be unambiguous about is that
                            it goes to a person in this house and nowhere
                            else. Taking it back is the same tap, and leaves
                            nothing behind — see kit/shown.
                          */}
                          {c.id && (
                            <button
                              onClick={() => flipShown(c.id!)}
                              className="mt-2.5 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold"
                              style={{
                                background: sharedWith.has(c.id) ? '#8FD9C4' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${sharedWith.has(c.id) ? '#8FD9C4' : CHROME.pillBorder}`,
                                color: sharedWith.has(c.id) ? '#0E1A1C' : CHROME.textSoft,
                              }}
                            >
                              {sharedWith.has(c.id) ? 'A grown-up can see this · tap to stop' : 'Show this to a grown-up'}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (armed) { onDelete(index); setArming(null); return; }
                              setArming(index);
                              window.setTimeout(() => setArming((cur) => (cur === index ? null : cur)), 2400);
                            }}
                            aria-label={armed ? 'Tap again to delete this one' : 'Delete this one'}
                            className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full transition-colors"
                            style={{
                              background: armed ? '#E8735F' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${armed ? '#E8735F' : CHROME.pillBorder}`,
                            }}
                          >
                            <X size={14} strokeWidth={3} color={armed ? '#FFFFFF' : CHROME.textSoft} />
                          </button>

                          <AnimatePresence>
                            {armed && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mt-2 text-[11.5px] font-extrabold"
                                style={{ color: '#E8735F' }}
                              >
                                Tap again to throw this one away.
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Older than the window. One tap, and only offered when there
                  is something behind it — a button that reveals nothing is
                  a small lie. */}
              {olderCount > 0 && (
                <button
                  onClick={() => setShowOlder((v) => !v)}
                  className="py-1 text-[12px] font-bold"
                  style={{ color: CHROME.textSoft }}
                >
                  {showOlder
                    ? 'Just the last few weeks'
                    : `${olderCount} older ${olderCount === 1 ? 'one' : 'ones'} — show ${olderCount === 1 ? 'it' : 'them'}`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * THE DOODLE WALL — every drawing the child has kept, as a gallery.
 *
 * A grid of pictures reads as a fridge door; a picture buried at the foot
 * of a paragraph of text (the old layout) reads as an attachment. Kids —
 * and the grown-ups they show this to — look at a wall of drawings for its
 * own sake, which the shelf's cards were never built to invite.
 *
 * DELETING ONE removes just that image, wherever it sits in `cases`, and
 * leaves the case's own words untouched in the shelf above: tidying up a
 * pile of pictures is not the same act as deciding a reflection didn't
 * happen. There is no confirm dialog — nothing else in this app interrupts
 * a tap with one — but the button itself needs a second tap to commit
 * (armed for a couple of seconds, then it resets) because unlike every
 * other tap in this feature, this one cannot be undone by tapping again.
 */
function DoodleWall({
  cases,
  onDelete,
}: {
  cases: Case[];
  onDelete: (index: number) => void;
}) {
  const [arming, setArming] = useState<number | null>(null);
  /** The drawing whose room-picker is open. */
  const [hanging, setHanging] = useState<string | null>(null);
  /** roomId → case id, held in state so a wall changes under their finger. */
  const [hungHere, setHungHere] = useState(() => allHung());

  const drawn = cases
    .map((c, index) => ({ c, index }))
    .filter((x) => !!x.c.drawing);

  /** case id → the name of the room it's hanging in, for the tile's label. */
  const hungRooms: Record<string, string> = {};
  for (const r of VIRTUE_ROOMS) {
    const id = hungHere[r.id];
    if (id) hungRooms[id] = r.name;
  }

  if (!drawn.length) return null;

  return (
    <div className="mt-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: '#FFD98A' }}>
        Doodles
      </p>
      <p className="mt-1 text-[12px] font-semibold" style={{ color: CHROME.textSoft }}>
        Tap one to hang it up in a room.
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {drawn.map(({ c, index }) => {
          const armed = arming === index;
          return (
            <motion.div
              key={`${c.day}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="relative aspect-square overflow-hidden rounded-[14px]"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${CHROME.pillBorder}` }}
            >
              {/* THE PICTURE ITSELF IS THE CONTROL. Hanging one up is the
                  nicest thing you can do on this wall, so it gets the whole
                  tile; deleting keeps its small armed button in the corner. */}
              <button
                onClick={() => c.id && setHanging(hanging === c.id ? null : c.id)}
                aria-label={hungRooms[c.id ?? ''] ? 'Hanging in a room. Tap to move it.' : 'Hang this in a room'}
                className="absolute inset-0 block h-full w-full border-0 bg-transparent p-0"
              >
                <img src={c.drawing} alt="" className="h-full w-full object-cover" />
              </button>

              {/* Where it currently hangs, if anywhere. */}
              {c.id && hungRooms[c.id] && (
                <span
                  className="pointer-events-none absolute inset-x-1 bottom-1 truncate rounded-full px-2 py-0.5 text-center text-[9px] font-extrabold"
                  style={{ background: 'rgba(10,8,24,0.82)', color: '#FFD98A' }}
                >
                  {hungRooms[c.id]}
                </span>
              )}

              <button
                onClick={() => {
                  if (armed) { onDelete(index); setArming(null); return; }
                  setArming(index);
                  window.setTimeout(() => setArming((cur) => (cur === index ? null : cur)), 2400);
                }}
                aria-label={armed ? 'Tap again to delete this doodle' : 'Delete this doodle'}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full backdrop-blur-md transition-colors"
                style={{
                  background: armed ? '#E8735F' : 'rgba(10,8,24,0.6)',
                  border: `1px solid ${armed ? '#E8735F' : CHROME.pillBorder}`,
                }}
              >
                <X size={14} strokeWidth={3} color="#FFFFFF" />
              </button>

              <AnimatePresence>
                {armed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 flex items-end justify-center pb-1.5"
                    style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 55%)' }}
                  >
                    <span className="text-[10px] font-extrabold text-white">Tap again</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/*
        WHICH WALL. Seven rooms, named, plus a way to take it down again.
        Deliberately a plain list rather than a picture-picker: the child has
        just chosen the picture, and this is the other half of one decision.
      */}
      <AnimatePresence>
        {hanging && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-3 rounded-[18px] p-3" style={{ background: 'rgba(10,8,24,0.55)', border: `1px solid ${CHROME.pillBorder}` }}>
              <p className="text-[12.5px] font-bold" style={{ color: CHROME.text }}>
                Which room should it go in?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {VIRTUE_ROOMS.map((r) => {
                  const here = hungHere[r.id] === hanging;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        if (here) takeDown(r.id); else hangIn(r.id, hanging);
                        setHungHere(allHung());
                        setHanging(null);
                      }}
                      className="rounded-full px-3 py-1.5 text-[12px] font-extrabold"
                      style={{
                        background: here ? '#FFD98A' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${here ? '#FFD98A' : CHROME.pillBorder}`,
                        color: here ? '#2B1A05' : CHROME.text,
                      }}
                    >
                      {here ? `Take it out of ${r.name}` : r.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
