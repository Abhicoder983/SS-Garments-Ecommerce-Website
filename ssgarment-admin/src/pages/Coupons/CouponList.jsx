// src/pages/Coupons/CouponList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function CouponList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons/');
      setCoupons(res.data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    setTogglingId(coupon.id);
    try {
      await api.patch(`/coupons/${coupon.id}/`, {
        is_active: !coupon.is_active,
      });
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      toast.success(`Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update coupon status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await api.delete(`/coupons/${id}/`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  const isExpired = (validUntil) => new Date(validUntil) < new Date();

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = coupons.filter((c) => c.is_active && !isExpired(c.valid_until)).length;
  const expiredCount = coupons.filter((c) => isExpired(c.valid_until)).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Coupons</h1>
          <p className="text-slate-400 text-sm mt-1">Manage discount codes and promotional offers</p>
        </div>
        <button
          onClick={() => navigate('/coupons/add')}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{coupons.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expired</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">{expiredCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ClipLoader color="#2563eb" size={32} />
            <p className="text-slate-400 text-sm mt-3">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium text-sm">No coupons found</p>
            <p className="text-slate-400 text-xs mt-1">
              {search ? 'Try a different search term' : 'Create your first coupon to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Min Order</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valid Until</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon.valid_until);
                  return (
                    <tr
                      key={coupon.id}
                      className="group hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold tracking-wide border border-slate-200">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-800 font-medium">
                          {coupon.discount_type === 'PERCENTAGE'
                            ? `${coupon.discount_value}%`
                            : `₹${coupon.discount_value}`}
                        </span>
                        {coupon.max_discount_amount && coupon.discount_type === 'PERCENTAGE' && (
                          <span className="text-slate-400 text-xs ml-1">max ₹{coupon.max_discount_amount}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">₹{coupon.min_order_value}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-800 font-medium">{coupon.used_count}</span>
                          <span className="text-slate-400 text-xs">
                            {coupon.usage_limit ? `/ ${coupon.usage_limit}` : '/ ∞'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${expired ? 'text-slate-400' : 'text-slate-600'}`}>
                          {new Date(coupon.valid_until).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {expired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Expired
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              coupon.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            disabled={togglingId === coupon.id || expired}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              coupon.is_active
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {togglingId === coupon.id ? (
                              <ClipLoader color={coupon.is_active ? '#d97706' : '#059669'} size={12} />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                {coupon.is_active ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                )}
                              </svg>
                            )}
                            {coupon.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={deletingId === coupon.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-30"
                          >
                            {deletingId === coupon.id ? (
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}