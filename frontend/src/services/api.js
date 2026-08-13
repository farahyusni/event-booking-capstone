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