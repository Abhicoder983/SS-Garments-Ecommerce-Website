// src/pages/Inventory/Inventory.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Draft state
  const [searchDraft, setSearchDraft] = useState('');
  const [categoryDraft, setCategoryDraft] = useState('ALL');
  const [sizeDraft, setSizeDraft] = useState('ALL');
  const [sortDraft, setSortDraft] = useState('stock_asc');
  const [thresholdDraft, setThresholdDraft] = useState(15);

  // Applied state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('stock_asc');
  const [threshold, setThreshold] = useState(15);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [savingId, setSavingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLowStock();
  }, [page, search, categoryFilter, sizeFilter, sortBy, threshold]);

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('threshold', threshold);
      params.append('sort', sortBy);
      if (search) params.append('search', search);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (sizeFilter !== 'ALL') params.append('size', sizeFilter);

      const res = await api.get(`/inventory/low-stock/?${params.toString()}`);
      setItems(res.data.results);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.total_count);
      setOutOfStockCount(res.data.out_of_stock_count);
      setCriticalCount(res.data.critical_count);
    } catch {
      toast.error('Failed to load low stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    setSearch(searchDraft);
    setCategoryFilter(categoryDraft);
    setSizeFilter(sizeDraft);
    setSortBy(sortDraft);
    setThreshold(thresholdDraft || 15);
  };

  const handleQuickRestock = async (item) => {
    if (!editStock || Number(editStock) < 0) {
      toast.error('Enter a valid stock number');
      return;
    }

    setSavingId(item.size_id);
    try {
      await api.patch(`/products-sizes/${item.size_id}/`, {
        price: item.price,
        stock: Number(editStock),
      });

      toast.success('Stock updated');
      setEditingId(null);
      setEditStock('');
      fetchLowStock();
    } catch{
      toast.error('Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Product', 'Color', 'Size', 'Stock', 'Last Updated'];
    const rows = items.map((i) => [
      i.product_name,
      i.color,
      i.size.split('_')[0],
      i.stock,
      new Date(i.updated_at).toLocaleDateString('en-IN'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `low-stock-page${page}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stockBadge = (stock) => {
    if (stock === 0) return 'bg-red-50 text-red-700 border-red-200';
    if (stock <= 5) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const stockDot = (stock) => {
    if (stock === 0) return 'bg-red-500';
    if (stock <= 5) return 'bg-orange-500';
    return 'bg-amber-500';
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Low Stock Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">Sizes with stock below {threshold} units</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={items.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Low Stock</p>
            <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical (≤5)</p>
            <p className="text-2xl font-bold text-orange-600">{criticalCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by product or color..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={categoryDraft}
              onChange={(e) => setCategoryDraft(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-10 transition-all"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={sizeDraft}
              onChange={(e) => setSizeDraft(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-10 transition-all"
            >
              <option value="ALL">All Sizes</option>
              {SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={sortDraft}
              onChange={(e) => setSortDraft(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-10 transition-all"
            >
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="recent">Recently Updated</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Threshold</label>
            <input
              type="number"
              value={thresholdDraft}
              onChange={(e) => setThresholdDraft(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm w-20 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={handleApplyFilters}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <ClipLoader color="#2563eb" size={32} />
          <p className="text-slate-400 text-sm mt-3">Loading inventory...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium text-sm">No low stock items</p>
          <p className="text-slate-400 text-xs mt-1">Everything looks good — all products are well stocked</p>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && items.length > 0 && (
        <div className="md:hidden space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.size_id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <img
                  src={item.variant_image}
                  alt={item.color}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.product_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.color} · Size {item.size.split('_')[0]}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${stockBadge(item.stock)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stockDot(item.stock)}`} />
                      {item.stock} left
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.updated_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {editingId === item.size_id ? (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    placeholder="New stock"
                    autoFocus
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleQuickRestock(item)}
                    disabled={savingId === item.size_id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                  >
                    {savingId === item.size_id ? <ClipLoader color="#059669" size={12} /> : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditStock(''); }}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => { setEditingId(item.size_id); setEditStock(''); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12a2.25 2.25 0 012.25 2.25v12.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.375 4.5h9z" />
                    </svg>
                    Restock
                  </button>
                  <button
                    onClick={() => navigate(`/products/edit/${item.product_id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-semibold transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && items.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16"></th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.size_id} className="group hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <img
                        src={item.variant_image}
                        alt={item.color}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.product_name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.color}</td>
                    <td className="px-6 py-4 text-slate-600">{item.size.split('_')[0]}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${stockBadge(item.stock)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stockDot(item.stock)}`} />
                        {item.stock} left
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(item.updated_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {editingId === item.size_id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              placeholder="New stock"
                              autoFocus
                              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleQuickRestock(item)}
                              disabled={savingId === item.size_id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                            >
                              {savingId === item.size_id ? <ClipLoader color="#059669" size={12} /> : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditStock(''); }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingId(item.size_id); setEditStock(''); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 text-xs font-medium transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12a2.25 2.25 0 012.25 2.25v12.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.375 4.5h9z" />
                              </svg>
                              Restock
                            </button>
                            <button
                              onClick={() => navigate(`/products/edit/${item.product_id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              View
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{items.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> items · Page{' '}
            <span className="font-semibold text-slate-700">{page}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Prev
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}