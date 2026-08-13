import { useAuth } from '../context/useAuth.js';

// Landing page shown right after login, now sitting inside AppShell's <Outlet/>
// (the old standalone "Welcome" + logout button moved into AppShell itself,
// since every page needs that, not just this one).
export default function HomePage() {
  const { user } = useAuth();

  return (
    <section className="card welcome-card">
      <div>
        <p className="eyebrow">Welcome</p>
        <h2>Hi, {user?.name}</h2>
        <p>You&apos;re logged in as {user?.role}. Browse events to get started.</p>
      </div>
    </section>
  );
}
