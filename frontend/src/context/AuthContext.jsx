import { useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../services/api.js';
import { AuthContext } from './auth-context.js';

const STORAGE_KEY = 'eventBookingAuth';

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function toAuthState(response) {
  return {
    token: response.token,
    tokenType: response.tokenType,
    expiresInMinutes: response.expiresInMinutes,
    user: {
      id: response.userId,
      name: response.name,
      email: response.email,
      role: response.role
    }
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  async function login(email, password) {
    const nextAuth = toAuthState(await loginRequest(email, password));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
    return nextAuth;
  }

  async function register(name, email, password) {
    const nextAuth = toAuthState(await registerRequest(name, email, password));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
    return nextAuth;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }

  const value = useMemo(
    () => ({
      auth,
      token: auth?.token ?? '',
      user: auth?.user ?? null,
      isAuthenticated: Boolean(auth?.token),
      isAdmin: auth?.user?.role === 'ADMIN',
      login,
      register,
      logout
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}