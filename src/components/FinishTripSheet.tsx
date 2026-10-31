import { inCartTotal, progress } from '../domain/calculations';
import { formatTripDate } from '../domain/dates';
import { formatMoney } from '../domain/money';
import type { Currency, ShoppingList } from '../domain/schemas';
import { BottomSheetLayout } from './BottomSheetLayout';
import { ShopProgressBar } from './ShopProgressBar';
import styles from './FinishTripSheet.module.css';

type FinishTripSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Called by "Finish and save to History". The page does the saving. */
  onFinish: () => void;
  list: ShoppingList;
  currency: Currency;
  /** The current time, read once by the page (so this component stays "pure"). */
  now: Date;
};

// "Finish this trip?" — a last look at the trip before it goes to History.
export function FinishTripSheet({
  isOpen,
  onClose,
  onFinish,
  list,
  currency,
  now,
}: FinishTripSheetProps) {
  const listProgress = progress(list.items);
  const spent = inCartTotal(list.items);
  const notBought = list.items.filter((item) => !item.isBought);

  // Budget box: what is left of the budget after what you actually SPENT.
  let budgetText = 'No budget';
  let budgetClass = styles.statValueMuted;
  if (list.budget !== null) {
    if (spent <= list.budget) {
      budgetText = `${formatMoney(list.budget - spent, currency)} left`;
      budgetClass = styles.statValueOk;
    } else {
      budgetText = `${formatMoney(spent - list.budget, currency)} over`;
      budgetClass = styles.statValueWarning;
    }
  }

  return (
    <BottomSheetLayout isOpen={isOpen} onClose={onClose} titleId="finish-title">
      <div className={styles.header}>
        <span className={styles.flag}>
          <svg
            className={styles.icon}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 22V4M4 4h13l-2 4 2 4H4" />
          </svg>
        </span>
        <div>
          <h2 id="finish-title" className={styles.title}>
            Finish this trip?
          </h2>
          <p className={styles.subtitle}>
            {list.title} · {formatTripDate(now.toISOString())}
          </p>
        </div>
      </div>

      <div className={styles.progress}>
        <ShopProgressBar
          bought={listProgress.bought}
          total={listProgress.total}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Bought</span>
          <span className={styles.statValue}>
            {listProgress.bought} of {listProgress.total}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Spent</span>
          <span className={styles.statValue}>
            {formatMoney(spent, currency)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Budget</span>
          <span className={budgetClass}>{budgetText}</span>
        </div>
      </div>

      {notBought.length > 0 && (
        <>
          <p className={styles.notBoughtTitle}>
            Not bought · {notBought.length}
          </p>
          <ul className={styles.chips}>
            {notBought.map((item) => {
              let chipText = item.name;
              if (item.quantity > 1) {
                chipText = `${item.name} ×${item.quantity}`;
              }
              return (
                <li key={item.id} className={styles.chip}>
                  {chipText}
                </li>
              );
            })}
          </ul>
          <p className={styles.note}>
            They stay in History as skipped, so you can shop for them again
            later.
          </p>
        </>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.finishButton}
          onClick={onFinish}
        >
          <svg
            className={styles.icon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Finish and save to History
        </button>
        <button type="button" className={styles.keepButton} onClick={onClose}>
          Keep shopping
        </button>
      </div>
    </BottomSheetLayout>
  );
}
