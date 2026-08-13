import { createContext } from 'react';

// Split into its own file (same pattern as auth-context.js) so this file only
// exports a plain value, not a component — keeps React Fast Refresh happy.
export const EventDataContext = createContext(null);
