import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BEHAVIOURS, todayKey } from './data';
import { EMOTION_LIST } from './emotions';
import { CompanionOrb } from './Companion';
import { useKidStore } from './store';
import { sfx } from '../../lib/sfx';

/**
 * The Monthly Chart — the recurring "Let's Be Our Best Every Day!" theme, one
 * board per month, kept as history. Original characters only (no Inside Out).
 * A tap-to-fill grid of the seven behaviours across the month, a per-behaviour
 * total, a "Look Back & Learn" review saved per month, and an affirmation strip.
 */

const REVIEW = [
  { key: 'learned', icon: '❤️', q: 'What did I learn about myself this month?' },
  { key: 'proud', icon: '☁️', q: 'What made me feel proud?' },
  { key: 'difficult', icon: '🌟', q: 'What was difficult? What can I do next time?' },
  { key: 'goals', icon: '💡', q: 'What are my goals for next month?' },
] as const;

const AFFIRMATIONS = [
  '❤️ Be kind to yourself', '🧠 Listen to your heart', '✅ Do your best',
  '🙂 Learn from mistakes', '✨ Be grateful always', '👫 Everyone is my teacher',
  '🌸 I create my own path',
];

const BUBBLES = [
  'Great choices make a great me!', 'It\'s okay to feel everything.',
  'I can stay calm and choose wisely.', 'Every day is a new chance.',
  'Setbacks help me learn.', 'I am unique, I am enough, I am me!',
];

function currentMonth(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}
function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(m: string): string {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
function daysIn(m: string): number {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo, 0).getDate();
}

export function KidMonthChart() {
  const s = useKidStore();
  const [month, setMonth] = useState(currentMonth());
  const today = todayKey();
  const nDays = daysIn(month);
  const days = Array.from({ length: nDays }, (_, i) => i + 1);
  const review = s.monthReviews[month] ?? {};

  const cellKey = (day: number) => `${month}-${String(day).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Header with original characters + speech bubbles */}
      <div className="rounded-3xl p-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#fff,#FDEFF9)' }}>
        <div className="flex justify-center gap-1 mb-2 flex-wrap">
          {EMOTION_LIST.map((e, i) => (
            <motion.div key={e.id} animate={{ y: [0, -4, 0] }} transition={{ duration: 2 + i * 0.2, repeat: Infinity, delay: i * 0.1 }}>
              <CompanionOrb c={e} size={28} bounce={false} />
            </motion.div>
          ))}
        </div>
        <h2 className="text-[22px] font-extrabold" style={{ color: 'var(--kid-accent)' }}>Let's Be Our Best Every Day!</h2>
        <p className="text-[12px] font-bold text-[var(--kid-ink-soft)]">Small choices · Big growth · Happy heart</p>
        <p className="text-[11px] italic mt-1" style={{ color: 'var(--kid-accent2)' }}>“{BUBBLES[[...month].reduce((a, c) => a + c.charCodeAt(0), 0) % BUBBLES.length]}”</p>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="p-1.5 rounded-xl bg-white shadow-sm"><ChevronLeft size={16} /></button>
        <span className="text-[15px] font-extrabold text-[var(--kid-ink)] w-40 text-center">{monthLabel(month)}</span>
        <button onClick={() => setMonth((m) => shiftMonth(m, 1))} disabled={month >= currentMonth()}
          className="p-1.5 rounded-xl bg-white shadow-sm disabled:opacity-30"><ChevronRight size={16} /></button>
      </div>

      {/* The grid — horizontal scroll for the days */}
      <div className="rounded-3xl bg-white shadow-sm p-2 overflow-x-auto">
        <div style={{ minWidth: 80 + nDays * 26 }}>
          {/* day header */}
          <div className="flex items-center">
            <div className="w-[128px] flex-shrink-0" />
            {days.map((d) => {
              const isToday = cellKey(d) === today;
              return (
                <div key={d} className="w-[26px] flex-shrink-0 text-center text-[9px] font-bold rounded-t"
                  style={{ color: isToday ? '#fff' : 'var(--kid-ink-soft)', background: isToday ? 'var(--kid-accent)' : 'transparent' }}>
                  {d}
                </div>
              );
            })}
            <div className="w-[36px] flex-shrink-0 text-center text-[9px] font-extrabold" style={{ color: 'var(--kid-accent)' }}>TOT</div>
          </div>

          {/* behaviour rows */}
          {BEHAVIOURS.map((b) => {
            const total = days.filter((d) => s.completions[cellKey(d)]?.[b.id]).length;
            return (
              <div key={b.id} className="flex items-center border-t" style={{ borderColor: 'var(--kid-line)' }}>
                <div className="w-[128px] flex-shrink-0 flex items-center gap-1.5 py-1.5 pr-1">
                  <span className="text-[16px]">{b.icon}</span>
                  <span className="text-[10px] font-bold text-[var(--kid-ink)] leading-tight">{b.title}</span>
                </div>
                {days.map((d) => {
                  const k = cellKey(d);
                  const on = !!s.completions[k]?.[b.id];
                  const future = k > today;
                  return (
                    <button
                      key={d}
                      disabled={future}
                      onClick={() => { s.setBehaviourOn(k, b.id, !on); sfx.tap(); }}
                      className="w-[26px] h-[26px] flex-shrink-0 flex items-center justify-center disabled:opacity-30"
                    >
                      <span className="w-[18px] h-[18px] rounded-md flex items-center justify-center text-[11px] transition-all"
                        style={{ background: on ? b.color : 'var(--kid-line)', color: '#fff' }}>
                        {on ? '★' : ''}
                      </span>
                    </button>
                  );
                })}
                <div className="w-[36px] flex-shrink-0 text-center text-[12px] font-extrabold" style={{ color: b.color }}>{total}</div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] text-[var(--kid-ink-soft)] text-center -mt-2">Tap any day to mark a good choice ⭐ — past days too!</p>

      {/* Look Back & Learn */}
      <div>
        <h3 className="text-[16px] font-extrabold text-center text-[var(--kid-ink)] mb-2">✨ Look Back & Learn ✨</h3>
        <div className="grid grid-cols-1 gap-2">
          {REVIEW.map((r) => (
            <ReviewField key={r.key} icon={r.icon} q={r.q} value={review[r.key] ?? ''} onCommit={(v) => s.setMonthReview(month, r.key, v)} />
          ))}
        </div>
      </div>

      {/* Affirmation strip */}
      <div className="rounded-3xl p-3" style={{ background: 'linear-gradient(90deg,#FFF6D6,#FDEFF9,#E8F8EE)' }}>
        <p className="text-[12px] font-extrabold text-center text-[var(--kid-ink)] mb-2">I am the master of my choices 💜</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {AFFIRMATIONS.map((a) => (
            <span key={a} className="rounded-full px-2.5 py-1 bg-white text-[10px] font-bold shadow-sm text-[var(--kid-ink)]">{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewField({ icon, q, value, onCommit }: { icon: string; q: string; value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [last, setLast] = useState(value);
  if (value !== last) { setLast(value); setDraft(value); }
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-[12px] font-bold text-[var(--kid-ink)] mb-1">{icon} {q}</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (draft !== value) onCommit(draft.trim()); }}
        rows={2}
        placeholder="Write your thoughts…"
        className="w-full rounded-xl px-3 py-2 text-[13px] outline-none resize-y"
        style={{ background: 'var(--kid-line)', color: 'var(--kid-ink)' }}
      />
    </div>
  );
}
