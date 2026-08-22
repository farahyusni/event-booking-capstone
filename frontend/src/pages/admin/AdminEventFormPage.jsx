import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingMessage from '../../components/LoadingMessage.jsx';
import { useAuth } from '../../context/useAuth.js';
import { createEventRequest, fetchEventById, updateEventRequest } from '../../services/api.js';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  eventDate: '',
  venue: '',
  capacity: 1,
  price: 0
};

// <input type="datetime-local"> wants "yyyy-MM-ddTHH:mm" — trims the seconds
// the backend sends back (LocalDateTime -> ISO string) so the edit form's
// value doesn't get rejected for the extra precision.
function toDateTimeLocal(isoString) {
  return isoString ? isoString.slice(0, 16) : '';
}

export default function AdminEventFormPage() {
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let cancelled = false;

    fetchEventById(eventId, token)
      .then((event) => {
        if (cancelled) return;
        setForm({
          title: event.title,
          description: event.description || '',
          category: event.category,
          eventDate: toDateTimeLocal(event.eventDate),
          venue: event.venue,
          capacity: event.capacity,
          price: event.price
        });
      })
      .catch((err) => !cancelled && setError(err.message || 'Could not load this event.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [eventId, isEditMode, token]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(formEvent) {
    formEvent.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      price: Number(form.price)
    };

    try {
      if (isEditMode) {
        await updateEventRequest(token, eventId, payload);
      } else {
        await createEventRequest(token, payload);
      }
      navigate('/admin/events', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save this event.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingMessage message="Loading event..." />;
  }

  return (
    <section className="card">
      <div className="section-heading">
        <p className="eyebrow"><Link to="/admin/events">&larr; Back to admin events</Link></p>
        <h2>{isEditMode ? 'Edit Event' : 'Create Event'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Title
          <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
        </label>

        <label>
          Description
          <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} />
        </label>

        <label>
          Category
          <input type="text" value={form.category} onChange={(e) => updateField('category', e.target.value)} required />
        </label>

        <label>
          Venue
          <input type="text" value={form.venue} onChange={(e) => updateField('venue', e.target.value)} required />
        </label>

        <label>
          Event date and time
          <input
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => updateField('eventDate', e.target.value)}
            required
          />
        </label>

        <label>
          Capacity
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => updateField('capacity', e.target.value)}
            required
          />
        </label>

        <label>
          Price (RM)
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            required
          />
        </label>

        {error && <ErrorMessage message={error} />}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEditMode ? 'Save changes' : 'Create event'}
        </button>
      </form>
    </section>
  );
}
