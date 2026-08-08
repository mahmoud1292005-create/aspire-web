import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Button from '../../components/Buttons/Button';
import { Select, TextArea } from '../../components/Forms/FormFields';
import Loading from '../../components/Loading/Loading';

export default function Feedback() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    api.get('/events').then((res) => {
      const eligible = (res.data.myRegistrations || []).filter((e) => {
        const end = new Date(`${e.date}T${e.end_time || '23:59'}`);
        return e.status === 'Accepted' && end < new Date();
      });
      setEvents(eligible);
    }).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/feedback', {
        event_id: Number(data.event_id),
        rating: Number(data.rating),
        comment: data.comment,
      });
      toast.success('Feedback submitted. Supervisor notified.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <Card title="Submit Feedback">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
        <Select label="Completed Event" error={errors.event_id} {...register('event_id', { required: true })}>
          <option value="">Select event</option>
          {events.map((e) => (
            <option key={e.event_id} value={e.event_id}>{e.title} ({e.date})</option>
          ))}
        </Select>
        <Select label="Rating" error={errors.rating} {...register('rating', { required: true })}>
          <option value="">Select rating</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} stars</option>
          ))}
        </Select>
        <TextArea label="Comment" {...register('comment')} />
        <Button type="submit" disabled={isSubmitting || !events.length}>
          Submit Feedback
        </Button>
        {!events.length && <p className="mt-2 text-sm text-slate-500">No completed events available for feedback.</p>}
      </form>
    </Card>
  );
}
