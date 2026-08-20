import { apiRequest, buildQueryString } from './httpClient.js';

export function registerRequest(name, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: { name, email, password }
  });
}

export function loginRequest(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}

// Matches the backend's GET /api/events?category=&keyword=&page=&size=&sortBy=&direction=
// from Day 5 — the backend does the filtering/sorting/paging, this just forwards params.
export function fetchPagedEvents(token, params) {
  const queryString = buildQueryString({
    category: params.category,
    keyword: params.keyword,
    page: params.page,
    size: params.size,
    sortBy: params.sortBy,
    direction: params.direction
  });

  return apiRequest(`/api/events?${queryString}`, { token });
}

export function fetchEventById(id, token) {
  return apiRequest(`/api/events/${id}`, { token });
}

export function createBookingRequest(token, eventId, seatsRequested) {
  return apiRequest('/api/bookings', {
    method: 'POST',
    token,
    body: { eventId, seatsRequested }
  });
}

export function fetchMyBookings(token) {
  return apiRequest('/api/bookings/mine', { token });
}

export function cancelBookingRequest(id, token) {
  return apiRequest(`/api/bookings/${id}`, {
    method: 'DELETE',
    token
  });
}

// ---------- Admin-only calls (backend enforces the ROLE_ADMIN check too) ----------

export function createEventRequest(token, eventPayload) {
  return apiRequest('/api/events', {
    method: 'POST',
    token,
    body: eventPayload
  });
}

export function updateEventRequest(token, id, eventPayload) {
  return apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    token,
    body: eventPayload
  });
}

export function deactivateEventRequest(token, id) {
  return apiRequest(`/api/events/${id}`, {
    method: 'DELETE',
    token
  });
}

export function fetchAllBookings(token) {
  return apiRequest('/api/bookings', { token });
}

export function fetchBookingsPerEventReport(token) {
  return apiRequest('/api/reports/bookings-per-event', { token });
}

export function fetchRevenuePerEventReport(token) {
  return apiRequest('/api/reports/revenue-per-event', { token });
}