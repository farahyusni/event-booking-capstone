import { useEffect, useReducer } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingMessage from '../../components/LoadingMessage.jsx';
import { useAuth } from '../../context/useAuth.js';
import { fetchBookingsPerEventReport, fetchRevenuePerEventReport } from '../../services/api.js';

const initialState = { bookingsReport: [], revenueReport: [], loading: true, error: '' };

function reportsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, bookingsReport: action.bookings, revenueReport: action.revenue, loading: false, error: '' };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.message };
    default:
      return state;
  }
}

// Both reports come from the same MongoDB aggregation pipeline in
// ReportService.java (group bookings by eventId) — this page just renders
// the two projections of it side by side.
export default function AdminReportsPage() {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(reportsReducer, initialState);
  const { bookingsReport, revenueReport, loading, error } = state;

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'FETCH_START' });

    Promise.all([fetchBookingsPerEventReport(token), fetchRevenuePerEventReport(token)])
      .then(([bookings, revenue]) => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_SUCCESS', bookings, revenue });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_ERROR', message: err.message || 'Could not load reports.' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <section className="card">
        <div className="section-heading">
          <p className="eyebrow">Admin</p>
          <h2>Bookings per Event</h2>
          <p>MongoDB aggregation: confirmed bookings grouped by event.</p>
        </div>

        {loading && <LoadingMessage message="Loading reports..." />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && bookingsReport.length === 0 && (
          <EmptyState message="No confirmed bookings yet." />
        )}

        {bookingsReport.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Total Bookings</th>
                  <th>Total Seats Booked</th>
                </tr>
              </thead>
              <tbody>
                {bookingsReport.map((row) => (
                  <tr key={row.eventId}>
                    <td>{row.eventTitle}</td>
                    <td>{row.totalBookings}</td>
                    <td>{row.totalSeatsBooked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!loading && !error && (
        <section className="card">
          <div className="section-heading">
            <h2>Revenue per Event</h2>
            <p>Total seats booked multiplied by ticket price.</p>
          </div>

          {revenueReport.length === 0 ? (
            <EmptyState message="No revenue yet." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Total Seats Booked</th>
                    <th>Revenue (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueReport.map((row) => (
                    <tr key={row.eventId}>
                      <td>{row.eventTitle}</td>
                      <td>{row.totalSeatsBooked}</td>
                      <td>{row.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
