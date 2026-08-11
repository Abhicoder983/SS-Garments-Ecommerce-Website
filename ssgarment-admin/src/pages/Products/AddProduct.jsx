// src/pages/Products/AddProduct.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  UploadCloud,
  X,
  Trash2,
  Plus,
  Package,
} from 'lucide-react';
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

const emptyVariant = () => ({
  color: '',
  image: null,
  imagePreview: null,
  sizeType: 'top', // 'top' | 'bottom'
  sizes: {}, // { "M_38": { price: '', stock: '' } }
});

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: '',
    brand: '',
    category: '',
    gender: 'male',
    description: '',
  });
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([emptyVariant()]);

  useState(() => {
    api.get('/categories/').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleImageChange = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, image: file, imagePreview: preview } : v))
    );
  };

  const removeImage = (index) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, image: null, imagePreview: null } : v))
    );
  };

  const toggleSize = (variantIndex, sizeKey) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        const newSizes = { ...v.sizes };
        if (newSizes[sizeKey]) {
          delete newSizes[sizeKey];
        } else {
          newSizes[sizeKey] = { price: '', stock: '' };
        }
        return { ...v, sizes: newSizes };
      })
    );
  };

  const updateSizeField = (variantIndex, sizeKey, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          sizes: {
            ...v.sizes,
            [sizeKey]: { ...v.sizes[sizeKey], [field]: value },
          },
        };
      })
    );
  };

  const validate = () => {
    if (!product.name.trim() || !product.brand.trim() || !product.category) {
      toast.error('Fill in all product details');
      return false;
    }
    if (variants.length === 0) {
      toast.error('Add at least one variant');
      return false;
    }
    for (const v of variants) {
      if (!v.color.trim() || !v.image) {
        toast.error('Each variant needs a color and image');
        return false;
      }
      const sizeKeys = Object.keys(v.sizes);
      if (sizeKeys.length === 0) {
        toast.error(`Add at least one size for "${v.color}"`);
        return false;
      }
      for (const key of sizeKeys) {
        const { price, stock } = v.sizes[key];
        if (!price || !stock) {
          toast.error(`Fill price and stock for all selected sizes in "${v.color}"`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Step 1: product create
      const productRes = await api.post('/productscreate/', product);
      const productId = productRes.data.id;

      // Step 2: har variant ke liye image + sizes bhejo
      for (const v of variants) {
        const formData = new FormData();
        formData.append('product', productId);
        formData.append('color', v.color);
        formData.append('image', v.image);
        formData.append(
          'sizes',
          JSON.stringify(
            Object.entries(v.sizes).map(([size, data]) => ({
              size,
              price: Number(data.price),
              stock: Number(data.stock),
            }))
          )
        );

        await api.post('/productsvariants/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Product created successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const totalSizesSelected = variants.reduce(
    (sum, v) => sum + Object.keys(v.sizes).length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/products')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Back to products"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                Add Product
              </h1>
              <p className="text-xs text-slate-400">
                {variants.length} variant{variants.length !== 1 ? 's' : ''} ·{' '}
                {totalSizesSelected} size{totalSizesSelected !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Product Info */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Product Details
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Product name
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleProductChange}
              placeholder="e.g. Oversized Drop Shoulder Tee"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={product.brand}
                onChange={handleProductChange}
                placeholder="e.g. Skyla"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleProductChange}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Gender
            </label>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
              {GENDER_OPTIONS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setProduct((prev) => ({ ...prev, gender: g }))}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                    product.gender === g
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleProductChange}
              rows={3}
              placeholder="Fabric, fit, print details..."
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none"
            />
          </div>
        </section>

        {/* Variants */}
        {variants.map((variant, vIndex) => {
          const sizeGroup = product.gender === 'kids' || product.gender === 'unisex'
            ? SIZE_GROUPS.male
            : SIZE_GROUPS[product.gender];
          const availableSizes = sizeGroup[variant.sizeType];
          const selectedCount = Object.keys(variant.sizes).length;

          return (
            <section
              key={vIndex}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                    {vIndex + 1}
                  </span>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {variant.color || 'New color variant'}
                  </h2>
                  {selectedCount > 0 && (
                    <span className="text-xs text-slate-400">
                      {selectedCount} size{selectedCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(vIndex)}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Color
                    </label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => updateVariant(vIndex, 'color', e.target.value)}
                      placeholder="e.g. Navy Blue"
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Size Type
                    </label>
                    <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                      {['top', 'bottom'].map((type) => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => updateVariant(vIndex, 'sizeType', type)}
                          className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                            variant.sizeType === type
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image dropzone */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Image
                  </label>
                  {variant.imagePreview ? (
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-200 group">
                      <img
                        src={variant.imagePreview}
                        alt={variant.color || 'variant preview'}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(vIndex)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        aria-label="Remove image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-28 h-28 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500 cursor-pointer transition">
                      <UploadCloud size={20} />
                      <span className="text-[11px] font-medium">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(vIndex, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableSizes.map((sizeKey) => (
                    <button
                      type="button"
                      key={sizeKey}
                      onClick={() => toggleSize(vIndex, sizeKey)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        variant.sizes[sizeKey]
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {sizeKey.split('_')[0]}
                    </button>
                  ))}
                </div>

                {selectedCount > 0 ? (
                  <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {Object.entries(variant.sizes).map(([sizeKey, data]) => (
                      <div
                        key={sizeKey}
                        className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50/50"
                      >
                        <span className="text-xs font-semibold text-slate-700 w-10 shrink-0">
                          {sizeKey.split('_')[0]}
                        </span>
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={data.price}
                            onChange={(e) => updateSizeField(vIndex, sizeKey, 'price', e.target.value)}
                            className="w-full border border-slate-300 rounded-md pl-6 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition bg-white"
                          />
                        </div>
                        <input
                          type="number"
                          placeholder="Stock qty"
                          value={data.stock}
                          onChange={(e) => updateSizeField(vIndex, sizeKey, 'stock', e.target.value)}
                          className="flex-1 border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition bg-white"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Select sizes above to set price and stock for each.
                  </p>
                )}
              </div>
            </section>
          );
        })}

        <button
          type="button"
          onClick={addVariant}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-white transition"
        >
          <Plus size={15} />
          Add another color variant
        </button>
      </form>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition min-w-[140px]"
          >
            {loading ? <ClipLoader color="#ffffff" size={16} /> : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}