import { useState, type SubmitEvent } from 'react';
import { moneyInputSchema } from '../domain/money';
import {
  firstErrorMessage,
  itemNameSchema,
  LIMITS,
  type Currency,
} from '../domain/schemas';
import { clamp } from '../lib/clamp';
import type { NewItem } from '../state/actions';
import styles from './AddItemForm.module.css';

type AddItemFormProps = {
  currency: Currency;
  /**
   * A function from the parent page. The form calls it with each new item,
   * and the PARENT decides what to do with it (keep it in a draft, or save it).
   * `(newItem: NewItem) => void` = "a function that takes a NewItem and returns nothing".
   */
  onAdd: (newItem: NewItem) => void;
};

// The add-item row: name + [+], then a quantity stepper and an optional price.
// Used on the New list page and on the Shopping page.
export function AddItemForm({ currency, onAdd }: AddItemFormProps) {
  // What is typed in the row right now (UI state — this form only).
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priceText, setPriceText] = useState('');

  // Error messages for the row (null = no problem).
  const [itemNameError, setItemNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Runs on Enter in the row, or when [+] is tapped.
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // A form's default submit reloads the page — that would wipe everything.
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

    // Hand the new item to the parent page.
    onAdd({
      name: nameResult.data, // cleaned by Zod: "  Milk   2% " → "Milk 2%"
      quantity,
      unitPrice: priceResult.data,
    });

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

  return (
    // Its own form, so Enter in any of these fields adds the item
    <form onSubmit={handleSubmit} aria-label="Add item">
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
        <div role="group" aria-label="Quantity" className={styles.stepper}>
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
  );
}
