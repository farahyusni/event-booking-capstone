import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingMessage from '../components/LoadingMessage.jsx';
import { useAuth } from '../context/useAuth.js';

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Register</h1>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </label>

        {error && <ErrorMessage message={error} />}
        {loading && <LoadingMessage message="Creating account..." />}

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Register'}
        </button>
      </form>

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}