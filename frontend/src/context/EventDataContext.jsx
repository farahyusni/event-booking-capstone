import { useCallback, useMemo, useReducer } from 'react';
import { fetchPagedEvents } from '../services/api.js';
import { useAuth } from './useAuth.js';
import { EventDataContext } from './event-data-context.js';

// Everything needed to ask the backend for one page of events: which filters,
// which page, how big, and how to sort. This whole shape gets sent as query
// params on every request — see loadEventsPage below.
const initialState = {
  items: [],
  loading: false,
  error: '',
  filters: {
    category: '',
    keyword: '',
    // Customer pages leave this false so cancelled/past events are hidden.
    // AdminEventsPage passes true. The backend still checks the caller's role
    // before honouring it, so this is a view preference, not a permission.
    includeInactive: false
  },
  pageInfo: {
    page: 0,
    size: 5,
    sortBy: 'eventDate',
    direction: 'asc',
    totalPages: 0,
    totalElements: 0
  }
};

// Maps Spring's Page<T> JSON shape (number, totalPages, totalElements, ...)
// onto our own pageInfo shape. The response doesn't echo back sortBy/direction,
// so those come from what we just requested (the "fallback" params).
function toPageInfo(data, fallback) {
  return {
    page: data.number ?? fallback.page,
    size: data.size ?? fallback.size,
    sortBy: fallback.sortBy,
    direction: fallback.direction,
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0
  };
}

function eventReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: '' };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        items: action.data.content ?? [],
        loading: false,
        error: '',
        pageInfo: toPageInfo(action.data, action.params),
        filters: action.filters
      };

    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.message };

    default:
      return state;
  }
}

export function EventDataProvider({ children }) {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // "overrides" lets a caller change just one thing (e.g. only the page number
  // when clicking "Next") while every other current filter/sort value is kept
  // as-is — see EventsPage.jsx for how each control only passes what it changed.
  const loadEventsPage = useCallback(async (overrides = {}) => {
    const filters = {
      category: overrides.category ?? state.filters.category,
      keyword: overrides.keyword ?? state.filters.keyword,
      includeInactive: overrides.includeInactive ?? state.filters.includeInactive
    };

    const params = {
      ...filters,
      page: overrides.page ?? state.pageInfo.page,
      size: overrides.size ?? state.pageInfo.size,
      sortBy: overrides.sortBy ?? state.pageInfo.sortBy,
      direction: overrides.direction ?? state.pageInfo.direction
    };

    dispatch({ type: 'LOAD_START' });

    try {
      const data = await fetchPagedEvents(token, params);
      dispatch({ type: 'LOAD_SUCCESS', data, params, filters });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', message: error.message || 'Could not load events.' });
    }
  }, [state.filters, state.pageInfo, token]);

  const value = useMemo(
    () => ({ ...state, loadEventsPage }),
    [state, loadEventsPage]
  );

  return <EventDataContext.Provider value={value}>{children}</EventDataContext.Provider>;
}
