import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';
import { toast } from 'sonner';

export const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch Users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.admin.users(),
  });

  const users = usersData?.data || [];

  // Toggle user active status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, activeStatus }: { id: string; activeStatus: 'ACTIVE' | 'SUSPENDED' }) =>
      api.admin.updateUserStatus(id, activeStatus),
    onSuccess: (_, variables) => {
      toast.success(`User account status updated to ${variables.activeStatus}.`);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update user status.');
    },
  });

  const handleToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (window.confirm(`Are you sure you want to change this user status to ${nextStatus}?`)) {
      toggleStatusMutation.mutate({ id, activeStatus: nextStatus });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">User Moderation</h1>
        <p className="text-sm text-slate-400">Suspend or activate user accounts across the platform</p>
      </div>

      <DataTable
        headers={['Name', 'Email Address', 'Platform Role', 'Account Status', 'Action']}
        data={users}
        loading={isLoading}
        emptyMessage="No users registered on the platform yet."
        renderRow={(u: any) => {
          const isPending = toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === u.id;

          return (
            <tr key={u.id}>
              <td className="px-6 py-4 font-display text-sm font-bold text-white">{u.name}</td>
              <td className="px-6 py-4 text-sm text-slate-300 font-mono">{u.email}</td>
              <td className="px-6 py-4 text-xs font-bold text-slate-400">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-extrabold border uppercase tracking-wider ${
                  u.role === 'ADMIN'
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800'
                    : u.role === 'PROVIDER'
                    ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4 text-xs font-bold">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-extrabold border uppercase tracking-wider ${
                  u.activeStatus === 'ACTIVE'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800'
                }`}>
                  {u.activeStatus}
                </span>
              </td>
              <td className="px-6 py-4">
                {u.role !== 'ADMIN' ? (
                  <button
                    type="button"
                    disabled={isPending}
                    className={`rounded-lg px-3 py-1 font-display text-xs font-bold transition-all shadow-sm ${
                      u.activeStatus === 'ACTIVE'
                        ? 'bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900'
                        : 'bg-accentTeal hover:bg-accentTealHover text-white'
                    }`}
                    onClick={() => handleToggle(u.id, u.activeStatus)}
                  >
                    {isPending ? 'Processing...' : u.activeStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                ) : (
                  <span className="text-xs text-slate-600 font-semibold italic">Owner Account</span>
                )}
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
};
export default AdminUsers;
