import { useQuery } from "@tanstack/react-query";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";
import api from "../../services/api";

export const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="alert alert-error">
        <span>Failed to load admin statistics.</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">Platform Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users */}
        <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Total Users</p>
            <p className="text-2xl font-bold">{data.totalUsers || 0}</p>
          </div>
        </div>

        {/* Gear */}
        <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Total Gear Listings</p>
            <p className="text-2xl font-bold">{data.totalGear || 0}</p>
          </div>
        </div>

        {/* Rentals */}
        <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Total Rentals</p>
            <p className="text-2xl font-bold">{data.totalRentals || 0}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold">${Number(data.totalRevenue || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-base-100 p-8 rounded-lg shadow-sm border border-base-200">
        <h2 className="text-xl font-bold mb-4">Welcome to the Admin Control Panel</h2>
        <p className="text-gray-600">
          Use the sidebar navigation to manage users, providers, equipment categories, gear listings, and oversee all rental transactions taking place on the platform.
        </p>
      </div>
    </div>
  );
};
