// src/pages/Products/ProductList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [colorFilter, setColorFilter] = useState('ALL');
  const [maxStock, setMaxStock] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, colorFilter, maxStock]);

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, colorFilter, maxStock]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (colorFilter !== 'ALL') params.append('color', colorFilter);
      if (maxStock) params.append('max_stock', maxStock);

      const res = await api.get(`/products/?${params.toString()}`);
      setProducts(res.data.results);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.total_count);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (err) {
      // silent fail
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This will also delete all its variants and sizes. This cannot be undone.`)) {
      return;
    }

    setDeletingId(product.id);
    try {
      await api.delete(`/products/${product.id}/delete/`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setTotalCount((prev) => prev - 1);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (product) => {
    setTogglingId(product.id);
    try {
      await api.patch(`/products/${product.id}/`, {
        is_active: !product.is_active,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update product status');
    } finally {
      setTogglingId(null);
    }
  };

  const allColors = Array.from(
    new Set(
      products.flatMap((p) => (p.variants || []).map((v) => v.color?.trim()))
    )
  ).filter(Boolean);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
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

  const activeCount = products.filter((p) => p.is_active).length;
  const lowStockCount = products.filter((p) => p.total_stock <= 5).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your store inventory</p>
        </div>
        <button
          onClick={() => navigate('/products/add')}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-red-500">{lowStockCount}</p>
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
              placeholder="Search by name or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-10 transition-all"
            >
              <option value="ALL">All Colors</option>
              {allColors.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">≤</div>
            <input
              type="number"
              placeholder="Stock"
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-4 py-2.5 text-sm w-28 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <ClipLoader color="#2563eb" size={32} />
          <p className="text-slate-400 text-sm mt-3">Loading products...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium text-sm">No products found</p>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or add a new product</p>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && products.length > 0 && (
        <div className="md:hidden space-y-3 mb-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div
                className="p-4 flex items-start gap-3 cursor-pointer"
                onClick={() => toggleExpand(product.id)}
              >
                <div className="shrink-0">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    <svg
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expandedId === product.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{product.brand} · {product.category_name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        product.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`text-xs font-bold ${product.total_stock <= 5 ? 'text-red-500' : 'text-slate-600'}`}>
                      {product.total_stock} in stock
                    </span>
                    <span className="text-xs text-slate-400">{product.variant_count} variants</span>
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex gap-2 px-4 pb-3">
                <button
                  onClick={() => navigate(`/products/edit/${product.id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-semibold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(product)}
                  disabled={togglingId === product.id}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                    product.is_active
                      ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                      : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {togglingId === product.id ? (
                    <ClipLoader color={product.is_active ? '#d97706' : '#059669'} size={12} />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      {product.is_active ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  )}
                  {product.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  {deletingId === product.id ? (
                    <ClipLoader color="#dc2626" size={12} />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  )}
                  Delete
                </button>
              </div>

              {/* Mobile Expanded Variants */}
              {expandedId === product.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
                  {(product.variants || []).map((variant) => (
                    <div key={variant.id} className="bg-white rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {variant.image ? (
                          <img src={variant.image} alt={variant.color} className="w-8 h-8 rounded-lg object-cover ring-2 ring-slate-100" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100" />
                        )}
                        <span className="font-semibold text-slate-700 text-xs">{variant.color}</span>
                      </div>
                      {(variant.sizes || []).length === 0 ? (
                        <p className="text-xs text-slate-400">No sizes</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {variant.sizes.map((size) => (
                            <div key={size.id} className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-xs text-slate-500">{size.size.split('_')[0]}</span>
                              <span className={`text-xs font-bold ${Number(size.stock) <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                                {size.stock}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && products.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-10"></th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Variants</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <>
                    <tr
                      key={product.id}
                      className="group hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer border-b border-slate-100"
                      onClick={() => toggleExpand(product.id)}
                    >
                      <td className="px-4 py-4 text-slate-400">
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${expandedId === product.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </td>
                      <td className="px-6 py-4">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{product.name}</td>
                      <td className="px-6 py-4 text-slate-600">{product.brand}</td>
                      <td className="px-6 py-4 text-slate-600">{product.category_name}</td>
                      <td className="px-6 py-4 text-slate-600 capitalize">{product.gender}</td>
                      <td className="px-6 py-4 text-slate-600">{product.variant_count}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${product.total_stock <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                          {product.total_stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            product.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(product)}
                            disabled={togglingId === product.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 ${
                              product.is_active
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {togglingId === product.id ? (
                              <ClipLoader color={product.is_active ? '#d97706' : '#059669'} size={12} />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                {product.is_active ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                            )}
                            {product.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-30"
                          >
                            {deletingId === product.id ? (
                              <ClipLoader color="#dc2626" size={12} />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedId === product.id && (
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <td colSpan={10} className="px-6 py-5">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(product.variants || []).map((variant) => (
                              <div key={variant.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  {variant.image ? (
                                    <img
                                      src={variant.image}
                                      alt={variant.color}
                                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                                  )}
                                  <span className="font-semibold text-slate-700 text-sm">{variant.color}</span>
                                </div>
                                {(variant.sizes || []).length === 0 ? (
                                  <p className="text-xs text-slate-400">No sizes</p>
                                ) : (
                                  <div className="space-y-2">
                                    {variant.sizes.map((size) => (
                                      <div key={size.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <span className="text-xs font-medium text-slate-500">{size.size.split('_')[0]}</span>
                                        <span
                                          className={`text-xs font-bold ${
                                            Number(size.stock) <= 5 ? 'text-red-500' : 'text-slate-700'
                                          }`}
                                        >
                                          {size.stock} in stock
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{products.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> products · Page{' '}
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