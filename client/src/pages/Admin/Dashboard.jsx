import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Loading from '../../components/Loading/Loading';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
      <Card title="Participants"><p className="text-3xl font-bold">{stats.totalParticipants}</p></Card>
      <Card title="Active Participants"><p className="text-3xl font-bold text-emerald-600">{stats.activeParticipants}</p></Card>
      <Card title="Events"><p className="text-3xl font-bold">{stats.totalEvents}</p></Card>
      <Card title="Schedules"><p className="text-3xl font-bold">{stats.totalSchedules}</p></Card>
      <Card title="Avg Rating"><p className="text-3xl font-bold">{stats.averageRating || 'N/A'}</p></Card>
    </div>
  );
}
