import { Link } from 'react-router';
import { ContourLines } from '../components/ContourLines';
import { EmptyLists } from '../components/EmptyLists';
import { useAppContext } from '../state/AppStateContext';
import styles from './ListsPage.module.css';

// The home page: your active shopping lists.
export function ListsPage() {
  const { state } = useAppContext();

  // Finished lists belong in History, so this page shows only active ones.
  const activeLists = state.lists.filter((list) => list.status === 'active');
  const hasLists = activeLists.length > 0;

  let subtitle = 'No active lists yet';
  if (hasLists) {
    subtitle = `${activeLists.length} active`;
  }

  return (
    <main className={styles.page}>
      <ContourLines />

      <header className={styles.brand}>
        <span className={styles.logo}>
          <svg
            className={styles.icon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
            <circle cx="12" cy="10" r="2" />
          </svg>
        </span>
        <span className={styles.brandName}>Cart-o-grapher</span>
      </header>

      <div className={styles.heading}>
        <h1 className={styles.title}>Shopping lists</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      {/* Only one of these two is shown, depending on hasLists */}
      {!hasLists && <EmptyLists />}

      {hasLists && (
        <Link to="/new" className={styles.newListButton}>
          <svg
            className={styles.icon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New list
        </Link>
      )}
    </main>
  );
}
