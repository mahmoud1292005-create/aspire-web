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

export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => {
    api.get('/admin/supervisors').then((res) => setSupervisors(res.data.supervisors || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/admin/users', data);
      toast.success('User created');
      setOpen(false);
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <Card title="Supervisors & Admins" action={<Button onClick={() => setOpen(true)}>Add User</Button>}>
      <Table
        data={supervisors}
        columns={[
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status' },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Add Supervisor/Admin">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="First Name" {...register('first_name', { required: true })} />
          <Input label="Last Name" {...register('last_name', { required: true })} />
          <Input label="Email" type="email" {...register('email', { required: true })} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Password" type="password" {...register('password', { required: true, minLength: 8 })} />
          <Select label="Role" {...register('role', { required: true })}>
            <option value="Supervisor">Supervisor</option>
            <option value="Admin">Admin</option>
          </Select>
          <Button type="submit" disabled={isSubmitting}>Create</Button>
        </form>
      </Modal>
    </Card>
  );
}
