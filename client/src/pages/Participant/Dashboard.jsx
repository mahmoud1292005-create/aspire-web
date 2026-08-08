import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Loading from '../../components/Loading/Loading';

export default function ParticipantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/schedules'), api.get('/events')])
      .then(([schedulesRes, eventsRes]) => {
        const approved = schedulesRes.data.myRequests?.filter((r) => r.status === 'Approved') || [];
        const pendingEvents = eventsRes.data.myRegistrations?.filter((r) => r.status === 'Pending') || [];
        setData({ approved, pendingEvents });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="My Approved Schedules">
        {data.approved.length ? (
          <ul className="space-y-2">
            {data.approved.map((s) => (
              <li key={s.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-medium">{s.title}</p>
                <p className="text-slate-500">{s.date} · {s.start_time} - {s.end_time}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No approved schedules yet.</p>
        )}
      </Card>
      <Card title="Pending Event Requests">
        {data.pendingEvents.length ? (
          <ul className="space-y-2">
            {data.pendingEvents.map((e) => (
              <li key={e.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-medium">{e.title}</p>
                <p className="text-slate-500">{e.date} · {e.location}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No pending event requests.</p>
        )}
      </Card>
    </div>
  );
}
