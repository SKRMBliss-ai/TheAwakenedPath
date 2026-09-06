import { DraggableJar } from './DraggableJar';

/**
 * EVERY FIREFLY THIS CHILD HAS EVER CAUGHT.
 *
 * best/FloatingJar shows tonight's, parked at its own door on the hub. This
 * one lives in the Reflection Observatory — the one room that already talks
 * about the whole picture rather than one day (see ReflectionRoom's own doc
 * comment). The month grid there says WHEN; this says HOW MANY, ever, all
 * added up. Same object, same bargain as the hub's jar and the companion:
 * draggable, and wherever it's dropped is where it stays.
 *
 * DENSE, because sparse mode can only show one light per virtue, and a
 * lifetime tally is exactly the number that can't be drawn that way — the
 * whole point of taking it out of the daily catch screen is that it's
 * allowed to hold more than seven. See FireflyJar's own note on how a
 * swarm past forty lights is capped without ever lying about the total —
 * the true count is what a tap flies out.
 *
 * ITS HOME IS THE TOP-RIGHT CORNER, not a door — this room doesn't have a
 * fireflies handle to sit under the way the hub does. Clear of the exit
 * fitting on the left wall and of the grid once the page scrolls under it.
 */
const SIZE = 76;

/**
 * 130px down rather than tucked right under the top edge — the flown count
 * (DraggableJar's FlyingCount) travels about 80px above the jar's own top
 * on a tap, and starting any higher clipped it against the top of the
 * viewport before the number had finished announcing itself.
 */
function homePerch(room: { w: number; h: number }) {
  return {
    x: Math.max(0, room.w - SIZE - 10) / room.w,
    y: 130 / room.h,
  };
}

export function LifetimeJar({ caught }: { caught: string[] }) {
  return (
    <DraggableJar
      id="observatory"
      caught={caught}
      size={SIZE}
      dense
      home={homePerch}
      sparkleBloom={128}
      sparkleSpread={0.7}
      ariaLabel={(n) => (n
        ? `Every firefly you've ever caught — ${n} of them. Tap it. Drag to move it.`
        : 'Your firefly jar, waiting for the first one. Drag to move it.')}
    />
  );
}
