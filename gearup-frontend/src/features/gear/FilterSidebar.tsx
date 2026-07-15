import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";

interface Category {
  id: string;
  name: string;
}

export const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1"); // Reset pagination on filter change
    setSearchParams(newParams);
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200">
      <h3 className="text-lg font-bold mb-4 border-b pb-2">Filters</h3>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="label font-semibold pb-1" htmlFor="categorySelect">Category</label>
          <select 
            id="categorySelect"
            title="Select Category"
            className="select select-bordered w-full"
            value={searchParams.get("category") || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="label font-semibold pb-1" htmlFor="brandInput">Brand</label>
          <input 
            id="brandInput"
            title="Filter by Brand"
            type="text" 
            placeholder="e.g. North Face"
            className="input input-bordered w-full"
            value={searchParams.get("brand") || ""}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="label font-semibold pb-1" htmlFor="minPriceInput">Price per Day ($)</label>
          <div className="flex items-center gap-2">
            <input 
              id="minPriceInput"
              title="Minimum Price"
              aria-label="Minimum Price"
              type="number" 
              placeholder="Min" 
              className="input input-bordered w-full"
              value={searchParams.get("minPrice") || ""}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <span>-</span>
            <input 
              id="maxPriceInput"
              title="Maximum Price"
              aria-label="Maximum Price"
              type="number" 
              placeholder="Max" 
              className="input input-bordered w-full"
              value={searchParams.get("maxPrice") || ""}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Availability */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3" htmlFor="isAvailableCheckbox">
            <input 
              id="isAvailableCheckbox"
              title="Available Only"
              type="checkbox" 
              className="checkbox checkbox-primary" 
              checked={searchParams.get("isAvailable") === "true"}
              onChange={(e) => handleFilterChange("isAvailable", e.target.checked ? "true" : "")}
            />
            <span className="label-text font-semibold">Available Only</span>
          </label>
        </div>

        <button 
          className="btn btn-outline btn-secondary w-full"
          onClick={() => setSearchParams(new URLSearchParams())}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};
