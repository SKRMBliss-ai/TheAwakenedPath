import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { CHROME, FONT, GrownUpExit } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { Chirpy, RoomScene } from '../ui/scene';
import { useMotion } from '../ui/quiet';
import { DIM } from '../ui/scenery';
import { getRoom } from '../rooms';
import { CARD_FACE, CARD_INK, LitCard, StepHead, UnderNote } from '../ui/trail';
import { nextStoryCase, storyCaseDone, type StoryBit } from '../kit/differentStory';
import * as sound from '../kit/sound';

/**
 * THE DIFFERENT STORY ROOM.
 *
 * It runs the two teaching moves that belong to the sign on its dome —
 * §10, the camera test, and §11, more than one story fits (kit/differentStory
 * carries both, and the founder's document has the reasoning).
 *
 * WHY IT IS A TRAIL NOW. This room used to be three beats that replaced one
 * another: sort the bits, then turn over the other accounts, then choose. Each
 * beat was well made and each one wiped the last one off the screen — which
 * meant that at the moment a child was asked "so which one's true?", the two
 * piles that make the question interesting were three screens ago and existed
 * only in their memory. The whole point of §10 is the PICTURE of two short
 * lists made of different stuff, and the room was showing it and then taking
 * it away before it could do any work.
 *
 * So nothing is cleared any more. The trail builds down the page — what
 * happened, what the camera got, what the mind added, the account it went
 * with, the four that also fit, and the one being carried out — and by the
 * end it is all on screen at once, in order. Same five-card grammar as the
 * Truth Lab, same shared pieces in ui/trail, so a child who has learnt one
 * room can read the other.
 *
 * NOTHING A CHILD DOES IN HERE IS WRONG. Put "they're cross with me" in the
 * camera pile and the room asks where they'd point it, watches them fail to
 * answer, and moves the card across itself. That is the entire lesson, and it
 * is a better version of it than getting it right first time would have been.
 *
 * AND IT LANDS ON "WE DON'T KNOW", which is the honest answer and the one the
 * document insists on. The mind's own account is on the final list, looks
 * exactly like the others, and taking it home is a complete answer.
 */

/** Warm to cool and back, so no two neighbours share a colour. */
const STEP_TINT = ['#7FC7F0', '#A971E8', '#4FBF87', '#FFC65C'] as const;

export function DifferentStoryRoom({
  onExit,
  onGrownUp,
}: {
  onExit: () => void;
  onGrownUp: () => void;
}) {
  const m = useMotion();
  const awardPoints = useKidStore((s) => s.awardPoints);
  const art = getRoom('story');
  const accent = art.palette.accent;

  /* Fixed for the life of the visit. A memo rather than state so a re-render
     can't swap the situation under a child halfway through sorting it. */
  const kase = useMemo(() => nextStoryCase(), []);

  /** Which bits have been placed, and where they ended up. */
  const [placed, setPlaced] = useState<Record<string, 'camera' | 'mind'>>({});
  /** What Chirpy said about the last card placed. */
  const [reply, setReply] = useState<string | null>(null);
  /** Which of the other accounts have been turned over. */
  const [turned, setTurned] = useState<string[]>([]);
  /** The one they're taking with them, if they've said. */
  const [carrying, setCarrying] = useState<string | null>(null);

  const unplaced = kase.bits.filter((b) => !placed[b.text]);
  const card: StoryBit | undefined = unplaced[0];
  const cameraPile = kase.bits.filter((b) => placed[b.text] === 'camera');
  const mindPile = kase.bits.filter((b) => placed[b.text] === 'mind');
  const sorted = unplaced.length === 0;
  const allTurned = turned.length >= kase.others.length;

  const place = (bit: StoryBit, said: 'camera' | 'mind') => {
    sound.play('tap');
    /* The card always ends up where it belongs. What changes is what Chirpy
       says on the way — agreement, or the camera question, which a child
       cannot answer and is not meant to. */
    setPlaced((p) => ({ ...p, [bit.text]: bit.camera ? 'camera' : 'mind' }));
    setReply(
      bit.camera === (said === 'camera')
        ? (bit.camera ? 'Click. Got it.' : 'Yep. That one lives in here.')
        : (bit.camera
            ? 'Careful — the camera did get that one. It really happened.'
            : 'Go on then, point a camera at that. Where would you even aim it? There’s nothing out there to point at. That bit happened in here.'),
    );
  };

  const turn = (other: string) => {
    if (turned.includes(other)) return;
    sound.play('roomCard');
    setTurned((t) => [...t, other]);
  };

  const carry = (o: string) => {
    sound.play('miniWin');
    setCarrying(o);
    storyCaseDone(kase.id);
    /* Unattributed on purpose — this is not one of the seven virtues and its
       points must not land in any of their totals. */
    awardPoints(12);
  };

  const line =
    !sorted ? (reply ?? 'Pretend you’ve got a camera. Point it at what happened.')
    : !allTurned ? (turned.length === 0
        ? 'Your mind picked that one in about a tenth of a second and then stopped looking. Have a look underneath.'
        : 'Keep going. They all fit the same footage.')
    : !carrying ? 'So which one’s true? …We don’t know. That’s the interesting bit.'
    : 'Right. Off you go.';

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <DoorHandle side="left" label="Back" onClick={onExit} accent={accent} />
      <RoomScene room={art} dim={DIM.content} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-end p-3 sm:p-4">
        <div className="pointer-events-auto"><GrownUpExit onClick={onGrownUp} /></div>
      </div>

      {/* Left gutter for the door handle — see the same note in TruthLabRoom. */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[30rem] flex-col gap-3 pb-28 pl-[72px] pr-4 pt-16 sm:px-5">
        <p
          className="max-w-[16rem] text-[19px] font-extrabold leading-[1.16]"
          style={{ color: CHROME.text, transform: 'rotate(-2.5deg)', textWrap: 'balance' }}
        >
          What happened, and what your
          <span style={{ color: accent }}> mind added…</span>
        </p>

        <Chirpy pose={carrying ? 'excited' : 'curious'} line={line} align="left" />

        {/* The situation. Not a step — it's what every step is about. */}
        <div
          className="rounded-[20px] px-4 py-3.5"
          style={{ background: 'rgba(10,6,22,0.6)', border: `1px solid ${accent}44` }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: accent }}>
            What happened
          </p>
          <p className="mt-1 text-[15px] font-bold leading-snug" style={{ color: CHROME.text }}>
            {kase.scene}
          </p>
        </div>

        {/* ── 1 · The camera test ───────────────────────────────────────
            One card at a time, and both piles building underneath it.
            Those two lists ARE §10 — the move is not "answer correctly",
            it is being able to see, at a glance, that the two piles are
            made of different stuff. So they stay on the page. */}
        <StepHead n={1} tint={STEP_TINT[0]} label={sorted ? 'What the camera got' : 'Which bits did the camera get?'} />

        <AnimatePresence mode="wait">
          {card && (
            <motion.div
              key={card.text}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.26 }}
              className="ml-3 rounded-[22px] px-4 py-5 text-center"
              style={{ background: CARD_FACE, border: `2px solid ${STEP_TINT[0]}` }}
            >
              <p className="text-[16px] font-extrabold leading-snug" style={{ color: CARD_INK }}>
                “{card.text}”
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {card && (
          <div className="ml-3 grid grid-cols-2 gap-2.5">
            <SortButton
              icon={<Camera size={19} strokeWidth={2.4} />}
              label="The camera saw it"
              accent={STEP_TINT[0]}
              onClick={() => place(card, 'camera')}
              minHeight={m.target}
            />
            <SortButton
              icon={<Sparkles size={19} strokeWidth={2.4} />}
              label="That bit’s in my head"
              accent={STEP_TINT[1]}
              onClick={() => place(card, 'mind')}
              minHeight={m.target}
            />
          </div>
        )}

        {(cameraPile.length > 0 || mindPile.length > 0) && (
          <div className="ml-3 grid grid-cols-2 gap-2.5">
            <Pile title="The camera got" hue={STEP_TINT[0]} items={cameraPile.map((b) => b.text)} />
            <Pile title="Added in here" hue={STEP_TINT[1]} items={mindPile.map((b) => b.text)} />
          </div>
        )}

        {/* ── 2 · The account the mind went with ───────────────────────
            Named as the FIRST one rather than the wrong one, and it gets
            exactly the same card as the four below it. */}
        {sorted && (
          <LitCard n={2} tint={STEP_TINT[1]} label="What your mind went with">
            {kase.minds}
          </LitCard>
        )}

        {/* ── 3 · What else fits ──────────────────────────────────────── */}
        {sorted && (
          <div className="flex flex-col gap-2">
            <StepHead n={3} tint={STEP_TINT[2]} label="What else would fit" />
            <UnderNote>Not nicer ones. Just ones that fit everything the camera got.</UnderNote>
            {kase.others.map((o) => (
              <Alternative
                key={o}
                text={o}
                turned={turned.includes(o)}
                tint={STEP_TINT[2]}
                onTurn={() => turn(o)}
                target={m.target}
              />
            ))}
            {allTurned && (
              <UnderNote>
                Five accounts of the same thing, and every one of them fits. We don’t actually know —
                and neither did your mind. It just picked fast and showed you one.
              </UnderNote>
            )}
          </div>
        )}

        {/* ── 4 · The one you're taking ────────────────────────────────
            Every account is on this list, the mind's included, and picking
            it is a perfectly good answer. Nothing records which. */}
        {allTurned && !carrying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34 }}
            className="flex flex-col gap-2"
          >
            <StepHead n={4} tint={STEP_TINT[3]} label="Which are you taking with you" />
            {[kase.minds, ...kase.others].map((o) => (
              <button
                key={o}
                onClick={() => carry(o)}
                className="ml-3 rounded-[18px] px-4 py-3 text-left text-[14px] font-extrabold leading-snug"
                style={{
                  minHeight: m.target,
                  color: CHROME.text,
                  background: 'rgba(255,255,255,0.07)',
                  border: `1.5px solid ${STEP_TINT[3]}77`,
                }}
              >
                {o}
              </button>
            ))}
          </motion.div>
        )}

        {carrying && (
          <LitCard n={4} tint={STEP_TINT[3]} label="Taking this one" glow>
            {carrying}
          </LitCard>
        )}

        {carrying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex flex-col gap-2"
          >
            <UnderNote>
              You don’t have to believe it. You just have to know your mind had options and only
              showed you one.
            </UnderNote>
            <button
              onClick={() => { sound.play('exitRoom'); onExit(); }}
              className="w-full rounded-full px-4 py-3.5 text-[14.5px] font-extrabold"
              style={{
                minHeight: m.target,
                background: `${accent}1F`,
                border: `1.5px solid ${accent}`,
                color: CHROME.text,
              }}
            >
              Out you go
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** One of the two places a card can go. */
function SortButton({
  icon, label, accent, onClick, minHeight,
}: {
  icon: React.ReactNode; label: string; accent: string; onClick: () => void; minHeight: number;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-[18px] px-2 py-3 text-center"
      style={{
        minHeight,
        background: `${accent}1A`,
        border: `1px solid ${accent}77`,
        color: CHROME.text,
      }}
    >
      <span style={{ color: accent }}>{icon}</span>
      <span className="text-[12.5px] font-extrabold leading-tight">{label}</span>
    </motion.button>
  );
}

/**
 * One of the two piles, building up as the child sorts.
 *
 * This is the picture §10 is actually trying to leave behind: two short lists,
 * both of them true, made of visibly different stuff. It is deliberately not a
 * score — neither pile is the good one, and nothing here says how many.
 */
function Pile({ title, hue, items }: { title: string; hue: string; items: string[] }) {
  return (
    <div
      className="rounded-[16px] px-3 py-2.5"
      style={{ background: `${hue}14`, border: `1px solid ${hue}55` }}
    >
      <p className="text-[10.5px] font-extrabold uppercase tracking-[0.1em]" style={{ color: hue }}>
        {title}
      </p>
      <ul className="mt-1 flex flex-col gap-1">
        {items.map((t) => (
          <li key={t} className="text-[12px] font-bold leading-snug" style={{ color: CHROME.text }}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One of the other accounts, face down until it is turned. */
function Alternative({
  text, turned, tint, onTurn, target,
}: {
  text: string; turned: boolean; tint: string; onTurn: () => void; target: number;
}) {
  return (
    <motion.button
      onClick={onTurn}
      whileTap={turned ? undefined : { scale: 0.98 }}
      className="ml-3 rounded-[18px] px-4 py-3 text-left"
      style={{
        minHeight: target,
        background: turned ? CARD_FACE : 'rgba(255,255,255,0.06)',
        border: turned ? `2px solid ${tint}` : `2px dashed ${tint}77`,
        boxShadow: turned ? `0 0 18px -10px ${tint}` : 'none',
        cursor: turned ? 'default' : 'pointer',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {turned ? (
          <motion.span
            key="face"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28 }}
            className="block text-[14px] font-extrabold leading-snug"
            style={{ color: CARD_INK }}
          >
            {text}
          </motion.span>
        ) : (
          <motion.span
            key="down"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block text-[13.5px] font-bold"
            style={{ color: CHROME.textSoft }}
          >
            Turn this one over
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
