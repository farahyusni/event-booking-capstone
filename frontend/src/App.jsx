import { Routes, Route } from 'react-router';
import './App.css';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AdminEventsPage from './pages/admin/AdminEventsPage.jsx';
import AdminEventFormPage from './pages/admin/AdminEventFormPage.jsx';
import AdminBookingsPage from './pages/admin/AdminBookingsPage.jsx';
import AdminReportsPage from './pages/admin/AdminReportsPage.jsx';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import { EventDataProvider } from './context/EventDataContext.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Everything below requires login and shares the AppShell header/nav */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <EventDataProvider>
              <AppShell />
            </EventDataProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailsPage />} />
        <Route path="my-bookings" element={<MyBookingsPage />} />

        {/* Admin-only pages — AdminRoute redirects non-admins to "/" (SecurityConfig.java
            enforces the same ROLE_ADMIN check on the backend, so this is UX, not the real gate) */}
        <Route
          path="admin/events"
          element={
            <AdminRoute>
              <AdminEventsPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/events/new"
          element={
            <AdminRoute>
              <AdminEventFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/events/:eventId/edit"
          element={
            <AdminRoute>
              <AdminEventFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <AdminRoute>
              <AdminBookingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <AdminRoute>
              <AdminReportsPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}