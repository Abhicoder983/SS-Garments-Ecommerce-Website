// src/pages/Customers/CustomerList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers/');
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (customer) => {
    setTogglingId(customer.id);
    try {
      await api.patch(`/customers-update/${customer.id}/`, {
        is_active: !customer.is_active,
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      toast.success(
        `${customer.name || 'Customer'} ${!customer.is_active ? 'unblocked' : 'blocked'}`
      );
    } catch (err) {
      toast.error('Failed to update customer status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const query = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
  });

  const activeCount = customers.filter((c) => c.is_active).length;
  const blockedCount = customers.filter((c) => !c.is_active).length;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and view all registered customers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blocked</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{blockedCount}</p>
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
            placeholder="Search by name or email..."
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
          <p className="text-slate-400 text-sm mt-3">Loading customers...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            {search ? 'No customers match your search' : 'No customers found'}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {search ? 'Try a different search term' : 'Customers will appear here once they register'}
          </p>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && filteredCustomers.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {customer.profile_image ? (
                    <img
                      src={customer.profile_image}
                      alt={customer.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                      {getInitials(customer.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {customer.name || '—'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ml-2 ${
                    customer.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${customer.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {customer.is_active ? 'Active' : 'Blocked'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                <span>
                  <span className="font-semibold text-slate-700">{customer.total_order ?? 0}</span> orders
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/customers-details/${customer.id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-semibold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View
                </button>
                <button
                  onClick={() => handleToggleActive(customer)}
                  disabled={togglingId === customer.id}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                    customer.is_active
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {togglingId === customer.id ? (
                    <ClipLoader color={customer.is_active ? '#dc2626' : '#059669'} size={12} />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      {customer.is_active ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  )}
                  {togglingId === customer.id ? '...' : customer.is_active ? 'Block' : 'Unblock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && filteredCustomers.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="group hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {customer.profile_image ? (
                          <img
                            src={customer.profile_image}
                            alt={customer.name}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {getInitials(customer.name)}
                          </div>
                        )}
                        <span className="text-slate-800 font-semibold">
                          {customer.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                        {customer.total_order ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          customer.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${customer.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {customer.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/customers-details/${customer.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleToggleActive(customer)}
                          disabled={togglingId === customer.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                            customer.is_active
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {togglingId === customer.id ? (
                            <ClipLoader color={customer.is_active ? '#dc2626' : '#059669'} size={12} />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              {customer.is_active ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                          )}
                          {togglingId === customer.id ? '...' : customer.is_active ? 'Block' : 'Unblock'}
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
    </div>
  );
}