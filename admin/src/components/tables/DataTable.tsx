import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({ data, columns, pageSize = 10, emptyMessage = 'No data found' }: Props<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((col) => (
                <th key={String(col.key)} className={`px-5 py-3.5 text-left text-xs font-600 font-semibold text-gray-500 uppercase tracking-wide ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-gray-400">{emptyMessage}</td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`px-5 py-4 text-sm text-gray-700 ${col.className || ''}`}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:border hover:border-gray-200 disabled:opacity-40 transition-all">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white hover:border hover:border-gray-200'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:border hover:border-gray-200 disabled:opacity-40 transition-all">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
