import { useEffect, useRef } from 'react';
import DataControls from '../components/DataControls.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EventList from '../components/EventList.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import LoadingMessage from '../components/LoadingMessage.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import { useEventData } from '../context/useEventData.js';

export default function EventsPage() {
  // Guards against React StrictMode double-invoking effects in dev, which
  // would otherwise fire two fetches on first mount.
  const initialLoadRef = useRef(false);

  const { items, loading, error, pageInfo, filters, loadEventsPage } = useEventData();

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    initialLoadRef.current = true;
    loadEventsPage();
  }, [loadEventsPage]);

  return (
    <>
      <DataControls
        pageInfo={pageInfo}
        loading={loading}
        onRefresh={() => loadEventsPage({ page: pageInfo.page })}
        onPageSizeChange={(size) => loadEventsPage({ page: 0, size })}
        onSortChange={(sortBy, direction) => loadEventsPage({ page: 0, sortBy, direction })}
      />

      {/* NOTE: every keystroke here triggers a real request (the backend does
          the filtering, not the browser) — there's no debounce yet. Fine at
          capstone scale; a debounce would be the natural next polish (see §15
          "Advanced filters" in the brief — optional, not required). */}
      <FilterPanel
        keyword={filters.keyword}
        category={filters.category}
        onKeywordChange={(keyword) => loadEventsPage({ page: 0, keyword })}
        onCategoryChange={(category) => loadEventsPage({ page: 0, category })}
      />

      {loading && <LoadingMessage message="Loading events..." />}
      {error && <ErrorMessage message={error} />}

      <EventList events={items} />

      <PaginationControls
        pageInfo={pageInfo}
        loading={loading}
        onPageChange={(page) => loadEventsPage({ page })}
      />
    </>
  );
}
