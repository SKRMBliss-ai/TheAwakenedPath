# Door handle plates

Drop the five generated PNGs here, exactly these names:

    01-handle-resting.png
    02-handle-awake.png
    03-threshold-seam.png
    04-handle-pressed.png

All right-facing. The left-hand handle is the same file mirrored in CSS, so
the two cannot drift apart. Transparent background; if the generator gave a
flat magenta (#FF00FF) matte instead, leave it — it gets keyed out on import.

Until these exist, ui/DoorHandle.tsx draws the fitting as SVG. Swapping to
the plates replaces <HandleArt> only; every bit of the behaviour around it
(the seam, the wake-on-approach, the press, the motes, the quiet state)
stays exactly as it is.
