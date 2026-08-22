import { useCallback, useEffect, useReducer } from 'react';
import BookingStatusBadge from '../../components/BookingStatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingMessage from '../../components/LoadingMessage.jsx';
import { useAuth } from '../../context/useAuth.js';
import { fetchAllBookings, fetchEventById, fetchUserById } from '../../services/api.js';
import { formatDateTime } from '../../utils/formatDate.js';

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

// Booking documents only store eventId and userId (see Booking.java) — no
// event title, no customer name. So resolve both here: dedupe the ids, fetch
// each referenced event and user exactly once, then attach them back onto
// every booking that references them.
//
// Each fetch falls back to null on failure rather than rejecting the whole
// batch, so one deleted event or user degrades that single row instead of
// blanking the entire page.
async function attachBookingDetails(bookings, token) {
  const uniqueEventIds = [...new Set(bookings.map((b) => b.eventId))];
  const uniqueUserIds = [...new Set(bookings.map((b) => b.userId))];

  const [events, users] = await Promise.all([
    Promise.all(uniqueEventIds.map((id) => fetchEventById(id, token).catch(() => null))),
    Promise.all(uniqueUserIds.map((id) => fetchUserById(id, token).catch(() => null)))
  ]);

  const eventsById = Object.fromEntries(uniqueEventIds.map((id, index) => [id, events[index]]));
  const usersById = Object.fromEntries(uniqueUserIds.map((id, index) => [id, users[index]]));

  return bookings.map((booking) => ({
    ...booking,
    event: eventsById[booking.eventId],
    user: usersById[booking.userId]
  }));
}

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { bookings, loading, error } = state;

  const loadBookings = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });

    try {
      const rawBookings = await fetchAllBookings(token);
      const enriched = await attachBookingDetails(rawBookings, token);
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
                {booking.seatsBooked} seat(s) &middot; booked {formatDateTime(booking.bookedAt)}
              </span>
              {/* Falls back to the raw id if the user lookup failed, so the
                  row still identifies the booking rather than showing nothing. */}
              <span>
                {booking.user
                  ? `${booking.user.name} (${booking.user.email})`
                  : `User ID: ${booking.userId}`}
              </span>
            </div>

            <BookingStatusBadge status={booking.status} />
          </div>
        ))}
      </div>
    </section>
  );
}
