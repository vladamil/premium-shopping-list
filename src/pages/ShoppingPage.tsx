import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { formatListDate } from '../domain/dates';
import { useAppContext } from '../state/AppStateContext';
import styles from './ShoppingPage.module.css';

// One list while you shop: /lists/:id
export function ShoppingPage() {
  const { state } = useAppContext();

  // The ":id" part of the URL /lists/:id
  const { id } = useParams();

  // Read the clock once, for "Created today". (Same as on the Lists page.)
  // All hooks must come BEFORE any early `return` below — React needs every
  // hook to run on every render, in the same order.
  const [now] = useState(() => new Date());

  // Find the list with this id. find() gives back the first match,
  // or undefined if there is none (deleted list, old link, typo in the URL).
  const list = state.lists.find((oneList) => oneList.id === id);

  if (list === undefined) {
    return (
      <main className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>List not found</h1>
        <p className={styles.notFoundText}>
          It may have been deleted, or the link is out of date.
        </p>
        <Link to="/" className={styles.notFoundLink}>
          Go to your lists
        </Link>
      </main>
    );
  }

  // From here on, TypeScript knows `list` is a real list (not undefined).

  let itemsText = `${list.items.length} items`;
  if (list.items.length === 1) {
    itemsText = '1 item';
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back} aria-label="Back to lists">
          <svg
            className={styles.icon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </header>

      <div className={styles.heading}>
        <h1 className={styles.title}>{list.title}</h1>
        <p className={styles.meta}>
          {formatListDate(list.createdAt, now)} · {itemsText}
        </p>
      </div>
    </main>
  );
}
