// Shared between AuthContext.jsx (writes/reads it) and httpClient.js (clears
// it on a 401) so both sides always agree on the localStorage key without
// importing each other (that would be circular: AuthContext -> api.js -> httpClient.js).
export const AUTH_STORAGE_KEY = 'eventBookingAuth';
