import { inCartTotal, itemTotal, progress } from '../domain/calculations';
import { formatTripDate } from '../domain/dates';
import { formatMoney } from '../domain/money';
import type { CompletedList, Currency } from '../domain/schemas';
import styles from './TripCard.module.css';

type TripCardProps = {
  trip: CompletedList;
  currency: Currency;
  /** The page decides which card is open, so only one is open at a time. */
  isOpen: boolean;
  onToggle: () => void;
  /** The page does the saving; the card only has the button. */
  onShopAgain: () => void;
  onRestore: () => void;
};

// One finished trip on the History page. Tap it to open or close it.
export function TripCard({
  trip,
  currency,
  isOpen,
  onToggle,
  onShopAgain,
  onRestore,
}: TripCardProps) {
  const tripProgress = progress(trip.items);
  const spent = inCartTotal(trip.items);

  return (
    <article className={styles.card}>
      {/* aria-expanded tells screen readers (and the CSS) if it's open */}
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className={styles.text}>
          <span className={styles.title}>{trip.title}</span>
          {/* "Sun, Sep 27 · 11 of 12 bought" */}
          <span className={styles.meta}>
            {formatTripDate(trip.completedAt)} · {tripProgress.bought} of{' '}
            {tripProgress.total} bought
          </span>
        </span>
        <span className={styles.spent}>{formatMoney(spent, currency)}</span>
      </button>

      {/* Open → ALL items, in the list's own order, so you can see what
          "Shop again" would copy. Skipped ones get a "Skipped" tag.
          Then the buttons. */}
      {isOpen && (
        <div>
          <ul className={styles.items}>
            {trip.items.map((item) => {
              const total = itemTotal(item); // null when there's no price

              return (
                // data-skipped is a hook for the CSS (muted text)
                <li
                  key={item.id}
                  className={styles.item}
                  data-skipped={!item.isBought}
                >
                  <span className={styles.itemName}>
                    {item.name}
                    {item.quantity > 1 && (
                      <span className={styles.quantity}> ×{item.quantity}</span>
                    )}
                    {!item.isBought && (
                      <span className={styles.skippedTag}>Skipped</span>
                    )}
                  </span>

                  {total !== null && (
                    <span className={styles.itemTotal}>
                      {formatMoney(total, currency)}
                    </span>
                  )}
                  {total === null && (
                    <span className={styles.noPrice}>No price</span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.shopAgain}
              onClick={onShopAgain}
            >
              {/* Two arrows going round (decoration) */}
              <svg
                className={styles.icon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17 2l4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="M7 22l-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
              Shop again
            </button>
            <button
              type="button"
              className={styles.restore}
              onClick={onRestore}
            >
              Restore
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
