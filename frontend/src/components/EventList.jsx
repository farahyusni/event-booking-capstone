import { Link } from 'react-router';
import CategoryBadge from './CategoryBadge.jsx';
import EmptyState from './EmptyState.jsx';

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
              <span>{event.venue} · {new Date(event.eventDate).toLocaleString()}</span>
            </div>
            <CategoryBadge category={event.category} />
          </Link>
        ))}
      </div>
    </section>
  );
}
