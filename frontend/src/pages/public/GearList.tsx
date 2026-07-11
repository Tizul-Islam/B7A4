import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { GearCard } from '../../components/GearCard';
import { GearFilters } from '../../components/GearFilters';
import { DataTable } from '../../components/DataTable'; // For pagination controls reuse or manually map it

export const GearList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 500);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Synch query parameters with URL
  useEffect(() => {
    const params: any = {};
    if (search) params.search = search;
    if (categoryId) params.category = categoryId;
    if (condition) params.condition = condition;
    if (maxPrice !== 500) params.maxPrice = maxPrice.toString();
    if (page !== 1) params.page = page.toString();
    
    setSearchParams(params);
  }, [search, categoryId, condition, maxPrice, page]);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  // Fetch Gear Items
  const { data: gearsData, isLoading: loadingGears } = useQuery({
    queryKey: ['gears', { search, categoryId, condition, maxPrice, page }],
    queryFn: () =>
      api.gear.list({
        search,
        categoryId,
        condition,
        maxPrice,
        page,
        limit: 8,
      }),
  });

  const categories = categoriesData?.data || [];
  const gears = gearsData?.data || [];
  const meta = gearsData?.meta || { page: 1, limit: 8, total: 0, totalPages: 1 };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setCondition('');
    setMaxPrice(500);
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Equipment Catalog</h1>
        <p className="text-sm text-slate-400">Search and rent the best outdoor gears near you</p>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="sticky top-24">
          <GearFilters
            search={search}
            setSearch={(val) => { setSearch(val); setPage(1); }}
            categoryId={categoryId}
            setCategoryId={(val) => { setCategoryId(val); setPage(1); }}
            condition={condition}
            setCondition={(val) => { setCondition(val); setPage(1); }}
            maxPrice={maxPrice}
            setMaxPrice={(val) => { setMaxPrice(val); setPage(1); }}
            categories={categories}
            resetFilters={handleResetFilters}
          />
        </aside>

        {/* Catalog List */}
        <div className="space-y-8">
          {loadingGears ? (
            <div className="flex justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
            </div>
          ) : gears.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-16 text-center backdrop-blur-md">
              <h3 className="font-display text-lg font-bold text-white">No Gear Found</h3>
              <p className="text-sm text-slate-400 mt-1">Try resetting filters or search terms.</p>
              <button
                type="button"
                className="mt-6 rounded-xl bg-slate-950 border border-white/5 px-6 py-2 font-display text-sm font-bold text-white transition-colors hover:bg-slate-900"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gears.map((g: any) => (
                  <GearCard key={g.id} gear={g} />
                ))}
              </div>

              {/* Pagination Controls */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 bg-slate-950/20 px-6 py-4 rounded-xl">
                  <span className="text-xs text-slate-400">
                    Showing Page <strong className="text-white">{meta.page}</strong> of{' '}
                    <strong className="text-white">{meta.totalPages}</strong> ({meta.total} total)
                  </span>

                  <div className="flex gap-1">
                    {Array.from({ length: meta.totalPages }).map((_, i) => {
                      const p = i + 1;
                      const isCurrent = p === page;
                      return (
                        <button
                          key={p}
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-accentTeal text-white shadow-lg'
                              : 'border border-white/5 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-white'
                          }`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default GearList;
