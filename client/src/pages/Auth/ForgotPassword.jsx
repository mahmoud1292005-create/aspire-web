import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Forms/FormFields';
import Card from '../../components/Cards/Card';
import EmailStatus from '../../components/EmailStatus/EmailStatus';
import { useState } from 'react';

export default function ForgotPassword() {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/forgot-password', data);
      setMessage(res.data.message);
      toast.success('Check your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card title="Forgot Password" className="w-full max-w-md">
        <EmailStatus message={message} type="success" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register('email', { required: true })} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>Send Reset Link</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
        </p>
      </Card>
    </div>
  );
}
