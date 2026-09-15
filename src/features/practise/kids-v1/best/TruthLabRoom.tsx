import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Cloud, Heart, Quote, User } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { CHROME, FONT, GrownUpExit } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { Chirpy, RoomScene } from '../ui/scene';
import { useMotion } from '../ui/quiet';
import { getRoom } from '../rooms';
import { boySpriteForEmotion, chirpySprite, chirpySrcSet, type BoyEmotion, type ChirpyPose } from '../ui/sprites';
import { Connector, LitCard, StepHead, UnderNote } from '../ui/trail';
import { nextTruthCase, truthCaseDone, roomNameToday, type TruthFeeling } from '../kit/truthLab';
import { type ReportingDay } from '../kit/reportingDay';
import * as sound from '../kit/sound';

/**
 * THE TRUTH LAB — "let's look at what happened together".
 *
 * WHAT WAS HERE BEFORE. The room behind this door was the standard virtue
 * room: a tagline, a title, one tick, a collapsible paragraph, a couple of
 * game buttons. That layout is right for six of the seven rooms, which ask a
 * single question about today and then get out of the way. It is wrong for
 * this one, because this one is where a child takes something apart, and a
 * stack of translucent grey boxes is not a place you take anything apart in.
 *
 * SO THE ROOM IS A TRAIL. Five cards, laid down one at a time as the child
 * answers, joined by a dashed line that runs down the page — what happened,
 * how it felt, where it sat, what the mind made of it, what else would fit,
 * and what they're taking out of the door. Nothing is cleared away: by the
 * end the whole thing is on screen at once, in order, and the ALWAYS at step
 * three is sitting four inches above four other accounts that also fit. That
 * picture is the lesson. A wizard that replaced each step with the next one
 * would have made the child hold all of it in their head, which is precisely
 * the thing they cannot do while upset.
 *
 * WHY THE CARDS ARE BRIGHT IN A DARK ROOM. Every other surface in this app is
 * a translucent panel over painted scenery, because everywhere else the
 * scenery is the point. Here the words are the point — they are the child's
 * own account of something that went wrong — so they go on lit cards that sit
 * in front of the room rather than in it. It is the difference between
 * reading a wall and reading a piece of paper somebody handed you.
 *
 * NOTHING IN HERE IS MARKED. There is no right feeling, the four alternatives
 * all fit the same facts, and one of the four endings is "I still don't know".
 * A child who takes their mind's original story home has still done the whole
 * exercise: they looked, which is the only thing being taught.
 */

/**
 * The five steps, and the colour each one is.
 *
 * Warm through cool and back to gold: the trail starts at the feeling, cools
 * as it gets to the thinking, and lands lit. Nothing rides on the order of
 * the hues beyond that — what matters is that no two adjacent cards are the
 * same colour, so the trail reads as five things rather than one long one.
 */
const STEP_TINT = ['#F0873B', '#A971E8', '#4FA3E8', '#4FBF87', '#FFC65C'] as const;

/**
 * THE FOUR ANSWERED CARDS' OWN COLOURS — saturated, not the pale wash the
 * turned-over alternatives use.
 *
 * The composed room mockup (handed over separately from the individual card
 * exports in docs/source-material/room-mockups) draws these solid: a deep
 * tint for the card itself, a brighter version of the same hue for the label
 * and the icon's circle. Four rather than five, because step four — turning
 * the alternatives over — has no card of its own in that mockup; it stays in
 * STEP_TINT's pale style below.
 */
const STORY_COLOR = {
  felt:  { bg: '#7A2A44', bgDark: '#3C1220', label: '#FF9FB3', iconBg: '#E14E6E' },
  sat:   { bg: '#22407B', bgDark: '#0F2040', label: '#A6C6FF', iconBg: '#4C7FE0' },
  mind:  { bg: '#0F565C', bgDark: '#082F33', label: '#7BEFE2', iconBg: '#22B3A8' },
  truth: { bg: '#432874', bgDark: '#20123C', label: '#DABEFF', iconBg: '#9163F2' },
} as const;

/**
 * WHAT THE UNLIT SURFACES IN HERE ARE MADE OF.
 *
 * The room runs its painting undimmed (see the RoomScene call below), and a
 * panel at 6% white over a lit painting is a window onto it — the boy's face
 * came straight through the four feeling options, and "Cross" was written
 * across his eye. Everywhere else in the app that same 6% works, because
 * everywhere else there is a scrim underneath it doing the real work.
 *
 * So the panels that are not lit cards are nearly solid instead. The tint
 * still comes from the border, which is where it was doing the useful job
 * anyway.
 */
const PANEL = 'rgba(12,7,26,0.92)';

/**
 * Text with nothing behind it but painting — the headings and the asks.
 *
 * Heavier than it looks like it needs to be, because this room stopped
 * dimming its painting: the two loose lines in here now sit on lit wood and
 * a lantern rather than on a scrim, and white on gold pine is white on
 * nothing. The tight first layer is what separates the letterforms; the wide
 * ones put the dark back behind the words that the scrim used to.
 */
const OVER_ART = [
  '0 1px 2px rgba(6,3,16,1)',
  '0 2px 10px rgba(6,3,16,0.95)',
  '0 0 30px rgba(6,3,16,0.92)',
  '0 0 62px rgba(6,3,16,0.75)',
].join(', ');

export function TruthLabRoom({
  reporting,
  journey,
  onExit,
  onGrownUp,
  onNext,
}: {
  /** The day the tick at the bottom is answering for. Fixed by BestApp. */
  reporting: ReportingDay;
  /** Where this room sits in the run, when the child is walking the journey. */
  journey?: { index: number; total: number };
  onExit: () => void;
  onGrownUp: () => void;
  /** Continue to the next room. Present only on the journey. */
  onNext?: () => void;
}) {
  const m = useMotion();
  const completions = useKidStore((s) => s.completions);
  const setBehaviourOn = useKidStore((s) => s.setBehaviourOn);
  const awardPoints = useKidStore((s) => s.awardPoints);

  const art = getRoom('thought');
  const accent = art.palette.accent;

  /* Both fixed for the life of the visit, in a memo rather than in state, so
     no re-render can swap the situation or rename the room under a child who
     is halfway down the trail. */
  const kase = useMemo(() => nextTruthCase(), []);
  const roomName = useMemo(() => roomNameToday(), []);

  const [felt, setFelt] = useState<TruthFeeling | null>(null);
  /** Whether the mind's sentence has been turned over yet. */
  const [heard, setHeard] = useState(false);
  /** Which of the other accounts have been turned over. */
  const [turned, setTurned] = useState<string[]>([]);
  const [truth, setTruth] = useState<string | null>(null);

  const doneToday = !!completions[reporting.key]?.truth;
  const allTurned = turned.length >= kase.others.length;

  /**
   * Which step the room is currently asking about. Everything above it is
   * laid down and stays; everything below it hasn't happened yet.
   */
  const step = !felt ? 1 : !heard ? 3 : !allTurned ? 4 : !truth ? 5 : 6;

  const pick = (f: TruthFeeling) => { sound.play('tap'); setFelt(f); };

  const hear = () => { sound.play('roomCard'); setHeard(true); };

  const turn = (other: string) => {
    if (turned.includes(other)) return;
    sound.play('roomCard');
    setTurned((t) => [...t, other]);
  };

  const land = (t: string) => {
    sound.play('miniWin');
    setTruth(t);
    truthCaseDone(kase.id);
    /* Attributed to `truth`, unlike the Different Story room's points: this
       IS one of the seven virtues and the work just done is exactly what the
       room is for. */
    awardPoints(12, 'truth');
  };

  /**
   * Chirpy, one line at a time, and he is a companion rather than a marker
   * (§2.7) — he never says well done for picking a particular thing, because
   * there is no particular thing to pick.
   */
  const line =
    step === 1 ? `Come in. This is ${roomName}. Something happened — how did it land?`
    : step === 3 ? 'Right. Now — what did your mind start saying about it?'
    : step === 4 ? (turned.length === 0
        ? 'Your mind picked that one fast and stopped looking. Have a look underneath.'
        : 'Keep going. They all fit what actually happened.')
    : step === 5 ? 'So. Which one are you taking out of here?'
    : 'That’s the one. Nice work — that was the hard bit.';

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <DoorHandle side="left" label="Back" onClick={onExit} accent={accent} big />
      {/*
        NO DIM IN HERE. Every other room drops a scrim over its painting so
        the question on top of it can be read; this one does not need to,
        because nothing in here is read off the wall. The trail is opaque
        cards, and an opaque card is legible over anything, so the scrim was
        buying nothing and costing the only lit room in the building its
        light. `dim={0}` now takes the scrim with it — see RoomScene.

        AND IT IS THE ROOM ON THE SIGN, not the boy at his desk. The `thought`
        room's own painting is a child writing under a lamp with his thoughts
        in bubbles above him, which is the right picture for the two steps of
        the DeepDive walk that use it and the wrong one for this: a child
        walks through a door marked TRUTH LAB and wants to be standing in the
        place behind it. So this screen overrides the art with the room from
        the founder's own composed sheet — the door, the lantern, and the
        five books a child is here to do one of.
      */}
      <RoomScene room={art} dim={0} art="/rooms/truth-lab.webp" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        {/* How far through the walk, when there is a walk. Same beads as
            every other room on the journey. */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {journey && Array.from({ length: journey.total }).map((_, i) => (
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
        <div className="pointer-events-auto"><GrownUpExit onClick={onGrownUp} /></div>
      </div>

      {/* THE LEFT GUTTER IS FOR THE DOOR. The handle is a fixed fitting on
          the left wall at about a quarter of the way up, and on a phone the
          content column otherwise runs straight underneath it — the brass
          lands on top of whatever card happens to be at that height. Every
          other room in the app reserves the same gutter; this one has a
          handle on the left only, so only the left is reserved. */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[30rem] flex-col gap-3 pb-28 pl-[72px] pr-4 pt-16 sm:px-5">
        {/* The room's own handwriting, over the top of the trail. It says what
            this place is for in the child's words rather than the app's. */}
        <p
          className="max-w-[16rem] text-[19px] font-extrabold leading-[1.16]"
          style={{ color: CHROME.text, transform: 'rotate(-2.5deg)', textWrap: 'balance', textShadow: OVER_ART }}
        >
          Let’s look at what happened
          {/* Lavender, not the room's own accent. The accent here is a warm
              gold, which was fine against a scrim and is invisible now the
              room is lit: gold lettering on lit pine, over a lantern. The
              composed sheet writes this line in lavender anyway. */}
          <span style={{ color: '#DABEFF' }}> together…</span>
        </p>

        <Chirpy pose={step === 6 ? 'excited' : 'curious'} line={line} align="left" />

        {/* THE SITUATION. Not a step and not on the trail — it is the thing
            the whole trail is about, so it sits above it like a title. */}
        <div
          className="rounded-[20px] px-4 py-3.5"
          style={{ background: PANEL, border: `1px solid ${accent}` }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: accent }}>
            What happened
          </p>
          <p className="mt-1 text-[15px] font-bold leading-snug" style={{ color: CHROME.text }}>
            {kase.scene}
          </p>
        </div>

        {/* ── 1 · You felt ──────────────────────────────────────────────── */}
        {felt ? (
          <StoryCard colors={STORY_COLOR.felt} icon={<Heart size={18} color="#fff" fill="#fff" />} label="You felt" portrait={<Face emotion={felt.face} />}>
            {felt.word}. And it was real.
          </StoryCard>
        ) : (
          <Choices
            tint={STEP_TINT[0]}
            ask="How did it feel?"
            options={kase.feelings.map((f) => f.word)}
            onPick={(w) => pick(kase.feelings.find((f) => f.word === w)!)}
            target={m.target}
          />
        )}

        {/* ── 2 · Where it sat ──────────────────────────────────────────
            Not chosen. The child picked the feeling and this came with it —
            every feeling in kit/truthLab carries the place it lives, because
            a child who can find a feeling in their body has somewhere to
            look next time that is not their own thoughts. */}
        {felt && (
          <StoryCard colors={STORY_COLOR.sat} icon={<User size={18} color="#fff" />} label="It sat here">
            {felt.body}
          </StoryCard>
        )}

        {/* ── 3 · What the mind said ────────────────────────────────────
            Face down until tapped. Being shown your own worst sentence is
            being told about it; turning it over yourself is catching it. */}
        {felt && !heard && (
          <FaceDown tint={STEP_TINT[2]} label="Your mind said" hint="Tap to hear it" onTurn={hear} target={m.target} />
        )}
        {heard && (
          <StoryCard colors={STORY_COLOR.mind} icon={<Cloud size={18} color="#fff" fill="#fff" />} label="Your mind said">
            <Loud said={kase.mind.said} word={kase.mind.word} />
          </StoryCard>
        )}

        {/* ── 4 · What else could be true ───────────────────────────────
            Four cards, face down, turned one at a time. Handed over as a
            list they are reading; turned over one by one they are finds. */}
        {heard && (
          <div className="flex flex-col gap-2">
            <StepHead n={4} tint={STEP_TINT[3]} label="What else could be true" />
            {kase.others.map((o) => (
              <Alternative
                key={o}
                text={o}
                turned={turned.includes(o)}
                tint={STEP_TINT[3]}
                onTurn={() => turn(o)}
                target={m.target}
              />
            ))}
            {allTurned && (
              <UnderNote>All of those fit what actually happened. So does your mind’s one.</UnderNote>
            )}
          </div>
        )}

        {/* ── 5 · The truth ─────────────────────────────────────────────
            The only step with no wrong answer AND no right one, which is
            said out loud rather than implied: one of the four is "I still
            don't know", and it is not the consolation option. */}
        {allTurned && !truth && (
          <Choices
            tint={STEP_TINT[4]}
            ask="Which one are you taking with you?"
            options={kase.truths}
            onPick={land}
            target={m.target}
          />
        )}
        {truth && (
          <StoryCard colors={STORY_COLOR.truth} icon={<Quote size={18} color="#fff" fill="#fff" />} label="The truth" glow portrait={<ChirpyAt pose="excited" />}>
            {truth}
          </StoryCard>
        )}

        {/* ── And then today's actual question ──────────────────────────
            The tick this room exists for in My Best Every Day, which is not
            part of the trail and must not look like the end of it. It comes
            after, once the thinking is done, and it goes both ways with no
            ceremony either side — see VirtueRoomView for why unticking has
            to cost exactly nothing. */}
        {truth && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-2 flex flex-col gap-2"
          >
            {reporting.isYesterday && (
              <span className="text-[11.5px] font-extrabold uppercase tracking-[0.14em]" style={{ color: accent }}>
                About yesterday
              </span>
            )}
            <button
              onClick={() => {
                const catching = !doneToday;
                sound.play(catching ? 'miniWin' : 'tap');
                setBehaviourOn(reporting.key, 'truth', catching);
              }}
              className="flex w-full items-center gap-4 rounded-[24px] px-5 py-5 text-left backdrop-blur-md"
              style={{
                minHeight: m.target,
                background: doneToday ? CHROME.pillSelected : PANEL,
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
                  Were you honest today, even when it was hard?
                </span>
                <span className="mt-1 block text-[12.5px] font-semibold" style={{ color: CHROME.textSoft }}>
                  {doneToday
                    ? `Ticked for ${reporting.isYesterday ? 'yesterday' : 'today'}. Tap to change it.`
                    : 'Tap if you were. Tap again if you change your mind.'}
                </span>
              </span>
            </button>

            {/* On the journey the way forward is always available, ticked or
                not — see VirtueRoomView on why making a child sit here until
                they tick teaches them to lie to the question. */}
            <button
              onClick={() => {
                sound.play(onNext ? 'roomCard' : 'exitRoom');
                (onNext ?? onExit)();
              }}
              className="w-full rounded-full px-4 py-3.5 text-[14.5px] font-extrabold"
              style={{
                minHeight: m.target,
                /* The accent wash it has always had, laid over the opaque
                   panel rather than over the painting — same colour, but it
                   is a button rather than a window. */
                background: `linear-gradient(${accent}2E, ${accent}2E), ${PANEL}`,
                border: `1.5px solid ${accent}`,
                color: CHROME.text,
              }}
            >
              {onNext
                ? (journey && journey.index === journey.total - 1
                    ? 'Finish — take me to the Observatory'
                    : 'Next room →')
                : 'Done here'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── The trail ───────────────────────────────────────────────────────── */





/**
 * A choice, in the trail's own style.
 *
 * Everything is on screen at once and nothing is pre-selected — there is no
 * default feeling and no default ending, because a highlighted option is a
 * suggestion and a suggestion in here is the app answering its own question.
 */
/**
 * The child's own face on the card about how they felt.
 *
 * The feeling plates are chest-up and the standing plate is full-length (see
 * ui/sprites), which does not matter here — nothing on this card is ever the
 * standing one, so the crop never changes mid-trail.
 */
/**
 * THE CARD ITSELF, in the composed mockup's own style — solid and saturated
 * rather than the pale cream the individual card exports use.
 *
 * A round icon standing in for the numbered bead (this trail's steps are not
 * a sequence a child re-orders, so a heart or a speech mark says what the
 * step IS rather than where it falls), the label in a bright tint of the same
 * hue, the sentence in white, and — where there is one — a portrait bleeding
 * past the top and bottom of the pill rather than sitting inside it, which is
 * why the wrapper is `overflow-visible` and not `overflow-hidden`.
 */
function StoryCard({
  colors, icon, label, portrait, glow = false, children,
}: {
  colors: { bg: string; bgDark: string; label: string; iconBg: string };
  icon: React.ReactNode;
  label: string;
  /** A face or a bird, bled past the card's own edge — see Face, ChirpyAt. */
  portrait?: React.ReactNode;
  glow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="relative flex items-center gap-3 rounded-[34px] py-3 pl-3 pr-4"
      style={{
        background: `linear-gradient(155deg, ${colors.bg} 0%, ${colors.bgDark} 100%)`,
        boxShadow: glow
          ? `0 0 0 4px ${colors.iconBg}40, 0 0 36px -4px ${colors.iconBg}, 0 14px 30px -14px rgba(0,0,0,0.8)`
          : `0 0 0 3px ${colors.iconBg}30, 0 0 22px -6px ${colors.iconBg}CC, 0 10px 24px -16px rgba(0,0,0,0.7)`,
      }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full sm:h-10 sm:w-10"
        style={{ background: colors.iconBg, boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-[12px] font-extrabold uppercase leading-none tracking-[0.06em]"
          style={{ color: colors.label }}
        >
          {label}
        </span>
        <span className="mt-1.5 block text-[14.5px] font-bold leading-snug text-white">
          {children}
        </span>
      </span>
      {portrait}
    </motion.div>
  );
}

/**
 * The face at the right-hand end of a card, bled past its top and bottom
 * edge — the reference art has these at about a third of the card's width,
 * and letting the portrait overrun the pill rather than sitting inside it is
 * what makes the trail read as a story with a person in it rather than a
 * form with a thumbnail.
 */
function Face({ emotion }: { emotion: BoyEmotion }) {
  return (
    <img
      src={boySpriteForEmotion(emotion)}
      alt=""
      aria-hidden
      draggable={false}
      className="-my-4 h-[92px] w-auto shrink-0 select-none sm:h-[112px]"
      style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
    />
  );
}

/**
 * Chirpy at the end of a card, for the two steps that are not about the
 * child's own face.
 *
 * Step 3 is the sentence the mind produced and step 5 is what the child
 * decided to keep — neither is a feeling, so neither wants the feeling
 * plate. He is drawn smaller than the boy on purpose: the boy is who this
 * happened to, and Chirpy is who was standing next to them.
 */
function ChirpyAt({ pose }: { pose: ChirpyPose }) {
  return (
    <img
      src={chirpySprite(pose)}
      srcSet={chirpySrcSet(pose)}
      sizes="72px"
      alt=""
      aria-hidden
      draggable={false}
      className="-my-3 h-[76px] w-auto shrink-0 select-none sm:h-[92px]"
      style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.34))' }}
    />
  );
}

function Choices({
  tint, ask, options, onPick, target,
}: {
  tint: string;
  ask: string;
  options: string[];
  onPick: (o: string) => void;
  target: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34 }}
      className="flex flex-col gap-2"
    >
      <p className="px-1 text-[14px] font-extrabold" style={{ color: CHROME.text, textShadow: OVER_ART }}>{ask}</p>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onPick(o)}
          className="rounded-[26px] px-4 py-3 text-left text-[14px] font-extrabold leading-snug"
          style={{
            minHeight: target,
            background: PANEL,
            border: `1.5px solid ${tint}`,
            color: CHROME.text,
          }}
        >
          {o}
        </button>
      ))}
    </motion.div>
  );
}

/** The mind's sentence, before it has been turned over. */
function FaceDown({
  tint, label, hint, onTurn, target,
}: {
  tint: string; label: string; hint: string; onTurn: () => void; target: number;
}) {
  return (
    <div className="relative">
      <Connector tint={tint} />
      <button
        onClick={onTurn}
        className="relative ml-3 flex w-full items-center gap-3 rounded-[24px] px-4 py-4 text-left"
        style={{
          minHeight: target,
          background: PANEL,
          border: `2px dashed ${tint}`,
          color: CHROME.text,
        }}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em]" style={{ color: tint }}>
            {label}
          </span>
          <span className="mt-0.5 block text-[13.5px] font-bold" style={{ color: CHROME.textSoft }}>
            {hint}
          </span>
        </span>
      </button>
    </div>
  );
}

/**
 * The mind's sentence with its loudest word picked out.
 *
 * ALWAYS, NEVER, EVERYONE, NOBODY. Not argued with anywhere in this room —
 * just made visible, because a child can learn to HEAR that word years
 * before they can learn to take apart the sentence it is sitting in. See
 * kit/truthLab, where each case names its own.
 */
/**
 * A glass chip in the running sentence, rather than tinted to the card —
 * StoryCard's four backgrounds are each a different hue, and a highlight
 * keyed to `tint` would have needed a fifth colour just for this. White glass
 * reads on any of them.
 */
function Loud({ said, word }: { said: string; word: string }) {
  const at = said.indexOf(word);
  if (at < 0) return <>{said}</>;
  return (
    <>
      {said.slice(0, at)}
      <span
        className="rounded-md px-1"
        style={{ background: 'rgba(255,255,255,0.2)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.4)' }}
      >
        {word}
      </span>
      {said.slice(at + word.length)}
    </>
  );
}

/** One of the other accounts, face down until it is turned. */
function Alternative({
  text, turned, tint, onTurn, target,
}: {
  text: string; turned: boolean; tint: string; onTurn: () => void; target: number;
}) {
  /* Turned, it IS a lit card — no number, because these four are a set
     rather than a sequence — so it is one, rather than a second hand-kept
     copy of the card style that drifts the first time the trail is
     restyled. The card brings its own spring on the way in, which is the
     turn. */
  if (turned) {
    return <LitCard tint={tint} className="ml-3">{text}</LitCard>;
  }

  return (
    <motion.button
      onClick={onTurn}
      whileTap={{ scale: 0.98 }}
      className="ml-3 rounded-[26px] px-4 py-3 text-left"
      style={{
        minHeight: target,
        background: PANEL,
        border: `2px dashed ${tint}`,
        color: CHROME.textSoft,
      }}
    >
      <span className="block text-[13.5px] font-bold">Turn this one over</span>
    </motion.button>
  );
}
