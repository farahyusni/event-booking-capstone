import { useContext } from 'react';
import { EventDataContext } from './event-data-context.js';

export function useEventData() {
  const value = useContext(EventDataContext);

  if (!value) {
    throw new Error('useEventData must be used inside EventDataProvider');
  }

  return value;
}
