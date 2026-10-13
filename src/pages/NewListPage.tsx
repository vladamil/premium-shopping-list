import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { itemTotal, plannedTotal } from '../domain/calculations';
import {
  budgetInputSchema,
  formatMoney,
  moneyInputSchema,
} from '../domain/money';
import {
  firstErrorMessage,
  itemNameSchema,
  LIMITS,
  listTitleSchema,
  type Item,
} from '../domain/schemas';
import { clamp } from '../lib/clamp';
import { createList } from '../state/actions';
import { useAppContext } from '../state/AppStateContext';
import styles from './NewListPage.module.css';

// Make a new list: a name, items and an optional budget.
export function NewListPage() {
  const { state, dispatch } = useAppContext();
  const currency = state.settings.currency;

  // A function that moves to another page from our own code (after saving).
  const navigate = useNavigate();

  // What the user has typed so far. React holds it; each input only shows it.
  // Nothing is saved until "Create list".
  const [title, setTitle] = useState('');
  const [budgetText, setBudgetText] = useState('');

  // Error messages for the whole list, shown after "Create list" (null = no problem).
  const [titleError, setTitleError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // The items added so far (newest on top), and the add-item row.
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priceText, setPriceText] = useState('');

  // Error messages for the add-item row (null = no problem).
  const [itemNameError, setItemNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // ADD ITEM FUNCTION -------------------------------------------
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
    setItemsError(null); // there is at least one item now

    // Empty the row, ready for the next item.
    setItemName('');
    setQuantity(1);
    setPriceText('');
  }
  // -----------------------------------------------------------------------------

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

  function handleTitleChange(text: string) {
    setTitle(text);
    setTitleError(null);
  }

  function handleBudgetChange(text: string) {
    setBudgetText(text);
    setBudgetError(null);
  }

  // CREATE LIST FUNCTION ---------------------------------------------------
  // Runs when "Create list" is tapped.
  function handleCreateList() {
    // Check everything, the same way as the add-item row.
    const titleResult = listTitleSchema.safeParse(title);
    const budgetResult = budgetInputSchema.safeParse(budgetText);
    const hasItems = items.length > 0;

    if (titleResult.success) {
      setTitleError(null);
    } else {
      setTitleError(firstErrorMessage(titleResult.error));
    }
    if (hasItems) {
      setItemsError(null);
    } else {
      setItemsError('Add at least one item');
    }
    if (budgetResult.success) {
      setBudgetError(null);
    } else {
      setBudgetError(firstErrorMessage(budgetResult.error));
    }

    if (!titleResult.success || !hasItems || !budgetResult.success) {
      return;
    }

    // Save it: createList builds the new list (with its id), dispatch puts it
    // into the app state (and so into localStorage).
    const action = createList(titleResult.data, items, budgetResult.data); // action creator for 'createList'
    dispatch(action);

    // Open the new list. replace: true swaps this page out of the browser
    // history, so Back from the new list goes to Lists, not to an empty form.
    navigate(`/lists/${action.payload.list.id}`, { replace: true });
  }
  // ------------------------------------------------------------------------------------------

  // For the bottom bar: "1 item" / "3 items" and the planned total.
  let itemCountText = `${items.length} items`;
  if (items.length === 1) {
    itemCountText = '1 item';
  }
  const planned = formatMoney(plannedTotal(items), currency);

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
            onChange={(event) => handleTitleChange(event.target.value)}
            aria-invalid={titleError !== null}
            aria-describedby="list-name-error"
          />
          {titleError !== null && (
            <p id="list-name-error" className={styles.error} role="alert">
              {titleError}
            </p>
          )}
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

          {itemsError !== null && (
            <p className={styles.error} role="alert">
              {itemsError}
            </p>
          )}

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
              value={budgetText}
              onChange={(event) => handleBudgetChange(event.target.value)}
              aria-invalid={budgetError !== null}
              aria-describedby="list-budget-error list-budget-hint"
            />
          </div>
          {budgetError !== null && (
            <p id="list-budget-error" className={styles.error} role="alert">
              {budgetError}
            </p>
          )}
          <p id="list-budget-hint" className={styles.hint}>
            You will see a warning if the planned total gets close.
          </p>
        </div>
      </div>

      {/* Stuck to the bottom: the running totals and the main button */}
      <div className={styles.bottomBar}>
        <div className={styles.summary}>
          <span className={styles.summaryCount}>{itemCountText}</span>
          <span className={styles.summaryPlanned}>{planned} planned</span>
        </div>
        <button
          type="button"
          className={styles.createButton}
          onClick={handleCreateList}
        >
          Create list
          <svg
            className={styles.icon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </main>
  );
}
