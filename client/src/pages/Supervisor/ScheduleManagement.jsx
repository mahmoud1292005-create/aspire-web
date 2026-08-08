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

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [pending, setPending] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    api.get('/schedules')
      .then((res) => {
        setSchedules(res.data.schedules || []);
        setPending(res.data.pendingRequests || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/schedules', data);
      toast.success('Schedule created');
      setOpen(false);
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const review = async (id, action) => {
    try {
      await api.put(`/schedules/${action}/${id}`);
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}. Email sent.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <Card title="Schedules" action={<Button onClick={() => setOpen(true)}>Create Schedule</Button>}>
        <Table
          data={schedules}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'date', label: 'Date' },
            { key: 'start_time', label: 'Start' },
            { key: 'end_time', label: 'End' },
          ]}
        />
      </Card>

      <Card title="Pending Schedule Requests">
        <Table
          data={pending}
          columns={[
            { key: 'participant_first_name', label: 'Participant', render: (r) => `${r.participant_first_name} ${r.participant_last_name}` },
            { key: 'participant_college', label: 'College' },
            { key: 'participant_department', label: 'Department' },
            { key: 'title', label: 'Schedule' },
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

      <Modal open={open} onClose={() => setOpen(false)} title="Create Schedule">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" error={errors.title} {...register('title', { required: true })} />
          <Input label="Description" error={errors.description} {...register('description')} />
          <Input label="Date" type="date" error={errors.date} {...register('date', { required: true })} />
          <Input label="Start Time" type="time" error={errors.start_time} {...register('start_time', { required: true })} />
          <Input label="End Time" type="time" error={errors.end_time} {...register('end_time', { required: true })} />
          <Button type="submit" disabled={isSubmitting}>Create</Button>
        </form>
      </Modal>
    </div>
  );
}
