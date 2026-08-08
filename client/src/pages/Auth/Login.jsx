import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';
import Card from '../../components/Cards/Card';
import aspireLogo from '../../assets/aspire-logo.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(result.redirectTo);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <img src={aspireLogo} alt="Aspire" className="h-16 w-16 rounded-full object-cover" />
          <p className="mt-2 text-xl font-bold text-blue-600">Aspire</p>
        </div>
        <Card title="Sign In" className="w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input label="Email" type="email" error={errors.email} {...register('email', { required: 'Email is required' })} />
            <Input label="Password" type="password" error={errors.password} {...register('password', { required: 'Password is required' })} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center text-sm">
            <Link to="/signup" className="text-blue-600 hover:underline">Create participant account</Link>
            <div>
              <Link to="/forgot-password" className="text-slate-500 hover:underline">Forgot password?</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
