import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

const supervisorLinks = [
  { to: '/supervisor/dashboard', label: 'Dashboard' },
  { to: '/supervisor/participants', label: 'Participants' },
  { to: '/supervisor/schedules', label: 'Schedules' },
  { to: '/supervisor/events', label: 'Events' },
  { to: '/supervisor/feedback', label: 'Feedback' },
  { to: '/supervisor/reports', label: 'Reports' },
  { to: '/supervisor/profile', label: 'Profile' },
  { to: '/supervisor/change-password', label: 'Change Password' },
];

export default function SupervisorLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar links={supervisorLinks} />
      <div className="flex flex-1 flex-col">
        <Navbar title="Supervisor Portal" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
