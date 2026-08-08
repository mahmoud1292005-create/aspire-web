import { NavLink } from 'react-router-dom';
import aspireLogo from '../../assets/aspire-logo.png';

export default function Sidebar({ links }) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <img src={aspireLogo} alt="Aspire" className="h-10 w-10 rounded-full object-cover" />
        <div>
          <p className="text-lg font-bold text-blue-600">Aspire</p>
          <p className="text-xs text-slate-500">Participant Management</p>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
