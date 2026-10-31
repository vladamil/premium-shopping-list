/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Makes the app work offline: on `npm run build` it writes dist/sw.js,
    // a service worker that saves every app file on the first visit.
    // It does not run during `npm run dev`.
    VitePWA({
      // Use our own public/manifest.webmanifest (don't make a second one).
      manifest: false,
      // A new version waits until the user says "reload" (no surprise swaps).
      registerType: 'prompt',
      workbox: {
        // Which built files to save for offline: code, styles, the page,
        // the logo, the icons, the manifest and the fonts (woff2).
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    // Run tests in a fake browser (jsdom), so components have a page to draw on.
    environment: 'jsdom',
    // Runs before every test file: extra checks + stand-ins (see the file).
    setupFiles: ['src/test/setup.ts'],
  },
});
