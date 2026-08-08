import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Table from '../../components/Tables/Table';
import Button from '../../components/Buttons/Button';
import Loading from '../../components/Loading/Loading';

export default function Schedule() {
  const [tab, setTab] = useState('available');
  const [schedules, setSchedules] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/schedules')
      .then((res) => {
        setSchedules(res.data.schedules || []);
        setMyRequests(res.data.myRequests || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const requestSchedule = async (scheduleId) => {
    try {
      await api.post('/schedules/request', { schedule_id: scheduleId });
      toast.success('Schedule requested. Supervisor will be notified.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant={tab === 'available' ? 'primary' : 'secondary'} onClick={() => setTab('available')}>Available</Button>
        <Button variant={tab === 'mine' ? 'primary' : 'secondary'} onClick={() => setTab('mine')}>My Schedule</Button>
      </div>

      {tab === 'available' ? (
        <Card title="Available Schedules">
          <Table
            data={schedules.filter((s) => !s.isRequested)}
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'date', label: 'Date' },
              { key: 'start_time', label: 'Start' },
              { key: 'end_time', label: 'End' },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <Button onClick={() => requestSchedule(row.id)}>Request</Button>
                ),
              },
            ]}
            emptyMessage="No available schedules"
          />
        </Card>
      ) : (
        <Card title="My Schedule Requests">
          <Table
            data={myRequests}
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
