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

  // Draft state - jo user type/select karta hai, button dabane tak apply nahi hota
  const [searchDraft, setSearchDraft] = useState('');
  const [categoryDraft, setCategoryDraft] = useState('ALL');
  const [sizeDraft, setSizeDraft] = useState('ALL');
  const [sortDraft, setSortDraft] = useState('stock_asc');
  const [thresholdDraft, setThresholdDraft] = useState(15);

  // Applied state - "Search" button dabane ke baad hi ye update hote hain, aur API call trigger karte hain
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

  // Sirf 'applied' filters ya page badalne pe hi fetch ho
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
    } catch (err) {
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
    } catch (err) {
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
    if (stock === 0) return 'bg-red-100 text-red-700';
    if (stock <= 5) return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Low Stock Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sizes with stock below {threshold} units
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={items.length === 0}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export CSV (this page)
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{totalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold mt-1 text-red-500">{outOfStockCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Critical (≤5)</p>
          <p className="text-2xl font-bold mt-1 text-orange-500">{criticalCount}</p>
        </div>
      </div>

      {/* Filters - draft state, apply hone tak koi API call nahi */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by product or color..."
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          value={categoryDraft}
          onChange={(e) => setCategoryDraft(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={sizeDraft}
          onChange={(e) => setSizeDraft(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Sizes</option>
          {SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <select
          value={sortDraft}
          onChange={(e) => setSortDraft(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="stock_asc">Stock: Low to High</option>
          <option value="stock_desc">Stock: High to Low</option>
          <option value="recent">Recently Updated</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Threshold:</label>
          <input
            type="number"
            value={thresholdDraft}
            onChange={(e) => setThresholdDraft(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleApplyFilters}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <ClipLoader color="#2563eb" size={36} />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">
            No low stock items — everything looks good
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b">
                <th className="px-6 py-3 font-medium"></th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Color</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Last Updated</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.size_id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <img
                      src={item.variant_image}
                      alt={item.color}
                      className="w-10 h-10 rounded object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.product_name}</td>
                  <td className="px-6 py-4 text-gray-600">{item.color}</td>
                  <td className="px-6 py-4 text-gray-600">{item.size.split('_')[0]}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stockBadge(item.stock)}`}>
                      {item.stock} left
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(item.updated_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === item.size_id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          placeholder="New stock"
                          autoFocus
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleQuickRestock(item)}
                          disabled={savingId === item.size_id}
                          className="text-green-600 hover:text-green-700 font-medium text-xs disabled:opacity-50"
                        >
                          {savingId === item.size_id ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditStock(''); }}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => { setEditingId(item.size_id); setEditStock(''); }}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Quick Restock
                        </button>
                        <button
                          onClick={() => navigate(`/products/edit/${item.product_id}`)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ({totalCount} items total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}