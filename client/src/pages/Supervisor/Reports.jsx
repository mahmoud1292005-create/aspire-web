import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Table from '../../components/Tables/Table';
import Loading from '../../components/Loading/Loading';

export default function SupervisorReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/participants'),
      api.get('/reports/events'),
      api.get('/reports/schedules'),
      api.get('/reports/feedback'),
    ]).then(([participants, events, schedules, feedback]) => {
      setReports({ participants: participants.data, events: events.data, schedules: schedules.data, feedback: feedback.data });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Participants"><p className="text-2xl font-bold">{reports.participants.summary.total_participants}</p></Card>
        <Card title="Events"><p className="text-2xl font-bold">{reports.events.summary.totalEvents}</p></Card>
        <Card title="Fill Rate"><p className="text-2xl font-bold">{reports.schedules.summary.fillRate}%</p></Card>
        <Card title="Avg Rating"><p className="text-2xl font-bold">{reports.feedback.summary.average_rating || 'N/A'}</p></Card>
      </div>
      <Card title="Schedule Report">
        <Table data={reports.schedules.schedules} columns={[
          { key: 'title', label: 'Schedule' },
          { key: 'approved', label: 'Approved' },
          { key: 'pending', label: 'Pending' },
          { key: 'rejected', label: 'Rejected' },
        ]} />
      </Card>
      <Card title="Event Report">
        <Table data={reports.events.events} columns={[
          { key: 'title', label: 'Event' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'declined', label: 'Declined' },
          { key: 'pending', label: 'Pending' },
        ]} />
      </Card>
    </div>
  );
}
