# .well-known

Domain-verification files that payment providers and Apple require to be served
from the site root over HTTPS, unredirected.

Expected here:

- `apple-developer-merchantid-domain-association` — Apple Pay domain
  verification. Razorpay issues this file when you register skrmblissai.in
  under Payment Methods → Apple Pay. Drop it in as-is: no extension, no
  reformatting, no trailing newline changes.

Note: `firebase.json` ignores dotfiles via `**/.*`, which would silently strip
this whole directory from every deploy. The `!**/.well-known/**` negation right
after it is what keeps these files deployable — don't remove it.
