// src/pages/Customers/CustomerDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}/`);
      setCustomer(res.data.customer);
      setOrders(res.data.orders);
    } catch (err) {
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      await api.patch(`/customers-update/${id}/`, {
        is_active: !customer.is_active,
      });
      setCustomer((prev) => ({ ...prev, is_active: !prev.is_active }));
      toast.success(
        `${customer.name || 'Customer'} ${!customer.is_active ? 'unblocked' : 'blocked'}`
      );
    } catch (err) {
      toast.error('Failed to update customer status');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={32} />
        <p className="text-slate-400 text-sm mt-3">Loading customer details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium text-sm">Customer not found</p>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  const getStatusBadge = (status) => {
    const styles = {
      DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
      PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusDot = (status) => {
    const colors = {
      DELIVERED: 'bg-emerald-500',
      SHIPPED: 'bg-blue-500',
      PENDING: 'bg-amber-500',
      CANCELLED: 'bg-red-500',
      PROCESSING: 'bg-indigo-500',
    };
    return colors[status] || 'bg-slate-500';
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/customers')}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Customers
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {customer.profile_image ? (
              <img
                src={customer.profile_image}
                alt={customer.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
                {customer.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
                {customer.name || 'Unnamed Customer'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-slate-500 text-sm truncate">{customer.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                customer.is_active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${customer.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {customer.is_active ? 'Active' : 'Blocked'}
            </span>
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 ${
                customer.is_active
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {toggling ? (
                <ClipLoader color={customer.is_active ? '#dc2626' : '#059669'} size={14} />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  {customer.is_active ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              )}
              {toggling ? 'Updating...' : customer.is_active ? 'Block' : 'Unblock'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-lg font-bold text-slate-800">{customer.total_order ?? orders.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-lg font-bold text-slate-800">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer ID</p>
              <p className="text-sm font-mono text-slate-600 font-medium truncate">{customer.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 sm:p-8 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Saved Addresses</h2>
        </div>
        {customer.address?.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {customer.address.map((addr, idx) => {
      // Parse address whether it's a JSON string or already an object
      let parsedAddr = addr;
      if (typeof addr === 'string') {
        try {
          parsedAddr = JSON.parse(addr);
        } catch {
          parsedAddr = { address: addr };
        }
      }

      return (
        <div key={idx} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white hover:shadow-sm transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              {/* Street Address */}
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {parsedAddr.address || parsedAddr.street || parsedAddr.line1 || '—'}
              </p>
              
              {/* City, State */}
              <p className="text-sm text-slate-500 mt-1">
                {[parsedAddr.city, parsedAddr.state].filter(Boolean).join(', ')}
              </p>
              
              {/* Pincode */}
              {parsedAddr.pincode && (
                <div className="flex items-center gap-1.5 mt-2">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {parsedAddr.pincode}
                  </span>
                </div>
              )}

              {/* Landmark (if present) */}
              {parsedAddr.landmark && (
                <p className="text-xs text-slate-400 mt-1.5 italic">
                  Near: {parsedAddr.landmark}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No addresses saved</p>
          </div>
        )}
      </div>

      {/* Order history */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-5 sm:p-6 pb-0 mb-4">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Order History</h2>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No orders yet</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card view */}
            <div className="sm:hidden space-y-3 p-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      #{order.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {new Date(order.order_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-slate-800 font-bold">₹{order.total_price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(order.order_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-semibold">₹{order.total_price?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}