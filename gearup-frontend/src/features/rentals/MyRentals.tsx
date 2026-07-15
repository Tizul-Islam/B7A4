import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../services/api";

const statusColors: Record<string, string> = {
  PLACED: "badge-ghost",
  CONFIRMED: "badge-info",
  PAID: "badge-primary text-white",
  PICKED_UP: "badge-warning",
  RETURNED: "badge-success",
  CANCELLED: "badge-error",
};

export const MyRentals = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rentals"],
    queryFn: async () => {
      const response = await api.get("/rentals");
      return response.data;
    },
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
        <span>Failed to load rentals.</span>
      </div>
    );
  }

  const rentals = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-ink mb-8">My Rentals</h1>

      {rentals.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">No rentals yet</h2>
          <p className="text-gray-500 mb-8">You haven't rented any gear yet.</p>
          <Link to="/gear" className="btn btn-primary">Browse Gear</Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow-sm border border-base-200">
          <table className="table">
            <thead>
              <tr className="bg-base-200">
                <th>Order ID</th>
                <th>Dates</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental: any) => (
                <tr key={rental.id} className="hover">
                  <td className="font-mono text-xs">{rental.id.split("-")[0]}...</td>
                  <td>
                    <div className="text-sm">
                      {new Date(rental.startDate).toLocaleDateString()} - <br/>
                      {new Date(rental.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{rental.items.length} items</td>
                  <td className="font-semibold">${Number(rental.totalAmount).toFixed(2)}</td>
                  <td>
                    <div className={`badge ${statusColors[rental.status] || "badge-ghost"}`}>
                      {rental.status}
                    </div>
                  </td>
                  <td>
                    <Link to={`/rentals/${rental.id}`} className="btn btn-sm btn-ghost hover:bg-base-200">
                      View Details
                    </Link>
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
