import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'PROVIDER']),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const activeRole = watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authRegister(values);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      if (err.errorDetails?.errorSource) {
        err.errorDetails.errorSource.forEach((e: any) => {
          const path = e.path.replace('body.', '') as keyof RegisterFormValues;
          setError(path, { type: 'server', message: e.message });
        });
      } else {
        toast.error(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-md w-full my-12 p-8 rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-extrabold text-white">Join GearUp</h2>
        <p className="text-xs text-slate-400 mt-1">Rent gears or earn passive income lending them</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Toggle Selector */}
        <div>
          <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Register As</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setValue('role', 'CUSTOMER')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeRole === 'CUSTOMER'
                  ? 'bg-accentTeal text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'PROVIDER')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeRole === 'PROVIDER'
                  ? 'bg-accentTeal text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Provider
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
          <input
            type="text"
            className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
            placeholder="Jane Doe"
            {...register('name')}
          />
          {errors.name && <span className="text-xs text-rose-400 mt-1 block">{errors.name.message}</span>}
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Phone</label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
              placeholder="+880..."
              {...register('phone')}
            />
          </div>
          <div>
            <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Address</label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
              placeholder="Dhaka"
              {...register('address')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accentTeal py-3 mt-2 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-accentTeal font-bold hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
};
export default Register;
