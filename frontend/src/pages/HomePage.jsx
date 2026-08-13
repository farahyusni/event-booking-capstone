import { useAuth } from '../context/useAuth.js';

export default function HomePage() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="home-page">
      <h1>Welcome, {user?.name}</h1>
      <p>Role: {user?.role}</p>
      {isAdmin && <p>You are an admin.</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}