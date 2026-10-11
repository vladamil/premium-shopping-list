import { Link } from 'react-router';
import { budgetStatus, plannedTotal, progress } from '../domain/calculations';
import { formatMoney } from '../domain/money';
import type { Currency, ShoppingList } from '../domain/schemas';
import { ShopProgress } from './ShopProgress';
import styles from './ListCard.module.css';

type ListCardProps = {
  list: ShoppingList;
  currency: Currency;
};

// One active list on the Lists page. The whole card is a link to that list.
export function ListCard({ list, currency }: ListCardProps) {
  const listProgress = progress(list.items);
  const planned = plannedTotal(list.items);
  const status = budgetStatus(list.items, list.budget);

  let itemsText = `${listProgress.total} items`;
  if (listProgress.total === 1) {
    itemsText = '1 item';
  }

  // The badge: its text and its colour depend on the budget status.
  let badgeText = 'No budget';
  let badgeClass = styles.badgeNone;
  if (list.budget !== null) {
    if (status === 'over') {
      const overBy = planned - list.budget;
      badgeText = `Over by ${formatMoney(overBy, currency)}`;
      badgeClass = styles.badgeWarning;
    } else {
      const percent = Math.round((planned / list.budget) * 100);
      badgeText = `${percent}% of budget`;
      badgeClass = status === 'near' ? styles.badgeWarning : styles.badgeOk;
    }
  }

  return (
    <Link to={`/lists/${list.id}`} className={styles.card}>
      <span className={styles.top}>
        <span className={styles.title}>{list.title}</span>
        <svg
          className={styles.chevron}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </span>
      <span className={styles.meta}>
        {itemsText} · {listProgress.bought} in cart
      </span>

      <span className={styles.progress}>
        <ShopProgress bought={listProgress.bought} total={listProgress.total} />
      </span>

      <span className={styles.bottom}>
        <span className={styles.planned}>
          {formatMoney(planned, currency)}{' '}
          <span className={styles.plannedLabel}>planned</span>
        </span>
        <span className={badgeClass}>{badgeText}</span>
      </span>
    </Link>
  );
}
