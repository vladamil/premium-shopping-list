import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdatePrompt.module.css';

// Shows "New version available" when a newer version of the app has been
// downloaded in the background. The new version waits until the user taps
// Reload, so the app never changes in the middle of a shop.
export function UpdatePrompt() {
  // useRegisterSW comes from vite-plugin-pwa. It installs the service worker
  // and tells us when a new version is waiting.
  const serviceWorker = useRegisterSW();
  // needRefresh works like useState: true = a new version is waiting.
  const [needRefresh, setNeedRefresh] = serviceWorker.needRefresh;

  // The role="status" box is always on the page (empty most of the time),
  // so screen readers notice and read the message when it appears.
  return (
    <div role="status">
      {needRefresh && (
        <div className={styles.bar}>
          <span className={styles.text}>New version available</span>
          <button
            type="button"
            className={styles.later}
            onClick={() => setNeedRefresh(false)}
          >
            Later
          </button>
          <button
            type="button"
            className={styles.reload}
            onClick={() => serviceWorker.updateServiceWorker()}
          >
            Update
          </button>
        </div>
      )}
    </div>
  );
}
