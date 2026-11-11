import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Bookmark, BookmarkCheck, Brain, HeartHandshake, CalendarRange, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flame,
  Home, Mic, RefreshCw, Sprout, Square, Trash2, type LucideIcon,
} from 'lucide-react';
import { sfx } from '../../lib/sfx';
import { getLocalDayString } from '../../lib/utils';
import type { Pattern, PracticeRoom, SavedPractice } from './types';
import { CHALLENGE_DAYS, challengeInfo, usePractiseStore } from './store';
import { buildBespokeRoom, draftPattern, STRENGTHS, TODAYS_PRACTICES } from './content';
import { Session } from './Session';
import { CoachView } from './CoachView';
import { Card, Fade, GhostButton, PatternIcon, PractiseShell, PrimaryButton, RoomIcon, StrengthIcon, TopBar } from './ui';
import { GYM_ADULT_THEME } from './theme';
import { useSpeechInput } from './useSpeechInput';
import './adult.css';

type View = 'home' | 'intake' | 'pattern' | 'created' | 'session' | 'today' | 'saved' | 'coach';

const CHARACTER = '/assets/gym/adult-character@160.webp';
const CHARACTER_2X = '/assets/gym/adult-character@320.webp';

/** Greeting by time of day — small warmth, no data required. */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Today's practice rotates by day so it feels different each time (VISION §8). */
function indexOfToday(): number {
  return Math.floor(Date.now() / 864e5) % TODAYS_PRACTICES.length;
}

/** The scene + hover-blur veil behind every Adult gym screen (see adult.css). */
const BACKDROP = (
  <div className="ag-backdrop" aria-hidden>
    <div className="ag-scene" />
    <div className="ag-veil" />
  </div>
);

/** One "explore the rest of the app" destination, shown under the doors when
 *  the gym is embedded as the starting point of a larger app (/mindgym). */
export interface ExploreLink {
  icon: LucideIcon;
  title: string;
  sub: string;
  onClick: () => void;
}

function BaseShell({ children, embedded }: { children: ReactNode; embedded?: boolean }) {
  return (
    <PractiseShell variant="adult" theme={GYM_ADULT_THEME} className={embedded ? 'ag-stage ag-embed' : 'ag-stage'} backdrop={BACKDROP}>
      {children}
    </PractiseShell>
  );
}

const StandaloneShell = ({ children }: { children: ReactNode }) => <BaseShell>{children}</BaseShell>;
const EmbeddedShell = ({ children }: { children: ReactNode }) => <BaseShell embedded>{children}</BaseShell>;

/** Top-right "Mind Gym hub" button — the way out, present on every inner view. */
function HubButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Go to the ${label}`}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-black/5"
      style={{ color: 'var(--p-muted)' }}
    >
      <Home size={18} aria-hidden />
    </button>
  );
}

/** Ten segments, one per day of the plan. */
function PlanProgress({ sp, className }: { sp: SavedPractice; className?: string }) {
  const info = challengeInfo(sp);
  if (!info) return null;
  const label = info.complete
    ? `10-day plan complete`
    : `10-day plan · Day ${info.day} of ${CHALLENGE_DAYS}`;
  const note = info.complete
    ? 'All ten days practised.'
    : info.doneToday
      ? 'Done for today — the next day opens tomorrow.'
      : info.done === 0
        ? 'Practise today to complete day 1.'
        : `Practise today to complete day ${info.day}.`;
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: 'var(--p-accent)' }}>
        <CalendarRange size={14} aria-hidden /> {label}
      </div>
      <div
        className="mt-2 flex gap-1"
        role="progressbar"
        aria-label={`${sp.room.title}: 10-day plan`}
        aria-valuemin={0}
        aria-valuemax={CHALLENGE_DAYS}
        aria-valuenow={info.done}
        aria-valuetext={`${info.done} of ${CHALLENGE_DAYS} days done`}
      >
        {Array.from({ length: CHALLENGE_DAYS }).map((_, i) => (
          <span
            key={i}
            className="h-2 flex-1 rounded-full"
            style={{
              background: i < info.done ? 'var(--p-accent)' : 'var(--p-line)',
              outline: !info.complete && !info.doneToday && i === info.done ? '2px solid var(--p-accent)' : undefined,
              outlineOffset: 1,
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 text-[12px]" style={{ color: 'var(--p-muted)' }}>{note}</div>
    </div>
  );
}

export function AdultGym({
  onExitGym,
  embedded = false,
  hubLabel = 'Mind Gym hub',
  explore,
}: {
  onExitGym: () => void;
  /** True when rendered inside another app's shell (the /mindgym "Start here"
   *  tab): draws as a contained panel and leaves page chrome to the host. */
  embedded?: boolean;
  /** What the way-out button leads to ("Mind Gym hub" / "Dashboard"). */
  hubLabel?: string;
  /** Where to go for more, shown under the doors. */
  explore?: ExploreLink[];
}) {
  const store = usePractiseStore();
  const [view, setView] = useState<View>('home');
  const [room, setRoom] = useState<PracticeRoom | null>(null);
  const [situation, setSituation] = useState('');
  const [pattern, setPattern] = useState<Pattern>(draftPattern(''));
  const [roomName, setRoomName] = useState('');
  const [todayIdx, setTodayIdx] = useState(indexOfToday);
  /** Room id awaiting "really remove?" confirmation in My Practices. */
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  /** Where the running session was started from, so leaving returns there. */
  const [sessionFrom, setSessionFrom] = useState<View>('home');

  const speech = useSpeechInput(situation, setSituation);
  // Embedded in the host app, its own nav is the way out — the back button
  // here only ever goes up one level, so there is a single, labelled way back.
  const hub = embedded ? undefined : <HubButton onClick={onExitGym} label={hubLabel} />;
  const Shell = embedded ? EmbeddedShell : StandaloneShell;

  const go = (v: View) => {
    if (speech.listening) speech.stop();
    setConfirmRemove(null);
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const startSession = (r: PracticeRoom, from: View = view) => {
    setRoom(r);
    setSessionFrom(from === 'session' ? 'home' : from);
    go('session');
  };

  const isSaved = (r: PracticeRoom) => store.saved.some((sp) => sp.room.id === r.id);

  /** Plans still running, the ones not yet practised today first. */
  const activePlans = useMemo(
    () =>
      store.saved
        .filter((sp) => { const i = challengeInfo(sp); return i && !i.complete; })
        .sort((a, b) => Number(challengeInfo(a)!.doneToday) - Number(challengeInfo(b)!.doneToday)),
    [store.saved],
  );

  /* ── Session host ─────────────────────────────────────────────────────── */
  if (view === 'session' && room) {
    return (
      <Session
        key={room.id}
        room={room}
        variant="adult"
        theme={GYM_ADULT_THEME}
        shellClassName={embedded ? 'ag-stage ag-embed' : 'ag-stage'}
        backdrop={BACKDROP}
        onHub={onExitGym}
        hubLabel={hubLabel}
        compactNav={embedded}
        onExit={() => go(sessionFrom === 'created' ? 'home' : sessionFrom)}
        onComplete={() => { /* progress written in-engine; ownership actions live in My Practices */ }}
      />
    );
  }

  /* ── Daily check-in with the coach ────────────────────────────────────── */
  if (view === 'coach') {
    return (
      <Shell>
        <TopBar backText="Back" title="Daily check-in" onBack={() => go('home')} backLabel="Back to Start here" right={hub} />
        <CoachView
          onStart={(r) => startSession(r, 'coach')}
          onIntake={() => { setSituation(''); go('intake'); }}
        />
      </Shell>
    );
  }

  /* ── Situation intake ─────────────────────────────────────────────────── */
  if (view === 'intake') {
    return (
      <Shell>
        <TopBar backText="Back" title="I have something on my mind" onBack={() => go('home')} backLabel="Back to the Adult Gym" step={1} total={3} right={hub} />
        <AnimatePresence mode="wait">
          <Fade keyId="intake">
            <h2 className="text-xl font-bold" style={{ color: 'var(--p-ink)' }}>Tell us what’s happening.</h2>
            <p className="mt-1 mb-5 text-sm" style={{ color: 'var(--p-muted)' }}>
              {speech.supported ? 'Type or speak, in your own words.' : 'Write it in your own words.'} What happened, what your mind said,
              how it felt, what you wanted to do — as much or as little as you like.
            </p>
            <label htmlFor="ag-situation" className="sr-only">What’s happening</label>
            <textarea
              id="ag-situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              readOnly={speech.listening}
              rows={6}
              autoFocus
              placeholder="e.g. Every time my manager criticises my work, I feel defensive and spend the whole evening thinking about it."
              className="w-full resize-none rounded-2xl p-4 text-sm outline-none"
              style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
            />
            {speech.supported && (
              <div className="mt-3">
                <button
                  type="button"
                  aria-pressed={speech.listening}
                  onClick={() => { sfx.tap(); speech.toggle(); }}
                  className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold ${speech.listening ? 'ag-listening' : ''}`}
                  style={
                    speech.listening
                      ? { background: '#FBE9E6', color: '#B03A2E' }
                      : { background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }
                  }
                >
                  {speech.listening ? <Square size={14} fill="currentColor" aria-hidden /> : <Mic size={16} aria-hidden />}
                  {speech.listening ? 'Listening… tap to stop' : 'Speak instead'}
                </button>
                <p className="mt-2 text-[12px]" style={{ color: 'var(--p-muted)' }} role="status" aria-live="polite">
                  {speech.error
                    ?? (speech.listening
                      ? 'Your words appear above as you speak.'
                      : 'Speech is turned into text by your browser — in some browsers that uses the browser maker’s speech service. Typing stays on this device.')}
                </p>
              </div>
            )}
            <div className="mt-8">
              <PrimaryButton
                disabled={situation.trim().length < 3}
                onClick={() => { speech.stop(); setPattern(draftPattern(situation)); setRoomName(''); sfx.chime(); go('pattern'); }}
              >
                Continue
              </PrimaryButton>
            </div>
          </Fade>
        </AnimatePresence>
      </Shell>
    );
  }

  /* ── Pattern mirror ───────────────────────────────────────────────────── */
  if (view === 'pattern') {
    const field = (label: string, key: keyof Pattern, placeholder: string) => (
      <div>
        <label
          htmlFor={`ag-pattern-${key}`}
          className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--p-muted)' }}
        >
          <PatternIcon part={key} size={14} className="flex-shrink-0" />
          {label}
        </label>
        <input
          id={`ag-pattern-${key}`}
          value={pattern[key]}
          onChange={(e) => setPattern((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="min-h-[44px] w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
          style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
        />
      </div>
    );
    const blanks = (['thought', 'feeling', 'urge'] as const).filter((k) => !pattern[k].trim()).length;
    return (
      <Shell>
        <TopBar backText="Back" title="Your situation, in four parts" onBack={() => go('intake')} backLabel="Back to what you wrote" step={2} total={3} right={hub} />
        <AnimatePresence mode="wait">
          <Fade keyId="pattern">
            <h2 className="text-xl font-bold" style={{ color: 'var(--p-ink)' }}>Let’s lay it out together.</h2>
            <p className="mt-1 mb-5 text-sm" style={{ color: 'var(--p-muted)' }}>
              This is only what you wrote, sorted into four parts — nothing has been analysed or added.
              {blanks > 0 ? ' Where your words didn’t cover a part, it’s left empty for you.' : ''} Change anything; there are no right answers.
            </p>
            <Card className="space-y-4">
              {field('What happened?', 'event', 'The moment itself, as plainly as you can')}
              {field('What did your mind say?', 'thought', 'Optional — the thought that showed up')}
              {field('What did you feel?', 'feeling', 'Optional — a word or two')}
              {field('What did you want to do?', 'urge', 'Optional — the pull or the reaction')}
            </Card>
            <div className="mt-5">
              <label htmlFor="ag-room-name" className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p-muted)' }}>
                Name this practice
              </label>
              <input
                id="ag-room-name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Defensiveness Practice Room"
                className="min-h-[44px] w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
              />
            </div>
            <div className="mt-8">
              <PrimaryButton
                disabled={!pattern.event.trim()}
                onClick={() => { setRoom(buildBespokeRoom(pattern, roomName)); sfx.success(); go('created'); }}
              >
                Create my practice room
              </PrimaryButton>
            </div>
          </Fade>
        </AnimatePresence>
      </Shell>
    );
  }

  /* ── Room created ─────────────────────────────────────────────────────── */
  if (view === 'created' && room) {
    const saved = isSaved(room);
    return (
      <Shell>
        <TopBar backText="Back" title="Practice room created" onBack={() => go('pattern')} backLabel="Back to the four parts" step={3} total={3} right={hub} />
        <AnimatePresence mode="wait">
          <Fade keyId="created">
            <div className="flex flex-col items-center text-center">
              <RoomIcon room={room} size={96} className="shadow-lg" />
              <h2 className="mt-5 text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>Your practice room is ready.</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--p-muted)' }}>Built around the situation you described.</p>
            </div>
            <Card className="mt-6">
              <div className="text-lg font-bold" style={{ color: 'var(--p-ink)' }}>{room.title}</div>
              <div className="mt-1 break-words text-sm" style={{ color: 'var(--p-muted)' }}>{room.whatPractising}</div>
              <StrengthTags room={room} />
            </Card>
            <div className="mt-6 space-y-3">
              <PrimaryButton onClick={() => { if (!saved) store.savePractice(room); startSession(room, 'saved'); }}>
                Enter practice room
              </PrimaryButton>
              <GhostButton onClick={() => { store.savePractice(room); sfx.tap(); go('saved'); }}>
                {saved ? 'Go to my practices' : 'Save for later'}
              </GhostButton>
            </div>
            <p className="mt-3 text-center text-[12px]" style={{ color: 'var(--p-muted)' }}>
              Entering also saves this room to My Practices, on this device only.
            </p>
          </Fade>
        </AnimatePresence>
      </Shell>
    );
  }

  /* ── Today's practice ─────────────────────────────────────────────────── */
  if (view === 'today') {
    const todays = TODAYS_PRACTICES[todayIdx % TODAYS_PRACTICES.length];
    const saved = isSaved(todays);
    return (
      <Shell>
        <TopBar backText="Back" title="Today’s Practice" onBack={() => go('home')} backLabel="Back to the Adult Gym" right={hub} />
        <AnimatePresence mode="wait">
          <Fade keyId={`today-${todays.id}`}>
            <p className="mb-4 text-sm" style={{ color: 'var(--p-muted)' }}>Nothing specific on your mind? Let’s train one thing today.</p>
            <div
              className="p-card relative overflow-hidden rounded-[28px] p-6"
              style={{ background: 'linear-gradient(150deg, #8B7BF0, #4A2E9E)', boxShadow: '0 14px 32px rgba(74,46,158,0.3)' }}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-40"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)' }}
              />
              <RoomIcon room={todays} size={56} className="ring-1 ring-white/30" />
              <div className="mt-3 text-xl font-bold text-white">{todays.title}</div>
              <div className="mt-1 text-sm text-white/80">{todays.whatPractising}</div>
              <div className="mt-3 text-[12px] font-medium text-white/70">
                {todays.steps.length} steps · about 5 minutes
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <PrimaryButton onClick={() => startSession(todays)}>Begin practice</PrimaryButton>
              <div className="flex gap-3">
                <GhostButton onClick={() => { sfx.tap(); setTodayIdx((i) => (i + 1) % TODAYS_PRACTICES.length); }}>
                  Show another
                </GhostButton>
                <GhostButton onClick={() => { sfx.tap(); if (saved) go('saved'); else store.savePractice(todays); }}>
                  <span className="inline-flex items-center justify-center gap-1.5">
                    {saved ? <BookmarkCheck size={16} aria-hidden /> : <Bookmark size={16} aria-hidden />}
                    {saved ? 'Saved' : 'Save'}
                  </span>
                </GhostButton>
              </div>
            </div>
          </Fade>
        </AnimatePresence>

        <SectionLabel>All practices · {TODAYS_PRACTICES.length}</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TODAYS_PRACTICES.map((p, i) => (
            <Card
              key={p.id}
              onClick={() => { sfx.pop(); setTodayIdx(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              ariaLabel={`${p.title}. ${p.whatPractising}`}
              className="flex items-center gap-3 !p-4"
              style={i === todayIdx ? { borderColor: 'var(--p-accent)' } : undefined}
            >
              <RoomIcon room={p} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold" style={{ color: 'var(--p-ink)' }}>{p.title}</div>
                <div className="text-[12px] leading-snug" style={{ color: 'var(--p-muted)' }}>{p.whatPractising}</div>
              </div>
            </Card>
          ))}
        </div>
      </Shell>
    );
  }

  /* ── My practices ─────────────────────────────────────────────────────── */
  if (view === 'saved') {
    return (
      <Shell>
        <TopBar backText="Back" title="My Practices" onBack={() => go('home')} backLabel="Back to the Adult Gym" right={hub} />
        {store.saved.length === 0 ? (
          <div className="mt-10 text-center">
            <img
              src={CHARACTER}
              srcSet={`${CHARACTER} 1x, ${CHARACTER_2X} 2x`}
              alt=""
              width={120}
              height={120}
              className="mx-auto h-[120px] w-[120px] rounded-full object-cover object-top"
              style={{ background: 'var(--p-accent-soft)' }}
            />
            <p className="mx-auto mt-4 max-w-xs text-sm" style={{ color: 'var(--p-muted)' }}>
              Nothing saved yet. Save a practice to keep training it — and to turn it into a 10-day plan.
            </p>
            <div className="mx-auto mt-6 max-w-xs space-y-3">
              <PrimaryButton onClick={() => go('today')}>Browse practices</PrimaryButton>
              <GhostButton onClick={() => { setSituation(''); go('intake'); }}>Create one from a situation</GhostButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {store.saved.map((sp) => {
              const info = challengeInfo(sp);
              const confirming = confirmRemove === sp.room.id;
              return (
                <Card key={sp.room.id}>
                  <div className="flex items-start gap-3">
                    <RoomIcon room={sp.room} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold" style={{ color: 'var(--p-ink)' }}>{sp.room.title}</div>
                      <div className="line-clamp-2 break-words text-[13px]" style={{ color: 'var(--p-muted)' }}>{sp.room.whatPractising}</div>
                    </div>
                    <button
                      onClick={() => { sfx.tap(); setConfirmRemove(confirming ? null : sp.room.id); }}
                      aria-label={`Remove ${sp.room.title}`}
                      aria-expanded={confirming}
                      title="Remove"
                      className="-mr-2 -mt-2 grid h-11 w-11 flex-shrink-0 place-items-center rounded-full hover:bg-black/5"
                      style={{ color: 'var(--p-muted)' }}
                    >
                      <Trash2 size={17} aria-hidden />
                    </button>
                  </div>

                  {info && <PlanProgress sp={sp} className="mt-4" />}

                  {confirming ? (
                    <div className="mt-4 rounded-2xl p-3" role="alertdialog" aria-label={`Remove ${sp.room.title}?`} style={{ background: '#FBEFEC' }}>
                      <p className="text-[13px] font-medium" style={{ color: '#8E2F25' }}>
                        Remove “{sp.room.title}” from your gym?{info ? ' Its 10-day plan progress goes with it.' : ''} This can’t be undone.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          autoFocus
                          onClick={() => { sfx.tap(); setConfirmRemove(null); }}
                          className="min-h-[44px] flex-1 rounded-xl px-3 text-[13px] font-semibold"
                          style={{ background: 'var(--p-surface)', color: 'var(--p-ink)', border: '1px solid var(--p-line)' }}
                        >
                          Keep it
                        </button>
                        <button
                          onClick={() => { store.removePractice(sp.room.id); sfx.tap(); setConfirmRemove(null); }}
                          className="min-h-[44px] flex-1 rounded-xl px-3 text-[13px] font-semibold text-white"
                          style={{ background: '#B03A2E' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => startSession(sp.room)}
                        className="min-h-[44px] flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white"
                        style={{ background: 'var(--p-accent-fill, var(--p-accent))' }}
                      >
                        {info && !info.complete && !info.doneToday ? `Practise day ${info.day}` : 'Practise'}
                      </button>
                      {!info ? (
                        <button
                          onClick={() => { store.makeChallenge(sp.room.id); sfx.success(); }}
                          className="min-h-[44px] flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold"
                          style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
                        >
                          Start 10-day plan
                        </button>
                      ) : info.complete ? (
                        <button
                          onClick={() => { store.makeChallenge(sp.room.id); sfx.success(); }}
                          className="min-h-[44px] flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold"
                          style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
                        >
                          Start again
                        </button>
                      ) : (
                        <button
                          onClick={() => { store.endChallenge(sp.room.id); sfx.tap(); }}
                          className="min-h-[44px] flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold"
                          style={{ background: 'transparent', color: 'var(--p-muted)', border: '1px solid var(--p-line)' }}
                        >
                          End plan
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
            <div className="pt-3">
              <GhostButton onClick={() => go('today')}>Browse more practices</GhostButton>
            </div>
          </div>
        )}
      </Shell>
    );
  }

  /* ── Home / front door ────────────────────────────────────────────────── */
  const resume = activePlans[0] ?? store.saved[0];
  const doors: { icon: typeof Brain; title: string; sub: string; tint: [string, string]; onClick: () => void }[] = [
    { icon: Brain, title: 'I have something on my mind', sub: 'Something is stuck — bring it in.', tint: ['#8B7BF0', '#4A2E9E'], onClick: () => { setSituation(''); go('intake'); } },
    { icon: Sprout, title: 'I want to grow', sub: `Today’s practice, or any of ${TODAYS_PRACTICES.length}.`, tint: ['#6FE0C6', '#1FA987'], onClick: () => { setTodayIdx(indexOfToday()); go('today'); } },
    {
      icon: RefreshCw,
      title: 'Continue my practice',
      sub: resume ? resume.room.title : 'Nothing saved yet — start with today’s.',
      tint: ['#5FC2E8', '#2E6FCF'],
      onClick: () => (resume ? startSession(resume.room, 'home') : go('today')),
    },
    { icon: Bookmark, title: 'My saved practices', sub: store.saved.length ? `${store.saved.length} in my gym.` : 'Choose from my gym.', tint: ['#E88FD8', '#9B4FC9'], onClick: () => go('saved') },
  ];

  return (
    <Shell>
      {embedded ? (
        <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--p-accent)' }}>
          Start here
        </div>
      ) : (
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={onExitGym}
          aria-label="Back to the Mind Gym hub"
          className="-ml-2 flex min-h-[44px] items-center gap-1 rounded-full pl-2 pr-4 text-[13px] font-semibold transition hover:bg-black/5"
          style={{ color: 'var(--p-muted)' }}
        >
          <ChevronLeft size={18} aria-hidden /> Mind Gym
        </button>
        <div className="flex-1 text-right text-sm font-semibold" style={{ color: 'var(--p-ink)' }}>Adult Gym</div>
      </div>
      )}
      <Fade keyId="home">
        <div className="flex items-center gap-4">
          <img
            src={CHARACTER}
            srcSet={`${CHARACTER} 1x, ${CHARACTER_2X} 2x`}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 flex-shrink-0 rounded-full object-cover object-top"
            style={{ background: 'var(--p-accent-soft)', border: '2px solid var(--p-surface)', boxShadow: '0 4px 14px rgba(38,31,24,0.12)' }}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--p-accent)' }}>{greeting()}</p>
            <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--p-ink)' }}>What would you like to work on today?</h1>
          </div>
        </div>

        <Card onClick={() => { sfx.pop(); go('coach'); }} ariaLabel="Daily check-in with your coach" className="mt-6 flex items-center gap-4 !p-4">
          <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
            <HeartHandshake size={22} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold leading-snug" style={{ color: 'var(--p-ink)' }}>Daily check-in</div>
            <div className="line-clamp-2 text-[13px] leading-snug" style={{ color: 'var(--p-muted)' }}>
              {store.checkins[0]?.date === getLocalDayString()
                ? 'Checked in today — see how your responses are changing.'
                : 'How are you today? Your coach helps you see progress and pick what’s next.'}
            </div>
          </div>
          <ChevronRight size={18} className="flex-shrink-0" style={{ color: 'var(--p-line)' }} aria-hidden />
        </Card>

        {activePlans.length > 0 && (
          <div className="mt-6">
            <SectionLabel flush>Your 10-day {activePlans.length > 1 ? 'plans' : 'plan'}</SectionLabel>
            <div className="space-y-3">
              {activePlans.map((sp) => {
                const info = challengeInfo(sp)!;
                return (
                  <Card key={sp.room.id}>
                    <div className="flex items-center gap-3">
                      <RoomIcon room={sp.room} size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold" style={{ color: 'var(--p-ink)' }}>{sp.room.title}</div>
                      </div>
                      {info.doneToday ? (
                        <span className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold" style={{ color: 'var(--p-accent)' }}>
                          <Check size={16} aria-hidden /> Today
                        </span>
                      ) : (
                        <button
                          onClick={() => { sfx.pop(); startSession(sp.room, 'home'); }}
                          className="min-h-[44px] flex-shrink-0 rounded-xl px-4 text-[13px] font-semibold text-white"
                          style={{ background: 'var(--p-accent-fill, var(--p-accent))' }}
                        >
                          Practise day {info.day}
                        </button>
                      )}
                    </div>
                    <PlanProgress sp={sp} className="mt-3" />
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {doors.map((d) => {
            const Icon = d.icon;
            return (
              <Card key={d.title} onClick={() => { sfx.pop(); d.onClick(); }} className="flex items-center gap-4 !p-4">
                <div
                  className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl shadow-sm"
                  style={{ background: `linear-gradient(150deg, ${d.tint[0]}, ${d.tint[1]})` }}
                >
                  <Icon size={21} className="text-white" strokeWidth={1.9} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold leading-snug" style={{ color: 'var(--p-ink)' }}>{d.title}</div>
                  <div className="line-clamp-2 text-[13px] leading-snug" style={{ color: 'var(--p-muted)' }}>{d.sub}</div>
                </div>
                <ChevronRight size={18} className="flex-shrink-0" style={{ color: 'var(--p-line)' }} aria-hidden />
              </Card>
            );
          })}
        </div>

        {explore && explore.length > 0 && (
          <div>
            <SectionLabel>Want more? Explore Mind Gym</SectionLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {explore.map((e) => {
                const Icon = e.icon;
                return (
                  <Card key={e.title} onClick={() => { sfx.pop(); e.onClick(); }} ariaLabel={`${e.title}. ${e.sub}`} className="!p-4">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full"
                      style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
                    >
                      <Icon size={18} aria-hidden />
                    </span>
                    <div className="mt-3 text-sm font-semibold" style={{ color: 'var(--p-ink)' }}>{e.title}</div>
                    <div className="text-[12px] leading-snug" style={{ color: 'var(--p-muted)' }}>{e.sub}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <JourneyStrip />
      </Fade>
    </Shell>
  );
}

function SectionLabel({ children, flush }: { children: ReactNode; flush?: boolean }) {
  return (
    <div className={`${flush ? '' : 'mt-8 '}mb-2 text-[11px] font-bold uppercase tracking-[0.18em]`} style={{ color: 'var(--p-muted)' }}>
      {children}
    </div>
  );
}

function StrengthTags({ room }: { room: PracticeRoom }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {room.strengths.map((s) => (
        <span
          key={s}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
          style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
        >
          <StrengthIcon id={s} size={13} />
          {STRENGTHS.find((x) => x.id === s)?.label}
        </span>
      ))}
    </div>
  );
}

/** Practice-done journey (never a score of the person — VISION §15). */
function JourneyStrip() {
  const { streak, practiceCount, minutes, strengths } = usePractiseStore();
  const stat = (icon: typeof Flame, value: string, label: string) => {
    const Icon = icon;
    return (
      <div className="flex-1 text-center">
        <Icon size={18} className="mx-auto" style={{ color: 'var(--p-accent)' }} aria-hidden />
        <div className="mt-1 text-lg font-bold" style={{ color: 'var(--p-ink)' }}>{value}</div>
        <div className="text-[11px]" style={{ color: 'var(--p-muted)' }}>{label}</div>
      </div>
    );
  };
  return (
    <div>
      <SectionLabel>Your practice journey</SectionLabel>
      <Card>
        <div className="flex items-center justify-around">
          {stat(Flame, String(streak), 'Day streak')}
          {stat(CheckCircle2, String(practiceCount), 'Practices')}
          {stat(Clock, `${Math.floor(minutes / 60)}h ${minutes % 60}m`, 'Practised')}
        </div>
        <div className="my-4 h-px" style={{ background: 'var(--p-line)' }} />
        <div className="mb-2 text-[11px] font-semibold" style={{ color: 'var(--p-muted)' }}>Areas you’ve been practising</div>
        <div className="space-y-2.5">
          {STRENGTHS.map((s) => {
            const level = Math.min(5, strengths[s.id] ?? 0);
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span
                  className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full"
                  style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
                >
                  <StrengthIcon id={s.id} size={14} />
                </span>
                <span className="flex-1 text-[13px]" style={{ color: 'var(--p-ink)' }}>{s.label}</span>
                <span className="flex gap-1" role="img" aria-label={`${level} of 5 practice marks`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-4 rounded-full"
                      style={{ background: i < level ? 'var(--p-accent)' : 'var(--p-line)' }}
                    />
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
