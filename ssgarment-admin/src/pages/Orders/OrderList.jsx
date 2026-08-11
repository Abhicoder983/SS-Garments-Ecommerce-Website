// src/pages/Orders/OrderList.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUS_OPTIONS = ['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const statusCounts = {
    ALL: orders.length,
    CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
    SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`text-left rounded-xl border p-3 transition-all duration-200 ${
              statusFilter === status
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'bg-white border-slate-200/60 hover:border-slate-300'
            }`}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {status === 'ALL' ? 'Total' : status.charAt(0) + status.slice(1).toLowerCase()}
            </p>
            <p className={`text-xl font-bold mt-1 ${
              statusFilter === status ? 'text-blue-600' : 'text-slate-800'
            }`}>
              {statusCounts[status]}
            </p>
          </button>
        ))}
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
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <ClipLoader color="#2563eb" size={32} />
          <p className="text-slate-400 text-sm mt-3">Loading orders...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            {search || statusFilter !== 'ALL' ? 'No orders match your filters' : 'No orders found'}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {search || statusFilter !== 'ALL' ? 'Try adjusting your search or filters' : 'Orders will appear here once customers place them'}
          </p>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && filteredOrders.length > 0 && (
        <div className="md:hidden space-y-3 mb-6">
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{order.id}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                    {order.customer_name}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}
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
      )}

      {/* Desktop Table View */}
      {!loading && filteredOrders.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="group hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        #{order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-semibold whitespace-nowrap">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(order.order_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-bold whitespace-nowrap">
                      ₹{order.total_price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{paginatedOrders.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{filteredOrders.length}</span> orders · Page{' '}
            <span className="font-semibold text-slate-700">{page}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Prev
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}