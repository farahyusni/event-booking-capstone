import { Link } from 'react-router';
import CategoryBadge from './CategoryBadge.jsx';
import EmptyState from './EmptyState.jsx';
import { formatDateTime } from '../utils/formatDate.js';

// Each row links to its own details route (/events/:id) rather than the
// instructor template's click-to-select side panel — the brief asks for the
// listing page and the details page as two separate pages (see EventDetailsPage.jsx).
export default function EventList({ events }) {
  if (events.length === 0) {
    return <EmptyState message="No events match the current filters." />;
  }

  return (
    <section className="card">
      <div className="section-heading">
        <h2>Events</h2>
        <p>Click an event to see full details and book seats.</p>
      </div>

      <div className="event-list">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className={event.cancelled ? 'event-row cancelled' : 'event-row'}
          >
            <div>
              <strong>{event.title}</strong>
              <span>{event.venue} · {formatDateTime(event.eventDate)}</span>

              {/* Sold-out events stay listed rather than being filtered out like
                  cancelled/past ones: a cancelled booking calls releaseSeats() and
                  puts a seat straight back, so "full" is temporary. Showing it here
                  means nobody clicks through only to find a disabled button. */}
              <span className={event.seatsAvailable === 0 ? 'seats-left sold-out' : 'seats-left'}>
                {event.seatsAvailable === 0
                  ? 'Sold out'
                  : `${event.seatsAvailable} seat${event.seatsAvailable === 1 ? '' : 's'} left`}
              </span>
            </div>

            {/* Price shown here because it's sortable in DataControls — sorting by a
                value the row never displays gives the user no visible feedback.
                "Free" wording matches EventDetailsPage so the two pages agree. */}
            <div className="event-row-side">
              <span className="event-price">
                {event.price === 0 ? 'Free' : `RM ${event.price.toFixed(2)}`}
              </span>
              <CategoryBadge category={event.category} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
