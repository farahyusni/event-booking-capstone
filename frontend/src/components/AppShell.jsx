import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth.js';

// Shared layout for every logged-in page: header + nav + whichever page is
// currently routed (rendered via <Outlet/>). Wrapping the protected routes in
// this once means Day 12/13 pages just plug straight into the same shell
// instead of each page re-building its own header/logout button.
export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Event Booking</p>
          <h1>Event Booking System</h1>
        </div>
        <div className="user-panel">
          <span>{user?.name}</span>
          <strong>{user?.role}</strong>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* More links (My Bookings on Day 12, Admin on Day 13) get added here
          as those pages are built — no dead links in the meantime. */}
      <nav className="app-nav" aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/events">Events</NavLink>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
