import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Filter,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export function DataTable({
  columns = [],
  data = [],
  searchKey = 'name',
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  filterKey = null,
  actions = null,
  batchActions = null,
  renderMobileCard = null,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filter parameters.',
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map((c) => c.key || c.id)
  );
  const [showColMenu, setShowColMenu] = useState(false);

  // Filter and search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter tab
      if (filterKey && activeFilter !== 'All') {
        const itemVal = item[filterKey];
        if (typeof itemVal === 'string' && itemVal.toLowerCase() !== activeFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();

      // Check specific search key or all string properties
      if (searchKey && item[searchKey]) {
        return String(item[searchKey]).toLowerCase().includes(q);
      }

      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(q)
      );
    });
  }, [data, search, activeFilter, filterKey, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedData.map((item) => item.id || item._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCSV = () => {
    if (!sortedData.length) return;
    const activeCols = columns.filter((c) => visibleColumns.includes(c.key || c.id));
    const headers = activeCols.map((c) => `"${c.label}"`).join(',');
    const rows = sortedData.map((row) =>
      activeCols
        .map((c) => {
          let val = row[c.key || c.id];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          return `"${String(val || '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search bar */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all placeholder:text-gray-400 text-gray-900"
            />
          </div>

          {/* Filter Pills / Tabs */}
          {filterOptions.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setActiveFilter(opt);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === opt
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Bulk actions */}
          {selectedIds.size > 0 && batchActions && (
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 text-xs font-medium text-indigo-800 animate-in fade-in">
              <span>{selectedIds.size} selected</span>
              {batchActions(Array.from(selectedIds))}
            </div>
          )}

          {/* Column toggler */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              title="Toggle Columns"
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/90 py-2 z-20 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 border-b border-gray-100 mb-1">
                  Visible Columns
                </div>
                {columns.map((col) => {
                  const key = col.key || col.id;
                  const isChecked = visibleColumns.includes(key);
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked && visibleColumns.length > 1) {
                            setVisibleColumns(visibleColumns.filter((k) => k !== key));
                          } else if (!isChecked) {
                            setVisibleColumns([...visibleColumns, key]);
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {col.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export CSV button */}
          <button
            onClick={exportCSV}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-gray-700">
          <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every((item) => selectedIds.has(item.id || item._id))
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {columns
                .filter((c) => visibleColumns.includes(c.key || c.id))
                .map((col) => {
                  const key = col.key || col.id;
                  const isSorted = sortConfig.key === key;
                  return (
                    <th
                      key={key}
                      onClick={() => col.sortable !== false && handleSort(key)}
                      className={`px-4 py-3 font-semibold ${
                        col.sortable !== false ? 'cursor-pointer hover:bg-gray-100/60 select-none' : ''
                      } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                        <span>{col.label}</span>
                        {col.sortable !== false && (
                          <span className="text-gray-400">
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              {actions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center text-gray-400">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-16 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{emptyTitle}</div>
                    <div className="text-xs text-gray-500 mt-1">{emptyDescription}</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const id = row.id || row._id || idx;
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={`transition-colors hover:bg-gray-50/60 ${
                      isSelected ? 'bg-indigo-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    {columns
                      .filter((c) => visibleColumns.includes(c.key || c.id))
                      .map((col) => {
                        const key = col.key || col.id;
                        return (
                          <td
                            key={key}
                            className={`px-4 py-3.5 ${
                              col.align === 'right'
                                ? 'text-right'
                                : col.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            }`}
                          >
                            {col.render ? col.render(row[key], row) : row[key] ?? '-'}
                          </td>
                        );
                      })}
                    {actions && (
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden p-4 space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading records...</div>
        ) : paginatedData.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">{emptyTitle}</div>
        ) : (
          paginatedData.map((row, idx) =>
            renderMobileCard ? (
              <div key={row.id || idx}>{renderMobileCard(row)}</div>
            ) : (
              <div
                key={row.id || idx}
                className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2 text-xs"
              >
                {columns.slice(0, 4).map((col) => (
                  <div key={col.key || col.id} className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{col.label}:</span>
                    <span className="text-gray-900 font-semibold">
                      {col.render ? col.render(row[col.key || col.id], row) : row[col.key || col.id]}
                    </span>
                  </div>
                ))}
                {actions && <div className="pt-2 border-t border-gray-100 flex justify-end">{actions(row)}</div>}
              </div>
            )
          )
        )}
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-gray-900">{sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-gray-900">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="text-gray-900">{sortedData.length}</strong> records
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">| Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-200 rounded-md px-2 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-semibold text-gray-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
