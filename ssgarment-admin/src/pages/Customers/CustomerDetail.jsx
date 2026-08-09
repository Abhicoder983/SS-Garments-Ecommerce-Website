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
      <div className="flex items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={40} />
      </div>
    );
  }

  if (!customer) {
    return <p className="text-center text-gray-400 mt-10">Customer not found</p>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/customers')}
        className="text-gray-500 hover:text-gray-700 text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {customer.profile_image ? (
              <img
                src={customer.profile_image}
                alt={customer.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold">
                {customer.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {customer.name || 'Unnamed Customer'}
              </h1>
              <p className="text-gray-500 text-sm">{customer.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                customer.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {customer.is_active ? 'Active' : 'Blocked'}
            </span>
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 ${
                customer.is_active
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {toggling ? '...' : customer.is_active ? 'Block' : 'Unblock'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-xs text-gray-400">Total Orders</p>
            <p className="text-lg font-semibold text-gray-800">
              {customer.total_order ?? orders.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Spent</p>
            <p className="text-lg font-semibold text-gray-800">
              ₹{orders.reduce((sum, o) => sum + (o.total_price || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Customer ID</p>
            <p className="text-sm text-gray-600 font-mono">{customer.id}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Saved Addresses</h2>
        {customer.address?.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {customer.address.map((addr, idx) => (
              <div key={idx} className="border rounded-lg p-3 text-sm text-gray-600">
                {typeof addr === 'string' ? addr : JSON.stringify(addr)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No addresses saved</p>
        )}
      </div>

      {/* Order history */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-6 pb-0">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm px-6 py-8">No orders yet</p>
        ) : (
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-y">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">#{order.id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(order.order_date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-gray-600">₹{order.total_price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.status}
                    </span>
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