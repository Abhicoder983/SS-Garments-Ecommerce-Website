// src/pages/Products/EditProduct.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

const GENDER_OPTIONS = ['male', 'female', 'unisex', 'kids'];

const SIZE_GROUPS = {
  male: {
    top: ['XS_34', 'S_36', 'M_38', 'L_40', 'XL_42', 'XXL_44', '3XL_46', '4XL_48'],
    bottom: ['XS_28', 'S_30', 'M_32', 'L_34', 'XL_36', 'XXL_38', '3XL_40', '4XL_42'],
  },
  female: {
    top: ['XS_32', 'S_34', 'M_36', 'L_38', 'XL_40', 'XXL_42', '3XL_44', '4XL_46'],
    bottom: ['XS_26', 'S_28', 'M_30', 'L_32', 'XL_34', 'XXL_36', '3XL_38', '4XL_40'],
  },
};

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);

  const [newVariant, setNewVariant] = useState({ color: '', image: null, imagePreview: null });
  const [addingVariant, setAddingVariant] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);

  const [sizeUpdates, setSizeUpdates] = useState({});
  const [savingSizeId, setSavingSizeId] = useState(null);

  const [addingSizeVariantIndex, setAddingSizeVariantIndex] = useState(null);
  const [sizeTypeForNew, setSizeTypeForNew] = useState('top');
  const [newSizeSelections, setNewSizeSelections] = useState({});
  const [savingNewSizes, setSavingNewSizes] = useState(false);

  // ─── Variant Edit State ───
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editVariantData, setEditVariantData] = useState({ color: '', image: null, imagePreview: null });
  const [savingVariantId, setSavingVariantId] = useState(null);

  // ─── Delete Confirmation State ───
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    type: null,      // 'size' | 'variant'
    id: null,
    variantIndex: null,
    sizeIndex: null,
    title: '',
    message: '',
  });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productRes, categoriesRes] = await Promise.all([
        api.get(`/productsdetail/${id}/`),
        api.get('/categories/'),
      ]);
      setProduct(productRes.data.product);
      setVariants(productRes.data.variants);
      setCategories(categoriesRes.data);
    } catch (err) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/products-edit/${id}/`, {
        name: product.name,
        brand: product.brand,
        category: product.category_id,
        gender: product.gender,
        description: product.description,
      });
      toast.success('Product details updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleSizeFieldChange = (sizeId, field, value) => {
    setSizeUpdates((prev) => ({
      ...prev,
      [sizeId]: { ...prev[sizeId], [field]: value },
    }));
  };

  const handleSaveSize = async (variantIndex, size) => {
    const update = sizeUpdates[size.id];
    if (!update) return;

    setSavingSizeId(size.id);
    try {
      await api.patch(`/products-sizes/${size.id}/`, {
        price: update.price ?? size.price,
        stock: update.stock ?? size.stock,
      });

      setVariants((prev) =>
        prev.map((v, i) =>
          i !== variantIndex
            ? v
            : {
                ...v,
                sizes: v.sizes.map((s) =>
                  s.id === size.id
                    ? { ...s, price: update.price ?? s.price, stock: update.stock ?? s.stock }
                    : s
                ),
              }
        )
      );
      toast.success('Size updated');
    } catch (err) {
      toast.error('Failed to update size');
    } finally {
      setSavingSizeId(null);
    }
  };

  // ─── Delete Handlers ───
  const openDeleteConfirm = (type, payload) => {
    setDeleteConfirm({
      show: true,
      type,
      ...payload,
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      show: false,
      type: null,
      id: null,
      variantIndex: null,
      sizeIndex: null,
      title: '',
      message: '',
    });
  };

  const handleDeleteSize = async () => {
    const { id: sizeId, variantIndex, sizeIndex } = deleteConfirm;
    setDeletingId(sizeId);
    try {
      await api.delete(`/products-sizes/${sizeId}/`);
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex
            ? { ...v, sizes: v.sizes.filter((_, si) => si !== sizeIndex) }
            : v
        )
      );
      toast.success('Size deleted');
      closeDeleteConfirm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete size');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteVariant = async () => {
    const { id: variantId, variantIndex } = deleteConfirm;
    setDeletingId(variantId);
    try {
      await api.delete(`/productsvariants/${variantId}/`);
      setVariants((prev) => prev.filter((_, i) => i !== variantIndex));
      toast.success('Variant deleted');
      closeDeleteConfirm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete variant');
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewVariantImage = (file) => {
    setNewVariant((prev) => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
  };

  const handleAddVariant = async () => {
    if (!newVariant.color.trim() || !newVariant.image) {
      toast.error('Color and image are required');
      return;
    }

    setAddingVariant(true);
    try {
      const formData = new FormData();
      formData.append('product', id);
      formData.append('color', newVariant.color.trim());
      formData.append('image', newVariant.image);

      const res = await api.post('/products/variants/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVariants((prev) => [...prev, res.data.variant]);
      setNewVariant({ color: '', image: null, imagePreview: null });
      setShowAddVariant(false);
      toast.success('Variant added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add variant');
    } finally {
      setAddingVariant(false);
    }
  };

  const handleToggleVariantActive = async (variant, variantIndex) => {
    try {
      await api.patch(`/productsvariants/${variant.id}/`, {
        is_active: !variant.is_active,
      });
      setVariants((prev) =>
        prev.map((v, i) => (i === variantIndex ? { ...v, is_active: !v.is_active } : v))
      );
      toast.success(`Variant ${!variant.is_active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update variant');
    }
  };

  // ─── Variant Edit Handlers ───
  const startEditVariant = (variant) => {
    setEditingVariantId(variant.id);
    setEditVariantData({
      color: variant.color,
      image: null,
      imagePreview: variant.image || null,
    });
  };

  const cancelEditVariant = () => {
    setEditingVariantId(null);
    setEditVariantData({ color: '', image: null, imagePreview: null });
  };

  const handleEditVariantImage = (file) => {
    setEditVariantData((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSaveVariantEdit = async (variant, variantIndex) => {
    if (!editVariantData.color.trim()) {
      toast.error('Color name is required');
      return;
    }

    setSavingVariantId(variant.id);
    try {
      const formData = new FormData();
      formData.append('color', editVariantData.color.trim());
      if (editVariantData.image) {
        formData.append('image', editVariantData.image);
      }

      const res = await api.patch(`/productsvariants/${variant.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex
            ? { ...v, color: res.data.color || editVariantData.color.trim(), image: res.data.image || v.image }
            : v
        )
      );
      toast.success('Variant updated');
      cancelEditVariant();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update variant');
    } finally {
      setSavingVariantId(null);
    }
  };

  const openAddSize = (variantIndex) => {
    setAddingSizeVariantIndex(variantIndex);
    setNewSizeSelections({});
    setSizeTypeForNew('top');
  };

  const closeAddSize = () => {
    setAddingSizeVariantIndex(null);
    setNewSizeSelections({});
  };

  const toggleNewSize = (sizeKey) => {
    setNewSizeSelections((prev) => {
      const updated = { ...prev };
      if (updated[sizeKey]) {
        delete updated[sizeKey];
      } else {
        updated[sizeKey] = { price: '', stock: '' };
      }
      return updated;
    });
  };

  const updateNewSizeField = (sizeKey, field, value) => {
    setNewSizeSelections((prev) => ({
      ...prev,
      [sizeKey]: { ...prev[sizeKey], [field]: value },
    }));
  };

  const handleSaveNewSizes = async (variantIndex, variantId) => {
    const entries = Object.entries(newSizeSelections);

    if (entries.length === 0) {
      toast.error('Select at least one size');
      return;
    }
    for (const [, data] of entries) {
      if (!data.price || !data.stock) {
        toast.error('Fill price and stock for all selected sizes');
        return;
      }
    }

    setSavingNewSizes(true);
    try {
      const payload = entries.map(([size, data]) => ({
        size,
        price: Number(data.price),
        stock: Number(data.stock),
      }));

      const res = await api.post(`/products/variants/${variantId}/sizes/add/`, {
        sizes: payload,
      });

      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex ? { ...v, sizes: [...v.sizes, ...res.data.sizes] } : v
        )
      );

      closeAddSize();
      toast.success('Sizes added successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add sizes');
    } finally {
      setSavingNewSizes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={32} />
        <p className="text-slate-400 text-sm mt-3">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium text-sm">Product not found</p>
      </div>
    );
  }

  const genderKey = product.gender === 'kids' || product.gender === 'unisex' ? 'male' : product.gender;

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-[fadeIn_0.15s_ease-out]">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-1">
              Delete {deleteConfirm.type === 'variant' ? 'Variant' : 'Size'}
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              {deleteConfirm.type === 'variant'
                ? 'Are you sure? This will permanently remove this color variant and all its sizes.'
                : 'Are you sure? This size will be permanently removed from this variant.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteConfirm.type === 'variant' ? handleDeleteVariant : handleDeleteSize}
                disabled={deletingId !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deletingId !== null ? <ClipLoader color="#ffffff" size={14} /> : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back link */}
      <button
        onClick={() => navigate('/products')}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Products
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Edit Product</h1>
        <p className="text-slate-400 text-sm mt-1">Update product details, variants, and inventory</p>
      </div>

      {/* Product Info */}
      <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 space-y-5 mb-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Product Details</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleProductChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={product.brand}
              onChange={handleProductChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <div className="relative">
              <select
                name="category_id"
                value={product.category_id}
                onChange={handleProductChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white appearance-none pr-10 transition-all"
              >
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
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setProduct((prev) => ({ ...prev, gender: g }))}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-all active:scale-[0.98] ${
                  product.gender === g
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleProductChange}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 min-w-[140px]"
          >
            {saving ? <ClipLoader color="#ffffff" size={16} /> : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Save Details
              </>
            )}
          </button>
        </div>
      </form>

      {/* Variants */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Variants & Inventory</h2>
          <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            {variants.length} colors
          </span>
        </div>

        {variants.map((variant, vIndex) => {
          const isEditing = editingVariantId === variant.id;
          const availableSizes = (SIZE_GROUPS[genderKey]?.[sizeTypeForNew] || []).filter(
            (sizeKey) => !variant.sizes.some((s) => s.size === sizeKey)
          );

          return (
            <div key={variant.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Variant Header */}
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {isEditing ? (
                    <div className="shrink-0">
                      {editVariantData.imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={editVariantData.imagePreview}
                            alt="preview"
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100"
                          />
                          <button
                            onClick={() => setEditVariantData((prev) => ({ ...prev, image: null, imagePreview: null }))}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors shadow-sm"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : variant.image ? (
                    <img
                      src={variant.image}
                      alt={variant.color}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editVariantData.color}
                          onChange={(e) => setEditVariantData((prev) => ({ ...prev, color: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="Color name"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEditVariantImage(e.target.files[0])}
                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 text-slate-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-800 truncate">{variant.color}</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${
                            variant.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${variant.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {variant.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveVariantEdit(variant, vIndex)}
                        disabled={savingVariantId === variant.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {savingVariantId === variant.id ? <ClipLoader color="#2563eb" size={12} /> : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                        Save
                      </button>
                      <button
                        onClick={cancelEditVariant}
                        disabled={savingVariantId === variant.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditVariant(variant)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          openDeleteConfirm('variant', {
                            id: variant.id,
                            variantIndex: vIndex,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                      <button
                        onClick={() => handleToggleVariantActive(variant, vIndex)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          variant.is_active
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200'
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          {variant.is_active ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        {variant.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                {variant.sizes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-400">No sizes added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {variant.sizes.map((size, sIndex) => (
                      <div key={size.id} className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 w-14 text-center shrink-0">
                          {size.size.split('_')[0]}
                        </span>
                        <div className="relative">
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</div>
                          <input
                            type="number"
                            defaultValue={size.price}
                            onChange={(e) => handleSizeFieldChange(size.id, 'price', e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg pl-5 pr-3 py-1.5 text-sm w-24 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Price"
                          />
                        </div>
                        <input
                          type="number"
                          defaultValue={size.stock}
                          onChange={(e) => handleSizeFieldChange(size.id, 'stock', e.target.value)}
                          className={`bg-white border rounded-lg px-3 py-1.5 text-sm w-24 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                            size.stock <= 5 ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                          }`}
                          placeholder="Stock"
                        />
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => handleSaveSize(vIndex, size)}
                            disabled={savingSizeId === size.id || !sizeUpdates[size.id]}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            {savingSizeId === size.id ? <ClipLoader color="#2563eb" size={12} /> : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                            Save
                          </button>
                          <button
                            onClick={() =>
                              openDeleteConfirm('size', {
                                id: size.id,
                                variantIndex: vIndex,
                                sizeIndex: sIndex,
                              })
                            }
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete size"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Size */}
                {addingSizeVariantIndex === vIndex ? (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Add New Sizes</p>
                    </div>

                    <div className="flex gap-2">
                      {['top', 'bottom'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSizeTypeForNew(type)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-all active:scale-[0.98] ${
                            sizeTypeForNew === type
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availableSizes.length === 0 ? (
                        <p className="text-xs text-slate-400">All sizes already added for this type</p>
                      ) : (
                        availableSizes.map((sizeKey) => (
                          <button
                            key={sizeKey}
                            onClick={() => toggleNewSize(sizeKey)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${
                              newSizeSelections[sizeKey]
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {sizeKey.split('_')[0]}
                          </button>
                        ))
                      )}
                    </div>

                    {Object.entries(newSizeSelections).map(([sizeKey, data]) => (
                      <div key={sizeKey} className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 w-14 text-center shrink-0">
                          {sizeKey.split('_')[0]}
                        </span>
                        <div className="relative">
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</div>
                          <input
                            type="number"
                            placeholder="Price"
                            value={data.price}
                            onChange={(e) => updateNewSizeField(sizeKey, 'price', e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg pl-5 pr-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <input
                          type="number"
                          placeholder="Stock"
                          value={data.stock}
                          onChange={(e) => updateNewSizeField(sizeKey, 'stock', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-28 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    ))}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleSaveNewSizes(vIndex, variant.id)}
                        disabled={savingNewSizes || Object.keys(newSizeSelections).length === 0}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                      >
                        {savingNewSizes ? <ClipLoader color="#ffffff" size={12} /> : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Save Sizes
                          </>
                        )}
                      </button>
                      <button
                        onClick={closeAddSize}
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openAddSize(vIndex)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Size
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Variant */}
      {!showAddVariant ? (
        <button
          onClick={() => setShowAddVariant(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add new color variant
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">New Variant</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Color Name</label>
              <input
                type="text"
                placeholder="e.g. Navy Blue"
                value={newVariant.color}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, color: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Variant Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleNewVariantImage(e.target.files[0])}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 text-slate-500"
                />
              </div>
            </div>
          </div>

          {newVariant.imagePreview && (
            <div className="relative inline-block">
              <img src={newVariant.imagePreview} alt="preview" className="w-20 h-20 rounded-xl object-cover ring-2 ring-slate-100" />
              <button
                onClick={() => setNewVariant((prev) => ({ ...prev, image: null, imagePreview: null }))}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddVariant}
              disabled={addingVariant}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {addingVariant ? <ClipLoader color="#ffffff" size={14} /> : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Variant
                </>
              )}
            </button>
            <button
              onClick={() => setShowAddVariant(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-400">
            After adding, use "Add Size" on the variant to add sizes.
          </p>
        </div>
      )}
    </div>
  );
}
