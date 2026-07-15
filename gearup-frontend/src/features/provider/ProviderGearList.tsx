import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import api from "../../services/api";

export const ProviderGearList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["provider-gear", user?.id, page],
    queryFn: async () => {
      const response = await api.get(`/gear?providerId=${user?.id}&page=${page}&limit=10`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/provider/gear/${id}`);
    },
    onSuccess: () => {
      toast.success("Gear deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete gear");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone unless it has active rentals.")) {
      deleteMutation.mutate(id);
    }
  };

  const gearItems = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Inventory</h2>
        <Link to="/provider/gear/new" className="btn btn-primary gap-2">
          <Plus className="w-5 h-5" />
          Add New Gear
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : gearItems.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-base-300 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No gear listed yet</h3>
          <p className="text-gray-500 mb-4">Start adding your equipment to rent out to customers.</p>
          <Link to="/provider/gear/new" className="btn btn-outline btn-primary">
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price/Day</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gearItems.map((gear: any) => (
                <tr key={gear.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img 
                            src={gear.images?.[0] || "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22150%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E"} 
                            alt={gear.name}
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              if (!target.src.includes('data:image/svg+xml')) {
                                target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20viewBox%3D%220%200%20150%20150%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22150%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EInvalid%3C%2Ftext%3E%3C%2Fsvg%3E';
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{gear.name}</div>
                        <div className="text-sm opacity-50">{gear.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>{gear.category?.name}</td>
                  <td>${Number(gear.pricePerDay).toFixed(2)}</td>
                  <td>
                    {gear.availableQuantity} / {gear.stockQuantity}
                  </td>
                  <td>
                    {gear.isAvailable ? (
                      <span className="badge badge-success text-white">Active</span>
                    ) : (
                      <span className="badge badge-error text-white">Hidden</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link 
                        title="Edit gear"
                        aria-label="Edit gear"
                        to={`/provider/gear/${gear.id}/edit`} 
                        className="btn btn-sm btn-ghost text-secondary"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        title="Delete gear"
                        aria-label="Delete gear"
                        onClick={() => handleDelete(gear.id)}
                        disabled={deleteMutation.isPending}
                        className="btn btn-sm btn-ghost text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {meta && meta.total > meta.limit && (
            <div className="flex justify-end mt-4">
              <div className="join">
                <button 
                  className="join-item btn btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  «
                </button>
                <button className="join-item btn btn-sm">Page {page}</button>
                <button 
                  className="join-item btn btn-sm"
                  disabled={page * meta.limit >= meta.total}
                  onClick={() => setPage(page + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
