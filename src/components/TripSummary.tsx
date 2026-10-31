import { inCartTotal, plannedTotal, progress } from '../domain/calculations';
import { formatMoney } from '../domain/money';
import type { Currency, Item, Money } from '../domain/schemas';
import { ShopProgressBar } from './ShopProgressBar';
import styles from './TripSummary.module.css';

type TripSummaryProps = {
  items: Item[];
  budget: Money | null;
  currency: Currency;
};

// The dark card at the top of the Shopping page: money in the cart, the plan,
// the budget and how far along the trip you are.
export function TripSummary({ items, budget, currency }: TripSummaryProps) {
  const inCart = inCartTotal(items);
  const planned = plannedTotal(items);
  const listProgress = progress(items);

  // How much room the plan leaves in the budget: "RSD 878.00 left" or "RSD 380.00 over".
  let budgetText = '';
  if (budget !== null) {
    if (planned <= budget) {
      budgetText = `${formatMoney(budget - planned, currency)} left`;
    } else {
      budgetText = `${formatMoney(planned - budget, currency)} over`;
    }
  }

  return (
    <section aria-label="Trip summary" className={styles.card}>
      <div className={styles.top}>
        <div>
          <span className={styles.label}>In cart</span>
          <span className={styles.inCart}>{formatMoney(inCart, currency)}</span>
        </div>
        <div className={styles.totals}>
          <span>
            Planned <strong>{formatMoney(planned, currency)}</strong>
          </span>
          {budget !== null && (
            <span>
              Budget <strong>{formatMoney(budget, currency)}</strong>
            </span>
          )}
        </div>
      </div>

      <div className={styles.progress}>
        {/* onDark on its own means onDark={true} */}
        <ShopProgressBar
          bought={listProgress.bought}
          total={listProgress.total}
          onDark
        />
      </div>

      <p className={styles.bottom}>
        {listProgress.bought} of {listProgress.total} stops
        {budgetText !== '' && (
          <>
            {' · '}
            <strong>{budgetText}</strong>
          </>
        )}
      </p>
    </section>
  );
}
