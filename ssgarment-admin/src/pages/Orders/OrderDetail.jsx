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

  const statusBadge = (status) => {
    const styles = {
      CONFIRMED: 'bg-yellow-100 text-yellow-700',
      SHIPPED: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-green-100 text-green-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={40} />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-gray-400 mt-10">Order not found</p>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/orders')}
        className="text-gray-500 hover:text-gray-700 text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to Orders
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Order #{order.id}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Placed on {new Date(order.order_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Status progress tracker - read only */}
        <div className="flex items-center mt-6 pt-6 border-t">
          {STATUS_FLOW.map((step, idx) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const isDone = idx <= currentIdx;
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isDone ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-xs mt-1 ${isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
                {idx < STATUS_FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Status updates automatically via Ekart tracking. Use manual override only if needed.
        </p>

        {/* Manual override */}
        <div className="mt-3">
          {!showOverride ? (
            <button
              onClick={() => setShowOverride(true)}
              className="text-xs text-gray-500 underline hover:text-gray-700"
            >
              Manually update status
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              {STATUS_FLOW.map((step) => (
                <button
                  key={step}
                  onClick={() => handleManualStatusChange(step)}
                  disabled={updating || order.status === step}
                  className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {updating ? '...' : step}
                </button>
              ))}
              <button
                onClick={() => setShowOverride(false)}
                className="text-xs text-gray-400 hover:text-gray-600 ml-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer + tracking info */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Customer</h2>
          <p className="text-gray-800 font-medium">{order.customer_name}</p>
          <p className="text-gray-500 text-sm">{order.customer_email}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Tracking</h2>
          <p className="text-gray-800 font-medium">
            {order.tracking_id || 'Not assigned yet'}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-6 pb-0">Items</h2>
        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 border-y">
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Color</th>
              <th className="px-6 py-3 font-medium">Qty</th>
              <th className="px-6 py-3 font-medium">Size</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} className="border-b last:border-0" onClick={() => navigate(`/products/edit/${item.product_id}`)} style={{ cursor: 'pointer' }}>
                <td className="px-6 py-4">
                  {item.variant_image ? (
                    <img
                      src={item.variant_image}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )
                }
                </td>
                <td className="px-6 py-4 text-gray-800">{item.product_name}</td>
                <td className="px-6 py-4 text-gray-600">{item.color}</td>
                <td className="px-6 py-4 text-gray-600">{item.qty}</td>
                <td className="px-6 py-4 text-gray-600">{item.size}</td>
                <td className="px-6 py-4 text-gray-600">₹{item.price}</td>
                <td className="px-6 py-4 text-gray-800 font-medium">₹{item.price * item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <p className="text-gray-800 font-semibold">Total: ₹{order.total_price}</p>
        </div>
      </div>
    </div>
  );
}