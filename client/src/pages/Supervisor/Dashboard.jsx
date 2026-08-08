import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Loading from '../../components/Loading/Loading';

export default function SupervisorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/supervisor/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card title="Pending Requests">
        <p className="text-3xl font-bold text-blue-600">{data.pendingRequests?.length || 0}</p>
      </Card>
      <Card title="Recent Feedback">
        <p className="text-3xl font-bold text-emerald-600">{data.recentFeedback?.length || 0}</p>
      </Card>
      <Card title="Today's Events">
        <p className="text-3xl font-bold text-violet-600">{data.todayEvents?.length || 0}</p>
      </Card>
    </div>
  );
}
