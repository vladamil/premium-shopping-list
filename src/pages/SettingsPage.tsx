import { updateSettings } from '../state/actions';
import { useAppContext } from '../state/AppStateContext';

// Temporary shell. The real Settings screen comes in chunk 7.
// The theme buttons are here now so the theme switch can be tried out.
export function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const theme = state.settings.theme;

  return (
    <main>
      <h1>Settings</h1>
      <p>Theme: {theme}</p>
      <button
        type="button"
        aria-pressed={theme === 'system'}
        onClick={() => dispatch(updateSettings({ theme: 'system' }))}
      >
        System
      </button>
      <button
        type="button"
        aria-pressed={theme === 'light'}
        onClick={() => dispatch(updateSettings({ theme: 'light' }))}
      >
        Light
      </button>
      <button
        type="button"
        aria-pressed={theme === 'dark'}
        onClick={() => dispatch(updateSettings({ theme: 'dark' }))}
      >
        Dark
      </button>
    </main>
  );
}
