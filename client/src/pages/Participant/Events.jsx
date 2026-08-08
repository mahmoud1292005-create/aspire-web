import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Table from '../../components/Tables/Table';
import Button from '../../components/Buttons/Button';
import Loading from '../../components/Loading/Loading';

export default function Events() {
  const [tab, setTab] = useState('available');
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/events')
      .then((res) => {
        setEvents(res.data.events || []);
        setMyRegistrations(res.data.myRegistrations || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const requestEvent = async (eventId) => {
    try {
      await api.post('/events/request', { event_id: eventId });
      toast.success('Event requested. Supervisor will be notified.');
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
        <Button variant={tab === 'mine' ? 'primary' : 'secondary'} onClick={() => setTab('mine')}>My Events</Button>
      </div>

      {tab === 'available' ? (
        <Card title="Available Events">
          <Table
            data={events.filter((e) => !e.isRequested)}
            columns={[
              { key: 'title', label: 'Event' },
              { key: 'date', label: 'Date' },
              { key: 'location', label: 'Location' },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <Button onClick={() => requestEvent(row.id)}>Request</Button>
                ),
              },
            ]}
            emptyMessage="No available events"
          />
        </Card>
      ) : (
        <Card title="My Event Requests">
          <Table
            data={myRegistrations}
            columns={[
              { key: 'title', label: 'Event' },
              { key: 'date', label: 'Date' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status' },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
