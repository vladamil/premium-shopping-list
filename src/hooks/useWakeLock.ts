import { useEffect } from 'react';

/**
 * Keeps the phone's screen on while isEnabled is true (Screen Wake Lock API).
 * If the browser can't or won't do it, nothing happens: the screen sleeps as usual.
 */
export function useWakeLock(isEnabled: boolean) {
  useEffect(() => {
    // Setting is off, or this browser has no wake lock → do nothing.
    if (!isEnabled || !('wakeLock' in navigator)) {
      return;
    }

    // The lock we are holding (null = none yet).
    let lock: WakeLockSentinel | null = null;
    // Set to false in the cleanup: "we don't want a lock any more".
    let isStillWanted = true;

    async function requestLock() {
      // Already holding a lock → don't ask for a second one.
      if (lock !== null && !lock.released) {
        return;
      }

      try {
        const newLock = await navigator.wakeLock.request('screen');

        // The browser's answer can arrive AFTER we left the page.
        // Then nobody would ever release it, so let go of it right away.
        if (!isStillWanted) {
          newLock.release();
          return;
        }

        lock = newLock;
      } catch {
        // Refused (battery saver, page hidden…). The screen just sleeps as usual.
      }
    }

    // The browser drops the lock by itself when the page is hidden (other app,
    // phone locked). When the page is visible again, ask for a new one.
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        requestLock();
      }
    }

    requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: leaving the page, or the setting was switched off.
    return () => {
      isStillWanted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (lock !== null) {
        lock.release();
      }
    };
  }, [isEnabled]);
}
