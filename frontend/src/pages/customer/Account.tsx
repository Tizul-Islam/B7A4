import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const Account: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch Current Profile Info
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.users.getProfile(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Sync loaded profile to form inputs
  useEffect(() => {
    if (profileData?.data) {
      reset({
        name: profileData.data.name,
        phone: profileData.data.phone || '',
        address: profileData.data.address || '',
      });
    }
  }, [profileData, reset]);

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => api.users.updateProfile(values),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile.');
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
      </div>
    );
  }

  const userObj = profileData?.data;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-sm text-slate-400">View and update your personal details</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Registered Email</label>
              <input
                id="email"
                type="text"
                disabled
                className="w-full rounded-xl border border-white/5 bg-slate-950/30 px-4 py-2.5 font-body text-sm text-slate-500 focus:outline-none cursor-not-allowed"
                value={userObj?.email || ''}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Role Status</label>
              <input
                id="role"
                type="text"
                disabled
                className="w-full rounded-xl border border-white/5 bg-slate-950/30 px-4 py-2.5 font-body text-sm text-slate-500 focus:outline-none cursor-not-allowed"
                value={userObj?.role || ''}
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
            <input
              id="name"
              type="text"
              className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
              placeholder="Jane Doe"
              {...register('name')}
            />
            {errors.name && <span className="text-xs text-rose-400 mt-1 block">{errors.name.message}</span>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
              <input
                id="phone"
                type="text"
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                placeholder="+880..."
                {...register('phone')}
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Billing Address</label>
              <input
                id="address"
                type="text"
                className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                placeholder="Dhaka"
                {...register('address')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-xl bg-accentTeal px-6 py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center justify-center min-w-[140px]"
          >
            {updateMutation.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Save Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Account;
