import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
// @ts-expect-error — plain .mjs, shared with scripts/ and deliberately untyped
import { parseTeachingMoves } from './scripts/parseTeachingMoves.mjs'

/**
 * CHIRPY'S TEACHING LINES COME OUT OF THE DOCUMENT, NOT OUT OF THE CODE.
 *
 * They used to be eighteen hand-transcribed objects in kit/teachings.ts, which
 * made MIND_GYM_TEACHING_MOVES.md a thing somebody had copied FROM once. The
 * founder edits the document; the app carries on saying the old words; nothing
 * reports the drift. Adding a nineteenth move meant editing TypeScript.
 *
 * This serves the parsed document as a module instead. Write a new numbered
 * section with a `### The move` under it and Chirpy starts saying it — the dev
 * server hot-reloads on save (the file is added as a watch dependency) and the
 * production build reads it fresh.
 *
 * IT FAILS THE BUILD ON A SECTION IT CANNOT READ. A parser that quietly skipped
 * a malformed move would mean a teaching the founder has written, and believes
 * is live, that no child ever meets.
 */
const TEACHING_MOVES_DOC = 'docs/source-material/mind-gym-claude-code-kit/kit/reference/MIND_GYM_TEACHING_MOVES.md'

function teachingMoves(): import('vite').Plugin {
  const virtualId = 'virtual:teaching-moves'
  const resolvedId = '\0' + virtualId
  return {
    name: 'mind-gym-teaching-moves',
    resolveId: (id) => (id === virtualId ? resolvedId : null),
    load(id) {
      if (id !== resolvedId) return null
      const path = resolve(process.cwd(), TEACHING_MOVES_DOC)
      const { teachings, asides, problems } = parseTeachingMoves(readFileSync(path, 'utf8'))
      if (problems.length) {
        this.error(`Teaching moves document:\n  - ${problems.join('\n  - ')}`)
      }
      // Named in the log so nothing in the document is ever silently dropped.
      const skipped = asides.map((a: { number: number; title: string }) => `§${a.number} ${a.title}`).join(', ')
      this.info?.(`${teachings.length} teaching moves${skipped ? `; asides: ${skipped}` : ''}`)
      this.addWatchFile(path)
      return `export const TEACHINGS = ${JSON.stringify(teachings)};\n`
        + `export const ASIDES = ${JSON.stringify(asides)};\n`
    },
  }
}

// In production, /twinsouls is a real static directory (the Twin Souls
// portfolio, built separately and copied into dist/). The dev server has no
// such directory, so Vite's SPA fallback answered /twinsouls with the Mind Gym
// shell — clicking "About Us" locally opened Mind Gym instead of the portfolio.
// Redirect to the portfolio's own dev server so local behaviour matches live.
const twinsoulsDevRedirect = {
  name: 'twinsouls-dev-redirect',
  apply: 'serve' as const,
  configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
    server.middlewares.use((req, res, next) => {
      const url: string = req.url || '';
      if (/^\/twinsouls(\/|$|\?)/.test(url)) {
        res.statusCode = 302;
        res.setHeader('Location', 'http://localhost:5174/');
        res.end();
        return;
      }
      next();
    });
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    teachingMoves(),
    twinsoulsDevRedirect,
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Only list files that actually exist in /public — VitePWA precache will fail
      // (or silently 404 in offline mode) on missing assets. Sacred-bg files removed
      // because they're no longer present in /public.
      // logo.png was removed here when the unused 613KB public/logo.png was
      // deleted — it was referenced by nothing in src, index.html or the web
      // manifest, but WAS still listed here. Leaving a non-existent file in
      // includeAssets is exactly what the note above warns about: the entry
      // lands in the precache manifest and then 404s for anyone still running
      // the older service worker.
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        // /twinsouls is a separate app (the Twin Souls portfolio) served from
        // this same hosting under a subpath — never precache its bundle into the
        // Mind Gym service worker (keeps the SW lean, respects mobile-load).
        // /kids-adventure is the same kind of thing: a static hub plus the Art
        // Adventure app, one ~300KB single-file page that has no business in
        // the Mind Gym precache.
        // assets/home/*.png are the full-resolution design sources for the Mind
        // Gym hub (1024–1536px, 1–2MB each). What the app actually loads is the
        // resized .webp beside them; precaching the sources as well would put
        // ~15MB of pictures nobody requests onto a child's phone.
        // assets/gym/**/*.png is the same story and worse: the Chirpy character
        // sheet alone is 21 PNGs and 30MB. The app loads the cut sprites in
        // public/chirpy (~30KB each) — see kids-v1/ui/sprites. Keep the sources
        // in the repo, keep them out of the service worker.
        globIgnores: [
          'twinsouls/**',
          'habitquest2026/**',
          'kids-adventure/**',
          'assets/home/*.png',
          'assets/gym/**/*.png',
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Navigations are NETWORK-FIRST, not cache-first. This is a correctness
        // requirement, not a performance tweak.
        //
        // This used to be `navigateFallback: '/index.html'`, which registers a
        // NavigationRoute bound to the PRECACHED shell — i.e. cache-first. Every
        // navigation by a returning visitor was answered entirely from the
        // service worker's precache: the old index.html, referencing the old
        // content-hashed JS chunks, also from precache. The network was never
        // consulted. A new service worker would install in the background and
        // (via skipWaiting/clientsClaim) take control, but the page already
        // rendered was the old bundle, and nothing reloaded it — `registerType:
        // 'autoUpdate'` only auto-reloads when the app imports
        // `virtual:pwa-register`, which it does not; the generated registerSW.js
        // is a bare navigator.serviceWorker.register() with no update handling.
        //
        // So a shipped fix stayed invisible to anyone who had visited before,
        // indefinitely, until they happened to hard-reload. That is how a buyer
        // who had already been to the sales page went through checkout on the
        // pre-fix bundle hours after the currency fix was live, and was charged
        // in INR on an overseas card again, while a first-time visitor (no
        // service worker installed, so the navigation hit the network) got the
        // fixed bundle and paid successfully.
        //
        // NetworkFirst inverts that: the shell — a few KB — is fetched fresh
        // whenever the network answers within the timeout, so a returning
        // visitor runs current code on their FIRST navigation, with no reload
        // and no risk of a forced refresh mid-checkout. The content-hashed
        // assets it references are immutable and stay precache-first, so this
        // costs one small conditional request, not a cold load. precacheFallback
        // serves the precached shell when the network is slow or absent, which
        // keeps offline and sub-route navigation working exactly as before.
        //
        // The urlPattern carries what navigateFallbackDenylist used to: /api
        // (Cloud-Function rewrites), /twinsouls, /habitquest2026 and
        // /kids-adventure (separate
        // apps on this host — they must reach the network, not the Mind Gym
        // shell), and /.well-known (domain-verification files such as Apple
        // Pay's, which must be the real file rather than the app shell). Those
        // paths match no route at all and go straight to the network.
        // vite-plugin-pwa defaults navigateFallback to 'index.html' when the key
        // is absent, which re-registers the cache-first NavigationRoute ahead of
        // the route below (and without the denylist). Set it explicitly to
        // undefined so no such route is generated and navigations reach the
        // NetworkFirst handler.
        navigateFallback: undefined,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }: { request: Request; url: URL }) =>
              request.mode === 'navigate' &&
              !/^\/(?:api\/|twinsouls|habitquest2026|kids-adventure|\.well-known\/)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-shell',
              networkTimeoutSeconds: 4,
              precacheFallback: { fallbackURL: '/index.html' },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Mind Gym',
        short_name: 'Mind Gym',
        description: 'Your daily practice for a quieter mind',
        // Installed app opens the Mind Gym app, not the Soulful Intelligence home.
        start_url: '/mindgym',
        scope: '/',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    target: ['es2015', 'chrome60', 'safari12', 'ios12', 'firefox60'],
    cssTarget: ['chrome60', 'safari12', 'ios12', 'firefox60'],
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Only split vendor libraries — splitting app code causes circular dependency errors
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://us-central1-awakened-path-2026.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => {
          if (path.startsWith('/api/voice')) return '/textToSpeech';
          if (path.startsWith('/api/witness')) return '/witnessPresence';
          if (path.startsWith('/api/grounding')) return '/getGrounding';
          if (path.startsWith('/api/emotion')) return '/analyzeEmotion';
          if (path.startsWith('/api/daily-meditation')) return '/getDailyMeditation';
          if (path.startsWith('/api/latest-videos')) {
            // Preserve ?max=… — without the query the endpoint returns its default.
            const qIndex = path.indexOf('?');
            return '/getLatestVideos' + (qIndex >= 0 ? path.slice(qIndex) : '');
          }
          if (path.startsWith('/api/razorpay-subscription-verify')) return '/verifyRazorpaySubscription';
          if (path.startsWith('/api/razorpay-subscription')) return '/createRazorpaySubscription';
          if (path.startsWith('/api/razorpay-order')) return '/createRazorpayOrder';
          if (path.startsWith('/api/razorpay-verify')) return '/verifyRazorpayPayment';
          if (path.startsWith('/api/playlist-videos')) {
            // Preserve the query string (?playlistId=...) — dropping it made the
            // function 400 with "playlistId is required" in local dev.
            const qIndex = path.indexOf('?');
            return '/getPlaylistVideos' + (qIndex >= 0 ? path.slice(qIndex) : '');
          }
          return path.replace(/^\/api/, '');
        }
      }
    }
  }
})
