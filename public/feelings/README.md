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

## Gap

There is no `excited` plate. It is one of the six balls a child can pop, so
that answer currently gets no companion. Falling back to the calm-happy
plate would put a serene face on an answer that wasn't serene, which is
worse than showing nothing.
