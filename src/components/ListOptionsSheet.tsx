import { useState, type SubmitEvent } from 'react';
import { formatListDate } from '../domain/dates';
import {
  firstErrorMessage,
  LIMITS,
  listTitleSchema,
  type ShoppingList,
} from '../domain/schemas';
import { BottomSheetLayout } from './BottomSheetLayout';
import styles from './ListOptionsSheet.module.css';

type ListOptionsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the new, already checked list name. The page does the saving. */
  onRename: (title: string) => void;
  /** Called by "Uncheck all items". The page does the saving. */
  onUncheckAll: () => void;
  /** Called by "Delete list" on the "Are you sure?" step. */
  onDelete: () => void;
  list: ShoppingList;
  /** The current time, read once by the page (for "Created today"). */
  now: Date;
};

/** What the sheet shows right now: the menu, or one of its steps. */
type OptionsView = 'menu' | 'rename' | 'delete';

// The ⋯ sheet: things you do to the WHOLE list (not to one item).
export function ListOptionsSheet({
  isOpen,
  onClose,
  onRename,
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

  // Same idea: back to the menu first, so the next opening starts there.
  function handleRename(title: string) {
    setView('menu');
    onRename(title);
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

  // RENDER "RENAME LIST" STEP -------------------------------------------------
  if (view === 'rename') {
    return (
      <BottomSheetLayout
        isOpen={isOpen}
        onClose={handleClose}
        titleId="options-title"
      >
        <h2 id="options-title" className={styles.title}>
          Rename list
        </h2>
        <RenameListForm
          currentTitle={list.title}
          onRename={handleRename}
          onCancel={() => setView('menu')}
        />
      </BottomSheetLayout>
    );
  }
  // ---------------------------------------------------------------------------

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
        <li className={styles.option}>
          <button
            type="button"
            className={styles.optionButton}
            onClick={() => setView('rename')}
          >
            <span className={styles.optionIcon}>
              <svg
                className={styles.icon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </span>
            <span className={styles.optionText}>
              <span className={styles.optionLabel}>Rename list</span>
            </span>
            {/* › = "this opens a next step" */}
            <svg
              className={styles.chevron}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </li>
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

type RenameListFormProps = {
  currentTitle: string;
  onRename: (title: string) => void;
  onCancel: () => void;
};

// RENAME LIST FORM ------------------------------------------------------------
// Only on screen during the "Rename list" step, so every time it appears it
// starts again from the list's current name.
function RenameListForm({
  currentTitle,
  onRename,
  onCancel,
}: RenameListFormProps) {
  const [titleText, setTitleText] = useState(currentTitle);
  const [titleError, setTitleError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // The same check as on the New list screen (trims spaces, 1–40 characters).
    const titleResult = listTitleSchema.safeParse(titleText);
    if (!titleResult.success) {
      setTitleError(firstErrorMessage(titleResult.error));
      return;
    }
    onRename(titleResult.data);
  }

  function handleTitleChange(text: string) {
    setTitleText(text);
    setTitleError(null);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="rename-list-title" className={styles.label}>
        List name
      </label>
      {/* autoFocus: the button you tapped is gone now, so put the keyboard
          (and screen reader) straight into the field. */}
      <input
        id="rename-list-title"
        type="text"
        className={styles.input}
        maxLength={LIMITS.titleMaxLength}
        autoFocus
        value={titleText}
        onChange={(event) => handleTitleChange(event.target.value)}
        aria-invalid={titleError !== null}
        aria-describedby="rename-list-title-error"
      />
      {titleError !== null && (
        <p id="rename-list-title-error" className={styles.error} role="alert">
          {titleError}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
          Save name
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
