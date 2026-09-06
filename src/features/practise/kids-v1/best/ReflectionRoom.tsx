import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS } from '../../../kids/data';
import { getRoom } from '../rooms';
import { CHROME, Cta, FONT, GrownUpExit, Question } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { FloatingFeeling } from '../ui/FloatingFeeling';
import { Chirpy, RoomScene } from '../ui/scene';
import { starCount } from '../kit/sky';
import { agoLabel, deleteDrawingAt, loadCases, type Case } from '../kit/cases';

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
}: {
  onExit: () => void;
  onGrownUp: () => void;
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
              <textarea
                value={review[q.key] ?? ''}
                onChange={(e) => s.setMonthReview(monthKey, q.key, e.target.value)}
                rows={3}
                placeholder="Whatever comes to mind…"
                className="w-full resize-none rounded-[14px] bg-transparent px-3 py-2 text-[13.5px] font-semibold outline-none placeholder:opacity-45"
                style={{ color: CHROME.text, border: `1px solid ${CHROME.pillBorder}` }}
              />
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
        <CaseShelf accent={accent} cases={cases} />

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
 * THE SHELF — every case this child has worked, newest first, folded away
 * behind a header until tapped open.
 *
 * Two lines each: what their mind said, and what else they found could be
 * true. Nothing else fits on a card and nothing else is the point. The
 * distance is given in weeks rather than dates, because "3 weeks ago" means
 * something to a seven-year-old and "2026-08-15" means nothing at all.
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
function CaseShelf({ accent, cases }: { accent: string; cases: Case[] }) {
  const [open, setOpen] = useState(false);
  if (!cases.length) return null;

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
            <div className="flex flex-col gap-2.5 pt-2.5">
              {cases.slice(0, 8).map((c: Case, i: number) => (
                <motion.div
                  key={`${c.day}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04 }}
                  className="rounded-[20px] px-4 py-3 backdrop-blur-md"
                  style={{ background: 'rgba(12,10,26,0.52)', border: `1px solid ${CHROME.pillBorder}` }}
                >
                  <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em]" style={{ color: accent }}>
                    {agoLabel(c.day)}{c.feeling ? ` · ${c.feeling.toLowerCase()}` : ''}
                  </p>
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
                </motion.div>
              ))}
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
  const drawn = cases
    .map((c, index) => ({ c, index }))
    .filter((x) => !!x.c.drawing);

  if (!drawn.length) return null;

  return (
    <div className="mt-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: '#FFD98A' }}>
        Doodles
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
              <img src={c.drawing} alt="" className="h-full w-full object-cover" />

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
    </div>
  );
}
