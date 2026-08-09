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
      <div className="flex items-center justify-center h-64">
        <ClipLoader color="#2563eb" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">{error}</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Orders" value={stats?.total_orders ?? 0} navigate = "/orders" />
        <StatCard title="Pending Shipment" value={stats?.pending_shipment ?? 0} navigate = "/orders?status=CONFIRMED" />
        <StatCard title="Total Revenue" value={`₹${stats?.total_revenue ?? 0}`} />
        <StatCard title="Total Customers" value={stats?.total_customers ?? 0} navigate = "/customers" />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 cursor-pointer" onClick={()=> window.location.href = "/inventory"}>
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Low Stock Alerts less then 15</h2>
          {stats?.low_stock_products?.length > 0 ? (
            <ul className="divide-y">
              {stats.low_stock_products.map((item) => (
                <li key={item.id} className="py-2 flex justify-between text-sm">
                  <span>{item.name} ({item.size})</span>
                  <span className="text-red-500 font-medium">{item.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No low stock alerts</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
          {stats?.recent_orders?.length > 0 ? (
            <ul className="divide-y">
              {stats.recent_orders.map((order) => (
                <li key={order.id} className="py-2 flex justify-between text-sm cursor-pointer" onClick={()=> window.location.href = `/orders/${order.id}`} >
                  <span>#{order.id} - {order.customer_name}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'SHIPPED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value,navigate }) {
  
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${title==="Total Revenue" ? "" : "cursor-pointer"}`} onClick={()=>{ if(navigate) window.location.href = navigate}}>
      <p className="text-sm text-gray-500 ">{title}</p>
      <p className="text-2xl font-bold mt-1 ">{value}</p>
    </div>
  );
}