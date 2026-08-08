import { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Table from '../../components/Tables/Table';
import Loading from '../../components/Loading/Loading';

export default function SupervisorFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/feedback')
      .then((res) => setFeedback(res.data.feedback || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <Card title="Participant Feedback">
      <Table
        data={feedback}
        columns={[
          { key: 'event_title', label: 'Event' },
          { key: 'first_name', label: 'Participant', render: (r) => `${r.first_name} ${r.last_name}` },
          { key: 'college', label: 'College' },
          { key: 'department', label: 'Department' },
          { key: 'rating', label: 'Rating' },
          { key: 'comment', label: 'Comment' },
          { key: 'created_at', label: 'Submitted', render: (r) => new Date(r.created_at).toLocaleString() },
        ]}
      />
    </Card>
  );
}
