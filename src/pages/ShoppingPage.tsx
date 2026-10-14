import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { AddItemForm } from '../components/AddItemForm';
import { TripSummary } from '../components/TripSummary';
import { inCartTotal, itemTotal, unpricedCount } from '../domain/calculations';
import { formatListDate } from '../domain/dates';
import { formatMoney } from '../domain/money';
import type { Item } from '../domain/schemas';
import { addItem, toggleItem, type NewItem } from '../state/actions';
import { useAppContext } from '../state/AppStateContext';
import styles from './ShoppingPage.module.css';

// One list while you shop: /lists/:id
export function ShoppingPage() {
  const { state, dispatch } = useAppContext();
  const currency = state.settings.currency;

  // The ":id" part of the URL /lists/:id
  const { id } = useParams();

  // Read the clock once, for "Created today". (Same as on the Lists page.)
  // All hooks must come BEFORE any early `return` below — React needs every
  // hook to run on every render, in the same order.
  const [now] = useState(() => new Date());

  // Is the "In cart" group open? UI state: only this screen needs it, and it is
  // never saved (leave the page and it starts closed again).
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Find the list with this id. find() gives back the first match,
  // or undefined if there is none (deleted list, old link, typo in the URL).
  const list = state.lists.find((oneList) => oneList.id === id);

  // RENDER NOT FOUND LIST ------------------------------------
  if (list === undefined) {
    return (
      <main className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>List not found</h1>
        <p className={styles.notFoundText}>
          It may have been deleted, or the link is out of date.
        </p>
        <Link to="/" className={styles.notFoundLink}>
          Go to your lists
        </Link>
      </main>
    );
  }
  // --------------------------------------------------------------

  // From here on, TypeScript knows `list` is a real list (not undefined).

  let itemsText = `${list.items.length} items`;
  if (list.items.length === 1) {
    itemsText = '1 item';
  }

  // What to show first: items still to buy, then the ones already in the cart.
  // These are two NEW arrays — the stored order of the list never changes.
  const toBuy = list.items.filter((item) => !item.isBought);
  const inCart = list.items.filter((item) => item.isBought);
  const withoutPrice = unpricedCount(toBuy);

  // Tapping an item ticks it (or unticks it): saved straight away.
  const listId = list.id;
  function handleToggle(itemId: string) {
    dispatch(toggleItem(listId, itemId));
  }

  // AddItemForm calls this with each new item (it has already checked it).
  // Here, "add" means: save it to the list straight away (it goes on top).
  function handleAddItem(newItem: NewItem) {
    dispatch(addItem(listId, newItem));
  }

  // RENDER SINGLE ITEM JSX ----------------------------------------------------
  // One item row. A plain function that returns JSX, used for both groups below.
  function renderItem(item: Item) {
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
      <li key={item.id}>
        {/* The whole row is one button: tap anywhere to tick.
            aria-pressed tells screen readers if it's ticked. */}
        <button
          type="button"
          className={styles.item}
          aria-pressed={item.isBought}
          onClick={() => handleToggle(item.id)}
        >
          <span className={styles.stop}>
            {item.isBought ? (
              <span className={styles.stopDone}>
                <svg
                  className={styles.check}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            ) : (
              <span className={styles.stopEmpty} />
            )}
          </span>
          <span className={styles.itemText}>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemDetail}>{detail}</span>
          </span>
          {total !== null && (
            <span className={styles.itemTotal}>
              {formatMoney(total, currency)}
            </span>
          )}
        </button>
      </li>
    );
  }
  // --------------------------------------------------------------------------

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back} aria-label="Back to lists">
          <svg
            className={styles.icon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </header>

      <div className={styles.heading}>
        <h1 className={styles.title}>{list.title}</h1>
        <p className={styles.meta}>
          {formatListDate(list.createdAt, now)} · {itemsText}
        </p>
      </div>

      <TripSummary
        items={list.items}
        budget={list.budget}
        currency={currency}
      />

      <div className={styles.itemsHeader}>
        <span>Next stops · {toBuy.length}</span>
        {withoutPrice > 0 && <span>+{withoutPrice} without price</span>}
      </div>

      {toBuy.length === 0 && (
        <p className={styles.allDone}>Everything is in your cart.</p>
      )}

      {/* The grey line down the left joins the stops, like a route */}
      <div className={styles.route}>
        <ul className={styles.items}>
          {toBuy.map((item) => renderItem(item))}
        </ul>

        {/* The ticked items, folded into one row that opens and closes */}
        {inCart.length > 0 && (
          <>
            <button
              type="button"
              className={styles.cartToggle}
              aria-expanded={isCartOpen}
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <span className={styles.stop}>
                <span className={styles.stopDone}>
                  <svg
                    className={styles.check}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              </span>
              <span className={styles.cartLabel}>
                In cart · {inCart.length}
              </span>
              <span className={styles.cartTotal}>
                {formatMoney(inCartTotal(list.items), currency)}
              </span>
              <svg
                className={styles.chevron}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isCartOpen && (
              <ul className={styles.items}>
                {inCart.map((item) => renderItem(item))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Stuck to the bottom: the same add-item row as on New list */}
      <div className={styles.addBar}>
        <AddItemForm currency={currency} onAdd={handleAddItem} />
      </div>
    </main>
  );
}
