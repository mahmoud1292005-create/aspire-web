import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/supervisors', label: 'Supervisors' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/profile', label: 'Profile' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar links={adminLinks} />
      <div className="flex flex-1 flex-col">
        <Navbar title="Admin Portal" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
