# Feeling companions

The boy and Chirpy wearing each feeling, cut out of the uploads in
`src/assets/*.jpg` and served from here. See `kit/feelingCompanions.ts` for
what each one is allowed to say.

## How they were cut

The sources arrived as JPGs with their transparency already flattened —
seven onto black, four onto the checkerboard pattern a transparent PNG
shows in an image viewer. Neither is keyable by colour alone: the black
images share their black with the boy's hair, and the checkerboard ones
share near-white with his T-shirt.

So the background is removed by flood-filling inward from the border. Only
what is CONNECTED to the edge goes, which keeps the shirt (inside the
silhouette, unreachable from outside) and keeps the hair. The alpha is then
eroded a pixel and feathered, so no ring of old background survives as a
halo.

`Anxtiety overthinking.jpg` and `grief.jpg` are landscape (1280x1067); the
other nine are portrait (1067x1280). Check the dimensions before re-cutting
— reading a portrait buffer as landscape silently produces garbage rather
than an error.

## The two late additions

`excited.webp` is not from the same batch. There was no excited plate in the
uploads at all, and it is one of the six balls a child can pop — so it is cut
from the hub artwork (`assets/home/boy@640.webp`), framed chest-up at 420x504
to match the rest of the row. Same boy, same cap, same Chirpy; keen rather
than serene, which is the whole reason the calm-happy plate could not stand
in for it.

`angry.webp` came with the batch but shipped unused: the flood-fill had left
a wedge of un-keyed checkerboard between Chirpy's shoulder and the boy's jaw,
where the background is fully enclosed by the silhouette and so was never
reachable from the border. That region is cleared by colour inside a fixed
box (opaque, near-neutral, light) plus two erosion passes for the halo. If
this plate is ever re-cut from source, check that wedge before shipping.
