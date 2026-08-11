// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/');
      setStats(res.data);
    } catch (err) {
      setError('Dashboard data load nahi ho payi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={32} />
        <p className="text-slate-400 text-sm mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-red-500 font-medium text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusDot = (status) => {
    const colors = {
      DELIVERED: 'bg-emerald-500',
      SHIPPED: 'bg-blue-500',
      PENDING: 'bg-amber-500',
      CONFIRMED: 'bg-indigo-500',
      CANCELLED: 'bg-red-500',
    };
    return colors[status] || 'bg-slate-500';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Orders"
          value={stats?.total_orders ?? 0}
          navigate="/orders"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Pending Shipment"
          value={stats?.pending_shipment ?? 0}
          navigate="/orders?status=CONFIRMED"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          }
          color="amber"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.total_revenue ?? 0).toLocaleString('en-IN')}`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="emerald"
        />
        <StatCard
          title="Total Customers"
          value={stats?.total_customers ?? 0}
          navigate="/customers"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
          onClick={() => (window.location.href = '/inventory')}
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Low Stock Alerts</h2>
              <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                &lt; 15 left
              </span>
            </div>

            {stats?.low_stock_products?.length > 0 ? (
              <div className="space-y-3">
                {stats.low_stock_products.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">Size: {item.size}</p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">No low stock alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Recent Orders</h2>
            </div>

            {stats?.recent_orders?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                    onClick={() => (window.location.href = `/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          #{order.id} — {order.customer_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.order_date
                            ? new Date(order.order_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                          {order.total_price ? ` · ₹${order.total_price.toLocaleString('en-IN')}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, navigate, icon, color }) {
  const colorStyles = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20 text-blue-600 bg-blue-50',
    amber: 'from-amber-500 to-orange-500 shadow-orange-500/20 text-amber-600 bg-amber-50',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20 text-emerald-600 bg-emerald-50',
    indigo: 'from-indigo-500 to-violet-600 shadow-indigo-500/20 text-indigo-600 bg-indigo-50',
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 relative overflow-hidden ${
        title === 'Total Revenue' ? '' : 'cursor-pointer hover:shadow-md active:scale-[0.98]'
      } transition-all duration-200`}
      onClick={() => {
        if (navigate) window.location.href = navigate;
      }}
    >
      <div className="flex items-start justify-between">
        <div className="relative z-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${style.split(' ').pop()} flex items-center justify-center relative z-10`}>
          <span className={style.split(' ')[style.split(' ').length - 2]}>{icon}</span>
        </div>
      </div>
      {navigate && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
          <span>View details</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      )}
    </div>
  );
}