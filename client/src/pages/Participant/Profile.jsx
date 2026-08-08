import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Cards/Card';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (user) reset(user);
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const res = await api.put(`/participants/${user.id}`, data);
      setUser(res.data.participant);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <Card title="My Profile">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
        <Input label="First Name" error={errors.first_name} {...register('first_name', { required: true })} />
        <Input label="Last Name" error={errors.last_name} {...register('last_name', { required: true })} />
        <Input label="Email" {...register('email')} disabled />
        <Input label="Phone" error={errors.phone} {...register('phone')} />
        <Input label="College" error={errors.college} {...register('college', { required: true })} />
        <Input label="Department" error={errors.department} {...register('department', { required: true })} />
        <Input label="Registration Number" error={errors.registration_number} {...register('registration_number', { required: true })} />
        <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
      </form>
    </Card>
  );
}
