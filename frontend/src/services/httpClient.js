import { AUTH_STORAGE_KEY } from '../constants/storage.js';

export async function apiRequest(path, options = {}) {
  const { method = 'GET', token, body, headers = {} } = options;

  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get('content-type') ?? '';
  const responseBody = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    // A 401 on a request that carried a token means the token itself is
    // missing/expired/invalid (Spring Security rejects it before the request
    // even reaches a controller). AuthContext only checks "is there a token
    // in localStorage", not "is it still valid", so without this the app
    // would sit on a stale session showing cryptic "Request failed with
    // status 401" errors on every call instead of sending the user back to
    // log in. Gated on `token` specifically — not just "any 401" — because
    // the login endpoint itself also returns 401 for a wrong password, and
    // that's a normal, expected error the login form already shows inline,
    // not a session timeout.
    if (response.status === 401 && token) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login?sessionExpired=1');
      }
    }

    const message = responseBody?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return responseBody;
}

// Turns a params object into a query string, skipping any value that's empty,
// null or undefined — so an unfilled filter never becomes "?category=" or
// "?page=undefined" on the actual request.
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
}