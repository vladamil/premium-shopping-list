import { Link } from 'react-router';
import styles from './EmptyHistory.module.css';

// What the History page shows before any trip has been finished.
export function EmptyHistory() {
  return (
    <section className={styles.empty} aria-labelledby="empty-history-title">
      <div className={styles.illustration}>
        {/* A folded map with a dotted route from a start dot to an X */}
        <svg width="132" height="104" viewBox="0 0 120 96" aria-hidden="true">
          <path
            className={styles.map}
            d="M8 16 L40 6 L80 18 L112 8 L112 80 L80 90 L40 78 L8 88 Z"
          />
          <path className={styles.folds} d="M40 6 L40 78 M80 18 L80 90" />
          <path
            className={styles.route}
            d="M20 68 C34 60 44 44 62 48 S90 34 98 28"
          />
          <circle className={styles.start} cx="20" cy="68" r="4.5" />
          <path className={styles.cross} d="M93 23 L103 33 M103 23 L93 33" />
        </svg>
      </div>

      <h2 id="empty-history-title" className={styles.title}>
        No trips yet
      </h2>
      <p className={styles.text}>
        When you finish a shopping trip, it shows up here with what you bought,
        what you skipped and what you spent.
      </p>

      <Link to="/" className={styles.listsLink}>
        Go to your lists
      </Link>
    </section>
  );
}
