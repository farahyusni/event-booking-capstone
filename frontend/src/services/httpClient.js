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