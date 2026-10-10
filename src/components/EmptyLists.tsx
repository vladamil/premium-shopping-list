import { Link } from 'react-router';
import styles from './EmptyLists.module.css';

// What the Lists page shows when there are no active lists yet.
export function EmptyLists() {
  return (
    <>
      <section className={styles.empty} aria-labelledby="empty-lists-title">
        <div className={styles.illustration}>
          {/* A dotted route from a start dot, past three empty stops, to a pin */}
          <svg
            width="220"
            height="150"
            viewBox="0 0 220 150"
            aria-hidden="true"
          >
            <path
              className={styles.route}
              d="M20 120 C60 120 60 60 110 70 S170 30 196 34"
            />
            <circle className={styles.start} cx="20" cy="120" r="8" />
            <circle className={styles.stop} cx="61" cy="91" r="6" />
            <circle className={styles.stop} cx="110" cy="70" r="6" />
            <circle className={styles.stop} cx="162" cy="54" r="6" />
            <path
              className={styles.pin}
              d="M196 50 C196 50 182 38 182 26 A14 14 0 0 1 210 26 C210 38 196 50 196 50 Z"
            />
            <circle className={styles.pinHole} cx="196" cy="26" r="5" />
          </svg>
        </div>

        <h2 id="empty-lists-title" className={styles.title}>
          Plan your first route
        </h2>
        <p className={styles.text}>
          Create a list, add what you need, then tick items off as you walk the
          store.
        </p>

        <Link to="/new" className={styles.createButton}>
          <svg
            className={styles.icon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create a list
        </Link>
      </section>

      <p className={styles.tip}>
        <svg
          className={styles.tipIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
        <span>
          <strong>Tip:</strong> tap an item to tick it off. Long-press it to
          edit the name, quantity or price.
        </span>
      </p>
    </>
  );
}
