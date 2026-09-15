// src/pages/Payments/PaymentList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'SUCCESS', 'FAILED'];

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ ALL: 0, PENDING: 0, SUCCESS: 0, FAILED: 0 });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
        if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
        params.append('page', page);
        params.append('page_size', itemsPerPage);

        const res = await api.get(`/payments/?${params.toString()}`);
        setPayments(res.data.results);
        setTotalPages(res.data.total_pages);
        setTotalCount(res.data.count);
        setStats(res.data.stats);
      } catch (err) {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [debouncedSearch, statusFilter, page]);

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      FAILED: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusDot = (status) => {
    const colors = {
      PENDING: 'bg-amber-500',
      SUCCESS: 'bg-emerald-500',
      FAILED: 'bg-red-500',
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

  const formatCurrency = (value) => {
    return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payments</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage all Razorpay transactions</p>
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
              {stats[status] ?? 0}
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
            placeholder="Search by payment ID, order ID, or payment ID..."
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
          <p className="text-slate-400 text-sm mt-3">Loading payments...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && payments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            {search || statusFilter !== 'ALL' ? 'No payments match your filters' : 'No payments found'}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {search || statusFilter !== 'ALL' ? 'Try adjusting your search or filters' : 'Payments will appear here once customers make transactions'}
          </p>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && payments.length > 0 && (
        <div className="md:hidden space-y-3 mb-6">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/payments/${payment.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md inline-block break-all">
                    {payment.id}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                    {payment.customer_name}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(payment.statusID)}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(payment.statusID)}`} />
                  {payment.statusID}
                </span>
              </div>
              <div className="space-y-1.5 mb-3">
                <p className="text-xs text-slate-500 font-mono break-all">
                  <span className="text-slate-400">Order:</span> {payment.razorpay_order_id}
                </p>
                {payment.razorpay_payment_id && (
                  <p className="text-xs text-slate-500 font-mono break-all">
                    <span className="text-slate-400">Payment:</span> {payment.razorpay_payment_id}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {new Date(payment.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-800 font-bold">{formatCurrency(payment.total_price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && payments.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Payment ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Razorpay Order</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Razorpay Payment</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
        
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="group hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md break-all">
                        {payment.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-semibold whitespace-nowrap">
                      {payment.customer_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 break-all">
                        {payment.razorpay_order_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.razorpay_payment_id ? (
                        <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 break-all">
                          {payment.razorpay_payment_id}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-bold whitespace-nowrap">
                      {formatCurrency(payment.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(payment.statusID)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(payment.statusID)}`} />
                        {payment.statusID}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && payments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{payments.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> payments · Page{' '}
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