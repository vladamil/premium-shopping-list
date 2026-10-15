import {
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import styles from './BottomSheet.module.css';

type BottomSheetProps = {
  /** Is the sheet open? The parent page decides (UI state). */
  isOpen: boolean;
  /** Called when the user closes the sheet (Esc, a tap on the dark area, or a button). */
  onClose: () => void;
  /** The id of the sheet's heading, so screen readers can say what the sheet is. */
  titleId: string;
  /** What goes inside the sheet: <BottomSheet>…this…</BottomSheet> */
  children: ReactNode;
};

// A panel that slides up from the bottom, over a dark scrim.
// Built on the browser's own <dialog> element, which gives us for free:
// Esc to close, keyboard focus kept inside, and the page behind made unclickable.
export function BottomSheet({
  isOpen,
  onClose,
  titleId,
  children,
}: BottomSheetProps) {
  // A "handle" on the real <dialog> element. React fills in .current after
  // drawing the page; until then it is null.
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Keep the real <dialog> in step with isOpen. A <dialog> can only be opened
  // as a modal by CALLING showModal() on it — there is no attribute for that.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
    }
    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Tapping the dark scrim closes the sheet.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    // The dark scrim isn't its own element: the browser reports a tap on it as a
    // tap on the <dialog> itself. A tap on the panel hits .content or something
    // inside it instead.
    const tappedOutsidePanel = event.target === dialogRef.current;
    if (tappedOutsidePanel) {
      onClose();
    }
  }

  // Esc: the browser first fires "cancel" and would then close the dialog by
  // itself. We stop that and ask the parent instead, so React's isOpen stays
  // in charge (the effect above then closes the dialog).
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  // Safety net: if the browser ever closes the dialog by itself anyway, tell the
  // parent. The "close" event arrives a moment AFTER closing, so we only act if
  // the dialog is really closed now while the parent still thinks it is open
  // (otherwise a late event could close a sheet that was just reopened).
  function handleClose() {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    if (!dialog.open && isOpen) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleClick}
    >
      <div className={styles.content}>
        <div className={styles.handle} aria-hidden="true" />
        {children}
      </div>
    </dialog>
  );
}
