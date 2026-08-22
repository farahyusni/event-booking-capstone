import { useCallback, useEffect, useReducer } from 'react';
import { Link } from 'react-router';
import BookingStatusBadge from '../components/BookingStatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingMessage from '../components/LoadingMessage.jsx';
import { cancelBookingRequest, fetchEventById, fetchMyBookings } from '../services/api.js';
import { useAuth } from '../context/useAuth.js';

const initialState = { bookings: [], loading: true, error: '', cancellingId: '' };

function bookingsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, bookings: action.bookings, loading: false, error: '' };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.message };
    case 'CANCEL_START':
      return { ...state, cancellingId: action.id };
    case 'CANCEL_SUCCESS':
      return {
        ...state,
        cancellingId: '',
        bookings: state.bookings.map((b) => (b.id === action.booking.id ? action.booking : b))
      };
    case 'CANCEL_ERROR':
      return { ...state, cancellingId: '', error: action.message };
    default:
      return state;
  }
}

// Booking documents only store eventId (not the event's title/venue) — see
// Booking.java. So this fetches each referenced event once and attaches it,
// deduped by id so booking the same event twice doesn't fetch it twice.
async function attachEventDetails(bookings, token) {
  const uniqueEventIds = [...new Set(bookings.map((b) => b.eventId))];

  const events = await Promise.all(
    uniqueEventIds.map((id) => fetchEventById(id, token).catch(() => null))
  );

  const eventsById = Object.fromEntries(uniqueEventIds.map((id, index) => [id, events[index]]));

  return bookings.map((booking) => ({ ...booking, event: eventsById[booking.eventId] }));
}

export default function MyBookingsPage() {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(bookingsReducer, initialState);
  const { bookings, loading, error, cancellingId } = state;

  const loadBookings = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });

    try {
      const rawBookings = await fetchMyBookings(token);
      const enriched = await attachEventDetails(rawBookings, token);
      dispatch({ type: 'FETCH_SUCCESS', bookings: enriched });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', message: err.message || 'Could not load your bookings.' });
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleCancel(bookingId) {
    dispatch({ type: 'CANCEL_START', id: bookingId });

    try {
      const updated = await cancelBookingRequest(bookingId, token);
      const event = bookings.find((b) => b.id === bookingId)?.event;
      dispatch({ type: 'CANCEL_SUCCESS', booking: { ...updated, event } });
    } catch (err) {
      dispatch({ type: 'CANCEL_ERROR', message: err.message || 'Could not cancel this booking.' });
    }
  }

  return (
    <section className="card">
      <div className="section-heading">
        <h2>My Bookings</h2>
        <p>Bookings you&apos;ve made.</p>
      </div>

      {loading && <LoadingMessage message="Loading your bookings..." />}
      {error && <ErrorMessage message={error} />}
      {!loading && bookings.length === 0 && <EmptyState message="You haven't booked any events yet." />}

      <div className="booking-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-row">
            <div>
              <strong>{booking.event?.title || 'Event no longer available'}</strong>
              <span>
                {booking.seatsBooked} seat(s)
                {booking.event ? ` · ${new Date(booking.event.eventDate).toLocaleString()}` : ''}
              </span>
              {/* An admin can cancel an event that already has bookings (a real
                  venue does exactly that). Existing bookings deliberately stay
                  CONFIRMED rather than being cascade-cancelled — see the note in
                  EventService.deactivateEvent — so surface it here, otherwise the
                  customer just sees "CONFIRMED" for an event that isn't happening. */}
              {booking.event?.cancelled && booking.status === 'CONFIRMED' && (
                <span className="cancelled-notice">This event was cancelled by the organiser.</span>
              )}
              {booking.event && <Link to={`/events/${booking.eventId}`}>View event</Link>}
            </div>

            <div className="booking-row-actions">
              <BookingStatusBadge status={booking.status} />
              {booking.status === 'CONFIRMED' && (
                <button
                  type="button"
                  className="button-link secondary"
                  disabled={cancellingId === booking.id}
                  onClick={() => handleCancel(booking.id)}
                >
                  {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}