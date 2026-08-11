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
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/coupons')}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Coupons
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Add Coupon</h1>
        <p className="text-slate-400 text-sm mt-1">Create a new discount code for your customers</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Section: Basic Info */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Basic Details</h2>
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Coupon Code <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                </svg>
              </div>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. SAVE20"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">This code will be converted to uppercase automatically</p>
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Discount Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="discount_type"
                  value={form.discount_type}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white appearance-none transition-all"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Discount Value <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                  {form.discount_type === 'PERCENTAGE' ? '%' : '₹'}
                </div>
                <input
                  type="number"
                  name="discount_value"
                  value={form.discount_value}
                  onChange={handleChange}
                  placeholder={form.discount_type === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 100'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Limits */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Usage Limits</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Minimum Order Value
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</div>
                <input
                  type="number"
                  name="min_order_value"
                  value={form.min_order_value}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Max Discount Cap
                {form.discount_type === 'FLAT' && (
                  <span className="text-slate-400 font-normal text-xs ml-1">(N/A for flat)</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</div>
                <input
                  type="number"
                  name="max_discount_amount"
                  value={form.max_discount_amount}
                  onChange={handleChange}
                  disabled={form.discount_type === 'FLAT'}
                  placeholder="No limit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Usage Limit
            </label>
            <div className="relative max-w-xs">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <input
                type="number"
                name="usage_limit"
                value={form.usage_limit}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section: Validity */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Validity Period</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Valid From <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="valid_from"
                value={form.valid_from}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Valid Until <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="valid_until"
                value={form.valid_until}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 min-w-[140px]"
          >
            {loading ? (
              <ClipLoader color="#ffffff" size={16} />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Coupon
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}