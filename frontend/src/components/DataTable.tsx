import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

interface DataTableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationMeta;
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  data,
  renderRow,
  loading = false,
  emptyMessage = 'No data available.',
  pagination,
}) => {
  return (
    <div className="flex flex-col w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
      {/* Table Scroller */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-950/40">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-6 py-4 font-display text-xs font-black uppercase tracking-wider text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
                  </div>
                  <span className="mt-4 block text-sm text-slate-400">Loading data...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center text-slate-400">
                  <div className="text-sm font-medium">{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination HUD */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 bg-slate-950/20 px-6 py-4">
          <span className="text-xs text-slate-400">
            Showing Page <strong className="text-white">{pagination.page}</strong> of{' '}
            <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} total)
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Previous Page"
              aria-label="Previous Page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-950 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === pagination.page;
              return (
                <button
                  key={p}
                  type="button"
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-accentTeal text-white shadow-lg shadow-sky-500/20'
                      : 'border border-white/5 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                  onClick={() => pagination.onPageChange(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              title="Next Page"
              aria-label="Next Page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-950 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
