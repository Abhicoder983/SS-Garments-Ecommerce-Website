// src/pages/Products/AddProduct.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const preview = URL.createObjectURL(file);
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, image: file, imagePreview: preview } : v))
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

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/products')}
        className="text-gray-500 hover:text-gray-700 text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to Products
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
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
                name="category"
                value={product.category}
                onChange={handleProductChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
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
        </div>

        {/* Variants */}
        {variants.map((variant, vIndex) => {
          const sizeGroup = product.gender === 'kids' || product.gender === 'unisex'
            ? SIZE_GROUPS.male
            : SIZE_GROUPS[product.gender];
          const availableSizes = sizeGroup[variant.sizeType];

          return (
            <div key={vIndex} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Variant {vIndex + 1}
                </h2>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(vIndex)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Color</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(vIndex, 'color', e.target.value)}
                    placeholder="e.g. Navy Blue"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(vIndex, e.target.files[0])}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              {variant.imagePreview && (
                <img
                  src={variant.imagePreview}
                  alt="preview"
                  className="w-20 h-20 rounded object-cover border"
                />
              )}

              {/* Top/Bottom toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Size Type</label>
                <div className="flex gap-2">
                  {['top', 'bottom'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => updateVariant(vIndex, 'sizeType', type)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition ${
                        variant.sizeType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableSizes.map((sizeKey) => (
                    <button
                      type="button"
                      key={sizeKey}
                      onClick={() => toggleSize(vIndex, sizeKey)}
                      className={`px-3 py-1 rounded text-xs font-medium border transition ${
                        variant.sizes[sizeKey]
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {sizeKey.split('_')[0]}
                    </button>
                  ))}
                </div>

                {Object.keys(variant.sizes).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(variant.sizes).map(([sizeKey, data]) => (
                      <div key={sizeKey} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500 w-16">
                          {sizeKey.split('_')[0]}
                        </span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={data.price}
                          onChange={(e) => updateSizeField(vIndex, sizeKey, 'price', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={data.stock}
                          onChange={(e) => updateSizeField(vIndex, sizeKey, 'stock', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addVariant}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + Add another color variant
        </button>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? <ClipLoader color="#ffffff" size={16} /> : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}