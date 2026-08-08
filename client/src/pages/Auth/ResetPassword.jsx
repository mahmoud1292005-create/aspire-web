import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';
import Card from '../../components/Cards/Card';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      // The link in the reset email points here with ?token=<reset token>
      // (see server/services/emailService.js). The backend looks it up
      // against password_reset_tokens and checks it hasn't expired.
      await api.post('/auth/reset-password', { token, password: data.password });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed - the link may have expired');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card title="Reset Password" className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="New Password" type="password" {...register('password', { required: true, minLength: 8 })} />
          <Button type="submit" className="w-full" disabled={isSubmitting || !token}>Reset Password</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
        </p>
      </Card>
    </div>
  );
}