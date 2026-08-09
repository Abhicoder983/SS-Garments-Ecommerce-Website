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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
        <button
          onClick={() => navigate('/coupons/add')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by coupon code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <ClipLoader color="#2563eb" size={36} />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">No coupons found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b">
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Discount</th>
                <th className="px-6 py-3 font-medium">Min Order</th>
                <th className="px-6 py-3 font-medium">Usage</th>
                <th className="px-6 py-3 font-medium">Valid Until</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => {
                const expired = isExpired(coupon.valid_until);
                return (
                  <tr
                    key={coupon.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-800">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {coupon.discount_type === 'PERCENTAGE'
                        ? `${coupon.discount_value}%`
                        : `₹${coupon.discount_value}`}
                      {coupon.max_discount_amount && coupon.discount_type === 'PERCENTAGE' && (
                        <span className="text-gray-400 text-xs"> (max ₹{coupon.max_discount_amount})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{coupon.min_order_value}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {coupon.used_count}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(coupon.valid_until).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {expired ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          Expired
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            coupon.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        disabled={togglingId === coupon.id || expired}
                        className={`font-medium disabled:opacity-40 disabled:cursor-not-allowed ${
                          coupon.is_active
                            ? 'text-orange-600 hover:text-orange-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {togglingId === coupon.id
                          ? '...'
                          : coupon.is_active
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        disabled={deletingId === coupon.id}
                        className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {deletingId === coupon.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}