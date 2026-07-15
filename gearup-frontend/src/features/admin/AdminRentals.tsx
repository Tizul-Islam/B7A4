import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

const statusColors: Record<string, string> = {
  PLACED: "badge-ghost",
  CONFIRMED: "badge-info",
  PAID: "badge-primary text-white",
  PICKED_UP: "badge-warning",
  RETURNED: "badge-success",
  CANCELLED: "badge-error",
};

export const AdminRentals = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminRentals"],
    queryFn: async () => {
      const response = await api.get("/admin/rentals");
      return response.data.data;
    },
  });

  const rentals = data || [];

  // Client-side filtering
  const filteredRentals = rentals.filter((rental: any) => {
    const matchesStatus = statusFilter ? rental.status === statusFilter : true;
    const matchesPayment = paymentStatusFilter ? rental.paymentStatus === paymentStatusFilter : true;
    const matchesCustomer = customerFilter 
      ? rental.customer.name.toLowerCase().includes(customerFilter.toLowerCase()) || 
        rental.customer.email.toLowerCase().includes(customerFilter.toLowerCase())
      : true;
    return matchesStatus && matchesPayment && matchesCustomer;
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">Global Rentals Overview</h1>

      <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            title="Search by customer name or email"
            type="text" 
            placeholder="Search by customer name or email..." 
            className="input input-bordered flex-1"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          />
          <select 
            title="Filter by Rental Status"
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Rental Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PAID">Paid</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="RETURNED">Returned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select 
            title="Filter by Payment Status"
            className="select select-bordered"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="">All Payment Statuses</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-sm border border-base-200">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Order ID</th>
              <th>Customer</th>
              <th>Dates</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Rental Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRentals.map((rental: any) => (
              <tr key={rental.id} className="hover">
                <td className="font-mono text-xs">{rental.id.split("-")[0]}...</td>
                <td>
                  <div className="font-bold">{rental.customer.name}</div>
                  <div className="text-xs opacity-50">{rental.customer.email}</div>
                </td>
                <td>
                  <div className="text-sm">
                    {new Date(rental.startDate).toLocaleDateString()} - <br/>
                    {new Date(rental.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="font-semibold">${Number(rental.totalAmount).toFixed(2)}</td>
                <td>
                  <span className={`badge badge-sm ${rental.paymentStatus === 'PAID' ? 'badge-success text-white' : 'badge-ghost'}`}>
                    {rental.paymentStatus}
                  </span>
                </td>
                <td>
                  <div className={`badge badge-sm ${statusColors[rental.status] || "badge-ghost"}`}>
                    {rental.status}
                  </div>
                </td>
              </tr>
            ))}
            {filteredRentals.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No rentals found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
