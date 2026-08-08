import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';
import Card from '../../components/Cards/Card';
import aspireLogo from '../../assets/aspire-logo.png';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await signup(data);
      toast.success('Account created! Welcome email sent.');
      navigate(result.redirectTo);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <img src={aspireLogo} alt="Aspire" className="h-16 w-16 rounded-full object-cover" />
          <p className="mt-2 text-xl font-bold text-blue-600">Aspire</p>
        </div>
        <Card title="Participant Sign Up" className="w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input label="First Name" error={errors.first_name} {...register('first_name', { required: true })} />
            <Input label="Last Name" error={errors.last_name} {...register('last_name', { required: true })} />
            <Input label="Email" type="email" error={errors.email} {...register('email', { required: true })} />
            <Input label="Phone" error={errors.phone} {...register('phone')} />
            <Input label="College" error={errors.college} {...register('college', { required: true })} />
            <Input label="Department" error={errors.department} {...register('department', { required: true })} />
            <Input label="Registration Number" error={errors.registration_number} {...register('registration_number', { required: true })} />
            <Input label="Password" type="password" error={errors.password} {...register('password', { required: true, minLength: 8 })} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>Create Account</Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-blue-600 hover:underline">Already have an account?</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
