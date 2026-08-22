import { useContext } from 'react';
import { ConfirmContext } from './confirm-context.js';

// Returns an async confirm(options) that resolves true/false, so call sites read
// almost exactly like the window.confirm they replaced:
//
//   if (!(await confirm({ title, lines, confirmLabel }))) return;
export function useConfirm() {
  const value = useContext(ConfirmContext);

  if (!value) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }

  return value;
}
