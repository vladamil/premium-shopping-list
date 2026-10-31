import { NavLink } from 'react-router';
import styles from './TabBar.module.css';

// The bottom bar on Lists, History and Settings.
// NavLink adds aria-current="page" to the tab you are on; the CSS uses that.
export function TabBar() {
  return (
    <nav aria-label="Main" className={styles.bar}>
      <NavLink to="/" className={styles.tab}>
        <svg
          className={styles.icon}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        Lists
      </NavLink>

      <NavLink to="/history" className={styles.tab}>
        <svg
          className={styles.icon}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        History
      </NavLink>

      <NavLink to="/settings" className={styles.tab}>
        <svg
          className={styles.icon}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          <circle cx="15" cy="7" r="2" />
          <circle cx="9" cy="17" r="2" />
        </svg>
        Settings
      </NavLink>
    </nav>
  );
}
