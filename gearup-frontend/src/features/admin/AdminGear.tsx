import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

export const AdminGear = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminGear"],
    queryFn: async () => {
      const response = await api.get("/admin/gear");
      return response.data.data;
    },
  });

  const gearListings = data || [];

  const filteredGear = gearListings.filter((gear: any) => 
    gear.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gear.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-8">Global Gear Inventory</h1>

      <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 mb-8">
        <input 
          title="Search gear"
          type="text" 
          placeholder="Search by gear name or brand..." 
          className="input input-bordered w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-sm border border-base-200">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Gear Name</th>
              <th>Category</th>
              <th>Provider</th>
              <th>Price/Day</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredGear.map((gear: any) => (
              <tr key={gear.id} className="hover">
                <td className="font-bold">{gear.name}</td>
                <td>
                  <span className="badge badge-ghost">{gear.category.name}</span>
                </td>
                <td>
                  <div className="font-semibold">{gear.provider.name}</div>
                  <div className="text-xs text-gray-500">{gear.provider.email}</div>
                </td>
                <td className="font-semibold">${Number(gear.pricePerDay).toFixed(2)}</td>
                <td>
                  <span className={`badge badge-sm ${gear.isAvailable ? 'badge-success text-white' : 'badge-error text-white'}`}>
                    {gear.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredGear.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No gear listings found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
