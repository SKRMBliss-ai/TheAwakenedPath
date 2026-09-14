# Room mockups

Design references, not app assets. They live here rather than in `public/`
because that folder ships: all thirteen of these were sitting in
`public/assets/gym/rooms`, which put 15MB of mockup into every build and
onto every phone that installed the app.

Nothing here can be used directly. The card designs
(`he feels.png`, `his mind said.png`, and the rest) have their text baked
into the image, and the whole point of those cards is that they carry what a
particular child said on a particular evening. They are drawn in code
instead — see `best/TruthLabRoom.tsx`, which follows this artwork closely:
lit cream pill, numbered bead on the shoulder, label in caps, the child's own
face on the right.

One thing did come out of here as a real asset. The star handle at the
top-left of `door handles.png` is cut to `public/ui/handles/star@220.webp`
and `@440.webp`, and is now the door fitting in every room.
