import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import CategoryBadge from '../../components/CategoryBadge.jsx';
import DataControls from '../../components/DataControls.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import FilterPanel from '../../components/FilterPanel.jsx';
import LoadingMessage from '../../components/LoadingMessage.jsx';
import PaginationControls from '../../components/PaginationControls.jsx';
import { useAuth } from '../../context/useAuth.js';
import { useEventData } from '../../context/useEventData.js';
import { deactivateEventRequest, reactivateEventRequest } from '../../services/api.js';

// Reuses the same EventDataContext as the customer-facing EventsPage.jsx —
// same search/filter/sort/pagination the brief asks for, just with admin
// actions (edit/deactivate) on each row instead of a link to book seats.
export default function AdminEventsPage() {
  const initialLoadRef = useRef(false);
  const { token } = useAuth();
  const { items, loading, error, pageInfo, filters, loadEventsPage } = useEventData();
  const [actionError, setActionError] = useState('');
  const [deactivatingId, setDeactivatingId] = useState('');
  const [reactivatingId, setReactivatingId] = useState('');

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    initialLoadRef.current = true;
    loadEventsPage();
  }, [loadEventsPage]);

  // Takes the whole event (not just the id) so the confirmation can tell the
  // admin how many customers they're about to affect.
  async function handleDeactivate(event) {
    // Same derivation EventService.updateEvent uses on the backend. Cancelled
    // bookings release their seats (releaseSeats), so this only ever counts
    // seats that are still actively held.
    const bookedSeats = event.capacity - event.seatsAvailable;

    const message =
      bookedSeats > 0
        ? `"${event.title}" already has ${bookedSeats} seat(s) booked by customers.\n\n` +
          'Deactivating stops any NEW bookings. Existing bookings are kept and those ' +
          'customers keep their seats — they will see a note that the event was cancelled.\n\n' +
          'You can reactivate this event later.\n\nAre you sure?'
        : `Deactivate "${event.title}"?\n\n` +
          'No seats are booked yet. No new bookings can be made after this, ' +
          'but you can reactivate it later.';

    if (!window.confirm(message)) {
      return;
    }

    setDeactivatingId(event.id);
    setActionError('');

    try {
      await deactivateEventRequest(token, event.id);
      await loadEventsPage({ page: pageInfo.page });
    } catch (err) {
      setActionError(err.message || 'Could not deactivate this event.');
    } finally {
      setDeactivatingId('');
    }
  }

  // No confirmation dialog here, unlike deactivate — reactivating is safe and
  // reversible (and can't un-block the past-event booking rule regardless).
  async function handleReactivate(eventId) {
    setReactivatingId(eventId);
    setActionError('');

    try {
      await reactivateEventRequest(token, eventId);
      await loadEventsPage({ page: pageInfo.page });
    } catch (err) {
      setActionError(err.message || 'Could not reactivate this event.');
    } finally {
      setReactivatingId('');
    }
  }

  return (
    <>
      <section className="card welcome-card">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Manage Events</h2>
          <p>Create, edit, and deactivate events.</p>
        </div>
        <Link className="button-link" to="/admin/events/new">Create Event</Link>
      </section>

      <DataControls
        pageInfo={pageInfo}
        loading={loading}
        onRefresh={() => loadEventsPage({ page: pageInfo.page })}
        onPageSizeChange={(size) => loadEventsPage({ page: 0, size })}
        onSortChange={(sortBy, direction) => loadEventsPage({ page: 0, sortBy, direction })}
      />

      <FilterPanel
        keyword={filters.keyword}
        category={filters.category}
        onKeywordChange={(keyword) => loadEventsPage({ page: 0, keyword })}
        onCategoryChange={(category) => loadEventsPage({ page: 0, category })}
      />

      {loading && <LoadingMessage message="Loading events..." />}
      {error && <ErrorMessage message={error} />}
      {actionError && <ErrorMessage message={actionError} />}
      {!loading && items.length === 0 && <EmptyState message="No events match the current filters." />}

      {items.length > 0 && (
        <section className="card">
          <div className="event-list">
            {items.map((event) => (
              <div key={event.id} className={event.cancelled ? 'event-row cancelled' : 'event-row'}>
                <div>
                  <strong>{event.title}</strong>
                  <span>
                    {event.venue} &middot; {new Date(event.eventDate).toLocaleString()} &middot;{' '}
                    {event.seatsAvailable}/{event.capacity} seats
                  </span>
                  <span>{event.cancelled ? 'Cancelled' : 'Active'} &middot; RM {event.price}</span>
                </div>

                <div className="admin-row-actions">
                  <CategoryBadge category={event.category} />
                  <Link className="button-link secondary" to={`/admin/events/${event.id}/edit`}>Edit</Link>
                  {event.cancelled ? (
                    <button
                      type="button"
                      className="button-link secondary"
                      disabled={reactivatingId === event.id}
                      onClick={() => handleReactivate(event.id)}
                    >
                      {reactivatingId === event.id ? 'Reactivating...' : 'Reactivate'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="button-link secondary"
                      disabled={deactivatingId === event.id}
                      onClick={() => handleDeactivate(event)}
                    >
                      {deactivatingId === event.id ? 'Deactivating...' : 'Deactivate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <PaginationControls
        pageInfo={pageInfo}
        loading={loading}
        onPageChange={(page) => loadEventsPage({ page })}
      />
    </>
  );
}
