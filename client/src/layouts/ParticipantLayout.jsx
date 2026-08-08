import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

const participantLinks = [
  { to: '/participant/dashboard', label: 'Dashboard' },
  { to: '/participant/schedule', label: 'Schedule' },
  { to: '/participant/events', label: 'Events' },
  { to: '/participant/feedback', label: 'Feedback' },
  { to: '/participant/profile', label: 'Profile' },
  { to: '/participant/change-password', label: 'Change Password' },
];

export default function ParticipantLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar links={participantLinks} />
      <div className="flex flex-1 flex-col">
        <Navbar title="Participant Portal" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
