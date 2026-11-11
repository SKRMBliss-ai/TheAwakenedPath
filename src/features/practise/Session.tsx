import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Home, Leaf, Loader2, MessageCircle, Mic, Sparkles, Square, Volume2, VolumeX } from 'lucide-react';
import { getLocalDayString } from '../../lib/utils';
import { sfx } from '../../lib/sfx';
import type { Pattern, PracticeRoom, Reflection, SessionStep } from './types';
import { CHALLENGE_DAYS, challengeInfo, usePractiseStore } from './store';
import { BreathOrb } from './BreathOrb';
import { askCoach, markersOf, MARKERS, type CoachReply } from './coach';
import { useNarration } from './useNarration';
import { useSpeechInput } from './useSpeechInput';
import { Card, Chip, Fade, GhostButton, PatternIcon, PractiseShell, PrimaryButton, StepDots, TopBar, type Variant } from './ui';

/**
 * The shared Practice Session engine. Both gyms run their rooms through this —
 * the room is CONFIGURATION, the engine is the code (PRODUCT_PRINCIPLES: protect
 * the reusable engine; never a bespoke screen per emotion).
 *
 * It walks a room's steps, renders the right primitive for each `kind`, collects
 * what the user notices, and closes with Reflection → Completion, writing
 * practice-done progress to the on-device store.
 */
export function Session({
  room,
  variant,
  onExit,
  onComplete,
  theme,
  onHub,
  hubLabel = 'Mind Gym hub',
  shellClassName,
  backdrop,
  compactNav = false,
}: {
  room: PracticeRoom;
  variant: Variant;
  onExit: () => void;
  onComplete: (r: Reflection) => void;
  /** Passed straight through to PractiseShell — see GYM_ADULT_THEME in ui.tsx. */
  theme?: Record<string, string>;
  /** If given, a "Mind Gym hub" button is shown on every step and at the end. */
  onHub?: () => void;
  /** Name of where `onHub` leads. */
  hubLabel?: string;
  /** Passed straight through to PractiseShell. */
  shellClassName?: string;
  backdrop?: ReactNode;
  /** Hide the top-right home icon (the host app already has its own nav). */
  compactNav?: boolean;
}) {
  const store = usePractiseStore();
  const narration = useNarration();
  const [idx, setIdx] = useState(0);
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [discovery, setDiscovery] = useState('');
  const [intention, setIntention] = useState('');
  const [done, setDone] = useState(false);
  const [response, setResponse] = useState('');
  const [coach, setCoach] = useState<CoachReply | null>(null);
  const [usedSuggestion, setUsedSuggestion] = useState(false);

  // Adult rooms get a "My response" step just before the final reflection.
  const steps = useMemo<SessionStep[]>(() => {
    if (variant !== 'adult' || room.steps.some((s) => s.kind === 'respond')) return room.steps;
    const at = room.steps.findIndex((s) => s.kind === 'reflect');
    const respond: SessionStep = {
      kind: 'respond',
      title: 'My response',
      prompt: 'How would you like to respond next time? Write it the way you’d say it or do it.',
    };
    if (at < 0) return [...room.steps, respond];
    return [...room.steps.slice(0, at), respond, ...room.steps.slice(at)];
  }, [room.steps, variant]);
  const step = steps[idx];

  const narrationText = useMemo(() => {
    const bits = [step.title + '.', step.prompt];
    if (step.trigger) bits.push(step.trigger);
    if (step.floatingThought) bits.push(step.floatingThought);
    return bits.join(' ');
  }, [step]);

  // Read each step aloud when it appears (if voice is on). The breath step has
  // its own pacing, so only its one-line instruction is read.
  useEffect(() => {
    if (done) return;
    narration.say(narrationText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done]);
  const isLast = idx === steps.length - 1;
  const kidly = variant === 'kids';

  const toggle = (opt: string) => {
    setSelections((s) => {
      const cur = s[idx] ?? [];
      const next = cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt];
      return { ...s, [idx]: next };
    });
    sfx.tap();
  };

  const next = () => {
    narration.stop();
    if (isLast) return finish();
    sfx.chime();
    setIdx((i) => i + 1);
  };

  const finish = () => {
    const reflection: Reflection = {
      roomId: room.id,
      roomTitle: room.title,
      gym: room.gym,
      discovery: discovery.trim(),
      intention: intention.trim() || undefined,
      date: getLocalDayString(),
    };
    store.completeSession(room, kidly ? 3 : 6);
    store.addReflection(reflection);
    if (response.trim()) {
      store.addResponse({
        id: `${room.id}-${Date.now()}`,
        roomId: room.id,
        roomTitle: room.title,
        date: getLocalDayString(),
        text: response.trim(),
        markers: markersOf(response),
        suggestion: coach?.better,
        usedSuggestion: usedSuggestion || undefined,
      });
    }
    if (kidly) sfx.cheer(); else sfx.celebrate();
    setDone(true);
    onComplete(reflection);
  };

  if (done) {
    // If this room is on a 10-day plan, say where the plan now stands.
    const saved = store.saved.find((sp) => sp.room.id === room.id);
    const plan = saved ? challengeInfo(saved) : null;
    return (
      <PractiseShell variant={variant} theme={theme} className={shellClassName} backdrop={backdrop}>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className={kidly ? 'text-6xl' : 'grid h-20 w-20 place-items-center rounded-full'}
            style={kidly ? undefined : { background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
          >
            {kidly ? '⭐' : <Leaf size={36} strokeWidth={1.8} aria-hidden />}
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>
            {kidly ? 'You did it!' : 'You just practised.'}
          </h2>
          <p className="max-w-sm text-sm" style={{ color: 'var(--p-muted)' }}>
            {kidly
              ? 'Your mind got a little stronger today. Come back tomorrow!'
              : 'That’s a rep. Strength is built one practice at a time — come back tomorrow.'}
          </p>
          {plan && (
            <p className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
              {plan.complete
                ? `10-day plan complete — all ${CHALLENGE_DAYS} days done.`
                : `10-day plan · Day ${plan.day} of ${CHALLENGE_DAYS} done`}
            </p>
          )}
          <div className="w-full max-w-xs space-y-3 pt-2">
            <PrimaryButton onClick={onExit}>{kidly ? 'Back to my gym' : 'Back to the gym'}</PrimaryButton>
            {onHub && <GhostButton onClick={onHub}>{hubLabel}</GhostButton>}
          </div>
        </div>
      </PractiseShell>
    );
  }

  return (
    <PractiseShell variant={variant} theme={theme} className={shellClassName} backdrop={backdrop}>
      <TopBar
        title={room.title}
        onBack={idx === 0 ? onExit : () => { narration.stop(); setIdx((i) => i - 1); }}
        backLabel={idx === 0 ? 'Leave this practice' : 'Previous step'}
        backText={kidly ? undefined : 'Back'}
        step={idx + 1}
        total={steps.length}
        right={
          <div className="flex items-center">
            {!kidly && (
              <button
                onClick={() => { narration.toggle(); }}
                aria-pressed={narration.on}
                aria-label={narration.on ? 'Turn voice narration off' : 'Turn voice narration on'}
                title={narration.on ? 'Voice on' : 'Voice off'}
                className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-black/5"
                style={{ color: narration.on ? 'var(--p-accent)' : 'var(--p-muted)' }}
              >
                {narration.on ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
              </button>
            )}
            {onHub && !compactNav && (
              <button
                onClick={onHub}
                aria-label={`Leave and go to the ${hubLabel}`}
                title={hubLabel}
                className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-black/5"
                style={{ color: 'var(--p-muted)' }}
              >
                <Home size={18} aria-hidden />
              </button>
            )}
          </div>
        }
      />
      <div className="mb-6">
        <StepDots total={steps.length} current={idx} />
      </div>

      <AnimatePresence mode="wait">
        <Fade keyId={idx}>
          <StepBody
            step={step}
            room={room}
            variant={variant}
            selected={selections[idx] ?? []}
            onToggle={toggle}
            discovery={discovery}
            setDiscovery={setDiscovery}
            intention={intention}
            setIntention={setIntention}
            onSpaceDone={next}
            response={response}
            setResponse={setResponse}
            coach={coach}
            setCoach={setCoach}
            onUseSuggestion={(t) => { setResponse(t); setUsedSuggestion(true); }}
            say={narration.say}
            narrationOn={narration.on}
          />
        </Fade>
      </AnimatePresence>

      {step.kind !== 'space' && (
        <div className="mt-8">
          <PrimaryButton onClick={next}>
            {isLast ? (kidly ? 'Finish' : 'Complete practice') : 'Next'}
          </PrimaryButton>
        </div>
      )}
    </PractiseShell>
  );
}

function StepBody({
  step,
  room,
  variant,
  selected,
  onToggle,
  discovery,
  setDiscovery,
  intention,
  setIntention,
  onSpaceDone,
  response,
  setResponse,
  coach,
  setCoach,
  onUseSuggestion,
  say,
  narrationOn,
}: {
  step: SessionStep;
  room: PracticeRoom;
  variant: Variant;
  selected: string[];
  onToggle: (o: string) => void;
  discovery: string;
  setDiscovery: (v: string) => void;
  intention: string;
  setIntention: (v: string) => void;
  onSpaceDone: () => void;
  response: string;
  setResponse: (v: string) => void;
  coach: CoachReply | null;
  setCoach: (c: CoachReply | null) => void;
  onUseSuggestion: (t: string) => void;
  say: (t: string) => void;
  narrationOn: boolean;
}) {
  const heading = (
    <div className="mb-5 text-center">
      <div
        className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: 'var(--p-accent)' }}
      >
        {step.title}
      </div>
      <p className="text-lg font-semibold" style={{ color: 'var(--p-ink)' }}>
        {step.prompt}
      </p>
    </div>
  );

  switch (step.kind) {
    case 'pattern':
      return (
        <div>
          {heading}
          {room.pattern && (
            <Card className="space-y-3">
              <PatternRow label="What happened" value={room.pattern.event} part="event" />
              <PatternRow label="What my mind said" value={room.pattern.thought} part="thought" />
              <PatternRow label="What I felt" value={room.pattern.feeling} part="feeling" />
              <PatternRow label="What I wanted to do" value={room.pattern.urge} part="urge" />
            </Card>
          )}
          <p className="mt-4 text-center text-[13px]" style={{ color: 'var(--p-muted)' }}>
These are your words, not a diagnosis — you can’t get it wrong. Ready to work with it?
          </p>
        </div>
      );

    case 'replay':
      return (
        <div>
          {heading}
          {step.trigger && (
            <Card className="mb-5" style={{ background: 'var(--p-accent-soft)', border: 'none' }}>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p-accent)' }}>
                The moment
              </div>
              <p className="mt-1 text-base font-medium" style={{ color: 'var(--p-ink)' }}>
                “{step.trigger}”
              </p>
            </Card>
          )}
          <OptionGrid options={step.options ?? []} selected={selected} onToggle={onToggle} variant={variant} />
        </div>
      );

    case 'observe':
      return (
        <div>
          {heading}
          {step.floatingThought && (
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="mx-auto mb-5 max-w-sm"
            >
              <div
                className="rounded-[28px] px-6 py-6 text-center text-lg font-semibold shadow-sm"
                style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
              >
                {variant === 'kids' ? (
                  '💭 '
                ) : (
                  <MessageCircle size={22} className="mx-auto mb-2" style={{ color: 'var(--p-accent)' }} aria-hidden />
                )}
                “{step.floatingThought}”
              </div>
            </motion.div>
          )}
          <p className="text-center text-[13px]" style={{ color: 'var(--p-muted)' }}>
            {variant === 'kids'
              ? 'Watch it float by like a cloud. You don’t have to grab it.'
              : 'You are the one noticing the thought — you don’t have to believe it or act on it.'}
          </p>
        </div>
      );

    case 'space':
      return (
        <div>
          {heading}
          <BreathOrb onDone={onSpaceDone} variant={variant} />
        </div>
      );

    case 'choices':
      return (
        <div>
          {heading}
          <OptionGrid options={step.options ?? []} selected={selected} onToggle={onToggle} variant={variant} />
        </div>
      );

    case 'respond':
      return (
        <div>
          {heading}
          <RespondBody
            room={room}
            response={response}
            setResponse={setResponse}
            coach={coach}
            setCoach={setCoach}
            onUse={onUseSuggestion}
            say={say}
            narrationOn={narrationOn}
          />
        </div>
      );

    case 'reflect':
      return (
        <div>
          {heading}
          <div className="space-y-4">
            <textarea
              value={discovery}
              onChange={(e) => setDiscovery(e.target.value)}
              placeholder={variant === 'kids' ? 'I learned that…' : 'What I discovered…'}
              rows={3}
              className="w-full resize-none rounded-2xl p-4 text-sm outline-none"
              style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
            />
            {variant === 'adult' && (
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-accent)' }}>
                  One small thing I’ll practise in real life
                </div>
                <textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="Next time, I will…"
                  rows={2}
                  className="w-full resize-none rounded-2xl p-4 text-sm outline-none"
                  style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
                />
              </div>
            )}
          </div>
        </div>
      );
  }
}

/** "My response": write it, see what a steadier reply contains, optionally ask the AI. */
function RespondBody({
  room,
  response,
  setResponse,
  coach,
  setCoach,
  onUse,
  say,
  narrationOn,
}: {
  room: PracticeRoom;
  response: string;
  setResponse: (v: string) => void;
  coach: CoachReply | null;
  setCoach: (c: CoachReply | null) => void;
  onUse: (t: string) => void;
  say: (t: string) => void;
  narrationOn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const speech = useSpeechInput(response, setResponse);
  const have = markersOf(response);
  const hasText = response.trim().length > 0;

  const ask = async () => {
    setLoading(true);
    const reply = await askCoach({ pattern: room.pattern, response });
    setCoach(reply);
    setLoading(false);
    if (narrationOn) say(`A steadier way to say it. ${reply.better}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <textarea
          value={response}
          onChange={(e) => { setResponse(e.target.value); if (coach) setCoach(null); }}
          readOnly={speech.listening}
          placeholder="Next time, I will say…"
          rows={4}
          aria-label="My response"
          className="w-full resize-none rounded-2xl p-4 text-sm outline-none"
          style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}
        />
        {speech.supported && (
          <button
            onClick={speech.toggle}
            aria-pressed={speech.listening}
            className={`mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-[13px] font-semibold ${speech.listening ? 'ag-listening' : ''}`}
            style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
          >
            {speech.listening ? <Square size={14} aria-hidden /> : <Mic size={14} aria-hidden />}
            {speech.listening ? 'Stop listening' : 'Speak it instead'}
          </button>
        )}
        {speech.error && <p className="mt-1 text-[12px]" style={{ color: 'var(--p-muted)' }}>{speech.error}</p>}
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)' }}>
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--p-muted)' }}>
          <span>What a steady reply often has</span>
          <span style={{ color: 'var(--p-accent)' }}>{hasText ? `${have.length} of ${MARKERS.length}` : ''}</span>
        </div>
        <ul className="space-y-1.5">
          {MARKERS.map((m) => {
            const on = hasText && have.includes(m.id);
            return (
              <li key={m.id} className="flex items-start gap-2 text-[13px]" style={{ color: on ? 'var(--p-ink)' : 'var(--p-muted)' }}>
                <span
                  className="mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full"
                  style={{ background: on ? 'var(--p-accent-fill, var(--p-accent))' : 'var(--p-line)', color: '#fff' }}
                  aria-hidden
                >
                  {on && <Check size={10} strokeWidth={3} />}
                </span>
                <span>
                  <span className="font-semibold">{m.label}</span>
                  {!on && <span> — {m.hint}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {hasText && !coach && (
        <div>
          <button
            onClick={ask}
            disabled={loading}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold disabled:opacity-60"
            style={{ background: 'transparent', color: 'var(--p-accent)', border: '1px solid var(--p-line)' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
            {loading ? 'Thinking…' : 'Suggest a steadier way to say it'}
          </button>
          <p className="mt-1.5 text-center text-[12px]" style={{ color: 'var(--p-muted)' }}>
            This sends your words to our AI coach to suggest wording. Nothing is sent unless you tap.
          </p>
        </div>
      )}

      {coach && (
        <div className="rounded-2xl p-4" style={{ background: 'var(--p-accent-soft)' }} aria-live="polite">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--p-accent)' }}>
            {coach.source === 'ai' ? 'A steadier way to say it · AI coach' : 'A steadier way to say it · built from your words'}
          </div>
          <p className="mt-2 text-[15px] font-medium leading-relaxed" style={{ color: 'var(--p-ink)' }}>“{coach.better}”</p>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--p-muted)' }}>{coach.why}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => onUse(coach.better)}
              className="min-h-[44px] rounded-xl px-4 text-[13px] font-semibold text-white"
              style={{ background: 'var(--p-accent-fill, var(--p-accent))' }}
            >
              Use this wording
            </button>
            <button
              onClick={() => say(coach.better)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold"
              style={{ color: 'var(--p-accent)', border: '1px solid var(--p-line)' }}
            >
              <Volume2 size={14} aria-hidden /> Listen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PatternRow({ label, value, part }: { label: string; value: string; part: keyof Pattern }) {
  // Parts the person left blank are simply not shown — nothing is invented.
  if (!value.trim()) return null;
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full"
        style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
      >
        <PatternIcon part={part} size={16} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p-muted)' }}>
          {label}
        </div>
        <div className="break-words text-sm" style={{ color: 'var(--p-ink)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function OptionGrid({
  options,
  selected,
  onToggle,
  variant,
}: {
  options: string[];
  selected: string[];
  onToggle: (o: string) => void;
  variant: Variant;
}) {
  return (
    <div className={variant === 'kids' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-2.5'}>
      {options.map((o) => (
        <Chip key={o} label={o} selected={selected.includes(o)} onClick={() => onToggle(o)} big tone={variant === 'kids' ? 'green' : 'accent'} />
      ))}
    </div>
  );
}
