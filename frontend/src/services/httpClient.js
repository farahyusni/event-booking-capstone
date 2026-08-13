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