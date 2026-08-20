import { Navigate } from 'react-router';
import { useAuth } from '../context/useAuth.js';

// Sits inside ProtectedRoute, so by the time this runs we already know the
// user is logged in - this only adds the extra role check on top, same way
// SecurityConfig.java adds hasRole("ADMIN") on top of authenticated() on the backend.
export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
