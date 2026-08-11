// src/pages/Orders/OrderDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUS_FLOW = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders-updateDetail/${id}/`);
      setOrder(res.data);
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleManualStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/orders-updateDetail/${id}/`, { status: newStatus });
      setOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Order status updated to ${newStatus}`);
      setShowOverride(false);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      CONFIRMED: 'bg-amber-50 text-amber-700 border-amber-200',
      SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
      DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusDot = (status) => {
    const colors = {
      CONFIRMED: 'bg-amber-500',
      SHIPPED: 'bg-blue-500',
      DELIVERED: 'bg-emerald-500',
    };
    return colors[status] || 'bg-slate-500';
  };

  const getStepIcon = (step) => {
    const icons = {
      CONFIRMED: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      SHIPPED: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      DELIVERED: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      ),
    };
    return icons[step];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={32} />
        <p className="text-slate-400 text-sm mt-3">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium text-sm">Order not found</p>
      </div>
    );
  }

  const currentStepIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/orders')}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Orders
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                #{order.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                {order.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Order Details</h1>
            <p className="text-slate-400 text-sm mt-1">
              Placed on {new Date(order.order_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="relative">
          <div className="flex items-center">
            {STATUS_FLOW.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isDone
                          ? isCurrent
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100'
                            : 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                      }`}
                    >
                      {isDone ? getStepIcon(step) : <span className="text-sm font-bold">{idx + 1}</span>}
                    </div>
                    <span className={`text-xs font-semibold mt-2 ${isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${isDone ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Override */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          {!showOverride ? (
            <button
              onClick={() => setShowOverride(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Manually update status
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select new status</p>
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_FLOW.map((step) => (
                  <button
                    key={step}
                    onClick={() => handleManualStatusChange(step)}
                    disabled={updating || order.status === step}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                      order.status === step
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {updating && order.status !== step ? (
                      <ClipLoader color="#475569" size={10} />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(step)}`} />
                    )}
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </button>
                ))}
                <button
                  onClick={() => setShowOverride(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">
            Status updates automatically via Ekart tracking. Use manual override only if needed.
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Customer Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Customer</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              {order.customer_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{order.customer_name}</p>
              <p className="text-xs text-slate-500 truncate">{order.customer_email}</p>
            </div>
          </div>
        </div>

        {/* Tracking Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Tracking</h2>
          </div>
          {order.tracking_id ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg">
                {order.tracking_id}
              </span>
              <span className="text-xs text-slate-400">Ekart</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Not assigned yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-5 sm:p-6 pb-0 mb-4">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Order Items</h2>
          <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            {order.items?.length || 0} items
          </span>
        </div>

        {!order.items || order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No items in this order</p>
          </div>
        ) : (
          <>
            {/* Mobile: Item Cards */}
            <div className="sm:hidden space-y-3 p-4 pb-0">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => navigate(`/products/edit/${item.product_id}`)}
                >
                  {item.variant_image ? (
                    <img
                      src={item.variant_image}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0">
                      No Image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.color} · Size {item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">Qty: <span className="font-semibold text-slate-700">{item.qty}</span></span>
                      <span className="text-sm font-bold text-slate-800">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate(`/products/edit/${item.product_id}`)}
                    >
                      <td className="px-6 py-4">
                        {item.variant_image ? (
                          <img
                            src={item.variant_image}
                            alt={item.product_name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-semibold">{item.product_name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.color}</td>
                      <td className="px-6 py-4 text-slate-600">{item.qty}</td>
                      <td className="px-6 py-4 text-slate-600">{item.size}</td>
                      <td className="px-6 py-4 text-slate-600">₹{item.price?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-slate-800 font-bold text-right">₹{(item.price * item.qty).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end items-center gap-4 px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-sm text-slate-500">Total Amount</span>
              <span className="text-lg font-bold text-slate-800">₹{order.total_price?.toLocaleString('en-IN')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}