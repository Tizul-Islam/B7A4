import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/admin/users/${id}`, { activeStatus: status });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "User status updated");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user status");
    },
  });

  const users = data || [];

  // Client-side filtering
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? user.activeStatus === statusFilter : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">User Management</h1>

      <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            title="Search users"
            type="text" 
            placeholder="Search by name or email..." 
            className="input input-bordered flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            title="Filter by Role"
            className="select select-bordered"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="PROVIDER">Provider</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select 
            title="Filter by Status"
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-sm border border-base-200">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>User</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className="hover">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-10">
                        <span>{user.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-sm opacity-50">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-sm ${user.role === 'ADMIN' ? 'badge-primary' : user.role === 'PROVIDER' ? 'badge-secondary' : 'badge-ghost'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge badge-sm ${user.activeStatus === 'ACTIVE' ? 'badge-success text-white' : 'badge-error text-white'}`}>
                    {user.activeStatus}
                  </span>
                </td>
                <td>
                  {user.role !== 'ADMIN' && (
                    <>
                      {user.activeStatus === 'ACTIVE' ? (
                        <button 
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => statusMutation.mutate({ id: user.id, status: "SUSPENDED" })}
                          disabled={statusMutation.isPending}
                        >
                          <Ban className="w-4 h-4" /> Suspend
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-success btn-outline"
                          onClick={() => statusMutation.mutate({ id: user.id, status: "ACTIVE" })}
                          disabled={statusMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" /> Activate
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
