import { useMemo, useState } from 'react';
import { Loader2, Sparkles, TrendingUp, Volume2 } from 'lucide-react';
import { getLocalDayString } from '../../lib/utils';
import { usePractiseStore } from './store';
import { TODAYS_PRACTICES } from './content';
import { askDailyCounsel, MARKERS, nextMarker, trendOf, type MarkerId } from './coach';
import { Card, PrimaryButton, RoomIcon } from './ui';
import { useNarration } from './useNarration';
import type { CheckIn, PracticeRoom } from './types';

const MOODS: { id: CheckIn['mood']; label: string; reply: string; gentle: boolean }[] = [
  { id: 'calm', label: 'Calm', reply: 'Good. A calm day is the best day to train — practise now, while it’s easy, so it’s there when it’s hard.', gentle: false },
  { id: 'okay', label: 'Okay', reply: 'Okay is a fine place to start. One small practice is enough for today.', gentle: false },
  { id: 'stretched', label: 'Stretched', reply: 'That sounds like a lot. Let’s keep today light — something short that helps you pause.', gentle: true },
  { id: 'heavy', label: 'Heavy', reply: 'Thank you for saying so. You don’t have to fix anything today — a few slow breaths and a kind word to yourself is plenty.', gentle: true },
];

/** The practice that best builds a strength, rotating by day so it doesn't repeat daily. */
function practiceFor(strength: string, avoidId?: string): PracticeRoom {
  const pool = TODAYS_PRACTICES.filter((r) => r.strengths.includes(strength as never) && r.id !== avoidId);
  const list = pool.length ? pool : TODAYS_PRACTICES;
  return list[Math.floor(Date.now() / 864e5) % list.length];
}

function shortDate(d: string): string {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/**
 * Daily counselling: a check-in, where the person's practice is going (from
 * their own written responses), what to do next, and — only on request — a
 * short word from the AI coach. Everything except that last call stays on the
 * device.
 */
export function CoachView({
  onStart,
  onIntake,
}: {
  onStart: (room: PracticeRoom) => void;
  onIntake: () => void;
}) {
  const store = usePractiseStore();
  const narration = useNarration();
  const today = getLocalDayString();
  const todaysCheckin = store.checkins.find((c) => c.date === today);
  const mood = MOODS.find((m) => m.id === todaysCheckin?.mood);
  const [counsel, setCounsel] = useState<string | null>(null);
  const [counselState, setCounselState] = useState<'idle' | 'loading' | 'failed'>('idle');

  const recent = store.responses.slice(0, 6);
  const counts = store.responses.map((r) => r.markers.length);
  const trend = trendOf(counts, 3);

  const markerShare = useMemo(
    () =>
      MARKERS.map((m) => ({
        ...m,
        share: recent.length ? recent.filter((r) => r.markers.includes(m.id)).length / recent.length : 0,
      })),
    [recent],
  );

  // What next: gentle if the day is heavy, else the marker the latest reply lacked.
  const next = useMemo(() => {
    const lastRoom = store.reflections[0]?.roomId;
    if (mood?.gentle) {
      return { why: 'Keeping it light today.', room: practiceFor('pausing', lastRoom), intake: false };
    }
    if (!store.responses.length) {
      return { why: 'You haven’t written a response yet. Bring a real situation and practise how you’d meet it.', room: null, intake: true };
    }
    const miss = nextMarker(store.responses[0].markers as MarkerId[]);
    if (!miss) {
      return { why: 'Your last response had all five markers. Try a new situation to keep it growing.', room: null, intake: true };
    }
    const m = MARKERS.find((x) => x.id === miss)!;
    return { why: `Your last response was missing “${m.label.toLowerCase()}”. This practice builds it.`, room: practiceFor(m.strength, lastRoom), intake: false };
  }, [mood, store.responses, store.reflections]);

  const trendLine = (() => {
    if (!store.responses.length) return 'Write a few responses in your practices and your progress shows up here.';
    if (!trend) return `${store.responses.length} response${store.responses.length === 1 ? '' : 's'} written. After six, you’ll see how they’re changing.`;
    if (trend.delta > 0.4) return `Getting steadier: your last three responses average ${trend.latest.toFixed(1)} markers, up from ${trend.before.toFixed(1)}.`;
    if (trend.delta < -0.4) return `Your last three responses average ${trend.latest.toFixed(1)} markers, down from ${trend.before.toFixed(1)}. That happens when situations get harder — it isn’t a setback.`;
    return `Holding steady at about ${trend.latest.toFixed(1)} of ${MARKERS.length} markers.`;
  })();

  const summary = [
    `Check-in today: ${mood?.label ?? 'not given'}.`,
    `Practices done: ${store.practiceCount}. Day streak: ${store.streak}.`,
    trendLine,
    recent[0] ? `Latest planned response: "${recent[0].text.slice(0, 220)}"` : '',
  ].filter(Boolean).join('\n');

  const getCounsel = async () => {
    setCounselState('loading');
    const text = await askDailyCounsel(summary);
    if (text) { setCounsel(text); setCounselState('idle'); narration.say(text); }
    else setCounselState('failed');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--p-ink)' }}>Today with your coach</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--p-muted)' }}>A minute to check in, see how you’re doing, and pick what’s next.</p>
      </div>

      <Card>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>How are you today?</div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MOODS.map((m) => {
            const on = todaysCheckin?.mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { store.setCheckin({ date: today, mood: m.id }); narration.say(m.reply); }}
                aria-pressed={on}
                className="min-h-[44px] rounded-2xl px-3 text-sm font-semibold transition"
                style={{
                  background: on ? 'var(--p-accent-fill, var(--p-accent))' : 'transparent',
                  color: on ? '#fff' : 'var(--p-ink)',
                  border: `1px solid ${on ? 'transparent' : 'var(--p-line)'}`,
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        {mood && (
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--p-ink)' }} aria-live="polite">{mood.reply}</p>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>
          <TrendingUp size={14} aria-hidden /> How your responses are changing
        </div>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--p-ink)' }}>{trendLine}</p>
        {recent.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {markerShare.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="w-36 flex-shrink-0 text-[12px]" style={{ color: 'var(--p-ink)' }}>{m.label}</span>
                <span
                  className="h-2 flex-1 overflow-hidden rounded-full"
                  style={{ background: 'var(--p-line)' }}
                  role="img"
                  aria-label={`${m.label}: in ${Math.round(m.share * 100)}% of your last ${recent.length} responses`}
                >
                  <span className="block h-full rounded-full" style={{ width: `${Math.round(m.share * 100)}%`, background: 'var(--p-accent-fill, var(--p-accent))' }} />
                </span>
              </div>
            ))}
            <p className="pt-1 text-[11px]" style={{ color: 'var(--p-muted)' }}>
              Share of your last {recent.length} responses that contain each marker. These describe the wording, not you.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>What next</div>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--p-ink)' }}>{next.why}</p>
        {next.room && (
          <button
            onClick={() => onStart(next.room!)}
            className="mt-3 flex min-h-[44px] w-full items-center gap-3 rounded-2xl p-3 text-left"
            style={{ background: 'var(--p-accent-soft)' }}
          >
            <RoomIcon room={next.room} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold" style={{ color: 'var(--p-ink)' }}>{next.room.title}</span>
              <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>{next.room.steps.length} steps · about 5 minutes</span>
            </span>
          </button>
        )}
        {next.intake && (
          <div className="mt-3">
            <PrimaryButton onClick={onIntake}>Bring a situation</PrimaryButton>
          </div>
        )}
      </Card>

      <Card>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>A word from the AI coach</div>
        {counsel ? (
          <>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed" style={{ color: 'var(--p-ink)' }} aria-live="polite">{counsel}</p>
            <button
              onClick={() => narration.say(counsel)}
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold"
              style={{ color: 'var(--p-accent)', border: '1px solid var(--p-line)' }}
            >
              <Volume2 size={14} aria-hidden /> Listen
            </button>
          </>
        ) : (
          <>
            <button
              onClick={getCounsel}
              disabled={counselState === 'loading'}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold disabled:opacity-60"
              style={{ color: 'var(--p-accent)', border: '1px solid var(--p-line)' }}
            >
              {counselState === 'loading' ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
              {counselState === 'loading' ? 'Thinking…' : 'Ask for today’s counsel'}
            </button>
            <p className="mt-1.5 text-center text-[12px]" style={{ color: counselState === 'failed' ? 'var(--p-ink)' : 'var(--p-muted)' }}>
              {counselState === 'failed'
                ? 'The coach isn’t reachable right now. Your check-in and progress above still work.'
                : 'Sends a short summary of your check-in and latest response to our AI. Nothing is sent unless you tap.'}
            </p>
          </>
        )}
      </Card>

      {recent.length > 0 && (
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>Your recent responses</div>
          <div className="space-y-3">
            {recent.slice(0, 5).map((r) => (
              <Card key={r.id} className="!p-4">
                <div className="flex items-center justify-between text-[12px]" style={{ color: 'var(--p-muted)' }}>
                  <span className="truncate">{r.roomTitle} · {shortDate(r.date)}</span>
                  <span className="flex-shrink-0 font-semibold" style={{ color: 'var(--p-accent)' }}>{r.markers.length} of {MARKERS.length}</span>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: 'var(--p-ink)' }}>“{r.text}”</p>
                {r.usedSuggestion && <p className="mt-1 text-[12px]" style={{ color: 'var(--p-muted)' }}>Reworded with the coach’s suggestion.</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
