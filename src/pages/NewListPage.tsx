import { useState } from 'react';
import { Link } from 'react-router';
import { LIMITS } from '../domain/schemas';
import { useAppContext } from '../state/AppStateContext';
import styles from './NewListPage.module.css';

// Make a new list: a name, items and an optional budget.
export function NewListPage() {
  const { state } = useAppContext();
  const currency = state.settings.currency;

  // What the user has typed so far. React holds it; each input only shows it.
  // Nothing is saved until "Create list" (coming in a later commit).
  const [title, setTitle] = useState('');
  const [budgetText, setBudgetText] = useState('');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.cancel} aria-label="Cancel">
          <svg
            className={styles.icon}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Link>
        <h1 className={styles.title}>New list</h1>
        {/* Empty space as wide as the ✕, so the title stays centred */}
        <span className={styles.headerSpacer} />
      </header>

      <div className={styles.fields}>
        <div>
          <label htmlFor="list-name" className={styles.label}>
            List name
          </label>
          <input
            id="list-name"
            type="text"
            className={styles.nameInput}
            placeholder="e.g. Weekly groceries"
            maxLength={LIMITS.titleMaxLength}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="list-budget" className={styles.label}>
            Budget <span className={styles.optional}>(optional)</span>
          </label>
          <div className={styles.moneyField}>
            <span className={styles.currency}>{currency}</span>
            <input
              id="list-budget"
              type="text"
              inputMode="decimal"
              className={styles.moneyInput}
              aria-describedby="list-budget-hint"
              value={budgetText}
              onChange={(event) => setBudgetText(event.target.value)}
            />
          </div>
          <p id="list-budget-hint" className={styles.hint}>
            You will see a warning if the planned total gets close.
          </p>
        </div>
      </div>
    </main>
  );
}
