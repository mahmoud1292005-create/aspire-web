import { useAuth } from '../../context/AuthContext';
import Button from '../Buttons/Button';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {user && (
          <p className="text-sm text-slate-500">
            {user.first_name} {user.last_name} · {user.role}
          </p>
        )}
      </div>
      <Button variant="ghost" onClick={logout}>
        Logout
      </Button>
    </header>
  );
}
