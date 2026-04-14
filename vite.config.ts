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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB to accommodate large bundles
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}']
      },
      manifest: {
        name: 'Awakened Path',
        short_name: 'AwakenedPath',
        description: 'Your journey to mindfulness and joy',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'pwa-512x512.webp',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
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
