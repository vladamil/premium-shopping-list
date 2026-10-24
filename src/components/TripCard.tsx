import { inCartTotal, progress } from '../domain/calculations';
import { formatTripDate } from '../domain/dates';
import { formatMoney } from '../domain/money';
import type { CompletedList, Currency } from '../domain/schemas';
import styles from './TripCard.module.css';

type TripCardProps = {
  trip: CompletedList;
  currency: Currency;
};

// One finished trip on the History page.
export function TripCard({ trip, currency }: TripCardProps) {
  const tripProgress = progress(trip.items);
  const spent = inCartTotal(trip.items);

  return (
    <article className={styles.card}>
      <span className={styles.text}>
        <span className={styles.title}>{trip.title}</span>
        {/* "Sun, Sep 27 · 11 of 12 bought" */}
        <span className={styles.meta}>
          {formatTripDate(trip.completedAt)} · {tripProgress.bought} of{' '}
          {tripProgress.total} bought
        </span>
      </span>
      <span className={styles.spent}>{formatMoney(spent, currency)}</span>
    </article>
  );
}
