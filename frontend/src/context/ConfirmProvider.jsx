import { useCallback, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { ConfirmContext } from './confirm-context.js';

// Bridges the gap between window.confirm (synchronous, blocking) and a React
// modal (rendered, asynchronous): confirm() hands back a Promise and stashes its
// resolve function alongside the dialog's content. Clicking a button resolves
// that Promise and unmounts the dialog, so `await confirm(...)` at the call site
// reads just like the blocking version it replaced.
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({ ...options, resolve });
    });
  }, []);

  // useCallback so these identities stay stable across renders — ConfirmDialog
  // keeps them in an effect dependency list, and fresh arrow functions each
  // render would make that effect re-run (re-stealing focus every time).
  const settle = useCallback((answer) => {
    setDialog((current) => {
      current?.resolve(answer);
      return null;
    });
  }, []);

  const handleConfirm = useCallback(() => settle(true), [settle]);
  const handleCancel = useCallback(() => settle(false), [settle]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          lines={dialog.lines}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          tone={dialog.tone}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}
