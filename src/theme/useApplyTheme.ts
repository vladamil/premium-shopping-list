import { useEffect } from 'react';
import type { Theme } from '../domain/schemas';

/**
 * Puts data-theme="light" or "dark" on <html>, so tokens.css shows the right colours.
 * With 'system', it also follows the phone if it switches mode while the app is open.
 */
export function useApplyTheme(theme: Theme) {
  useEffect(() => {
    // The question we ask the browser: "is the phone in dark mode?"
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function setAppTheme() {
      // .matches is the answer right now: true = dark, false = light
      const isDarkMode = darkModeQuery.matches;

      let themeToShow = theme;
      if (theme === 'system') {
        themeToShow = isDarkMode ? 'dark' : 'light';
      }
      document.documentElement.dataset.theme = themeToShow;
    }

    setAppTheme();

    // Run again whenever the phone switches between light and dark.
    darkModeQuery.addEventListener('change', setAppTheme);

    // Cleanup: React runs this before the effect runs again (theme changed),
    // so we never have two listeners at once.
    return () => {
      darkModeQuery.removeEventListener('change', setAppTheme);
    };
  }, [theme]);
}
