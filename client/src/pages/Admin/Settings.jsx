import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';
import Loading from '../../components/Loading/Loading';

const toggleLabels = {
  welcome: 'Welcome email',
  scheduleApproved: 'Schedule approved',
  scheduleRejected: 'Schedule rejected',
  eventInvitation: 'New event announcement',
  eventReminder: 'Event reminder',
  passwordReset: 'Password reset',
  scheduleRequest: 'Schedule request notification',
  eventRegistration: 'Event request/approval notification',
  feedbackSubmitted: 'Feedback submitted',
  dailySummary: 'Daily supervisor summary',
};

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => setSettings(res.data.settings))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      const res = await api.put('/admin/settings', settings);
      setSettings(res.data.settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  if (loading) return <Loading />;

  const toggles = settings.email_toggles || {};

  return (
    <div className="space-y-6">
      <Card title="Email Notifications">
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(toggleLabels).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={toggles[key] !== false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email_toggles: { ...toggles, [key]: e.target.checked },
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Automation Settings">
        <div className="grid max-w-lg gap-4">
          <Input
            label="Event Reminder (hours before)"
            type="number"
            value={settings.event_reminder_hours || 24}
            onChange={(e) =>
              setSettings({ ...settings, event_reminder_hours: Number(e.target.value) })
            }
          />
          <Input
            label="Daily Summary Time (HH:MM)"
            value={(settings.daily_summary_time || '08:00').replace(/"/g, '')}
            onChange={(e) =>
              setSettings({ ...settings, daily_summary_time: e.target.value })
            }
          />
          <label className="text-sm font-medium text-slate-700">Event Announcement Scope</label>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={(settings.event_invite_scope || 'all_active_participants').replace(/"/g, '')}
            onChange={(e) =>
              setSettings({ ...settings, event_invite_scope: e.target.value })
            }
          >
            <option value="all_active_participants">All active participants</option>
            <option value="approved_schedule_participants">Participants with approved schedules</option>
          </select>
        </div>
        <Button className="mt-4" onClick={save}>Save Settings</Button>
      </Card>
    </div>
  );
}
