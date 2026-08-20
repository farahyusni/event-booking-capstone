import { useCallback, useEffect, useReducer } from 'react';
import { Link } from 'react-router';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingMessage from '../../components/LoadingMessage.jsx';
import { useAuth } from '../../context/useAuth.js';
import { fetchAllBookings, fetchEventById } from '../../services/api.js';

const initialState = { bookings: [], loading: true, error: '' };

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { bookings: action.bookings, loading: false, error: '' };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.message };
    default:
      return state;
  }
}

// Booking documents only store eventId (see Booking.java), same trade-off as
// MyBookingsPage.jsx — fetch each referenced event once and attach it, deduped.
async function attachEventDetails(bookings, token) {
  const uniqueEventIds = [...new Set(bookings.map((b) => b.eventId))];

  const events = await Promise.all(
    uniqueEventIds.map((id) => fetchEventById(id, token).catch(() => null))
  );

  const eventsById = Object.fromEntries(uniqueEventIds.map((id, index) => [id, events[index]]));

  return bookings.map((booking) => ({ ...booking, event: eventsById[booking.eventId] }));
}

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { bookings, loading, error } = state;

  const loadBookings = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });

    try {
      const rawBookings = await fetchAllBookings(token);
      const enriched = await attachEventDetails(rawBookings, token);
      enriched.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
      dispatch({ type: 'FETCH_SUCCESS', bookings: enriched });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', message: err.message || 'Could not load bookings.' });
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <section className="card">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>All Bookings</h2>
        <p>Every booking made across all customers.</p>
      </div>

      {loading && <LoadingMessage message="Loading bookings..." />}
      {error && <ErrorMessage message={error} />}
      {!loading && bookings.length === 0 && <EmptyState message="No bookings yet." />}

      <div className="booking-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-row">
            <div>
              <strong>{booking.event?.title || 'Event no longer available'}</strong>
              <span>
                {booking.seatsBooked} seat(s) &middot; booked {new Date(booking.bookedAt).toLocaleString()}
              </span>
              <span>User ID: {booking.userId}</span>
              {booking.event && <Link to={`/events/${booking.eventId}`}>View event</Link>}
            </div>

            <BookingStatusBadge status={booking.status} />
          </div>
        ))}
      </div>
    </section>
  );
}
