/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    // Run tests in a fake browser (jsdom), so components have a page to draw on.
    environment: 'jsdom',
    // Runs before every test file: extra checks + stand-ins (see the file).
    setupFiles: ['src/test/setup.ts'],
  },
});
