import { useState } from 'react';
import { useNavigate } from 'react-router';
import { EmptyHistory } from '../components/EmptyHistory';
import { TripCard } from '../components/TripCard';
import { groupTripsByMonth } from '../domain/history';
import { formatMoney } from '../domain/money';
import type { CompletedList } from '../domain/schemas';
import { shopAgain } from '../state/actions';
import { useAppContext } from '../state/AppStateContext';
import styles from './HistoryPage.module.css';

// History: every trip you finished, in month groups, newest first.
export function HistoryPage() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const currency = state.settings.currency;

  // Only finished lists. After this filter TypeScript knows every trip is
  // 'completed', so trip.completedAt is allowed.
  const trips = state.lists.filter((list) => list.status === 'completed');

  // [{ label: 'October 2026', trips: [...], spent: 203900 }, ...]
  // groupTripsByMonth also sorts them, newest first.
  const months = groupTripsByMonth(trips);

  // Which trip card is open (only one at a time; null = all closed).
  // All cards start closed. <string | null> tells TypeScript that a trip id
  // may go in here later — from the starting value null alone it can't know.
  const [openTripId, setOpenTripId] = useState<string | null>(null);

  // Tap an open card → close it. Tap a closed card → open it (and with that,
  // the card that was open closes, because only one id fits in openTripId).
  function handleToggleTrip(tripId: string) {
    if (openTripId === tripId) {
      setOpenTripId(null);
    } else {
      setOpenTripId(tripId);
    }
  }

  // Shop again: shopAgain builds a NEW list copied from the trip (new ids,
  // nothing ticked), dispatch saves it, then we open it. The trip itself stays
  // in History. No { replace: true } here: Back should bring you to History.
  function handleShopAgain(trip: CompletedList) {
    const action = shopAgain(trip);
    dispatch(action);
    navigate(`/lists/${action.payload.list.id}`);
  }

  return (
    <main>
      <div className={styles.heading}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Every trip you finished</p>
      </div>

      {months.length === 0 && <EmptyHistory />}

      {months.map((month) => {
        // "1 trip" but "2 trips"
        let tripCount = `${month.trips.length} trips`;
        if (month.trips.length === 1) {
          tripCount = '1 trip';
        }

        return (
          <section key={month.label} className={styles.month}>
            {/* "October 2026" on the left, "2 trips · RSD 2,039.00" on the right */}
            <div className={styles.monthHeading}>
              <h2 className={styles.monthTitle}>{month.label}</h2>
              <p className={styles.monthSummary}>
                {tripCount} · {formatMoney(month.spent, currency)}
              </p>
            </div>

            <ul className={styles.trips}>
              {month.trips.map((trip) => (
                <li key={trip.id} className={styles.trip}>
                  {/* A dot on the timeline (decoration, so screen readers skip it) */}
                  <span className={styles.dot} aria-hidden="true" />
                  <TripCard
                    trip={trip}
                    currency={currency}
                    isOpen={trip.id === openTripId}
                    onToggle={() => handleToggleTrip(trip.id)}
                    onShopAgain={() => handleShopAgain(trip)}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
