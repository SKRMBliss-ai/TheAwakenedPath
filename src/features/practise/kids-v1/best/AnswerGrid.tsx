import { useState } from 'react';
import { motion } from 'framer-motion';
import { CHROME } from '../ui/chrome';
import * as sound from '../kit/sound';

/**
 * THE FOUR CARDS.
 *
 *   I felt …              I noticed it in my …
 *   My mind said …        What actually happened …
 *      ↑ flips
 *
 * Two columns, because that is what the whole walk has been building
 * towards: the row underneath puts the story the mind wrote directly beside
 * the thing that actually happened, and a child can see both at once without
 * scrolling or remembering. Stacked in one column they're a list of answers;
 * side by side they're a comparison, which is the point.
 *
 * THE LEFT CARD OF THE BOTTOM ROW TURNS OVER. Its front is the mind's story;
 * its back is the other thing that could be true. Same card, same place, same
 * size — one turn of the wrist between them. That is the idea this app
 * exists to teach, and a flip says it better than any sentence could: both
 * are written on the same card, and you get to decide which face is up.
 *
 * Cards appear as they're answered, so the grid fills in during the walk
 * rather than arriving all at once at the end.
 */

export interface GridAnswers {
  feeling?: string;
  body?: string[];
  story?: string;
  eyes?: string;
  other?: string;
}

export function AnswerGrid({ answers, accent }: { answers: GridAnswers; accent: string }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Card
        show={!!answers.feeling}
        eyebrow="I felt"
        value={answers.feeling ?? ''}
        accent={accent}
      />
      <Card
        show={!!answers.body?.length}
        eyebrow="I noticed it in my"
        value={answers.body?.join(', ') ?? ''}
        accent={accent}
      />
      <FlipCard
        show={!!answers.story}
        frontEyebrow="My mind said"
        front={answers.story ?? ''}
        backEyebrow="It could also be"
        back={answers.other}
        accent={accent}
      />
      <Card
        show={!!answers.eyes}
        eyebrow="What actually happened"
        value={answers.eyes ?? ''}
        accent={accent}
      />
    </div>
  );
}

const FACE =
  'flex min-h-[104px] flex-col justify-center rounded-[18px] px-3.5 py-3 backdrop-blur-md';

function Card({
  show, eyebrow, value, accent,
}: {
  show: boolean; eyebrow: string; value: string; accent: string;
}) {
  if (!show) return <EmptySlot />;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className={FACE}
      style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}` }}
    >
      <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {eyebrow}
      </p>
      <p className="mt-1 text-[14px] font-extrabold leading-snug" style={{ color: CHROME.text, textWrap: 'balance' }}>
        {value}
      </p>
    </motion.div>
  );
}

/**
 * A slot that hasn't been answered yet. Deliberately almost invisible — it
 * holds the grid's shape so cards don't jump around as they arrive, without
 * looking like four blanks a child is behind on filling in.
 */
function EmptySlot() {
  return (
    <div
      className="min-h-[104px] rounded-[18px]"
      style={{ border: '1px dashed rgba(255,255,255,0.10)' }}
    />
  );
}

function FlipCard({
  show, frontEyebrow, front, backEyebrow, back, accent,
}: {
  show: boolean;
  frontEyebrow: string;
  front: string;
  backEyebrow: string;
  /** Undefined until the child has answered "what else could be true?". */
  back?: string;
  accent: string;
}) {
  const [flipped, setFlipped] = useState(false);
  if (!show) return <EmptySlot />;

  const canFlip = !!back;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      onClick={() => {
        if (!canFlip) return;
        sound.play('roomCard');
        setFlipped((f) => !f);
      }}
      aria-label={canFlip ? 'Turn the card over' : undefined}
      className="relative min-h-[104px] text-left"
      style={{ perspective: 900, cursor: canFlip ? 'pointer' : 'default' }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      >
        {/* Front — what the mind said. */}
        <div
          className={FACE}
          style={{
            background: CHROME.pill,
            border: `1px solid ${canFlip ? `${accent}88` : CHROME.pillBorder}`,
            backfaceVisibility: 'hidden',
          }}
        >
          <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em]" style={{ color: accent }}>
            {frontEyebrow}
          </p>
          <p className="mt-1 text-[14px] font-extrabold leading-snug" style={{ color: CHROME.text, textWrap: 'balance' }}>
            {front}
          </p>
          {canFlip && <TurnHint accent={accent} />}
        </div>

        {/* Back — the other thing that could be true. Same shape, same size,
            warmer light. Not marked as the better one; just the other face. */}
        <div
          className={`absolute inset-0 ${FACE}`}
          style={{
            background: `linear-gradient(160deg, ${accent}2E, rgba(255,255,255,0.08))`,
            border: `1px solid ${accent}88`,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em]" style={{ color: accent }}>
            {backEyebrow}
          </p>
          <p className="mt-1 text-[14px] font-extrabold leading-snug" style={{ color: CHROME.text, textWrap: 'balance' }}>
            {back}
          </p>
          <TurnHint accent={accent} />
        </div>
      </motion.div>
    </motion.button>
  );
}

/** A small nudge that the card has another side. Never a word of instruction. */
function TurnHint({ accent }: { accent: string }) {
  return (
    <motion.span
      aria-hidden
      className="absolute bottom-2 right-2.5 text-[13px] font-extrabold"
      style={{ color: accent }}
      animate={{ opacity: [0.45, 1, 0.45], rotate: [0, 12, 0] }}
      transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
    >
      ⤾
    </motion.span>
  );
}
