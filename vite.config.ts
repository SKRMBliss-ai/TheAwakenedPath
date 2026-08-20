import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

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
        globIgnores: ['twinsouls/**', 'habitquest2026/**'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Serve the app shell for ALL in-app navigations (/, /aboutmindgym,
        // /knowyouremotionalhealth, …) so the service worker doesn't error on
        // sub-routes. Exclude the Cloud-Function API rewrites, /twinsouls
        // (its own app — must reach the network, not the Mind Gym shell), and
        // /.well-known (domain-verification files like Apple Pay's — a browser
        // that already has the service worker installed and navigates there
        // directly must get the real file, not the app shell; this doesn't
        // affect Apple's own verification, which fetches server-side with no
        // service worker involved, but a stale/misleading 404 during manual
        // testing isn't worth leaving in).
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/twinsouls/, /^\/habitquest2026/, /^\/\.well-known\//],
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
