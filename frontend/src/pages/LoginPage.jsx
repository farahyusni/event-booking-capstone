import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams, Link } from 'react-router';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingMessage from '../components/LoadingMessage.jsx';
import { useAuth } from '../context/useAuth.js';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectTo = location.state?.from?.pathname || '/';
  // Set by httpClient.js when a token-carrying request comes back 401 — see
  // the comment there for why this can't be confused with a wrong password
  // typed into this form (that never carries a token in the first place).
  const sessionExpired = searchParams.get('sessionExpired') === '1';

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Login</h1>

      {sessionExpired && (
        <p className="message error-message">Your session has timed out. Please log in again.</p>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <ErrorMessage message={error} />}
        {loading && <LoadingMessage message="Logging in..." />}

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Login'}
        </button>
      </form>

      {/* Demo affordance so a marker can reach the admin pages without seeding an
          account by hand. This would never ship in a real system — credentials on
          a public login screen. Registration always creates CUSTOMER (AuthService),
          so this is the only way in to the admin views. */}
      <div className="login-help">
        <strong>Demo admin account</strong>
        <span>Email: admin@gmail.com</span>
        <span>Password: abc12345</span>
      </div>

      <p>No account yet? <Link to="/register">Register</Link></p>
    </div>
  );
}