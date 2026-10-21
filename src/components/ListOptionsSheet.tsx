import { useState } from 'react';
import { formatListDate } from '../domain/dates';
import type { ShoppingList } from '../domain/schemas';
import { BottomSheetLayout } from './BottomSheetLayout';
import styles from './ListOptionsSheet.module.css';

type ListOptionsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Called by "Uncheck all items". The page does the saving. */
  onUncheckAll: () => void;
  /** Called by "Delete list" on the "Are you sure?" step. */
  onDelete: () => void;
  list: ShoppingList;
  /** The current time, read once by the page (for "Created today"). */
  now: Date;
};

/** What the sheet shows right now: the menu, or the "Delete this list?" step. */
type OptionsView = 'menu' | 'delete';

// The ⋯ sheet: things you do to the WHOLE list (not to one item).
export function ListOptionsSheet({
  isOpen,
  onClose,
  onUncheckAll,
  onDelete,
  list,
  now,
}: ListOptionsSheetProps) {
  // UI state that only this sheet cares about.
  const [view, setView] = useState<OptionsView>('menu');

  // Every way of closing (Close, Cancel… Esc, a tap on the dark area) comes
  // through here, so the next time the sheet opens it starts on the menu again.
  function handleClose() {
    setView('menu');
    onClose();
  }

  let itemsText = `${list.items.length} items`;
  if (list.items.length === 1) {
    itemsText = '1 item';
  }

  const inCartCount = list.items.filter((item) => item.isBought).length;
  let uncheckText = `Put ${inCartCount} items back on the route`;
  if (inCartCount === 1) {
    uncheckText = 'Put 1 item back on the route';
  }

  // RENDER "DELETE THIS LIST?" STEP -------------------------------------------
  if (view === 'delete') {
    return (
      <BottomSheetLayout
        isOpen={isOpen}
        onClose={handleClose}
        titleId="options-title"
      >
        <h2 id="options-title" className={styles.title}>
          Delete this list?
        </h2>
        <p className={styles.text}>
          “{list.title}” and its {itemsText} will be deleted. This can’t be
          undone.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={onDelete}
          >
            Delete list
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setView('menu')}
          >
            Cancel
          </button>
        </div>
      </BottomSheetLayout>
    );
  }
  // ---------------------------------------------------------------------------

  // RENDER MENU ---------------------------------------------------------------
  return (
    <BottomSheetLayout
      isOpen={isOpen}
      onClose={handleClose}
      titleId="options-title"
    >
      <h2 id="options-title" className={styles.title}>
        {list.title}
      </h2>
      <p className={styles.meta}>
        {formatListDate(list.createdAt, now)} · {itemsText}
      </p>

      <ul className={styles.options}>
        {/* Only when there is something to uncheck */}
        {inCartCount > 0 && (
          <li className={styles.option}>
            <button
              type="button"
              className={styles.optionButton}
              onClick={onUncheckAll}
            >
              <span className={styles.optionIcon}>
                <svg
                  className={styles.icon}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>Uncheck all items</span>
                <span className={styles.optionHint}>{uncheckText}</span>
              </span>
            </button>
          </li>
        )}
        <li className={styles.option}>
          <button
            type="button"
            className={styles.optionButtonWarning}
            onClick={() => setView('delete')}
          >
            <span className={styles.optionIconWarning}>
              <svg
                className={styles.icon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
              </svg>
            </span>
            <span className={styles.optionText}>
              <span className={styles.optionLabel}>Delete list</span>
              <span className={styles.optionHint}>
                You’ll be asked to confirm
              </span>
            </span>
          </button>
        </li>
      </ul>

      <button
        type="button"
        className={styles.secondaryButton}
        onClick={handleClose}
      >
        Close
      </button>
    </BottomSheetLayout>
  );
}
