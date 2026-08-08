import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Table from '../../components/Tables/Table';
import Loading from '../../components/Loading/Loading';

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/supervisor/participants')
      .then((res) => setParticipants(res.data.participants || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <Card title="Participants">
      <Table
        data={participants}
        columns={[
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'college', label: 'College' },
          { key: 'department', label: 'Department' },
          { key: 'registration_number', label: 'Registration No.' },
          { key: 'status', label: 'Status' },
        ]}
      />
    </Card>
  );
}
