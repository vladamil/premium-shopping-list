import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router';
import { itemTotal } from '../domain/calculations';
import { formatMoney, moneyInputSchema } from '../domain/money';
import {
  firstErrorMessage,
  itemNameSchema,
  LIMITS,
  type Item,
} from '../domain/schemas';
import { clamp } from '../lib/clamp';
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

  // The items added so far (newest on top), and the add-item row.
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priceText, setPriceText] = useState('');

  // Error messages for the add-item row (null = no problem).
  const [itemNameError, setItemNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Runs on Enter in the add-item row, or when [+] is tapped.
  function handleAddItem(event: SubmitEvent<HTMLFormElement>) {
    // A form's default submit reloads the page — that would wipe the draft.
    event.preventDefault();

    // Check both fields with the same rules the saved data uses.
    // safeParse → { success: true, data } or { success: false, error }
    const nameResult = itemNameSchema.safeParse(itemName);
    const priceResult = moneyInputSchema.safeParse(priceText);

    // Show a message under each field that has a problem (or clear it).
    if (nameResult.success) {
      setItemNameError(null);
    } else {
      setItemNameError(firstErrorMessage(nameResult.error));
    }
    if (priceResult.success) {
      setPriceError(null);
    } else {
      setPriceError(firstErrorMessage(priceResult.error));
    }

    if (!nameResult.success || !priceResult.success) {
      return;
    }

    const newItem: Item = {
      id: crypto.randomUUID(),
      name: nameResult.data, // cleaned by Zod: "  Milk   2% " → "Milk 2%"
      quantity,
      unitPrice: priceResult.data,
      isBought: false,
    };

    setItems([newItem, ...items]);

    // Empty the row, ready for the next item.
    setItemName('');
    setQuantity(1);
    setPriceText('');
  }

  // Typing in a field with an error = you're fixing it, so hide its message.
  function handleItemNameChange(text: string) {
    setItemName(text);
    setItemNameError(null);
  }

  function handlePriceChange(text: string) {
    setPriceText(text);
    setPriceError(null);
  }

  function decreaseQuantity() {
    setQuantity(clamp(quantity - 1, LIMITS.quantityMin, LIMITS.quantityMax));
  }

  function increaseQuantity() {
    setQuantity(clamp(quantity + 1, LIMITS.quantityMin, LIMITS.quantityMax));
  }

  function removeItem(itemId: string) {
    setItems(items.filter((item) => item.id !== itemId));
  }

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

        <section aria-labelledby="items-heading">
          <div className={styles.itemsHeader}>
            <h2 id="items-heading" className={styles.itemsTitle}>
              Items
            </h2>
            <span className={styles.itemsRule}>At least one item</span>
          </div>

          {/* Its own form, so Enter in any of these fields adds the item */}
          <form onSubmit={handleAddItem} aria-label="Add item">
            <div className={styles.addRow}>
              <label htmlFor="item-name" className="visually-hidden">
                Item name
              </label>
              <input
                id="item-name"
                type="text"
                className={styles.itemInput}
                placeholder="Add an item…"
                maxLength={LIMITS.itemNameMaxLength}
                value={itemName}
                onChange={(event) => handleItemNameChange(event.target.value)}
                aria-invalid={itemNameError !== null}
                aria-describedby="item-name-error"
              />
              <button
                type="submit"
                className={styles.addButton}
                aria-label="Add item"
              >
                <svg
                  className={styles.icon}
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            <div className={styles.detailsRow}>
              <div
                role="group"
                aria-label="Quantity"
                className={styles.stepper}
              >
                {/* type="button": these must NOT submit the form */}
                <button
                  type="button"
                  className={styles.stepButton}
                  aria-label="Decrease quantity"
                  disabled={quantity <= LIMITS.quantityMin}
                  onClick={decreaseQuantity}
                >
                  <svg
                    className={styles.icon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </button>
                {/* aria-live: screen readers announce the new number */}
                <span className={styles.stepValue} aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  className={styles.stepButton}
                  aria-label="Increase quantity"
                  disabled={quantity >= LIMITS.quantityMax}
                  onClick={increaseQuantity}
                >
                  <svg
                    className={styles.icon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>

              <div className={styles.priceField}>
                <span className={styles.priceCurrency}>{currency}</span>
                <label htmlFor="item-price" className="visually-hidden">
                  Price (optional)
                </label>
                <input
                  id="item-price"
                  type="text"
                  inputMode="decimal"
                  className={styles.priceInput}
                  placeholder="Price (optional)"
                  value={priceText}
                  onChange={(event) => handlePriceChange(event.target.value)}
                  aria-invalid={priceError !== null}
                  aria-describedby="item-price-error"
                />
              </div>
            </div>

            {/* The messages. role="alert" = screen readers read them out at once. */}
            {itemNameError !== null && (
              <p id="item-name-error" className={styles.error} role="alert">
                {itemNameError}
              </p>
            )}
            {priceError !== null && (
              <p id="item-price-error" className={styles.error} role="alert">
                {priceError}
              </p>
            )}
          </form>

          <p className={styles.smallHint}>
            Only the name is required. Press Enter to add.
          </p>

          {items.length > 0 && (
            <ul className={styles.draftList}>
              {items.map((item) => {
                const total = itemTotal(item);

                // "RSD 220.00" · "2 × RSD 159.00" · "No price yet" · "2 × no price yet"
                let detail = '';
                if (item.unitPrice === null) {
                  detail = 'No price yet';
                  if (item.quantity > 1) {
                    detail = `${item.quantity} × no price yet`;
                  }
                } else {
                  const price = formatMoney(item.unitPrice, currency);
                  detail = price;
                  if (item.quantity > 1) {
                    detail = `${item.quantity} × ${price}`;
                  }
                }

                return (
                  <li key={item.id} className={styles.draftItem}>
                    <span className={styles.draftText}>
                      <span className={styles.draftName}>{item.name}</span>
                      <span className={styles.draftDetail}>{detail}</span>
                    </span>
                    {total !== null && (
                      <span className={styles.draftTotal}>
                        {formatMoney(total, currency)}
                      </span>
                    )}
                    <button
                      type="button"
                      className={styles.removeButton}
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                    >
                      <svg
                        className={styles.icon}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

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
