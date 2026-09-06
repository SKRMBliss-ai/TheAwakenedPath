import { DraggableJar } from './DraggableJar';

/**
 * TONIGHT'S JAR — out of the catch screen and into the hub.
 *
 * It only ever existed inside the half-second after a tick: a child saw
 * their lights, and then the one object that holds the whole evening was
 * gone until the next one. Now it stands at the foot of the door that
 * fills it (see below), and the drag-anywhere, tap-to-glitter mechanic
 * lives in DraggableJar, shared with the Observatory's lifetime jar.
 *
 * IT GOES HOME TO ITS OWN DOOR. Unmoved, it sits at the foot of the
 * fireflies handle on the right wall, so the jar and the door that fills
 * it read as one thing rather than two unrelated bits of furniture. A
 * child who drags it to the middle of the floor has said otherwise, and
 * that sticks — across rooms, and across days.
 */

/** Small. It is furniture on the wall, not the subject of the screen. */
const SIZE = 60;

/**
 * Where the fireflies door hangs, in vh — must match the `bottomVh` on the
 * first DoorHandle in BestApp's DoorWall. The jar parks below it.
 */
const DOOR_VH = 20;

/**
 * Directly UNDER the fireflies handle, in the right-hand gutter the room
 * cards already leave clear (the hub pads itself to 74px for exactly this).
 * The handle's own bottom edge is DOOR_VH up the wall, so the jar's TOP
 * starts there and it hangs below — level with it put the two objects on
 * top of each other, which is how the first version of this went.
 */
function homePerch(room: { w: number; h: number }) {
  return {
    x: Math.max(0, room.w - SIZE - 8) / room.w,
    y: Math.min(room.h - SIZE * 1.28 - 4, room.h - (room.h * DOOR_VH) / 100 + 6) / room.h,
  };
}

export function FloatingJar({ caught }: { caught: string[] }) {
  return (
    <DraggableJar
      id="hub"
      caught={caught}
      size={SIZE}
      home={homePerch}
      ariaLabel={(n) => (n
        ? `Your firefly jar, holding ${n}. Tap it. Drag to move it.`
        : 'Your firefly jar. Tap it. Drag to move it.')}
    />
  );
}
