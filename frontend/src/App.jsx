import { Routes, Route } from 'react-router';
import './App.css';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
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
      </Route>
    </Routes>
  );
}