// src/pages/Coupons/AddCoupon.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AddCoupon() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    min_order_value: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!form.discount_value || Number(form.discount_value) <= 0) {
      toast.error('Enter a valid discount value');
      return;
    }
    if (form.discount_type === 'PERCENTAGE' && Number(form.discount_value) > 100) {
      toast.error('Percentage discount cannot exceed 100');
      return;
    }
    if (!form.valid_from || !form.valid_until) {
      toast.error('Select validity dates');
      return;
    }
    if (new Date(form.valid_until) <= new Date(form.valid_from)) {
      toast.error('Valid until date must be after valid from date');
      return;
    }

    setLoading(true);
    try {
      await api.post('/coupons/', {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value) || 0,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        valid_from: form.valid_from,
        valid_until: form.valid_until,
      });
      toast.success('Coupon created successfully');
      navigate('/coupons');
    } catch (err) {
      console.log(err.response?.data.error)
      toast.error(err.response?.data?.error || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/coupons')}
        className="text-gray-500 hover:text-gray-700 text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to Coupons
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Coupon</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Coupon Code
          </label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="e.g. SAVE20"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Discount type + value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Discount Type
            </label>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Discount Value
            </label>
            <input
              type="number"
              name="discount_value"
              value={form.discount_value}
              onChange={handleChange}
              placeholder={form.discount_type === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 100'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Min order + max discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Minimum Order Value (₹)
            </label>
            <input
              type="number"
              name="min_order_value"
              value={form.min_order_value}
              onChange={handleChange}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Max Discount Cap (₹)
              {form.discount_type === 'FLAT' && (
                <span className="text-gray-400 font-normal"> (N/A for flat)</span>
              )}
            </label>
            <input
              type="number"
              name="max_discount_amount"
              value={form.max_discount_amount}
              onChange={handleChange}
              disabled={form.discount_type === 'FLAT'}
              placeholder="No limit"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Usage limit */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Usage Limit
          </label>
          <input
            type="number"
            name="usage_limit"
            value={form.usage_limit}
            onChange={handleChange}
            placeholder="Leave empty for unlimited"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Validity dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Valid From
            </label>
            <input
              type="date"
              name="valid_from"
              value={form.valid_from}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Valid Until
            </label>
            <input
              type="date"
              name="valid_until"
              value={form.valid_until}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? <ClipLoader color="#ffffff" size={16} /> : 'Create Coupon'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}