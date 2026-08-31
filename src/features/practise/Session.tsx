import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getLocalDayString } from '../../lib/utils';
import { sfx } from '../../lib/sfx';
import type { PracticeRoom, Reflection, SessionStep } from './types';
import { usePractiseStore } from './store';
import { BreathOrb } from './BreathOrb';
import { Card, Chip, Fade, PractiseShell, PrimaryButton, StepDots, TopBar, type Variant } from './ui';

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
}: {
  room: PracticeRoom;
  variant: Variant;
  onExit: () => void;
  onComplete: (r: Reflection) => void;
}) {
  const store = usePractiseStore();
  const [idx, setIdx] = useState(0);
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [discovery, setDiscovery] = useState('');
  const [intention, setIntention] = useState('');
  const [done, setDone] = useState(false);

  const steps = room.steps;
  const step = steps[idx];
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
    sfx.celebrate();
    setDone(true);
    onComplete(reflection);
  };

  if (done) {
    return (
      <PractiseShell variant={variant}>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="text-6xl"
          >
            {kidly ? '⭐' : '🌿'}
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--p-ink)' }}>
            {kidly ? 'You did it!' : 'You just practised.'}
          </h2>
          <p className="max-w-sm text-sm" style={{ color: 'var(--p-muted)' }}>
            {kidly
              ? 'Your mind got a little stronger today. Come back tomorrow!'
              : 'That’s a rep. Strength is built one practice at a time — come back tomorrow.'}
          </p>
          <div className="w-full max-w-xs pt-2">
            <PrimaryButton onClick={onExit}>{kidly ? 'Back to my gym' : 'Back to the gym'}</PrimaryButton>
          </div>
        </div>
      </PractiseShell>
    );
  }

  return (
    <PractiseShell variant={variant}>
      <TopBar
        title={room.title}
        onBack={idx === 0 ? onExit : () => setIdx((i) => i - 1)}
        step={idx + 1}
        total={steps.length}
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
              <PatternRow label="Event" value={room.pattern.event} glyph="⚡" />
              <PatternRow label="Thought" value={room.pattern.thought} glyph="💭" />
              <PatternRow label="Feeling" value={room.pattern.feeling} glyph="❤️" />
              <PatternRow label="Urge" value={room.pattern.urge} glyph="🌀" />
            </Card>
          )}
          <p className="mt-4 text-center text-[13px]" style={{ color: 'var(--p-muted)' }}>
            This is a first draft — you can’t get it wrong. Ready to work with it?
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
                💭 “{step.floatingThought}”
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

function PatternRow({ label, value, glyph }: { label: string; value: string; glyph: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-lg">{glyph}</span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--p-muted)' }}>
          {label}
        </div>
        <div className="text-sm" style={{ color: 'var(--p-ink)' }}>
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
