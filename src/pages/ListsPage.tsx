import { useState } from 'react';
import { Link } from 'react-router';
import { ContourLines } from '../components/ContourLines';
import { EmptyLists } from '../components/EmptyLists';
import { ListCard } from '../components/ListCard';
import { budgetStatus } from '../domain/calculations';
import { useAppContext } from '../state/AppStateContext';
import styles from './ListsPage.module.css';

// The home page: your active shopping lists.
export function ListsPage() {
  const { state } = useAppContext();
  const currency = state.settings.currency;

  // Read the clock once, when the page opens, for "Created today" on the cards.
  // For comparison of createdAt with now
  // (The function inside useState runs only the first time; React keeps the result.)
  const [now] = useState(() => new Date());

  // Finished lists belong in History, so this page shows only active ones.
  const activeLists = state.lists.filter((list) => list.status === 'active');
  const hasLists = activeLists.length > 0;

  const overBudgetLists = activeLists.filter(
    (list) => budgetStatus(list.items, list.budget) === 'over',
  );

  // "No active lists yet" · "3 active" · "3 active · 1 over budget"
  let subtitle = 'No active lists yet';
  if (hasLists) {
    subtitle = `${activeLists.length} active`;
  }
  if (overBudgetLists.length > 0) {
    subtitle = `${subtitle} · ${overBudgetLists.length} over budget`;
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
        <ul className={styles.cards}>
          {/* One card per list. key = a unique, stable name tag for React. */}
          {activeLists.map((list) => (
            <li key={list.id}>
              <ListCard list={list} currency={currency} now={now} />
            </li>
          ))}
        </ul>
      )}

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
