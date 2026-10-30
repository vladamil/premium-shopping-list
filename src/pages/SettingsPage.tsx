import { useState, type ChangeEvent } from 'react';
import { ContourLines } from '../components/ContourLines';
import type { AppData, Currency, Theme } from '../domain/schemas';
import { replaceAllData, updateSettings } from '../state/actions';
import { useAppContext } from '../state/AppStateContext';
import { downloadBackup } from '../storage/backupFile';
import { parseAppData } from '../storage/parseAppData';
import styles from './SettingsPage.module.css';

// Settings: theme, currency, "keep screen on" and backup. Every change saves at once.
export function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const theme = state.settings.theme;
  const currency = state.settings.currency;
  const keepScreenAwake = state.settings.keepScreenAwake;

  // A checked backup file, waiting for you to tap "Replace" or "Cancel".
  // null = no file waiting, so the normal Save / Load buttons show.
  const [backupData, setBackupData] = useState<AppData | null>(null);
  // How many lists in that file were damaged (they will be left out).
  const [skippedLists, setSkippedLists] = useState(0);
  // "This file isn't a backup" or "Backup loaded: …" (null = no message).
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Saving the theme is enough: useApplyTheme (in App.tsx) sees the new
  // setting and swaps the colours.
  function handleThemeChange(newTheme: Theme) {
    dispatch(updateSettings({ theme: newTheme }));
  }

  // Only the label changes (RSD 1,290.00 → €1,290.00); amounts are never
  // converted. Every page already passes this setting to formatMoney.
  function handleCurrencyChange(newCurrency: Currency) {
    dispatch(updateSettings({ currency: newCurrency }));
  }

  // On → off, off → on (! = "the opposite of"). The Shopping page reads this
  // setting (useWakeLock).
  function handleKeepScreenAwakeToggle() {
    dispatch(updateSettings({ keepScreenAwake: !keepScreenAwake }));
  }

  // The whole state (all lists + settings) goes into the file.
  function handleSaveBackup() {
    downloadBackup(state);
  }

  // Runs when you pick a file in the phone's file picker.
  // async: reading the file takes a moment, so we `await` it.
  async function handleBackupFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;

    // The picker was closed without choosing a file → do nothing.
    if (input.files === null) {
      return;
    }
    const file = input.files.item(0); // the chosen file, or null
    if (file === null) {
      return;
    }

    const text = await file.text();
    // Empty the picker, so choosing the same file again still works.
    input.value = '';

    // The same check the app does with localStorage on every start.
    const result = parseAppData(text);

    // Problems AND no usable lists = not our file (a photo, some other JSON…).
    if (result.hadProblems && result.data.lists.length === 0) {
      setBackupData(null);
      setBackupMessage('This file isn’t a Cart-o-grapher backup.');
      return;
    }

    // Usable → don't load it yet: show the "Replace…?" step first.
    setBackupMessage(null);
    setSkippedLists(result.skippedLists);
    setBackupData(result.data);
  }

  function handleReplaceWithBackup() {
    if (backupData === null) {
      return;
    }
    dispatch(replaceAllData(backupData));
    setBackupMessage(`Backup loaded: ${countLists(backupData.lists.length)}.`);
    setBackupData(null);
  }

  function handleCancelBackup() {
    setBackupData(null);
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

        {/* RENDER SHOPPING ------------------------------------------ */}
        <h2 className={styles.sectionTitle}>Shopping</h2>
        <div className={styles.card}>
          <p id="currency-label" className={styles.rowTitle}>
            Currency
          </p>
          <p className={styles.rowText}>Shown next to every price</p>

          {/* Same 3-button track as Theme */}
          <div
            role="group"
            aria-labelledby="currency-label"
            className={styles.choices}
          >
            <button
              type="button"
              className={styles.choice}
              aria-pressed={currency === 'RSD'}
              onClick={() => handleCurrencyChange('RSD')}
            >
              RSD
            </button>
            <button
              type="button"
              className={styles.choice}
              aria-pressed={currency === 'EUR'}
              onClick={() => handleCurrencyChange('EUR')}
            >
              EUR
            </button>
            <button
              type="button"
              className={styles.choice}
              aria-pressed={currency === 'USD'}
              onClick={() => handleCurrencyChange('USD')}
            >
              USD
            </button>
          </div>

          <div className={styles.switchRow}>
            <div>
              <p id="awake-label" className={styles.rowTitle}>
                Keep screen on
              </p>
              <p id="awake-text" className={styles.rowText}>
                While a list is open, so your phone will not lock mid-aisle
              </p>
            </div>

            {/* role="switch" + aria-checked: screen readers say "Keep screen
                on, switch, on". The two spans are only the drawing (track and
                knob); the CSS moves the knob when aria-checked is true. */}
            <button
              type="button"
              role="switch"
              className={styles.switch}
              aria-checked={keepScreenAwake}
              aria-labelledby="awake-label"
              aria-describedby="awake-text"
              onClick={handleKeepScreenAwakeToggle}
            >
              <span className={styles.track}>
                <span className={styles.knob} />
              </span>
            </button>
          </div>
        </div>
        {/* ------------------------------------------------------------ */}

        {/* RENDER YOUR DATA ----------------------------------------- */}
        <h2 className={styles.sectionTitle}>Your data</h2>
        {/* Says WHY the backup rows below matter */}
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
        <div className={styles.dataCard}>
          {/* No file waiting → the two rows (Export / Import) */}
          {backupData === null && (
            <div>
              <button
                type="button"
                className={styles.dataRow}
                onClick={handleSaveBackup}
              >
                {/* An arrow down into a tray (decoration) */}
                <span className={styles.rowIcon}>
                  <svg
                    className={styles.icon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                  </svg>
                </span>
                <span>
                  <span className={styles.rowTitle}>Export backup</span>
                  <span className={styles.rowText}>
                    Save all lists to a file
                  </span>
                </span>
              </button>

              <div className={styles.divider} />

              {/* A file input can't be styled, so it's hidden inside a
                  <label>: tapping the label opens the file picker. */}
              <label className={styles.dataRow}>
                {/* An arrow up out of a tray (decoration) */}
                <span className={styles.rowIcon}>
                  <svg
                    className={styles.icon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 21V9M7 14l5-5 5 5M5 3h14" />
                  </svg>
                </span>
                <span>
                  <span className={styles.rowTitle}>Import backup</span>
                  <span className={styles.rowText}>
                    Restore lists from a backup file
                  </span>
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="visually-hidden"
                  onChange={handleBackupFileChosen}
                />
              </label>
            </div>
          )}

          {/* A checked file is waiting → ask before replacing everything */}
          {backupData !== null && (
            <div className={styles.dataConfirm}>
              <p className={styles.confirmText}>
                Replace your {countLists(state.lists.length)} and settings with
                the {countLists(backupData.lists.length)} from this backup? This
                can’t be undone.
              </p>
              {skippedLists > 0 && (
                <p className={styles.rowText}>
                  Damaged, will be left out: {countLists(skippedLists)}.
                </p>
              )}
              <div className={styles.confirmButtons}>
                <button
                  type="button"
                  className={styles.replaceButton}
                  onClick={handleReplaceWithBackup}
                >
                  Replace
                </button>
                {/* autoFocus: the Import row just disappeared, so keyboard
                    focus moves here (the safe choice) */}
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelBackup}
                  autoFocus
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* role="status": screen readers read the message out loud */}
          {backupMessage !== null && (
            <p role="status" className={styles.backupMessage}>
              {backupMessage}
            </p>
          )}
        </div>
        {/* ------------------------------------------------------------ */}

        {/* RENDER FOOTER -------------------------------------------- */}
        <p className={styles.version}>Cart-o-grapher · version 2.0</p>
        {/* ------------------------------------------------------------ */}
      </div>
    </main>
  );
}

/** "1 list" or "7 lists" */
function countLists(count: number): string {
  if (count === 1) {
    return '1 list';
  }
  return `${count} lists`;
}
