import { ContourLines } from '../components/ContourLines';
import type { Theme } from '../domain/schemas';
import { updateSettings } from '../state/actions';
import { useAppContext } from '../state/AppStateContext';
import styles from './SettingsPage.module.css';

// Settings: theme, currency and "keep screen on". Every change saves at once.
export function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const theme = state.settings.theme;

  // Saving the theme is enough: useApplyTheme (in App.tsx) sees the new
  // setting and swaps the colours.
  function handleThemeChange(newTheme: Theme) {
    dispatch(updateSettings({ theme: newTheme }));
  }

  return (
    <main className={styles.page}>
      <ContourLines />

      <div className={styles.heading}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Make the app fit how you shop</p>
      </div>

      <div className={styles.sections}>
        {/* RENDER APPEARANCE ---------------------------------------- */}
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <div className={styles.card}>
          <p id="theme-label" className={styles.rowTitle}>
            Theme
          </p>

          {/* role="group" + aria-labelledby: screen readers say "Theme"
              before the buttons. aria-pressed marks the chosen one (and
              the CSS draws it as the white pill). */}
          <div
            role="group"
            aria-labelledby="theme-label"
            className={styles.choices}
          >
            <button
              type="button"
              className={styles.choice}
              aria-pressed={theme === 'system'}
              onClick={() => handleThemeChange('system')}
            >
              {/* A screen (decoration) */}
              <svg
                className={styles.icon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <path d="M8 20h8M12 16v4" />
              </svg>
              System
            </button>
            <button
              type="button"
              className={styles.choice}
              aria-pressed={theme === 'light'}
              onClick={() => handleThemeChange('light')}
            >
              {/* A sun (decoration) */}
              <svg
                className={styles.icon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
              Light
            </button>
            <button
              type="button"
              className={styles.choice}
              aria-pressed={theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
            >
              {/* A moon (decoration) */}
              <svg
                className={styles.icon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />
              </svg>
              Dark
            </button>
          </div>
        </div>
        {/* ------------------------------------------------------------ */}

        {/* RENDER FOOTER -------------------------------------------- */}
        <p className={styles.storageNote}>
          {/* A padlock (decoration) */}
          <svg
            className={styles.icon}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Your lists are stored only on this device.
        </p>
        <p className={styles.version}>Cart-o-grapher · version 2.0</p>
        {/* ------------------------------------------------------------ */}
      </div>
    </main>
  );
}
