// Runs before every test file (see `setupFiles` in vite.config.ts).

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Adds checks like expect(button).toHaveAttribute('aria-pressed', 'true')
// and expect(text).toBeInTheDocument() — that's the jest-dom import above.

// After every test: remove what was drawn and forget the saved data,
// so each test starts with an empty page and empty storage.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Stand-ins for browser features that jsdom (the fake browser) doesn't have.
// The app uses them, so without these the tests would crash.
// ---------------------------------------------------------------------------

// matchMedia — useApplyTheme asks "is the phone in dark mode?".
// The stand-in always answers "no" (light mode) and ignores listeners.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }) as unknown as MediaQueryList;

// <dialog>.showModal() / .close() — the bottom sheets use them.
// The stand-ins only switch the dialog's `open` flag, which is all we need.
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  this.open = false;
};

// useRegisterSW — UpdatePrompt asks "is a new version waiting?".
// The real one is made by vite-plugin-pwa only when the app is built, so
// tests can't load it. The stand-in always answers "no new version".
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => {}],
    offlineReady: [false, () => {}],
    updateServiceWorker: async () => {},
  }),
}));
