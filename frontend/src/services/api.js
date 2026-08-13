import { apiRequest } from './httpClient.js';

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