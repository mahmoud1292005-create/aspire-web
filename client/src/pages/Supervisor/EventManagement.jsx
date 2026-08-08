import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Table from '../../components/Tables/Table';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';
import Modal from '../../components/Modals/Modal';
import Loading from '../../components/Loading/Loading';

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [pending, setPending] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    api.get('/events')
      .then((res) => {
        setEvents(res.data.events || []);
        setPending(res.data.pendingRegistrations || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/events', data);
      toast.success(`Event created. ${res.data.notifiedCount} participants notified.`);
      setOpen(false);
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${deleteTarget.id}`);
      toast.success('Event deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const review = async (id, action) => {
    try {
      await api.put(`/events/${action}/${id}`);
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}. Email sent.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <Card title="Events" action={<Button onClick={() => setOpen(true)}>Create Event</Button>}>
        <Table
          data={events}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'date', label: 'Date' },
            { key: 'location', label: 'Location' },
            { key: 'start_time', label: 'Start' },
            { key: 'end_time', label: 'End' },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <Button variant="danger" onClick={() => setDeleteTarget(r)}>Delete</Button>
              ),
            },
          ]}
        />
      </Card>

      <Card title="Pending Event Registration Requests">
        <Table
          data={pending}
          columns={[
            { key: 'participant_first_name', label: 'Participant', render: (r) => `${r.participant_first_name} ${r.participant_last_name}` },
            { key: 'participant_college', label: 'College' },
            { key: 'participant_department', label: 'Department' },
            { key: 'title', label: 'Event' },
            { key: 'date', label: 'Date' },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex gap-2">
                  <Button variant="success" onClick={() => review(r.id, 'approve')}>Approve</Button>
                  <Button variant="danger" onClick={() => review(r.id, 'reject')}>Reject</Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Event">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" error={errors.title} {...register('title', { required: true })} />
          <Input label="Description" error={errors.description} {...register('description')} />
          <Input label="Location" error={errors.location} {...register('location')} />
          <Input label="Date" type="date" error={errors.date} {...register('date', { required: true })} />
          <Input label="Start Time" type="time" error={errors.start_time} {...register('start_time', { required: true })} />
          <Input label="End Time" type="time" error={errors.end_time} {...register('end_time', { required: true })} />
          <Button type="submit" disabled={isSubmitting}>Create Event</Button>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Event">
        <p className="mb-4 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-medium text-slate-900">{deleteTarget?.title}</span>?
          This will also remove its schedules and registrations. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Event'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
