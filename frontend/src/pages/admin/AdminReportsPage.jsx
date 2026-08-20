import { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingMessage from '../../components/LoadingMessage.jsx';
import { useAuth } from '../../context/useAuth.js';
import { fetchBookingsPerEventReport, fetchRevenuePerEventReport } from '../../services/api.js';

// Both reports come from the same MongoDB aggregation pipeline in
// ReportService.java (group bookings by eventId) — this page just renders
// the two projections of it side by side.
export default function AdminReportsPage() {
  const { token } = useAuth();
  const [bookingsReport, setBookingsReport] = useState([]);
  const [revenueReport, setRevenueReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([fetchBookingsPerEventReport(token), fetchRevenuePerEventReport(token)])
      .then(([bookings, revenue]) => {
        if (cancelled) return;
        setBookingsReport(bookings);
        setRevenueReport(revenue);
      })
      .catch((err) => !cancelled && setError(err.message || 'Could not load reports.'))
      .finally(() => !cancelled && setLoading(false));

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
