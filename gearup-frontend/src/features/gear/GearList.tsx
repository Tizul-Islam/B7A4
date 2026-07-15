import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FilterSidebar } from "./FilterSidebar";
import { GearCard } from "./GearCard";
import api from "../../services/api";

const fetchGear = async (searchParams: URLSearchParams) => {
  const { data } = await api.get(`/gear?${searchParams.toString()}`);
  return data;
};

export const GearList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["gear", searchParams.toString()],
    queryFn: () => fetchGear(searchParams),
  });

  const gearItems = data?.data || [];
  const meta = data?.meta;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set("search", e.target.value);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    const [sortBy, sortOrder] = e.target.value.split("-");
    newParams.set("sortBy", sortBy);
    newParams.set("sortOrder", sortOrder);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar: Search & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-ink">Browse Gear</h1>
        
        <div className="flex w-full md:w-auto gap-4">
          <input 
            title="Search gear"
            aria-label="Search gear"
            type="text" 
            placeholder="Search gear..." 
            className="input input-bordered w-full md:w-64"
            value={searchParams.get("search") || ""}
            onChange={handleSearch}
          />
          
          <select 
            title="Sort gear"
            aria-label="Sort gear"
            className="select select-bordered"
            onChange={handleSortChange}
            value={`${searchParams.get("sortBy") || "createdAt"}-${searchParams.get("sortOrder") || "desc"}`}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="pricePerDay-asc">Price: Low to High</option>
            <option value="pricePerDay-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : isError ? (
            <div className="alert alert-error">
              <span>Failed to load gear. Please try again later.</span>
            </div>
          ) : gearItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-base-100 rounded-lg border border-base-200">
              <h3 className="text-xl font-semibold mb-2">No gear found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gearItems.map((gear: any) => (
                  <GearCard key={gear.id} gear={gear} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.total > meta.limit && (
                <div className="flex justify-center mt-12">
                  <div className="join">
                    <button 
                      className="join-item btn"
                      disabled={meta.page === 1}
                      onClick={() => handlePageChange(meta.page - 1)}
                    >
                      «
                    </button>
                    <button className="join-item btn">Page {meta.page}</button>
                    <button 
                      className="join-item btn"
                      disabled={meta.page * meta.limit >= meta.total}
                      onClick={() => handlePageChange(meta.page + 1)}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
