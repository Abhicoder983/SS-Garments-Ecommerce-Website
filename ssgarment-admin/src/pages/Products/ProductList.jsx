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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  // Filters change hone pe page 1 pe reset karo, fir fetch karo
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

  // State add karo
const [deletingId, setDeletingId] = useState(null);

// Handler add karo
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

  // Color dropdown ke liye options - saare categories ke colors dikhane ke liye
  // alag se ek halka API call kar sakte hain, ya categories page se fixed list rakh sakte hain.
  // Abhi ke liye current page ke products se hi options bana rahe hain (limitation: sirf loaded colors dikhenge)
  const allColors = Array.from(
    new Set(
      products.flatMap((p) => (p.variants || []).map((v) => v.color?.trim()))
    )
  ).filter(Boolean);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => navigate('/products/add')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Variants</option>
          {allColors.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stock ≤"
          value={maxStock}
          onChange={(e) => setMaxStock(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <ClipLoader color="#2563eb" size={36} />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">No products found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b">
                <th className="px-6 py-3 font-medium"></th>
                <th className="px-6 py-3 font-medium">Image</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Brand</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Gender</th>
                <th className="px-6 py-3 font-medium">Variants</th>
                <th className="px-6 py-3 font-medium">Total Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <>
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => toggleExpand(product.id)}
                  >
                    <td className="px-4 py-4 text-gray-400">
                      {expandedId === product.id ? '▾' : '▸'}
                    </td>
                    <td className="px-6 py-4">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600">{product.brand}</td>
                    <td className="px-6 py-4 text-gray-600">{product.category_name}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{product.gender}</td>
                    <td className="px-6 py-4 text-gray-600">{product.variant_count}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.total_stock <= 5 ? (
                        <span className="text-red-500 font-medium">{product.total_stock}</span>
                      ) : (
                        product.total_stock
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingId === product.id}
                        className={`font-medium disabled:opacity-50 ${
                          product.is_active
                            ? 'text-orange-600 hover:text-orange-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {togglingId === product.id
                          ? '...'
                          : product.is_active
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>

                      <button
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                      >
                      {deletingId === product.id ? '...' : 'Delete'}
                            </button>
                    </td>



                  </tr>

                  {expandedId === product.id && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan={10} className="px-10 py-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(product.variants || []).map((variant) => (
                            <div key={variant.id} className="bg-white rounded-lg border p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <img
                                  src={variant.image}
                                  alt={variant.color}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <span className="font-medium text-gray-700 text-xs">{variant.color}</span>
                              </div>
                              {(variant.sizes || []).length === 0 ? (
                                <p className="text-xs text-gray-400">No sizes</p>
                              ) : (
                                <div className="space-y-1">
                                  {variant.sizes.map((size) => (
                                    <div key={size.id} className="flex justify-between text-xs">
                                      <span className="text-gray-500">{size.size.split('_')[0]}</span>
                                      <span
                                        className={
                                          Number(size.stock) <= 5
                                            ? 'text-red-500 font-medium'
                                            : 'text-gray-700'
                                        }
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
        )}
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ({totalCount} products total)
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