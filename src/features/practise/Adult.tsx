import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Brain, Sprout, RefreshCw, Bookmark, Mic, Flame, CheckCircle2, Clock, Trash2, CalendarRange } from 'lucide-react';
import { sfx } from '../../lib/sfx';
import type { Pattern, PracticeRoom } from './types';
import { usePractiseStore } from './store';
import { buildBespokeRoom, draftPattern, STRENGTHS, TODAYS_PRACTICES } from './content';
import { Session } from './Session';
import { Card, Fade, GhostButton, PractiseShell, PrimaryButton, TopBar } from './ui';

type View = 'home' | 'intake' | 'pattern' | 'created' | 'session' | 'today' | 'saved';

/** Greeting by time of day — small warmth, no data required. */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Today's practice rotates by day so it feels different each time (VISION §8). */
function practiceOfToday(): PracticeRoom {
  const day = Math.floor(Date.now() / 864e5);
  return TODAYS_PRACTICES[day % TODAYS_PRACTICES.length];
}

export function AdultGym({ onExitGym }: { onExitGym: () => void }) {
  const store = usePractiseStore();
  const [view, setView] = useState<View>('home');
  const [room, setRoom] = useState<PracticeRoom | null>(null);
  const [situation, setSituation] = useState('');
  const [pattern, setPattern] = useState<Pattern>(draftPattern(''));
  const [roomName, setRoomName] = useState('');

  const todays = useMemo(practiceOfToday, []);

  const startSession = (r: PracticeRoom) => {
    setRoom(r);
    setView('session');
  };

  /* ── Session host ─────────────────────────────────────────────────────── */
  if (view === 'session' && room) {
    return (
      <Session
        room={room}
        variant="adult"
        onExit={() => setView('home')}
        onComplete={() => { /* progress written in-engine; ownership actions live in Saved */ }}
      />
    );
  }

  /* ── Situation intake ─────────────────────────────────────────────────── */
  if (view === 'intake') {
    return (
      <PractiseShell variant="adult">
        <TopBar title="I have something on my mind" onBack={() => setView('home')} step={1} total={3} />
        <AnimatePresence mode="wait">
          <Fade keyId="intake">
            <h2 className="text-xl font-bold" style={{ color: 'var(--p-ink)' }}>Tell us what’s happening.</h2>
            <p className="mt-1 mb-5 text-sm" style={{ color: 'var(--p-muted)' }}>
              You can type or speak naturally. There’s no right or wrong way to say it.
            </p>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={6}
              autoFocus
              placeholder="e.g. Every time my manager criticises my work, I feel defensive and spend the whole evening thinking about it."
              className="w-full resize-none rounded-2xl p-4 text-sm outline-none"
              style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
            />
            <button
              className="mt-3 flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium"
              style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
              onClick={() => sfx.tap()}
            >
              <Mic size={15} /> Or hold to speak
            </button>
            <div className="mt-8">
              <PrimaryButton
                disabled={situation.trim().length < 3}
                onClick={() => { setPattern(draftPattern(situation)); setRoomName(''); sfx.chime(); setView('pattern'); }}
              >
                Continue
              </PrimaryButton>
            </div>
          </Fade>
        </AnimatePresence>
      </PractiseShell>
    );
  }

  /* ── Pattern mirror ───────────────────────────────────────────────────── */
  if (view === 'pattern') {
    const field = (label: string, glyph: string, key: keyof Pattern) => (
      <div>
        <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p-muted)' }}>
          <span>{glyph}</span>{label}
        </div>
        <input
          value={pattern[key]}
          onChange={(e) => setPattern((p) => ({ ...p, [key]: e.target.value }))}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
          style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
        />
      </div>
    );
    return (
      <PractiseShell variant="adult">
        <TopBar title="Understanding your situation" onBack={() => setView('intake')} step={2} total={3} />
        <AnimatePresence mode="wait">
          <Fade keyId="pattern">
            <h2 className="text-xl font-bold" style={{ color: 'var(--p-ink)' }}>Let’s unpack this together.</h2>
            <p className="mt-1 mb-5 text-sm" style={{ color: 'var(--p-muted)' }}>
              Here’s what we noticed. Adjust anything — there are no right answers.
            </p>
            <Card className="space-y-4">
              {field('What happened?', '⚡', 'event')}
              {field('What did your mind say?', '💭', 'thought')}
              {field('What did you feel?', '❤️', 'feeling')}
              {field('What did you want to do?', '🌀', 'urge')}
            </Card>
            <div className="mt-5">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p-muted)' }}>
                Name this practice
              </div>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Defensiveness Practice Room"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
              />
            </div>
            <div className="mt-8">
              <PrimaryButton onClick={() => { setRoom(buildBespokeRoom(pattern, roomName)); sfx.success(); setView('created'); }}>
                Create my practice room
              </PrimaryButton>
            </div>
          </Fade>
        </AnimatePresence>
      </PractiseShell>
    );
  }

  /* ── Room created ─────────────────────────────────────────────────────── */
  if (view === 'created' && room) {
    return (
      <PractiseShell variant="adult">
        <TopBar title="Practice Room Created" onBack={() => setView('pattern')} />
        <AnimatePresence mode="wait">
          <Fade keyId="created">
            <div className="flex flex-col items-center text-center">
              <div
                className="grid h-24 w-24 place-items-center rounded-3xl text-5xl shadow-lg"
                style={{ background: 'linear-gradient(150deg, #8B7BF0, #4A2E9E)', boxShadow: '0 10px 28px rgba(74,46,158,0.35)' }}
              >
                {room.glyph}
              </div>
              <h2 className="mt-5 text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>We’ve created a practice just for you.</h2>
            </div>
            <Card className="mt-6">
              <div className="text-lg font-bold" style={{ color: 'var(--p-ink)' }}>{room.title}</div>
              <div className="mt-1 text-sm" style={{ color: 'var(--p-muted)' }}>{room.whatPractising}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {room.strengths.map((s) => {
                  const meta = STRENGTHS.find((x) => x.id === s);
                  return (
                    <span key={s} className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
                      {meta?.glyph} {meta?.label}
                    </span>
                  );
                })}
              </div>
            </Card>
            <div className="mt-6 space-y-3">
              <PrimaryButton onClick={() => startSession(room)}>Enter practice room</PrimaryButton>
              <GhostButton onClick={() => { store.savePractice(room); sfx.tap(); setView('home'); }}>Save to my gym</GhostButton>
            </div>
          </Fade>
        </AnimatePresence>
      </PractiseShell>
    );
  }

  /* ── Today's practice ─────────────────────────────────────────────────── */
  if (view === 'today') {
    return (
      <PractiseShell variant="adult">
        <TopBar title="Today’s Practice" onBack={() => setView('home')} />
        <AnimatePresence mode="wait">
          <Fade keyId="today">
            <p className="mb-4 text-sm" style={{ color: 'var(--p-muted)' }}>Nothing specific on your mind? Let’s train one thing today.</p>
            <div
              className="relative overflow-hidden rounded-[28px] p-6"
              style={{ background: 'linear-gradient(150deg, #8B7BF0, #4A2E9E)', boxShadow: '0 14px 32px rgba(74,46,158,0.3)' }}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-40"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)' }}
              />
              <div className="text-4xl">{todays.glyph}</div>
              <div className="mt-3 text-xl font-bold text-white">{todays.title}</div>
              <div className="mt-1 text-sm text-white/75">{todays.whatPractising}</div>
            </div>
            <div className="mt-6 space-y-3">
              <PrimaryButton onClick={() => startSession(todays)}>Begin practice</PrimaryButton>
              <GhostButton onClick={() => { sfx.tap(); startSession(TODAYS_PRACTICES[(TODAYS_PRACTICES.indexOf(todays) + 1) % TODAYS_PRACTICES.length]); }}>
                Swap for a different one
              </GhostButton>
            </div>
          </Fade>
        </AnimatePresence>
      </PractiseShell>
    );
  }

  /* ── My practices ─────────────────────────────────────────────────────── */
  if (view === 'saved') {
    return (
      <PractiseShell variant="adult">
        <TopBar title="My Practices" onBack={() => setView('home')} />
        {store.saved.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="text-5xl">🏋️</div>
            <p className="mt-4 text-sm" style={{ color: 'var(--p-muted)' }}>
              Nothing saved yet. When you create a practice room, save it here to keep training it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {store.saved.map((sp) => (
              <Card key={sp.room.id}>
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl text-2xl"
                    style={{ background: 'linear-gradient(150deg, #8B7BF0, #4A2E9E)' }}
                  >
                    {sp.room.glyph}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold" style={{ color: 'var(--p-ink)' }}>{sp.room.title}</div>
                    <div className="truncate text-[13px]" style={{ color: 'var(--p-muted)' }}>{sp.room.whatPractising}</div>
                    {sp.challengeDay && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
                        <CalendarRange size={12} /> 10-Day Challenge · Day {sp.challengeDay}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { store.removePractice(sp.room.id); sfx.tap(); }} aria-label="Remove" className="rounded-full p-1.5 hover:bg-black/5" style={{ color: 'var(--p-muted)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => startSession(sp.room)} className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white" style={{ background: 'var(--p-accent)' }}>
                    Practise
                  </button>
                  {!sp.challengeDay && (
                    <button onClick={() => { store.makeChallenge(sp.room.id); sfx.success(); }} className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
                      Make 10-day
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PractiseShell>
    );
  }

  /* ── Home / front door ────────────────────────────────────────────────── */
  const doors: { icon: typeof Brain; title: string; sub: string; tint: [string, string]; onClick: () => void }[] = [
    { icon: Brain, title: 'I have something on my mind', sub: 'Something is stuck — bring it in.', tint: ['#8B7BF0', '#4A2E9E'], onClick: () => { setSituation(''); setView('intake'); } },
    { icon: Sprout, title: 'I want to grow', sub: 'Give me today’s practice.', tint: ['#6FE0C6', '#1FA987'], onClick: () => setView('today') },
    { icon: RefreshCw, title: 'Continue my practice', sub: 'Pick up where I left off.', tint: ['#5FC2E8', '#2E6FCF'], onClick: () => (store.saved[0] ? startSession(store.saved[0].room) : setView('today')) },
    { icon: Bookmark, title: 'My saved practices', sub: 'Choose from my gym.', tint: ['#E88FD8', '#9B4FC9'], onClick: () => setView('saved') },
  ];

  return (
    <PractiseShell variant="adult">
      <TopBar title="Adult Gym" onBack={onExitGym} />
      <Fade keyId="home">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--p-accent)' }}>{greeting()}</p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>What would you like to work on today?</h1>

        <div className="mt-5 space-y-3">
          {doors.map((d) => {
            const Icon = d.icon;
            return (
              <Card key={d.title} onClick={() => { sfx.pop(); d.onClick(); }} className="flex items-center gap-4 !p-4">
                <div
                  className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl shadow-sm"
                  style={{ background: `linear-gradient(150deg, ${d.tint[0]}, ${d.tint[1]})` }}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold" style={{ color: 'var(--p-ink)' }}>{d.title}</div>
                  <div className="text-[13px]" style={{ color: 'var(--p-muted)' }}>{d.sub}</div>
                </div>
              </Card>
            );
          })}
        </div>

        <JourneyStrip />
      </Fade>
    </PractiseShell>
  );
}

/** Practice-done journey (never a score of the person — VISION §15). */
function JourneyStrip() {
  const { streak, practiceCount, minutes, strengths } = usePractiseStore();
  const stat = (icon: typeof Flame, value: string, label: string) => {
    const Icon = icon;
    return (
      <div className="flex-1 text-center">
        <Icon size={18} className="mx-auto" style={{ color: 'var(--p-accent)' }} />
        <div className="mt-1 text-lg font-bold" style={{ color: 'var(--p-ink)' }}>{value}</div>
        <div className="text-[11px]" style={{ color: 'var(--p-muted)' }}>{label}</div>
      </div>
    );
  };
  return (
    <div className="mt-8">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>
        Your practice journey
      </div>
      <Card>
        <div className="flex items-center justify-around">
          {stat(Flame, String(streak), 'Day streak')}
          {stat(CheckCircle2, String(practiceCount), 'Practices')}
          {stat(Clock, `${Math.floor(minutes / 60)}h ${minutes % 60}m`, 'Practised')}
        </div>
        <div className="my-4 h-px" style={{ background: 'var(--p-line)' }} />
        <div className="mb-2 text-[11px] font-semibold" style={{ color: 'var(--p-muted)' }}>Areas you’ve been practising</div>
        <div className="space-y-1.5">
          {STRENGTHS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="w-6 text-center">{s.glyph}</span>
              <span className="flex-1 text-[13px]" style={{ color: 'var(--p-ink)' }}>{s.label}</span>
              <span className="tracking-tight">
                {'★'.repeat(strengths[s.id])}
                <span style={{ color: 'var(--p-line)' }}>{'★'.repeat(5 - strengths[s.id])}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
