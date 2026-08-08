import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/Cards/Card';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';

export default function ChangePassword() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <Card title="Change Password">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
        <Input label="Current Password" type="password" error={errors.currentPassword} {...register('currentPassword', { required: true })} />
        <Input label="New Password" type="password" error={errors.newPassword} {...register('newPassword', { required: true, minLength: 8 })} />
        <Button type="submit" disabled={isSubmitting}>Update Password</Button>
      </form>
    </Card>
  );
}