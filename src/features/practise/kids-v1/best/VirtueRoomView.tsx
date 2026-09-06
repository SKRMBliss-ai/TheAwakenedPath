import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS } from '../../../kids/data';
import { CHROME, Cta, FONT, GrownUpExit, Question, SceneLine } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { FloatingFeeling } from '../ui/FloatingFeeling';
import { Chirpy, RoomScene } from '../ui/scene';
import { gamesInRoom } from '../games/library';
import { roomGamesFor, type RoomGame } from './roomGames';
import { RoomGamePlayer } from './RoomGamePlayer';
import { artRoomFor, VIRTUE_ROOMS, type VirtueRoom } from './rooms';
import { CaughtFirefly } from './CaughtFirefly';
import { GardenTree } from './GardenTree';
import { type ReportingDay } from '../kit/reportingDay';
import * as sound from '../kit/sound';

/**
 * Inside one virtue room.
 *
 * The room IS a Kids Gym room — same painted artwork, same palette, same
 * scrim, same chrome, same Chirpy (see `artRoomFor`). What changed is what
 * you do in it. Instead of opening a long reflective sequence, it asks one
 * question about today, and then offers things to do.
 *
 * Three things live here: today's tick, the games, and the one small thing
 * there is to learn. The tick is the point of the whole app — My Best Every
 * Day's daily question, moved out of a checklist and into the room the
 * question is about.
 *
 * THE TICK GOES BOTH WAYS, and that matters more than it looks. A child can
 * untick. No confirmation, no "are you sure", no sad face. Recording "not
 * today" has to be exactly as cheap as recording "yes", or the number stops
 * describing the child and starts describing what they think the app wants.
 */
export function VirtueRoomView({
  room,
  reporting,
  journey,
  onExit,
  onGrownUp,
  onDeepDive,
  onNext,
}: {
  room: VirtueRoom;
  /**
   * The day this session is answering for — today, or yesterday before the
   * afternoon when yesterday is still open. Handed down from BestApp rather
   * than worked out here: the first tick would otherwise change the answer
   * (see the note where it is fixed), and the room would swap days under a
   * child who is standing in it.
   */
  reporting: ReportingDay;
  /** Where this room sits in the run, when the child is on the journey. */
  journey?: { index: number; total: number };
  onExit: () => void;
  onGrownUp: () => void;
  onDeepDive: () => void;
  /** Continue to the next room. Present only on the journey. */
  onNext?: () => void;
}) {
  const completions = useKidStore((s) => s.completions);
  const pointsByBehaviour = useKidStore((s) => s.pointsByBehaviour);
  const setBehaviourOn = useKidStore((s) => s.setBehaviourOn);
  const awardPoints = useKidStore((s) => s.awardPoints);

  const [playing, setPlaying] = useState<RoomGame | null>(null);
  const [showLearn, setShowLearn] = useState(false);
  /** Shows the jar the moment a firefly goes in, on the journey only. */
  const [justCaught, setJustCaught] = useState(false);

  const art = artRoomFor(room);
  const accent = art.palette.accent;

  const doneToday = !!completions[reporting.key]?.[room.id];

  /**
   * Every firefly ever caught, counted the same way the Observatory's jar
   * counts them — one per virtue per day it was ticked. Only the Kindness
   * Garden's tree reads it, but the arithmetic lives here rather than in the
   * tree so the tree stays a drawing and this stays the one definition.
   */
  const lifetimeCaught = BEHAVIOURS.reduce(
    (n, b) => n + Object.values(completions).filter((day) => day[b.id]).length,
    0,
  );
  const earned = pointsByBehaviour[room.id] ?? 0;
  const newGames = roomGamesFor(room.id);
  const libraryGames = room.gamesFrom ? gamesInRoom(room.gamesFrom) : [];

  const finishGame = (pts: number) => {
    awardPoints(pts, room.id);
    sound.play('resolve');
    setPlaying(null);
  };

  /* The jar that flies up on a catch has to hold the same day's lights as the
     tick that opened it — reporting.key, not today, or a morning catch-up
     shows an empty jar for the firefly the child just put in. */
  const caughtToday = VIRTUE_ROOMS
    .filter((r) => completions[reporting.key]?.[r.id])
    .map((r) => r.id);

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* Whatever the child named today comes with them into this room —
          bouncing, draggable, and parked wherever they last put him. */}
      <FloatingFeeling />

      {/* The way out is a fitting on the left wall, the same one on every
          screen in the app. No chevron in the corner any more: a child who
          learns one door learns them all. */}
      <DoorHandle side="left" label="Back" onClick={onExit} accent={accent} />

      <RoomScene room={art} dim={playing ? 0.35 : 0.12} />

      {/* THE GARDEN'S OWN TREE, in the garden and nowhere else. It carries the
          same lifetime total the Observatory's jar does, grown into something
          you look at rather than read. Scenery: it sits behind the room's
          content on purpose, and the pills pass in front of it the way things
          in a room pass in front of a tree. */}
      {room.id === 'kind' && !playing && (
        /* Clear of the bottom bar, which is fixed and about 112px tall — at
           bottom-0 the tree grew entirely behind it and the only thing a child
           could see of a season's work was two leaves poking out. */
        <div aria-hidden className="pointer-events-none absolute bottom-28 right-3 z-0 opacity-90 sm:right-7">
          <GardenTree total={lifetimeCaught} />
        </div>
      )}

      <AnimatePresence>
        {justCaught && journey && (
          <CaughtFirefly
            room={room}
            caught={caughtToday}
            isLast={journey.index === journey.total - 1}
            onNext={() => { setJustCaught(false); onNext?.(); }}
            onStay={() => setJustCaught(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-[74px] pb-28 pt-4 sm:px-20">
        <div className="flex items-center justify-between gap-3">
          {journey && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: journey.total }).map((_, i) => (
                <span
                  key={i}
                  className="block h-2 w-2 rounded-full"
                  style={{
                    background: i < journey.index ? accent
                      : i === journey.index ? '#fff'
                      : 'rgba(255,255,255,0.28)',
                    transform: i === journey.index ? 'scale(1.3)' : 'none',
                  }}
                />
              ))}
            </div>
          )}
          <GrownUpExit onClick={onGrownUp} />
        </div>

        {playing ? (
          <div className="pt-6">
            <RoomGamePlayer game={playing} accent={accent} onDone={finishGame} />
            <button onClick={() => setPlaying(null)} className="mt-5 w-full text-[12.5px] font-bold" style={{ color: CHROME.textSoft }}>
              Leave this one
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-end gap-4 pb-4 pt-8">
            <Chirpy pose={doneToday ? 'excited' : 'curious'} line={room.tagline} align="left" />
            <Question room={art}>{room.name}</Question>

            {/* ── The tick — the actual point of the app ───────────────── */}

            {/* WHICH DAY THIS IS ABOUT, said plainly, and only when it isn't
                the obvious one. The seven prompts don't all carry the word
                "today" anywhere it could be swapped for "yesterday", so the
                day is labelled above the question rather than edited into
                it — and a labelled day is unambiguous where a reworded
                sentence is a thing a child might not notice at all. */}
            {reporting.isYesterday && (
              <span
                className="-mb-2 block text-[11.5px] font-extrabold uppercase tracking-[0.14em]"
                style={{ color: accent }}
              >
                About yesterday
              </span>
            )}

            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                const catching = !doneToday;
                sound.play(catching ? 'discovery' : 'tap');
                setBehaviourOn(reporting.key, room.id, catching);
                // The jar only appears when a light goes IN, and only on the
                // journey. Unticking is silent and costs nothing, which is
                // the rule this whole app is built on.
                if (catching && journey) setJustCaught(true);
              }}
              className="flex w-full items-center gap-4 rounded-[24px] px-5 py-5 text-left backdrop-blur-md"
              style={{
                background: doneToday ? CHROME.pillSelected : CHROME.pill,
                border: `1px solid ${doneToday ? accent : CHROME.pillBorder}`,
                boxShadow: doneToday ? `0 0 28px -8px ${accent}` : 'none',
              }}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{
                  background: doneToday ? accent : 'transparent',
                  border: `2px solid ${doneToday ? accent : CHROME.pillBorder}`,
                }}
              >
                {doneToday && <Check size={22} strokeWidth={3} color="#0E1A1C" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
                  {room.prompt}
                </span>
                <span className="mt-1 block text-[12.5px] font-semibold" style={{ color: CHROME.textSoft }}>
                  {doneToday
                    ? `Ticked for ${reporting.isYesterday ? 'yesterday' : 'today'} · +${room.points}. Tap to change it.`
                    : 'Tap if you did. Tap again if you change your mind.'}
                </span>
              </span>
            </motion.button>

            <div className="flex items-center justify-between gap-3">
              <SceneLine>{earned > 0 ? `${earned} points earned in here` : 'Nothing earned in here yet'}</SceneLine>
              {libraryGames.length > 0 && (
                <span className="shrink-0 text-[12px] font-bold" style={{ color: CHROME.textSoft }}>
                  +{libraryGames.length} in the library
                </span>
              )}
            </div>

            {/* ── The one small thing to learn ──────────────────────────── */}
            <button
              onClick={() => setShowLearn((v) => !v)}
              className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3.5 text-left backdrop-blur-md"
              style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}` }}
            >
              <span className="min-w-0 flex-1 text-[13.5px] font-extrabold" style={{ color: CHROME.text }}>
                {room.learn.title}
              </span>
              <span className="text-[15px] font-bold" style={{ color: CHROME.textSoft }}>{showLearn ? '−' : '+'}</span>
            </button>
            <AnimatePresence>
              {showLearn && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden px-1 text-[14px] font-semibold leading-relaxed"
                  style={{ color: CHROME.textSoft }}
                >
                  {room.learn.body}
                </motion.p>
              )}
            </AnimatePresence>

            {/* ── This room's own games ─────────────────────────────────── */}
            {newGames.map((g) => (
              <button
                key={g.id}
                onClick={() => { sound.play('roomCard'); setPlaying(g); }}
                className="w-full rounded-[20px] px-4 py-3.5 text-left backdrop-blur-md"
                style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}` }}
              >
                <span className="block text-[14.5px] font-extrabold" style={{ color: CHROME.text }}>{g.title}</span>
                <span className="mt-0.5 block text-[12px] font-semibold" style={{ color: CHROME.textSoft }}>
                  +{g.points} · nobody loses this one
                </span>
              </button>
            ))}

            {/* ── Onward ────────────────────────────────────────────────
                On the journey the way forward is always available, whether
                or not the room got ticked. A child who didn't manage this
                one today has still answered the question honestly, and
                making them sit here would teach them to lie to it. */}
            {onNext ? (
              <Cta
                label={
                  journey && journey.index === journey.total - 1
                    ? 'Finish — take me to the Observatory'
                    : doneToday ? 'Next room →' : 'Not today — next room →'
                }
                onClick={onNext}
                accent={accent}
              />
            ) : (
              <Cta label="Something’s still on my mind" onClick={onDeepDive} accent={accent} />
            )}

            {onNext && (
              <button
                onClick={onDeepDive}
                className="w-full text-[12.5px] font-bold"
                style={{ color: CHROME.textSoft }}
              >
                Something’s still on my mind
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
