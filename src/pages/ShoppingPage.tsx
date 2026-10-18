import { useRef, useState, type PointerEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AddItemForm } from '../components/AddItemForm';
import { EditItemSheet } from '../components/EditItemSheet';
import { FinishTripSheet } from '../components/FinishTripSheet';
import { TripSummary } from '../components/TripSummary';
import { inCartTotal, itemTotal, unpricedCount } from '../domain/calculations';
import { formatListDate } from '../domain/dates';
import { formatMoney } from '../domain/money';
import type { Item } from '../domain/schemas';
import {
  addItem,
  finishList,
  removeItem,
  toggleItem,
  updateItem,
  type NewItem,
} from '../state/actions';
import { useAppContext } from '../state/AppStateContext';
import styles from './ShoppingPage.module.css';

/** How long a finger has to stay on a row to open the Edit sheet. */
const LONG_PRESS_MS = 500;

// One list while you shop: /lists/:id
export function ShoppingPage() {
  const { state, dispatch } = useAppContext();
  const currency = state.settings.currency;

  // The ":id" part of the URL /lists/:id
  const { id } = useParams();

  // A function that moves to another page from our own code (after finishing).
  const navigate = useNavigate();

  // Read the clock once, for "Created today". (Same as on the Lists page.)
  // All hooks must come BEFORE any early `return` below — React needs every
  // hook to run on every render, in the same order.
  const [now] = useState(() => new Date());

  // Is the "In cart" group open? UI state: only this screen needs it, and it is
  // never saved (leave the page and it starts closed again).
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Is the "Finish this trip?" sheet open? Also UI state.
  const [isFinishOpen, setIsFinishOpen] = useState(false);

  // Which item is being edited right now (null = none, so the sheet is closed).
  // We keep only the id; the item itself is looked up in the list below.
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Long-press bookkeeping. useRef, not useState: these must keep their value
  // between renders and change INSTANTLY, but changing them shouldn't redraw
  // anything (nobody sees them).
  // - the id of the running timer (null = no timer running)
  // - did the last press turn into a long press? (then its click must NOT tick)
  const pressTimerRef = useRef<number | null>(null);
  const wasLongPressRef = useRef(false);

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

  // LONG-PRESS -----------------------------------------------------------------
  // Finger (or main mouse button) down on a row: start a timer. If it is still
  // down after LONG_PRESS_MS, open the Edit sheet for that item.
  function handlePressStart(
    event: PointerEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    // Only the MAIN button starts a long press: a finger, a pen, or the left
    // mouse button (button 0). The right mouse button is 2 — ignore it,
    // otherwise holding it opens the sheet AND the browser's menu.
    if (event.button !== 0) {
      return;
    }
    wasLongPressRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      wasLongPressRef.current = true;
      setEditingItemId(itemId);
    }, LONG_PRESS_MS);
  }

  // Finger lifted, moved off the row, or the page scrolled: stop the timer
  // (if it hasn't fired yet, this was just a normal tap).
  function handlePressEnd() {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  // The browser sends a click after every press — also after a long one.
  // A normal tap ticks the item; the click after a long press is ignored.
  function handleItemClick(itemId: string) {
    if (wasLongPressRef.current) {
      wasLongPressRef.current = false;
      return;
    }
    handleToggle(itemId);
  }
  // ---------------------------------------------------------------------------

  // AddItemForm calls this with each new item (it has already checked it).
  // Here, "add" means: save it to the list straight away (it goes on top).
  function handleAddItem(newItem: NewItem) {
    dispatch(addItem(listId, newItem));
  }

  // "Finish and save to History": the list becomes 'completed' (the unticked
  // items stay on it as "skipped"), then we go to History. replace: true =
  // Back from History goes to Lists, not to the list you just finished.
  function handleFinish() {
    dispatch(finishList(listId));
    navigate('/history', { replace: true });
  }

  // EDIT ITEM ------------------------------------------------------------------
  // The item being edited (undefined when none, or if it was just deleted).
  const editingItem = list.items.find((item) => item.id === editingItemId);

  function handleUpdateItem(changes: NewItem) {
    if (editingItemId !== null) {
      dispatch(updateItem(listId, editingItemId, changes));
    }
    setEditingItemId(null);
  }

  function handleDeleteItem() {
    if (editingItemId !== null) {
      dispatch(removeItem(listId, editingItemId));
    }
    setEditingItemId(null);
  }
  // ---------------------------------------------------------------------------

  // RENDER SINGLE ITEM JSX ----------------------------------------------------
  // One item row. A plain function that returns JSX, used for both groups below.
  function renderItem(item: Item) {
    const total = itemTotal(item);

    // The small line under the name:
    // "RSD 220.00" · "2 × RSD 159.00" · no price: "Quantity 2" (or nothing for 1),
    // because the orange "No price" tag on the right already says the rest.
    let detail = '';
    if (item.unitPrice === null) {
      if (item.quantity > 1) {
        detail = `Quantity ${item.quantity}`;
      }
    } else {
      const price = formatMoney(item.unitPrice, currency);
      detail = price;
      if (item.quantity > 1) {
        detail = `${item.quantity} × ${price}`;
      }
    }

    return (
      <li key={item.id} className={styles.itemRow}>
        {/* Two buttons side by side: the big one ticks, the ✎ one edits.
            aria-pressed tells screen readers if the item is ticked. */}
        <button
          type="button"
          className={styles.item}
          aria-pressed={item.isBought}
          onClick={() => handleItemClick(item.id)}
          onPointerDown={(event) => handlePressStart(event, item.id)}
          onPointerUp={handlePressEnd}
          onPointerLeave={handlePressEnd}
          onPointerCancel={handlePressEnd}
          // A long press on a phone normally opens the browser's own menu.
          onContextMenu={(event) => event.preventDefault()}
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
            {detail !== '' && (
              <span className={styles.itemDetail}>{detail}</span>
            )}
          </span>
          {/* On the right: the item's total, or an orange "No price" tag */}
          {total !== null && (
            <span className={styles.itemTotal}>
              {formatMoney(total, currency)}
            </span>
          )}
          {total === null && (
            <span className={styles.noPriceTag}>No price</span>
          )}
        </button>
        <button
          type="button"
          className={styles.editButton}
          aria-label={`Edit ${item.name}`}
          onClick={() => setEditingItemId(item.id)}
        >
          <svg
            className={styles.icon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
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
        <span className={styles.headerSpacer} />
        <button
          type="button"
          className={styles.finishButton}
          onClick={() => setIsFinishOpen(true)}
        >
          <svg
            className={styles.icon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 22V4M4 4h13l-2 4 2 4H4" />
          </svg>
          Finish
        </button>
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

      {/* FINISH SHOP TRIP SHEET */}
      <FinishTripSheet
        isOpen={isFinishOpen}
        onClose={() => setIsFinishOpen(false)}
        onFinish={handleFinish}
        list={list}
        currency={currency}
        now={now}
      />

      {/* EDIT ITEM SHEET (open while an item is being edited) */}
      <EditItemSheet
        item={editingItem}
        currency={currency}
        canDelete={list.items.length > 1}
        onClose={() => setEditingItemId(null)}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
      />
    </main>
  );
}
