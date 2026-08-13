import { useEffect, useReducer } from 'react';
import { Link, useParams } from 'react-router';
import CategoryBadge from '../components/CategoryBadge.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingMessage from '../components/LoadingMessage.jsx';
import { fetchEventById } from '../services/api.js';
import { useAuth } from '../context/useAuth.js';

const initialState = { event: null, loading: true, error: '' };

// A reducer instead of three separate useState calls bundles "start loading
// this new event" into one atomic dispatch, instead of multiple setState
// calls fired synchronously in a row inside the effect.
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

// Fetches independently of EventsPage/EventDataContext — this page doesn't
// need to share list state (filters, pagination), just "load one event by id",
// so a small local reducer is simpler than routing it through the context.
export default function EventDetailsPage() {
  const { eventId } = useParams();
  const { token } = useAuth();
  const [state, dispatch] = useReducer(detailReducer, initialState);
  const { event, loading, error } = state;

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'FETCH_START' });

    fetchEventById(eventId, token)
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

    // If the user clicks to a different event before this request finishes,
    // this stops the stale response from overwriting the new event's state.
    return () => {
      cancelled = true;
    };
  }, [eventId, token]);

  if (loading) {
    return <LoadingMessage message="Loading event..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!event) {
    return <ErrorMessage message="Event not found." />;
  }

  return (
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
          <dd>{new Date(event.eventDate).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>{event.price === 0 ? 'Free' : `RM ${event.price}`}</dd>
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

      {/* Booking form/button goes here on Day 12 */}
    </section>
  );
}
