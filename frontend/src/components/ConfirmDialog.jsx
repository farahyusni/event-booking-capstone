import { useEffect, useRef } from 'react';

// Uses the native <dialog> element rather than a hand-rolled div overlay: it
// gives us the focus trap, the Escape key and an inert background for free,
// which a plain overlay would have to reimplement (usually badly).
export default function ConfirmDialog({
  title,
  lines = [],
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel
}) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;

    if (el && !el.open) {
      el.showModal();
    }

    // Focus the safe option, not the destructive one — pressing Enter by reflex
    // should never be what confirms a cancellation.
    confirmRef.current?.parentElement?.querySelector('.btn-ghost')?.focus();

    // Attached natively rather than via React's onCancel prop: the DOM 'cancel'
    // event does not bubble, so React's synthetic version of it never fires here.
    // preventDefault stops the browser closing the dialog on its own, leaving
    // React the single source of truth for whether it is mounted.
    function handleEscape(nativeEvent) {
      nativeEvent.preventDefault();
      onCancel();
    }

    el?.addEventListener('cancel', handleEscape);
    return () => el?.removeEventListener('cancel', handleEscape);
  }, [onCancel]);

  // Clicking the backdrop targets the <dialog> element itself, not its contents.
  function handleBackdrop(clickEvent) {
    if (clickEvent.target === dialogRef.current) {
      onCancel();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal-${tone}`}
      onClick={handleBackdrop}
      aria-labelledby="confirm-title"
    >
      <div className="modal-body">
        <h2 id="confirm-title">{title}</h2>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" ref={confirmRef} className="btn btn-solid" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
