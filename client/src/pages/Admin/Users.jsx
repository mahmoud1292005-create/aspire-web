import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Table from '../../components/Tables/Table';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';
import { Select } from '../../components/Forms/FormFields';
import Modal from '../../components/Modals/Modal';
import Loading from '../../components/Loading/Loading';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    api.get('/admin/users').then((res) => setUsers(res.data.users || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/admin/users', { ...data, role: 'Participant' });
      toast.success('Participant created');
      setOpen(false);
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}`, { status: user.status === 'active' ? 'inactive' : 'active' });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <Card title="Participants" action={<Button onClick={() => setOpen(true)}>Add Participant</Button>}>
      <Table
        data={users}
        columns={[
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'college', label: 'College' },
          { key: 'department', label: 'Department' },
          { key: 'registration_number', label: 'Registration No.' },
          { key: 'status', label: 'Status' },
          {
            key: 'actions',
            label: 'Actions',
            render: (u) => (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => toggleStatus(u)}>
                  {u.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="danger" onClick={() => remove(u.id)}>Delete</Button>
              </div>
            ),
          },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Add Participant">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="First Name" error={errors.first_name} {...register('first_name', { required: true })} />
          <Input label="Last Name" error={errors.last_name} {...register('last_name', { required: true })} />
          <Input label="Email" type="email" error={errors.email} {...register('email', { required: true })} />
          <Input label="Phone" error={errors.phone} {...register('phone')} />
          <Input label="College" error={errors.college} {...register('college', { required: true })} />
          <Input label="Department" error={errors.department} {...register('department', { required: true })} />
          <Input label="Registration Number" error={errors.registration_number} {...register('registration_number', { required: true })} />
          <Input label="Password" type="password" error={errors.password} {...register('password', { required: true, minLength: 8 })} />
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button type="submit" disabled={isSubmitting}>Create</Button>
        </form>
      </Modal>
    </Card>
  );
}
