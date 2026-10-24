import { EmptyHistory } from '../components/EmptyHistory';
import { TripCard } from '../components/TripCard';
import { useAppContext } from '../state/AppStateContext';
import styles from './HistoryPage.module.css';

// History: every trip you finished, newest first.
export function HistoryPage() {
  const { state } = useAppContext();
  const currency = state.settings.currency;

  // Only finished lists. After this filter TypeScript knows every trip is
  // 'completed', so trip.completedAt is allowed below.
  const trips = state.lists.filter((list) => list.status === 'completed');

  // Newest first. toSorted() gives back a NEW sorted array (the saved order
  // stays as it is). The function compares two trips: "b before a" when b is
  // later. ISO dates ("2026-09-27T…") sort correctly as plain text.
  const newestFirst = trips.toSorted((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );

  return (
    <main>
      <div className={styles.heading}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Every trip you finished</p>
      </div>

      {newestFirst.length === 0 && <EmptyHistory />}

      {newestFirst.length > 0 && (
        <ul className={styles.trips}>
          {newestFirst.map((trip) => (
            <li key={trip.id}>
              <TripCard trip={trip} currency={currency} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
