import { useState, type SubmitEvent } from 'react';
import {
  formatMoney,
  moneyInputSchema,
  moneyToInputText,
} from '../domain/money';
import {
  firstErrorMessage,
  itemNameSchema,
  LIMITS,
  type Currency,
  type Item,
} from '../domain/schemas';
import { clamp } from '../lib/clamp';
import type { NewItem } from '../state/actions';
import { BottomSheetLayout } from './BottomSheetLayout';
import styles from './EditItemSheet.module.css';

type EditItemSheetProps = {
  /** The item being edited, or undefined when the sheet is closed. */
  item: Item | undefined;
  currency: Currency;
  /** false when this is the list's only item (a list can never be empty). */
  canDelete: boolean;
  onClose: () => void;
  /** Called with the checked changes. The page does the saving. */
  onUpdate: (changes: NewItem) => void;
  onDelete: () => void;
};

// The "Edit item" sheet. Open while there is an item to edit.
export function EditItemSheet({
  item,
  currency,
  canDelete,
  onClose,
  onUpdate,
  onDelete,
}: EditItemSheetProps) {
  return (
    <BottomSheetLayout
      isOpen={item !== undefined}
      onClose={onClose}
      titleId="edit-item-title"
    >
      <div className={styles.header}>
        <h2 id="edit-item-title" className={styles.title}>
          Edit item
        </h2>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            className={styles.icon}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* The form only exists while an item is being edited. Closing the sheet
          removes it (and its state), so the next item gets a fresh form that
          starts from that item's values. */}
      {item !== undefined && (
        <EditItemForm
          item={item}
          currency={currency}
          canDelete={canDelete}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </BottomSheetLayout>
  );
}

type EditItemFormProps = {
  item: Item;
  currency: Currency;
  canDelete: boolean;
  onUpdate: (changes: NewItem) => void;
  onDelete: () => void;
};

// EDIT ITEM FORM --------------------------------------------------
// The form inside the sheet: starts from the item's current values.
function EditItemForm({
  item,
  currency,
  canDelete,
  onUpdate,
  onDelete,
}: EditItemFormProps) {
  // Start values = the item as it is now. Used only when this form first appears.
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [priceText, setPriceText] = useState(moneyToInputText(item.unitPrice));

  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Line total, worked out live from what is typed right now.
  // (Only when the price is a valid amount; otherwise "No price".)
  let lineTotalText = 'No price';
  const livePrice = moneyInputSchema.safeParse(priceText);
  if (livePrice.success && livePrice.data !== null) {
    lineTotalText = formatMoney(quantity * livePrice.data, currency);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // The same checks as when adding an item.
    const nameResult = itemNameSchema.safeParse(name);
    const priceResult = moneyInputSchema.safeParse(priceText);

    if (nameResult.success) {
      setNameError(null);
    } else {
      setNameError(firstErrorMessage(nameResult.error));
    }
    if (priceResult.success) {
      setPriceError(null);
    } else {
      setPriceError(firstErrorMessage(priceResult.error));
    }

    if (!nameResult.success || !priceResult.success) {
      return;
    }

    onUpdate({
      name: nameResult.data,
      quantity,
      unitPrice: priceResult.data,
    });
  }

  function handleNameChange(text: string) {
    setName(text);
    setNameError(null);
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
    <form className={styles.form} onSubmit={handleSubmit}>
      <div>
        <label htmlFor="edit-item-name" className={styles.label}>
          Name
        </label>
        <input
          id="edit-item-name"
          type="text"
          className={styles.nameInput}
          maxLength={LIMITS.itemNameMaxLength}
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          aria-invalid={nameError !== null}
          aria-describedby="edit-item-name-error"
        />
        {nameError !== null && (
          <p id="edit-item-name-error" className={styles.error} role="alert">
            {nameError}
          </p>
        )}
      </div>

      <div className={styles.twoColumns}>
        <div>
          <span id="edit-item-quantity" className={styles.label}>
            Quantity
          </span>
          <div
            role="group"
            aria-labelledby="edit-item-quantity"
            className={styles.stepper}
          >
            <button
              type="button"
              className={styles.stepButton}
              aria-label="Decrease quantity"
              disabled={quantity <= LIMITS.quantityMin}
              onClick={decreaseQuantity}
            >
              <svg
                className={styles.icon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
              </svg>
            </button>
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
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="edit-item-price" className={styles.label}>
            Price each
          </label>
          <div className={styles.priceField}>
            <span className={styles.currency}>{currency}</span>
            <input
              id="edit-item-price"
              type="text"
              inputMode="decimal"
              className={styles.priceInput}
              placeholder="Optional"
              value={priceText}
              onChange={(event) => handlePriceChange(event.target.value)}
              aria-invalid={priceError !== null}
              aria-describedby="edit-item-price-error"
            />
          </div>
        </div>
      </div>
      {priceError !== null && (
        <p id="edit-item-price-error" className={styles.error} role="alert">
          {priceError}
        </p>
      )}

      <div className={styles.lineTotal}>
        <span className={styles.lineTotalLabel}>Line total</span>
        <span className={styles.lineTotalValue}>{lineTotalText}</span>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.deleteButton}
          disabled={!canDelete}
          aria-describedby="edit-item-delete-note"
          onClick={onDelete}
        >
          <svg
            className={styles.icon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
          </svg>
          Delete
        </button>
        <button type="submit" className={styles.saveButton}>
          Save changes
        </button>
      </div>
      {!canDelete && (
        <p id="edit-item-delete-note" className={styles.note}>
          This is the only item, and a list can't be empty. To remove it, delete
          the whole list.
        </p>
      )}
    </form>
  );
}
