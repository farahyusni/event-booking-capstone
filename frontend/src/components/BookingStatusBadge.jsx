export default function BookingStatusBadge({ status }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>;
}