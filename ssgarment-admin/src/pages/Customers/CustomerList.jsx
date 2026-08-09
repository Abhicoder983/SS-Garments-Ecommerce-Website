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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <span className="text-sm text-gray-500">
          {filteredCustomers.length} of {customers.length} customers
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
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
        ) : filteredCustomers.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">
            No customers found
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Total Orders</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {customer.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {customer.total_order ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {customer.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => navigate(`/customers-details/${customer.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleActive(customer)}
                      disabled={togglingId === customer.id}
                      className={`font-medium disabled:opacity-50 ${
                        customer.is_active
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {togglingId === customer.id
                        ? '...'
                        : customer.is_active
                        ? 'Block'
                        : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}