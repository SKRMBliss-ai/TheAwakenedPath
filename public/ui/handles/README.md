# Door handle plates

`handle.webp` — the rendered brass fitting, alpha-trimmed to its bounding box
and scaled to 460px. Drawn for the LEFT wall: the rose is at the left and the
lever sweeps inward, into the room. The right-hand fitting is this same file
mirrored in CSS, so the two cannot drift apart.

`seam.webp` — the threshold light, alpha-trimmed, 140px wide. Sat mostly off
the screen edge and blurred, so what shows is the outer falloff rather than
the bright core.

There is deliberately no separate "awake" plate. The generated one came back
with a wooden door baked into it and no alpha, so cross-fading the two would
have jumped; the awake look is driven from these same pixels with a CSS
filter instead, which keeps the geometry identical for free.

Sources live in `src/assets/the handle, *.png`. Regenerate with:

    ffmpeg -i "src/assets/the handle, resting.png" \
      -vf "crop=1205:716:30:239,scale=460:-1" \
      -c:v libwebp -pix_fmt yuva420p -quality 92 public/ui/handles/handle.webp
