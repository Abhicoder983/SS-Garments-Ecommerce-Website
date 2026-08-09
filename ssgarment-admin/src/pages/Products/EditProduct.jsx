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

  // Add Size (per-variant) state
  const [addingSizeVariantIndex, setAddingSizeVariantIndex] = useState(null);
  const [sizeTypeForNew, setSizeTypeForNew] = useState('top');
  const [newSizeSelections, setNewSizeSelections] = useState({}); // { "M_38": { price, stock } }
  const [savingNewSizes, setSavingNewSizes] = useState(false);

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

  // ---- Add Size logic (kaam karega naye aur purane, dono variants ke liye) ----

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
      <div className="flex items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={40} />
      </div>
    );
  }

  if (!product) {
    return <p className="text-center text-gray-400 mt-10">Product not found</p>;
  }

  const genderKey = product.gender === 'kids' || product.gender === 'unisex' ? 'male' : product.gender;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/products')}
        className="text-gray-500 hover:text-gray-700 text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to Products
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h1>

      {/* Product Info */}
      <form onSubmit={handleSaveProduct} className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Product Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleProductChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Brand</label>
            <input
              type="text"
              name="brand"
              value={product.brand}
              onChange={handleProductChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
            <select
              name="category_id"
              value={product.category_id}
              onChange={handleProductChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Gender</label>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setProduct((prev) => ({ ...prev, gender: g }))}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition ${
                  product.gender === g
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleProductChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {saving ? <ClipLoader color="#ffffff" size={16} /> : 'Save Details'}
        </button>
      </form>

      {/* Variants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Variants</h2>

        {variants.map((variant, vIndex) => {
          const availableSizes = (SIZE_GROUPS[genderKey]?.[sizeTypeForNew] || []).filter(
            (sizeKey) => !variant.sizes.some((s) => s.size === sizeKey)
          );

          return (
            <div key={variant.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={variant.image}
                    alt={variant.color}
                    className="w-14 h-14 rounded object-cover border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{variant.color}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        variant.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {variant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVariantActive(variant, vIndex)}
                  className={`text-sm font-medium ${
                    variant.is_active
                      ? 'text-orange-600 hover:text-orange-700'
                      : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {variant.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {/* Existing sizes */}
              {variant.sizes.length === 0 ? (
                <p className="text-gray-400 text-sm mb-2">No sizes added yet</p>
              ) : (
                <div className="space-y-2 mb-2">
                  {variant.sizes.map((size) => (
                    <div key={size.id} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 w-16">
                        {size.size.split('_')[0]}
                      </span>
                      <input
                        type="number"
                        defaultValue={size.price}
                        onChange={(e) => handleSizeFieldChange(size.id, 'price', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Price"
                      />
                      <input
                        type="number"
                        defaultValue={size.stock}
                        onChange={(e) => handleSizeFieldChange(size.id, 'stock', e.target.value)}
                        className={`border rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          size.stock <= 5 ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Stock"
                      />
                      <button
                        onClick={() => handleSaveSize(vIndex, size)}
                        disabled={savingSizeId === size.id || !sizeUpdates[size.id]}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {savingSizeId === size.id ? '...' : 'Save'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Size — har variant ke liye available, naya ho ya purana */}
              {addingSizeVariantIndex === vIndex ? (
                <div className="mt-3 pt-3 border-t space-y-3">
                  <div className="flex gap-2">
                    {['top', 'bottom'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSizeTypeForNew(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition ${
                          sizeTypeForNew === type
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSizes.length === 0 ? (
                      <p className="text-xs text-gray-400">All sizes already added for this type</p>
                    ) : (
                      availableSizes.map((sizeKey) => (
                        <button
                          key={sizeKey}
                          onClick={() => toggleNewSize(sizeKey)}
                          className={`px-3 py-1 rounded text-xs font-medium border transition ${
                            newSizeSelections[sizeKey]
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {sizeKey.split('_')[0]}
                        </button>
                      ))
                    )}
                  </div>

                  {Object.entries(newSizeSelections).map(([sizeKey, data]) => (
                    <div key={sizeKey} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 w-16">
                        {sizeKey.split('_')[0]}
                      </span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={data.price}
                        onChange={(e) => updateNewSizeField(sizeKey, 'price', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={data.stock}
                        onChange={(e) => updateNewSizeField(sizeKey, 'stock', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveNewSizes(vIndex, variant.id)}
                      disabled={savingNewSizes || Object.keys(newSizeSelections).length === 0}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingNewSizes ? '...' : 'Save Sizes'}
                    </button>
                    <button
                      onClick={closeAddSize}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openAddSize(vIndex)}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-xs font-medium"
                >
                  + Add Size
                </button>
              )}
            </div>
          );
        })}

        {/* Add new variant */}
        {!showAddVariant ? (
          <button
            onClick={() => setShowAddVariant(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add new color variant
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-medium text-gray-800">New Variant</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Color"
                value={newVariant.color}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, color: e.target.value }))}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleNewVariantImage(e.target.files[0])}
                className="text-sm"
              />
            </div>
            {newVariant.imagePreview && (
              <img src={newVariant.imagePreview} alt="preview" className="w-16 h-16 rounded object-cover border" />
            )}
            <div className="flex gap-3">
              <button
                onClick={handleAddVariant}
                disabled={addingVariant}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {addingVariant ? <ClipLoader color="#ffffff" size={14} /> : 'Add Variant'}
              </button>
              <button
                onClick={() => setShowAddVariant(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-400">
              After adding, use "+ Add Size" on the variant to add sizes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}