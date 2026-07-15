import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  PLACED: "badge-ghost",
  CONFIRMED: "badge-info",
  PAID: "badge-primary text-white",
  PICKED_UP: "badge-warning",
  RETURNED: "badge-success",
  CANCELLED: "badge-error",
};

export const ProviderOrders = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["providerOrders"],
    queryFn: async () => {
      const response = await api.get("/provider/orders");
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await api.patch(`/provider/orders/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: ["providerOrders"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error my-8 max-w-4xl mx-auto">
        <span>Failed to load incoming orders.</span>
      </div>
    );
  }

  const orders = data?.data || [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-ink">Incoming Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
          <p className="text-gray-500">When customers rent your gear, the orders will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow-sm border border-base-200">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>Order ID</th>
                <th>Dates</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td className="font-mono text-xs">{order.id.split("-")[0]}...</td>
                  <td>
                    <div className="text-sm">
                      {new Date(order.startDate).toLocaleDateString()} - <br/>
                      {new Date(order.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold">{order.customer.name}</div>
                    <div className="text-xs text-gray-500">{order.customer.email}</div>
                  </td>
                  <td>
                    <div className="text-sm">{order.items.length} items</div>
                  </td>
                  <td>
                    <div className={`badge ${statusColors[order.status] || "badge-ghost"}`}>
                      {order.status}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-2">
                      {order.status === "PLACED" && (
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: "CONFIRMED" })}
                          disabled={updateStatusMutation.isPending}
                        >Confirm</button>
                      )}
                      {order.status === "PAID" && (
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: "PICKED_UP" })}
                          disabled={updateStatusMutation.isPending}
                        >Mark Picked Up</button>
                      )}
                      {order.status === "PICKED_UP" && (
                        <button 
                          className="btn btn-sm btn-success text-white"
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: "RETURNED" })}
                          disabled={updateStatusMutation.isPending}
                        >Mark Returned</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
