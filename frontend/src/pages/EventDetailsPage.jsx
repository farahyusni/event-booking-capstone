import { useCallback, useEffect, useReducer, useState } from 'react';
import { Link, useParams } from 'react-router';
import CategoryBadge from '../components/CategoryBadge.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingMessage from '../components/LoadingMessage.jsx';
import { createBookingRequest, fetchEventById } from '../services/api.js';
import { useAuth } from '../context/useAuth.js';
import { formatDateTime } from '../utils/formatDate.js';

const initialState = { event: null, loading: true, error: '' };

function detailReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { event: null, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { event: action.event, loading: false, error: '' };
    case 'FETCH_ERROR':
      return { event: null, loading: false, error: action.message };
    default:
      return state;
  }
}

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const { token } = useAuth();
  const [state, dispatch] = useReducer(detailReducer, initialState);
  const { event, loading, error } = state;

  // Separate from the event-loading state above — booking is its own action
  // with its own loading/error/success feedback, not tied to page load.
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  // Pure fetch, no dispatch here — that's left to the caller, since the two
  // call sites below (initial load vs. post-booking refresh) need slightly
  // different handling around it.
  const loadEvent = useCallback(() => fetchEventById(eventId, token), [eventId, token]);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'FETCH_START' });

    loadEvent()
      .then((data) => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_SUCCESS', event: data });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_ERROR', message: err.message || 'Could not load this event.' });
        }
      });

    // Stops a slow response for an old eventId overwriting state after the
    // user has already navigated to a different event.
    return () => {
      cancelled = true;
    };
  }, [loadEvent]);

  async function handleBookingSubmit(formEvent) {
    formEvent.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    setBookingMessage('');

    try {
      await createBookingRequest(token, event.id, Number(seatsRequested));
      setBookingMessage(`Booked ${seatsRequested} seat(s) successfully.`);
      setSeatsRequested(1);

      // Re-fetch so the seats-available count on screen reflects the booking
      // we just made, instead of showing the stale pre-booking number.
      const refreshed = await loadEvent();
      dispatch({ type: 'FETCH_SUCCESS', event: refreshed });
    } catch (err) {
      setBookingError(err.message || 'Could not complete booking.');
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return <LoadingMessage message="Loading event..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!event) {
    return <ErrorMessage message="Event not found." />;
  }

  const isPast = new Date(event.eventDate) <= new Date();
  const canBook = !event.cancelled && !isPast;

  return (
    <>
      <section className="card">
        <div className="section-heading">
          <p className="eyebrow"><Link to="/events">&larr; Back to events</Link></p>
          <h2>{event.title}</h2>
          <CategoryBadge category={event.category} />
        </div>

        <dl className="detail-list">
          <div>
            <dt>Description</dt>
            <dd>{event.description || 'No description provided.'}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{event.venue}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDateTime(event.eventDate)}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{event.price === 0 ? 'Free' : `RM ${event.price.toFixed(2)}`}</dd>
          </div>
          <div>
            <dt>Seats available</dt>
            <dd>{event.seatsAvailable} / {event.capacity}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{event.cancelled ? 'Cancelled' : 'Open for booking'}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <div className="section-heading">
          <h2>Book this event</h2>
        </div>

        {canBook ? (
          <form onSubmit={handleBookingSubmit} className="auth-form">
            <label>
              Seats
              <input
                type="number"
                min={1}
                max={event.seatsAvailable}
                value={seatsRequested}
                onChange={(e) => setSeatsRequested(e.target.value)}
                required
              />
            </label>

            {bookingError && <ErrorMessage message={bookingError} />}
            {bookingMessage && <p className="message success-message">{bookingMessage}</p>}
            {bookingLoading && <LoadingMessage message="Booking..." />}

            <button type="submit" disabled={bookingLoading || event.seatsAvailable === 0}>
              {bookingLoading ? 'Please wait...' : event.seatsAvailable === 0 ? 'Fully booked' : 'Book now'}
            </button>
          </form>
        ) : (
          <p className="message error-message">
            {event.cancelled ? 'This event has been cancelled.' : 'This event has already taken place.'}
          </p>
        )}
      </section>
    </>
  );
}