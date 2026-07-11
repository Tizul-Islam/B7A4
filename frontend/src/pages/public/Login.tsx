import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (err: any) {
      // Map validation errors from the backend to react-hook-form fields
      if (err.errorDetails?.errorSource) {
        err.errorDetails.errorSource.forEach((e: any) => {
          const path = e.path.replace('body.', '') as keyof LoginFormValues;
          setError(path, { type: 'server', message: e.message });
        });
      } else {
        toast.error(err.message || 'Login failed.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-md w-full my-12 p-8 rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-extrabold text-white">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">Access your GearUp rental account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
          <input
            type="email"
            className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
            placeholder="jane@example.com"
            {...register('email')}
          />
          {errors.email && <span className="text-xs text-rose-400 mt-1 block">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && <span className="text-xs text-rose-400 mt-1 block">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accentTeal py-3 mt-2 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-400">
        Don’t have an account?{' '}
        <Link to="/register" className="text-accentTeal font-bold hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
};
export default Login;
