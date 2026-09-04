import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from '../rooms';
import type { StoryGame, StoryPanel } from '../games/types';
import { CHROME, Cta, FONT, Pill, Question } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import { Chirpy } from '../ui/scene';
import * as sound from '../kit/sound';

/**
 * E6 · Story playback — a short sequence plays, pauses for input, and replays
 * with the child's change. 18 games.
 *
 * **The replay is the payoff — it must be visibly different, not just
 * re-narrated** (UI design §8.2). That is the one thing this engine has to
 * get right, and it is why `replay` panels get their own treatment: the
 * child's own words come back set in the room's accent colour, inside a
 * differently-shaped card, arriving after a beat. A replay that reads like
 * the line before it teaches nothing — the child needs to SEE that the thing
 * they chose changed what happened.
 *
 * `{choice}` in a replay's text is substituted with whatever the child last
 * picked. If a game has several choices before its replay, the most recent
 * one wins, which is what every game in the library expects.
 *
 * PRIVACY — the `write` panel. Free text a child types is the most sensitive
 * thing this app touches (BUILD_BRIEF §4, master plan §11/§14). The two
 * blocking open decisions there are not resolved, so nothing typed here goes
 * anywhere: it lives in component state for the length of the game and is
 * gone when the child leaves. There is deliberately no upload, no
 * localStorage write and no analytics event on this panel. Do not add one
 * without the founder settling §14.
 */

export function StoryEngine({
  game,
  room,
  onDone,
}: {
  game: StoryGame;
  room: RoomConfig;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [lastChoice, setLastChoice] = useState('');
  const m = useMotion();
  const panel: StoryPanel | undefined = game.panels[i];

  const next = () => {
    if (i + 1 < game.panels.length) setI(i + 1);
    else onDone();
  };

  if (!panel) return null;

  return (
    <div className="flex min-h-[42vh] w-full flex-col justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={m.transition}
          className="flex flex-col gap-5"
        >
          {panel.kind === 'line' && <LinePanel panel={panel} room={room} onNext={next} />}
          {panel.kind === 'choice' && (
            <ChoicePanel panel={panel} room={room} onNext={(c) => { setLastChoice(c); next(); }} />
          )}
          {panel.kind === 'replay' && <ReplayPanel panel={panel} room={room} choice={lastChoice} onNext={next} />}
          {panel.kind === 'write' && <WritePanel panel={panel} room={room} onNext={next} />}
          {panel.kind === 'cards' && <CardsPanel panel={panel} room={room} onNext={next} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── line ───────────────────────────────────────────────────────────── */

function LinePanel({ panel, room, onNext }: { panel: Extract<StoryPanel, { kind: 'line' }>; room: RoomConfig; onNext: () => void }) {
  return (
    <button onClick={onNext} className="w-full text-left" aria-label="Next">
      {panel.who === 'chirpy' ? (
        <Chirpy pose="curious" line={panel.text} align="left" />
      ) : (
        <Question room={room}>{panel.text}</Question>
      )}
      <p className="mt-5 text-[13px] font-bold" style={{ color: CHROME.textSoft }}>Tap anywhere</p>
    </button>
  );
}

/* ── choice ─────────────────────────────────────────────────────────── */

function ChoicePanel({ panel, room, onNext }: { panel: Extract<StoryPanel, { kind: 'choice' }>; room: RoomConfig; onNext: (choice: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const m = useMotion();
  const quiet = useQuiet();
  const options = quiet ? panel.options.slice(0, 4) : panel.options;

  const tap = (o: string) => {
    if (picked) return;
    sound.play('tap');
    setPicked(o);
    window.setTimeout(() => onNext(o), m.advanceMs);
  };

  return (
    <div className="flex flex-col gap-4">
      <Question room={room}>{panel.prompt}</Question>
      <div className="flex flex-col" style={{ gap: m.gap }}>
        {options.map((o) => (
          <Pill key={o} label={o} selected={picked === o} onClick={() => tap(o)} accent={room.palette.accent} disabled={!!picked} />
        ))}
      </div>
    </div>
  );
}

/* ── replay · the payoff ────────────────────────────────────────────── */

function ReplayPanel({
  panel,
  room,
  choice,
  onNext,
}: {
  panel: Extract<StoryPanel, { kind: 'replay' }>;
  room: RoomConfig;
  choice: string;
  onNext: () => void;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // A beat of dark before it plays again, so the replay reads as a rewind
    // rather than as the next sentence.
    const t = window.setTimeout(() => { setShown(true); sound.play('resolve'); }, 700);
    return () => clearTimeout(t);
  }, []);

  if (!shown) {
    return (
      <p className="text-[13px] font-extrabold uppercase tracking-[0.2em]" style={{ color: CHROME.textSoft }}>
        Again…
      </p>
    );
  }

  // The child's own words, set apart so the change is impossible to miss.
  const parts = panel.text.split('{choice}');

  return (
    <motion.button
      onClick={onNext}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full rounded-[26px] p-5 text-left"
      style={{ background: 'rgba(255,255,255,0.09)', border: `1px solid ${room.palette.accent}77` }}
    >
      <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.18em]" style={{ color: room.palette.accent }}>
        Same story, again
      </p>
      <p className="text-[21px] font-extrabold leading-snug" style={{ color: CHROME.text, fontFamily: FONT, textWrap: 'balance' }}>
        {parts[0]}
        {parts.length > 1 && (
          <span style={{ color: room.palette.accent }}>{choice || 'that'}</span>
        )}
        {parts[1]}
      </p>
      <p className="mt-5 text-[13px] font-bold" style={{ color: CHROME.textSoft }}>Tap anywhere</p>
    </motion.button>
  );
}

/* ── write · stays on the device ────────────────────────────────────── */

function WritePanel({ panel, room, onNext }: { panel: Extract<StoryPanel, { kind: 'write' }>; room: RoomConfig; onNext: () => void }) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <Question room={room}>{panel.prompt}</Question>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={panel.placeholder}
        rows={3}
        className="w-full resize-none rounded-[20px] px-4 py-3.5 text-[16px] font-semibold leading-snug outline-none"
        style={{
          background: 'rgba(255,255,255,0.94)',
          color: '#1B1630',
          fontFamily: FONT,
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      />
      <p className="text-[12.5px] font-semibold" style={{ color: CHROME.textSoft }}>
        This stays on this device. Nobody else sees it unless you show them.
      </p>
      <Cta label={text.trim() ? 'Done' : 'Skip this one'} onClick={onNext} accent={room.palette.accent} />
    </div>
  );
}

/* ── cards · things that print out one at a time ────────────────────── */

function CardsPanel({ panel, room, onNext }: { panel: Extract<StoryPanel, { kind: 'cards' }>; room: RoomConfig; onNext: () => void }) {
  const [tapped, setTapped] = useState<string[]>([]);
  const m = useMotion();
  const all = tapped.length >= panel.cards.length;

  const tap = (c: string) => {
    if (tapped.includes(c)) return;
    sound.play('tapHit');
    setTapped((t) => [...t, c]);
  };

  return (
    <div className="flex flex-col gap-4">
      <Question room={room}>{panel.prompt}</Question>
      <div className="flex flex-col" style={{ gap: m.gap }}>
        {panel.cards.map((c) => (
          <Pill key={c} label={c} selected={tapped.includes(c)} onClick={() => tap(c)} accent={room.palette.accent} />
        ))}
      </div>

      <AnimatePresence>
        {(all || tapped.length > 0) && panel.land && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: all ? 1 : 0.35, y: 0 }}
            transition={m.transition}
            className="text-[16px] font-extrabold leading-snug"
            style={{ color: CHROME.text, fontFamily: FONT }}
          >
            {all ? panel.land : ''}
          </motion.p>
        )}
      </AnimatePresence>

      <Cta label={all ? 'Right then' : 'That’s enough of those'} onClick={onNext} accent={room.palette.accent} />
    </div>
  );
}
