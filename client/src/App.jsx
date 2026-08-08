import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import ParticipantLayout from './layouts/ParticipantLayout';
import SupervisorLayout from './layouts/SupervisorLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import ParticipantDashboard from './pages/Participant/Dashboard';
import ParticipantSchedule from './pages/Participant/Schedule';
import ParticipantEvents from './pages/Participant/Events';
import ParticipantFeedback from './pages/Participant/Feedback';
import ParticipantProfile from './pages/Participant/Profile';
import ParticipantChangePassword from './pages/Participant/ChangePassword';
import SupervisorDashboard from './pages/Supervisor/Dashboard';
import SupervisorParticipants from './pages/Supervisor/Participants';
import ScheduleManagement from './pages/Supervisor/ScheduleManagement';
import EventManagement from './pages/Supervisor/EventManagement';
import SupervisorFeedback from './pages/Supervisor/Feedback';
import SupervisorReports from './pages/Supervisor/Reports';
import SupervisorProfile from './pages/Supervisor/Profile';
import SupervisorChangePassword from './pages/Supervisor/ChangePassword';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminSupervisors from './pages/Admin/Supervisors';
import AdminReports from './pages/Admin/Reports';
import AdminSettings from './pages/Admin/Settings';
import AdminProfile from './pages/Admin/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/participant" element={<ProtectedRoute roles={['Participant']}><ParticipantLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParticipantDashboard />} />
            <Route path="schedule" element={<ParticipantSchedule />} />
            <Route path="events" element={<ParticipantEvents />} />
            <Route path="feedback" element={<ParticipantFeedback />} />
            <Route path="profile" element={<ParticipantProfile />} />
            <Route path="change-password" element={<ParticipantChangePassword />} />
          </Route>

          <Route path="/supervisor" element={<ProtectedRoute roles={['Supervisor', 'Admin']}><SupervisorLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SupervisorDashboard />} />
            <Route path="participants" element={<SupervisorParticipants />} />
            <Route path="schedules" element={<ScheduleManagement />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="feedback" element={<SupervisorFeedback />} />
            <Route path="reports" element={<SupervisorReports />} />
            <Route path="profile" element={<SupervisorProfile />} />
            <Route path="change-password" element={<SupervisorChangePassword />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="supervisors" element={<AdminSupervisors />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
