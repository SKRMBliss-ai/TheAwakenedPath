import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Only list files that actually exist in /public — VitePWA precache will fail
      // (or silently 404 in offline mode) on missing assets. Sacred-bg files removed
      // because they're no longer present in /public.
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: 'The Awakened Path',
        short_name: 'AwakenedJournal',
        description: 'Your journey into the seat of the witness',
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
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('@google-cloud') || id.includes('text-to-speech')) return 'vendor-gcp';
            return 'vendor';
          }
          // Split heavy app features into separate chunks loaded on demand
          if (id.includes('features/courses')) return 'feature-courses';
          if (id.includes('features/stats')) return 'feature-stats';
          if (id.includes('features/music')) return 'feature-music';
          if (id.includes('features/admin')) return 'feature-admin';
          if (id.includes('features/journal')) return 'feature-journal';
          if (id.includes('features/practices')) return 'feature-practices';
          if (id.includes('features/breath')) return 'feature-breath';
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
          if (path.startsWith('/api/razorpay-subscription-verify')) return '/verifyRazorpaySubscription';
          if (path.startsWith('/api/razorpay-subscription')) return '/createRazorpaySubscription';
          if (path.startsWith('/api/razorpay-order')) return '/createRazorpayOrder';
          if (path.startsWith('/api/razorpay-verify')) return '/verifyRazorpayPayment';
          return path.replace(/^\/api/, '');
        }
      }
    }
  }
})
