import { useState } from 'react';
import { motion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS, levelFor } from '../../../kids/data';
import { getRoom } from '../rooms';
import { CHROME, Cta, FONT, GrownUpExit, Question } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { Chirpy, RoomScene } from '../ui/scene';

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

  const monthTotal = BEHAVIOURS.reduce((n, b) => n + totalFor(b.id), 0);
  const { level } = levelFor(s.points);
  const review = s.monthReviews[monthKey] ?? {};

  const QUESTIONS = [
    { key: 'learned', emoji: '💗', q: 'What did I learn about myself this month?' },
    { key: 'proud', emoji: '🌟', q: 'What made me feel proud?' },
    { key: 'hard', emoji: '💡', q: 'What was hard? What could I try next time?' },
    { key: 'next', emoji: '🎯', q: 'What am I aiming for next month?' },
  ];

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
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
            {level.name} · {s.points} points{s.streak > 0 ? ` · ${s.streak}-day streak` : ''}
          </p>
        </div>

        {/* ── The counts ─────────────────────────────────────────────── */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Stat big={String(monthTotal)} label="good choices this month" accent={accent} />
          <Stat big={String(s.badges.length)} label="badges earned" accent={accent} />
          <Stat big={String(s.streak)} label="day streak" accent={accent} />
        </div>

        {/* ── The star map ───────────────────────────────────────────── */}
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
