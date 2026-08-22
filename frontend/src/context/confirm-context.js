import { createContext } from 'react';

// Split out so this file only exports a plain value, not a component —
// same pattern as auth-context.js and event-data-context.js.
export const ConfirmContext = createContext(null);
